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
          Mon Planning
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions à venir */}
        <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl">
          <div className="p-6 border-b border-[rgba(var(--border),0.3)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                Prochaines sessions
              </h2>
              <button className="text-sm text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-light))] flex items-center gap-1">
                Voir tout
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {MOCK_SESSIONS.map((session) => (
              <div
                key={session.id}
                className="p-4 bg-[rgb(var(--secondary))] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-[rgb(var(--foreground))]">
                      {session.formation}
                    </h3>
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">
                      {session.date} • {session.horaire}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    session.statut === 'CONFIRMEE' ? 'badge-success' : 'badge-warning'
                  }`}>
                    {session.statut}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[rgb(var(--muted-foreground))]">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {session.nbEleves} élèves
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {session.salle}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mes élèves */}
        <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl">
          <div className="p-6 border-b border-[rgba(var(--border),0.3)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                Mes élèves actuels
              </h2>
              <button className="text-sm text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-light))] flex items-center gap-1">
                Voir tout
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {MOCK_ELEVES.map((eleve) => (
              <div
                key={eleve.id}
                className="p-4 bg-[rgb(var(--secondary))] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center text-[rgb(var(--primary))] font-bold">
                      {eleve.nom.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium text-[rgb(var(--foreground))]">
                        {eleve.nom}
                      </h3>
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">
                        {eleve.formation}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                      <Eye className="w-4 h-4 text-[rgb(var(--accent))]" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                      <Edit className="w-4 h-4 text-[rgb(var(--accent))]" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-[rgb(var(--muted-foreground))]">Progression</p>
                    <p className="font-medium text-[rgb(var(--foreground))]">{eleve.progression}%</p>
                  </div>
                  <div>
                    <p className="text-[rgb(var(--muted-foreground))]">Présence</p>
                    <p className="font-medium text-[rgb(var(--success))]">{eleve.presence}%</p>
                  </div>
                  <div>
                    <p className="text-[rgb(var(--muted-foreground))]">Dernière note</p>
                    <p className="font-medium text-[rgb(var(--accent))]">{eleve.derniereNote}/20</p>
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