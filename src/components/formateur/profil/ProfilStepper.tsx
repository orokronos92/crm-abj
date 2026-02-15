'use client'

import { Check } from 'lucide-react'
import { useProfilFormateur } from '@/contexts/ProfilFormateurContext'
import { Etape } from '@/types/formateur/profil.types'

interface ProfilStepperProps {
  etapes: Etape[]
}

export function ProfilStepper({ etapes }: ProfilStepperProps) {
  const { etapeActuelle, allerAEtape } = useProfilFormateur()

  return (
    <div className="flex justify-between items-center relative">
      {/* Ligne de progression en arrière-plan */}
      <div className="absolute top-5 left-0 right-0 h-[2px] bg-[rgb(var(--secondary))]" />

      {/* Ligne de progression active */}
      <div
        className="absolute top-5 left-0 h-[2px] bg-[rgb(var(--accent))] transition-all duration-300"
        style={{ width: `${(etapeActuelle / (etapes.length - 1)) * 100}%` }}
      />

      {/* Étapes */}
      {etapes.map((etape, index) => {
        const Icone = etape.icon
        const estActuelle = index === etapeActuelle
        const estTerminee = index < etapeActuelle
        const estAccessible = index <= etapeActuelle

        return (
          <button
            key={etape.id}
            onClick={() => estAccessible && allerAEtape(index)}
            disabled={!estAccessible}
            className={`
              relative z-10 flex flex-col items-center gap-2
              transition-all duration-200
              ${estAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
              ${estActuelle ? 'scale-110' : ''}
            `}
          >
            {/* Cercle de l'étape */}
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                transition-all duration-200 border-2
                ${estTerminee
                  ? 'bg-[rgb(var(--accent))] border-[rgb(var(--accent))]'
                  : estActuelle
                  ? 'bg-[rgb(var(--card))] border-[rgb(var(--accent))]'
                  : 'bg-[rgb(var(--secondary))] border-[rgb(var(--border))]'
                }
              `}
            >
              {estTerminee ? (
                <Check className="w-5 h-5 text-[rgb(var(--primary))]" />
              ) : (
                <Icone
                  className={`w-5 h-5 ${
                    estActuelle
                      ? 'text-[rgb(var(--accent))]'
                      : 'text-[rgb(var(--muted-foreground))]'
                  }`}
                />
              )}
            </div>

            {/* Label de l'étape (visible seulement sur desktop) */}
            <span
              className={`
                hidden lg:block text-xs max-w-[100px] text-center
                ${estActuelle
                  ? 'text-[rgb(var(--foreground))] font-medium'
                  : 'text-[rgb(var(--muted-foreground))]'
                }
              `}
            >
              {etape.label}
            </span>

            {/* Tooltip au survol (mobile) */}
            <div className="lg:hidden absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 pointer-events-none">
              <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {etape.label}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}