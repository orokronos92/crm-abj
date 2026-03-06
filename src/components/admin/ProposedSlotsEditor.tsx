'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Calendar, Clock, MapPin, Info } from 'lucide-react'
import { randomUUID } from 'crypto'

// Interface exportée inchangée — l'API consomme toujours ce format
export interface ProposedSlot {
  date: string       // YYYY-MM-DD
  heureDebut: string // HH:MM
  heureFin: string   // HH:MM
  idSalle: number
  nomSalle: string
}

interface Salle {
  idSalle: number
  nom: string
}

export interface ProposedSlotsEditorProps {
  slots: ProposedSlot[]
  salles: Salle[]
  onChange: (slots: ProposedSlot[]) => void
  disabled?: boolean
}

// Plage horaire saisie par Yasmina
interface Plage {
  id: string
  date: string
  heureDebut: string
  heureFin: string
  idSalle: number
  nomSalle: string
  dureeCreneauMin: number  // 30 | 60 | 90 | 120
}

const MAX_PLAGES = 4
const DUREES = [
  { value: 30,  label: '30 min' },
  { value: 60,  label: '1 heure' },
  { value: 90,  label: '1h30' },
  { value: 120, label: '2 heures' },
]

function buildEmptyPlage(salles: Salle[]): Plage {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return {
    id:              typeof window !== 'undefined' ? crypto.randomUUID() : String(Date.now()),
    date:            tomorrow.toISOString().split('T')[0],
    heureDebut:      '09:00',
    heureFin:        '12:00',
    idSalle:         salles[0]?.idSalle ?? 0,
    nomSalle:        salles[0]?.nom ?? '',
    dureeCreneauMin: 60,
  }
}

