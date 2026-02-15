/**
 * Repository pour l'accès aux données des formateurs
 * Gère les requêtes Prisma avec toutes les relations nécessaires pour Qualiopi
 */

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class FormateurRepository {
  /**
   * Récupère la liste des formateurs avec filtres
   */
  async findAll(params: {
    skip?: number
    take?: number
    where?: Prisma.FormateurWhereInput
    orderBy?: Prisma.FormateurOrderByWithRelationInput
  }) {
    const { skip = 0, take = 100, where = {}, orderBy = { creeLe: 'desc' } } = params

    const [data, total] = await Promise.all([
      prisma.formateur.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          utilisateur: {
            select: {
              email: true,
              role: true,
              statutCompte: true
            }
          },
          sessionsPrincipales: {
            where: {
              statutSession: {
                in: ['EN_COURS', 'CONFIRMEE']
              }
            },
            include: {
              inscriptionsSessions: {
                include: {
                  eleve: {
                    select: {
                      idEleve: true,
                      statutFormation: true
                    }
                  }
                }
              }
            }
          },
          interventions: {
            where: {
              dateIntervention: {
                gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) // Dernier mois
              }
            },
            select: {
              dureeHeures: true,
              cout: true,
              facturePayee: true
            }
          },
          documents: {
            select: {
              idDocument: true,
              codeTypeDocument: true,
              statut: true,
              dateExpiration: true,
              typeDocument: {
                select: {
                  libelle: true,
                  obligatoire: true
                }
              }
            }
          }
        }
      }),
      prisma.formateur.count({ where })
    ])

    return { data, total }
  }

  /**
   * Récupère un formateur par son ID avec toutes les relations
   * ET tous les types de documents (existants ou non)
   */
  async findById(id: number) {
    // Récupérer le formateur avec ses documents existants
    const formateur = await prisma.formateur.findUnique({
      where: { idFormateur: id },
      include: {
        utilisateur: {
          select: {
            email: true,
            role: true,
            statutCompte: true,
            dateDerniereConnexion: true
          }
        },
        sessionsPrincipales: {
          include: {
            formation: true,
            inscriptionsSessions: {
              include: {
                eleve: {
                  include: {
                    candidat: {
                      include: {
                        prospect: {
                          select: {
                            nom: true,
                            prenom: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        interventions: {
          orderBy: { dateIntervention: 'desc' },
          include: {
            session: {
              include: {
                formation: true
              }
            }
          }
        },
        documents: {
          orderBy: { creeLe: 'desc' },
          include: {
            typeDocument: true,
            validateurAdmin: {
              select: {
                email: true
              }
            }
          }
        },
        disponibilites: {
          where: {
            date: {
              gte: new Date()
            }
          },
          orderBy: { date: 'asc' }
        }
      }
    })

    if (!formateur) return null

    // Récupérer TOUS les types de documents possibles
    const allDocumentTypes = await prisma.typeDocumentFormateur.findMany({
      orderBy: { ordreAffichage: 'asc' }
    })

    // Créer une liste complète des documents (existants + manquants)
    const documentsComplets = allDocumentTypes.map(type => {
      const existingDoc = formateur.documents.find(d => d.codeTypeDocument === type.code)

      if (existingDoc) {
        return existingDoc
      } else {
        // Document non fourni - créer un placeholder
        return {
          idDocument: 0,
          idFormateur: formateur.idFormateur,
          codeTypeDocument: type.code,
          libelle: type.libelle,
          urlFichier: '',
          nomFichier: null,
          tailleFichier: null,
          dateDocument: null,
          dateExpiration: null,
          statut: 'ATTENDU',
          validePar: null,
          dateValidation: null,
          commentaire: null,
          motifRejet: null,
          creeLe: null,
          modifieLe: null,
          typeDocument: type,
          validateurAdmin: null
        }
      }
    })

    // Remplacer les documents par la liste complète
    return {
      ...formateur,
      documents: documentsComplets
    }
  }

  /**
   * Récupère les valeurs distinctes pour les filtres
   */
  async getDistinctValues() {
    const [statuts, specialites] = await Promise.all([
      // Statuts distincts
      prisma.formateur.findMany({
        distinct: ['statut'],
        select: { statut: true }
      }),
      // Spécialités uniques (array field)
      prisma.$queryRaw<{ specialite: string }[]>`
        SELECT DISTINCT unnest(specialites) as specialite
        FROM formateurs
        ORDER BY specialite
      `
    ])

    return {
      statuts: statuts.map(s => s.statut).filter(Boolean),
      specialites: specialites.map(s => s.specialite)
    }
  }

  /**
   * Met à jour un formateur
   */
  async update(id: number, data: Prisma.FormateurUpdateInput) {
    return await prisma.formateur.update({
      where: { idFormateur: id },
      data
    })
  }

  /**
   * Récupère les statistiques globales des formateurs
   */
  async getStats() {
    const [
      totalFormateurs,
      formateursActifs,
      totalEleves,
      sessionsActives,
      documentsManquants
    ] = await Promise.all([
      // Total formateurs
      prisma.formateur.count(),

      // Formateurs actifs
      prisma.formateur.count({
        where: { statut: 'ACTIF' }
      }),

      // Total élèves suivis (via sessions)
      prisma.inscriptionSession.count({
        where: {
          session: {
            formateurPrincipalId: { not: null },
            statutSession: { in: ['EN_COURS', 'CONFIRMEE'] }
          },
          eleve: {
            statutFormation: 'EN_COURS'
          }
        }
      }),

      // Sessions actives
      prisma.session.count({
        where: {
          formateurPrincipalId: { not: null },
          statutSession: { in: ['EN_COURS', 'CONFIRMEE'] }
        }
      }),

      // Documents manquants ou expirés
      prisma.documentFormateur.count({
        where: {
          OR: [
            { statut: 'ATTENDU' },
            { statut: 'EXPIRE' },
            {
              dateExpiration: {
                lte: new Date()
              }
            }
          ]
        }
      })
    ])

    return {
      totalFormateurs,
      formateursActifs,
      totalEleves,
      sessionsActives,
      documentsManquants
    }
  }

  /**
   * Récupère les documents d'un formateur groupés par type
   */
  async getDocumentsByFormateur(idFormateur: number) {
    const documents = await prisma.documentFormateur.findMany({
      where: { idFormateur },
      include: {
        typeDocument: true
      },
      orderBy: { creeLe: 'desc' }
    })

    // Grouper par type de document
    const grouped = documents.reduce((acc, doc) => {
      const type = doc.typeDocument.libelle
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(doc)
      return acc
    }, {} as Record<string, typeof documents>)

    return grouped
  }

  /**
   * Vérifie la conformité Qualiopi d'un formateur
   * @param idFormateur ID du formateur
   * @param useFullData Si true, récupère toutes les données avec findById. Si false, utilise les données existantes.
   */
  async checkQualiopi(idFormateur: number, useFullData: boolean = true) {
    // Si on veut la vérification complète, on récupère toutes les données
    if (useFullData) {
      const formateur = await this.findById(idFormateur)
      if (!formateur) return null

      return this.checkQualiopiFromData(formateur)
    }

    // Sinon, on fait une vérification basique avec les documents existants
    // et on récupère le nombre de types obligatoires pour calculer les manquants
    const [formateur, allTypes] = await Promise.all([
      prisma.formateur.findUnique({
        where: { idFormateur },
        include: {
          documents: {
            include: {
              typeDocument: true
            }
          }
        }
      }),
      prisma.typeDocumentFormateur.findMany({
        where: { obligatoire: true }
      })
    ])

    if (!formateur) return null

    const issues = []

    // Documents expirés parmi ceux qui existent
    const documentsExpires = formateur.documents.filter(d =>
      d.dateExpiration && new Date(d.dateExpiration) < new Date()
    )

    // Documents obligatoires qui n'existent pas du tout en base
    const existingTypeCodes = formateur.documents.map(d => d.codeTypeDocument)
    const missingTypes = allTypes.filter(type => !existingTypeCodes.includes(type.code))

    // Documents existants mais avec statut ATTENDU
    const documentsAttendus = formateur.documents.filter(d =>
      d.statut === 'ATTENDU' && d.typeDocument.obligatoire
    )

    const totalManquants = missingTypes.length + documentsAttendus.length

    if (documentsExpires.length > 0) {
      issues.push({
        type: 'DOCUMENTS_EXPIRES',
        count: documentsExpires.length,
        details: documentsExpires.map(d => d.typeDocument.libelle)
      })
    }

    if (totalManquants > 0) {
      issues.push({
        type: 'DOCUMENTS_MANQUANTS',
        count: totalManquants,
        details: [
          ...missingTypes.map(t => t.libelle),
          ...documentsAttendus.map(d => d.typeDocument.libelle)
        ]
      })
    }

    if (!formateur.cvUrl) {
      issues.push({
        type: 'CV_MANQUANT',
        count: 1,
        details: ['CV non téléversé']
      })
    }

    return {
      conforme: issues.length === 0,
      issues,
      dossierComplet: formateur.dossierComplet,
      dateValidation: formateur.dateValidationQualiopi
    }
  }

  /**
   * Méthode helper pour vérifier Qualiopi sur des données déjà récupérées
   */
  private checkQualiopiFromData(formateur: any) {
    const issues = []

    // Documents expirés (tous, obligatoires ou non)
    const documentsExpires = formateur.documents.filter(d =>
      d.dateExpiration && new Date(d.dateExpiration) < new Date()
    )

    // Documents manquants - SEULEMENT les obligatoires avec statut ATTENDU
    const documentsManquants = formateur.documents.filter(d =>
      d.statut === 'ATTENDU' && d.typeDocument && d.typeDocument.obligatoire === true
    )

    if (documentsExpires.length > 0) {
      issues.push({
        type: 'DOCUMENTS_EXPIRES',
        count: documentsExpires.length,
        details: documentsExpires.map(d => d.typeDocument ? d.typeDocument.libelle : 'Document')
      })
    }

    if (documentsManquants.length > 0) {
      issues.push({
        type: 'DOCUMENTS_MANQUANTS',
        count: documentsManquants.length,
        details: documentsManquants.map(d => d.typeDocument ? d.typeDocument.libelle : 'Document')
      })
    }

    // CV manquant seulement si le CV n'est pas dans les documents ou si cvUrl est vide
    const cvDocument = formateur.documents.find(d => d.codeTypeDocument === 'CV')
    const cvManquant = !formateur.cvUrl && (!cvDocument || cvDocument.statut === 'ATTENDU')

    if (cvManquant) {
      issues.push({
        type: 'CV_MANQUANT',
        count: 1,
        details: ['CV non téléversé']
      })
    }

    return {
      conforme: issues.length === 0,
      issues,
      dossierComplet: formateur.dossierComplet,
      dateValidation: formateur.dateValidationQualiopi
    }
  }
}