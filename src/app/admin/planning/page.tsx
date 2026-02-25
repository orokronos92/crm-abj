/**
 * Page Planning - Vision annuelle occupation salles, formateurs et événements
 * Permet d'éviter les doubles programmations et optimiser l'utilisation des ressources
 */

'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { MonthDetailModal } from '@/components/admin/MonthDetailModal'
import { EvenementFormModal } from '@/components/admin/EvenementFormModal'
import {
  Calendar,
  Users,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Clock,
  PartyPopper,
  GraduationCap,
  Briefcase,
  Phone,
  Award,
  BookOpen,
} from 'lucide-react'

// Types pour les données de l'API

type VueActive = 'salles' | 'formateurs' | 'evenements'
type TypeEvenement = 'PORTES_OUVERTES' | 'STAGE_INITIATION' | 'REUNION' | 'REMISE_DIPLOME' | 'ENTRETIEN'

interface Evenement {
  idEvenement: number
  type: string
  titre: string
  date: string
  heureDebut: string
  heureFin: string
  salle: string
  nombreParticipants: number
  participantsInscrits?: number
  statut: string
  description?: string
  notes?: string
}

interface Salle {
  idSalle: number
  nom: string
  capaciteMax: number
  equipements?: string[]
}

const TYPE_EVENEMENT_CONFIG = {
  PORTES_OUVERTES: { label: 'Portes ouvertes', icon: PartyPopper, color: 'text-[rgb(var(--accent))]', bg: 'bg-[rgba(var(--accent),0.1)]' },
  STAGE_INITIATION: { label: 'Stage initiation', icon: GraduationCap, color: 'text-[rgb(var(--info))]', bg: 'bg-[rgba(var(--info),0.1)]' },
  REUNION: { label: 'Réunion', icon: Briefcase, color: 'text-[rgb(var(--warning))]', bg: 'bg-[rgba(var(--warning),0.1)]' },
  REMISE_DIPLOME: { label: 'Remise diplômes', icon: Award, color: 'text-[rgb(var(--success))]', bg: 'bg-[rgba(var(--success),0.1)]' },
  ENTRETIEN: { label: 'Entretien', icon: Phone, color: 'text-[rgb(var(--muted-foreground))]', bg: 'bg-[rgb(var(--secondary))]' },
}

