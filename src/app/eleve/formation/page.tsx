/**
 * Page Formation Élève
 * Interface pour les élèves
 */

'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  GraduationCap,
  Calendar,
  Trophy,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  FileText,
  Award,
  TrendingUp,
  BookOpen,
  Target,
  ChevronRight,
  Star,
  MessageSquare,
} from 'lucide-react'

// Données mockées
const MOCK_FORMATION = {
  nom: 'CAP Bijouterie-Joaillerie',
  session: 'Mars 2024 - Septembre 2024',
  progression: 65,
  score: 750,
  rang: 3,
  totalEleves: 12,
}

const MOCK_PLANNING = [
  {
    id: 1,
    date: '2024-02-08',
    horaire: '09:00 - 12:00',
    cours: 'Techniques de base - Soudure',
    formateur: 'Pierre Durand',
    salle: 'Atelier principal',
  },
  {
    id: 2,
    date: '2024-02-09',
    horaire: '14:00 - 17:00',
    cours: 'Dessin technique',
    formateur: 'Marie Lambert',
    salle: 'Salle 2',
  },
]

const MOCK_EVALUATIONS = [
  {
    id: 1,
    matiere: 'Soudure',
    note: 15,
    sur: 20,
    date: '2024-01-25',
    type: 'Contrôle continu',
  },
  {
    id: 2,
    matiere: 'Dessin technique',
    note: 17,
    sur: 20,
    date: '2024-01-20',
    type: 'Projet',
  },
]

const MOCK_COMPETENCES = [
  { nom: 'Soudure', niveau: 80 },
  { nom: 'Sertissage', niveau: 60 },
  { nom: 'Dessin technique', niveau: 85 },
  { nom: 'Polissage', niveau: 70 },
]

export default function EleveFormation() {
  return (
    <DashboardLayout>
      {/* Header avec progression */}
      <div className="mb-8 p-6 bg-gradient-to-r from-[rgb(var(--card))] to-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.1)] rounded-xl">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-2">
            {MOCK_FORMATION.nom}
          </h1>
          <p className="text-[rgb(var(--muted-foreground))]">
            {MOCK_FORMATION.session}
          </p>
        </div>

        {/* Barre de progression */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[rgb(var(--foreground))]">Progression globale</span>
            <span className="font-medium text-[rgb(var(--accent))]">
              {MOCK_FORMATION.progression}%
            </span>
          </div>
          <div className="h-3 bg-[rgba(var(--secondary),0.5)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-light))] transition-all duration-500 relative"
              style={{ width: `${MOCK_FORMATION.progression}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-shimmer" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="w-8 h-8 text-[rgb(var(--success))]" />
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">92%</p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Taux de présence</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <Award className="w-8 h-8 text-[rgb(var(--accent))]" />
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">15.5/20</p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Moyenne générale</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <BookOpen className="w-8 h-8 text-[rgb(var(--info))]" />
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">8/12</p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Modules complétés</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 text-[rgb(var(--warning))]" />
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">180h</p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Heures effectuées</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Planning de la semaine */}
        <div className="lg:col-span-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl">
          <div className="p-6 border-b border-[rgba(var(--border),0.3)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                Planning de la semaine
              </h2>
              <button className="text-sm text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-light))] flex items-center gap-1">
                Voir tout
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {MOCK_PLANNING.map((cours) => (
              <div
                key={cours.id}
                className="p-4 bg-[rgb(var(--secondary))] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-[rgb(var(--foreground))]">
                      {cours.cours}
                    </h3>
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">
                      {cours.formateur}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-[rgb(var(--accent))]">
                    {cours.date}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[rgb(var(--muted-foreground))]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {cours.horaire}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {cours.salle}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compétences */}
        <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl">
          <div className="p-6 border-b border-[rgba(var(--border),0.3)]">
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">
              Mes compétences
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {MOCK_COMPETENCES.map((comp, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[rgb(var(--foreground))]">{comp.nom}</span>
                  <span className="font-medium text-[rgb(var(--accent))]">
                    {comp.niveau}%
                  </span>
                </div>
                <div className="h-2 bg-[rgba(var(--secondary),0.5)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-light))] transition-all duration-500"
                    style={{ width: `${comp.niveau}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="mt-6 p-4 bg-gradient-to-br from-[rgba(var(--accent),0.05)] to-transparent rounded-lg border border-[rgba(var(--accent),0.1)]">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-[rgb(var(--accent))]" />
                <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                  Prochain objectif
                </p>
              </div>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                Atteindre 70% en sertissage
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dernières évaluations */}
      <div className="mt-6 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl">
        <div className="p-6 border-b border-[rgba(var(--border),0.3)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">
              Dernières évaluations
            </h2>
            <button className="text-sm text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-light))] flex items-center gap-1">
              Voir tout
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_EVALUATIONS.map((evaluation) => (
              <div
                key={evaluation.id}
                className="p-4 bg-[rgb(var(--secondary))] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-[rgb(var(--foreground))]">
                      {evaluation.matiere}
                    </h3>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                      {evaluation.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {evaluation.note >= 15 && (
                      <Star className="w-4 h-4 text-[rgb(var(--accent))] fill-current" />
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-bold ${evaluation.note >= 15 ? 'text-[rgb(var(--success))]' :
                        evaluation.note >= 10 ? 'text-[rgb(var(--accent))]' :
                          'text-[rgb(var(--error))]'
                      }`}>
                      {evaluation.note}
                    </span>
                    <span className="text-sm text-[rgb(var(--muted-foreground))]">
                      /{evaluation.sur}
                    </span>
                  </div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                    {evaluation.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--accent),0.2)] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center justify-center gap-2 text-[rgb(var(--accent))] font-medium">
          <MessageSquare className="w-5 h-5" />
          Envoyer un message
        </button>
        <button className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--accent),0.2)] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center justify-center gap-2 text-[rgb(var(--accent))] font-medium">
          <FileText className="w-5 h-5" />
          Demander une attestation
        </button>
      </div>
    </DashboardLayout>
  )
}