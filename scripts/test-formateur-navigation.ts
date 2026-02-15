/**
 * Script de test pour vérifier la navigation vers la page notifications formateur
 * Envoie une notification et vérifie qu'elle est visible
 */

async function testFormateurNavigation() {
  const API_KEY = process.env.NOTIFICATIONS_API_KEY || 'your-secure-api-key-from-env'
  const BASE_URL = 'http://localhost:3000'

  console.log('🔔 Test navigation notifications formateur...\n')

  // Envoyer une notification test pour formateur
  const notification = {
    sourceAgent: 'system',
    categorie: 'EVALUATION',
    type: 'EVALUATION_REQUISE',
    priorite: 'HAUTE',
    titre: 'Évaluation à saisir - CAP Bijou Session Mars',
    message: 'Vous avez 5 évaluations en attente de saisie pour la session CAP Bijou Mars 2024. Date limite : 15/02/2024.',
    audience: 'FORMATEUR',
    actionRequise: true,
    typeAction: 'SAISIR',
    lienAction: '/formateur/evaluations/saisie'
  }

  try {
    const response = await fetch(`${BASE_URL}/api/notifications/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify(notification)
    })

    if (response.ok) {
      console.log('✅ Notification envoyée avec succès')
      const result = await response.json()
      console.log('📊 ID notification:', result.data?.idNotification)

      console.log('\n📱 Navigation attendue :')
      console.log('1. Cliquez sur la cloche dans le header')
      console.log('2. La notification devrait apparaître dans le popup')
      console.log('3. Cliquez sur la notification')
      console.log('4. Vous devriez être redirigé vers /formateur/notifications avec highlight')
      console.log('\n🔗 Ou accédez directement à : http://localhost:3000/formateur/notifications')

    } else {
      console.error('❌ Erreur envoi:', response.status, await response.text())
    }
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testFormateurNavigation()