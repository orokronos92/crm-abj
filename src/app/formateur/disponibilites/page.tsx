/**
 * Page Disponibilités Formateur
 * Fonctionnalité en cours de développement
 */

'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Calendar, Clock, Sparkles, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DisponibilitesPage() {
  const router = useRouter()

  return (
    <DashboardLayout>
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icône animée */}
          <div className="relative inline-block mb-8">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center animate-pulse">
              <Calendar className="w-16 h-16 text-[rgb(var(--primary))]" />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center animate-bounce">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Titre */}
          <h1 className="text-4xl font-bold text-[rgb(var(--foreground))] mb-4">
            Gestion des disponibilités
          </h1>
          <p className="text-xl text-[rgb(var(--muted-foreground))] mb-2">
            Fonctionnalité en cours de développement
          </p>

          {/* Description */}
          <div className="mt-8 p-6 bg-gradient-to-r from-[rgba(var(--accent),0.1)] to-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-2xl">
            <div className="flex items-start gap-3 mb-4">
              <Clock className="w-5 h-5 text-[rgb(var(--accent))] mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
                  À venir prochainement :
                </p>
                <ul className="text-sm text-[rgb(var(--muted-foreground))] space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[rgb(var(--accent))]">•</span>
                    <span>Calendrier interactif pour indiquer vos créneaux disponibles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[rgb(var(--accent))]">•</span>
                    <span>Vue mensuelle/hebdomadaire de vos disponibilités</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[rgb(var(--accent))]">•</span>
                    <span>Synchronisation automatique avec votre planning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[rgb(var(--accent))]">•</span>
                    <span>Notification des nouvelles sessions proposées par Marjorie</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[rgb(var(--accent))]">•</span>
                    <span>Gestion des absences et congés</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] hover:bg-[rgb(var(--card))] transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </button>
            <button
              onClick={() => router.push('/formateur/planning')}
              className="px-6 py-3 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg hover:bg-[rgb(var(--accent-light))] transition-all font-medium flex items-center gap-2"
            >
              Voir mon Planning
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>

          {/* Note */}
          <p className="mt-8 text-xs text-[rgb(var(--muted-foreground))]">
            En attendant, vous pouvez consulter votre planning depuis l'onglet <span className="text-[rgb(var(--accent))] font-semibold">Planning</span>
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
