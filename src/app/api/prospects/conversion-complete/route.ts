import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sseManager } from '@/lib/sse-manager'

/**
 * Crée les documents requis pour la formation du candidat
 * Appelé après confirmation de la conversion par n8n
 */
async function creerDocumentsRequis(
  numeroDossier: string,
  formationRetenue: string
): Promise<number> {
  // Trouver la formation par son code
  const formation = await prisma.formation.findFirst({
    where: { codeFormation: formationRetenue },
    select: { idFormation: true, codeFormation: true }
  })

  if (!formation) {
    console.log(`[conversion-complete] Formation "${formationRetenue}" introuvable — pas de documents créés`)
    return 0
  }

  // Récupérer le candidat pour avoir l'idProspect
  const candidat = await prisma.candidat.findUnique({
    where: { numeroDossier },
    select: { idCandidat: true, idProspect: true, numeroDossier: true }
  })

  if (!candidat) {
    console.log(`[conversion-complete] Candidat "${numeroDossier}" introuvable — pas de documents créés`)
    return 0
  }

  // Récupérer les documents requis pour cette formation
  const documentsRequis = await prisma.documentRequis.findMany({
    where: { idFormation: formation.idFormation },
    include: { typeDocument: { select: { code: true, categorie: true } } },
    orderBy: { ordreAffichage: 'asc' }
  })

  if (documentsRequis.length === 0) {
    console.log(`[conversion-complete] Aucun document requis pour la formation "${formationRetenue}"`)
    return 0
  }

  // Vérifier les documents déjà existants (éviter doublons)
  const documentsExistants = await prisma.documentCandidat.findMany({
    where: { numeroDossier },
    select: { typeDocument: true }
  })
  const typesExistants = new Set(documentsExistants.map(d => d.typeDocument))

  // Créer uniquement les documents manquants
  const documentsACreer = documentsRequis.filter(
    dr => !typesExistants.has(dr.codeTypeDocument)
  )

  if (documentsACreer.length === 0) {
    console.log(`[conversion-complete] Documents déjà existants pour "${numeroDossier}" — rien à créer`)
    return 0
  }

  await prisma.documentCandidat.createMany({
    data: documentsACreer.map(dr => ({
      idProspect: candidat.idProspect,
      numeroDossier: candidat.numeroDossier,
      typeDocument: dr.codeTypeDocument,
      categorie: dr.typeDocument.categorie,
      statut: 'ATTENDU',
      obligatoire: dr.obligatoire
    }))
  })

  console.log(`[conversion-complete] ✅ ${documentsACreer.length} documents créés pour "${numeroDossier}" (formation: ${formationRetenue})`)
  return documentsACreer.length
}

/**
 * API Endpoint: Callback n8n pour signaler fin de conversion
 *
 * Appelé par n8n à la fin du workflow de conversion prospect → candidat
 * - Déverrouille la conversion (update conversions_en_cours)
 * - Envoie une notification SSE à l'admin
 *
 * Sécurité: API Key requise (N8N_API_KEY)
 */
export async function POST(request: NextRequest) {
  try {
    // === SÉCURITÉ : Vérifier API Key ===
    const apiKey = request.headers.get('x-api-key')
    const validApiKey = process.env.N8N_API_KEY

    if (!apiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      idConversion,
      success,
      numeroDossier,
      lienDossierDrive,
      workflowId,
      executionId,
      error
    } = body

    // Validation
    if (!idConversion) {
      return NextResponse.json(
        { success: false, error: 'idConversion requis' },
        { status: 400 }
      )
    }

    // Récupérer la conversion
    const conversion = await prisma.conversionEnCours.findUnique({
      where: { idConversion: parseInt(idConversion, 10) }
    })

    if (!conversion) {
      return NextResponse.json(
        { success: false, error: 'Conversion introuvable' },
        { status: 404 }
      )
    }

    const dureeMs = Date.now() - conversion.dateDebut.getTime()

    // === DÉVERROUILLER : Mettre à jour le statut ===
    await prisma.conversionEnCours.update({
      where: { idConversion: parseInt(idConversion, 10) },
      data: {
        statutAction: success ? 'TERMINEE' : 'ERREUR',
        workflowId,
        executionId,
        messageErreur: error || null,
        dateFin: new Date(),
        dureeMs
      }
    })

    console.log(`[API] 🔓 Conversion déverrouillée - ID: ${idConversion}, Succès: ${success}, Durée: ${dureeMs}ms`)

    // === CRÉATION DOCUMENTS REQUIS ===
    // Si la conversion a réussi et qu'on a un numeroDossier + une formation,
    // on crée automatiquement les placeholders de documents requis pour cette formation
    let nbDocumentsCreés = 0
    if (success && numeroDossier && conversion.formationRetenue) {
      try {
        nbDocumentsCreés = await creerDocumentsRequis(numeroDossier, conversion.formationRetenue)
      } catch (docError) {
        // Non bloquant : on log mais on continue (le candidat est créé, les docs peuvent être ajoutés manuellement)
        console.error('[conversion-complete] Erreur création documents requis:', docError)
      }
    }

    // === NOTIFICATION SSE ===
    const prospectName = conversion.idProspect

    if (success) {
      // Notification de succès
      const notification = await prisma.notification.create({
        data: {
          sourceAgent: 'marjorie',
          categorie: 'CANDIDAT',
          type: 'NOUVEAU_DOSSIER',
          priorite: 'NORMALE',
          titre: '✅ Nouveau candidat',
          message: `${prospectName} a été converti en candidat avec succès. Dossier ${numeroDossier} créé.${nbDocumentsCreés > 0 ? ` ${nbDocumentsCreés} documents requis ajoutés.` : ''}`,
          audience: 'ADMIN',
          lienAction: numeroDossier ? `/admin/candidats?search=${numeroDossier}` : '/admin/candidats',
          actionRequise: false,
          metadonnees: {
            numeroDossier,
            lienDossierDrive,
            workflowId,
            executionId,
            dureeMs
          }
        }
      })

      sseManager.broadcast(notification)
    } else {
      // Notification d'erreur
      const notification = await prisma.notification.create({
        data: {
          sourceAgent: 'system',
          categorie: 'PROSPECT',
          type: 'CONVERSION_ERREUR',
          priorite: 'HAUTE',
          titre: '❌ Erreur conversion',
          message: `La conversion de ${prospectName} en candidat a échoué. ${error || 'Erreur inconnue'}`,
          audience: 'ADMIN',
          lienAction: `/admin/prospects?search=${conversion.idProspect}`,
          actionRequise: true,
          typeAction: 'VERIFIER',
          metadonnees: {
            error,
            workflowId,
            executionId,
            dureeMs
          }
        }
      })

      sseManager.broadcast(notification)
    }

    return NextResponse.json({
      success: true,
      message: 'Conversion déverrouillée et notification envoyée'
    })

  } catch (error) {
    console.error('[API] Erreur callback conversion-complete:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur interne serveur'
      },
      { status: 500 }
    )
  }
}
