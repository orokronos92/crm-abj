import { EleveRepository } from '@/repositories/eleve.repository'
import { Prisma } from '@prisma/client'

interface EleveFilters {
  formation?: string
  formateur?: string
  statut?: string
  search?: string
  hasAlert?: boolean
}

export class EleveService {
  private repository: EleveRepository

  constructor() {
    this.repository = new EleveRepository()
  }

  /**
   * Récupère la liste des élèves avec filtres et calculs
   */
  async getEleves(filters: EleveFilters & { take?: number }) {
    const { formation, formateur, statut, search, hasAlert, take = 100 } = filters

    // Construction du filtre where
    const where: Prisma.EleveWhereInput = {}

    if (statut && statut !== 'TOUS') {
      where.statutFormation = statut
    }

    // Filtrage par formation via sessions
    if (formation && formation !== 'TOUS') {
      where.inscriptionsSessions = {
        some: {
          session: {
            formation: {
              codeFormation: formation
            }
          }
        }
      }
    }

    // Filtrage par formateur via sessions
    if (formateur && formateur !== 'TOUS') {
      where.inscriptionsSessions = {
        some: {
          session: {
            formateurPrincipalId: parseInt(formateur)
          }
        }
      }
    }

    // Recherche textuelle
    if (search) {
      where.OR = [
        { numeroDossier: { contains: search, mode: 'insensitive' } },
        {
          candidat: {
            prospect: {
              OR: [
                { nom: { contains: search, mode: 'insensitive' } },
                { prenom: { contains: search, mode: 'insensitive' } },
                { emails: { has: search } }
              ]
            }
          }
        }
      ]
    }

    // Récupération des données
    const { data, total } = await this.repository.findAll({ where, take })

    // Formatage et calculs pour chaque élève
    const eleves = data.map(eleve => {
      const prospect = eleve.candidat?.prospect
      const sessionActive = eleve.inscriptionsSessions?.[0]?.session
      const formation = sessionActive?.formation
      const formateur = sessionActive?.formateurPrincipal

      // Calcul des statistiques
      const stats = this.calculateEleveStats(eleve)

      // Détection des alertes
      const alertes = this.detectAlertes(eleve, stats)

      return {
        id: eleve.idEleve,
        numero_dossier: eleve.numeroDossier,
        nom: prospect?.nom || '',
        prenom: prospect?.prenom || '',
        email: prospect?.emails?.[0] || '',
        telephone: prospect?.telephones?.[0] || '',
        adresse: prospect?.adresse || '',
        code_postal: prospect?.codePostal || '',
        ville: prospect?.ville || '',

        // Formation
        formation: formation?.nom || 'Non définie',
        code_formation: formation?.codeFormation || '',
        session: sessionActive?.nomSession || 'Non définie',
        formateur_principal: formateur ? `${formateur.prenom} ${formateur.nom}` : 'Non assigné',
        salle: sessionActive?.sallePrincipale || 'Non définie',

        // Dates et statut
        date_debut: eleve.dateDebut ? new Date(eleve.dateDebut).toLocaleDateString('fr-FR') : '',
        date_fin: eleve.dateFinPrevue ? new Date(eleve.dateFinPrevue).toLocaleDateString('fr-FR') : '',
        statut: eleve.statutFormation || 'EN_COURS',

        // Statistiques
        progression: stats.progression,
        heures_effectuees: eleve.heuresEffectuees || 0,
        heures_totales: eleve.heuresPrevues || 500,
        moyenne: stats.moyenne,
        absences: stats.absences,
        absences_non_justifiees: stats.absencesNonJustifiees,
        retards: stats.retards,

        // Alertes
        hasAlert: alertes.length > 0,
        alertes
      }
    })

    // Filtrage par alertes si demandé
    const elevesFiltres = hasAlert
      ? eleves.filter(e => e.hasAlert)
      : eleves

    return {
      eleves: elevesFiltres,
      total: elevesFiltres.length
    }
  }

