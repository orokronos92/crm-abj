/**
 * Script de seed complet pour l'environnement de test
 * Génère un dataset réaliste et cohérent pour toutes les tables
 */

import prisma from '../src/lib/prisma'
import { hash } from 'bcryptjs'

// ============================================
// DONNÉES DE BASE
// ============================================

// Formations disponibles à l'ABJ
const FORMATIONS = [
  'CAP_BJ',           // CAP Bijouterie-Joaillerie
  'INIT_BJ',          // Initiation Bijouterie
  'PERF_SERTI',       // Perfectionnement Sertissage
  'CAO_DAO',          // CAO/DAO Bijouterie
  'GEMMO',            // Gemmologie
  'JOAILLERIE_CREATION', // Joaillerie Création
  'SERTISSAGE_N1',    // Sertissage Niveau 1
  'SERTISSAGE_N2',    // Sertissage Niveau 2
  'POLISSAGE',        // Polissage
  'GRAVURE',          // Gravure
]

// Modes de financement
const FINANCEMENTS = ['CPF', 'OPCO', 'PERSONNEL', 'ENTREPRISE', 'POLE_EMPLOI', 'REGION']

// Villes d'Île-de-France
const VILLES_IDF = [
  { ville: 'Paris', cp: '75001' },
  { ville: 'Paris', cp: '75008' },
  { ville: 'Paris', cp: '75011' },
  { ville: 'Paris', cp: '75015' },
  { ville: 'Boulogne-Billancourt', cp: '92100' },
  { ville: 'Neuilly-sur-Seine', cp: '92200' },
  { ville: 'Versailles', cp: '78000' },
  { ville: 'Saint-Germain-en-Laye', cp: '78100' },
  { ville: 'Vincennes', cp: '94300' },
  { ville: 'Saint-Cloud', cp: '92210' },
  { ville: 'Rueil-Malmaison', cp: '92500' },
  { ville: 'Sceaux', cp: '92330' },
  { ville: 'Meudon', cp: '92190' },
  { ville: 'Issy-les-Moulineaux', cp: '92130' },
  { ville: 'Levallois-Perret', cp: '92300' },
]

// ============================================
// DONNÉES PROSPECTS (minimum 10 disponibles)
// ============================================

const prospectsData = [
  // Prospects NOUVEAU (jamais candidaté)
  {
    nom: 'Martin',
    prenom: 'Julie',
    email: 'julie.martin@gmail.com',
    tel: '0612345678',
    formation: 'CAP_BJ',
    statut: 'NOUVEAU',
    source: 'Site web',
    financement: 'CPF'
  },
  {
    nom: 'Bernard',
    prenom: 'Thomas',
    email: 'thomas.bernard@yahoo.fr',
    tel: '0623456789',
    formation: 'INIT_BJ',
    statut: 'NOUVEAU',
    source: 'Salon de l\'artisanat',
    financement: 'PERSONNEL'
  },
  {
    nom: 'Petit',
    prenom: 'Emma',
    email: 'emma.petit@outlook.fr',
    tel: '0634567890',
    formation: 'GEMMO',
    statut: 'NOUVEAU',
    source: 'Recommandation',
    financement: 'ENTREPRISE'
  },
  {
    nom: 'Robert',
    prenom: 'Lucas',
    email: 'lucas.robert@gmail.com',
    tel: '0645678901',
    formation: 'CAO_DAO',
    statut: 'NOUVEAU',
    source: 'Instagram',
    financement: 'OPCO'
  },
  // Prospects EN_ATTENTE_DOSSIER
  {
    nom: 'Dubois',
    prenom: 'Chloé',
    email: 'chloe.dubois@gmail.com',
    tel: '0656789012',
    formation: 'PERF_SERTI',
    statut: 'EN_ATTENTE_DOSSIER',
    source: 'Site web',
    financement: 'CPF'
  },
  {
    nom: 'Thomas',
    prenom: 'Alexandre',
    email: 'alex.thomas@hotmail.fr',
    tel: '0667890123',
    formation: 'SERTISSAGE_N1',
    statut: 'EN_ATTENTE_DOSSIER',
    source: 'Google Ads',
    financement: 'PERSONNEL'
  },
  // Prospects ANCIEN_CANDIDAT (ont déjà candidaté mais refusé)
  {
    nom: 'Richard',
    prenom: 'Sophie',
    email: 'sophie.richard@gmail.com',
    tel: '0678901234',
    formation: 'CAP_BJ',
    statut: 'ANCIEN_CANDIDAT',
    source: 'Site web',
    financement: 'POLE_EMPLOI'
  },
  {
    nom: 'Durand',
    prenom: 'Nicolas',
    email: 'nicolas.durand@yahoo.fr',
    tel: '0689012345',
    formation: 'JOAILLERIE_CREATION',
    statut: 'ANCIEN_CANDIDAT',
    source: 'Facebook',
    financement: 'REGION'
  },
  // Prospects ANCIEN_ELEVE (ont terminé une formation)
  {
    nom: 'Moreau',
    prenom: 'Camille',
    email: 'camille.moreau@gmail.com',
    tel: '0690123456',
    formation: 'SERTISSAGE_N2',
    statut: 'ANCIEN_ELEVE',
    source: 'Site web',
    financement: 'CPF'
  },
  {
    nom: 'Laurent',
    prenom: 'Antoine',
    email: 'antoine.laurent@outlook.fr',
    tel: '0601234567',
    formation: 'POLISSAGE',
    statut: 'ANCIEN_ELEVE',
    source: 'Ancien élève',
    financement: 'ENTREPRISE'
  },
  // Prospects supplémentaires pour atteindre minimum 10
  {
    nom: 'Garcia',
    prenom: 'Isabelle',
    email: 'isabelle.garcia@gmail.com',
    tel: '0612345679',
    formation: 'GRAVURE',
    statut: 'NOUVEAU',
    source: 'LinkedIn',
    financement: 'OPCO'
  },
  {
    nom: 'Martinez',
    prenom: 'Pierre',
    email: 'pierre.martinez@yahoo.fr',
    tel: '0623456780',
    formation: 'CAP_BJ',
    statut: 'NOUVEAU',
    source: 'Pôle Emploi',
    financement: 'POLE_EMPLOI'
  }
]