export default function PlanningPage() {
  const [vueActive, setVueActive] = useState<VueActive>('salles')
  const [salleSelectionnee, setSalleSelectionnee] = useState<number>(1)
  const [moisAffiche, setMoisAffiche] = useState(new Date())
  const [anneeSelectionnee, setAnneeSelectionnee] = useState(2026)

  // État modal détail mois
  const [modalMoisOuvert, setModalMoisOuvert] = useState<{
    type: 'salle' | 'formateur'
    titre: string
    mois: number
    salle?: string // Nom de la salle pour filtrer les sessions
  } | null>(null)

  // État modal événement
  const [modalEvenementOuvert, setModalEvenementOuvert] = useState(false)
  const [evenementEnEdition, setEvenementEnEdition] = useState<Evenement | null>(null)

  // État événements (données réelles depuis API)
  const [evenements, setEvenements] = useState<Evenement[]>([])
  const [loadingEvenements, setLoadingEvenements] = useState(false)

  // État salles avec occupation pré-calculée (API planning/salles)
  const [salles, setSalles] = useState<any[]>([])
  const [loadingSalles, setLoadingSalles] = useState(false)

  // État formateurs avec disponibilités pré-calculées (API planning/formateurs)
  const [formateurs, setFormateurs] = useState<any[]>([])
  const [alertesDisponibilite, setAlertesDisponibilite] = useState<any[]>([])
  const [loadingFormateurs, setLoadingFormateurs] = useState(false)

  // sessions reste pour compatibilité compteur stats
  const [sessions, setSessions] = useState<any[]>([])

  // Fetch événements depuis l'API
  useEffect(() => {
    async function fetchEvenements() {
      setLoadingEvenements(true)
      try {
        const res = await fetch(`/api/evenements?annee=${anneeSelectionnee}`)
        const data = await res.json()
        if (data.success) {
          setEvenements(data.evenements)
        }
      } catch (error) {
        console.error('Erreur chargement événements:', error)
      } finally {
        setLoadingEvenements(false)
      }
    }
    fetchEvenements()
  }, [anneeSelectionnee])

  // Fetch planning salles (occupation pré-calculée côté serveur)
  useEffect(() => {
    async function fetchPlanningSalles() {
      setLoadingSalles(true)
      try {
        const res = await fetch(`/api/planning/salles?annee=${anneeSelectionnee}`)
        const data = await res.json()
        if (data.success) {
          setSalles(data.salles)
        }
      } catch (error) {
        console.error('Erreur chargement planning salles:', error)
      } finally {
        setLoadingSalles(false)
      }
    }
    fetchPlanningSalles()
  }, [anneeSelectionnee])

  // Fetch planning formateurs (disponibilités pré-calculées côté serveur)
  useEffect(() => {
    async function fetchPlanningFormateurs() {
      setLoadingFormateurs(true)
      try {
        const res = await fetch(`/api/planning/formateurs?annee=${anneeSelectionnee}`)
        const data = await res.json()
        if (data.success) {
          setFormateurs(data.formateurs)
          setAlertesDisponibilite(data.alertesDisponibilite || [])
        }
      } catch (error) {
        console.error('Erreur chargement planning formateurs:', error)
      } finally {
        setLoadingFormateurs(false)
      }
    }
    fetchPlanningFormateurs()
  }, [anneeSelectionnee])

  // Fetch sessions pour le compteur stats
  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch(`/api/sessions`)
        const data = await res.json()
        if (data.success) setSessions(data.sessions)
      } catch (error) {
        console.error('Erreur chargement sessions:', error)
      }
    }
    fetchSessions()
  }, [])

  // Refresh événements après création/modification
  const refreshEvenements = async () => {
    try {
      const res = await fetch(`/api/evenements?annee=${anneeSelectionnee}`)
      const data = await res.json()
      if (data.success) {
        setEvenements(data.evenements)
      }
    } catch (error) {
      console.error('Erreur refresh événements:', error)
    }
  }

  // Gestion événements
  const handleCreerEvenement = () => {
    setEvenementEnEdition(null)
    setModalEvenementOuvert(true)
  }

  const handleEditerEvenement = (event: Evenement) => {
    setEvenementEnEdition(event)
    setModalEvenementOuvert(true)
  }

  const handleSupprimerEvenement = async (event: Evenement) => {
    if (!confirm(`Êtes-vous sûr de vouloir annuler l'événement "${event.titre}" ?`)) {
      return
    }

    try {
      const res = await fetch(`/api/evenements/${event.idEvenement}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motifAnnulation: 'Annulé depuis l\'interface planning'
        })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        // Refresh la liste des événements
        await refreshEvenements()
      } else {
        alert(`Erreur lors de l'annulation : ${data.error || 'Erreur inconnue'}`)
      }
    } catch (error) {
      console.error('Erreur suppression événement:', error)
      alert('Erreur lors de l\'annulation de l\'événement')
    }
  }

  // Calcul occupation par salle (plus utilisé, mais gardé pour compatibilité)
  const getOccupationSalle = (salleNom: string) => {
    const sessionsSalle = sessions.filter(s => s.salle === salleNom)
    if (sessionsSalle.length === 0) return 0
    const totalInscrits = sessionsSalle.reduce((sum, s) => sum + (s.nbInscrits || 0), 0)
    const salle = salles.find(s => s.nom === salleNom)
    return Math.round((totalInscrits / (salle?.capaciteMax || 1) / sessionsSalle.length) * 100)
  }

  // Navigation mois
  const moisPrecedent = () => {
    const newDate = new Date(moisAffiche)
    newDate.setMonth(newDate.getMonth() - 1)
    setMoisAffiche(newDate)
  }

  const moisSuivant = () => {
    const newDate = new Date(moisAffiche)
    newDate.setMonth(newDate.getMonth() + 1)
    setMoisAffiche(newDate)
  }

  const moisFormate = moisAffiche.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header/Stats/Onglets - partie fixe (ne scroll jamais) */}
        <div className="flex-shrink-0 space-y-4 pb-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">Planning annuel</h1>
            <p className="text-[rgb(var(--muted-foreground))] mt-1">
              Gestion occupation salles, disponibilités formateurs et événements
            </p>
          </div>

        {/* Stats globales */}
        <div className="grid grid-cols-4 gap-4">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Salles disponibles</p>
                <p className="text-3xl font-bold text-[rgb(var(--foreground))] mt-1">{salles.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-[rgb(var(--accent))]" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Sessions actives</p>
                <p className="text-3xl font-bold text-[rgb(var(--success))] mt-1">{sessions.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-[rgb(var(--success))]" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Formateurs actifs</p>
                <p className="text-3xl font-bold text-[rgb(var(--foreground))] mt-1">{formateurs.length}</p>
              </div>
              <Users className="w-8 h-8 text-[rgb(var(--foreground))]" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Événements à venir</p>
                <p className="text-3xl font-bold text-[rgb(var(--accent))] mt-1">{evenements.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-[rgb(var(--accent))]" />
            </div>
          </div>
        </div>

        {/* Onglets de navigation */}
        <div className="card p-1">
          <div className="flex gap-2">
            <button
              onClick={() => setVueActive('salles')}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                vueActive === 'salles'
                  ? 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))]'
                  : 'text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--secondary))]'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Occupation salles</span>
              </div>
            </button>

            <button
              onClick={() => setVueActive('formateurs')}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                vueActive === 'formateurs'
                  ? 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))]'
                  : 'text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--secondary))]'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                <span>Disponibilités formateurs</span>
              </div>
            </button>

            <button
              onClick={() => setVueActive('evenements')}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                vueActive === 'evenements'
                  ? 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))]'
                  : 'text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--secondary))]'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <PartyPopper className="w-4 h-4" />
                <span>Événements</span>
              </div>
            </button>
          </div>
        </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Contenu selon vue active */}
          {vueActive === 'salles' && (
            <div className="space-y-4">
            {/* Timeline annuelle des salles */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">Occupation annuelle des salles</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[rgb(var(--muted-foreground))]">Année</span>
                  <select
                    value={anneeSelectionnee}
                    onChange={(e) => setAnneeSelectionnee(parseInt(e.target.value))}
                    className="px-3 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] text-sm focus:border-[rgb(var(--accent))] focus:outline-none"
                  >
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                  </select>
                </div>
              </div>

              {/* Grille des salles */}
              <div className="space-y-3">
                {loadingSalles ? (
                  <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
                    Chargement des salles...
                  </div>
                ) : salles.length === 0 ? (
                  <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
                    Aucune salle disponible
                  </div>
                ) : (
                  salles.map((salle) => {
                    const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

                    return (
                      <div key={salle.id} className="group hover:bg-[rgba(var(--accent),0.02)] rounded-lg p-3 transition-all border border-transparent hover:border-[rgba(var(--accent),0.1)]">
                        {/* Nom de la salle */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-[rgba(var(--accent),0.1)] rounded-lg">
                            <MapPin className="w-5 h-5 text-[rgb(var(--accent))]" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-[rgb(var(--foreground))]">{salle.nom}</p>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">Capacité : {salle.capaciteMax} places</p>
                          </div>
                        </div>

                        {/* Timeline 12 mois avec labels */}
                        <div className="grid grid-cols-12 gap-2">
                          {Array.from({ length: 12 }).map((_, moisIdx) => {
                            // Utiliser les données pré-calculées côté serveur
                            const moisData = salle.mois?.[moisIdx]
                            const occupation = moisData?.occupation ?? 0
                            const sessionsCeMois = moisData?.sessions ?? []
                            const evenementsCeMois = moisData?.evenements ?? []
                            const nbSessions = sessionsCeMois.length
                            const nbEvenements = evenementsCeMois.length
                            const nbTotal = nbSessions + nbEvenements

                            return (
                              <div
                                key={moisIdx}
                                onClick={() => setModalMoisOuvert({ type: 'salle', titre: salle.nom, mois: moisIdx, salle: salle.nom })}
                                className="h-20 rounded-lg border-2 relative overflow-hidden group/cell cursor-pointer hover:border-[rgb(var(--accent))] hover:shadow-md transition-all flex flex-col"
                                style={{
                                  backgroundColor: occupation === 0 ? 'rgba(34, 197, 94, 0.15)'
                                    : occupation < 50 ? 'rgba(234, 179, 8, 0.15)'
                                    : occupation < 80 ? 'rgba(249, 115, 22, 0.15)'
                                    : 'rgba(239, 68, 68, 0.15)',
                                  borderColor: occupation === 0 ? 'rgba(34, 197, 94, 0.4)'
                                    : occupation < 50 ? 'rgba(234, 179, 8, 0.4)'
                                    : occupation < 80 ? 'rgba(249, 115, 22, 0.4)'
                                    : 'rgba(239, 68, 68, 0.4)'
                                }}
                              >
                                {/* Label du mois */}
                                <div className="px-2 py-1 bg-[rgba(var(--background),0.8)] border-b border-[rgba(var(--border),0.2)]">
                                  <span className="text-[10px] font-bold text-[rgb(var(--muted-foreground))] uppercase tracking-wide">
                                    {moisLabels[moisIdx]}
                                  </span>
                                </div>

                                {/* Pourcentage d'occupation */}
                                <div className="flex-1 flex items-center justify-center">
                                  {occupation === 0 ? (
                                    <div className="text-xs font-medium" style={{ color: 'rgb(34, 197, 94)' }}>
                                      Libre
                                    </div>
                                  ) : (
                                    <div className="text-3xl font-bold" style={{
                                      color: occupation < 50 ? 'rgb(234, 179, 8)'
                                        : occupation < 80 ? 'rgb(249, 115, 22)'
                                        : 'rgb(239, 68, 68)'
                                    }}>
                                      {occupation}%
                                    </div>
                                  )}
                                </div>

                                {/* Tooltip détaillé au survol */}
                                {nbTotal > 0 && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/cell:block z-10">
                                    <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg p-3 shadow-xl whitespace-nowrap">
                                      <p className="text-xs font-bold text-[rgb(var(--foreground))] mb-2">{moisLabels[moisIdx]} {anneeSelectionnee}</p>
                                      {nbSessions > 0 && (
                                        <>
                                          <p className="text-xs font-semibold text-[rgb(var(--success))] mb-1">📚 {nbSessions} session(s)</p>
                                          {sessionsCeMois.slice(0, 2).map((sess: any, idx: number) => (
                                            <p key={idx} className="text-xs text-[rgb(var(--muted-foreground))] ml-3">
                                              • {sess.formation}
                                            </p>
                                          ))}
                                        </>
                                      )}
                                      {nbEvenements > 0 && (
                                        <>
                                          <p className="text-xs font-semibold text-[rgb(var(--accent))] mt-2 mb-1">📅 {nbEvenements} événement(s)</p>
                                          {evenementsCeMois.slice(0, 2).map((evt: any, idx: number) => (
                                            <p key={idx} className="text-xs text-[rgb(var(--muted-foreground))] ml-3">
                                              • {evt.titre}
                                            </p>
                                          ))}
                                        </>
                                      )}
                                      {nbTotal > 4 && (
                                        <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2 italic">
                                          +{nbTotal - 4} autre(s)...
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Légende */}
              <div className="mt-6 p-4 bg-[rgba(var(--secondary),0.3)] rounded-lg border border-[rgba(var(--border),0.2)]">
                <div className="flex items-center gap-8 justify-center flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-black"></div>
                    <span className="text-sm font-medium text-[rgb(var(--foreground))]">0%</span>
                    <span className="text-xs" style={{ color: 'rgb(34, 197, 94)' }}>Libre (vert)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-black"></div>
                    <span className="text-sm font-medium text-[rgb(var(--foreground))]">&lt;50%</span>
                    <span className="text-xs" style={{ color: 'rgb(234, 179, 8)' }}>Faible occupation (jaune)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-black"></div>
                    <span className="text-sm font-medium text-[rgb(var(--foreground))]">50-79%</span>
                    <span className="text-xs" style={{ color: 'rgb(249, 115, 22)' }}>Occupation moyenne (orange)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-black"></div>
                    <span className="text-sm font-medium text-[rgb(var(--foreground))]">≥80%</span>
                    <span className="text-xs" style={{ color: 'rgb(239, 68, 68)' }}>Forte occupation (rouge)</span>
                  </div>
                </div>
                <p className="text-center text-xs text-[rgb(var(--muted-foreground))] mt-3">
                  💡 Astuce : Le vert (0%) et le jaune (&lt;50%) sont des opportunités marketing pour promouvoir les formations
                </p>
              </div>
            </div>
          </div>
        )}

        {vueActive === 'formateurs' && (
          <div className="space-y-4 min-h-[600px]">
            {/* Timeline annuelle des formateurs */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">Disponibilité annuelle des formateurs</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[rgb(var(--muted-foreground))]">Année</span>
                  <select
                    value={anneeSelectionnee}
                    onChange={(e) => setAnneeSelectionnee(parseInt(e.target.value))}
                    className="px-3 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] text-sm focus:border-[rgb(var(--accent))] focus:outline-none"
                  >
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                  </select>
                </div>
              </div>

              {/* En-tête mois */}
              <div className="flex mb-4">
                <div className="w-48 flex-shrink-0"></div>
                <div className="flex-1 grid grid-cols-12 gap-1">
                  {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'].map((mois, idx) => (
                    <div key={idx} className="text-center text-xs font-medium text-[rgb(var(--muted-foreground))]">
                      {mois}
                    </div>
                  ))}
                </div>
              </div>

              {/* Grille des formateurs */}
              <div className="space-y-2">
                {loadingFormateurs ? (
                  <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
                    Chargement des formateurs...
                  </div>
                ) : formateurs.length === 0 ? (
                  <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
                    Aucun formateur disponible
                  </div>
                ) : (
                  formateurs.map((formateur) => {
                    const nbSessionsFormateur = formateur.mois?.filter((m: any) => m.statut === 'session').length ?? 0

                    return (
                      <div key={formateur.id} className="flex items-center group hover:bg-[rgba(var(--accent),0.02)] rounded-lg p-2 transition-all">
                        {/* Nom du formateur */}
                        <div className="w-48 flex-shrink-0">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg border-2 border-dashed border-[rgba(var(--accent),0.4)] bg-[rgba(var(--accent),0.05)] flex items-center justify-center">
                              <Users className="w-5 h-5 text-[rgba(var(--accent),0.6)]" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[rgb(var(--foreground))]">{formateur.nomComplet}</p>
                              <p className="text-xs text-[rgb(var(--muted-foreground))]">{nbSessionsFormateur} mois en session</p>
                            </div>
                          </div>
                        </div>

                      {/* Timeline 12 mois */}
                      <div className="flex-1 grid grid-cols-12 gap-1 relative">
                        {Array.from({ length: 12 }).map((_, moisIdx) => {
                          // Utiliser les données pré-calculées côté serveur
                          const moisData = formateur.mois?.[moisIdx]
                          const statut = moisData?.statut ?? 'libre'
                          const sessionsCeMois = moisData?.sessions ?? []

                          return (
                            <div
                              key={moisIdx}
                              onClick={() => setModalMoisOuvert({ type: 'formateur', titre: formateur.nomComplet, mois: moisIdx })}
                              className="h-12 rounded border border-[rgba(var(--border),0.3)] relative overflow-hidden group/cell cursor-pointer hover:border-[rgb(var(--accent))] transition-all"
                              style={{
                                backgroundColor: statut === 'session'
                                  ? 'rgba(99, 102, 241, 0.2)'
                                  : statut === 'disponible'
                                  ? 'rgba(34, 197, 94, 0.15)'
                                  : statut === 'indisponible'
                                  ? 'rgba(239, 68, 68, 0.1)'
                                  : 'rgba(var(--secondary), 0.5)'
                              }}
                            >
                              <div className="absolute inset-0 flex items-center justify-center">
                                {statut === 'session' ? (
                                  <BookOpen className="w-4 h-4 text-[rgb(var(--accent))]" />
                                ) : statut === 'disponible' ? (
                                  <span className="text-xs font-medium" style={{ color: 'rgb(34, 197, 94)' }}>✓</span>
                                ) : statut === 'indisponible' ? (
                                  <span className="text-xs font-medium" style={{ color: 'rgb(239, 68, 68)' }}>✗</span>
                                ) : (
                                  <span className="text-xs text-[rgb(var(--muted-foreground))]">—</span>
                                )}
                              </div>

                              {/* Tooltip au survol */}
                              {sessionsCeMois.length > 0 && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/cell:block z-10">
                                  <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg p-3 shadow-lg whitespace-nowrap">
                                    {sessionsCeMois.slice(0, 2).map((sess: any, idx: number) => (
                                      <div key={idx}>
                                        <p className="text-xs font-bold text-[rgb(var(--foreground))]">{sess.formation}</p>
                                        <p className="text-xs text-[rgb(var(--muted-foreground))]">{sess.nom}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Compteur global par mois */}
              <div className="mt-6 card bg-[rgb(var(--secondary))] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[rgb(var(--foreground))]">Formateurs disponibles par mois</h3>
                  <span className="text-xs text-[rgb(var(--muted-foreground))]">Minimum recommandé: 2 formateurs</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  {Array.from({ length: 12 }).map((_, moisIdx) => {
                    // Utiliser les alertes pré-calculées côté serveur
                    const alerteMois = alertesDisponibilite.find((a: any) => a.moisIndex === moisIdx)
                    const count = alerteMois?.count ?? formateurs.filter((f: any) => {
                      const m = f.mois?.[moisIdx]
                      return m?.statut === 'disponible' || m?.statut === 'libre'
                    }).length
                    const alerte = alerteMois?.alerte ?? count < 2

                    return (
                      <div key={moisIdx} className="text-center">
                        <div
                          className={`w-full h-8 rounded flex items-center justify-center text-sm font-bold ${
                            alerte
                              ? 'bg-[rgba(var(--error),0.2)] text-[rgb(var(--error))]'
                              : 'bg-[rgba(var(--success),0.2)] text-[rgb(var(--success))]'
                          }`}
                        >
                          {count}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Légende */}
              <div className="mt-6 flex items-center gap-6 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[rgba(var(--accent),0.3)] border border-[rgba(var(--accent),0.3)]"></div>
                  <span className="text-xs text-[rgb(var(--muted-foreground))]">En session</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[rgba(var(--success),0.15)] border border-[rgba(var(--success),0.3)]"></div>
                  <span className="text-xs text-[rgb(var(--muted-foreground))]">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[rgba(var(--error),0.1)] border border-[rgba(var(--error),0.3)]"></div>
                  <span className="text-xs text-[rgb(var(--muted-foreground))]">Indisponible</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {vueActive === 'evenements' && (
          <div className="space-y-4 min-h-[600px]">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">Événements planifiés</h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[rgb(var(--muted-foreground))]">Année</span>
                    <select
                      value={anneeSelectionnee}
                      onChange={(e) => setAnneeSelectionnee(parseInt(e.target.value))}
                      className="px-3 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] text-sm focus:border-[rgb(var(--accent))] focus:outline-none"
                    >
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                    </select>
                  </div>
                  <button
                    onClick={handleCreerEvenement}
                    className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg hover:bg-[rgb(var(--accent-light))] transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Créer événement
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {loadingEvenements ? (
                  <div className="col-span-2 text-center py-8 text-[rgb(var(--muted-foreground))]">
                    Chargement des événements...
                  </div>
                ) : evenements.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-[rgb(var(--muted-foreground))]">
                    Aucun événement pour {anneeSelectionnee}
                  </div>
                ) : (
                  evenements.map((event) => {
                    const config = TYPE_EVENEMENT_CONFIG[event.type as TypeEvenement]
                    const Icon = config.icon

                    return (
                      <div key={event.idEvenement} className="p-6 bg-[rgb(var(--secondary))] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-3 ${config.bg} rounded-lg`}>
                            <Icon className={`w-6 h-6 ${config.color}`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-[rgb(var(--foreground))]">{event.titre}</h3>
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs ${config.bg} ${config.color} rounded-full mt-1`}>
                              {config.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditerEvenement(event)}
                            className="p-1.5 hover:bg-[rgb(var(--card))] rounded-lg transition-colors"
                            title="Modifier l'événement"
                          >
                            <Edit className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                          </button>
                          <button
                            onClick={() => handleSupprimerEvenement(event)}
                            className="p-1.5 hover:bg-[rgba(var(--error),0.1)] rounded-lg transition-colors"
                            title="Annuler l'événement"
                          >
                            <Trash2 className="w-4 h-4 text-[rgb(var(--error))]" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[rgb(var(--accent))]" />
                          <div>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">Date</p>
                            <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                              {new Date(event.date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[rgb(var(--accent))]" />
                          <div>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">Horaires</p>
                            <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                              {event.heureDebut} - {event.heureFin}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[rgb(var(--accent))]" />
                          <div>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">Lieu</p>
                            <p className="text-sm font-medium text-[rgb(var(--foreground))]">{event.salle}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[rgb(var(--accent))]" />
                          <div>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">Participants</p>
                            <p className="text-sm font-medium text-[rgb(var(--foreground))]">{event.nombreParticipants}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Modal détail mois */}
      {modalMoisOuvert && (
        <MonthDetailModal
          type={modalMoisOuvert.type}
          titre={modalMoisOuvert.titre}
          mois={modalMoisOuvert.mois}
          annee={anneeSelectionnee}
          onClose={() => setModalMoisOuvert(null)}
          sessions={
            modalMoisOuvert.type === 'salle'
              ? (salles.find((s: any) => s.nom === modalMoisOuvert.salle)?.mois?.[modalMoisOuvert.mois]?.sessions ?? [])
              : (formateurs.find((f: any) => f.nomComplet === modalMoisOuvert.titre)?.mois?.[modalMoisOuvert.mois]?.sessions ?? [])
          }
          evenements={
            modalMoisOuvert.type === 'salle'
              ? (salles.find((s: any) => s.nom === modalMoisOuvert.salle)?.mois?.[modalMoisOuvert.mois]?.evenements ?? [])
              : []
          }
          salle={modalMoisOuvert.salle}
        />
      )}

      {/* Modal événement */}
      {modalEvenementOuvert && (
        <EvenementFormModal
          evenement={evenementEnEdition ?? undefined}
          onClose={() => {
            setModalEvenementOuvert(false)
            setEvenementEnEdition(null)
          }}
          onSuccess={refreshEvenements}
        />
      )}
    </DashboardLayout>
  )
}
