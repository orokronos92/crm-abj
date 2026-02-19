/**
 * Hook pour créer des notifications lors d'actions utilisateur
 * Gère automatiquement la création de notification + récupération user ID
 */

'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'

interface CreateNotificationParams {
  categorie: string
  type: string
  priorite?: string
  titre: string
  message: string
  entiteType?: string
  entiteId?: string
  actionRequise?: boolean
  typeAction?: string
}

interface ActionNotificationResult {
  notificationId: number
  userId: number
  success: boolean
  error?: string
}

export function useActionNotification() {
  const { data: session } = useSession()
  const [isCreating, setIsCreating] = useState(false)

  /**
   * Crée une notification dans la BDD avant d'exécuter une action
   * @returns L'ID de la notification créée et l'ID utilisateur
   */
  const createActionNotification = async (
    params: CreateNotificationParams
  ): Promise<ActionNotificationResult> => {
    setIsCreating(true)

    try {
      // Récupérer l'ID utilisateur depuis la session
      const userId = session?.user?.id || 1

      // Créer la notification en BDD via l'API d'ingestion
      const response = await fetch('/api/notifications/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_NOTIFICATIONS_API_KEY || 'dev-key'
        },
        body: JSON.stringify({
          sourceAgent: 'admin', // L'action vient de l'admin UI
          categorie: params.categorie,
          type: params.type,
          priorite: params.priorite || 'NORMALE',
          titre: params.titre,
          message: params.message,
          audience: 'ADMIN',
          entiteType: params.entiteType,
          entiteId: params.entiteId,
          actionRequise: params.actionRequise || false,
          typeAction: params.typeAction
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création de la notification')
      }

      const result = await response.json()
      const notificationId = result.data?.idNotification

      if (!notificationId) {
        throw new Error('ID de notification non retourné par l\'API')
      }

      return {
        notificationId,
        userId,
        success: true
      }
    } catch (error) {
      console.error('Erreur création notification:', error)
      return {
        notificationId: Date.now(), // Fallback temporaire
        userId: session?.user?.id || 1,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }
    } finally {
      setIsCreating(false)
    }
  }

  return {
    createActionNotification,
    isCreating,
    userId: session?.user?.id || 1,
    userEmail: session?.user?.email || '',
    userName: session?.user?.nom || ''
  }
}
