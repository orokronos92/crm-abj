import {
  GraduationCap,
  Award,
  BookOpen,
  Briefcase,
  Wrench,
  TrendingUp,
  Eye,
  User,
  Lightbulb
} from 'lucide-react'
import { Etape } from '@/types/formateur/profil.types'

export const ETAPES_PROFIL_FORMATEUR: Etape[] = [
  {
    id: 'informations-essentielles',
    label: 'Informations essentielles',
    icon: User,
    description: 'Votre profil et expérience'
  },
  {
    id: 'diplomes',
    label: 'Diplômes métier',
    icon: GraduationCap,
    description: 'Vos diplômes et qualifications professionnelles'
  },
  {
    id: 'certifications',
    label: 'Certifications',
    icon: Award,
    description: 'Certifications professionnelles et validations'
  },
  {
    id: 'formations-pedagogiques',
    label: 'Formations pédagogiques',
    icon: BookOpen,
    description: 'Votre parcours de formateur'
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    icon: Briefcase,
    description: 'Vos réalisations et projets'
  },
  {
    id: 'competences',
    label: 'Compétences techniques',
    icon: Wrench,
    description: 'Savoir-faire et expertises'
  },
  {
    id: 'methodes-pedagogiques',
    label: 'Méthodes pédagogiques',
    icon: Lightbulb,
    description: "Votre approche et vos outils d'enseignement"
  },
  {
    id: 'formations-continues',
    label: 'Formations continues',
    icon: TrendingUp,
    description: 'Votre développement professionnel'
  },
  {
    id: 'veille',
    label: 'Veille professionnelle',
    icon: Eye,
    description: 'Votre veille sectorielle'
  }
]