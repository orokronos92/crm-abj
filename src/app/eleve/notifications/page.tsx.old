/**
 * Page Notifications Élève
 * Notifications personnelles et globales
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Trophy,
  Calendar,
  FileText,
  MessageSquare,
  Clock,
  Check,
  X,
  Filter,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  Users,
  User,
  Sparkles,
  BookOpen,
  Award,
  AlertTriangle,
} from 'lucide-react'

// Types de notifications
type NotificationType = 'cours' | 'evaluation' | 'administratif' | 'message' | 'systeme' | 'reussite'
type NotificationScope = 'personnel' | 'global'
type NotificationPriority = 'haute' | 'normale' | 'basse'

interface Notification {
  id: number
  titre: string
  message: string
  type: NotificationType
  scope: NotificationScope
  priority: NotificationPriority
  lu: boolean
  date: string
  heure: string
  expediteur?: string
  action?: {
    label: string
    href?: string
  }
}

// Données mockées - Notifications mixtes (personnelles + globales)
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    titre: 'Nouvelle évaluation disponible',
    message: 'Votre évaluation de Sertissage a été corrigée. Note : 16/20',
    type: 'evaluation',
    scope: 'personnel',
    priority: 'normale',
    lu: false,
    date: '2024-02-08',
    heure: '14:30',
    expediteur: 'M. Laurent - Formateur',
    action: { label: 'Voir la note', href: '/eleve/evaluations' },
  },
  {
    id: 2,
    titre: 'Fermeture exceptionnelle',
    message: 'L\'académie sera fermée le vendredi 16 février pour inventaire annuel. Reprise des cours le lundi 19.',
    type: 'administratif',
    scope: 'global',
    priority: 'haute',
    lu: false,
    date: '2024-02-08',
    heure: '09:15',
    expediteur: 'Direction ABJ',
  },
  {
    id: 3,
    titre: 'Badge "Designer Pro" débloqué !',
    message: 'Félicitations ! Vous avez terminé le module Dessin technique avec une moyenne de 17/20.',
    type: 'reussite',
    scope: 'personnel',
    priority: 'normale',
    lu: false,
    date: '2024-02-07',
    heure: '16:45',
    action: { label: 'Voir mes badges', href: '/eleve/cours' },
  },
  {
    id: 4,
    titre: 'Modification planning',
    message: 'Le cours de Gemmologie du 12/02 (14h-17h) est déplacé au 13/02 (9h-12h).',
    type: 'cours',
    scope: 'personnel',
    priority: 'haute',
    lu: true,
    date: '2024-02-07',
    heure: '11:20',
    expediteur: 'Mme Lambert - Formatrice',
    action: { label: 'Voir planning', href: '/eleve/planning' },
  },
  {
    id: 5,
    titre: 'Nouveau support de cours disponible',
    message: 'Le guide complet "Techniques de polissage avancées" est maintenant disponible dans votre bibliothèque.',
    type: 'cours',
    scope: 'global',
    priority: 'basse',
    lu: true,
    date: '2024-02-06',
    heure: '18:00',
    action: { label: 'Télécharger', href: '/eleve/cours' },
  },
  {
    id: 6,
    titre: 'Message de votre formateur',
    message: 'Excellent travail sur votre dernier projet ! Continuez comme ça.',
    type: 'message',
    scope: 'personnel',
    priority: 'normale',
    lu: true,
    date: '2024-02-06',
    heure: '15:30',
    expediteur: 'M. Laurent - Formateur',
    action: { label: 'Répondre', href: '/eleve/marjorie' },
  },
  {
    id: 7,
    titre: 'Portes ouvertes ABJ',
    message: 'Participez à nos portes ouvertes le 25 février ! Invitez vos proches à découvrir nos formations.',
    type: 'administratif',
    scope: 'global',
    priority: 'basse',
    lu: true,
    date: '2024-02-05',
    heure: '10:00',
    expediteur: 'Direction ABJ',
  },
  {
    id: 8,
    titre: 'Rappel : Évaluation à venir',
    message: 'N\'oubliez pas votre évaluation pratique de Sertissage le 15/02 à 9h (Coeff. 3).',
    type: 'evaluation',
    scope: 'personnel',
    priority: 'haute',
    lu: true,
    date: '2024-02-04',
    heure: '08:00',
    action: { label: 'Préparer', href: '/eleve/cours' },
  },
]

export default function EleveNotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all')
  const [filterScope, setFilterScope] = useState<NotificationScope | 'all'>('all')
  const [showOnlyUnread, setShowOnlyUnread] = useState(false)

  // Statistiques
  const totalNotifications = notifications.length
  const unreadCount = notifications.filter((n) => !n.lu).length
  const personalCount = notifications.filter((n) => n.scope === 'personnel').length
  const globalCount = notifications.filter((n) => n.scope === 'global').length

  // Filtrage
  const filteredNotifications = notifications
    .filter((n) => filterType === 'all' || n.type === filterType)
    .filter((n) => filterScope === 'all' || n.scope === filterScope)
    .filter((n) => !showOnlyUnread || !n.lu)

  // Actions
  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, lu: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, lu: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  // Styles par type
  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'cours':
        return <BookOpen className="w-5 h-5" />
      case 'evaluation':
        return <Award className="w-5 h-5" />
      case 'administratif':
        return <AlertCircle className="w-5 h-5" />
      case 'message':
        return <MessageSquare className="w-5 h-5" />
      case 'systeme':
        return <Info className="w-5 h-5" />
      case 'reussite':
        return <Trophy className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'cours':
        return 'text-[rgb(var(--info))] bg-[rgba(var(--info),0.1)]'
      case 'evaluation':
        return 'text-[rgb(var(--accent))] bg-[rgba(var(--accent),0.1)]'
      case 'administratif':
        return 'text-[rgb(var(--warning))] bg-[rgba(var(--warning),0.1)]'
      case 'message':
        return 'text-[rgb(var(--success))] bg-[rgba(var(--success),0.1)]'
      case 'systeme':
        return 'text-[rgb(var(--muted-foreground))] bg-[rgba(var(--muted-foreground),0.1)]'
      case 'reussite':
        return 'text-[rgb(var(--accent))] bg-[rgba(var(--accent),0.1)]'
    }
  }

  const getPriorityBorder = (priority: NotificationPriority) => {
    switch (priority) {
      case 'haute':
        return 'border-l-4 border-l-[rgb(var(--error))]'
      case 'normale':
        return 'border-l-4 border-l-[rgb(var(--accent))]'
      case 'basse':
        return 'border-l-4 border-l-[rgba(var(--border),0.5)]'
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
            onChange={(e) => setFilterType(e.target.value as NotificationType | 'all')}
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
            onChange={(e) => setFilterScope(e.target.value as NotificationScope | 'all')}
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
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl hover:shadow-md transition-all ${getPriorityBorder(
                notification.priority
              )} ${!notification.lu ? 'bg-[rgba(var(--accent),0.02)]' : ''}`}
            >
              <div className="flex items-start gap-4">
                {/* Icône type */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(notification.type)}`}>
                  {getTypeIcon(notification.type)}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-base font-semibold text-[rgb(var(--foreground))] ${!notification.lu ? 'font-bold' : ''}`}>
                          {notification.titre}
                        </h3>
                        {!notification.lu && (
                          <span className="w-2 h-2 bg-[rgb(var(--accent))] rounded-full animate-pulse flex-shrink-0" />
                        )}
                      </div>
                      {notification.expediteur && (
                        <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">
                          {notification.expediteur}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Badge scope */}
                      {notification.scope === 'global' ? (
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
                        {notification.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {notification.heure}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {notification.action && (
                        <button className="px-3 py-1.5 bg-[rgba(var(--accent),0.1)] border border-[rgba(var(--accent),0.2)] text-[rgb(var(--accent))] rounded-lg text-xs font-medium hover:bg-[rgba(var(--accent),0.2)] transition-colors">
                          {notification.action.label}
                        </button>
                      )}
                      {!notification.lu && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1.5 hover:bg-[rgba(var(--accent),0.1)] rounded transition-colors"
                          title="Marquer comme lu"
                        >
                          <Eye className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
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
          ))
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
