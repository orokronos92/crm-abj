/**
 * Script de seed pour initialiser la base de données
 * Données de test pour démarrage
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seed de la base de données...')

  // ============================================================
  // 1. CRÉATION DES UTILISATEURS
  // ============================================================
  console.log('👤 Création des utilisateurs...')

  // Hash des mots de passe
  const passwordHash = await bcrypt.hash('ABJ2024!', 10)

  // Admin
  const admin = await prisma.utilisateur.upsert({
    where: { email: 'admin@abj.fr' },
    update: {},
    create: {
      email: 'admin@abj.fr',
      motDePasseHash: passwordHash,
      nom: 'Admin',
      prenom: 'Système',
      role: 'admin',
      statutCompte: 'ACTIF'
    }
  })

  // Formateur
  const formateur = await prisma.utilisateur.upsert({
    where: { email: 'formateur@abj.fr' },
    update: {},
    create: {
      email: 'formateur@abj.fr',
      motDePasseHash: passwordHash,
      nom: 'Durand',
      prenom: 'Pierre',
      role: 'professeur',
      statutCompte: 'ACTIF'
    }
  })

  // Élève
  const eleve = await prisma.utilisateur.upsert({
    where: { email: 'eleve@abj.fr' },
    update: {},
    create: {
      email: 'eleve@abj.fr',
      motDePasseHash: passwordHash,
      nom: 'Martin',
      prenom: 'Sophie',
      role: 'eleve',
      statutCompte: 'ACTIF'
    }
  })

  console.log('✅ Utilisateurs créés')

  // ============================================================
  // 2. CRÉATION DES FORMATIONS
  // ============================================================
  console.log('📚 Création des formations...')

  const formations = await Promise.all([
    prisma.formation.upsert({
      where: { codeFormation: 'CAP_BJ' },
      update: {},
      create: {
        codeFormation: 'CAP_BJ',
        nom: 'CAP Bijouterie-Joaillerie',
        categorie: 'CAP',
        dureeJours: 180,
        dureeHeures: 1200,
        niveauRequis: '3ème',
        diplomeDelivre: 'CAP Bijouterie-Joaillerie',
        tarifStandard: 8500,
        description: 'Formation complète au métier de bijoutier-joaillier',
        prerequis: ['Niveau 3ème', 'Dextérité manuelle', 'Sens artistique'],
        objectifs: [
          'Maîtriser les techniques de base de la bijouterie',
          'Créer des bijoux simples',
          'Connaître les métaux et pierres'
        ],
        actif: true
      }
    }),
    prisma.formation.upsert({
      where: { codeFormation: 'INIT_BJ' },
      update: {},
      create: {
        codeFormation: 'INIT_BJ',
        nom: 'Initiation Bijouterie',
        categorie: 'FORMATION_COURTE',
        dureeJours: 5,
        dureeHeures: 35,
        niveauRequis: 'Aucun',
        diplomeDelivre: 'Attestation de formation',
        tarifStandard: 750,
        description: 'Découverte des techniques de base de la bijouterie',
        prerequis: [],
        objectifs: [
          'Découvrir les outils et techniques',
          'Réaliser un premier bijou',
          'Comprendre les métiers de la bijouterie'
        ],
        actif: true
      }
    }),
    prisma.formation.upsert({
      where: { codeFormation: 'PERF_SERTISSAGE' },
      update: {},
      create: {
        codeFormation: 'PERF_SERTISSAGE',
        nom: 'Perfectionnement Sertissage',
        categorie: 'PERFECTIONNEMENT',
        dureeJours: 10,
        dureeHeures: 70,
        niveauRequis: 'CAP ou expérience',
        diplomeDelivre: 'Attestation de perfectionnement',
        tarifStandard: 1500,
        description: 'Techniques avancées de sertissage',
        prerequis: ['CAP ou 2 ans d\'expérience', 'Maîtrise des outils de base'],
        objectifs: [
          'Maîtriser le sertissage à grains',
          'Apprendre le serti clos',
          'Réaliser des sertis complexes'
        ],
        actif: true
      }
    })
  ])

  console.log('✅ Formations créées')

  // ============================================================
  // 3. CRÉATION DES STATUTS DOCUMENTS
  // ============================================================
  console.log('📄 Création des statuts de documents...')

  const statutsDocuments = [
    { code: 'ATTENDU', libelle: 'En attente', couleur: '#FFA500', ordre: 1 },
    { code: 'RECU', libelle: 'Reçu', couleur: '#0080FF', ordre: 2 },
    { code: 'VALIDE', libelle: 'Validé', couleur: '#00C851', ordre: 3 },
    { code: 'REFUSE', libelle: 'Refusé', couleur: '#FF4444', ordre: 4 }
  ]

  for (const statut of statutsDocuments) {
    await prisma.statutDocument.upsert({
      where: { code: statut.code },
      update: {},
      create: statut
    })
  }

  console.log('✅ Statuts documents créés')

  // ============================================================
  // 4. CRÉATION DES TYPES DE DOCUMENTS
  // ============================================================
  console.log('📋 Création des types de documents...')

  const typesDocuments = [
    {
      code: 'CV',
      libelle: 'Curriculum Vitae',
      categorie: 'candidature',
      obligatoire: true,
      ordreAffichage: 1
    },
    {
      code: 'LETTRE_MOTIVATION',
      libelle: 'Lettre de motivation',
      categorie: 'candidature',
      obligatoire: true,
      ordreAffichage: 2
    },
    {
      code: 'PIECE_IDENTITE',
      libelle: 'Pièce d\'identité',
      categorie: 'administratif',
      obligatoire: true,
      ordreAffichage: 3
    },
    {
      code: 'JUSTIF_FINANCEMENT',
      libelle: 'Justificatif de financement',
      categorie: 'financement',
      obligatoire: false,
      ordreAffichage: 4
    },
    {
      code: 'PHOTO',
      libelle: 'Photo d\'identité',
      categorie: 'candidature',
      obligatoire: true,
      ordreAffichage: 5
    }
  ]

  for (const typeDoc of typesDocuments) {
    await prisma.typeDocument.upsert({
      where: { code: typeDoc.code },
      update: {},
      create: typeDoc
    })
  }

  console.log('✅ Types de documents créés')

  // ============================================================
  // 5. CRÉATION D'UN PROSPECT TEST
  // ============================================================
  console.log('👥 Création d\'un prospect test...')

  const prospect = await prisma.prospect.upsert({
    where: { idProspect: 'PROS_TEST_001' },
    update: {},
    create: {
      idProspect: 'PROS_TEST_001',
      emails: ['sophie.martin@email.fr'],
      telephones: ['0612345678'],
      nom: 'Martin',
      prenom: 'Sophie',
      dateNaissance: new Date('1995-03-15'),
      adresse: '15 rue de la Paix',
      codePostal: '75002',
      ville: 'Paris',
      formationsSouhaitees: ['CAP_BJ'],
      formationPrincipale: 'CAP_BJ',
      modeFinancement: 'CPF',
      situationActuelle: 'Demandeur d\'emploi',
      niveauEtudes: 'Baccalauréat',
      projetProfessionnel: 'Reconversion dans la bijouterie artisanale',
      statutProspect: 'NOUVEAU',
      sourceOrigine: 'Site web',
      messageInitial: 'Je souhaite me reconvertir dans la bijouterie',
      datePremierContact: new Date()
    }
  })

  console.log('✅ Prospect test créé')

  // ============================================================
  // 6. CRÉATION DU FORMATEUR DANS LA TABLE FORMATEURS
  // ============================================================
  console.log('👨‍🏫 Création du formateur...')

  await prisma.formateur.upsert({
    where: { idUtilisateur: formateur.idUtilisateur },
    update: {},
    create: {
      idUtilisateur: formateur.idUtilisateur,
      nom: 'Durand',
      prenom: 'Pierre',
      email: 'formateur@abj.fr',
      telephone: '0601020304',
      specialites: ['Bijouterie', 'Sertissage', 'Dessin technique'],
      formationsEnseignees: [1, 2], // IDs des formations
      tarifJournalier: 450,
      statut: 'ACTIF'
    }
  })

  console.log('✅ Formateur créé')

  // ============================================================
  // 7. CRÉATION D'UNE SESSION DE FORMATION
  // ============================================================
  console.log('📅 Création d\'une session de formation...')

  const session = await prisma.session.create({
    data: {
      idFormation: formations[0].idFormation, // CAP_BJ
      nomSession: 'CAP BJ - Session Printemps 2024',
      dateDebut: new Date('2024-03-01'),
      dateFin: new Date('2024-09-30'),
      capaciteMax: 12,
      nbInscrits: 0,
      statutSession: 'PREVUE',
      sallePrincipale: 'Atelier principal',
      formateurPrincipalId: 1 // Le formateur créé
    }
  })

  console.log('✅ Session créée')

  console.log('\n🎉 Seed terminé avec succès!')
  console.log('\n📝 Comptes de test créés:')
  console.log('   Admin: admin@abj.fr / ABJ2024!')
  console.log('   Formateur: formateur@abj.fr / ABJ2024!')
  console.log('   Élève: eleve@abj.fr / ABJ2024!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })