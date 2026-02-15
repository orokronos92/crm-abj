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
  Check,
  Plus,
  X,
  FileText
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
  const [nouvelleCertif, setNouvelleCertif] = useState({
    nomCertification: '',
    organisme: '',
    dateObtention: '',
    dateExpiration: '',
    documentUrl: ''
  })
  const [modeAjout, setModeAjout] = useState(false)

  const ajouterCertification = () => {
    if (nouvelleCertif.nomCertification && nouvelleCertif.organisme && nouvelleCertif.dateObtention) {
      setProfil({
        ...profil,
        certifications: [...profil.certifications, { ...nouvelleCertif, id: Date.now() }]
      })
      setNouvelleCertif({
        nomCertification: '',
        organisme: '',
        dateObtention: '',
        dateExpiration: '',
        documentUrl: ''
      })
      setModeAjout(false)
    }
  }

  const supprimerCertification = (id: number) => {
    setProfil({
      ...profil,
      certifications: profil.certifications.filter(c => c.id !== id)
    })
  }

  const calculerStatut = (dateExpiration: string) => {
    if (!dateExpiration) return 'VALIDE'
    const expiration = new Date(dateExpiration)
    const maintenant = new Date()

    if (expiration < maintenant) return 'EXPIRE'

    // Alerte si expire dans moins de 3 mois
    const dans3Mois = new Date()
    dans3Mois.setMonth(dans3Mois.getMonth() + 3)
    if (expiration < dans3Mois) return 'A_RENOUVELER'

    return 'VALIDE'
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="flex items-start gap-3 p-4 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.2)]">
        <Award className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[rgb(var(--foreground))] mb-1">
            Certifications professionnelles obligatoires Qualiopi
          </p>
          <p className="text-[rgb(var(--muted-foreground))]">
            Indicateur 21 : Les formateurs doivent justifier de certifications professionnelles à jour.
            Ajoutez toutes vos certifications métier et pédagogiques.
          </p>
        </div>
      </div>

      {/* Liste des certifications existantes */}
      {profil.certifications.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[rgb(var(--foreground))]">
            Mes certifications ({profil.certifications.length})
          </h3>
          {profil.certifications.map((certif: any) => {
            const statut = calculerStatut(certif.dateExpiration)
            return (
              <div
                key={certif.id}
                className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.5)] hover:border-[rgba(var(--accent),0.3)] transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-[rgb(var(--foreground))]">
                        {certif.nomCertification}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        statut === 'VALIDE' ? 'bg-[rgba(var(--success),0.2)] text-[rgb(var(--success))]' :
                        statut === 'A_RENOUVELER' ? 'bg-[rgba(var(--warning),0.2)] text-[rgb(var(--warning))]' :
                        'bg-[rgba(var(--error),0.2)] text-[rgb(var(--error))]'
                      }`}>
                        {statut === 'VALIDE' ? 'Valide' :
                         statut === 'A_RENOUVELER' ? 'À renouveler' :
                         'Expiré'}
                      </span>
                    </div>
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                      {certif.organisme}
                    </p>
                  </div>
                  <button
                    onClick={() => supprimerCertification(certif.id)}
                    className="p-2 hover:bg-[rgba(var(--error),0.1)] rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[rgb(var(--muted-foreground))]">Obtenue le : </span>
                    <span className="text-[rgb(var(--foreground))]">
                      {new Date(certif.dateObtention).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {certif.dateExpiration && (
                    <div>
                      <span className="text-[rgb(var(--muted-foreground))]">Expire le : </span>
                      <span className="text-[rgb(var(--foreground))]">
                        {new Date(certif.dateExpiration).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Bouton ajouter ou formulaire */}
      {!modeAjout ? (
        <button
          onClick={() => setModeAjout(true)}
          className="w-full p-4 border-2 border-dashed border-[rgba(var(--border),0.5)] rounded-lg hover:border-[rgba(var(--accent),0.5)] hover:bg-[rgba(var(--accent),0.02)] transition-all flex items-center justify-center gap-2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--accent))]"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Ajouter une certification</span>
        </button>
      ) : (
        <div className="p-6 bg-[rgba(var(--accent),0.03)] border border-[rgba(var(--accent),0.2)] rounded-lg space-y-4">
          <h3 className="text-sm font-medium text-[rgb(var(--foreground))] mb-4">
            Nouvelle certification professionnelle
          </h3>

          {/* Nom de la certification */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Nom de la certification *
            </label>
            <input
              type="text"
              value={nouvelleCertif.nomCertification}
              onChange={(e) => setNouvelleCertif({ ...nouvelleCertif, nomCertification: e.target.value })}
              placeholder="Ex: CAP Art du Bijou et du Joyau"
              className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              required
            />
          </div>

          {/* Organisme */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Organisme certificateur *
            </label>
            <input
              type="text"
              value={nouvelleCertif.organisme}
              onChange={(e) => setNouvelleCertif({ ...nouvelleCertif, organisme: e.target.value })}
              placeholder="Ex: Éducation Nationale, CMA, etc."
              className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Date d'obtention *
              </label>
              <input
                type="date"
                value={nouvelleCertif.dateObtention}
                onChange={(e) => setNouvelleCertif({ ...nouvelleCertif, dateObtention: e.target.value })}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Date d'expiration (optionnel)
              </label>
              <input
                type="date"
                value={nouvelleCertif.dateExpiration}
                onChange={(e) => setNouvelleCertif({ ...nouvelleCertif, dateExpiration: e.target.value })}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              />
            </div>
          </div>

          {/* Justificatif */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Justificatif (upload à venir)
            </label>
            <div className="flex items-center gap-2 p-4 border-2 border-dashed border-[rgba(var(--border),0.5)] rounded-lg">
              <FileText className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
              <span className="text-sm text-[rgb(var(--muted-foreground))]">
                Fonctionnalité d'upload à implémenter
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4">
            <button
              onClick={ajouterCertification}
              className="px-6 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Ajouter
            </button>
            <button
              onClick={() => {
                setModeAjout(false)
                setNouvelleCertif({
                  nomCertification: '',
                  organisme: '',
                  dateObtention: '',
                  dateExpiration: '',
                  documentUrl: ''
                })
              }}
              className="px-6 py-2 bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] rounded-lg font-medium hover:bg-[rgba(var(--accent),0.1)] transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Message si aucune certification */}
      {profil.certifications.length === 0 && !modeAjout && (
        <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Aucune certification enregistrée</p>
          <p className="text-xs mt-1">Cliquez sur "Ajouter une certification" pour commencer</p>
        </div>
      )}
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
