/**
 * Page Notifications Élève
 * Notifications personnelles et globales avec SSE temps réel
 */

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useNotifications } from '@/hooks/use-notifications'
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Trophy,
  Calendar,
  MessageSquare,
  Clock,
  Filter,
  Trash2,
  Eye,
  EyeOff,
  Users,
  User,
  BookOpen,
  Award,
  Mail,
  Target,
} from 'lucide-react'

export default function EleveNotificationsPage() {
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('highlight')

  const [filterType, setFilterType] = useState<string>('all')
  const [filterScope, setFilterScope] = useState<string>('all')
  const [showOnlyUnread, setShowOnlyUnread] = useState(false)

  // Hook SSE pour les vraies notifications
  const {
    notifications,
    counts,
    loading,
    sseConnected,
    markAsRead: markAsReadHook,
    markAllAsRead: markAllAsReadHook,
  } = useNotifications({
    useSSE: true,
    limit: 100
  })

  // Scroll vers notification mise en évidence
  useEffect(() => {
    if (highlightId) {
      setTimeout(() => {
        const element = document.getElementById(`notification-${highlightId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          element.classList.add('animate-pulse-highlight')
          setTimeout(() => {
            element.classList.remove('animate-pulse-highlight')
          }, 3000)
        }
      }, 500)
    }
  }, [highlightId])

  // Statistiques depuis le hook
  const totalNotifications = counts.total
  const unreadCount = counts.nonLues
  const personalCount = notifications.filter((n) => n.audience === 'ELEVE').length
  const globalCount = notifications.filter((n) => n.audience === 'TOUS').length

  // Filtrage local
  const filteredNotifications = notifications
    .filter((n) => filterType === 'all' || n.categorie.toLowerCase().includes(filterType.toLowerCase()))
    .filter((n) => {
      if (filterScope === 'all') return true
      if (filterScope === 'personnel') return n.audience === 'ELEVE'
      if (filterScope === 'global') return n.audience === 'TOUS'
      return true
    })
    .filter((n) => !showOnlyUnread || !n.lue)

  // Actions
  const markAsRead = async (id: number) => {
    const notif = notifications.find(n => n.idNotification === id)
    if (notif && !notif.lue) {
      await markAsReadHook(id)
    }
  }

  const markAllAsRead = async () => {
    await markAllAsReadHook()
  }

  const deleteNotification = (id: number) => {
    // TODO: Implémenter suppression via API
    console.log('Suppression notification à implémenter:', id)
  }

  // Styles par catégorie (mapping depuis BDD)
  const getTypeIcon = (categorie: string) => {
    const cat = categorie.toUpperCase()
    if (cat.includes('COURS') || cat.includes('PLANNING')) return <BookOpen className="w-5 h-5" />
    if (cat.includes('EVALUATION') || cat.includes('NOTE')) return <Award className="w-5 h-5" />
    if (cat.includes('ADMINISTRATIF') || cat.includes('SYSTEM')) return <AlertCircle className="w-5 h-5" />
    if (cat.includes('MESSAGE')) return <MessageSquare className="w-5 h-5" />
    if (cat.includes('REUSSITE') || cat.includes('SUCCESS')) return <Trophy className="w-5 h-5" />
    return <Info className="w-5 h-5" />
  }

  const getTypeColor = (categorie: string) => {
    const cat = categorie.toUpperCase()
    if (cat.includes('COURS') || cat.includes('PLANNING')) return 'text-[rgb(var(--info))] bg-[rgba(var(--info),0.1)]'
    if (cat.includes('EVALUATION') || cat.includes('NOTE')) return 'text-[rgb(var(--accent))] bg-[rgba(var(--accent),0.1)]'
    if (cat.includes('ADMINISTRATIF') || cat.includes('SYSTEM')) return 'text-[rgb(var(--warning))] bg-[rgba(var(--warning),0.1)]'
    if (cat.includes('MESSAGE')) return 'text-[rgb(var(--success))] bg-[rgba(var(--success),0.1)]'
    if (cat.includes('REUSSITE') || cat.includes('SUCCESS')) return 'text-[rgb(var(--accent))] bg-[rgba(var(--accent),0.1)]'
    return 'text-[rgb(var(--muted-foreground))] bg-[rgba(var(--muted-foreground),0.1)]'
  }

  const getPriorityBorder = (priorite: string) => {
    switch (priorite) {
      case 'URGENTE':
      case 'HAUTE':
        return 'border-l-4 border-l-[rgb(var(--error))]'
      case 'NORMALE':
        return 'border-l-4 border-l-[rgb(var(--accent))]'
      case 'BASSE':
        return 'border-l-4 border-l-[rgba(var(--border),0.5)]'
      default:
        return 'border-l-4 border-l-[rgb(var(--accent))]'
    }
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-2">
              Notifications
            </h1>
            <p className="text-[rgb(var(--muted-foreground))]">
              Restez informé de toutes les actualités
            </p>
          </div>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-dark))] transition-colors flex items-center gap-2"
            disabled={unreadCount === 0}
          >
            <CheckCircle className="w-4 h-4" />
            Tout marquer comme lu
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <Bell className="w-8 h-8 text-[rgb(var(--accent))]" />
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-[rgb(var(--error))] text-white text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{totalNotifications}</p>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">Total notifications</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <EyeOff className="w-8 h-8 text-[rgb(var(--warning))]" />
            </div>
            <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{unreadCount}</p>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">Non lues</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <User className="w-8 h-8 text-[rgb(var(--info))]" />
            </div>
            <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{personalCount}</p>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">Personnelles</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-8 h-8 text-[rgb(var(--success))]" />
            </div>
            <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{globalCount}</p>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">Globales</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-3 p-4 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
            <span className="text-sm font-medium text-[rgb(var(--foreground))]">Filtrer :</span>
          </div>

          {/* Filtre type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.3)] rounded-lg text-sm text-[rgb(var(--foreground))]"
          >
            <option value="all">Tous les types</option>
            <option value="cours">Cours</option>
            <option value="evaluation">Évaluations</option>
            <option value="message">Messages</option>
            <option value="administratif">Administratif</option>
            <option value="reussite">Réussites</option>
          </select>

          {/* Filtre scope */}
          <select
            value={filterScope}
            onChange={(e) => setFilterScope(e.target.value)}
            className="px-3 py-1.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.3)] rounded-lg text-sm text-[rgb(var(--foreground))]"
          >
            <option value="all">Toutes les portées</option>
            <option value="personnel">Personnelles</option>
            <option value="global">Globales</option>
          </select>

          {/* Toggle non lues */}
          <button
            onClick={() => setShowOnlyUnread(!showOnlyUnread)}
            className={`px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${
              showOnlyUnread
                ? 'bg-[rgb(var(--accent))] border-[rgb(var(--accent))] text-[rgb(var(--primary))]'
                : 'bg-[rgb(var(--secondary))] border-[rgba(var(--border),0.3)] text-[rgb(var(--foreground))] hover:bg-[rgba(var(--accent),0.1)]'
            }`}
          >
            Non lues uniquement
          </button>

          <div className="ml-auto text-sm text-[rgb(var(--muted-foreground))]">
            {filteredNotifications.length} notification{filteredNotifications.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl">
            <Bell className="w-16 h-16 text-[rgb(var(--muted-foreground))] mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-2">
              Aucune notification
            </h3>
            <p className="text-[rgb(var(--muted-foreground))]">
              {showOnlyUnread
                ? 'Toutes vos notifications sont à jour !'
                : 'Vous n\'avez aucune notification pour le moment.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const dateCreation = new Date(notification.creeLe)
            const dateStr = dateCreation.toLocaleDateString('fr-FR')
            const heureStr = dateCreation.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

            return (
              <div
                key={notification.idNotification}
                id={`notification-${notification.idNotification}`}
                className={`p-4 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl hover:shadow-md transition-all ${getPriorityBorder(
                  notification.priorite
                )} ${!notification.lue ? 'bg-[rgba(var(--accent),0.02)]' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icône type */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(notification.categorie)}`}>
                    {getTypeIcon(notification.categorie)}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-base font-semibold text-[rgb(var(--foreground))] ${!notification.lue ? 'font-bold' : ''}`}>
                            {notification.titre}
                          </h3>
                          {!notification.lue && (
                            <span className="w-2 h-2 bg-[rgb(var(--accent))] rounded-full animate-pulse flex-shrink-0" />
                          )}
                        </div>
                        {notification.sourceAgent && (
                          <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">
                            De: {notification.sourceAgent}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Badge audience */}
                        {notification.audience === 'TOUS' ? (
                          <span className="px-2 py-1 bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))] text-xs rounded flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Global
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-[rgba(var(--info),0.1)] text-[rgb(var(--info))] text-xs rounded flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Personnel
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-[rgb(var(--muted-foreground))] mb-3">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-[rgb(var(--muted-foreground))]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {heureStr}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {notification.lienAction && (
                          <a
                            href={notification.lienAction}
                            className="px-3 py-1.5 bg-[rgba(var(--accent),0.1)] border border-[rgba(var(--accent),0.2)] text-[rgb(var(--accent))] rounded-lg text-xs font-medium hover:bg-[rgba(var(--accent),0.2)] transition-colors"
                          >
                            Voir
                          </a>
                        )}
                        {!notification.lue && (
                          <button
                            onClick={() => markAsRead(notification.idNotification)}
                            className="p-1.5 hover:bg-[rgba(var(--accent),0.1)] rounded transition-colors"
                            title="Marquer comme lu"
                          >
                            <Eye className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.idNotification)}
                          className="p-1.5 hover:bg-[rgba(var(--error),0.1)] rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Info badge priorités */}
      {filteredNotifications.length > 0 && (
        <div className="mt-6 p-4 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-xl">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Légende des priorités
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-[rgb(var(--muted-foreground))]">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-[rgb(var(--error))] rounded" />
                  <span>Priorité haute - Action requise</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-[rgb(var(--accent))] rounded" />
                  <span>Priorité normale - Informative</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-[rgba(var(--border),0.5)] rounded" />
                  <span>Priorité basse - Optionnelle</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
