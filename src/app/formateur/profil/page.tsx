'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProfilFormateurProvider } from '@/contexts/ProfilFormateurContext'
import { ProfilStepper } from '@/components/formateur/profil/ProfilStepper'
import { ProfilProgressBar } from '@/components/formateur/profil/ProfilProgressBar'
import { ProfilContent } from '@/components/formateur/profil/ProfilContent'
import { ProfilActions } from '@/components/formateur/profil/ProfilActions'
import { ETAPES_PROFIL_FORMATEUR } from '@/config/formateur/profil.config'

/**
 * Page de gestion du profil formateur
 *
 * Cette page utilise l'architecture modulaire avec React Context
 * pour éviter le props drilling et garder des composants < 300 lignes.
 *
 * Architecture :
 * - ProfilFormateurProvider : Context global pour l'état du formulaire
 * - ProfilStepper : Navigation entre les étapes
 * - ProfilProgressBar : Indicateur de progression
 * - ProfilContent : Contenu de chaque étape
 * - ProfilActions : Boutons d'action (Précédent/Suivant/Sauvegarder)
 *
 * Chaque étape est dans son propre composant dans :
 * src/components/formateur/profil/steps/
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