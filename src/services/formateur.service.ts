/**
 * Service pour la logique métier des formateurs
 * Gère les calculs, agrégations et conformité Qualiopi
 */

import { FormateurRepository } from '@/repositories/formateur.repository'
import type { Prisma } from '@prisma/client'

interface FormateurListItem {
  id: number
  nom: string
  prenom: string
  email: string
  telephone: string
  specialites: string[]
  statut: string
  elevesActifs: number
  sessionsActives: number
  heuresHebdo: number
  tauxHoraire: number
  conformeQualiopi: boolean
  documentsManquants: number
  dateProchaineCertification: string | null
  satisfactionMoyenne: number
}

interface FormateurDetail extends FormateurListItem {
  bio: string
  cvUrl: string | null
  qualificationsResume: string | null
  dateValidationQualiopi: string | null
  dossierComplet: boolean
  sessions: Array<{
    id: number
    nomSession: string
    formation: string
    dateDebut: string
    dateFin: string
    nbEleves: number
    statut: string
  }>
  eleves: Array<{
    id: number
    nom: string
    prenom: string
    formation: string
    moyenne: number
    progression: number
    absences: number
  }>
  interventions: Array<{
    date: string
    duree: number
    session: string
    cout: number
    payee: boolean
  }>
  documents: Array<{
    id: number
    type: string
    libelle: string
    statut: string
    dateExpiration: string | null
    obligatoire: boolean
  }>
  disponibilites: Array<{
    date: string
    creneau: string
    type: string
  }>
  issuesQualiopi: Array<{
    type: string
    count: number
    details: string[]
  }>
  diplomes: Array<{
    id: number
    nomDiplome: string
    typeFormation: string
    specialite: string | null
    dateObtention: string | null
    etablissement: string | null
    ville: string | null
    documentUrl: string | null
    statut: string
  }>
  certifications: Array<{
    id: number
    nomCertification: string
    organisme: string | null
    dateObtention: string | null
    dateExpiration: string | null
    documentUrl: string | null
    statut: string
  }>
  formationsPedagogiques: Array<{
    id: number
    intitule: string
    organisme: string | null
    dateFormation: string | null
    dureeHeures: number | null
    certificatUrl: string | null
    statut: string
  }>
  portfolio: Array<{
    id: number
    titre: string
    description: string | null
    annee: string
    imageUrl: string | null
  }>
  competencesTechniques: Array<{
    id: number
    domaine: string
    technique: string
    niveau: string
    anneesPratique: number | null
  }>
  formationsContinues: Array<{
    id: number
    intitule: string
    organisme: string | null
    dateDebut: string | null
    dateFin: string | null
    dureeHeures: number | null
    domaine: string | null
    certificatUrl: string | null
    statut: string
  }>
  veilleProfessionnelle: Array<{
    id: number
    type: string
    nomActivite: string
    organisme: string | null
    dateActivite: string | null
    duree: number | null
    uniteDuree: string | null
  }>
  stats: {
    totalEleves: number
    heuresMois: number
    caMois: number
    tauxPresence: number
    documentsValides: number
    documentsTotal: number
  }
}

export class FormateurService {
  private repository: FormateurRepository

  constructor() {
    this.repository = new FormateurRepository()
  }

