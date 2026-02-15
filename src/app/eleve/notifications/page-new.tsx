/**
 * Page Notifications Élève
 * Notifications personnelles et globales avec SSE
 */

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useNotifications } from '@/hooks/use-notifications'
import {
  Bell, CheckCircle, AlertCircle, Info, Trophy,
  Calendar, FileText, MessageSquare, Clock,
  Filter, Eye, EyeOff, Users, User, Sparkles,
  BookOpen, Award, AlertTriangle, Search, CheckCheck,
  ClipboardCheck, Euro, GraduationCap
} from 'lucide-react'

type NotifFilter = 'TOUTES' | 'NON_LUES' | 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE'

export default function EleveNotificationsPage() {
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('highlight')

  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<NotifFilter>('TOUTES')
  const [categorieFilter, setCategorieFilter] = useState<string>('TOUTES')

  // Hook avec SSE - détection automatique du rôle élève
  const { notifications, counts, loading, sseConnected, markAsRead, markAllAsRead, executeAction } = useNotifications({
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
          setTimeout(() => element.classList.remove('animate-pulse-highlight'), 3000)
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
      filter === 'NON_LUES' ? !notif.lue : notif.priorite === filter
    const matchesCategorie = categorieFilter === 'TOUTES' ? true :
      notif.categorie === categorieFilter
    return matchesSearch && matchesFilter && matchesCategorie
  })

  const toggleLu = async (id: number) => {
    const notif = notifications.find(n => n.idNotification === id)
    if (notif && !notif.lue) await markAsRead(id)
  }

  const getCategorieIcon = (categorie: string) => {
    switch (categorie) {
      case 'COURS': return BookOpen
      case 'EVALUATION': return Award
      case 'PLANNING': return Calendar
      case 'DOCUMENT': return FileText
      case 'PAIEMENT': return Euro
      case 'SESSION': return Users
      case 'FORMATION': return GraduationCap
      case 'ALERTE': return AlertTriangle
      case 'MESSAGE': return MessageSquare
      case 'REUSSITE': return Trophy
      default: return Bell
    }
  }

  const getNotificationColors = (priorite: string) => {
    switch (priorite) {
      case 'URGENTE': return {
        bg: 'bg-[rgba(var(--error),0.1)]',
        border: 'border-[rgba(var(--error),0.3)]',
        icon: 'text-[rgb(var(--error))]',
        iconBg: 'bg-[rgba(var(--error),0.15)]',
      }
      case 'HAUTE': return {
        bg: 'bg-[rgba(var(--warning),0.1)]',
        border: 'border-[rgba(var(--warning),0.3)]',
        icon: 'text-[rgb(var(--warning))]',
        iconBg: 'bg-[rgba(var(--warning),0.15)]',
      }
      case 'NORMALE': return {
        bg: 'bg-[rgba(var(--success),0.1)]',
        border: 'border-[rgba(var(--success),0.3)]',
        icon: 'text-[rgb(var(--success))]',
        iconBg: 'bg-[rgba(var(--success),0.15)]',
      }
      case 'BASSE': return {
        bg: 'bg-[rgba(var(--info),0.1)]',
        border: 'border-[rgba(var(--info),0.3)]',
        icon: 'text-[rgb(var(--info))]',
        iconBg: 'bg-[rgba(var(--info),0.15)]',
      }
      default: return {
        bg: 'bg-[rgba(var(--accent),0.1)]',
        border: 'border-[rgba(var(--accent),0.3)]',
        icon: 'text-[rgb(var(--accent))]',
        iconBg: 'bg-[rgba(var(--accent),0.15)]',
      }
    }
  }

  const categoriesEleve = [
    'TOUTES', 'COURS', 'EVALUATION', 'PLANNING', 'DOCUMENT',
    'PAIEMENT', 'SESSION', 'FORMATION', 'MESSAGE', 'REUSSITE', 'ALERTE'
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">Mes Notifications</h1>
            <p className="text-[rgb(var(--muted-foreground))] mt-1">
              Informations importantes sur votre formation
              {sseConnected && (
                <span className="ml-2 text-xs text-[rgb(var(--success))]">
                  ● Temps réel activé
                </span>
              )}
            </p>
          </div>
          <button onClick={markAllAsRead}
            className="px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] hover:bg-[rgba(var(--accent),0.1)] transition-all flex items-center gap-2">
            <CheckCheck className="w-4 h-4" />
            Tout marquer lu
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Total</p>
                <p className="text-3xl font-bold text-[rgb(var(--foreground))] mt-1">{counts.total}</p>
              </div>
              <Bell className="w-8 h-8 text-[rgb(var(--accent))]" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Non lues</p>
                <p className="text-3xl font-bold text-[rgb(var(--accent))] mt-1">{counts.nonLues}</p>
              </div>
              <Sparkles className="w-8 h-8 text-[rgb(var(--accent))]" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Importantes</p>
                <p className="text-3xl font-bold text-[rgb(var(--error))] mt-1">{counts.urgentes}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-[rgb(var(--error))]" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">À traiter</p>
                <p className="text-3xl font-bold text-[rgb(var(--warning))] mt-1">{counts.actionsRequises}</p>
              </div>
              <ClipboardCheck className="w-8 h-8 text-[rgb(var(--warning))]" />
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="card p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
              <input type="text" placeholder="Rechercher dans mes notifications..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]" />
            </div>

            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
              <select value={categorieFilter} onChange={(e) => setCategorieFilter(e.target.value)}
                className="px-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none">
                {categoriesEleve.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'TOUTES' ? 'Toutes catégories' : cat.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
              <select value={filter} onChange={(e) => setFilter(e.target.value as NotifFilter)}
                className="px-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none">
                <option value="TOUTES">Toutes</option>
                <option value="NON_LUES">Non lues</option>
                <option value="URGENTE">Importantes</option>
                <option value="HAUTE">Haute priorité</option>
                <option value="NORMALE">Normale</option>
                <option value="BASSE">Basse priorité</option>
              </select>
            </div>
          </div>
        </div>

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
            filteredNotifications.map((notif) => {
              const colors = getNotificationColors(notif.priorite)
              const CategorieIcon = getCategorieIcon(notif.categorie)

              return (
                <div key={notif.idNotification} id={`notification-${notif.idNotification}`}
                  className={`card p-5 ${colors.bg} ${colors.border} ${
                    !notif.lue ? 'ring-2 ring-[rgba(var(--accent),0.3)]' : 'opacity-75'
                  } ${
                    highlightId && parseInt(highlightId) === notif.idNotification
                      ? 'ring-4 ring-[rgb(var(--accent))] shadow-lg shadow-[rgba(var(--accent),0.2)]'
                      : ''
                  } hover:opacity-100 transition-all cursor-pointer`}
                  onClick={() => {
                    if (!notif.lue) markAsRead(notif.idNotification)
                    if (notif.lienAction) window.location.href = notif.lienAction
                  }}>
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl ${colors.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <CategorieIcon className={`w-7 h-7 ${colors.icon}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 text-xs rounded-md ${colors.bg} ${colors.icon} border ${colors.border}`}>
                              {notif.categorie}
                            </span>
                            {notif.priorite === 'URGENTE' && (
                              <span className="px-2 py-0.5 text-xs rounded-md bg-[rgba(var(--error),0.2)] text-[rgb(var(--error))] border border-[rgba(var(--error),0.3)]">
                                IMPORTANT
                              </span>
                            )}
                          </div>
                          <h3 className={`text-lg font-semibold ${colors.icon}`}>{notif.titre}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); toggleLu(notif.idNotification) }}
                            className="p-2 hover:bg-[rgba(var(--accent),0.1)] rounded-lg transition-colors"
                            title={notif.lue ? 'Marquer non lu' : 'Marquer lu'}>
                            {notif.lue ? (
                              <EyeOff className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                            ) : (
                              <Eye className="w-5 h-5 text-[rgb(var(--accent))]" />
                            )}
                          </button>
                          {!notif.lue && (
                            <div className="w-3 h-3 bg-[rgb(var(--accent))] rounded-full animate-pulse" />
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-[rgb(var(--foreground))] leading-relaxed mb-3">{notif.message}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground))]">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(notif.creeLe).toLocaleString('fr-FR')}</span>
                          {notif.sourceAgent && (
                            <>
                              <span className="mx-1">•</span>
                              <User className="w-4 h-4" />
                              <span>{notif.sourceAgent === 'marjorie' ? 'Marjorie' :
                                     notif.sourceAgent === 'system' ? 'Système' :
                                     notif.sourceAgent}</span>
                            </>
                          )}
                        </div>

                        {notif.actionRequise && notif.typeAction && (
                          <button onClick={(e) => {
                              e.stopPropagation()
                              executeAction && executeAction(notif.idNotification, notif.typeAction || '')
                            }}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${colors.iconBg} ${colors.icon} hover:bg-opacity-80`}>
                            {notif.typeAction === 'TELECHARGER' ? 'Télécharger' :
                             notif.typeAction === 'VOIR' ? 'Voir' :
                             notif.typeAction === 'CONFIRMER' ? 'Confirmer' :
                             notif.typeAction === 'REPONDRE' ? 'Répondre' :
                             notif.typeAction}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="card p-12 text-center">
              <Bell className="w-16 h-16 text-[rgb(var(--muted-foreground))] mx-auto mb-4 opacity-50" />
              <p className="text-lg text-[rgb(var(--muted-foreground))]">
                {notifications.length === 0
                  ? "Aucune notification pour le moment"
                  : "Aucune notification ne correspond aux filtres sélectionnés"}
              </p>
              {notifications.length === 0 && (
                <p className="text-sm text-[rgb(var(--muted-foreground))] mt-2">
                  Vos nouvelles notes, changements de planning et messages apparaîtront ici
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}