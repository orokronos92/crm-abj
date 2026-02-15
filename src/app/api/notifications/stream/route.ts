/**
 * Endpoint SSE (Server-Sent Events) pour streaming temps réel des notifications
 * GET /api/notifications/stream
 *
 * Architecture:
 * - Ouvre une connexion persistante avec le client
 * - Push les notifications en temps réel via SSE
 * - Heartbeat automatique toutes les 30s
 * - Filtrage automatique selon le rôle de l'utilisateur
 *
 * Note: En production, considérer un service dédié (Redis Pub/Sub, Pusher, etc.)
 * pour une scalabilité horizontale
 */

import { NextRequest, NextResponse } from 'next/server'
import { sseManager } from '@/lib/sse-manager'
import prisma from '@/lib/prisma'

// Force le mode streaming (pas de buffering)
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  console.log('[SSE] Nouvelle connexion SSE demandée')

  // Récupérer le rôle depuis les headers (envoyé par le frontend)
  const roleFromHeader = request.headers.get('X-User-Role')

  // Déterminer le rôle (header ou referer ou défaut admin)
  let role = 'admin' as 'admin' | 'professeur' | 'eleve'

  if (roleFromHeader) {
    role = roleFromHeader as 'admin' | 'professeur' | 'eleve'
  } else {
    // Essayer de détecter depuis le referer
    const referer = request.headers.get('referer') || ''
    if (referer.includes('/formateur')) {
      role = 'professeur'
    } else if (referer.includes('/eleve')) {
      role = 'eleve'
    }
  }

  console.log('[SSE] Rôle détecté:', role, '(referer:', request.headers.get('referer'), ')')

  // Pour le moment, on simule un utilisateur (à remplacer par auth réelle)
  // TODO: Récupérer la session utilisateur via NextAuth
  const mockUser = {
    idUtilisateur: role === 'professeur' ? 2 : role === 'eleve' ? 3 : 1,
    role: role,
    email: `${role}@abj.fr`
  }

  // Headers pour SSE
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Désactive le buffering nginx
  })

  // Créer le stream
  const stream = new ReadableStream({
    async start(controller) {
      // Enregistrer ce client dans le SSE Manager
      const clientId = sseManager.addClient(
        controller,
        mockUser.idUtilisateur,
        mockUser.role
      )

      console.log(`[SSE] Client ${clientId} connecté`)

      try {
        // Envoyer les compteurs initiaux
        const counts = await getNotificationCounts(mockUser.idUtilisateur, mockUser.role)
        await sseManager.sendInitialCount(clientId, counts)

        // Envoyer les dernières notifications non lues
        const recentNotifications = await getRecentNotifications(
          mockUser.idUtilisateur,
          mockUser.role,
          5
        )

        // Envoyer chaque notification
        for (const notif of recentNotifications) {
          const encoder = new TextEncoder()
          const message = `event: notification\ndata: ${JSON.stringify(notif)}\n\n`
          controller.enqueue(encoder.encode(message))
        }

        // Gérer la fermeture de connexion
        request.signal.addEventListener('abort', () => {
          console.log(`[SSE] Client ${clientId} déconnecté (abort)`)
          sseManager.removeClient(clientId)
          controller.close()
        })

      } catch (error) {
        console.error('[SSE] Erreur lors de l\'initialisation:', error)
        sseManager.removeClient(clientId)
        controller.error(error)
      }
    },

    cancel() {
      console.log('[SSE] Stream annulé par le client')
    }
  })

  return new Response(stream, { headers })
}

/**
 * Récupère les compteurs de notifications pour un utilisateur
 */
async function getNotificationCounts(
  idUtilisateur: number,
  role: string
): Promise<{
  total: number
  nonLues: number
  urgentes: number
  actionsRequises: number
}> {
  try {
    // Construction du filtre selon le rôle
    const where = buildWhereClause(idUtilisateur, role)

    // Requêtes parallèles pour performance
    const [total, nonLues, urgentes, actionsRequises] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          ...where,
          lue: false
        }
      }),
      prisma.notification.count({
        where: {
          ...where,
          priorite: 'URGENTE',
          lue: false
        }
      }),
      prisma.notification.count({
        where: {
          ...where,
          actionRequise: true,
          actionEffectuee: false
        }
      })
    ])

    return {
      total,
      nonLues,
      urgentes,
      actionsRequises
    }
  } catch (error) {
    console.error('[SSE] Erreur récupération compteurs:', error)
    return {
      total: 0,
      nonLues: 0,
      urgentes: 0,
      actionsRequises: 0
    }
  }
}

/**
 * Récupère les notifications récentes non lues
 */
async function getRecentNotifications(
  idUtilisateur: number,
  role: string,
  limit: number = 5
) {
  try {
    const where = {
      ...buildWhereClause(idUtilisateur, role),
      lue: false
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { creeLe: 'desc' },
      take: limit,
      select: {
        idNotification: true,
        sourceAgent: true,
        categorie: true,
        type: true,
        priorite: true,
        titre: true,
        message: true,
        audience: true,
        lienAction: true,
        actionRequise: true,
        typeAction: true,
        creeLe: true
      }
    })

    return notifications
  } catch (error) {
    console.error('[SSE] Erreur récupération notifications:', error)
    return []
  }
}

/**
 * Construit la clause WHERE selon le rôle de l'utilisateur
 */
function buildWhereClause(idUtilisateur: number, role: string) {
  const baseWhere: any = {
    OR: [
      { audience: 'TOUS' },
      { audience: 'ADMIN' } // Pour l'instant, on considère que tous sont admin
    ]
  }

  // Adaptation selon le rôle (à implémenter avec la vraie auth)
  if (role === 'professeur') {
    baseWhere.OR = [
      { audience: 'TOUS' },
      { audience: 'FORMATEUR' },
      {
        AND: [
          { audience: 'SPECIFIQUE' },
          { idUtilisateurCible: idUtilisateur }
        ]
      }
    ]
  } else if (role === 'eleve') {
    baseWhere.OR = [
      { audience: 'TOUS' },
      { audience: 'ELEVE' },
      {
        AND: [
          { audience: 'SPECIFIQUE' },
          { idUtilisateurCible: idUtilisateur }
        ]
      }
    ]
  }

  return baseWhere
}

/**
 * Endpoint pour obtenir les stats SSE (debug)
 */
export async function POST(request: NextRequest) {
  // Endpoint de debug pour voir les stats SSE
  const stats = sseManager.getStats()

  return NextResponse.json({
    success: true,
    stats: {
      clientsConnected: stats.total,
      byRole: stats.byRole,
      uptime: Object.entries(stats.connectedSince).map(([clientId, date]) => ({
        clientId,
        connectedSince: date,
        uptimeSeconds: Math.floor((Date.now() - new Date(date).getTime()) / 1000)
      }))
    }
  })
}