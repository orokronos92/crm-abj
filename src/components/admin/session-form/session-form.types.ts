// Types pour le formulaire de création de session

export type SessionType = 'COURTE' | 'CAP'

export type StatutSession =
  | 'BROUILLON'
  | 'EN_ANALYSE_IA'
  | 'PROPOSE_IA'
  | 'REFUSE_ADMIN'
  | 'VALIDE_A_DIFFUSER'
  | 'EN_COURS'
  | 'TERMINEE'
  | 'ANNULEE'

export type JourSemaine = 'LUNDI' | 'MARDI' | 'MERCREDI' | 'JEUDI' | 'VENDREDI' | 'SAMEDI' | 'DIMANCHE'

export interface Matiere {
  nom: string
  heures: number
  heuresConsecutivesMax: number
  ordre?: number
  prerequis?: string[]
}

export interface FormationCourteData {
  codeFormation: string
  dateDebut: string
  dateFin: string
  joursActifs: JourSemaine[]
  nbParticipants: number
  salleId?: number
  formateurId?: number | 'SANS_FORMATEUR'
  description?: string
}

export interface FormationCAPData {
  codeFormation: string
  nomSession: string
  dateDebutGlobale: string
  dureeMois: number
  nbParticipants: number
  joursActifs: JourSemaine[]
  periodesInterdites: PeriodeInterdite[]
  programme: Matiere[]
  formateurs: FormateurSelectionne[]
  salles: SalleSelectionnee[]
  formateurMultiMatieresAutorise: boolean
  salleMultiMatieresAutorise: boolean
  formateursPlanifierPlusTard: boolean
  sallesPlanifierPlusTard: boolean
  matieresEnParallele: boolean
  notesComplementaires?: string
}

export interface PeriodeInterdite {
  debut: string
  fin: string
  motif: string
}

export interface FormateurSelectionne {
  id: number
  nom: string
  matieres: string[]
}

export interface SalleSelectionnee {
  id: number
  nom: string
  capacite: number
}

export interface SessionFormData {
  type: SessionType
  dataCourte?: FormationCourteData
  dataCAP?: FormationCAPData
}

export interface SessionAIPayload {
  type: SessionType
  demandePar: string
  dateCreation: string
  informationsGenerales: {
    codeFormation: string
    nomSession?: string
    dateDebutGlobale: string
    dateFin?: string
    dureeMois?: number
    nbParticipants: number
  }
  rythmeEtContraintes: {
    joursActifs: JourSemaine[]
    weekendAutorise: boolean
    amplitudeHoraire: {
      debut: string
      fin: string
      granularite: string
    }
    periodesInterdites?: PeriodeInterdite[]
  }
  programme?: Matiere[]
  totalHeuresProgramme?: number
  ressources: {
    formateurs?: FormateurSelectionne[]
    formateurMultiMatieresAutorise?: boolean
    salles?: SalleSelectionnee[]
    salleMultiMatieresAutorise?: boolean
    formateursPlanifierPlusTard: boolean
    sallesPlanifierPlusTard: boolean
  }
  contraintesPedagogiques?: {
    matieresEnParallele: boolean
    notesComplementaires?: string
  }
  objectifOptimisation: string
}

export interface Seance {
  id: number
  date: string
  heureDebut: string
  heureFin: string
  matiere?: string
  formateurId?: number
  formateurNom?: string
  salleId: number
  salleNom: string
}

export interface SessionProposal {
  idSession: number
  statut: StatutSession
  planningGenere: {
    seances: Seance[]
    statsOccupation: {
      salles: { nom: string, tauxOccupation: number }[]
      formateurs: { nom: string, heuresTotal: number }[]
    }
    rapportIA: string
  }
}
