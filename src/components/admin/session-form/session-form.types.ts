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
  salleVoeux: number[] // IDs des salles souhaitées (vœux pour cette matière)
  formateurVoeux: number[] // IDs des formateurs souhaités (vœux pour cette matière)
}

export interface PlageHoraire {
  matin: {
    debut: string
    fin: string
  }
  apresMidi: {
    debut: string
    fin: string
  }
}

export interface FormationCourteData {
  codeFormation: string
  dateDebut: string
  dateFin: string
  dureeHeures: number       // Durée totale en heures (ex: 40h, 4h...) — n8n planifie
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
  plageHoraire: PlageHoraire // Créneau fixe pour toute la session
  joursActifs: JourSemaine[]
  periodesInterdites: PeriodeInterdite[]
  programme: Matiere[] // Contient maintenant les vœux salle/formateur par matière
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
  sourceForm: 'creation_session' // Tag pour routage n8n
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
  plageHoraire?: PlageHoraire // Créneau quotidien fixe
  rythmeEtContraintes: {
    joursActifs: JourSemaine[]
    weekendAutorise: boolean
    periodesInterdites?: PeriodeInterdite[]
  }
  programme?: Matiere[] // Contient les vœux salle/formateur par matière
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
  // Métadonnées de la session (pour afficher la synthèse complète)
  type?: SessionType
  nomSession?: string
  dateDebutGlobale?: string
  dateFin?: string
  dureeMois?: number
  joursActifs?: JourSemaine[]
  plageHoraire?: PlageHoraire
  programme?: Matiere[] // Programme détaillé pour CAP
  formateurs?: FormateurSelectionne[]
  salles?: SalleSelectionnee[]
  // Planning généré par Marjorie
  planningGenere: {
    seances: Seance[]
    total_heures_formation?: number // Heures totales de la formation (ex: 800h pour CAP)
    nb_participants?: number // Nombre de participants
    statsOccupation?: {
      salles: { nom: string, tauxOccupation: number }[]
      formateurs: { nom: string, heuresTotal: number }[]
    }
    rapportIA: string
  }
}
