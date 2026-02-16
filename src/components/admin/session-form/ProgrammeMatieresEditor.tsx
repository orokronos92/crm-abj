'use client'

import { useState } from 'react'
import { Plus, Trash2, AlertCircle, MapPin, User } from 'lucide-react'
import type { Matiere } from './session-form.types'

interface ProgrammeMatieresEditorProps {
  matieres: Matiere[]
  onChange: (matieres: Matiere[]) => void
  sallesDisponibles: Array<{ id: number; nom: string; capacite: number }>
  formateursDisponibles: Array<{ id: number; nom: string; matieres: string[] }>
}

export function ProgrammeMatieresEditor({
  matieres,
  onChange,
  sallesDisponibles,
  formateursDisponibles
}: ProgrammeMatieresEditorProps) {
  const [nouvelleMatiereNom, setNouvelleMatiereNom] = useState('')
  const [nouvelleMatiere, setNouvelleMatiere] = useState<Partial<Matiere>>({
    heures: 0,
    heuresConsecutivesMax: 4,
    salleVoeux: [],
    formateurVoeux: []
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
      prerequis: nouvelleMatiere.prerequis || [],
      salleVoeux: nouvelleMatiere.salleVoeux || [],
      formateurVoeux: nouvelleMatiere.formateurVoeux || []
    }

    onChange([...matieres, newMatiere])

    // Reset
    setNouvelleMatiereNom('')
    setNouvelleMatiere({
      heures: 0,
      heuresConsecutivesMax: 4,
      salleVoeux: [],
      formateurVoeux: []
    })
  }

  const handleSupprimerMatiere = (index: number) => {
    onChange(matieres.filter((_, i) => i !== index))
  }

  const handleModifierMatiere = (index: number, field: keyof Matiere, value: any) => {
    const updated = [...matieres]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const toggleSalleVoeu = (index: number, salleId: number) => {
    const matiere = matieres[index]
    const salleVoeux = matiere.salleVoeux.includes(salleId)
      ? matiere.salleVoeux.filter(id => id !== salleId)
      : [...matiere.salleVoeux, salleId]
    handleModifierMatiere(index, 'salleVoeux', salleVoeux)
  }

  const toggleFormateurVoeu = (index: number, formateurId: number) => {
    const matiere = matieres[index]
    const formateurVoeux = matiere.formateurVoeux.includes(formateurId)
      ? matiere.formateurVoeux.filter(id => id !== formateurId)
      : [...matiere.formateurVoeux, formateurId]
    handleModifierMatiere(index, 'formateurVoeux', formateurVoeux)
  }

  const toggleNouvelleSalleVoeu = (salleId: number) => {
    const salleVoeux = (nouvelleMatiere.salleVoeux || []).includes(salleId)
      ? (nouvelleMatiere.salleVoeux || []).filter(id => id !== salleId)
      : [...(nouvelleMatiere.salleVoeux || []), salleId]
    setNouvelleMatiere({ ...nouvelleMatiere, salleVoeux })
  }

  const toggleNouveauFormateurVoeu = (formateurId: number) => {
    const formateurVoeux = (nouvelleMatiere.formateurVoeux || []).includes(formateurId)
      ? (nouvelleMatiere.formateurVoeux || []).filter(id => id !== formateurId)
      : [...(nouvelleMatiere.formateurVoeux || []), formateurId]
    setNouvelleMatiere({ ...nouvelleMatiere, formateurVoeux })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
            Programme de matières
          </h3>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
            Pour chaque matière, définissez les vœux de salle et formateur. Marjorie optimisera selon les disponibilités.
          </p>
        </div>
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
        <div className="space-y-3">
          {matieres.map((matiere, index) => (
            <div key={index} className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.3)]">
              <div className="space-y-3">
                {/* Ligne 1: Nom et Heures */}
                <div className="grid grid-cols-6 gap-3 items-center">
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">
                      Nom de la matière
                    </label>
                    <input
                      type="text"
                      value={matiere.nom}
                      onChange={(e) => handleModifierMatiere(index, 'nom', e.target.value)}
                      className="w-full px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                      placeholder="Ex: Sertissage griffe"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">
                      Heures totales
                    </label>
                    <input
                      type="number"
                      value={matiere.heures}
                      onChange={(e) => handleModifierMatiere(index, 'heures', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                      placeholder="150"
                      min="1"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">
                      Max/jour
                    </label>
                    <input
                      type="number"
                      value={matiere.heuresConsecutivesMax}
                      onChange={(e) => handleModifierMatiere(index, 'heuresConsecutivesMax', parseInt(e.target.value) || 4)}
                      className="w-full px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                      placeholder="4"
                      min="1"
                      max="8"
                    />
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

                {/* Ligne 2: Vœux Salle */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-[rgb(var(--foreground))] mb-2">
                    <MapPin className="w-3 h-3" />
                    Vœux de salle (plusieurs possibles)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sallesDisponibles.map(salle => (
                      <button
                        key={salle.id}
                        type="button"
                        onClick={() => toggleSalleVoeu(index, salle.id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                          matiere.salleVoeux.includes(salle.id)
                            ? 'bg-[rgba(var(--accent),0.15)] border-[rgb(var(--accent))] text-[rgb(var(--foreground))]'
                            : 'bg-[rgb(var(--card))] border-[rgba(var(--border),0.5)] text-[rgb(var(--muted-foreground))] hover:border-[rgb(var(--accent))]'
                        }`}
                      >
                        {salle.nom} ({salle.capacite}p)
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ligne 3: Vœux Formateur */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-[rgb(var(--foreground))] mb-2">
                    <User className="w-3 h-3" />
                    Vœux de formateur (plusieurs possibles)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formateursDisponibles.map(formateur => (
                      <button
                        key={formateur.id}
                        type="button"
                        onClick={() => toggleFormateurVoeu(index, formateur.id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                          matiere.formateurVoeux.includes(formateur.id)
                            ? 'bg-[rgba(var(--accent),0.15)] border-[rgb(var(--accent))] text-[rgb(var(--foreground))]'
                            : 'bg-[rgb(var(--card))] border-[rgba(var(--border),0.5)] text-[rgb(var(--muted-foreground))] hover:border-[rgb(var(--accent))]'
                        }`}
                      >
                        {formateur.nom}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire ajout nouvelle matière */}
      <div className="p-4 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-lg space-y-3">
        <h4 className="text-sm font-medium text-[rgb(var(--foreground))] flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Ajouter une matière
        </h4>

        {/* Ligne 1: Nom et Heures */}
        <div className="grid grid-cols-6 gap-3 items-end">
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
          <div className="col-span-1">
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
          <div className="col-span-1">
            <label className="block text-xs font-medium text-[rgb(var(--foreground))] mb-1">
              Max/jour
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
        </div>

        {/* Ligne 2: Vœux Salle */}
        <div>
          <label className="flex items-center gap-1 text-xs font-medium text-[rgb(var(--foreground))] mb-2">
            <MapPin className="w-3 h-3" />
            Vœux de salle
          </label>
          <div className="flex flex-wrap gap-2">
            {sallesDisponibles.map(salle => (
              <button
                key={salle.id}
                type="button"
                onClick={() => toggleNouvelleSalleVoeu(salle.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                  (nouvelleMatiere.salleVoeux || []).includes(salle.id)
                    ? 'bg-[rgba(var(--accent),0.15)] border-[rgb(var(--accent))] text-[rgb(var(--foreground))]'
                    : 'bg-[rgb(var(--card))] border-[rgba(var(--border),0.5)] text-[rgb(var(--muted-foreground))] hover:border-[rgb(var(--accent))]'
                }`}
              >
                {salle.nom} ({salle.capacite}p)
              </button>
            ))}
          </div>
        </div>

        {/* Ligne 3: Vœux Formateur */}
        <div>
          <label className="flex items-center gap-1 text-xs font-medium text-[rgb(var(--foreground))] mb-2">
            <User className="w-3 h-3" />
            Vœux de formateur
          </label>
          <div className="flex flex-wrap gap-2">
            {formateursDisponibles.map(formateur => (
              <button
                key={formateur.id}
                type="button"
                onClick={() => toggleNouveauFormateurVoeu(formateur.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                  (nouvelleMatiere.formateurVoeux || []).includes(formateur.id)
                    ? 'bg-[rgba(var(--accent),0.15)] border-[rgb(var(--accent))] text-[rgb(var(--foreground))]'
                    : 'bg-[rgb(var(--card))] border-[rgba(var(--border),0.5)] text-[rgb(var(--muted-foreground))] hover:border-[rgb(var(--accent))]'
                }`}
              >
                {formateur.nom}
              </button>
            ))}
          </div>
        </div>

        {/* Bouton Ajouter */}
        <button
          onClick={handleAjouterMatiere}
          disabled={!nouvelleMatiereNom.trim() || !nouvelleMatiere.heures}
          className="w-full px-4 py-2.5 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg hover:bg-[rgb(var(--accent-light))] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          Ajouter la matière
        </button>
      </div>
    </div>
  )
}
