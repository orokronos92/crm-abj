import prisma from '../src/lib/prisma'

async function updateStatutsLifecycle() {
  console.log('🔄 Mise à jour des statuts du cycle de vie des prospects...\n')
  console.log('=' .repeat(60))

  try {
    const STATUTS_CANDIDAT_ACTIFS = [
      'RECU', 'DOSSIER_EN_COURS', 'DOSSIER_COMPLET',
      'ENTRETIEN_PLANIFIE', 'DEVIS_ENVOYE', 'DEVIS_ACCEPTE',
      'FINANCEMENT_EN_COURS', 'FINANCEMENT_VALIDE', 'ACCEPTE'
    ]

    // 1. Prospects avec candidats actifs → CANDIDAT
    console.log('\n📋 Mise à jour prospects avec candidats actifs...')
    const prospectsAvecCandidatsActifs = await prisma.prospect.findMany({
      where: {
        candidats: {
          some: {
            statutDossier: { in: STATUTS_CANDIDAT_ACTIFS }
          }
        }
      },
      include: {
        candidats: {
          select: { statutDossier: true }
        }
      }
    })

    let countCandidats = 0
    for (const prospect of prospectsAvecCandidatsActifs) {
      if (prospect.statutProspect !== 'CANDIDAT') {
        await prisma.prospect.update({
          where: { idProspect: prospect.idProspect },
          data: { statutProspect: 'CANDIDAT' }
        })
        countCandidats++
        console.log(`   ✅ ${prospect.nom} ${prospect.prenom} → CANDIDAT`)
      }
    }

    // 2. Prospects avec candidats refusés uniquement → ANCIEN_CANDIDAT
    console.log('\n📋 Mise à jour prospects avec candidats refusés...')
    const prospectsAvecCandidatsRefuses = await prisma.prospect.findMany({
      where: {
        AND: [
          { candidats: { some: { statutDossier: 'REFUSE' } } },
          { candidats: { none: { statutDossier: { in: STATUTS_CANDIDAT_ACTIFS } } } },
          { candidats: { none: { eleve: { isNot: null } } } }
        ]
      }
    })

    let countAnciensCandidats = 0
    for (const prospect of prospectsAvecCandidatsRefuses) {
      if (prospect.statutProspect !== 'ANCIEN_CANDIDAT') {
        await prisma.prospect.update({
          where: { idProspect: prospect.idProspect },
          data: { statutProspect: 'ANCIEN_CANDIDAT' }
        })
        countAnciensCandidats++
        console.log(`   ✅ ${prospect.nom} ${prospect.prenom} → ANCIEN_CANDIDAT`)
      }
    }

    // 3. Prospects avec élèves EN_COURS → ELEVE
    console.log('\n📋 Mise à jour prospects avec élèves actifs...')
    const prospectsAvecElevesActifs = await prisma.prospect.findMany({
      where: {
        candidats: {
          some: {
            eleve: { statutFormation: 'EN_COURS' }
          }
        }
      },
      include: {
        candidats: {
          include: {
            eleve: true
          }
        }
      }
    })

    let countEleves = 0
    for (const prospect of prospectsAvecElevesActifs) {
      if (prospect.statutProspect !== 'ELEVE') {
        await prisma.prospect.update({
          where: { idProspect: prospect.idProspect },
          data: { statutProspect: 'ELEVE' }
        })
        countEleves++
        console.log(`   ✅ ${prospect.nom} ${prospect.prenom} → ELEVE`)
      }
    }

    // 4. Prospects avec élèves TERMINE/ABANDONNE → ANCIEN_ELEVE
    console.log('\n📋 Mise à jour prospects avec élèves terminés...')
    const prospectsAvecElevesTermines = await prisma.prospect.findMany({
      where: {
        AND: [
          { candidats: { some: { eleve: { statutFormation: { in: ['TERMINE', 'ABANDONNE', 'SUSPENDU'] } } } } },
          { candidats: { none: { eleve: { statutFormation: 'EN_COURS' } } } }
        ]
      }
    })

    let countAnciensEleves = 0
    for (const prospect of prospectsAvecElevesTermines) {
      if (prospect.statutProspect !== 'ANCIEN_ELEVE') {
        await prisma.prospect.update({
          where: { idProspect: prospect.idProspect },
          data: { statutProspect: 'ANCIEN_ELEVE' }
        })
        countAnciensEleves++
        console.log(`   ✅ ${prospect.nom} ${prospect.prenom} → ANCIEN_ELEVE`)
      }
    }

    // Résumé
    console.log('\n' + '=' .repeat(60))
    console.log('📊 RÉSUMÉ DES MISES À JOUR:')
    console.log(`   - ${countCandidats} prospects passés à CANDIDAT`)
    console.log(`   - ${countAnciensCandidats} prospects passés à ANCIEN_CANDIDAT`)
    console.log(`   - ${countEleves} prospects passés à ELEVE`)
    console.log(`   - ${countAnciensEleves} prospects passés à ANCIEN_ELEVE`)

    // Afficher la répartition finale
    const statuts = await prisma.prospect.groupBy({
      by: ['statutProspect'],
      _count: true
    })

    console.log('\n📊 RÉPARTITION FINALE DES STATUTS:')
    for (const statut of statuts) {
      console.log(`   - ${statut.statutProspect || 'NULL'}: ${statut._count} prospects`)
    }

    console.log('\n✅ Mise à jour terminée avec succès!')

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateStatutsLifecycle()