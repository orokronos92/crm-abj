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

  // Les formations du catalogue officiel sont gérées par scripts/seed-formations.ts
  // On récupère simplement le CAP_ATBJ pour la session de test ci-dessous
  const formations = await Promise.all([
    prisma.formation.findUniqueOrThrow({ where: { codeFormation: 'CAP_ATBJ' } })
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
    // Documents candidature
    {
      code: 'CV',
      libelle: 'Curriculum Vitae',
      categorie: 'candidature',
      obligatoire: true,
      obligatoireQualiopi: false,
      ordreAffichage: 1
    },
    {
      code: 'LETTRE_MOTIVATION',
      libelle: 'Lettre de motivation',
      categorie: 'candidature',
      obligatoire: true,
      obligatoireQualiopi: false,
      ordreAffichage: 2
    },
    {
      code: 'PHOTO',
      libelle: 'Photo d\'identité',
      categorie: 'candidature',
      obligatoire: true,
      obligatoireQualiopi: false,
      ordreAffichage: 3
    },
    {
      code: 'DIPLOMES',
      libelle: 'Diplômes obtenus',
      categorie: 'candidature',
      obligatoire: false,
      obligatoireQualiopi: false,
      ordreAffichage: 4
    },

    // Documents administratifs
    {
      code: 'PIECE_IDENTITE',
      libelle: 'Pièce d\'identité (CNI ou passeport)',
      categorie: 'administratif',
      obligatoire: true,
      obligatoireQualiopi: false,
      ordreAffichage: 5
    },
    {
      code: 'JUSTIF_DOMICILE',
      libelle: 'Justificatif de domicile',
      categorie: 'administratif',
      obligatoire: false,
      obligatoireQualiopi: false,
      ordreAffichage: 6
    },
    {
      code: 'RIB',
      libelle: 'RIB (pour remboursements)',
      categorie: 'administratif',
      obligatoire: false,
      obligatoireQualiopi: false,
      ordreAffichage: 7
    },

    // Documents contractuels (Qualiopi Indicateur 9)
    {
      code: 'DEVIS_SIGNE',
      libelle: 'Devis signé',
      categorie: 'contractuel',
      obligatoire: true,
      obligatoireQualiopi: true,
      indicateurQualiopi: '9',
      ordreAffichage: 8
    },
    {
      code: 'CONTRAT_FORMATION',
      libelle: 'Contrat de formation',
      categorie: 'contractuel',
      obligatoire: true,
      obligatoireQualiopi: true,
      indicateurQualiopi: '9',
      ordreAffichage: 9
    },
    {
      code: 'CONVENTION_FORMATION',
      libelle: 'Convention de formation (si financement tiers)',
      categorie: 'contractuel',
      obligatoire: false,
      obligatoireQualiopi: true,
      indicateurQualiopi: '9',
      ordreAffichage: 10
    },
    {
      code: 'REGLEMENT_INTERIEUR',
      libelle: 'Règlement intérieur signé',
      categorie: 'contractuel',
      obligatoire: true,
      obligatoireQualiopi: true,
      indicateurQualiopi: '13',
      ordreAffichage: 11
    },

    // Documents financiers
    {
      code: 'JUSTIF_FINANCEMENT',
      libelle: 'Justificatif de financement',
      categorie: 'financier',
      obligatoire: false,
      obligatoireQualiopi: false,
      ordreAffichage: 12
    },
    {
      code: 'ACCORD_OPCO',
      libelle: 'Accord de prise en charge OPCO',
      categorie: 'financier',
      obligatoire: false,
      obligatoireQualiopi: false,
      ordreAffichage: 13
    },
    {
      code: 'ACCORD_CPF',
      libelle: 'Validation financement CPF',
      categorie: 'financier',
      obligatoire: false,
      obligatoireQualiopi: false,
      ordreAffichage: 14
    },
    {
      code: 'ATTESTATION_POLE_EMPLOI',
      libelle: 'Attestation Pôle Emploi (si demandeur d\'emploi)',
      categorie: 'financier',
      obligatoire: false,
      obligatoireQualiopi: false,
      ordreAffichage: 15
    },

    // Documents pédagogiques (Qualiopi Indicateur 11)
    {
      code: 'ATTESTATION_ASSIDUITE',
      libelle: 'Attestation d\'assiduité',
      categorie: 'pedagogique',
      obligatoire: false,
      obligatoireQualiopi: true,
      indicateurQualiopi: '11',
      ordreAffichage: 16
    },
    {
      code: 'ATTESTATION_FIN_FORMATION',
      libelle: 'Attestation de fin de formation',
      categorie: 'pedagogique',
      obligatoire: false,
      obligatoireQualiopi: true,
      indicateurQualiopi: '11',
      ordreAffichage: 17
    },
    {
      code: 'CERTIFICAT_REALISATION',
      libelle: 'Certificat de réalisation',
      categorie: 'pedagogique',
      obligatoire: false,
      obligatoireQualiopi: true,
      indicateurQualiopi: '11',
      ordreAffichage: 18
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
  // 4b. CRÉATION DES TYPES DE DOCUMENTS FORMATEUR (QUALIOPI)
  // ============================================================
  console.log('📋 Création des types de documents formateur...')

  const typesDocumentsFormateur = [
    {
      code: 'CV',
      libelle: 'CV du formateur',
      obligatoire: true,
      ordreAffichage: 1
    },
    {
      code: 'DIPLOME',
      libelle: 'Diplômes et certifications',
      obligatoire: true,
      ordreAffichage: 2
    },
    {
      code: 'CNI',
      libelle: 'Pièce d\'identité',
      obligatoire: true,
      ordreAffichage: 3
    },
    {
      code: 'RCP',
      libelle: 'Assurance RC Pro',
      obligatoire: true,
      ordreAffichage: 4
    },
    {
      code: 'FORMATION_PEDAGOGIQUE',
      libelle: 'Attestation formation pédagogique',
      obligatoire: true,
      ordreAffichage: 6
    },
    {
      code: 'FORMATIONS_SUIVIES',
      libelle: 'Formations suivies (continue)',
      obligatoire: false,
      ordreAffichage: 7
    },
    {
      code: 'CERTIFICAT_QUALIOPI',
      libelle: 'Certificat Qualiopi formateur',
      obligatoire: false,
      ordreAffichage: 8
    },
    {
      code: 'PORTFOLIO',
      libelle: 'Portfolio / Références travaux',
      obligatoire: false,
      ordreAffichage: 9
    },
    {
      code: 'EVALUATIONS',
      libelle: 'Évaluations formateur',
      obligatoire: false,
      ordreAffichage: 10
    },
    {
      code: 'STATUT',
      libelle: 'Statut juridique',
      obligatoire: true,
      ordreAffichage: 11
    },
    {
      code: 'AUTRE',
      libelle: 'Autre document',
      obligatoire: false,
      ordreAffichage: 12
    }
  ]

  for (const typeDocForm of typesDocumentsFormateur) {
    await prisma.typeDocumentFormateur.upsert({
      where: { code: typeDocForm.code },
      update: {},
      create: typeDocForm
    })
  }

  console.log('✅ Types de documents formateur créés')

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
      formationsSouhaitees: ['CAP_ATBJ'],
      formationPrincipale: 'CAP_ATBJ',
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
  // 6b. CRÉATION DE DOCUMENTS POUR LE FORMATEUR (EXEMPLES)
  // ============================================================
  console.log('📄 Création de documents formateur exemples...')

  const documentsFormateur = [
    {
      idFormateur: 1,
      codeTypeDocument: 'CV',
      libelle: 'CV Pierre Durand 2024',
      urlFichier: '/documents/formateurs/cv_pierre_durand.pdf',
      statut: 'VALIDE',
      dateValidation: new Date(),
      validePar: 1 // ID de l'admin
    },
    {
      idFormateur: 1,
      codeTypeDocument: 'DIPLOME',
      libelle: 'CAP Bijouterie-Joaillerie',
      urlFichier: '/documents/formateurs/diplomes/cap_bijouterie.pdf',
      dateDocument: new Date('2005-06-15'),
      statut: 'VALIDE',
      dateValidation: new Date(),
      validePar: 1
    },
    {
      idFormateur: 1,
      codeTypeDocument: 'DIPLOME',
      libelle: 'Formation de formateur FPA',
      urlFichier: '/documents/formateurs/diplomes/fpa_2012.pdf',
      dateDocument: new Date('2012-09-20'),
      statut: 'VALIDE',
      dateValidation: new Date(),
      validePar: 1
    },
    {
      idFormateur: 1,
      codeTypeDocument: 'RCP',
      libelle: 'Assurance RC Pro 2024',
      urlFichier: '/documents/formateurs/assurances/rc_pro_2024.pdf',
      dateDocument: new Date('2024-01-01'),
      dateExpiration: new Date('2025-01-01'),
      statut: 'VALIDE',
      dateValidation: new Date(),
      validePar: 1
    },
    {
      idFormateur: 1,
      codeTypeDocument: 'AUTRE',
      libelle: 'Formation Sertissage Avancé 2024',
      urlFichier: '/documents/formateurs/formations/sertissage_avance_2024.pdf',
      dateDocument: new Date('2024-03-15'),
      statut: 'VALIDE',
      dateValidation: new Date(),
      validePar: 1,
      commentaire: 'Formation de perfectionnement en sertissage invisible'
    }
  ]

  for (const doc of documentsFormateur) {
    await prisma.documentFormateur.create({
      data: doc
    })
  }

  console.log('✅ Documents formateur créés')

  // ============================================================
  // 7. CRÉATION D'UNE SESSION DE FORMATION
  // ============================================================
  console.log('📅 Création d\'une session de formation...')

  const session = await prisma.session.create({
    data: {
      idFormation: formations[0].idFormation, // CAP_BJ
      nomSession: 'CAP ATBJ - Session Printemps 2024',
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