// ============================================
// DONNÉES CANDIDATS (10 avec statuts variés)
// ============================================

const candidatsData = [
  {
    nom: 'Lefevre',
    prenom: 'Marie',
    email: 'marie.lefevre@gmail.com',
    tel: '0612340001',
    formation: 'CAP_BJ',
    statut_dossier: 'RECU',
    statut_financement: 'EN_ATTENTE',
    montant: 8500,
    financement: 'CPF'
  },
  {
    nom: 'Roux',
    prenom: 'Paul',
    email: 'paul.roux@hotmail.fr',
    tel: '0623450002',
    formation: 'INIT_BJ',
    statut_dossier: 'DOSSIER_EN_COURS',
    statut_financement: 'EN_ATTENTE',
    montant: 3500,
    financement: 'PERSONNEL'
  },
  {
    nom: 'Vincent',
    prenom: 'Laura',
    email: 'laura.vincent@gmail.com',
    tel: '0634560003',
    formation: 'PERF_SERTI',
    statut_dossier: 'DOSSIER_COMPLET',
    statut_financement: 'EN_COURS',
    montant: 4500,
    financement: 'OPCO'
  },
  {
    nom: 'Fournier',
    prenom: 'Julien',
    email: 'julien.fournier@yahoo.fr',
    tel: '0645670004',
    formation: 'CAO_DAO',
    statut_dossier: 'ENTRETIEN_PLANIFIE',
    statut_financement: 'EN_COURS',
    montant: 3200,
    financement: 'ENTREPRISE'
  },
  {
    nom: 'Girard',
    prenom: 'Céline',
    email: 'celine.girard@gmail.com',
    tel: '0656780005',
    formation: 'GEMMO',
    statut_dossier: 'DEVIS_ENVOYE',
    statut_financement: 'EN_COURS',
    montant: 2800,
    financement: 'CPF'
  },
  {
    nom: 'Bonnet',
    prenom: 'Maxime',
    email: 'maxime.bonnet@outlook.fr',
    tel: '0667890006',
    formation: 'CAP_BJ',
    statut_dossier: 'DEVIS_ACCEPTE',
    statut_financement: 'VALIDE',
    montant: 8500,
    financement: 'POLE_EMPLOI'
  },
  {
    nom: 'Dupuis',
    prenom: 'Sarah',
    email: 'sarah.dupuis@gmail.com',
    tel: '0678900007',
    formation: 'JOAILLERIE_CREATION',
    statut_dossier: 'FINANCEMENT_VALIDE',
    statut_financement: 'VALIDE',
    montant: 6500,
    financement: 'REGION'
  },
  {
    nom: 'Fontaine',
    prenom: 'Guillaume',
    email: 'guillaume.fontaine@yahoo.fr',
    tel: '0689010008',
    formation: 'SERTISSAGE_N1',
    statut_dossier: 'ACCEPTE',
    statut_financement: 'VALIDE',
    montant: 3800,
    financement: 'CPF'
  },
  {
    nom: 'Rousseau',
    prenom: 'Charlotte',
    email: 'charlotte.rousseau@gmail.com',
    tel: '0690120009',
    formation: 'SERTISSAGE_N2',
    statut_dossier: 'LISTE_ATTENTE',
    statut_financement: 'VALIDE',
    montant: 4200,
    financement: 'OPCO'
  },
  {
    nom: 'Mercier',
    prenom: 'David',
    email: 'david.mercier@hotmail.fr',
    tel: '0601230010',
    formation: 'POLISSAGE',
    statut_dossier: 'INSCRIT',
    statut_financement: 'VALIDE',
    montant: 2500,
    financement: 'PERSONNEL'
  }
]

