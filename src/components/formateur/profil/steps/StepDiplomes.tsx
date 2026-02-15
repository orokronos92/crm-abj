'use client'

import { useState } from 'react'
import { GraduationCap, Plus, X, FileText } from 'lucide-react'
import { useProfilFormateur } from '@/contexts/ProfilFormateurContext'

const NIVEAUX_DIPLOME = [
  'CAP', 'BMA', 'DMA', 'BTS', 'Licence', 'Master', 'Doctorat', 'Autre'
]

export function StepDiplomes() {
  const { profil, updateProfil } = useProfilFormateur()
  const [modeAjout, setModeAjout] = useState(false)
  const [nouveauDiplome, setNouveauDiplome] = useState({
    titre: '',
    niveau: 'CAP',
    specialite: '',
    etablissement: '',
    dateObtention: ''
  })

  const ajouterDiplome = () => {
    if (nouveauDiplome.titre && nouveauDiplome.etablissement && nouveauDiplome.dateObtention) {
      const diplome = {
        id: Date.now().toString(),
        ...nouveauDiplome
      }
      updateProfil('diplomes', [...profil.diplomes, diplome])
      setNouveauDiplome({
        titre: '',
        niveau: 'CAP',
        specialite: '',
        etablissement: '',
        dateObtention: ''
      })
      setModeAjout(false)
    }
  }

  const supprimerDiplome = (id: string) => {
    updateProfil('diplomes', profil.diplomes.filter(d => d.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="flex items-start gap-3 p-4 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.2)]">
        <GraduationCap className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[rgb(var(--foreground))] mb-1">
            Diplômes et qualifications professionnelles
          </p>
          <p className="text-[rgb(var(--muted-foreground))]">
            Indicateur 22 : Les formateurs doivent justifier de leurs qualifications professionnelles.
            Ajoutez vos diplômes dans le domaine de la bijouterie-joaillerie.
          </p>
        </div>
      </div>

      {/* Liste des diplômes */}
      {profil.diplomes.length > 0 && (
        <div className="space-y-3">
          {profil.diplomes.map((diplome) => (
            <div
              key={diplome.id}
              className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[rgb(var(--accent))]" />
                    <h4 className="font-medium text-[rgb(var(--foreground))]">
                      {diplome.titre}
                    </h4>
                    <span className="px-2 py-1 bg-[rgba(var(--accent),0.1)] text-xs rounded">
                      {diplome.niveau || 'Autre'}
                    </span>
                  </div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    {diplome.etablissement} • {diplome.dateObtention}
                  </p>
                  {diplome.specialite && (
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">
                      Spécialité : {diplome.specialite}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => supprimerDiplome(diplome.id)}
                  className="p-2 hover:bg-[rgba(var(--error),0.1)] rounded-lg transition-colors"
                  aria-label="Supprimer ce diplôme"
                >
                  <X className="w-4 h-4 text-[rgb(var(--error))]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout */}
      {modeAjout ? (
        <div className="p-4 bg-[rgba(var(--secondary),0.3)] border border-[rgba(var(--border),0.5)] rounded-lg space-y-4">
          <h4 className="font-medium text-[rgb(var(--foreground))]">
            Ajouter un diplôme
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Titre du diplôme *</label>
              <input
                type="text"
                value={nouveauDiplome.titre}
                onChange={(e) => setNouveauDiplome({...nouveauDiplome, titre: e.target.value})}
                placeholder="Ex: CAP Art et technique de la bijouterie"
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Niveau *</label>
              <select
                value={nouveauDiplome.niveau}
                onChange={(e) => setNouveauDiplome({...nouveauDiplome, niveau: e.target.value})}
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              >
                {NIVEAUX_DIPLOME.map(niveau => (
                  <option key={niveau} value={niveau}>{niveau}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setModeAjout(false)}
              className="px-4 py-2 bg-[rgb(var(--secondary))] rounded-lg"
            >
              Annuler
            </button>
            <button
              onClick={ajouterDiplome}
              className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg"
            >
              Ajouter
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setModeAjout(true)}
          className="w-full p-4 border-2 border-dashed border-[rgba(var(--accent),0.3)] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5 text-[rgb(var(--accent))]" />
          <span className="text-[rgb(var(--accent))]">Ajouter un diplôme</span>
        </button>
      )}
    </div>
  )
}