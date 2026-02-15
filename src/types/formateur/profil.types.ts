import { LucideIcon } from 'lucide-react'

// Type pour un diplôme
export interface Diplome {
  id: string
  titre: string
  etablissement: string
  dateObtention: string
  niveau?: string
  specialite?: string
}

// Type pour une certification
export interface Certification {
  id: string
  nom: string
  organisme: string
  dateObtention: string
  dateExpiration?: string
  numero?: string
}

// Type pour une formation pédagogique
export interface FormationPedagogique {
  id: string
  intitule: string
  organisme: string
  duree: string
  date: string
  competencesAcquises?: string[]
}

// Type pour un élément du portfolio
export interface PortfolioItem {
  id: string
  titre: string
  description: string
  type: 'realisation' | 'projet' | 'publication'
  date: string
  lienUrl?: string
  imageUrl?: string
}

// Type pour une compétence
export interface Competence {
  id: string
  nom: string
  niveau: 'debutant' | 'intermediaire' | 'avance' | 'expert'
  anneesExperience: number
  certifie: boolean
}

// Type pour une formation continue
export interface FormationContinue {
  id: string
  titre: string
  organisme: string
  date: string
  dureeHeures: number
  type: 'presentiel' | 'distanciel' | 'mixte'
  competencesAcquises?: string[]
}

// Type pour la veille professionnelle
export interface VeilleProfessionnelle {
  id: string
  type: 'conference' | 'salon' | 'webinaire' | 'publication' | 'formation'
  titre: string
  description: string
  date: string
  source?: string
}

// Type principal du profil formateur
export interface ProfilFormateur {
  anneesExperienceMetier: number
  anneesExperienceEnseignement: number
  tarifHoraire: number
  bio: string
  diplomes: Diplome[]
  certifications: Certification[]
  formationsPedagogiques: FormationPedagogique[]
  portfolio: PortfolioItem[]
  competences: Competence[]
  methodesPedagogiques: string
  approchePedagogique: string
  outilsSupports: string[]
  formationsContinues: FormationContinue[]
  veilleProfessionnelle: VeilleProfessionnelle[]
}

// Type pour une étape du formulaire
export interface Etape {
  id: string
  label: string
  icon: LucideIcon
  description: string
}

// État initial vide du profil
export const PROFIL_INITIAL: ProfilFormateur = {
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
}