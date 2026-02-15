'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  FileText,
  User,
  Lightbulb
} from 'lucide-react'

// Types pour les données du profil
interface ProfilFormateur {
  anneesExperienceMetier: number
  anneesExperienceEnseignement: number
  tarifHoraire: number
  bio: string
  diplomes: any[]
  certifications: any[]
  formationsPedagogiques: any[]
  portfolio: any[]
  competences: any[]
  methodesPedagogiques: string
  approchePedagogique: string
  outilsSupports: string[]
  formationsContinues: any[]
  veilleProfessionnelle: any[]
}

// Configuration des étapes
const ETAPES = [
  { id: 'informations-essentielles', label: 'Informations essentielles', icon: User, description: 'Votre profil et expérience' },
  { id: 'diplomes', label: 'Diplômes métier', icon: GraduationCap, description: 'Vos diplômes et qualifications professionnelles' },
  { id: 'certifications', label: 'Certifications', icon: Award, description: 'Certifications professionnelles et validations' },
  { id: 'formations-pedagogiques', label: 'Formations pédagogiques', icon: BookOpen, description: 'Votre parcours de formateur' },
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase, description: 'Vos réalisations et projets' },
  { id: 'competences', label: 'Compétences techniques', icon: Wrench, description: 'Savoir-faire et expertises' },
  { id: 'methodes-pedagogiques', label: 'Méthodes pédagogiques', icon: Lightbulb, description: 'Votre approche et vos outils d\'enseignement' },
  { id: 'formations-continues', label: 'Formations continues', icon: TrendingUp, description: 'Votre développement professionnel' },
  { id: 'veille', label: 'Veille professionnelle', icon: Eye, description: 'Votre veille sectorielle' }
]

