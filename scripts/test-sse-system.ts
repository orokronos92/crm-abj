/**
 * Script de test complet du système SSE de notifications
 *
 * Ce script :
 * 1. Se connecte au stream SSE
 * 2. Envoie une notification via l'API
 * 3. Vérifie qu'elle est reçue via SSE
 * 4. Teste l'exécution d'une action
 */

import dotenv from 'dotenv'
import path from 'path'
import { EventSource } from 'eventsource'

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const API_BASE_URL = 'http://localhost:3000/api/notifications'
const API_KEY = process.env.NOTIFICATIONS_API_KEY || 'abj-notifications-2026-secret-key'

// Polyfill EventSource pour Node.js
global.EventSource = EventSource as any

console.log('🧪 Test du système SSE de notifications')
console.log('=' .repeat(60))

/**
 * Test de connexion SSE et réception en temps réel
 */
async function testSSEConnection(): Promise<EventSource> {
  console.log('\n📡 Test 1: Connexion SSE...')

  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(`${API_BASE_URL}/stream`)

    eventSource.onopen = () => {
      console.log('  ✅ Connexion SSE établie')
      resolve(eventSource)
    }

    eventSource.onerror = (error) => {
      console.error('  ❌ Erreur de connexion SSE:', error)
      reject(error)
    }

    // Écouter les différents types d'événements
    eventSource.addEventListener('connected', (event: any) => {
      const data = JSON.parse(event.data)
      console.log('  📨 Message de bienvenue reçu:', data.message)
    })

    eventSource.addEventListener('count', (event: any) => {
      const data = JSON.parse(event.data)
      console.log('  📊 Compteurs reçus:', data)
    })

    eventSource.addEventListener('notification', (event: any) => {
      const data = JSON.parse(event.data)
      console.log('  🔔 Notification reçue en temps réel!')
      console.log('     - ID:', data.idNotification)
      console.log('     - Titre:', data.titre)
      console.log('     - Priorité:', data.priorite)
    })

    eventSource.addEventListener('action_completed', (event: any) => {
      const data = JSON.parse(event.data)
      console.log('  ✅ Action complétée reçue!')
      console.log('     - Notification ID:', data.notificationId)
      console.log('     - Type action:', data.typeAction)
      console.log('     - Résultat:', data.resultat)
    })

    // Heartbeat
    eventSource.onmessage = (event) => {
      if (event.data.includes('heartbeat')) {
        console.log('  💓 Heartbeat reçu')
      }
    }
  })
}

/**
 * Test d'envoi de notification avec vérification SSE
 */
