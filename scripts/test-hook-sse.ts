/**
 * Script pour tester le hook SSE dans l'interface
 * Envoie des notifications toutes les 5 secondes pour vérifier le temps réel
 */

import prisma from '@/lib/prisma'

const API_URL = 'http://localhost:3000'
const API_KEY = process.env.NOTIFICATIONS_API_KEY || 'test-api-key-123'

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function sendNotification(index: number) {
  const types = [
    { categorie: 'PROSPECT', type: 'NOUVEAU_PROSPECT', priorite: 'NORMALE' },
    { categorie: 'CANDIDAT', type: 'DOSSIER_COMPLET', priorite: 'HAUTE' },
    { categorie: 'DEVIS', type: 'DEVIS_SIGNE', priorite: 'URGENTE' },
    { categorie: 'DOCUMENT', type: 'DOCUMENT_RECU', priorite: 'BASSE' },
    { categorie: 'EMAIL', type: 'EMAIL_IMPORTANT', priorite: 'HAUTE' },
  ]

  const notif = types[index % types.length]
  const timestamp = new Date().toLocaleTimeString('fr-FR')

  const payload = {
    sourceAgent: 'test-hook',
    categorie: notif.categorie,
    type: notif.type,
    priorite: notif.priorite,
    titre: `🧪 Test Hook SSE #${index} - ${timestamp}`,
    message: `Notification de test ${index} envoyée à ${timestamp}. Catégorie: ${notif.categorie}, Priorité: ${notif.priorite}`,
    audience: 'ADMIN',
    actionRequise: notif.priorite === 'URGENTE',
    typeAction: notif.priorite === 'URGENTE' ? 'VALIDER' : undefined,
    lienAction: `/admin/test/${index}`
  }

  try {
    const response = await fetch(`${API_URL}/api/notifications/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    if (result.success) {
      console.log(`✅ Notification #${index} envoyée - ID: ${result.data.id}`)
      return result.data.id
    } else {
      console.error(`❌ Erreur notification #${index}:`, result.error)
      return null
    }
  } catch (error) {
    console.error(`❌ Erreur réseau notification #${index}:`, error)
    return null
  }
}

async function main() {
  console.log('🧪 Test du hook SSE avec notifications temps réel')
  console.log('============================================================')
  console.log('')
  console.log('📋 Instructions :')
  console.log('1. Ouvrez l\'interface CRM dans votre navigateur')
  console.log('2. Allez sur n\'importe quelle page admin (ex: /admin/dashboard)')
  console.log('3. Cliquez sur l\'icône de cloche dans le header')
  console.log('4. Observez les notifications apparaître en temps réel')
  console.log('')
  console.log('Les notifications seront envoyées toutes les 5 secondes...')
  console.log('Appuyez sur Ctrl+C pour arrêter')
  console.log('')
  console.log('============================================================')
  console.log('')

  let index = 1

  // Envoyer une notification toutes les 5 secondes
  while (true) {
    await sendNotification(index)
    index++

    if (index % 5 === 0) {
      console.log(`\n📊 ${index} notifications envoyées jusqu'à présent\n`)
    }

    await sleep(5000)
  }
}

// Gestion de l'arrêt propre
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Arrêt du test...')

  // Compter les notifications créées
  const count = await prisma.notification.count({
    where: {
      sourceAgent: 'test-hook'
    }
  })

  console.log(`📊 Total de notifications de test créées : ${count}`)
  console.log('✅ Test terminé')

  await prisma.$disconnect()
  process.exit(0)
})

main().catch(console.error)