import { DashboardService } from '../src/services/dashboard.service'

async function testDashboardCounts() {
  console.log('🔍 Vérification des compteurs du dashboard\n')
  console.log('=' .repeat(50))

  try {
    const service = new DashboardService()
    const stats = await service.getStats()

    console.log('\n📊 STATISTIQUES DU DASHBOARD:')
    console.log(`  Prospects disponibles: ${stats.prospects.total}`)
    console.log(`  Candidats actifs: ${stats.candidats.total}`)
    console.log(`  Élèves: ${stats.eleves.total}`)
    console.log(`  Formateurs: ${stats.formateurs.total}`)

    console.log('\n✅ VÉRIFICATION:')
    if (stats.prospects.total === 4) {
      console.log('  ✓ Le nombre de prospects est CORRECT (4 au lieu de 10)')
      console.log('    → Exclut bien CANDIDAT et ELEVE')
    } else {
      console.log(`  ✗ ERREUR: Le dashboard affiche ${stats.prospects.total} prospects au lieu de 4`)
    }

    console.log('\n📋 DERNIERS PROSPECTS:')
    const recentProspects = await service.getRecentProspects(5)
    recentProspects.forEach(p => {
      console.log(`  - ${p.nom} (${p.statut})`)
    })

    if (recentProspects.every(p => !['CANDIDAT', 'ELEVE'].includes(p.statut))) {
      console.log('\n  ✓ Les prospects récents sont bien filtrés')
    } else {
      console.log('\n  ✗ ERREUR: Des prospects CANDIDAT/ELEVE sont affichés')
    }

  } catch (error) {
    console.error('Erreur:', error)
  }
}

testDashboardCounts()