async function testNotificationBroadcast() {
  console.log('\n📤 Test 2: Envoi notification et vérification SSE...')

  const notification = {
    sourceAgent: 'marjorie',
    categorie: 'TEST',
    type: 'TEST_SSE',
    priorite: 'URGENTE',
    titre: `🧪 Test SSE - ${new Date().toLocaleTimeString()}`,
    message: 'Cette notification teste le système de broadcast SSE en temps réel',
    audience: 'ADMIN',
    lienAction: '/admin/test',
    actionRequise: true,
    typeAction: 'VALIDER'
  }

  try {
    const response = await fetch(`${API_BASE_URL}/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(notification)
    })

    const result = await response.json()

    if (response.ok) {
      console.log('  ✅ Notification envoyée:', result.message)
      console.log('  ID créé:', result.data?.idNotification)
      return result.data?.idNotification
    } else {
      console.error('  ❌ Erreur envoi:', result.error)
      return null
    }
  } catch (error) {
    console.error('  ❌ Erreur réseau:', error)
    return null
  }
}

/**
 * Test d'exécution d'une action
 */
async function testActionExecution(notificationId: number) {
  console.log(`\n⚡ Test 3: Exécution d'une action sur notification ${notificationId}...`)

  const actionPayload = {
    typeAction: 'VALIDER',
    resultat: 'approved',
    commentaire: 'Test validation via SSE',
    metadata: {
      testId: 'sse-test-001',
      timestamp: new Date().toISOString()
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${notificationId}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(actionPayload)
    })

    const result = await response.json()

    if (response.ok) {
      console.log('  ✅ Action exécutée:', result.message)
      console.log('  - Action:', result.data?.actionExecutee)
      console.log('  - Résultat:', result.data?.resultat)
    } else {
      console.error('  ❌ Erreur action:', result.error)
    }
  } catch (error) {
    console.error('  ❌ Erreur réseau:', error)
  }
}

/**
 * Test des stats SSE (endpoint debug)
 */
async function testSSEStats() {
  console.log('\n📊 Test 4: Récupération des stats SSE...')

  try {
    const response = await fetch(`${API_BASE_URL}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (response.ok) {
      console.log('  ✅ Stats SSE:')
      console.log('  - Clients connectés:', result.stats?.clientsConnected)
      console.log('  - Par rôle:', result.stats?.byRole)
      if (result.stats?.uptime?.length > 0) {
        console.log('  - Temps de connexion:')
        result.stats.uptime.forEach((client: any) => {
          console.log(`    • ${client.clientId}: ${client.uptimeSeconds}s`)
        })
      }
    } else {
      console.error('  ❌ Erreur stats:', result)
    }
  } catch (error) {
    console.error('  ❌ Erreur réseau:', error)
  }
}

/**
 * Test de batch avec broadcast
 */
async function testBatchBroadcast() {
  console.log('\n📤 Test 5: Envoi batch avec broadcast SSE...')

  const notifications = [
    {
      sourceAgent: 'marjorie',
      categorie: 'PROSPECT',
      type: 'NOUVEAU_PROSPECT',
      priorite: 'NORMALE',
      titre: 'Nouveau prospect SSE 1',
      message: 'Test batch broadcast 1',
      audience: 'ADMIN'
    },
    {
      sourceAgent: 'morrigan',
      categorie: 'CANDIDAT',
      type: 'DOSSIER_COMPLET',
      priorite: 'HAUTE',
      titre: 'Dossier complet SSE 2',
      message: 'Test batch broadcast 2',
      audience: 'ADMIN'
    },
    {
      sourceAgent: 'system',
      categorie: 'ALERTE',
      type: 'ERREUR_WORKFLOW',
      priorite: 'URGENTE',
      titre: 'Erreur workflow SSE 3',
      message: 'Test batch broadcast 3',
      audience: 'ADMIN'
    }
  ]

  try {
    const response = await fetch(`${API_BASE_URL}/ingest/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({ notifications })
    })

    const result = await response.json()

    if (response.ok) {
      console.log('  ✅ Batch envoyé:', result.message)
      console.log('  - Créées:', result.data?.created?.length || 0)
      console.log('  - Erreurs:', result.data?.errors?.length || 0)
    } else {
      console.error('  ❌ Erreur batch:', result.error)
    }
  } catch (error) {
    console.error('  ❌ Erreur réseau:', error)
  }
}

/**
 * Fonction principale de test
 */
async function runTests() {
  let eventSource: EventSource | null = null

  try {
    // 1. Se connecter au SSE
    eventSource = await testSSEConnection()
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 2. Envoyer une notification et vérifier qu'elle arrive via SSE
    const notificationId = await testNotificationBroadcast()
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 3. Exécuter une action si une notification a été créée
    if (notificationId) {
      await testActionExecution(notificationId)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    // 4. Vérifier les stats SSE
    await testSSEStats()
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 5. Tester le batch broadcast
    await testBatchBroadcast()
    await new Promise(resolve => setTimeout(resolve, 3000))

    console.log('\n' + '='.repeat(60))
    console.log('✅ Tests SSE terminés!')
    console.log('💡 Les notifications devraient être apparues en temps réel ci-dessus')

  } catch (error) {
    console.error('\n❌ Erreur pendant les tests:', error)
  } finally {
    // Fermer la connexion SSE
    if (eventSource) {
      console.log('\n🔌 Fermeture de la connexion SSE...')
      eventSource.close()
    }
    process.exit(0)
  }
}

// Lancer les tests
console.log('\n🚀 Démarrage des tests SSE dans 2 secondes...')
console.log('   (Le serveur Next.js doit être en cours d\'exécution)')

setTimeout(() => {
  runTests().catch(console.error)
}, 2000)