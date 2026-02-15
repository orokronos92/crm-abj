/**
 * Dashboard Admin
 * Interface principale avec statistiques et actions
 * Server Component pour data fetching
 */

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DashboardService } from '@/services/dashboard.service'
import {
  Users,
  UserCheck,
  GraduationCap,
  UserCog,
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

// Ces données mockées seront remplacées par les vraies données
// Conservées temporairement pour les sections non connectées

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
  { id: 1, type: 'prospect', message: 'Nouveau prospect: Marie Leroy', time: 'Il y a 2h', icon: UserCheck },
  { id: 2, type: 'email', message: 'Email envoyé à 15 contacts', time: 'Il y a 4h', icon: Mail },
  { id: 3, type: 'document', message: 'Devis généré pour Jean Dupont', time: 'Il y a 6h', icon: FileText },
  { id: 4, type: 'formation', message: 'Session CAP confirmée', time: 'Hier', icon: Calendar },
]

export default async function AdminDashboard() {
  // Récupération des données depuis le service
  const dashboardService = new DashboardService()
  const stats = await dashboardService.getStats()
  const derniersProspects = await dashboardService.getRecentProspects(3)
  const formationsStats = await dashboardService.getFormationsStats()

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Prospects */}
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-[rgba(var(--info),0.1)] rounded-lg">
              <Users className="w-6 h-6 text-[rgb(var(--info))]" />
            </div>
            <h3 className="text-6xl font-bold text-[rgb(var(--foreground))]">
              {stats.prospects.total}
            </h3>
          </div>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Prospects total
          </p>
          <div className="mt-3 pt-3 border-t border-[rgba(var(--border),0.3)]">
            <span className="text-xs text-[rgb(var(--accent))]">
              +{stats.prospects.new} cette semaine
            </span>
          </div>
        </div>

        {/* Candidats */}
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-[rgba(var(--warning),0.1)] rounded-lg">
              <UserCheck className="w-6 h-6 text-[rgb(var(--warning))]" />
            </div>
            <h3 className="text-6xl font-bold text-[rgb(var(--foreground))]">
              {stats.candidats.total}
            </h3>
          </div>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Candidats actifs
          </p>
          <div className="mt-3 pt-3 border-t border-[rgba(var(--border),0.3)]">
            <span className="text-xs text-[rgb(var(--accent))]">
              {stats.candidats.enCours} en cours
            </span>
          </div>
        </div>

        {/* Élèves */}
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-[rgba(var(--success),0.1)] rounded-lg">
              <GraduationCap className="w-6 h-6 text-[rgb(var(--success))]" />
            </div>
            <h3 className="text-6xl font-bold text-[rgb(var(--foreground))]">
              {stats.eleves.total}
            </h3>
          </div>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Élèves en formation
          </p>
          <div className="mt-3 pt-3 border-t border-[rgba(var(--border),0.3)]">
            <span className="text-xs text-[rgb(var(--accent))]">
              {stats.eleves.actifs} actifs
            </span>
          </div>
        </div>

        {/* Formateurs */}
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-[rgba(var(--error),0.1)] rounded-lg">
              <UserCog className="w-6 h-6 text-[rgb(var(--error))]" />
            </div>
            <h3 className="text-6xl font-bold text-[rgb(var(--foreground))]">
              {stats.formateurs.total}
            </h3>
          </div>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Formateurs
          </p>
          <div className="mt-3 pt-3 border-t border-[rgba(var(--border),0.3)]">
            <span className="text-xs text-[rgb(var(--accent))]">
              {stats.formateurs.actifs} actifs
            </span>
          </div>
        </div>

        {/* Taux conversion */}
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 bg-[rgba(var(--accent),0.1)] rounded-lg">
              <TrendingUp className="w-6 h-6 text-[rgb(var(--accent))]" />
            </div>
            <h3 className="text-6xl font-bold text-[rgb(var(--foreground))]">
              {stats.conversion.taux}%
            </h3>
          </div>
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
                  {stats.finance.caRealise.toLocaleString('fr-FR')} €
                </p>
              </div>
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">CA Prévisionnel</p>
                <p className="text-2xl font-bold text-[rgb(var(--accent))]">
                  {stats.finance.caPrevisionnel.toLocaleString('fr-FR')} €
                </p>
              </div>

              {/* Barre de progression */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-[rgb(var(--muted-foreground))] mb-2">
                  <span>Progression</span>
                  <span>{stats.finance.caPrevisionnel > 0 ? Math.round((stats.finance.caRealise / stats.finance.caPrevisionnel) * 100) : 0}%</span>
                </div>
                <div className="h-2 bg-[rgb(var(--secondary))] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-light))] transition-all duration-500"
                    style={{ width: `${stats.finance.caPrevisionnel > 0 ? (stats.finance.caRealise / stats.finance.caPrevisionnel) * 100 : 0}%` }}
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
              {formationsStats.map((formation, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[rgb(var(--foreground))]">{formation.nom}</span>
                    <span className="text-sm font-medium text-[rgb(var(--accent))]">{formation.count}</span>
                  </div>
                  <div className="h-2 bg-[rgb(var(--secondary))] rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 animate-slideInLeft"
                      style={{
                        width: `${Math.min((formation.count / Math.max(...formationsStats.map(f => f.count), 1)) * 100, 100)}%`,
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
                {derniersProspects.map((prospect) => (
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

    </DashboardLayout>
  )
}