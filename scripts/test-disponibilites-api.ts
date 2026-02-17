/**
 * Script de test pour l'API disponibilités formateur
 * Vérifie GET et POST endpoints
 */

async function testDisponibilitesAPI() {
  const formateurId = 1
  const annee = 2026

  console.log('🧪 Test API Disponibilités Formateur\n')

  // Test 1: GET disponibilités
  console.log('📥 Test 1: GET disponibilités')
  try {
    const response = await fetch(
      `http://localhost:3001/api/formateur/disponibilites?formateurId=${formateurId}&annee=${annee}`
    )
    const data = await response.json()

    if (data.success) {
      console.log(`✅ GET réussi`)
      console.log(`   - Disponibilités: ${data.disponibilites?.length || 0}`)
      console.log(`   - Sessions: ${data.sessions?.length || 0}`)

      if (data.disponibilites?.length > 0) {
        console.log(`   - Première dispo: ${data.disponibilites[0].date} - ${data.disponibilites[0].creneauJournee} - ${data.disponibilites[0].typeDisponibilite}`)
      }
    } else {
      console.log(`❌ GET échoué: ${data.error}`)
    }
  } catch (error) {
    console.log(`❌ Erreur GET: ${error}`)
  }

  console.log()

  // Test 2: POST nouvelle disponibilité
  console.log('📤 Test 2: POST nouvelle disponibilité')
  try {
    const testData = {
      formateurId,
      date: '2026-03-15',
      creneauJournee: 'MATIN',
      typeDisponibilite: 'DISPONIBLE',
      commentaire: 'Test via script'
    }

    const response = await fetch('http://localhost:3001/api/formateur/disponibilites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })
    const data = await response.json()

    if (data.success) {
      console.log(`✅ POST réussi`)
      console.log(`   - ID: ${data.disponibilite.id}`)
      console.log(`   - Date: ${data.disponibilite.date}`)
      console.log(`   - Créneau: ${data.disponibilite.creneauJournee}`)
      console.log(`   - Type: ${data.disponibilite.typeDisponibilite}`)
    } else {
      console.log(`❌ POST échoué: ${data.error}`)
    }
  } catch (error) {
    console.log(`❌ Erreur POST: ${error}`)
  }

  console.log()

  // Test 3: GET après POST (vérifier persistence)
  console.log('📥 Test 3: GET après POST (vérifier persistence)')
  try {
    const response = await fetch(
      `http://localhost:3001/api/formateur/disponibilites?formateurId=${formateurId}&annee=${annee}`
    )
    const data = await response.json()

    if (data.success) {
      const testDispo = data.disponibilites?.find(d => d.date === '2026-03-15' && d.creneauJournee === 'MATIN')
      if (testDispo) {
        console.log(`✅ Disponibilité bien persistée`)
        console.log(`   - ID: ${testDispo.id}`)
        console.log(`   - Commentaire: ${testDispo.commentaire}`)
      } else {
        console.log(`❌ Disponibilité non trouvée après POST`)
      }
    } else {
      console.log(`❌ GET échoué: ${data.error}`)
    }
  } catch (error) {
    console.log(`❌ Erreur GET: ${error}`)
  }

  console.log()
  console.log('✅ Tests terminés')
}

// Exécuter les tests
testDisponibilitesAPI().catch(console.error)