  /**
   * Récupère le détail complet d'un élève
   */
  async getEleveDetail(id: number) {
    const eleve = await this.repository.findById(id)

    if (!eleve) {
      throw new Error('Élève non trouvé')
    }

    const prospect = eleve.candidat?.prospect
    const sessionActive = eleve.inscriptionsSessions?.[0]?.session
    const formation = sessionActive?.formation
    const formateur = sessionActive?.formateurPrincipal

    // Calcul des statistiques détaillées
    const stats = this.calculateEleveStats(eleve)
    const alertes = this.detectAlertes(eleve, stats)

    // Calcul financement
    const financement = this.calculateFinancement(eleve)

    // Formatage des évaluations
    const evaluations = eleve.evaluations?.map(evaluation => ({
      id: evaluation.idEvaluation,
      date: evaluation.dateEvaluation ? new Date(evaluation.dateEvaluation).toLocaleDateString('fr-FR') : '',
      type: evaluation.typeEvaluation,
      matiere: evaluation.matiere || 'Non spécifiée',
      note: Number(evaluation.note || 0),
      note_sur: Number(evaluation.noteSur || 20),
      coefficient: evaluation.coefficient || 1,
      appreciation: evaluation.appreciation || '',
      commentaire: evaluation.commentaire || '',
      formateur: evaluation.formateur ? `${evaluation.formateur.prenom} ${evaluation.formateur.nom}` : '',
      competences_validees: evaluation.competencesValidees || [],
      competences_a_travailler: evaluation.competencesATravailler || []
    })) || []

    // Formatage des présences
    const presences = eleve.presences?.map(presence => ({
      date: presence.dateCours ? new Date(presence.dateCours).toLocaleDateString('fr-FR') : '',
      matin: presence.creneauMatin || 'PRESENT',
      apres_midi: presence.creneauApresMidi || 'PRESENT',
      statut: presence.statutPresence || 'PRESENT',
      justificatif: presence.justificatifFourni,
      motif: presence.motifAbsence || ''
    })) || []

    // Formatage des documents
    const documents = eleve.candidat?.documentsCandidat?.map(doc => ({
      type: doc.typeDocument,
      statut: doc.statut || 'EN_ATTENTE',
      nom_fichier: doc.nomFichier || '',
      date: doc.dateReception ? new Date(doc.dateReception).toLocaleDateString('fr-FR') : null,
      url: doc.urlDrive || ''
    })) || []

    // Construction historique
    const historique = this.buildHistorique(eleve)

    return {
      // Identité
      id: eleve.idEleve,
      numero_dossier: eleve.numeroDossier,
      nom: prospect?.nom || '',
      prenom: prospect?.prenom || '',
      email: prospect?.emails?.[0] || '',
      telephone: prospect?.telephones?.[0] || '',
      adresse: prospect?.adresse || '',
      code_postal: prospect?.codePostal || '',
      ville: prospect?.ville || '',
      nb_echanges: prospect?.nbEchanges || 0,

      // Formation
      formation: formation?.nom || 'Non définie',
      code_formation: formation?.codeFormation || '',
      session: sessionActive?.nomSession || 'Non définie',
      formateur_principal: formateur ? `${formateur.prenom} ${formateur.nom}` : 'Non assigné',
      formateur_email: formateur?.email || '',
      formateur_telephone: formateur?.telephone || '',
      salle: sessionActive?.sallePrincipale || 'Non définie',

      // Dates et statut
      date_debut: eleve.dateDebut ? new Date(eleve.dateDebut).toLocaleDateString('fr-FR') : '',
      date_fin: eleve.dateFinPrevue ? new Date(eleve.dateFinPrevue).toLocaleDateString('fr-FR') : '',
      date_fin_reelle: eleve.dateFinReelle ? new Date(eleve.dateFinReelle).toLocaleDateString('fr-FR') : null,
      statut: eleve.statutFormation || 'EN_COURS',
      motif_abandon: eleve.motifAbandon || '',

      // Statistiques
      progression: stats.progression,
      heures_effectuees: eleve.heuresEffectuees || 0,
      heures_totales: eleve.heuresPrevues || 500,
      moyenne: stats.moyenne,
      moyenne_ponderee: stats.moyennePonderee,
      absences: stats.absences,
      absences_justifiees: stats.absencesJustifiees,
      absences_non_justifiees: stats.absencesNonJustifiees,
      retards: stats.retards,

      // Financement
      financement: financement.mode,
      montant_total: financement.montant_total,
      montant_paye: financement.montant_paye,
      reste_a_payer: financement.reste_a_payer,
      paiement_statut: financement.statut,

      // Détails
      evaluations,
      presences,
      documents,
      historique,
      alertes,

      // Prochaine évaluation
      prochaine_eval: this.getNextEvaluation(sessionActive),

      // Notes générales
      notes_generales: eleve.notesGenerales || ''
    }
  }

  /**
   * Récupère les valeurs pour les filtres
   */
  async getFilterValues() {
    const values = await this.repository.getDistinctValues()
    return {
      formations: values.formations,
      formateurs: values.formateurs.map(f => ({
        id: f.idFormateur,
        label: `${f.prenom} ${f.nom}`
      })),
      statuts: values.statuts
    }
  }