// ============================================
// DONNÉES ÉLÈVES (10 en formation)
// ============================================

const elevesData = [
  {
    nom: 'Blanc',
    prenom: 'Léa',
    email: 'lea.blanc@gmail.com',
    tel: '0612000001',
    formation: 'CAP_BJ',
    session: 'CAP Janvier 2024',
    date_debut: '2024-01-15',
    statut: 'EN_COURS'
  },
  {
    nom: 'Guerin',
    prenom: 'Hugo',
    email: 'hugo.guerin@yahoo.fr',
    tel: '0623000002',
    formation: 'CAP_BJ',
    session: 'CAP Janvier 2024',
    date_debut: '2024-01-15',
    statut: 'EN_COURS'
  },
  {
    nom: 'Faure',
    prenom: 'Alice',
    email: 'alice.faure@gmail.com',
    tel: '0634000003',
    formation: 'INIT_BJ',
    session: 'Initiation Février 2024',
    date_debut: '2024-02-01',
    statut: 'EN_COURS'
  },
  {
    nom: 'Andre',
    prenom: 'Louis',
    email: 'louis.andre@outlook.fr',
    tel: '0645000004',
    formation: 'PERF_SERTI',
    session: 'Perfectionnement Mars 2024',
    date_debut: '2024-03-01',
    statut: 'EN_COURS'
  },
  {
    nom: 'Chevalier',
    prenom: 'Inès',
    email: 'ines.chevalier@gmail.com',
    tel: '0656000005',
    formation: 'CAO_DAO',
    session: 'CAO/DAO Janvier 2024',
    date_debut: '2024-01-20',
    statut: 'EN_COURS'
  },
  {
    nom: 'François',
    prenom: 'Tom',
    email: 'tom.francois@yahoo.fr',
    tel: '0667000006',
    formation: 'GEMMO',
    session: 'Gemmologie Février 2024',
    date_debut: '2024-02-05',
    statut: 'EN_COURS'
  },
  {
    nom: 'Lambert',
    prenom: 'Manon',
    email: 'manon.lambert@gmail.com',
    tel: '0678000007',
    formation: 'JOAILLERIE_CREATION',
    session: 'Joaillerie Création Mars 2024',
    date_debut: '2024-03-10',
    statut: 'EN_COURS'
  },
  {
    nom: 'Perrin',
    prenom: 'Victor',
    email: 'victor.perrin@hotmail.fr',
    tel: '0689000008',
    formation: 'SERTISSAGE_N1',
    session: 'Sertissage N1 Février 2024',
    date_debut: '2024-02-15',
    statut: 'EN_COURS'
  },
  {
    nom: 'Morel',
    prenom: 'Zoé',
    email: 'zoe.morel@gmail.com',
    tel: '0690000009',
    formation: 'SERTISSAGE_N2',
    session: 'Sertissage N2 Mars 2024',
    date_debut: '2024-03-01',
    statut: 'EN_COURS'
  },
  {
    nom: 'Simon',
    prenom: 'Mathis',
    email: 'mathis.simon@outlook.fr',
    tel: '0601000010',
    formation: 'POLISSAGE',
    session: 'Polissage Janvier 2024',
    date_debut: '2024-01-25',
    statut: 'EN_COURS'
  }
]

