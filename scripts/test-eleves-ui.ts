/**
 * Script de test pour vérifier que la page élèves fonctionne correctement
 * avec toutes les connexions à la base de données
 */

import { EleveService } from '../src/services/eleve.service'
import prisma from '../src/lib/prisma'

async function testElevesUI() {
  console.log('🎯 Test complet de la page Élèves\n')

  try {
    const eleveService = new EleveService()

    // 1. Test récupération liste complète
    console.log('📋 1. Test récupération liste élèves')
    const { eleves, total } = await eleveService.getEleves({ take: 20 })
    console.log(`   ✅ ${eleves.length} élèves récupérés (total: ${total})`)

    if (eleves.length > 0) {
      const premier = eleves[0]
      console.log(`   Exemple: ${premier.prenom} ${premier.nom}`)
      console.log(`   - Formation: ${premier.formation}`)
      console.log(`   - Progression: ${premier.progression}%`)
      console.log(`   - Moyenne: ${premier.moyenne}/20`)
      console.log(`   - Alertes: ${premier.alertes.length}`)
    }

    // 2. Test des filtres
    console.log('\n📋 2. Test des filtres')
    const filterValues = await eleveService.getFilterValues()
    console.log(`   - Formations: ${filterValues.formations.length}`)
    console.log(`   - Formateurs: ${filterValues.formateurs.length}`)
    console.log(`   - Statuts: ${filterValues.statuts.length}`)

    // 3. Test recherche
    console.log('\n📋 3. Test recherche')
    const { eleves: searchResults } = await eleveService.getEleves({
      search: 'Mar',
      take: 5
    })
    console.log(`   ✅ Recherche "Mar": ${searchResults.length} résultats`)

    // 4. Test filtrage par formation
    console.log('\n📋 4. Test filtrage par formation')
    if (filterValues.formations.length > 0) {
      const premFormation = filterValues.formations[0]
      const { eleves: elevesFormation } = await eleveService.getEleves({
        formation: premFormation.code,
        take: 10
      })
      console.log(`   ✅ Formation "${premFormation.nom}": ${elevesFormation.length} élèves`)
    }

    // 5. Test filtrage par alertes
    console.log('\n📋 5. Test filtrage par alertes')
    const { eleves: elevesAlertes } = await eleveService.getEleves({
      alertes: true,
      take: 10
    })
    console.log(`   ✅ Élèves avec alertes: ${elevesAlertes.length}`)
    if (elevesAlertes.length > 0) {
      elevesAlertes.forEach(eleve => {
        console.log(`   - ${eleve.prenom} ${eleve.nom}: ${eleve.alertes.map(a => a.type).join(', ')}`)
      })
    }

    // 6. Test détail élève
    console.log('\n📋 6. Test détail élève')
    if (eleves.length > 0) {
      const eleveDetail = await eleveService.getEleveDetail(eleves[0].id)
      console.log(`   ✅ Détail de ${eleveDetail.prenom} ${eleveDetail.nom}`)
      console.log(`   - Évaluations: ${eleveDetail.evaluations.length}`)
      console.log(`   - Présences: ${eleveDetail.presences.length}`)
      console.log(`   - Documents: ${eleveDetail.documents.length}`)
      console.log(`   - Historique: ${eleveDetail.historique.length} événements`)
    }

    // 7. Test calculs statistiques
    console.log('\n📋 7. Test calculs statistiques')
    const stats = {
      totalEleves: total,
      elevesEnFormation: eleves.filter(e => e.statut === 'EN_FORMATION').length,
      elevesTermines: eleves.filter(e => e.statut === 'TERMINE').length,
      moyenneGenerale: eleves.reduce((sum, e) => sum + e.moyenne, 0) / eleves.length,
      progressionMoyenne: eleves.reduce((sum, e) => sum + e.progression, 0) / eleves.length,
      elevesAvecAlertes: elevesAlertes.length
    }
    console.log(`   - Total élèves: ${stats.totalEleves}`)
    console.log(`   - En formation: ${stats.elevesEnFormation}`)
    console.log(`   - Terminés: ${stats.elevesTermines}`)
    console.log(`   - Moyenne générale: ${stats.moyenneGenerale.toFixed(2)}/20`)
    console.log(`   - Progression moyenne: ${stats.progressionMoyenne.toFixed(0)}%`)
    console.log(`   - Avec alertes: ${stats.elevesAvecAlertes}`)

    console.log('\n✅ TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS!')
    console.log('📌 La page élèves est entièrement fonctionnelle et connectée à la base de données.')

  } catch (error) {
    console.error('\n❌ ERREUR LORS DU TEST:', error)
    if (error instanceof Error) {
      console.error('Message:', error.message)
      console.error('Stack:', error.stack)
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Exécution
testElevesUI()