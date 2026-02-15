'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  GraduationCap,
  Award,
  BookOpen,
  Briefcase,
  Wrench,
  TrendingUp,
  Eye,
  ChevronRight,
  ChevronLeft,
  Save,
  Check
} from 'lucide-react'

// Types pour les données du profil
interface ProfilFormateur {
  diplomes: any[]
  certifications: any[]
  formationsPedagogiques: any[]
  portfolio: any[]
  competences: any[]
  formationsContinues: any[]
  veille: any[]
}

// Configuration des étapes
const ETAPES = [
  { id: 'diplomes', label: 'Diplômes métier', icon: GraduationCap, description: 'Vos diplômes et qualifications professionnelles' },
  { id: 'certifications', label: 'Certifications', icon: Award, description: 'Certifications professionnelles et validations' },
  { id: 'formations-pedagogiques', label: 'Formations pédagogiques', icon: BookOpen, description: 'Votre parcours de formateur' },
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase, description: 'Vos réalisations et projets' },
  { id: 'competences', label: 'Compétences techniques', icon: Wrench, description: 'Savoir-faire et expertises' },
  { id: 'formations-continues', label: 'Formations continues', icon: TrendingUp, description: 'Votre développement professionnel' },
  { id: 'veille', label: 'Veille professionnelle', icon: Eye, description: 'Votre veille sectorielle' }
]

