/**
 * Endpoint pour exécuter des actions sur les notifications
 * POST /api/notifications/[id]/action
 *
 * Actions supportées:
 * - VALIDER : Valider un dossier/document
 * - RELANCER : Relancer un candidat/prospect
 * - CORRIGER : Corriger une erreur
 * - DECIDER : Prendre une décision
 * - VERIFIER : Vérifier des informations
 *
 * Flow:
 * 1. Exécute l'action sur la notification
 * 2. Broadcast SSE de la mise à jour
 * 3. Appelle webhook n8n pour actions automatiques
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sseManager } from '@/lib/sse-manager'

interface ActionPayload {
  typeAction: 'VALIDER' | 'RELANCER' | 'CORRIGER' | 'DECIDER' | 'VERIFIER' | string
  resultat?: string
  commentaire?: string
  metadata?: Record<string, any>
}

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const notificationId = parseInt(id, 10)

    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: 'ID de notification invalide' },
        { status: 400 }
      )
    }

    // Récupérer le payload
    const body: ActionPayload = await request.json()

    if (!body.typeAction) {
      return NextResponse.json(
        { error: 'Type d\'action requis' },
        { status: 400 }
      )
    }

    // Vérifier que la notification existe et nécessite une action
    const notification = await prisma.notification.findUnique({
      where: { idNotification: notificationId },
      select: {
        idNotification: true,
        titre: true,
        typeAction: true,
        actionRequise: true,
        actionEffectuee: true,
        entiteType: true,
        entiteId: true,
        sourceWorkflow: true,
        audience: true
      }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification non trouvée' },
        { status: 404 }
      )
    }

    if (!notification.actionRequise) {
      return NextResponse.json(
        { error: 'Cette notification ne nécessite pas d\'action' },
        { status: 400 }
      )
    }

    if (notification.actionEffectuee) {
      return NextResponse.json(
        { error: 'Action déjà effectuée sur cette notification' },
        { status: 400 }
      )
    }

    // Pour le moment, on simule l'utilisateur qui effectue l'action
    // TODO: Récupérer depuis la session NextAuth
    const mockUserId = 1

    // Mettre à jour la notification
    const updated = await prisma.notification.update({
      where: { idNotification: notificationId },
      data: {
        actionEffectuee: true,
        dateAction: new Date(),
        actionPar: mockUserId,
        resultatAction: JSON.stringify({
          action: body.typeAction,
          resultat: body.resultat || 'success',
          commentaire: body.commentaire,
          metadata: body.metadata,
          timestamp: new Date().toISOString()
        })
      },
      select: {
        idNotification: true,
        titre: true,
        typeAction: true,
        actionEffectuee: true,
        dateAction: true,
        resultatAction: true
      }
    })

    // Broadcast SSE de la mise à jour
    try {
      sseManager.broadcastActionCompleted(
        notificationId,
        body.typeAction,
        body.resultat || 'success',
        'admin' // TODO: adapter selon le rôle réel
      )
      console.log(`[SSE] Action completed broadcast pour notification ${notificationId}`)
    } catch (sseError) {
      console.error('[SSE] Erreur broadcast action:', sseError)
    }

    // Appeler le webhook n8n pour déclencher des actions automatiques
    if (notification.sourceWorkflow) {
      await callN8nWebhook({
        notificationId,
        typeAction: body.typeAction,
        resultat: body.resultat || 'success',
        entiteType: notification.entiteType,
        entiteId: notification.entiteId,
        commentaire: body.commentaire,
        executedBy: mockUserId,
        metadata: body.metadata
      })
    }

    // Logger l'action dans l'historique
    await logAction(notificationId, body, mockUserId)

    return NextResponse.json({
      success: true,
      message: 'Action exécutée avec succès',
      data: {
        notificationId: updated.idNotification,
        actionExecutee: body.typeAction,
        resultat: body.resultat || 'success',
        dateAction: updated.dateAction
      }
    })

  } catch (error) {
    console.error('Erreur lors de l\'exécution de l\'action:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors de l\'exécution de l\'action',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

/**
 * Appelle le webhook n8n pour déclencher des actions automatiques
 */
async function callN8nWebhook(data: {
  notificationId: number
  typeAction: string
  resultat: string
  entiteType: string | null
  entiteId: string | null
  commentaire?: string
  executedBy: number
  metadata?: any
}) {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (!webhookUrl) {
      console.log('[n8n] Webhook URL non configuré, skip')
      return
    }

    const response = await fetch(`${webhookUrl}/notification-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.N8N_API_KEY || ''
      },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
        source: 'crm-abj'
      })
    })

    if (!response.ok) {
      console.error('[n8n] Erreur webhook:', response.status, response.statusText)
    } else {
      console.log(`[n8n] Webhook appelé avec succès pour notification ${data.notificationId}`)
    }
  } catch (error) {
    console.error('[n8n] Erreur appel webhook:', error)
    // On ne fait pas échouer l'action pour une erreur webhook
  }
}

/**
 * Logger l'action dans l'historique (pour audit)
 */
async function logAction(
  notificationId: number,
  action: ActionPayload,
  userId: number
) {
  try {
    // On pourrait créer une table d'historique des actions
    // Pour l'instant, on log juste en console
    console.log('[AUDIT] Action sur notification:', {
      notificationId,
      action: action.typeAction,
      resultat: action.resultat,
      userId,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[AUDIT] Erreur log action:', error)
  }
}