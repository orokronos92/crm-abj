/**
 * Dashboard Admin
 * Interface principale avec statistiques et actions
 */

'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  Users,
  UserCheck,
  GraduationCap,
  FolderCheck,
  TrendingUp,
  Euro,
  Calendar,
  Mail,
  Diamond,
  ArrowUp,
  ArrowDown,
  Clock,
  Eye,
  MessageSquare,
  FileText,
  Plus,
  ChevronRight,
  Activity,
} from 'lucide-react'

// Données mockées pour la démo
const MOCK_STATS = {
  prospects: { total: 156, variation: +12, new: 8 },
  candidats: { total: 42, variation: +5, enCours: 18 },
  eleves: { total: 28, variation: +3, actifs: 24 },
  dossiers: { complets: 35, variation: +8, taux: 83 },
  ca: { realise: 18600, previsionnel: 36100, variation: +15 },
  conversion: { taux: 62, variation: +5 },
}

const MOCK_PROSPECTS = [
  { id: 1, nom: 'Martin Sophie', email: 'sophie.martin@email.fr', formation: 'CAP Bijouterie', statut: 'NOUVEAU', date: '2024-02-06' },
  { id: 2, nom: 'Dupont Jean', email: 'jean.dupont@email.fr', formation: 'Initiation', statut: 'EN_ATTENTE', date: '2024-02-05' },
  { id: 3, nom: 'Bernard Marie', email: 'marie.bernard@email.fr', formation: 'Perfectionnement', statut: 'CANDIDAT', date: '2024-02-04' },
]

const MOCK_FORMATIONS = [
  { nom: 'CAP Bijouterie', count: 28, color: 'rgb(var(--accent))' },
  { nom: 'Initiation', count: 15, color: 'rgb(var(--info))' },
  { nom: 'Perfectionnement', count: 12, color: 'rgb(var(--success))' },
  { nom: 'Sertissage', count: 8, color: 'rgb(var(--warning))' },
]

