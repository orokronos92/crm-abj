'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, AlertCircle, MapPin, User } from 'lucide-react'
import type { Matiere } from './session-form.types'

interface MatiereCatalogue {
  idMatiere: number
  nom: string
  code: string | null
  categorie: string | null
  actif: boolean
}

interface ProgrammeMatieresEditorProps {
  matieres: Matiere[]
  onChange: (matieres: Matiere[]) => void
  sallesDisponibles: Array<{ id: number; nom: string; capacite: number }>
  formateursDisponibles: Array<{ id: number; nom: string; matieres: string[] }>
  dureeHeuresCible?: number
}

export function ProgrammeMatieresEditor({
  matieres,
  onChange,
  sallesDisponibles,
  formateursDisponibles,
  dureeHeuresCible = 800
}: ProgrammeMatieresEditorProps) {
  const [catalogue, setCatalogue] = useState<MatiereCatalogue[]>([])
  const [nouvelleMatiereNom, setNouvelleMatiereNom] = useState('')
  const [saisieLibre, setSaisieLibre] = useState(false)
  const [nouvelleMatiere, setNouvelleMatiere] = useState<Partial<Matiere>>({
    heures: 0,
    heuresConsecutivesMax: 4,
    salleVoeux: [],
    formateurVoeux: []
  })

  const totalHeures = matieres.reduce((sum, m) => sum + m.heures, 0)
  const borneMin = Math.round(dureeHeuresCible * 0.9)
  const borneMax = Math.round(dureeHeuresCible * 1.1)
  const isProcheDeCible = totalHeures >= borneMin && totalHeures <= borneMax

  useEffect(() => {
    fetch('/api/matieres?actif=true')
      .then(res => res.ok ? res.json() : { matieres: [] })
      .then(data => setCatalogue(data.matieres || []))
      .catch(() => setCatalogue([]))
  }, [])

  // Grouper par catégorie pour le <select> groupé
  const matieresPratiques = catalogue.filter(m => m.categorie === 'PRATIQUE')
  const matieresTheoriques = catalogue.filter(m => m.categorie === 'THEORIQUE')
  const matieresAutres = catalogue.filter(m => !m.categorie || (m.categorie !== 'PRATIQUE' && m.categorie !== 'THEORIQUE'))

  const handleSelectionMatiere = (valeur: string) => {
    if (valeur === '__libre__') {
      setSaisieLibre(true)
      setNouvelleMatiereNom('')
    } else {
      setSaisieLibre(false)
      setNouvelleMatiereNom(valeur)
    }
  }

  const handleAjouterMatiere = () => {
    const nom = nouvelleMatiereNom.trim()
    if (!nom || !nouvelleMatiere.heures || nouvelleMatiere.heures <= 0) return

    const newMatiere: Matiere = {
      nom,
      heures: nouvelleMatiere.heures,
      heuresConsecutivesMax: nouvelleMatiere.heuresConsecutivesMax || 4,
      ordre: nouvelleMatiere.ordre,
      prerequis: nouvelleMatiere.prerequis || [],
      salleVoeux: nouvelleMatiere.salleVoeux || [],
      formateurVoeux: nouvelleMatiere.formateurVoeux || []
    }

    onChange([...matieres, newMatiere])

    // Reset formulaire
    setNouvelleMatiereNom('')
    setSaisieLibre(false)
    setNouvelleMatiere({ heures: 0, heuresConsecutivesMax: 4, salleVoeux: [], formateurVoeux: [] })
  }

  const handleSupprimerMatiere = (index: number) => {
    onChange(matieres.filter((_, i) => i !== index))
  }

  const handleModifierMatiere = (index: number, field: keyof Matiere, value: unknown) => {
    const updated = [...matieres]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const toggleSalleVoeu = (index: number, salleId: number) => {
    const salleVoeux = matieres[index].salleVoeux.includes(salleId)
      ? matieres[index].salleVoeux.filter(id => id !== salleId)
      : [...matieres[index].salleVoeux, salleId]
    handleModifierMatiere(index, 'salleVoeux', salleVoeux)
  }

  const toggleFormateurVoeu = (index: number, formateurId: number) => {
    const formateurVoeux = matieres[index].formateurVoeux.includes(formateurId)
      ? matieres[index].formateurVoeux.filter(id => id !== formateurId)
      : [...matieres[index].formateurVoeux, formateurId]
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

  const inputClass = 'w-full px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none'

  return (
    <div className="space-y-4">
      {/* En-tête avec compteur */}
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
          <span className={`font-bold ${isProcheDeCible ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--warning))]'}`}>
            {totalHeures}h
          </span>
          <span className="text-[rgb(var(--muted-foreground))]"> / ~{dureeHeuresCible}h</span>
        </div>
      </div>

      {!isProcheDeCible && totalHeures > 0 && (
        <div className="flex items-start gap-2 p-3 bg-[rgba(var(--warning),0.1)] border border-[rgba(var(--warning),0.3)] rounded-lg">
          <AlertCircle className="w-4 h-4 text-[rgb(var(--warning))] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[rgb(var(--muted-foreground))]">
            Le total des heures devrait être proche de {dureeHeuresCible}h (marge ±10% acceptée : {borneMin}-{borneMax}h)
          </p>
        </div>
      )}

      {/* Liste des matières ajoutées */}
      {matieres.length > 0 && (
        <div className="space-y-3">
          {matieres.map((matiere, index) => (
            <div key={index} className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.3)]">
              <div className="space-y-3">
                {/* Nom + Heures + Max/jour + Supprimer */}
                <div className="grid grid-cols-6 gap-3 items-center">
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">
                      Matière
                    </label>
                    <input
                      type="text"
                      value={matiere.nom}
                      onChange={(e) => handleModifierMatiere(index, 'nom', e.target.value)}
                      className={inputClass}
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
                      className={inputClass}
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
                      className={inputClass}
                      placeholder="4"
                      min="1"
                      max="8"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSupprimerMatiere(index)}
                      className="p-2 hover:bg-[rgba(var(--error),0.1)] rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-[rgb(var(--error))]" />
                    </button>
                  </div>
                </div>

                {/* Vœux Salle */}
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

                {/* Vœux Formateur */}
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

        {/* Sélection depuis le catalogue */}
        <div className="grid grid-cols-6 gap-3 items-end">
          <div className="col-span-3">
            <label className="block text-xs font-medium text-[rgb(var(--foreground))] mb-1">
              Matière du catalogue
            </label>
            {!saisieLibre ? (
              <select
                value={nouvelleMatiereNom}
                onChange={(e) => handleSelectionMatiere(e.target.value)}
                className={inputClass}
              >
                <option value="">-- Choisir une matière --</option>
                {matieresPratiques.length > 0 && (
                  <optgroup label="Pratique">
                    {matieresPratiques.map(m => (
                      <option key={m.idMatiere} value={m.nom}>{m.nom}</option>
                    ))}
                  </optgroup>
                )}
                {matieresTheoriques.length > 0 && (
                  <optgroup label="Théorique">
                    {matieresTheoriques.map(m => (
                      <option key={m.idMatiere} value={m.nom}>{m.nom}</option>
                    ))}
                  </optgroup>
                )}
                {matieresAutres.length > 0 && (
                  <optgroup label="Autre">
                    {matieresAutres.map(m => (
                      <option key={m.idMatiere} value={m.nom}>{m.nom}</option>
                    ))}
                  </optgroup>
                )}
                <option value="__libre__">✏️ Autre (saisie libre)…</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nouvelleMatiereNom}
                  onChange={(e) => setNouvelleMatiereNom(e.target.value)}
                  className={inputClass}
                  placeholder="Nom de la matière"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => { setSaisieLibre(false); setNouvelleMatiereNom('') }}
                  className="px-3 py-2 text-xs text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] border border-[rgba(var(--border),0.5)] rounded-lg whitespace-nowrap"
                  title="Revenir au catalogue"
                >
                  ← Catalogue
                </button>
              </div>
            )}
          </div>

          <div className="col-span-1">
            <label className="block text-xs font-medium text-[rgb(var(--foreground))] mb-1">
              Heures totales
            </label>
            <input
              type="number"
              value={nouvelleMatiere.heures || ''}
              onChange={(e) => setNouvelleMatiere({ ...nouvelleMatiere, heures: parseInt(e.target.value) || 0 })}
              className={inputClass}
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
              className={inputClass}
              placeholder="4"
              min="1"
              max="8"
            />
          </div>
        </div>

        {/* Vœux Salle pour nouvelle matière */}
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

        {/* Vœux Formateur pour nouvelle matière */}
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

        <button
          type="button"
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
