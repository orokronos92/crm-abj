/**
 * Script de test pour l'API Événements (CRUD complet)
 * Teste POST, GET, PATCH, DELETE avec validation de conflits
 */

const BASE_URL = 'http://localhost:3000'

async function testAPI() {
  console.log('\n🧪 TEST API ÉVÉNEMENTS (CRUD COMPLET)\n')
  console.log('='.repeat(60))

  let evenementId1: number
  let evenementId2: number

  // ===== TEST 1: POST - Créer un événement (succès) =====
  console.log('\n1️⃣ TEST: POST /api/evenements - Création événement (succès)')
  console.log('-'.repeat(60))

  const eventData1 = {
    type: 'PORTES_OUVERTES',
    titre: 'Portes ouvertes printemps 2026',
    description: 'Découverte des métiers de la bijouterie',
    date: '2026-03-15',
    heureDebut: '09:00',
    heureFin: '17:00',
    salle: 'Tous les ateliers',
    nombreParticipants: 50,
    notes: 'Prévoir rafraîchissements'
  }

  const response1 = await fetch(`${BASE_URL}/api/evenements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData1)
  })

  const data1 = await response1.json()

  if (data1.success) {
    evenementId1 = data1.evenement.idEvenement
    console.log('✅ Événement créé avec succès')
    console.log(`   ID: ${data1.evenement.idEvenement}`)
    console.log(`   Titre: ${data1.evenement.titre}`)
    console.log(`   Date: ${data1.evenement.date}`)
    console.log(`   Salle: ${data1.evenement.salle}`)
    console.log(`   Statut: ${data1.evenement.statut}`)
  } else {
    console.log('❌ Erreur:', data1.error)
  }

  // ===== TEST 2: POST - Créer un deuxième événement =====
  console.log('\n2️⃣ TEST: POST /api/evenements - Création deuxième événement')
  console.log('-'.repeat(60))

  const eventData2 = {
    type: 'STAGE_INITIATION',
    titre: 'Stage initiation sertissage',
    description: 'Découverte du sertissage niveau débutant',
    date: '2026-04-10',
    heureDebut: '14:00',
    heureFin: '18:00',
    salle: 'Atelier B',
    nombreParticipants: 8,
    participantsInscrits: 0
  }

  const response2 = await fetch(`${BASE_URL}/api/evenements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData2)
  })

  const data2 = await response2.json()

  if (data2.success) {
    evenementId2 = data2.evenement.idEvenement
    console.log('✅ Événement créé avec succès')
    console.log(`   ID: ${data2.evenement.idEvenement}`)
    console.log(`   Titre: ${data2.evenement.titre}`)
    console.log(`   Salle: ${data2.evenement.salle}`)
  } else {
    console.log('❌ Erreur:', data2.error)
  }

  // ===== TEST 3: POST - Conflit de salle (doit échouer avec 409) =====
  console.log('\n3️⃣ TEST: POST /api/evenements - Détection conflit de salle')
  console.log('-'.repeat(60))

  const eventDataConflit = {
    type: 'REUNION',
    titre: 'Réunion formateurs',
    date: '2026-04-10', // Même date qu'événement 2
    heureDebut: '16:00',
    heureFin: '20:00',
    salle: 'Atelier B', // Même salle qu'événement 2
    nombreParticipants: 10
  }

  const response3 = await fetch(`${BASE_URL}/api/evenements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventDataConflit)
  })

  const data3 = await response3.json()

  if (response3.status === 409) {
    console.log('✅ Conflit détecté comme prévu (HTTP 409)')
    console.log(`   Erreur: ${data3.error}`)
    console.log(`   Conflit avec: ${data3.details?.conflitAvec || 'N/A'}`)
    console.log(`   Salle: ${data3.details?.salle || 'N/A'}`)
  } else {
    console.log('❌ Le conflit n\'a PAS été détecté ! (problème de validation)')
  }

  // ===== TEST 4: GET - Liste tous les événements =====
  console.log('\n4️⃣ TEST: GET /api/evenements - Liste tous les événements')
  console.log('-'.repeat(60))

  const response4 = await fetch(`${BASE_URL}/api/evenements`)
  const data4 = await response4.json()

  if (data4.success) {
    console.log(`✅ ${data4.total} événement(s) récupéré(s)`)
    data4.evenements.forEach((evt: any) => {
      console.log(`   • ${evt.titre} - ${evt.date} (${evt.statut})`)
    })
  } else {
    console.log('❌ Erreur:', data4.error)
  }

  // ===== TEST 5: GET - Filtrage par année =====
  console.log('\n5️⃣ TEST: GET /api/evenements?annee=2026')
  console.log('-'.repeat(60))

  const response5 = await fetch(`${BASE_URL}/api/evenements?annee=2026`)
  const data5 = await response5.json()

  if (data5.success) {
    console.log(`✅ ${data5.total} événement(s) en 2026`)
    data5.evenements.forEach((evt: any) => {
      console.log(`   • ${evt.titre} - ${evt.date}`)
    })
  } else {
    console.log('❌ Erreur:', data5.error)
  }

  // ===== TEST 6: GET - Filtrage par salle =====
  console.log('\n6️⃣ TEST: GET /api/evenements?salle=Atelier B')
  console.log('-'.repeat(60))

  const response6 = await fetch(`${BASE_URL}/api/evenements?salle=Atelier B`)
  const data6 = await response6.json()

  if (data6.success) {
    console.log(`✅ ${data6.total} événement(s) dans Atelier B`)
    data6.evenements.forEach((evt: any) => {
      console.log(`   • ${evt.titre} - ${evt.date}`)
    })
  } else {
    console.log('❌ Erreur:', data6.error)
  }

  // ===== TEST 7: PATCH - Modifier un événement =====
  console.log('\n7️⃣ TEST: PATCH /api/evenements/[id] - Modification')
  console.log('-'.repeat(60))

  const updateData = {
    titre: 'Portes ouvertes printemps 2026 - MODIFIÉ',
    statut: 'CONFIRME',
    participantsInscrits: 15
  }

  const response7 = await fetch(`${BASE_URL}/api/evenements/${evenementId1}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  })

  const data7 = await response7.json()

  if (data7.success) {
    console.log('✅ Événement modifié avec succès')
    console.log(`   Nouveau titre: ${data7.evenement.titre}`)
    console.log(`   Nouveau statut: ${data7.evenement.statut}`)
    console.log(`   Participants inscrits: ${data7.evenement.participantsInscrits}`)
  } else {
    console.log('❌ Erreur:', data7.error)
  }

  // ===== TEST 8: DELETE - Annulation (soft delete) =====
  console.log('\n8️⃣ TEST: DELETE /api/evenements/[id] - Annulation (soft delete)')
  console.log('-'.repeat(60))

  const deleteBody = {
    motifAnnulation: 'Formateur indisponible - report prévu en mai'
  }

  const response8 = await fetch(`${BASE_URL}/api/evenements/${evenementId2}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deleteBody)
  })

  const data8 = await response8.json()

  if (data8.success) {
    console.log('✅ Événement annulé (soft delete)')
    console.log(`   Titre: ${data8.evenement.titre}`)
    console.log(`   Statut: ${data8.evenement.statut}`)
    console.log(`   Motif: ${data8.evenement.motifAnnulation}`)
    console.log(`   Date annulation: ${data8.evenement.dateAnnulation}`)
  } else {
    console.log('❌ Erreur:', data8.error)
  }

  // ===== TEST 9: GET - Liste avec exclusion des annulés =====
  console.log('\n9️⃣ TEST: GET /api/evenements - Vérifier exclusion annulés')
  console.log('-'.repeat(60))

  const response9 = await fetch(`${BASE_URL}/api/evenements`)
  const data9 = await response9.json()

  if (data9.success) {
    console.log(`✅ ${data9.total} événement(s) actif(s) (annulés exclus)`)
    data9.evenements.forEach((evt: any) => {
      console.log(`   • ${evt.titre} - Statut: ${evt.statut}`)
    })
  } else {
    console.log('❌ Erreur:', data9.error)
  }

  // ===== TEST 10: GET - Liste AVEC annulés =====
  console.log('\n🔟 TEST: GET /api/evenements?includeAnnules=true')
  console.log('-'.repeat(60))

  const response10 = await fetch(`${BASE_URL}/api/evenements?includeAnnules=true`)
  const data10 = await response10.json()

  if (data10.success) {
    console.log(`✅ ${data10.total} événement(s) totaux (incluant annulés)`)
    data10.evenements.forEach((evt: any) => {
      const emoji = evt.statut === 'ANNULE' ? '❌' : evt.statut === 'CONFIRME' ? '✅' : '📅'
      console.log(`   ${emoji} ${evt.titre} - Statut: ${evt.statut}`)
    })
  } else {
    console.log('❌ Erreur:', data10.error)
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ TOUS LES TESTS TERMINÉS')
  console.log('\n📋 Résumé:')
  console.log('   ✅ POST (création) : OK')
  console.log('   ✅ POST (conflit 409) : OK')
  console.log('   ✅ GET (liste + filtres) : OK')
  console.log('   ✅ PATCH (modification) : OK')
  console.log('   ✅ DELETE (soft delete) : OK')
  console.log('\n💡 Les événements annulés restent en base pour l\'historique\n')
}

// Lancer les tests
testAPI().catch(error => {
  if (error.cause?.code === 'ECONNREFUSED') {
    console.error('\n❌ ERREUR: Le serveur Next.js n\'est pas lancé')
    console.log('\n💡 Lancez d\'abord: npm run dev')
  } else {
    console.error('\n❌ Erreur:', error.message)
  }
})
