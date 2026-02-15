'use client'

import { Lightbulb, Plus, X, FileText } from 'lucide-react'
import { useState } from 'react'
import { useProfilFormateur } from '@/contexts/ProfilFormateurContext'

export function StepMethodesPedagogiques() {
  const { profil, updateProfil } = useProfilFormateur()
  const [nouvelOutil, setNouvelOutil] = useState('')
  const [documentMethodes, setDocumentMethodes] = useState('')

  const OUTILS_PEDAGOGIQUES_SUGGESTIONS = [
    'Supports visuels (diaporamas, vidéos)',
    'Démonstrations pratiques en direct',
    'Exercices guidés progressifs',
    'Mises en situation professionnelle',
    'Évaluation formative continue',
    'Retours individualisés',
    'Documentation technique illustrée',
    'Outils numériques interactifs',
    'Travail collaboratif en binômes',
    'Portfolio de réalisations'
  ]

  const ajouterOutil = () => {
    if (nouvelOutil.trim() && !profil.outilsSupports?.includes(nouvelOutil.trim())) {
      updateProfil('outilsSupports', [...(profil.outilsSupports || []), nouvelOutil.trim()])
      setNouvelOutil('')
    }
  }

  const supprimerOutil = (outil: string) => {
    updateProfil('outilsSupports', (profil.outilsSupports || []).filter(o => o !== outil))
  }

  const handleChange = (field: keyof typeof profil, value: any) => {
    updateProfil(field, value)
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="flex items-start gap-3 p-4 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.2)]">
        <Lightbulb className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[rgb(var(--foreground))] mb-1">
            Méthodes et approche pédagogique
          </p>
          <p className="text-[rgb(var(--muted-foreground))]">
            Décrivez votre façon d'enseigner, vos méthodes pédagogiques et les outils que vous utilisez pour favoriser l'apprentissage.
          </p>
        </div>
      </div>

      {/* Méthodes pédagogiques */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          Vos méthodes pédagogiques *
        </label>
        <textarea
          value={profil.methodesPedagogiques || ''}
          onChange={(e) => handleChange('methodesPedagogiques', e.target.value)}
          placeholder="Ex: Apprentissage par la pratique, alternance théorie/démonstration/exercices, pédagogie active et participative..."
          rows={4}
          className="w-full px-4 py-3 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))] resize-none"
          required
        />
        <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
          Comment structurez-vous vos sessions de formation ? Quelle est votre démarche pédagogique ?
        </p>
      </div>

      {/* Approche pédagogique */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          Votre approche pédagogique *
        </label>
        <textarea
          value={profil.approchePedagogique || ''}
          onChange={(e) => handleChange('approchePedagogique', e.target.value)}
          placeholder="Ex: Approche individualisée selon le niveau, bienveillance et encouragement, valorisation des réussites, adaptation du rythme..."
          rows={4}
          className="w-full px-4 py-3 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))] resize-none"
          required
        />
        <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
          Comment accompagnez-vous vos apprenants ? Quelle relation pédagogique établissez-vous ?
        </p>
      </div>

      {/* Outils et supports */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          Outils et supports pédagogiques utilisés
        </label>

        {/* Liste des outils ajoutés */}
        {profil.outilsSupports && profil.outilsSupports.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {profil.outilsSupports.map((outil, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(var(--accent),0.1)] border border-[rgba(var(--accent),0.3)] rounded-lg text-sm"
              >
                <span className="text-[rgb(var(--foreground))]">{outil}</span>
                <button
                  onClick={() => supprimerOutil(outil)}
                  className="p-0.5 hover:bg-[rgba(var(--error),0.1)] rounded text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Ajout d'outil */}
        <div className="flex gap-2">
          <input
            type="text"
            value={nouvelOutil}
            onChange={(e) => setNouvelOutil(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), ajouterOutil())}
            placeholder="Ex: Démonstrations pratiques en direct"
            className="flex-1 px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
          />
          <button
            onClick={ajouterOutil}
            className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        {/* Suggestions */}
        <div className="mt-3">
          <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2">
            💡 Suggestions d'outils pédagogiques :
          </p>
          <div className="flex flex-wrap gap-2">
            {OUTILS_PEDAGOGIQUES_SUGGESTIONS
              .filter(suggestion => !profil.outilsSupports?.includes(suggestion))
              .slice(0, 6)
              .map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    updateProfil('outilsSupports', [...(profil.outilsSupports || []), suggestion])
                  }}
                  className="px-3 py-1.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-xs text-[rgb(var(--foreground))] hover:border-[rgba(var(--accent),0.5)] hover:bg-[rgba(var(--accent),0.05)] transition-all"
                >
                  + {suggestion}
                </button>
              ))}
          </div>
        </div>
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
                setDocumentMethodes(file.name)
              }
            }}
            className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[rgba(var(--accent),0.1)] file:text-[rgb(var(--accent))] hover:file:bg-[rgba(var(--accent),0.2)] cursor-pointer"
          />
          {documentMethodes && (
            <div className="flex items-center gap-2 p-2 bg-[rgba(var(--success),0.1)] rounded-lg border border-[rgba(var(--success),0.3)]">
              <FileText className="w-4 h-4 text-[rgb(var(--success))]" />
              <span className="text-sm text-[rgb(var(--success))] flex-1">{documentMethodes}</span>
              <button
                onClick={() => setDocumentMethodes('')}
                className="p-1 hover:bg-[rgba(var(--error),0.1)] rounded transition-colors"
              >
                <X className="w-3 h-3 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))]" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Récapitulatif */}
      {(profil.methodesPedagogiques || profil.approchePedagogique || (profil.outilsSupports && profil.outilsSupports.length > 0)) && (
        <div className="p-4 bg-[rgba(var(--success),0.05)] border border-[rgba(var(--success),0.2)] rounded-lg">
          <p className="text-sm font-medium text-[rgb(var(--success))] mb-2">
            ✓ Récapitulatif de votre approche pédagogique
          </p>
          <div className="space-y-2 text-sm text-[rgb(var(--foreground))]">
            {profil.methodesPedagogiques && (
              <div>
                <span className="font-medium">Méthodes : </span>
                <span className="text-[rgb(var(--muted-foreground))]">
                  {profil.methodesPedagogiques.slice(0, 100)}
                  {profil.methodesPedagogiques.length > 100 && '...'}
                </span>
              </div>
            )}
            {profil.approchePedagogique && (
              <div>
                <span className="font-medium">Approche : </span>
                <span className="text-[rgb(var(--muted-foreground))]">
                  {profil.approchePedagogique.slice(0, 100)}
                  {profil.approchePedagogique.length > 100 && '...'}
                </span>
              </div>
            )}
            {profil.outilsSupports && profil.outilsSupports.length > 0 && (
              <div>
                <span className="font-medium">Outils : </span>
                <span className="text-[rgb(var(--muted-foreground))]">
                  {profil.outilsSupports.length} outil{profil.outilsSupports.length > 1 ? 's' : ''} pédagogique{profil.outilsSupports.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}