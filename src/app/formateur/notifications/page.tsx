/**
 * Page Notifications Formateur avec SSE
 * Orchestration des composants pour afficher les notifications
 */

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useNotifications } from '@/hooks/use-notifications'
import { NotificationStats } from '@/components/formateur/NotificationStats'
import { NotificationFilters } from '@/components/formateur/NotificationFilters'
import { NotificationCard } from '@/components/formateur/NotificationCard'
import { Bell, CheckCheck } from 'lucide-react'

// Type pour les filtres
type NotifFilter = 'TOUTES' | 'NON_LUES' | 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE'

export default function NotificationsFormateurPage() {
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('highlight')

  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<NotifFilter>('TOUTES')
  const [categorieFilter, setCategorieFilter] = useState<string>('TOUTES')

  // Hook avec SSE activé - détection automatique du rôle formateur
  const {
    notifications,
    counts,
    loading,
    sseConnected,
    markAsRead,
    markAllAsRead,
    executeAction
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

  // Filtrage local
  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = notif.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.categorie.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filter === 'TOUTES' ? true :
      filter === 'NON_LUES' ? !notif.lue :
      notif.priorite === filter

    const matchesCategorie = categorieFilter === 'TOUTES' ? true :
      notif.categorie === categorieFilter

    return matchesSearch && matchesFilter && matchesCategorie
  })

  const toggleLu = async (id: number) => {
    const notif = notifications.find(n => n.idNotification === id)
    if (notif && !notif.lue) {
      await markAsRead(id)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">Mes Notifications</h1>
            <p className="text-[rgb(var(--muted-foreground))] mt-1">
              Alertes et informations concernant vos sessions et élèves
              {sseConnected && (
                <span className="ml-2 text-xs text-[rgb(var(--success))]">
                  ● Temps réel activé
                </span>
              )}
            </p>
          </div>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] hover:bg-[rgba(var(--accent),0.1)] transition-all flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            Tout marquer lu
          </button>
        </div>

        {/* Stats */}
        <NotificationStats counts={counts} />

        {/* Filtres */}
        <NotificationFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filter={filter}
          onFilterChange={(value) => setFilter(value as NotifFilter)}
          categorieFilter={categorieFilter}
          onCategorieChange={setCategorieFilter}
        />

        {/* Liste notifications */}
        <div className="space-y-3">
          {loading && notifications.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 border-4 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg text-[rgb(var(--muted-foreground))]">
                Chargement des notifications...
              </p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <NotificationCard
                key={notif.idNotification}
                notification={notif}
                isHighlighted={highlightId && parseInt(highlightId) === notif.idNotification}
                onToggleRead={toggleLu}
                onExecuteAction={executeAction}
              />
            ))
          ) : (
            <div className="card p-12 text-center">
              <Bell className="w-16 h-16 text-[rgb(var(--muted-foreground))] mx-auto mb-4 opacity-50" />
              <p className="text-lg text-[rgb(var(--muted-foreground))]">
                {notifications.length === 0
                  ? "Aucune notification pour le moment"
                  : "Aucune notification ne correspond aux filtres sélectionnés"
                }
              </p>
              {notifications.length === 0 && (
                <p className="text-sm text-[rgb(var(--muted-foreground))] mt-2">
                  Les nouvelles alertes concernant vos sessions et élèves apparaîtront ici
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}