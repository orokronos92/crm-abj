/**
 * Page Évaluations Élève
 * Consultation des notes et évaluations
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  Award,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Download,
  Eye,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  Filter,
  BarChart,
  Target,
} from 'lucide-react'

// Données mockées
const MOCK_EVALUATIONS = [
  {
    id: 1,
    matiere: 'Techniques de soudure',
    type: 'Contrôle continu',
    date: '2024-02-05',
    note: 16,
    sur: 20,
    coefficient: 2,
    commentaire: 'Très bon travail, technique bien maîtrisée',
    competences: [
      { nom: 'Précision', niveau: 80 },
      { nom: 'Créativité', niveau: 70 },
      { nom: 'Technique', niveau: 90 },
    ],
  },
  {
    id: 2,
    matiere: 'Dessin technique',
    type: 'Projet',
    date: '2024-02-01',
    note: 18,
    sur: 20,
    coefficient: 3,
    commentaire: 'Excellent projet, très créatif',
    competences: [
      { nom: 'Créativité', niveau: 95 },
      { nom: 'Présentation', niveau: 85 },
      { nom: 'Respect consignes', niveau: 90 },
    ],
  },
  {
    id: 3,
    matiere: 'Histoire de la bijouterie',
    type: 'QCM',
    date: '2024-01-28',
    note: 14,
    sur: 20,
    coefficient: 1,
    commentaire: 'Bonnes connaissances générales',
    competences: [
      { nom: 'Connaissances', niveau: 70 },
      { nom: 'Analyse', niveau: 65 },
    ],
  },
  {
    id: 4,
    matiere: 'Gemmologie',
    type: 'TP',
    date: '2024-01-25',
    note: 12,
    sur: 20,
    coefficient: 2,
    commentaire: 'À approfondir les techniques d\'identification',
    competences: [
      { nom: 'Observation', niveau: 60 },
      { nom: 'Analyse', niveau: 55 },
      { nom: 'Manipulation', niveau: 65 },
    ],
  },
]

const MOCK_EVALUATIONS_A_VENIR = [
  {
    id: 1,
    matiere: 'Sertissage',
    type: 'Évaluation pratique',
    date: '2024-02-15',
    duree: '3h',
    salle: 'Atelier principal',
    coefficient: 3,
  },
  {
    id: 2,
    matiere: 'Projet final',
    type: 'Présentation',
    date: '2024-02-28',
    duree: '30 min',
    salle: 'Salle de conférence',
    coefficient: 5,
  },
]

const MOCK_STATISTIQUES = {
  moyenneGenerale: 15.5,
  moyenneTrimestre: 16.2,
  progression: 8,
  rang: 3,
  totalEleves: 12,
  mentionPossible: 'Très bien',
}

const MOCK_MATIERES_STATS = [
  { matiere: 'Soudure', moyenne: 16, evolution: 5 },
  { matiere: 'Dessin technique', moyenne: 17, evolution: 10 },
  { matiere: 'Histoire', moyenne: 14, evolution: -2 },
  { matiere: 'Gemmologie', moyenne: 13, evolution: 3 },
  { matiere: 'Sertissage', moyenne: 15, evolution: 7 },
]

export default function EleveEvaluations() {
  const [selectedPeriode, setSelectedPeriode] = useState('trimestre')

  const getNoteColor = (note: number, sur: number) => {
    const percentage = (note / sur) * 100
    if (percentage >= 80) return 'text-[rgb(var(--success))]'
    if (percentage >= 60) return 'text-[rgb(var(--accent))]'
    if (percentage >= 50) return 'text-[rgb(var(--warning))]'
    return 'text-[rgb(var(--error))]'
  }

  return (
    <DashboardLayout>
      {/* Header avec statistiques principales */}
      <div className="mb-8 p-6 bg-gradient-to-r from-[rgb(var(--card))] to-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.1)] rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-2">
              Mes Évaluations
            </h1>
            <p className="text-[rgb(var(--muted-foreground))]">
              Suivez vos résultats et votre progression
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">Mention actuelle</p>
            <div className="px-4 py-2 bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] text-[rgb(var(--primary))] rounded-lg font-bold">
              {MOCK_STATISTIQUES.mentionPossible}
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <Award className="w-8 h-8 text-[rgb(var(--accent))]" />
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">
            {MOCK_STATISTIQUES.moyenneGenerale}/20
          </p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Moyenne générale</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-[rgb(var(--success))]" />
            <span className="text-xs text-[rgb(var(--success))]">
              +{MOCK_STATISTIQUES.progression}%
            </span>
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">
            {MOCK_STATISTIQUES.moyenneTrimestre}/20
          </p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Ce trimestre</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <Target className="w-8 h-8 text-[rgb(var(--info))]" />
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">
            {MOCK_STATISTIQUES.rang}ème
          </p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Sur {MOCK_STATISTIQUES.totalEleves} élèves
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="w-8 h-8 text-[rgb(var(--success))]" />
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">
            {MOCK_EVALUATIONS.length}
          </p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Évaluations passées</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 text-[rgb(var(--warning))]" />
            <span className="text-xs badge-warning">À venir</span>
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">
            {MOCK_EVALUATIONS_A_VENIR.length}
          </p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Prochaines évaluations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dernières évaluations */}
        <div className="lg:col-span-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl">
          <div className="p-6 border-b border-[rgba(var(--border),0.3)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                Derniers résultats
              </h2>
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="px-3 py-1.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.3)] rounded-lg text-sm text-[rgb(var(--foreground))]"
              >
                <option value="trimestre">Ce trimestre</option>
                <option value="annee">Cette année</option>
                <option value="tout">Tout</option>
              </select>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {MOCK_EVALUATIONS.map((evaluation) => (
              <div
                key={evaluation.id}
                className="p-4 bg-[rgb(var(--secondary))] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-[rgb(var(--foreground))] mb-1">
                      {evaluation.matiere}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-[rgb(var(--muted-foreground))]">
                      <span>{evaluation.type}</span>
                      <span>•</span>
                      <span>{evaluation.date}</span>
                      <span>•</span>
                      <span>Coeff. {evaluation.coefficient}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${getNoteColor(evaluation.note, evaluation.sur)}`}>
                      {evaluation.note}/{evaluation.sur}
                    </p>
                    {evaluation.note >= 16 && (
                      <div className="flex gap-1 mt-1 justify-center">
                        {[1, 2, 3].map((i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 text-[rgb(var(--warning))] fill-current"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {evaluation.commentaire && (
                  <p className="text-sm text-[rgb(var(--muted-foreground))] mb-3 italic">
                    "{evaluation.commentaire}"
                  </p>
                )}

                {/* Compétences évaluées */}
                <div className="space-y-2">
                  {evaluation.competences.map((comp, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-xs text-[rgb(var(--muted-foreground))] w-24">
                        {comp.nom}
                      </span>
                      <div className="flex-1 h-1.5 bg-[rgba(var(--secondary),0.5)] rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            comp.niveau >= 80
                              ? 'bg-gradient-to-r from-[rgb(var(--success))] to-[rgb(var(--success-light))]'
                              : comp.niveau >= 60
                              ? 'bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-light))]'
                              : 'bg-gradient-to-r from-[rgb(var(--warning))] to-[rgb(var(--warning-light))]'
                          }`}
                          style={{ width: `${comp.niveau}%` }}
                        />
                      </div>
                      <span className="text-xs text-[rgb(var(--muted-foreground))] w-12 text-right">
                        {comp.niveau}%
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <button className="flex-1 py-1.5 bg-[rgba(var(--accent),0.1)] border border-[rgba(var(--accent),0.2)] text-[rgb(var(--accent))] rounded-lg text-sm font-medium hover:bg-[rgba(var(--accent),0.2)] transition-colors flex items-center justify-center gap-1">
                    <Eye className="w-4 h-4" />
                    Détails
                  </button>
                  <button className="flex-1 py-1.5 bg-[rgba(var(--info),0.1)] border border-[rgba(var(--info),0.2)] text-[rgb(var(--info))] rounded-lg text-sm font-medium hover:bg-[rgba(var(--info),0.2)] transition-colors flex items-center justify-center gap-1">
                    <Download className="w-4 h-4" />
                    Copie
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Prochaines évaluations */}
          <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl">
            <div className="p-4 border-b border-[rgba(var(--border),0.3)]">
              <h3 className="font-semibold text-[rgb(var(--foreground))]">
                À venir
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {MOCK_EVALUATIONS_A_VENIR.map((evaluation) => (
                <div
                  key={evaluation.id}
                  className="p-3 bg-[rgb(var(--secondary))] rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm text-[rgb(var(--foreground))]">
                      {evaluation.matiere}
                    </h4>
                    <span className="badge-warning text-xs">
                      Coeff. {evaluation.coefficient}
                    </span>
                  </div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">
                    {evaluation.type}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[rgb(var(--accent))]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {evaluation.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {evaluation.duree}
                    </span>
                  </div>
                </div>
              ))}

              <button className="w-full p-3 border border-dashed border-[rgba(var(--accent),0.3)] rounded-lg text-sm text-[rgb(var(--accent))] hover:bg-[rgba(var(--accent),0.05)] transition-colors">
                Voir le calendrier complet
              </button>
            </div>
          </div>

          {/* Performance par matière */}
          <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl">
            <div className="p-4 border-b border-[rgba(var(--border),0.3)]">
              <h3 className="font-semibold text-[rgb(var(--foreground))]">
                Par matière
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {MOCK_MATIERES_STATS.map((matiere, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[rgb(var(--foreground))]">
                        {matiere.matiere}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                          {matiere.moyenne}/20
                        </span>
                        {matiere.evolution > 0 ? (
                          <TrendingUp className="w-3 h-3 text-[rgb(var(--success))]" />
                        ) : matiere.evolution < 0 ? (
                          <TrendingDown className="w-3 h-3 text-[rgb(var(--error))]" />
                        ) : null}
                      </div>
                    </div>
                    <div className="h-1.5 bg-[rgba(var(--secondary),0.5)] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          matiere.moyenne >= 16
                            ? 'bg-gradient-to-r from-[rgb(var(--success))] to-[rgb(var(--success-light))]'
                            : matiere.moyenne >= 14
                            ? 'bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-light))]'
                            : 'bg-gradient-to-r from-[rgb(var(--warning))] to-[rgb(var(--warning-light))]'
                        }`}
                        style={{ width: `${(matiere.moyenne / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Objectifs */}
          <div className="p-4 bg-gradient-to-br from-[rgba(var(--accent),0.1)] to-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-[rgb(var(--accent))]" />
              <h3 className="font-medium text-[rgb(var(--foreground))]">Objectifs</h3>
            </div>
            <ul className="space-y-2 text-sm text-[rgb(var(--muted-foreground))]">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-[rgb(var(--accent))] rounded-full mt-1.5" />
                <span>Maintenir 16+ de moyenne</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-[rgb(var(--accent))] rounded-full mt-1.5" />
                <span>Améliorer en gemmologie (+2pts)</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-[rgb(var(--accent))] rounded-full mt-1.5" />
                <span>Préparer projet final</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--accent),0.2)] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center justify-center gap-2 text-[rgb(var(--accent))] font-medium">
          <Download className="w-5 h-5" />
          Télécharger bulletin
        </button>
        <button className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--accent),0.2)] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center justify-center gap-2 text-[rgb(var(--accent))] font-medium">
          <BarChart className="w-5 h-5" />
          Graphique progression
        </button>
        <button className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--accent),0.2)] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center justify-center gap-2 text-[rgb(var(--accent))] font-medium">
          <FileText className="w-5 h-5" />
          Historique complet
        </button>
      </div>
    </DashboardLayout>
  )
}