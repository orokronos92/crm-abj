/**
 * Script de test pour la table Evenement
 * Montre comment créer, modifier, annuler (soft delete) des événements
 */

import prisma from '../src/lib/prisma'

async function main() {
  console.log('\n📅 TEST SYSTÈME ÉVÉNEMENTS\n')
  console.log('=' .repeat(60))

  // Vérifier si un utilisateur admin existe
  const admin = await prisma.utilisateur.findFirst({
    where: { role: 'admin' }
  })
  const adminId = admin?.idUtilisateur || null

  // 1. Créer un événement
  console.log('\n1️⃣ CRÉATION D\'ÉVÉNEMENT')
  console.log('-'.repeat(60))

  const porteOuverte = await prisma.evenement.create({
    data: {
      type: 'PORTES_OUVERTES',
      titre: 'Portes ouvertes printemps 2026',
      description: 'Découverte des métiers de la bijouterie-joaillerie. Démonstrations et ateliers pratiques.',
      date: new Date('2026-03-15'),
      heureDebut: '09:00',
      heureFin: '17:00',
      salle: 'Tous les ateliers',
      nombreParticipants: 50,
      participantsInscrits: 0,
      statut: 'PLANIFIE',
      creePar: adminId,
      notes: 'Prévoir rafraîchissements et documentation'
    }
  })

  console.log('✅ Événement créé :')
  console.log(`   ID: ${porteOuverte.idEvenement}`)
  console.log(`   Titre: ${porteOuverte.titre}`)
  console.log(`   Date: ${porteOuverte.date.toLocaleDateString('fr-FR')}`)
  console.log(`   Horaires: ${porteOuverte.heureDebut} - ${porteOuverte.heureFin}`)
  console.log(`   Salle: ${porteOuverte.salle}`)
  console.log(`   Statut: ${porteOuverte.statut}`)

  // 2. Créer un deuxième événement
  console.log('\n2️⃣ CRÉATION STAGE INITIATION')
  console.log('-'.repeat(60))

  const stage = await prisma.evenement.create({
    data: {
      type: 'STAGE_INITIATION',
      titre: 'Stage initiation sertissage',
      description: 'Découverte du sertissage - niveau débutant',
      date: new Date('2026-04-10'),
      heureDebut: '14:00',
      heureFin: '18:00',
      salle: 'Atelier B',
      nombreParticipants: 8,
      participantsInscrits: 0,
      statut: 'PLANIFIE',
      creePar: adminId,
      notes: 'Matériel fourni'
    }
  })

  console.log('✅ Stage créé :')
  console.log(`   ID: ${stage.idEvenement}`)
  console.log(`   Titre: ${stage.titre}`)
  console.log(`   Salle: ${stage.salle}`)

  // 3. Vérifier conflit de salle (même salle, même date)
  console.log('\n3️⃣ VÉRIFICATION CONFLIT DE SALLE')
  console.log('-'.repeat(60))

  const conflitTest = await prisma.evenement.findFirst({
    where: {
      salle: 'Atelier B',
      date: new Date('2026-04-10'),
      statut: { notIn: ['ANNULE'] } // Ignorer les événements annulés
    }
  })

  if (conflitTest) {
    console.log('❌ CONFLIT DÉTECTÉ !')
    console.log(`   Atelier B déjà occupé le 10/04/2026`)
    console.log(`   Événement existant: ${conflitTest.titre}`)
    console.log(`   Horaires: ${conflitTest.heureDebut} - ${conflitTest.heureFin}`)
  } else {
    console.log('✅ Salle disponible')
  }

  // 4. Modifier un événement (confirmer)
  console.log('\n4️⃣ CONFIRMATION D\'ÉVÉNEMENT')
  console.log('-'.repeat(60))

  const confirme = await prisma.evenement.update({
    where: { idEvenement: porteOuverte.idEvenement },
    data: {
      statut: 'CONFIRME',
      participantsInscrits: 12,
      modifiePar: adminId
    }
  })

  console.log('✅ Événement confirmé :')
  console.log(`   ID: ${confirme.idEvenement}`)
  console.log(`   Statut: ${confirme.statut}`)
  console.log(`   Participants inscrits: ${confirme.participantsInscrits}/${confirme.nombreParticipants}`)

  // 5. Annuler un événement (SOFT DELETE)
  console.log('\n5️⃣ ANNULATION D\'ÉVÉNEMENT (SOFT DELETE)')
  console.log('-'.repeat(60))

  const annule = await prisma.evenement.update({
    where: { idEvenement: stage.idEvenement },
    data: {
      statut: 'ANNULE',
      motifAnnulation: 'Formateur indisponible - report prévu en mai',
      annulePar: adminId,
      dateAnnulation: new Date()
    }
  })

  console.log('✅ Événement annulé (reste en base) :')
  console.log(`   ID: ${annule.idEvenement}`)
  console.log(`   Statut: ${annule.statut}`)
  console.log(`   Motif: ${annule.motifAnnulation}`)
  console.log(`   Annulé par: Utilisateur ${annule.annulePar}`)
  console.log(`   Date annulation: ${annule.dateAnnulation?.toLocaleDateString('fr-FR')}`)

  // 6. Lister tous les événements (même annulés)
  console.log('\n6️⃣ LISTE COMPLÈTE DES ÉVÉNEMENTS (historique)')
  console.log('-'.repeat(60))

  const tousEvenements = await prisma.evenement.findMany({
    orderBy: { date: 'asc' }
  })

  tousEvenements.forEach(evt => {
    const emoji = evt.statut === 'ANNULE' ? '❌' : evt.statut === 'CONFIRME' ? '✅' : '📅'
    console.log(`${emoji} ${evt.titre}`)
    console.log(`   Date: ${evt.date.toLocaleDateString('fr-FR')} | ${evt.heureDebut}-${evt.heureFin}`)
    console.log(`   Salle: ${evt.salle} | Statut: ${evt.statut}`)
    if (evt.statut === 'ANNULE') {
      console.log(`   ⚠️ Annulé : ${evt.motifAnnulation}`)
    }
    console.log('')
  })

  // 7. Lister uniquement les événements actifs (pour le planning)
  console.log('\n7️⃣ ÉVÉNEMENTS ACTIFS (pour affichage planning)')
  console.log('-'.repeat(60))

  const evenementsActifs = await prisma.evenement.findMany({
    where: {
      statut: { notIn: ['ANNULE'] }
    },
    orderBy: { date: 'asc' }
  })

  console.log(`✅ ${evenementsActifs.length} événement(s) actif(s)`)
  evenementsActifs.forEach(evt => {
    console.log(`   • ${evt.titre} - ${evt.date.toLocaleDateString('fr-FR')} (${evt.statut})`)
  })

  // 8. Statistiques
  console.log('\n8️⃣ STATISTIQUES')
  console.log('-'.repeat(60))

  const [total, planifies, confirmes, annules, termines] = await Promise.all([
    prisma.evenement.count(),
    prisma.evenement.count({ where: { statut: 'PLANIFIE' } }),
    prisma.evenement.count({ where: { statut: 'CONFIRME' } }),
    prisma.evenement.count({ where: { statut: 'ANNULE' } }),
    prisma.evenement.count({ where: { statut: 'TERMINE' } })
  ])

  console.log(`📊 Total événements en base: ${total}`)
  console.log(`   📅 Planifiés: ${planifies}`)
  console.log(`   ✅ Confirmés: ${confirmes}`)
  console.log(`   ❌ Annulés: ${annules}`)
  console.log(`   🏁 Terminés: ${termines}`)

  console.log('\n' + '='.repeat(60))
  console.log('✅ TEST TERMINÉ - Système événements fonctionnel')
  console.log('💡 Les événements annulés restent en base pour l\'historique\n')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
