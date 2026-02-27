/**
 * Modal détail mensuel - Granularité jour/heure pour salles et formateurs
 * Utilise les vraies données de réservation (ReservationSalle) pour la précision horaire
 */

'use client'

import { X, Clock, Users, MapPin } from 'lucide-react'

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
  creneau: string | null  // MATIN | APRES_MIDI | SOIR | null (= journée entière)
  type: string            // DISPONIBLE | INDISPONIBLE
}

interface MonthDetailModalProps {
  type: 'salle' | 'formateur'
  titre: string
  mois: number // 0-11
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

  const creneauxSalle = [
    { debut: '09:00', fin: '11:00', debutH: 9, finH: 11 },
    { debut: '11:00', fin: '13:00', debutH: 11, finH: 13 },
    { debut: '13:00', fin: '15:00', debutH: 13, finH: 15 },
    { debut: '15:00', fin: '17:00', debutH: 15, finH: 17 },
    { debut: '17:00', fin: '19:00', debutH: 17, finH: 19 },
    { debut: '19:00', fin: '21:00', debutH: 19, finH: 21 },
  ]

  const creneauxFormateur = [
    { label: 'Matin', code: 'MATIN' },
    { label: 'Après-midi', code: 'APRES_MIDI' },
    { label: 'Soir', code: 'SOIR' },
  ]

  /**
   * Vue SALLE : détermine l'activité d'un créneau horaire précis
   * Utilise d'abord les réservations (précision heure), sinon fallback sessions/événements
   */
  const getActiviteSalleCreneau = (jourNumero: number, debutH: number, finH: number) => {
    // 1. Chercher une réservation qui chevauche ce créneau
    const reservation = reservations.find(r => {
      const rDebut = new Date(r.dateDebut)
      const rFin = new Date(r.dateFin)
      if (rDebut.getDate() !== jourNumero || rDebut.getMonth() !== mois || rDebut.getFullYear() !== annee) return false
      // Chevauchement : début résa < fin créneau ET fin résa > début créneau
      return rDebut.getHours() < finH && rFin.getHours() > debutH
    })

    if (reservation) {
      // Identifier le type via session liée
      if (reservation.idSession) {
        const session = sessions.find(s => s.id === reservation.idSession)
        const codeFormation = session?.codeFormation || ''
        const nomFormation = session?.formation || session?.nom || 'Formation'

        // Couleur selon le code formation, texte = nom réel de la formation
        if (codeFormation.includes('CAP')) return { type: nomFormation, color: 'success' }
        if (codeFormation.includes('SERTI')) return { type: nomFormation, color: 'info' }
        if (codeFormation.includes('CAO') || codeFormation.includes('DAO')) return { type: nomFormation, color: 'info' }
        return { type: nomFormation, color: 'accent' }
      }
      if (reservation.idEvenement) return { type: 'Événement', color: 'warning' }
      return { type: 'Réservé', color: 'accent' }
    }

    // 2. Fallback : vérifier événements du jour (occupation journée entière)
    const evenementJour = evenements.find(evt => {
      const evtDate = new Date(evt.date)
      return evtDate.getDate() === jourNumero && evtDate.getMonth() === mois && evtDate.getFullYear() === annee
    })
    if (evenementJour) {
      if (evenementJour.type === 'PORTES_OUVERTES') return { type: 'Portes ouvertes', color: 'warning' }
      if (evenementJour.type === 'REUNION') return { type: 'Réunion', color: 'info' }
      if (evenementJour.type === 'REMISE_DIPLOME') return { type: 'Remise diplômes', color: 'success' }
      return { type: 'Événement', color: 'accent' }
    }

    // Pas de réservation précise pour ce créneau → disponible
    return null
  }

