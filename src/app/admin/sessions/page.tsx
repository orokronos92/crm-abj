/**
 * Page Sessions
 * Gestion des sessions de formation avec onglets de filtrage
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Users,
  Calendar,
  MapPin,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Edit,
  Trash2,
  Mail,
  Download,
  UserPlus,
  Eye,
  BarChart3,
  FileText,
} from 'lucide-react'

// Mock data sessions
const MOCK_SESSIONS = [
  {
    id: 1,
    formation: 'CAP Art du Bijou et du Joyau',
    code_formation: 'CAP_ATBJ',
    nom_session: 'CAP ATBJ - Promotion Mars 2024',
    date_debut: '15/03/2024',
    date_fin: '15/09/2024',
    duree_jours: 120,
    duree_heures: 840,

    // Places
    capacite_max: 12,
    places_prises: 11,
    liste_attente: 3,

    // Formateurs
    formateur_principal: 'Michel Laurent',
    formateurs_secondaires: ['Sophie Petit'],

    // Salle
    salle: 'Atelier A',

    // Statut
    statut: 'EN_COURS',

    // Progression
    heures_effectuees: 520,
    prochaine_eval: '15/02/2024',

    // Stats
    moyenne_session: 14.8,
    taux_assiduite: 94,
    nb_abandons: 1,

    // Élèves
    eleves: [
      { id: 1, nom: 'Fontaine', prenom: 'Chloé', moyenne: 16.1, absences: 2 },
      { id: 2, nom: 'Martin', prenom: 'Lucas', moyenne: 14.2, absences: 5 },
      { id: 3, nom: 'Dubois', prenom: 'Emma', moyenne: 15.8, absences: 1 },
    ],
  },
  {
    id: 2,
    formation: 'Sertissage Niveau 2',
    code_formation: 'SERTI_N2',
    nom_session: 'Sertissage N2 - Février 2024',
    date_debut: '05/02/2024',
    date_fin: '05/05/2024',
    duree_jours: 60,
    duree_heures: 420,

    capacite_max: 6,
    places_prises: 5,
    liste_attente: 0,

    formateur_principal: 'Michel Laurent',
    formateurs_secondaires: [],

    salle: 'Atelier B',

    statut: 'EN_COURS',

    heures_effectuees: 380,
    prochaine_eval: '20/02/2024',

    moyenne_session: 15.2,
    taux_assiduite: 97,
    nb_abandons: 0,

    eleves: [
      { id: 4, nom: 'Barbier', prenom: 'Maxime', moyenne: 13.1, absences: 8 },
      { id: 5, nom: 'Rousseau', prenom: 'Sophie', moyenne: 16.8, absences: 0 },
    ],
  },
  {
    id: 3,
    formation: 'CAO/DAO Bijouterie',
    code_formation: 'CAO_DAO',
    nom_session: 'CAO/DAO - Inscriptions Avril 2024',
    date_debut: '15/04/2024',
    date_fin: '15/07/2024',
    duree_jours: 45,
    duree_heures: 315,

    capacite_max: 8,
    places_prises: 4,
    liste_attente: 0,

    formateur_principal: 'Sophie Petit',
    formateurs_secondaires: [],

    salle: 'Salle informatique',

    statut: 'INSCRIPTIONS_OUVERTES',

    heures_effectuees: 0,
    prochaine_eval: null,

    moyenne_session: null,
    taux_assiduite: null,
    nb_abandons: 0,

    eleves: [],
  },
  {
    id: 4,
    formation: 'Joaillerie Création',
    code_formation: 'JOAIL_CREA',
    nom_session: 'Joaillerie Création - Session Juin 2024',
    date_debut: '10/06/2024',
    date_fin: '10/12/2024',
    duree_jours: 100,
    duree_heures: 700,

    capacite_max: 10,
    places_prises: 6,
    liste_attente: 2,

    formateur_principal: 'Michel Laurent',
    formateurs_secondaires: ['Antoine Dubois'],

    salle: 'Atelier C',

    statut: 'INSCRIPTIONS_OUVERTES',

    heures_effectuees: 0,
    prochaine_eval: null,

    moyenne_session: null,
    taux_assiduite: null,
    nb_abandons: 0,

    eleves: [],
  },
  {
    id: 5,
    formation: 'Sertissage Niveau 1',
    code_formation: 'SERTI_N1',
    nom_session: 'Sertissage N1 - Septembre 2024',
    date_debut: '15/09/2024',
    date_fin: '15/12/2024',
    duree_jours: 50,
    duree_heures: 350,

    capacite_max: 8,
    places_prises: 0,
    liste_attente: 0,

    formateur_principal: 'Michel Laurent',
    formateurs_secondaires: [],

    salle: 'Atelier B',

    statut: 'A_VENIR',

    heures_effectuees: 0,
    prochaine_eval: null,

    moyenne_session: null,
    taux_assiduite: null,
    nb_abandons: 0,

    eleves: [],
  },
  {
    id: 6,
    formation: 'CAP Art du Bijou et du Joyau',
    code_formation: 'CAP_ATBJ',
    nom_session: 'CAP ATBJ - Promotion Septembre 2023',
    date_debut: '15/09/2023',
    date_fin: '15/03/2024',
    duree_jours: 120,
    duree_heures: 840,

    capacite_max: 12,
    places_prises: 12,
    liste_attente: 0,

    formateur_principal: 'Michel Laurent',
    formateurs_secondaires: ['Sophie Petit'],

    salle: 'Atelier A',

    statut: 'TERMINEE',

    heures_effectuees: 840,
    prochaine_eval: null,

    moyenne_session: 15.4,
    taux_assiduite: 96,
    nb_abandons: 0,

    eleves: [],
  },
]

const STATUT_COLORS: Record<string, string> = {
  'EN_COURS': 'bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))] border border-[rgba(var(--success),0.3)]',
  'INSCRIPTIONS_OUVERTES': 'bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] border border-[rgba(var(--accent),0.3)]',
  'A_VENIR': 'bg-[rgba(var(--info),0.1)] text-[rgb(var(--info))] border border-[rgba(var(--info),0.3)]',
  'TERMINEE': 'bg-[rgba(var(--muted),0.1)] text-[rgb(var(--muted-foreground))] border border-[rgba(var(--border),0.3)]',
}

const STATUT_LABELS: Record<string, string> = {
  'EN_COURS': 'En cours',
  'INSCRIPTIONS_OUVERTES': 'Inscriptions ouvertes',
  'A_VENIR': 'À venir',
  'TERMINEE': 'Terminée',
}

type StatutFilter = 'TOUS' | 'EN_COURS' | 'INSCRIPTIONS_OUVERTES' | 'A_VENIR' | 'TERMINEE'

export default function SessionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<StatutFilter>('TOUS')
  const [selectedSession, setSelectedSession] = useState<typeof MOCK_SESSIONS[0] | null>(null)
  const [activeTab, setActiveTab] = useState('synthese')

  const filteredSessions = MOCK_SESSIONS.filter(session => {
    const matchesSearch = session.nom_session.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.formation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.formateur_principal.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = activeFilter === 'TOUS' || session.statut === activeFilter

    return matchesSearch && matchesFilter
  })

  const getProgressionColor = (pct: number) => {
    if (pct >= 80) return 'text-[rgb(var(--success))]'
    if (pct >= 50) return 'text-[rgb(var(--accent))]'
    return 'text-[rgb(var(--warning))]'
  }

  const getTauxRemplissage = (session: typeof MOCK_SESSIONS[0]) => {
    return Math.round((session.places_prises / session.capacite_max) * 100)
  }

  const getProgressionHeures = (session: typeof MOCK_SESSIONS[0]) => {
    return Math.round((session.heures_effectuees / session.duree_heures) * 100)
  }

  // Stats par filtre
  const statsParStatut = {
    TOUS: MOCK_SESSIONS.length,
    EN_COURS: MOCK_SESSIONS.filter(s => s.statut === 'EN_COURS').length,
    INSCRIPTIONS_OUVERTES: MOCK_SESSIONS.filter(s => s.statut === 'INSCRIPTIONS_OUVERTES').length,
    A_VENIR: MOCK_SESSIONS.filter(s => s.statut === 'A_VENIR').length,
    TERMINEE: MOCK_SESSIONS.filter(s => s.statut === 'TERMINEE').length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">Sessions de formation</h1>
            <p className="text-[rgb(var(--muted-foreground))] mt-1">
              Gestion des sessions en cours, inscriptions et planification
            </p>
          </div>
          <button className="px-6 py-3 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nouvelle session
          </button>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-5 gap-4">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Total sessions</p>
                <p className="text-3xl font-bold text-[rgb(var(--foreground))] mt-1">
                  {MOCK_SESSIONS.length}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-[rgb(var(--accent))]" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">En cours</p>
                <p className="text-3xl font-bold text-[rgb(var(--success))] mt-1">
                  {statsParStatut.EN_COURS}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-[rgb(var(--success))]" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Inscriptions ouvertes</p>
                <p className="text-3xl font-bold text-[rgb(var(--accent))] mt-1">
                  {statsParStatut.INSCRIPTIONS_OUVERTES}
                </p>
              </div>
              <UserPlus className="w-8 h-8 text-[rgb(var(--accent))]" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Élèves total</p>
                <p className="text-3xl font-bold text-[rgb(var(--foreground))] mt-1">
                  {MOCK_SESSIONS.reduce((sum, s) => sum + s.places_prises, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-[rgb(var(--foreground))]" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Places disponibles</p>
                <p className="text-3xl font-bold text-[rgb(var(--accent))] mt-1">
                  {MOCK_SESSIONS.reduce((sum, s) => sum + (s.capacite_max - s.places_prises), 0)}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-[rgb(var(--accent))]" />
            </div>
          </div>
        </div>

        {/* Filtres par onglets */}
        <div className="card p-1">
          <div className="flex gap-2">
            {(['TOUS', 'EN_COURS', 'INSCRIPTIONS_OUVERTES', 'A_VENIR', 'TERMINEE'] as StatutFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === filter
                    ? 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))]'
                    : 'text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--secondary))]'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>{filter === 'TOUS' ? 'Toutes' : STATUT_LABELS[filter]}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeFilter === filter
                      ? 'bg-[rgba(var(--primary),0.2)] text-[rgb(var(--primary))]'
                      : 'bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))]'
                  }`}>
                    {statsParStatut[filter]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recherche */}
        <div className="card p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
              <input
                type="text"
                placeholder="Rechercher une session, formation ou formateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
              />
            </div>
          </div>
        </div>

        {/* Grille sessions */}
        <div className="grid grid-cols-1 gap-4">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => setSelectedSession(session)}
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
                            {session.nom_session}
                          </h3>
                          <p className="text-sm text-[rgb(var(--muted-foreground))]">
                            {session.formation}
                          </p>
                        </div>
                        <span className={`px-4 py-1.5 text-sm rounded-full ${STATUT_COLORS[session.statut]}`}>
                          {STATUT_LABELS[session.statut]}
                        </span>
                      </div>

                      <div className="grid grid-cols-6 gap-4 mt-4">
                        {/* Dates */}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[rgb(var(--accent))]" />
                          <div>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">Période</p>
                            <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                              {session.date_debut} → {session.date_fin}
                            </p>
                          </div>
                        </div>

                        {/* Formateur */}
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-[rgb(var(--accent))]" />
                          <div>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">Formateur</p>
                            <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                              {session.formateur_principal}
                            </p>
                          </div>
                        </div>

                        {/* Salle */}
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[rgb(var(--accent))]" />
                          <div>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">Salle</p>
                            <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                              {session.salle}
                            </p>
                          </div>
                        </div>

                        {/* Places */}
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[rgb(var(--accent))]" />
                          <div>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">Places</p>
                            <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                              {session.places_prises}/{session.capacite_max}
                              {session.liste_attente > 0 && (
                                <span className="ml-1 text-xs text-[rgb(var(--warning))]">
                                  (+{session.liste_attente} attente)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Durée */}
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[rgb(var(--accent))]" />
                          <div>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">Durée</p>
                            <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                              {session.duree_heures}h ({session.duree_jours}j)
                            </p>
                          </div>
                        </div>

                        {/* Progression ou Taux remplissage */}
                        {session.statut === 'EN_COURS' ? (
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[rgb(var(--success))]" />
                            <div>
                              <p className="text-xs text-[rgb(var(--muted-foreground))]">Progression</p>
                              <p className={`text-sm font-bold ${getProgressionColor(getProgressionHeures(session))}`}>
                                {getProgressionHeures(session)}%
                              </p>
                            </div>
                          </div>
                        ) : session.statut === 'INSCRIPTIONS_OUVERTES' ? (
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-[rgb(var(--accent))]" />
                            <div>
                              <p className="text-xs text-[rgb(var(--muted-foreground))]">Remplissage</p>
                              <p className={`text-sm font-bold ${getProgressionColor(getTauxRemplissage(session))}`}>
                                {getTauxRemplissage(session)}%
                              </p>
                            </div>
                          </div>
                        ) : session.statut === 'TERMINEE' && session.moyenne_session ? (
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-[rgb(var(--success))]" />
                            <div>
                              <p className="text-xs text-[rgb(var(--muted-foreground))]">Moyenne</p>
                              <p className="text-sm font-bold text-[rgb(var(--success))]">
                                {session.moyenne_session.toFixed(1)}/20
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredSessions.length === 0 && (
            <div className="card p-12 text-center">
              <BookOpen className="w-16 h-16 text-[rgb(var(--muted-foreground))] mx-auto mb-4 opacity-50" />
              <p className="text-lg text-[rgb(var(--muted-foreground))]">
                Aucune session trouvée
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal fiche session détaillée */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-6xl h-[90vh] bg-[rgb(var(--card))] rounded-2xl shadow-2xl flex flex-col">
            {/* Header session */}
            <div className="p-6 border-b border-[rgba(var(--border),0.3)]">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-10 h-10 text-[rgb(var(--primary))]" />
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-2">
                      {selectedSession.nom_session}
                    </h2>
                    <p className="text-lg text-[rgb(var(--muted-foreground))] mb-3">
                      {selectedSession.formation}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 text-sm rounded-full ${STATUT_COLORS[selectedSession.statut]}`}>
                        {STATUT_LABELS[selectedSession.statut]}
                      </span>
                      <span className="px-4 py-1.5 text-sm rounded-full bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] border border-[rgba(var(--accent),0.3)]">
                        {selectedSession.duree_heures}h - {selectedSession.duree_jours} jours
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedSession(null)}
                  className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                </button>
              </div>

              {/* Stats session */}
              <div className="grid grid-cols-5 gap-4 mt-6">
                <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
                  <p className="text-3xl font-bold text-[rgb(var(--accent))]">
                    {selectedSession.places_prises}/{selectedSession.capacite_max}
                  </p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Places prises</p>
                </div>

                {selectedSession.statut === 'EN_COURS' && (
                  <>
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
                      <p className={`text-3xl font-bold ${getProgressionColor(getProgressionHeures(selectedSession))}`}>
                        {getProgressionHeures(selectedSession)}%
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Progression</p>
                    </div>
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
                      <p className="text-3xl font-bold text-[rgb(var(--success))]">
                        {selectedSession.moyenne_session?.toFixed(1) || '-'}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Moyenne /20</p>
                    </div>
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
                      <p className="text-3xl font-bold text-[rgb(var(--success))]">
                        {selectedSession.taux_assiduite || '-'}%
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Assiduité</p>
                    </div>
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
                      <p className={`text-3xl font-bold ${selectedSession.nb_abandons > 0 ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--foreground))]'}`}>
                        {selectedSession.nb_abandons}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Abandons</p>
                    </div>
                  </>
                )}

                {selectedSession.statut === 'INSCRIPTIONS_OUVERTES' && (
                  <>
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
                      <p className={`text-3xl font-bold ${getProgressionColor(getTauxRemplissage(selectedSession))}`}>
                        {getTauxRemplissage(selectedSession)}%
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Taux remplissage</p>
                    </div>
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
                      <p className="text-3xl font-bold text-[rgb(var(--accent))]">
                        {selectedSession.capacite_max - selectedSession.places_prises}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Places restantes</p>
                    </div>
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
                      <p className="text-3xl font-bold text-[rgb(var(--warning))]">
                        {selectedSession.liste_attente}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Liste d'attente</p>
                    </div>
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
                      <p className="text-lg font-bold text-[rgb(var(--accent))]">
                        {selectedSession.date_debut}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Début session</p>
                    </div>
                  </>
                )}
              </div>

              {/* Onglets en forme de dossier */}
              <div className="flex gap-1 pt-4">
                {[
                  { key: 'synthese', label: 'Synthèse', icon: FileText },
                  { key: 'eleves', label: `Élèves (${selectedSession.places_prises})`, icon: Users },
                  { key: 'planning', label: 'Planning', icon: Calendar }
                ].map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`
                        relative px-6 py-3 rounded-t-lg font-medium text-sm transition-all
                        ${isActive
                          ? 'bg-[rgb(var(--card))] text-[rgb(var(--accent))] border-t-2 border-[rgb(var(--accent))] -mb-px'
                          : 'bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgba(var(--accent),0.05)]'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[rgb(var(--accent))]' : ''}`} />
                        <span>{tab.label}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Contenu tabs */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Tab Synthèse */}
              {activeTab === 'synthese' && (
                <div className="space-y-6">
                  {/* Informations générales */}
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">Informations générales</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-[rgb(var(--accent))]" />
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">Période</p>
                        </div>
                        <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                          Du {selectedSession.date_debut} au {selectedSession.date_fin}
                        </p>
                      </div>

                      <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-[rgb(var(--accent))]" />
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">Formateur principal</p>
                        </div>
                        <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                          {selectedSession.formateur_principal}
                        </p>
                      </div>

                      <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-[rgb(var(--accent))]" />
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">Salle</p>
                        </div>
                        <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                          {selectedSession.salle}
                        </p>
                      </div>

                      <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-[rgb(var(--accent))]" />
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">Durée totale</p>
                        </div>
                        <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                          {selectedSession.duree_heures}h ({selectedSession.duree_jours} jours)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Formateurs secondaires */}
                  {selectedSession.formateurs_secondaires.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-3">Formateurs secondaires</h3>
                      <div className="space-y-2">
                        {selectedSession.formateurs_secondaires.map((formateur, idx) => (
                          <div key={idx} className="p-3 bg-[rgb(var(--secondary))] rounded-lg flex items-center gap-3">
                            <Award className="w-5 h-5 text-[rgb(var(--accent))]" />
                            <p className="text-sm font-medium text-[rgb(var(--foreground))]">{formateur}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions rapides */}
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-3">Actions rapides</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <button className="p-4 bg-[rgb(var(--secondary))] rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-all flex items-center gap-3">
                        <Mail className="w-5 h-5 text-[rgb(var(--accent))]" />
                        <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                          Contacter les élèves
                        </span>
                      </button>
                      <button className="p-4 bg-[rgb(var(--secondary))] rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-all flex items-center gap-3">
                        <Download className="w-5 h-5 text-[rgb(var(--accent))]" />
                        <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                          Exporter liste émargement
                        </span>
                      </button>
                      <button className="p-4 bg-[rgb(var(--secondary))] rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-all flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[rgb(var(--accent))]" />
                        <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                          Générer rapport Qualiopi
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Élèves */}
              {activeTab === 'eleves' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                      Élèves inscrits ({selectedSession.places_prises}/{selectedSession.capacite_max})
                    </h3>
                    {selectedSession.statut === 'INSCRIPTIONS_OUVERTES' && (
                      <button className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg hover:bg-[rgb(var(--accent-light))] transition-all flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Ajouter un élève
                      </button>
                    )}
                  </div>

                  {selectedSession.eleves.length > 0 ? (
                    <div className="space-y-2">
                      {selectedSession.eleves.map((eleve) => (
                        <div
                          key={eleve.id}
                          className="p-4 bg-[rgb(var(--secondary))] rounded-lg flex items-center justify-between hover:bg-[rgba(var(--accent),0.05)] transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                              {eleve.prenom.charAt(0)}{eleve.nom.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-[rgb(var(--foreground))]">
                                {eleve.prenom} {eleve.nom}
                              </p>
                              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                                {eleve.absences} absence{eleve.absences > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-[rgb(var(--muted-foreground))]">Moyenne</p>
                              <p className="text-xl font-bold text-[rgb(var(--accent))]">
                                {eleve.moyenne.toFixed(1)}
                              </p>
                            </div>
                            <button className="p-2 hover:bg-[rgb(var(--card))] rounded-lg transition-colors">
                              <Eye className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-[rgb(var(--secondary))] rounded-lg">
                      <Users className="w-16 h-16 text-[rgb(var(--muted-foreground))] mx-auto mb-4 opacity-50" />
                      <p className="text-[rgb(var(--muted-foreground))]">
                        {selectedSession.statut === 'INSCRIPTIONS_OUVERTES'
                          ? 'Aucun élève inscrit pour le moment'
                          : 'Aucun élève dans cette session'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab Planning */}
              {activeTab === 'planning' && (
                <div className="p-12 text-center bg-[rgb(var(--secondary))] rounded-lg">
                  <Calendar className="w-16 h-16 text-[rgb(var(--muted-foreground))] mx-auto mb-4 opacity-50" />
                  <p className="text-[rgb(var(--muted-foreground))]">
                    Planning détaillé à venir (calendrier dynamique)
                  </p>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
              <div className="flex items-center justify-between">
                <button className="px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary))] transition-all flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contacter formateur
                </button>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] hover:bg-[rgb(var(--accent))] hover:text-[rgb(var(--primary))] transition-all flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  <button className="px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--error),0.5)] rounded-lg text-[rgb(var(--error))] hover:bg-[rgb(var(--error))] hover:text-white transition-all flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
