/**
 * Script pour envoyer des notifications de test pour les formateurs
 */

const API_URL = 'http://localhost:3000/api/notifications/ingest'
const API_KEY = process.env.NOTIFICATIONS_API_KEY || 'test-api-key-12345'

// Exemples de notifications formateur
const notificationsFormateur = [
  {
    sourceAgent: 'system',
    categorie: 'PLANNING',
    type: 'SESSION_MODIFIEE',
    priorite: 'HAUTE',
    titre: 'Changement de salle - CAP Bijouterie',
    message: 'Votre session du 15/02 aura lieu en Atelier B au lieu de l\'Atelier A. 12 élèves inscrits.',
    audience: 'FORMATEUR',
    lienAction: '/formateur/planning'
  },
  {
    sourceAgent: 'system',
    categorie: 'EVALUATION',
    type: 'EVALUATION_A_FAIRE',
    priorite: 'NORMALE',
    titre: 'Évaluations en attente de saisie',
    message: 'Vous avez 5 évaluations pratiques à saisir pour la session CAP Bijouterie du 08/02.',
    audience: 'FORMATEUR',
    actionRequise: true,
    typeAction: 'SAISIR',
    lienAction: '/formateur/evaluations'
  },
  {
    sourceAgent: 'system',
    categorie: 'ALERTE',
    type: 'ABSENCE_ELEVE',
    priorite: 'URGENTE',
    titre: 'Absence non justifiée - Sophie Martin',
    message: 'Sophie Martin (CAP Bijouterie) : 3 absences non justifiées cette semaine. Suivi recommandé.',
    audience: 'FORMATEUR',
    actionRequise: true,
    typeAction: 'VERIFIER',
    lienAction: '/formateur/eleves'
  },
  {
    sourceAgent: 'marjorie',
    categorie: 'ELEVE',
    type: 'ELEVE_EN_DIFFICULTE',
    priorite: 'HAUTE',
    titre: 'Élève en difficulté - Jean Dupont',
    message: 'Jean Dupont montre des signes de décrochage : moyenne en baisse (12→8), présence irrégulière.',
    audience: 'FORMATEUR',
    lienAction: '/formateur/eleves'
  },
  {
    sourceAgent: 'system',
    categorie: 'PLANNING',
    type: 'NOUVELLE_SESSION',
    priorite: 'NORMALE',
    titre: 'Nouvelle session attribuée',
    message: 'Session "Initiation Bijouterie" ajoutée à votre planning : 20-24 février, Salle 2, 6 élèves.',
    audience: 'FORMATEUR',
    lienAction: '/formateur/planning'
  }
]

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
    } else {
      console.error('❌ Erreur:', result.error)
    }

    return result
  } catch (error) {
    console.error('❌ Erreur réseau:', error)
    return null
  }
}

async function main() {
  const arg = process.argv[2]
  const count = parseInt(arg) || 1

  console.log(`\n🔔 Envoi de ${count} notification(s) formateur...\n`)

  if (count === 1) {
    // Envoyer une notification aléatoire
    const randomNotif = notificationsFormateur[Math.floor(Math.random() * notificationsFormateur.length)]
    await sendNotification(randomNotif)
  } else {
    // Envoyer plusieurs notifications
    for (let i = 0; i < Math.min(count, notificationsFormateur.length); i++) {
      await sendNotification(notificationsFormateur[i])
      // Petit délai entre chaque envoi
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  console.log('\n✨ Terminé!')
  process.exit(0)
}

main()