  /**
   * Récupère la liste des formateurs avec filtres
   */
  async getFormateurs(params?: {
    statut?: string
    specialite?: string
    conformeQualiopi?: boolean
    search?: string
    take?: number
  }) {
    const { statut, specialite, conformeQualiopi, search, take = 50 } = params || {}

    // Construction des filtres Prisma
    const where: any = {}

    if (statut && statut !== 'TOUS') {
      where.statut = statut
    }

    if (specialite && specialite !== 'TOUTES') {
      where.specialites = {
        has: specialite
      }
    }

    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const { data, total } = await this.repository.findAll({
      skip: 0,
      take,
      where,
      orderBy: { creeLe: 'desc' }
    })

    // Transformation et calculs
    const formateurs: FormateurListItem[] = await Promise.all(
      data.map(async (formateur) => {
        // Calcul élèves actifs (via sessions)
        const elevesActifs = formateur.sessionsPrincipales?.reduce((count, session) => {
          const elevesEnFormation = session.inscriptionsSessions?.filter(
            inscription => inscription.eleve?.statutFormation === 'EN_COURS'
          ).length || 0
          return count + elevesEnFormation
        }, 0) || 0

        // Sessions actives
        const sessionsActives = formateur.sessionsPrincipales?.filter(
          s => s.statutSession && ['EN_COURS', 'CONFIRMEE'].includes(s.statutSession)
        ).length || 0

        // Heures hebdomadaires (estimation basée sur interventions du dernier mois)
        const heuresHebdo = this.calculateHeuresHebdo(formateur.interventions || [])

        // Vérification Qualiopi complète (comme dans le modal pour avoir les mêmes données)
        const qualiopi = await this.repository.checkQualiopi(formateur.idFormateur, true)
        const conformeQualiopi = qualiopi?.conforme || false
        const documentsProblematiques = qualiopi?.issues.reduce((sum, issue) => sum + issue.count, 0) || 0

        // Date prochaine certification à renouveler
        const prochaineCertif = this.getProchaineCertificationDate(formateur.documents || [])

        return {
          id: formateur.idFormateur,
          nom: formateur.nom,
          prenom: formateur.prenom,
          email: formateur.email || '',
          telephone: formateur.telephone || '',
          specialites: formateur.specialites || [],
          statut: formateur.statut,
          elevesActifs,
          sessionsActives,
          heuresHebdo,
          tauxHoraire: Number(formateur.tarifJournalier || 0) / 7, // Conversion jour -> heure
          conformeQualiopi,
          documentsManquants: documentsProblematiques,
          dateProchaineCertification: prochaineCertif,
          satisfactionMoyenne: 0 // Sera calculé plus tard via questionnaires
        }
      })
    )

    // Filtrage post-traitement si nécessaire (conformité Qualiopi)
    let formateursFiltres = formateurs
    if (conformeQualiopi !== undefined) {
      formateursFiltres = formateurs.filter(f => f.conformeQualiopi === conformeQualiopi)
    }

    return {
      formateurs: formateursFiltres,
      total: formateursFiltres.length
    }
  }