// ============================================
// DONNÉES FORMATEURS (7 professeurs)
// ============================================

const formateursData = [
  {
    nom: 'Dubois',
    prenom: 'Philippe',
    email: 'philippe.dubois@abj-formation.fr',
    tel: '0611111111',
    specialites: ['CAP_BJ', 'INIT_BJ'],
    tarif: 450,
    statut: 'ACTIF',
    cv_url: '/documents/formateurs/cv_dubois_philippe.pdf',
    qualifications: 'CAP Bijouterie (1995), BP Bijouterie (1997), 25 ans d\'expérience'
  },
  {
    nom: 'Martin',
    prenom: 'Catherine',
    email: 'catherine.martin@abj-formation.fr',
    tel: '0622222222',
    specialites: ['PERF_SERTI', 'SERTISSAGE_N1', 'SERTISSAGE_N2'],
    tarif: 500,
    statut: 'ACTIF',
    cv_url: '/documents/formateurs/cv_martin_catherine.pdf',
    qualifications: 'Maître artisan sertisseur, Meilleur Ouvrier de France 2010'
  },
  {
    nom: 'Bernard',
    prenom: 'Jean-Pierre',
    email: 'jp.bernard@abj-formation.fr',
    tel: '0633333333',
    specialites: ['CAO_DAO'],
    tarif: 420,
    statut: 'ACTIF',
    cv_url: '/documents/formateurs/cv_bernard_jp.pdf',
    qualifications: 'Expert Rhinoceros 3D, Certification Matrix Gold'
  },
  {
    nom: 'Petit',
    prenom: 'Sophie',
    email: 'sophie.petit@abj-formation.fr',
    tel: '0644444444',
    specialites: ['GEMMO'],
    tarif: 480,
    statut: 'ACTIF',
    cv_url: '/documents/formateurs/cv_petit_sophie.pdf',
    qualifications: 'Diplômée Institut National de Gemmologie, FGA'
  },
  {
    nom: 'Moreau',
    prenom: 'François',
    email: 'francois.moreau@abj-formation.fr',
    tel: '0655555555',
    specialites: ['JOAILLERIE_CREATION', 'CAP_BJ'],
    tarif: 520,
    statut: 'ACTIF',
    cv_url: '/documents/formateurs/cv_moreau_francois.pdf',
    qualifications: 'Diplômé École Boulle, 20 ans chez Cartier'
  },
  {
    nom: 'Laurent',
    prenom: 'Isabelle',
    email: 'isabelle.laurent@abj-formation.fr',
    tel: '0666666666',
    specialites: ['POLISSAGE', 'GRAVURE'],
    tarif: 400,
    statut: 'ACTIF',
    cv_url: '/documents/formateurs/cv_laurent_isabelle.pdf',
    qualifications: 'CAP Art du bijou, Spécialisation polissage et gravure'
  },
  {
    nom: 'Leroy',
    prenom: 'Michel',
    email: 'michel.leroy@abj-formation.fr',
    tel: '0677777777',
    specialites: ['CAP_BJ', 'INIT_BJ', 'PERF_SERTI'],
    tarif: 480,
    statut: 'ACTIF',
    cv_url: '/documents/formateurs/cv_leroy_michel.pdf',
    qualifications: 'Maître bijoutier, Formateur certifié, 30 ans d\'expérience'
  }
]

// ============================================
// FONCTION PRINCIPALE DE SEED
// ============================================