const MOCK_ACTIVITES = [
  { id: 1, type: 'prospect', message: 'Nouveau prospect: Sophie Martin', time: 'Il y a 2h', icon: UserCheck },
  { id: 2, type: 'email', message: 'Email envoyé à 15 contacts', time: 'Il y a 4h', icon: Mail },
  { id: 3, type: 'document', message: 'Devis généré pour Jean Dupont', time: 'Il y a 6h', icon: FileText },
  { id: 4, type: 'formation', message: 'Session CAP confirmée', time: 'Hier', icon: Calendar },
]

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      {/* Header de page */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-2">
          Tableau de bord
        </h1>
        <p className="text-[rgb(var(--muted-foreground))]">
          Vue d'ensemble de l'activité du CRM
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Prospects */}
        <div className="stat-card group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-[rgba(var(--info),0.1)] rounded-lg">
              <Users className="w-6 h-6 text-[rgb(var(--info))]" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              {MOCK_STATS.prospects.variation > 0 ? (
                <>
                  <ArrowUp className="w-4 h-4 text-[rgb(var(--success))]" />
                  <span className="text-[rgb(var(--success))]">+{MOCK_STATS.prospects.variation}%</span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-4 h-4 text-[rgb(var(--error))]" />
                  <span className="text-[rgb(var(--error))]">{MOCK_STATS.prospects.variation}%</span>
                </>
              )}
            </div>
          </div>
          <h3 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-1">
            {MOCK_STATS.prospects.total}
          </h3>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Prospects total
          </p>
          <div className="mt-3 pt-3 border-t border-[rgba(var(--border),0.3)]">
            <span className="text-xs text-[rgb(var(--accent))]">
              +{MOCK_STATS.prospects.new} cette semaine
            </span>
          </div>
        </div>

        {/* Candidats */}
        <div className="stat-card group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-[rgba(var(--warning),0.1)] rounded-lg">
              <UserCheck className="w-6 h-6 text-[rgb(var(--warning))]" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              <ArrowUp className="w-4 h-4 text-[rgb(var(--success))]" />
              <span className="text-[rgb(var(--success))]">+{MOCK_STATS.candidats.variation}%</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-1">
            {MOCK_STATS.candidats.total}
          </h3>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Candidats actifs
          </p>
          <div className="mt-3 pt-3 border-t border-[rgba(var(--border),0.3)]">
            <span className="text-xs text-[rgb(var(--accent))]">
              {MOCK_STATS.candidats.enCours} en cours
            </span>
          </div>
        </div>

        {/* Élèves */}
        <div className="stat-card group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-[rgba(var(--success),0.1)] rounded-lg">
              <GraduationCap className="w-6 h-6 text-[rgb(var(--success))]" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              <ArrowUp className="w-4 h-4 text-[rgb(var(--success))]" />
              <span className="text-[rgb(var(--success))]">+{MOCK_STATS.eleves.variation}%</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-1">
            {MOCK_STATS.eleves.total}
          </h3>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Élèves en formation
          </p>
          <div className="mt-3 pt-3 border-t border-[rgba(var(--border),0.3)]">
            <span className="text-xs text-[rgb(var(--accent))]">
              {MOCK_STATS.eleves.actifs} actifs
            </span>
          </div>
        </div>

        {/* Taux conversion */}
        <div className="stat-card group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-[rgba(var(--accent),0.1)] rounded-lg">
              <TrendingUp className="w-6 h-6 text-[rgb(var(--accent))]" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              <ArrowUp className="w-4 h-4 text-[rgb(var(--success))]" />
              <span className="text-[rgb(var(--success))]">+{MOCK_STATS.conversion.variation}%</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-1">
            {MOCK_STATS.conversion.taux}%
          </h3>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Taux de conversion
          </p>
          <div className="mt-3 pt-3 border-t border-[rgba(var(--border),0.3)]">
            <span className="text-xs text-[rgb(var(--accent))]">
              Objectif: 70%
            </span>
          </div>
        </div>
      </div>

      {/* CA et graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* CA financier */}
        <div className="lg:col-span-1">
          <div className="card-hover bg-[rgb(var(--card))] rounded-xl p-6 border border-[rgba(var(--border),0.5)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                Chiffre d'affaires
              </h3>
              <Euro className="w-5 h-5 text-[rgb(var(--accent))]" />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">CA Réalisé</p>
                <p className="text-2xl font-bold text-[rgb(var(--success))]">
                  {MOCK_STATS.ca.realise.toLocaleString('fr-FR')} €
                </p>
              </div>
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">CA Prévisionnel</p>
                <p className="text-2xl font-bold text-[rgb(var(--accent))]">
                  {MOCK_STATS.ca.previsionnel.toLocaleString('fr-FR')} €
                </p>
              </div>

              {/* Barre de progression */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-[rgb(var(--muted-foreground))] mb-2">
                  <span>Progression</span>
                  <span>{Math.round((MOCK_STATS.ca.realise / MOCK_STATS.ca.previsionnel) * 100)}%</span>
                </div>
                <div className="h-2 bg-[rgb(var(--secondary))] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-light))] transition-all duration-500"
                    style={{ width: `${(MOCK_STATS.ca.realise / MOCK_STATS.ca.previsionnel) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Graphique formations */}
        <div className="lg:col-span-2">
          <div className="card-hover bg-[rgb(var(--card))] rounded-xl p-6 border border-[rgba(var(--border),0.5)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                Formations demandées
              </h3>
              <Activity className="w-5 h-5 text-[rgb(var(--accent))]" />
            </div>

            <div className="space-y-3">
              {MOCK_FORMATIONS.map((formation, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[rgb(var(--foreground))]">{formation.nom}</span>
                    <span className="text-sm font-medium text-[rgb(var(--accent))]">{formation.count}</span>
                  </div>
                  <div className="h-2 bg-[rgb(var(--secondary))] rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 animate-slideInLeft"
                      style={{
                        width: `${(formation.count / 28) * 100}%`,
                        background: formation.color,
                        animationDelay: `${index * 100}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tableaux prospects et activité */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Derniers prospects */}
        <div className="lg:col-span-2">
          <div className="card-hover bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.5)]">
            <div className="p-6 border-b border-[rgba(var(--border),0.3)]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                  Derniers prospects
                </h3>
                <button className="flex items-center gap-1 text-sm text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-light))] transition-colors">
                  Voir tout
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {MOCK_PROSPECTS.map((prospect) => (
                  <div key={prospect.id} className="flex items-center justify-between p-4 rounded-lg bg-[rgb(var(--secondary))]/50 hover:bg-[rgb(var(--secondary))] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center text-[rgb(var(--primary))] font-bold">
                        {prospect.nom.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-[rgb(var(--foreground))]">{prospect.nom}</p>
                        <p className="text-sm text-[rgb(var(--muted-foreground))]">{prospect.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-[rgb(var(--foreground))]">{prospect.formation}</p>
                        <p className="text-xs text-[rgb(var(--muted-foreground))]">{prospect.date}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        prospect.statut === 'NOUVEAU' ? 'badge-info' :
                        prospect.statut === 'EN_ATTENTE' ? 'badge-warning' :
                        'badge-success'
                      }`}>
                        {prospect.statut}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activité récente */}
        <div className="lg:col-span-1">
          <div className="card-hover bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.5)]">
            <div className="p-6 border-b border-[rgba(var(--border),0.3)]">
              <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                Activité récente
              </h3>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {MOCK_ACTIVITES.map((activite) => {
                  const Icon = activite.icon
                  return (
                    <div key={activite.id} className="flex gap-3">
                      <div className="p-2 bg-[rgba(var(--accent),0.1)] rounded-lg flex-shrink-0">
                        <Icon className="w-4 h-4 text-[rgb(var(--accent))]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[rgb(var(--foreground))] line-clamp-2">
                          {activite.message}
                        </p>
                        <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                          {activite.time}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides (flottant) */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button className="w-14 h-14 bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all flex items-center justify-center group animate-pulse-gold">
          <MessageSquare className="w-6 h-6 text-[rgb(var(--primary))]" />
          <span className="absolute right-full mr-3 px-3 py-1 bg-[rgb(var(--card))] border border-[rgba(var(--accent),0.2)] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
            <span className="text-sm text-[rgb(var(--foreground))]">Chat Marjorie</span>
          </span>
        </button>
        <button className="w-14 h-14 bg-[rgb(var(--card))] border border-[rgba(var(--accent),0.2)] rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all flex items-center justify-center group">
          <Plus className="w-6 h-6 text-[rgb(var(--accent))]" />
          <span className="absolute right-full mr-3 px-3 py-1 bg-[rgb(var(--card))] border border-[rgba(var(--accent),0.2)] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
            <span className="text-sm text-[rgb(var(--foreground))]">Nouveau prospect</span>
          </span>
        </button>
      </div>
    </DashboardLayout>
  )
}