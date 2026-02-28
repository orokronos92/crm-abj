/**
 * Modal détail mensuel - Granularité jour/heure pour salles et formateurs
 * Vue salle : PlanningWeekView (timeline 30 min type Google Calendar)
 * Vue formateur : Grille créneaux Matin/Après-midi/Soir (inchangée)
 */

'use client'

import { X, Clock, Users, MapPin } from 'lucide-react'
import { PlanningWeekView } from '@/components/admin/PlanningWeekView'

interface Reservation {
  id: number
  idSession?: number | null
  idEvenement?: number | null
  dateDebut: string
  dateFin: string
  statut: string
}

interface Disponibilite {
  id: number
  date: string
  creneau: string | null
  type: string
}

interface MonthDetailModalProps {
  type: 'salle' | 'formateur'
  titre: string
  mois: number
  annee: number
  onClose: () => void
  sessions?: any[]
  evenements?: any[]
  reservations?: Reservation[]
  disponibilites?: Disponibilite[]
  salle?: string
}

export function MonthDetailModal({
  type, titre, mois, annee, onClose,
  sessions = [], evenements = [],
  reservations = [], disponibilites = [],
  salle
}: MonthDetailModalProps) {

  // ─── Vue SALLE : PlanningWeekView (timeline 30 min) ───
  if (type === 'salle') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-6xl flex flex-col" style={{ height: '90vh' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(var(--border),0.3)] flex-shrink-0">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[rgb(var(--accent))]" />
              <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">{titre}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* PlanningWeekView — prend tout l'espace restant */}
          <div className="flex-1 min-h-0">
            <PlanningWeekView
              mois={mois}
              annee={annee}
              sessions={sessions}
              evenements={evenements}
              reservations={reservations}
            />
          </div>
        </div>
      </div>
    )
  }

  // ─── Vue FORMATEUR : Grille créneaux (inchangée) ───
  const premierJour = new Date(annee, mois, 1)
  const dernierJour = new Date(annee, mois + 1, 0)
  const nbJours = dernierJour.getDate()

  const jours = Array.from({ length: nbJours }, (_, i) => {
    const date = new Date(annee, mois, i + 1)
    return { numero: i + 1, nom: date.toLocaleDateString('fr-FR', { weekday: 'short' }), date }
  })

  const semaines: typeof jours[] = []
  for (let i = 0; i < jours.length; i += 7) {
    semaines.push(jours.slice(i, i + 7))
  }

  const moisNom = premierJour.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  const creneauxFormateur = [
    { label: 'Matin', code: 'MATIN' },
    { label: 'Après-midi', code: 'APRES_MIDI' },
    { label: 'Soir', code: 'SOIR' },
  ]

  const getStatutFormateurCreneau = (jourNumero: number, codeCreneau: string): 'session' | 'disponible' | 'indisponible' | 'libre' => {
    const dateJour = new Date(annee, mois, jourNumero)

    const sessionActive = sessions.find(s => {
      const sessionDebut = new Date(s.dateDebut)
      const sessionFin = new Date(s.dateFin)
      return dateJour >= sessionDebut && dateJour <= sessionFin
    })
    if (sessionActive) return 'session'

    const dispoJour = disponibilites.filter(d => {
      const dDate = new Date(d.date)
      return dDate.getDate() === jourNumero && dDate.getMonth() === mois && dDate.getFullYear() === annee
    })

    const dispoTrouvee = dispoJour.find(d => d.creneau === codeCreneau || d.creneau === null)
    if (dispoTrouvee) {
      return dispoTrouvee.type === 'DISPONIBLE' ? 'disponible' : 'indisponible'
    }

    return 'libre'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(var(--border),0.3)]">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-[rgb(var(--accent))]" />
            <div>
              <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">{titre}</h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))] capitalize">{moisNom}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grille formateur */}
        <div className="flex-1 overflow-auto p-6">
          <div className="min-w-[800px]">
            {semaines.map((semaine, semaineIdx) => (
              <div key={semaineIdx}>
                {semaineIdx > 0 && <div className="h-4"></div>}

                <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-1 mb-2">
                  <div className="text-xs font-medium text-[rgb(var(--muted-foreground))] flex items-center">
                    {semaineIdx === 0 && (
                      <><Clock className="w-3 h-3 mr-1" />Créneaux</>
                    )}
                  </div>
                  {semaine.map((jour) => (
                    <div key={jour.numero} className="text-center">
                      <p className="text-xs font-medium text-[rgb(var(--foreground))]">{jour.nom}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">{jour.numero}</p>
                    </div>
                  ))}
                  {Array.from({ length: 7 - semaine.length }).map((_, i) => (
                    <div key={`empty-${i}`}></div>
                  ))}
                </div>

                {creneauxFormateur.map((creneau, idx) => (
                  <div key={`${semaineIdx}-${idx}`} className="grid grid-cols-[100px_repeat(7,1fr)] gap-1 mb-1">
                    <div className="text-xs text-[rgb(var(--muted-foreground))] flex items-center font-medium">
                      {creneau.label}
                    </div>
                    {semaine.map((jour) => {
                      const statut = getStatutFormateurCreneau(jour.numero, creneau.code)
                      const isSession = statut === 'session'
                      const isDisponible = statut === 'disponible'
                      const isIndisponible = statut === 'indisponible'
                      return (
                        <div
                          key={jour.numero}
                          className={`h-12 rounded border flex items-center justify-center text-xs transition-all ${
                            isSession
                              ? 'bg-[rgba(var(--accent),0.2)] border-[rgb(var(--accent))]'
                              : isDisponible
                              ? 'bg-[rgba(var(--success),0.15)] border-[rgba(var(--success),0.3)] cursor-pointer hover:bg-[rgba(var(--success),0.25)]'
                              : isIndisponible
                              ? 'bg-[rgba(var(--error),0.15)] border-[rgba(var(--error),0.3)]'
                              : 'bg-[rgb(var(--secondary))] border-[rgba(var(--border),0.3)]'
                          }`}
                        >
                          {isSession && <span className="font-medium text-[rgb(var(--accent))]">En cours</span>}
                          {isDisponible && <span className="font-medium text-[rgb(var(--success))]">Dispo</span>}
                          {isIndisponible && <span className="font-medium text-[rgb(var(--error))]">Indispo</span>}
                          {statut === 'libre' && <span className="text-[rgb(var(--muted-foreground))]">—</span>}
                        </div>
                      )
                    })}
                    {Array.from({ length: 7 - semaine.length }).map((_, i) => (
                      <div key={`empty-${i}`}></div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Footer légende formateur */}
        <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[rgba(var(--accent),0.3)] border border-[rgb(var(--accent))]"></div>
                <span className="text-[rgb(var(--muted-foreground))]">En session</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[rgba(var(--success),0.3)] border border-[rgb(var(--success))]"></div>
                <span className="text-[rgb(var(--muted-foreground))]">Disponible</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[rgba(var(--error),0.3)] border border-[rgb(var(--error))]"></div>
                <span className="text-[rgb(var(--muted-foreground))]">Indisponible</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.3)]"></div>
                <span className="text-[rgb(var(--muted-foreground))]">Non déclaré</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[rgb(var(--card))] hover:bg-[rgba(var(--accent),0.1)] rounded-lg transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