export default function ProfilFormateur() {
  const router = useRouter()
  const [etapeActuelle, setEtapeActuelle] = useState(0)
  const [profil, setProfil] = useState<ProfilFormateur>({
    anneesExperienceMetier: 0,
    anneesExperienceEnseignement: 0,
    tarifHoraire: 0,
    bio: '',
    diplomes: [],
    certifications: [],
    formationsPedagogiques: [],
    portfolio: [],
    competences: [],
    methodesPedagogiques: '',
    approchePedagogique: '',
    outilsSupports: [],
    formationsContinues: [],
    veilleProfessionnelle: []
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

  const sauvegarderProfil = async () => {
    setSauvegarde(true)
    try {
      // TODO: Appel API pour sauvegarder le profil
      // await fetch('/api/formateur/profil', { method: 'PATCH', body: JSON.stringify(profil) })
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
    } finally {
      setSauvegarde(false)
    }
  }

  const suivant = async () => {
    if (etapeActuelle < ETAPES.length - 1) {
      await sauvegarderProfil()
      setEtapeActuelle(etapeActuelle + 1)
    } else {
      // Dernière étape : sauvegarder et rediriger
      await sauvegarderProfil()
      router.push('/formateur/competences')
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
            {etape.id === 'informations-essentielles' && (
              <EtapeInformationsEssentielles profil={profil} setProfil={setProfil} />
            )}
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
            {etape.id === 'methodes-pedagogiques' && (
              <EtapeMethodesPedagogiques profil={profil} setProfil={setProfil} />
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

            {etapeActuelle < ETAPES.length - 1 ? (
              <button
                onClick={suivant}
                disabled={sauvegarde}
                className="px-6 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium flex items-center gap-2 hover:bg-[rgb(var(--accent-light))] transition-all disabled:opacity-50"
              >
                {sauvegarde ? 'Enregistrement...' : 'Suivant'}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={suivant}
                disabled={sauvegarde}
                className="px-6 py-2 bg-[rgb(var(--success))] text-white rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {sauvegarde ? 'Enregistrement...' : 'Terminer et valider'}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// Composants pour chaque étape
function EtapeInformationsEssentielles({ profil, setProfil }: { profil: ProfilFormateur; setProfil: (p: ProfilFormateur) => void }) {
  const handleChange = (field: keyof ProfilFormateur, value: string | number) => {
    setProfil({
      ...profil,
      [field]: value
    })
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="flex items-start gap-3 p-4 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.2)]">
        <User className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[rgb(var(--foreground))] mb-1">
            Informations professionnelles essentielles
          </p>
          <p className="text-[rgb(var(--muted-foreground))]">
            Renseignez vos années d'expérience, votre tarif horaire et une courte présentation professionnelle.
            Ces informations permettent de mieux vous identifier et valoriser votre profil.
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="space-y-6">
        {/* Années d'expérience - Grid 2 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Années d'expérience métier *
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={profil.anneesExperienceMetier || ''}
              onChange={(e) => handleChange('anneesExperienceMetier', parseInt(e.target.value) || 0)}
              placeholder="Ex: 15"
              className="w-full px-4 py-3 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))] text-lg"
              required
            />
            <p className="mt-1.5 text-xs text-[rgb(var(--muted-foreground))]">
              Nombre d'années d'expérience dans votre métier (bijouterie, joaillerie, etc.)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Années d'expérience enseignement *
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={profil.anneesExperienceEnseignement || ''}
              onChange={(e) => handleChange('anneesExperienceEnseignement', parseInt(e.target.value) || 0)}
              placeholder="Ex: 8"
              className="w-full px-4 py-3 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))] text-lg"
              required
            />
            <p className="mt-1.5 text-xs text-[rgb(var(--muted-foreground))]">
              Nombre d'années d'expérience en tant que formateur
            </p>
          </div>
        </div>

        {/* Tarif horaire */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            Tarif horaire *
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={profil.tarifHoraire || ''}
            onChange={(e) => handleChange('tarifHoraire', parseFloat(e.target.value) || 0)}
            placeholder="Ex: 45 (en euros par heure)"
            className="w-full px-4 py-3 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))] text-lg"
            required
          />
          <p className="mt-1.5 text-xs text-[rgb(var(--muted-foreground))]">
            Votre tarif horaire de formateur en euros (hors taxes)
          </p>
        </div>

        {/* Bio / Présentation */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            Bio / Présentation professionnelle *
          </label>
          <textarea
            value={profil.bio || ''}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Présentez-vous en quelques lignes : votre parcours, vos spécialités, votre approche pédagogique..."
            rows={6}
            className="w-full px-4 py-3 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))] resize-none"
            required
          />
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Minimum 100 caractères recommandés
            </p>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              {profil.bio?.length || 0} caractères
            </p>
          </div>
        </div>

        {/* Récapitulatif visuel */}
        {(profil.anneesExperienceMetier > 0 || profil.anneesExperienceEnseignement > 0 || profil.tarifHoraire > 0) && (
          <div className="p-4 bg-[rgba(var(--success),0.05)] border border-[rgba(var(--success),0.2)] rounded-lg">
            <p className="text-sm font-medium text-[rgb(var(--foreground))] mb-3">
              Récapitulatif de votre profil
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profil.anneesExperienceMetier > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-[rgb(var(--accent))]">
                    {profil.anneesExperienceMetier}
                  </div>
                  <div className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                    ans métier
                  </div>
                </div>
              )}
              {profil.anneesExperienceEnseignement > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-[rgb(var(--accent))]">
                    {profil.anneesExperienceEnseignement}
                  </div>
                  <div className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                    ans enseignement
                  </div>
                </div>
              )}
              {profil.tarifHoraire > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-[rgb(var(--accent))]">
                    {profil.tarifHoraire}€
                  </div>
                  <div className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                    tarif horaire
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EtapeDiplomes({ profil, setProfil }: { profil: ProfilFormateur; setProfil: (p: ProfilFormateur) => void }) {
  const [nouveauDiplome, setNouveauDiplome] = useState({
    nomDiplome: '',
    niveau: 'CAP',
    specialite: '',
    organisme: '',
    dateObtention: '',
    documentUrl: ''
  })
  const [modeAjout, setModeAjout] = useState(false)

  const NIVEAUX_DIPLOME = [
    'CAP', 'BMA', 'DMA', 'BTS', 'Licence', 'Master', 'Doctorat', 'Autre'
  ]

  const ajouterDiplome = () => {
    if (nouveauDiplome.nomDiplome && nouveauDiplome.organisme && nouveauDiplome.dateObtention) {
      setProfil({
        ...profil,
        diplomes: [...profil.diplomes, { ...nouveauDiplome, id: Date.now() }]
      })
      setNouveauDiplome({
        nomDiplome: '',
        niveau: 'CAP',
        specialite: '',
        organisme: '',
        dateObtention: '',
        documentUrl: ''
      })
      setModeAjout(false)
    }
  }

  const supprimerDiplome = (id: number) => {
    setProfil({
      ...profil,
      diplomes: profil.diplomes.filter(d => d.id !== id)
    })
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="flex items-start gap-3 p-4 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.2)]">
        <GraduationCap className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[rgb(var(--foreground))] mb-1">
            Diplômes et qualifications professionnelles
          </p>
          <p className="text-[rgb(var(--muted-foreground))]">
            Indicateur 22 : Les formateurs doivent justifier de leurs qualifications professionnelles.
            Listez vos diplômes métier (CAP, BMA, DMA, BTS, etc.)
          </p>
        </div>
      </div>

      {/* Liste des diplômes existants */}
      {profil.diplomes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[rgb(var(--foreground))]">
            Mes diplômes ({profil.diplomes.length})
          </h3>
          {profil.diplomes.map((diplome: any) => (
            <div
              key={diplome.id}
              className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.5)] hover:border-[rgba(var(--accent),0.3)] transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-[rgb(var(--foreground))]">
                      {diplome.nomDiplome}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[rgba(var(--accent),0.2)] text-[rgb(var(--accent))]">
                      {diplome.niveau}
                    </span>
                  </div>
                  {diplome.specialite && (
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                      Spécialité : {diplome.specialite}
                    </p>
                  )}
                  <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                    {diplome.organisme}
                  </p>
                </div>
                <button
                  onClick={() => supprimerDiplome(diplome.id)}
                  className="p-2 hover:bg-[rgba(var(--error),0.1)] rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm">
                <span className="text-[rgb(var(--muted-foreground))]">Obtenu le : </span>
                <span className="text-[rgb(var(--foreground))]">
                  {new Date(diplome.dateObtention).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bouton ajouter ou formulaire */}
      {!modeAjout ? (
        <button
          onClick={() => setModeAjout(true)}
          className="w-full p-4 border-2 border-dashed border-[rgba(var(--border),0.5)] rounded-lg hover:border-[rgba(var(--accent),0.5)] hover:bg-[rgba(var(--accent),0.02)] transition-all flex items-center justify-center gap-2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--accent))]"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Ajouter un diplôme</span>
        </button>
      ) : (
        <div className="p-6 bg-[rgba(var(--accent),0.03)] border border-[rgba(var(--accent),0.2)] rounded-lg space-y-4">
          <h3 className="text-sm font-medium text-[rgb(var(--foreground))] mb-4">
            Nouveau diplôme professionnel
          </h3>

          {/* Nom du diplôme */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Nom du diplôme *
            </label>
            <input
              type="text"
              value={nouveauDiplome.nomDiplome}
              onChange={(e) => setNouveauDiplome({ ...nouveauDiplome, nomDiplome: e.target.value })}
              placeholder="Ex: CAP Art du Bijou et du Joyau"
              className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              required
            />
          </div>

          {/* Niveau et Spécialité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Niveau *
              </label>
              <select
                value={nouveauDiplome.niveau}
                onChange={(e) => setNouveauDiplome({ ...nouveauDiplome, niveau: e.target.value })}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
                required
              >
                {NIVEAUX_DIPLOME.map(niveau => (
                  <option key={niveau} value={niveau}>{niveau}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Spécialité (optionnel)
              </label>
              <input
                type="text"
                value={nouveauDiplome.specialite}
                onChange={(e) => setNouveauDiplome({ ...nouveauDiplome, specialite: e.target.value })}
                placeholder="Ex: Bijouterie-Joaillerie"
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              />
            </div>
          </div>

          {/* Organisme */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Organisme délivrant *
            </label>
            <input
              type="text"
              value={nouveauDiplome.organisme}
              onChange={(e) => setNouveauDiplome({ ...nouveauDiplome, organisme: e.target.value })}
              placeholder="Ex: Éducation Nationale, CMA, École Boulle..."
              className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              required
            />
          </div>

          {/* Date d'obtention */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Date d'obtention *
            </label>
            <input
              type="date"
              value={nouveauDiplome.dateObtention}
              onChange={(e) => setNouveauDiplome({ ...nouveauDiplome, dateObtention: e.target.value })}
              className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              required
            />
          </div>

          {/* Justificatif */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Justificatif (PDF, JPG, PNG - max 5 Mo)
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      alert('Le fichier ne doit pas dépasser 5 Mo')
                      e.target.value = ''
                      return
                    }
                    // TODO: Upload vers S3 et récupérer l'URL
                    // Pour l'instant on stocke juste le nom du fichier localement
                    setNouveauDiplome({ ...nouveauDiplome, documentUrl: file.name })
                  }
                }}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[rgba(var(--accent),0.1)] file:text-[rgb(var(--accent))] hover:file:bg-[rgba(var(--accent),0.2)] cursor-pointer"
              />
              {nouveauDiplome.documentUrl && (
                <div className="flex items-center gap-2 p-2 bg-[rgba(var(--success),0.1)] rounded-lg border border-[rgba(var(--success),0.3)]">
                  <FileText className="w-4 h-4 text-[rgb(var(--success))]" />
                  <span className="text-sm text-[rgb(var(--success))] flex-1">{nouveauDiplome.documentUrl}</span>
                  <button
                    onClick={() => setNouveauDiplome({ ...nouveauDiplome, documentUrl: '' })}
                    className="p-1 hover:bg-[rgba(var(--error),0.1)] rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message si aucun diplôme */}
      {profil.diplomes.length === 0 && !modeAjout && (
        <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Aucun diplôme enregistré</p>
          <p className="text-xs mt-1">Cliquez sur "Ajouter un diplôme" pour commencer</p>
        </div>
      )}
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
              Justificatif (PDF, JPG, PNG - max 5 Mo)
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      alert('Le fichier ne doit pas dépasser 5 Mo')
                      e.target.value = ''
                      return
                    }
                    // TODO: Upload vers S3 et récupérer l'URL
                    // Pour l'instant on stocke juste le nom du fichier localement
                    setNouvelleCertif({ ...nouvelleCertif, documentUrl: file.name })
                  }
                }}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[rgba(var(--accent),0.1)] file:text-[rgb(var(--accent))] hover:file:bg-[rgba(var(--accent),0.2)] cursor-pointer"
              />
              {nouvelleCertif.documentUrl && (
                <div className="flex items-center gap-2 p-2 bg-[rgba(var(--success),0.1)] rounded-lg border border-[rgba(var(--success),0.3)]">
                  <FileText className="w-4 h-4 text-[rgb(var(--success))]" />
                  <span className="text-sm text-[rgb(var(--success))] flex-1">{nouvelleCertif.documentUrl}</span>
                  <button
                    onClick={() => setNouvelleCertif({ ...nouvelleCertif, documentUrl: '' })}
                    className="p-1 hover:bg-[rgba(var(--error),0.1)] rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))]" />
                  </button>
                </div>
              )}
            </div>
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
  const [nouvelleFormation, setNouvelleFormation] = useState({
    intitule: '',
    organisme: '',
    dateDebut: '',
    dateFin: '',
    dureeHeures: '',
    domaine: 'Pédagogie',
    documentUrl: ''
  })
  const [modeAjout, setModeAjout] = useState(false)

  const DOMAINES_FORMATION = [
    'Pédagogie',
    'Ingénierie de formation',
    'Évaluation',
    'Accompagnement',
    'Digital learning',
    'Gestion de groupe',
    'Autre'
  ]

  const ajouterFormation = () => {
    if (nouvelleFormation.intitule && nouvelleFormation.organisme && nouvelleFormation.dateDebut) {
      setProfil({
        ...profil,
        formationsPedagogiques: [...profil.formationsPedagogiques, { ...nouvelleFormation, id: Date.now() }]
      })
      setNouvelleFormation({
        intitule: '',
        organisme: '',
        dateDebut: '',
        dateFin: '',
        dureeHeures: '',
        domaine: 'Pédagogie',
        documentUrl: ''
      })
      setModeAjout(false)
    }
  }

  const supprimerFormation = (id: number) => {
    setProfil({
      ...profil,
      formationsPedagogiques: profil.formationsPedagogiques.filter(f => f.id !== id)
    })
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="flex items-start gap-3 p-4 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.2)]">
        <BookOpen className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[rgb(var(--foreground))] mb-1">
            Formations de formateur et compétences pédagogiques
          </p>
          <p className="text-[rgb(var(--muted-foreground))]">
            Indicateur 22 : Justifier des compétences pédagogiques acquises (formation initiale de formateur, formations continues en pédagogie).
          </p>
        </div>
      </div>

      {/* Liste des formations existantes */}
      {profil.formationsPedagogiques.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[rgb(var(--foreground))]">
            Mes formations pédagogiques ({profil.formationsPedagogiques.length})
          </h3>
          {profil.formationsPedagogiques.map((formation: any) => (
            <div
              key={formation.id}
              className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.5)] hover:border-[rgba(var(--accent),0.3)] transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-[rgb(var(--foreground))]">
                      {formation.intitule}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[rgba(var(--accent),0.2)] text-[rgb(var(--accent))]">
                      {formation.domaine}
                    </span>
                  </div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                    {formation.organisme}
                  </p>
                </div>
                <button
                  onClick={() => supprimerFormation(formation.id)}
                  className="p-2 hover:bg-[rgba(var(--error),0.1)] rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[rgb(var(--muted-foreground))]">Période : </span>
                  <span className="text-[rgb(var(--foreground))]">
                    {new Date(formation.dateDebut).toLocaleDateString('fr-FR')}
                    {formation.dateFin && ` - ${new Date(formation.dateFin).toLocaleDateString('fr-FR')}`}
                  </span>
                </div>
                {formation.dureeHeures && (
                  <div>
                    <span className="text-[rgb(var(--muted-foreground))]">Durée : </span>
                    <span className="text-[rgb(var(--foreground))]">
                      {formation.dureeHeures}h
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bouton ajouter ou formulaire */}
      {!modeAjout ? (
        <button
          onClick={() => setModeAjout(true)}
          className="w-full p-4 border-2 border-dashed border-[rgba(var(--border),0.5)] rounded-lg hover:border-[rgba(var(--accent),0.5)] hover:bg-[rgba(var(--accent),0.02)] transition-all flex items-center justify-center gap-2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--accent))]"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Ajouter une formation pédagogique</span>
        </button>
      ) : (
        <div className="p-6 bg-[rgba(var(--accent),0.03)] border border-[rgba(var(--accent),0.2)] rounded-lg space-y-4">
          <h3 className="text-sm font-medium text-[rgb(var(--foreground))] mb-4">
            Nouvelle formation pédagogique
          </h3>

          {/* Intitulé */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Intitulé de la formation *
            </label>
            <input
              type="text"
              value={nouvelleFormation.intitule}
              onChange={(e) => setNouvelleFormation({ ...nouvelleFormation, intitule: e.target.value })}
              placeholder="Ex: Formation de formateur niveau 2"
              className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              required
            />
          </div>

          {/* Domaine et Organisme */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Domaine *
              </label>
              <select
                value={nouvelleFormation.domaine}
                onChange={(e) => setNouvelleFormation({ ...nouvelleFormation, domaine: e.target.value })}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
                required
              >
                {DOMAINES_FORMATION.map(domaine => (
                  <option key={domaine} value={domaine}>{domaine}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Organisme *
              </label>
              <input
                type="text"
                value={nouvelleFormation.organisme}
                onChange={(e) => setNouvelleFormation({ ...nouvelleFormation, organisme: e.target.value })}
                placeholder="Ex: AFPA, CCI..."
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
                required
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Date de début *
              </label>
              <input
                type="date"
                value={nouvelleFormation.dateDebut}
                onChange={(e) => setNouvelleFormation({ ...nouvelleFormation, dateDebut: e.target.value })}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Date de fin (optionnel)
              </label>
              <input
                type="date"
                value={nouvelleFormation.dateFin}
                onChange={(e) => setNouvelleFormation({ ...nouvelleFormation, dateFin: e.target.value })}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              />
            </div>
          </div>

          {/* Durée en heures */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Durée en heures (optionnel)
            </label>
            <input
              type="number"
              value={nouvelleFormation.dureeHeures}
              onChange={(e) => setNouvelleFormation({ ...nouvelleFormation, dureeHeures: e.target.value })}
              placeholder="Ex: 35"
              className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
            />
          </div>

          {/* Justificatif */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Justificatif (PDF, JPG, PNG - max 5 Mo)
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      alert('Le fichier ne doit pas dépasser 5 Mo')
                      e.target.value = ''
                      return
                    }
                    // TODO: Upload vers S3 et récupérer l'URL
                    // Pour l'instant on stocke juste le nom du fichier localement
                    setNouvelleFormation({ ...nouvelleFormation, documentUrl: file.name })
                  }
                }}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[rgba(var(--accent),0.1)] file:text-[rgb(var(--accent))] hover:file:bg-[rgba(var(--accent),0.2)] cursor-pointer"
              />
              {nouvelleFormation.documentUrl && (
                <div className="flex items-center gap-2 p-2 bg-[rgba(var(--success),0.1)] rounded-lg border border-[rgba(var(--success),0.3)]">
                  <FileText className="w-4 h-4 text-[rgb(var(--success))]" />
                  <span className="text-sm text-[rgb(var(--success))] flex-1">{nouvelleFormation.documentUrl}</span>
                  <button
                    onClick={() => setNouvelleFormation({ ...nouvelleFormation, documentUrl: '' })}
                    className="p-1 hover:bg-[rgba(var(--error),0.1)] rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message si aucune formation */}
      {profil.formationsPedagogiques.length === 0 && !modeAjout && (
        <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Aucune formation pédagogique enregistrée</p>
          <p className="text-xs mt-1">Cliquez sur "Ajouter une formation pédagogique" pour commencer</p>
        </div>
      )}
    </div>
  )
}

function EtapePortfolio({ profil, setProfil }: { profil: ProfilFormateur; setProfil: (p: ProfilFormateur) => void }) {
  const [nouveauProjet, setNouveauProjet] = useState({
    titre: '',
    description: '',
    annee: new Date().getFullYear().toString(),
    client: '',
    type: 'Réalisation',
    imageUrl: ''
  })
  const [modeAjout, setModeAjout] = useState(false)

  const TYPES_PROJET = [
    'Réalisation',
    'Projet pédagogique',
    'Publication',
    'Intervention',
    'Collaboration',
    'Autre'
  ]

  const ajouterProjet = () => {
    if (nouveauProjet.titre && nouveauProjet.description) {
      setProfil({
        ...profil,
        portfolio: [...profil.portfolio, { ...nouveauProjet, id: Date.now() }]
      })
      setNouveauProjet({
        titre: '',
        description: '',
        annee: new Date().getFullYear().toString(),
        client: '',
        type: 'Réalisation',
        imageUrl: ''
      })
      setModeAjout(false)
    }
  }

  const supprimerProjet = (id: number) => {
    setProfil({
      ...profil,
      portfolio: profil.portfolio.filter(p => p.id !== id)
    })
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="flex items-start gap-3 p-4 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.2)]">
        <Briefcase className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[rgb(var(--foreground))] mb-1">
            Portfolio et réalisations professionnelles
          </p>
          <p className="text-[rgb(var(--muted-foreground))]">
            Valorisez vos réalisations marquantes, projets pédagogiques, publications et collaborations.
            Cela renforce votre crédibilité professionnelle.
          </p>
        </div>
      </div>

      {/* Liste des projets existants */}
      {profil.portfolio.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[rgb(var(--foreground))]">
            Mon portfolio ({profil.portfolio.length})
          </h3>
          {profil.portfolio.map((projet: any) => (
            <div
              key={projet.id}
              className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.5)] hover:border-[rgba(var(--accent),0.3)] transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-[rgb(var(--foreground))]">
                      {projet.titre}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[rgba(var(--accent),0.2)] text-[rgb(var(--accent))]">
                      {projet.type}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[rgba(var(--success),0.2)] text-[rgb(var(--success))]">
                      {projet.annee}
                    </span>
                  </div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))] mt-2">
                    {projet.description}
                  </p>
                  {projet.client && (
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                      Client : {projet.client}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => supprimerProjet(projet.id)}
                  className="p-2 hover:bg-[rgba(var(--error),0.1)] rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bouton ajouter ou formulaire */}
      {!modeAjout ? (
        <button
          onClick={() => setModeAjout(true)}
          className="w-full p-4 border-2 border-dashed border-[rgba(var(--border),0.5)] rounded-lg hover:border-[rgba(var(--accent),0.5)] hover:bg-[rgba(var(--accent),0.02)] transition-all flex items-center justify-center gap-2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--accent))]"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Ajouter un projet</span>
        </button>
      ) : (
        <div className="p-6 bg-[rgba(var(--accent),0.03)] border border-[rgba(var(--accent),0.2)] rounded-lg space-y-4">
          <h3 className="text-sm font-medium text-[rgb(var(--foreground))] mb-4">
            Nouveau projet / réalisation
          </h3>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Titre du projet *
            </label>
            <input
              type="text"
              value={nouveauProjet.titre}
              onChange={(e) => setNouveauProjet({ ...nouveauProjet, titre: e.target.value })}
              placeholder="Ex: Bague haute joaillerie serti invisible"
              className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Description *
            </label>
            <textarea
              value={nouveauProjet.description}
              onChange={(e) => setNouveauProjet({ ...nouveauProjet, description: e.target.value })}
              placeholder="Décrivez votre réalisation, les techniques utilisées, le contexte..."
              rows={3}
              className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))] resize-none"
              required
            />
          </div>

          {/* Type, Année et Client */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Type *
              </label>
              <select
                value={nouveauProjet.type}
                onChange={(e) => setNouveauProjet({ ...nouveauProjet, type: e.target.value })}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
                required
              >
                {TYPES_PROJET.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Année *
              </label>
              <input
                type="number"
                value={nouveauProjet.annee}
                onChange={(e) => setNouveauProjet({ ...nouveauProjet, annee: e.target.value })}
                min="1950"
                max={new Date().getFullYear()}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Client (optionnel)
              </label>
              <input
                type="text"
                value={nouveauProjet.client}
                onChange={(e) => setNouveauProjet({ ...nouveauProjet, client: e.target.value })}
                placeholder="Ex: Cartier"
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Image du projet (PDF, JPG, PNG - max 5 Mo)
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      alert('Le fichier ne doit pas dépasser 5 Mo')
                      e.target.value = ''
                      return
                    }
                    // TODO: Upload vers S3 et récupérer l'URL
                    // Pour l'instant on stocke juste le nom du fichier localement
                    setNouveauProjet({ ...nouveauProjet, imageUrl: file.name })
                  }
                }}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[rgba(var(--accent),0.1)] file:text-[rgb(var(--accent))] hover:file:bg-[rgba(var(--accent),0.2)] cursor-pointer"
              />
              {nouveauProjet.imageUrl && (
                <div className="flex items-center gap-2 p-2 bg-[rgba(var(--success),0.1)] rounded-lg border border-[rgba(var(--success),0.3)]">
                  <FileText className="w-4 h-4 text-[rgb(var(--success))]" />
                  <span className="text-sm text-[rgb(var(--success))] flex-1">{nouveauProjet.imageUrl}</span>
                  <button
                    onClick={() => setNouveauProjet({ ...nouveauProjet, imageUrl: '' })}
                    className="p-1 hover:bg-[rgba(var(--error),0.1)] rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message si aucun projet */}
      {profil.portfolio.length === 0 && !modeAjout && (
        <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
          <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Aucune réalisation dans votre portfolio</p>
          <p className="text-xs mt-1">Cliquez sur "Ajouter un projet" pour commencer</p>
        </div>
      )}
    </div>
  )
}

function EtapeCompetences({ profil, setProfil }: { profil: ProfilFormateur; setProfil: (p: ProfilFormateur) => void }) {
  const [nouvelleCompetence, setNouvelleCompetence] = useState({
    domaine: '',
    competence: '',
    niveau: 'Intermédiaire',
    anneesExperience: '',
    documentUrl: ''
  })
  const [modeAjout, setModeAjout] = useState(false)

  const NIVEAUX_COMPETENCE = [
    'Débutant',
    'Intermédiaire',
    'Avancé',
    'Expert'
  ]

  const DOMAINES_JOAILLERIE = [
    'Sertissage',
    'Polissage',
    'Maquette',
    'CAO/DAO',
    'Taille de pierre',
    'Émaillage',
    'Gravure',
    'Fonte',
    'Alliages',
    'Gemmologie',
    'Autre'
  ]

  const ajouterCompetence = () => {
    if (nouvelleCompetence.domaine && nouvelleCompetence.competence) {
      setProfil({
        ...profil,
        competences: [...profil.competences, { ...nouvelleCompetence, id: Date.now() }]
      })
      setNouvelleCompetence({
        domaine: '',
        competence: '',
        niveau: 'Intermédiaire',
        anneesExperience: ''
      })
      setModeAjout(false)
    }
  }

  const supprimerCompetence = (id: number) => {
    setProfil({
      ...profil,
      competences: profil.competences.filter(c => c.id !== id)
    })
  }

  const getNiveauColor = (niveau: string) => {
    switch (niveau) {
      case 'Expert': return 'bg-[rgba(var(--success),0.2)] text-[rgb(var(--success))]'
      case 'Avancé': return 'bg-[rgba(var(--accent),0.2)] text-[rgb(var(--accent))]'
      case 'Intermédiaire': return 'bg-[rgba(var(--warning),0.2)] text-[rgb(var(--warning))]'
      default: return 'bg-[rgba(var(--muted-foreground),0.2)] text-[rgb(var(--muted-foreground))]'
    }
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="flex items-start gap-3 p-4 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.2)]">
        <Wrench className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[rgb(var(--foreground))] mb-1">
            Compétences techniques et savoir-faire
          </p>
          <p className="text-[rgb(var(--muted-foreground))]">
            Détaillez vos compétences techniques spécifiques en bijouterie-joaillerie.
            Précisez votre niveau de maîtrise pour chaque compétence.
          </p>
        </div>
      </div>

      {/* Liste des compétences existantes */}
      {profil.competences.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[rgb(var(--foreground))]">
            Mes compétences ({profil.competences.length})
          </h3>
          {profil.competences.map((comp: any) => (
            <div
              key={comp.id}
              className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.5)] hover:border-[rgba(var(--accent),0.3)] transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-[rgb(var(--foreground))]">
                      {comp.competence}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[rgba(var(--accent),0.2)] text-[rgb(var(--accent))]">
                      {comp.domaine}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getNiveauColor(comp.niveau)}`}>
                      {comp.niveau}
                    </span>
                    {comp.anneesExperience && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-[rgba(var(--success),0.2)] text-[rgb(var(--success))]">
                        {comp.anneesExperience} ans d'exp.
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => supprimerCompetence(comp.id)}
                  className="p-2 hover:bg-[rgba(var(--error),0.1)] rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bouton ajouter ou formulaire */}
      {!modeAjout ? (
        <button
          onClick={() => setModeAjout(true)}
          className="w-full p-4 border-2 border-dashed border-[rgba(var(--border),0.5)] rounded-lg hover:border-[rgba(var(--accent),0.5)] hover:bg-[rgba(var(--accent),0.02)] transition-all flex items-center justify-center gap-2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--accent))]"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Ajouter une compétence</span>
        </button>
      ) : (
        <div className="p-6 bg-[rgba(var(--accent),0.03)] border border-[rgba(var(--accent),0.2)] rounded-lg space-y-4">
          <h3 className="text-sm font-medium text-[rgb(var(--foreground))] mb-4">
            Nouvelle compétence technique
          </h3>

          {/* Domaine */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Domaine *
            </label>
            <select
              value={nouvelleCompetence.domaine}
              onChange={(e) => setNouvelleCompetence({ ...nouvelleCompetence, domaine: e.target.value })}
              className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              required
            >
              <option value="">Sélectionnez un domaine</option>
              {DOMAINES_JOAILLERIE.map(domaine => (
                <option key={domaine} value={domaine}>{domaine}</option>
              ))}
            </select>
          </div>

          {/* Compétence */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Compétence spécifique *
            </label>
            <input
              type="text"
              value={nouvelleCompetence.competence}
              onChange={(e) => setNouvelleCompetence({ ...nouvelleCompetence, competence: e.target.value })}
              placeholder="Ex: Serti griffe 4 griffes, Polissage miroir..."
              className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              required
            />
          </div>

          {/* Niveau et Années d'expérience */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Niveau de maîtrise *
              </label>
              <select
                value={nouvelleCompetence.niveau}
                onChange={(e) => setNouvelleCompetence({ ...nouvelleCompetence, niveau: e.target.value })}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
                required
              >
                {NIVEAUX_COMPETENCE.map(niveau => (
                  <option key={niveau} value={niveau}>{niveau}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Années d'expérience (optionnel)
              </label>
              <input
                type="number"
                value={nouvelleCompetence.anneesExperience}
                onChange={(e) => setNouvelleCompetence({ ...nouvelleCompetence, anneesExperience: e.target.value })}
                placeholder="Ex: 5"
                min="0"
                max="60"
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              />
            </div>
          </div>

          {/* Justificatif */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Justificatif (PDF, JPG, PNG - max 5 Mo)
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      alert('Le fichier ne doit pas dépasser 5 Mo')
                      e.target.value = ''
                      return
                    }
                    // TODO: Upload vers S3 et récupérer l'URL
                    // Pour l'instant on stocke juste le nom du fichier localement
                    setNouvelleCompetence({ ...nouvelleCompetence, documentUrl: file.name })
                  }
                }}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[rgba(var(--accent),0.1)] file:text-[rgb(var(--accent))] hover:file:bg-[rgba(var(--accent),0.2)] cursor-pointer"
              />
              {nouvelleCompetence.documentUrl && (
                <div className="flex items-center gap-2 p-2 bg-[rgba(var(--success),0.1)] rounded-lg border border-[rgba(var(--success),0.3)]">
                  <FileText className="w-4 h-4 text-[rgb(var(--success))]" />
                  <span className="text-sm text-[rgb(var(--success))] flex-1">{nouvelleCompetence.documentUrl}</span>
                  <button
                    onClick={() => setNouvelleCompetence({ ...nouvelleCompetence, documentUrl: '' })}
                    className="p-1 hover:bg-[rgba(var(--error),0.1)] rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message si aucune compétence */}
      {profil.competences.length === 0 && !modeAjout && (
        <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
          <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Aucune compétence technique enregistrée</p>
          <p className="text-xs mt-1">Cliquez sur "Ajouter une compétence" pour commencer</p>
        </div>
      )}
    </div>
  )
}

function EtapeMethodesPedagogiques({ profil, setProfil }: { profil: ProfilFormateur; setProfil: (p: ProfilFormateur) => void }) {
  const [nouvelOutil, setNouvelOutil] = useState('')
  const [documentMethodes, setDocumentMethodes] = useState('')

  const OUTILS_PEDAGOGIQUES_SUGGESTIONS = [
    'Supports visuels (diaporamas, vidéos)',
    'Démonstrations pratiques en direct',
    'Exercices guidés progressifs',
    'Mises en situation professionnelle',
    'Évaluation formative continue',
    'Retours individualisés',
    'Documentation technique illustrée',
    'Outils numériques interactifs',
    'Travail collaboratif en binômes',
    'Portfolio de réalisations'
  ]

  const ajouterOutil = () => {
    if (nouvelOutil.trim() && !profil.outilsSupports.includes(nouvelOutil.trim())) {
      setProfil({
        ...profil,
        outilsSupports: [...profil.outilsSupports, nouvelOutil.trim()]
      })
      setNouvelOutil('')
    }
  }

  const supprimerOutil = (outil: string) => {
    setProfil({
      ...profil,
      outilsSupports: profil.outilsSupports.filter(o => o !== outil)
    })
  }

  const handleChange = (field: keyof ProfilFormateur, value: any) => {
    setProfil({ ...profil, [field]: value })
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="flex items-start gap-3 p-4 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.2)]">
        <Lightbulb className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[rgb(var(--foreground))] mb-1">
            Méthodes et approche pédagogique
          </p>
          <p className="text-[rgb(var(--muted-foreground))]">
            Décrivez votre façon d'enseigner, vos méthodes pédagogiques et les outils que vous utilisez pour favoriser l'apprentissage.
          </p>
        </div>
      </div>

      {/* Méthodes pédagogiques */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          Vos méthodes pédagogiques *
        </label>
        <textarea
          value={profil.methodesPedagogiques}
          onChange={(e) => handleChange('methodesPedagogiques', e.target.value)}
          placeholder="Ex: Apprentissage par la pratique, alternance théorie/démonstration/exercices, pédagogie active et participative..."
          rows={4}
          className="w-full px-4 py-3 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))] resize-none"
          required
        />
        <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
          Comment structurez-vous vos sessions de formation ? Quelle est votre démarche pédagogique ?
        </p>
      </div>

      {/* Approche pédagogique */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          Votre approche pédagogique *
        </label>
        <textarea
          value={profil.approchePedagogique}
          onChange={(e) => handleChange('approchePedagogique', e.target.value)}
          placeholder="Ex: Approche individualisée selon le niveau, bienveillance et encouragement, valorisation des réussites, adaptation du rythme..."
          rows={4}
          className="w-full px-4 py-3 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))] resize-none"
          required
        />
        <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
          Comment accompagnez-vous vos apprenants ? Quelle relation pédagogique établissez-vous ?
        </p>
      </div>

      {/* Outils et supports */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          Outils et supports pédagogiques utilisés
        </label>

        {/* Liste des outils ajoutés */}
        {profil.outilsSupports.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {profil.outilsSupports.map((outil, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(var(--accent),0.1)] border border-[rgba(var(--accent),0.3)] rounded-lg text-sm"
              >
                <span className="text-[rgb(var(--foreground))]">{outil}</span>
                <button
                  onClick={() => supprimerOutil(outil)}
                  className="p-0.5 hover:bg-[rgba(var(--error),0.1)] rounded text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Ajout d'outil */}
        <div className="flex gap-2">
          <input
            type="text"
            value={nouvelOutil}
            onChange={(e) => setNouvelOutil(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), ajouterOutil())}
            placeholder="Ex: Démonstrations pratiques en direct"
            className="flex-1 px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
          />
          <button
            onClick={ajouterOutil}
            className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        {/* Suggestions */}
        <div className="mt-3">
          <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2">
            💡 Suggestions d'outils pédagogiques :
          </p>
          <div className="flex flex-wrap gap-2">
            {OUTILS_PEDAGOGIQUES_SUGGESTIONS
              .filter(suggestion => !profil.outilsSupports.includes(suggestion))
              .slice(0, 6)
              .map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setProfil({
                      ...profil,
                      outilsSupports: [...profil.outilsSupports, suggestion]
                    })
                  }}
                  className="px-3 py-1.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-xs text-[rgb(var(--foreground))] hover:border-[rgba(var(--accent),0.5)] hover:bg-[rgba(var(--accent),0.05)] transition-all"
                >
                  + {suggestion}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Justificatif */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          Justificatif (PDF, JPG, PNG - max 5 Mo)
        </label>
        <div className="space-y-2">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                if (file.size > 5 * 1024 * 1024) {
                  alert('Le fichier ne doit pas dépasser 5 Mo')
                  e.target.value = ''
                  return
                }
                // TODO: Upload vers S3 et récupérer l'URL
                // Pour l'instant on stocke juste le nom du fichier localement
                setDocumentMethodes(file.name)
              }
            }}
            className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[rgba(var(--accent),0.1)] file:text-[rgb(var(--accent))] hover:file:bg-[rgba(var(--accent),0.2)] cursor-pointer"
          />
          {documentMethodes && (
            <div className="flex items-center gap-2 p-2 bg-[rgba(var(--success),0.1)] rounded-lg border border-[rgba(var(--success),0.3)]">
              <FileText className="w-4 h-4 text-[rgb(var(--success))]" />
              <span className="text-sm text-[rgb(var(--success))] flex-1">{documentMethodes}</span>
              <button
                onClick={() => setDocumentMethodes('')}
                className="p-1 hover:bg-[rgba(var(--error),0.1)] rounded transition-colors"
              >
                <X className="w-3 h-3 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))]" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Récapitulatif */}
      {(profil.methodesPedagogiques || profil.approchePedagogique || profil.outilsSupports.length > 0) && (
        <div className="p-4 bg-[rgba(var(--success),0.05)] border border-[rgba(var(--success),0.2)] rounded-lg">
          <p className="text-sm font-medium text-[rgb(var(--success))] mb-2">
            ✓ Récapitulatif de votre approche pédagogique
          </p>
          <div className="space-y-2 text-sm text-[rgb(var(--foreground))]">
            {profil.methodesPedagogiques && (
              <div>
                <span className="font-medium">Méthodes : </span>
                <span className="text-[rgb(var(--muted-foreground))]">
                  {profil.methodesPedagogiques.slice(0, 100)}
                  {profil.methodesPedagogiques.length > 100 && '...'}
                </span>
              </div>
            )}
            {profil.approchePedagogique && (
              <div>
                <span className="font-medium">Approche : </span>
                <span className="text-[rgb(var(--muted-foreground))]">
                  {profil.approchePedagogique.slice(0, 100)}
                  {profil.approchePedagogique.length > 100 && '...'}
                </span>
              </div>
            )}
            {profil.outilsSupports.length > 0 && (
              <div>
                <span className="font-medium">Outils : </span>
                <span className="text-[rgb(var(--muted-foreground))]">
                  {profil.outilsSupports.length} outil{profil.outilsSupports.length > 1 ? 's' : ''} pédagogique{profil.outilsSupports.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function EtapeFormationsContinues({ profil, setProfil }: { profil: ProfilFormateur; setProfil: (p: ProfilFormateur) => void }) {
  const [nouvelleFormation, setNouvelleFormation] = useState({
    intitule: '',
    organisme: '',
    dateDebut: '',
    dateFin: '',
    dureeHeures: '',
    domaine: 'Technique métier',
    statut: 'TERMINE',
    documentUrl: ''
  })
  const [modeAjout, setModeAjout] = useState(false)

  const DOMAINES_FORMATION_CONTINUE = [
    'Technique métier',
    'Nouvelles technologies',
    'Réglementation',
    'Sécurité',
    'Développement commercial',
    'Management',
    'Transition écologique',
    'Autre'
  ]

  const STATUTS_FORMATION = [
    { value: 'TERMINE', label: 'Terminée', color: 'success' },
    { value: 'EN_COURS', label: 'En cours', color: 'warning' },
    { value: 'PLANIFIE', label: 'Planifiée', color: 'accent' }
  ]

  const ajouterFormationContinue = () => {
    if (nouvelleFormation.intitule && nouvelleFormation.organisme && nouvelleFormation.dateDebut) {
      setProfil({
        ...profil,
        formationsContinues: [...profil.formationsContinues, { ...nouvelleFormation, id: Date.now() }]
      })
      setNouvelleFormation({
        intitule: '',
        organisme: '',
        dateDebut: '',
        dateFin: '',
        dureeHeures: '',
        domaine: 'Technique métier',
        statut: 'TERMINE',
        documentUrl: ''
      })
      setModeAjout(false)
    }
  }

  const supprimerFormationContinue = (id: number) => {
    setProfil({
      ...profil,
      formationsContinues: profil.formationsContinues.filter(f => f.id !== id)
    })
  }

  const getStatutColor = (statut: string) => {
    const statutObj = STATUTS_FORMATION.find(s => s.value === statut)
    switch (statutObj?.color) {
      case 'success': return 'bg-[rgba(var(--success),0.2)] text-[rgb(var(--success))]'
      case 'warning': return 'bg-[rgba(var(--warning),0.2)] text-[rgb(var(--warning))]'
      case 'accent': return 'bg-[rgba(var(--accent),0.2)] text-[rgb(var(--accent))]'
      default: return 'bg-[rgba(var(--muted-foreground),0.2)] text-[rgb(var(--muted-foreground))]'
    }
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="flex items-start gap-3 p-4 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.2)]">
        <TrendingUp className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[rgb(var(--foreground))] mb-1">
            Formations continues et développement professionnel
          </p>
          <p className="text-[rgb(var(--muted-foreground))]">
            Indicateur 22 : Les formateurs doivent justifier de leur maintien et développement des compétences.
            Listez vos formations continues récentes (recommandé : au moins une par an).
          </p>
        </div>
      </div>

      {/* Liste des formations continues existantes */}
      {profil.formationsContinues.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[rgb(var(--foreground))]">
            Mes formations continues ({profil.formationsContinues.length})
          </h3>
          {profil.formationsContinues.map((formation: any) => (
            <div
              key={formation.id}
              className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.5)] hover:border-[rgba(var(--accent),0.3)] transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-[rgb(var(--foreground))]">
                      {formation.intitule}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[rgba(var(--accent),0.2)] text-[rgb(var(--accent))]">
                      {formation.domaine}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatutColor(formation.statut)}`}>
                      {STATUTS_FORMATION.find(s => s.value === formation.statut)?.label}
                    </span>
                  </div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                    {formation.organisme}
                  </p>
                </div>
                <button
                  onClick={() => supprimerFormationContinue(formation.id)}
                  className="p-2 hover:bg-[rgba(var(--error),0.1)] rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[rgb(var(--muted-foreground))]">Période : </span>
                  <span className="text-[rgb(var(--foreground))]">
                    {new Date(formation.dateDebut).toLocaleDateString('fr-FR')}
                    {formation.dateFin && ` - ${new Date(formation.dateFin).toLocaleDateString('fr-FR')}`}
                  </span>
                </div>
                {formation.dureeHeures && (
                  <div>
                    <span className="text-[rgb(var(--muted-foreground))]">Durée : </span>
                    <span className="text-[rgb(var(--foreground))]">
                      {formation.dureeHeures}h
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bouton ajouter ou formulaire */}
      {!modeAjout ? (
        <button
          onClick={() => setModeAjout(true)}
          className="w-full p-4 border-2 border-dashed border-[rgba(var(--border),0.5)] rounded-lg hover:border-[rgba(var(--accent),0.5)] hover:bg-[rgba(var(--accent),0.02)] transition-all flex items-center justify-center gap-2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--accent))]"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Ajouter une formation continue</span>
        </button>
      ) : (
        <div className="p-6 bg-[rgba(var(--accent),0.03)] border border-[rgba(var(--accent),0.2)] rounded-lg space-y-4">
          <h3 className="text-sm font-medium text-[rgb(var(--foreground))] mb-4">
            Nouvelle formation continue
          </h3>

          {/* Intitulé */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Intitulé de la formation *
            </label>
            <input
              type="text"
              value={nouvelleFormation.intitule}
              onChange={(e) => setNouvelleFormation({ ...nouvelleFormation, intitule: e.target.value })}
              placeholder="Ex: Nouvelles techniques de sertissage laser"
              className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              required
            />
          </div>

          {/* Domaine et Organisme */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Domaine *
              </label>
              <select
                value={nouvelleFormation.domaine}
                onChange={(e) => setNouvelleFormation({ ...nouvelleFormation, domaine: e.target.value })}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
                required
              >
                {DOMAINES_FORMATION_CONTINUE.map(domaine => (
                  <option key={domaine} value={domaine}>{domaine}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Organisme *
              </label>
              <input
                type="text"
                value={nouvelleFormation.organisme}
                onChange={(e) => setNouvelleFormation({ ...nouvelleFormation, organisme: e.target.value })}
                placeholder="Ex: École Boulle, AFPA..."
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
                required
              />
            </div>
          </div>

          {/* Dates et Statut */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Date de début *
              </label>
              <input
                type="date"
                value={nouvelleFormation.dateDebut}
                onChange={(e) => setNouvelleFormation({ ...nouvelleFormation, dateDebut: e.target.value })}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Date de fin (optionnel)
              </label>
              <input
                type="date"
                value={nouvelleFormation.dateFin}
                onChange={(e) => setNouvelleFormation({ ...nouvelleFormation, dateFin: e.target.value })}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Statut *
              </label>
              <select
                value={nouvelleFormation.statut}
                onChange={(e) => setNouvelleFormation({ ...nouvelleFormation, statut: e.target.value })}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
                required
              >
                {STATUTS_FORMATION.map(statut => (
                  <option key={statut.value} value={statut.value}>{statut.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Durée en heures */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Durée en heures (optionnel)
            </label>
            <input
              type="number"
              value={nouvelleFormation.dureeHeures}
              onChange={(e) => setNouvelleFormation({ ...nouvelleFormation, dureeHeures: e.target.value })}
              placeholder="Ex: 21"
              min="0"
              className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
            />
          </div>

          {/* Justificatif */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Justificatif (PDF, JPG, PNG - max 5 Mo)
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      alert('Le fichier ne doit pas dépasser 5 Mo')
                      e.target.value = ''
                      return
                    }
                    // TODO: Upload vers S3 et récupérer l'URL
                    // Pour l'instant on stocke juste le nom du fichier localement
                    setNouvelleFormation({ ...nouvelleFormation, documentUrl: file.name })
                  }
                }}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[rgba(var(--accent),0.1)] file:text-[rgb(var(--accent))] hover:file:bg-[rgba(var(--accent),0.2)] cursor-pointer"
              />
              {nouvelleFormation.documentUrl && (
                <div className="flex items-center gap-2 p-2 bg-[rgba(var(--success),0.1)] rounded-lg border border-[rgba(var(--success),0.3)]">
                  <FileText className="w-4 h-4 text-[rgb(var(--success))]" />
                  <span className="text-sm text-[rgb(var(--success))] flex-1">{nouvelleFormation.documentUrl}</span>
                  <button
                    onClick={() => setNouvelleFormation({ ...nouvelleFormation, documentUrl: '' })}
                    className="p-1 hover:bg-[rgba(var(--error),0.1)] rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message si aucune formation continue */}
      {profil.formationsContinues.length === 0 && !modeAjout && (
        <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Aucune formation continue enregistrée</p>
          <p className="text-xs mt-1">Cliquez sur "Ajouter une formation continue" pour commencer</p>
        </div>
      )}
    </div>
  )
}

function EtapeVeille({ profil, setProfil }: { profil: ProfilFormateur; setProfil: (p: ProfilFormateur) => void }) {
  const [nouvelleVeille, setNouvelleVeille] = useState({
    type: 'Technique',
    source: '',
    frequence: 'Mensuelle',
    description: '',
    documentUrl: ''
  })
  const [modeAjout, setModeAjout] = useState(false)

  const TYPES_VEILLE = [
    'Technique',
    'Réglementaire',
    'Concurrentielle',
    'Pédagogique',
    'Marché',
    'Innovation'
  ]

  const SOURCES_VEILLE = [
    'Revues professionnelles',
    'Salons et événements',
    'Sites web spécialisés',
    'Associations professionnelles',
    'Réseaux sociaux professionnels',
    'Formations et conférences',
    'Newsletters',
    'Podcasts',
    'Autre'
  ]

  const FREQUENCES = [
    { value: 'Quotidienne', label: 'Quotidienne', color: 'success' },
    { value: 'Hebdomadaire', label: 'Hebdomadaire', color: 'accent' },
    { value: 'Mensuelle', label: 'Mensuelle', color: 'warning' },
    { value: 'Trimestrielle', label: 'Trimestrielle', color: 'muted' },
    { value: 'Annuelle', label: 'Annuelle', color: 'muted' }
  ]

  const ajouterVeille = () => {
    if (nouvelleVeille.type && nouvelleVeille.source && nouvelleVeille.description) {
      setProfil({
        ...profil,
        veilleProfessionnelle: [...profil.veilleProfessionnelle, { ...nouvelleVeille, id: Date.now() }]
      })
      setNouvelleVeille({
        type: 'Technique',
        source: '',
        frequence: 'Mensuelle',
        description: '',
        documentUrl: ''
      })
      setModeAjout(false)
    }
  }

  const supprimerVeille = (id: number) => {
    setProfil({
      ...profil,
      veilleProfessionnelle: profil.veilleProfessionnelle.filter(v => v.id !== id)
    })
  }

  const getFrequenceColor = (frequence: string) => {
    const freqObj = FREQUENCES.find(f => f.value === frequence)
    switch (freqObj?.color) {
      case 'success': return 'bg-[rgba(var(--success),0.2)] text-[rgb(var(--success))]'
      case 'accent': return 'bg-[rgba(var(--accent),0.2)] text-[rgb(var(--accent))]'
      case 'warning': return 'bg-[rgba(var(--warning),0.2)] text-[rgb(var(--warning))]'
      default: return 'bg-[rgba(var(--muted-foreground),0.2)] text-[rgb(var(--muted-foreground))]'
    }
  }

  return (
    <div className="space-y-6">
      {/* Description Qualiopi */}
      <div className="flex items-start gap-3 p-4 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.2)]">
        <Eye className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[rgb(var(--foreground))] mb-1">
            Veille professionnelle et actualisation des compétences
          </p>
          <p className="text-[rgb(var(--muted-foreground))]">
            Indicateur 22 : Démontrez comment vous vous tenez informé des évolutions de votre secteur (techniques, réglementaires, pédagogiques).
            Cette veille active justifie votre maintien à niveau.
          </p>
        </div>
      </div>

      {/* Liste des veilles existantes */}
      {profil.veilleProfessionnelle.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[rgb(var(--foreground))]">
            Mes sources de veille ({profil.veilleProfessionnelle.length})
          </h3>
          {profil.veilleProfessionnelle.map((veille: any) => (
            <div key={veille.id} className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.5)] hover:border-[rgba(var(--accent),0.3)] transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[rgba(var(--accent),0.2)] text-[rgb(var(--accent))]">
                      {veille.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getFrequenceColor(veille.frequence)}`}>
                      {veille.frequence}
                    </span>
                  </div>
                  <h4 className="font-medium text-[rgb(var(--foreground))] mt-2">{veille.source}</h4>
                  <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">{veille.description}</p>
                </div>
                <button
                  onClick={() => supprimerVeille(veille.id)}
                  className="p-2 hover:bg-[rgba(var(--error),0.1)] rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bouton Ajouter ou Formulaire */}
      {!modeAjout ? (
        <button
          onClick={() => setModeAjout(true)}
          className="w-full p-4 border-2 border-dashed border-[rgba(var(--border),0.5)] rounded-lg hover:border-[rgba(var(--accent),0.5)] hover:bg-[rgba(var(--accent),0.02)] transition-all flex items-center justify-center gap-2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--accent))]"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Ajouter une source de veille</span>
        </button>
      ) : (
        <div className="p-6 bg-[rgba(var(--accent),0.03)] border border-[rgba(var(--accent),0.2)] rounded-lg space-y-4">
          <h3 className="text-sm font-medium text-[rgb(var(--foreground))] mb-4">Nouvelle source de veille</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Type de veille *
              </label>
              <select
                value={nouvelleVeille.type}
                onChange={(e) => setNouvelleVeille({ ...nouvelleVeille, type: e.target.value })}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
                required
              >
                {TYPES_VEILLE.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Fréquence *
              </label>
              <select
                value={nouvelleVeille.frequence}
                onChange={(e) => setNouvelleVeille({ ...nouvelleVeille, frequence: e.target.value })}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
                required
              >
                {FREQUENCES.map(freq => (
                  <option key={freq.value} value={freq.value}>{freq.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Source *
            </label>
            <select
              value={nouvelleVeille.source}
              onChange={(e) => setNouvelleVeille({ ...nouvelleVeille, source: e.target.value })}
              className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              required
            >
              <option value="">-- Sélectionner une source --</option>
              {SOURCES_VEILLE.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Description de ce que vous suivez *
            </label>
            <textarea
              value={nouvelleVeille.description}
              onChange={(e) => setNouvelleVeille({ ...nouvelleVeille, description: e.target.value })}
              placeholder="Ex: Nouvelles techniques de sertissage, évolutions des normes de sécurité, tendances design..."
              rows={3}
              className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))] resize-none"
              required
            />
          </div>

          {/* Justificatif */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Justificatif (PDF, JPG, PNG - max 5 Mo)
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      alert('Le fichier ne doit pas dépasser 5 Mo')
                      e.target.value = ''
                      return
                    }
                    // TODO: Upload vers S3 et récupérer l'URL
                    // Pour l'instant on stocke juste le nom du fichier localement
                    setNouvelleVeille({ ...nouvelleVeille, documentUrl: file.name })
                  }
                }}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[rgba(var(--accent),0.1)] file:text-[rgb(var(--accent))] hover:file:bg-[rgba(var(--accent),0.2)] cursor-pointer"
              />
              {nouvelleVeille.documentUrl && (
                <div className="flex items-center gap-2 p-2 bg-[rgba(var(--success),0.1)] rounded-lg border border-[rgba(var(--success),0.3)]">
                  <FileText className="w-4 h-4 text-[rgb(var(--success))]" />
                  <span className="text-sm text-[rgb(var(--success))] flex-1">{nouvelleVeille.documentUrl}</span>
                  <button
                    onClick={() => setNouvelleVeille({ ...nouvelleVeille, documentUrl: '' })}
                    className="p-1 hover:bg-[rgba(var(--error),0.1)] rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* État vide */}
      {profil.veilleProfessionnelle.length === 0 && !modeAjout && (
        <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
          <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Aucune source de veille enregistrée</p>
          <p className="text-xs mt-1">Cliquez sur "Ajouter une source de veille" pour commencer</p>
        </div>
      )}
    </div>
  )
}
