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
}

export function MonthDetailModal({ type, titre, mois, annee, onClose, sessions = [] }: MonthDetailModalProps) {
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

  // Vérifier occupation pour un jour/créneau donné
  const estOccupe = (jour: number, creneau: string) => {
    // Mock : simuler occupation aléatoire
    const random = Math.random()
    if (type === 'salle') {
      return random > 0.6 // 40% occupation
    } else {
      return random > 0.7 // 30% occupation
    }
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
            {/* En-tête jours */}
            <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-1 mb-2">
              <div className="text-xs font-medium text-[rgb(var(--muted-foreground))] flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {type === 'salle' ? 'Horaires' : 'Créneaux'}
              </div>
              {jours.slice(0, 7).map((jour) => (
                <div key={jour.numero} className="text-center">
                  <p className="text-xs font-medium text-[rgb(var(--foreground))]">{jour.nom}</p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">{jour.numero}</p>
                </div>
              ))}
            </div>

            {/* Semaines */}
            {type === 'salle' ? (
              // Vue horaire pour salles
              creneauxSalle.map((creneau, idx) => (
                <div key={idx} className="grid grid-cols-[100px_repeat(7,1fr)] gap-1 mb-1">
                  <div className="text-xs text-[rgb(var(--muted-foreground))] flex items-center">
                    {creneau.debut}-{creneau.fin}
                  </div>
                  {jours.slice(0, 7).map((jour) => {
                    const occupe = estOccupe(jour.numero, creneau.debut)
                    return (
                      <div
                        key={jour.numero}
                        className={`h-12 rounded border border-[rgba(var(--border),0.3)] flex items-center justify-center text-xs transition-all ${
                          occupe
                            ? 'bg-[rgba(var(--accent),0.2)] border-[rgb(var(--accent))] cursor-pointer hover:bg-[rgba(var(--accent),0.3)]'
                            : 'bg-[rgb(var(--secondary))] hover:bg-[rgba(var(--success),0.1)] cursor-pointer'
                        }`}
                      >
                        {occupe && <span className="font-medium text-[rgb(var(--accent))]">Session</span>}
                      </div>
                    )
                  })}
                </div>
              ))
            ) : (
              // Vue créneaux pour formateurs
              creneauxFormateur.map((creneau, idx) => (
                <div key={idx} className="grid grid-cols-[100px_repeat(7,1fr)] gap-1 mb-1">
                  <div className="text-xs text-[rgb(var(--muted-foreground))] flex items-center font-medium">
                    {creneau}
                  </div>
                  {jours.slice(0, 7).map((jour) => {
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
                </div>
              ))
            )}

            {/* Semaines suivantes */}
            {jours.length > 7 && (
              <>
                <div className="h-4"></div>
                <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-1 mb-2">
                  <div></div>
                  {jours.slice(7, 14).map((jour) => (
                    <div key={jour.numero} className="text-center">
                      <p className="text-xs font-medium text-[rgb(var(--foreground))]">{jour.nom}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">{jour.numero}</p>
                    </div>
                  ))}
                </div>
                {type === 'salle' ? (
                  creneauxSalle.map((creneau, idx) => (
                    <div key={`s2-${idx}`} className="grid grid-cols-[100px_repeat(7,1fr)] gap-1 mb-1">
                      <div className="text-xs text-[rgb(var(--muted-foreground))] flex items-center">
                        {creneau.debut}-{creneau.fin}
                      </div>
                      {jours.slice(7, 14).map((jour) => {
                        const occupe = estOccupe(jour.numero, creneau.debut)
                        return (
                          <div
                            key={jour.numero}
                            className={`h-12 rounded border border-[rgba(var(--border),0.3)] flex items-center justify-center text-xs transition-all ${
                              occupe
                                ? 'bg-[rgba(var(--accent),0.2)] border-[rgb(var(--accent))]'
                                : 'bg-[rgb(var(--secondary))] hover:bg-[rgba(var(--success),0.1)]'
                            }`}
                          >
                            {occupe && <span className="font-medium text-[rgb(var(--accent))]">Session</span>}
                          </div>
                        )
                      })}
                    </div>
                  ))
                ) : (
                  creneauxFormateur.map((creneau, idx) => (
                    <div key={`s2-${idx}`} className="grid grid-cols-[100px_repeat(7,1fr)] gap-1 mb-1">
                      <div className="text-xs text-[rgb(var(--muted-foreground))] flex items-center font-medium">
                        {creneau}
                      </div>
                      {jours.slice(7, 14).map((jour) => {
                        const occupe = estOccupe(jour.numero, creneau)
                        return (
                          <div
                            key={jour.numero}
                            className={`h-12 rounded border border-[rgba(var(--border),0.3)] flex items-center justify-center text-xs ${
                              occupe
                                ? 'bg-[rgba(var(--accent),0.2)] border-[rgb(var(--accent))]'
                                : 'bg-[rgba(var(--success),0.15)] border-[rgba(var(--success),0.3)]'
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
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-[rgb(var(--muted-foreground))]">
              {type === 'salle' ? (
                <>
                  <span>🟦 Session programmée</span>
                  <span>⬜ Créneaux disponibles</span>
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
