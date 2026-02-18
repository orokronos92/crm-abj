import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { prospectWebhooks } from '@/lib/webhook-client'

/**
 * API Endpoint: Envoyer le dossier de candidature à un prospect
 *
 * Pattern: Fire-and-Forget (202 Accepted)
 * - Vérifie si envoi déjà en cours (lock database)
 * - Crée un verrouillage dans conversions_en_cours
 * - Lance le webhook n8n de manière asynchrone (sans attendre)
 * - Retourne 202 immédiatement
 * - n8n génère lien formulaire, envoie email, update statut, notification
 * - n8n déverrouillera via callback /api/prospects/action-complete
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idProspect } = body

    // Validation
    if (!idProspect) {
      return NextResponse.json(
        { success: false, error: 'idProspect requis' },
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

    // ===== LOCK : Vérifier si envoi déjà en cours =====
    const actionExistante = await prisma.conversionEnCours.findFirst({
      where: {
        idProspect,
        typeAction: 'ENVOYER_DOSSIER',
        statutAction: 'EN_COURS'
      }
    })

    if (actionExistante) {
      return NextResponse.json(
        {
          success: false,
          error: 'Envoi déjà en cours',
          message: `Un envoi de dossier est déjà en cours de traitement pour ${prospect.prenom} ${prospect.nom}. Vous serez notifié lorsqu'il sera terminé.`,
          enCours: true
        },
        { status: 409 } // 409 Conflict
      )
    }

    // ===== LOCK : Créer le verrouillage =====
    const action = await prisma.conversionEnCours.create({
      data: {
        idProspect,
        typeAction: 'ENVOYER_DOSSIER',
        statutAction: 'EN_COURS'
      }
    })

    console.log(`[API] 🔒 Envoi dossier verrouillé - ID: ${action.idConversion}, Prospect: ${idProspect}`)

    // ===== FIRE-AND-FORGET : Lancer webhook n8n de manière asynchrone =====
    prospectWebhooks.envoyerDossier({
      idProspect,
      idAction: action.idConversion,
      email: prospect.emails[0] || '',
      nom: prospect.nom || '',
      prenom: prospect.prenom || '',
      telephone: prospect.telephones?.[0] || '',
      ville: prospect.ville || '',
      codePostal: prospect.codePostal || '',
      formationPrincipale: prospect.formationPrincipale || ''
    }).then(webhookResult => {
      if (!webhookResult.success) {
        console.error(`[API] ❌ Webhook échoué pour envoi dossier ${action.idConversion}:`, webhookResult.error)
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
        console.log(`[API] ✅ Webhook envoi dossier lancé avec succès pour action ${action.idConversion}`)
      }
    }).catch(error => {
      console.error(`[API] ❌ Erreur critique lancement webhook envoi dossier ${action.idConversion}:`, error)
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
        message: 'Demande d\'envoi du dossier transmise à Marjorie. Vous serez notifié lorsque l\'email sera envoyé.',
        data: {
          idProspect,
          idAction: action.idConversion,
          enCours: true
        }
      },
      { status: 202 } // 202 Accepted (traitement asynchrone)
    )

  } catch (error) {
    console.error('[API] Erreur envoi dossier:', error)

    // Log en BDD
    try {
      await prisma.journalErreur.create({
        data: {
          nomWorkflow: 'api-envoyer-dossier',
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
