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
  Download,
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

// Mock data - 8 salles
const SALLES = [
  { id: 1, nom: 'Atelier A', capacite: 12, equipements: ['Établis bijou', 'Forge', 'Laminoir'] },
  { id: 2, nom: 'Atelier B', capacite: 8, equipements: ['Postes sertissage', 'Loupes', 'Microscopes'] },
  { id: 3, nom: 'Atelier C', capacite: 10, equipements: ['Établis joaillerie', 'Polisseuses'] },
  { id: 4, nom: 'Salle informatique', capacite: 8, equipements: ['PC CAO/DAO', 'Rhino', 'MatrixGold'] },
  { id: 5, nom: 'Salle théorie', capacite: 20, equipements: ['Projecteur', 'Tableau', 'Chaises'] },
  { id: 6, nom: 'Atelier polissage', capacite: 6, equipements: ['Polisseuses', 'Tourets', 'Brosses'] },
  { id: 7, nom: 'Atelier taille', capacite: 6, equipements: ['Tours à tailler', 'Loupes binoculaires'] },
  { id: 8, nom: 'Salle réunion', capacite: 15, equipements: ['Table', 'Chaises', 'Écran', 'Visio'] },
]

// Mock sessions pour occupation
const MOCK_SESSIONS = [
  { id: 1, nom: 'CAP ATBJ - Mars 2026', formation: 'CAP Bijouterie', salle: 'Atelier A', dateDebut: '2026-03-15', dateFin: '2026-09-15', inscrits: 11, capacite: 12, formateur: 'Michel Laurent' },
  { id: 2, nom: 'Sertissage N2', formation: 'Sertissage', salle: 'Atelier B', dateDebut: '2026-02-05', dateFin: '2026-05-05', inscrits: 5, capacite: 8, formateur: 'Michel Laurent' },
  { id: 3, nom: 'CAO/DAO - Avril', formation: 'CAO/DAO', salle: 'Salle informatique', dateDebut: '2026-04-15', dateFin: '2026-07-15', inscrits: 4, capacite: 8, formateur: 'Sophie Petit' },
  { id: 4, nom: 'CAP ATBJ - Sept 2026', formation: 'CAP Bijouterie', salle: 'Atelier C', dateDebut: '2026-09-01', dateFin: '2027-03-01', inscrits: 8, capacite: 10, formateur: 'Antoine Dubois' },
  { id: 5, nom: 'Joaillerie - Juin', formation: 'Joaillerie Création', salle: 'Atelier A', dateDebut: '2026-06-01', dateFin: '2026-12-01', inscrits: 10, capacite: 12, formateur: 'Michel Laurent' },
]

// Mock événements (sera remplacé par les événements réels de l'API)
const MOCK_EVENEMENTS = [
  { id: 1, type: 'PORTES_OUVERTES', titre: 'Portes ouvertes printemps', date: '2026-03-10', heureDebut: '10:00', heureFin: '18:00', salle: 'Tous les ateliers', participants: 50 },
  { id: 2, type: 'STAGE_INITIATION', titre: 'Stage découverte bijouterie', date: '2026-04-20', heureDebut: '09:00', heureFin: '17:00', salle: 'Atelier A', participants: 8 },
  { id: 3, type: 'REUNION', titre: 'Réunion équipe pédagogique', date: '2026-05-15', heureDebut: '14:00', heureFin: '16:00', salle: 'Salle réunion', participants: 10 },
  { id: 4, type: 'REMISE_DIPLOME', titre: 'Remise diplômes CAP 2025', date: '2026-06-30', heureDebut: '18:00', heureFin: '21:00', salle: 'Salle théorie', participants: 30 },
]

