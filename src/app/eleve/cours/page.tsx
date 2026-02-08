/**
 * Page Cours Élève
 * Bibliothèque de cours et ressources pédagogiques
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  BookOpen,
  Video,
  FileText,
  Download,
  Play,
  CheckCircle,
  Clock,
  Lock,
  Star,
  TrendingUp,
  Award,
  Target,
  Sparkles,
  ChevronRight,
  Search,
  Filter,
  Layers,
  BookMarked,
  Lightbulb,
  Trophy,
  Zap,
  Eye,
} from 'lucide-react'

// Données mockées - Modules de formation
const MOCK_MODULES = [
  {
    id: 1,
    titre: 'Techniques de soudure',
    categorie: 'Pratique',
    progression: 85,
    chapitres: 12,
    chapitresCompletes: 10,
    dureeTotal: '8h30',
    difficulte: 'Intermédiaire',
    statut: 'en_cours',
    prochainChapitre: 'Soudure des métaux précieux',
    badge: { nom: 'Maître soudeur', progression: 85 },
  },
  {
    id: 2,
    titre: 'Dessin technique',
    categorie: 'Théorique',
    progression: 100,
    chapitres: 8,
    chapitresCompletes: 8,
    dureeTotal: '6h00',
    difficulte: 'Débutant',
    statut: 'termine',
    badge: { nom: 'Designer pro', progression: 100 },
  },
  {
    id: 3,
    titre: 'Gemmologie',
    categorie: 'Théorique',
    progression: 60,
    chapitres: 15,
    chapitresCompletes: 9,
    dureeTotal: '12h00',
    difficulte: 'Avancé',
    statut: 'en_cours',
    prochainChapitre: 'Identification des pierres précieuses',
    badge: { nom: 'Expert gemmes', progression: 60 },
  },
  {
    id: 4,
    titre: 'Sertissage',
    categorie: 'Pratique',
    progression: 0,
    chapitres: 10,
    chapitresCompletes: 0,
    dureeTotal: '10h00',
    difficulte: 'Avancé',
    statut: 'verrouille',
    prerequis: 'Terminer Techniques de soudure',
  },
  {
    id: 5,
    titre: 'Histoire de la bijouterie',
    categorie: 'Culture',
    progression: 45,
    chapitres: 6,
    chapitresCompletes: 3,
    dureeTotal: '4h00',
    difficulte: 'Débutant',
    statut: 'en_cours',
    prochainChapitre: 'L\'Art déco',
    badge: { nom: 'Historien joaillier', progression: 45 },
  },
]

// Ressources récentes
const MOCK_RESSOURCES_RECENTES = [
  {
    id: 1,
    titre: 'Techniques de polissage avancées',
    type: 'video',
    duree: '18 min',
    module: 'Techniques de soudure',
    dateAjout: '2024-02-05',
    vues: 45,
  },
  {
    id: 2,
    titre: 'Guide complet des diamants',
    type: 'pdf',
    pages: 24,
    module: 'Gemmologie',
    dateAjout: '2024-02-03',
    telechargements: 89,
  },
  {
    id: 3,
    titre: 'Exercices pratiques - Soudure',
    type: 'exercice',
    questions: 15,
    module: 'Techniques de soudure',
    dateAjout: '2024-02-01',
    completions: 34,
  },
]

// Badges débloqués
const MOCK_BADGES = [
  { nom: 'Premier pas', icone: '🎯', description: 'Premier cours complété', debloque: true },
  { nom: 'Assidu', icone: '⭐', description: '7 jours consécutifs', debloque: true },
  { nom: 'Designer pro', icone: '🎨', description: 'Module dessin terminé', debloque: true },
  { nom: 'Perfectionniste', icone: '💎', description: '100% sur 3 modules', debloque: false },
  { nom: 'Expert', icone: '🏆', description: 'Tous les modules terminés', debloque: false },
]

// Recommandations personnalisées
const MOCK_RECOMMANDATIONS = [
  {
    titre: 'Renforcer vos bases en gemmologie',
    raison: 'Basé sur vos dernières évaluations',
    ressources: 3,
    priorite: 'haute',
  },
  {
    titre: 'Préparer le module Sertissage',
    raison: 'Prochaine étape de votre parcours',
    ressources: 5,
    priorite: 'moyenne',
  },
]

export default function EleveCoursPage() {
  const [activeTab, setActiveTab] = useState('modules')
  const [searchQuery, setSearchQuery] = useState('')

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'termine':
        return 'border-[rgb(var(--success))] bg-[rgba(var(--success),0.1)]'
      case 'en_cours':
        return 'border-[rgb(var(--accent))] bg-[rgba(var(--accent),0.1)]'
      case 'verrouille':
        return 'border-[rgb(var(--muted-foreground))] bg-[rgba(var(--muted-foreground),0.05)]'
      default:
        return 'border-[rgba(var(--border),0.5)]'
    }
  }

  const getProgressionColor = (progression: number) => {
    if (progression === 100) return 'from-[rgb(var(--success))] to-[rgb(var(--success-light))]'
    if (progression >= 50) return 'from-[rgb(var(--accent))] to-[rgb(var(--accent-light))]'
    return 'from-[rgb(var(--warning))] to-[rgb(var(--warning-light))]'
  }

  return (
    <DashboardLayout>
      {/* Header avec recherche */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-2">
              Mes Cours
            </h1>
            <p className="text-[rgb(var(--muted-foreground))]">
              Accédez à tous vos supports de formation
            </p>
          </div>
          <div className="flex gap-3">
            <button className="p-3 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg hover:bg-[rgb(var(--secondary))] transition-colors">
              <Filter className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
              <input
                type="text"
                placeholder="Rechercher un cours..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 w-64 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-2 border-b border-[rgba(var(--border),0.3)]">
          {[
            { id: 'modules', label: 'Modules', icon: Layers },
            { id: 'ressources', label: 'Ressources', icon: BookMarked },
            { id: 'badges', label: 'Badges', icon: Trophy },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[rgb(var(--accent))] text-[rgb(var(--accent))]'
                    : 'border-transparent text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Vue Modules */}
      {activeTab === 'modules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Modules principaux */}
          <div className="lg:col-span-2 space-y-4">
            {MOCK_MODULES.map((module) => (
              <div
                key={module.id}
                className={`p-6 bg-[rgb(var(--card))] border-2 rounded-xl transition-all hover:shadow-lg ${getStatutColor(
                  module.statut
                )}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-[rgb(var(--foreground))]">
                        {module.titre}
                      </h3>
                      {module.statut === 'termine' && (
                        <CheckCircle className="w-6 h-6 text-[rgb(var(--success))] fill-current" />
                      )}
                      {module.statut === 'verrouille' && (
                        <Lock className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[rgb(var(--muted-foreground))]">
                      <span className="px-2 py-1 bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] rounded">
                        {module.categorie}
                      </span>
                      <span>{module.difficulte}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {module.dureeTotal}
                      </span>
                      <span>•</span>
                      <span>
                        {module.chapitresCompletes}/{module.chapitres} chapitres
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-3xl font-bold ${
                        module.progression === 100
                          ? 'text-[rgb(var(--success))]'
                          : 'text-[rgb(var(--accent))]'
                      }`}
                    >
                      {module.progression}%
                    </div>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="mb-4">
                  <div className="h-3 bg-[rgba(var(--secondary),0.5)] rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getProgressionColor(
                        module.progression
                      )} transition-all duration-500 relative`}
                      style={{ width: `${module.progression}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                    </div>
                  </div>
                </div>

                {/* Badge progression */}
                {module.badge && (
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-[rgba(var(--accent),0.1)] to-transparent rounded-lg border-l-2 border-[rgb(var(--accent))]">
                    <Award className="w-5 h-5 text-[rgb(var(--accent))]" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                        {module.badge.nom}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-[rgba(var(--secondary),0.5)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-light))]"
                            style={{ width: `${module.badge.progression}%` }}
                          />
                        </div>
                        <span className="text-xs text-[rgb(var(--muted-foreground))]">
                          {module.badge.progression}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  {module.statut === 'verrouille' ? (
                    <div className="flex-1 py-2 px-4 bg-[rgba(var(--muted-foreground),0.1)] border border-[rgba(var(--muted-foreground),0.2)] text-[rgb(var(--muted-foreground))] rounded-lg text-sm flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      {module.prerequis}
                    </div>
                  ) : module.statut === 'termine' ? (
                    <>
                      <button className="flex-1 py-2 px-4 bg-[rgba(var(--success),0.1)] border border-[rgba(var(--success),0.2)] text-[rgb(var(--success))] rounded-lg text-sm font-medium hover:bg-[rgba(var(--success),0.2)] transition-colors flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        Réviser
                      </button>
                      <button className="flex-1 py-2 px-4 bg-[rgba(var(--info),0.1)] border border-[rgba(var(--info),0.2)] text-[rgb(var(--info))] rounded-lg text-sm font-medium hover:bg-[rgba(var(--info),0.2)] transition-colors flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Télécharger
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="flex-1 py-2 px-4 bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] text-[rgb(var(--primary))] rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2">
                        <Play className="w-4 h-4" />
                        Continuer - {module.prochainChapitre}
                      </button>
                      <button className="py-2 px-4 bg-[rgba(var(--accent),0.1)] border border-[rgba(var(--accent),0.2)] text-[rgb(var(--accent))] rounded-lg text-sm font-medium hover:bg-[rgba(var(--accent),0.2)] transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Statistiques globales */}
            <div className="p-4 bg-gradient-to-br from-[rgba(var(--accent),0.1)] to-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[rgb(var(--accent))]" />
                <h3 className="font-semibold text-[rgb(var(--foreground))]">Votre progression</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[rgb(var(--muted-foreground))]">Modules terminés</span>
                    <span className="font-medium text-[rgb(var(--foreground))]">1/5</span>
                  </div>
                  <div className="h-2 bg-[rgba(var(--secondary),0.5)] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-light))] w-[20%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[rgb(var(--muted-foreground))]">Chapitres complétés</span>
                    <span className="font-medium text-[rgb(var(--foreground))]">30/51</span>
                  </div>
                  <div className="h-2 bg-[rgba(var(--secondary),0.5)] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-light))] w-[59%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[rgb(var(--muted-foreground))]">Temps de formation</span>
                    <span className="font-medium text-[rgb(var(--foreground))]">22h / 40h</span>
                  </div>
                  <div className="h-2 bg-[rgba(var(--secondary),0.5)] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-light))] w-[55%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recommandations IA */}
            <div className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[rgb(var(--accent))]" />
                <h3 className="font-semibold text-[rgb(var(--foreground))]">
                  Recommandations IA
                </h3>
              </div>
              <div className="space-y-3">
                {MOCK_RECOMMANDATIONS.map((reco, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[rgb(var(--secondary))] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {reco.priorite === 'haute' ? (
                        <Zap className="w-4 h-4 text-[rgb(var(--warning))] flex-shrink-0 mt-0.5" />
                      ) : (
                        <Lightbulb className="w-4 h-4 text-[rgb(var(--info))] flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                          {reco.titre}
                        </p>
                        <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2">
                          {reco.raison}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[rgb(var(--accent))]">
                            {reco.ressources} ressources
                          </span>
                          <ChevronRight className="w-3 h-3 text-[rgb(var(--accent))]" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ressources récentes */}
            <div className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[rgb(var(--foreground))]">Récemment ajouté</h3>
                <button className="text-xs text-[rgb(var(--accent))] hover:underline">
                  Voir tout
                </button>
              </div>
              <div className="space-y-3">
                {MOCK_RESSOURCES_RECENTES.map((ressource) => (
                  <div
                    key={ressource.id}
                    className="p-3 bg-[rgb(var(--secondary))] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      {ressource.type === 'video' ? (
                        <div className="w-10 h-10 bg-[rgba(var(--error),0.1)] rounded flex items-center justify-center flex-shrink-0">
                          <Video className="w-5 h-5 text-[rgb(var(--error))]" />
                        </div>
                      ) : ressource.type === 'pdf' ? (
                        <div className="w-10 h-10 bg-[rgba(var(--info),0.1)] rounded flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-[rgb(var(--info))]" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-[rgba(var(--accent),0.1)] rounded flex items-center justify-center flex-shrink-0">
                          <Target className="w-5 h-5 text-[rgb(var(--accent))]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate mb-1">
                          {ressource.titre}
                        </p>
                        <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">
                          {ressource.module}
                        </p>
                        <p className="text-xs text-[rgb(var(--accent))]">
                          {'duree' in ressource && `${ressource.duree}`}
                          {'pages' in ressource && `${ressource.pages} pages`}
                          {'questions' in ressource && `${ressource.questions} questions`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vue Ressources */}
      {activeTab === 'ressources' && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-[rgb(var(--muted-foreground))] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-2">
            Bibliothèque de ressources
          </h3>
          <p className="text-[rgb(var(--muted-foreground))]">
            Fonctionnalité en cours de développement
          </p>
        </div>
      )}

      {/* Vue Badges */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {MOCK_BADGES.map((badge, idx) => (
            <div
              key={idx}
              className={`p-6 bg-[rgb(var(--card))] border-2 rounded-xl text-center transition-all ${
                badge.debloque
                  ? 'border-[rgb(var(--accent))] hover:shadow-lg'
                  : 'border-[rgba(var(--border),0.3)] opacity-50'
              }`}
            >
              <div className="text-5xl mb-3">{badge.icone}</div>
              <h3 className="font-semibold text-[rgb(var(--foreground))] mb-2">
                {badge.nom}
              </h3>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">{badge.description}</p>
              {badge.debloque && (
                <div className="mt-3 flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4 text-[rgb(var(--success))]" />
                  <span className="text-xs text-[rgb(var(--success))]">Débloqué</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
