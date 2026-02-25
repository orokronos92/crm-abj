/**
 * Endpoint de callback pour recevoir les réponses de n8n
 * POST /api/webhook/callback
 *
 * Supporte deux modes :
 * - Mode legacy : notificationId (notification existante en BDD)
 * - Mode T2 : correlationId (UUID) sans notification préalable
 *
 * Appelé par n8n après l'exécution d'un workflow déclenché par une action CRM
 * Permet de broadcaster via SSE pour que les modals réagissent
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sseManager } from '@/lib/sse-manager'

/**
 * Crée les documents requis (placeholders ATTENDU) pour un candidat
 * selon la formation retenue stockée dans ConversionEnCours
 */
async function creerDocumentsRequis(numeroDossier: string, correlationId: string): Promise<number> {
  // Récupérer la formation depuis ConversionEnCours via correlationId
  const conversion = await prisma.conversionEnCours.findFirst({
    where: {
      OR: [
        { idProspect: { contains: correlationId } },
      ],
      typeAction: 'CONVERTIR_CANDIDAT',
      formationRetenue: { not: null }
    },
    orderBy: { dateDebut: 'desc' }
  })

  // Fallback : chercher via numeroDossier sur le candidat directement
  const candidat = await prisma.candidat.findUnique({
    where: { numeroDossier },
    select: { idCandidat: true, idProspect: true, numeroDossier: true, formationRetenue: true }
  })

  if (!candidat) {
    console.log(`[webhook/callback] Candidat "${numeroDossier}" introuvable`)
    return 0
  }

  const formationRetenue = candidat.formationRetenue || conversion?.formationRetenue
  if (!formationRetenue) {
    console.log(`[webhook/callback] Aucune formation pour "${numeroDossier}"`)
    return 0
  }

  const formation = await prisma.formation.findFirst({
    where: { codeFormation: formationRetenue },
    select: { idFormation: true }
  })

  if (!formation) {
    console.log(`[webhook/callback] Formation "${formationRetenue}" introuvable`)
    return 0
  }

  const documentsRequis = await prisma.documentRequis.findMany({
    where: { idFormation: formation.idFormation },
    include: { typeDocument: { select: { code: true, categorie: true } } },
    orderBy: { ordreAffichage: 'asc' }
  })

  if (documentsRequis.length === 0) return 0

  // Anti-doublon
  const existants = await prisma.documentCandidat.findMany({
    where: { numeroDossier },
    select: { typeDocument: true }
  })
  const typesExistants = new Set(existants.map(d => d.typeDocument))
  const aCreer = documentsRequis.filter(dr => !typesExistants.has(dr.codeTypeDocument))

  if (aCreer.length === 0) {
    console.log(`[webhook/callback] Documents déjà existants pour "${numeroDossier}"`)
    return 0
  }

  await prisma.documentCandidat.createMany({
    data: aCreer.map(dr => ({
      idProspect: candidat.idProspect,
      numeroDossier: candidat.numeroDossier,
      typeDocument: dr.codeTypeDocument,
      categorie: dr.typeDocument.categorie,
      statut: 'ATTENDU',
      obligatoire: dr.obligatoire
    }))
  })

  console.log(`[webhook/callback] ✅ ${aCreer.length} documents créés pour "${numeroDossier}" (formation: ${formationRetenue})`)
  return aCreer.length
}

/**
 * Inscrit automatiquement un candidat/élève en liste d'attente
 * si une session était visée lors de la conversion (ConversionEnCours.sessionVisee)
 */
async function inscrireEnListeAttente(numeroDossier: string, responseType: string): Promise<void> {
  // Chercher si une ConversionEnCours récente a un sessionVisee
  const candidat = await prisma.candidat.findUnique({
    where: { numeroDossier },
    select: { idCandidat: true, idProspect: true }
  })
  if (!candidat) return

  // Chercher la conversion récente avec sessionVisee
  const conversion = await prisma.conversionEnCours.findFirst({
    where: {
      idProspect: candidat.idProspect,
      sessionVisee: { not: null },
      dateDebut: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // dans les 24h
    },
    orderBy: { dateDebut: 'desc' },
    select: { sessionVisee: true }
  })

  if (!conversion?.sessionVisee) return

  // Trouver la session par son nom
  const session = await prisma.session.findFirst({
    where: { nomSession: conversion.sessionVisee },
    select: { idSession: true, capaciteMax: true, nbInscrits: true, statutSession: true }
  })

  if (!session) {
    console.log(`[webhook/callback] Session "${conversion.sessionVisee}" introuvable pour inscription auto`)
    return
  }

  if (session.statutSession === 'ANNULEE' || session.statutSession === 'TERMINEE') {
    console.log(`[webhook/callback] Session "${conversion.sessionVisee}" non disponible (${session.statutSession})`)
    return
  }

  // Vérifier si déjà inscrit
  const dejaInscrit = await prisma.inscriptionSession.findFirst({
    where: {
      idSession: session.idSession,
      idCandidat: candidat.idCandidat,
      statutInscription: { notIn: ['ANNULE'] }
    }
  })
  if (dejaInscrit) {
    console.log(`[webhook/callback] Candidat déjà inscrit/en attente pour session "${conversion.sessionVisee}"`)
    return
  }

  // Pour un candidat → toujours EN_ATTENTE (priorité 2)
  // Pour un élève → INSCRIT si place dispo, sinon EN_ATTENTE
  const isEleve = responseType === 'eleve_created'
  const placesDisponibles = (session.capaciteMax || 0) - session.nbInscrits
  const sessionPleine = placesDisponibles <= 0

  const priorite = isEleve ? 1 : 2
  const statutInscription = (!sessionPleine && isEleve) ? 'INSCRIT' : 'EN_ATTENTE'

  let positionAttente: number | null = null
  if (statutInscription === 'EN_ATTENTE') {
    const dernierePosition = await prisma.inscriptionSession.findFirst({
      where: { idSession: session.idSession, statutInscription: 'EN_ATTENTE' },
      orderBy: { positionAttente: 'desc' },
      select: { positionAttente: true }
    })
    positionAttente = (dernierePosition?.positionAttente || 0) + 1
  }

  await prisma.inscriptionSession.create({
    data: {
      idSession: session.idSession,
      idCandidat: isEleve ? null : candidat.idCandidat,
      dateInscription: new Date(),
      statutInscription,
      priorite,
      positionAttente,
      notifiePar: 'auto'
    }
  })

  if (statutInscription === 'INSCRIT') {
    await prisma.session.update({
      where: { idSession: session.idSession },
      data: { nbInscrits: { increment: 1 } }
    })
  }

  console.log(`[webhook/callback] ✅ ${numeroDossier} ${statutInscription === 'INSCRIT' ? 'inscrit' : `en liste d'attente #${positionAttente}`} pour session "${conversion.sessionVisee}"`)
}

// Même clé API que l'endpoint d'ingestion
const API_KEY = process.env.NOTIFICATIONS_API_KEY || 'default-api-key-change-me'

interface CallbackPayload {
  // === MODE CORRÉLATION ===
  notificationId?: number         // Mode legacy : ID de la notification source
  correlationId?: string          // Mode T2 : UUID généré côté client

  // === RÉSULTAT ===
  status: 'success' | 'error'     // Statut de l'exécution
  response: string                // Type de réponse (ex: "email_sent", "pdf_generated")
  data?: Record<string, unknown>  // Données additionnelles (ex: emailId, pdfUrl)
  error?: string                  // Message d'erreur si status = error
  executionId?: string            // ID d'exécution n8n pour traçabilité
  timestamp?: string              // ISO timestamp de fin d'exécution

  // === CIBLAGE SSE ===
  targetRole?: string             // Rôle cible pour le broadcast SSE
  typeAction?: string             // Type d'action pour le broadcast SSE
}

export async function POST(request: NextRequest) {
  try {
    // Vérification API Key (header prioritaire, sinon body)
    const headerApiKey = request.headers.get('X-API-Key')
    const body: CallbackPayload & { apiKey?: string } = await request.json()
    const providedApiKey = headerApiKey || body.apiKey

    if (!providedApiKey || providedApiKey !== API_KEY) {
      return NextResponse.json({ error: 'Invalid API Key' }, { status: 401 })
    }

    const hasCorrelationId = !!body.correlationId
    const hasNotificationId = !!body.notificationId

    console.log('[Callback n8n] Reçu:', {
      correlationId: body.correlationId,
      notificationId: body.notificationId,
      status: body.status,
      response: body.response,
      executionId: body.executionId,
      mode: hasCorrelationId ? 'T2 (correlationId)' : 'legacy (notificationId)'
    })

    // Validation : au moins un identifiant de corrélation requis
    if (!hasCorrelationId && !hasNotificationId) {
      return NextResponse.json(
        { error: 'Champs requis manquants: correlationId ou notificationId, status, response' },
        { status: 400 }
      )
    }

    if (!body.status || !body.response) {
      return NextResponse.json(
        { error: 'Champs requis manquants: status, response' },
        { status: 400 }
      )
    }

    // === MODE T2 : correlationId sans notification en BDD ===
    if (hasCorrelationId && !hasNotificationId) {
      // Traitement post-création candidat ou élève
      if (body.status === 'success' && (body.response === 'candidat_created' || body.response === 'eleve_created')) {
        const numeroDossier = body.data?.numeroDossier as string | undefined
        if (numeroDossier) {
          creerDocumentsRequis(numeroDossier, body.correlationId!).catch(err =>
            console.error('[webhook/callback] Erreur création documents requis:', err)
          )

          // Inscription en liste d'attente si une session était visée
          inscrireEnListeAttente(numeroDossier, body.response).catch(err =>
            console.error('[webhook/callback] Erreur inscription liste attente:', err)
          )
        } else {
          console.warn(`[webhook/callback] ${body.response} reçu sans data.numeroDossier`)
        }
      }

      try {
        const targetRole = body.targetRole || 'admin'
        const typeAction = body.typeAction || body.response

        sseManager.broadcastActionCompleted(
          0, // pas de notificationId
          typeAction,
          body.status,
          targetRole,
          body.correlationId
        )
        console.log(`[Callback n8n] SSE T2 broadcast: ${body.status} pour correlationId ${body.correlationId}`)
      } catch (sseError) {
        console.error('[Callback n8n] Erreur SSE broadcast T2:', sseError)
      }

      return NextResponse.json({
        success: true,
        message: 'Callback T2 traité avec succès',
        correlationId: body.correlationId
      })
    }

    // === MODE LEGACY : notificationId avec notification en BDD ===
    const notification = await prisma.notification.findUnique({
      where: { idNotification: body.notificationId! }
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
      where: { idNotification: body.notificationId! },
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
        body.notificationId!,
        body.response,
        body.status,
        targetRole,
        body.correlationId // undefined en mode legacy, mais présent si n8n le renvoie
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
