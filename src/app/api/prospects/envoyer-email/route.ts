import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { prospectWebhooks } from '@/lib/webhook-client'

/**
 * API Endpoint: Envoyer un email personnalisé à un prospect
 *
 * Pattern: Fire-and-Forget (202 Accepted)
 * - Vérifie si envoi déjà en cours (lock database)
 * - Crée un verrouillage dans conversions_en_cours
 * - Lance le webhook n8n de manière asynchrone (sans attendre)
 * - Retourne 202 immédiatement
 * - n8n envoie l'email, log dans historique_emails, notification
 * - n8n déverrouillera via callback /api/prospects/conversion-complete
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idProspect, destinataire, objet, contenu } = body

    // Validation
    if (!idProspect || !destinataire || !objet || !contenu) {
      return NextResponse.json(
        { success: false, error: 'idProspect, destinataire, objet et contenu requis' },
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
        typeAction: 'ENVOYER_EMAIL',
        statutAction: 'EN_COURS'
      }
    })

    if (actionExistante) {
      return NextResponse.json(
        {
          success: false,
          error: 'Envoi déjà en cours',
          message: `Un envoi d'email est déjà en cours de traitement pour ${prospect.prenom} ${prospect.nom}. Vous serez notifié lorsqu'il sera terminé.`,
          enCours: true
        },
        { status: 409 } // 409 Conflict
      )
    }

    // ===== LOCK : Créer le verrouillage =====
    const action = await prisma.conversionEnCours.create({
      data: {
        idProspect,
        typeAction: 'ENVOYER_EMAIL',
        statutAction: 'EN_COURS'
      }
    })

    console.log(`[API] 🔒 Envoi email verrouillé - ID: ${action.idConversion}, Prospect: ${idProspect}`)

    // ===== FIRE-AND-FORGET : Lancer webhook n8n de manière asynchrone =====
    prospectWebhooks.envoyerEmail({
      idProspect,
      idAction: action.idConversion,
      destinataire,
      objet,
      contenu
    }).then(webhookResult => {
      if (!webhookResult.success) {
        console.error(`[API] ❌ Webhook échoué pour envoi email ${action.idConversion}:`, webhookResult.error)
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
        console.log(`[API] ✅ Webhook envoi email lancé avec succès pour action ${action.idConversion}`)
      }
    }).catch(error => {
      console.error(`[API] ❌ Erreur critique lancement webhook envoi email ${action.idConversion}:`, error)
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
        message: 'Email transmis à Marjorie pour envoi. Vous serez notifié lorsque l\'email sera envoyé.',
        data: {
          idProspect,
          idAction: action.idConversion,
          destinataire,
          objet,
          enCours: true
        }
      },
      { status: 202 } // 202 Accepted (traitement asynchrone)
    )

  } catch (error) {
    console.error('[API] Erreur envoi email:', error)

    // Log en BDD
    try {
      await prisma.journalErreur.create({
        data: {
          nomWorkflow: 'api-envoyer-email',
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
