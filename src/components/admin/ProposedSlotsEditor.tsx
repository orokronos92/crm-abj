'use client'

import { useState } from 'react'
import { Plus, Trash2, Calendar, Clock, MapPin, Info } from 'lucide-react'

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

interface ProposedSlotsEditorProps {
  slots: ProposedSlot[]
  salles: Salle[]
  onChange: (slots: ProposedSlot[]) => void
  disabled?: boolean
}

const HEURE_DEBUT_DEFAULT = '09:00'
const HEURE_FIN_DEFAULT   = '10:30'
const MAX_SLOTS = 6

function buildEmptySlot(salles: Salle[]): ProposedSlot {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return {
    date: tomorrow.toISOString().split('T')[0],
    heureDebut: HEURE_DEBUT_DEFAULT,
    heureFin:   HEURE_FIN_DEFAULT,
    idSalle:    salles[0]?.idSalle ?? 0,
    nomSalle:   salles[0]?.nom ?? '',
  }
}

export function ProposedSlotsEditor({ slots, salles, onChange, disabled = false }: ProposedSlotsEditorProps) {
  const handleAdd = () => {
    if (slots.length >= MAX_SLOTS) return
    onChange([...slots, buildEmptySlot(salles)])
  }

  const handleRemove = (idx: number) => {
    onChange(slots.filter((_, i) => i !== idx))
  }

  const handleChange = (idx: number, field: keyof ProposedSlot, value: string | number) => {
    const updated = slots.map((slot, i) => {
      if (i !== idx) return slot
      if (field === 'idSalle') {
        const salle = salles.find(s => s.idSalle === Number(value))
        return { ...slot, idSalle: Number(value), nomSalle: salle?.nom ?? '' }
      }
      return { ...slot, [field]: value }
    })
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      {/* En-tête */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-[rgb(var(--accent))]" />
        <span className="text-sm font-medium text-[rgb(var(--foreground))]">
          Créneaux proposés au candidat
        </span>
        <span className="text-xs text-[rgb(var(--muted-foreground))] ml-auto">
          {slots.length}/{MAX_SLOTS}
        </span>
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 p-2.5 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.15)] rounded-lg">
        <Info className="w-3.5 h-3.5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed">
          Proposez 3 à 6 créneaux. n8n va bloquer les salles et envoyer un lien au candidat
          pour qu'il confirme son RDV. La salle sera libérée automatiquement après 72h sans réponse.
        </p>
      </div>

      {/* Liste des créneaux */}
      {slots.length === 0 && (
        <p className="text-xs text-[rgb(var(--muted-foreground))] text-center py-3">
          Aucun créneau — ajoutez-en au moins 3
        </p>
      )}

      {slots.map((slot, idx) => (
        <div
          key={idx}
          className="p-3 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.4)] rounded-lg space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[rgb(var(--accent))]">
              Créneau {idx + 1}
            </span>
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              disabled={disabled}
              className="p-1 hover:bg-[rgba(var(--error),0.1)] rounded text-[rgb(var(--error))] transition-colors disabled:opacity-50"
              title="Supprimer ce créneau"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Date */}
          <div>
            <label className="flex items-center gap-1 text-xs text-[rgb(var(--muted-foreground))] mb-1">
              <Calendar className="w-3 h-3" />
              Date
            </label>
            <input
              type="date"
              value={slot.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => handleChange(idx, 'date', e.target.value)}
              disabled={disabled}
              className="w-full px-2.5 py-1.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded text-[rgb(var(--foreground))] text-xs focus:border-[rgb(var(--accent))] focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* Horaires */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="flex items-center gap-1 text-xs text-[rgb(var(--muted-foreground))] mb-1">
                <Clock className="w-3 h-3" />
                Début
              </label>
              <input
                type="time"
                value={slot.heureDebut}
                onChange={e => handleChange(idx, 'heureDebut', e.target.value)}
                disabled={disabled}
                className="w-full px-2.5 py-1.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded text-[rgb(var(--foreground))] text-xs focus:border-[rgb(var(--accent))] focus:outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs text-[rgb(var(--muted-foreground))] mb-1">
                <Clock className="w-3 h-3" />
                Fin
              </label>
              <input
                type="time"
                value={slot.heureFin}
                onChange={e => handleChange(idx, 'heureFin', e.target.value)}
                disabled={disabled}
                className="w-full px-2.5 py-1.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded text-[rgb(var(--foreground))] text-xs focus:border-[rgb(var(--accent))] focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Salle */}
          <div>
            <label className="flex items-center gap-1 text-xs text-[rgb(var(--muted-foreground))] mb-1">
              <MapPin className="w-3 h-3" />
              Salle
            </label>
            {salles.length === 0 ? (
              <p className="text-xs text-[rgb(var(--error))]">Aucune salle disponible</p>
            ) : (
              <select
                value={slot.idSalle}
                onChange={e => handleChange(idx, 'idSalle', Number(e.target.value))}
                disabled={disabled}
                className="w-full px-2.5 py-1.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded text-[rgb(var(--foreground))] text-xs focus:border-[rgb(var(--accent))] focus:outline-none disabled:opacity-50"
              >
                {salles.map(s => (
                  <option key={s.idSalle} value={s.idSalle}>
                    {s.nom}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      ))}

      {/* Bouton ajouter */}
      {slots.length < MAX_SLOTS && (
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || salles.length === 0}
          className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[rgba(var(--accent),0.4)] rounded-lg text-xs text-[rgb(var(--accent))] hover:bg-[rgba(var(--accent),0.05)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" />
          Ajouter un créneau
        </button>
      )}
    </div>
  )
}
