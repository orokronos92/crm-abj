/**
 * Layout principal pour les dashboards
 * Intègre sidebar et header
 */

'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Sidebar } from './sidebar'
import { Bell, Search, Settings, LogOut, CheckCircle, AlertCircle, Info, Clock, XCircle, Sparkles, FileText, Send, Calendar, MessageSquare, X, ArrowUp, Palette, Moon, Sun, RefreshCw } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useNotifications } from '@/hooks/use-notifications'
import { NotificationSkeleton } from '@/components/ui/notification-skeleton'

interface DashboardLayoutProps {
  children: React.ReactNode
}

// Mock notifications Marjorie
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'success',
    titre: 'Devis envoyé avec succès',
    message: 'Devis pour Juliette Rimbo (JURI102025) envoyé par email. Montant: 8 400€ - Formation CAP ATBJ.',
    date: '2024-02-07 14:32',
    lu: false,
    icon: 'send',
  },
  {
    id: 2,
    type: 'warning',
    titre: 'Demande annulée - Devis déjà envoyé',
    message: 'Le devis pour Marie Dumitru (DUMI15091992) a déjà été envoyé le 05/02. Statut actuel: En attente signature.',
    date: '2024-02-07 11:15',
    lu: false,
    icon: 'alert',
  },
  {
    id: 3,
    type: 'info',
    titre: '3 nouveaux prospects cette semaine',
    message: 'Sophie Martin (CAP ATBJ), Lucas Dubois (Sertissage N1), Emma Rousseau (Joaillerie Création).',
    date: '2024-02-07 09:00',
    lu: true,
    icon: 'info',
  },
  {
    id: 4,
    type: 'reminder',
    titre: 'Entretien candidat prévu demain',
    message: 'Entretien téléphonique avec Marc Durand (MADU12022000) programmé demain 14h00. Dossier complet reçu.',
    date: '2024-02-06 18:30',
    lu: true,
    icon: 'calendar',
  },
  {
    id: 5,
    type: 'error',
    titre: 'Document manquant - Contrat non généré',
    message: 'Impossible de générer le contrat pour CLAR08031998. Document requis manquant: Justificatif de financement OPCO.',
    date: '2024-02-06 15:45',
    lu: true,
    icon: 'error',
  },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [darkMode, setDarkMode] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMarjorieChat, setShowMarjorieChat] = useState(false)
  const [showSettingsCanvas, setShowSettingsCanvas] = useState(false)
  const [marjorieMessage, setMarjorieMessage] = useState('')

  // Déterminer le rôle basé sur le path
  const getRoleFromPath = () => {
    if (pathname?.includes('/admin')) return 'admin'
    if (pathname?.includes('/formateur')) return 'professeur'
    if (pathname?.includes('/eleve')) return 'eleve'
    return 'admin' // Par défaut
  }

  // Utiliser le hook pour les vraies notifications
  const {
    notifications,
    counts,
    loading: notificationsLoading,
    refreshing: notificationsRefreshing, // État distinct pour l'actualisation
    markAsRead,
    markAllAsRead,
    refresh: refreshNotifications
  } = useNotifications({
    limit: 10, // Limiter à 10 notifications dans le dropdown
    nonLuesSeulement: false, // Afficher toutes les notifications
    role: getRoleFromPath() // Passer le rôle pour filtrage approprié
  })

  // Utiliser getRoleFromPath de manière cohérente pour éviter le mélange
  const userRole = getRoleFromPath()
  const userName = `${session?.user?.prenom || ''} ${session?.user?.nom || ''}`.trim()

  const notificationsNonLues = counts.nonLues

  // Masquer le bouton Marjorie sur la page Marjorie elle-même
  const showMarjorieButton = !pathname?.includes('/marjorie')

  const handleSendMessage = () => {
    if (marjorieMessage.trim()) {
      // TODO: Envoyer le message à Marjorie via webhook n8n
      console.log('Message envoyé à Marjorie:', marjorieMessage)
      setMarjorieMessage('')
      // Simuler une réponse
      setTimeout(() => {
        alert('Marjorie a bien reçu votre demande. Vous recevrez une notification dès qu\'elle aura traité votre requête.')
        setShowMarjorieChat(false)
      }, 500)
    }
  }

  const getNotificationIcon = (iconType: string) => {
    switch (iconType) {
      case 'send': return Send
      case 'alert': return AlertCircle
      case 'info': return Info
      case 'calendar': return Calendar
      case 'error': return XCircle
      default: return Bell
    }
  }

  const getNotificationColors = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-[rgba(var(--success),0.1)]',
          border: 'border-[rgba(var(--success),0.3)]',
          icon: 'text-[rgb(var(--success))]',
          iconBg: 'bg-[rgba(var(--success),0.15)]',
        }
      case 'warning':
        return {
          bg: 'bg-[rgba(var(--warning),0.1)]',
          border: 'border-[rgba(var(--warning),0.3)]',
          icon: 'text-[rgb(var(--warning))]',
          iconBg: 'bg-[rgba(var(--warning),0.15)]',
        }
      case 'error':
        return {
          bg: 'bg-[rgba(var(--error),0.1)]',
          border: 'border-[rgba(var(--error),0.3)]',
          icon: 'text-[rgb(var(--error))]',
          iconBg: 'bg-[rgba(var(--error),0.15)]',
        }
      case 'reminder':
        return {
          bg: 'bg-[rgba(var(--accent),0.1)]',
          border: 'border-[rgba(var(--accent),0.3)]',
          icon: 'text-[rgb(var(--accent))]',
          iconBg: 'bg-[rgba(var(--accent),0.15)]',
        }
      default:
        return {
          bg: 'bg-[rgba(var(--info),0.1)]',
          border: 'border-[rgba(var(--info),0.3)]',
          icon: 'text-[rgb(var(--info))]',
          iconBg: 'bg-[rgba(var(--info),0.15)]',
        }
    }
  }

  // Mapper les catégories/priorités vers les types d'affichage
  const mapNotificationType = (categorie: string, priorite: string) => {
    if (priorite === 'URGENTE') return 'error'
    if (priorite === 'HAUTE') return 'warning'

    switch (categorie) {
      case 'DEVIS':
      case 'DOCUMENT':
      case 'FINANCE':
        return 'success'
      case 'ALERTE':
      case 'SYSTEM':
        return 'error'
      case 'PLANNING':
      case 'EVALUATION':
        return 'reminder'
      default:
        return 'info'
    }
  }

  // Mapper les catégories vers les icônes
  const mapNotificationIcon = (categorie: string) => {
    switch (categorie) {
      case 'DEVIS': return 'send'
      case 'DOCUMENT': return 'info'
      case 'PLANNING': return 'calendar'
      case 'ALERTE':
      case 'SYSTEM': return 'alert'
      case 'FINANCE':
      case 'FINANCEMENT': return 'info'
      default: return 'info'
    }
  }

  return (
    <>
      {/* Layout principal */}
      <div className="flex min-h-screen bg-[rgb(var(--background))]">
        {/* Sidebar */}
        <Sidebar role={userRole as any} userName={userName} />

        {/* Main content */}
        <div className="flex-1 lg:ml-64">
          {/* Header */}
          <header className="sticky top-0 z-30 h-16 bg-[rgb(var(--card))]/80 backdrop-blur-xl border-b border-[rgba(var(--accent),0.1)]">
            <div className="flex h-full items-center justify-between px-6">
              {/* Barre de recherche */}
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.1)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent),0.2)] transition-all"
                  />
                </div>
              </div>

              {/* Actions header */}
              <div className="flex items-center gap-4 ml-4">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors"
                  >
                    <Bell className="w-5 h-5 text-[rgb(var(--foreground))]" />
                    {notificationsNonLues > 0 && (
                      <>
                        <span className="absolute top-1 right-1 w-2 h-2 bg-[rgb(var(--accent))] rounded-full animate-pulse" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-full flex items-center justify-center text-xs font-bold">
                          {notificationsNonLues}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Popup notifications */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-96 max-h-[600px] overflow-y-auto bg-[rgb(var(--card))] border border-[rgba(var(--accent),0.2)] rounded-xl shadow-2xl z-50 animate-fadeIn">
                      {/* Header popup */}
                      <div className="sticky top-0 bg-[rgb(var(--card))] p-4 border-b border-[rgba(var(--border),0.3)] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-[rgb(var(--accent))]" />
                          <h3 className="font-semibold text-[rgb(var(--foreground))]">
                            Notifications Marjorie
                          </h3>
                        </div>
                        {notificationsNonLues > 0 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] border border-[rgba(var(--accent),0.3)]">
                            {notificationsNonLues} nouvelle{notificationsNonLues > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* Liste notifications */}
                      <div className="p-2 space-y-2 relative">
                        {/* Overlay de chargement subtil pendant le refresh */}
                        {notificationsRefreshing && (
                          <div className="absolute inset-0 bg-[rgb(var(--card))]/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                            <div className="bg-[rgb(var(--card))] border border-[rgba(var(--accent),0.2)] rounded-lg px-4 py-2 flex items-center gap-2">
                              <RefreshCw className="w-4 h-4 text-[rgb(var(--accent))] animate-spin" />
                              <span className="text-sm text-[rgb(var(--foreground))]">Actualisation...</span>
                            </div>
                          </div>
                        )}

                        {notificationsLoading && notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--accent))]"></div>
                            <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">Chargement...</p>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell className="w-12 h-12 mx-auto text-[rgb(var(--muted-foreground))] opacity-50" />
                            <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">Aucune notification</p>
                          </div>
                        ) : (
                          notifications.map((notif) => {
                            const notifType = mapNotificationType(notif.categorie, notif.priorite)
                            const colors = getNotificationColors(notifType)
                            const IconComponent = getNotificationIcon(mapNotificationIcon(notif.categorie))

                            return (
                              <div
                                key={notif.idNotification}
                                onClick={() => {
                                  if (!notif.lue) {
                                    markAsRead(notif.idNotification)
                                  }
                                  // Rediriger vers la page notifications avec l'ID de la notification dans l'URL
                                  // Rediriger selon le rôle
                                  const role = getRoleFromPath()
                                  const basePath = role === 'professeur' ? '/formateur' : role === 'eleve' ? '/eleve' : '/admin'
                                  window.location.href = `${basePath}/notifications?highlight=${notif.idNotification}`
                                  setShowNotifications(false) // Fermer le popup
                                }}
                                className={`p-4 rounded-lg border ${colors.bg} ${colors.border} hover:bg-opacity-80 transition-all cursor-pointer ${
                                  !notif.lue ? 'ring-2 ring-[rgba(var(--accent),0.3)]' : ''
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {/* Icône */}
                                  <div className={`w-10 h-10 rounded-lg ${colors.iconBg} flex items-center justify-center flex-shrink-0`}>
                                    <IconComponent className={`w-5 h-5 ${colors.icon}`} />
                                  </div>

                                  {/* Contenu */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <h4 className={`font-semibold text-sm ${colors.icon}`}>
                                        {notif.titre}
                                      </h4>
                                      {!notif.lue && (
                                        <div className="w-2 h-2 bg-[rgb(var(--accent))] rounded-full flex-shrink-0 mt-1" />
                                      )}
                                    </div>
                                    <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed">
                                      {notif.message}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Clock className="w-3 h-3 text-[rgb(var(--muted-foreground))]" />
                                      <p className="text-xs text-[rgb(var(--muted-foreground))]">
                                        {new Date(notif.creeLe).toLocaleString('fr-FR', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>

                    </div>
                  )}
                </div>

                {/* Paramètres */}
                <button
                  onClick={() => setShowSettingsCanvas(!showSettingsCanvas)}
                  className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors group relative"
                >
                  <Settings className="w-5 h-5 text-[rgb(var(--foreground))] group-hover:rotate-90 transition-transform duration-300" />
                </button>

                {/* User menu avec déconnexion */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowUserMenu(!showUserMenu)
                    }}
                    className="flex items-center gap-3 pl-4 border-l border-[rgba(var(--border),0.3)] hover:bg-[rgba(var(--accent),0.05)] rounded-lg p-2 transition-colors"
                  >
                    <div className="text-right">
                      <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                        {userName || 'Utilisateur'}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">
                        {userRole === 'admin' ? 'Administrateur' :
                          userRole === 'professeur' ? 'Formateur' : 'Élève'}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center text-[rgb(var(--primary))] font-bold">
                      {userName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </button>

                  {/* Menu déroulant */}
                  {showUserMenu && session && (
                    <div className="absolute right-0 mt-2 w-64 bg-[rgb(var(--card))] border border-[rgba(var(--accent),0.2)] rounded-lg shadow-xl z-50 animate-fadeIn">
                      <div className="p-4 border-b border-[rgba(var(--border),0.3)]">
                        <p className="text-sm font-medium text-[rgb(var(--foreground))]">{userName}</p>
                        <p className="text-xs text-[rgb(var(--muted-foreground))]">{session.user.email}</p>
                      </div>

                      {/* Info compte démo */}
                      <div className="p-3 bg-[rgba(var(--accent),0.05)] border-b border-[rgba(var(--border),0.3)]">
                        <p className="text-xs text-[rgb(var(--accent))]">Mode démo</p>
                        <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                          Comptes disponibles :
                        </p>
                        <ul className="text-xs text-[rgb(var(--muted-foreground))] mt-2 space-y-1">
                          <li>• admin@abj.fr (Admin)</li>
                          <li>• formateur@abj.fr (Formateur)</li>
                          <li>• eleve@abj.fr (Élève)</li>
                        </ul>
                      </div>

                      <div className="p-2">
                        <button
                          onClick={() => {
                            sessionStorage.removeItem('hasSeenSplash')
                            signOut({ callbackUrl: '/connexion' })
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[rgba(var(--error),0.1)] transition-colors group"
                        >
                          <LogOut className="w-4 h-4 text-[rgb(var(--error))]" />
                          <span className="text-sm text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--error))]">
                            Se déconnecter
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page content avec scroll container pour permettre sticky headers dans les pages */}
          <main className="h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-6 animate-fadeIn">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Bouton flottant Marjorie (partout sauf sur la page Marjorie) */}
      {showMarjorieButton && (
        <button
          onClick={() => setShowMarjorieChat(!showMarjorieChat)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all flex items-center justify-center group animate-pulse-gold z-40"
        >
          <MessageSquare className="w-7 h-7 text-[rgb(var(--primary))]" />
          <span className="absolute right-full mr-4 px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--accent),0.2)] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[rgb(var(--accent))]" />
              <span className="text-sm font-medium text-[rgb(var(--foreground))]">Demander à Marjorie</span>
            </div>
          </span>
        </button>
      )}

      {/* Bannière chat Marjorie */}
      {showMarjorieChat && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-slideUp">
          <div className="bg-[rgb(var(--card))] border-t-2 border-[rgb(var(--accent))] shadow-2xl">
            <div className="max-w-4xl mx-auto p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[rgb(var(--primary))]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[rgb(var(--foreground))]">Marjorie</h3>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">Assistante IA • En ligne</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMarjorieChat(false)}
                  className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                </button>
              </div>

              {/* Message d'aide */}
              <div className="mb-3 p-3 bg-gradient-to-r from-[rgba(var(--accent),0.1)] to-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-lg">
                <p className="text-sm text-[rgb(var(--foreground))]">
                  💬 <strong>Demandez-moi n'importe quoi !</strong>
                </p>
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                  Envoi de devis, génération de documents, création de sessions, relance candidats, etc.
                </p>
              </div>

              {/* Input message */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <textarea
                    value={marjorieMessage}
                    onChange={(e) => setMarjorieMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Ex: Envoie un devis à Juliette Rimbo (JURI102025)..."
                    rows={3}
                    className="w-full px-4 py-3 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-xl text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)] resize-none"
                  />
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1 ml-1">
                    Entrée pour envoyer • Shift+Entrée pour nouvelle ligne
                  </p>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!marjorieMessage.trim()}
                  className="px-6 py-3 h-[76px] bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] text-[rgb(var(--primary))] rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Paramètres */}
      {showSettingsCanvas && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-50 animate-fadeIn"
            onClick={() => setShowSettingsCanvas(false)}
          />

          {/* Canvas panneau latéral */}
          <div className="fixed top-0 right-0 h-full w-96 bg-[rgb(var(--card))] border-l border-[rgba(var(--accent),0.2)] shadow-2xl z-50 animate-slideInRight overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-[rgb(var(--card))] p-6 border-b border-[rgba(var(--border),0.3)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center">
                    <Settings className="w-5 h-5 text-[rgb(var(--primary))]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">Paramètres</h2>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">Personnalisez votre interface</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettingsCanvas(false)}
                  className="p-2 hover:bg-[rgba(var(--accent),0.1)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-6">
              {/* Section Apparence */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5 text-[rgb(var(--accent))]" />
                  <h3 className="font-semibold text-[rgb(var(--foreground))]">Apparence</h3>
                </div>

                {/* Mode sombre/clair */}
                <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.3)]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {darkMode ? (
                        <Moon className="w-4 h-4 text-[rgb(var(--accent))]" />
                      ) : (
                        <Sun className="w-4 h-4 text-[rgb(var(--accent))]" />
                      )}
                      <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                        Mode sombre
                      </span>
                    </div>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        darkMode ? 'bg-[rgb(var(--accent))]' : 'bg-[rgba(var(--muted-foreground),0.3)]'
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          darkMode ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">
                    {darkMode ? 'Interface en mode sombre' : 'Interface en mode clair'}
                  </p>
                </div>

                {/* Palette de couleurs */}
                <div className="mt-4 p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.3)]">
                  <div className="mb-3">
                    <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                      Couleur d'accent
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {/* Couleurs prédéfinies */}
                    {[
                      { name: 'Or ABJ', color: '#D4AF37' },
                      { name: 'Bleu', color: '#3B82F6' },
                      { name: 'Vert', color: '#10B981' },
                      { name: 'Violet', color: '#8B5CF6' },
                      { name: 'Rose', color: '#EC4899' },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        className="w-full aspect-square rounded-lg border-2 border-transparent hover:border-white transition-colors"
                        style={{ backgroundColor: preset.color }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-3">
                    Fonctionnalité à venir
                  </p>
                </div>
              </div>

              {/* Badge "Inactif" */}
              <div className="p-4 bg-gradient-to-r from-[rgba(var(--warning),0.1)] to-[rgba(var(--warning),0.05)] border border-[rgba(var(--warning),0.2)] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-[rgb(var(--warning))]" />
                  <span className="text-sm font-semibold text-[rgb(var(--warning))]">
                    Fonctionnalité en développement
                  </span>
                </div>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  Les paramètres de personnalisation seront bientôt disponibles. Vous pourrez personnaliser les couleurs, le thème, les notifications et plus encore.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}