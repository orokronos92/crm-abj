import dotenv from 'dotenv'
import path from 'path'

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const API_BASE_URL = 'http://localhost:3000/api/notifications'
const API_KEY = process.env.NOTIFICATIONS_API_KEY || 'abj-notifications-2026-secret-key'

console.log('🧪 Test endpoint batch avec format snake_case (comme n8n)')
console.log('  API URL:', API_BASE_URL)
console.log('  API Key:', API_KEY.substring(0, 10) + '...')

async function testBatchSnakeCase() {
  console.log('\n📤 Envoi de notifications en snake_case...')

  // Format snake_case comme n8n enverrait
  const notifications = [
    {
      source_agent: 'marjorie',
      categorie: 'PROSPECT',
      type: 'NOUVEAU_PROSPECT',
      priorite: 'NORMALE',
      titre: 'Nouveau prospect - Test Snake Case 1',
      message: 'Test avec format snake_case depuis n8n workflow',
      audience: 'ADMIN',
      entite_type: 'prospect',
      entite_id: 'test_snake_1',
      lien_action: '/admin/prospects/test1'
    },
    {
      source_agent: 'morrigan',
      source_workflow: 'email-processing',
      source_execution_id: 'exec-123',
      categorie: 'CANDIDAT',
      type: 'DOSSIER_COMPLET',
      priorite: 'HAUTE',
      titre: 'Dossier complet - Test Snake Case 2',
      message: 'Test avec tous les champs snake_case',
      audience: 'ADMIN',
      entite_type: 'candidat',
      entite_id: 'TESU01022026',
      lien_action: '/admin/candidats/TESU01022026',
      action_requise: true,
      type_action: 'VALIDER',
      metadonnees: {
        score: 85,
        formation: 'CAP ATBJ'
      }
    },
    {
      source_agent: 'system',
      categorie: 'FINANCE',
      type: 'PAIEMENT_RECU',
      priorite: 'NORMALE',
      titre: 'Paiement reçu - Test Snake Case 3',
      message: 'Acompte de 2100€ reçu pour formation',
      audience: 'ADMIN',
      id_candidat: 999 // Test legacy field
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
      console.log('\n  📊 Résultats:')
      console.log('  - Créées:', result.data?.created?.length || 0)
      console.log('  - Erreurs:', result.data?.errors?.length || 0)

      if (result.data?.created?.length > 0) {
        console.log('\n  📝 Notifications créées:')
        result.data.created.forEach((notif: any) => {
          console.log(`    - ID ${notif.idNotification}: ${notif.titre}`)
        })
      }

      if (result.data?.errors?.length > 0) {
        console.log('\n  ❌ Erreurs rencontrées:')
        result.data.errors.forEach((err: any) => {
          console.log(`    - ${err.notification}: ${err.error}`)
        })
      }
    } else {
      console.error('  ❌ Erreur:', result.error)
    }
  } catch (error) {
    console.error('  ❌ Erreur réseau:', error)
  }
}

// Test avec format mixte
async function testBatchMixed() {
  console.log('\n📤 Envoi de notifications format mixte (snake_case + camelCase)...')

  const notifications = [
    {
      // Format camelCase
      sourceAgent: 'marjorie',
      categorie: 'DEVIS',
      type: 'DEVIS_ENVOYE',
      priorite: 'NORMALE',
      titre: 'Devis envoyé (camelCase)',
      message: 'Test avec format camelCase',
      audience: 'ADMIN'
    },
    {
      // Format snake_case
      source_agent: 'system',
      categorie: 'ALERTE',
      type: 'CAPACITE_SESSION',
      priorite: 'URGENTE',
      titre: 'Session presque complète (snake_case)',
      message: 'Test avec format snake_case',
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
      console.log('  ✅ Format mixte supporté!', result.message)
    } else {
      console.error('  ❌ Erreur:', result.error)
    }
  } catch (error) {
    console.error('  ❌ Erreur réseau:', error)
  }
}

async function runTests() {
  console.log('=' .repeat(60))

  await testBatchSnakeCase()
  await new Promise(resolve => setTimeout(resolve, 1000))

  await testBatchMixed()

  console.log('\n' + '='.repeat(60))
  console.log('✅ Tests terminés!')
}

// Exécuter les tests
runTests().catch(console.error)