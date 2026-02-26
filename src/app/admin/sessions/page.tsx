/**
 * Page Sessions
 * Gestion des sessions de formation avec onglets de filtrage
 */

'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SessionFormModal } from '@/components/admin/SessionFormModal'
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


const STATUT_COLORS: Record<string, string> = {
  'EN_COURS': 'bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))] border border-[rgba(var(--success),0.3)]',
  'INSCRIPTIONS_OUVERTES': 'bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] border border-[rgba(var(--accent),0.3)]',
  'A_VENIR': 'bg-[rgba(var(--info),0.1)] text-[rgb(var(--info))] border border-[rgba(var(--info),0.3)]',
  'TERMINEE': 'bg-[rgba(var(--muted),0.1)] text-[rgb(var(--muted-foreground))] border border-[rgba(var(--border),0.3)]',
  'EN_ANALYSE': 'bg-[rgba(var(--warning),0.1)] text-[rgb(var(--warning))] border border-[rgba(var(--warning),0.3)]',
  'VALIDE': 'bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))] border border-[rgba(var(--success),0.3)]',
  'REFUSE': 'bg-[rgba(var(--error),0.1)] text-[rgb(var(--error))] border border-[rgba(var(--error),0.3)]',
  'DIFFUSEE': 'bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] border border-[rgba(var(--accent),0.3)]',
}

const STATUT_LABELS: Record<string, string> = {
  'EN_COURS': 'En cours',
  'INSCRIPTIONS_OUVERTES': 'Inscriptions ouvertes',
  'A_VENIR': 'À venir',
  'TERMINEE': 'Terminée',
  'EN_ANALYSE': 'En analyse',
  'VALIDE': 'Validé',
  'REFUSE': 'Refusé',
  'DIFFUSEE': 'Diffusée',
}

type StatutFilter = 'TOUS' | 'EN_COURS' | 'INSCRIPTIONS_OUVERTES' | 'A_VENIR' | 'TERMINEE' | 'EN_ANALYSE' | 'VALIDE' | 'REFUSE' | 'DIFFUSEE'

interface Session {
  id: number
  formation: string
  code_formation: string
  nom_session: string | null
  formateur_principal: string
  salle: string
  capacite_max: number
  places_prises: number
  liste_attente?: number
  date_debut: string
  date_fin: string
  statut: string
  statut_session: string
  planning_ia?: any
  rapport_ia?: string | null
  notes?: string | null
  duree_jours: number
  duree_heures: number
  heures_effectuees?: number
  formateurs_secondaires: string[]
  moyenne_session?: number
  taux_assiduite?: number
  nb_abandons?: number
  prochaine_eval?: string
  eleves?: Array<{
    idInscription: number
    id: number
    type: 'eleve' | 'candidat'
    nom: string
    prenom: string
    numeroDossier: string
    statutInscription: string
    priorite: number
    moyenne: number
    absences: number
    positionAttente?: number | null
    dateInscription?: string | null
  }>
  inscrits?: Array<{
    idInscription: number
    id: number
    type: 'eleve' | 'candidat'
    nom: string
    prenom: string
    numeroDossier: string
    statutInscription: string
    priorite: number
    moyenne: number
    absences: number
    dateInscription?: string | null
  }>
  listeAttente?: Array<{
    idInscription: number
    id: number
    type: 'eleve' | 'candidat'
    nom: string
    prenom: string
    numeroDossier: string
    statutInscription: string
    priorite: number
    positionAttente: number
    dateInscription?: string | null
  }>
}

