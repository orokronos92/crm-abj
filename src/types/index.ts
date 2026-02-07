/**
 * Types TypeScript globaux
 * Exportation centralisée des types Prisma et custom
 */

export * from '@prisma/client'

// Types pour les rôles
export type UserRole = 'admin' | 'professeur' | 'eleve'

// Types pour les statuts
export type StatutDossier = 'NOUVEAU' | 'EN_COURS' | 'VALIDE' | 'REFUSE' | 'EN_ATTENTE'
export type StatutFormation = 'EN_COURS' | 'TERMINE' | 'ABANDONNE' | 'SUSPENDU'
export type StatutPresence = 'PRESENT' | 'ABSENT' | 'ABSENT_JUSTIFIE' | 'RETARD'
export type StatutSession = 'PREVUE' | 'CONFIRMEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE'

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Types pour les filtres et pagination
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}

// Types pour les formulaires
export interface FormError {
  field?: string
  message: string
}

// Types pour les notifications
export interface NotificationType {
  id?: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

// Types pour Marjorie
export interface MarjorieMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface MarjorieContext {
  userId: number
  userRole: UserRole
  currentPage?: string
  additionalData?: Record<string, any>
}

// Types étendus avec relations
export interface ProspectWithRelations {
  idProspect: string
  nom?: string | null
  prenom?: string | null
  emails: string[]
  telephones: string[]
  statutProspect?: string | null
  dateDernierContact?: Date | null
  candidats?: Array<{
    numeroDossier: string
    statutDossier: string
    formationRetenue?: string | null
  }>
  _count?: {
    candidats: number
    historiqueEmails: number
  }
}

export interface CandidatWithRelations {
  idCandidat: number
  numeroDossier: string
  statutDossier: string
  formationRetenue?: string | null
  dateDebutSouhaitee?: Date | null
  prospect?: {
    nom?: string | null
    prenom?: string | null
    emails: string[]
    telephones: string[]
  }
  documentsCandidat?: Array<{
    typeDocument: string
    statut: string
    dateReception?: Date | null
  }>
}

export interface SessionWithRelations {
  idSession: number
  nomSession?: string | null
  dateDebut: Date
  dateFin: Date
  statutSession?: string | null
  nbInscrits: number
  capaciteMax?: number | null
  formation?: {
    nom: string
    codeFormation: string
    categorie?: string | null
  }
  formateurPrincipal?: {
    nom: string
    prenom: string
    email: string
  }
}