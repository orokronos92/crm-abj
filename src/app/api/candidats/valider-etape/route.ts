import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sseManager } from '@/lib/sse-manager'

/**
 * API Endpoint: Valider une étape du parcours candidat
 *
 * Pattern: Synchrone avec notification SSE + webhook n8n
 * - Valide l'étape en BDD (booléen + date)
 * - Envoie notification temps réel via SSE
 * - Notifie n8n de la validation (webhook asynchrone)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idCandidat, etape, dateValidation, validePar, observation } = body

    // Validation
    if (!idCandidat || !etape) {
      return NextResponse.json(
        { success: false, error: 'idCandidat et etape requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'étape est valide (accepte les deux formats)
    const etapesValides = [
      'entretien_telephonique', 'rdv_presentiel', 'test_technique', 'validation_pedagogique',
      'entretienTelephonique', 'rdvPresentiel', 'testTechnique', 'validationPedagogique'
    ]
    if (!etapesValides.includes(etape)) {
      return NextResponse.json(
        { success: false, error: 'Étape invalide' },
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
            prenom: true
          }
        }
      }
    })

    if (!candidat) {
      return NextResponse.json(
        { success: false, error: 'Candidat introuvable' },
        { status: 404 }
      )
    }

    // Mapper le nom de l'étape vers les champs BDD (supporte camelCase et snake_case)
    type ChampMapping = { booleen: string; date: string; validePar: string; observation: string }
    const champMapping: Record<string, ChampMapping> = {
      entretien_telephonique:  { booleen: 'entretienTelephonique',  date: 'dateEntretienTel',          validePar: 'valideParEntretienTel',             observation: 'observationEntretienTel' },
      entretienTelephonique:   { booleen: 'entretienTelephonique',  date: 'dateEntretienTel',          validePar: 'valideParEntretienTel',             observation: 'observationEntretienTel' },
      rdv_presentiel:          { booleen: 'rdvPresentiel',          date: 'dateRdvPresentiel',         validePar: 'valideParRdvPresentiel',            observation: 'observationRdvPresentiel' },
      rdvPresentiel:           { booleen: 'rdvPresentiel',          date: 'dateRdvPresentiel',         validePar: 'valideParRdvPresentiel',            observation: 'observationRdvPresentiel' },
      test_technique:          { booleen: 'testTechnique',          date: 'dateTestTechnique',         validePar: 'valideParTestTechnique',            observation: 'observationTestTechnique' },
      testTechnique:           { booleen: 'testTechnique',          date: 'dateTestTechnique',         validePar: 'valideParTestTechnique',            observation: 'observationTestTechnique' },
      validation_pedagogique:  { booleen: 'validationPedagogique',  date: 'dateValidationPedagogique', validePar: 'valideParValidationPedagogique',    observation: 'observationValidationPedagogique' },
      validationPedagogique:   { booleen: 'validationPedagogique',  date: 'dateValidationPedagogique', validePar: 'valideParValidationPedagogique',    observation: 'observationValidationPedagogique' },
    }

    const champs = champMapping[etape]
    const dateAEnregistrer = dateValidation ? new Date(dateValidation) : new Date()

    // Mettre à jour l'étape avec validateur et observation
    await prisma.candidat.update({
      where: { idCandidat },
      data: {
        [champs.booleen]: true,
        [champs.date]: dateAEnregistrer,
        ...(validePar ? { [champs.validePar]: validePar } : {}),
        ...(observation ? { [champs.observation]: observation } : {}),
      }
    })

    console.log(`[API] ✅ Étape "${etape}" validée pour candidat ${candidat.numeroDossier}`)

    // Notification SSE temps réel
    sseManager.broadcast({
      idNotification: Date.now(),
      sourceAgent: 'system',
      categorie: 'CANDIDAT',
      type: 'ETAPE_VALIDEE',
      priorite: 'NORMALE',
      titre: `Étape validée - ${candidat.prospect?.prenom} ${candidat.prospect?.nom}`,
      message: `L'étape "${etape.replace(/_/g, ' ')}" a été validée pour le candidat ${candidat.numeroDossier}`,
      audience: 'ADMIN',
      lienAction: `/admin/candidats?highlight=${candidat.numeroDossier}`,
      actionRequise: false,
      creeLe: new Date()
    })

    // Webhook n8n asynchrone (fire-and-forget pour notification uniquement)
    fetch(`${process.env.N8N_WEBHOOK_BASE_URL || 'http://localhost:5678/webhook'}/candidat/etape-validee`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_API_KEY || ''}`
      },
      body: JSON.stringify({
        numeroDossier: candidat.numeroDossier,
        etape,
        idProspect: candidat.idProspect,
        nom: candidat.prospect?.nom,
        prenom: candidat.prospect?.prenom,
        dateValidation: dateAEnregistrer.toISOString(),
        validePar: validePar || null,
        observation: observation || null,
      })
    }).catch(err => {
      console.error(`[API] ⚠️ Webhook n8n échoué (non bloquant):`, err.message)
    })

    return NextResponse.json({
      success: true,
      message: 'Étape validée avec succès',
      data: {
        etape,
        numeroDossier: candidat.numeroDossier,
        dateValidation: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('[API] Erreur validation étape:', error)

    // Log en BDD
    try {
      await prisma.journalErreur.create({
        data: {
          nomWorkflow: 'api-valider-etape-candidat',
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
