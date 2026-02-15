/**
 * Composant Carte de notification individuelle
 */

'use client'

import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  XCircle,
  Eye,
  EyeOff,
  Calendar,
  ClipboardCheck,
  UserMinus,
  GraduationCap,
  Users,
  BookOpen,
  AlertTriangle,
  CalendarX,
} from 'lucide-react'

interface NotificationCardProps {
  notification: any
  isHighlighted?: boolean
  onToggleRead: (id: number) => void
  onExecuteAction?: (id: number, action: string) => void
}

// Icônes par catégorie formateur
const getCategorieIcon = (categorie: string) => {
  switch (categorie) {
    case 'PLANNING': return Calendar
    case 'EVALUATION': return ClipboardCheck
    case 'ABSENCE': return UserMinus
    case 'ELEVE': return GraduationCap
    case 'SESSION': return Users
    case 'COURS': return BookOpen
    case 'ALERTE': return AlertTriangle
    case 'DISPONIBILITE': return CalendarX
    default: return Bell
  }
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success': return CheckCircle
    case 'warning': return AlertCircle
    case 'error': return XCircle
    case 'info': return Info
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

export function NotificationCard({
  notification: notif,
  isHighlighted,
  onToggleRead,
  onExecuteAction
}: NotificationCardProps) {
  const colors = getNotificationColors(notif.priorite)
  const IconComponent = getNotificationIcon(notif.type || 'info')
  const CategorieIcon = getCategorieIcon(notif.categorie)

  const handleClick = () => {
    if (!notif.lue) onToggleRead(notif.idNotification)
    if (notif.lienAction) window.location.href = notif.lienAction
  }

  return (
    <div
      id={`notification-${notif.idNotification}`}
      className={`card p-5 ${colors.bg} ${colors.border} ${
        !notif.lue ? 'ring-2 ring-[rgba(var(--accent),0.3)]' : 'opacity-75'
      } ${
        isHighlighted
          ? 'ring-4 ring-[rgb(var(--accent))] shadow-lg shadow-[rgba(var(--accent),0.2)]'
          : ''
      } hover:opacity-100 transition-all cursor-pointer`}
      onClick={handleClick}
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
                {notif.priorite === 'URGENTE' && (
                  <span className="px-2 py-0.5 text-xs rounded-md bg-[rgba(var(--error),0.2)] text-[rgb(var(--error))] border border-[rgba(var(--error),0.3)]">
                    URGENT
                  </span>
                )}
              </div>
              <h3 className={`text-lg font-semibold ${colors.icon}`}>
                {notif.titre}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleRead(notif.idNotification)
                }}
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
                onClick={(e) => {
                  e.stopPropagation()
                  onExecuteAction?.(notif.idNotification, notif.typeAction)
                }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${colors.iconBg} ${colors.icon} hover:bg-opacity-80`}
              >
                {notif.typeAction === 'VALIDER' ? 'Valider' :
                 notif.typeAction === 'RELANCER' ? 'Relancer' :
                 notif.typeAction === 'CORRIGER' ? 'Corriger' :
                 notif.typeAction === 'VERIFIER' ? 'Vérifier' :
                 notif.typeAction}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}