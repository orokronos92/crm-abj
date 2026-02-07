/**
 * Layout principal pour les dashboards
 * Intègre sidebar et header
 */

'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Sidebar } from './sidebar'
import { Bell, Search, Sun, Moon, LogOut, CheckCircle, AlertCircle, Info, Clock, XCircle, Sparkles, FileText, Send, Calendar, MessageSquare, X, ArrowUp } from 'lucide-react'
import { usePathname } from 'next/navigation'

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
  const [marjorieMessage, setMarjorieMessage] = useState('')

  const userRole = session?.user?.role || 'admin'
  const userName = `${session?.user?.prenom || ''} ${session?.user?.nom || ''}`.trim()

  const notificationsNonLues = MOCK_NOTIFICATIONS.filter(n => !n.lu).length

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
                      <div className="p-2 space-y-2">
                        {MOCK_NOTIFICATIONS.map((notif) => {
                          const colors = getNotificationColors(notif.type)
                          const IconComponent = getNotificationIcon(notif.icon)

                          return (
                            <div
                              key={notif.id}
                              className={`p-4 rounded-lg border ${colors.bg} ${colors.border} hover:bg-opacity-80 transition-all cursor-pointer ${
                                !notif.lu ? 'ring-2 ring-[rgba(var(--accent),0.3)]' : ''
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
                                    {!notif.lu && (
                                      <div className="w-2 h-2 bg-[rgb(var(--accent))] rounded-full flex-shrink-0 mt-1" />
                                    )}
                                  </div>
                                  <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed">
                                    {notif.message}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Clock className="w-3 h-3 text-[rgb(var(--muted-foreground))]" />
                                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                                      {notif.date}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Footer */}
                      <div className="sticky bottom-0 bg-[rgb(var(--card))] p-3 border-t border-[rgba(var(--border),0.3)]">
                        <button className="w-full px-4 py-2 bg-[rgb(var(--secondary))] hover:bg-[rgba(var(--accent),0.1)] rounded-lg text-sm font-medium text-[rgb(var(--foreground))] transition-all">
                          Voir toutes les notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Theme toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-[rgb(var(--foreground))]" />
                  ) : (
                    <Moon className="w-5 h-5 text-[rgb(var(--foreground))]" />
                  )}
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

          {/* Page content */}
          <main className="p-6">
            <div className="animate-fadeIn">
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
    </>
  )
}