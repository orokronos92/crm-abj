/**
 * Script de test pour simuler l'envoi de notifications depuis n8n
 * Simule différents types de notifications que Marjorie pourrait envoyer
 */

import dotenv from 'dotenv'
import { resolve } from 'path'

// Charger les variables d'environnement
dotenv.config({ path: resolve(__dirname, '.env.local') })

const API_URL = 'http://localhost:3000/api/notifications/ingest'
const API_KEY = process.env.NOTIFICATIONS_API_KEY || 'abj-notifications-2026-secret-key'

// Exemples de notifications que n8n pourrait envoyer
const testNotifications = [
  {
    // Notification 1: Nouveau prospect
    sourceAgent: 'marjorie',
    sourceWorkflow: 'email-processing-v2',
    sourceExecutionId: 'exec-123456',
    categorie: 'PROSPECT',
    type: 'NOUVEAU_PROSPECT',
    priorite: 'NORMALE',
    titre: 'Nouveau prospect : Sophie Martin',
    message: 'Sophie Martin s\'intéresse à la formation CAP Bijouterie-Joaillerie. Source: Formulaire site web. Marjorie a envoyé une réponse automatique avec le lien du formulaire de candidature.',
    audience: 'ADMIN',
    entiteType: 'prospect',
    entiteId: 'sophiemartin@email.fr_MAR_SOP',
    lienAction: '/admin/prospects',
    actionRequise: false,
    metadonnees: {
      formationsDetectees: ['CAP_BJ'],
      scoreInteret: 85,
      resumeIa: 'Profil très motivé, reconversion professionnelle, budget CPF disponible'
    }
  },
  {
    // Notification 2: Devis envoyé
    sourceAgent: 'marjorie',
    sourceWorkflow: 'devis-generator',
    sourceExecutionId: 'exec-789012',
    categorie: 'DEVIS',
    type: 'DEVIS_ENVOYE',
    priorite: 'NORMALE',
    titre: 'Devis envoyé avec succès',
    message: 'Devis pour Juliette Rimbo (JURI102025) envoyé par email. Montant: 8 400€ - Formation CAP ATBJ. Le devis expire dans 14 jours.',
    audience: 'ADMIN',
    entiteType: 'candidat',
    entiteId: 'JURI102025',
    lienAction: '/admin/candidats/JURI102025',
    actionRequise: false,
    metadonnees: {
      montantDevis: 8400,
      formation: 'CAP_ATBJ',
      dateExpiration: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    }
  },
  {
    // Notification 3: Document manquant - Action requise
    sourceAgent: 'marjorie',
    sourceWorkflow: 'document-checker',
    categorie: 'DOCUMENT',
    type: 'DOCUMENT_MANQUANT',
    priorite: 'HAUTE',
    titre: 'Documents manquants pour DUMI15091992',
    message: 'Le dossier de Marie Dumitru est incomplet. Documents manquants : Pièce d\'identité, Lettre de motivation. Relance recommandée.',
    audience: 'ADMIN',
    entiteType: 'candidat',
    entiteId: 'DUMI15091992',
    lienAction: '/admin/candidats/DUMI15091992',
    actionRequise: true,
    typeAction: 'RELANCER',
    metadonnees: {
      documentsManquants: ['CNI_RECTO', 'CNI_VERSO', 'LETTRE_MOTIVATION'],
      joursDepuisEnvoi: 7
    }
  },
  {
    // Notification 4: Erreur workflow - URGENTE
    sourceAgent: 'system',
    sourceWorkflow: 'email-processing-v2',
    categorie: 'SYSTEM',
    type: 'ERREUR_WORKFLOW',
    priorite: 'URGENTE',
    titre: 'Erreur workflow Marjorie-emails',
    message: 'Le workflow de traitement des emails a échoué. Erreur: Impossible de se connecter au serveur IMAP. 3 emails en attente de traitement.',
    audience: 'ADMIN',
    actionRequise: true,
    typeAction: 'VERIFIER',
    metadonnees: {
      errorCode: 'IMAP_CONNECTION_FAILED',
      emailsEnAttente: 3,
      derniereExecution: new Date().toISOString()
    }
  },
  {
    // Notification 5: Financement validé
    sourceAgent: 'marjorie',
    sourceWorkflow: 'financement-tracker',
    categorie: 'FINANCE',
    type: 'FINANCEMENT_VALIDE',
    priorite: 'HAUTE',
    titre: 'Financement OPCO validé',
    message: 'Le financement OPCO pour Lucas Dubois a été validé. Montant accordé: 7 200€. Le candidat peut maintenant être inscrit définitivement.',
    audience: 'ADMIN',
    entiteType: 'candidat',
    entiteId: 'LUDU20032000',
    lienAction: '/admin/candidats/LUDU20032000',
    actionRequise: false,
    metadonnees: {
      montantAccorde: 7200,
      organismeFinanceur: 'OPCO EP',
      dateValidation: new Date().toISOString()
    }
  }
]

