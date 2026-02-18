import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { prospectWebhooks } from '@/lib/webhook-client'

/**
 * API Endpoint: Générer un devis pour un prospect
 *
 * Pattern: Fire-and-Forget (202 Accepted)
 * - Vérifie si génération déjà en cours (lock database)
 * - Crée un verrouillage dans conversions_en_cours
 * - Lance le webhook n8n de manière asynchrone (sans attendre)
 * - Retourne 202 immédiatement
 * - n8n génère le devis PDF, l'envoie par email, update statut, notification
 * - n8n déverrouillera via callback /api/prospects/conversion-complete
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idProspect, formationCode, montant, modeFinancement } = body

    // Validation
    if (!idProspect || !formationCode || !montant) {
      return NextResponse.json(
        { success: false, error: 'idProspect, formationCode et montant requis' },
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
        telephones: true,
        ville: true,
        codePostal: true,
        formationPrincipale: true,
        statutProspect: true
      }
    })

    if (!prospect) {
      return NextResponse.json(
        { success: false, error: 'Prospect introuvable' },
        { status: 404 }
      )
    }

    // ===== LOCK : Vérifier si génération déjà en cours =====
    const actionExistante = await prisma.conversionEnCours.findFirst({
      where: {
        idProspect,
        typeAction: 'GENERER_DEVIS',
        statutAction: 'EN_COURS'
      }
    })

    if (actionExistante) {
      return NextResponse.json(
        {
          success: false,
          error: 'Génération déjà en cours',
          message: `Une génération de devis est déjà en cours de traitement pour ${prospect.prenom} ${prospect.nom}. Vous serez notifié lorsqu'elle sera terminée.`,
          enCours: true
        },
        { status: 409 } // 409 Conflict
      )
    }

    // ===== LOCK : Créer le verrouillage =====
    const action = await prisma.conversionEnCours.create({
      data: {
        idProspect,
        typeAction: 'GENERER_DEVIS',
        statutAction: 'EN_COURS'
      }
    })

    console.log(`[API] 🔒 Génération devis verrouillée - ID: ${action.idConversion}, Prospect: ${idProspect}`)

    // ===== FIRE-AND-FORGET : Lancer webhook n8n de manière asynchrone =====
    prospectWebhooks.genererDevis({
      idProspect,
      idAction: action.idConversion,
      formationCode,
      montant,
      modeFinancement,
      email: prospect.emails[0] || '',
      nom: prospect.nom || '',
      prenom: prospect.prenom || '',
      telephone: prospect.telephones?.[0] || '',
      ville: prospect.ville || '',
      codePostal: prospect.codePostal || ''
    }).then(webhookResult => {
      if (!webhookResult.success) {
        console.error(`[API] ❌ Webhook échoué pour génération devis ${action.idConversion}:`, webhookResult.error)
        // Mettre à jour le statut de l'action en ERREUR
        prisma.conversionEnCours.update({
          where: { idConversion: action.idConversion },
          data: {
            statutAction: 'ERREUR',
            messageErreur: webhookResult.error || 'Erreur inconnue',
            dateFin: new Date(),
            dureeMs: Date.now() - action.dateDebut.getTime()
          }
        }).catch(err => console.error('[API] Erreur update action:', err))
      } else {
        console.log(`[API] ✅ Webhook génération devis lancé avec succès pour action ${action.idConversion}`)
      }
    }).catch(error => {
      console.error(`[API] ❌ Erreur critique lancement webhook génération devis ${action.idConversion}:`, error)
      // Mettre à jour le statut de l'action en ERREUR
      prisma.conversionEnCours.update({
        where: { idConversion: action.idConversion },
        data: {
          statutAction: 'ERREUR',
          messageErreur: error instanceof Error ? error.message : 'Erreur critique',
          dateFin: new Date(),
          dureeMs: Date.now() - action.dateDebut.getTime()
        }
      }).catch(err => console.error('[API] Erreur update action:', err))
    })

    // ===== RETOUR IMMÉDIAT 202 ACCEPTED =====
    return NextResponse.json(
      {
        success: true,
        message: 'Demande de génération de devis transmise à Marjorie. Vous serez notifié lorsque le devis sera envoyé.',
        data: {
          idProspect,
          idAction: action.idConversion,
          formationCode,
          montant,
          modeFinancement,
          enCours: true
        }
      },
      { status: 202 } // 202 Accepted (traitement asynchrone)
    )

  } catch (error) {
    console.error('[API] Erreur génération devis:', error)

    // Log en BDD
    try {
      await prisma.journalErreur.create({
        data: {
          nomWorkflow: 'api-generer-devis',
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
