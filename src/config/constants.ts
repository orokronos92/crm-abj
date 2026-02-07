/**
 * Constantes globales du projet
 */

// Rôles utilisateurs
export const ROLES = {
  ADMIN: 'admin',
  PROFESSEUR: 'professeur',
  ELEVE: 'eleve'
} as const

// Routes par rôle
export const ROUTE_PREFIXES = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.PROFESSEUR]: '/formateur',
  [ROLES.ELEVE]: '/eleve'
} as const

// Page d'accueil par rôle
export const HOME_ROUTES = {
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.PROFESSEUR]: '/formateur/planning',
  [ROLES.ELEVE]: '/eleve/formation'
} as const

// Statuts candidature
export const STATUTS_DOSSIER = {
  NOUVEAU: 'NOUVEAU',
  EN_COURS: 'EN_COURS',
  VALIDE: 'VALIDE',
  REFUSE: 'REFUSE',
  EN_ATTENTE: 'EN_ATTENTE'
} as const

// Statuts financement
export const STATUTS_FINANCEMENT = {
  EN_ATTENTE: 'EN_ATTENTE',
  ACCORDE: 'ACCORDE',
  REFUSE: 'REFUSE',
  PARTIEL: 'PARTIEL'
} as const

// Types de formation
export const TYPES_FORMATION = {
  CAP: 'CAP',
  FORMATION_COURTE: 'FORMATION_COURTE',
  PERFECTIONNEMENT: 'PERFECTIONNEMENT'
} as const

// Modes de financement
export const MODES_FINANCEMENT = {
  PERSONNEL: 'Personnel',
  CPF: 'CPF',
  POLE_EMPLOI: 'Pôle Emploi',
  OPCO: 'OPCO',
  ENTREPRISE: 'Entreprise',
  AUTRE: 'Autre'
} as const

// Types de documents
export const TYPES_DOCUMENTS = {
  CV: 'CV',
  LETTRE_MOTIVATION: 'Lettre de motivation',
  PIECE_IDENTITE: 'Pièce d\'identité',
  JUSTIFICATIF_FINANCEMENT: 'Justificatif financement',
  ATTESTATION_SECU: 'Attestation sécurité sociale',
  RIB: 'RIB',
  PHOTO: 'Photo d\'identité',
  DIPLOME: 'Diplôme',
  AUTRE: 'Autre'
} as const

// Statuts documents
export const STATUTS_DOCUMENTS = {
  ATTENDU: 'ATTENDU',
  RECU: 'RECU',
  VALIDE: 'VALIDE',
  REFUSE: 'REFUSE'
} as const

// Types d'évaluation
export const TYPES_EVALUATION = {
  CONTROLE_CONTINU: 'CONTROLE_CONTINU',
  EXAMEN_BLANC: 'EXAMEN_BLANC',
  EXAMEN_FINAL: 'EXAMEN_FINAL',
  APPRECIATION: 'APPRECIATION'
} as const

// Statuts présence
export const STATUTS_PRESENCE = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  ABSENT_JUSTIFIE: 'ABSENT_JUSTIFIE',
  RETARD: 'RETARD'
} as const

// Configuration pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
} as const

// Messages d'erreur communs
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Non autorisé',
  NOT_FOUND: 'Ressource non trouvée',
  INVALID_DATA: 'Données invalides',
  SERVER_ERROR: 'Erreur serveur',
  SESSION_EXPIRED: 'Session expirée',
  INVALID_CREDENTIALS: 'Identifiants incorrects',
  ACCOUNT_INACTIVE: 'Compte inactif'
} as const

// Messages de succès communs
export const SUCCESS_MESSAGES = {
  SAVED: 'Enregistré avec succès',
  UPDATED: 'Modifié avec succès',
  DELETED: 'Supprimé avec succès',
  SENT: 'Envoyé avec succès',
  VALIDATED: 'Validé avec succès'
} as const

// Formats de date
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_TIME: 'dd/MM/yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  API: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx'
} as const

// Regex de validation
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
  POSTAL_CODE: /^(?:0[1-9]|[1-8]\d|9[0-8])\d{3}$/,
  SIRET: /^\d{14}$/
} as const

// Configuration API
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 secondes
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '',
  RETRY_ATTEMPTS: 3
} as const

// Configuration Marjorie
export const MARJORIE_CONFIG = {
  WEBHOOK_URL: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
  MAX_MESSAGE_LENGTH: 5000,
  TYPING_DELAY: 500,
  RESPONSE_TIMEOUT: 60000 // 60 secondes
} as const