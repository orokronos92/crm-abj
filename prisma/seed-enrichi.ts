/**
 * Script de seed ENRICHI pour base de données CRM ABJ
 * Données cohérentes : 10 prospects, 10 candidats, 10 élèves, 5 formateurs
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seed ENRICHI de la base de données...\n')

  // Hash des mots de passe (même pour tous : ABJ2024!)
  const passwordHash = await bcrypt.hash('ABJ2024!', 10)

  // ============================================================
  // 1. RÉFÉRENTIELS : STATUTS ET TYPES DOCUMENTS
  // ============================================================
  console.log('📋 Création des référentiels...')

  const statutsDocuments = [
    { code: 'ATTENDU', libelle: 'En attente', couleur: '#FFA500', ordre: 1 },
    { code: 'RECU', libelle: 'Reçu', couleur: '#0080FF', ordre: 2 },
    { code: 'A_VALIDER', libelle: 'À valider', couleur: '#FFA500', ordre: 3 },
    { code: 'VALIDE', libelle: 'Validé', couleur: '#00C851', ordre: 4 },
    { code: 'REFUSE', libelle: 'Refusé', couleur: '#FF4444', ordre: 5 }
  ]

  for (const statut of statutsDocuments) {
    await prisma.statutDocument.upsert({
      where: { code: statut.code },
      update: {},
      create: statut
    })
  }

  const typesDocuments = [
    { code: 'CV', libelle: 'Curriculum Vitae', categorie: 'candidature', obligatoire: true, ordreAffichage: 1 },
    { code: 'LETTRE_MOTIVATION', libelle: 'Lettre de motivation', categorie: 'candidature', obligatoire: true, ordreAffichage: 2 },
    { code: 'CNI_RECTO', libelle: 'Carte identité (recto)', categorie: 'candidature', obligatoire: true, ordreAffichage: 3 },
    { code: 'CNI_VERSO', libelle: 'Carte identité (verso)', categorie: 'candidature', obligatoire: true, ordreAffichage: 4 },
    { code: 'PHOTO', libelle: 'Photo d\'identité', categorie: 'candidature', obligatoire: false, ordreAffichage: 5 },
    { code: 'DIPLOME', libelle: 'Diplômes', categorie: 'candidature', obligatoire: false, ordreAffichage: 6 },
    { code: 'DEVIS', libelle: 'Devis formation', categorie: 'financement', obligatoire: false, ordreAffichage: 7 },
    { code: 'CONTRAT', libelle: 'Contrat de formation', categorie: 'eleve', obligatoire: false, ordreAffichage: 8 }
  ]

  for (const typeDoc of typesDocuments) {
    await prisma.typeDocument.upsert({
      where: { code: typeDoc.code },
      update: {},
      create: typeDoc
    })
  }

  console.log('✅ Référentiels créés\n')

  // ============================================================
  // 2. FORMATIONS
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
      where: { codeFormation: 'PERF_SERTI' },
      update: {},
      create: {
        codeFormation: 'PERF_SERTI',
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
    }),
    prisma.formation.upsert({
      where: { codeFormation: 'CAO_DAO' },
      update: {},
      create: {
        codeFormation: 'CAO_DAO',
        nom: 'CAO/DAO Bijouterie (Rhino & MatrixGold)',
        categorie: 'PERFECTIONNEMENT',
        dureeJours: 15,
        dureeHeures: 105,
        niveauRequis: 'Bases informatiques',
        diplomeDelivre: 'Attestation CAO/DAO',
        tarifStandard: 2100,
        description: 'Conception assistée par ordinateur pour bijoutiers',
        prerequis: ['Connaissances de base en bijouterie', 'Maîtrise de Windows'],
        objectifs: [
          'Modéliser des bijoux en 3D',
          'Préparer des fichiers pour impression 3D',
          'Maîtriser Rhino et MatrixGold'
        ],
        actif: true
      }
    }),
    prisma.formation.upsert({
      where: { codeFormation: 'GEMMO' },
      update: {},
      create: {
        codeFormation: 'GEMMO',
        nom: 'Gemmologie Initiation',
        categorie: 'FORMATION_COURTE',
        dureeJours: 7,
        dureeHeures: 49,
        niveauRequis: 'Aucun',
        diplomeDelivre: 'Attestation Gemmologie',
        tarifStandard: 980,
        description: 'Reconnaissance et classification des pierres précieuses',
        prerequis: [],
        objectifs: [
          'Identifier les pierres précieuses',
          'Utiliser les outils de gemmologie',
          'Comprendre les critères de qualité'
        ],
        actif: true
      }
    })
  ])

  console.log(`✅ ${formations.length} formations créées\n`)

  // ============================================================
  // 3. UTILISATEURS (1 admin + 5 formateurs + 10 élèves)
  // ============================================================
  console.log('👤 Création des utilisateurs...')

  // Admin
  const admin = await prisma.utilisateur.upsert({
    where: { email: 'admin@abj.fr' },
    update: {},
    create: {
      email: 'admin@abj.fr',
      motDePasseHash: passwordHash,
      nom: 'Administrateur',
      prenom: 'Système',
      role: 'admin',
      statutCompte: 'ACTIF'
    }
  })

  // 5 Formateurs
  const formateursData = [
    { email: 'laurent.dubois@abj.fr', nom: 'Dubois', prenom: 'Laurent', specialites: ['Bijouterie', 'Sertissage'], tarif: 450 },
    { email: 'marie.petit@abj.fr', nom: 'Petit', prenom: 'Marie', specialites: ['CAO/DAO', 'Joaillerie'], tarif: 520 },
    { email: 'thomas.bernard@abj.fr', nom: 'Bernard', prenom: 'Thomas', specialites: ['Sertissage', 'Polissage'], tarif: 380 },
    { email: 'claire.martin@abj.fr', nom: 'Martin', prenom: 'Claire', specialites: ['Gemmologie', 'Expertise'], tarif: 550 },
    { email: 'julien.rousseau@abj.fr', nom: 'Rousseau', prenom: 'Julien', specialites: ['Bijouterie', 'Design'], tarif: 420 }
  ]

  const utilisateursFormateurs = []
  for (const data of formateursData) {
    const user = await prisma.utilisateur.upsert({
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
    utilisateursFormateurs.push({ ...user, ...data })
  }

  // 10 Élèves
  const elevesData = [
    { email: 'sophie.durand@email.fr', nom: 'Durand', prenom: 'Sophie' },
    { email: 'maxime.barbier@email.fr', nom: 'Barbier', prenom: 'Maxime' },
    { email: 'chloe.fontaine@email.fr', nom: 'Fontaine', prenom: 'Chloé' },
    { email: 'lucas.lambert@email.fr', nom: 'Lambert', prenom: 'Lucas' },
    { email: 'emma.garcia@email.fr', nom: 'Garcia', prenom: 'Emma' },
    { email: 'theo.martinez@email.fr', nom: 'Martinez', prenom: 'Théo' },
    { email: 'lea.moreau@email.fr', nom: 'Moreau', prenom: 'Léa' },
    { email: 'hugo.simon@email.fr', nom: 'Simon', prenom: 'Hugo' },
    { email: 'alice.roux@email.fr', nom: 'Roux', prenom: 'Alice' },
    { email: 'noah.girard@email.fr', nom: 'Girard', prenom: 'Noah' }
  ]

  const utilisateursEleves = []
  for (const data of elevesData) {
    const user = await prisma.utilisateur.upsert({
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
    utilisateursEleves.push({ ...user, ...data })
  }

  console.log(`✅ ${1 + utilisateursFormateurs.length + utilisateursEleves.length} utilisateurs créés\n`)

  // ============================================================
  // 4. FORMATEURS (table dédiée)
  // ============================================================
  console.log('👨‍🏫 Création des formateurs...')

  const formateurs = []
  for (const data of utilisateursFormateurs) {
    const formateur = await prisma.formateur.upsert({
      where: { idUtilisateur: data.idUtilisateur },
      update: {},
      create: {
        idUtilisateur: data.idUtilisateur,
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: `06${Math.floor(10000000 + Math.random() * 90000000)}`,
        specialites: data.specialites,
        formationsEnseignees: [],
        tarifJournalier: data.tarif,
        statut: 'ACTIF'
      }
    })
    formateurs.push(formateur)
  }

  console.log(`✅ ${formateurs.length} formateurs créés\n`)

  // ============================================================
  // 5. SESSIONS
  // ============================================================
  console.log('📅 Création des sessions...')

  const sessions = []

  // Session 1 : CAP BJ en cours (6 élèves)
  const session1 = await prisma.session.create({
    data: {
      idFormation: formations[0].idFormation,
      nomSession: 'CAP BJ — Session Mars 2025',
      dateDebut: new Date('2025-03-01'),
      dateFin: new Date('2025-09-30'),
      capaciteMax: 12,
      nbInscrits: 0,
      statutSession: 'EN_COURS',
      sallePrincipale: 'Atelier A',
      formateurPrincipalId: formateurs[0].idFormateur
    }
  })
  sessions.push(session1)

  // Session 2 : Initiation BJ en cours (2 élèves)
  const session2 = await prisma.session.create({
    data: {
      idFormation: formations[1].idFormation,
      nomSession: 'Initiation BJ — Février 2025',
      dateDebut: new Date('2025-02-10'),
      dateFin: new Date('2025-02-14'),
      capaciteMax: 8,
      nbInscrits: 0,
      statutSession: 'EN_COURS',
      sallePrincipale: 'Atelier B',
      formateurPrincipalId: formateurs[4].idFormateur
    }
  })
  sessions.push(session2)

  // Session 3 : Perfectionnement Sertissage prévue (2 élèves)
  const session3 = await prisma.session.create({
    data: {
      idFormation: formations[2].idFormation,
      nomSession: 'Perfectionnement Sertissage — Avril 2025',
      dateDebut: new Date('2025-04-07'),
      dateFin: new Date('2025-04-18'),
      capaciteMax: 6,
      nbInscrits: 0,
      statutSession: 'CONFIRMEE',
      sallePrincipale: 'Atelier C',
      formateurPrincipalId: formateurs[2].idFormateur
    }
  })
  sessions.push(session3)

  // Session 4 : CAO/DAO prévue (0 élève, places dispo)
  const session4 = await prisma.session.create({
    data: {
      idFormation: formations[3].idFormation,
      nomSession: 'CAO/DAO — Mai 2025',
      dateDebut: new Date('2025-05-12'),
      dateFin: new Date('2025-05-30'),
      capaciteMax: 8,
      nbInscrits: 0,
      statutSession: 'PREVUE',
      sallePrincipale: 'Salle informatique',
      formateurPrincipalId: formateurs[1].idFormateur
    }
  })
  sessions.push(session4)

  // Session 5 : Gemmologie terminée (historique)
  const session5 = await prisma.session.create({
    data: {
      idFormation: formations[4].idFormation,
      nomSession: 'Gemmologie — Janvier 2025',
      dateDebut: new Date('2025-01-13'),
      dateFin: new Date('2025-01-19'),
      capaciteMax: 10,
      nbInscrits: 0,
      statutSession: 'TERMINEE',
      sallePrincipale: 'Atelier B',
      formateurPrincipalId: formateurs[3].idFormateur
    }
  })
  sessions.push(session5)

  console.log(`✅ ${sessions.length} sessions créées\n`)

  // ============================================================
  // 6. PROSPECTS (15 au total : 10 deviendront candidats, 5 restent prospects)
  // ============================================================
  console.log('👥 Création des prospects...')

  const prospects = []

  // 10 prospects qui deviendront candidats puis élèves
  const prospectsCandidats = [
    { id: 'PROS_DUR_SOP_001', nom: 'Durand', prenom: 'Sophie', email: 'sophie.durand@email.fr', tel: '0612345678', formation: 'CAP_BJ', financement: 'CPF', statut: 'CANDIDAT' },
    { id: 'PROS_BAR_MAX_002', nom: 'Barbier', prenom: 'Maxime', email: 'maxime.barbier@email.fr', tel: '0623456789', formation: 'CAP_BJ', financement: 'OPCO', statut: 'CANDIDAT' },
    { id: 'PROS_FON_CHL_003', nom: 'Fontaine', prenom: 'Chloé', email: 'chloe.fontaine@email.fr', tel: '0634567890', formation: 'CAP_BJ', financement: 'CPF', statut: 'CANDIDAT' },
    { id: 'PROS_LAM_LUC_004', nom: 'Lambert', prenom: 'Lucas', email: 'lucas.lambert@email.fr', tel: '0645678901', formation: 'CAP_BJ', financement: 'France Travail', statut: 'CANDIDAT' },
    { id: 'PROS_GAR_EMM_005', nom: 'Garcia', prenom: 'Emma', email: 'emma.garcia@email.fr', tel: '0656789012', formation: 'CAP_BJ', financement: 'Personnel', statut: 'CANDIDAT' },
    { id: 'PROS_MAR_THE_006', nom: 'Martinez', prenom: 'Théo', email: 'theo.martinez@email.fr', tel: '0667890123', formation: 'CAP_BJ', financement: 'OPCO', statut: 'CANDIDAT' },
    { id: 'PROS_MOR_LEA_007', nom: 'Moreau', prenom: 'Léa', email: 'lea.moreau@email.fr', tel: '0678901234', formation: 'INIT_BJ', financement: 'Personnel', statut: 'CANDIDAT' },
    { id: 'PROS_SIM_HUG_008', nom: 'Simon', prenom: 'Hugo', email: 'hugo.simon@email.fr', tel: '0689012345', formation: 'INIT_BJ', financement: 'CPF', statut: 'CANDIDAT' },
    { id: 'PROS_ROU_ALI_009', nom: 'Roux', prenom: 'Alice', email: 'alice.roux@email.fr', tel: '0690123456', formation: 'PERF_SERTI', financement: 'OPCO', statut: 'CANDIDAT' },
    { id: 'PROS_GIR_NOA_010', nom: 'Girard', prenom: 'Noah', email: 'noah.girard@email.fr', tel: '0601234567', formation: 'PERF_SERTI', financement: 'Personnel', statut: 'CANDIDAT' }
  ]

  for (const data of prospectsCandidats) {
    // Dates cohérentes
    const datePremier = new Date(2024, 10, 1 + prospects.length)
    const dateDernier = new Date(2025, 1, 1 + prospects.length)
    // Calculer nbEchanges basé sur la différence de dates
    const nbJours = Math.floor((dateDernier.getTime() - datePremier.getTime()) / (1000 * 60 * 60 * 24))
    const nbEchanges = Math.max(1, Math.floor(nbJours / 15)) // 1 échange tous les 15 jours minimum

    const prospect: any = await prisma.prospect.upsert({
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
        statutProspect: data.statut,
        sourceOrigine: 'Site web',
        datePremierContact: datePremier,
        dateDernierContact: dateDernier,
        nbEchanges: nbEchanges
      }
    })
    prospects.push(prospect)
  }

  // 5 prospects purs (sans candidature)
  const prospectsPurs = [
    { id: 'PROS_DUP_JEA_011', nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@email.fr', tel: '0612340011', formation: 'CAP_BJ', statut: 'NOUVEAU' },
    { id: 'PROS_LER_MAR_012', nom: 'Leroy', prenom: 'Marie', email: 'marie.leroy@email.fr', tel: '0623450012', formation: 'INIT_BJ', statut: 'EN_ATTENTE_DOSSIER' },
    { id: 'PROS_BOU_PIE_013', nom: 'Boucher', prenom: 'Pierre', email: 'pierre.boucher@email.fr', tel: '0634560013', formation: 'CAO_DAO', statut: 'NOUVEAU' },
    { id: 'PROS_LAF_ANN_014', nom: 'Lafont', prenom: 'Anne', email: 'anne.lafont@email.fr', tel: '0645670014', formation: 'GEMMO', statut: 'NOUVEAU' },
    { id: 'PROS_RIC_LOU_015', nom: 'Richard', prenom: 'Louis', email: 'louis.richard@email.fr', tel: '0656780015', formation: 'PERF_SERTI', statut: 'NOUVEAU' }
  ]

  for (const data of prospectsPurs) {
    // Dates cohérentes
    const datePremier = new Date(2025, 1, 1 + prospects.length)
    const dateDernier = new Date(2025, 1, 5 + prospects.length)
    // Calculer nbEchanges basé sur la différence de dates
    const nbJours = Math.floor((dateDernier.getTime() - datePremier.getTime()) / (1000 * 60 * 60 * 24))
    const nbEchanges = Math.max(1, Math.ceil(nbJours / 2)) // 1 échange tous les 2 jours pour prospects récents

    const prospect: any = await prisma.prospect.upsert({
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
        statutProspect: data.statut,
        sourceOrigine: 'Formulaire contact',
        datePremierContact: datePremier,
        dateDernierContact: dateDernier,
        nbEchanges: nbEchanges
      }
    })
    prospects.push(prospect)
  }

  console.log(`✅ ${prospects.length} prospects créés\n`)

  // ============================================================
  // 7. CANDIDATS (10 candidats liés aux 10 premiers prospects)
  // ============================================================
  console.log('📝 Création des candidats...')

  const candidatsData = [
    { prospect: prospects[0], formation: 'CAP_BJ', statut: 'INSCRIT', financement: 'EN_COURS', montant: 8500, pec: 8000, score: 85, parcours: { tel: true, rdv: true, test: true, valide: true } },
    { prospect: prospects[1], formation: 'CAP_BJ', statut: 'ACCEPTE', financement: 'VALIDE', montant: 8500, pec: 7500, score: 78, parcours: { tel: true, rdv: true, test: true, valide: true } },
    { prospect: prospects[2], formation: 'CAP_BJ', statut: 'INSCRIT', financement: 'EN_COURS', montant: 8500, pec: 8500, score: 92, parcours: { tel: true, rdv: true, test: true, valide: true } },
    { prospect: prospects[3], formation: 'CAP_BJ', statut: 'ACCEPTE', financement: 'VALIDE', montant: 8500, pec: 8500, score: 68, parcours: { tel: true, rdv: true, test: false, valide: true } },
    { prospect: prospects[4], formation: 'CAP_BJ', statut: 'INSCRIT', financement: 'EN_COURS', montant: 8500, pec: 0, score: 74, parcours: { tel: true, rdv: true, test: true, valide: true } },
    { prospect: prospects[5], formation: 'CAP_BJ', statut: 'INSCRIT', financement: 'VALIDE', montant: 8500, pec: 6800, score: 81, parcours: { tel: true, rdv: true, test: true, valide: true } },
    { prospect: prospects[6], formation: 'INIT_BJ', statut: 'INSCRIT', financement: 'VALIDE', montant: 750, pec: 0, score: 55, parcours: { tel: true, rdv: false, test: false, valide: true } },
    { prospect: prospects[7], formation: 'INIT_BJ', statut: 'INSCRIT', financement: 'EN_COURS', montant: 750, pec: 750, score: 62, parcours: { tel: true, rdv: true, test: false, valide: true } },
    { prospect: prospects[8], formation: 'PERF_SERTI', statut: 'ACCEPTE', financement: 'VALIDE', montant: 1500, pec: 1500, score: 88, parcours: { tel: true, rdv: true, test: true, valide: true } },
    { prospect: prospects[9], formation: 'PERF_SERTI', statut: 'ACCEPTE', financement: 'VALIDE', montant: 1500, pec: 1200, score: 72, parcours: { tel: true, rdv: true, test: true, valide: true } }
  ]

  const candidats = []
  for (let i = 0; i < candidatsData.length; i++) {
    const data = candidatsData[i]
    const numeroDossier = `${data.prospect.nom.substring(0, 2).toUpperCase()}${data.prospect.prenom.substring(0, 2).toUpperCase()}${String(i + 1).padStart(8, '0')}`

    const candidat = await prisma.candidat.create({
      data: {
        idProspect: data.prospect.idProspect,
        numeroDossier: numeroDossier,
        formationsDemandees: [data.formation],
        formationRetenue: data.formation,
        modeFinancement: prospectsCandidats[i].financement,
        montantTotalFormation: data.montant,
        montantPriseEnCharge: data.pec,
        resteACharge: data.montant - data.pec,
        statutDossier: data.statut,
        statutFinancement: data.financement,
        statutInscription: data.statut === 'INSCRIT' ? 'VALIDEE' : 'EN_COURS',
        score: data.score,
        notesIa: `Profil motivé. ${data.score >= 80 ? 'Excellent potentiel' : data.score >= 70 ? 'Bon profil' : 'Profil correct'}. Formation ${data.formation} adaptée au projet professionnel.`,
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

    // Mettre à jour le prospect avec le numéro de dossier
    await prisma.prospect.update({
      where: { idProspect: data.prospect.idProspect },
      data: {
        numeroDossier: numeroDossier,
        statutDossier: data.statut
      }
    })
  }

  console.log(`✅ ${candidats.length} candidats créés\n`)

  // ============================================================
  // 8. DOCUMENTS CANDIDATS (4 par candidat minimum)
  // ============================================================
  console.log('📄 Création des documents...')

  let totalDocuments = 0
  for (const candidat of candidats) {
    const docs = [
      { type: 'CV', statut: 'VALIDE', nom: `CV_${candidat.numeroDossier}.pdf` },
      { type: 'LETTRE_MOTIVATION', statut: 'VALIDE', nom: `LM_${candidat.numeroDossier}.pdf` },
      { type: 'CNI_RECTO', statut: candidat.statutDossier === 'INSCRIT' ? 'VALIDE' : 'RECU', nom: `CNI_R_${candidat.numeroDossier}.jpg` },
      { type: 'CNI_VERSO', statut: candidat.statutDossier === 'INSCRIT' ? 'VALIDE' : 'RECU', nom: `CNI_V_${candidat.numeroDossier}.jpg` }
    ]

    for (const doc of docs) {
      await prisma.documentCandidat.create({
        data: {
          idProspect: candidat.idProspect,
          numeroDossier: candidat.numeroDossier,
          typeDocument: doc.type,
          categorie: 'candidature',
          nomFichier: doc.nom,
          urlDrive: `https://drive.google.com/file/d/FAKE_${candidat.numeroDossier}_${doc.type}`,
          statut: doc.statut,
          obligatoire: true,
          dateReception: new Date(2025, 0, 5),
          dateValidation: doc.statut === 'VALIDE' ? new Date(2025, 0, 10) : null
        }
      })
      totalDocuments++
    }
  }

  console.log(`✅ ${totalDocuments} documents créés\n`)

  // ============================================================
  // 9. ÉLÈVES (10 élèves liés aux 10 candidats)
  // ============================================================
  console.log('🎓 Création des élèves...')

  const elevesCreated = []
  for (let i = 0; i < candidats.length; i++) {
    const candidat = candidats[i]
    const utilisateur = utilisateursEleves[i]

    const eleve = await prisma.eleve.create({
      data: {
        idCandidat: candidat.idCandidat,
        idUtilisateur: utilisateur.idUtilisateur,
        numeroDossier: candidat.numeroDossier,
        formationSuivie: candidat.formationRetenue || 'CAP_BJ',
        dateDebut: i < 6 ? new Date('2025-03-01') : i < 8 ? new Date('2025-02-10') : new Date('2025-04-07'),
        dateFinPrevue: i < 6 ? new Date('2025-09-30') : i < 8 ? new Date('2025-02-14') : new Date('2025-04-18'),
        statutFormation: 'EN_COURS',
        notesGenerales: `Élève ${i < 2 ? 'assidu et motivé' : i < 5 ? 'sérieux' : 'en progression'}`
      }
    })
    elevesCreated.push(eleve)
  }

  console.log(`✅ ${elevesCreated.length} élèves créés\n`)

  // ============================================================
  // 10. INSCRIPTIONS SESSIONS (lier élèves aux sessions)
  // ============================================================
  console.log('📋 Création des inscriptions sessions...')

  // Session 1 (CAP BJ) : 6 premiers élèves
  for (let i = 0; i < 6; i++) {
    await prisma.inscriptionSession.create({
      data: {
        idEleve: elevesCreated[i].idEleve,
        idSession: sessions[0].idSession,
        dateInscription: new Date('2025-02-15'),
        statutInscription: 'CONFIRME',
        dateConfirmation: new Date('2025-02-20')
      }
    })
  }

  // Session 2 (Initiation) : 2 élèves (index 6-7)
  for (let i = 6; i < 8; i++) {
    await prisma.inscriptionSession.create({
      data: {
        idEleve: elevesCreated[i].idEleve,
        idSession: sessions[1].idSession,
        dateInscription: new Date('2025-02-01'),
        statutInscription: 'CONFIRME',
        dateConfirmation: new Date('2025-02-05')
      }
    })
  }

  // Session 3 (Perfectionnement) : 2 élèves (index 8-9)
  for (let i = 8; i < 10; i++) {
    await prisma.inscriptionSession.create({
      data: {
        idEleve: elevesCreated[i].idEleve,
        idSession: sessions[2].idSession,
        dateInscription: new Date('2025-03-20'),
        statutInscription: 'INSCRIT',
        dateConfirmation: null
      }
    })
  }

  // Mettre à jour nbInscrits des sessions
  await prisma.session.update({ where: { idSession: sessions[0].idSession }, data: { nbInscrits: 6 } })
  await prisma.session.update({ where: { idSession: sessions[1].idSession }, data: { nbInscrits: 2 } })
  await prisma.session.update({ where: { idSession: sessions[2].idSession }, data: { nbInscrits: 2 } })

  console.log(`✅ 10 inscriptions sessions créées\n`)

  // ============================================================
  // 11. ÉVALUATIONS (2-3 par élève = ~25 évaluations)
  // ============================================================
  console.log('📊 Création des évaluations...')

  const evaluations = []
  const notes = [8.5, 12, 15.5, 9, 16, 14, 11.5, 13, 17, 10.5, 18, 12.5, 15, 14.5, 16.5, 11, 13.5, 9.5, 17.5, 12, 14, 16, 13, 15.5, 18.5]

  let noteIndex = 0
  for (let i = 0; i < elevesCreated.length; i++) {
    const eleve = elevesCreated[i]
    const sessionId = i < 6 ? sessions[0].idSession : i < 8 ? sessions[1].idSession : sessions[2].idSession
    const formateurId = i < 6 ? formateurs[0].idFormateur : i < 8 ? formateurs[4].idFormateur : formateurs[2].idFormateur

    // 2-3 évaluations par élève
    const nbEval = i % 3 === 0 ? 3 : 2
    for (let j = 0; j < nbEval; j++) {
      const note = notes[noteIndex % notes.length]
      noteIndex++

      const evaluation = await prisma.evaluation.create({
        data: {
          idEleve: eleve.idEleve,
          idSession: sessionId,
          idFormateur: formateurId,
          typeEvaluation: j === 0 ? 'CONTROLE_CONTINU' : j === 1 ? 'CONTROLE_CONTINU' : 'EXAMEN_BLANC',
          dateEvaluation: new Date(2025, 1, 5 + i * 2 + j * 3),
          note: note,
          noteSur: 20,
          appreciation: note >= 16 ? 'Excellent travail' : note >= 14 ? 'Très bien' : note >= 12 ? 'Bien' : note >= 10 ? 'Assez bien' : 'Doit progresser',
          competencesValidees: note >= 10 ? ['Maîtrise technique', 'Précision'] : ['Effort'],
          commentaire: `Note du ${new Date(2025, 1, 5 + i * 2 + j * 3).toLocaleDateString('fr-FR')}`,
          valideParAdmin: true,
          dateValidation: new Date(2025, 1, 10 + i * 2 + j * 3)
        }
      })
      evaluations.push(evaluation)
    }
  }

  console.log(`✅ ${evaluations.length} évaluations créées\n`)

  // ============================================================
  // 12. PRÉSENCES (~60-80 présences)
  // ============================================================
  console.log('✅ Création des présences...')

  let totalPresences = 0
  for (let i = 0; i < elevesCreated.length; i++) {
    const eleve = elevesCreated[i]
    const sessionId = i < 6 ? sessions[0].idSession : i < 8 ? sessions[1].idSession : sessions[2].idSession

    // Générer 6-8 présences par élève (différentes dates)
    const nbPresences = 6 + (i % 3)
    for (let j = 0; j < nbPresences; j++) {
      const statutAleatoire = Math.random()
      const statut = statutAleatoire > 0.85 ? 'ABSENT' : statutAleatoire > 0.75 ? 'RETARD' : 'PRESENT'

      await prisma.presence.create({
        data: {
          idEleve: eleve.idEleve,
          idSession: sessionId,
          dateCours: new Date(2025, 1, 10 + j * 2),
          demiJournee: j % 2 === 0 ? 'MATIN' : 'APRES_MIDI',
          statutPresence: statut,
          justificatifFourni: statut === 'ABSENT' ? Math.random() > 0.5 : false,
          saisiPar: 'Formateur'
        }
      })
      totalPresences++
    }
  }

  console.log(`✅ ${totalPresences} présences créées\n`)

  // ============================================================
  // 13. INTERVENTIONS FORMATEURS (~15-20)
  // ============================================================
  console.log('👨‍🏫 Création des interventions formateurs...')

  const interventions = []
  for (let i = 0; i < formateurs.length; i++) {
    const formateur = formateurs[i]
    const nbInterventions = 3 + (i % 2)

    for (let j = 0; j < nbInterventions; j++) {
      const intervention = await prisma.interventionFormateur.create({
        data: {
          idFormateur: formateur.idFormateur,
          idSession: sessions[i % sessions.length].idSession,
          dateIntervention: new Date(2025, 1, 5 + i * 3 + j * 2),
          dureeHeures: 7,
          sujet: `Cours ${j + 1} - ${formateur.specialites[0]}`,
          cout: formateur.tarifJournalier,
          facturePayee: j === 0,
          datePaiement: j === 0 ? new Date(2025, 2, 1) : null
        }
      })
      interventions.push(intervention)
    }
  }

  console.log(`✅ ${interventions.length} interventions créées\n`)

  // ============================================================
  // 14. DISPONIBILITÉS FORMATEURS (~10-15)
  // ============================================================
  console.log('📅 Création des disponibilités formateurs...')

  const disponibilites = []
  for (let i = 0; i < formateurs.length; i++) {
    const formateur = formateurs[i]

    // 2-3 disponibilités futures par formateur
    const nbDispo = 2 + (i % 2)
    for (let j = 0; j < nbDispo; j++) {
      const dispo = await prisma.disponibiliteFormateur.create({
        data: {
          idFormateur: formateur.idFormateur,
          dateDebut: new Date(2025, 3 + j, 1 + i * 5),
          dateFin: new Date(2025, 3 + j, 5 + i * 5),
          typeDisponibilite: j === 0 ? 'CONFIRME' : 'DISPONIBLE',
          formationConcernee: formateur.specialites[0]
        }
      })
      disponibilites.push(dispo)
    }
  }

  console.log(`✅ ${disponibilites.length} disponibilités créées\n`)

  // ============================================================
  // 15. HISTORIQUE EMAILS (~20-30)
  // ============================================================
  console.log('📧 Création de l\'historique emails...')

  const emails = []
  for (let i = 0; i < 20; i++) {
    const prospect = prospects[i % prospects.length]
    const sens = i % 3 === 0 ? 'sortant' : 'entrant'

    const email = await prisma.historiqueEmail.create({
      data: {
        idEmail: `EMAIL_${String(i + 1).padStart(6, '0')}`,
        idProspect: prospect.idProspect,
        sens: sens,
        emailExpediteur: sens === 'entrant' ? prospect.emails[0] : 'contact@abj.fr',
        emailDestinataire: sens === 'sortant' ? prospect.emails[0] : 'contact@abj.fr',
        objet: sens === 'entrant' ? `Demande information ${prospect.formationPrincipale}` : `Réponse formation ${prospect.formationPrincipale}`,
        contenu: sens === 'entrant' ? 'Bonjour, je souhaite des informations sur vos formations...' : 'Bonjour, nous vous remercions de votre intérêt...',
        statut: 'TRAITE',
        reponseEnvoyee: sens === 'entrant',
        dateReponse: sens === 'entrant' ? new Date(2025, 1, 1 + i) : null,
        intentionDetectee: 'Demande information',
        formationDetectee: prospect.formationPrincipale
      }
    })
    emails.push(email)
  }

  console.log(`✅ ${emails.length} emails créés\n`)

  // ============================================================
  // 16. HISTORIQUE MARJORIE CRM (~10-15)
  // ============================================================
  console.log('💬 Création de l\'historique Marjorie CRM...')

  const messagesMarjorie = []

  // Messages admin
  for (let i = 0; i < 5; i++) {
    const msg = await prisma.historiqueMarjorieCrm.create({
      data: {
        idUtilisateur: admin.idUtilisateur,
        roleUtilisateur: 'admin',
        messageUtilisateur: `Combien de candidats en attente validation ?`,
        reponseMarjorie: `Il y a actuellement ${candidats.filter(c => c.statutDossier === 'ACCEPTE').length} candidats en attente de validation.`,
        contexte: { page: 'dashboard' },
        dureeReponseMs: 250 + i * 50
      }
    })
    messagesMarjorie.push(msg)
  }

  // Messages formateurs
  for (let i = 0; i < 3; i++) {
    const formateur = utilisateursFormateurs[i % utilisateursFormateurs.length]
    const msg = await prisma.historiqueMarjorieCrm.create({
      data: {
        idUtilisateur: formateur.idUtilisateur,
        roleUtilisateur: 'professeur',
        messageUtilisateur: `Qui sont mes élèves cette semaine ?`,
        reponseMarjorie: `Vous avez ${elevesCreated.slice(0, 6).length} élèves cette semaine pour la session CAP BJ.`,
        contexte: { page: 'mes-eleves' },
        dureeReponseMs: 320 + i * 40
      }
    })
    messagesMarjorie.push(msg)
  }

  // Messages élèves
  for (let i = 0; i < 3; i++) {
    const eleve = utilisateursEleves[i]
    const msg = await prisma.historiqueMarjorieCrm.create({
      data: {
        idUtilisateur: eleve.idUtilisateur,
        roleUtilisateur: 'eleve',
        messageUtilisateur: `Quelle est ma moyenne actuelle ?`,
        reponseMarjorie: `Ta moyenne actuelle est de ${(12 + i * 2).toFixed(1)}/20. Continue comme ça !`,
        contexte: { page: 'mes-notes' },
        dureeReponseMs: 180 + i * 30
      }
    })
    messagesMarjorie.push(msg)
  }

  console.log(`✅ ${messagesMarjorie.length} messages Marjorie créés\n`)

  // ============================================================
  // RÉCAPITULATIF FINAL
  // ============================================================
  console.log('\n🎉 SEED ENRICHI TERMINÉ !\n')
  console.log('═══════════════════════════════════════════════════')
  console.log('📊 RÉCAPITULATIF DES DONNÉES CRÉÉES')
  console.log('═══════════════════════════════════════════════════')
  console.log(`📋 Référentiels`)
  console.log(`   - Statuts documents : ${statutsDocuments.length}`)
  console.log(`   - Types documents : ${typesDocuments.length}`)
  console.log(`\n📚 Formations : ${formations.length}`)
  console.log(`\n👤 Utilisateurs : ${1 + utilisateursFormateurs.length + utilisateursEleves.length}`)
  console.log(`   - Admin : 1`)
  console.log(`   - Formateurs : ${utilisateursFormateurs.length}`)
  console.log(`   - Élèves : ${utilisateursEleves.length}`)
  console.log(`\n👨‍🏫 Formateurs (table dédiée) : ${formateurs.length}`)
  console.log(`\n📅 Sessions : ${sessions.length}`)
  console.log(`\n👥 Prospects : ${prospects.length}`)
  console.log(`   - Deviennent candidats : 10`)
  console.log(`   - Restent prospects : 5`)
  console.log(`\n📝 Candidats : ${candidats.length}`)
  console.log(`\n📄 Documents : ${totalDocuments}`)
  console.log(`\n🎓 Élèves : ${elevesCreated.length}`)
  console.log(`\n📋 Inscriptions sessions : 10`)
  console.log(`\n📊 Évaluations : ${evaluations.length}`)
  console.log(`\n✅ Présences : ${totalPresences}`)
  console.log(`\n👨‍🏫 Interventions formateurs : ${interventions.length}`)
  console.log(`\n📅 Disponibilités formateurs : ${disponibilites.length}`)
  console.log(`\n📧 Historique emails : ${emails.length}`)
  console.log(`\n💬 Historique Marjorie CRM : ${messagesMarjorie.length}`)
  console.log('═══════════════════════════════════════════════════')
  console.log(`\n✅ TOTAL : ~${
    statutsDocuments.length +
    typesDocuments.length +
    formations.length +
    (1 + utilisateursFormateurs.length + utilisateursEleves.length) +
    formateurs.length +
    sessions.length +
    prospects.length +
    candidats.length +
    totalDocuments +
    elevesCreated.length +
    10 +
    evaluations.length +
    totalPresences +
    interventions.length +
    disponibilites.length +
    emails.length +
    messagesMarjorie.length
  } entrées créées en BDD`)
  console.log('\n📝 Comptes de test :')
  console.log('   Admin : admin@abj.fr / ABJ2024!')
  console.log('   Formateur 1 : laurent.dubois@abj.fr / ABJ2024!')
  console.log('   Élève 1 : sophie.durand@email.fr / ABJ2024!')
  console.log('\n🚀 Prêt pour les tests des interfaces !\n')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