  /**
   * Récupère le détail complet d'un formateur
   */
  async getFormateurDetail(id: number): Promise<FormateurDetail> {
    const formateur = await this.repository.findById(id)

    if (!formateur) {
      throw new Error('Formateur non trouvé')
    }

    // Vérification Qualiopi complète
    const qualiopi = await this.repository.checkQualiopi(id)

    // Calculs statistiques
    const stats = this.calculateStats(formateur)

    // Transformation des données
    const sessions = (formateur.sessionsPrincipales || []).map(session => ({
      id: session.idSession,
      nomSession: session.nomSession || 'Session sans nom',
      formation: session.formation?.nom || 'Non définie',
      dateDebut: session.dateDebut ? new Date(session.dateDebut).toLocaleDateString('fr-FR') : '',
      dateFin: session.dateFin ? new Date(session.dateFin).toLocaleDateString('fr-FR') : '',
      nbEleves: session.inscriptionsSessions?.length || 0,
      statut: session.statutSession || 'NON_DEFINI'
    }))

    const eleves = this.extractElevesFromSessions(formateur.sessionsPrincipales || [])

    const interventions = (formateur.interventions || []).map(intervention => ({
      date: intervention.dateIntervention ?
        new Date(intervention.dateIntervention).toLocaleDateString('fr-FR') : '',
      duree: Number(intervention.dureeHeures || 0),
      session: intervention.session?.nomSession || 'Session non définie',
      cout: Number(intervention.cout || 0),
      payee: intervention.facturePayee
    }))

    const documents = (formateur.documents || []).map(doc => ({
      id: doc.idDocument,
      codeTypeDocument: doc.codeTypeDocument,  // Ajout du code pour le filtrage
      type: doc.codeTypeDocument,
      libelle: doc.typeDocument?.libelle || doc.libelle || doc.codeTypeDocument,
      statut: doc.statut,
      dateExpiration: doc.dateExpiration ?
        new Date(doc.dateExpiration).toLocaleDateString('fr-FR') : null,
      obligatoire: doc.typeDocument?.obligatoire || false,
      typeDocument: doc.typeDocument,  // Inclure l'objet typeDocument complet
      nomFichier: doc.nomFichier,
      urlFichier: doc.urlFichier,
      dateDocument: doc.dateDocument ?
        new Date(doc.dateDocument).toLocaleDateString('fr-FR') : null,
      dateValidation: doc.dateValidation ?
        new Date(doc.dateValidation).toLocaleDateString('fr-FR') : null,
      motifRejet: doc.motifRejet
    }))

    const disponibilites = (formateur.disponibilites || []).map(dispo => ({
      date: new Date(dispo.date).toLocaleDateString('fr-FR'),
      creneau: dispo.creneauJournee,
      type: dispo.typeDisponibilite
    }))

    const diplomes = (formateur.diplomes || []).map(diplome => ({
      id: diplome.idDiplome,
      nomDiplome: diplome.nomDiplome,
      typeFormation: diplome.typeFormation,
      specialite: diplome.specialite,
      dateObtention: diplome.dateObtention ?
        new Date(diplome.dateObtention).toLocaleDateString('fr-FR') : null,
      etablissement: diplome.etablissement,
      ville: diplome.ville,
      documentUrl: diplome.documentUrl,
      statut: diplome.statut
    }))

    const certifications = (formateur.certificationsPro || []).map(cert => ({
      id: cert.idCertification,
      nomCertification: cert.nomCertification,
      organisme: cert.organisme,
      dateObtention: cert.dateObtention ?
        new Date(cert.dateObtention).toLocaleDateString('fr-FR') : null,
      dateExpiration: cert.dateExpiration ?
        new Date(cert.dateExpiration).toLocaleDateString('fr-FR') : null,
      documentUrl: cert.documentUrl,
      statut: cert.statut
    }))

    const formationsPedagogiques = (formateur.formationsPedagogiques || []).map(form => ({
      id: form.idFormation,
      intitule: form.intitule,
      organisme: form.organisme,
      dateFormation: form.dateFormation ?
        new Date(form.dateFormation).toLocaleDateString('fr-FR') : null,
      dureeHeures: form.dureeHeures ? Number(form.dureeHeures) : null,
      certificatUrl: form.certificatUrl,
      statut: form.statut
    }))

    const portfolio = (formateur.portfolioRealisations || []).map(item => ({
      id: item.idPortfolio,
      titre: item.titre,
      description: item.description,
      annee: item.annee,
      imageUrl: item.imageUrl
    }))

    const competencesTechniques = (formateur.competencesTech || []).map(comp => ({
      id: comp.idCompetence,
      domaine: comp.domaine,
      technique: comp.technique,
      niveau: comp.niveau,
      anneesPratique: comp.anneesPratique
    }))

    const formationsContinues = (formateur.formationsCont || []).map(form => ({
      id: form.idFormation,
      intitule: form.intitule,
      organisme: form.organisme,
      dateDebut: form.dateDebut ?
        new Date(form.dateDebut).toLocaleDateString('fr-FR') : null,
      dateFin: form.dateFin ?
        new Date(form.dateFin).toLocaleDateString('fr-FR') : null,
      dureeHeures: form.dureeHeures ? Number(form.dureeHeures) : null,
      domaine: form.domaine,
      certificatUrl: form.certificatUrl,
      statut: form.statut
    }))

    const veilleProfessionnelle = (formateur.veillePro || []).map(veille => ({
      id: veille.idVeille,
      type: veille.type,
      nomActivite: veille.nomActivite,
      organisme: veille.organisme,
      dateActivite: veille.dateActivite ?
        new Date(veille.dateActivite).toLocaleDateString('fr-FR') : null,
      duree: veille.duree,
      uniteDuree: veille.uniteDuree
    }))

    return {
      id: formateur.idFormateur,
      nom: formateur.nom,
      prenom: formateur.prenom,
      email: formateur.email || '',
      telephone: formateur.telephone || '',
      specialites: formateur.specialites || [],
      statut: formateur.statut,
      bio: formateur.bio || '',
      cvUrl: formateur.cvUrl || null,
      qualificationsResume: formateur.qualificationsResume || null,
      dateValidationQualiopi: formateur.dateValidationQualiopi ?
        new Date(formateur.dateValidationQualiopi).toLocaleDateString('fr-FR') : null,
      dossierComplet: formateur.dossierComplet,
      elevesActifs: stats.totalEleves,
      sessionsActives: sessions.filter(s => s.statut && ['EN_COURS', 'CONFIRMEE'].includes(s.statut)).length,
      heuresHebdo: this.calculateHeuresHebdo(formateur.interventions || []),
      tauxHoraire: Number(formateur.tarifJournalier || 0) / 7,
      conformeQualiopi: qualiopi?.conforme || false,
      documentsManquants: qualiopi?.issues.reduce((sum, issue) => sum + issue.count, 0) || 0,
      dateProchaineCertification: this.getProchaineCertificationDate(formateur.documents || []),
      satisfactionMoyenne: 0,
      sessions,
      eleves,
      interventions,
      documents,
      disponibilites,
      issuesQualiopi: qualiopi?.issues || [],
      diplomes,
      certifications,
      formationsPedagogiques,
      portfolio,
      competencesTechniques,
      formationsContinues,
      veilleProfessionnelle,
      stats
    }
  }

