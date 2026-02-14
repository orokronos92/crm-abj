/**
 * Script de test : Création d'un formateur via API
 */

async function testCreateFormateur() {
  const formateurData = {
    nom: 'Martin',
    prenom: 'Sophie',
    email: `sophie.martin.${Date.now()}@exemple.fr`, // Email unique avec timestamp
    telephone: '06 12 34 56 78',
    adresse: '25 avenue des Artisans',
    codePostal: '75015',
    ville: 'Paris',
    specialites: ['Bijouterie traditionnelle', 'Polissage'],
    tarifJournalier: 480,
    siret: '123 456 789 00012',
    anneesExperience: 12,
    anneesEnseignement: 5,
    bio: 'Bijoutière passionnée avec 12 ans d\'expérience dans la création de bijoux sur mesure.',
    notes: 'Entretien téléphonique du 14/02/2026 - Très motivée, disponible immédiatement'
  }

  console.log('📝 Test création formateur via API')
  console.log('Email:', formateurData.email)
  console.log('')

  try {
    const response = await fetch('http://localhost:3000/api/formateurs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formateurData)
    })

    const data = await response.json()

    if (response.ok) {
      console.log('✅ SUCCESS:', data.message)
      console.log('')
      console.log('Formateur créé:')
      console.log('  - ID:', data.formateur.id)
      console.log('  - Nom:', data.formateur.nom, data.formateur.prenom)
      console.log('  - Email:', data.formateur.email)
      console.log('  - Statut:', data.formateur.statut)
      console.log('')
      console.log('🤖 Prochaine étape: Marjorie va envoyer un email au formateur pour demander les documents requis')
    } else {
      console.error('❌ ERREUR:', data.error)
      console.log('Status:', response.status)
    }
  } catch (error) {
    console.error('❌ ERREUR RÉSEAU:', error)
  }
}

testCreateFormateur()
