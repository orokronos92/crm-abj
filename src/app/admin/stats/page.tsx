/**
 * Page Statistiques
 * Dashboard analytique complet : conversion, CA, performance, Qualiopi
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  Euro,
  Award,
  Star,
  CheckCircle,
  AlertCircle,
  Calendar,
  Target,
  Zap,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Clock,
  FileText,
  Briefcase,
  BookOpen,
  UserCheck,
  ThumbsUp,
  Filter,
} from 'lucide-react'

// Mock data statistiques
const STATS_GLOBALES = {
  // Pipeline conversion
  prospects_total: 156,
  prospects_nouveaux_mois: 23,
  candidats_actifs: 47,
  candidats_nouveaux_mois: 12,
  eleves_actifs: 26,
  eleves_nouveaux_mois: 8,

  // Taux de conversion
  taux_prospect_candidat: 30.1, // 47/156
  taux_candidat_eleve: 55.3, // 26/47
  taux_global: 16.7, // 26/156

  // Financier
  ca_realise: 186500,
  ca_previsionnel: 361000,
  ca_objectif_annuel: 450000,
  reste_a_charge_total: 45200,

  // Performance
  taux_reussite_global: 94,
  taux_assiduite_global: 95,
  satisfaction_moyenne: 4.7,
  nb_abandons_total: 3,

  // Délais
  delai_moyen_conversion: 21, // jours prospect → candidat
  delai_moyen_inscription: 45, // jours candidat → élève
}

const TOP_FORMATIONS = [
  { nom: 'CAP ATBJ', nb_candidats: 18, nb_eleves: 11, taux_conversion: 61, ca: 92400, satisfaction: 4.8, taux_reussite: 96 },
  { nom: 'Sertissage N2', nb_candidats: 12, nb_eleves: 5, taux_conversion: 42, ca: 31500, satisfaction: 4.9, taux_reussite: 100 },
  { nom: 'Joaillerie Création', nb_candidats: 8, nb_eleves: 6, taux_conversion: 75, ca: 42000, satisfaction: 4.6, taux_reussite: 92 },
  { nom: 'CAO/DAO', nb_candidats: 5, nb_eleves: 4, taux_conversion: 80, ca: 15200, satisfaction: 4.9, taux_reussite: 98 },
  { nom: 'Sertissage N1', nb_candidats: 4, nb_eleves: 0, taux_conversion: 0, ca: 5400, satisfaction: null, taux_reussite: null },
]

const PERFORMANCE_FORMATEURS = [
  { nom: 'Michel Laurent', specialites: ['Sertissage', 'Joaillerie'], nb_eleves: 13, heures_total: 892, satisfaction: 4.8, taux_reussite: 94 },
  { nom: 'Sophie Petit', specialites: ['CAO/DAO'], nb_eleves: 8, heures_total: 456, satisfaction: 4.9, taux_reussite: 98 },
  { nom: 'Antoine Dubois', specialites: ['Polissage'], nb_eleves: 5, heures_total: 245, satisfaction: 4.6, taux_reussite: 91 },
]

const FINANCEMENTS = [
  { type: 'CPF', nb: 12, montant: 84000, pct: 45 },
  { type: 'OPCO', nb: 8, montant: 56000, pct: 30 },
  { type: 'Personnel', nb: 4, montant: 28000, pct: 15 },
  { type: 'Pôle Emploi', nb: 2, montant: 18500, pct: 10 },
]

const ALERTES_IA = [
  {
    type: 'warning',
    titre: '3 candidats bloqués depuis >15 jours',
    message: 'Dossiers en attente documents : Juliette Rimbo (CNI), Marc Durand (Diplôme), Sophie Martin (Lettre motivation)',
    action: 'Relancer par email',
  },
  {
    type: 'success',
    titre: 'Session CAO/DAO - Taux remplissage optimal',
    message: '6 inscrits sur 8 places. Recommandation : ouvrir aux candidats en liste d\'attente CAP ATBJ.',
    action: 'Voir candidats',
  },
  {
    type: 'info',
    titre: 'Opportunité session Sertissage N1',
    message: '4 candidats acceptés + 2 en liste d\'attente. Formateur disponible semaine 35. Proposition de session envisageable.',
    action: 'Créer session',
  },
]

export default function StatistiquesPage() {
  const [periode, setPeriode] = useState<'mois' | 'trimestre' | 'annee'>('mois')
  const [activeSection, setActiveSection] = useState('overview')

  const getTauxEvolution = (valeur: number, variation: number) => {
    return ((variation / valeur) * 100).toFixed(1)
  }

  const getColorByTaux = (taux: number, inverse = false) => {
    if (inverse) {
      if (taux <= 5) return 'text-[rgb(var(--success))]'
      if (taux <= 15) return 'text-[rgb(var(--warning))]'
      return 'text-[rgb(var(--error))]'
    }
    if (taux >= 80) return 'text-[rgb(var(--success))]'
    if (taux >= 60) return 'text-[rgb(var(--warning))]'
    return 'text-[rgb(var(--error))]'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">Statistiques & Analytics</h1>
            <p className="text-[rgb(var(--muted-foreground))] mt-1">
              Tableau de bord analytique : performance, conversion, CA et conformité Qualiopi
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={periode}
              onChange={(e) => setPeriode(e.target.value as any)}
              className="px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
            >
              <option value="mois">Ce mois</option>
              <option value="trimestre">Ce trimestre</option>
              <option value="annee">Cette année</option>
            </select>
            <button className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg hover:bg-[rgb(var(--accent-light))] transition-all flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Exporter rapport
            </button>
          </div>
        </div>

        {/* Alertes IA Marjorie */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-[rgb(var(--accent))]" />
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">Alertes intelligentes Marjorie</h2>
          </div>
          {ALERTES_IA.map((alerte, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border-l-4 ${
                alerte.type === 'warning'
                  ? 'bg-[rgba(var(--warning),0.05)] border-[rgb(var(--warning))]'
                  : alerte.type === 'success'
                  ? 'bg-[rgba(var(--success),0.05)] border-[rgb(var(--success))]'
                  : 'bg-[rgba(var(--accent),0.05)] border-[rgb(var(--accent))]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {alerte.type === 'warning' && <AlertCircle className="w-5 h-5 text-[rgb(var(--warning))]" />}
                    {alerte.type === 'success' && <CheckCircle className="w-5 h-5 text-[rgb(var(--success))]" />}
                    {alerte.type === 'info' && <Target className="w-5 h-5 text-[rgb(var(--accent))]" />}
                    <h3 className="font-semibold text-[rgb(var(--foreground))]">{alerte.titre}</h3>
                  </div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                    {alerte.message}
                  </p>
                </div>
                <button className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg hover:bg-[rgb(var(--accent-light))] transition-all text-sm font-medium flex items-center gap-2">
                  {alerte.action}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* KPIs Principaux */}
        <div>
          <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">Vue d'ensemble</h2>
          <div className="grid grid-cols-4 gap-4">
            {/* Total prospects */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <ArrowUp className="w-4 h-4 text-[rgb(var(--success))]" />
                  <span className="font-medium text-[rgb(var(--success))]">
                    +{getTauxEvolution(STATS_GLOBALES.prospects_total, STATS_GLOBALES.prospects_nouveaux_mois)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Prospects total</p>
              <p className="text-3xl font-bold text-[rgb(var(--foreground))] mt-1">
                {STATS_GLOBALES.prospects_total}
              </p>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
                +{STATS_GLOBALES.prospects_nouveaux_mois} ce mois
              </p>
            </div>

            {/* Candidats actifs */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-[rgb(var(--primary))]" />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <ArrowUp className="w-4 h-4 text-[rgb(var(--success))]" />
                  <span className="font-medium text-[rgb(var(--success))]">
                    +{getTauxEvolution(STATS_GLOBALES.candidats_actifs, STATS_GLOBALES.candidats_nouveaux_mois)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Candidats actifs</p>
              <p className="text-3xl font-bold text-[rgb(var(--accent))] mt-1">
                {STATS_GLOBALES.candidats_actifs}
              </p>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
                +{STATS_GLOBALES.candidats_nouveaux_mois} ce mois
              </p>
            </div>

            {/* Élèves en formation */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <ArrowUp className="w-4 h-4 text-[rgb(var(--success))]" />
                  <span className="font-medium text-[rgb(var(--success))]">
                    +{getTauxEvolution(STATS_GLOBALES.eleves_actifs, STATS_GLOBALES.eleves_nouveaux_mois)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Élèves en formation</p>
              <p className="text-3xl font-bold text-[rgb(var(--success))] mt-1">
                {STATS_GLOBALES.eleves_actifs}
              </p>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
                +{STATS_GLOBALES.eleves_nouveaux_mois} ce mois
              </p>
            </div>

            {/* CA réalisé */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Euro className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="font-medium text-[rgb(var(--muted-foreground))]">
                    {((STATS_GLOBALES.ca_realise / STATS_GLOBALES.ca_objectif_annuel) * 100).toFixed(0)}% objectif
                  </span>
                </div>
              </div>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">CA réalisé</p>
              <p className="text-3xl font-bold text-[rgb(var(--foreground))] mt-1">
                {(STATS_GLOBALES.ca_realise / 1000).toFixed(0)}K€
              </p>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
                Objectif: {(STATS_GLOBALES.ca_objectif_annuel / 1000).toFixed(0)}K€
              </p>
            </div>
          </div>
        </div>

        {/* Pipeline de conversion */}
        <div>
          <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">Pipeline de conversion</h2>
          <div className="card p-8">
            <div className="flex items-center justify-between">
              {/* Prospects */}
              <div className="flex-1 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Prospects</p>
                <p className="text-4xl font-bold text-[rgb(var(--foreground))] mt-2">
                  {STATS_GLOBALES.prospects_total}
                </p>
              </div>

              {/* Flèche + Taux */}
              <div className="flex flex-col items-center px-8">
                <ArrowRight className="w-8 h-8 text-[rgb(var(--accent))] mb-2" />
                <div className="px-4 py-2 rounded-full bg-[rgba(var(--accent),0.1)] border border-[rgba(var(--accent),0.3)]">
                  <p className={`text-2xl font-bold ${getColorByTaux(STATS_GLOBALES.taux_prospect_candidat)}`}>
                    {STATS_GLOBALES.taux_prospect_candidat}%
                  </p>
                </div>
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">Conversion</p>
              </div>

              {/* Candidats */}
              <div className="flex-1 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center mx-auto mb-3">
                  <UserCheck className="w-10 h-10 text-[rgb(var(--primary))]" />
                </div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Candidats</p>
                <p className="text-4xl font-bold text-[rgb(var(--accent))] mt-2">
                  {STATS_GLOBALES.candidats_actifs}
                </p>
              </div>

              {/* Flèche + Taux */}
              <div className="flex flex-col items-center px-8">
                <ArrowRight className="w-8 h-8 text-[rgb(var(--accent))] mb-2" />
                <div className="px-4 py-2 rounded-full bg-[rgba(var(--success),0.1)] border border-[rgba(var(--success),0.3)]">
                  <p className={`text-2xl font-bold ${getColorByTaux(STATS_GLOBALES.taux_candidat_eleve)}`}>
                    {STATS_GLOBALES.taux_candidat_eleve}%
                  </p>
                </div>
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">Inscription</p>
              </div>

              {/* Élèves */}
              <div className="flex-1 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Élèves</p>
                <p className="text-4xl font-bold text-[rgb(var(--success))] mt-2">
                  {STATS_GLOBALES.eleves_actifs}
                </p>
              </div>
            </div>

            {/* Taux global */}
            <div className="mt-8 pt-6 border-t border-[rgba(var(--border),0.3)] text-center">
              <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">Taux de conversion global (Prospect → Élève)</p>
              <p className={`text-5xl font-bold ${getColorByTaux(STATS_GLOBALES.taux_global)}`}>
                {STATS_GLOBALES.taux_global}%
              </p>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-3">
                Délai moyen : {STATS_GLOBALES.delai_moyen_conversion + STATS_GLOBALES.delai_moyen_inscription} jours
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Performance formations */}
          <div>
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">Top formations</h2>
            <div className="card p-6 space-y-4">
              {TOP_FORMATIONS.map((formation, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[rgb(var(--secondary))] rounded-xl hover:bg-[rgba(var(--accent),0.05)] transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                        idx === 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white' :
                        idx === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' :
                        idx === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white' :
                        'bg-[rgb(var(--card))] text-[rgb(var(--muted-foreground))]'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-[rgb(var(--foreground))]">{formation.nom}</p>
                        <p className="text-xs text-[rgb(var(--muted-foreground))]">
                          {formation.nb_candidats} candidats • {formation.nb_eleves} élèves
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getColorByTaux(formation.taux_conversion)}`}>
                        {formation.taux_conversion}%
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">Conversion</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-[rgba(var(--border),0.2)]">
                    <div className="text-center">
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">CA</p>
                      <p className="text-sm font-bold text-[rgb(var(--accent))]">
                        {(formation.ca / 1000).toFixed(0)}K€
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">Satisfaction</p>
                      <p className="text-sm font-bold text-[rgb(var(--warning))]">
                        {formation.satisfaction ? `${formation.satisfaction}/5` : '-'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">Réussite</p>
                      <p className="text-sm font-bold text-[rgb(var(--success))]">
                        {formation.taux_reussite ? `${formation.taux_reussite}%` : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance formateurs */}
          <div>
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">Performance formateurs</h2>
            <div className="card p-6 space-y-4">
              {PERFORMANCE_FORMATEURS.map((formateur, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[rgb(var(--secondary))] rounded-xl hover:bg-[rgba(var(--accent),0.05)] transition-all"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {formateur.nom.split(' ').map(n => n.charAt(0)).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[rgb(var(--foreground))]">{formateur.nom}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formateur.specialites.map((spec, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-xs rounded-md bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] border border-[rgba(var(--accent),0.2)]"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 pt-3 border-t border-[rgba(var(--border),0.2)]">
                    <div className="text-center">
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">Élèves</p>
                      <p className="text-lg font-bold text-[rgb(var(--accent))]">
                        {formateur.nb_eleves}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">Heures</p>
                      <p className="text-lg font-bold text-[rgb(var(--foreground))]">
                        {formateur.heures_total}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">Satisf.</p>
                      <p className="text-lg font-bold text-[rgb(var(--warning))]">
                        {formateur.satisfaction}/5
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">Réussite</p>
                      <p className="text-lg font-bold text-[rgb(var(--success))]">
                        {formateur.taux_reussite}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Financier & Qualiopi */}
        <div className="grid grid-cols-2 gap-6">
          {/* Répartition financements */}
          <div>
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">Répartition des financements</h2>
            <div className="card p-6">
              <div className="space-y-4">
                {FINANCEMENTS.map((financement, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Briefcase className="w-5 h-5 text-[rgb(var(--accent))]" />
                        <span className="font-medium text-[rgb(var(--foreground))]">
                          {financement.type}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[rgb(var(--accent))]">
                          {(financement.montant / 1000).toFixed(0)}K€
                        </p>
                        <p className="text-xs text-[rgb(var(--muted-foreground))]">
                          {financement.nb} dossiers
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-[rgb(var(--secondary))] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))]"
                        style={{ width: `${financement.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-[rgba(var(--border),0.3)]">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">CA prévisionnel total</p>
                  <p className="text-2xl font-bold text-[rgb(var(--accent))]">
                    {(STATS_GLOBALES.ca_previsionnel / 1000).toFixed(0)}K€
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">Reste à charge élèves</p>
                  <p className="text-xl font-bold text-[rgb(var(--foreground))]">
                    {(STATS_GLOBALES.reste_a_charge_total / 1000).toFixed(1)}K€
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Indicateurs Qualiopi */}
          <div>
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">Indicateurs Qualiopi</h2>
            <div className="card p-6 space-y-4">
              {/* Taux réussite */}
              <div className="p-4 bg-[rgba(var(--success),0.05)] border border-[rgba(var(--success),0.2)] rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-[rgb(var(--success))]" />
                    <div>
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">Taux de réussite</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
                        Indicateur 11 - Certification
                      </p>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-[rgb(var(--success))]">
                    {STATS_GLOBALES.taux_reussite_global}%
                  </p>
                </div>
                <div className="w-full h-3 bg-[rgb(var(--secondary))] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                    style={{ width: `${STATS_GLOBALES.taux_reussite_global}%` }}
                  />
                </div>
              </div>

              {/* Taux assiduité */}
              <div className="p-4 bg-[rgba(var(--success),0.05)] border border-[rgba(var(--success),0.2)] rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-[rgb(var(--success))]" />
                    <div>
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">Taux d'assiduité</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
                        Indicateur 12 - Présence
                      </p>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-[rgb(var(--success))]">
                    {STATS_GLOBALES.taux_assiduite_global}%
                  </p>
                </div>
                <div className="w-full h-3 bg-[rgb(var(--secondary))] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                    style={{ width: `${STATS_GLOBALES.taux_assiduite_global}%` }}
                  />
                </div>
              </div>

              {/* Satisfaction */}
              <div className="p-4 bg-[rgba(var(--warning),0.05)] border border-[rgba(var(--warning),0.2)] rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <ThumbsUp className="w-6 h-6 text-[rgb(var(--warning))]" />
                    <div>
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">Satisfaction moyenne</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
                        Indicateur 32 - Enquêtes
                      </p>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-[rgb(var(--warning))]">
                    {STATS_GLOBALES.satisfaction_moyenne}/5
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= Math.floor(STATS_GLOBALES.satisfaction_moyenne)
                          ? 'text-[rgb(var(--warning))] fill-[rgb(var(--warning))]'
                          : 'text-[rgb(var(--muted-foreground))]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Abandons */}
              <div className="p-4 bg-[rgba(var(--success),0.05)] border border-[rgba(var(--success),0.2)] rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-[rgb(var(--success))]" />
                    <div>
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">Taux d'abandon</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
                        {STATS_GLOBALES.nb_abandons_total} abandons / {STATS_GLOBALES.eleves_actifs} élèves
                      </p>
                    </div>
                  </div>
                  <p className={`text-4xl font-bold ${getColorByTaux(
                    (STATS_GLOBALES.nb_abandons_total / STATS_GLOBALES.eleves_actifs) * 100,
                    true
                  )}`}>
                    {((STATS_GLOBALES.nb_abandons_total / STATS_GLOBALES.eleves_actifs) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section graphiques (placeholder) */}
        <div>
          <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">Évolution dans le temps</h2>
          <div className="card p-12 text-center">
            <BarChart3 className="w-20 h-20 text-[rgb(var(--muted-foreground))] mx-auto mb-4 opacity-50" />
            <p className="text-lg text-[rgb(var(--muted-foreground))]">
              Graphiques d'évolution à venir
            </p>
            <p className="text-sm text-[rgb(var(--muted-foreground))] mt-2">
              (CA mensuel, conversion hebdomadaire, satisfaction trimestrielle, etc.)
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
