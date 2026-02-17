import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class EleveRepository {
  /**
   * Récupère la liste des élèves avec pagination et filtres
   */
  async findAll(params: {
    skip?: number
    take?: number
    where?: Prisma.EleveWhereInput
    orderBy?: Prisma.EleveOrderByWithRelationInput
  }) {
    const { skip = 0, take = 100, where = {}, orderBy = { creeLe: 'desc' } } = params

    const [data, total] = await Promise.all([
      prisma.eleve.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          candidat: {
            include: {
              prospect: {
                select: {
                  nom: true,
                  prenom: true,
                  emails: true,
                  telephones: true,
                  adresse: true,
                  codePostal: true,
                  ville: true
                }
              }
            }
          },
          inscriptionsSessions: {
            include: {
              session: {
                include: {
                  formation: true,
                  formateurPrincipal: {
                    select: {
                      nom: true,
                      prenom: true
                    }
                  }
                }
              }
            }
          },
          evaluations: {
            orderBy: { dateEvaluation: 'desc' },
            take: 10 // Limiter pour la liste
          },
          presences: {
            orderBy: { dateCours: 'desc' },
            take: 30 // Limiter pour les calculs récents
          }
        }
      }),
      prisma.eleve.count({ where })
    ])

    return { data, total }
  }

  /**
   * Récupère un élève par son ID avec toutes les relations
   */
  async findById(id: number) {
    return await prisma.eleve.findUnique({
      where: { idEleve: id },
      include: {
        candidat: {
          include: {
            prospect: {
              select: {
                nom: true,
                prenom: true,
                emails: true,
                telephones: true,
                adresse: true,
                codePostal: true,
                ville: true,
                nbEchanges: true,
                dateDernierContact: true
              }
            },
            documentsCandidat: {
              orderBy: { creeLe: 'desc' }
            }
          }
        },
        inscriptionsSessions: {
          include: {
            session: {
              include: {
                formation: true,
                formateurPrincipal: {
                  select: {
                    nom: true,
                    prenom: true,
                    email: true,
                    telephone: true,
                    specialites: true
                  }
                }
              }
            }
          }
        },
        evaluations: {
          orderBy: { dateEvaluation: 'desc' },
          include: {
            formateur: {
              select: {
                nom: true,
                prenom: true
              }
            },
            session: {
              select: {
                nomSession: true
              }
            }
          }
        },
        presences: {
          orderBy: { dateCours: 'desc' }
        }
      }
    })
  }

  /**
   * Récupère les valeurs uniques pour les filtres
   */
  async getDistinctValues() {
    const [formations, statuts, formateurs] = await Promise.all([
      // Formations via sessions
      prisma.session.findMany({
        select: {
          formation: {
            select: {
              codeFormation: true,
              nom: true
            }
          }
        },
        distinct: ['idFormation']
      }),
      // Statuts élèves
      prisma.eleve.findMany({
        distinct: ['statutFormation'],
        select: { statutFormation: true },
        where: { statutFormation: { not: null } }
      }),
      // Formateurs via sessions
      prisma.formateur.findMany({
        select: {
          idFormateur: true,
          nom: true,
          prenom: true
        },
        where: {
          sessionsPrincipales: {
            some: {}
          }
        }
      })
    ])

    return {
      formations: formations.map(f => f.formation),
      statuts: statuts.map(s => s.statutFormation).filter(Boolean) as string[],
      formateurs
    }
  }

  /**
   * Met à jour un élève
   */
  async update(id: number, data: Prisma.EleveUpdateInput) {
    return await prisma.eleve.update({
      where: { idEleve: id },
      data
    })
  }

  /**
   * Récupère les statistiques d'un élève
   */
  async getStats(idEleve: number) {
    const [evaluations, presences] = await Promise.all([
      prisma.evaluation.findMany({
        where: { idEleve },
        select: {
          note: true,
          noteSur: true
        }
      }),
      prisma.presence.groupBy({
        by: ['statutPresence'],
        where: { idEleve },
        _count: true
      })
    ])

    return { evaluations, presences }
  }
}