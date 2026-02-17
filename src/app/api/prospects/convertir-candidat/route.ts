import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { prospectWebhooks } from '@/lib/webhook-client'
import { sseManager } from '@/lib/sse-manager'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idProspect, formationRetenue, sessionVisee, dateDebutSouhaitee } = body

    // Validation
    if (!idProspect || !formationRetenue) {
      return NextResponse.json(
        { success: false, error: 'idProspect et formationRetenue requis' },
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

    // Log de l'action
    console.log(`[API] Conversion candidat - Prospect: ${idProspect}, Formation: ${formationRetenue}`)

    // Appel webhook n8n pour créer le dossier candidat
    const webhookResult = await prospectWebhooks.convertirEnCandidat({
      idProspect,
      formationRetenue,
      sessionVisee,
      dateDebutSouhaitee
    })

    if (!webhookResult.success) {
      // Le webhook a échoué, mais on continue quand même pour mettre à jour le statut
      console.error('[API] Webhook conversion candidat échoué:', webhookResult.error)

      // On met quand même à jour le statut en local
      await prisma.prospect.update({
        where: { idProspect },
        data: {
          statutProspect: 'CANDIDAT',
          formationPrincipale: formationRetenue,
          modifieLe: new Date()
        }
      })

      // Notification SSE pour avertir l'admin de l'échec partiel
      // Note: On ne peut pas créer de notification sans idNotification via broadcast
      // Il faut d'abord créer la notification en BDD puis broadcaster
      const notification = await prisma.notification.create({
        data: {
          sourceAgent: 'system',
          categorie: 'PROSPECT',
          type: 'CONVERSION_PARTIELLE',
          priorite: 'HAUTE',
          titre: '⚠️ Conversion partielle',
          message: `${prospect.prenom} ${prospect.nom} converti en candidat, mais la création du dossier Google Drive a échoué. Action manuelle requise.`,
          audience: 'ADMIN',
          lienAction: `/admin/prospects?search=${idProspect}`,
          actionRequise: true,
          typeAction: 'VERIFIER'
        }
      })

      sseManager.broadcast(notification)

      return NextResponse.json({
        success: true,
        partial: true,
        warning: 'Statut mis à jour mais dossier Drive non créé',
        data: {
          idProspect,
          statutProspect: 'CANDIDAT',
          needsManualDriveCreation: true
        }
      })
    }

    // Succès complet : webhook OK, mise à jour statut
    await prisma.prospect.update({
      where: { idProspect },
      data: {
        statutProspect: 'CANDIDAT',
        formationPrincipale: formationRetenue,
        modifieLe: new Date()
      }
    })

    // Notification SSE de succès
    const notification = await prisma.notification.create({
      data: {
        sourceAgent: 'system',
        categorie: 'CANDIDAT',
        type: 'NOUVEAU_DOSSIER',
        priorite: 'NORMALE',
        titre: '✅ Nouveau candidat',
        message: `${prospect.prenom} ${prospect.nom} a été converti en candidat pour ${formationRetenue}`,
        audience: 'ADMIN',
        lienAction: `/admin/candidats?search=${webhookResult.data?.numeroDossier || ''}`,
        actionRequise: false
      }
    })

    sseManager.broadcast(notification)

    console.log('[API] ✅ Conversion candidat réussie:', webhookResult.data)

    return NextResponse.json({
      success: true,
      data: {
        idProspect,
        statutProspect: 'CANDIDAT',
        numeroDossier: webhookResult.data?.numeroDossier,
        lienDossierDrive: webhookResult.data?.lienDossierDrive,
        workflowId: webhookResult.workflowId,
        executionId: webhookResult.executionId
      }
    })

  } catch (error) {
    console.error('[API] Erreur conversion candidat:', error)

    // Log en BDD
    await prisma.journalErreur.create({
      data: {
        nomWorkflow: 'api-convertir-candidat',
        nomNoeud: 'POST-handler',
        messageErreur: error instanceof Error ? error.message : 'Erreur inconnue',
        donneesEntree: { body: await request.json().catch(() => ({})) },
        resolu: false
      }
    })

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur interne serveur'
      },
      { status: 500 }
    )
  }
}
