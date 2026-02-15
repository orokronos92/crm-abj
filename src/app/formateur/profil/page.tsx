'use client'

import { useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProfilFormateurProvider } from '@/contexts/ProfilFormateurContext'
import { ProfilStepper } from '@/components/formateur/profil/ProfilStepper'
import { ProfilProgressBar } from '@/components/formateur/profil/ProfilProgressBar'
import { ProfilContent } from '@/components/formateur/profil/ProfilContent'
import { ProfilActions } from '@/components/formateur/profil/ProfilActions'
import { ETAPES_PROFIL_FORMATEUR } from '@/config/formateur/profil.config'
import { FileText } from 'lucide-react'

// Composant interne qui utilise le contexte
function ProfilFormateurContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[rgba(var(--accent),0.1)] rounded-lg">
            <FileText className="w-6 h-6 text-[rgb(var(--accent))]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">
              Votre Profil Formateur Qualiopi
            </h1>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Complétez votre profil pour la conformité Qualiopi (indicateurs 9, 11, 13, 21, 22)
            </p>
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      <ProfilProgressBar totalEtapes={ETAPES_PROFIL_FORMATEUR.length} />

      {/* Stepper de navigation */}
      <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgba(var(--border),0.5)] p-6">
        <ProfilStepper etapes={ETAPES_PROFIL_FORMATEUR} />
      </div>

      {/* Contenu de l'étape actuelle */}
      <ProfilContent />

      {/* Actions (boutons) */}
      <ProfilActions totalEtapes={ETAPES_PROFIL_FORMATEUR.length} />
    </div>
  )
}

// Page principale avec Provider
export default function ProfilFormateur() {
  return (
    <DashboardLayout>
      <ProfilFormateurProvider>
        <ProfilFormateurContent />
      </ProfilFormateurProvider>
    </DashboardLayout>
  )
}