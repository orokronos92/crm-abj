import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sseManager } from '@/lib/sse-manager'

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
          message: `${prospectName} a été converti en candidat avec succès. Dossier ${numeroDossier} créé.`,
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
