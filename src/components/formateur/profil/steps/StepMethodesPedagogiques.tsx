'use client'

import { Lightbulb, CheckCircle } from 'lucide-react'
import { useProfilFormateur } from '@/contexts/ProfilFormateurContext'

const METHODES_OPTIONS = [
  'Démonstration pratique',
  'Travaux dirigés',
  'Apprentissage par projet',
  'Pédagogie différenciée',
  'Travail en binôme',
  'Auto-évaluation',
  'Évaluation par les pairs',
  'Classe inversée',
  'Learning by doing',
  'Mentorat individuel'
]

const OUTILS_OPTIONS = [
  'Supports visuels (diaporamas, schémas)',
  'Vidéos pédagogiques',
  'Fiches techniques',
  'Modèles et gabarits',
  'Outils numériques (CAO/DAO)',
  'Plateforme e-learning',
  'Documentation technique',
  'Échantillons et matériaux',
  'Maquettes pédagogiques'
]

export function StepMethodesPedagogiques() {
  const { profil, updateProfil } = useProfilFormateur()

  const toggleMethode = (methode: string) => {
    const methodes = profil.methodesPedagogiques || []
    if (methodes.includes(methode)) {
      updateProfil('methodesPedagogiques', methodes.filter(m => m !== methode))
    } else {
      updateProfil('methodesPedagogiques', [...methodes, methode])
    }
  }

  const toggleOutil = (outil: string) => {
    const outils = profil.outilsSupports || []
    if (outils.includes(outil)) {
      updateProfil('outilsSupports', outils.filter(o => o !== outil))
    } else {
      updateProfil('outilsSupports', [...outils, outil])
    }
  }

  return (
    <div className="space-y-6">
      {/* Description Qualiopi */}
      <div className="flex items-start gap-3 p-4 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.2)]">
        <Lightbulb className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[rgb(var(--foreground))] mb-1">
            Approche et méthodes pédagogiques
          </p>
          <p className="text-[rgb(var(--muted-foreground))]">
            Indicateur 11 : Adaptation des modalités pédagogiques. Décrivez vos méthodes
            d'enseignement et les outils que vous utilisez pour transmettre vos connaissances.
          </p>
        </div>
      </div>

      {/* Méthodes pédagogiques */}
      <div>
        <h3 className="font-medium text-[rgb(var(--foreground))] mb-4">
          Méthodes pédagogiques utilisées
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {METHODES_OPTIONS.map(methode => (
            <button
              key={methode}
              onClick={() => toggleMethode(methode)}
              className={`p-3 rounded-lg border transition-all text-left flex items-center gap-3 ${
                profil.methodesPedagogiques?.includes(methode)
                  ? 'bg-[rgba(var(--accent),0.1)] border-[rgb(var(--accent))]'
                  : 'bg-[rgb(var(--card))] border-[rgba(var(--border),0.5)] hover:border-[rgba(var(--accent),0.5)]'
              }`}
            >
              <CheckCircle
                className={`w-5 h-5 flex-shrink-0 ${
                  profil.methodesPedagogiques?.includes(methode)
                    ? 'text-[rgb(var(--accent))]'
                    : 'text-[rgb(var(--muted-foreground))]'
                }`}
              />
              <span className={`text-sm ${
                profil.methodesPedagogiques?.includes(methode)
                  ? 'text-[rgb(var(--foreground))] font-medium'
                  : 'text-[rgb(var(--muted-foreground))]'
              }`}>
                {methode}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Outils et supports */}
      <div>
        <h3 className="font-medium text-[rgb(var(--foreground))] mb-4">
          Outils et supports pédagogiques
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {OUTILS_OPTIONS.map(outil => (
            <button
              key={outil}
              onClick={() => toggleOutil(outil)}
              className={`p-3 rounded-lg border transition-all text-left flex items-center gap-3 ${
                profil.outilsSupports?.includes(outil)
                  ? 'bg-[rgba(var(--accent),0.1)] border-[rgb(var(--accent))]'
                  : 'bg-[rgb(var(--card))] border-[rgba(var(--border),0.5)] hover:border-[rgba(var(--accent),0.5)]'
              }`}
            >
              <CheckCircle
                className={`w-5 h-5 flex-shrink-0 ${
                  profil.outilsSupports?.includes(outil)
                    ? 'text-[rgb(var(--accent))]'
                    : 'text-[rgb(var(--muted-foreground))]'
                }`}
              />
              <span className={`text-sm ${
                profil.outilsSupports?.includes(outil)
                  ? 'text-[rgb(var(--foreground))] font-medium'
                  : 'text-[rgb(var(--muted-foreground))]'
              }`}>
                {outil}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Approche pédagogique personnalisée */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          Votre approche pédagogique personnalisée
        </label>
        <textarea
          value={profil.approchePedagogique || ''}
          onChange={(e) => updateProfil('approchePedagogique', e.target.value)}
          placeholder="Décrivez votre philosophie d'enseignement, ce qui vous distingue, comment vous vous adaptez aux différents profils d'apprenants..."
          rows={6}
          className="w-full px-4 py-3 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))] resize-none"
        />
        <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
          Cette description sera visible sur votre profil public
        </p>
      </div>

      {/* Résumé des sélections */}
      {((profil.methodesPedagogiques && profil.methodesPedagogiques.length > 0) ||
        (profil.outilsSupports && profil.outilsSupports.length > 0)) && (
        <div className="p-4 bg-[rgba(var(--success),0.05)] border border-[rgba(var(--success),0.2)] rounded-lg">
          <p className="text-sm font-medium text-[rgb(var(--foreground))] mb-3">
            Récapitulatif de votre approche
          </p>
          <div className="space-y-2">
            {profil.methodesPedagogiques && profil.methodesPedagogiques.length > 0 && (
              <div>
                <span className="text-xs text-[rgb(var(--muted-foreground))]">Méthodes : </span>
                <span className="text-sm text-[rgb(var(--foreground))]">
                  {profil.methodesPedagogiques.length} sélectionnée(s)
                </span>
              </div>
            )}
            {profil.outilsSupports && profil.outilsSupports.length > 0 && (
              <div>
                <span className="text-xs text-[rgb(var(--muted-foreground))]">Outils : </span>
                <span className="text-sm text-[rgb(var(--foreground))]">
                  {profil.outilsSupports.length} sélectionné(s)
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}