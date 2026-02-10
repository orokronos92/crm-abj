/**
 * Script pour créer des notifications directement dans la base de données
 * Simule ce que ferait n8n en appelant l'API
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔔 Création de notifications de test dans la base de données')
  console.log('=========================================================')

  // Créer plusieurs notifications de test
  const notifications = await prisma.notification.createMany({
    data: [
      {
        sourceAgent: 'marjorie',
        sourceWorkflow: 'email-processing-v2',
        categorie: 'PROSPECT',
        type: 'NOUVEAU_PROSPECT',
        priorite: 'NORMALE',
        titre: 'Nouveau prospect : Sophie Martin',
        message: 'Sophie Martin s\'intéresse à la formation CAP Bijouterie-Joaillerie. Source: Formulaire site web. Marjorie a envoyé une réponse automatique.',
        audience: 'ADMIN',
        entiteType: 'prospect',
        entiteId: 'sophiemartin@email.fr_MAR_SOP',
        lienAction: '/admin/prospects',
        actionRequise: false,
        lue: false
      },
      {
        sourceAgent: 'marjorie',
        sourceWorkflow: 'devis-generator',
        categorie: 'DEVIS',
        type: 'DEVIS_ENVOYE',
        priorite: 'NORMALE',
        titre: 'Devis envoyé avec succès',
        message: 'Devis pour Juliette Rimbo (JURI102025) envoyé par email. Montant: 8 400€ - Formation CAP ATBJ.',
        audience: 'ADMIN',
        entiteType: 'candidat',
        entiteId: 'JURI102025',
        lienAction: '/admin/candidats/JURI102025',
        actionRequise: false,
        lue: false
      },
      {
        sourceAgent: 'marjorie',
        sourceWorkflow: 'document-checker',
        categorie: 'DOCUMENT',
        type: 'DOCUMENT_MANQUANT',
        priorite: 'HAUTE',
        titre: 'Documents manquants pour DUMI15091992',
        message: 'Le dossier de Marie Dumitru est incomplet. Documents manquants : Pièce d\'identité, Lettre de motivation.',
        audience: 'ADMIN',
        entiteType: 'candidat',
        entiteId: 'DUMI15091992',
        lienAction: '/admin/candidats/DUMI15091992',
        actionRequise: true,
        typeAction: 'RELANCER',
        lue: false
      },
      {
        sourceAgent: 'system',
        categorie: 'SYSTEM',
        type: 'ERREUR_WORKFLOW',
        priorite: 'URGENTE',
        titre: 'Erreur workflow Marjorie-emails',
        message: 'Le workflow de traitement des emails a échoué. Erreur: Impossible de se connecter au serveur IMAP.',
        audience: 'ADMIN',
        actionRequise: true,
        typeAction: 'VERIFIER',
        lue: false
      },
      {
        sourceAgent: 'marjorie',
        categorie: 'FINANCE',
        type: 'FINANCEMENT_VALIDE',
        priorite: 'HAUTE',
        titre: 'Financement OPCO validé',
        message: 'Le financement OPCO pour Lucas Dubois a été validé. Montant accordé: 7 200€.',
        audience: 'ADMIN',
        entiteType: 'candidat',
        entiteId: 'LUDU20032000',
        lienAction: '/admin/candidats/LUDU20032000',
        actionRequise: false,
        lue: false
      },
      {
        sourceAgent: 'marjorie',
        categorie: 'PROSPECT',
        type: 'PROSPECTS_SEMAINE',
        priorite: 'BASSE',
        titre: '3 nouveaux prospects cette semaine',
        message: 'Sophie Martin (CAP ATBJ), Lucas Dubois (Sertissage N1), Emma Rousseau (Joaillerie Création).',
        audience: 'ADMIN',
        lue: true // Une déjà lue pour tester
      },
      {
        sourceAgent: 'marjorie',
        categorie: 'PLANNING',
        type: 'SESSION_BIENTOT',
        priorite: 'NORMALE',
        titre: 'Session CAP ATBJ dans 7 jours',
        message: 'La session de CAP Bijouterie démarre le 17 février. 8 élèves inscrits sur 10 places.',
        audience: 'TOUS',
        lue: true
      },
      {
        sourceAgent: 'marjorie',
        categorie: 'EMAIL',
        type: 'REPONSE_AUTO_ENVOYEE',
        priorite: 'BASSE',
        titre: 'Marjorie a répondu à un prospect',
        message: 'Email de réponse automatique envoyé à Pierre Martin suite à sa demande d\'information sur la formation Sertissage.',
        audience: 'ADMIN',
        lue: false
      }
    ]
  })

  console.log(`✅ ${notifications.count} notifications créées avec succès`)

  // Récupérer et afficher les stats
  const stats = await prisma.notification.aggregate({
    _count: {
      _all: true
    },
    where: {
      lue: false
    }
  })

  const urgentes = await prisma.notification.count({
    where: {
      priorite: 'URGENTE',
      lue: false
    }
  })

  const actionsRequises = await prisma.notification.count({
    where: {
      actionRequise: true,
      actionEffectuee: false
    }
  })

  console.log('')
  console.log('📊 Statistiques des notifications :')
  console.log(`   - Total non lues : ${stats._count._all}`)
  console.log(`   - Urgentes non lues : ${urgentes}`)
  console.log(`   - Actions requises : ${actionsRequises}`)

  // Afficher quelques notifications
  const recentNotifs = await prisma.notification.findMany({
    take: 3,
    orderBy: { creeLe: 'desc' },
    select: {
      titre: true,
      priorite: true,
      categorie: true,
      lue: true
    }
  })

  console.log('')
  console.log('📋 Dernières notifications créées :')
  recentNotifs.forEach(notif => {
    const badge = notif.lue ? '✓' : '•'
    const priority = notif.priorite === 'URGENTE' ? '🔴' :
                     notif.priorite === 'HAUTE' ? '🟠' :
                     notif.priorite === 'NORMALE' ? '🟡' : '⚪'
    console.log(`   ${badge} ${priority} [${notif.categorie}] ${notif.titre}`)
  })

  console.log('')
  console.log('✨ Les notifications sont maintenant visibles dans :')
  console.log('   - Prisma Studio : npx prisma studio → table "notifications"')
  console.log('   - Interface CRM : http://localhost:3000/admin/dashboard (cloche)')
}

main()
  .catch(e => {
    console.error('❌ Erreur :', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })