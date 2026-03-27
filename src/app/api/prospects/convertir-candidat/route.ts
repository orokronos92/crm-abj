import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { prospectWebhooks } from '@/lib/webhook-client'

/**
 * API Endpoint: Convertir un prospect en candidat
 *
 * Pattern: Fire-and-Forget (202 Accepted)
 * - Vérifie si conversion déjà en cours (lock database)
 * - Crée un verrouillage dans conversions_en_cours
 * - Lance le webhook n8n de manière asynchrone (sans attendre)
 * - Retourne 202 immédiatement
 * - n8n fera toutes les modifications (statut, Drive, emails, notification)
 * - n8n déverrouillera via callback /api/prospects/conversion-complete
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idProspect, formationRetenue, sessionVisee, dateDebutSouhaitee } = body

    // Validation
    if (!idProspect || !formationRetenue) {
      return NextResponse.json(
        { success: false, error: 'idProspect et formationRetenue requis' },
        { status: 400 }
      )
    }

    // Vérifier que le prospect existe
    const prospect = await prisma.prospect.findUnique({
      where: { idProspect },
      select: {
        idProspect: true,
        nom: true,
        prenom: true,
        emails: true,
        statutProspect: true,
        dateNaissance: true
      }
    })

    if (!prospect) {
      return NextResponse.json(
        { success: false, error: 'Prospect introuvable' },
        { status: 404 }
      )
    }

    // Vérification des champs requis pour générer le numéro de dossier
    // Format : 2L nom + 2L prénom + date_naissance JJMMAAAA (ex: BRRE06021991)
    const champManquants: string[] = []
    if (!prospect.nom?.trim()) champManquants.push('nom')
    if (!prospect.prenom?.trim()) champManquants.push('prénom')
    if (!prospect.dateNaissance) champManquants.push('date de naissance')

    if (champManquants.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Impossible de convertir : champs manquants pour générer le numéro de dossier : ${champManquants.join(', ')}`,
          champManquants
        },
        { status: 422 }
      )
    }

    // ===== LOCK : Vérifier si conversion déjà en cours =====
    const conversionExistante = await prisma.conversionEnCours.findFirst({
      where: {
        idProspect,
        typeAction: 'CONVERTIR_CANDIDAT',
        statutAction: 'EN_COURS'
      }
    })

    if (conversionExistante) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conversion déjà en cours',
          message: `Une conversion est déjà en cours de traitement pour ${prospect.prenom} ${prospect.nom}. Vous serez notifié lorsqu'elle sera terminée.`,
          enCours: true
        },
        { status: 409 } // 409 Conflict
      )
    }

    // ===== LOCK : Créer le verrouillage =====
    const conversion = await prisma.conversionEnCours.create({
      data: {
        idProspect,
        typeAction: 'CONVERTIR_CANDIDAT',
        statutAction: 'EN_COURS',
        formationRetenue,
        sessionVisee,
        dateDebutSouhaitee: dateDebutSouhaitee ? new Date(dateDebutSouhaitee) : null
      }
    })

    console.log(`[API] 🔒 Conversion verrouillée - ID: ${conversion.idConversion}, Prospect: ${idProspect}`)

    // ===== FIRE-AND-FORGET : Lancer webhook n8n de manière asynchrone =====
    // On n'attend PAS la réponse, on lance en background
    prospectWebhooks.convertirEnCandidat({
      idProspect,
      formationRetenue,
      sessionVisee,
      dateDebutSouhaitee,
      idConversion: conversion.idConversion // Pour que n8n puisse déverrouiller
    }).then(webhookResult => {
      // Si succès, n8n appellera /api/prospects/conversion-complete
      // Si erreur, on log et on déverrouille immédiatement
      if (!webhookResult.success) {
        console.error(`[API] ❌ Webhook échoué pour conversion ${conversion.idConversion}:`, webhookResult.error)
        prisma.conversionEnCours.update({
          where: { idConversion: conversion.idConversion },
          data: {
            statutAction: 'ERREUR',
            messageErreur: webhookResult.error || 'Erreur inconnue',
            dateFin: new Date(),
            dureeMs: Date.now() - conversion.dateDebut.getTime()
          }
        }).catch(err => console.error('[API] Erreur update conversion:', err))
      } else {
        console.log(`[API] ✅ Webhook lancé avec succès pour conversion ${conversion.idConversion}`)
      }
    }).catch(error => {
      // Erreur critique lors du lancement du webhook
      console.error(`[API] ❌ Erreur critique lancement webhook conversion ${conversion.idConversion}:`, error)
      prisma.conversionEnCours.update({
        where: { idConversion: conversion.idConversion },
        data: {
          statutAction: 'ERREUR',
          messageErreur: error instanceof Error ? error.message : 'Erreur critique',
          dateFin: new Date(),
          dureeMs: Date.now() - conversion.dateDebut.getTime()
        }
      }).catch(err => console.error('[API] Erreur update conversion:', err))
    })

    // ===== RETOUR IMMÉDIAT 202 ACCEPTED =====
    return NextResponse.json(
      {
        success: true,
        message: 'Demande de conversion envoyée à Marjorie. Vous serez notifié lorsque le traitement sera terminé.',
        data: {
          idProspect,
          idConversion: conversion.idConversion,
          enCours: true
        }
      },
      { status: 202 } // 202 Accepted (traitement asynchrone)
    )

  } catch (error) {
    console.error('[API] Erreur conversion candidat:', error)

    // Log en BDD
    try {
      await prisma.journalErreur.create({
        data: {
          nomWorkflow: 'api-convertir-candidat',
          nomNoeud: 'POST-handler',
          messageErreur: error instanceof Error ? error.message : 'Erreur inconnue',
          donneesEntree: {},
          resolu: false
        }
      })
    } catch (logError) {
      console.error('[API] Erreur log journal:', logError)
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur interne serveur'
      },
      { status: 500 }
    )
  }
}