// Génère les créneaux individuels à partir d'une plage
function genererCreneaux(plage: Plage): ProposedSlot[] {
  const slots: ProposedSlot[] = []
  const [hDebutH, hDebutM] = plage.heureDebut.split(':').map(Number)
  const [hFinH, hFinM]     = plage.heureFin.split(':').map(Number)

  let currentMin = hDebutH * 60 + hDebutM
  const finMin   = hFinH   * 60 + hFinM

  while (currentMin + plage.dureeCreneauMin <= finMin) {
    const startH = Math.floor(currentMin / 60)
    const startM = currentMin % 60
    const endMin = currentMin + plage.dureeCreneauMin
    const endH   = Math.floor(endMin / 60)
    const endM   = endMin % 60

    slots.push({
      date:       plage.date,
      heureDebut: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
      heureFin:   `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
      idSalle:    plage.idSalle,
      nomSalle:   plage.nomSalle,
    })

    currentMin += plage.dureeCreneauMin
  }

  return slots
}

function nbCreneaux(plage: Plage): number {
  return genererCreneaux(plage).length
}

export function ProposedSlotsEditor({ salles, onChange, disabled = false }: ProposedSlotsEditorProps) {
  const [plages, setPlages] = useState<Plage[]>([])

  // Recalculer tous les slots et notifier le parent
  useEffect(() => {
    const allSlots = plages.flatMap(genererCreneaux)
    onChange(allSlots)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plages])

  const handleAdd = () => {
    if (plages.length >= MAX_PLAGES) return
    setPlages(prev => [...prev, buildEmptyPlage(salles)])
  }

  const handleRemove = (id: string) => {
    setPlages(prev => prev.filter(p => p.id !== id))
  }

  const handleChange = (id: string, field: keyof Omit<Plage, 'id'>, value: string | number) => {
    setPlages(prev => prev.map(p => {
      if (p.id !== id) return p
      if (field === 'idSalle') {
        const salle = salles.find(s => s.idSalle === Number(value))
        return { ...p, idSalle: Number(value), nomSalle: salle?.nom ?? '' }
      }
      return { ...p, [field]: value }
    }))
  }

  const totalCreneaux = plages.reduce((sum, p) => sum + nbCreneaux(p), 0)

  return (
    <div className="space-y-3">
      {/* En-tête */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-[rgb(var(--accent))]" />
        <span className="text-sm font-medium text-[rgb(var(--foreground))]">
          Plages horaires proposées
        </span>
        {totalCreneaux > 0 && (
          <span className="ml-auto text-xs font-semibold text-[rgb(var(--accent))] bg-[rgba(var(--accent),0.1)] px-2 py-0.5 rounded-full">
            → {totalCreneaux} créneaux
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 p-2.5 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.15)] rounded-lg">
        <Info className="w-3.5 h-3.5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed">
          Saisissez des plages horaires (ex: 09h–12h). Le système découpe automatiquement
          en créneaux. Les candidats reçoivent <strong>1 lien</strong> vers un mini-calendrier
          pour choisir leur créneau.
        </p>
      </div>

      {/* Liste des plages */}
      {plages.length === 0 && (
        <p className="text-xs text-[rgb(var(--muted-foreground))] text-center py-3">
          Aucune plage — ajoutez-en au moins une
        </p>
      )}

      {plages.map((plage) => {
        const n = nbCreneaux(plage)
        return (
          <div
            key={plage.id}
            className="p-3 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.4)] rounded-lg space-y-2"
          >
            {/* Header plage */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[rgb(var(--accent))]">
                Plage
              </span>
              <div className="flex items-center gap-2">
                {n > 0 && (
                  <span className="text-xs text-[rgb(var(--muted-foreground))]">
                    → {n} créneau{n > 1 ? 'x' : ''} de {plage.dureeCreneauMin} min
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(plage.id)}
                  disabled={disabled}
                  className="p-1 hover:bg-[rgba(var(--error),0.1)] rounded text-[rgb(var(--error))] transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="flex items-center gap-1 text-xs text-[rgb(var(--muted-foreground))] mb-1">
                <Calendar className="w-3 h-3" /> Date
              </label>
              <input
                type="date"
                value={plage.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => handleChange(plage.id, 'date', e.target.value)}
                disabled={disabled}
                className="w-full px-2.5 py-1.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded text-[rgb(var(--foreground))] text-xs focus:border-[rgb(var(--accent))] focus:outline-none disabled:opacity-50"
              />
            </div>

            {/* Horaires début/fin */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="flex items-center gap-1 text-xs text-[rgb(var(--muted-foreground))] mb-1">
                  <Clock className="w-3 h-3" /> Début
                </label>
                <input
                  type="time"
                  value={plage.heureDebut}
                  onChange={e => handleChange(plage.id, 'heureDebut', e.target.value)}
                  disabled={disabled}
                  className="w-full px-2.5 py-1.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded text-[rgb(var(--foreground))] text-xs focus:border-[rgb(var(--accent))] focus:outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs text-[rgb(var(--muted-foreground))] mb-1">
                  <Clock className="w-3 h-3" /> Fin
                </label>
                <input
                  type="time"
                  value={plage.heureFin}
                  onChange={e => handleChange(plage.id, 'heureFin', e.target.value)}
                  disabled={disabled}
                  className="w-full px-2.5 py-1.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded text-[rgb(var(--foreground))] text-xs focus:border-[rgb(var(--accent))] focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* Salle + durée créneau */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="flex items-center gap-1 text-xs text-[rgb(var(--muted-foreground))] mb-1">
                  <MapPin className="w-3 h-3" /> Salle
                </label>
                {salles.length === 0 ? (
                  <p className="text-xs text-[rgb(var(--error))]">Aucune salle</p>
                ) : (
                  <select
                    value={plage.idSalle}
                    onChange={e => handleChange(plage.id, 'idSalle', Number(e.target.value))}
                    disabled={disabled}
                    className="w-full px-2.5 py-1.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded text-[rgb(var(--foreground))] text-xs focus:border-[rgb(var(--accent))] focus:outline-none disabled:opacity-50"
                  >
                    {salles.map(s => (
                      <option key={s.idSalle} value={s.idSalle}>{s.nom}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs text-[rgb(var(--muted-foreground))] mb-1">
                  <Clock className="w-3 h-3" /> Durée / créneau
                </label>
                <select
                  value={plage.dureeCreneauMin}
                  onChange={e => handleChange(plage.id, 'dureeCreneauMin', Number(e.target.value))}
                  disabled={disabled}
                  className="w-full px-2.5 py-1.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded text-[rgb(var(--foreground))] text-xs focus:border-[rgb(var(--accent))] focus:outline-none disabled:opacity-50"
                >
                  {DUREES.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )
      })}

      {/* Bouton ajouter */}
      {plages.length < MAX_PLAGES && (
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || salles.length === 0}
          className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[rgba(var(--accent),0.4)] rounded-lg text-xs text-[rgb(var(--accent))] hover:bg-[rgba(var(--accent),0.05)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" />
          Ajouter une plage horaire
        </button>
      )}
    </div>
  )
}
