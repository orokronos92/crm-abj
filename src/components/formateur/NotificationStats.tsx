/**
 * Composant Stats pour les notifications formateur
 */

'use client'

import {
  Bell,
  Sparkles,
  AlertTriangle,
  ClipboardCheck,
} from 'lucide-react'

interface NotificationStatsProps {
  counts: {
    total: number
    nonLues: number
    urgentes: number
    actionsRequises: number
  }
}

export function NotificationStats({ counts }: NotificationStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
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
          <ClipboardCheck className="w-8 h-8 text-[rgb(var(--warning))]" />
        </div>
      </div>
    </div>
  )
}