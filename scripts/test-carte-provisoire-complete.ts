/**
 * Script de test : vérifier que la réponse provisoire contient tous les nouveaux champs
 */

async function testSessionProvisoire() {
  console.log('🧪 Test création session CAP avec métadonnées complètes\n')

  // Données de test pour un CAP
  const sessionData = {
    type: 'CAP',
    data: {
      dataCAP: {
        codeFormation: 'CAP_BJ',
        nomSession: 'CAP Bijouterie - Promotion Mars 2026',
        dateDebutGlobale: '2026-03-01',
        dureeMois: 10,
        nbParticipants: 15,
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
        formateurs: [
          { id: 2, nom: 'Nicolas Dubois', matieres: ['Sertissage', 'Polissage'] },
          { id: 3, nom: 'Sophie Martin', matieres: ['Joaillerie création'] }
        ],
        salles: [
          { id: 1, nom: 'Atelier A', capacite: 12 },
          { id: 2, nom: 'Atelier B', capacite: 8 }
        ],
        formateurMultiMatieresAutorise: true,
        salleMultiMatieresAutorise: true,
        formateursPlanifierPlusTard: true,
        sallesPlanifierPlusTard: true,
        matieresEnParallele: false,
        notesComplementaires: 'Test métadonnées complètes'
      }
    }
  }

  try {
    console.log('📤 Envoi requête POST /api/sessions/validate...\n')
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

    // Vérification des champs de base
    console.log('📋 Champs de base:')
    console.log(`   ID Session: ${result.idSession}`)
    console.log(`   Statut: ${result.statut}\n`)

    // Vérification des métadonnées
    console.log('🔍 Métadonnées de la session:')
    console.log(`   Type: ${result.type || '❌ MANQUANT'}`)
    console.log(`   Nom session: ${result.nomSession || '❌ MANQUANT'}`)
    console.log(`   Date début: ${result.dateDebutGlobale || '❌ MANQUANT'}`)
    console.log(`   Durée: ${result.dureeMois || '❌ MANQUANT'} mois`)
    console.log(`   Jours actifs: ${result.joursActifs ? result.joursActifs.join(', ') : '❌ MANQUANT'}`)
    console.log(`   Plage horaire: ${result.plageHoraire ? 'Présente' : '❌ MANQUANT'}`)
    console.log(`   Programme: ${result.programme ? `${result.programme.length} matières` : '❌ MANQUANT'}`)
    console.log(`   Formateurs: ${result.formateurs ? `${result.formateurs.length} formateurs` : '❌ MANQUANT'}`)
    console.log(`   Salles: ${result.salles ? `${result.salles.length} salles` : '❌ MANQUANT'}\n`)

    // Vérification du planning généré
    console.log('📊 Planning généré:')
    console.log(`   Total heures: ${result.planningGenere.total_heures_formation}h`)
    console.log(`   Participants: ${result.planningGenere.nb_participants}`)
    console.log(`   Séances: ${result.planningGenere.seances.length}`)
    console.log(`   Rapport IA: ${result.planningGenere.rapportIA.substring(0, 50)}...\n`)

    // Vérification détaillée du programme
    if (result.programme && result.programme.length > 0) {
      console.log('📚 Détail du programme:')
      result.programme.forEach((matiere: any) => {
        console.log(`   - ${matiere.nom}: ${matiere.heures}h`)
      })
      console.log()
    }

    // Vérifications
    let allOk = true
    const checks = [
      { name: 'Type', value: result.type === 'CAP' },
      { name: 'Nom session', value: !!result.nomSession },
      { name: 'Date début', value: !!result.dateDebutGlobale },
      { name: 'Durée mois', value: result.dureeMois === 10 },
      { name: 'Jours actifs', value: result.joursActifs?.length === 5 },
      { name: 'Plage horaire', value: !!result.plageHoraire },
      { name: 'Programme', value: result.programme?.length === 6 },
      { name: 'Formateurs', value: result.formateurs?.length === 2 },
      { name: 'Salles', value: result.salles?.length === 2 },
      { name: 'Total heures', value: result.planningGenere.total_heures_formation === 800 },
      { name: 'Participants', value: result.planningGenere.nb_participants === 15 }
    ]

    console.log('✔️  Résultats des vérifications:')
    checks.forEach(check => {
      const status = check.value ? '✅' : '❌'
      console.log(`   ${status} ${check.name}`)
      if (!check.value) allOk = false
    })

    console.log('\n' + (allOk ? '🎉 Tous les tests sont passés !' : '⚠️  Certains tests ont échoué'))
    console.log('\n💡 La carte provisoire devrait maintenant afficher:')
    console.log('   - Synthèse complète de la session')
    console.log('   - Programme détaillé avec les 6 matières')
    console.log('   - Liste des formateurs et salles')
    console.log('   - Total de 800h')
    console.log('   - 15 participants')

  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

testSessionProvisoire()
