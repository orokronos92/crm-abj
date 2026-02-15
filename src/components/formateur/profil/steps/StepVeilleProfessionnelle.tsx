'use client'

import { Eye, Plus, X, FileText } from 'lucide-react'
import { useState } from 'react'
import { useProfilFormateur } from '@/contexts/ProfilFormateurContext'

export function StepVeilleProfessionnelle() {
  const { profil, updateProfil } = useProfilFormateur()
  const [nouvelleVeille, setNouvelleVeille] = useState({
    type: 'Technique',
    source: '',
    frequence: 'Mensuelle',
    description: '',
    documentUrl: ''
  })
  const [modeAjout, setModeAjout] = useState(false)

  const TYPES_VEILLE = [
    'Technique',
    'Réglementaire',
    'Concurrentielle',
    'Pédagogique',
    'Marché',
    'Innovation'
  ]

  const SOURCES_VEILLE = [
    'Revues professionnelles',
    'Salons et événements',
    'Sites web spécialisés',
    'Associations professionnelles',
    'Réseaux sociaux professionnels',
    'Formations et conférences',
    'Newsletters',
    'Podcasts',
    'Autre'
  ]

  const FREQUENCES = [
    { value: 'Quotidienne', label: 'Quotidienne', color: 'success' },
    { value: 'Hebdomadaire', label: 'Hebdomadaire', color: 'accent' },
    { value: 'Mensuelle', label: 'Mensuelle', color: 'warning' },
    { value: 'Trimestrielle', label: 'Trimestrielle', color: 'muted' },
    { value: 'Annuelle', label: 'Annuelle', color: 'muted' }
  ]

  const ajouterVeille = () => {
    if (nouvelleVeille.type && nouvelleVeille.source && nouvelleVeille.description) {
      updateProfil('veilleProfessionnelle', [
        ...(profil.veilleProfessionnelle || []),
        { ...nouvelleVeille, id: Date.now() }
      ])
      setNouvelleVeille({
        type: 'Technique',
        source: '',
        frequence: 'Mensuelle',
        description: '',
        documentUrl: ''
      })
      setModeAjout(false)
    }
  }

  const supprimerVeille = (id: number) => {
    updateProfil(
      'veilleProfessionnelle',
      (profil.veilleProfessionnelle || []).filter((v: any) => v.id !== id)
    )
  }

  const getFrequenceColor = (frequence: string) => {
    const freqObj = FREQUENCES.find(f => f.value === frequence)
    switch (freqObj?.color) {
      case 'success': return 'bg-[rgba(var(--success),0.2)] text-[rgb(var(--success))]'
      case 'accent': return 'bg-[rgba(var(--accent),0.2)] text-[rgb(var(--accent))]'
      case 'warning': return 'bg-[rgba(var(--warning),0.2)] text-[rgb(var(--warning))]'
      default: return 'bg-[rgba(var(--muted-foreground),0.2)] text-[rgb(var(--muted-foreground))]'
    }
  }

  const handleChange = (field: keyof typeof profil, value: any) => {
    updateProfil(field, value)
  }

  return (
    <div className="space-y-6">
      {/* Description Qualiopi */}
      <div className="flex items-start gap-3 p-4 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.2)]">
        <Eye className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[rgb(var(--foreground))] mb-1">
            Veille professionnelle et actualisation des compétences
          </p>
          <p className="text-[rgb(var(--muted-foreground))]">
            Indicateur 22 : Démontrez comment vous vous tenez informé des évolutions de votre secteur (techniques, réglementaires, pédagogiques).
            Cette veille active justifie votre maintien à niveau.
          </p>
        </div>
      </div>

      {/* Liste des veilles existantes */}
      {profil.veilleProfessionnelle && profil.veilleProfessionnelle.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[rgb(var(--foreground))]">
            Mes sources de veille ({profil.veilleProfessionnelle.length})
          </h3>
          {profil.veilleProfessionnelle.map((veille: any) => (
            <div
              key={veille.id}
              className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.5)] hover:border-[rgba(var(--accent),0.3)] transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-[rgb(var(--foreground))]">
                      {veille.source}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[rgba(var(--accent),0.2)] text-[rgb(var(--accent))]">
                      {veille.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getFrequenceColor(veille.frequence)}`}>
                      {veille.frequence}
                    </span>
                  </div>
                  {veille.description && (
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mt-2">
                      {veille.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => supprimerVeille(veille.id)}
                  className="p-2 hover:bg-[rgba(var(--error),0.1)] rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bouton ajouter ou formulaire */}
      {!modeAjout ? (
        <button
          onClick={() => setModeAjout(true)}
          className="w-full p-4 border-2 border-dashed border-[rgba(var(--border),0.5)] rounded-lg hover:border-[rgba(var(--accent),0.5)] hover:bg-[rgba(var(--accent),0.02)] transition-all flex items-center justify-center gap-2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--accent))]"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Ajouter une source de veille</span>
        </button>
      ) : (
        <div className="p-6 bg-[rgba(var(--accent),0.03)] border border-[rgba(var(--accent),0.2)] rounded-lg space-y-4">
          <h3 className="text-sm font-medium text-[rgb(var(--foreground))] mb-4">
            Nouvelle source de veille
          </h3>

          {/* Type et Source */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Type de veille *
              </label>
              <select
                value={nouvelleVeille.type}
                onChange={(e) => setNouvelleVeille({ ...nouvelleVeille, type: e.target.value })}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
                required
              >
                {TYPES_VEILLE.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Source *
              </label>
              <input
                type="text"
                value={nouvelleVeille.source}
                onChange={(e) => setNouvelleVeille({ ...nouvelleVeille, source: e.target.value })}
                placeholder="Ex: Bijouterie de France, HBJO Paris..."
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
                required
              />
            </div>
          </div>

          {/* Fréquence */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Fréquence de consultation *
            </label>
            <select
              value={nouvelleVeille.frequence}
              onChange={(e) => setNouvelleVeille({ ...nouvelleVeille, frequence: e.target.value })}
              className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              required
            >
              {FREQUENCES.map(freq => (
                <option key={freq.value} value={freq.value}>{freq.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Description *
            </label>
            <textarea
              value={nouvelleVeille.description}
              onChange={(e) => setNouvelleVeille({ ...nouvelleVeille, description: e.target.value })}
              placeholder="Ex: Revue professionnelle couvrant les nouvelles techniques de sertissage, innovations en bijouterie..."
              rows={3}
              className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))] resize-none"
              required
            />
          </div>

          {/* Justificatif */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Justificatif (PDF, JPG, PNG - max 5 Mo)
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      alert('Le fichier ne doit pas dépasser 5 Mo')
                      e.target.value = ''
                      return
                    }
                    // TODO: Upload vers S3 et récupérer l'URL
                    // Pour l'instant on stocke juste le nom du fichier localement
                    setNouvelleVeille({ ...nouvelleVeille, documentUrl: file.name })
                  }
                }}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[rgba(var(--accent),0.1)] file:text-[rgb(var(--accent))] hover:file:bg-[rgba(var(--accent),0.2)] cursor-pointer"
              />
              {nouvelleVeille.documentUrl && (
                <div className="flex items-center gap-2 p-2 bg-[rgba(var(--success),0.1)] rounded-lg border border-[rgba(var(--success),0.3)]">
                  <FileText className="w-4 h-4 text-[rgb(var(--success))]" />
                  <span className="text-sm text-[rgb(var(--success))] flex-1">{nouvelleVeille.documentUrl}</span>
                  <button
                    onClick={() => setNouvelleVeille({ ...nouvelleVeille, documentUrl: '' })}
                    className="p-1 hover:bg-[rgba(var(--error),0.1)] rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))]" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-[rgba(var(--border),0.5)]">
            <button
              onClick={() => {
                setModeAjout(false)
                setNouvelleVeille({
                  type: 'Technique',
                  source: '',
                  frequence: 'Mensuelle',
                  description: '',
                  documentUrl: ''
                })
              }}
              className="px-6 py-2.5 bg-[rgb(var(--secondary))] hover:bg-[rgba(var(--secondary),0.8)] rounded-lg transition-colors text-[rgb(var(--foreground))]"
            >
              Annuler
            </button>
            <button
              onClick={ajouterVeille}
              disabled={!nouvelleVeille.type || !nouvelleVeille.source || !nouvelleVeille.description}
              className="px-6 py-2.5 bg-[rgb(var(--accent))] hover:bg-[rgba(var(--accent),0.9)] text-[rgb(var(--primary))] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ajouter la source de veille
            </button>
          </div>
        </div>
      )}

      {/* Publications et articles */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          Publications et articles (optionnel)
        </label>
        <textarea
          value={profil.publicationsArticles || ''}
          onChange={(e) => handleChange('publicationsArticles', e.target.value)}
          placeholder="Listez vos publications, articles, contributions à des revues professionnelles..."
          rows={4}
          className="w-full px-4 py-3 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))] resize-none"
        />
      </div>

      {/* Message si aucune veille */}
      {(!profil.veilleProfessionnelle || profil.veilleProfessionnelle.length === 0) && !modeAjout && (
        <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
          <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Aucune source de veille enregistrée</p>
          <p className="text-xs mt-1">Cliquez sur "Ajouter une source de veille" pour commencer</p>
        </div>
      )}
    </div>
  )
}