'use client'

import { useProfilFormateur } from '@/contexts/ProfilFormateurContext'
import { StepInformationsEssentielles } from './steps/StepInformationsEssentielles'
import { StepDiplomes } from './steps/StepDiplomes'
import { StepCertifications } from './steps/StepCertifications'
import { StepFormationsPedagogiques } from './steps/StepFormationsPedagogiques'
import { StepPortfolio } from './steps/StepPortfolio'
import { StepCompetences } from './steps/StepCompetences'
import { StepMethodesPedagogiques } from './steps/StepMethodesPedagogiques'
import { StepFormationsContinues } from './steps/StepFormationsContinues'
import { StepVeilleProfessionnelle } from './steps/StepVeilleProfessionnelle'
import { ETAPES_PROFIL_FORMATEUR } from '@/config/formateur/profil.config'
import { Loader2 } from 'lucide-react'

export function ProfilContent() {
  const { etapeActuelle, chargement } = useProfilFormateur()

  if (chargement) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[rgb(var(--accent))] animate-spin" />
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  const etape = ETAPES_PROFIL_FORMATEUR[etapeActuelle]
  const IconeEtape = etape.icon

  return (
    <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgba(var(--border),0.5)]">
      {/* Header avec infos de l'étape */}
      <div className="p-6 border-b border-[rgba(var(--border),0.5)]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[rgba(var(--accent),0.1)] rounded-lg">
            <IconeEtape className="w-6 h-6 text-[rgb(var(--accent))]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              {etape.label}
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              {etape.description}
            </p>
          </div>
        </div>
      </div>

      {/* Contenu de l'étape */}
      <div className="p-6">
        {renderEtapeContent(etapeActuelle)}
      </div>
    </div>
  )
}

// Fonction pour rendre le contenu de l'étape appropriée
function renderEtapeContent(etapeIndex: number) {
  switch (etapeIndex) {
    case 0:
      return <StepInformationsEssentielles />
    case 1:
      return <StepDiplomes />
    case 2:
      return <StepCertifications />
    case 3:
      return <StepFormationsPedagogiques />
    case 4:
      return <StepPortfolio />
    case 5:
      return <StepCompetences />
    case 6:
      return <StepMethodesPedagogiques />
    case 7:
      return <StepFormationsContinues />
    case 8:
      return <StepVeilleProfessionnelle />
    default:
      return null
  }
}