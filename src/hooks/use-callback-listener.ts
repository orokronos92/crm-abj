/**
 * Hook pour écouter le callback n8n via SSE après une action
 *
 * Utilisé dans les modals pour passer de l'état "pending" à "success" ou "error"
 * selon la réponse de n8n via /api/webhook/callback
 *
 * Supporte deux modes de corrélation :
 * - notificationId (number) : pour les notifications existantes en BDD
 * - correlationId (string UUID) : pour les actions sans notification préalable (T2)
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'

type CallbackStatus = 'pending' | 'success' | 'error'

interface CallbackData {
  notificationId?: number
  correlationId?: string
  typeAction: string
  resultat: CallbackStatus
}

interface UseCallbackListenerOptions {
  notificationId?: number | null
  correlationId?: string | null
  onCallback: (status: CallbackStatus, data: CallbackData) => void
  timeoutSeconds?: number // Timeout en secondes (défaut: 60)
}

/**
 * Écoute les événements SSE action_completed.
 * Filtre par notificationId OU correlationId selon ce qui est fourni.
 * Appelle onCallback quand n8n confirme (success ou error).
 * Appelle onCallback avec 'error' si timeout dépassé.
 */
export function useCallbackListener({
  notificationId,
  correlationId,
  onCallback,
  timeoutSeconds = 60
}: UseCallbackListenerOptions) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const onCallbackRef = useRef(onCallback)

  // Garder la référence à jour sans recréer les effets
  onCallbackRef.current = onCallback

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // Actif si on a soit un notificationId soit un correlationId
  const isActive = notificationId != null || (correlationId != null && correlationId !== '')

  useEffect(() => {
    if (!isActive) return

    // Connexion SSE
    const eventSource = new EventSource('/api/notifications/stream')
    eventSourceRef.current = eventSource

    // Écoute action_completed
    eventSource.addEventListener('action_completed', (event) => {
      try {
        const data: CallbackData = JSON.parse(event.data)

        // Filtrer selon le mode de corrélation disponible
        if (correlationId) {
          // Mode correlationId (T2 — pas de notification préalable)
          if (data.correlationId !== correlationId) return
        } else if (notificationId != null) {
          // Mode notificationId (legacy)
          if (data.notificationId !== notificationId) return
        } else {
          return
        }

        const status = data.resultat

        // Si pending, ignorer (on attend le vrai résultat)
        if (status === 'pending') return

        // Succès ou erreur → notifier le modal et nettoyer
        // setTimeout(0) garantit que React a rendu l'état "pending" avant de passer à "success"/"error"
        cleanup()
        setTimeout(() => {
          onCallbackRef.current(status, data)
        }, 0)
      } catch (e) {
        console.error('[useCallbackListener] Erreur parsing action_completed:', e)
      }
    })

    // Timeout si n8n ne répond pas
    timeoutRef.current = setTimeout(() => {
      cleanup()
      onCallbackRef.current('error', {
        notificationId: notificationId ?? undefined,
        correlationId: correlationId ?? undefined,
        typeAction: 'timeout',
        resultat: 'error'
      })
    }, timeoutSeconds * 1000)

    return cleanup
  }, [isActive, notificationId, correlationId, timeoutSeconds, cleanup])

  return { cleanup }
}
