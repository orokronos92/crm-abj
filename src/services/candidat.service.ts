/**
 * Candidat Service
 * Gère la logique métier des candidats
 */

import { CandidatRepository } from '@/repositories/candidat.repository'
import prisma from '@/lib/prisma'

// Constantes pour les statuts
export const STATUT_DOSSIER_COLORS = {
  RECU: 'badge-info',
  EN_COURS: 'badge-warning',
  DOSSIER_EN_COURS: 'badge-warning',
  DOSSIER_COMPLET: 'badge-success',
  COMPLET: 'badge-success',
  REFUSE: 'badge-error',
  ACCEPTE: 'badge-success',
  DEVIS_ENVOYE: 'badge-info',
  DEVIS_ACCEPTE: 'badge-success',
  FINANCEMENT_EN_COURS: 'badge-warning',
  FINANCEMENT_VALIDE: 'badge-success',
  INSCRIT: 'badge-success'
} as const

export const STATUT_FINANCEMENT_COLORS = {
  EN_ATTENTE: 'badge-warning',
  EN_COURS: 'badge-info',
  VALIDE: 'badge-success',
  REFUSE: 'badge-error'
} as const

export class CandidatService {
  private repository: CandidatRepository

  constructor() {
    this.repository = new CandidatRepository()
  }

  /**
   * Récupère les candidats pour la liste (vue simplifiée)
   */
  async getCandidats(params: {
    statutDossier?: string
    statutFinancement?: string
    formation?: string
    search?: string
    take?: number
  }) {
    const { statutDossier, statutFinancement, formation, search, take = 100 } = params

    // Chargement du référentiel formations depuis la BDD
    const formationsRef = await prisma.formation.findMany({
      where: { actif: true },
      select: { codeFormation: true, nom: true }
    })
    const formationsMap = new Map(formationsRef.map(f => [f.codeFormation, f.nom]))

    // Construction des filtres
    const where: any = {}

    if (statutDossier && statutDossier !== 'TOUS') {
      where.statutDossier = statutDossier
    } else {
      // Par défaut, masquer les candidats déjà convertis en élèves
      where.statutDossier = {
        notIn: ['INSCRIT', 'CONVERTI']
      }
    }

    if (statutFinancement && statutFinancement !== 'TOUS') {
      where.statutFinancement = statutFinancement
    }

    if (formation && formation !== 'TOUS') {
      where.formationRetenue = formation
    }

    if (search) {
      where.OR = [
        { numeroDossier: { contains: search, mode: 'insensitive' } },
        {
          prospect: {
            OR: [
              { nom: { contains: search, mode: 'insensitive' } },
              { prenom: { contains: search, mode: 'insensitive' } },
              { emails: { has: search } }
            ]
          }
        }
      ]
    }

    const { data, total } = await this.repository.findAll({
      skip: 0,
      take,
      where
    })

    // Transformation des données pour la liste
    const candidats = data.map(candidat => ({
      id: candidat.idCandidat,
      numero_dossier: candidat.numeroDossier || '',
      nom: candidat.prospect?.nom || '',
      prenom: candidat.prospect?.prenom || '',
      email: candidat.prospect?.emails?.[0] || '',
      telephone: candidat.prospect?.telephones?.[0] || '',
      formation: formationsMap.get(candidat.formationRetenue || '') ?? (candidat.formationRetenue || ''),
      session: candidat.sessionVisee || 'Non définie',
      statut_dossier: candidat.statutDossier || 'RECU',
      statut_financement: candidat.statutFinancement || 'EN_ATTENTE',
      score: candidat.score || 0,
      date_candidature: candidat.dateCandidature
        ? new Date(candidat.dateCandidature).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
    }))

    return { candidats, total }
  }

