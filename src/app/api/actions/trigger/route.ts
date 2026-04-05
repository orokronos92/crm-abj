/**
 * Endpoint pour déclencher une action vers n8n SANS créer de notification préalable
 * POST /api/actions/trigger
 *
 * Architecture T2 : Le CRM envoie l'action à n8n, n8n crée la notification
 * via /api/notifications/ingest une fois l'action confirmée.
 *
 * Le correlationId (UUID) permet au callback SSE de retrouver le bon modal.
 */

import { NextRequest, NextResponse } from 'next/server'
import { sseManager } from '@/lib/sse-manager'
import prisma from '@/lib/prisma'

interface TriggerPayload {
  // === CORRÉLATION (UUID généré côté client) ===
  correlationId: string

  // === IDENTIFICATION ACTION ===
  actionType: string       // Ex: "CONVERTIR_CANDIDAT", "ENVOYER_DOSSIER"
  actionSource: string     // Ex: "admin.prospects.detail"
  actionButton: string     // Ex: "convertir_candidat"

  // === CONTEXTE MÉTIER ===
  entiteType: string
  entiteId: string
  entiteData?: Record<string, unknown>

  // === DÉCISION UTILISATEUR ===
  decidePar?: number
  decisionType?: string
  commentaire?: string

  // === MÉTADONNÉES SPÉCIFIQUES ===
  metadonnees?: Record<string, unknown>

  // === CONFIGURATION RÉPONSE ===
  responseConfig?: {
    callbackUrl?: string
    expectedResponse?: string
    timeoutSeconds?: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TriggerPayload = await request.json()

    if (!body.correlationId || !body.actionType || !body.entiteType || !body.entiteId) {
      return NextResponse.json(
        { error: 'Champs requis: correlationId, actionType, entiteType, entiteId' },
        { status: 400 }
      )
    }

    // Fix 1 : REFUSER_CANDIDAT → nettoyer les inscriptions AVANT d'envoyer à n8n
    // Car n8n ne rappelle pas toujours avec candidat_refused
    if (body.actionType === 'REFUSER_CANDIDAT') {
      const idCandidat = body.entiteData?.idCandidat as number | undefined
      if (idCandidat) {
        // Trouver toutes les inscriptions actives du candidat
        const inscriptionsActives = await prisma.inscriptionSession.findMany({
          where: {
            idCandidat,
            statutInscription: { not: 'ANNULE' }
          },
          select: { idInscription: true, idSession: true }
        })

        // Annuler chaque inscription active
        for (const insc of inscriptionsActives) {
          await prisma.inscriptionSession.update({
            where: { idInscription: insc.idInscription },
            data: { statutInscription: 'ANNULE', motifAnnulation: 'Candidat refusé' }
          })
        }

        // Recalculer nbInscrits pour chaque session impactée
        const sessionsImpactees = [...new Set(inscriptionsActives.map(i => i.idSession))]
        for (const idSession of sessionsImpactees) {
          const nbReel = await prisma.inscriptionSession.count({
            where: { idSession, statutInscription: { in: ['INSCRIT', 'CONFIRME'] } }
          })
          await prisma.session.update({
            where: { idSession },
            data: { nbInscrits: nbReel }
          })
        }

        if (inscriptionsActives.length > 0) {
          console.log(`[actions/trigger] 🚫 ${inscriptionsActives.length} inscription(s) annulée(s) pour candidat ${idCandidat} refusé`)
        }

        // Reset complet des étapes du parcours d'admission
        // Ainsi si le candidat recandidate plus tard, il repart de zéro
        // (sauf exemptions explicitement accordées à nouveau par l'admin)
        await prisma.candidat.update({
          where: { idCandidat },
          data: {
            entretienTelephonique: false,
            dateEntretienTel: null,
            valideParEntretienTel: null,
            observationEntretienTel: null,
            exemptEntretienTelephonique: false,
            rdvPresentiel: false,
            dateRdvPresentiel: null,
            valideParRdvPresentiel: null,
            observationRdvPresentiel: null,
            exemptRdvPresentiel: false,
            testTechnique: false,
            dateTestTechnique: null,
            valideParTestTechnique: null,
            observationTestTechnique: null,
            exemptTestTechnique: false,
            validationPedagogique: false,
            dateValidationPedagogique: null,
            valideParValidationPedagogique: null,
            observationValidationPedagogique: null,
            exemptValidationPedagogique: false,
          }
        })

        console.log(`[actions/trigger] 🔄 Parcours d'admission remis à zéro pour candidat ${idCandidat} refusé`)
      }
    }

    // Persister ConversionEnCours pour que le callback puisse retrouver sessionVisee
    if (body.actionType === 'CONVERTIR_CANDIDAT') {
      await prisma.conversionEnCours.create({
        data: {
          idProspect: body.entiteId,
          typeAction: 'CONVERTIR_CANDIDAT',
          statutAction: 'EN_COURS',
          formationRetenue: (body.metadonnees?.formationRetenue as string) || null,
          sessionVisee: (body.metadonnees?.sessionVisee as string) || null,
          dateDebutSouhaitee: body.metadonnees?.dateDebutSouhaitee
            ? new Date(body.metadonnees.dateDebutSouhaitee as string)
            : null,
        }
      })
    }

    const callbackUrl = body.responseConfig?.callbackUrl
      || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhook/callback`

    // Payload complet vers n8n
    const n8nPayload = {
      timestamp: new Date().toISOString(),
      source: 'crm-abj',

      // Corrélation — n8n doit renvoyer ce correlationId dans le callback
      correlationId: body.correlationId,

      // Action
      actionType: body.actionType,
      actionSource: body.actionSource,
      actionButton: body.actionButton,

      // Entité
      entiteType: body.entiteType,
      entiteId: body.entiteId,
      entiteData: body.entiteData,

      // Décision
      decidePar: body.decidePar || 1,
      decisionType: body.decisionType || body.actionType,
      commentaire: body.commentaire,

      // Métadonnées
      metadonnees: body.metadonnees,

      // Config callback
      responseConfig: {
        callbackUrl,
        expectedResponse: body.responseConfig?.expectedResponse || 'action_completed',
        timeoutSeconds: body.responseConfig?.timeoutSeconds || 60
      }
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (!webhookUrl) {
      // Dev/test : pas d'URL n8n configurée, simuler un succès après 2s
      console.log('[actions/trigger] N8N_WEBHOOK_URL non configuré, skip')
      return NextResponse.json({
        success: true,
        message: 'Action envoyée à Marjorie',
        correlationId: body.correlationId,
        status: 'pending'
      })
    }

    const response = await fetch(`${webhookUrl}/crm-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.N8N_API_KEY || ''
      },
      body: JSON.stringify(n8nPayload)
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Impossible de lire la réponse')
      console.error('[actions/trigger] Erreur n8n:', response.status, errorText)

      // Broadcast SSE erreur immédiate pour que le modal réagisse
      sseManager.broadcastActionCompleted(
        0, // pas de notificationId
        body.actionType,
        'error',
        'admin',
        body.correlationId
      )

      return NextResponse.json(
        { success: false, error: 'Échec de la communication avec Marjorie' },
        { status: 502 }
      )
    }

    console.log(`[actions/trigger] ✅ Action ${body.actionType} envoyée (correlationId: ${body.correlationId})`)

    return NextResponse.json({
      success: true,
      message: 'Action envoyée à Marjorie, en attente de confirmation',
      correlationId: body.correlationId,
      status: 'pending'
    })

  } catch (error) {
    console.error('[actions/trigger] Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors du déclenchement de l\'action' },
      { status: 500 }
    )
  }
}
