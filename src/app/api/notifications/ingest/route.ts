/**
 * Endpoint d'ingestion des notifications depuis n8n
 * POST /api/notifications/ingest
 * Sécurisé par API Key uniquement (pas d'auth session requise)
 *
 * Note: Cet endpoint est public car utilisé par n8n
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Route publique - exempte d'authentification
export const runtime = 'nodejs'

// Validation de l'API Key
const API_KEY = process.env.NOTIFICATIONS_API_KEY || 'default-api-key-change-me'

interface NotificationPayload {
  apiKey?: string // Dans le body pour compatibilité n8n

  // Contenu
  sourceAgent: string // "marjorie" | "morrigan" | "system" | "admin"
  sourceWorkflow?: string
  sourceExecutionId?: string

  categorie: string // PROSPECT | CANDIDAT | DEVIS | DOCUMENT | EMAIL | PLANNING | EVALUATION | FINANCE | SYSTEM | ALERTE
  type: string // Ex: "NOUVEAU_PROSPECT" | "DEVIS_ENVOYE" | "DOCUMENT_RECU" | "ERREUR_WORKFLOW"
  priorite?: string // BASSE | NORMALE | HAUTE | URGENTE
  titre: string
  message: string
  icone?: string
  couleur?: string

  // Ciblage
  audience?: string // TOUS | ADMIN | FORMATEUR | ELEVE | SPECIFIQUE
  idUtilisateurCible?: number
  idFormateurCible?: number
  idEleveCible?: number

  // Deep link
  entiteType?: string // "prospect" | "candidat" | "document" | "session" | "evaluation"
  entiteId?: string
  lienAction?: string

  // Action
  actionRequise?: boolean
  typeAction?: string // "VALIDER" | "RELANCER" | "CORRIGER" | "DECIDER" | "VERIFIER"

  // Extra
  metadonnees?: Record<string, any>
  expirationDate?: string // ISO date

  // Batch : possibilité d'envoyer plusieurs notifications d'un coup
  batch?: NotificationPayload[]
}

export async function POST(request: NextRequest) {
  try {
    // Vérification de l'API Key dans le header
    const headerApiKey = request.headers.get('X-API-Key')

    // Parse du body
    const body: NotificationPayload = await request.json()

    // Vérification de l'API Key (header prioritaire, sinon body)
    const providedApiKey = headerApiKey || body.apiKey
    if (!providedApiKey || providedApiKey !== API_KEY) {
      return NextResponse.json(
        { error: 'Invalid API Key' },
        { status: 401 }
      )
    }

    // Si c'est un batch, traiter toutes les notifications
    if (body.batch && Array.isArray(body.batch)) {
      const notifications = await Promise.all(
        body.batch.map(async (notif) => createNotification(notif))
      )

      return NextResponse.json({
        success: true,
        message: `${notifications.length} notifications créées`,
        data: notifications
      })
    }

    // Sinon, créer une seule notification
    const notification = await createNotification(body)

    return NextResponse.json({
      success: true,
      message: 'Notification créée avec succès',
      data: notification
    })

  } catch (error) {
    console.error('Erreur lors de la création de notification:', error)

    // Logger l'erreur dans journal_erreurs pour monitoring n8n
    try {
      await prisma.journalErreur.create({
        data: {
          nomWorkflow: 'notification-ingest',
          nomNoeud: 'api-endpoint',
          messageErreur: error instanceof Error ? error.message : 'Erreur inconnue',
          donneesEntree: request.body ? await request.json().catch(() => null) : null,
          resolu: false
        }
      })
    } catch (logError) {
      console.error('Erreur lors du logging:', logError)
    }

    return NextResponse.json(
      {
        error: 'Erreur lors de la création de la notification',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

// Fonction helper pour créer une notification
async function createNotification(payload: NotificationPayload) {
  // Préparation des données pour Prisma
  const notificationData = {
    sourceAgent: payload.sourceAgent,
    sourceWorkflow: payload.sourceWorkflow || null,
    sourceExecutionId: payload.sourceExecutionId || null,

    categorie: payload.categorie,
    type: payload.type,
    priorite: payload.priorite || 'NORMALE',
    titre: payload.titre,
    message: payload.message,
    icone: payload.icone || null,
    couleur: payload.couleur || null,

    audience: payload.audience || 'ADMIN',
    idUtilisateurCible: payload.idUtilisateurCible || null,
    idFormateurCible: payload.idFormateurCible || null,
    idEleveCible: payload.idEleveCible || null,

    entiteType: payload.entiteType || null,
    entiteId: payload.entiteId || null,
    lienAction: payload.lienAction || null,

    actionRequise: payload.actionRequise || false,
    typeAction: payload.typeAction || null,

    metadonnees: payload.metadonnees || null,
    expirationDate: payload.expirationDate ? new Date(payload.expirationDate) : null,
  }

  // Création en base
  const notification = await prisma.notification.create({
    data: notificationData,
    select: {
      idNotification: true,
      titre: true,
      message: true,
      priorite: true,
      categorie: true,
      type: true,
      audience: true,
      creeLe: true
    }
  })

  // TODO: Déclencher SSE pour push temps réel (Phase 2)
  // await broadcastNotification(notification)

  return notification
}

// OPTIONS pour CORS si n8n est sur un autre domaine
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    },
  })
}