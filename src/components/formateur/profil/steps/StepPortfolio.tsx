'use client'

import { useState } from 'react'
import { Briefcase, Plus, X, Image, Link, Calendar } from 'lucide-react'
import { useProfilFormateur } from '@/contexts/ProfilFormateurContext'

export function StepPortfolio() {
  const { profil, updateProfil } = useProfilFormateur()
  const [modeAjout, setModeAjout] = useState(false)
  const [nouvelleRealisation, setNouvelleRealisation] = useState({
    titre: '',
    description: '',
    date: '',
    lienImage: '',
    lienVideo: '',
    techniques: ''
  })

  const ajouterRealisation = () => {
    if (nouvelleRealisation.titre && nouvelleRealisation.description) {
      const realisation = {
        id: Date.now().toString(),
        ...nouvelleRealisation
      }
      updateProfil('portfolio', [...(profil.portfolio || []), realisation])
      setNouvelleRealisation({
        titre: '',
        description: '',
        date: '',
        lienImage: '',
        lienVideo: '',
        techniques: ''
      })
      setModeAjout(false)
    }
  }

  const supprimerRealisation = (id: string) => {
    updateProfil('portfolio', profil.portfolio?.filter(r => r.id !== id) || [])
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="flex items-start gap-3 p-4 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.2)]">
        <Briefcase className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[rgb(var(--foreground))] mb-1">
            Portfolio de réalisations
          </p>
          <p className="text-[rgb(var(--muted-foreground))]">
            Présentez vos créations, réalisations d'élèves remarquables, projets pédagogiques innovants.
            Ces éléments valorisent votre expertise et votre approche pédagogique.
          </p>
        </div>
      </div>

      {/* Grille de réalisations */}
      {profil.portfolio && profil.portfolio.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profil.portfolio.map((realisation) => (
            <div
              key={realisation.id}
              className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg overflow-hidden"
            >
              {realisation.lienImage && (
                <div className="aspect-video bg-[rgba(var(--secondary),0.5)] flex items-center justify-center">
                  <Image className="w-12 h-12 text-[rgb(var(--muted-foreground))]" />
                </div>
              )}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-[rgb(var(--foreground))]">
                    {realisation.titre}
                  </h4>
                  <button
                    onClick={() => supprimerRealisation(realisation.id)}
                    className="p-1 hover:bg-[rgba(var(--error),0.1)] rounded transition-colors"
                    aria-label="Supprimer cette réalisation"
                  >
                    <X className="w-4 h-4 text-[rgb(var(--error))]" />
                  </button>
                </div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  {realisation.description}
                </p>
                {realisation.techniques && (
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">
                    Techniques : {realisation.techniques}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-[rgb(var(--muted-foreground))]">
                  {realisation.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {realisation.date}
                    </span>
                  )}
                  {realisation.lienVideo && (
                    <span className="flex items-center gap-1">
                      <Link className="w-3 h-3" />
                      Vidéo disponible
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout */}
      {modeAjout ? (
        <div className="p-4 bg-[rgba(var(--secondary),0.3)] border border-[rgba(var(--border),0.5)] rounded-lg space-y-4">
          <h4 className="font-medium text-[rgb(var(--foreground))]">
            Ajouter une réalisation
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Titre *</label>
              <input
                type="text"
                value={nouvelleRealisation.titre}
                onChange={(e) => setNouvelleRealisation({...nouvelleRealisation, titre: e.target.value})}
                placeholder="Ex: Bague Art Déco"
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={nouvelleRealisation.date}
                onChange={(e) => setNouvelleRealisation({...nouvelleRealisation, date: e.target.value})}
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              value={nouvelleRealisation.description}
              onChange={(e) => setNouvelleRealisation({...nouvelleRealisation, description: e.target.value})}
              placeholder="Décrivez la réalisation, le contexte pédagogique, les défis techniques..."
              rows={3}
              className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Techniques utilisées</label>
            <input
              type="text"
              value={nouvelleRealisation.techniques}
              onChange={(e) => setNouvelleRealisation({...nouvelleRealisation, techniques: e.target.value})}
              placeholder="Ex: Sertissage griffe, gravure main, fonte à cire perdue..."
              className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Lien image</label>
              <input
                type="url"
                value={nouvelleRealisation.lienImage}
                onChange={(e) => setNouvelleRealisation({...nouvelleRealisation, lienImage: e.target.value})}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Lien vidéo</label>
              <input
                type="url"
                value={nouvelleRealisation.lienVideo}
                onChange={(e) => setNouvelleRealisation({...nouvelleRealisation, lienVideo: e.target.value})}
                placeholder="https://..."
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
              onClick={ajouterRealisation}
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
          <span className="text-[rgb(var(--accent))]\">Ajouter une réalisation</span>
        </button>
      )}
    </div>
  )
}