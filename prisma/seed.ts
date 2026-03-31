/**
 * Seed principal — CRM ABJ
 * Seed unique et complet : référentiels + données de test
 * Idempotent (upsert partout sauf create sur tables sans contrainte unique)
 *
 * Usage : npm run db:seed
 *
 * Comptes créés :
 *   Admin (démo) : admin@abj.fr / ABJ2024!
 *   Formateur (démo) : formateur@abj.fr / ABJ2024!
 *   Élève (démo) : eleve@abj.fr / ABJ2024!
 *   Admin (prod) : orokronos.pro@gmail.com
 *   Admin (prod) : david-duhamel@live.fr
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Debut du seed de la base de donnees...')

  // ============================================================
  // 1. UTILISATEURS
  // ============================================================
  console.log('Creation des utilisateurs...')

  const passwordHash = await bcrypt.hash('ABJ2024!', 10)

  const admin = await prisma.utilisateur.upsert({
    where: { email: 'admin@abj.fr' },
    update: {},
    create: {
      email: 'admin@abj.fr',
      motDePasseHash: passwordHash,
      nom: 'Admin',
      prenom: 'Systeme',
      role: 'admin',
      statutCompte: 'ACTIF'
    }
  })

  // Comptes admin production (hashes hardcodes — ne pas regenerer)
  await prisma.utilisateur.upsert({
    where: { email: 'orokronos.pro@gmail.com' },
    update: {},
    create: {
      email: 'orokronos.pro@gmail.com',
      motDePasseHash: '$2b$12$ei1V1uZrGf87/THTxxZcbu8iPiQV3wKGj87XfbE.AgGB.2rhSE5S2',
      nom: 'Duhamel',
      prenom: 'David',
      role: 'admin',
      statutCompte: 'ACTIF'
    }
  })

  await prisma.utilisateur.upsert({
    where: { email: 'david-duhamel@live.fr' },
    update: {},
    create: {
      email: 'david-duhamel@live.fr',
      motDePasseHash: '$2b$12$/.LnagPbP0weQ/aAcxqrNuhoxh5ChXYMJgQ7tnO/oIOr8DlCYmKZS',
      nom: 'Duhamel',
      prenom: 'David',
      role: 'admin',
      statutCompte: 'ACTIF'
    }
  })

  // Compte formateur demo
  const utilisateurFormateurDemo = await prisma.utilisateur.upsert({
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

  // Compte eleve demo
  await prisma.utilisateur.upsert({
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

  // Comptes utilisateurs pour les 5 formateurs de test
  const formateursEmails = [
    { email: 'laurent.dubois@formateurs.abj.fr', nom: 'Dubois', prenom: 'Laurent' },
    { email: 'marie.petit@formateurs.abj.fr', nom: 'Petit', prenom: 'Marie' },
    { email: 'thomas.moreau@formateurs.abj.fr', nom: 'Moreau', prenom: 'Thomas' },
    { email: 'sophie.lefevre@formateurs.abj.fr', nom: 'Lefevre', prenom: 'Sophie' },
    { email: 'nicolas.lambert@formateurs.abj.fr', nom: 'Lambert', prenom: 'Nicolas' },
    { email: 'catherine.roux@formateurs.abj.fr', nom: 'Roux', prenom: 'Catherine' },
    { email: 'philippe.martin@formateurs.abj.fr', nom: 'Martin', prenom: 'Philippe' },
  ]

  const utilisateursFormateurs = []
  for (const data of formateursEmails) {
    const u = await prisma.utilisateur.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        motDePasseHash: passwordHash,
        nom: data.nom,
        prenom: data.prenom,
        role: 'professeur',
        statutCompte: 'ACTIF'
      }
    })
    utilisateursFormateurs.push(u)
  }

  // Comptes utilisateurs pour les 10 eleves de test
  const elevesEmails = [
    { email: 'sophie.durand@email.fr', nom: 'Durand', prenom: 'Sophie' },
    { email: 'maxime.barbier@email.fr', nom: 'Barbier', prenom: 'Maxime' },
    { email: 'chloe.fontaine@email.fr', nom: 'Fontaine', prenom: 'Chloe' },
    { email: 'lucas.lambert@email.fr', nom: 'Lambert', prenom: 'Lucas' },
    { email: 'emma.garcia@email.fr', nom: 'Garcia', prenom: 'Emma' },
    { email: 'theo.martinez@email.fr', nom: 'Martinez', prenom: 'Theo' },
    { email: 'lea.moreau@email.fr', nom: 'Moreau', prenom: 'Lea' },
    { email: 'hugo.simon@email.fr', nom: 'Simon', prenom: 'Hugo' },
    { email: 'alice.roux@email.fr', nom: 'Roux', prenom: 'Alice' },
    { email: 'noah.girard@email.fr', nom: 'Girard', prenom: 'Noah' },
  ]

  const utilisateursEleves = []
  for (const data of elevesEmails) {
    const u = await prisma.utilisateur.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        motDePasseHash: passwordHash,
        nom: data.nom,
        prenom: data.prenom,
        role: 'eleve',
        statutCompte: 'ACTIF'
      }
    })
    utilisateursEleves.push(u)
  }

  console.log('Utilisateurs crees')

  // ============================================================
  // 2. SALLES
  // ============================================================
  console.log('Creation des salles...')

  const sallesData = [
    {
      nom: 'Atelier S',
      code: 'ATEL_S',
      capaciteMax: 4,
      surfaceM2: 45,
      etage: 0,
      equipements: ['ETABLI_BIJOU', 'POSTE_SOUDURE', 'LAMINOIR', 'MARTEAU_BAGUE', 'PERCEUSE_COLONNE', 'POSTE_SERTI', 'MICROSCOPE_SERTI', 'LOUPE_BINOCULAIRE'],
      formationsCompatibles: [
        'CAP_ATBJ',
        'BIJ_CREATEUR_N1', 'BIJ_CREATEUR_N2', 'BIJ_CREATEUR_N3',
        'BIJ_TECHNIQUE_N1', 'BIJ_TECHNIQUE_N2', 'BIJ_TECHNIQUE_N3',
        'JOAILLERIE_N1', 'JOAILLERIE_N2', 'JOAILLERIE_N3',
        'SERTI_N1', 'SERTI_N2', 'SERTI_N3', 'PERF_SERTI',
        'HF_N1', 'HF_N2', 'HF_N3',
        'MAQUETTE_N1', 'MAQUETTE_N2', 'MAQUETTE_N3'
      ],
      disponibleWeekend: true,
      disponibleSoir: false,
      statut: 'ACTIVE',
      notes: 'Atelier serti et bijouterie technique. Postes equipes binoculaires et materiel serti.'
    },
    {
      nom: 'Atelier B2',
      code: 'ATEL_B2',
      capaciteMax: 6,
      surfaceM2: 35,
      etage: 0,
      equipements: ['ETABLI_BIJOU', 'FOUR_EMAIL', 'MATERIEL_EMAIL', 'LAMPE_CHALUMEAU'],
      formationsCompatibles: [
        'CAP_ATBJ',
        'BIJ_CREATEUR_N1', 'BIJ_CREATEUR_N2', 'BIJ_CREATEUR_N3',
        'BIJ_TECHNIQUE_N1', 'BIJ_TECHNIQUE_N2', 'BIJ_TECHNIQUE_N3',
        'JOAILLERIE_N1', 'JOAILLERIE_N2', 'JOAILLERIE_N3',
        'EMAIL_INITIATION', 'EMAIL_CHAMPLEVE', 'EMAIL_CLOISONNE', 'EMAIL_PLIQUE_A_JOUR',
        'HF_N1', 'HF_N2', 'HF_N3',
        'MAQUETTE_N1', 'MAQUETTE_N2', 'MAQUETTE_N3',
        'ATD_BIJ_EMAIL', 'ATD_BIJ_LAPIDAIRE', 'ATD_CISELURE_EMAIL'
      ],
      disponibleWeekend: true,
      disponibleSoir: false,
      statut: 'ACTIVE',
      notes: 'Atelier bijouterie polyvalent. Le four email est gere par Yasmina.'
    },
    {
      nom: 'Atelier B1',
      code: 'ATEL_B1',
      capaciteMax: 10,
      surfaceM2: 30,
      etage: 0,
      equipements: ['ETABLI_BIJOU', 'FOUR_EMAIL', 'MATERIEL_EMAIL', 'LAMPE_CHALUMEAU'],
      formationsCompatibles: [
        'CAP_ATBJ',
        'BIJ_CREATEUR_N1', 'BIJ_CREATEUR_N2', 'BIJ_CREATEUR_N3',
        'BIJ_TECHNIQUE_N1', 'BIJ_TECHNIQUE_N2', 'BIJ_TECHNIQUE_N3',
        'JOAILLERIE_N1', 'JOAILLERIE_N2', 'JOAILLERIE_N3',
        'EMAIL_INITIATION', 'EMAIL_CHAMPLEVE', 'EMAIL_CLOISONNE', 'EMAIL_PLIQUE_A_JOUR',
        'HF_N1', 'HF_N2', 'HF_N3',
        'MAQUETTE_N1', 'MAQUETTE_N2', 'MAQUETTE_N3',
        'ATD_BIJ_EMAIL', 'ATD_BIJ_LAPIDAIRE', 'ATD_CISELURE_EMAIL'
      ],
      disponibleWeekend: false,
      disponibleSoir: false,
      statut: 'ACTIVE',
      notes: 'Atelier bijouterie polyvalent. Le four email est gere par Yasmina.'
    },
    {
      nom: 'Salle C',
      code: 'SALLE_C',
      capaciteMax: 10,
      surfaceM2: 30,
      etage: 1,
      equipements: ['ORDINATEUR_CAO', 'LOGICIEL_RHINO', 'LOGICIEL_MATRIX_GOLD', 'ECRAN_TACTILE', 'VIDEO_PROJECTEUR', 'TABLE_LAPIDAIRE'],
      formationsCompatibles: [
        'CAO_DAO',
        'GEMMO', 'GEMMO_N1', 'GEMMO_N2',
        'HISTOIRE_ART',
        'DESSIN_GOUACHE', 'DESSIN_TECHNIQUE',
        'DOUANE_GARANTIE',
        'LAPIDAIRE_N1', 'LAPIDAIRE_N2', 'LAPIDAIRE_N3', 'LAPIDAIRE_N4',
        'CISELURE_N1', 'CISELURE_N2', 'CISELURE_N3',
        'EMAIL_INITIATION', 'EMAIL_CHAMPLEVE', 'EMAIL_CLOISONNE', 'EMAIL_PLIQUE_A_JOUR',
        'ATD_CISELURE_EMAIL', 'ATD_BIJ_LAPIDAIRE'
      ],
      disponibleWeekend: false,
      disponibleSoir: false,
      statut: 'ACTIVE',
      notes: 'Salle theorique et lapidaire. CAO/DAO, gemmologie, ciselure, lapidaire.'
    }
  ]

  for (const salle of sallesData) {
    await prisma.salle.upsert({
      where: { code: salle.code },
      update: {
        nom: salle.nom,
        capaciteMax: salle.capaciteMax,
        equipements: salle.equipements,
        formationsCompatibles: salle.formationsCompatibles,
        disponibleWeekend: salle.disponibleWeekend,
        disponibleSoir: salle.disponibleSoir,
        statut: salle.statut,
        notes: salle.notes
      },
      create: salle
    })
  }

  console.log('Salles creees')

  // ============================================================
  // 3. STATUTS DOCUMENTS
  // ============================================================
  console.log('Creation des statuts de documents...')

  const statutsDocumentsData = [
    { code: 'ATTENDU', libelle: 'En attente', couleur: '#FFA500', ordre: 1 },
    { code: 'RECU', libelle: 'Recu', couleur: '#0080FF', ordre: 2 },
    { code: 'VALIDE', libelle: 'Valide', couleur: '#00C851', ordre: 3 },
    { code: 'REFUSE', libelle: 'Refuse', couleur: '#FF4444', ordre: 4 }
  ]

  for (const statut of statutsDocumentsData) {
    await prisma.statutDocument.upsert({
      where: { code: statut.code },
      update: {},
      create: statut
    })
  }

  console.log('Statuts documents crees')

  // ============================================================
  // 4. TYPES DOCUMENTS CANDIDATS
  // ============================================================
  console.log('Creation des types de documents candidats...')

  const typesDocumentsData = [
    { code: 'CV', libelle: 'Curriculum Vitae', categorie: 'candidature', obligatoire: true, obligatoireQualiopi: false, ordreAffichage: 1 },
    { code: 'LETTRE_MOTIVATION', libelle: 'Lettre de motivation', categorie: 'candidature', obligatoire: true, obligatoireQualiopi: false, ordreAffichage: 2 },
    { code: 'PHOTO', libelle: "Photo d'identite", categorie: 'candidature', obligatoire: true, obligatoireQualiopi: false, ordreAffichage: 3 },
    { code: 'DIPLOMES', libelle: 'Diplomes obtenus', categorie: 'candidature', obligatoire: false, obligatoireQualiopi: false, ordreAffichage: 4 },
    { code: 'PORTFOLIO', libelle: 'Portfolio', categorie: 'candidature', obligatoire: false, obligatoireQualiopi: false, ordreAffichage: 99, description: 'Portfolio de travaux ou realisations du candidat' },
    { code: 'PIECE_IDENTITE', libelle: "Piece d'identite (CNI ou passeport)", categorie: 'administratif', obligatoire: true, obligatoireQualiopi: false, ordreAffichage: 5 },
    { code: 'JUSTIF_DOMICILE', libelle: 'Justificatif de domicile', categorie: 'administratif', obligatoire: false, obligatoireQualiopi: false, ordreAffichage: 6 },
    { code: 'RIB', libelle: 'RIB (pour remboursements)', categorie: 'administratif', obligatoire: false, obligatoireQualiopi: false, ordreAffichage: 7 },
    { code: 'DEVIS_SIGNE', libelle: 'Devis signe', categorie: 'contractuel', obligatoire: true, obligatoireQualiopi: true, indicateurQualiopi: '9', ordreAffichage: 8 },
    { code: 'CONTRAT_FORMATION', libelle: 'Contrat de formation', categorie: 'contractuel', obligatoire: true, obligatoireQualiopi: true, indicateurQualiopi: '9', ordreAffichage: 9 },
    { code: 'CONVENTION_FORMATION', libelle: 'Convention de formation (si financement tiers)', categorie: 'contractuel', obligatoire: false, obligatoireQualiopi: true, indicateurQualiopi: '9', ordreAffichage: 10 },
    { code: 'REGLEMENT_INTERIEUR', libelle: 'Reglement interieur signe', categorie: 'contractuel', obligatoire: true, obligatoireQualiopi: true, indicateurQualiopi: '13', ordreAffichage: 11 },
    { code: 'JUSTIF_FINANCEMENT', libelle: 'Justificatif de financement', categorie: 'financier', obligatoire: false, obligatoireQualiopi: false, ordreAffichage: 12 },
    { code: 'ACCORD_OPCO', libelle: 'Accord de prise en charge OPCO', categorie: 'financier', obligatoire: false, obligatoireQualiopi: false, ordreAffichage: 13 },
    { code: 'ACCORD_CPF', libelle: 'Validation financement CPF', categorie: 'financier', obligatoire: false, obligatoireQualiopi: false, ordreAffichage: 14 },
    { code: 'ATTESTATION_POLE_EMPLOI', libelle: "Attestation Pole Emploi (si demandeur d'emploi)", categorie: 'financier', obligatoire: false, obligatoireQualiopi: false, ordreAffichage: 15 },
    { code: 'ATTESTATION_ASSIDUITE', libelle: "Attestation d'assiduite", categorie: 'pedagogique', obligatoire: false, obligatoireQualiopi: true, indicateurQualiopi: '11', ordreAffichage: 16 },
    { code: 'ATTESTATION_FIN_FORMATION', libelle: 'Attestation de fin de formation', categorie: 'pedagogique', obligatoire: false, obligatoireQualiopi: true, indicateurQualiopi: '11', ordreAffichage: 17 },
    { code: 'CERTIFICAT_REALISATION', libelle: 'Certificat de realisation', categorie: 'pedagogique', obligatoire: false, obligatoireQualiopi: true, indicateurQualiopi: '11', ordreAffichage: 18 }
  ]

  for (const typeDoc of typesDocumentsData) {
    await prisma.typeDocument.upsert({
      where: { code: typeDoc.code },
      update: {},
      create: typeDoc
    })
  }

  console.log('Types de documents candidats crees')

  // ============================================================
  // 4b. TYPES DOCUMENTS FORMATEUR (QUALIOPI)
  // ============================================================
  console.log('Creation des types de documents formateur...')

  const typesDocumentsFormateurData = [
    { code: 'CV', libelle: 'CV du formateur', obligatoire: true, ordreAffichage: 1 },
    { code: 'DIPLOME', libelle: 'Diplomes et certifications', obligatoire: true, ordreAffichage: 2 },
    { code: 'CNI', libelle: "Piece d'identite", obligatoire: true, ordreAffichage: 3 },
    { code: 'RCP', libelle: 'Assurance RC Pro', obligatoire: true, ordreAffichage: 4 },
    { code: 'FORMATION_PEDAGOGIQUE', libelle: 'Attestation formation pedagogique', obligatoire: true, ordreAffichage: 6 },
    { code: 'FORMATIONS_SUIVIES', libelle: 'Formations suivies (continue)', obligatoire: false, ordreAffichage: 7 },
    { code: 'CERTIFICAT_QUALIOPI', libelle: 'Certificat Qualiopi formateur', obligatoire: false, ordreAffichage: 8 },
    { code: 'PORTFOLIO', libelle: 'Portfolio / References travaux', obligatoire: false, ordreAffichage: 9 },
    { code: 'EVALUATIONS', libelle: 'Evaluations formateur', obligatoire: false, ordreAffichage: 10 },
    { code: 'STATUT', libelle: 'Statut juridique', obligatoire: true, ordreAffichage: 11 },
    { code: 'AUTRE', libelle: 'Autre document', obligatoire: false, ordreAffichage: 12 }
  ]

  for (const typeDocForm of typesDocumentsFormateurData) {
    await prisma.typeDocumentFormateur.upsert({
      where: { code: typeDocForm.code },
      update: {},
      create: typeDocForm
    })
  }

  console.log('Types de documents formateur crees')

  // ============================================================
  // 5. FORMATIONS (5 formations de test + recuperation CAP_ATBJ)
  // ============================================================
  console.log('Creation des formations de test...')

  // CAP_ATBJ : upsert — deja dans le catalogue officiel (scripts/seed-formations.ts)
  // On le cree ici si absent (premier seed), sinon on le laisse tel quel
  await prisma.formation.upsert({
    where: { codeFormation: 'CAP_ATBJ' },
    update: { equipementRequis: ['ETABLI_BIJOU'] },
    create: {
      codeFormation: 'CAP_ATBJ',
      nom: 'CAP Art et Techniques de la Bijouterie-Joaillerie',
      categorie: 'CAP',
      dureeHeures: 800,
      niveauRequis: 'Niveau Baccalaureat',
      diplomeDelivre: 'CAP Art et Techniques de la Bijouterie-Joaillerie',
      tarifStandard: 15000,
      description: 'Cursus de 1 an. Formation en presentiel preparant au diplome CAP ATBJ.',
      prerequis: ['Niveau Baccalaureat', 'Entretien de selection'],
      objectifs: ['Maitriser les techniques de base', 'Obtenir le CAP ATBJ'],
      equipementRequis: ['ETABLI_BIJOU'],
      actif: true
    }
  })

  await prisma.formation.upsert({
    where: { codeFormation: 'INIT_BJ' },
    update: { equipementRequis: ['ETABLI_BIJOU'] },
    create: {
      codeFormation: 'INIT_BJ',
      nom: 'Initiation Bijouterie',
      categorie: 'FORMATION_COURTE',
      dureeHeures: 30,
      tarifStandard: 750,
      description: 'Stage d initiation aux techniques de base en bijouterie.',
      prerequis: [],
      objectifs: ['Decouvrir la bijouterie'],
      equipementRequis: ['ETABLI_BIJOU'],
      actif: true
    }
  })

  await prisma.formation.upsert({
    where: { codeFormation: 'PERF_SERTI' },
    update: { equipementRequis: ['POSTE_SERTI', 'MICROSCOPE_SERTI'] },
    create: {
      codeFormation: 'PERF_SERTI',
      nom: 'Perfectionnement Sertissage',
      categorie: 'FORMATION_COURTE',
      dureeHeures: 40,
      tarifStandard: 1500,
      description: 'Perfectionnement aux techniques de sertissage.',
      prerequis: ['Notions de base en bijouterie'],
      objectifs: ['Maitriser le sertissage'],
      equipementRequis: ['POSTE_SERTI', 'MICROSCOPE_SERTI'],
      actif: true
    }
  })

  await prisma.formation.upsert({
    where: { codeFormation: 'CAO_DAO' },
    update: { equipementRequis: ['ORDINATEUR_CAO', 'LOGICIEL_RHINO'] },
    create: {
      codeFormation: 'CAO_DAO',
      nom: 'CAO/DAO Bijouterie',
      categorie: 'FORMATION_COURTE',
      dureeHeures: 35,
      tarifStandard: 1800,
      description: 'Formation CAO/DAO pour bijoutiers (Rhino, MatrixGold).',
      prerequis: [],
      objectifs: ['Modelisation 3D bijoux'],
      equipementRequis: ['ORDINATEUR_CAO', 'LOGICIEL_RHINO'],
      actif: true
    }
  })

  await prisma.formation.upsert({
    where: { codeFormation: 'GEMMO' },
    update: { equipementRequis: [] },
    create: {
      codeFormation: 'GEMMO',
      nom: 'Gemmologie',
      categorie: 'FORMATION_COURTE',
      dureeHeures: 20,
      tarifStandard: 950,
      description: 'Introduction a la gemmologie : identification et classement des pierres.',
      prerequis: [],
      objectifs: ['Identifier les pierres precieuses'],
      equipementRequis: [],
      actif: true
    }
  })

  await prisma.formation.upsert({
    where: { codeFormation: 'SERTI_N1' },
    update: {
      equipementRequis: ['POSTE_SERTI', 'MICROSCOPE_SERTI']
    },
    create: {
      codeFormation: 'SERTI_N1',
      nom: 'Sertissage — Niveau 1 (serti clos)',
      categorie: 'FORMATION_COURTE',
      dureeHeures: 30,
      dureeJours: 4,
      tarifStandard: 1130,
      description: 'Initiation au sertissage : technique du serti clos.',
      prerequis: [],
      objectifs: ['Maitriser le serti clos', 'Poser des pierres en serti clos'],
      equipementRequis: ['POSTE_SERTI', 'MICROSCOPE_SERTI'],
      actif: true
    }
  })

  // --- Mise a jour equipementRequis pour toutes les formations du catalogue ---
  // Sertissage (niveaux 2 et 3) — Atelier S uniquement
  for (const code of ['SERTI_N2', 'SERTI_N3', 'PERF_SERTI']) {
    await prisma.formation.updateMany({
      where: { codeFormation: code },
      data: { equipementRequis: ['POSTE_SERTI', 'MICROSCOPE_SERTI'] }
    })
  }

  // CAO/DAO — Salle C
  await prisma.formation.updateMany({
    where: { codeFormation: 'CAO_DAO' },
    data: { equipementRequis: ['ORDINATEUR_CAO', 'LOGICIEL_RHINO'] }
  })

  // Formations theoriques (video-projecteur) — Salle C
  for (const code of ['DESSIN_GOUACHE', 'DESSIN_TECHNIQUE', 'DOUANE_GARANTIE', 'HISTOIRE_ART']) {
    await prisma.formation.updateMany({
      where: { codeFormation: code },
      data: { equipementRequis: ['VIDEO_PROJECTEUR'] }
    })
  }

  // Gemmologie — Salle C (pas d'equipement specifique, la salle est choisie via formationsCompatibles)
  for (const code of ['GEMMO_N1', 'GEMMO_N2', 'GEMMO']) {
    await prisma.formation.updateMany({
      where: { codeFormation: code },
      data: { equipementRequis: [] }
    })
  }

  // Lapidaire — Salle C (table lapidaire)
  for (const code of ['LAPIDAIRE_N1', 'LAPIDAIRE_N2', 'LAPIDAIRE_N3', 'LAPIDAIRE_N4', 'ATD_BIJ_LAPIDAIRE']) {
    await prisma.formation.updateMany({
      where: { codeFormation: code },
      data: { equipementRequis: ['TABLE_LAPIDAIRE'] }
    })
  }

  // Email — Ateliers B1 et B2 (four email + materiel email)
  for (const code of ['EMAIL_INITIATION', 'EMAIL_CHAMPLEVE', 'EMAIL_CLOISONNE', 'EMAIL_PLIQUE_A_JOUR', 'ATD_BIJ_EMAIL', 'ATD_CISELURE_EMAIL']) {
    await prisma.formation.updateMany({
      where: { codeFormation: code },
      data: { equipementRequis: ['FOUR_EMAIL', 'MATERIEL_EMAIL'] }
    })
  }

  // Bijouterie / Joaillerie / Haute Fantaisie / Maquette / Ciselure / CAP — etabli bijou
  for (const code of [
    'CAP_ATBJ', 'INIT_BJ',
    'BIJ_CREATEUR_N1', 'BIJ_CREATEUR_N2', 'BIJ_CREATEUR_N3',
    'BIJ_TECHNIQUE_N1', 'BIJ_TECHNIQUE_N2', 'BIJ_TECHNIQUE_N3',
    'JOAILLERIE_N1', 'JOAILLERIE_N2', 'JOAILLERIE_N3',
    'HF_N1', 'HF_N2', 'HF_N3',
    'MAQUETTE_N1', 'MAQUETTE_N2', 'MAQUETTE_N3',
    'CISELURE_N1', 'CISELURE_N2', 'CISELURE_N3'
  ]) {
    await prisma.formation.updateMany({
      where: { codeFormation: code },
      data: { equipementRequis: ['ETABLI_BIJOU'] }
    })
  }

  console.log('EquipementRequis mis a jour sur toutes les formations')

  // Recuperer les 5 formations pour les references ci-dessous
  const formations = await Promise.all([
    prisma.formation.findUniqueOrThrow({ where: { codeFormation: 'CAP_ATBJ' } }),
    prisma.formation.findUniqueOrThrow({ where: { codeFormation: 'INIT_BJ' } }),
    prisma.formation.findUniqueOrThrow({ where: { codeFormation: 'PERF_SERTI' } }),
    prisma.formation.findUniqueOrThrow({ where: { codeFormation: 'CAO_DAO' } }),
    prisma.formation.findUniqueOrThrow({ where: { codeFormation: 'GEMMO' } }),
  ])

  console.log('Formations creees')

  // ============================================================
  // 6. FORMATEURS (7 formateurs)
  // ============================================================
  console.log('Creation des formateurs...')

  const formateursData = [
    { idx: 0, nom: 'Dubois', prenom: 'Laurent', email: 'laurent.dubois@formateurs.abj.fr', specialites: ['CAP_ATBJ', 'SERTI_N1', 'SERTI_N2'], tarif: 550 },
    { idx: 1, nom: 'Petit', prenom: 'Marie', email: 'marie.petit@formateurs.abj.fr', specialites: ['CAP_ATBJ', 'BIJ_CREATEUR_N1', 'BIJ_CREATEUR_N2'], tarif: 600 },
    { idx: 2, nom: 'Moreau', prenom: 'Thomas', email: 'thomas.moreau@formateurs.abj.fr', specialites: ['CAO_DAO', 'PERF_SERTI'], tarif: 650 },
    { idx: 3, nom: 'Lefevre', prenom: 'Sophie', email: 'sophie.lefevre@formateurs.abj.fr', specialites: ['GEMMO', 'INIT_BJ'], tarif: 500 },
    { idx: 4, nom: 'Lambert', prenom: 'Nicolas', email: 'nicolas.lambert@formateurs.abj.fr', specialites: ['INIT_BJ', 'BIJ_TECHNIQUE_N1'], tarif: 450 },
    { idx: 5, nom: 'Roux', prenom: 'Catherine', email: 'catherine.roux@formateurs.abj.fr', specialites: ['CAP_ATBJ'], tarif: 400 },
    { idx: 6, nom: 'Martin', prenom: 'Philippe', email: 'philippe.martin@formateurs.abj.fr', specialites: ['CAP_ATBJ', 'SERTI_N1'], tarif: 500 },
  ]

  const formateurs = []
  for (const data of formateursData) {
    const utilisateur = utilisateursFormateurs[data.idx]
    const formateur = await prisma.formateur.upsert({
      where: { idUtilisateur: utilisateur.idUtilisateur },
      update: {},
      create: {
        idUtilisateur: utilisateur.idUtilisateur,
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        specialites: data.specialites,
        tarifJournalier: data.tarif,
        statut: 'ACTIF'
      }
    })
    formateurs.push(formateur)
  }

  // Formateur demo (Pierre Durand)
  await prisma.formateur.upsert({
    where: { idUtilisateur: utilisateurFormateurDemo.idUtilisateur },
    update: {},
    create: {
      idUtilisateur: utilisateurFormateurDemo.idUtilisateur,
      nom: 'Durand',
      prenom: 'Pierre',
      email: 'formateur@abj.fr',
      specialites: ['Bijouterie', 'Sertissage'],
      tarifJournalier: 450,
      statut: 'ACTIF'
    }
  })

  // Documents pour le formateur demo
  const formateurDemoRecord = await prisma.formateur.findUnique({
    where: { idUtilisateur: utilisateurFormateurDemo.idUtilisateur }
  })

  if (formateurDemoRecord) {
    const docsFormateurDemo = await prisma.documentFormateur.findMany({
      where: { idFormateur: formateurDemoRecord.idFormateur }
    })
    if (docsFormateurDemo.length === 0) {
      await prisma.documentFormateur.createMany({
        data: [
          { idFormateur: formateurDemoRecord.idFormateur, codeTypeDocument: 'CV', libelle: 'CV Pierre Durand 2024', urlFichier: '/documents/formateurs/cv_pierre_durand.pdf', statut: 'VALIDE', dateValidation: new Date(), validePar: admin.idUtilisateur },
          { idFormateur: formateurDemoRecord.idFormateur, codeTypeDocument: 'DIPLOME', libelle: 'CAP Bijouterie-Joaillerie', urlFichier: '/documents/formateurs/diplomes/cap_bijouterie.pdf', dateDocument: new Date('2005-06-15'), statut: 'VALIDE', dateValidation: new Date(), validePar: admin.idUtilisateur },
          { idFormateur: formateurDemoRecord.idFormateur, codeTypeDocument: 'DIPLOME', libelle: 'Formation de formateur FPA', urlFichier: '/documents/formateurs/diplomes/fpa_2012.pdf', dateDocument: new Date('2012-09-20'), statut: 'VALIDE', dateValidation: new Date(), validePar: admin.idUtilisateur },
          { idFormateur: formateurDemoRecord.idFormateur, codeTypeDocument: 'RCP', libelle: 'Assurance RC Pro 2024', urlFichier: '/documents/formateurs/assurances/rc_pro_2024.pdf', dateDocument: new Date('2024-01-01'), dateExpiration: new Date('2025-01-01'), statut: 'VALIDE', dateValidation: new Date(), validePar: admin.idUtilisateur },
        ]
      })
    }
  }

  console.log('Formateurs crees')

  // ============================================================
  // 7. SESSIONS (5 sessions)
  // ============================================================
  console.log('Creation des sessions...')

  // Verifier si des sessions existent deja (pas de contrainte unique sur nomSession)
  const sessionsExistantes = await prisma.session.count()
  let sessions: any[] = []

  if (sessionsExistantes === 0) {
    const session1 = await prisma.session.create({
      data: {
        idFormation: formations[0].idFormation,
        nomSession: 'CAP ATBJ — Session Mars 2025',
        dateDebut: new Date('2025-03-01'),
        dateFin: new Date('2025-09-30'),
        capaciteMax: 12,
        nbInscrits: 0,
        statutSession: 'EN_COURS',
        sallePrincipale: 'Atelier S',
        formateurPrincipalId: formateurs[0].idFormateur
      }
    })

    const session2 = await prisma.session.create({
      data: {
        idFormation: formations[1].idFormation,
        nomSession: 'Initiation BJ — Fevrier 2025',
        dateDebut: new Date('2025-02-10'),
        dateFin: new Date('2025-02-14'),
        capaciteMax: 8,
        nbInscrits: 0,
        statutSession: 'EN_COURS',
        sallePrincipale: 'Atelier B2',
        formateurPrincipalId: formateurs[4].idFormateur
      }
    })

    const session3 = await prisma.session.create({
      data: {
        idFormation: formations[2].idFormation,
        nomSession: 'Perfectionnement Sertissage — Avril 2025',
        dateDebut: new Date('2025-04-07'),
        dateFin: new Date('2025-04-18'),
        capaciteMax: 6,
        nbInscrits: 0,
        statutSession: 'CONFIRMEE',
        sallePrincipale: 'Atelier B2',
        formateurPrincipalId: formateurs[2].idFormateur
      }
    })

    const session4 = await prisma.session.create({
      data: {
        idFormation: formations[3].idFormation,
        nomSession: 'CAO/DAO — Mai 2025',
        dateDebut: new Date('2025-05-12'),
        dateFin: new Date('2025-05-30'),
        capaciteMax: 8,
        nbInscrits: 0,
        statutSession: 'PREVUE',
        sallePrincipale: 'Salle C',
        formateurPrincipalId: formateurs[1].idFormateur
      }
    })

    const session5 = await prisma.session.create({
      data: {
        idFormation: formations[4].idFormation,
        nomSession: 'Gemmologie — Janvier 2025',
        dateDebut: new Date('2025-01-13'),
        dateFin: new Date('2025-01-19'),
        capaciteMax: 10,
        nbInscrits: 0,
        statutSession: 'TERMINEE',
        sallePrincipale: 'Atelier B1',
        formateurPrincipalId: formateurs[3].idFormateur
      }
    })

    sessions = [session1, session2, session3, session4, session5]
    console.log('Sessions creees')
  } else {
    sessions = await prisma.session.findMany({ orderBy: { idSession: 'asc' }, take: 5 })
    console.log('Sessions deja existantes, recuperation')
  }

  // ============================================================
  // 8. PROSPECTS (15 prospects)
  // ============================================================
  console.log('Creation des prospects...')

  // 10 prospects qui deviennent candidats (statut CANDIDAT -> mis a jour apres creation candidats)
  const prospectsCandidatsData = [
    { id: 'PROS_DUR_SOP_001', nom: 'Durand', prenom: 'Sophie', email: 'sophie.durand@email.fr', tel: '0612345678', formation: 'CAP_ATBJ', financement: 'CPF' },
    { id: 'PROS_BAR_MAX_002', nom: 'Barbier', prenom: 'Maxime', email: 'maxime.barbier@email.fr', tel: '0623456789', formation: 'CAP_ATBJ', financement: 'OPCO' },
    { id: 'PROS_FON_CHL_003', nom: 'Fontaine', prenom: 'Chloe', email: 'chloe.fontaine@email.fr', tel: '0634567890', formation: 'CAP_ATBJ', financement: 'CPF' },
    { id: 'PROS_LAM_LUC_004', nom: 'Lambert', prenom: 'Lucas', email: 'lucas.lambert@email.fr', tel: '0645678901', formation: 'CAP_ATBJ', financement: 'France Travail' },
    { id: 'PROS_GAR_EMM_005', nom: 'Garcia', prenom: 'Emma', email: 'emma.garcia@email.fr', tel: '0656789012', formation: 'CAP_ATBJ', financement: 'Personnel' },
    { id: 'PROS_MAR_THE_006', nom: 'Martinez', prenom: 'Theo', email: 'theo.martinez@email.fr', tel: '0667890123', formation: 'CAP_ATBJ', financement: 'OPCO' },
    { id: 'PROS_MOR_LEA_007', nom: 'Moreau', prenom: 'Lea', email: 'lea.moreau@email.fr', tel: '0678901234', formation: 'INIT_BJ', financement: 'Personnel' },
    { id: 'PROS_SIM_HUG_008', nom: 'Simon', prenom: 'Hugo', email: 'hugo.simon@email.fr', tel: '0689012345', formation: 'INIT_BJ', financement: 'CPF' },
    { id: 'PROS_ROU_ALI_009', nom: 'Roux', prenom: 'Alice', email: 'alice.roux@email.fr', tel: '0690123456', formation: 'PERF_SERTI', financement: 'OPCO' },
    { id: 'PROS_GIR_NOA_010', nom: 'Girard', prenom: 'Noah', email: 'noah.girard@email.fr', tel: '0601234567', formation: 'PERF_SERTI', financement: 'Personnel' },
  ]

  const prospectsCreated: any[] = []
  for (let i = 0; i < prospectsCandidatsData.length; i++) {
    const data = prospectsCandidatsData[i]
    const datePremier = new Date(2024, 10, 1 + i)
    const dateDernier = new Date(2025, 1, 1 + i)
    const nbJours = Math.floor((dateDernier.getTime() - datePremier.getTime()) / (1000 * 60 * 60 * 24))
    const nbEchanges = Math.max(1, Math.floor(nbJours / 15))

    const prospect = await prisma.prospect.upsert({
      where: { idProspect: data.id },
      update: {},
      create: {
        idProspect: data.id,
        emails: [data.email],
        telephones: [data.tel],
        nom: data.nom,
        prenom: data.prenom,
        formationsSouhaitees: [data.formation],
        formationPrincipale: data.formation,
        modeFinancement: data.financement,
        statutProspect: 'ELEVE',
        sourceOrigine: 'Site web',
        datePremierContact: datePremier,
        dateDernierContact: dateDernier,
        nbEchanges
      }
    })
    prospectsCreated.push(prospect)
  }

  // 5 prospects purs (visibles sur la page Prospects)
  const prospectsPursData = [
    { id: 'PROS_DUP_JEA_011', nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@email.fr', tel: '0612340011', formation: 'CAP_ATBJ', statut: 'NOUVEAU' },
    { id: 'PROS_LER_MAR_012', nom: 'Leroy', prenom: 'Marie', email: 'marie.leroy@email.fr', tel: '0623450012', formation: 'INIT_BJ', statut: 'EN_ATTENTE_DOSSIER' },
    { id: 'PROS_BOU_PIE_013', nom: 'Boucher', prenom: 'Pierre', email: 'pierre.boucher@email.fr', tel: '0634560013', formation: 'CAO_DAO', statut: 'NOUVEAU' },
    { id: 'PROS_LAF_ANN_014', nom: 'Lafont', prenom: 'Anne', email: 'anne.lafont@email.fr', tel: '0645670014', formation: 'GEMMO', statut: 'NOUVEAU' },
    { id: 'PROS_RIC_LOU_015', nom: 'Richard', prenom: 'Louis', email: 'louis.richard@email.fr', tel: '0656780015', formation: 'PERF_SERTI', statut: 'NOUVEAU' },
  ]

  for (let i = 0; i < prospectsPursData.length; i++) {
    const data = prospectsPursData[i]
    const datePremier = new Date(2025, 1, 1 + i)
    const dateDernier = new Date(2025, 1, 5 + i)
    await prisma.prospect.upsert({
      where: { idProspect: data.id },
      update: {},
      create: {
        idProspect: data.id,
        emails: [data.email],
        telephones: [data.tel],
        nom: data.nom,
        prenom: data.prenom,
        formationsSouhaitees: [data.formation],
        formationPrincipale: data.formation,
        statutProspect: data.statut as string,
        sourceOrigine: 'Formulaire contact',
        datePremierContact: datePremier,
        dateDernierContact: dateDernier,
        nbEchanges: 2
      }
    })
  }

  // Prospect test (Sophie Martin)
  await prisma.prospect.upsert({
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
      situationActuelle: "Demandeur d'emploi",
      niveauEtudes: 'Baccalaureat',
      projetProfessionnel: 'Reconversion dans la bijouterie artisanale',
      statutProspect: 'NOUVEAU',
      sourceOrigine: 'Site web',
      messageInitial: 'Je souhaite me reconvertir dans la bijouterie',
      datePremierContact: new Date()
    }
  })

  console.log('Prospects crees')

  // ============================================================
  // 9. CANDIDATS (10 candidats)
  // ============================================================
  console.log('Creation des candidats...')

  const candidatsExistants = await prisma.candidat.count({
    where: { idProspect: { in: prospectsCreated.map(p => p.idProspect) } }
  })

  const candidats: any[] = []

  if (candidatsExistants === 0) {
    const candidatsData = [
      { idx: 0, formation: 'CAP_ATBJ', statut: 'INSCRIT', financement: 'EN_COURS', montant: 8500, pec: 8000, score: 85, parcours: { tel: true, rdv: true, test: true, valide: true } },
      { idx: 1, formation: 'CAP_ATBJ', statut: 'ACCEPTE', financement: 'VALIDE', montant: 8500, pec: 7500, score: 78, parcours: { tel: true, rdv: true, test: true, valide: true } },
      { idx: 2, formation: 'CAP_ATBJ', statut: 'INSCRIT', financement: 'EN_COURS', montant: 8500, pec: 8500, score: 92, parcours: { tel: true, rdv: true, test: true, valide: true } },
      { idx: 3, formation: 'CAP_ATBJ', statut: 'ACCEPTE', financement: 'VALIDE', montant: 8500, pec: 8500, score: 68, parcours: { tel: true, rdv: true, test: false, valide: true } },
      { idx: 4, formation: 'CAP_ATBJ', statut: 'INSCRIT', financement: 'EN_COURS', montant: 8500, pec: 0, score: 74, parcours: { tel: true, rdv: true, test: true, valide: true } },
      { idx: 5, formation: 'CAP_ATBJ', statut: 'INSCRIT', financement: 'VALIDE', montant: 8500, pec: 6800, score: 81, parcours: { tel: true, rdv: true, test: true, valide: true } },
      { idx: 6, formation: 'INIT_BJ', statut: 'INSCRIT', financement: 'VALIDE', montant: 750, pec: 0, score: 55, parcours: { tel: true, rdv: false, test: false, valide: true } },
      { idx: 7, formation: 'INIT_BJ', statut: 'INSCRIT', financement: 'EN_COURS', montant: 750, pec: 750, score: 62, parcours: { tel: true, rdv: true, test: false, valide: true } },
      { idx: 8, formation: 'PERF_SERTI', statut: 'ACCEPTE', financement: 'VALIDE', montant: 1500, pec: 1500, score: 88, parcours: { tel: true, rdv: true, test: true, valide: true } },
      { idx: 9, formation: 'PERF_SERTI', statut: 'ACCEPTE', financement: 'VALIDE', montant: 1500, pec: 1200, score: 72, parcours: { tel: true, rdv: true, test: true, valide: true } },
    ]

    for (let i = 0; i < candidatsData.length; i++) {
      const data = candidatsData[i]
      const prospect = prospectsCreated[data.idx]
      const numeroDossier = `${prospect.nom.substring(0, 2).toUpperCase()}${prospect.prenom.substring(0, 2).toUpperCase()}${String(i + 1).padStart(8, '0')}`

      const candidat = await prisma.candidat.create({
        data: {
          idProspect: prospect.idProspect,
          numeroDossier,
          formationsDemandees: [data.formation],
          formationRetenue: data.formation,
          modeFinancement: prospectsCandidatsData[i].financement,
          montantTotalFormation: data.montant,
          montantPriseEnCharge: data.pec,
          resteACharge: data.montant - data.pec,
          statutDossier: data.statut,
          statutFinancement: data.financement,
          statutInscription: data.statut === 'INSCRIT' ? 'VALIDEE' : 'EN_COURS',
          score: data.score,
          notesIa: `Profil motive. ${data.score >= 80 ? 'Excellent potentiel' : data.score >= 70 ? 'Bon profil' : 'Profil correct'}. Formation ${data.formation} adaptee au projet professionnel.`,
          entretienTelephonique: data.parcours.tel,
          dateEntretienTel: data.parcours.tel ? new Date(2025, 0, 10 + i) : null,
          rdvPresentiel: data.parcours.rdv,
          dateRdvPresentiel: data.parcours.rdv ? new Date(2025, 0, 15 + i) : null,
          testTechnique: data.parcours.test,
          dateTestTechnique: data.parcours.test ? new Date(2025, 0, 20 + i) : null,
          validationPedagogique: data.parcours.valide,
          dateValidationPedagogique: data.parcours.valide ? new Date(2025, 0, 25 + i) : null
        }
      })
      candidats.push(candidat)

      // Lier le prospect au dossier
      await prisma.prospect.update({
        where: { idProspect: prospect.idProspect },
        data: { numeroDossier, statutDossier: data.statut }
      })

      // Documents du candidat (4 par candidat)
      await prisma.documentCandidat.createMany({
        data: [
          { idProspect: prospect.idProspect, numeroDossier, typeDocument: 'CV', categorie: 'candidature', nomFichier: `CV_${numeroDossier}.pdf`, urlDrive: `https://drive.google.com/file/d/FAKE_${numeroDossier}_CV`, statut: 'VALIDE', obligatoire: true, dateReception: new Date(2025, 0, 5), dateValidation: new Date(2025, 0, 10) },
          { idProspect: prospect.idProspect, numeroDossier, typeDocument: 'LETTRE_MOTIVATION', categorie: 'candidature', nomFichier: `LM_${numeroDossier}.pdf`, urlDrive: `https://drive.google.com/file/d/FAKE_${numeroDossier}_LM`, statut: 'VALIDE', obligatoire: true, dateReception: new Date(2025, 0, 5), dateValidation: new Date(2025, 0, 10) },
          { idProspect: prospect.idProspect, numeroDossier, typeDocument: 'CNI_RECTO', categorie: 'candidature', nomFichier: `CNI_R_${numeroDossier}.jpg`, urlDrive: `https://drive.google.com/file/d/FAKE_${numeroDossier}_CNI_R`, statut: data.statut === 'INSCRIT' ? 'VALIDE' : 'RECU', obligatoire: true, dateReception: new Date(2025, 0, 5), dateValidation: data.statut === 'INSCRIT' ? new Date(2025, 0, 10) : null },
          { idProspect: prospect.idProspect, numeroDossier, typeDocument: 'CNI_VERSO', categorie: 'candidature', nomFichier: `CNI_V_${numeroDossier}.jpg`, urlDrive: `https://drive.google.com/file/d/FAKE_${numeroDossier}_CNI_V`, statut: data.statut === 'INSCRIT' ? 'VALIDE' : 'RECU', obligatoire: true, dateReception: new Date(2025, 0, 5), dateValidation: data.statut === 'INSCRIT' ? new Date(2025, 0, 10) : null },
        ]
      })
    }

    console.log('Candidats crees')
  } else {
    const existing = await prisma.candidat.findMany({
      where: { idProspect: { in: prospectsCreated.map(p => p.idProspect) } },
      orderBy: { idCandidat: 'asc' }
    })
    candidats.push(...existing)
    console.log('Candidats deja existants, recuperation')
  }

  // ============================================================
  // 10. ELEVES (10 eleves)
  // ============================================================
  console.log('Creation des eleves...')

  const elevesExistants = await prisma.eleve.count({
    where: { idCandidat: { in: candidats.map(c => c.idCandidat) } }
  })

  const elevesCreated: any[] = []

  if (elevesExistants === 0 && candidats.length >= 10) {
    for (let i = 0; i < 10; i++) {
      const candidat = candidats[i]
      const utilisateur = utilisateursEleves[i]

      const eleve = await prisma.eleve.create({
        data: {
          idCandidat: candidat.idCandidat,
          idUtilisateur: utilisateur.idUtilisateur,
          numeroDossier: candidat.numeroDossier,
          formationSuivie: candidat.formationRetenue || 'CAP_ATBJ',
          dateDebut: i < 6 ? new Date('2025-03-01') : i < 8 ? new Date('2025-02-10') : new Date('2025-04-07'),
          dateFinPrevue: i < 6 ? new Date('2025-09-30') : i < 8 ? new Date('2025-02-14') : new Date('2025-04-18'),
          statutFormation: 'EN_COURS',
          notesGenerales: `Eleve ${i < 2 ? 'assidu et motive' : i < 5 ? 'serieux' : 'en progression'}`
        }
      })
      elevesCreated.push(eleve)
    }

    // Inscriptions sessions
    if (sessions.length >= 3) {
      for (let i = 0; i < 6; i++) {
        await prisma.inscriptionSession.create({
          data: { idEleve: elevesCreated[i].idEleve, idSession: sessions[0].idSession, dateInscription: new Date('2025-02-15'), statutInscription: 'CONFIRME', dateConfirmation: new Date('2025-02-20') }
        })
      }
      for (let i = 6; i < 8; i++) {
        await prisma.inscriptionSession.create({
          data: { idEleve: elevesCreated[i].idEleve, idSession: sessions[1].idSession, dateInscription: new Date('2025-02-01'), statutInscription: 'CONFIRME', dateConfirmation: new Date('2025-02-05') }
        })
      }
      for (let i = 8; i < 10; i++) {
        await prisma.inscriptionSession.create({
          data: { idEleve: elevesCreated[i].idEleve, idSession: sessions[2].idSession, dateInscription: new Date('2025-03-20'), statutInscription: 'INSCRIT', dateConfirmation: null }
        })
      }

      await prisma.session.update({ where: { idSession: sessions[0].idSession }, data: { nbInscrits: 6 } })
      await prisma.session.update({ where: { idSession: sessions[1].idSession }, data: { nbInscrits: 2 } })
      await prisma.session.update({ where: { idSession: sessions[2].idSession }, data: { nbInscrits: 2 } })
    }

    // Evaluations (2-3 par eleve)
    const notes = [8.5, 12, 15.5, 9, 16, 14, 11.5, 13, 17, 10.5, 18, 12.5, 15, 14.5, 16.5, 11, 13.5, 9.5, 17.5, 12, 14, 16, 13, 15.5, 18.5]
    let noteIndex = 0
    for (let i = 0; i < elevesCreated.length; i++) {
      const eleve = elevesCreated[i]
      const sessionId = sessions.length > 0 ? (i < 6 ? sessions[0].idSession : i < 8 ? sessions[1].idSession : sessions[2].idSession) : null
      const formateurId = i < 6 ? formateurs[0].idFormateur : i < 8 ? formateurs[4].idFormateur : formateurs[2].idFormateur

      if (!sessionId) continue
      const nbEval = i % 3 === 0 ? 3 : 2
      for (let j = 0; j < nbEval; j++) {
        const note = notes[noteIndex % notes.length]
        noteIndex++
        await prisma.evaluation.create({
          data: {
            idEleve: eleve.idEleve,
            idSession: sessionId,
            idFormateur: formateurId,
            typeEvaluation: j === 0 ? 'CONTROLE_CONTINU' : j === 1 ? 'CONTROLE_CONTINU' : 'EXAMEN_BLANC',
            dateEvaluation: new Date(2025, 1, 5 + i * 2 + j * 3),
            note,
            noteSur: 20,
            appreciation: note >= 16 ? 'Excellent travail' : note >= 14 ? 'Tres bien' : note >= 12 ? 'Bien' : note >= 10 ? 'Assez bien' : 'Doit progresser',
            competencesValidees: note >= 10 ? ['Maitrise technique', 'Precision'] : ['Effort'],
            commentaire: `Evaluation du ${new Date(2025, 1, 5 + i * 2 + j * 3).toLocaleDateString('fr-FR')}`,
            valideParAdmin: true,
            dateValidation: new Date(2025, 1, 10 + i * 2 + j * 3)
          }
        })
      }
    }

    // Presences (6-8 par eleve)
    for (let i = 0; i < elevesCreated.length; i++) {
      const eleve = elevesCreated[i]
      const sessionId = sessions.length > 0 ? (i < 6 ? sessions[0].idSession : i < 8 ? sessions[1].idSession : sessions[2].idSession) : null
      if (!sessionId) continue
      const nbPresences = 6 + (i % 3)
      for (let j = 0; j < nbPresences; j++) {
        const r = (i * 13 + j * 7) % 100
        const statut = r > 85 ? 'ABSENT' : r > 75 ? 'RETARD' : 'PRESENT'
        await prisma.presence.create({
          data: {
            idEleve: eleve.idEleve,
            idSession: sessionId,
            dateCours: new Date(2025, 1, 10 + j * 2),
            demiJournee: j % 2 === 0 ? 'MATIN' : 'APRES_MIDI',
            statutPresence: statut,
            justificatifFourni: statut === 'ABSENT' && j % 2 === 0,
            saisiPar: 'Formateur'
          }
        })
      }
    }

    console.log('Eleves, evaluations et presences crees')
  } else {
    const existing = await prisma.eleve.findMany({
      where: { idCandidat: { in: candidats.map(c => c.idCandidat) } },
      orderBy: { idEleve: 'asc' }
    })
    elevesCreated.push(...existing)
    console.log('Eleves deja existants, recuperation')
  }

  // ============================================================
  // 11. INTERVENTIONS FORMATEURS
  // ============================================================
  const interventionsExistantes = await prisma.interventionFormateur.count()
  if (interventionsExistantes === 0 && sessions.length >= 5) {
    for (let i = 0; i < formateurs.length; i++) {
      const nbInterventions = 3 + (i % 2)
      for (let j = 0; j < nbInterventions; j++) {
        await prisma.interventionFormateur.create({
          data: {
            idFormateur: formateurs[i].idFormateur,
            idSession: sessions[i % sessions.length].idSession,
            dateIntervention: new Date(2025, 1, 5 + i * 3 + j * 2),
            dureeHeures: 7,
            sujet: `Cours ${j + 1} - ${formateurs[i].specialites[0]}`,
            cout: formateurs[i].tarifJournalier,
            facturePayee: j === 0,
            datePaiement: j === 0 ? new Date(2025, 2, 1) : null
          }
        })
      }
    }
    console.log('Interventions formateurs creees')
  }

  // ============================================================
  // 12. DISPONIBILITES FORMATEURS
  // ============================================================
  const dispoExistantes = await prisma.disponibiliteFormateur.count()
  if (dispoExistantes === 0) {
    const creneaux = ['MATIN', 'APRES_MIDI', 'JOURNEE']
    for (let i = 0; i < formateurs.length; i++) {
      const nbDispo = 10 + (i % 6)
      for (let j = 0; j < nbDispo; j++) {
        await prisma.disponibiliteFormateur.create({
          data: {
            idFormateur: formateurs[i].idFormateur,
            date: new Date(2026, 2 + Math.floor(j / 3), 1 + (j * 3) + i),
            creneauJournee: creneaux[j % 3],
            typeDisponibilite: j === 0 ? 'CONFIRME' : j % 3 === 0 ? 'RESERVE' : 'DISPONIBLE',
            formationConcernee: formateurs[i].specialites[j % formateurs[i].specialites.length]
          }
        })
      }
    }
    console.log('Disponibilites formateurs creees')
  }

  // ============================================================
  // 13. HISTORIQUE EMAILS
  // ============================================================
  const emailsExistants = await prisma.historiqueEmail.count()
  if (emailsExistants === 0) {
    for (let i = 0; i < 20; i++) {
      const prospect = prospectsCreated[i % prospectsCreated.length]
      const sens = i % 3 === 0 ? 'sortant' : 'entrant'
      await prisma.historiqueEmail.create({
        data: {
          idEmail: `EMAIL_${String(i + 1).padStart(6, '0')}`,
          idProspect: prospect.idProspect,
          sens,
          emailExpediteur: sens === 'entrant' ? prospect.emails[0] : 'contact@abj.fr',
          emailDestinataire: sens === 'sortant' ? prospect.emails[0] : 'contact@abj.fr',
          objet: sens === 'entrant' ? `Demande information ${prospect.formationPrincipale}` : `Reponse formation ${prospect.formationPrincipale}`,
          contenu: sens === 'entrant' ? 'Bonjour, je souhaite des informations sur vos formations...' : 'Bonjour, nous vous remercions de votre interet...',
          statut: 'TRAITE',
          reponseEnvoyee: sens === 'entrant',
          dateReponse: sens === 'entrant' ? new Date(2025, 1, 1 + i) : null,
          intentionDetectee: 'Demande information',
          formationDetectee: prospect.formationPrincipale
        }
      })
    }
    console.log('Historique emails cree')
  }

  // ============================================================
  // 14. HISTORIQUE MARJORIE CRM
  // ============================================================
  const marjorieExistant = await prisma.historiqueMarjorieCrm.count()
  if (marjorieExistant === 0) {
    for (let i = 0; i < 5; i++) {
      await prisma.historiqueMarjorieCrm.create({
        data: {
          idUtilisateur: admin.idUtilisateur,
          roleUtilisateur: 'admin',
          messageUtilisateur: 'Combien de candidats en attente validation ?',
          reponseMarjorie: `Il y a actuellement ${candidats.filter(c => c.statutDossier === 'ACCEPTE').length} candidats en attente de validation.`,
          contexte: { page: 'dashboard' },
          dureeReponseMs: 250 + i * 50
        }
      })
    }

    for (let i = 0; i < 3; i++) {
      const utilisateurFormateur = utilisateursFormateurs[i % utilisateursFormateurs.length]
      await prisma.historiqueMarjorieCrm.create({
        data: {
          idUtilisateur: utilisateurFormateur.idUtilisateur,
          roleUtilisateur: 'professeur',
          messageUtilisateur: 'Qui sont mes eleves cette semaine ?',
          reponseMarjorie: 'Vous avez 6 eleves cette semaine pour la session CAP ATBJ.',
          contexte: { page: 'mes-eleves' },
          dureeReponseMs: 320 + i * 40
        }
      })
    }

    for (let i = 0; i < 3; i++) {
      const utilisateurEleve = utilisateursEleves[i]
      await prisma.historiqueMarjorieCrm.create({
        data: {
          idUtilisateur: utilisateurEleve.idUtilisateur,
          roleUtilisateur: 'eleve',
          messageUtilisateur: 'Quelle est ma moyenne actuelle ?',
          reponseMarjorie: `Ta moyenne actuelle est de ${(12 + i * 2).toFixed(1)}/20. Continue comme ca !`,
          contexte: { page: 'mes-notes' },
          dureeReponseMs: 180 + i * 30
        }
      })
    }

    console.log('Historique Marjorie CRM cree')
  }

  // ============================================================
  // RESUME
  // ============================================================
  console.log('\nSeed termine avec succes !')
  console.log('\nComptes de test :')
  console.log('  Admin (demo) : admin@abj.fr / ABJ2024!')
  console.log('  Formateur (demo) : formateur@abj.fr / ABJ2024!')
  console.log('  Eleve (demo) : eleve@abj.fr / ABJ2024!')
  console.log('  Admin (prod) : orokronos.pro@gmail.com')
  console.log('  Admin (prod) : david-duhamel@live.fr')
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
