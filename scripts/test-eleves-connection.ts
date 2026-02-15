import { EleveService } from '../src/services/eleve.service'
import prisma from '../src/lib/prisma'

async function testElevesConnection() {
  console.log('🔍 Test de connexion de la page Élèves\n')

  try {
    // 1. Vérifier le nombre d'élèves en base
    const eleveCount = await prisma.eleve.count()
    console.log(`✅ Nombre d'élèves en base: ${eleveCount}`)

    // 2. Récupérer la liste via le service
    const eleveService = new EleveService()
    const { eleves, total } = await eleveService.getEleves({ take: 10 })

    console.log(`✅ Élèves récupérés via le service: ${eleves.length}`)

    // 3. Afficher quelques élèves
    console.log('\n📚 Premiers élèves:')
    eleves.slice(0, 3).forEach(eleve => {
      console.log(`  - ${eleve.prenom} ${eleve.nom}`)
      console.log(`    Formation: ${eleve.formation}`)
      console.log(`    Progression: ${eleve.progression}%`)
      console.log(`    Moyenne: ${eleve.moyenne}/20`)
      console.log(`    Alertes: ${eleve.alertes.length > 0 ? eleve.alertes.map(a => a.message).join(', ') : 'Aucune'}`)
    })

    // 4. Tester les filtres
    console.log('\n🔍 Test des filtres:')

    // Récupérer les valeurs de filtres
    const filterValues = await eleveService.getFilterValues()
    console.log(`  - Formations disponibles: ${filterValues.formations.length}`)
    console.log(`  - Formateurs disponibles: ${filterValues.formateurs.length}`)
    console.log(`  - Statuts disponibles: ${filterValues.statuts.length}`)

    // 5. Tester le détail d'un élève
    if (eleves.length > 0) {
      console.log('\n📋 Test du détail élève:')
      const detail = await eleveService.getEleveDetail(eleves[0].id)
      console.log(`  - Élève: ${detail.prenom} ${detail.nom}`)
      console.log(`  - Évaluations: ${detail.evaluations.length}`)
      console.log(`  - Présences: ${detail.presences.length}`)
      console.log(`  - Documents: ${detail.documents.length}`)
    }

    console.log('\n✅ Tous les tests sont passés avec succès!')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testElevesConnection()