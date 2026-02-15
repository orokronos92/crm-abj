import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Backup JSON des formateurs
const formateurBackup: Record<number, any> = {
  "2": {
    "nom": "Philippe Dubois",
    "portfolio": {
      "realisations": [
        {
          "annee": 2023,
          "titre": "Bague haute joaillerie",
          "client": "Cartier",
          "description": "Serti invisible 48 diamants"
        },
        {
          "annee": 2023,
          "titre": "Parure émeraudes",
          "client": "Mauboussin",
          "description": "Serti rail et grain"
        }
      ]
    },
    "certifications": [
      {
        "nom": "CAP Art du Bijou",
        "organisme": "Éducation Nationale",
        "dateObtention": "1998-06",
        "dateExpiration": null
      },
      {
        "nom": "Meilleur Ouvrier de France",
        "organisme": "COET-MOF",
        "dateObtention": "2010-11",
        "dateExpiration": null
      },
      {
        "nom": "Certificat Qualiopi Formateur",
        "organisme": "AFNOR",
        "dateObtention": "2023-01",
        "dateExpiration": "2026-01"
      }
    ],
    "formationsContinues": [
      {
        "date": "2023-09",
        "duree": "3 jours",
        "titre": "Nouvelles techniques de sertissage laser",
        "organisme": "École Boulle"
      },
      {
        "date": "2023-03",
        "duree": "5 jours",
        "titre": "Formation formateur niveau 2",
        "organisme": "AFPA"
      }
    ]
  },
  "3": {
    "nom": "Catherine Martin",
    "portfolio": {
      "collections": [
        {
          "nom": "Géométrie Sacrée",
          "annee": 2023,
          "pieces": 12,
          "exposition": "Salon Révélations"
        },
        {
          "nom": "Nature Urbaine",
          "annee": 2022,
          "pieces": 8,
          "exposition": "Biennale Émergences"
        }
      ]
    },
    "certifications": [
      {
        "nom": "CAP Art du Bijou",
        "organisme": "Éducation Nationale",
        "dateObtention": "2005-06",
        "dateExpiration": null
      },
      {
        "nom": "DMA Art du Bijou",
        "organisme": "École Boulle",
        "dateObtention": "2008-06",
        "dateExpiration": null
      },
      {
        "nom": "Formation de formateur",
        "organisme": "AFPA",
        "dateObtention": "2020-09",
        "dateExpiration": "2025-09"
      }
    ],
    "formationsContinues": [
      {
        "date": "2023-11",
        "duree": "2 jours",
        "titre": "Tendances joaillerie 2024",
        "organisme": "Francéclat"
      },
      {
        "date": "2023-06",
        "duree": "3 jours",
        "titre": "Marketing digital pour artisans",
        "organisme": "CMA"
      }
    ]
  },
  "4": {
    "nom": "Jean-Pierre Bernard",
    "portfolio": {
      "projets": [
        {
          "nom": "Ligne haute joaillerie Cartier",
          "annee": 2023,
          "pieces": 25,
          "logiciel": "MatrixGold"
        },
        {
          "nom": "Collection capsule Messika",
          "annee": 2023,
          "pieces": 15,
          "logiciel": "Rhinoceros"
        }
      ]
    },
    "certifications": [
      {
        "nom": "Certification Rhinoceros",
        "organisme": "McNeel",
        "dateObtention": "2018-03",
        "dateExpiration": null
      },
      {
        "nom": "Certification MatrixGold",
        "organisme": "Gemvision",
        "dateObtention": "2020-06",
        "dateExpiration": null
      },
      {
        "nom": "Formateur certifié",
        "organisme": "CCI",
        "dateObtention": "2021-09",
        "dateExpiration": "2024-09"
      }
    ],
    "formationsContinues": [
      {
        "date": "2023-10",
        "duree": "2 jours",
        "titre": "Rhinoceros 8 nouvelles fonctionnalités",
        "organisme": "McNeel"
      },
      {
        "date": "2023-05",
        "duree": "3 jours",
        "titre": "IA et design génératif",
        "organisme": "École des Mines"
      }
    ]
  },
  "5": {
    "nom": "Sophie Petit",
    "portfolio": {
      "expertises": [
        {
          "annee": 2023,
          "titre": "Rubis Birman 15ct",
          "client": "Sotheby's",
          "valeur": "2.5M€"
        },
        {
          "annee": 2023,
          "titre": "Émeraude Colombie 8ct",
          "client": "Christie's",
          "valeur": "800k€"
        }
      ]
    },
    "certifications": [
      {
        "nom": "DU Gemmologie",
        "organisme": "Université de Nantes",
        "dateObtention": "2003-06",
        "dateExpiration": null
      },
      {
        "nom": "FGA",
        "organisme": "Gem-A London",
        "dateObtention": "2005-12",
        "dateExpiration": null
      },
      {
        "nom": "Expert judiciaire",
        "organisme": "Cour d'Appel de Paris",
        "dateObtention": "2015-01",
        "dateExpiration": "2025-01"
      }
    ],
    "formationsContinues": [
      {
        "date": "2023-09",
        "duree": "3 jours",
        "titre": "Nouvelles synthèses 2023",
        "organisme": "IGA"
      },
      {
        "date": "2023-04",
        "duree": "2 jours",
        "titre": "Émeraudes traitées",
        "organisme": "SSEF"
      }
    ]
  },
  "6": {
    "nom": "François Moreau",
    "portfolio": {
      "specialites": [
        "Finitions haute joaillerie",
        "Restauration pièces anciennes"
      ]
    },
    "certifications": [
      {
        "nom": "CAP Bijouterie",
        "organisme": "Éducation Nationale",
        "dateObtention": "2001-06"
      }
    ],
    "formationsContinues": [
      {
        "date": "2023-05",
        "duree": "2 jours",
        "titre": "Nouvelles techniques de finition",
        "organisme": "École Boulle"
      }
    ]
  },
  "7": {
    "nom": "Isabelle Laurent",
    "portfolio": {
      "publications": [
        "Histoire de la joaillerie française",
        "Les techniques oubliées"
      ]
    },
    "certifications": [
      {
        "nom": "Doctorat Histoire de l'art",
        "organisme": "Sorbonne",
        "dateObtention": "2008-12"
      },
      {
        "nom": "Agrégation",
        "organisme": "Éducation Nationale",
        "dateObtention": "2009-07"
      }
    ],
    "formationsContinues": [
      {
        "date": "2023-09",
        "duree": "3 jours",
        "titre": "Conservation préventive bijoux",
        "organisme": "INP"
      }
    ]
  },
  "8": {
    "nom": "Michel Leroy",
    "portfolio": {
      "projets": [
        "Formation initiation ABJ",
        "Stages découverte métier"
      ]
    },
    "certifications": [
      {
        "nom": "CAP Bijouterie",
        "organisme": "Éducation Nationale",
        "dateObtention": "2005-06"
      },
      {
        "nom": "BP Bijouterie",
        "organisme": "CMA",
        "dateObtention": "2008-06"
      }
    ],
    "formationsContinues": [
      {
        "date": "2023-03",
        "duree": "5 jours",
        "titre": "Pédagogie pour adultes",
        "organisme": "AFPA"
      }
    ]
  },
  "9": {
    "nom": "Pierre Durand",
    "portfolio": {
      "projets": [
        "Collection 100% recyclée",
        "Formation bijouterie durable"
      ]
    },
    "certifications": [
      {
        "nom": "Master Métallurgie",
        "organisme": "École des Mines",
        "dateObtention": "2007-06"
      },
      {
        "nom": "Certification RJC",
        "organisme": "Responsible Jewellery Council",
        "dateObtention": "2020-03"
      }
    ],
    "formationsContinues": [
      {
        "date": "2023-11",
        "duree": "2 jours",
        "titre": "Nouvelles normes recyclage",
        "organisme": "Francéclat"
      }
    ]
  }
}

