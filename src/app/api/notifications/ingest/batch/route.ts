import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sseManager, type NotificationBroadcast } from '@/lib/sse-manager'

// Clé API pour sécuriser l'endpoint
const API_KEY = process.env.NOTIFICATIONS_API_KEY || 'default-api-key-change-me'

export async function POST(request: NextRequest) {
  try {
    // Vérifier la clé API
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey || apiKey !== API_KEY) {
      return NextResponse.json(
        { error: 'Clé API invalide ou manquante' },
        { status: 401 }
      )
    }

    // Parser le body de la requête
    const body = await request.json()
    const { notifications } = body

    if (!notifications || !Array.isArray(notifications)) {
      return NextResponse.json(
        { error: 'Le champ notifications doit être un tableau' },
        { status: 400 }
      )
    }

    // Créer les notifications en batch
    const results = {
      created: [] as any[],
      errors: [] as any[]
    }

    for (const notification of notifications) {
      try {
        // Mapper les champs vers le schéma Prisma (camelCase)
        // Support des deux formats : snake_case (n8n) et camelCase (scripts)
        const mappedData: any = {
          sourceAgent: notification.sourceAgent || notification.source_agent || 'system',
          sourceWorkflow: notification.sourceWorkflow || notification.source_workflow || null,
          sourceExecutionId: notification.sourceExecutionId || notification.source_execution_id || null,
          categorie: notification.categorie || 'GENERAL',
          type: notification.type || 'INFO',
          priorite: notification.priorite || 'NORMALE',
          titre: notification.titre,
          message: notification.message,
          icone: notification.icone || null,
          couleur: notification.couleur || null,
          audience: notification.audience || 'ADMIN',
          idUtilisateurCible: notification.idUtilisateurCible || notification.id_utilisateur_cible || null,
          idFormateurCible: notification.idFormateurCible || notification.id_formateur_cible || null,
          idEleveCible: notification.idEleveCible || notification.id_eleve_cible || null,
          entiteType: notification.entiteType || notification.entite_type || null,
          entiteId: notification.entiteId || notification.entite_id || null,
          lienAction: notification.lienAction || notification.lien_action || null,
          actionRequise: notification.actionRequise || notification.action_requise || false,
          typeAction: notification.typeAction || notification.type_action || null,
          lue: false,
          archivee: false,
          metadonnees: notification.metadonnees || {},
          expirationDate: notification.expirationDate || notification.expiration_date
            ? new Date(notification.expirationDate || notification.expiration_date)
            : null,
        }

        // Déterminer l'entité type et ID basé sur les données (support legacy)
        if (notification.idCandidat || notification.id_candidat) {
          mappedData.entiteType = mappedData.entiteType || 'CANDIDAT'
          mappedData.entiteId = mappedData.entiteId || String(notification.idCandidat || notification.id_candidat)
        } else if (notification.idProspect || notification.id_prospect) {
          mappedData.entiteType = mappedData.entiteType || 'PROSPECT'
          mappedData.entiteId = mappedData.entiteId || (notification.idProspect || notification.id_prospect)
        } else if (notification.idEleve || notification.id_eleve) {
          mappedData.entiteType = mappedData.entiteType || 'ELEVE'
          mappedData.entiteId = mappedData.entiteId || String(notification.idEleve || notification.id_eleve)
        }

        const created = await prisma.notification.create({
          data: mappedData,
          select: {
            idNotification: true,
            sourceAgent: true,
            titre: true,
            message: true,
            priorite: true,
            categorie: true,
            type: true,
            audience: true,
            idUtilisateurCible: true,
            idFormateurCible: true,
            idEleveCible: true,
            lienAction: true,
            actionRequise: true,
            typeAction: true,
            creeLe: true
          }
        })

        // Broadcast SSE pour push temps réel
        try {
          const broadcastData: NotificationBroadcast = {
            idNotification: created.idNotification,
            sourceAgent: created.sourceAgent,
            categorie: created.categorie,
            type: created.type,
            priorite: created.priorite,
            titre: created.titre,
            message: created.message,
            audience: created.audience,
            idUtilisateurCible: created.idUtilisateurCible,
            idFormateurCible: created.idFormateurCible,
            idEleveCible: created.idEleveCible,
            lienAction: created.lienAction,
            actionRequise: created.actionRequise || false,
            typeAction: created.typeAction,
            creeLe: created.creeLe
          }

          sseManager.broadcast(broadcastData)
        } catch (sseError) {
          console.error(`[SSE] Erreur broadcast notif ${created.idNotification}:`, sseError)
        }

        results.created.push({
          idNotification: created.idNotification,
          titre: created.titre
        })
      } catch (error: any) {
        results.errors.push({
          notification: notification.titre,
          error: error.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.created.length} notifications créées, ${results.errors.length} erreurs`,
      data: results
    })
  } catch (error: any) {
    console.error('Erreur lors de la création des notifications batch:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}