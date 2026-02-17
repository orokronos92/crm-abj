'use client'

import { useState } from 'react'
import { Wrench, Plus, X, Star } from 'lucide-react'
import { useProfilFormateur } from '@/contexts/ProfilFormateurContext'

const CATEGORIES_COMPETENCES = [
  'Techniques traditionnelles',
  'Techniques modernes',
  'CAO/DAO',
  'Gemmologie',
  'Métaux précieux',
  'Finition',
  'Autre'
]

const NIVEAUX = [
  { value: 1, label: 'Débutant' },
  { value: 2, label: 'Intermédiaire' },
  { value: 3, label: 'Avancé' },
  { value: 4, label: 'Expert' },
  { value: 5, label: 'Maître' }
]

export function StepCompetences() {
  const { profil, updateProfil } = useProfilFormateur()
  const [modeAjout, setModeAjout] = useState(false)
  const [nouvelleCompetence, setNouvelleCompetence] = useState({
    nom: '',
    categorie: 'Techniques traditionnelles',
    niveau: 3,
    anneesExperience: ''
  })

  const ajouterCompetence = () => {
    if (nouvelleCompetence.nom) {
      const competence = {
        id: Date.now().toString(),
        ...nouvelleCompetence
      }
      updateProfil('competences', [...(profil.competences || []), competence])
      setNouvelleCompetence({
        nom: '',
        categorie: 'Techniques traditionnelles',
        niveau: 3,
        anneesExperience: ''
      })
      setModeAjout(false)
    }
  }

  const supprimerCompetence = (id: string) => {
    updateProfil('competences', profil.competences?.filter(c => c.id !== id) || [])
  }

  // Grouper les compétences par catégorie
  const competencesParCategorie = profil.competences?.reduce((acc, comp) => {
    const cat = comp.categorie || 'Autre'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(comp)
    return acc
  }, {} as Record<string, typeof profil.competences>) || {}

  return (
    <div className="space-y-6">
      {/* Description Qualiopi */}
      <div className="flex items-start gap-3 p-4 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.2)]">
        <Wrench className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[rgb(var(--foreground))] mb-1">
            Compétences techniques et savoir-faire
          </p>
          <p className="text-[rgb(var(--muted-foreground))]">
            Indicateur 22 : Détaillez vos compétences techniques en bijouterie-joaillerie.
            Précisez votre niveau d'expertise pour chaque technique maîtrisée.
          </p>
        </div>
      </div>

      {/* Compétences groupées par catégorie */}
      {Object.keys(competencesParCategorie).length > 0 && (
        <div className="space-y-6">
          {Object.entries(competencesParCategorie).map(([categorie, competences]) => (
            <div key={categorie}>
              <h3 className="font-medium text-[rgb(var(--foreground))] mb-3">{categorie}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {competences?.map((competence) => (
                  <div
                    key={competence.id}
                    className="p-3 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-[rgb(var(--foreground))]">
                          {competence.nom}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Number(competence.niveau)
                                    ? 'fill-[rgb(var(--accent))] text-[rgb(var(--accent))]'
                                    : 'text-[rgb(var(--muted-foreground))]'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-[rgb(var(--muted-foreground))]">
                            {NIVEAUX.find(n => n.value === Number(competence.niveau))?.label}
                          </span>
                        </div>
                        {competence.anneesExperience && (
                          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                            {competence.anneesExperience} ans d'expérience
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => supprimerCompetence(competence.id)}
                        className="p-1 hover:bg-[rgba(var(--error),0.1)] rounded transition-colors"
                        aria-label="Supprimer cette compétence"
                      >
                        <X className="w-4 h-4 text-[rgb(var(--error))]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout */}
      {modeAjout ? (
        <div className="p-4 bg-[rgba(var(--secondary),0.3)] border border-[rgba(var(--border),0.5)] rounded-lg space-y-4">
          <h4 className="font-medium text-[rgb(var(--foreground))]">
            Ajouter une compétence
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nom de la compétence *</label>
              <input
                type="text"
                value={nouvelleCompetence.nom}
                onChange={(e) => setNouvelleCompetence({...nouvelleCompetence, nom: e.target.value})}
                placeholder="Ex: Sertissage griffe"
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Catégorie *</label>
              <select
                value={nouvelleCompetence.categorie}
                onChange={(e) => setNouvelleCompetence({...nouvelleCompetence, categorie: e.target.value})}
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              >
                {CATEGORIES_COMPETENCES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Niveau de maîtrise *</label>
              <select
                value={nouvelleCompetence.niveau}
                onChange={(e) => setNouvelleCompetence({...nouvelleCompetence, niveau: parseInt(e.target.value)})}
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              >
                {NIVEAUX.map(niveau => (
                  <option key={niveau.value} value={niveau.value}>{niveau.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Années d'expérience</label>
              <input
                type="number"
                value={nouvelleCompetence.anneesExperience}
                onChange={(e) => setNouvelleCompetence({...nouvelleCompetence, anneesExperience: e.target.value})}
                placeholder="Ex: 10"
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              />
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
              onClick={ajouterCompetence}
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
          <span className="text-[rgb(var(--accent))]\">Ajouter une compétence</span>
        </button>
      )}
    </div>
  )
}