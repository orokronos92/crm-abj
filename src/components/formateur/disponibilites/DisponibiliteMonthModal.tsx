/**
 * Modal détail mois - Grille 3 créneaux × tous les jours
 * Click sur une case → mini formulaire morpion Dispo/Indispo
 */

'use client'

import { X, Check } from 'lucide-react'
import { useState } from 'react'

const MOIS_NOMS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

const CRENEAUX = [
  { code: 'MATIN', label: 'Matin' },
  { code: 'APRES_MIDI', label: 'Après-midi' },
  { code: 'JOURNEE', label: 'Soir' },
]

interface DisponibiliteMonthModalProps {
  mois: number
  annee: number
  disponibilites: any[]
  sessions: any[]
  onClose: () => void
  onAddDispo: (date: string, creneau: string, statut: string) => void
}

export function DisponibiliteMonthModal({
  mois,
  annee,
  disponibilites,
  sessions,
  onClose,
  onAddDispo,
}: DisponibiliteMonthModalProps) {
  const [celluleSelectionnee, setCelluleSelectionnee] = useState<{
    jour: number
    creneau: string
  } | null>(null)

  // États séparés pour chaque créneau
  const [statutMatin, setStatutMatin] = useState<'DISPONIBLE' | 'INDISPONIBLE' | null>(null)
  const [statutApresMidi, setStatutApresMidi] = useState<'DISPONIBLE' | 'INDISPONIBLE' | null>(null)
  const [statutSoir, setStatutSoir] = useState<'DISPONIBLE' | 'INDISPONIBLE' | null>(null)

  // Générer les jours du mois
  const premierJour = new Date(annee, mois, 1)
  const dernierJour = new Date(annee, mois + 1, 0)
  const nbJours = dernierJour.getDate()

  const jours = Array.from({ length: nbJours }, (_, i) => {
    const date = new Date(annee, mois, i + 1)
    return {
      numero: i + 1,
      nom: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      date,
    }
  })

  const moisNom = MOIS_NOMS[mois]

  // Vérifier si une session est active un jour donné pour un créneau
  const hasSessionOnCell = (jour: number, creneau: string) => {
    const jourDate = new Date(annee, mois, jour)
    return sessions.some((session) => {
      const debut = new Date(session.dateDebut)
      const fin = new Date(session.dateFin)
      return jourDate >= debut && jourDate <= fin
    })
  }

  // Obtenir la dispo pour une cellule
  const getDispoForCell = (jour: number, creneau: string) => {
    return disponibilites.find((d) => {
      const date = new Date(d.date)
      return (
        date.getDate() === jour &&
        date.getMonth() === mois &&
        date.getFullYear() === annee &&
        d.creneauJournee === creneau
      )
    })
  }

  // Gérer le click sur une cellule
  const handleCellClick = (jour: number, creneau: string) => {
    const isSession = hasSessionOnCell(jour, creneau)
    if (isSession) return // Pas de modification sur session

    // Pré-remplir les statuts actuels des 3 créneaux
    const dispoMatin = getDispoForCell(jour, 'MATIN')
    const dispoApresMidi = getDispoForCell(jour, 'APRES_MIDI')
    const dispoSoir = getDispoForCell(jour, 'JOURNEE')

    setStatutMatin(
      dispoMatin?.typeDisponibilite === 'DISPONIBLE'
        ? 'DISPONIBLE'
        : dispoMatin?.typeDisponibilite === 'INDISPONIBLE'
        ? 'INDISPONIBLE'
        : null
    )

    setStatutApresMidi(
      dispoApresMidi?.typeDisponibilite === 'DISPONIBLE'
        ? 'DISPONIBLE'
        : dispoApresMidi?.typeDisponibilite === 'INDISPONIBLE'
        ? 'INDISPONIBLE'
        : null
    )

    setStatutSoir(
      dispoSoir?.typeDisponibilite === 'DISPONIBLE'
        ? 'DISPONIBLE'
        : dispoSoir?.typeDisponibilite === 'INDISPONIBLE'
        ? 'INDISPONIBLE'
        : null
    )

    setCelluleSelectionnee({ jour, creneau })
  }

  // Valider les disponibilités
  const handleValider = () => {
    if (!celluleSelectionnee) return

    const dateStr = `${annee}-${String(mois + 1).padStart(2, '0')}-${String(celluleSelectionnee.jour).padStart(2, '0')}`

    // Sauvegarder les 3 créneaux si définis
    if (statutMatin) {
      onAddDispo(dateStr, 'MATIN', statutMatin)
    }
    if (statutApresMidi) {
      onAddDispo(dateStr, 'APRES_MIDI', statutApresMidi)
    }
    if (statutSoir) {
      onAddDispo(dateStr, 'JOURNEE', statutSoir)
    }

    // Fermer le mini formulaire
    setCelluleSelectionnee(null)
    setStatutMatin(null)
    setStatutApresMidi(null)
    setStatutSoir(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(var(--border),0.3)]">
          <div>
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              {moisNom} {annee}
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
              Cliquez sur une case pour définir disponible ou indisponible
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Grille des jours avec 3 créneaux par jour */}
          <div className="grid grid-cols-7 gap-2">
            {jours.map((jour) => (
              <div
                key={jour.numero}
                className="border border-[rgba(var(--border),0.3)] rounded-lg overflow-hidden"
              >
                {/* Numéro du jour */}
                <div className="bg-[rgb(var(--secondary))] px-2 py-1 border-b border-[rgba(var(--border),0.3)]">
                  <span className="text-xs font-medium text-[rgb(var(--foreground))]">
                    {jour.numero}
                  </span>
                </div>

                {/* 3 créneaux empilés */}
                <div className="flex flex-col">
                  {CRENEAUX.map((creneau) => {
                    const isSession = hasSessionOnCell(jour.numero, creneau.code)
                    const dispo = getDispoForCell(jour.numero, creneau.code)

                    return (
                      <div
                        key={creneau.code}
                        onClick={() => handleCellClick(jour.numero, creneau.code)}
                        className={`h-10 flex items-center justify-center border-b border-[rgba(var(--border),0.2)] last:border-b-0 transition-all ${
                          isSession
                            ? 'cursor-not-allowed'
                            : 'cursor-pointer hover:bg-[rgba(var(--accent),0.05)]'
                        }`}
                        style={{
                          backgroundColor: isSession
                            ? 'rgba(234, 179, 8, 0.15)'
                            : dispo?.typeDisponibilite === 'DISPONIBLE'
                            ? 'rgba(34, 197, 94, 0.15)'
                            : dispo?.typeDisponibilite === 'INDISPONIBLE'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : 'transparent',
                        }}
                      >
                        {isSession && <span className="text-[10px]">🔒</span>}
                        {dispo?.typeDisponibilite === 'DISPONIBLE' && !isSession && (
                          <span className="text-xs" style={{ color: 'rgb(34, 197, 94)' }}>
                            ✓
                          </span>
                        )}
                        {dispo?.typeDisponibilite === 'INDISPONIBLE' && !isSession && (
                          <span className="text-xs" style={{ color: 'rgb(239, 68, 68)' }}>
                            ✗
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-[rgb(var(--muted-foreground))]">
              <span className="flex items-center gap-1">
                <span style={{ color: 'rgb(34, 197, 94)' }}>✓</span> Disponible
              </span>
              <span className="flex items-center gap-1">
                <span style={{ color: 'rgb(239, 68, 68)' }}>✗</span> Indisponible
              </span>
              <span className="flex items-center gap-1">
                <span style={{ color: 'rgb(234, 179, 8)' }}>🔒</span> Session (auto)
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[rgb(var(--card))] hover:bg-[rgba(var(--accent),0.1)] rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>

      {/* Modal formulaire par-dessus */}
      {celluleSelectionnee && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
          <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-md border border-[rgba(var(--border),0.5)] shadow-2xl">
            <div className="p-6 border-b border-[rgba(var(--border),0.3)]">
              <h3 className="text-lg font-bold text-[rgb(var(--foreground))]">
                {celluleSelectionnee.jour} {moisNom} {annee}
              </h3>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                Définissez vos disponibilités pour cette journée
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Matin */}
              <div>
                <p className="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-2">
                  Matin
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStatutMatin('DISPONIBLE')}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      statutMatin === 'DISPONIBLE'
                        ? 'border-[rgb(34,197,94)] bg-[rgba(34,197,94,0.15)]'
                        : 'border-[rgba(var(--border),0.3)] hover:border-[rgb(34,197,94)]'
                    }`}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{
                        color:
                          statutMatin === 'DISPONIBLE'
                            ? 'rgb(34, 197, 94)'
                            : 'rgb(var(--foreground))',
                      }}
                    >
                      Dispo
                    </span>
                  </button>
                  <button
                    onClick={() => setStatutMatin('INDISPONIBLE')}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      statutMatin === 'INDISPONIBLE'
                        ? 'border-[rgb(239,68,68)] bg-[rgba(239,68,68,0.15)]'
                        : 'border-[rgba(var(--border),0.3)] hover:border-[rgb(239,68,68)]'
                    }`}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{
                        color:
                          statutMatin === 'INDISPONIBLE'
                            ? 'rgb(239, 68, 68)'
                            : 'rgb(var(--foreground))',
                      }}
                    >
                      Pas dispo
                    </span>
                  </button>
                </div>
              </div>

              {/* Après-midi */}
              <div>
                <p className="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-2">
                  Après-midi
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStatutApresMidi('DISPONIBLE')}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      statutApresMidi === 'DISPONIBLE'
                        ? 'border-[rgb(34,197,94)] bg-[rgba(34,197,94,0.15)]'
                        : 'border-[rgba(var(--border),0.3)] hover:border-[rgb(34,197,94)]'
                    }`}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{
                        color:
                          statutApresMidi === 'DISPONIBLE'
                            ? 'rgb(34, 197, 94)'
                            : 'rgb(var(--foreground))',
                      }}
                    >
                      Dispo
                    </span>
                  </button>
                  <button
                    onClick={() => setStatutApresMidi('INDISPONIBLE')}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      statutApresMidi === 'INDISPONIBLE'
                        ? 'border-[rgb(239,68,68)] bg-[rgba(239,68,68,0.15)]'
                        : 'border-[rgba(var(--border),0.3)] hover:border-[rgb(239,68,68)]'
                    }`}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{
                        color:
                          statutApresMidi === 'INDISPONIBLE'
                            ? 'rgb(239, 68, 68)'
                            : 'rgb(var(--foreground))',
                      }}
                    >
                      Pas dispo
                    </span>
                  </button>
                </div>
              </div>

              {/* Soir */}
              <div>
                <p className="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-2">
                  Soir
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStatutSoir('DISPONIBLE')}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      statutSoir === 'DISPONIBLE'
                        ? 'border-[rgb(34,197,94)] bg-[rgba(34,197,94,0.15)]'
                        : 'border-[rgba(var(--border),0.3)] hover:border-[rgb(34,197,94)]'
                    }`}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{
                        color:
                          statutSoir === 'DISPONIBLE'
                            ? 'rgb(34, 197, 94)'
                            : 'rgb(var(--foreground))',
                      }}
                    >
                      Dispo
                    </span>
                  </button>
                  <button
                    onClick={() => setStatutSoir('INDISPONIBLE')}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      statutSoir === 'INDISPONIBLE'
                        ? 'border-[rgb(239,68,68)] bg-[rgba(239,68,68,0.15)]'
                        : 'border-[rgba(var(--border),0.3)] hover:border-[rgb(239,68,68)]'
                    }`}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{
                        color:
                          statutSoir === 'INDISPONIBLE'
                            ? 'rgb(239, 68, 68)'
                            : 'rgb(var(--foreground))',
                      }}
                    >
                      Pas dispo
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setCelluleSelectionnee(null)
                    setStatutMatin(null)
                    setStatutApresMidi(null)
                    setStatutSoir(null)
                  }}
                  className="flex-1 px-4 py-2 bg-[rgb(var(--card))] hover:bg-[rgba(var(--accent),0.05)] rounded-lg transition-colors text-sm"
                >
                  Annuler
                </button>
                <button
                  onClick={handleValider}
                  disabled={!statutMatin && !statutApresMidi && !statutSoir}
                  className="flex-1 px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg hover:opacity-90 transition-opacity text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Valider
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
