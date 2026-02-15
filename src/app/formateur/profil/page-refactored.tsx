'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProfilFormateurProvider } from '@/contexts/ProfilFormateurContext'
import { ProfilStepper } from '@/components/formateur/profil/ProfilStepper'
import { ProfilProgressBar } from '@/components/formateur/profil/ProfilProgressBar'
import { ProfilContent } from '@/components/formateur/profil/ProfilContent'
import { ProfilActions } from '@/components/formateur/profil/ProfilActions'
import { ETAPES_PROFIL_FORMATEUR } from '@/config/formateur/profil.config'

/**
 * Page de gestion du profil formateur - Version refactorée
 *
 * Cette page utilise l'architecture modulaire avec React Context
 * au lieu du fichier monolithique de 2455 lignes.
 *
 * Architecture :
 * - ProfilFormateurProvider : Context global pour l'état du formulaire
 * - ProfilStepper : Navigation entre les étapes
 * - ProfilProgressBar : Indicateur de progression
 * - ProfilContent : Contenu de chaque étape
 * - ProfilActions : Boutons d'action (Précédent/Suivant/Sauvegarder)
 *
 * Chaque étape est dans son propre composant :
 * - StepInformationsEssentielles (147 lignes)
 * - StepDiplomes (150 lignes)
 * - StepCertifications (172 lignes)
 * - StepFormationsPedagogiques (162 lignes)
 * - StepPortfolio (211 lignes)
 * - StepCompetences (206 lignes)
 * - StepMethodesPedagogiques (169 lignes)
 * - StepFormationsContinues (226 lignes)
 * - StepVeilleProfessionnelle (283 lignes)
 *
 * Tous les composants respectent la limite de 300 lignes maximum.
 */
export default function ProfilFormateurPage() {
  return (
    <DashboardLayout>
      <ProfilFormateurProvider>
        <div className="space-y-6 pb-20">
          {/* En-tête */}
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
              Votre profil Qualiopi
            </h1>
            <p className="text-[rgb(var(--muted-foreground))] mt-2">
              Complétez votre profil pour être conforme aux exigences Qualiopi. Les indicateurs 9, 11, 13, 21 et 22 concernent directement les formateurs.
            </p>
          </div>

          {/* Barre de progression */}
          <ProfilProgressBar totalEtapes={ETAPES_PROFIL_FORMATEUR.length} />

          {/* Stepper de navigation */}
          <ProfilStepper etapes={ETAPES_PROFIL_FORMATEUR} />

          {/* Contenu de l'étape actuelle */}
          <ProfilContent />

          {/* Actions (Précédent/Suivant/Sauvegarder) */}
          <ProfilActions totalEtapes={ETAPES_PROFIL_FORMATEUR.length} />
        </div>
      </ProfilFormateurProvider>
    </DashboardLayout>
  )
}