export default function SessionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<StatutFilter>('TOUS')
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [activeTab, setActiveTab] = useState('synthese')
  const [modalSessionOuverte, setModalSessionOuverte] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingEleves, setLoadingEleves] = useState(false)
  const [desistementEnCours, setDesistementEnCours] = useState<number | null>(null)
  const [desistementMessage, setDesistementMessage] = useState<string | null>(null)

  // Charger les sessions depuis l'API
  const loadSessions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/sessions')
      const data = await response.json()

      if (data.success) {
        setSessions(data.sessions)
      } else {
        console.error('Erreur chargement sessions:', data.error)
      }
    } catch (error) {
      console.error('Erreur fetch sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Charger les élèves d'une session depuis l'API
  const loadElevesSession = async (session: Session) => {
    try {
      setLoadingEleves(true)
      const response = await fetch(`/api/sessions/${session.id}`)
      const data = await response.json()

      if (data.success) {
        setSelectedSession({
          ...session,
          eleves: data.eleves,
          inscrits: data.inscrits,
          listeAttente: data.listeAttente,
        })
      }
    } catch (error) {
      console.error('Erreur fetch élèves session:', error)
    } finally {
      setLoadingEleves(false)
    }
  }

  // Désister un participant (inscrit ou liste d'attente)
  const handleDesistement = async (idInscription: number, nomParticipant: string) => {
    if (!selectedSession) return
    if (!confirm(`Désister ${nomParticipant} de cette session ?`)) return

    setDesistementEnCours(idInscription)
    setDesistementMessage(null)
    try {
      const response = await fetch(`/api/sessions/${selectedSession.id}/desister`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idInscription })
      })
      const data = await response.json()

      if (data.success) {
        setDesistementMessage(data.message)
        // Recharger les élèves de la session
        await loadElevesSession(selectedSession)
        // Aussi rafraîchir les compteurs de la session dans la liste
        await loadSessions()
      } else {
        setDesistementMessage(data.error || 'Erreur lors du désistement')
      }
    } catch (error) {
      console.error('Erreur désistement:', error)
      setDesistementMessage('Erreur réseau')
    } finally {
      setDesistementEnCours(null)
    }
  }

  // Charger les sessions au montage du composant
  useEffect(() => {
    loadSessions()
  }, [])

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = (session.nom_session ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (session.formation ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (session.formateur_principal ?? '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = activeFilter === 'TOUS' || session.statut_session === activeFilter

    return matchesSearch && matchesFilter
  })

  const formatDate = (isoDate: string) => {
    if (!isoDate) return '-'
    // Accepte YYYY-MM-DD ou déjà formaté DD/MM/YYYY
    if (isoDate.includes('/')) return isoDate
    const [y, m, d] = isoDate.split('-')
    return `${d}/${m}/${y}`
  }

  const getProgressionColor = (pct: number) => {
    if (pct >= 80) return 'text-[rgb(var(--success))]'
    if (pct >= 50) return 'text-[rgb(var(--accent))]'
    return 'text-[rgb(var(--warning))]'
  }

  const getTauxRemplissage = (session: Session) => {
    return Math.round((session.places_prises / session.capacite_max) * 100)
  }

  const getProgressionHeures = (session: Session) => {
    if (!session.heures_effectuees || !session.duree_heures) return 0
    return Math.round((session.heures_effectuees / session.duree_heures) * 100)
  }

  // Stats par filtre
  const statsParStatut = {
    TOUS: sessions.length,
    EN_COURS: sessions.filter(s => s.statut_session === 'EN_COURS').length,
    INSCRIPTIONS_OUVERTES: sessions.filter(s => s.statut_session === 'INSCRIPTIONS_OUVERTES').length,
    A_VENIR: sessions.filter(s => s.statut_session === 'A_VENIR').length,
    TERMINEE: sessions.filter(s => s.statut_session === 'TERMINEE').length,
    EN_ANALYSE: sessions.filter(s => s.statut_session === 'EN_ANALYSE').length,
    VALIDE: sessions.filter(s => s.statut_session === 'VALIDE').length,
    REFUSE: sessions.filter(s => s.statut_session === 'REFUSE').length,
    DIFFUSEE: sessions.filter(s => s.statut_session === 'DIFFUSEE').length,
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header/Stats/Filtres/Recherche - partie fixe (ne scroll jamais) */}
        <div className="flex-shrink-0 space-y-4 pb-6 border-b border-[rgba(var(--border),0.2)]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">Sessions de formation</h1>
              <p className="text-[rgb(var(--muted-foreground))] mt-1">
                Gestion des sessions en cours, inscriptions et planification
              </p>
            </div>
            <button
              onClick={() => setModalSessionOuverte(true)}
              className="px-6 py-3 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-all flex items-center gap-2"
            >
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
                  {sessions.length}
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
                <p className="text-sm text-[rgb(var(--muted-foreground))]">En analyse</p>
                <p className="text-3xl font-bold text-[rgb(var(--warning))] mt-1">
                  {statsParStatut.EN_ANALYSE}
                </p>
              </div>
              <Clock className="w-8 h-8 text-[rgb(var(--warning))]" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Élèves total</p>
                <p className="text-3xl font-bold text-[rgb(var(--foreground))] mt-1">
                  {sessions.reduce((sum, s) => sum + s.places_prises, 0)}
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
                  {sessions.reduce((sum, s) => sum + (s.capacite_max - s.places_prises), 0)}
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
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto pt-6">
          {/* État de chargement */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-[rgb(var(--muted-foreground))]">
                <div className="w-5 h-5 border-2 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin" />
                <span>Chargement des sessions...</span>
              </div>
            </div>
          )}

          {/* Grille sessions */}
          {!loading && (
          <div className="grid grid-cols-1 gap-4">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => loadElevesSession(session)}
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
                        <span className={`px-4 py-1.5 text-sm rounded-full ${STATUT_COLORS[session.statut_session] || STATUT_COLORS[session.statut] || ''}`}>
                          {STATUT_LABELS[session.statut_session] || STATUT_LABELS[session.statut] || session.statut_session}
                        </span>
                      </div>

                      <div className="grid grid-cols-6 gap-4 mt-4">
                        {/* Dates */}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[rgb(var(--accent))]" />
                          <div>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">Période</p>
                            <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                              {formatDate(session.date_debut)} → {formatDate(session.date_fin)}
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
                              {session.liste_attente && session.liste_attente > 0 && (
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
                        {session.statut_session === 'EN_COURS' ? (
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[rgb(var(--success))]" />
                            <div>
                              <p className="text-xs text-[rgb(var(--muted-foreground))]">Progression</p>
                              <p className={`text-sm font-bold ${getProgressionColor(getProgressionHeures(session))}`}>
                                {getProgressionHeures(session)}%
                              </p>
                            </div>
                          </div>
                        ) : session.statut_session === 'INSCRIPTIONS_OUVERTES' ? (
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-[rgb(var(--accent))]" />
                            <div>
                              <p className="text-xs text-[rgb(var(--muted-foreground))]">Remplissage</p>
                              <p className={`text-sm font-bold ${getProgressionColor(getTauxRemplissage(session))}`}>
                                {getTauxRemplissage(session)}%
                              </p>
                            </div>
                          </div>
                        ) : session.statut_session === 'TERMINEE' && session.moyenne_session ? (
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
                      <span className={`px-4 py-1.5 text-sm rounded-full ${STATUT_COLORS[selectedSession.statut_session] || STATUT_COLORS[selectedSession.statut] || ''}`}>
                        {STATUT_LABELS[selectedSession.statut_session] || STATUT_LABELS[selectedSession.statut] || selectedSession.statut_session}
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

                {selectedSession.statut_session === 'EN_COURS' && (
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
                      <p className={`text-3xl font-bold ${(selectedSession.nb_abandons ?? 0) > 0 ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--foreground))]'}`}>
                        {selectedSession.nb_abandons ?? 0}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Abandons</p>
                    </div>
                  </>
                )}

                {selectedSession.statut_session === 'INSCRIPTIONS_OUVERTES' && (
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
                        {selectedSession.liste_attente ?? 0}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Liste d'attente</p>
                    </div>
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
                      <p className="text-lg font-bold text-[rgb(var(--accent))]">
                        {formatDate(selectedSession.date_debut)}
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
                  {
                    key: 'eleves',
                    label: selectedSession.listeAttente?.length
                      ? `Élèves (${selectedSession.inscrits?.length ?? selectedSession.places_prises}+${selectedSession.listeAttente.length})`
                      : `Élèves (${selectedSession.inscrits?.length ?? selectedSession.places_prises})`,
                    icon: Users
                  },
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
                          Du {formatDate(selectedSession.date_debut)} au {formatDate(selectedSession.date_fin)}
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
                  {selectedSession.formateurs_secondaires && selectedSession.formateurs_secondaires.length > 0 && (
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
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                        Inscrits : {selectedSession.inscrits?.length ?? selectedSession.places_prises}/{selectedSession.capacite_max}
                      </h3>
                      {(selectedSession.listeAttente?.length ?? 0) > 0 && (
                        <span className="px-2 py-0.5 bg-[rgba(var(--warning),0.1)] text-[rgb(var(--warning))] text-xs font-medium rounded-full border border-[rgba(var(--warning),0.3)]">
                          {selectedSession.listeAttente!.length} en attente
                        </span>
                      )}
                    </div>
                    <button className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg hover:bg-[rgb(var(--accent))]/90 transition-all flex items-center gap-2 text-sm font-medium">
                      <UserPlus className="w-4 h-4" />
                      Ajouter
                    </button>
                  </div>

                  {/* Message désistement */}
                  {desistementMessage && (
                    <div className="p-3 bg-[rgba(var(--success),0.1)] border border-[rgba(var(--success),0.3)] rounded-lg text-sm text-[rgb(var(--success))] flex items-center justify-between">
                      <span>{desistementMessage}</span>
                      <button onClick={() => setDesistementMessage(null)} className="ml-2 hover:opacity-70">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {loadingEleves ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex items-center gap-3 text-[rgb(var(--muted-foreground))]">
                        <div className="w-5 h-5 border-2 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin" />
                        <span>Chargement des participants...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Section Inscrits */}
                      <div>
                        <h4 className="text-sm font-medium text-[rgb(var(--muted-foreground))] mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[rgb(var(--success))]" />
                          Inscrits confirmés
                        </h4>
                        {(selectedSession.inscrits?.length ?? 0) > 0 ? (
                          <div className="space-y-2">
                            {selectedSession.inscrits!.map((p) => (
                              <div
                                key={p.idInscription}
                                className="p-3 bg-[rgb(var(--secondary))] rounded-lg flex items-center justify-between hover:bg-[rgba(var(--accent),0.05)] transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs ${p.type === 'eleve' ? 'bg-gradient-to-br from-purple-500 to-blue-500' : 'bg-gradient-to-br from-orange-400 to-red-500'}`}>
                                    {p.prenom.charAt(0)}{p.nom.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm text-[rgb(var(--foreground))]">
                                      {p.prenom} {p.nom}
                                    </p>
                                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                                      {p.numeroDossier && <span className="font-mono mr-2">{p.numeroDossier}</span>}
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${p.type === 'eleve' ? 'bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))]' : 'bg-[rgba(var(--warning),0.1)] text-[rgb(var(--warning))]'}`}>
                                        {p.type === 'eleve' ? 'Élève' : 'Candidat'}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {p.moyenne > 0 && (
                                    <span className="text-sm font-bold text-[rgb(var(--accent))]">{p.moyenne.toFixed(1)}/20</span>
                                  )}
                                  <button className="p-1.5 hover:bg-[rgb(var(--card))] rounded-lg transition-colors">
                                    <Eye className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                                  </button>
                                  <button
                                    onClick={() => handleDesistement(p.idInscription, `${p.prenom} ${p.nom}`)}
                                    disabled={desistementEnCours === p.idInscription}
                                    className="p-1.5 hover:bg-[rgba(var(--error),0.1)] text-[rgb(var(--error))] rounded-lg transition-colors disabled:opacity-50"
                                    title="Désister"
                                  >
                                    {desistementEnCours === p.idInscription ? (
                                      <div className="w-4 h-4 border-2 border-[rgb(var(--error))] border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <X className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center bg-[rgb(var(--secondary))] rounded-lg text-sm text-[rgb(var(--muted-foreground))]">
                            Aucun inscrit confirmé
                          </div>
                        )}
                      </div>

                      {/* Section Liste d'attente */}
                      <div>
                        <h4 className="text-sm font-medium text-[rgb(var(--muted-foreground))] mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[rgb(var(--warning))]" />
                          Liste d&apos;attente
                          <span className="text-xs">(priorité : élèves &gt; candidats)</span>
                        </h4>
                        {(selectedSession.listeAttente?.length ?? 0) > 0 ? (
                          <div className="space-y-2">
                            {selectedSession.listeAttente!.map((p) => (
                              <div
                                key={p.idInscription}
                                className="p-3 bg-[rgba(var(--warning),0.05)] border border-[rgba(var(--warning),0.2)] rounded-lg flex items-center justify-between hover:bg-[rgba(var(--warning),0.08)] transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-full bg-[rgba(var(--warning),0.2)] flex items-center justify-center text-[rgb(var(--warning))] font-bold text-xs">
                                    #{p.positionAttente}
                                  </div>
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs ${p.type === 'eleve' ? 'bg-gradient-to-br from-purple-500 to-blue-500' : 'bg-gradient-to-br from-orange-400 to-red-500'}`}>
                                    {p.prenom.charAt(0)}{p.nom.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm text-[rgb(var(--foreground))]">
                                      {p.prenom} {p.nom}
                                    </p>
                                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                                      {p.numeroDossier && <span className="font-mono mr-2">{p.numeroDossier}</span>}
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${p.type === 'eleve' ? 'bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))]' : 'bg-[rgba(var(--warning),0.1)] text-[rgb(var(--warning))]'}`}>
                                        {p.type === 'eleve' ? 'Élève' : 'Candidat'}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDesistement(p.idInscription, `${p.prenom} ${p.nom}`)}
                                  disabled={desistementEnCours === p.idInscription}
                                  className="p-1.5 hover:bg-[rgba(var(--error),0.1)] text-[rgb(var(--error))] rounded-lg transition-colors disabled:opacity-50"
                                  title="Retirer de la liste d'attente"
                                >
                                  {desistementEnCours === p.idInscription ? (
                                    <div className="w-4 h-4 border-2 border-[rgb(var(--error))] border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <X className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center bg-[rgb(var(--secondary))] rounded-lg text-sm text-[rgb(var(--muted-foreground))]">
                            Aucun participant en liste d&apos;attente
                          </div>
                        )}
                      </div>
                    </>
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

      {/* Modal création session */}
      {modalSessionOuverte && (
        <SessionFormModal
          onClose={() => setModalSessionOuverte(false)}
          onSuccess={() => {
            setModalSessionOuverte(false)
            loadSessions() // Rafraîchir la liste des sessions
          }}
        />
      )}
    </DashboardLayout>
  )
}