export default function ProfilFormateur() {
  const [etapeActuelle, setEtapeActuelle] = useState(0)
  const [profil, setProfil] = useState<ProfilFormateur>({
    diplomes: [],
    certifications: [],
    formationsPedagogiques: [],
    portfolio: [],
    competences: [],
    formationsContinues: [],
    veille: []
  })
  const [chargement, setChargement] = useState(true)
  const [sauvegarde, setSauvegarde] = useState(false)

  // Charger les données existantes au montage
  useEffect(() => {
    chargerProfil()
  }, [])

  const chargerProfil = async () => {
    setChargement(true)
    try {
      // TODO: Appel API pour récupérer le profil du formateur connecté
      // const response = await fetch('/api/formateur/profil')
      // const data = await response.json()
      // setProfil(data)

      // Pour l'instant, on simule un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Erreur chargement profil:', error)
    } finally {
      setChargement(false)
    }
  }

  const sauvegarderBrouillon = async () => {
    setSauvegarde(true)
    try {
      // TODO: Appel API pour sauvegarder le brouillon
      // await fetch('/api/formateur/profil', { method: 'PATCH', body: JSON.stringify(profil) })
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
    } finally {
      setSauvegarde(false)
    }
  }

  const suivant = () => {
    if (etapeActuelle < ETAPES.length - 1) {
      sauvegarderBrouillon()
      setEtapeActuelle(etapeActuelle + 1)
    }
  }

  const precedent = () => {
    if (etapeActuelle > 0) {
      setEtapeActuelle(etapeActuelle - 1)
    }
  }

  const allerAEtape = (index: number) => {
    setEtapeActuelle(index)
  }

  if (chargement) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--accent))] mx-auto"></div>
            <p className="mt-4 text-[rgb(var(--muted-foreground))]">Chargement de votre profil...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const etape = ETAPES[etapeActuelle]
  const IconeEtape = etape.icon

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-2">
            Gérer mon profil professionnel
          </h1>
          <p className="text-[rgb(var(--muted-foreground))]">
            Complétez votre profil pour répondre aux exigences Qualiopi (indicateurs 21 & 22)
          </p>
        </div>

        {/* Stepper horizontal */}
        <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgba(var(--border),0.5)] p-6 mb-8">
          <div className="flex items-center justify-between">
            {ETAPES.map((e, index) => {
              const Icone = e.icon
              const estActuelle = index === etapeActuelle
              const estTerminee = index < etapeActuelle
              const estAccessible = index <= etapeActuelle

              return (
                <div key={e.id} className="flex items-center flex-1">
                  <button
                    onClick={() => estAccessible && allerAEtape(index)}
                    disabled={!estAccessible}
                    className={`flex flex-col items-center gap-2 transition-all ${
                      estAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        estActuelle
                          ? 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))]'
                          : estTerminee
                          ? 'bg-[rgba(var(--success),0.2)] text-[rgb(var(--success))]'
                          : 'bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))]'
                      }`}
                    >
                      {estTerminee ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icone className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium hidden md:block max-w-[100px] text-center ${
                        estActuelle
                          ? 'text-[rgb(var(--accent))]'
                          : estTerminee
                          ? 'text-[rgb(var(--success))]'
                          : 'text-[rgb(var(--muted-foreground))]'
                      }`}
                    >
                      {e.label}
                    </span>
                  </button>

                  {index < ETAPES.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-all ${
                        estTerminee
                          ? 'bg-[rgb(var(--success))]'
                          : 'bg-[rgba(var(--border),0.5)]'
                      }`}
                    ></div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Contenu de l'étape actuelle */}
        <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgba(var(--border),0.5)] p-8 mb-6">
          {/* Header de l'étape */}
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-[rgba(var(--border),0.3)]">
            <div className="p-3 bg-[rgba(var(--accent),0.1)] rounded-lg">
              <IconeEtape className="w-6 h-6 text-[rgb(var(--accent))]" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-1">
                {etape.label}
              </h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                {etape.description}
              </p>
            </div>
            <div className="text-sm text-[rgb(var(--muted-foreground))]">
              Étape {etapeActuelle + 1} / {ETAPES.length}
            </div>
          </div>

          {/* Formulaire de l'étape */}
          <div className="min-h-[400px]">
            {etape.id === 'diplomes' && (
              <EtapeDiplomes profil={profil} setProfil={setProfil} />
            )}
            {etape.id === 'certifications' && (
              <EtapeCertifications profil={profil} setProfil={setProfil} />
            )}
            {etape.id === 'formations-pedagogiques' && (
              <EtapeFormationsPedagogiques profil={profil} setProfil={setProfil} />
            )}
            {etape.id === 'portfolio' && (
              <EtapePortfolio profil={profil} setProfil={setProfil} />
            )}
            {etape.id === 'competences' && (
              <EtapeCompetences profil={profil} setProfil={setProfil} />
            )}
            {etape.id === 'formations-continues' && (
              <EtapeFormationsContinues profil={profil} setProfil={setProfil} />
            )}
            {etape.id === 'veille' && (
              <EtapeVeille profil={profil} setProfil={setProfil} />
            )}
          </div>
        </div>

        {/* Navigation sticky en bas */}
        <div className="bg-[rgb(var(--card))] rounded-lg border border-[rgba(var(--border),0.5)] p-4 sticky bottom-4">
          <div className="flex items-center justify-between">
            <button
              onClick={precedent}
              disabled={etapeActuelle === 0}
              className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                etapeActuelle === 0
                  ? 'bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))] cursor-not-allowed'
                  : 'bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] hover:bg-[rgba(var(--accent),0.1)]'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </button>

            <button
              onClick={sauvegarderBrouillon}
              disabled={sauvegarde}
              className="px-6 py-2 bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] rounded-lg font-medium flex items-center gap-2 hover:bg-[rgba(var(--accent),0.2)] transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {sauvegarde ? 'Sauvegarde...' : 'Sauvegarder brouillon'}
            </button>

            {etapeActuelle < ETAPES.length - 1 ? (
              <button
                onClick={suivant}
                className="px-6 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium flex items-center gap-2 hover:bg-[rgb(var(--accent-light))] transition-all"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={sauvegarderBrouillon}
                className="px-6 py-2 bg-[rgb(var(--success))] text-white rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition-all"
              >
                <Check className="w-4 h-4" />
                Terminer et valider
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// Composants pour chaque étape (à implémenter)
function EtapeDiplomes({ profil, setProfil }: { profil: ProfilFormateur; setProfil: (p: ProfilFormateur) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[rgb(var(--muted-foreground))]">
        Listez vos diplômes métier (CAP, BMA, DMA, etc.)
      </p>
      <div className="text-center py-12 text-[rgb(var(--muted-foreground))]">
        Formulaire à implémenter
      </div>
    </div>
  )
}

function EtapeCertifications({ profil, setProfil }: { profil: ProfilFormateur; setProfil: (p: ProfilFormateur) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[rgb(var(--muted-foreground))]">
        Vos certifications professionnelles et qualifications complémentaires
      </p>
      <div className="text-center py-12 text-[rgb(var(--muted-foreground))]">
        Formulaire à implémenter
      </div>
    </div>
  )
}

function EtapeFormationsPedagogiques({ profil, setProfil }: { profil: ProfilFormateur; setProfil: (p: ProfilFormateur) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[rgb(var(--muted-foreground))]">
        Formations de formateur et pédagogie
      </p>
      <div className="text-center py-12 text-[rgb(var(--muted-foreground))]">
        Formulaire à implémenter
      </div>
    </div>
  )
}

function EtapePortfolio({ profil, setProfil }: { profil: ProfilFormateur; setProfil: (p: ProfilFormateur) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[rgb(var(--muted-foreground))]">
        Vos réalisations, projets et créations marquantes
      </p>
      <div className="text-center py-12 text-[rgb(var(--muted-foreground))]">
        Formulaire à implémenter
      </div>
    </div>
  )
}

function EtapeCompetences({ profil, setProfil }: { profil: ProfilFormateur; setProfil: (p: ProfilFormateur) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[rgb(var(--muted-foreground))]">
        Vos compétences techniques et savoir-faire spécifiques
      </p>
      <div className="text-center py-12 text-[rgb(var(--muted-foreground))]">
        Formulaire à implémenter
      </div>
    </div>
  )
}

function EtapeFormationsContinues({ profil, setProfil }: { profil: ProfilFormateur; setProfil: (p: ProfilFormateur) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[rgb(var(--muted-foreground))]">
        Votre développement professionnel continu
      </p>
      <div className="text-center py-12 text-[rgb(var(--muted-foreground))]">
        Formulaire à implémenter
      </div>
    </div>
  )
}

function EtapeVeille({ profil, setProfil }: { profil: ProfilFormateur; setProfil: (p: ProfilFormateur) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[rgb(var(--muted-foreground))]">
        Comment vous vous tenez informé des évolutions de votre métier
      </p>
      <div className="text-center py-12 text-[rgb(var(--muted-foreground))]">
        Formulaire à implémenter
      </div>
    </div>
  )
}