  /**
   * Récupère les valeurs distinctes pour les filtres
   */
  async getFilterValues() {
    const values = await this.repository.getDistinctValues()

    return {
      statuts: values.statuts,
      specialites: values.specialites
    }
  }

  /**
   * Récupère les statistiques globales
   */
  async getGlobalStats() {
    return await this.repository.getStats()
  }

  // === Méthodes privées de calcul ===

  private calculateHeuresHebdo(interventions: any[]): number {
    const now = new Date()
    const quatreSemainesAvant = new Date(now.setDate(now.getDate() - 28))

    const interventionsRecentes = interventions.filter(i =>
      i.dateIntervention && new Date(i.dateIntervention) >= quatreSemainesAvant
    )

    const totalHeures = interventionsRecentes.reduce((sum, i) =>
      sum + Number(i.dureeHeures || 0), 0
    )

    return Math.round(totalHeures / 4) // Moyenne sur 4 semaines
  }

  private countDocumentsProblematiques(documents: any[]): number {
    const now = new Date()
    return documents.filter(doc => {
      // Document manquant obligatoire
      if (doc.typeDocument?.obligatoire && doc.statut === 'ATTENDU') {
        return true
      }
      // Document expiré
      if (doc.dateExpiration && new Date(doc.dateExpiration) < now) {
        return true
      }
      // Document refusé
      if (doc.statut === 'EXPIRE' || doc.statut === 'REFUSE') {
        return true
      }
      return false
    }).length
  }

  private getProchaineCertificationDate(documents: any[]): string | null {
    const docsAvecExpiration = documents
      .filter(doc => doc.dateExpiration && doc.statut === 'VALIDE')
      .sort((a, b) =>
        new Date(a.dateExpiration).getTime() - new Date(b.dateExpiration).getTime()
      )

    if (docsAvecExpiration.length > 0) {
      return new Date(docsAvecExpiration[0].dateExpiration).toLocaleDateString('fr-FR')
    }

    return null
  }

  private extractElevesFromSessions(sessions: any[]): any[] {
    const elevesMap = new Map()

    sessions.forEach(session => {
      session.inscriptionsSessions?.forEach((inscription: any) => {
        const eleve = inscription.eleve
        if (eleve && eleve.statutFormation === 'EN_COURS') {
          if (!elevesMap.has(eleve.idEleve)) {
            elevesMap.set(eleve.idEleve, {
              id: eleve.idEleve,
              nom: eleve.candidat?.prospect?.nom || 'Non défini',
              prenom: eleve.candidat?.prospect?.prenom || '',
              formation: this.getFormationLabel(eleve.formationSuivie || ''),
              moyenne: Number(eleve.notesMoyennes || 0),
              progression: Number(eleve.progression || 0),
              absences: Number(eleve.absences || 0)
            })
          }
        }
      })
    })

    return Array.from(elevesMap.values())
  }

  private calculateStats(formateur: any): any {
    const now = new Date()
    const moisDernier = new Date(now.setMonth(now.getMonth() - 1))

    // Total élèves actifs
    const totalEleves = this.extractElevesFromSessions(formateur.sessionsPrincipales || []).length

    // Heures du mois
    const heuresMois = (formateur.interventions || [])
      .filter((i: any) => i.dateIntervention && new Date(i.dateIntervention) >= moisDernier)
      .reduce((sum: number, i: any) => sum + Number(i.dureeHeures || 0), 0)

    // CA du mois
    const caMois = (formateur.interventions || [])
      .filter((i: any) => i.dateIntervention && new Date(i.dateIntervention) >= moisDernier)
      .reduce((sum: number, i: any) => sum + Number(i.cout || 0), 0)

    // Documents valides
    const documentsValides = (formateur.documents || [])
      .filter((d: any) => d.statut === 'VALIDE').length
    const documentsTotal = (formateur.documents || []).length

    return {
      totalEleves,
      heuresMois,
      caMois,
      tauxPresence: 100, // Sera calculé avec les présences réelles
      documentsValides,
      documentsTotal
    }
  }

  private getFormationLabel(code: string): string {
    const labels: Record<string, string> = {
      'CAP_BJ': 'CAP Bijouterie-Joaillerie',
      'INIT_BJ': 'Initiation Bijouterie',
      'PERF_SERTI': 'Perfectionnement Sertissage',
      'CAO_DAO': 'CAO/DAO Bijouterie',
      'GEMMO': 'Gemmologie',
      'SERTI_N1': 'Sertissage Niveau 1',
      'SERTI_N2': 'Sertissage Niveau 2'
    }
    return labels[code] || code
  }
}