// Mock disponibilités formateurs
const MOCK_DISPONIBILITES = [
  { formateur: 'Michel Laurent', disponible: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi'], sessions: 2, heuresTotal: 28 },
  { formateur: 'Sophie Petit', disponible: ['Mardi', 'Mercredi', 'Jeudi', 'Vendredi'], sessions: 1, heuresTotal: 20 },
  { formateur: 'Antoine Dubois', disponible: ['Lundi', 'Mardi', 'Vendredi'], sessions: 0, heuresTotal: 0 },
]

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

  // État salles (données réelles depuis API)
  const [salles, setSalles] = useState<Salle[]>([])
  const [loadingSalles, setLoadingSalles] = useState(false)

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

  // Fetch salles depuis l'API
  useEffect(() => {
    async function fetchSalles() {
      setLoadingSalles(true)
      try {
        const res = await fetch('/api/salles')
        const data = await res.json()
        if (data.success) {
          setSalles(data.salles)
        }
      } catch (error) {
        console.error('Erreur chargement salles:', error)
      } finally {
        setLoadingSalles(false)
      }
    }
    fetchSalles()
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

  // Calcul occupation par salle
  const getOccupationSalle = (salleNom: string) => {
    const sessions = MOCK_SESSIONS.filter(s => s.salle === salleNom)
    if (sessions.length === 0) return 0
    const totalInscrits = sessions.reduce((sum, s) => sum + s.inscrits, 0)
    const salle = SALLES.find(s => s.nom === salleNom)
    return Math.round((totalInscrits / (salle?.capacite || 1) / sessions.length) * 100)
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
          <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">Planning annuel</h1>
            <p className="text-[rgb(var(--muted-foreground))] mt-1">
              Gestion occupation salles, disponibilités formateurs et événements
            </p>
          </div>
          <button className="px-4 py-2 bg-[rgb(var(--secondary))] rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exporter planning
          </button>
        </div>

        {/* Stats globales */}
        <div className="grid grid-cols-4 gap-4">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Salles disponibles</p>
                <p className="text-3xl font-bold text-[rgb(var(--foreground))] mt-1">{SALLES.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-[rgb(var(--accent))]" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Sessions actives</p>
                <p className="text-3xl font-bold text-[rgb(var(--success))] mt-1">{MOCK_SESSIONS.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-[rgb(var(--success))]" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Formateurs actifs</p>
                <p className="text-3xl font-bold text-[rgb(var(--foreground))] mt-1">{MOCK_DISPONIBILITES.length}</p>
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
                    // Utiliser événements au lieu de MOCK_SESSIONS pour calculer l'occupation
                    const evenementsSalle = evenements.filter(e => e.salle === salle.nom)

                    return (
                      <div key={salle.idSalle} className="group hover:bg-[rgba(var(--accent),0.02)] rounded-lg p-3 transition-all border border-transparent hover:border-[rgba(var(--accent),0.1)]">
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
                            // Vérifier événements pour ce mois
                            const evenementsCeMois = evenementsSalle.filter(event => {
                              const eventDate = new Date(event.date)
                              return eventDate.getFullYear() === anneeSelectionnee && eventDate.getMonth() === moisIdx
                            })

                            // Vérifier sessions actives pour ce mois
                            const debutMois = new Date(anneeSelectionnee, moisIdx, 1)
                            const finMois = new Date(anneeSelectionnee, moisIdx + 1, 0)

                            const sessionsCeMois = MOCK_SESSIONS.filter(session => {
                              if (session.salle !== salle.nom) return false
                              const sessionDebut = new Date(session.dateDebut)
                              const sessionFin = new Date(session.dateFin)
                              // Session active si elle chevauche le mois
                              return sessionDebut <= finMois && sessionFin >= debutMois
                            })

                            const nbEvenements = evenementsCeMois.length
                            const nbSessions = sessionsCeMois.length
                            const nbTotal = nbEvenements + nbSessions

                            // Calculer les jours réellement occupés dans le mois
                            const joursOccupes = new Set<number>()

                            // Ajouter les jours des sessions
                            sessionsCeMois.forEach(session => {
                              const sessionDebut = new Date(session.dateDebut)
                              const sessionFin = new Date(session.dateFin)

                              // Limiter au mois courant
                              const dateDebutMois = sessionDebut < debutMois ? debutMois : sessionDebut
                              const dateFinMois = sessionFin > finMois ? finMois : sessionFin

                              // Ajouter chaque jour de la session
                              const currentDate = new Date(dateDebutMois)
                              while (currentDate <= dateFinMois) {
                                joursOccupes.add(currentDate.getDate())
                                currentDate.setDate(currentDate.getDate() + 1)
                              }
                            })

                            // Ajouter les jours des événements
                            evenementsCeMois.forEach(evt => {
                              const evtDate = new Date(evt.date)
                              joursOccupes.add(evtDate.getDate())
                            })

                            // Calculer le nombre total de jours dans le mois
                            const nbJoursDansMois = new Date(anneeSelectionnee, moisIdx + 1, 0).getDate()

                            // Calculer le pourcentage réel d'occupation
                            const occupation = joursOccupes.size > 0
                              ? Math.round((joursOccupes.size / nbJoursDansMois) * 100)
                              : 0

                            const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

                            return (
                              <div
                                key={moisIdx}
                                onClick={() => setModalMoisOuvert({ type: 'salle', titre: salle.nom, mois: moisIdx, salle: salle.nom })}
                                className="h-20 rounded-lg border-2 relative overflow-hidden group/cell cursor-pointer hover:border-[rgb(var(--accent))] hover:shadow-md transition-all flex flex-col"
                                style={{
                                  backgroundColor: occupation === 0 ? 'rgba(34, 197, 94, 0.15)' // Vert pour libre (0%)
                                    : occupation < 50 ? 'rgba(234, 179, 8, 0.15)' // Jaune pour <50%
                                    : occupation < 80 ? 'rgba(249, 115, 22, 0.15)' // Orange pour 50-79%
                                    : 'rgba(239, 68, 68, 0.15)', // Rouge pour ≥80%
                                  borderColor: occupation === 0 ? 'rgba(34, 197, 94, 0.4)' // Vert
                                    : occupation < 50 ? 'rgba(234, 179, 8, 0.4)' // Jaune
                                    : occupation < 80 ? 'rgba(249, 115, 22, 0.4)' // Orange
                                    : 'rgba(239, 68, 68, 0.4)' // Rouge
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
                                      color: occupation < 50 ? 'rgb(234, 179, 8)' // Jaune
                                        : occupation < 80 ? 'rgb(249, 115, 22)' // Orange
                                        : 'rgb(239, 68, 68)' // Rouge
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
                                          {sessionsCeMois.slice(0, 2).map((sess, idx) => (
                                            <p key={idx} className="text-xs text-[rgb(var(--muted-foreground))] ml-3">
                                              • {sess.formation}
                                            </p>
                                          ))}
                                        </>
                                      )}
                                      {nbEvenements > 0 && (
                                        <>
                                          <p className="text-xs font-semibold text-[rgb(var(--accent))] mt-2 mb-1">📅 {nbEvenements} événement(s)</p>
                                          {evenementsCeMois.slice(0, 2).map((evt, idx) => (
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
                {MOCK_DISPONIBILITES.map((formateur, idx) => {
                  const sessionsFormateur = MOCK_SESSIONS.filter(s => s.formateur === formateur.formateur)

                  return (
                    <div key={idx} className="flex items-center group hover:bg-[rgba(var(--accent),0.02)] rounded-lg p-2 transition-all">
                      {/* Nom du formateur */}
                      <div className="w-48 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg border-2 border-dashed border-[rgba(var(--accent),0.4)] bg-[rgba(var(--accent),0.05)] flex items-center justify-center">
                            <Users className="w-5 h-5 text-[rgba(var(--accent),0.6)]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[rgb(var(--foreground))]">{formateur.formateur}</p>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">{formateur.sessions} session(s)</p>
                          </div>
                        </div>
                      </div>

                      {/* Timeline 12 mois */}
                      <div className="flex-1 grid grid-cols-12 gap-1 relative">
                        {Array.from({ length: 12 }).map((_, moisIdx) => {
                          // Vérifier si le formateur a une session ce mois
                          const sessionCeMois = sessionsFormateur.find(session => {
                            const debut = new Date(session.dateDebut)
                            const fin = new Date(session.dateFin)
                            const moisCourant = new Date(anneeSelectionnee, moisIdx, 1)
                            return debut <= moisCourant && fin >= moisCourant
                          })

                          // Simuler disponibilité de base (formateur peut avoir des jours dispos même en session)
                          const disponible = formateur.disponible.length > 0

                          return (
                            <div
                              key={moisIdx}
                              onClick={() => setModalMoisOuvert({ type: 'formateur', titre: formateur.formateur, mois: moisIdx })}
                              className="h-12 rounded border border-[rgba(var(--border),0.3)] relative overflow-hidden group/cell cursor-pointer hover:border-[rgb(var(--accent))] transition-all"
                              style={{
                                backgroundColor: sessionCeMois
                                  ? 'rgba(var(--accent), 0.3)'
                                  : disponible
                                  ? 'rgba(var(--success), 0.15)'
                                  : 'rgba(var(--error), 0.1)'
                              }}
                            >
                              <div className="absolute inset-0 flex items-center justify-center">
                                {sessionCeMois ? (
                                  <BookOpen className="w-4 h-4 text-[rgb(var(--accent))]" />
                                ) : disponible ? (
                                  <span className="text-xs font-medium text-[rgb(var(--success))]">✓</span>
                                ) : (
                                  <span className="text-xs font-medium text-[rgb(var(--error))]">✗</span>
                                )}
                              </div>

                              {/* Tooltip au survol */}
                              {sessionCeMois && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/cell:block z-10">
                                  <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg p-3 shadow-lg whitespace-nowrap">
                                    <p className="text-xs font-bold text-[rgb(var(--foreground))]">{sessionCeMois.formation}</p>
                                    <p className="text-xs text-[rgb(var(--muted-foreground))]">{sessionCeMois.salle}</p>
                                    <p className="text-xs text-[rgb(var(--muted-foreground))]">{sessionCeMois.inscrits} élèves</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Compteur global par mois */}
              <div className="mt-6 card bg-[rgb(var(--secondary))] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[rgb(var(--foreground))]">Formateurs disponibles par mois</h3>
                  <span className="text-xs text-[rgb(var(--muted-foreground))]">Minimum recommandé: 2 formateurs</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  {Array.from({ length: 12 }).map((_, moisIdx) => {
                    // Compter les formateurs dispo ce mois (ceux qui n'ont pas de session)
                    const formateursDispo = MOCK_DISPONIBILITES.filter(f => {
                      const sessionsFormateur = MOCK_SESSIONS.filter(s => s.formateur === f.formateur)
                      const aSessionCeMois = sessionsFormateur.some(session => {
                        const debut = new Date(session.dateDebut)
                        const fin = new Date(session.dateFin)
                        const moisCourant = new Date(2024, moisIdx, 1)
                        return debut <= moisCourant && fin >= moisCourant
                      })
                      return !aSessionCeMois
                    }).length

                    const alerte = formateursDispo < 2

                    return (
                      <div key={moisIdx} className="text-center">
                        <div
                          className={`w-full h-8 rounded flex items-center justify-center text-sm font-bold ${
                            alerte
                              ? 'bg-[rgba(var(--error),0.2)] text-[rgb(var(--error))]'
                              : 'bg-[rgba(var(--success),0.2)] text-[rgb(var(--success))]'
                          }`}
                        >
                          {formateursDispo}
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
          sessions={MOCK_SESSIONS}
          evenements={evenements}
          salle={modalMoisOuvert.salle}
        />
      )}

      {/* Modal événement */}
      {modalEvenementOuvert && (
        <EvenementFormModal
          evenement={evenementEnEdition}
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
