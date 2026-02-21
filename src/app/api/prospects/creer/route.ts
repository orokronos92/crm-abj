import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { prospectWebhooks } from '@/lib/webhook-client'

/**
 * API Endpoint: Créer un nouveau prospect manuellement depuis le CRM
 *
 * Pattern: Fire-and-Forget (202 Accepted)
 * - Valide les champs obligatoires
 * - Crée un verrou dans conversions_en_cours (typeAction: CREER_PROSPECT)
 * - Lance le webhook n8n de manière asynchrone (sans attendre)
 * - Retourne 202 immédiatement
 * - Marjorie gère la création en BDD, Drive, emails, notification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      nom,
      prenom,
      email,
      telephone,
      adresse,
      codePostal,
      ville,
      formationPrincipale,
      modeFinancement,
    } = body

    // Validation des champs obligatoires
    if (!nom || !prenom || !email || !telephone || !formationPrincipale) {
      return NextResponse.json(
        { success: false, error: 'Champs obligatoires manquants : nom, prenom, email, telephone, formationPrincipale' },
        { status: 400 }
      )
    }

    // ===== LOCK : Créer le verrou =====
    const conversion = await prisma.conversionEnCours.create({
      data: {
        idProspect: `creer-${email}-${Date.now()}`, // Identifiant temporaire avant création par n8n
        typeAction: 'CREER_PROSPECT',
        statutAction: 'EN_COURS',
      }
    })

    console.log(`[API] 🔒 Création prospect verrouillée - ID: ${conversion.idConversion}, Email: ${email}`)

    const payload = {
      nom,
      prenom,
      email,
      telephone,
      adresse: adresse || undefined,
      codePostal: codePostal || undefined,
      ville: ville || undefined,
      formationPrincipale,
      modeFinancement: modeFinancement || undefined,
      sourceOrigine: 'CRM_ADMIN',
    }

    // ===== FIRE-AND-FORGET : Lancer webhook n8n de manière asynchrone =====
    prospectWebhooks.creerProspect(payload).then(webhookResult => {
      if (!webhookResult.success) {
        console.error(`[API] ❌ Webhook échoué pour création prospect ${conversion.idConversion}:`, webhookResult.error)
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
        console.log(`[API] ✅ Webhook création prospect lancé avec succès - ID: ${conversion.idConversion}`)
      }
    }).catch(error => {
      console.error(`[API] ❌ Erreur critique lancement webhook création prospect ${conversion.idConversion}:`, error)
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
        message: 'Demande de création envoyée à Marjorie. Le prospect sera créé sous quelques instants.',
        data: {
          email,
          idConversion: conversion.idConversion,
          enCours: true
        }
      },
      { status: 202 }
    )

  } catch (error) {
    console.error('[API] Erreur création prospect:', error)

    try {
      await prisma.journalErreur.create({
        data: {
          nomWorkflow: 'api-creer-prospect',
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
