/**
 * Dashboard Repository
 * Gère l'accès aux données pour le tableau de bord
 * Requêtes Prisma pures, pas de logique métier
 */

import prisma from '@/lib/prisma'

export class DashboardRepository {
  /**
   * Compte le nombre total de prospects
   */
  async countProspects(): Promise<number> {
    return await prisma.prospect.count()
  }

  /**
   * Compte les prospects créés cette semaine
   */
  async countProspectsThisWeek(): Promise<number> {
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - 7)

    return await prisma.prospect.count({
      where: {
        datePremierContact: {
          gte: startOfWeek
        }
      }
    })
  }

  /**
   * Compte le nombre total de candidats
   */
  async countCandidats(): Promise<number> {
    return await prisma.candidat.count()
  }

  /**
   * Compte les candidats par statut
   */
  async countCandidatsByStatus(statut: string): Promise<number> {
    return await prisma.candidat.count({
      where: {
        statutDossier: statut
      }
    })
  }

  /**
   * Compte le nombre d'élèves actifs
   */
  async countElevesActifs(): Promise<number> {
    return await prisma.eleve.count({
      where: {
        statutFormation: 'EN_COURS'
      }
    })
  }

  /**
   * Compte le nombre total d'élèves
   */
  async countEleves(): Promise<number> {
    return await prisma.eleve.count()
  }

  /**
   * Compte le nombre de formateurs
   */
  async countFormateurs(): Promise<number> {
    return await prisma.formateur.count()
  }

  /**
   * Compte les formateurs actifs
   */
  async countFormateursActifs(): Promise<number> {
    return await prisma.formateur.count({
      where: {
        statut: 'ACTIF'
      }
    })
  }

  /**
   * Récupère les derniers prospects
   */
  async getRecentProspects(limit: number = 3) {
    return await prisma.prospect.findMany({
      take: limit,
      orderBy: {
        datePremierContact: 'desc'
      },
      select: {
        idProspect: true,
        nom: true,
        prenom: true,
        emails: true,
        formationPrincipale: true,
        statutProspect: true,
        datePremierContact: true
      }
    })
  }

  /**
   * Récupère les statistiques par formation
   */
  async getFormationsStats() {
    const result = await prisma.prospect.groupBy({
      by: ['formationPrincipale'],
      _count: {
        formationPrincipale: true
      },
      where: {
        formationPrincipale: {
          not: null
        }
      },
      orderBy: {
        _count: {
          formationPrincipale: 'desc'
        }
      },
      take: 5
    })

    return result.map(item => ({
      formation: item.formationPrincipale,
      count: item._count.formationPrincipale
    }))
  }

  /**
   * Récupère les données financières des candidats
   */
  async getCandidatsFinanciers() {
    return await prisma.candidat.findMany({
      where: {
        montantTotalFormation: {
          not: null
        }
      },
      select: {
        statutDossier: true,
        statutFinancement: true,
        montantTotalFormation: true,
        montantPriseEnCharge: true,
        resteACharge: true
      }
    })
  }
}