/**
 * Seed référentiel CRM ABJ
 *
 * Recrée toutes les tables de configuration/valeurs via upsert.
 * Ne touche PAS aux données métier : prospects, candidats, élèves, formateurs, sessions.
 *
 * Tables concernées :
 *  - StatutDocument       (référentiel statuts documents candidats)
 *  - TypeDocument         (référentiel types documents candidats)
 *  - TypeDocumentFormateur (référentiel types documents Qualiopi formateurs)
 *  - Formation            (catalogue réel ABJ 2025-2026)
 *  - DocumentRequis       (documents requis par formation)
 *  - Salle                (salles de l'école)
 *
 * Données formations : catalogue officiel ABJ 2025-2026
 */

import prisma from '../src/lib/prisma'

async function seedReferentiel() {
  console.log('🚀 Seed référentiel CRM ABJ — catalogue 2025-2026')
  console.log('ℹ️  Mode upsert — les données existantes sont mises à jour, rien n\'est supprimé\n')

  // ============================================================
  // 1. STATUTS DOCUMENTS
  // ============================================================
  console.log('📋 Statuts documents...')

  const statutsDocuments = [
    { code: 'ATTENDU',    libelle: 'Attendu',          description: 'Document demandé, pas encore reçu',     couleur: '#6B7280', ordre: 1, actionRequise: 'RELANCER' },
    { code: 'RECU',       libelle: 'Reçu',              description: 'Document reçu, en attente de validation', couleur: '#3B82F6', ordre: 2, actionRequise: 'VALIDER' },
    { code: 'A_VALIDER',  libelle: 'À valider',         description: 'En cours de vérification',              couleur: '#F59E0B', ordre: 3, actionRequise: 'VALIDER' },
    { code: 'VALIDE',     libelle: 'Validé',            description: 'Document accepté et conforme',          couleur: '#10B981', ordre: 4, actionRequise: null },
    { code: 'REFUSE',     libelle: 'Refusé',            description: 'Document refusé, à renvoyer',           couleur: '#EF4444', ordre: 5, actionRequise: 'RENVOYER' },
    { code: 'EXPIRE',     libelle: 'Expiré',            description: 'Document périmé, renouvellement requis', couleur: '#F97316', ordre: 6, actionRequise: 'RENOUVELER' },
  ]

  for (const s of statutsDocuments) {
    await prisma.statutDocument.upsert({
      where: { code: s.code },
      create: { code: s.code, libelle: s.libelle, description: s.description, couleur: s.couleur, ordre: s.ordre, actionRequise: s.actionRequise },
      update: { libelle: s.libelle, description: s.description, couleur: s.couleur, ordre: s.ordre, actionRequise: s.actionRequise },
    })
  }
  console.log(`  ✅ ${statutsDocuments.length} statuts documents`)

  // ============================================================
  // 2. TYPES DOCUMENTS CANDIDATS
  // ============================================================
  console.log('📄 Types documents candidats...')

  const typesDocuments = [
    // --- CANDIDATURE ---
    { code: 'CNI_RECTO',          libelle: 'Carte d\'identité (recto)',    categorie: 'candidature',   obligatoire: true,  obligatoireQualiopi: true,  indicateurQualiopi: '9',  ordreAffichage: 1,  description: 'Recto de la pièce d\'identité en cours de validité' },
    { code: 'CNI_VERSO',          libelle: 'Carte d\'identité (verso)',    categorie: 'candidature',   obligatoire: false, obligatoireQualiopi: false, indicateurQualiopi: '9',  ordreAffichage: 2,  description: 'Verso de la pièce d\'identité' },
    { code: 'PHOTO_IDENTITE',     libelle: 'Photo d\'identité',           categorie: 'candidature',   obligatoire: false, obligatoireQualiopi: false, indicateurQualiopi: null, ordreAffichage: 3,  description: 'Photo d\'identité récente' },
    { code: 'CV',                 libelle: 'Curriculum Vitae',            categorie: 'candidature',   obligatoire: true,  obligatoireQualiopi: true,  indicateurQualiopi: '9',  ordreAffichage: 4,  description: 'CV à jour' },
    { code: 'LETTRE_MOTIVATION',  libelle: 'Lettre de motivation',        categorie: 'candidature',   obligatoire: true,  obligatoireQualiopi: false, indicateurQualiopi: null, ordreAffichage: 5,  description: 'Lettre de motivation manuscrite ou dactylographiée' },
    { code: 'DIPLOMES',           libelle: 'Diplômes et attestations',    categorie: 'candidature',   obligatoire: true,  obligatoireQualiopi: true,  indicateurQualiopi: '9',  ordreAffichage: 6,  description: 'Copies des diplômes obtenus' },
    { code: 'JUSTIF_DOMICILE',    libelle: 'Justificatif de domicile',    categorie: 'candidature',   obligatoire: false, obligatoireQualiopi: false, indicateurQualiopi: null, ordreAffichage: 7,  description: 'Justificatif de domicile de moins de 3 mois' },
    // --- FINANCEMENT ---
    { code: 'DEVIS',              libelle: 'Devis formation',             categorie: 'financement',   obligatoire: false, obligatoireQualiopi: true,  indicateurQualiopi: '13', ordreAffichage: 10, description: 'Devis de formation signé' },
    { code: 'DEVIS_SIGNE',        libelle: 'Devis signé',                 categorie: 'financement',   obligatoire: false, obligatoireQualiopi: true,  indicateurQualiopi: '13', ordreAffichage: 11, description: 'Devis de formation signé par le candidat' },
    { code: 'ACCORD_OPCO',        libelle: 'Accord prise en charge OPCO', categorie: 'financement',   obligatoire: false, obligatoireQualiopi: true,  indicateurQualiopi: '13', ordreAffichage: 12, description: 'Accord de prise en charge de l\'OPCO' },
    { code: 'ACCORD_CPF',         libelle: 'Validation CPF',              categorie: 'financement',   obligatoire: false, obligatoireQualiopi: false, indicateurQualiopi: null, ordreAffichage: 13, description: 'Confirmation de financement via Mon Compte Formation' },
    { code: 'ACCORD_POLE_EMPLOI', libelle: 'Accord France Travail',       categorie: 'financement',   obligatoire: false, obligatoireQualiopi: false, indicateurQualiopi: null, ordreAffichage: 14, description: 'Accord de financement France Travail' },
    { code: 'CONVENTION_FORMATION', libelle: 'Convention de formation',   categorie: 'financement',   obligatoire: false, obligatoireQualiopi: true,  indicateurQualiopi: '13', ordreAffichage: 15, description: 'Convention de formation signée par les deux parties' },
    // --- ÉLÈVE ---
    { code: 'REGLEMENT_INTERIEUR', libelle: 'Règlement intérieur signé',  categorie: 'pedagogique',   obligatoire: false, obligatoireQualiopi: true,  indicateurQualiopi: '11', ordreAffichage: 20, description: 'Règlement intérieur de l\'établissement signé' },
    { code: 'CONTRAT_FORMATION',  libelle: 'Contrat de formation',        categorie: 'pedagogique',   obligatoire: false, obligatoireQualiopi: true,  indicateurQualiopi: '13', ordreAffichage: 21, description: 'Contrat de formation professionnelle signé' },
    { code: 'ATTESTATION_ASSIDUITE', libelle: 'Attestation d\'assiduité', categorie: 'pedagogique',   obligatoire: false, obligatoireQualiopi: true,  indicateurQualiopi: '11', ordreAffichage: 22, description: 'Attestation de présence aux cours' },
    { code: 'ATTESTATION_FIN',    libelle: 'Attestation fin de formation', categorie: 'pedagogique',  obligatoire: false, obligatoireQualiopi: true,  indicateurQualiopi: '11', ordreAffichage: 23, description: 'Attestation de fin de formation délivrée par ABJ' },
    { code: 'DIPLOME_OBTENU',     libelle: 'Diplôme obtenu',              categorie: 'pedagogique',   obligatoire: false, obligatoireQualiopi: false, indicateurQualiopi: null, ordreAffichage: 24, description: 'Diplôme délivré à l\'issue de la formation' },
    { code: 'BULLETIN_NOTES',     libelle: 'Bulletin de notes',           categorie: 'pedagogique',   obligatoire: false, obligatoireQualiopi: false, indicateurQualiopi: null, ordreAffichage: 25, description: 'Bulletin de notes semestriel' },
  ]

  for (const t of typesDocuments) {
    await prisma.typeDocument.upsert({
      where: { code: t.code },
      create: t,
      update: { libelle: t.libelle, categorie: t.categorie, obligatoire: t.obligatoire, obligatoireQualiopi: t.obligatoireQualiopi, indicateurQualiopi: t.indicateurQualiopi, ordreAffichage: t.ordreAffichage, description: t.description },
    })
  }
  console.log(`  ✅ ${typesDocuments.length} types documents candidats`)

  // ============================================================
  // 3. TYPES DOCUMENTS FORMATEURS (Qualiopi)
  // ============================================================
  console.log('🗂️  Types documents formateurs (Qualiopi)...')

  const typesDocFormateur = [
    { code: 'CV',              libelle: 'Curriculum Vitae',                    obligatoire: true,  ordreAffichage: 1,  description: 'CV à jour justifiant de l\'expérience professionnelle et pédagogique (indicateur 9)' },
    { code: 'CNI',             libelle: 'Pièce d\'identité',                   obligatoire: true,  ordreAffichage: 2,  description: 'Carte nationale d\'identité ou passeport en cours de validité' },
    { code: 'DIPLOME',         libelle: 'Diplômes et certifications',           obligatoire: true,  ordreAffichage: 3,  description: 'Copies des diplômes et certifications professionnelles (indicateur 9)' },
    { code: 'RCP',             libelle: 'Assurance RC Pro',                    obligatoire: true,  ordreAffichage: 4,  description: 'Attestation d\'assurance responsabilité civile professionnelle en cours de validité' },
    { code: 'CASIER_B3',       libelle: 'Extrait casier judiciaire B3',        obligatoire: true,  ordreAffichage: 5,  description: 'Extrait de casier judiciaire bulletin n°3 de moins de 3 mois' },
    { code: 'CONTRAT',         libelle: 'Contrat d\'intervention',             obligatoire: true,  ordreAffichage: 6,  description: 'Contrat ou convention d\'intervention signé avec ABJ' },
    { code: 'PLANNING_COURS',  libelle: 'Planning de cours signé',             obligatoire: true,  ordreAffichage: 7,  description: 'Planning prévisionnel des interventions signé (indicateur 11)' },
    { code: 'ATTESTATION_FORM', libelle: 'Attestation formation continue',     obligatoire: false, ordreAffichage: 8,  description: 'Preuve de formation continue ou veille professionnelle (indicateur 9)' },
    { code: 'PORTFOLIO',       libelle: 'Portfolio / book de réalisations',    obligatoire: false, ordreAffichage: 9,  description: 'Portfolio illustrant les créations et l\'expertise technique' },
    { code: 'CERTIF_QUALIOPI', libelle: 'Engagement Qualiopi',                obligatoire: false, ordreAffichage: 10, description: 'Document d\'engagement au respect du référentiel Qualiopi signé par le formateur' },
    { code: 'SIRET',           libelle: 'Extrait Kbis / SIRET',               obligatoire: false, ordreAffichage: 11, description: 'Extrait Kbis ou avis SIRET pour les formateurs en statut d\'entreprise' },
    { code: 'AUTRE',           libelle: 'Autre document',                      obligatoire: false, ordreAffichage: 12, description: 'Tout autre document pertinent justifiant des compétences ou de l\'expérience' },
  ]

  for (const t of typesDocFormateur) {
    await prisma.typeDocumentFormateur.upsert({
      where: { code: t.code },
      create: t,
      update: { libelle: t.libelle, obligatoire: t.obligatoire, ordreAffichage: t.ordreAffichage, description: t.description },
    })
  }
  console.log(`  ✅ ${typesDocFormateur.length} types documents formateurs`)

  // ============================================================
  // 4. FORMATIONS — Catalogue officiel ABJ 2025-2026
  // ============================================================
  console.log('🎓 Formations (catalogue ABJ 2025-2026)...')

  const formations = [
    // ---- CAP ----
    {
      codeFormation: 'CAP_ATBJ',
      nom: 'CAP Art et Techniques de la Bijouterie-Joaillerie (option bijouterie-joaillerie)',
      categorie: 'CAP',
      dureeJours: null,
      dureeHeures: 800,
      niveauRequis: 'Niveau Baccalauréat',
      diplomeDelivre: 'CAP Art et Techniques de la Bijouterie-Joaillerie',
      tarifStandard: 15000,
      description: 'Cursus de 1 an de septembre à juin. Financement tout public. Formation en présentiel préparant au diplôme d\'État CAP ATBJ option bijouterie-joaillerie.',
      prerequis: ['Niveau Baccalauréat', 'Entretien de sélection', 'Test technique'],
      objectifs: ['Maîtriser les techniques de base de la bijouterie-joaillerie', 'Concevoir et réaliser des bijoux', 'Obtenir le CAP ATBJ'],
      programme: 'Bijouterie technique, joaillerie, sertissage, dessin technique, dessin gouaché, histoire de l\'art du bijou, gestion d\'entreprise. 800h en présentiel sur 10 mois.',
      actif: true,
    },

    // ---- BIJOUTERIE ----
    {
      codeFormation: 'BIJ_CREATEUR_N1',
      nom: 'Bijouterie de créateur sur métal — Niveau 1',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: null,
      diplomeDelivre: null,
      tarifStandard: 1130,
      description: 'Stage abordant les techniques de base en bijouterie de créateur. Apprentissage des postures, gestuelles et techniques fondamentales.',
      prerequis: [],
      objectifs: ['Découvrir les techniques de base de la bijouterie créateur', 'Réaliser une première pièce'],
      programme: 'Techniques de base en bijouterie sur métal, outillage, postures et gestuelles professionnelles.',
      actif: true,
    },
    {
      codeFormation: 'BIJ_CREATEUR_N2',
      nom: 'Bijouterie de créateur sur métal — Niveau 2',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: 'Niveau 1 ou compétences équivalentes',
      diplomeDelivre: null,
      tarifStandard: 1130,
      description: 'Approfondissement des techniques de bijouterie de créateur sur métal.',
      prerequis: ['Niveau 1 ou compétences équivalentes'],
      objectifs: ['Approfondir les techniques de bijouterie créateur', 'Réaliser des pièces plus complexes'],
      programme: 'Techniques intermédiaires en bijouterie sur métal.',
      actif: true,
    },
    {
      codeFormation: 'BIJ_CREATEUR_N3',
      nom: 'Bijouterie de créateur sur métal — Niveau 3',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: 'Niveaux 1 et 2 ou compétences équivalentes',
      diplomeDelivre: null,
      tarifStandard: 1130,
      description: 'Perfectionnement avancé en bijouterie de créateur sur métal.',
      prerequis: ['Niveaux 1 et 2 ou compétences équivalentes'],
      objectifs: ['Maîtriser les techniques avancées de bijouterie créateur'],
      programme: 'Techniques avancées en bijouterie sur métal.',
      actif: true,
    },

    // ---- BIJOUTERIE TECHNIQUE ----
    {
      codeFormation: 'BIJ_TECHNIQUE_N1',
      nom: 'Bijouterie technique sur métal — Niveau 1',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: null,
      diplomeDelivre: null,
      tarifStandard: 1130,
      description: 'Stage approfondissant les techniques avancées en bijouterie technique.',
      prerequis: [],
      objectifs: ['Acquérir les techniques de bijouterie technique'],
      programme: 'Techniques avancées de bijouterie sur métal.',
      actif: true,
    },
    {
      codeFormation: 'BIJ_TECHNIQUE_N2',
      nom: 'Bijouterie technique sur métal — Niveau 2',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: 'Niveau 1 ou compétences équivalentes',
      diplomeDelivre: null,
      tarifStandard: 1130,
      description: 'Approfondissement des techniques avancées en bijouterie technique.',
      prerequis: ['Niveau 1 ou compétences équivalentes'],
      objectifs: ['Approfondir les techniques de bijouterie technique'],
      programme: 'Techniques intermédiaires-avancées de bijouterie sur métal.',
      actif: true,
    },
    {
      codeFormation: 'BIJ_TECHNIQUE_N3',
      nom: 'Bijouterie technique sur métal — Niveau 3',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: 'Niveaux 1 et 2 ou compétences équivalentes',
      diplomeDelivre: null,
      tarifStandard: 1130,
      description: 'Maîtrise des techniques avancées en bijouterie technique.',
      prerequis: ['Niveaux 1 et 2 ou compétences équivalentes'],
      objectifs: ['Maîtriser les techniques avancées de bijouterie technique'],
      programme: 'Techniques avancées de bijouterie sur métal — niveau expert.',
      actif: true,
    },

    // ---- JOAILLERIE ----
    {
      codeFormation: 'JOAILLERIE_N1',
      nom: 'Joaillerie — Niveau 1',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: null,
      diplomeDelivre: null,
      tarifStandard: 1130,
      description: 'Stage abordant les techniques de base en joaillerie.',
      prerequis: [],
      objectifs: ['Découvrir les techniques fondamentales de la joaillerie'],
      programme: 'Initiation à la joaillerie : outillage, techniques de base, montage sur métal précieux.',
      actif: true,
    },
    {
      codeFormation: 'JOAILLERIE_N2',
      nom: 'Joaillerie — Niveau 2',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: 'Niveau 1 ou compétences équivalentes',
      diplomeDelivre: null,
      tarifStandard: 1130,
      description: 'Approfondissement des techniques de joaillerie.',
      prerequis: ['Niveau 1 ou compétences équivalentes'],
      objectifs: ['Approfondir les techniques de joaillerie'],
      programme: 'Techniques intermédiaires de joaillerie.',
      actif: true,
    },
    {
      codeFormation: 'JOAILLERIE_N3',
      nom: 'Joaillerie — Niveau 3',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: 'Niveaux 1 et 2 ou compétences équivalentes',
      diplomeDelivre: null,
      tarifStandard: 1130,
      description: 'Maîtrise des techniques avancées de joaillerie.',
      prerequis: ['Niveaux 1 et 2 ou compétences équivalentes'],
      objectifs: ['Maîtriser les techniques avancées de joaillerie'],
      programme: 'Techniques avancées de joaillerie.',
      actif: true,
    },

    // ---- HAUTE FANTAISIE ----
    {
      codeFormation: 'HF_N1',
      nom: 'Haute fantaisie — Niveau 1',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: null,
      diplomeDelivre: null,
      tarifStandard: 950,
      description: 'Enfilage de perle, tissage, nœuds, etc. Introduction aux techniques de haute fantaisie.',
      prerequis: [],
      objectifs: ['Maîtriser les techniques de base de la haute fantaisie'],
      programme: 'Enfilage de perles, techniques de tissage, réalisation de nœuds.',
      actif: true,
    },
    {
      codeFormation: 'HF_N2',
      nom: 'Haute fantaisie — Niveau 2',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: 'Niveau 1 ou compétences équivalentes',
      diplomeDelivre: null,
      tarifStandard: 950,
      description: 'Approfondissement des techniques de haute fantaisie.',
      prerequis: ['Niveau 1 ou compétences équivalentes'],
      objectifs: ['Approfondir les techniques de haute fantaisie'],
      programme: 'Techniques intermédiaires de haute fantaisie.',
      actif: true,
    },
    {
      codeFormation: 'HF_N3',
      nom: 'Haute fantaisie — Niveau 3',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: 'Niveaux 1 et 2 ou compétences équivalentes',
      diplomeDelivre: null,
      tarifStandard: 950,
      description: 'Maîtrise avancée des techniques de haute fantaisie.',
      prerequis: ['Niveaux 1 et 2 ou compétences équivalentes'],
      objectifs: ['Maîtriser les techniques avancées de haute fantaisie'],
      programme: 'Techniques avancées de haute fantaisie.',
      actif: true,
    },

    // ---- MAQUETTE ----
    {
      codeFormation: 'MAQUETTE_N1',
      nom: 'Atelier maquette de bijoux — Niveau 1',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: null,
      diplomeDelivre: null,
      tarifStandard: 1130,
      description: 'Stage abordant les techniques de base en maquette en bijouterie-joaillerie.',
      prerequis: [],
      objectifs: ['Maîtriser les techniques de base de la maquette bijou'],
      programme: 'Techniques de maquette en bijouterie-joaillerie : matériaux, outils, réalisation.',
      actif: true,
    },
    {
      codeFormation: 'MAQUETTE_N2',
      nom: 'Atelier maquette de bijoux — Niveau 2',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: 'Niveau 1 ou compétences équivalentes',
      diplomeDelivre: null,
      tarifStandard: 1130,
      description: 'Approfondissement des techniques de maquette en bijouterie-joaillerie.',
      prerequis: ['Niveau 1 ou compétences équivalentes'],
      objectifs: ['Approfondir les techniques de maquette'],
      programme: 'Techniques intermédiaires de maquette en bijouterie.',
      actif: true,
    },
    {
      codeFormation: 'MAQUETTE_N3',
      nom: 'Atelier maquette de bijoux — Niveau 3',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: 'Niveaux 1 et 2 ou compétences équivalentes',
      diplomeDelivre: null,
      tarifStandard: 1130,
      description: 'Perfectionnement avancé en maquette de bijoux.',
      prerequis: ['Niveaux 1 et 2 ou compétences équivalentes'],
      objectifs: ['Maîtriser les techniques avancées de maquette'],
      programme: 'Techniques avancées de maquette en bijouterie-joaillerie.',
      actif: true,
    },

    // ---- CAO/DAO ----
    {
      codeFormation: 'CAO_DAO',
      nom: 'CAO appliquée à la bijouterie (modélisation 3D)',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 26,
      niveauRequis: null,
      diplomeDelivre: null,
      tarifStandard: 910,
      description: 'Formation en distanciel : séance d\'introduction et d\'installation de 2h + 24h de cours. Modélisation 3D en bijouterie.',
      prerequis: ['Ordinateur personnel (Mac ou PC)', 'Connexion internet stable'],
      objectifs: ['Maîtriser les logiciels de CAO appliqués à la bijouterie', 'Réaliser des modèles 3D de bijoux'],
      programme: '2h introduction + installation logiciel, 24h de cours : prise en main, modélisation, rendu. Formation en distanciel.',
      actif: true,
    },

    // ---- SERTISSAGE ----
    {
      codeFormation: 'SERTI_N1',
      nom: 'Sertissage — Niveau 1 (serti clos)',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: null,
      diplomeDelivre: null,
      tarifStandard: 1130,
      description: 'Initiation au sertissage : technique du serti clos. Première approche de la pose de pierres précieuses.',
      prerequis: [],
      objectifs: ['Maîtriser la technique du serti clos', 'Poser des pierres en serti clos'],
      programme: 'Serti clos : outillage, préparation des griffes, pose et finition.',
      actif: true,
    },
    {
      codeFormation: 'SERTI_N2',
      nom: 'Sertissage — Niveau 2 (serti griffes)',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: 'Niveau 1 sertissage ou compétences équivalentes',
      diplomeDelivre: null,
      tarifStandard: 1230,
      description: 'Approfondissement du sertissage : technique du serti griffes.',
      prerequis: ['Niveau 1 sertissage ou compétences équivalentes'],
      objectifs: ['Maîtriser la technique du serti griffes', 'Réaliser des sertissages sur différents supports'],
      programme: 'Serti griffes : types de griffes, ajustage, pose de pierres facettées.',
      actif: true,
    },
    {
      codeFormation: 'SERTI_N3',
      nom: 'Sertissage — Niveau 3 (sertissage à grains)',
      categorie: 'PERFECTIONNEMENT',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: 'Niveaux 1 et 2 sertissage',
      diplomeDelivre: null,
      tarifStandard: 1330,
      description: 'Perfectionnement avancé en sertissage : technique du sertissage à grains.',
      prerequis: ['Niveaux 1 et 2 sertissage'],
      objectifs: ['Maîtriser le sertissage à grains', 'Réaliser des pavages et sertissages complexes'],
      programme: 'Sertissage à grains : pavé, grain de riz, étoiles, techniques avancées.',
      actif: true,
    },

    // ---- CISELURE ----
    {
      codeFormation: 'CISELURE_N1',
      nom: 'Ciselure — Niveau 1 (initiation)',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: null,
      diplomeDelivre: null,
      tarifStandard: 1130,
      description: 'Initiation à la ciselure : pose de mat, tracé et repoussé.',
      prerequis: [],
      objectifs: ['Découvrir les techniques de ciselure', 'Réaliser des motifs en relief'],
      programme: 'Pose de mat, tracé de motifs, repoussé sur métal.',
      actif: true,
    },
    {
      codeFormation: 'CISELURE_N2',
      nom: 'Ciselure — Niveau 2 (perfectionnement)',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: 'Niveau 1 ciselure ou compétences équivalentes',
      diplomeDelivre: null,
      tarifStandard: 1130,
      description: 'Perfectionnement en ciselure : tracé, fond descendu et repoussé.',
      prerequis: ['Niveau 1 ciselure ou compétences équivalentes'],
      objectifs: ['Approfondir les techniques de ciselure', 'Réaliser des reliefs plus complexes'],
      programme: 'Tracé avancé, fond descendu, repoussé profond.',
      actif: true,
    },
    {
      codeFormation: 'CISELURE_N3',
      nom: 'Ciselure — Niveau 3 (avancé)',
      categorie: 'PERFECTIONNEMENT',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: 'Niveaux 1 et 2 ciselure',
      diplomeDelivre: null,
      tarifStandard: 1130,
      description: 'Niveau avancé en ciselure : reprise de fonte en ciselure, lancés.',
      prerequis: ['Niveaux 1 et 2 ciselure'],
      objectifs: ['Maîtriser les techniques avancées de ciselure', 'Réaliser des pièces de haute complexité'],
      programme: 'Reprise de fonte en ciselure, lancés, techniques de haute précision.',
      actif: true,
    },

    // ---- ÉMAIL GRAND FEU ----
    {
      codeFormation: 'EMAIL_INITIATION',
      nom: 'Émail grand feu — Initiation (Niveau 1)',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: null,
      diplomeDelivre: null,
      tarifStandard: 1280,
      description: 'Apprentissage des principales techniques décoratives au choix.',
      prerequis: [],
      objectifs: ['Découvrir les techniques de l\'émail grand feu', 'Réaliser une première pièce émaillée'],
      programme: 'Introduction à l\'émail grand feu : techniques décoratives, cuisson, finitions.',
      actif: true,
    },
    {
      codeFormation: 'EMAIL_CLOISONNE',
      nom: 'Émail grand feu — Perfectionnement Cloisonné (Niveau 2)',
      categorie: 'PERFECTIONNEMENT',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: 'Niveau 1 émail ou compétences équivalentes',
      diplomeDelivre: null,
      tarifStandard: 1380,
      description: 'Perfectionnement en émail grand feu : technique du cloisonné au fil ou au ruban.',
      prerequis: ['Niveau 1 émail ou compétences équivalentes'],
      objectifs: ['Maîtriser le cloisonné au fil ou au ruban'],
      programme: 'Cloisonné au fil ou au ruban : préparation, pose des cloisons, remplissage, cuisson.',
      actif: true,
    },
    {
      codeFormation: 'EMAIL_CHAMPLÈVE',
      nom: 'Émail grand feu — Perfectionnement Champlevé (Niveau 2)',
      categorie: 'PERFECTIONNEMENT',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: 'Niveau 1 émail ou compétences équivalentes',
      diplomeDelivre: null,
      tarifStandard: 1380,
      description: 'Perfectionnement en émail grand feu : technique du champlevé.',
      prerequis: ['Niveau 1 émail ou compétences équivalentes'],
      objectifs: ['Maîtriser le champlevé'],
      programme: 'Champlevé : creusage du métal, remplissage d\'émail, cuisson, polissage.',
      actif: true,
    },
    {
      codeFormation: 'EMAIL_PLIQUE_A_JOUR',
      nom: 'Émail grand feu — Perfectionnement Plique-à-jour (Niveau 2)',
      categorie: 'PERFECTIONNEMENT',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: 'Niveau 1 émail + formation de base en bijouterie',
      diplomeDelivre: null,
      tarifStandard: 1380,
      description: 'Perfectionnement en émail grand feu : technique du plique-à-jour. Pré-requis : formation de base en bijouterie requise.',
      prerequis: ['Niveau 1 émail', 'Formation de base en bijouterie'],
      objectifs: ['Maîtriser le plique-à-jour'],
      programme: 'Plique-à-jour : construction de l\'armature, remplissage, cuisson, effets translucides.',
      actif: true,
    },

    // ---- GEMMOLOGIE ----
    {
      codeFormation: 'GEMMO_N1',
      nom: 'Univers des gemmes — Gemmologie appliquée Niveau 1 (initiation)',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: null,
      diplomeDelivre: null,
      tarifStandard: 1050,
      description: 'Initiation à la gemmologie : identification des pierres précieuses, semi-précieuses et synthétiques.',
      prerequis: [],
      objectifs: ['Identifier les principales gemmes', 'Comprendre les critères de qualité', 'Utiliser les outils gemmologiques de base'],
      programme: 'Minéralogie de base, identification des gemmes, instruments gemmologiques, marché des pierres.',
      actif: true,
    },
    {
      codeFormation: 'GEMMO_N2',
      nom: 'Univers des gemmes — Gemmologie de laboratoire Niveau 2 (perfectionnement)',
      categorie: 'PERFECTIONNEMENT',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: 'Niveau 1 gemmologie ou compétences équivalentes',
      diplomeDelivre: null,
      tarifStandard: 1250,
      description: 'Perfectionnement en gemmologie de laboratoire : analyses avancées et certification.',
      prerequis: ['Niveau 1 gemmologie ou compétences équivalentes'],
      objectifs: ['Maîtriser les techniques d\'analyse gemmologique de laboratoire'],
      programme: 'Gemmologie de laboratoire : spectroscopie, inclusions, traitements, certifications internationales.',
      actif: true,
    },

    // ---- TAILLE LAPIDAIRE ----
    {
      codeFormation: 'LAPIDAIRE_N1',
      nom: 'Taille lapidaire — Niveau 1 (cabochon, tailles émeraude et brillant)',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 40,
      niveauRequis: null,
      diplomeDelivre: null,
      tarifStandard: 1630,
      description: 'Initiation à la taille lapidaire : cabochon, tailles émeraude et brillant.',
      prerequis: [],
      objectifs: ['Réaliser des cabochons', 'Maîtriser les tailles émeraude et brillant'],
      programme: 'Introduction à la lapidaire, cabochonnage, taille émeraude, taille brillant.',
      actif: true,
    },
    {
      codeFormation: 'LAPIDAIRE_N2',
      nom: 'Taille lapidaire — Niveau 2 (tailles ovale et coussin)',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 40,
      niveauRequis: 'Niveau 1 lapidaire',
      diplomeDelivre: null,
      tarifStandard: 1630,
      description: 'Perfectionnement en taille lapidaire : tailles ovale et coussin.',
      prerequis: ['Niveau 1 lapidaire'],
      objectifs: ['Maîtriser les tailles ovale et coussin'],
      programme: 'Taille ovale, taille coussin, techniques de polissage.',
      actif: true,
    },
    {
      codeFormation: 'LAPIDAIRE_N3',
      nom: 'Taille lapidaire — Niveau 3 (tailles navette et poire)',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 40,
      niveauRequis: 'Niveaux 1 et 2 lapidaire',
      diplomeDelivre: null,
      tarifStandard: 1630,
      description: 'Perfectionnement avancé en taille lapidaire : tailles navette et poire.',
      prerequis: ['Niveaux 1 et 2 lapidaire'],
      objectifs: ['Maîtriser les tailles navette et poire'],
      programme: 'Taille navette, taille poire, finitions haute précision.',
      actif: true,
    },
    {
      codeFormation: 'LAPIDAIRE_N4',
      nom: 'Taille lapidaire — Niveau 4 (retaille, ajustage sur œuvre)',
      categorie: 'PERFECTIONNEMENT',
      dureeJours: null,
      dureeHeures: 40,
      niveauRequis: 'Niveaux 1, 2 et 3 lapidaire',
      diplomeDelivre: null,
      tarifStandard: 1630,
      description: 'Niveau expert en taille lapidaire : retaille et ajustage sur œuvre.',
      prerequis: ['Niveaux 1, 2 et 3 lapidaire'],
      objectifs: ['Maîtriser la retaille et l\'ajustage sur une pièce existante'],
      programme: 'Retaille, ajustage sur œuvre, corrections et retouches de haute précision.',
      actif: true,
    },

    // ---- ATELIERS TRANSVERSAUX ----
    {
      codeFormation: 'ATD_BIJ_EMAIL',
      nom: 'Atelier découverte — Bijouterie & émail grand feu',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: null,
      diplomeDelivre: null,
      tarifStandard: 1130,
      description: 'Stage de découverte transversal : réalisation d\'un projet de bijou comportant de la bijouterie et de l\'émail grand feu.',
      prerequis: [],
      objectifs: ['Combiner bijouterie et émail sur un projet unique'],
      programme: 'Projet de bijou combinant techniques de bijouterie et d\'émail grand feu.',
      actif: true,
    },
    {
      codeFormation: 'ATD_BIJ_LAPIDAIRE',
      nom: 'Atelier découverte — Bijouterie & taille lapidaire',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: null,
      diplomeDelivre: null,
      tarifStandard: 1130,
      description: 'Stage de découverte transversal : projet de bijou combinant bijouterie et lapidaire (cabochon taillé mis en valeur sur le bijou).',
      prerequis: [],
      objectifs: ['Réaliser un bijou intégrant une pierre taillée'],
      programme: 'Projet de bijou : bijouterie + lapidaire pour cabochon en gemme.',
      actif: true,
    },
    {
      codeFormation: 'ATD_CISELURE_EMAIL',
      nom: 'Atelier découverte — Ciselure & émail grand feu',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: null,
      diplomeDelivre: null,
      tarifStandard: 1130,
      description: 'Stage de découverte transversal : ciselure pour texturage sur métal + émail grand feu.',
      prerequis: [],
      objectifs: ['Combiner ciselure et émail sur une pièce commune'],
      programme: 'Pièce commune : ciselure pour effet de texturage + émail grand feu.',
      actif: true,
    },

    // ---- HISTOIRE DE L'ART / DESSIN / DIVERS ----
    {
      codeFormation: 'HISTOIRE_ART',
      nom: 'Histoire de l\'art du bijou',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: null,
      diplomeDelivre: null,
      tarifStandard: 900,
      description: 'Histoire des arts bijoutiers en présentiel — de la Préhistoire à nos jours. Évolution stylistique et techniques du bijou, analyse stylistique.',
      prerequis: [],
      objectifs: ['Connaître l\'histoire du bijou à travers les époques', 'Analyser les styles et techniques historiques'],
      programme: 'Bijoux de la Préhistoire à l\'Antiquité, Moyen-Âge, Renaissance, XVIIe-XIXe s., Art Nouveau, Art Déco, design contemporain.',
      actif: true,
    },
    {
      codeFormation: 'DESSIN_TECHNIQUE',
      nom: 'Pratiques du dessin — Dessin technique',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: null,
      diplomeDelivre: null,
      tarifStandard: 900,
      description: 'Module de dessin technique intégré à la préparation CAP ATBJ. Représentation technique des bijoux.',
      prerequis: [],
      objectifs: ['Maîtriser le dessin technique appliqué à la bijouterie'],
      programme: 'Dessin technique : vues, coupes, cotation, représentation bijoux.',
      actif: true,
    },
    {
      codeFormation: 'DESSIN_GOUACHE',
      nom: 'Pratiques du dessin — Dessin de bijoux gouaché',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 30,
      niveauRequis: null,
      diplomeDelivre: null,
      tarifStandard: 900,
      description: 'Module de dessin de bijoux gouaché intégré à la préparation CAP ATBJ.',
      prerequis: [],
      objectifs: ['Maîtriser la représentation gouachée des bijoux'],
      programme: 'Dessin gouaché de bijoux : matières, reflets, rendu des pierres et métaux.',
      actif: true,
    },
    {
      codeFormation: 'DOUANE_GARANTIE',
      nom: 'Entrepreneurs : Douane & garantie',
      categorie: 'FORMATION_COURTE',
      dureeJours: null,
      dureeHeures: 4,
      niveauRequis: null,
      diplomeDelivre: null,
      tarifStandard: 180,
      description: 'Législation douane et garantie pour entrepreneurs de la bijouterie-joaillerie.',
      prerequis: [],
      objectifs: ['Comprendre la législation douanière et de garantie applicable à la bijouterie'],
      programme: 'Règles de la garantie des métaux précieux, douane import/export, poinçons.',
      actif: true,
    },
  ]

  let formationsCount = 0
  for (const f of formations) {
    await prisma.formation.upsert({
      where: { codeFormation: f.codeFormation },
      create: f,
      update: {
        nom: f.nom,
        categorie: f.categorie,
        dureeJours: f.dureeJours,
        dureeHeures: f.dureeHeures,
        niveauRequis: f.niveauRequis,
        diplomeDelivre: f.diplomeDelivre,
        tarifStandard: f.tarifStandard,
        description: f.description,
        prerequis: f.prerequis,
        objectifs: f.objectifs,
        programme: f.programme,
        actif: f.actif,
      },
    })
    formationsCount++
  }
  console.log(`  ✅ ${formationsCount} formations (catalogue ABJ 2025-2026)`)

  // ============================================================
  // 5. DOCUMENTS REQUIS PAR FORMATION
  // Tous les candidats doivent fournir les mêmes documents de base.
  // Pour le CAP ATBJ, on ajoute les documents contractuels.
  // ============================================================
  console.log('📎 Documents requis par formation...')

  // Documents de base communs à toutes les formations courtes
  const docsBaseCommuns = ['CNI_RECTO', 'CV', 'LETTRE_MOTIVATION']
  // Documents supplémentaires pour le CAP
  const docsCAP = ['CNI_RECTO', 'CV', 'LETTRE_MOTIVATION', 'DIPLOMES', 'JUSTIF_DOMICILE']

  const toutes = await prisma.formation.findMany({ select: { idFormation: true, codeFormation: true } })

  for (const formation of toutes) {
    const docs = formation.codeFormation === 'CAP_ATBJ' ? docsCAP : docsBaseCommuns
    for (let i = 0; i < docs.length; i++) {
      await prisma.documentRequis.upsert({
        where: { idFormation_codeTypeDocument: { idFormation: formation.idFormation, codeTypeDocument: docs[i] } },
        create: {
          idFormation: formation.idFormation,
          codeTypeDocument: docs[i],
          obligatoire: true,
          ordreAffichage: i + 1,
        },
        update: { obligatoire: true, ordreAffichage: i + 1 },
      })
    }
  }
  console.log(`  ✅ Documents requis créés pour ${toutes.length} formations`)

  // ============================================================
  // 6. SALLES
  // ============================================================
  console.log('🏫 Salles...')

  const salles = [
    {
      nom: 'Atelier A',
      code: 'ATEL_A',
      capaciteMax: 8,
      surfaceM2: 45,
      etage: 0,
      equipements: ['ETABLI_BIJOU', 'POSTE_SOUDURE', 'LAMINOIR', 'MARTEAU_BAGUE', 'PERCEUSE_COLONNE'],
      formationsCompatibles: ['CAP_ATBJ', 'BIJ_CREATEUR_N1', 'BIJ_CREATEUR_N2', 'BIJ_CREATEUR_N3', 'BIJ_TECHNIQUE_N1', 'BIJ_TECHNIQUE_N2', 'BIJ_TECHNIQUE_N3', 'JOAILLERIE_N1', 'JOAILLERIE_N2', 'JOAILLERIE_N3'],
      disponibleWeekend: true,
      disponibleSoir: false,
      statut: 'ACTIVE',
      notes: 'Atelier principal bijouterie. 8 postes de travail individuels avec établis.',
    },
    {
      nom: 'Atelier B',
      code: 'ATEL_B',
      capaciteMax: 6,
      surfaceM2: 35,
      etage: 0,
      equipements: ['ETABLI_BIJOU', 'POSTE_SERTI', 'MICROSCOPE_SERTI', 'LOUPE_BINOCULAIRE'],
      formationsCompatibles: ['CAP_ATBJ', 'SERTI_N1', 'SERTI_N2', 'SERTI_N3', 'CISELURE_N1', 'CISELURE_N2', 'CISELURE_N3'],
      disponibleWeekend: true,
      disponibleSoir: false,
      statut: 'ACTIVE',
      notes: 'Atelier sertissage et ciselure. Postes équipés de microscopes et loupes binoculaires.',
    },
    {
      nom: 'Atelier C',
      code: 'ATEL_C',
      capaciteMax: 6,
      surfaceM2: 30,
      etage: 0,
      equipements: ['FOUR_EMAIL', 'ETABLI_BIJOU', 'MATERIEL_EMAIL', 'LAMPE_CHALUMEAU'],
      formationsCompatibles: ['EMAIL_INITIATION', 'EMAIL_CLOISONNE', 'EMAIL_CHAMPLÈVE', 'EMAIL_PLIQUE_A_JOUR', 'ATD_BIJ_EMAIL', 'ATD_CISELURE_EMAIL'],
      disponibleWeekend: false,
      disponibleSoir: false,
      statut: 'ACTIVE',
      notes: 'Atelier émail grand feu. Four et matériel d\'émaillage. Ventilation spécifique.',
    },
    {
      nom: 'Atelier polissage',
      code: 'ATEL_POLI',
      capaciteMax: 4,
      surfaceM2: 20,
      etage: 0,
      equipements: ['POLISSEUSE', 'ASPIRATEUR_INDUSTRIEL', 'PRODUITS_POLISSAGE'],
      formationsCompatibles: ['CAP_ATBJ', 'BIJ_CREATEUR_N1', 'BIJ_CREATEUR_N2', 'BIJ_CREATEUR_N3'],
      disponibleWeekend: false,
      disponibleSoir: false,
      statut: 'ACTIVE',
      notes: 'Atelier polissage et finitions. Accès avec équipement de protection obligatoire.',
    },
    {
      nom: 'Atelier taille lapidaire',
      code: 'ATEL_LAPID',
      capaciteMax: 4,
      surfaceM2: 25,
      etage: 0,
      equipements: ['MACHINE_LAPIDAIRE', 'DISQUES_DIAMANT', 'SYSTEME_EAU', 'LOUPE_BINOCULAIRE'],
      formationsCompatibles: ['LAPIDAIRE_N1', 'LAPIDAIRE_N2', 'LAPIDAIRE_N3', 'LAPIDAIRE_N4', 'ATD_BIJ_LAPIDAIRE'],
      disponibleWeekend: false,
      disponibleSoir: false,
      statut: 'ACTIVE',
      notes: 'Atelier taille lapidaire. Machines de taille avec système d\'eau en circuit fermé.',
    },
    {
      nom: 'Salle informatique',
      code: 'INFO',
      capaciteMax: 8,
      surfaceM2: 30,
      etage: 1,
      equipements: ['ORDINATEUR_CAO', 'LOGICIEL_RHINO', 'LOGICIEL_MATRIX_GOLD', 'ECRAN_TACTILE', 'VIDEO_PROJECTEUR'],
      formationsCompatibles: ['CAO_DAO'],
      disponibleWeekend: false,
      disponibleSoir: false,
      statut: 'ACTIVE',
      notes: 'Salle équipée pour la formation CAO/DAO. Logiciels Rhino et MatrixGold installés.',
    },
    {
      nom: 'Salle théorie',
      code: 'THEORIE',
      capaciteMax: 15,
      surfaceM2: 40,
      etage: 1,
      equipements: ['VIDEO_PROJECTEUR', 'TABLEAU_BLANC', 'TABLES_COURS', 'CHAISES', 'ECRAN_PROJECTION'],
      formationsCompatibles: ['CAP_ATBJ', 'HISTOIRE_ART', 'DESSIN_TECHNIQUE', 'DESSIN_GOUACHE', 'DOUANE_GARANTIE', 'GEMMO_N1', 'GEMMO_N2'],
      disponibleWeekend: false,
      disponibleSoir: true,
      statut: 'ACTIVE',
      notes: 'Salle de cours théoriques. Capacité 15 personnes. Disponible en soirée pour cours du soir.',
    },
    {
      nom: 'Salle réunion',
      code: 'REUNION',
      capaciteMax: 10,
      surfaceM2: 20,
      etage: 1,
      equipements: ['TABLE_CONFERENCE', 'VIDEO_PROJECTEUR', 'VISIOCONFERENCE'],
      formationsCompatibles: [],
      disponibleWeekend: false,
      disponibleSoir: false,
      statut: 'ACTIVE',
      notes: 'Salle de réunion et d\'entretiens. Équipée pour visioconférence.',
    },
    {
      nom: 'Atelier haute fantaisie',
      code: 'ATEL_HF',
      capaciteMax: 8,
      surfaceM2: 25,
      etage: 0,
      equipements: ['TABLES_TRAVAIL', 'MATERIEL_PERLES', 'MATERIEL_TISSAGE', 'MATERIEL_MAQUETTE'],
      formationsCompatibles: ['HF_N1', 'HF_N2', 'HF_N3', 'MAQUETTE_N1', 'MAQUETTE_N2', 'MAQUETTE_N3'],
      disponibleWeekend: true,
      disponibleSoir: false,
      statut: 'ACTIVE',
      notes: 'Atelier haute fantaisie et maquette. Tables de travail adaptées.',
    },
  ]

  for (const s of salles) {
    await prisma.salle.upsert({
      where: { nom: s.nom },
      create: s,
      update: {
        code: s.code,
        capaciteMax: s.capaciteMax,
        surfaceM2: s.surfaceM2,
        etage: s.etage,
        equipements: s.equipements,
        formationsCompatibles: s.formationsCompatibles,
        disponibleWeekend: s.disponibleWeekend,
        disponibleSoir: s.disponibleSoir,
        statut: s.statut,
        notes: s.notes,
      },
    })
  }
  console.log(`  ✅ ${salles.length} salles`)

  // ============================================================
  // RÉSUMÉ
  // ============================================================
  console.log('\n' + '='.repeat(60))
  console.log('🎉 SEED RÉFÉRENTIEL TERMINÉ')
  console.log('='.repeat(60))

  const counts = {
    statuts: await prisma.statutDocument.count(),
    typesDocsCandidats: await prisma.typeDocument.count(),
    typesDocsFormateurs: await prisma.typeDocumentFormateur.count(),
    formations: await prisma.formation.count(),
    documentsRequis: await prisma.documentRequis.count(),
    salles: await prisma.salle.count(),
  }

  console.log('\n📊 ÉTAT FINAL :')
  console.log(`  ✅ ${counts.statuts} statuts documents`)
  console.log(`  ✅ ${counts.typesDocsCandidats} types documents candidats`)
  console.log(`  ✅ ${counts.typesDocsFormateurs} types documents formateurs (Qualiopi)`)
  console.log(`  ✅ ${counts.formations} formations (catalogue 2025-2026)`)
  console.log(`  ✅ ${counts.documentsRequis} documents requis par formation`)
  console.log(`  ✅ ${counts.salles} salles`)
  console.log('\nℹ️  Prospects, candidats, élèves, formateurs, sessions : non touchés.')
}

seedReferentiel()
  .catch((error) => {
    console.error('\n❌ Erreur :', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
