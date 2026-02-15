import dotenv from 'dotenv'
import path from 'path'

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const API_BASE_URL = 'http://localhost:3000/api/notifications'
const API_KEY = process.env.NOTIFICATIONS_API_KEY || 'abj-notifications-2026-secret-key'

console.log('🔧 Configuration:')
console.log('  API URL:', API_BASE_URL)
console.log('  API Key:', API_KEY.substring(0, 10) + '...')

async function testIngestSingle() {
  console.log('\n📤 Test 1: Envoi d\'une notification simple...')

  const notification = {
    sourceAgent: 'marjorie',
    categorie: 'CANDIDAT',
    type: 'NOUVEAU_DOSSIER',
    priorite: 'ELEVEE',
    titre: 'Nouveau candidat - Marie Dubois',
    message: 'Marie Dubois vient de compléter son dossier de candidature pour CAP ATBJ. Le dossier est complet et nécessite une validation.',
    audience: 'ADMIN',
    idCandidat: 123,
    lienAction: '/admin/candidats/DUMI15091992'
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
      console.log('  ✅ Succès:', result.message)
      console.log('  ID créé:', result.data?.idNotification)
    } else {
      console.error('  ❌ Erreur:', result.error)
    }
  } catch (error) {
    console.error('  ❌ Erreur réseau:', error)
  }
}

async function testIngestBatch() {
  console.log('\n📤 Test 2: Envoi de plusieurs notifications...')

  const notifications = [
    {
      sourceAgent: 'morrigan',
      categorie: 'PROSPECT',
      type: 'NOUVEAU_CONTACT',
      priorite: 'NORMALE',
      titre: 'Nouveau prospect - Jean Martin',
      message: 'Jean Martin a rempli le formulaire de contact pour une formation en sertissage.',
      audience: 'ADMIN',
      idProspect: 'jean.martin@email.com_MAR_JEA'
    },
    {
      sourceAgent: 'marjorie',
      categorie: 'DEVIS',
      type: 'SIGNATURE_REQUISE',
      priorite: 'URGENTE',
      titre: 'Devis en attente de signature',
      message: 'Le devis pour Sophie Lambert (CAP ATBJ) est en attente de signature depuis 5 jours.',
      audience: 'ADMIN',
      idCandidat: 124,
      lienAction: '/admin/candidats/LASO20112025'
    },
    {
      sourceAgent: 'system',
      categorie: 'FINANCEMENT',
      type: 'OPCO_VALIDE',
      priorite: 'NORMALE',
      titre: 'Financement OPCO validé',
      message: 'Le dossier OPCO de Paul Durand a été accepté. Montant accordé: 4500€.',
      audience: 'ADMIN',
      idCandidat: 125
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
      console.log('  ✅ Succès:', result.message)
      console.log('  Notifications créées:', result.data?.created)
      console.log('  Erreurs:', result.data?.errors)
    } else {
      console.error('  ❌ Erreur:', result.error)
    }
  } catch (error) {
    console.error('  ❌ Erreur réseau:', error)
  }
}

async function testGetNotifications() {
  console.log('\n📥 Test 3: Récupération des notifications...')

  try {
    // Test sans filtre
    const response1 = await fetch(API_BASE_URL)
    const result1 = await response1.json()

    if (response1.ok) {
      console.log('  ✅ Toutes les notifications:', result1.data?.length, 'trouvées')
    }

    // Test avec filtre non lues
    const response2 = await fetch(`${API_BASE_URL}?estLue=false`)
    const result2 = await response2.json()

    if (response2.ok) {
      console.log('  ✅ Notifications non lues:', result2.data?.length, 'trouvées')
    }

    // Test avec filtre urgentes
    const response3 = await fetch(`${API_BASE_URL}?priorite=URGENTE`)
    const result3 = await response3.json()

    if (response3.ok) {
      console.log('  ✅ Notifications urgentes:', result3.data?.length, 'trouvées')
    }
  } catch (error) {
    console.error('  ❌ Erreur réseau:', error)
  }
}

async function testMarkAsRead() {
  console.log('\n📝 Test 4: Marquer une notification comme lue...')

  try {
    // D'abord récupérer une notification non lue
    const getResponse = await fetch(`${API_BASE_URL}?estLue=false&limit=1`)
    const getResult = await getResponse.json()

    if (getResult.data && getResult.data.length > 0) {
      const notifId = getResult.data[0].idNotification
      console.log('  Notification à marquer:', notifId)

      // Marquer comme lue
      const patchResponse = await fetch(`${API_BASE_URL}/${notifId}/read`, {
        method: 'PATCH'
      })

      const patchResult = await patchResponse.json()

      if (patchResponse.ok) {
        console.log('  ✅ Notification marquée comme lue')
      } else {
        console.error('  ❌ Erreur:', patchResult.error)
      }
    } else {
      console.log('  ⚠️ Aucune notification non lue trouvée')
    }
  } catch (error) {
    console.error('  ❌ Erreur réseau:', error)
  }
}

async function runAllTests() {
  console.log('🚀 Démarrage des tests des endpoints de notifications\n')
  console.log('=' .repeat(60))

  await testIngestSingle()
  await new Promise(resolve => setTimeout(resolve, 1000))

  await testIngestBatch()
  await new Promise(resolve => setTimeout(resolve, 1000))

  await testGetNotifications()
  await new Promise(resolve => setTimeout(resolve, 1000))

  await testMarkAsRead()

  console.log('\n' + '='.repeat(60))
  console.log('✅ Tests terminés!')
}

// Exécuter les tests
runAllTests().catch(console.error)