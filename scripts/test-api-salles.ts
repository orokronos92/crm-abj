/**
 * Script de test pour l'API GET /api/salles
 * Teste les différents filtres disponibles
 */

const BASE_URL = 'http://localhost:3000'

async function testAPI() {
  console.log('\n🧪 TEST API GET /api/salles\n')
  console.log('='.repeat(60))

  // Test 1: Toutes les salles actives
  console.log('\n1️⃣ TEST: Toutes les salles actives (défaut)')
  console.log('-'.repeat(60))

  const response1 = await fetch(`${BASE_URL}/api/salles`)
  const data1 = await response1.json()

  if (data1.success) {
    console.log(`✅ ${data1.salles.length} salle(s) active(s)`)
    data1.salles.forEach((salle: any) => {
      console.log(`   • ${salle.nom} (${salle.capaciteMax} pers, ${salle.surfaceM2}m²)`)
    })
  } else {
    console.log('❌ Erreur:', data1.error)
  }

  // Test 2: Salles disponibles le weekend
  console.log('\n2️⃣ TEST: Salles disponibles le weekend')
  console.log('-'.repeat(60))

  const response2 = await fetch(`${BASE_URL}/api/salles?disponibleWeekend=true`)
  const data2 = await response2.json()

  if (data2.success) {
    console.log(`✅ ${data2.salles.length} salle(s) disponible(s) le weekend`)
    data2.salles.forEach((salle: any) => {
      console.log(`   • ${salle.nom}`)
    })
  } else {
    console.log('❌ Erreur:', data2.error)
  }

  // Test 3: Salles avec capacité ≥ 15
  console.log('\n3️⃣ TEST: Salles avec capacité ≥ 15 personnes')
  console.log('-'.repeat(60))

  const response3 = await fetch(`${BASE_URL}/api/salles?capaciteMin=15`)
  const data3 = await response3.json()

  if (data3.success) {
    console.log(`✅ ${data3.salles.length} salle(s) avec capacité ≥ 15`)
    data3.salles.forEach((salle: any) => {
      console.log(`   • ${salle.nom} (${salle.capaciteMax} pers)`)
    })
  } else {
    console.log('❌ Erreur:', data3.error)
  }

  // Test 4: Salles disponibles le soir
  console.log('\n4️⃣ TEST: Salles disponibles le soir')
  console.log('-'.repeat(60))

  const response4 = await fetch(`${BASE_URL}/api/salles?disponibleSoir=true`)
  const data4 = await response4.json()

  if (data4.success) {
    console.log(`✅ ${data4.salles.length} salle(s) disponible(s) le soir`)
    data4.salles.forEach((salle: any) => {
      console.log(`   • ${salle.nom}`)
    })
  } else {
    console.log('❌ Erreur:', data4.error)
  }

  // Test 5: Filtres combinés
  console.log('\n5️⃣ TEST: Filtres combinés (weekend + capacité ≥ 15)')
  console.log('-'.repeat(60))

  const response5 = await fetch(`${BASE_URL}/api/salles?disponibleWeekend=true&capaciteMin=15`)
  const data5 = await response5.json()

  if (data5.success) {
    console.log(`✅ ${data5.salles.length} salle(s) correspondant aux critères`)
    data5.salles.forEach((salle: any) => {
      console.log(`   • ${salle.nom} (${salle.capaciteMax} pers, Weekend: ${salle.disponibleWeekend})`)
    })
  } else {
    console.log('❌ Erreur:', data5.error)
  }

  // Test 6: Toutes les salles (incluant non actives)
  console.log('\n6️⃣ TEST: Toutes les salles (incluant MAINTENANCE)')
  console.log('-'.repeat(60))

  const response6 = await fetch(`${BASE_URL}/api/salles?statut=MAINTENANCE`)
  const data6 = await response6.json()

  if (data6.success) {
    console.log(`✅ ${data6.salles.length} salle(s) en maintenance`)
    data6.salles.forEach((salle: any) => {
      console.log(`   • ${salle.nom} - ${salle.motifIndisponibilite || 'Pas de motif'}`)
    })
  } else {
    console.log('❌ Erreur:', data6.error)
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ TESTS TERMINÉS')
  console.log('\n💡 Pour utiliser cette API dans le frontend:')
  console.log('   const res = await fetch(\'/api/salles?disponibleWeekend=true\')')
  console.log('   const { success, salles } = await res.json()\n')
}

// Vérifier que le serveur est lancé
testAPI().catch(error => {
  if (error.cause?.code === 'ECONNREFUSED') {
    console.error('\n❌ ERREUR: Le serveur Next.js n\'est pas lancé')
    console.log('\n💡 Lancez d\'abord: npm run dev')
  } else {
    console.error('\n❌ Erreur:', error.message)
  }
})
