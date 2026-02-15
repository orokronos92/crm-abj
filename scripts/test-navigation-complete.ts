/**
 * Script de test pour vérifier la navigation complète popup → page
 * pour les 3 rôles : Admin, Formateur, Élève
 */

async function testNavigationComplete() {
  const API_KEY = process.env.NOTIFICATIONS_API_KEY || 'your-secure-api-key-from-env'
  const BASE_URL = 'http://localhost:3000'

  console.log('🚀 Test complet de navigation notifications\n')
  console.log('=' .repeat(50))

  // Notifications de test pour chaque rôle
  const testCases = [
    {
      role: 'Admin',
      url: '/admin/dashboard',
      notification: {
        sourceAgent: 'marjorie',
        categorie: 'CANDIDAT',
        type: 'NOUVEAU_DOSSIER',
        priorite: 'HAUTE',
        titre: '[TEST ADMIN] Nouveau dossier JURI102025',
        message: 'Dossier complet reçu pour Juliette Rimbo. Formation CAP ATBJ. Prêt pour validation.',
        audience: 'ADMIN',
        actionRequise: true,
        typeAction: 'VALIDER',
        lienAction: '/admin/candidats/JURI102025'
      }
    },
    {
      role: 'Formateur',
      url: '/formateur/planning',
      notification: {
        sourceAgent: 'system',
        categorie: 'EVALUATION',
        type: 'EVALUATION_REQUISE',
        priorite: 'URGENTE',
        titre: '[TEST FORMATEUR] 5 évaluations en attente',
        message: 'Vous avez 5 évaluations à saisir pour la session CAP Bijou. Date limite : 15/02.',
        audience: 'FORMATEUR',
        actionRequise: true,
        typeAction: 'SAISIR',
        lienAction: '/formateur/evaluations'
      }
    },
    {
      role: 'Élève',
      url: '/eleve/formation',
      notification: {
        sourceAgent: 'system',
        categorie: 'EVALUATION',
        type: 'RESULTAT_DISPONIBLE',
        priorite: 'HAUTE',
        titre: '[TEST ELEVE] Note disponible - Sertissage',
        message: 'Votre évaluation de Sertissage a été corrigée : 17/20. Excellent travail !',
        audience: 'ELEVE',
        actionRequise: true,
        typeAction: 'VOIR',
        lienAction: '/eleve/evaluations'
      }
    }
  ]

  console.log('📤 Envoi des notifications de test...\n')

  const createdNotifications = []

  for (const testCase of testCases) {
    try {
      const response = await fetch(`${BASE_URL}/api/notifications/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify(testCase.notification)
      })

      if (response.ok) {
        const result = await response.json()
        const notifId = result.data?.idNotification
        createdNotifications.push({
          role: testCase.role,
          id: notifId,
          url: testCase.url
        })
        console.log(`✅ ${testCase.role}: Notification créée (ID: ${notifId})`)
      } else {
        console.error(`❌ ${testCase.role}: Erreur ${response.status}`)
      }
    } catch (error) {
      console.error(`❌ ${testCase.role}: Erreur réseau`, error)
    }
  }

  if (createdNotifications.length > 0) {
    console.log('\n' + '=' .repeat(50))
    console.log('📋 INSTRUCTIONS DE TEST\n')

    for (const notif of createdNotifications) {
      console.log(`\n🔹 Test ${notif.role}:`)
      console.log(`   1. Ouvrez: http://localhost:3000${notif.url}`)
      console.log(`   2. Cliquez sur la cloche dans le header`)
      console.log(`   3. Vérifiez que la notification "[TEST ${notif.role.toUpperCase()}]" apparaît`)
      console.log(`   4. Cliquez sur la notification`)
      console.log(`   5. Vérifiez la redirection vers:`)

      switch(notif.role) {
        case 'Admin':
          console.log(`      → /admin/notifications?highlight=${notif.id}`)
          break
        case 'Formateur':
          console.log(`      → /formateur/notifications?highlight=${notif.id}`)
          break
        case 'Élève':
          console.log(`      → /eleve/notifications?highlight=${notif.id}`)
          break
      }

      console.log(`   6. La notification doit être mise en évidence (animation pulse dorée)`)
    }

    console.log('\n' + '=' .repeat(50))
    console.log('🎯 Points de vérification:\n')
    console.log('✓ Badge sur la cloche mis à jour en temps réel')
    console.log('✓ Popup affiche uniquement les notifications du rôle')
    console.log('✓ Click redirige vers la bonne page (/admin, /formateur ou /eleve)')
    console.log('✓ Paramètre ?highlight=[ID] présent dans l\'URL')
    console.log('✓ Notification mise en évidence avec animation')
    console.log('✓ SSE maintient la connexion (indicateur "● Temps réel activé")')

    console.log('\n' + '=' .repeat(50))
    console.log('💡 Filtrage attendu par rôle:\n')
    console.log('Admin: voit uniquement audience="ADMIN"')
    console.log('Formateur: voit audience="FORMATEUR" + audience="TOUS"')
    console.log('Élève: voit audience="ELEVE" + audience="TOUS"')
  }
}

// Test de charge pour vérifier les performances SSE
async function testChargeSSE() {
  const API_KEY = process.env.NOTIFICATIONS_API_KEY || 'your-secure-api-key-from-env'
  const BASE_URL = 'http://localhost:3000'

  console.log('\n⚡ Test de charge SSE (50 notifications rapides)\n')

  const audiences = ['ADMIN', 'FORMATEUR', 'ELEVE', 'TOUS']
  const categories = ['CANDIDAT', 'EVALUATION', 'PLANNING', 'MESSAGE', 'ALERTE']
  const priorites = ['BASSE', 'NORMALE', 'HAUTE', 'URGENTE']

  for (let i = 1; i <= 50; i++) {
    const notification = {
      sourceAgent: 'system',
      categorie: categories[Math.floor(Math.random() * categories.length)],
      type: 'TEST_CHARGE',
      priorite: priorites[Math.floor(Math.random() * priorites.length)],
      titre: `[CHARGE TEST ${i}] Notification de test`,
      message: `Message de test #${i} pour vérifier les performances SSE en temps réel`,
      audience: audiences[Math.floor(Math.random() * audiences.length)]
    }

    try {
      fetch(`${BASE_URL}/api/notifications/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify(notification)
      }).then(res => {
        if (res.ok) {
          console.log(`✅ ${i}/50 envoyé`)
        }
      })
    } catch (error) {
      console.error(`❌ Erreur ${i}:`, error)
    }

    // Petit délai pour éviter de surcharger
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('\n✅ Test de charge terminé!')
  console.log('Vérifiez que toutes les notifications apparaissent en temps réel dans l\'UI')
}

// Menu principal
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'navigation'

  console.clear()

  switch (command) {
    case 'charge':
      await testChargeSSE()
      break
    case 'navigation':
    default:
      await testNavigationComplete()
      break
  }
}

main().catch(console.error)