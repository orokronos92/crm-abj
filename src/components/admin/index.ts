/**
 * Point d'entrée centralisé pour les composants admin
 * Facilite les imports
 */

// Formulaires de session
export { SessionFormModal } from './SessionFormModal'
export { SessionTypeSelector } from './session-form/SessionTypeSelector'
export { SessionReviewPanel } from './SessionReviewPanel'
export { SessionProposalReview } from './SessionProposalReview'

// Autres composants
export { MonthDetailModal } from './MonthDetailModal'
export { EvenementFormModal } from './EvenementFormModal'

// Types
export type {
  SessionType,
  SessionFormData,
  FormationCourteData,
  FormationCAPData,
  SessionProposal,
  Seance
} from './session-form/session-form.types'
