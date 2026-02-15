/**
 * Hook pour gérer les notifications dans l'interface
 * Fournit les méthodes pour récupérer, filtrer et marquer les notifications
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'

export interface Notification {
  idNotification: number
  sourceAgent: string
  categorie: string
  type: string
  priorite: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE'
  titre: string
  message: string
  icone?: string
  couleur?: string
  audience: string
  entiteType?: string
  entiteId?: string
  lienAction?: string
  actionRequise?: boolean
  typeAction?: string
  actionEffectuee?: boolean
  lue: boolean
  dateLecture?: string
  creeLe: string
}

export interface NotificationCounts {
  total: number
  nonLues: number
  urgentes: number
  actionsRequises: number
}

interface UseNotificationsOptions {
  useSSE?: boolean // Utiliser Server-Sent Events pour le temps réel
  autoRefresh?: boolean // Rafraîchir automatiquement
  refreshInterval?: number // Intervalle de rafraîchissement en ms
  limit?: number // Nombre de notifications à charger
  categorie?: string // Filtrer par catégorie
  priorite?: string // Filtrer par priorité
  nonLuesSeulement?: boolean // Seulement les non lues
  role?: 'admin' | 'professeur' | 'eleve' // Rôle pour filtrage (utilisé si pas de session)
}

interface UseNotificationsReturn {
  notifications: Notification[]
  counts: NotificationCounts
  loading: boolean
  refreshing: boolean // État distinct pour l'actualisation
  error: string | null
  hasMore: boolean
  sseConnected: boolean // État de la connexion SSE
  // Actions
  refresh: () => Promise<void>
  loadMore: () => Promise<void>
  markAsRead: (notificationId: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  executeAction?: (notificationId: number, action: string) => Promise<void>
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [counts, setCounts] = useState<NotificationCounts>({
    total: 0,
    nonLues: 0,
    urgentes: 0,
    actionsRequises: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false) // État distinct pour l'actualisation
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [sseConnected, setSseConnected] = useState(false)

  // Références pour SSE
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const {
    useSSE = true, // Utiliser SSE par défaut
    autoRefresh = !useSSE, // Si SSE activé, pas besoin de refresh
    refreshInterval = 30000, // 30 secondes par défaut
    limit = 20,
    categorie,
    priorite,
    nonLuesSeulement = false,
    role // Rôle pour filtrage
  } = options

  // Fonction pour charger les notifications
  const fetchNotifications = useCallback(async (append = false, isRefresh = false) => {
    if (!session?.user) {
      setLoading(false)
      return
    }

    try {
      // Si c'est un refresh manuel, on utilise refreshing au lieu de loading
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      // Construire les paramètres de requête
      const params = new URLSearchParams()
      params.append('limit', limit.toString())
      params.append('offset', append ? offset.toString() : '0')
      if (categorie) params.append('categorie', categorie)
      if (priorite) params.append('priorite', priorite)
      if (nonLuesSeulement) params.append('nonLues', 'true')
      if (role) params.append('role', role) // Passer le rôle pour filtrage

      const response = await fetch(`/api/notifications?${params}`)

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des notifications')
      }

      const result = await response.json()

      if (result.success) {
        const newNotifications = result.data.notifications || []
        setNotifications(prev => append ? [...prev, ...newNotifications] : newNotifications)
        setCounts(result.data.counts || {
          total: 0,
          nonLues: 0,
          urgentes: 0,
          actionsRequises: 0
        })
        setHasMore(result.data.pagination?.hasMore || false)

        if (append) {
          setOffset(prev => prev + limit)
        } else {
          setOffset(limit)
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement des notifications:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [session, limit, categorie, priorite, nonLuesSeulement, offset])

  // Rafraîchir les notifications
  const refresh = useCallback(async () => {
    setOffset(0)
    await fetchNotifications(false, true) // true = isRefresh
  }, [fetchNotifications])

  // Charger plus de notifications
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return
    await fetchNotifications(true)
  }, [hasMore, loading, fetchNotifications])

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationId,
          action: 'markAsRead'
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors du marquage de la notification')
      }

      // Mettre à jour localement
      setNotifications(prev =>
        prev.map(n =>
          n.idNotification === notificationId
            ? { ...n, lue: true, dateLecture: new Date().toISOString() }
            : n
        )
      )

      // Mettre à jour les compteurs
      setCounts(prev => ({
        ...prev,
        nonLues: Math.max(0, prev.nonLues - 1),
        urgentes: notifications.find(n =>
          n.idNotification === notificationId && n.priorite === 'URGENTE'
        ) ? Math.max(0, prev.urgentes - 1) : prev.urgentes
      }))
    } catch (err) {
      console.error('Erreur lors du marquage de la notification:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }, [notifications])

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationId: null,
          action: 'markAllAsRead'
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors du marquage des notifications')
      }

      // Mettre à jour localement
      setNotifications(prev =>
        prev.map(n => ({ ...n, lue: true, dateLecture: new Date().toISOString() }))
      )

      // Réinitialiser les compteurs
      setCounts(prev => ({
        ...prev,
        nonLues: 0,
        urgentes: 0
      }))
    } catch (err) {
      console.error('Erreur lors du marquage des notifications:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }, [])

  // Fonction pour établir la connexion SSE
  const connectSSE = useCallback(() => {
    if (!useSSE || !session?.user) return

    try {
      console.log('🔌 Connexion SSE avec rôle:', role || session?.user?.role || 'admin')
      // Le referer sera automatiquement envoyé par le navigateur
      const eventSource = new EventSource('/api/notifications/stream')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log('✅ SSE connecté')
        setSseConnected(true)
        setError(null)

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = null
        }
      }

      eventSource.onerror = (err) => {
        console.error('❌ Erreur SSE:', err)
        setSseConnected(false)

        // Reconnexion automatique après 5 secondes
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Tentative de reconnexion SSE...')
            connectSSE()
          }, 5000)
        }
      }

      // Message de bienvenue
      eventSource.addEventListener('welcome', (event) => {
        console.log('👋 SSE Welcome:', event.data)
      })

      // Mise à jour des compteurs
      eventSource.addEventListener('counts', (event) => {
        try {
          const newCounts = JSON.parse(event.data)
          setCounts(newCounts)
        } catch (e) {
          console.error('Erreur parsing counts:', e)
        }
      })

      // Nouvelle notification
      eventSource.addEventListener('notification', (event) => {
        try {
          const notification = JSON.parse(event.data)
          console.log('🔔 Nouvelle notification SSE:', notification)

          // Ajouter la notification en début de liste
          setNotifications(prev => {
            // Éviter les doublons
            if (prev.find(n => n.idNotification === notification.idNotification)) {
              return prev
            }
            return [notification, ...prev]
          })

          // Mettre à jour les compteurs
          setCounts(prev => ({
            total: prev.total + 1,
            nonLues: prev.nonLues + 1,
            urgentes: notification.priorite === 'URGENTE' ? prev.urgentes + 1 : prev.urgentes,
            actionsRequises: notification.actionRequise ? prev.actionsRequises + 1 : prev.actionsRequises
          }))

          // Notification browser native si urgente
          if (notification.priorite === 'URGENTE' &&
              'Notification' in window &&
              Notification.permission === 'granted') {
            new Notification(notification.titre, {
              body: notification.message,
              icon: '/icons/abj-logo.png'
            })
          }
        } catch (e) {
          console.error('Erreur parsing notification:', e)
        }
      })

      // Action complétée
      eventSource.addEventListener('action_completed', (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('✅ Action complétée SSE:', data)

          setNotifications(prev =>
            prev.map(n =>
              n.idNotification === data.notificationId
                ? { ...n, actionEffectuee: true }
                : n
            )
          )
        } catch (e) {
          console.error('Erreur parsing action_completed:', e)
        }
      })

      // Heartbeat
      eventSource.addEventListener('heartbeat', () => {
        console.log('💓 SSE heartbeat')
      })

    } catch (err) {
      console.error('Erreur connexion SSE:', err)
      setError('Impossible de se connecter au flux SSE')
      setSseConnected(false)
    }
  }, [useSSE, session, role])

  // Déconnecter SSE
  const disconnectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      console.log('🔌 Déconnexion SSE...')
      eventSourceRef.current.close()
      eventSourceRef.current = null
      setSseConnected(false)
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  // Exécuter une action sur une notification
  const executeAction = useCallback(async (notificationId: number, action: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resultat: action })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'exécution de l\'action')
      }

      const result = await response.json()

      if (result.success) {
        setNotifications(prev =>
          prev.map(n =>
            n.idNotification === notificationId
              ? { ...n, actionEffectuee: true }
              : n
          )
        )

        setCounts(prev => ({
          ...prev,
          actionsRequises: Math.max(0, prev.actionsRequises - 1)
        }))
      }
    } catch (err) {
      console.error('Erreur lors de l\'exécution de l\'action:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }, [])

  // Demander la permission pour les notifications browser
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Chargement initial
  useEffect(() => {
    refresh()
  }, [refresh])

  // Gestion SSE
  useEffect(() => {
    if (useSSE && session) {
      connectSSE()
      return () => disconnectSSE()
    }
  }, [useSSE, session, connectSSE, disconnectSSE])

  // Auto-refresh (si SSE désactivé)
  useEffect(() => {
    if (!autoRefresh || !session || useSSE) return

    const interval = setInterval(refresh, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refresh, session, useSSE])

  return {
    notifications,
    counts,
    loading,
    refreshing,
    error,
    hasMore,
    sseConnected,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
    executeAction
  }
}

// Hook pour obtenir uniquement les compteurs (plus léger)
export function useNotificationCounts() {
  const { counts, refresh } = useNotifications({
    limit: 0, // Ne pas charger les notifications, juste les compteurs
    autoRefresh: true,
    refreshInterval: 15000 // Refresh plus fréquent pour les compteurs
  })

  return { counts, refresh }
}

// Hook pour les notifications urgentes
export function useUrgentNotifications() {
  return useNotifications({
    priorite: 'URGENTE',
    nonLuesSeulement: true,
    limit: 5,
    autoRefresh: true,
    refreshInterval: 10000 // Refresh rapide pour les urgentes
  })
}