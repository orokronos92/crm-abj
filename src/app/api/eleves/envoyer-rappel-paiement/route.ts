import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { eleveWebhooks } from '@/lib/webhook-client'

/**
 * API Endpoint: Envoyer un rappel de paiement à un élève
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
    const { idEleve, numeroDossier } = body

    // Validation
    if (!idEleve || !numeroDossier) {
      return NextResponse.json(
        { success: false, error: 'idEleve et numeroDossier requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'élève existe et récupérer les infos
    const eleve = await prisma.eleve.findUnique({
      where: { idEleve },
      select: {
        idEleve: true,
        numeroDossier: true,
        candidat: {
          select: {
            idProspect: true,
            montantTotalFormation: true,
            prospect: {
              select: {
                nom: true,
                prenom: true,
                emails: true,
                telephones: true
              }
            }
          }
        },
        // Calcul du reste à payer (mock pour l'instant)
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
        typeAction: 'RAPPEL_PAIEMENT',
        statutAction: 'EN_COURS'
      }
    })

    if (actionExistante) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rappel déjà en cours',
          message: `Un rappel de paiement est déjà en cours de traitement pour ${eleve.candidat.prospect.prenom} ${eleve.candidat.prospect.nom}. Vous serez notifié lorsqu'il sera envoyé.`,
          enCours: true
        },
        { status: 409 } // 409 Conflict
      )
    }

    // ===== LOCK : Créer le verrouillage =====
    const action = await prisma.conversionEnCours.create({
      data: {
        idProspect: eleve.candidat.idProspect,
        typeAction: 'RAPPEL_PAIEMENT',
        statutAction: 'EN_COURS'
      }
    })

    console.log(`[API] 🔒 Rappel paiement élève verrouillé - ID: ${action.idConversion}, Élève: ${eleve.numeroDossier}`)

    // ===== FIRE-AND-FORGET : Lancer webhook n8n de manière asynchrone =====
    eleveWebhooks.envoyerRappelPaiement({
      numeroDossier: eleve.numeroDossier,
      idAction: action.idConversion,
      nom: eleve.candidat.prospect.nom || '',
      prenom: eleve.candidat.prospect.prenom || '',
      email: eleve.candidat.prospect.emails?.[0] || '',
      telephone: eleve.candidat.prospect.telephones?.[0],
      montantTotal: Number(eleve.candidat.montantTotalFormation || 0)
    }).then(webhookResult => {
      if (!webhookResult.success) {
        console.error(`[API] ❌ Webhook échoué pour rappel paiement élève ${action.idConversion}:`, webhookResult.error)
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
        console.log(`[API] ✅ Webhook rappel paiement élève lancé avec succès pour action ${action.idConversion}`)
      }
    }).catch(error => {
      console.error(`[API] ❌ Erreur critique lancement webhook rappel paiement élève ${action.idConversion}:`, error)
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
        message: 'Rappel de paiement transmis à Marjorie pour envoi. Vous serez notifié lorsque l\'email sera envoyé.',
        data: {
          numeroDossier: eleve.numeroDossier,
          idAction: action.idConversion,
          nom: eleve.candidat.prospect.nom,
          prenom: eleve.candidat.prospect.prenom,
          email: eleve.candidat.prospect.emails?.[0],
          enCours: true
        }
      },
      { status: 202 } // 202 Accepted (traitement asynchrone)
    )

  } catch (error) {
    console.error('[API] Erreur rappel paiement élève:', error)

    // Log en BDD
    try {
      await prisma.journalErreur.create({
        data: {
          nomWorkflow: 'api-rappel-paiement-eleve',
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
