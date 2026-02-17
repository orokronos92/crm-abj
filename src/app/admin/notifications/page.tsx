/**
 * Page Notifications complète avec SSE
 * Historique et gestion de toutes les notifications Marjorie en temps réel
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
  Clock,
  XCircle,
  Sparkles,
  Send,
  Calendar,
  Filter,
  Search,
  CheckCheck,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  Euro,
  UserPlus,
  Download,
  AlertTriangle,
  Target,
} from 'lucide-react'

// Types pour les filtres
type NotifFilter = 'TOUTES' | 'NON_LUES' | 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE'

// Mock notifications pour le développement (sera remplacé par les vraies)
const MOCK_NOTIFICATIONS_BACKUP = [
  // Aujourd'hui
  {
    id: 1,
    type: 'success',
    categorie: 'DEVIS',
    titre: 'Devis envoyé avec succès',
    message: 'Devis pour Juliette Rimbo (JURI102025) envoyé par email. Montant: 8 400€ - Formation CAP ATBJ. Le candidat a 14 jours pour signer électroniquement.',
    date: '2024-02-07 14:32',
    lu: false,
    icon: 'send',
    action_possible: 'Voir dossier',
  },
  {
    id: 2,
    type: 'warning',
    categorie: 'DEVIS',
    titre: 'Demande annulée - Devis déjà envoyé',
    message: 'Le devis pour Marie Dumitru (DUMI15091992) a déjà été envoyé le 05/02/2024. Statut actuel: En attente signature. Aucune action requise.',
    date: '2024-02-07 11:15',
    lu: false,
    icon: 'alert',
    action_possible: 'Relancer candidat',
  },
  {
    id: 3,
    type: 'info',
    categorie: 'PROSPECTS',
    titre: '3 nouveaux prospects cette semaine',
    message: 'Marie Leroy (CAP ATBJ - CPF), Lucas Dubois (Sertissage N1 - Personnel), Emma Rousseau (Joaillerie Création - OPCO). Emails de bienvenue envoyés automatiquement.',
    date: '2024-02-07 09:00',
    lu: true,
    icon: 'info',
    action_possible: 'Voir prospects',
  },

  // Hier
  {
    id: 4,
    type: 'reminder',
    categorie: 'ENTRETIEN',
    titre: 'Entretien candidat prévu demain',
    message: 'Entretien téléphonique avec Marc Durand (MADU12022000) programmé demain 14h00. Dossier complet reçu. Fiche candidat générée et disponible.',
    date: '2024-02-06 18:30',
    lu: true,
    icon: 'calendar',
    action_possible: 'Voir fiche candidat',
  },
  {
    id: 5,
    type: 'error',
    categorie: 'CONTRAT',
    titre: 'Document manquant - Contrat non généré',
    message: 'Impossible de générer le contrat pour Claire Martin (CLAR08031998). Document requis manquant: Justificatif de financement OPCO. Candidat relancé automatiquement.',
    date: '2024-02-06 15:45',
    lu: true,
    icon: 'error',
    action_possible: 'Voir documents',
  },
  {
    id: 6,
    type: 'success',
    categorie: 'INSCRIPTION',
    titre: 'Inscription validée - Nouveau élève',
    message: 'Sophie Fontaine (SOFO23041995) inscrite en CAP ATBJ - Session Mars 2024. Tous documents validés. Bienvenue envoyé. Planning transmis.',
    date: '2024-02-06 14:20',
    lu: true,
    icon: 'send',
    action_possible: 'Voir élève',
  },

  // Il y a 2 jours
  {
    id: 7,
    type: 'warning',
    categorie: 'DOSSIER',
    titre: 'Dossier bloqué depuis 15 jours',
    message: 'Le dossier de Thomas Petit (THPE15061998) est bloqué au statut "Dossier en cours" depuis 15 jours. Documents manquants: CNI recto/verso. Relance automatique envoyée.',
    date: '2024-02-05 10:00',
    lu: true,
    icon: 'alert',
    action_possible: 'Relancer candidat',
  },
  {
    id: 8,
    type: 'info',
    categorie: 'FINANCEMENT',
    titre: 'Accord OPCO reçu',
    message: 'Accord de prise en charge OPCO validé pour Antoine Barbier (ANBA18091993) - Sertissage N2. Montant: 6 300€. Reste à charge: 0€. Prêt pour inscription.',
    date: '2024-02-05 09:15',
    lu: true,
    icon: 'info',
    action_possible: 'Inscrire candidat',
  },

  // Il y a 3 jours
  {
    id: 9,
    type: 'success',
    categorie: 'SESSION',
    titre: 'Session CAO/DAO optimisée',
    message: 'Session CAO/DAO Avril 2024 : 6 inscrits / 8 places. Taux de remplissage optimal. Recommandation: Proposer places restantes aux 2 candidats en liste d\'attente.',
    date: '2024-02-04 16:30',
    lu: true,
    icon: 'send',
    action_possible: 'Voir session',
  },
  {
    id: 10,
    type: 'reminder',
    categorie: 'EVALUATION',
    titre: 'Évaluation formateur à programmer',
    message: 'Évaluation semestrielle de Michel Laurent prévue pour cette semaine (Indicateur Qualiopi 22). Dernière évaluation: 15/01/2024. Documents préparés.',
    date: '2024-02-04 11:00',
    lu: true,
    icon: 'calendar',
    action_possible: 'Programmer évaluation',
  },

  // Plus ancien
  {
    id: 11,
    type: 'info',
    categorie: 'OPPORTUNITE',
    titre: 'Opportunité nouvelle session Sertissage N1',
    message: '4 candidats acceptés + 2 en liste d\'attente pour Sertissage N1. Formateur Michel Laurent disponible semaine 35. Recommandation: Créer session Septembre 2024.',
    date: '2024-02-03 14:00',
    lu: true,
    icon: 'info',
    action_possible: 'Créer session',
  },
  {
    id: 12,
    type: 'warning',
    categorie: 'PAIEMENT',
    titre: 'Reste à charge non réglé',
    message: 'Maxime Barbier (élève CAP ATBJ) : Reste à charge de 1 200€ non réglé. Échéance: 01/02/2024. Candidat relancé. Possibilité mise en place échéancier.',
    date: '2024-02-02 10:30',
    lu: true,
    icon: 'alert',
    action_possible: 'Contacter élève',
  },
]

export default function NotificationsPage() {
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('highlight') // ID de la notification à mettre en évidence

  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<NotifFilter>('TOUTES')

  // Utiliser le hook avec SSE activé
  const {
    notifications: realNotifications,
    counts,
    loading,
    error,
    sseConnected,
    refresh,
    markAsRead,
    markAllAsRead,
    executeAction
  } = useNotifications({
    useSSE: true,
    limit: 100 // Charger plus de notifications pour la page dédiée
  })

  // Utiliser les vraies notifications ou le mock si pas de connexion
  const notifications = realNotifications.length > 0 ? realNotifications : []

  // Faire défiler jusqu'à la notification mise en évidence
  useEffect(() => {
    if (highlightId) {
      // Attendre un peu que le DOM soit prêt
      setTimeout(() => {
        const element = document.getElementById(`notification-${highlightId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Ajouter un effet visuel temporaire
          element.classList.add('animate-pulse-highlight')
          setTimeout(() => {
            element.classList.remove('animate-pulse-highlight')
          }, 3000) // Retirer l'animation après 3 secondes
        }
      }, 500)
    }
  }, [highlightId])

  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = notif.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.categorie.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filter === 'TOUTES' ? true :
      filter === 'NON_LUES' ? !notif.lue :
      notif.priorite === filter

    return matchesSearch && matchesFilter
  })

  const marquerToutLu = async () => {
    await markAllAsRead()
  }

  const supprimerLues = () => {
    // TODO: Implémenter suppression des notifications lues via API
    console.log('Suppression des notifications lues à implémenter')
  }

  const toggleLu = async (id: number) => {
    const notif = notifications.find(n => n.idNotification === id)
    if (notif && !notif.lue) {
      await markAsRead(id)
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

  const getNotificationColors = (priorite: string) => {
    switch (priorite) {
      case 'URGENTE':
        return {
          bg: 'bg-[rgba(var(--error),0.1)]',
          border: 'border-[rgba(var(--error),0.3)]',
          icon: 'text-[rgb(var(--error))]',
          iconBg: 'bg-[rgba(var(--error),0.15)]',
        }
      case 'HAUTE':
        return {
          bg: 'bg-[rgba(var(--warning),0.1)]',
          border: 'border-[rgba(var(--warning),0.3)]',
          icon: 'text-[rgb(var(--warning))]',
          iconBg: 'bg-[rgba(var(--warning),0.15)]',
        }
      case 'NORMALE':
        return {
          bg: 'bg-[rgba(var(--success),0.1)]',
          border: 'border-[rgba(var(--success),0.3)]',
          icon: 'text-[rgb(var(--success))]',
          iconBg: 'bg-[rgba(var(--success),0.15)]',
        }
      case 'BASSE':
        return {
          bg: 'bg-[rgba(var(--info),0.1)]',
          border: 'border-[rgba(var(--info),0.3)]',
          icon: 'text-[rgb(var(--info))]',
          iconBg: 'bg-[rgba(var(--info),0.15)]',
        }
      default:
        return {
          bg: 'bg-[rgba(var(--accent),0.1)]',
          border: 'border-[rgba(var(--accent),0.3)]',
          icon: 'text-[rgb(var(--accent))]',
          iconBg: 'bg-[rgba(var(--accent),0.15)]',
        }
    }
  }

  const getCategorieIcon = (categorie: string) => {
    switch (categorie) {
      case 'DEVIS': return Euro
      case 'CONTRAT': return FileText
      case 'INSCRIPTION': return UserPlus
      case 'DOSSIER': return FileText
      case 'FINANCEMENT': return Euro
      case 'SESSION': return Calendar
      case 'EVALUATION': return CheckCircle
      case 'OPPORTUNITE': return Target
      case 'PAIEMENT': return Euro
      case 'ENTRETIEN': return Calendar
      case 'PROSPECTS': return UserPlus
      default: return Bell
    }
  }

  const notificationsNonLues = counts.nonLues

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header/Stats/Filtres - partie fixe (ne scroll jamais) */}
        <div className="flex-shrink-0 space-y-4 pb-6 border-b border-[rgba(var(--border),0.2)]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">Notifications</h1>
              <p className="text-[rgb(var(--muted-foreground))] mt-1">
                Historique complet des retours et alertes de Marjorie
                {sseConnected && (
                  <span className="ml-2 text-xs text-[rgb(var(--success))]">
                    ● Temps réel activé
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={marquerToutLu}
                className="px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] hover:bg-[rgba(var(--accent),0.1)] transition-all flex items-center gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                Tout marquer lu
              </button>
              <button
                onClick={supprimerLues}
                className="px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--error))] hover:bg-[rgba(var(--error),0.1)] transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer lues
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-4">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">Total</p>
                  <p className="text-3xl font-bold text-[rgb(var(--foreground))] mt-1">
                    {counts.total}
                  </p>
                </div>
                <Bell className="w-8 h-8 text-[rgb(var(--accent))]" />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">Non lues</p>
                  <p className="text-3xl font-bold text-[rgb(var(--accent))] mt-1">
                    {counts.nonLues}
                  </p>
                </div>
                <Sparkles className="w-8 h-8 text-[rgb(var(--accent))]" />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">Urgentes</p>
                  <p className="text-3xl font-bold text-[rgb(var(--error))] mt-1">
                    {counts.urgentes}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-[rgb(var(--error))]" />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">Actions requises</p>
                  <p className="text-3xl font-bold text-[rgb(var(--warning))] mt-1">
                    {counts.actionsRequises}
                  </p>
                </div>
                <Target className="w-8 h-8 text-[rgb(var(--warning))]" />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">Connexion SSE</p>
                  <p className="text-3xl font-bold text-[rgb(var(--success))] mt-1">
                    {sseConnected ? 'Actif' : 'Inactif'}
                  </p>
                </div>
                {sseConnected ? (
                  <CheckCircle className="w-8 h-8 text-[rgb(var(--success))]" />
                ) : (
                  <XCircle className="w-8 h-8 text-[rgb(var(--error))]" />
                )}
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="card p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                <input
                  type="text"
                  placeholder="Rechercher dans les notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as NotifFilter)}
                  className="px-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                >
                  <option value="TOUTES">Toutes</option>
                  <option value="NON_LUES">Non lues</option>
                  <option value="URGENTE">Urgentes</option>
                  <option value="HAUTE">Haute priorité</option>
                  <option value="NORMALE">Normale</option>
                  <option value="BASSE">Basse priorité</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto pt-6">
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
              const IconComponent = getNotificationIcon(notif.type || 'info')
              const CategorieIcon = getCategorieIcon(notif.categorie)

              return (
                <div
                  key={notif.idNotification}
                  id={`notification-${notif.idNotification}`}
                  className={`card p-5 ${colors.bg} ${colors.border} ${
                    !notif.lue ? 'ring-2 ring-[rgba(var(--accent),0.3)]' : 'opacity-75'
                  } ${
                    highlightId && parseInt(highlightId) === notif.idNotification
                      ? 'ring-4 ring-[rgb(var(--accent))] shadow-lg shadow-[rgba(var(--accent),0.2)]'
                      : ''
                  } hover:opacity-100 transition-all`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icône principale */}
                    <div className={`w-14 h-14 rounded-xl ${colors.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className={`w-7 h-7 ${colors.icon}`} />
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CategorieIcon className={`w-4 h-4 ${colors.icon}`} />
                            <span className={`px-2 py-0.5 text-xs rounded-md ${colors.bg} ${colors.icon} border ${colors.border}`}>
                              {notif.categorie}
                            </span>
                          </div>
                          <h3 className={`text-lg font-semibold ${colors.icon}`}>
                            {notif.titre}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleLu(notif.idNotification)}
                            className="p-2 hover:bg-[rgba(var(--accent),0.1)] rounded-lg transition-colors"
                            title={notif.lue ? 'Marquer non lu' : 'Marquer lu'}
                          >
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

                      <p className="text-sm text-[rgb(var(--foreground))] leading-relaxed mb-3">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground))]">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(notif.creeLe).toLocaleString('fr-FR')}</span>
                        </div>

                        {notif.actionRequise && notif.typeAction && (
                          <button
                            onClick={() => executeAction && executeAction(notif.idNotification, notif.typeAction || '')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${colors.iconBg} ${colors.icon} hover:bg-opacity-80`}
                          >
                            {notif.typeAction}
                          </button>
                        )}
                        {notif.lienAction && (
                          <a
                            href={notif.lienAction}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${colors.iconBg} ${colors.icon} hover:bg-opacity-80`}
                          >
                            Voir détails
                          </a>
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
                Aucune notification trouvée
              </p>
            </div>
          )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
