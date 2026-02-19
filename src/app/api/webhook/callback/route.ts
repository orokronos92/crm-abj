/**
 * Endpoint de callback pour recevoir les réponses de n8n
 * POST /api/webhook/callback
 *
 * Appelé par n8n après l'exécution d'un workflow déclenché par une action CRM
 * Permet de mettre à jour la notification et broadcaster via SSE
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sseManager } from '@/lib/sse-manager'

// Même clé API que l'endpoint d'ingestion
const API_KEY = process.env.NOTIFICATIONS_API_KEY || 'default-api-key-change-me'

interface CallbackPayload {
  notificationId: number          // ID de la notification source
  status: 'success' | 'error'     // Statut de l'exécution
  response: string                // Type de réponse (ex: "email_sent", "pdf_generated")
  data?: Record<string, any>      // Données additionnelles (ex: emailId, pdfUrl)
  error?: string                  // Message d'erreur si status = error
  executionId?: string            // ID d'exécution n8n pour traçabilité
  timestamp?: string              // ISO timestamp de fin d'exécution
}

export async function POST(request: NextRequest) {
  try {
    // Vérification API Key (header prioritaire, sinon body)
    const headerApiKey = request.headers.get('X-API-Key')
    const body: CallbackPayload = await request.json()
    const providedApiKey = headerApiKey || (body as CallbackPayload & { apiKey?: string }).apiKey

    if (!providedApiKey || providedApiKey !== API_KEY) {
      return NextResponse.json({ error: 'Invalid API Key' }, { status: 401 })
    }

    console.log('[Callback n8n] Reçu:', {
      notificationId: body.notificationId,
      status: body.status,
      response: body.response,
      executionId: body.executionId
    })

    // Validation des champs requis
    if (!body.notificationId || !body.status || !body.response) {
      return NextResponse.json(
        { error: 'Champs requis manquants: notificationId, status, response' },
        { status: 400 }
      )
    }

    // Vérifier que la notification existe
    const notification = await prisma.notification.findUnique({
      where: { idNotification: body.notificationId }
    })

    if (!notification) {
      console.error('[Callback n8n] Notification non trouvée:', body.notificationId)
      return NextResponse.json(
        { error: 'Notification non trouvée' },
        { status: 404 }
      )
    }

    // Construire le résultat à stocker
    const resultatCallback = {
      callbackStatus: body.status,
      callbackResponse: body.response,
      callbackData: body.data || {},
      callbackError: body.error,
      callbackExecutionId: body.executionId,
      callbackTimestamp: body.timestamp || new Date().toISOString(),
      // Conserver le résultat action initial si existant
      ...(notification.resultatAction ? JSON.parse(notification.resultatAction as string) : {})
    }

    // Mettre à jour la notification
    const updated = await prisma.notification.update({
      where: { idNotification: body.notificationId },
      data: {
        actionEffectuee: body.status === 'success',
        resultatAction: JSON.stringify(resultatCallback)
      }
    })

    console.log('[Callback n8n] Notification mise à jour:', {
      id: updated.idNotification,
      actionEffectuee: updated.actionEffectuee
    })

    // Broadcast SSE dédié action_completed pour que les modals réagissent
    try {
      // Déterminer le rôle cible selon l'audience de la notification
      const targetRole = notification.audience === 'ADMIN' ? 'admin'
        : notification.audience === 'FORMATEUR' ? 'professeur'
        : notification.audience === 'ELEVE' ? 'eleve'
        : undefined // TOUS → broadcast à tous

      sseManager.broadcastActionCompleted(
        body.notificationId,
        body.response,
        body.status, // 'success' ou 'error'
        targetRole
      )
      console.log(`[Callback n8n] SSE action_completed broadcast: ${body.status} pour notification ${body.notificationId}`)
    } catch (sseError) {
      console.error('[Callback n8n] Erreur SSE broadcast:', sseError)
      // Ne pas faire échouer le callback pour une erreur SSE
    }

    // Réponse succès à n8n
    return NextResponse.json({
      success: true,
      message: 'Callback traité avec succès',
      notificationId: body.notificationId
    })

  } catch (error) {
    console.error('[Callback n8n] Erreur:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors du traitement du callback',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
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
