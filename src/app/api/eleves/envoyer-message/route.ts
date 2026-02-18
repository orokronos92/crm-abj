import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { eleveWebhooks } from '@/lib/webhook-client'

/**
 * API Endpoint: Envoyer un message/email personnalisé à un élève
 *
 * Pattern: Fire-and-Forget (202 Accepted)
 * - Vérifie si envoi déjà en cours (lock database)
 * - Crée un verrouillage dans conversions_en_cours
 * - Lance le webhook n8n de manière asynchrone (sans attendre)
 * - Retourne 202 immédiatement
 * - n8n envoie l'email, log dans historique_emails, notification
 * - n8n déverrouillera via callback /api/eleves/conversion-complete
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idEleve, numeroDossier, destinataire, objet, contenu } = body

    // Validation
    if (!idEleve || !destinataire || !objet || !contenu) {
      return NextResponse.json(
        { success: false, error: 'idEleve, destinataire, objet et contenu requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'élève existe
    const eleve = await prisma.eleve.findUnique({
      where: { idEleve },
      select: {
        idEleve: true,
        numeroDossier: true,
        candidat: {
          select: {
            idProspect: true,
            prospect: {
              select: {
                nom: true,
                prenom: true,
                emails: true
              }
            }
          }
        },
        statutFormation: true
      }
    })

    if (!eleve) {
      return NextResponse.json(
        { success: false, error: 'Élève introuvable' },
        { status: 404 }
      )
    }

    // ===== LOCK : Vérifier si envoi déjà en cours =====
    const actionExistante = await prisma.conversionEnCours.findFirst({
      where: {
        idProspect: eleve.candidat.idProspect,
        typeAction: 'ENVOYER_MESSAGE',
        statutAction: 'EN_COURS'
      }
    })

    if (actionExistante) {
      return NextResponse.json(
        {
          success: false,
          error: 'Envoi déjà en cours',
          message: `Un envoi de message est déjà en cours de traitement pour ${eleve.candidat.prospect.prenom} ${eleve.candidat.prospect.nom}. Vous serez notifié lorsqu'il sera terminé.`,
          enCours: true
        },
        { status: 409 } // 409 Conflict
      )
    }

    // ===== LOCK : Créer le verrouillage =====
    const action = await prisma.conversionEnCours.create({
      data: {
        idProspect: eleve.candidat.idProspect,
        typeAction: 'ENVOYER_MESSAGE',
        statutAction: 'EN_COURS'
      }
    })

    console.log(`[API] 🔒 Envoi message élève verrouillé - ID: ${action.idConversion}, Élève: ${eleve.numeroDossier}`)

    // ===== FIRE-AND-FORGET : Lancer webhook n8n de manière asynchrone =====
    eleveWebhooks.envoyerMessage({
      numeroDossier: eleve.numeroDossier,
      idAction: action.idConversion,
      destinataire,
      objet,
      contenu
    }).then(webhookResult => {
      if (!webhookResult.success) {
        console.error(`[API] ❌ Webhook échoué pour envoi message élève ${action.idConversion}:`, webhookResult.error)
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
        console.log(`[API] ✅ Webhook envoi message élève lancé avec succès pour action ${action.idConversion}`)
      }
    }).catch(error => {
      console.error(`[API] ❌ Erreur critique lancement webhook envoi message élève ${action.idConversion}:`, error)
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
        message: 'Message transmis à Marjorie pour envoi. Vous serez notifié lorsque le message sera envoyé.',
        data: {
          numeroDossier: eleve.numeroDossier,
          idAction: action.idConversion,
          destinataire,
          objet,
          enCours: true
        }
      },
      { status: 202 } // 202 Accepted (traitement asynchrone)
    )

  } catch (error) {
    console.error('[API] Erreur envoi message élève:', error)

    // Log en BDD
    try {
      await prisma.journalErreur.create({
        data: {
          nomWorkflow: 'api-envoyer-message-eleve',
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
