'use client'

import { Eye, CheckCircle, Plus, X, Calendar, Link2 } from 'lucide-react'
import { useState } from 'react'
import { useProfilFormateur } from '@/contexts/ProfilFormateurContext'

const TYPES_VEILLE = [
  'Salons professionnels',
  'Revues spécialisées',
  'Formations en ligne',
  'Webinaires',
  'Groupes professionnels',
  'Réseaux sociaux professionnels',
  'Podcasts métier',
  'Newsletters spécialisées',
  'Conférences',
  'Ateliers et masterclass'
]

export function StepVeilleProfessionnelle() {
  const { profil, updateProfil } = useProfilFormateur()
  const [modeAjout, setModeAjout] = useState(false)
  const [nouvelleActivite, setNouvelleActivite] = useState({
    type: '',
    titre: '',
    date: '',
    description: '',
    lien: ''
  })

  const toggleTypeVeille = (type: string) => {
    const types = profil.typesVeille || []
    if (types.includes(type)) {
      updateProfil('typesVeille', types.filter(t => t !== type))
    } else {
      updateProfil('typesVeille', [...types, type])
    }
  }

  const ajouterActivite = () => {
    if (nouvelleActivite.type && nouvelleActivite.titre && nouvelleActivite.date) {
      const activite = {
        id: Date.now().toString(),
        ...nouvelleActivite
      }
      updateProfil('activitesVeille', [...(profil.activitesVeille || []), activite])
      setNouvelleActivite({
        type: '',
        titre: '',
        date: '',
        description: '',
        lien: ''
      })
      setModeAjout(false)
    }
  }

  const supprimerActivite = (id: string) => {
    updateProfil('activitesVeille', profil.activitesVeille?.filter(a => a.id !== id) || [])
  }

  return (
    <div className="space-y-6">
      {/* Description Qualiopi */}
      <div className="flex items-start gap-3 p-4 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.2)]">
        <Eye className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[rgb(var(--foreground))] mb-1">
            Veille professionnelle et sectorielle
          </p>
          <p className="text-[rgb(var(--muted-foreground))]">
            Indicateur 9 : Le prestataire réalise une veille légale et réglementaire.
            Démontrez comment vous restez à jour sur les évolutions du métier et de la pédagogie.
          </p>
        </div>
      </div>

      {/* Types de veille pratiqués */}
      <div>
        <h3 className="font-medium text-[rgb(var(--foreground))] mb-4">
          Types de veille pratiqués
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TYPES_VEILLE.map(type => (
            <button
              key={type}
              onClick={() => toggleTypeVeille(type)}
              className={`p-3 rounded-lg border transition-all text-left flex items-center gap-3 ${
                profil.typesVeille?.includes(type)
                  ? 'bg-[rgba(var(--accent),0.1)] border-[rgb(var(--accent))]'
                  : 'bg-[rgb(var(--card))] border-[rgba(var(--border),0.5)] hover:border-[rgba(var(--accent),0.5)]'
              }`}
            >
              <CheckCircle
                className={`w-5 h-5 flex-shrink-0 ${
                  profil.typesVeille?.includes(type)
                    ? 'text-[rgb(var(--accent))]'
                    : 'text-[rgb(var(--muted-foreground))]'
                }`}
              />
              <span className={`text-sm ${
                profil.typesVeille?.includes(type)
                  ? 'text-[rgb(var(--foreground))] font-medium'
                  : 'text-[rgb(var(--muted-foreground))]'
              }`}>
                {type}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Activités de veille récentes */}
      <div>
        <h3 className="font-medium text-[rgb(var(--foreground))] mb-4">
          Activités de veille récentes
        </h3>

        {profil.activitesVeille && profil.activitesVeille.length > 0 && (
          <div className="space-y-3 mb-4">
            {profil.activitesVeille.map((activite) => (
              <div
                key={activite.id}
                className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-[rgb(var(--foreground))]">
                        {activite.titre}
                      </h4>
                      <span className="px-2 py-1 bg-[rgba(var(--accent),0.1)] text-xs text-[rgb(var(--accent))] rounded">
                        {activite.type}
                      </span>
                    </div>
                    {activite.description && (
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">
                        {activite.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-[rgb(var(--muted-foreground))]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {activite.date}
                      </span>
                      {activite.lien && (
                        <a
                          href={activite.lien}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[rgb(var(--accent))] hover:underline"
                        >
                          <Link2 className="w-3 h-3" />
                          Lien
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => supprimerActivite(activite.id)}
                    className="p-2 hover:bg-[rgba(var(--error),0.1)] rounded-lg transition-colors"
                    aria-label="Supprimer cette activité"
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
              Ajouter une activité de veille
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type d'activité *</label>
                <select
                  value={nouvelleActivite.type}
                  onChange={(e) => setNouvelleActivite({...nouvelleActivite, type: e.target.value})}
                  className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
                  required
                >
                  <option value="">Sélectionnez un type</option>
                  {TYPES_VEILLE.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date *</label>
                <input
                  type="date"
                  value={nouvelleActivite.date}
                  onChange={(e) => setNouvelleActivite({...nouvelleActivite, date: e.target.value})}
                  className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Titre de l'activité *</label>
              <input
                type="text"
                value={nouvelleActivite.titre}
                onChange={(e) => setNouvelleActivite({...nouvelleActivite, titre: e.target.value})}
                placeholder="Ex: Salon international de la bijouterie"
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={nouvelleActivite.description}
                onChange={(e) => setNouvelleActivite({...nouvelleActivite, description: e.target.value})}
                placeholder="Décrivez ce que vous avez appris, les innovations découvertes..."
                rows={3}
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Lien (optionnel)</label>
              <input
                type="url"
                value={nouvelleActivite.lien}
                onChange={(e) => setNouvelleActivite({...nouvelleActivite, lien: e.target.value})}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setModeAjout(false)}
                className="px-4 py-2 bg-[rgb(var(--secondary))] rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={ajouterActivite}
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
            <span className="text-[rgb(var(--accent))]\">Ajouter une activité de veille</span>
          </button>
        )}
      </div>

      {/* Publications et articles */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          Publications et articles (optionnel)
        </label>
        <textarea
          value={profil.publicationsArticles || ''}
          onChange={(e) => updateProfil('publicationsArticles', e.target.value)}
          placeholder="Listez vos publications, articles, contributions à des revues professionnelles..."
          rows={4}
          className="w-full px-4 py-3 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))] resize-none"
        />
      </div>

      {/* Récapitulatif */}
      {((profil.typesVeille && profil.typesVeille.length > 0) ||
        (profil.activitesVeille && profil.activitesVeille.length > 0)) && (
        <div className="p-4 bg-[rgba(var(--success),0.05)] border border-[rgba(var(--success),0.2)] rounded-lg">
          <p className="text-sm font-medium text-[rgb(var(--foreground))] mb-3">
            Récapitulatif de votre veille
          </p>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[rgb(var(--accent))]">
                {profil.typesVeille?.length || 0}
              </div>
              <div className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                Types de veille
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[rgb(var(--accent))]">
                {profil.activitesVeille?.length || 0}
              </div>
              <div className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                Activités récentes
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}