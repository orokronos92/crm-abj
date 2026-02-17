/**
 * Page Planning Formateur
 * Interface pour les professeurs
 */

'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  Calendar,
  Users,
  Clock,
  BookOpen,
  Award,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Eye,
  Edit,
  Download,
} from 'lucide-react'

// Données mockées
const MOCK_SESSIONS = [
  {
    id: 1,
    formation: 'CAP Bijouterie-Joaillerie',
    date: '2024-02-08',
    horaire: '09:00 - 17:00',
    salle: 'Atelier principal',
    nbEleves: 12,
    statut: 'CONFIRMEE',
  },
  {
    id: 2,
    formation: 'Initiation Bijouterie',
    date: '2024-02-10',
    horaire: '14:00 - 17:00',
    salle: 'Salle 2',
    nbEleves: 6,
    statut: 'EN_ATTENTE',
  },
]

const MOCK_ELEVES = [
  {
    id: 1,
    nom: 'Martin Sophie',
    formation: 'CAP Bijouterie',
    progression: 65,
    presence: 92,
    derniereNote: 15,
  },
  {
    id: 2,
    nom: 'Dupont Jean',
    formation: 'CAP Bijouterie',
    progression: 45,
    presence: 88,
    derniereNote: 12,
  },
]

export default function FormateurPlanning() {
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-2">
          Tableau de bord
        </h1>
        <p className="text-[rgb(var(--muted-foreground))]">
          Bienvenue dans votre espace formateur
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <Calendar className="w-8 h-8 text-[rgb(var(--accent))]" />
            <span className="text-xs text-[rgb(var(--success))]">Cette semaine</span>
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">5</p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Sessions prévues</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-8 h-8 text-[rgb(var(--info))]" />
            <span className="text-xs text-[rgb(var(--accent))]">Actifs</span>
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">18</p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Élèves totaux</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <Award className="w-8 h-8 text-[rgb(var(--success))]" />
            <span className="text-xs text-[rgb(var(--warning))]">À faire</span>
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">8</p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Évaluations en attente</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 text-[rgb(var(--warning))]" />
            <span className="text-xs text-[rgb(var(--muted-foreground))]">Ce mois</span>
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">120h</p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Heures enseignées</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Mes Sessions */}
        <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl">
          <div className="p-6 border-b border-[rgba(var(--border),0.3)]">
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">
              Mes sessions
            </h2>
          </div>

          {/* Onglets Sessions */}
          <div className="p-4 border-b border-[rgba(var(--border),0.3)]">
            <div className="card p-1">
              <div className="flex gap-2">
                <button
                  onClick={() => {/* TODO: filtrer sessions EN_COURS */}}
                  className="flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all bg-[rgb(var(--accent))] text-[rgb(var(--primary))]"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>Sessions en cours</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-[rgba(var(--primary),0.2)] text-[rgb(var(--primary))]">
                      2
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => {/* TODO: filtrer sessions A_VENIR */}}
                  className="flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--secondary))]"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>Sessions à venir</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))]">
                      0
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Grille sessions (tuiles comme admin) */}
          <div className="p-6 space-y-4">
            {MOCK_SESSIONS.map((session) => (
              <div
                key={session.id}
                className="card p-6 hover:border-[rgb(var(--accent))] cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-7 h-7 text-[rgb(var(--primary))]" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-[rgb(var(--foreground))] mb-1">
                              {session.formation}
                            </h3>
                            <p className="text-sm text-[rgb(var(--muted-foreground))]">
                              {session.date} • {session.horaire}
                            </p>
                          </div>
                          <span className={`px-4 py-1.5 text-sm rounded-full ${
                            session.statut === 'CONFIRMEE'
                              ? 'bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))] border border-[rgba(var(--success),0.3)]'
                              : 'bg-[rgba(var(--warning),0.1)] text-[rgb(var(--warning))] border border-[rgba(var(--warning),0.3)]'
                          }`}>
                            {session.statut === 'CONFIRMEE' ? 'Confirmée' : 'En attente'}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4">
                          {/* Salle */}
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-[rgb(var(--accent))]" />
                            <div>
                              <p className="text-xs text-[rgb(var(--muted-foreground))]">Salle</p>
                              <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                                {session.salle}
                              </p>
                            </div>
                          </div>

                          {/* Élèves */}
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[rgb(var(--accent))]" />
                            <div>
                              <p className="text-xs text-[rgb(var(--muted-foreground))]">Élèves</p>
                              <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                                {session.nbEleves}
                              </p>
                            </div>
                          </div>

                          {/* Horaire */}
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[rgb(var(--accent))]" />
                            <div>
                              <p className="text-xs text-[rgb(var(--muted-foreground))]">Horaire</p>
                              <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                                {session.horaire}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}