async function seedDatabase() {
  console.log('🌱 Début du seed de la base de données...\n')
  console.log('=' .repeat(60))

  try {
    // ============================================
    // 1. NETTOYAGE DES TABLES
    // ============================================
    console.log('\n🗑️ Nettoyage des tables existantes...')

    // Ordre important pour respecter les contraintes FK
    await prisma.notificationLecture.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.documentFormateur.deleteMany()
    await prisma.documentCandidat.deleteMany()
    await prisma.historiqueEmail.deleteMany()
    await prisma.presence.deleteMany()
    await prisma.evaluation.deleteMany()
    await prisma.inscriptionSession.deleteMany()
    await prisma.eleve.deleteMany()
    await prisma.candidat.deleteMany()
    await prisma.prospect.deleteMany()
    await prisma.disponibiliteFormateur.deleteMany()
    await prisma.interventionFormateur.deleteMany()
    await prisma.session.deleteMany()
    await prisma.formateur.deleteMany()
    await prisma.formation.deleteMany()
    await prisma.utilisateur.deleteMany()

    console.log('✅ Tables nettoyées')

    // ============================================
    // 2. CRÉATION DES UTILISATEURS
    // ============================================
    console.log('\n👤 Création des utilisateurs...')

    const passwordHash = await hash('password123', 10)

    // Admin
    const adminUser = await prisma.utilisateur.create({
      data: {
        email: 'admin@abj.fr',
        motDePasseHash: passwordHash,
        nom: 'Admin',
        prenom: 'ABJ',
        role: 'admin',
        statutCompte: 'ACTIF'
      }
    })

    console.log('✅ Utilisateurs créés')

    // ============================================
    // 3. CRÉATION DES FORMATIONS
    // ============================================
    console.log('\n📚 Création des formations...')

    const formations = await Promise.all([
      prisma.formation.create({
        data: {
          codeFormation: 'CAP_BJ',
          nom: 'CAP Art du Bijou et du Joyau',
          categorie: 'CAP',
          dureeJours: 180,
          dureeHeures: 1200,
          niveauRequis: 'Aucun',
          diplomeDelivre: 'CAP',
          tarifStandard: 8500,
          description: 'Formation complète au métier de bijoutier-joaillier',
          prerequis: ['Niveau 3ème', 'Motivation'],
          objectifs: ['Maîtriser les techniques de base', 'Créer des bijoux', 'Connaître les métaux précieux'],
          programme: 'Dessin technique, travail du métal, sertissage, polissage, gemmologie',
          actif: true
        }
      }),
      prisma.formation.create({
        data: {
          codeFormation: 'INIT_BJ',
          nom: 'Initiation Bijouterie',
          categorie: 'FORMATION_COURTE',
          dureeJours: 20,
          dureeHeures: 140,
          niveauRequis: 'Débutant',
          tarifStandard: 3500,
          description: 'Découverte des techniques de base de la bijouterie',
          prerequis: ['Aucun'],
          objectifs: ['Découvrir le métier', 'Réaliser ses premiers bijoux'],
          programme: 'Techniques de base, outillage, premiers projets',
          actif: true
        }
      }),
      prisma.formation.create({
        data: {
          codeFormation: 'PERF_SERTI',
          nom: 'Perfectionnement Sertissage',
          categorie: 'PERFECTIONNEMENT',
          dureeJours: 15,
          dureeHeures: 105,
          niveauRequis: 'Confirmé',
          tarifStandard: 4500,
          description: 'Perfectionnement aux techniques de sertissage',
          prerequis: ['Bases en bijouterie'],
          objectifs: ['Maîtriser le sertissage grain', 'Sertissage clos', 'Sertissage rail'],
          programme: 'Techniques avancées de sertissage',
          actif: true
        }
      })
    ])

    console.log('✅ Formations créées')

    // ============================================
    // 4. CRÉATION DES FORMATEURS
    // ============================================
    console.log('\n👨‍🏫 Création des formateurs...')

    const formateurs = []
    for (const formateurData of formateursData) {
      // Créer l'utilisateur formateur
      const userFormateur = await prisma.utilisateur.create({
        data: {
          email: formateurData.email,
          motDePasseHash: passwordHash,
          nom: formateurData.nom,
          prenom: formateurData.prenom,
          role: 'professeur',
          statutCompte: 'ACTIF'
        }
      })

      // Créer le formateur
      const formateur = await prisma.formateur.create({
        data: {
          idUtilisateur: userFormateur.idUtilisateur,
          nom: formateurData.nom,
          prenom: formateurData.prenom,
          email: formateurData.email,
          telephone: formateurData.tel,
          specialites: formateurData.specialites,
          tarifJournalier: formateurData.tarif,
          statut: formateurData.statut,
          cvUrl: formateurData.cv_url,
          qualificationsResume: formateurData.qualifications,
          dateValidationQualiopi: new Date('2024-01-01'),
          dossierComplet: true
        }
      })

      formateurs.push(formateur)
    }

    console.log(`✅ ${formateurs.length} formateurs créés`)

    // ============================================
    // 5. CRÉATION DES SESSIONS
    // ============================================
    console.log('\n📅 Création des sessions...')

    const sessions = await Promise.all([
      prisma.session.create({
        data: {
          idFormation: formations[0].idFormation, // CAP_BJ
          nomSession: 'CAP Janvier 2024',
          dateDebut: new Date('2024-01-15'),
          dateFin: new Date('2024-07-15'),
          capaciteMax: 12,
          nbInscrits: 2,
          statutSession: 'EN_COURS',
          sallePrincipale: 'Atelier A',
          formateurPrincipalId: formateurs[0].idFormateur
        }
      }),
      prisma.session.create({
        data: {
          idFormation: formations[1].idFormation, // INIT_BJ
          nomSession: 'Initiation Février 2024',
          dateDebut: new Date('2024-02-01'),
          dateFin: new Date('2024-02-28'),
          capaciteMax: 8,
          nbInscrits: 1,
          statutSession: 'EN_COURS',
          sallePrincipale: 'Atelier B',
          formateurPrincipalId: formateurs[0].idFormateur
        }
      }),
      prisma.session.create({
        data: {
          idFormation: formations[2].idFormation, // PERF_SERTI
          nomSession: 'Perfectionnement Mars 2024',
          dateDebut: new Date('2024-03-01'),
          dateFin: new Date('2024-03-20'),
          capaciteMax: 6,
          nbInscrits: 1,
          statutSession: 'CONFIRMEE',
          sallePrincipale: 'Atelier C',
          formateurPrincipalId: formateurs[1].idFormateur
        }
      })
    ])

    console.log('✅ Sessions créées')

    // ============================================
    // 6. CRÉATION DES PROSPECTS
    // ============================================
    console.log('\n🎯 Création des prospects...')

    let prospectCount = 0
    for (const prospectData of prospectsData) {
      const ville = VILLES_IDF[Math.floor(Math.random() * VILLES_IDF.length)]
      const idProspect = `${prospectData.email.split('@')[0].replace('.', '')}_${prospectData.nom.substring(0, 3).toLowerCase()}${prospectData.prenom.substring(0, 3).toLowerCase()}`

      await prisma.prospect.create({
        data: {
          idProspect,
          emails: [prospectData.email],
          telephones: [prospectData.tel],
          nom: prospectData.nom,
          prenom: prospectData.prenom,
          dateNaissance: new Date(1985 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          adresse: `${Math.floor(Math.random() * 200) + 1} rue de la République`,
          codePostal: ville.cp,
          ville: ville.ville,
          formationPrincipale: prospectData.formation,
          modeFinancement: prospectData.financement,
          statutProspect: prospectData.statut,
          sourceOrigine: prospectData.source,
          nbEchanges: Math.floor(Math.random() * 5) + 1,
          datePremierContact: new Date(2024, 0, Math.floor(Math.random() * 30) + 1),
          dateDernierContact: new Date(2024, 1, Math.floor(Math.random() * 10) + 1)
        }
      })
      prospectCount++
    }

    console.log(`✅ ${prospectCount} prospects créés`)

    // ============================================
    // 7. CRÉATION DES CANDIDATS
    // ============================================
    console.log('\n📋 Création des candidats...')

    let candidatCount = 0
    for (const candidatData of candidatsData) {
      const ville = VILLES_IDF[Math.floor(Math.random() * VILLES_IDF.length)]
      const idProspect = `${candidatData.email.split('@')[0].replace('.', '')}_${candidatData.nom.substring(0, 3).toLowerCase()}${candidatData.prenom.substring(0, 3).toLowerCase()}`
      const numeroDossier = `${candidatData.nom.substring(0, 2).toUpperCase()}${candidatData.prenom.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 30 + 1).toString().padStart(2, '0')}0${Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0')}1990`

      // Créer le prospect avec statut CANDIDAT
      await prisma.prospect.create({
        data: {
          idProspect,
          emails: [candidatData.email],
          telephones: [candidatData.tel],
          nom: candidatData.nom,
          prenom: candidatData.prenom,
          dateNaissance: new Date(1985 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          adresse: `${Math.floor(Math.random() * 200) + 1} rue de la Paix`,
          codePostal: ville.cp,
          ville: ville.ville,
          formationPrincipale: candidatData.formation,
          modeFinancement: candidatData.financement,
          statutProspect: 'CANDIDAT',
          nbEchanges: Math.floor(Math.random() * 10) + 5,
          datePremierContact: new Date(2023, 11, Math.floor(Math.random() * 30) + 1),
          dateDernierContact: new Date(2024, 1, Math.floor(Math.random() * 10) + 1)
        }
      })

      // Créer le candidat
      await prisma.candidat.create({
        data: {
          idProspect,
          numeroDossier,
          formationsDemandees: [candidatData.formation],
          formationRetenue: candidatData.formation,
          modeFinancement: candidatData.financement,
          montantTotalFormation: candidatData.montant,
          montantPriseEnCharge: candidatData.montant * 0.8,
          resteACharge: candidatData.montant * 0.2,
          statutDossier: candidatData.statut_dossier,
          statutFinancement: candidatData.statut_financement,
          statutInscription: candidatData.statut_dossier === 'INSCRIT' ? 'VALIDEE' : 'EN_COURS',
          score: Math.floor(Math.random() * 40) + 60,
          notesIa: `Profil intéressant. ${candidatData.prenom} ${candidatData.nom} montre une forte motivation pour la formation ${candidatData.formation}. Expérience préalable dans l'artisanat. Financement ${candidatData.financement} en cours de validation.`,
          dateCandidature: new Date(2024, 0, Math.floor(Math.random() * 30) + 1)
        }
      })
      candidatCount++
    }

    console.log(`✅ ${candidatCount} candidats créés`)

    // ============================================
    // 8. CRÉATION DES ÉLÈVES
    // ============================================
    console.log('\n🎓 Création des élèves...')

    let eleveCount = 0
    for (const eleveData of elevesData) {
      const ville = VILLES_IDF[Math.floor(Math.random() * VILLES_IDF.length)]
      const idProspect = `${eleveData.email.split('@')[0].replace('.', '')}_${eleveData.nom.substring(0, 3).toLowerCase()}${eleveData.prenom.substring(0, 3).toLowerCase()}`
      const numeroDossier = `${eleveData.nom.substring(0, 2).toUpperCase()}${eleveData.prenom.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 30 + 1).toString().padStart(2, '0')}0${Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0')}1995`

      // Créer le prospect avec statut ELEVE
      await prisma.prospect.create({
        data: {
          idProspect,
          emails: [eleveData.email],
          telephones: [eleveData.tel],
          nom: eleveData.nom,
          prenom: eleveData.prenom,
          dateNaissance: new Date(1990 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          adresse: `${Math.floor(Math.random() * 200) + 1} avenue de la Liberté`,
          codePostal: ville.cp,
          ville: ville.ville,
          formationPrincipale: eleveData.formation,
          modeFinancement: FINANCEMENTS[Math.floor(Math.random() * FINANCEMENTS.length)],
          statutProspect: 'ELEVE',
          nbEchanges: Math.floor(Math.random() * 15) + 10,
          datePremierContact: new Date(2023, 9, Math.floor(Math.random() * 30) + 1),
          dateDernierContact: new Date(2024, 1, Math.floor(Math.random() * 10) + 1)
        }
      })

      // Créer le candidat inscrit
      const candidat = await prisma.candidat.create({
        data: {
          idProspect,
          numeroDossier,
          formationsDemandees: [eleveData.formation],
          formationRetenue: eleveData.formation,
          sessionVisee: eleveData.session,
          modeFinancement: FINANCEMENTS[Math.floor(Math.random() * FINANCEMENTS.length)],
          montantTotalFormation: Math.floor(Math.random() * 5000) + 3000,
          montantPriseEnCharge: Math.floor(Math.random() * 4000) + 2000,
          resteACharge: Math.floor(Math.random() * 1000) + 500,
          statutDossier: 'INSCRIT',
          statutFinancement: 'VALIDE',
          statutInscription: 'VALIDEE',
          score: Math.floor(Math.random() * 30) + 70,
          notesIa: `Excellent profil. ${eleveData.prenom} ${eleveData.nom} est très motivé(e) et a passé tous les tests avec succès. Formation ${eleveData.formation} parfaitement adaptée à son projet professionnel.`,
          dateCandidature: new Date(2023, 11, Math.floor(Math.random() * 30) + 1)
        }
      })

      // Créer l'utilisateur élève
      const userEleve = await prisma.utilisateur.create({
        data: {
          email: eleveData.email,
          motDePasseHash: passwordHash,
          nom: eleveData.nom,
          prenom: eleveData.prenom,
          role: 'eleve',
          statutCompte: 'ACTIF'
        }
      })

      // Créer l'élève
      await prisma.eleve.create({
        data: {
          idCandidat: candidat.idCandidat,
          idUtilisateur: userEleve.idUtilisateur,
          numeroDossier,
          formationSuivie: eleveData.formation,
          dateDebut: new Date(eleveData.date_debut),
          dateFinPrevue: new Date(2024, 6, 30),
          statutFormation: eleveData.statut,
          notesGenerales: `${eleveData.prenom} ${eleveData.nom} progresse bien dans la formation. Assiduité exemplaire, bon esprit d'équipe.`
        }
      })
      eleveCount++
    }

    console.log(`✅ ${eleveCount} élèves créés`)

    // ============================================
    // 9. CRÉATION DES DOCUMENTS FORMATEURS
    // ============================================
    console.log('\n📄 Création des documents formateurs...')

    let docCount = 0
    for (const formateur of formateurs) {
      // CV
      await prisma.documentFormateur.create({
        data: {
          idFormateur: formateur.idFormateur,
          codeTypeDocument: 'CV',
          libelle: `CV ${formateur.prenom} ${formateur.nom} 2024`,
          urlFichier: `/documents/formateurs/cv_${formateur.nom.toLowerCase()}_${formateur.prenom.toLowerCase()}.pdf`,
          nomFichier: `cv_${formateur.nom.toLowerCase()}_${formateur.prenom.toLowerCase()}.pdf`,
          dateDocument: new Date(2024, 0, 1),
          statut: 'VALIDE',
          validePar: adminUser.idUtilisateur,
          dateValidation: new Date(2024, 0, 5)
        }
      })
      docCount++

      // Diplôme
      await prisma.documentFormateur.create({
        data: {
          idFormateur: formateur.idFormateur,
          codeTypeDocument: 'DIPLOME',
          libelle: `Diplôme principal ${formateur.prenom} ${formateur.nom}`,
          urlFichier: `/documents/formateurs/diplome_${formateur.nom.toLowerCase()}.pdf`,
          nomFichier: `diplome_${formateur.nom.toLowerCase()}.pdf`,
          dateDocument: new Date(2000, 5, 15),
          statut: 'VALIDE',
          validePar: adminUser.idUtilisateur,
          dateValidation: new Date(2024, 0, 5)
        }
      })
      docCount++
    }

    console.log(`✅ ${docCount} documents formateurs créés`)

    // ============================================
    // 10. RÉSUMÉ FINAL
    // ============================================
    console.log('\n' + '=' .repeat(60))
    console.log('🎉 SEED TERMINÉ AVEC SUCCÈS !')
    console.log('=' .repeat(60))

    // Compter les éléments finaux
    const finalCounts = {
      prospects: await prisma.prospect.count({ where: { statutProspect: { notIn: ['CANDIDAT', 'ELEVE'] } } }),
      candidats: await prisma.candidat.count(),
      eleves: await prisma.eleve.count(),
      formateurs: await prisma.formateur.count(),
      utilisateurs: await prisma.utilisateur.count(),
      formations: await prisma.formation.count(),
      sessions: await prisma.session.count(),
      documentsFormateurs: await prisma.documentFormateur.count()
    }

    console.log('\n📊 RÉSUMÉ DES DONNÉES CRÉÉES:')
    console.log(`  ✅ ${finalCounts.prospects} prospects disponibles (hors CANDIDAT/ELEVE)`)
    console.log(`  ✅ ${finalCounts.candidats} candidats en cours`)
    console.log(`  ✅ ${finalCounts.eleves} élèves en formation`)
    console.log(`  ✅ ${finalCounts.formateurs} formateurs actifs`)
    console.log(`  ✅ ${finalCounts.utilisateurs} utilisateurs (admin + formateurs + élèves)`)
    console.log(`  ✅ ${finalCounts.formations} formations`)
    console.log(`  ✅ ${finalCounts.sessions} sessions`)
    console.log(`  ✅ ${finalCounts.documentsFormateurs} documents formateurs`)

    console.log('\n🔑 COMPTES DE TEST:')
    console.log('  Admin: admin@abj.fr / password123')
    console.log('  Formateur: philippe.dubois@abj-formation.fr / password123')
    console.log('  Élève: lea.blanc@gmail.com / password123')

  } catch (error) {
    console.error('\n❌ Erreur lors du seed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécution
seedDatabase()
  .catch((error) => {
    console.error('Erreur fatale:', error)
    process.exit(1)
  })