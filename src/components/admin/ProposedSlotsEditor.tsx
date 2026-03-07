'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Calendar, MapPin, Info, Users } from 'lucide-react'

/**
 * Format exporté vers l'API — chaque paire = 2 journées complètes (09h-17h)
 * L'API crée 2 ReservationSalle séparées + 2 Evenements (ENTRETIEN_PRESENTIEL + TEST_TECHNIQUE)
 */
export interface ProposedSlotPair {
  jour1: string    // YYYY-MM-DD — Jour entretien présentiel
  jour2: string    // YYYY-MM-DD — Jour test technique
  idSalle: number
  nomSalle: string
  capacite: number // Nombre de places disponibles pour ces 2 jours
}

interface Salle {
  idSalle: number
  nom: string
}

export interface ProposedSlotsEditorProps {
  slots: ProposedSlotPair[]
  salles: Salle[]
  onChange: (slots: ProposedSlotPair[]) => void
  disabled?: boolean
}

interface Paire {
  id: string
  jour1: string
  jour2: string
  idSalle: number
  nomSalle: string
  capacite: number
}

const MAX_PAIRES = 4

function buildEmptyPaire(salles: Salle[]): Paire {
  const j1 = new Date()
  j1.setDate(j1.getDate() + 1)
  const j2 = new Date(j1)
  j2.setDate(j2.getDate() + 1)
  return {
    id:       typeof window !== 'undefined' ? crypto.randomUUID() : String(Date.now()),
    jour1:    j1.toISOString().split('T')[0],
    jour2:    j2.toISOString().split('T')[0],
    idSalle:  salles[0]?.idSalle ?? 0,
    nomSalle: salles[0]?.nom ?? '',
    capacite: 8,
  }
}

export function ProposedSlotsEditor({ salles, onChange, disabled = false }: ProposedSlotsEditorProps) {
  const [paires, setPaires] = useState<Paire[]>([])

  useEffect(() => {
    onChange(paires.map(p => ({
      jour1:    p.jour1,
      jour2:    p.jour2,
      idSalle:  p.idSalle,
      nomSalle: p.nomSalle,
      capacite: p.capacite,
    })))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paires])

  const handleAdd = () => {
    if (paires.length >= MAX_PAIRES) return
    setPaires(prev => [...prev, buildEmptyPaire(salles)])
  }

  const handleRemove = (id: string) => {
    setPaires(prev => prev.filter(p => p.id !== id))
  }

  const handleChange = (id: string, field: keyof Omit<Paire, 'id'>, value: string | number) => {
    setPaires(prev => prev.map(p => {
      if (p.id !== id) return p
      if (field === 'idSalle') {
        const salle = salles.find(s => s.idSalle === Number(value))
        return { ...p, idSalle: Number(value), nomSalle: salle?.nom ?? '' }
      }
      return { ...p, [field]: value }
    }))
  }

  return (
    <div className="space-y-3">
      {/* En-tête */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-[rgb(var(--accent))]" />
        <span className="text-sm font-medium text-[rgb(var(--foreground))]">
          Périodes d'entretien proposées
        </span>
        {paires.length > 0 && (
          <span className="ml-auto text-xs font-semibold text-[rgb(var(--accent))] bg-[rgba(var(--accent),0.1)] px-2 py-0.5 rounded-full">
            {paires.length} période{paires.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 p-2.5 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.15)] rounded-lg">
        <Info className="w-3.5 h-3.5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed">
          Chaque période = <strong>2 jours complets</strong> (09h–17h) : Jour 1 entretien présentiel, Jour 2 test technique.
          Les jours peuvent être consécutifs ou séparés. Le candidat s'inscrit sur les 2 jours à la fois.
        </p>
      </div>

      {/* Liste des paires */}
      {paires.length === 0 && (
        <p className="text-xs text-[rgb(var(--muted-foreground))] text-center py-3">
          Aucune période — ajoutez-en au moins une
        </p>
      )}

      {paires.map((paire, idx) => (
        <div
          key={paire.id}
          className="p-3 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.4)] rounded-lg space-y-2"
        >
          {/* Header paire */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[rgb(var(--accent))]">
              Période {idx + 1}
            </span>
            <button
              type="button"
              onClick={() => handleRemove(paire.id)}
              disabled={disabled}
              className="p-1 hover:bg-[rgba(var(--error),0.1)] rounded text-[rgb(var(--error))] transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Jour 1 */}
          <div>
            <label className="flex items-center gap-1 text-xs text-[rgb(var(--muted-foreground))] mb-1">
              <Calendar className="w-3 h-3" />
              Jour 1 — Entretien présentiel
            </label>
            <input
              type="date"
              value={paire.jour1}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => handleChange(paire.id, 'jour1', e.target.value)}
              disabled={disabled}
              className="w-full px-2.5 py-1.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded text-[rgb(var(--foreground))] text-xs focus:border-[rgb(var(--accent))] focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* Jour 2 */}
          <div>
            <label className="flex items-center gap-1 text-xs text-[rgb(var(--muted-foreground))] mb-1">
              <Calendar className="w-3 h-3" />
              Jour 2 — Test technique
            </label>
            <input
              type="date"
              value={paire.jour2}
              min={paire.jour1 || new Date().toISOString().split('T')[0]}
              onChange={e => handleChange(paire.id, 'jour2', e.target.value)}
              disabled={disabled}
              className="w-full px-2.5 py-1.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded text-[rgb(var(--foreground))] text-xs focus:border-[rgb(var(--accent))] focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* Salle + Capacité */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="flex items-center gap-1 text-xs text-[rgb(var(--muted-foreground))] mb-1">
                <MapPin className="w-3 h-3" /> Salle
              </label>
              {salles.length === 0 ? (
                <p className="text-xs text-[rgb(var(--error))]">Aucune salle</p>
              ) : (
                <select
                  value={paire.idSalle}
                  onChange={e => handleChange(paire.id, 'idSalle', Number(e.target.value))}
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
                <Users className="w-3 h-3" /> Places
              </label>
              <input
                type="number"
                value={paire.capacite}
                min={1}
                max={50}
                onChange={e => handleChange(paire.id, 'capacite', parseInt(e.target.value) || 1)}
                disabled={disabled}
                className="w-full px-2.5 py-1.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded text-[rgb(var(--foreground))] text-xs focus:border-[rgb(var(--accent))] focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Bouton ajouter */}
      {paires.length < MAX_PAIRES && (
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || salles.length === 0}
          className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[rgba(var(--accent),0.4)] rounded-lg text-xs text-[rgb(var(--accent))] hover:bg-[rgba(var(--accent),0.05)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" />
          Ajouter une période
        </button>
      )}
    </div>
  )
}
