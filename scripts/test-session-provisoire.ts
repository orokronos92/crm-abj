/**
 * Script de test : vérifier que la carte provisoire reçoit bien les bonnes données
 * Simule une création de session CAP et vérifie la réponse
 */

async function testSessionProvisoire() {
  console.log('🧪 Test création session CAP avec carte provisoire\n')

  // Données de test pour un CAP
  const sessionData = {
    type: 'CAP',
    data: {
      dataCAP: {
        codeFormation: 'CAP_BJ',
      nomSession: 'CAP Bijouterie - Test Provisoire',
      dateDebutGlobale: '2026-09-01',
      dureeMois: 10,
      nbParticipants: 12,
      plageHoraire: {
        matin: { debut: '09:00', fin: '12:00' },
        apresMidi: { debut: '14:00', fin: '17:00' }
      },
      joursActifs: ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'],
      periodesInterdites: [],
      programme: [
        { nom: 'Sertissage', heures: 200, heuresConsecutivesMax: 4, salleVoeux: [], formateurVoeux: [] },
        { nom: 'Dessin technique', heures: 100, heuresConsecutivesMax: 3, salleVoeux: [], formateurVoeux: [] },
        { nom: 'Polissage', heures: 150, heuresConsecutivesMax: 4, salleVoeux: [], formateurVoeux: [] },
        { nom: 'Histoire de l\'art', heures: 80, heuresConsecutivesMax: 2, salleVoeux: [], formateurVoeux: [] },
        { nom: 'Gemmologie', heures: 100, heuresConsecutivesMax: 3, salleVoeux: [], formateurVoeux: [] },
        { nom: 'Joaillerie création', heures: 170, heuresConsecutivesMax: 4, salleVoeux: [], formateurVoeux: [] }
      ],
      formateurs: [],
      salles: [],
      formateurMultiMatieresAutorise: true,
      salleMultiMatieresAutorise: true,
      formateursPlanifierPlusTard: true,
      sallesPlanifierPlusTard: true,
      matieresEnParallele: false,
      notesComplementaires: 'Test création session provisoire'
      }
    }
  }

  // Calculer le total attendu
  const totalAttendu = sessionData.data.dataCAP.programme.reduce((sum, m) => sum + m.heures, 0)
  console.log(`📊 Total heures programme: ${totalAttendu}h`)
  console.log(`👥 Participants: ${sessionData.data.dataCAP.nbParticipants}\n`)

  try {
    console.log('📤 Envoi requête POST /api/sessions/validate...')
    const response = await fetch('http://localhost:3000/api/sessions/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Erreur API: ${error.error}`)
    }

    const result = await response.json()
    console.log('✅ Réponse reçue\n')

    console.log('📋 Résumé de la réponse:')
    console.log(`   ID Session: ${result.idSession}`)
    console.log(`   Statut: ${result.statut}`)
    console.log('\n📊 Données planningGenere:')
    console.log(`   total_heures_formation: ${result.planningGenere.total_heures_formation}h`)
    console.log(`   nb_participants: ${result.planningGenere.nb_participants}`)
    console.log(`   Séances: ${result.planningGenere.seances.length}`)
    console.log(`   Rapport IA: ${result.planningGenere.rapportIA.substring(0, 50)}...\n`)

    // Vérifications
    let allOk = true

    if (result.planningGenere.total_heures_formation === totalAttendu) {
      console.log('✅ Total heures correct:', totalAttendu + 'h')
    } else {
      console.log(`❌ Total heures incorrect: attendu ${totalAttendu}h, reçu ${result.planningGenere.total_heures_formation}h`)
      allOk = false
    }

    if (result.planningGenere.nb_participants === sessionData.data.dataCAP.nbParticipants) {
      console.log('✅ Nombre participants correct:', sessionData.data.dataCAP.nbParticipants)
    } else {
      console.log(`❌ Nombre participants incorrect: attendu ${sessionData.data.dataCAP.nbParticipants}, reçu ${result.planningGenere.nb_participants}`)
      allOk = false
    }

    console.log('\n' + (allOk ? '✅ Tous les tests sont passés !' : '❌ Certains tests ont échoué'))
    console.log('\n💡 La carte provisoire devrait maintenant afficher:')
    console.log(`   - ${totalAttendu}h (au lieu de sommer toutes les séances)`)
    console.log(`   - ${sessionData.data.dataCAP.nbParticipants} participants`)

  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

testSessionProvisoire()
