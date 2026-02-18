import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { formateurWebhooks } from '@/lib/webhook-client'

/**
 * API Endpoint: Demander un document à un formateur
 *
 * Pattern: Fire-and-Forget (202 Accepted)
 * - Vérifie si demande déjà en cours (lock database)
 * - Crée un verrouillage dans conversions_en_cours
 * - Lance le webhook n8n de manière asynchrone (sans attendre)
 * - Retourne 202 immédiatement
 * - n8n envoie l'email de demande et met à jour la BDD
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idFormateur, destinataire, codeTypeDocument, libelleDocument, motif } = body

    // Validation
    if (!idFormateur || !destinataire || !codeTypeDocument || !motif) {
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
    let idProspectForLock: string | undefined = undefined

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
        idProspectForLock = prospect?.idProspect || undefined
      }
    }

    // ===== LOCK : Vérifier si demande déjà en cours =====
    const actionExistante = await prisma.conversionEnCours.findFirst({
      where: {
        typeAction: 'DEMANDER_DOCUMENT_FORMATEUR',
        statutAction: 'EN_COURS'
      }
    })

    if (actionExistante) {
      return NextResponse.json(
        {
          success: false,
          error: 'Demande déjà en cours',
          message: `Une demande de document est déjà en cours pour ${formateur.prenom} ${formateur.nom}`,
          enCours: true
        },
        { status: 409 } // 409 Conflict
      )
    }

    // ===== LOCK : Créer le verrouillage =====
    const action = await prisma.conversionEnCours.create({
      data: {
        idProspect: idProspectForLock || `formateur_${idFormateur}`,
        typeAction: 'DEMANDER_DOCUMENT_FORMATEUR',
        statutAction: 'EN_COURS',
        messageErreur: `${codeTypeDocument}:${motif}` // Stockage temporaire pour identification
      }
    })

    console.log(`[API] 🔒 Demande document formateur verrouillée - ID: ${action.idConversion}, Formateur: ${formateur.prenom} ${formateur.nom}, Document: ${libelleDocument}`)

    // ===== FIRE-AND-FORGET : Lancer webhook n8n de manière asynchrone =====
    formateurWebhooks.demanderDocument({
      idFormateur: formateur.idFormateur,
      idAction: action.idConversion,
      destinataire: destinataire,
      codeTypeDocument: codeTypeDocument,
      libelleDocument: libelleDocument,
      motif: motif,
      nom: formateur.nom,
      prenom: formateur.prenom,
      telephone: formateur.telephone || undefined
    }).then(webhookResult => {
      if (!webhookResult.success) {
        console.error(`[API] ❌ Webhook échoué pour demande document formateur ${action.idConversion}:`, webhookResult.error)
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
        console.log(`[API] ✅ Webhook demande document formateur lancé avec succès pour action ${action.idConversion}`)
      }
    }).catch(error => {
      console.error(`[API] ❌ Erreur critique lancement webhook demande document formateur ${action.idConversion}:`, error)
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
        message: 'Demande transmise à Marjorie pour envoi',
        data: {
          idFormateur: formateur.idFormateur,
          idAction: action.idConversion,
          destinataire: destinataire,
          codeTypeDocument: codeTypeDocument,
          libelleDocument: libelleDocument,
          motif: motif,
          enCours: true
        }
      },
      { status: 202 } // 202 Accepted (traitement asynchrone)
    )

  } catch (error) {
    console.error('[API] Erreur demande document formateur:', error)

    // Log en BDD
    try {
      await prisma.journalErreur.create({
        data: {
          nomWorkflow: 'api-demander-document-formateur',
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