async function main() {
  console.log('🔄 Repopulation des données formateurs depuis backup JSON\n')

  let totalCertifications = 0
  let totalFormations = 0
  let totalPortfolio = 0

  for (const [idFormateurStr, data] of Object.entries(formateurBackup)) {
    const idFormateur = parseInt(idFormateurStr)
    console.log(`\n📝 Migration ${data.nom} (ID: ${idFormateur})`)

    // 1. Certifications
    if (data.certifications && Array.isArray(data.certifications)) {
      for (const cert of data.certifications) {
        await prisma.formateurCertification.create({
          data: {
            idFormateur,
            nomCertification: cert.nom,
            organisme: cert.organisme,
            dateObtention: new Date(cert.dateObtention + '-01'),
            dateExpiration: cert.dateExpiration ? new Date(cert.dateExpiration + '-01') : null,
            statut: cert.dateExpiration && new Date(cert.dateExpiration) < new Date() ? 'EXPIRE' : 'VALIDE'
          }
        })
        totalCertifications++
      }
      console.log(`  ✓ ${data.certifications.length} certifications`)
    }

    // 2. Formations continues
    if (data.formationsContinues && Array.isArray(data.formationsContinues)) {
      for (const formation of data.formationsContinues) {
        // Parser la durée
        const dureeMatch = formation.duree.match(/(\d+)\s*(jour|heure)/)
        const dureeHeures = dureeMatch
          ? dureeMatch[2] === 'jour'
            ? parseInt(dureeMatch[1]) * 7
            : parseInt(dureeMatch[1])
          : 14 // Défaut 2 jours

        await prisma.formateurFormationContinue.create({
          data: {
            idFormateur,
            intitule: formation.titre,
            organisme: formation.organisme,
            dateDebut: new Date(formation.date + '-01'),
            dureeHeures,
            domaine: 'Technique métier',
            statut: 'TERMINE'
          }
        })
        totalFormations++
      }
      console.log(`  ✓ ${data.formationsContinues.length} formations continues`)
    }

    // 3. Portfolio
    if (data.portfolio) {
      const portfolio = data.portfolio

      // Type 1: realisations (Philippe Dubois)
      if (portfolio.realisations && Array.isArray(portfolio.realisations)) {
        for (const real of portfolio.realisations) {
          await prisma.formateurPortfolio.create({
            data: {
              idFormateur,
              titre: real.titre,
              description: `${real.description} - Client: ${real.client}`,
              annee: real.annee.toString()
            }
          })
          totalPortfolio++
        }
      }

      // Type 2: collections (Catherine Martin)
      if (portfolio.collections && Array.isArray(portfolio.collections)) {
        for (const coll of portfolio.collections) {
          await prisma.formateurPortfolio.create({
            data: {
              idFormateur,
              titre: coll.nom,
              description: `${coll.pieces} pièces - ${coll.exposition}`,
              annee: coll.annee.toString()
            }
          })
          totalPortfolio++
        }
      }

      // Type 3: projets (Jean-Pierre Bernard, Michel Leroy, Pierre Durand)
      if (portfolio.projets && Array.isArray(portfolio.projets)) {
        for (const proj of portfolio.projets) {
          if (typeof proj === 'string') {
            // Projets simples (Michel, Pierre)
            await prisma.formateurPortfolio.create({
              data: {
                idFormateur,
                titre: proj,
                annee: '2023'
              }
            })
          } else {
            // Projets détaillés (Jean-Pierre)
            await prisma.formateurPortfolio.create({
              data: {
                idFormateur,
                titre: proj.nom,
                description: `${proj.pieces} pièces - Logiciel: ${proj.logiciel || 'Non spécifié'}`,
                annee: proj.annee.toString()
              }
            })
          }
          totalPortfolio++
        }
      }

      // Type 4: expertises (Sophie Petit)
      if (portfolio.expertises && Array.isArray(portfolio.expertises)) {
        for (const exp of portfolio.expertises) {
          await prisma.formateurPortfolio.create({
            data: {
              idFormateur,
              titre: exp.titre,
              description: `Client: ${exp.client} - Valeur: ${exp.valeur}`,
              annee: exp.annee.toString()
            }
          })
          totalPortfolio++
        }
      }

      // Type 5: specialites (François Moreau)
      if (portfolio.specialites && Array.isArray(portfolio.specialites)) {
        for (const spec of portfolio.specialites) {
          await prisma.formateurPortfolio.create({
            data: {
              idFormateur,
              titre: spec,
              annee: '2023'
            }
          })
          totalPortfolio++
        }
      }

      // Type 6: publications (Isabelle Laurent)
      if (portfolio.publications && Array.isArray(portfolio.publications)) {
        for (const pub of portfolio.publications) {
          await prisma.formateurPortfolio.create({
            data: {
              idFormateur,
              titre: pub,
              description: 'Publication professionnelle',
              annee: '2023'
            }
          })
          totalPortfolio++
        }
      }

      console.log(`  ✓ Portfolio migré`)
    }
  }

  console.log('\n✅ Migration terminée !')
  console.log(`\n📊 Résumé:`)
  console.log(`  - ${totalCertifications} certifications`)
  console.log(`  - ${totalFormations} formations continues`)
  console.log(`  - ${totalPortfolio} éléments portfolio`)
  console.log(`  - Total: ${totalCertifications + totalFormations + totalPortfolio} enregistrements créés`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
