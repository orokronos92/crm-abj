/**
 * Prospect Repository
 * Gère l'accès aux données des prospects
 */

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class ProspectRepository {
  /**
   * Récupère tous les prospects avec pagination et filtres
   */
  async findAll(params: {
    skip?: number
    take?: number
    where?: Prisma.ProspectWhereInput
    orderBy?: Prisma.ProspectOrderByWithRelationInput
  }) {
    const { skip = 0, take = 10, where, orderBy } = params

    const [data, total] = await Promise.all([
      prisma.prospect.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { dateDernierContact: 'desc' },
        include: {
          candidats: {
            select: {
              idCandidat: true,
              numeroDossier: true,
              statutDossier: true
            }
          }
        }
      }),
      prisma.prospect.count({ where })
    ])

    return { data, total }
  }

  /**
   * Récupère un prospect par son ID
   */
  async findById(id: string) {
    return await prisma.prospect.findUnique({
      where: { idProspect: id },
      include: {
        candidats: true,
        historiqueEmails: {
          orderBy: { dateReception: 'desc' },
          take: 10
        }
      }
    })
  }

  /**
   * Recherche de prospects
   */
  async search(query: string) {
    return await prisma.prospect.findMany({
      where: {
        OR: [
          { nom: { contains: query, mode: 'insensitive' } },
          { prenom: { contains: query, mode: 'insensitive' } },
          { emails: { has: query } }
        ]
      },
      take: 10
    })
  }

  /**
   * Crée un nouveau prospect
   */
  async create(data: Prisma.ProspectCreateInput) {
    return await prisma.prospect.create({
      data: {
        ...data,
        datePremierContact: data.datePremierContact || new Date(),
        creeLe: new Date()
      }
    })
  }

  /**
   * Met à jour un prospect
   */
  async update(id: string, data: Prisma.ProspectUpdateInput) {
    return await prisma.prospect.update({
      where: { idProspect: id },
      data: {
        ...data,
        dateDernierContact: new Date(),
        modifieLe: new Date()
      }
    })
  }

  /**
   * Récupère les prospects par statut
   */
  async findByStatut(statut: string, limit: number = 10) {
    return await prisma.prospect.findMany({
      where: { statutProspect: statut },
      orderBy: { dateDernierContact: 'desc' },
      take: limit
    })
  }

  /**
   * Compte les prospects par source
   */
  async countBySource() {
    const result = await prisma.prospect.groupBy({
      by: ['sourceOrigine'],
      _count: {
        sourceOrigine: true
      }
    })

    return result.reduce((acc, item) => {
      acc[item.sourceOrigine || 'INCONNUE'] = item._count.sourceOrigine
      return acc
    }, {} as Record<string, number>)
  }
}