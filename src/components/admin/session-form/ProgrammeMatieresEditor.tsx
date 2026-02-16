'use client'

import { useState } from 'react'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import type { Matiere } from './session-form.types'

interface ProgrammeMatieresEditorProps {
  matieres: Matiere[]
  onChange: (matieres: Matiere[]) => void
}

export function ProgrammeMatieresEditor({ matieres, onChange }: ProgrammeMatieresEditorProps) {
  const [nouvelleMatiereNom, setNouvelleMatiereNom] = useState('')
  const [nouvelleMatiere, setNouvelleMatiere] = useState<Partial<Matiere>>({
    heures: 0,
    heuresConsecutivesMax: 4
  })

  const totalHeures = matieres.reduce((sum, m) => sum + m.heures, 0)
  const isProcheDe800 = totalHeures >= 720 && totalHeures <= 880 // ±10% de 800h

  const handleAjouterMatiere = () => {
    if (!nouvelleMatiereNom.trim() || !nouvelleMatiere.heures || nouvelleMatiere.heures <= 0) {
      return
    }

    const newMatiere: Matiere = {
      nom: nouvelleMatiereNom.trim(),
      heures: nouvelleMatiere.heures,
      heuresConsecutivesMax: nouvelleMatiere.heuresConsecutivesMax || 4,
      ordre: nouvelleMatiere.ordre,
      prerequis: nouvelleMatiere.prerequis || []
    }

    onChange([...matieres, newMatiere])

    // Reset
    setNouvelleMatiereNom('')
    setNouvelleMatiere({ heures: 0, heuresConsecutivesMax: 4 })
  }

  const handleSupprimerMatiere = (index: number) => {
    onChange(matieres.filter((_, i) => i !== index))
  }

  const handleModifierMatiere = (index: number, field: keyof Matiere, value: any) => {
    const updated = [...matieres]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
          Programme de matières
        </h3>
        <div className="text-sm">
          <span className="text-[rgb(var(--muted-foreground))]">Total : </span>
          <span className={`font-bold ${isProcheDe800 ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--warning))]'}`}>
            {totalHeures}h
          </span>
          <span className="text-[rgb(var(--muted-foreground))]"> / ~800h</span>
        </div>
      </div>

      {!isProcheDe800 && totalHeures > 0 && (
        <div className="flex items-start gap-2 p-3 bg-[rgba(var(--warning),0.1)] border border-[rgba(var(--warning),0.3)] rounded-lg">
          <AlertCircle className="w-4 h-4 text-[rgb(var(--warning))] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[rgb(var(--muted-foreground))]">
            Le total des heures devrait être proche de 800h (marge ±10% acceptée : 720-880h)
          </p>
        </div>
      )}

      {/* Liste des matières existantes */}
      {matieres.length > 0 && (
        <div className="space-y-2">
          {matieres.map((matiere, index) => (
            <div key={index} className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.3)]">
              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-3">
                  <input
                    type="text"
                    value={matiere.nom}
                    onChange={(e) => handleModifierMatiere(index, 'nom', e.target.value)}
                    className="w-full px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                    placeholder="Nom de la matière"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={matiere.heures}
                    onChange={(e) => handleModifierMatiere(index, 'heures', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                    placeholder="Heures"
                    min="1"
                  />
                  <span className="text-xs text-[rgb(var(--muted-foreground))] ml-1">heures</span>
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={matiere.heuresConsecutivesMax}
                    onChange={(e) => handleModifierMatiere(index, 'heuresConsecutivesMax', parseInt(e.target.value) || 4)}
                    className="w-full px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                    placeholder="Max/jour"
                    min="1"
                    max="8"
                  />
                  <span className="text-xs text-[rgb(var(--muted-foreground))] ml-1">h max/jour</span>
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={matiere.ordre || ''}
                    onChange={(e) => handleModifierMatiere(index, 'ordre', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                    placeholder="Ordre"
                    min="1"
                  />
                  <span className="text-xs text-[rgb(var(--muted-foreground))] ml-1">ordre</span>
                </div>
                <div className="col-span-2">
                  <select
                    multiple
                    value={matiere.prerequis || []}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value)
                      handleModifierMatiere(index, 'prerequis', selected)
                    }}
                    className="w-full px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                    size={2}
                  >
                    {matieres
                      .filter((_, i) => i !== index)
                      .map((m, i) => (
                        <option key={i} value={m.nom}>
                          {m.nom}
                        </option>
                      ))}
                  </select>
                  <span className="text-xs text-[rgb(var(--muted-foreground))] ml-1">prérequis</span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => handleSupprimerMatiere(index)}
                    className="p-2 hover:bg-[rgba(var(--error),0.1)] rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-[rgb(var(--error))]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire ajout nouvelle matière */}
      <div className="p-4 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-lg">
        <div className="grid grid-cols-12 gap-3 items-end">
          <div className="col-span-3">
            <label className="block text-xs font-medium text-[rgb(var(--foreground))] mb-1">
              Nom de la matière
            </label>
            <input
              type="text"
              value={nouvelleMatiereNom}
              onChange={(e) => setNouvelleMatiereNom(e.target.value)}
              className="w-full px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
              placeholder="Ex: Sertissage griffe"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-[rgb(var(--foreground))] mb-1">
              Heures totales
            </label>
            <input
              type="number"
              value={nouvelleMatiere.heures || ''}
              onChange={(e) => setNouvelleMatiere({ ...nouvelleMatiere, heures: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
              placeholder="150"
              min="1"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-[rgb(var(--foreground))] mb-1">
              Max consécutives
            </label>
            <input
              type="number"
              value={nouvelleMatiere.heuresConsecutivesMax || 4}
              onChange={(e) => setNouvelleMatiere({ ...nouvelleMatiere, heuresConsecutivesMax: parseInt(e.target.value) || 4 })}
              className="w-full px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
              placeholder="4"
              min="1"
              max="8"
            />
          </div>
          <div className="col-span-4">
            <button
              onClick={handleAjouterMatiere}
              disabled={!nouvelleMatiereNom.trim() || !nouvelleMatiere.heures}
              className="w-full px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg hover:bg-[rgb(var(--accent-light))] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Ajouter la matière
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
