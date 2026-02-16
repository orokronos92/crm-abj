'use client'

import { ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useProfilFormateur } from '@/contexts/ProfilFormateurContext'
import { useState } from 'react'

interface ProfilNavigationButtonsProps {
  totalEtapes: number
}

/**
 * Boutons de navigation entre les étapes (Précédent/Suivant/Valider)
 * Placés juste sous le stepper dans le header sticky
 *
 * À la dernière étape, le bouton "Valider le dossier" :
 * - Sauvegarde toutes les données en BDD
 * - Upload les fichiers sur le VPS
 * - Redirige vers /formateur/competences
 */
export function ProfilNavigationButtons({ totalEtapes }: ProfilNavigationButtonsProps) {
  const router = useRouter()
  const {
    etapeActuelle,
    suivant,
    precedent,
    sauvegarderProfil,
    sauvegarde
  } = useProfilFormateur()

  const estPremiereEtape = etapeActuelle === 0
  const estDerniereEtape = etapeActuelle === totalEtapes - 1

  const handleValiderDossier = async () => {
    // Sauvegarder le profil (upload BDD + fichiers VPS)
    await sauvegarderProfil()

    // Rediriger vers la page de profil/compétences
    router.push('/formateur/competences')
  }

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Bouton Précédent */}
      <button
        onClick={precedent}
        disabled={estPremiereEtape}
        className={`
          flex-1 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 font-medium
          ${estPremiereEtape
            ? 'opacity-40 cursor-not-allowed bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))]'
            : 'bg-[rgb(var(--secondary))] hover:bg-[rgba(var(--accent),0.1)] text-[rgb(var(--foreground))] hover:text-[rgb(var(--accent))]'
          }
        `}
      >
        <ChevronLeft className="w-4 h-4" />
        Précédent
      </button>

      {/* Indicateur étape actuelle */}
      <div className="text-sm text-[rgb(var(--muted-foreground))] font-medium whitespace-nowrap">
        Étape {etapeActuelle + 1} / {totalEtapes}
      </div>

      {/* Bouton Suivant ou Valider */}
      <button
        onClick={estDerniereEtape ? handleValiderDossier : suivant}
        disabled={sauvegarde}
        className={`
          flex-1 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 font-medium
          ${estDerniereEtape
            ? 'bg-[rgb(var(--success))] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
            : 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))] hover:opacity-90 disabled:opacity-50'
          }
        `}
      >
        {sauvegarde ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Validation...
          </>
        ) : estDerniereEtape ? (
          <>
            <Check className="w-4 h-4" />
            Valider le dossier
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
