/**
 * Script de test pour envoyer des notifications à un élève
 * Teste le filtrage par audience et la navigation popup → page
 */

async function sendEleveNotifications() {
  const API_KEY = process.env.NOTIFICATIONS_API_KEY || 'your-secure-api-key-from-env'
  const BASE_URL = 'http://localhost:3000'

  console.log('🎓 Envoi de notifications pour élève...\n')

  const notifications = [
    {
      sourceAgent: 'system',
      categorie: 'EVALUATION',
      type: 'RESULTAT_DISPONIBLE',
      priorite: 'HAUTE',
      titre: 'Nouvelle évaluation corrigée',
      message: 'Votre évaluation de Sertissage a été corrigée. Note : 16/20. Très bon travail sur la technique de serti griffe.',
      audience: 'ELEVE',
      actionRequise: true,
      typeAction: 'VOIR',
      lienAction: '/eleve/evaluations'
    },
    {
      sourceAgent: 'marjorie',
      categorie: 'PLANNING',
      type: 'MODIFICATION_PLANNING',
      priorite: 'URGENTE',
      titre: 'Changement de planning important',
      message: 'Le cours de Gemmologie du 12/02 (14h-17h) est déplacé au 13/02 (9h-12h). Salle B12 au lieu de A03.',
      audience: 'TOUS',
      actionRequise: false,
      lienAction: '/eleve/planning'
    },
    {
      sourceAgent: 'system',
      categorie: 'REUSSITE',
      type: 'BADGE_DEBLOQU',
      priorite: 'NORMALE',
      titre: 'Badge "Designer Pro" débloqué !',
      message: 'Félicitations ! Vous avez terminé le module Dessin technique avec une moyenne de 17/20.',
      audience: 'ELEVE',
      actionRequise: false
    },
    {
      sourceAgent: 'formateur',
      categorie: 'MESSAGE',
      type: 'MESSAGE_FORMATEUR',
      priorite: 'NORMALE',
      titre: 'Message de M. Laurent',
      message: 'Excellent travail sur votre dernier projet de création. Votre maîtrise du serti rail s\'améliore nettement.',
      audience: 'ELEVE',
      actionRequise: true,
      typeAction: 'REPONDRE',
      lienAction: '/eleve/marjorie'
    },
    {
      sourceAgent: 'system',
      categorie: 'DOCUMENT',
      type: 'NOUVEAU_DOCUMENT',
      priorite: 'BASSE',
      titre: 'Nouveau support de cours disponible',
      message: 'Le guide complet "Techniques de polissage avancées" est maintenant disponible dans votre bibliothèque.',
      audience: 'TOUS',
      actionRequise: true,
      typeAction: 'TELECHARGER',
      lienAction: '/eleve/documents'
    }
  ]

  let successCount = 0
  let errorCount = 0

  for (const notification of notifications) {
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
        const result = await response.json()
        console.log(`✅ ${notification.titre}`)
        console.log(`   ID: ${result.data?.idNotification}, Audience: ${notification.audience}`)
        successCount++
      } else {
        console.error(`❌ Erreur pour "${notification.titre}": ${response.status}`)
        const errorText = await response.text()
        console.error(`   ${errorText}`)
        errorCount++
      }
    } catch (error) {
      console.error(`❌ Erreur réseau pour "${notification.titre}":`, error)
      errorCount++
    }
  }

  console.log('\n📊 Résumé:')
  console.log(`   ✅ Succès: ${successCount}/${notifications.length}`)
  console.log(`   ❌ Erreurs: ${errorCount}/${notifications.length}`)

  if (successCount > 0) {
    console.log('\n📱 Navigation attendue:')
    console.log('1. Ouvrez l\'interface élève : http://localhost:3000/eleve/dashboard')
    console.log('2. Cliquez sur la cloche dans le header')
    console.log('3. Les notifications ELEVE + TOUS devraient apparaître')
    console.log('4. Cliquez sur une notification')
    console.log('5. Vous serez redirigé vers /eleve/notifications avec mise en évidence')
    console.log('\n💡 Note: Les notifications avec audience="ELEVE" ne sont visibles QUE par les élèves')
    console.log('   Les notifications audience="TOUS" sont visibles par tout le monde')
  }
}

// Fonction pour tester le filtrage par audience
async function testAudienceFiltering() {
  const API_KEY = process.env.NOTIFICATIONS_API_KEY || 'your-secure-api-key-from-env'
  const BASE_URL = 'http://localhost:3000'

  console.log('\n🔍 Test du filtrage par audience...\n')

  const testNotifications = [
    { audience: 'ADMIN', titre: '[ADMIN ONLY] Nouveau candidat' },
    { audience: 'FORMATEUR', titre: '[FORMATEUR ONLY] Évaluations à saisir' },
    { audience: 'ELEVE', titre: '[ELEVE ONLY] Votre note est disponible' },
    { audience: 'TOUS', titre: '[TOUS] Fermeture exceptionnelle' }
  ]

  for (const test of testNotifications) {
    const notification = {
      sourceAgent: 'system',
      categorie: 'ALERTE',
      type: 'TEST_AUDIENCE',
      priorite: 'HAUTE',
      titre: test.titre,
      message: `Test de filtrage pour audience: ${test.audience}`,
      audience: test.audience
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
        console.log(`✅ Créé: ${test.titre}`)
      }
    } catch (error) {
      console.error(`❌ Erreur: ${test.titre}`)
    }
  }

  console.log('\n📊 Résultat attendu par interface:')
  console.log('   Admin: voit [ADMIN ONLY] uniquement')
  console.log('   Formateur: voit [FORMATEUR ONLY] + [TOUS]')
  console.log('   Élève: voit [ELEVE ONLY] + [TOUS]')
}

// Menu principal
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'send'

  switch (command) {
    case 'test':
      await testAudienceFiltering()
      break
    case 'send':
    default:
      await sendEleveNotifications()
      break
  }
}

main().catch(console.error)