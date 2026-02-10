/**
 * Script pour mettre à jour les statutProspect selon le cycle de vie
 *
 * Logique :
 * - Si prospect a un candidat avec statutDossier actif → statutProspect = CANDIDAT
 * - Si prospect a un candidat REFUSE → statutProspect = ANCIEN_CANDIDAT
 * - Si prospect a un élève avec statutFormation EN_COURS → statutProspect = ELEVE
 * - Si prospect a un élève TERMINE ou ABANDONNE → statutProspect = ANCIEN_ELEVE
 */

import prisma from './src/lib/prisma'

async function main() {
  console.log('=== MISE À JOUR STATUTS LIFECYCLE ===\n')

  // Statuts candidats actifs (en cours d'admission)
  const STATUTS_CANDIDAT_ACTIFS = [
    'RECU',
    'DOSSIER_EN_COURS',
    'DOSSIER_COMPLET',
    'ENTRETIEN_PLANIFIE',
    'DEVIS_ENVOYE',
    'DEVIS_ACCEPTE',
    'FINANCEMENT_EN_COURS',
    'FINANCEMENT_VALIDE',
    'ACCEPTE'
  ]

  // 1. Prospects avec candidats actifs → statutProspect = CANDIDAT
  const prospectsAvecCandidatsActifs = await prisma.prospect.findMany({
    where: {
      candidats: {
        some: {
          statutDossier: {
            in: STATUTS_CANDIDAT_ACTIFS
          }
        }
      }
    },
    select: {
      idProspect: true,
      nom: true,
      prenom: true,
      statutProspect: true,
      candidats: {
        select: {
          statutDossier: true
        }
      }
    }
  })

  console.log(`📋 ${prospectsAvecCandidatsActifs.length} prospects avec candidats actifs`)

  for (const prospect of prospectsAvecCandidatsActifs) {
    if (prospect.statutProspect !== 'CANDIDAT') {
      await prisma.prospect.update({
        where: { idProspect: prospect.idProspect },
        data: { statutProspect: 'CANDIDAT' }
      })
      console.log(`  ✅ ${prospect.prenom} ${prospect.nom}: ${prospect.statutProspect} → CANDIDAT`)
    }
  }

  // 2. Prospects avec candidats refusés UNIQUEMENT → statutProspect = ANCIEN_CANDIDAT
  const prospectsAvecCandidatsRefuses = await prisma.prospect.findMany({
    where: {
      AND: [
        {
          candidats: {
            some: {
              statutDossier: 'REFUSE'
            }
          }
        },
        {
          candidats: {
            none: {
              statutDossier: {
                in: STATUTS_CANDIDAT_ACTIFS
              }
            }
          }
        },
        {
          candidats: {
            none: {
              eleve: {
                isNot: null
              }
            }
          }
        }
      ]
    },
    select: {
      idProspect: true,
      nom: true,
      prenom: true,
      statutProspect: true
    }
  })

  console.log(`\n❌ ${prospectsAvecCandidatsRefuses.length} prospects avec candidats refusés uniquement`)

  for (const prospect of prospectsAvecCandidatsRefuses) {
    await prisma.prospect.update({
      where: { idProspect: prospect.idProspect },
      data: { statutProspect: 'ANCIEN_CANDIDAT' }
    })
    console.log(`  ✅ ${prospect.prenom} ${prospect.nom}: ${prospect.statutProspect} → ANCIEN_CANDIDAT`)
  }

  // 3. Prospects avec élèves EN_COURS → statutProspect = ELEVE
  const prospectsAvecElevesActifs = await prisma.prospect.findMany({
    where: {
      candidats: {
        some: {
          eleve: {
            statutFormation: 'EN_COURS'
          }
        }
      }
    },
    include: {
      candidats: {
        where: {
          eleve: {
            statutFormation: 'EN_COURS'
          }
        },
        include: {
          eleve: {
            select: {
              formationSuivie: true,
              statutFormation: true
            }
          }
        }
      }
    }
  })

  console.log(`\n🎓 ${prospectsAvecElevesActifs.length} prospects avec élèves actifs`)

  for (const prospect of prospectsAvecElevesActifs) {
    if (prospect.statutProspect !== 'ELEVE') {
      await prisma.prospect.update({
        where: { idProspect: prospect.idProspect },
        data: { statutProspect: 'ELEVE' }
      })
      console.log(`  ✅ ${prospect.prenom} ${prospect.nom}: ${prospect.statutProspect} → ELEVE`)
    }
  }

  // 4. Prospects avec élèves TERMINE ou ABANDONNE → statutProspect = ANCIEN_ELEVE
  const prospectsAvecElevesTermines = await prisma.prospect.findMany({
    where: {
      AND: [
        {
          candidats: {
            some: {
              eleve: {
                statutFormation: {
                  in: ['TERMINE', 'ABANDONNE', 'SUSPENDU']
                }
              }
            }
          }
        },
        {
          candidats: {
            none: {
              eleve: {
                statutFormation: 'EN_COURS'
              }
            }
          }
        }
      ]
    },
    include: {
      candidats: {
        where: {
          eleve: {
            statutFormation: {
              in: ['TERMINE', 'ABANDONNE', 'SUSPENDU']
            }
          }
        },
        include: {
          eleve: {
            select: {
              formationSuivie: true,
              statutFormation: true,
              dateFinReelle: true
            }
          }
        }
      }
    }
  })

  console.log(`\n📚 ${prospectsAvecElevesTermines.length} prospects avec formations terminées`)

  for (const prospect of prospectsAvecElevesTermines) {
    if (prospect.statutProspect !== 'ANCIEN_ELEVE') {
      await prisma.prospect.update({
        where: { idProspect: prospect.idProspect },
        data: { statutProspect: 'ANCIEN_ELEVE' }
      })
      console.log(`  ✅ ${prospect.prenom} ${prospect.nom}: ${prospect.statutProspect} → ANCIEN_ELEVE`)
    }
  }

  // 5. Résumé final
  console.log('\n=== RÉSUMÉ FINAL ===')

  const statutsFinaux = await prisma.$queryRaw<Array<{ statut_prospect: string, count: string }>>`
    SELECT statut_prospect, COUNT(*)::text as count
    FROM prospects
    WHERE statut_prospect IS NOT NULL
    GROUP BY statut_prospect
    ORDER BY statut_prospect
  `

  console.log('\n📊 STATUTS APRÈS MISE À JOUR:')
  statutsFinaux.forEach(s => {
    console.log(`  ${s.statut_prospect.padEnd(25)} → ${s.count} prospect(s)`)
  })

  console.log('\n✅ Mise à jour terminée')
  console.log('\n📌 Logique page Prospects:')
  console.log('  AFFICHER: NOUVEAU, EN_ATTENTE_DOSSIER, ANCIEN_CANDIDAT, ANCIEN_ELEVE')
  console.log('  MASQUER: CANDIDAT (actif), ELEVE (en formation)')

  await prisma.$disconnect()
}

main().catch(console.error)