  /**
   * Calcule les statistiques d'un élève
   */
  private calculateEleveStats(eleve: any) {
    // Calcul de la moyenne
    let moyenne = 0
    let moyennePonderee = 0

    if (eleve.evaluations && eleve.evaluations.length > 0) {
      const totalPoints = eleve.evaluations.reduce((sum: number, e: any) =>
        sum + (Number(e.note || 0) * (e.coefficient || 1)), 0)
      const totalCoeffs = eleve.evaluations.reduce((sum: number, e: any) =>
        sum + (e.coefficient || 1), 0)

      moyennePonderee = totalCoeffs > 0 ? totalPoints / totalCoeffs : 0

      const moyenneSimple = eleve.evaluations.reduce((sum: number, e: any) =>
        sum + Number(e.note || 0), 0) / eleve.evaluations.length

      moyenne = moyennePonderee || moyenneSimple
    }

    // Calcul des présences
    let absences = 0
    let absencesJustifiees = 0
    let absencesNonJustifiees = 0
    let retards = 0

    if (eleve.presences) {
      eleve.presences.forEach((p: any) => {
        if (p.statutPresence === 'ABSENT') {
          absences++
          if (p.justificatifFourni) {
            absencesJustifiees++
          } else {
            absencesNonJustifiees++
          }
        } else if (p.statutPresence === 'RETARD') {
          retards++
        }
      })
    }

    // Calcul de la progression
    const heuresEffectuees = eleve.heuresEffectuees || 0
    const heuresPrevues = eleve.heuresPrevues || 500
    const progression = heuresPrevues > 0 ? Math.round((heuresEffectuees / heuresPrevues) * 100) : 0

    return {
      moyenne: Math.round(moyenne * 10) / 10,
      moyennePonderee: Math.round(moyennePonderee * 10) / 10,
      absences,
      absencesJustifiees,
      absencesNonJustifiees,
      retards,
      progression
    }
  }

  /**
   * Détecte les alertes pour un élève
   */
  private detectAlertes(eleve: any, stats: any) {
    const alertes = []

    if (stats.absencesNonJustifiees >= 3) {
      alertes.push({
        type: 'ABSENCE',
        message: `${stats.absencesNonJustifiees} absences non justifiées`,
        niveau: 'ERROR'
      })
    }

    if (stats.retards >= 4) {
      alertes.push({
        type: 'RETARD',
        message: `${stats.retards} retards enregistrés`,
        niveau: 'WARNING'
      })
    }

    if (stats.moyenne < 10 && stats.moyenne > 0) {
      alertes.push({
        type: 'NOTE',
        message: `Moyenne insuffisante (${stats.moyenne}/20)`,
        niveau: 'ERROR'
      })
    }

    return alertes
  }

  /**
   * Calcule les informations de financement
   */
  private calculateFinancement(eleve: any) {
    const candidat = eleve.candidat

    if (!candidat) {
      return {
        mode: 'Non défini',
        montant_total: 0,
        montant_paye: 0,
        reste_a_payer: 0,
        statut: 'NON_DEFINI'
      }
    }

    const montantTotal = Number(candidat.montantTotalFormation || 0)
    const montantPEC = Number(candidat.montantPriseEnCharge || 0)
    const resteACharge = Number(candidat.resteACharge || 0)

    // Simulation du montant payé (à adapter selon votre logique)
    const montantPaye = montantTotal - resteACharge

    return {
      mode: candidat.modeFinancement || 'Personnel',
      montant_total: montantTotal,
      montant_paye: montantPaye,
      reste_a_payer: resteACharge,
      statut: resteACharge > 0 ? 'EN_COURS' : 'A_JOUR'
    }
  }

  /**
   * Construit l'historique d'un élève
   */
  private buildHistorique(eleve: any) {
    const events = []

    // Date d'inscription
    if (eleve.creeLe) {
      events.push({
        date: new Date(eleve.creeLe).toLocaleDateString('fr-FR'),
        type: 'info',
        message: 'Inscription validée et début de formation'
      })
    }

    // Évaluations
    if (eleve.evaluations) {
      eleve.evaluations.forEach((evaluation: any) => {
        if (evaluation.dateEvaluation) {
          const note = Number(evaluation.note || 0)
          const type = note >= 15 ? 'success' : note >= 10 ? 'warning' : 'error'
          events.push({
            date: new Date(evaluation.dateEvaluation).toLocaleDateString('fr-FR'),
            type,
            message: `Évaluation ${evaluation.typeEvaluation} - ${evaluation.matiere} (${note}/20)`
          })
        }
      })
    }

    // Trier par date décroissante
    return events.sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'))
      const dateB = new Date(b.date.split('/').reverse().join('-'))
      return dateB.getTime() - dateA.getTime()
    })
  }

  /**
   * Détermine la prochaine évaluation
   */
  private getNextEvaluation(session: any) {
    // À implémenter selon votre logique métier
    // Pour l'instant, retourne une valeur par défaut
    return 'À planifier'
  }
}