  /**
   * Vue FORMATEUR : détermine le statut d'un créneau (Matin/Après-midi/Soir)
   * Utilise disponibilites avec creneauJournee précis
   */
  const getStatutFormateurCreneau = (jourNumero: number, codeCreneau: string): 'session' | 'disponible' | 'indisponible' | 'libre' => {
    const dateJour = new Date(annee, mois, jourNumero)

    // 1. Session active ce jour → créneau occupé
    const sessionActive = sessions.find(s => {
      const sessionDebut = new Date(s.dateDebut)
      const sessionFin = new Date(s.dateFin)
      return dateJour >= sessionDebut && dateJour <= sessionFin
    })
    if (sessionActive) return 'session'

    // 2. Chercher une disponibilité déclarée pour ce jour et ce créneau
    const dispoJour = disponibilites.filter(d => {
      const dDate = new Date(d.date)
      return dDate.getDate() === jourNumero && dDate.getMonth() === mois && dDate.getFullYear() === annee
    })

    // Disponibilité spécifique au créneau OU journée entière (creneau null)
    const dispoMatin = dispoJour.find(d => d.creneau === codeCreneau || d.creneau === null)
    if (dispoMatin) {
      return dispoMatin.type === 'DISPONIBLE' ? 'disponible' : 'indisponible'
    }

    return 'libre'
  }

  const colorClassSalle = (activite: { type: string; color: string } | null) => {
    if (!activite) return 'bg-[rgb(var(--secondary))] border-[rgba(var(--border),0.3)]'
    if (activite.color === 'success') return 'bg-[rgba(var(--success),0.2)] border-[rgb(var(--success))] text-[rgb(var(--success))]'
    if (activite.color === 'info') return 'bg-[rgba(var(--info),0.2)] border-[rgb(var(--info))] text-[rgb(var(--info))]'
    if (activite.color === 'warning') return 'bg-[rgba(var(--warning),0.2)] border-[rgb(var(--warning))] text-[rgb(var(--warning))]'
    return 'bg-[rgba(var(--accent),0.2)] border-[rgb(var(--accent))] text-[rgb(var(--accent))]'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(var(--border),0.3)]">
          <div className="flex items-center gap-3">
            {type === 'salle' ? (
              <MapPin className="w-6 h-6 text-[rgb(var(--accent))]" />
            ) : (
              <Users className="w-6 h-6 text-[rgb(var(--accent))]" />
            )}
            <div>
              <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">{titre}</h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))] capitalize">{moisNom}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grille calendrier */}
        <div className="flex-1 overflow-auto p-6">
          <div className="min-w-[800px]">
            {semaines.map((semaine, semaineIdx) => (
              <div key={semaineIdx}>
                {semaineIdx > 0 && <div className="h-4"></div>}

                {/* En-tête de la semaine */}
                <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-1 mb-2">
                  <div className="text-xs font-medium text-[rgb(var(--muted-foreground))] flex items-center">
                    {semaineIdx === 0 && (
                      <><Clock className="w-3 h-3 mr-1" />{type === 'salle' ? 'Horaires' : 'Créneaux'}</>
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

                {/* Créneaux */}
                {type === 'salle' ? (
                  creneauxSalle.map((creneau, idx) => (
                    <div key={`${semaineIdx}-${idx}`} className="grid grid-cols-[100px_repeat(7,1fr)] gap-1 mb-1">
                      <div className="text-xs text-[rgb(var(--muted-foreground))] flex items-center">
                        {creneau.debut}-{creneau.fin}
                      </div>
                      {semaine.map((jour) => {
                        const activite = getActiviteSalleCreneau(jour.numero, creneau.debutH, creneau.finH)
                        return (
                          <div
                            key={jour.numero}
                            className={`h-12 rounded border flex items-center justify-center text-xs transition-all cursor-pointer hover:opacity-80 ${colorClassSalle(activite)}`}
                          >
                            {activite && <span className="font-medium truncate px-1">{activite.type}</span>}
                          </div>
                        )
                      })}
                      {Array.from({ length: 7 - semaine.length }).map((_, i) => (
                        <div key={`empty-${i}`}></div>
                      ))}
                    </div>
                  ))
                ) : (
                  creneauxFormateur.map((creneau, idx) => (
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
                  ))
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer légende */}
        <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs">
              {type === 'salle' ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[rgba(var(--success),0.3)] border border-[rgb(var(--success))]"></div>
                    <span className="text-[rgb(var(--muted-foreground))]">CAP / Formation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[rgba(var(--info),0.3)] border border-[rgb(var(--info))]"></div>
                    <span className="text-[rgb(var(--muted-foreground))]">Sertissage / CAO</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[rgba(var(--warning),0.3)] border border-[rgb(var(--warning))]"></div>
                    <span className="text-[rgb(var(--muted-foreground))]">Événement</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.3)]"></div>
                    <span className="text-[rgb(var(--muted-foreground))]">Disponible</span>
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
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
