'use client'

import { ChevronRight, ChevronLeft, Save, Check, Loader2 } from 'lucide-react'
import { useProfilFormateur } from '@/contexts/ProfilFormateurContext'

interface ProfilActionsProps {
  totalEtapes: number
}

export function ProfilActions({ totalEtapes }: ProfilActionsProps) {
  const {
    etapeActuelle,
    suivant,
    precedent,
    sauvegarderProfil,
    sauvegarde
  } = useProfilFormateur()

  const estPremiereEtape = etapeActuelle === 0
  const estDerniereEtape = etapeActuelle === totalEtapes - 1

  return (
    <div className="flex items-center justify-between p-6 border-t border-[rgba(var(--border),0.5)] bg-[rgb(var(--card))]">
      {/* Bouton Précédent */}
      <button
        onClick={precedent}
        disabled={estPremiereEtape}
        className={`
          px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200
          ${estPremiereEtape
            ? 'opacity-50 cursor-not-allowed bg-[rgb(var(--secondary))]'
            : 'bg-[rgb(var(--secondary))] hover:bg-[rgba(var(--accent),0.1)] text-[rgb(var(--foreground))]'
          }
        `}
      >
        <ChevronLeft className="w-4 h-4" />
        Précédent
      </button>

      {/* Boutons du centre (sauvegarde) */}
      <div className="flex items-center gap-4">
        <button
          onClick={sauvegarderProfil}
          disabled={sauvegarde}
          className="px-6 py-2 bg-[rgb(var(--secondary))] hover:bg-[rgba(var(--success),0.1)] rounded-lg flex items-center gap-2 transition-all duration-200"
        >
          {sauvegarde ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Sauvegarder
            </>
          )}
        </button>
      </div>

      {/* Bouton Suivant ou Terminer */}
      <button
        onClick={suivant}
        disabled={estDerniereEtape}
        className={`
          px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200
          ${estDerniereEtape
            ? 'bg-[rgb(var(--success))] text-white'
            : 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))]'
          } hover:opacity-90
        `}
      >
        {estDerniereEtape ? (
          <>
            <Check className="w-4 h-4" />
            Terminer
          </>
        ) : (
          <>
            Suivant
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  )
}