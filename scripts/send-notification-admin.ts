/**
 * Script pour envoyer une notification à l'interface admin
 * Usage: npx tsx scripts/send-notification-admin.ts
 */

import dotenv from 'dotenv'
import path from 'path'

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const API_BASE_URL = 'http://localhost:3000/api/notifications'
const API_KEY = process.env.NOTIFICATIONS_API_KEY || 'abj-notifications-2026-secret-key'

async function sendAdminNotification() {
  // Notification à envoyer
  const notification = {
    sourceAgent: 'marjorie',
    categorie: 'CANDIDAT',
    type: 'NOUVEAU_DOSSIER',
    priorite: 'HAUTE',  // BASSE | NORMALE | HAUTE | URGENTE
    titre: '🎉 Nouveau candidat - Test UI Admin',
    message: 'Un nouveau candidat vient de compléter son dossier. Ceci est un test du système de notifications.',
    audience: 'ADMIN',  // Visible uniquement pour les admins
    lienAction: '/admin/candidats',  // Lien optionnel vers une page
    actionRequise: true,  // Indique qu'une action est nécessaire
    typeAction: 'VALIDER'  // Type d'action attendue
  }

  console.log('📤 Envoi de la notification...')
  console.log('   Titre:', notification.titre)
  console.log('   Priorité:', notification.priorite)
  console.log('   Audience:', notification.audience)
  console.log('')

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
      console.log('✅ Notification envoyée avec succès!')
      console.log('   ID:', result.data?.idNotification)
      console.log('')
      console.log('👉 Ouvre http://localhost:3000 et clique sur la cloche 🔔 pour voir la notification')
    } else {
      console.error('❌ Erreur:', result.error)
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error)
  }
}

// Exemples de notifications prédéfinies
async function sendExamples() {
  const examples = [
    {
      sourceAgent: 'marjorie',
      categorie: 'DEVIS',
      type: 'DEVIS_ENVOYE',
      priorite: 'NORMALE',
      titre: '📧 Devis envoyé - Marie Dupont',
      message: 'Le devis pour la formation CAP ATBJ a été envoyé à Marie Dupont (8400€). En attente de signature.',
      audience: 'ADMIN',
      lienAction: '/admin/candidats',
      entiteType: 'CANDIDAT',
      entiteId: 'DUMI15092024'
    },
    {
      sourceAgent: 'system',
      categorie: 'ALERTE',
      type: 'DOCUMENT_MANQUANT',
      priorite: 'URGENTE',
      titre: '⚠️ Document manquant urgent',
      message: 'Le dossier de Jean Martin est incomplet. Document manquant : Justificatif de financement OPCO. Relance nécessaire.',
      audience: 'ADMIN',
      actionRequise: true,
      typeAction: 'RELANCER'
    },
    {
      sourceAgent: 'marjorie',
      categorie: 'FINANCEMENT',
      type: 'PAIEMENT_RECU',
      priorite: 'NORMALE',
      titre: '✅ Paiement reçu - Sophie Lambert',
      message: 'Acompte de 2100€ reçu pour Sophie Lambert. Formation Sertissage Niveau 1.',
      audience: 'ADMIN',
      entiteType: 'CANDIDAT',
      entiteId: 'LASO20112025'
    }
  ]

  for (const notif of examples) {
    console.log(`\n📤 Envoi: ${notif.titre}`)

    try {
      const response = await fetch(`${API_BASE_URL}/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify(notif)
      })

      const result = await response.json()

      if (response.ok) {
        console.log(`   ✅ ID: ${result.data?.idNotification}`)
      } else {
        console.error(`   ❌ Erreur: ${result.error}`)
      }
    } catch (error) {
      console.error(`   ❌ Erreur réseau:`, error)
    }

    // Attendre un peu entre chaque envoi
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

// Menu interactif
console.log('╔════════════════════════════════════════════╗')
console.log('║     Envoi de Notifications Admin ABJ       ║')
console.log('╚════════════════════════════════════════════╝')
console.log('')
console.log('Que voulez-vous faire ?')
console.log('1. Envoyer une notification de test simple')
console.log('2. Envoyer 3 exemples de notifications')
console.log('')

const choice = process.argv[2] || '1'

if (choice === '2') {
  console.log('Envoi de plusieurs notifications d\'exemple...')
  sendExamples().then(() => {
    console.log('\n✅ Terminé! Ouvre http://localhost:3000 et clique sur la cloche 🔔')
  })
} else {
  sendAdminNotification()
}