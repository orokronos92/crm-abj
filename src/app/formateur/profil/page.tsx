'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProfilFormateurProvider } from '@/contexts/ProfilFormateurContext'
import { ProfilStepper } from '@/components/formateur/profil/ProfilStepper'
import { ProfilProgressBar } from '@/components/formateur/profil/ProfilProgressBar'
import { ProfilContent } from '@/components/formateur/profil/ProfilContent'
import { ProfilNavigationButtons } from '@/components/formateur/profil/ProfilNavigationButtons'
import { ETAPES_PROFIL_FORMATEUR } from '@/config/formateur/profil.config'

/**
 * Page de gestion du profil formateur
 *
 * Cette page utilise l'architecture modulaire avec React Context
 * pour éviter le props drilling et garder des composants < 300 lignes.
 *
 * Architecture :
 * - ProfilFormateurProvider : Context global pour l'état du formulaire
 * - Header sticky : Titre + Progression + Stepper + Navigation
 * - ProfilContent : Contenu scrollable de chaque étape
 * - Navigation : Le bouton "Valider" de la dernière étape sauvegarde et redirige
 *
 * Chaque étape est dans son propre composant dans :
 * src/components/formateur/profil/steps/
 */
export default function ProfilFormateurPage() {
  return (
    <DashboardLayout>
      <ProfilFormateurProvider>
        {/* Header sticky avec titre + progression + stepper + navigation */}
        <div className="sticky top-0 z-30 bg-[rgb(var(--background))] border-b border-[rgba(var(--border),0.5)] shadow-sm pb-6 mb-6">
          <div className="space-y-4">
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

            {/* Boutons de navigation (Précédent/Suivant/Valider) */}
            <ProfilNavigationButtons totalEtapes={ETAPES_PROFIL_FORMATEUR.length} />
          </div>
        </div>

        {/* Contenu de l'étape actuelle (scrollable) */}
        <div className="pb-8">
          <ProfilContent />
        </div>
      </ProfilFormateurProvider>
    </DashboardLayout>
  )
}