'use client'

import { useProfilFormateur } from '@/contexts/ProfilFormateurContext'

interface ProfilProgressBarProps {
  totalEtapes: number
}

export function ProfilProgressBar({ totalEtapes }: ProfilProgressBarProps) {
  const { etapeActuelle } = useProfilFormateur()

  const pourcentage = Math.round(((etapeActuelle + 1) / totalEtapes) * 100)

  return (
    <div className="space-y-2">
      {/* Texte de progression */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-[rgb(var(--muted-foreground))]">
          Étape {etapeActuelle + 1} sur {totalEtapes}
        </span>
        <span className="font-medium text-[rgb(var(--foreground))]">
          {pourcentage}% complété
        </span>
      </div>

      {/* Barre de progression */}
      <div className="relative h-2 bg-[rgb(var(--secondary))] rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[rgb(var(--accent))] to-[rgba(var(--accent),0.8)] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pourcentage}%` }}
        >
          {/* Animation de brillance */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Message d'encouragement */}
      <p className="text-xs text-[rgb(var(--muted-foreground))]">
        {pourcentage === 100
          ? "✨ Profil complet ! N'oubliez pas de sauvegarder."
          : pourcentage >= 75
          ? "👏 Presque terminé ! Plus que quelques étapes."
          : pourcentage >= 50
          ? "💪 Vous êtes à mi-chemin ! Continuez ainsi."
          : pourcentage >= 25
          ? "🚀 Bon début ! Continuez à compléter votre profil."
          : "👋 Bienvenue ! Commençons par les informations essentielles."}
      </p>
    </div>
  )
}