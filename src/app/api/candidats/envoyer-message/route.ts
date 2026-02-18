import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { candidatWebhooks } from '@/lib/webhook-client'

/**
 * API Endpoint: Envoyer un message/email personnalisé à un candidat
 *
 * Pattern: Fire-and-Forget (202 Accepted)
 * - Vérifie si envoi déjà en cours (lock database)
 * - Crée un verrouillage dans conversions_en_cours
 * - Lance le webhook n8n de manière asynchrone (sans attendre)
 * - Retourne 202 immédiatement
 * - n8n envoie l'email, log dans historique_emails, notification
 * - n8n déverrouillera via callback /api/candidats/conversion-complete
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idCandidat, numeroDossier, destinataire, objet, contenu } = body

    // Validation
    if (!idCandidat || !destinataire || !objet || !contenu) {
      return NextResponse.json(
        { success: false, error: 'idCandidat, destinataire, objet et contenu requis' },
        { status: 400 }
      )
    }

    // Vérifier que le candidat existe
    const candidat = await prisma.candidat.findUnique({
      where: { idCandidat },
      select: {
        idCandidat: true,
        numeroDossier: true,
        idProspect: true,
        prospect: {
          select: {
            nom: true,
            prenom: true,
            emails: true
          }
        },
        statutDossier: true
      }
    })

    if (!candidat) {
      return NextResponse.json(
        { success: false, error: 'Candidat introuvable' },
        { status: 404 }
      )
    }

    // ===== LOCK : Vérifier si envoi déjà en cours =====
    const actionExistante = await prisma.conversionEnCours.findFirst({
      where: {
        idProspect: candidat.idProspect,
        typeAction: 'ENVOYER_MESSAGE',
        statutAction: 'EN_COURS'
      }
    })

    if (actionExistante) {
      return NextResponse.json(
        {
          success: false,
          error: 'Envoi déjà en cours',
          message: `Un envoi de message est déjà en cours de traitement pour ${candidat.prospect?.prenom} ${candidat.prospect?.nom}. Vous serez notifié lorsqu'il sera terminé.`,
          enCours: true
        },
        { status: 409 } // 409 Conflict
      )
    }

    // ===== LOCK : Créer le verrouillage =====
    const action = await prisma.conversionEnCours.create({
      data: {
        idProspect: candidat.idProspect,
        typeAction: 'ENVOYER_MESSAGE',
        statutAction: 'EN_COURS'
      }
    })

    console.log(`[API] 🔒 Envoi message verrouillé - ID: ${action.idConversion}, Candidat: ${candidat.numeroDossier}`)

    // ===== FIRE-AND-FORGET : Lancer webhook n8n de manière asynchrone =====
    candidatWebhooks.envoyerMessage({
      numeroDossier: candidat.numeroDossier,
      idAction: action.idConversion,
      destinataire,
      objet,
      contenu
    }).then(webhookResult => {
      if (!webhookResult.success) {
        console.error(`[API] ❌ Webhook échoué pour envoi message ${action.idConversion}:`, webhookResult.error)
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
        console.log(`[API] ✅ Webhook envoi message lancé avec succès pour action ${action.idConversion}`)
      }
    }).catch(error => {
      console.error(`[API] ❌ Erreur critique lancement webhook envoi message ${action.idConversion}:`, error)
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
          numeroDossier: candidat.numeroDossier,
          idAction: action.idConversion,
          destinataire,
          objet,
          enCours: true
        }
      },
      { status: 202 } // 202 Accepted (traitement asynchrone)
    )

  } catch (error) {
    console.error('[API] Erreur envoi message:', error)

    // Log en BDD
    try {
      await prisma.journalErreur.create({
        data: {
          nomWorkflow: 'api-envoyer-message-candidat',
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
