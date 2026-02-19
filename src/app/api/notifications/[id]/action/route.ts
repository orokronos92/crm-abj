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
  // === IDENTIFICATION ACTION ===
  actionType: string                    // Ex: "RELANCE_CANDIDAT_EMAIL", "GENERER_DEVIS"
  actionSource: string                  // Ex: "admin.candidats.detail", "admin.prospects.list"
  actionButton: string                  // Ex: "relancer_email", "generer_devis"

  // === CONTEXTE MÉTIER ===
  entiteType: 'prospect' | 'candidat' | 'eleve' | 'formateur' | 'session' | 'document'
  entiteId: string                      // ID ou numéro dossier
  entiteData?: Record<string, any>      // Données contextuelles complètes

  // === DÉCISION UTILISATEUR ===
  decidePar: number                     // idUtilisateur qui effectue l'action
  decisionType: string                  // Type de décision prise
  commentaire?: string                  // Commentaire optionnel

  // === MÉTADONNÉES SPÉCIFIQUES ===
  metadonnees?: Record<string, any>     // Métadonnées spécifiques à l'action

  // === LEGACY (compatibilité) ===
  typeAction?: 'VALIDER' | 'RELANCER' | 'CORRIGER' | 'DECIDER' | 'VERIFIER' | string
  resultat?: string
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

    // Support du nouveau format ET de l'ancien (legacy)
    const actionType = body.actionType || body.typeAction
    if (!actionType) {
      return NextResponse.json(
        { error: 'actionType requis' },
        { status: 400 }
      )
    }

    // Validation du nouveau format (si actionType est défini)
    if (body.actionType) {
      if (!body.actionSource || !body.actionButton || !body.entiteType || !body.entiteId || !body.decidePar || !body.decisionType) {
        return NextResponse.json(
          { error: 'Payload incomplet. Requis: actionType, actionSource, actionButton, entiteType, entiteId, decidePar, decisionType' },
          { status: 400 }
        )
      }
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

    // Récupérer l'utilisateur depuis le payload (nouveau format) ou mock (legacy)
    const userId = body.decidePar || 1

    // Construire le résultat de l'action (nouveau format enrichi)
    const resultatAction = {
      // Nouveau format
      actionType: body.actionType || body.typeAction,
      actionSource: body.actionSource,
      actionButton: body.actionButton,
      entiteType: body.entiteType,
      entiteId: body.entiteId,
      entiteData: body.entiteData,
      decidePar: userId,
      decisionType: body.decisionType,
      commentaire: body.commentaire,
      metadonnees: body.metadonnees,

      // Legacy
      action: body.typeAction,
      resultat: body.resultat || 'success',
      metadata: body.metadata,

      // Timestamp
      timestamp: new Date().toISOString()
    }

    // Mettre à jour la notification
    const updated = await prisma.notification.update({
      where: { idNotification: notificationId },
      data: {
        actionEffectuee: true,
        dateAction: new Date(),
        actionPar: userId,
        resultatAction: JSON.stringify(resultatAction)
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
        actionType,
        body.resultat || body.decisionType || 'success',
        'admin' // TODO: adapter selon le rôle réel
      )
      console.log(`[SSE] Action completed broadcast pour notification ${notificationId}`)
    } catch (sseError) {
      console.error('[SSE] Erreur broadcast action:', sseError)
    }

    // ✅ APPEL WEBHOOK n8n avec payload ENRICHI
    await callN8nWebhook({
      // Contexte action
      actionType: body.actionType || body.typeAction || '',
      actionSource: body.actionSource,
      actionButton: body.actionButton,

      // Entité métier (priorité au nouveau format)
      entiteType: body.entiteType || notification.entiteType || '',
      entiteId: body.entiteId || notification.entiteId || '',
      entiteData: body.entiteData,

      // Décision utilisateur
      decidePar: userId,
      decisionType: body.decisionType || body.resultat || 'success',
      commentaire: body.commentaire,

      // Métadonnées
      metadonnees: body.metadonnees || body.metadata,

      // Notification source
      notificationId,
      notificationCategorie: notification.typeAction || '',
      notificationType: notification.titre,
      notificationTitre: notification.titre,

      // Legacy
      typeAction: body.typeAction,
      resultat: body.resultat,
      executedBy: userId,
      metadata: body.metadata
    })

    // Logger l'action dans l'historique
    await logAction(notificationId, body, mockUserId)

    return NextResponse.json({
      success: true,
      message: 'Action exécutée avec succès',
      data: {
        notificationId: updated.idNotification,
        actionExecutee: actionType,
        actionSource: body.actionSource,
        decisionType: body.decisionType || body.resultat || 'success',
        dateAction: updated.dateAction,
        webhookEnvoye: true
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
 * Payload ENRICHI avec contexte complet pour dispatch intelligent
 */
async function callN8nWebhook(data: {
  // === NOUVEAU FORMAT ENRICHI ===
  actionType?: string                    // "RELANCE_CANDIDAT_EMAIL"
  actionSource?: string                  // "admin.candidats.detail"
  actionButton?: string                  // "relancer_email"

  entiteType: string | null              // "candidat"
  entiteId: string | null                // "DUMI15091992"
  entiteData?: Record<string, any>       // { nom, prenom, email, ... }

  decidePar?: number                     // 1
  decisionType?: string                  // "relance_email"
  commentaire?: string                   // "Relance pour documents"

  metadonnees?: Record<string, any>      // { documentsManquants: [...] }

  notificationId: number                 // 42
  notificationCategorie?: string         // "CANDIDAT"
  notificationType?: string              // "DOSSIER_INCOMPLET"
  notificationTitre?: string             // "Documents manquants"

  // === LEGACY ===
  typeAction?: string
  resultat?: string
  executedBy?: number
  metadata?: any
}) {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (!webhookUrl) {
      console.log('[n8n] Webhook URL non configuré, skip')
      return
    }

    // Construire le payload complet pour n8n
    const payload = {
      // Timestamp et source
      timestamp: new Date().toISOString(),
      source: 'crm-abj',

      // Contexte action (nouveau format)
      actionType: data.actionType,
      actionSource: data.actionSource,
      actionButton: data.actionButton,

      // Entité métier
      entiteType: data.entiteType,
      entiteId: data.entiteId,
      entiteData: data.entiteData,

      // Décision utilisateur
      decidePar: data.decidePar,
      decisionType: data.decisionType,
      commentaire: data.commentaire,

      // Métadonnées
      metadonnees: data.metadonnees,

      // Notification source
      notificationId: data.notificationId,
      notificationCategorie: data.notificationCategorie,
      notificationType: data.notificationType,
      notificationTitre: data.notificationTitre,

      // Legacy (pour compatibilité)
      typeAction: data.typeAction,
      resultat: data.resultat,
      executedBy: data.executedBy,
      metadata: data.metadata
    }

    console.log('[n8n] Envoi webhook avec payload enrichi:', {
      actionType: payload.actionType,
      actionSource: payload.actionSource,
      entiteType: payload.entiteType,
      entiteId: payload.entiteId
    })

    const response = await fetch(`${webhookUrl}/crm-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.N8N_API_KEY || ''
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      console.error('[n8n] Erreur webhook:', response.status, response.statusText)
      const errorText = await response.text().catch(() => 'Impossible de lire la réponse')
      console.error('[n8n] Détails erreur:', errorText)
    } else {
      console.log(`[n8n] ✅ Webhook appelé avec succès pour notification ${data.notificationId}`)
      console.log(`[n8n] Action: ${payload.actionType} | Entité: ${payload.entiteType}/${payload.entiteId}`)
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