// Fonction pour envoyer une notification
async function sendNotification(notification: any) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify(notification)
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Notification envoyée:', notification.titre)
      console.log('   Réponse:', result)
    } else {
      console.error('❌ Erreur envoi notification:', notification.titre)
      console.error('   Erreur:', result)
    }

    return result
  } catch (error) {
    console.error('❌ Erreur réseau:', error)
    return null
  }
}

// Fonction pour envoyer un batch de notifications
async function sendBatch(notifications: any[]) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        batch: notifications
      })
    })

    const result = await response.json()

    if (response.ok) {
      console.log(`✅ Batch de ${notifications.length} notifications envoyé`)
      console.log('   Réponse:', result)
    } else {
      console.error('❌ Erreur envoi batch')
      console.error('   Erreur:', result)
    }

    return result
  } catch (error) {
    console.error('❌ Erreur réseau:', error)
    return null
  }
}

// Fonction principale
async function main() {
  console.log('🔔 Test du système de notifications CRM ABJ')
  console.log('==========================================')
  console.log(`API URL: ${API_URL}`)
  console.log(`API Key: ${API_KEY.substring(0, 10)}...`)
  console.log('')

  // Vérifier que le serveur est accessible
  try {
    const healthCheck = await fetch('http://localhost:3000/api/health').catch(() => null)
    if (!healthCheck) {
      console.log('⚠️  Le serveur Next.js ne semble pas démarré sur http://localhost:3000')
      console.log('   Lancez "npm run dev" dans un autre terminal')
      process.exit(1)
    }
  } catch (error) {
    // Pas de endpoint /api/health, on continue
  }

  console.log('📤 Envoi des notifications de test...')
  console.log('')

  // Option 1: Envoyer les notifications une par une
  console.log('--- Envoi individuel ---')
  for (const notification of testNotifications) {
    await sendNotification(notification)
    // Attendre un peu entre chaque envoi
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('')
  console.log('--- Envoi en batch ---')

  // Option 2: Envoyer toutes les notifications d'un coup
  const batchNotifications = [
    {
      sourceAgent: 'marjorie',
      categorie: 'PROSPECT',
      type: 'PROSPECTS_SEMAINE',
      priorite: 'BASSE',
      titre: '3 nouveaux prospects cette semaine',
      message: 'Sophie Martin (CAP ATBJ), Lucas Dubois (Sertissage N1), Emma Rousseau (Joaillerie Création). Tous ont un fort potentiel de conversion.',
      audience: 'ADMIN'
    },
    {
      sourceAgent: 'marjorie',
      categorie: 'PLANNING',
      type: 'SESSION_BIENTOT',
      priorite: 'NORMALE',
      titre: 'Session CAP ATBJ dans 7 jours',
      message: 'La session de CAP Bijouterie démarre le 17 février. 8 élèves inscrits sur 10 places. Formateur principal: M. Laurent.',
      audience: 'TOUS'
    }
  ]

  await sendBatch(batchNotifications)

  console.log('')
  console.log('✨ Test terminé !')
  console.log('')
  console.log('Vérifiez les notifications dans :')
  console.log('- La base de données : npx prisma studio → table "notifications"')
  console.log('- L\'interface : http://localhost:3000/admin/dashboard (cloche en haut)')
}

// Exécuter le script
main().catch(console.error)