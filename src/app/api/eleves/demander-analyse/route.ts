import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { eleveWebhooks } from '@/lib/webhook-client'

/**
 * API Endpoint: Demander une analyse IA à Marjorie pour un élève
 *
 * Pattern: Fire-and-Forget (202 Accepted)
 * - Vérifie si analyse déjà en cours (lock database)
 * - Crée un verrouillage dans conversions_en_cours
 * - Lance le webhook n8n de manière asynchrone (sans attendre)
 * - Retourne 202 immédiatement
 * - n8n analyse les notes, progression, assiduité
 * - n8n stocke l'analyse dans eleves.analyse_ia
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
            prospect: {
              select: {
                nom: true,
                prenom: true
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

    // ===== LOCK : Vérifier si analyse déjà en cours =====
    const actionExistante = await prisma.conversionEnCours.findFirst({
      where: {
        idProspect: eleve.candidat.idProspect,
        typeAction: 'ANALYSE_ELEVE',
        statutAction: 'EN_COURS'
      }
    })

    if (actionExistante) {
      return NextResponse.json(
        {
          success: false,
          error: 'Analyse déjà en cours',
          message: `Une analyse est déjà en cours de traitement pour ${eleve.candidat.prospect.prenom} ${eleve.candidat.prospect.nom}. Vous serez notifié lorsqu'elle sera terminée.`,
          enCours: true
        },
        { status: 409 } // 409 Conflict
      )
    }

    // ===== LOCK : Créer le verrouillage =====
    const action = await prisma.conversionEnCours.create({
      data: {
        idProspect: eleve.candidat.idProspect,
        typeAction: 'ANALYSE_ELEVE',
        statutAction: 'EN_COURS'
      }
    })

    console.log(`[API] 🔒 Analyse élève verrouillée - ID: ${action.idConversion}, Élève: ${eleve.numeroDossier}`)

    // ===== FIRE-AND-FORGET : Lancer webhook n8n de manière asynchrone =====
    eleveWebhooks.demanderAnalyse({
      numeroDossier: eleve.numeroDossier,
      idAction: action.idConversion,
      nom: eleve.candidat.prospect.nom || '',
      prenom: eleve.candidat.prospect.prenom || ''
    }).then(webhookResult => {
      if (!webhookResult.success) {
        console.error(`[API] ❌ Webhook échoué pour analyse élève ${action.idConversion}:`, webhookResult.error)
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
        console.log(`[API] ✅ Webhook analyse élève lancé avec succès pour action ${action.idConversion}`)
      }
    }).catch(error => {
      console.error(`[API] ❌ Erreur critique lancement webhook analyse élève ${action.idConversion}:`, error)
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
        message: 'Analyse transmise à Marjorie. Vous serez notifié lorsque l\'analyse sera terminée.',
        data: {
          numeroDossier: eleve.numeroDossier,
          idAction: action.idConversion,
          nom: eleve.candidat.prospect.nom,
          prenom: eleve.candidat.prospect.prenom,
          enCours: true
        }
      },
      { status: 202 } // 202 Accepted (traitement asynchrone)
    )

  } catch (error) {
    console.error('[API] Erreur demande analyse élève:', error)

    // Log en BDD
    try {
      await prisma.journalErreur.create({
        data: {
          nomWorkflow: 'api-demander-analyse-eleve',
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
