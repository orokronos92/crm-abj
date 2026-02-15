/**
 * Modal détail mensuel - Granularité jour/heure pour salles et formateurs
 * Limite : 200 lignes max
 */

'use client'

import { X, Clock, Users, MapPin } from 'lucide-react'

interface MonthDetailModalProps {
  type: 'salle' | 'formateur'
  titre: string
  mois: number // 0-11
  annee: number
  onClose: () => void
  sessions?: any[] // Sessions pour calculer occupation
  evenements?: any[] // Événements pour afficher les types réels
  salle?: string // Nom de la salle pour filtrer les sessions (vue salle)
}

export function MonthDetailModal({ type, titre, mois, annee, onClose, sessions = [], evenements = [], salle }: MonthDetailModalProps) {
  // Générer les jours du mois
  const premierJour = new Date(annee, mois, 1)
  const dernierJour = new Date(annee, mois + 1, 0)
  const nbJours = dernierJour.getDate()

  const jours = Array.from({ length: nbJours }, (_, i) => {
    const date = new Date(annee, mois, i + 1)
    return {
      numero: i + 1,
      nom: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      date
    }
  })

  // Créer des semaines de 7 jours
  const semaines = []
  for (let i = 0; i < jours.length; i += 7) {
    semaines.push(jours.slice(i, i + 7))
  }

  const moisNom = premierJour.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  // Créneaux horaires pour salles (9h-21h par tranche de 2h)
  const creneauxSalle = [
    { debut: '09:00', fin: '11:00' },
    { debut: '11:00', fin: '13:00' },
    { debut: '13:00', fin: '15:00' },
    { debut: '15:00', fin: '17:00' },
    { debut: '17:00', fin: '19:00' },
    { debut: '19:00', fin: '21:00' },
  ]

  // Créneaux pour formateurs
  const creneauxFormateur = ['Matin', 'Après-midi', 'Soir']

  // Déterminer le type d'activité pour un jour donné
  const getActiviteJour = (jourNumero: number) => {
    const dateJour = new Date(annee, mois, jourNumero)

    // Vérifier événements pour ce jour (si vue salle, vérifier que l'événement est dans cette salle)
    const evenementJour = evenements.find(evt => {
      const evtDate = new Date(evt.date)
      const memeJour = evtDate.getDate() === jourNumero && evtDate.getMonth() === mois && evtDate.getFullYear() === annee

      // Si vue salle, vérifier que l'événement est dans cette salle
      if (type === 'salle' && salle) {
        return memeJour && evt.salle === salle
      }

      return memeJour
    })

    if (evenementJour) {
      // Mapper le type d'événement
      if (evenementJour.type === 'PORTES_OUVERTES') return { type: 'Portes ouvertes', color: 'warning' }
      if (evenementJour.type === 'REUNION') return { type: 'Réunion', color: 'info' }
      if (evenementJour.type === 'STAGE_INITIATION') return { type: 'Stage', color: 'accent' }
      if (evenementJour.type === 'REMISE_DIPLOME') return { type: 'Remise diplômes', color: 'success' }
      return { type: 'Événement', color: 'accent' }
    }

    // Vérifier sessions actives ce jour (si vue salle, filtrer par salle)
    const sessionJour = sessions.find(session => {
      const sessionDebut = new Date(session.dateDebut)
      const sessionFin = new Date(session.dateFin)
      const dansLaPeriode = dateJour >= sessionDebut && dateJour <= sessionFin

      // Si vue salle, vérifier que la session est dans cette salle
      if (type === 'salle' && salle) {
        return dansLaPeriode && session.salle === salle
      }

      return dansLaPeriode
    })

    if (sessionJour) {
      // Identifier le type de formation
      const formation = sessionJour.formation || sessionJour.nom || ''
      if (formation.includes('CAP')) return { type: 'CAP', color: 'success' }
      if (formation.includes('Sertissage')) return { type: 'Sertissage', color: 'info' }
      if (formation.includes('CAO')) return { type: 'CAO/DAO', color: 'accent' }
      return { type: 'Formation', color: 'accent' }
    }

    return null
  }

  // Vérifier si un formateur est occupé à un créneau donné (pour vue formateur)
  const estOccupe = (jourNumero: number, creneau: string): boolean => {
    const dateJour = new Date(annee, mois, jourNumero)

    // Vérifier si une session est active ce jour
    const sessionActive = sessions.find(session => {
      const sessionDebut = new Date(session.dateDebut)
      const sessionFin = new Date(session.dateFin)
      return dateJour >= sessionDebut && dateJour <= sessionFin
    })

    // Vérifier si un événement est prévu ce jour
    const evenementJour = evenements.find(evt => {
      const evtDate = new Date(evt.date)
      return evtDate.getDate() === jourNumero && evtDate.getMonth() === mois && evtDate.getFullYear() === annee
    })

    // Si session ou événement trouvé, le formateur est considéré occupé
    return !!(sessionActive || evenementJour)
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
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grille calendrier */}
        <div className="flex-1 overflow-auto p-6">
          <div className="min-w-[800px]">
            {/* Afficher toutes les semaines du mois */}
            {semaines.map((semaine, semaineIdx) => (
              <div key={semaineIdx}>
                {/* Espacement entre les semaines */}
                {semaineIdx > 0 && <div className="h-4"></div>}

                {/* En-tête de la semaine */}
                <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-1 mb-2">
                  <div className="text-xs font-medium text-[rgb(var(--muted-foreground))] flex items-center">
                    {semaineIdx === 0 && (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        {type === 'salle' ? 'Horaires' : 'Créneaux'}
                      </>
                    )}
                  </div>
                  {semaine.map((jour) => (
                    <div key={jour.numero} className="text-center">
                      <p className="text-xs font-medium text-[rgb(var(--foreground))]">{jour.nom}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">{jour.numero}</p>
                    </div>
                  ))}
                  {/* Remplir cellules vides pour semaines incomplètes */}
                  {Array.from({ length: 7 - semaine.length }).map((_, i) => (
                    <div key={`empty-${i}`}></div>
                  ))}
                </div>

                {/* Créneaux pour cette semaine */}
                {type === 'salle' ? (
                  // Vue horaire pour salles
                  creneauxSalle.map((creneau, idx) => (
                    <div key={`${semaineIdx}-${idx}`} className="grid grid-cols-[100px_repeat(7,1fr)] gap-1 mb-1">
                      <div className="text-xs text-[rgb(var(--muted-foreground))] flex items-center">
                        {creneau.debut}-{creneau.fin}
                      </div>
                      {semaine.map((jour) => {
                        const activite = getActiviteJour(jour.numero)
                        const colorClass = activite
                          ? activite.color === 'success' ? 'bg-[rgba(var(--success),0.2)] border-[rgb(var(--success))] text-[rgb(var(--success))]'
                          : activite.color === 'info' ? 'bg-[rgba(var(--info),0.2)] border-[rgb(var(--info))] text-[rgb(var(--info))]'
                          : activite.color === 'warning' ? 'bg-[rgba(var(--warning),0.2)] border-[rgb(var(--warning))] text-[rgb(var(--warning))]'
                          : 'bg-[rgba(var(--accent),0.2)] border-[rgb(var(--accent))] text-[rgb(var(--accent))]'
                          : 'bg-[rgb(var(--secondary))]'

                        return (
                          <div
                            key={jour.numero}
                            className={`h-12 rounded border border-[rgba(var(--border),0.3)] flex items-center justify-center text-xs transition-all cursor-pointer hover:opacity-80 ${colorClass}`}
                          >
                            {activite && <span className="font-medium">{activite.type}</span>}
                          </div>
                        )
                      })}
                      {/* Remplir cellules vides pour semaines incomplètes */}
                      {Array.from({ length: 7 - semaine.length }).map((_, i) => (
                        <div key={`empty-${i}`}></div>
                      ))}
                    </div>
                  ))
                ) : (
                  // Vue créneaux pour formateurs
                  creneauxFormateur.map((creneau, idx) => (
                    <div key={`${semaineIdx}-${idx}`} className="grid grid-cols-[100px_repeat(7,1fr)] gap-1 mb-1">
                      <div className="text-xs text-[rgb(var(--muted-foreground))] flex items-center font-medium">
                        {creneau}
                      </div>
                      {semaine.map((jour) => {
                        const occupe = estOccupe(jour.numero, creneau)
                        return (
                          <div
                            key={jour.numero}
                            className={`h-12 rounded border border-[rgba(var(--border),0.3)] flex items-center justify-center text-xs transition-all ${
                              occupe
                                ? 'bg-[rgba(var(--accent),0.2)] border-[rgb(var(--accent))]'
                                : 'bg-[rgba(var(--success),0.15)] border-[rgba(var(--success),0.3)] cursor-pointer hover:bg-[rgba(var(--success),0.25)]'
                            }`}
                          >
                            {occupe ? (
                              <span className="font-medium text-[rgb(var(--accent))]">En cours</span>
                            ) : (
                              <span className="font-medium text-[rgb(var(--success))]">Dispo</span>
                            )}
                          </div>
                        )
                      })}
                      {/* Remplir cellules vides pour semaines incomplètes */}
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

        {/* Footer avec légende améliorée */}
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
                    <div className="w-3 h-3 rounded bg-[rgba(var(--accent),0.3)] border border-[rgb(var(--accent))]"></div>
                    <span className="text-[rgb(var(--muted-foreground))]">Événement</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[rgba(var(--info),0.3)] border border-[rgb(var(--info))]"></div>
                    <span className="text-[rgb(var(--muted-foreground))]">Sertissage / CAO</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[rgba(var(--warning),0.3)] border border-[rgb(var(--warning))]"></div>
                    <span className="text-[rgb(var(--muted-foreground))]">Réunion</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.3)]"></div>
                    <span className="text-[rgb(var(--muted-foreground))]">Disponible</span>
                  </div>
                </>
              ) : (
                <>
                  <span>🟦 En cours / Indisponible</span>
                  <span>🟩 Disponible</span>
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
