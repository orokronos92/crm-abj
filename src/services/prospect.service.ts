/**
 * Prospect Service
 * Logique métier pour les prospects
 */

import { ProspectRepository } from '@/repositories/prospect.repository'

export interface ProspectListItem {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  formationSouhaitee: string
  statut: string
  source: string
  financement: string
  nbEchanges: number
  dernierContact: string
  dateCreation: string
  ville: string
  codePostal: string
}

export interface ProspectDetail extends ProspectListItem {
  resumeIa: string
  datePremierContact: string
}

export class ProspectService {
  private repository: ProspectRepository

  constructor() {
    this.repository = new ProspectRepository()
  }

  /**
   * Récupère la liste des prospects pour affichage tableau
   */
  async getProspects(params?: {
    skip?: number
    take?: number
    statut?: string
    formation?: string
    financement?: string
    search?: string
  }): Promise<{ prospects: ProspectListItem[]; total: number }> {
    const { skip = 0, take = 50, statut, formation, financement, search } = params || {}

    // Construction du filtre where
    const where: any = {}

    /**
     * RÈGLE MÉTIER CRITIQUE :
     * La page Prospects affiche UNIQUEMENT les prospects disponibles pour marketing
     * - AFFICHER : NOUVEAU, EN_ATTENTE_DOSSIER, ANCIEN_CANDIDAT, ANCIEN_ELEVE
     * - MASQUER : CANDIDAT (admission en cours), ELEVE (formation en cours)
     */
    if (statut && statut !== 'TOUS') {
      where.statutProspect = statut
    } else {
      // Filtrer par défaut les statuts actifs (candidat/élève)
      where.statutProspect = {
        notIn: ['CANDIDAT', 'ELEVE']
      }
    }

    if (formation) {
      where.formationPrincipale = formation
    }

    if (financement) {
      where.modeFinancement = financement
    }

    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { emails: { has: search } },
        { telephones: { has: search } }
      ]
    }

    const { data, total } = await this.repository.findAll({
      skip,
      take,
      where,
      orderBy: { dateDernierContact: 'desc' }
    })

    const prospects = data.map(p => this.mapToListItem(p))

    return { prospects, total }
  }

  /**
   * Récupère les détails d'un prospect par ID
   */
  async getProspectById(id: string): Promise<ProspectDetail | null> {
    const prospect = await this.repository.findById(id)

    if (!prospect) return null

    return {
      id: prospect.idProspect,
      nom: prospect.nom || '',
      prenom: prospect.prenom || '',
      email: prospect.emails?.[0] || '',
      telephone: prospect.telephones?.[0] || '',
      formationSouhaitee: prospect.formationPrincipale || 'Non définie',
      statut: prospect.statutProspect || 'NOUVEAU',
      source: prospect.sourceOrigine || 'Non renseignée',
      financement: prospect.modeFinancement || 'Non défini',
      nbEchanges: prospect.nbEchanges || 0,
      dernierContact: this.formatDate(prospect.dateDernierContact),
      datePremierContact: this.formatDate(prospect.datePremierContact),
      dateCreation: this.formatDate(prospect.creeLe),
      ville: prospect.ville || '',
      codePostal: prospect.codePostal || '',
      resumeIa: prospect.resumeIa || 'Aucune analyse disponible'
    }
  }

  /**
   * Compte total des prospects
   */
  async getProspectsCount(): Promise<number> {
    const { total } = await this.repository.findAll({ take: 0 })
    return total
  }

  /**
   * Map un prospect Prisma vers ProspectListItem
   */
  private mapToListItem(prospect: any): ProspectListItem {
    return {
      id: prospect.idProspect,
      nom: prospect.nom || '',
      prenom: prospect.prenom || '',
      email: prospect.emails?.[0] || '',
      telephone: prospect.telephones?.[0] || '',
      formationSouhaitee: prospect.formationPrincipale || 'Non définie',
      statut: prospect.statutProspect || 'NOUVEAU',
      source: prospect.sourceOrigine || 'Non renseignée',
      financement: prospect.modeFinancement || 'Non défini',
      nbEchanges: prospect.nbEchanges || 0,
      dernierContact: this.formatDate(prospect.dateDernierContact),
      dateCreation: this.formatDate(prospect.creeLe),
      ville: prospect.ville || '',
      codePostal: prospect.codePostal || ''
    }
  }

  /**
   * Formate une date pour l'affichage
   */
  private formatDate(date: Date | null | undefined): string {
    if (!date) return 'Non renseigné'

    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }
}