  /**
   * Récupère tous les candidats avec filtres et pagination
   */
  async getAllCandidats(params: {
    page?: number
    limit?: number
    search?: string
    statut?: string
  }) {
    const { page = 1, limit = 10, search, statut } = params
    const skip = (page - 1) * limit

    // Construction des filtres
    const where: any = {}

    if (search) {
      where.OR = [
        { numero_dossier: { contains: search, mode: 'insensitive' } },
        {
          prospect: {
            OR: [
              { nom: { contains: search, mode: 'insensitive' } },
              { prenom: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ]
    }

    if (statut) {
      where.statut_dossier = statut
    }

    const { data, total } = await this.repository.findAll({
      skip,
      take: limit,
      where
    })

    // Transformation des données pour l'UI
    const candidats = data.map(candidat => ({
      id: candidat.idCandidat,
      nom: candidat.prospect?.nom || '',
      prenom: candidat.prospect?.prenom || '',
      email: candidat.prospect?.emails?.[0] || '',
      telephone: candidat.prospect?.telephones?.[0] || '',
      numero_dossier: candidat.numeroDossier || '',
      formation: candidat.formationRetenue || candidat.formationsDemandees?.[0] || '',
      session: candidat.sessionVisee || '',
      statut_dossier: candidat.statutDossier || 'RECU',
      statut_financement: candidat.statutFinancement || 'EN_ATTENTE',
      date_candidature: candidat.dateCandidature,
      score: candidat.score || 0,
      nb_echanges: candidat.prospect?.nbEchanges || 0,
      documents: this.mapDocuments(candidat.documentsCandidat),
      // Parcours admission
      entretien_telephonique: candidat.entretienTelephonique || false,
      rdv_presentiel: candidat.rdvPresentiel || false,
      test_technique: candidat.testTechnique || false,
      validation_pedagogique: candidat.validationPedagogique || false,
      // Financement
      montant_total: candidat.montantTotalFormation || 0,
      montant_pec: candidat.montantPriseEnCharge || 0,
      reste_a_charge: candidat.resteACharge || 0,
      mode_financement: candidat.modeFinancement || '',
      // Notes IA
      notes_ia: candidat.notesIa || ''
    }))

    return {
      candidats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * Récupère un candidat par son ID
   */
  async getCandidatById(id: number) {
    const candidat = await this.repository.findById(id)
    if (!candidat) {
      throw new Error('Candidat non trouvé')
    }

    return this.formatCandidatDetail(candidat)
  }

  /**
   * Récupère les statistiques des candidats
   */
  async getCandidatsStats() {
    const [
      countByStatut,
      financeStats
    ] = await Promise.all([
      this.repository.countByStatut(),
      this.repository.getFinanceStats()
    ])

    // Calcul des statistiques
    const total = Object.values(countByStatut).reduce((sum, count) => sum + count, 0)
    const enCours = countByStatut['EN_COURS'] || 0
    const complets = countByStatut['DOSSIER_COMPLET'] || 0
    const acceptes = countByStatut['ACCEPTE'] || 0

    return {
      total,
      enCours,
      complets,
      acceptes,
      tauxAcceptation: total > 0 ? Math.round((acceptes / total) * 100) : 0,
      finance: financeStats
    }
  }

  /**
   * Met à jour le statut d'un candidat
   */
  async updateCandidatStatut(id: number, statut: string) {
    // Validation du statut
    if (!STATUT_DOSSIER_COLORS[statut as keyof typeof STATUT_DOSSIER_COLORS]) {
      throw new Error('Statut invalide')
    }

    return await this.repository.update(id, {
      statutDossier: statut
    })
  }

  /**
   * Formate les documents pour l'UI
   */
  private mapDocuments(documents: any[] = []) {
    return documents.map(doc => ({
      type: doc.typeDocument,
      statut: doc.statut || 'MANQUANT'
    }))
  }

  /**
   * Formate un candidat détaillé
   */
  private formatCandidatDetail(candidat: any) {
    return {
      ...candidat,
      // Ajout des infos du prospect
      nom: candidat.prospect?.nom || '',
      prenom: candidat.prospect?.prenom || '',
      email: candidat.prospect?.emails?.[0] || '',
      telephone: candidat.prospect?.telephones?.[0] || '',
      // Formatage des documents
      documents: this.mapDocuments(candidat.documentsCandidat),
      // Calcul du score de progression
      progressionScore: this.calculateProgressionScore(candidat)
    }
  }

  /**
   * Calcule le score de progression d'un candidat
   */
  private calculateProgressionScore(candidat: any): number {
    let score = 0
    const weights = {
      dossier: 25,
      entretien: 20,
      test: 20,
      validation: 20,
      financement: 15
    }

    // Points selon le statut du dossier
    if (candidat.statutDossier === 'DOSSIER_COMPLET') score += weights.dossier

    // Points pour le parcours
    if (candidat.entretienTelephonique) score += weights.entretien
    if (candidat.testTechnique) score += weights.test
    if (candidat.validationPedagogique) score += weights.validation

    // Points pour le financement
    if (candidat.statutFinancement === 'VALIDE') score += weights.financement

    return score
  }

  /**
   * Obtient la couleur du badge selon le score
   */
  getScoreColor(score: number): string {
    if (score >= 80) return 'text-[rgb(var(--success))]'
    if (score >= 60) return 'text-[rgb(--warning))]'
    return 'text-[rgb(var(--error))]'
  }

  /**
   * Récupère les valeurs distinctes pour les filtres
   */
  async getFilterValues(): Promise<{
    statutsDossier: string[]
    statutsFinancement: string[]
    formations: Array<{ code: string; label: string }>
  }> {
    const [statutsDossier, statutsFinancement, formations] = await Promise.all([
      prisma.candidat.findMany({
        distinct: ['statutDossier'],
        select: { statutDossier: true },
        orderBy: { statutDossier: 'asc' }
      }),
      prisma.candidat.findMany({
        distinct: ['statutFinancement'],
        select: { statutFinancement: true },
        orderBy: { statutFinancement: 'asc' }
      }),
      prisma.formation.findMany({
        where: { actif: true },
        select: { codeFormation: true, nom: true },
        orderBy: { nom: 'asc' }
      })
    ])

    return {
      statutsDossier: statutsDossier
        .map(s => s.statutDossier)
        .filter((s): s is string => s !== null),
      statutsFinancement: statutsFinancement
        .map(s => s.statutFinancement)
        .filter((s): s is string => s !== null),
      formations: formations.map(f => ({
        code: f.codeFormation,
        label: f.nom
      }))
    }
  }
}