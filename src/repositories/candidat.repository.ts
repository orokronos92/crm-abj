/**
 * Candidat Repository
 * Gère l'accès aux données des candidats
 */

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class CandidatRepository {
  /**
   * Récupère tous les candidats avec pagination et filtres
   */
  async findAll(params: {
    skip?: number
    take?: number
    where?: Prisma.CandidatWhereInput
    orderBy?: Prisma.CandidatOrderByWithRelationInput
  }) {
    const { skip = 0, take = 10, where, orderBy } = params

    const [data, total] = await Promise.all([
      prisma.candidat.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { dateCandidature: 'desc' },
        include: {
          prospect: {
            select: {
              nom: true,
              prenom: true,
              emails: true,
              telephones: true,
              nbEchanges: true
            }
          },
          documentsCandidat: {
            select: {
              typeDocument: true,
              statut: true
            }
          }
        }
      }),
      prisma.candidat.count({ where })
    ])

    return { data, total }
  }

  /**
   * Récupère un candidat par son ID
   */
  async findById(id: number) {
    return await prisma.candidat.findUnique({
      where: { idCandidat: id },
      include: {
        prospect: true,
        documentsCandidat: true
      }
    })
  }

  /**
   * Récupère un candidat par son numéro de dossier
   */
  async findByNumeroDossier(numero: string) {
    return await prisma.candidat.findUnique({
      where: { numeroDossier: numero },
      include: {
        prospect: true,
        documentsCandidat: true
      }
    })
  }

  /**
   * Met à jour un candidat
   */
  async update(id: number, data: Prisma.CandidatUpdateInput) {
    return await prisma.candidat.update({
      where: { idCandidat: id },
      data: {
        ...data,
        modifieLe: new Date()
      }
    })
  }

  /**
   * Compte les candidats par statut
   */
  async countByStatut() {
    const result = await prisma.candidat.groupBy({
      by: ['statutDossier'],
      _count: {
        statutDossier: true
      }
    })

    return result.reduce((acc, item) => {
      acc[item.statutDossier || 'INCONNU'] = item._count.statutDossier
      return acc
    }, {} as Record<string, number>)
  }

  /**
   * Récupère les statistiques financières
   */
  async getFinanceStats() {
    const candidats = await prisma.candidat.findMany({
      where: {
        montantTotalFormation: {
          not: null
        }
      },
      select: {
        statutFinancement: true,
        montantTotalFormation: true,
        montantPriseEnCharge: true,
        resteACharge: true
      }
    })

    let totalFormations = 0
    let totalPriseEnCharge = 0
    let totalResteACharge = 0

    candidats.forEach(c => {
      totalFormations += Number(c.montantTotalFormation || 0)
      totalPriseEnCharge += Number(c.montantPriseEnCharge || 0)
      totalResteACharge += Number(c.resteACharge || 0)
    })

    return {
      totalFormations,
      totalPriseEnCharge,
      totalResteACharge,
      nombreCandidats: candidats.length
    }
  }
}