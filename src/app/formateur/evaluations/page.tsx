/**
 * Page Évaluations Formateur
 * Gestion des évaluations et notations
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  Award,
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  Edit,
  Eye,
  Send,
  Calendar,
  TrendingUp,
  Star,
  BarChart,
  Filter,
  Search,
  ChevronRight,
  Plus,
} from 'lucide-react'

// Données mockées
const MOCK_EVALUATIONS_EN_COURS = [
  {
    id: 1,
    titre: 'Contrôle continu - Soudure',
    formation: 'CAP Bijouterie',
    dateRemise: '2024-02-10',
    nbEleves: 12,
    nbRendus: 8,
    statut: 'EN_COURS',
  },
  {
    id: 2,
    titre: 'Projet final - Bague',
    formation: 'CAP Bijouterie',
    dateRemise: '2024-02-15',
    nbEleves: 12,
    nbRendus: 0,
    statut: 'PLANIFIE',
  },
]

const MOCK_ELEVES_A_NOTER = [
  {
    id: 1,
    nom: 'Martin Sophie',
    evaluation: 'Contrôle continu - Soudure',
    dateRendu: '2024-02-08',
    statut: 'À_NOTER',
  },
  {
    id: 2,
    nom: 'Dupont Jean',
    evaluation: 'Contrôle continu - Soudure',
    dateRendu: '2024-02-09',
    statut: 'À_NOTER',
  },
  {
    id: 3,
    nom: 'Bernard Alice',
    evaluation: 'TP Dessin technique',
    dateRendu: '2024-02-07',
    statut: 'NOTÉ',
    note: 16,
  },
]

const MOCK_STATISTIQUES = {
  moyenneGenerale: 14.5,
  tauxReussite: 85,
  progression: 12,
  evaluationsCorrigees: 45,
  evaluationsEnAttente: 8,
}

export default function FormateurEvaluations() {
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null)
  const [showNotationModal, setShowNotationModal] = useState(false)

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-2">
          Évaluations
        </h1>
        <p className="text-[rgb(var(--muted-foreground))]">
          Gérez les évaluations et les notations de vos élèves
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
            {MOCK_STATISTIQUES.tauxReussite}%
          </p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Taux de réussite</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="w-8 h-8 text-[rgb(var(--info))]" />
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">
            {MOCK_STATISTIQUES.evaluationsCorrigees}
          </p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Corrigées ce mois</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className="w-8 h-8 text-[rgb(var(--warning))]" />
            <span className="text-xs badge-warning">Urgent</span>
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">
            {MOCK_STATISTIQUES.evaluationsEnAttente}
          </p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">En attente</p>
        </div>

        <div className="stat-card bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))]">
          <button className="w-full h-full flex flex-col items-center justify-center text-[rgb(var(--primary))] hover:scale-105 transition-transform">
            <Plus className="w-8 h-8 mb-2" />
            <span className="font-medium">Nouvelle évaluation</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Évaluations en cours */}
        <div className="lg:col-span-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl">
          <div className="p-6 border-b border-[rgba(var(--border),0.3)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                Évaluations actives
              </h2>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                  <Filter className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                </button>
                <button className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                  <Calendar className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                </button>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {MOCK_EVALUATIONS_EN_COURS.map((evaluation) => (
              <div
                key={evaluation.id}
                className="p-4 bg-[rgb(var(--secondary))] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors cursor-pointer"
                onClick={() => setSelectedEvaluation(evaluation)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-[rgb(var(--foreground))] mb-1">
                      {evaluation.titre}
                    </h3>
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">
                      {evaluation.formation}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    evaluation.statut === 'EN_COURS' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {evaluation.statut}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[rgb(var(--muted-foreground))]">Date limite</span>
                    <span className="text-[rgb(var(--foreground))] font-medium">
                      {evaluation.dateRemise}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[rgb(var(--muted-foreground))]">Progression</span>
                    <span className="text-[rgb(var(--accent))] font-medium">
                      {evaluation.nbRendus}/{evaluation.nbEleves} rendus
                    </span>
                  </div>

                  {/* Barre de progression */}
                  <div className="h-2 bg-[rgba(var(--secondary),0.5)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-light))] transition-all duration-500"
                      style={{ width: `${(evaluation.nbRendus / evaluation.nbEleves) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowNotationModal(true)
                    }}
                    className="flex-1 py-1.5 bg-[rgba(var(--accent),0.1)] border border-[rgba(var(--accent),0.2)] text-[rgb(var(--accent))] rounded-lg text-sm font-medium hover:bg-[rgba(var(--accent),0.2)] transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Noter
                  </button>
                  <button className="flex-1 py-1.5 bg-[rgba(var(--info),0.1)] border border-[rgba(var(--info),0.2)] text-[rgb(var(--info))] rounded-lg text-sm font-medium hover:bg-[rgba(var(--info),0.2)] transition-colors flex items-center justify-center gap-1">
                    <Eye className="w-4 h-4" />
                    Détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Élèves à noter */}
        <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl">
          <div className="p-6 border-b border-[rgba(var(--border),0.3)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                À corriger
              </h2>
              <span className="badge-warning">
                {MOCK_ELEVES_A_NOTER.filter(e => e.statut === 'À_NOTER').length} en attente
              </span>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {MOCK_ELEVES_A_NOTER.map((eleve) => (
              <div
                key={eleve.id}
                className={`p-3 rounded-lg transition-colors ${
                  eleve.statut === 'NOTÉ'
                    ? 'bg-[rgba(var(--success),0.05)] border border-[rgba(var(--success),0.1)]'
                    : 'bg-[rgb(var(--secondary))] hover:bg-[rgba(var(--accent),0.05)]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center text-[rgb(var(--primary))] text-xs font-bold">
                      {eleve.nom.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[rgb(var(--foreground))]">
                        {eleve.nom}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">
                        Rendu le {eleve.dateRendu}
                      </p>
                    </div>
                  </div>
                  {eleve.statut === 'NOTÉ' ? (
                    <div className="text-center">
                      <p className="text-lg font-bold text-[rgb(var(--success))]">
                        {eleve.note}/20
                      </p>
                      <p className="text-xs text-[rgb(var(--success))]">Noté</p>
                    </div>
                  ) : (
                    <button className="p-1.5 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg hover:bg-[rgb(var(--accent-dark))] transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-[rgb(var(--muted-foreground))] truncate">
                  {eleve.evaluation}
                </p>
              </div>
            ))}

            <button className="w-full p-3 border border-dashed border-[rgba(var(--accent),0.3)] rounded-lg text-sm text-[rgb(var(--accent))] hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center justify-center gap-2">
              Voir toutes les copies
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Graphique de répartition des notes */}
      <div className="mt-6 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl">
        <div className="p-6 border-b border-[rgba(var(--border),0.3)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">
              Répartition des notes
            </h2>
            <select className="px-3 py-1.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.3)] rounded-lg text-sm text-[rgb(var(--foreground))]">
              <option>Ce mois</option>
              <option>Ce trimestre</option>
              <option>Cette année</option>
            </select>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-5 gap-4">
            {[
              { range: '0-5', count: 2, color: 'error' },
              { range: '5-10', count: 5, color: 'warning' },
              { range: '10-15', count: 18, color: 'info' },
              { range: '15-18', count: 12, color: 'success' },
              { range: '18-20', count: 8, color: 'accent' },
            ].map((data, idx) => (
              <div key={idx} className="text-center">
                <div className="h-32 flex items-end mb-2">
                  <div
                    className={`w-full bg-gradient-to-t from-[rgb(var(--${data.color}))] to-[rgba(var(--${data.color}),0.5)] rounded-t-lg transition-all duration-500 hover:opacity-80`}
                    style={{ height: `${(data.count / 20) * 100}%` }}
                  />
                </div>
                <p className="text-sm font-medium text-[rgb(var(--foreground))]">{data.range}</p>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">{data.count} élèves</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--accent),0.2)] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center justify-center gap-2 text-[rgb(var(--accent))] font-medium">
          <Upload className="w-5 h-5" />
          Importer notes
        </button>
        <button className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--accent),0.2)] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center justify-center gap-2 text-[rgb(var(--accent))] font-medium">
          <Download className="w-5 h-5" />
          Exporter bulletin
        </button>
        <button className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--accent),0.2)] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center justify-center gap-2 text-[rgb(var(--accent))] font-medium">
          <BarChart className="w-5 h-5" />
          Statistiques détaillées
        </button>
      </div>
    </DashboardLayout>
  )
}