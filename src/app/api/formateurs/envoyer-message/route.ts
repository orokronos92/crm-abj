import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { formateurWebhooks } from '@/lib/webhook-client'

/**
 * API Endpoint: Envoyer un message à un formateur
 *
 * Pattern: Fire-and-Forget (202 Accepted)
 * - Vérifie si envoi déjà en cours (lock database)
 * - Crée un verrouillage dans conversions_en_cours
 * - Lance le webhook n8n de manière asynchrone (sans attendre)
 * - Retourne 202 immédiatement
 * - n8n envoie l'email et met à jour la BDD
 * - n8n déverrouillera via callback /api/formateurs/conversion-complete (à créer si besoin)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idFormateur, destinataire, objet, contenu } = body

    // Validation
    if (!idFormateur || !destinataire || !objet || !contenu) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que le formateur existe
    const formateur = await prisma.formateur.findUnique({
      where: { idFormateur },
      select: {
        idFormateur: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        idUtilisateur: true
      }
    })

    if (!formateur) {
      return NextResponse.json(
        { success: false, error: 'Formateur introuvable' },
        { status: 404 }
      )
    }

    // Récupérer l'idProspect via utilisateur (si existe)
    // Pour les formateurs, on n'a pas forcément de lien direct avec prospects
    // On va créer un lock sans idProspect (champ nullable)
    let idProspectForLock: string | null = null

    if (formateur.idUtilisateur) {
      // Chercher si cet utilisateur a un lien avec un prospect
      const utilisateur = await prisma.utilisateur.findUnique({
        where: { idUtilisateur: formateur.idUtilisateur },
        select: { email: true }
      })

      if (utilisateur?.email) {
        const prospect = await prisma.prospect.findFirst({
          where: {
            emails: {
              has: utilisateur.email
            }
          },
          select: { idProspect: true }
        })
        idProspectForLock = prospect?.idProspect || null
      }
    }

    // ===== LOCK : Vérifier si envoi déjà en cours =====
    // Pour les formateurs, on vérifie simplement s'il y a un envoi de message en cours
    // pour ce type d'action (idProspect peut être null)
    const actionExistante = await prisma.conversionEnCours.findFirst({
      where: {
        typeAction: 'ENVOYER_MESSAGE_FORMATEUR',
        statutAction: 'EN_COURS'
      }
    })

    if (actionExistante) {
      return NextResponse.json(
        {
          success: false,
          error: 'Envoi déjà en cours',
          message: `Un message est déjà en cours d'envoi pour ${formateur.prenom} ${formateur.nom}`,
          enCours: true
        },
        { status: 409 } // 409 Conflict
      )
    }

    // ===== LOCK : Créer le verrouillage =====
    // Note: Pour les formateurs, idProspect peut être undefined (pas de lien direct)
    // On utilise messageErreur temporairement pour stocker l'objet du message
    const action = await prisma.conversionEnCours.create({
      data: {
        idProspect: idProspectForLock || `formateur_${idFormateur}`, // Identifiant unique pour lock
        typeAction: 'ENVOYER_MESSAGE_FORMATEUR',
        statutAction: 'EN_COURS',
        messageErreur: objet // Stockage temporaire de l'objet pour identification
      }
    })

    console.log(`[API] 🔒 Envoi message formateur verrouillé - ID: ${action.idConversion}, Formateur: ${formateur.prenom} ${formateur.nom}`)

    // ===== FIRE-AND-FORGET : Lancer webhook n8n de manière asynchrone =====
    formateurWebhooks.envoyerMessage({
      idFormateur: formateur.idFormateur,
      idAction: action.idConversion,
      destinataire: destinataire,
      objet: objet,
      contenu: contenu,
      nom: formateur.nom,
      prenom: formateur.prenom,
      telephone: formateur.telephone || undefined
    }).then(webhookResult => {
      if (!webhookResult.success) {
        console.error(`[API] ❌ Webhook échoué pour message formateur ${action.idConversion}:`, webhookResult.error)
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
        console.log(`[API] ✅ Webhook message formateur lancé avec succès pour action ${action.idConversion}`)
      }
    }).catch(error => {
      console.error(`[API] ❌ Erreur critique lancement webhook message formateur ${action.idConversion}:`, error)
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
        message: 'Message transmis à Marjorie pour envoi',
        data: {
          idFormateur: formateur.idFormateur,
          idAction: action.idConversion,
          destinataire: destinataire,
          objet: objet,
          enCours: true
        }
      },
      { status: 202 } // 202 Accepted (traitement asynchrone)
    )

  } catch (error) {
    console.error('[API] Erreur envoi message formateur:', error)

    // Log en BDD
    try {
      await prisma.journalErreur.create({
        data: {
          nomWorkflow: 'api-envoyer-message-formateur',
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
