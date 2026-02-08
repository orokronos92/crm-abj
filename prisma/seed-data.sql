-- ============================================================
-- SEED ENRICHI - CRM ABJ
-- Données cohérentes : 10 prospects, 10 candidats, 10 élèves, 5 formateurs
-- ============================================================

-- Nettoyage (optionnel, décommenter si besoin de repartir à zéro)
-- TRUNCATE TABLE historique_marjorie_crm, historique_emails, presences, evaluations,
--   inscriptions_sessions, interventions_formateurs, disponibilites_formateurs,
--   eleves, documents_candidat, candidats, prospects, sessions, formateurs,
--   utilisateurs, formations, types_documents, statuts_documents, sessions_auth,
--   journal_erreurs RESTART IDENTITY CASCADE;

BEGIN;

-- ============================================================
-- 1. RÉFÉRENTIELS
-- ============================================================

-- Statuts documents
INSERT INTO statuts_documents (code, libelle, couleur, ordre, action_requise) VALUES
('ATTENDU', 'En attente', '#FFA500', 1, NULL),
('RECU', 'Reçu', '#0080FF', 2, NULL),
('A_VALIDER', 'À valider', '#FFA500', 3, NULL),
('VALIDE', 'Validé', '#00C851', 4, NULL),
('REFUSE', 'Refusé', '#FF4444', 5, NULL)
ON CONFLICT (code) DO NOTHING;

-- Types documents
INSERT INTO types_documents (code, libelle, categorie, obligatoire, ordre_affichage, description) VALUES
('CV', 'Curriculum Vitae', 'candidature', true, 1, NULL),
('LETTRE_MOTIVATION', 'Lettre de motivation', 'candidature', true, 2, NULL),
('CNI_RECTO', 'Carte identité (recto)', 'candidature', true, 3, NULL),
('CNI_VERSO', 'Carte identité (verso)', 'candidature', true, 4, NULL),
('PHOTO', 'Photo d''identité', 'candidature', false, 5, NULL),
('DIPLOME', 'Diplômes', 'candidature', false, 6, NULL),
('DEVIS', 'Devis formation', 'financement', false, 7, NULL),
('CONTRAT', 'Contrat de formation', 'eleve', false, 8, NULL)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 2. FORMATIONS
-- ============================================================

INSERT INTO formations (code_formation, nom, categorie, duree_jours, duree_heures, niveau_requis, diplome_delivre, tarif_standard, description, prerequis, objectifs, actif) VALUES
('CAP_BJ', 'CAP Bijouterie-Joaillerie', 'CAP', 180, 1200, '3ème', 'CAP Bijouterie-Joaillerie', 8500, 'Formation complète au métier de bijoutier-joaillier', ARRAY['Niveau 3ème', 'Dextérité manuelle', 'Sens artistique'], ARRAY['Maîtriser les techniques de base de la bijouterie', 'Créer des bijoux simples', 'Connaître les métaux et pierres'], true),
('INIT_BJ', 'Initiation Bijouterie', 'FORMATION_COURTE', 5, 35, 'Aucun', 'Attestation de formation', 750, 'Découverte des techniques de base de la bijouterie', ARRAY[]::text[], ARRAY['Découvrir les outils et techniques', 'Réaliser un premier bijou', 'Comprendre les métiers de la bijouterie'], true),
('PERF_SERTI', 'Perfectionnement Sertissage', 'PERFECTIONNEMENT', 10, 70, 'CAP ou expérience', 'Attestation de perfectionnement', 1500, 'Techniques avancées de sertissage', ARRAY['CAP ou 2 ans d''expérience', 'Maîtrise des outils de base'], ARRAY['Maîtriser le sertissage à grains', 'Apprendre le serti clos', 'Réaliser des sertis complexes'], true),
('CAO_DAO', 'CAO/DAO Bijouterie (Rhino & MatrixGold)', 'PERFECTIONNEMENT', 15, 105, 'Bases informatiques', 'Attestation CAO/DAO', 2100, 'Conception assistée par ordinateur pour bijoutiers', ARRAY['Connaissances de base en bijouterie', 'Maîtrise de Windows'], ARRAY['Modéliser des bijoux en 3D', 'Préparer des fichiers pour impression 3D', 'Maîtriser Rhino et MatrixGold'], true),
('GEMMO', 'Gemmologie Initiation', 'FORMATION_COURTE', 7, 49, 'Aucun', 'Attestation Gemmologie', 980, 'Reconnaissance et classification des pierres précieuses', ARRAY[]::text[], ARRAY['Identifier les pierres précieuses', 'Utiliser les outils de gemmologie', 'Comprendre les critères de qualité'], true)
ON CONFLICT (code_formation) DO NOTHING;

-- ============================================================
-- 3. UTILISATEURS (1 admin + 5 formateurs + 10 élèves)
-- ============================================================

-- Hash bcrypt du mot de passe : ABJ2024!
INSERT INTO utilisateurs (email, mot_de_passe_hash, nom, prenom, role, statut_compte) VALUES
('admin@abj.fr', '$2b$10$pQE7ycFxEQrELq/UnXOfeOm.dnPMG5DGYq.sit/V1RxhdhNfX1L1G', 'Administrateur', 'Système', 'admin', 'ACTIF'),
-- Formateurs
('laurent.dubois@abj.fr', '$2b$10$pQE7ycFxEQrELq/UnXOfeOm.dnPMG5DGYq.sit/V1RxhdhNfX1L1G', 'Dubois', 'Laurent', 'professeur', 'ACTIF'),
('marie.petit@abj.fr', '$2b$10$pQE7ycFxEQrELq/UnXOfeOm.dnPMG5DGYq.sit/V1RxhdhNfX1L1G', 'Petit', 'Marie', 'professeur', 'ACTIF'),
('thomas.bernard@abj.fr', '$2b$10$pQE7ycFxEQrELq/UnXOfeOm.dnPMG5DGYq.sit/V1RxhdhNfX1L1G', 'Bernard', 'Thomas', 'professeur', 'ACTIF'),
('claire.martin@abj.fr', '$2b$10$pQE7ycFxEQrELq/UnXOfeOm.dnPMG5DGYq.sit/V1RxhdhNfX1L1G', 'Martin', 'Claire', 'professeur', 'ACTIF'),
('julien.rousseau@abj.fr', '$2b$10$pQE7ycFxEQrELq/UnXOfeOm.dnPMG5DGYq.sit/V1RxhdhNfX1L1G', 'Rousseau', 'Julien', 'professeur', 'ACTIF'),
-- Élèves
('sophie.durand@email.fr', '$2b$10$pQE7ycFxEQrELq/UnXOfeOm.dnPMG5DGYq.sit/V1RxhdhNfX1L1G', 'Durand', 'Sophie', 'eleve', 'ACTIF'),
('maxime.barbier@email.fr', '$2b$10$pQE7ycFxEQrELq/UnXOfeOm.dnPMG5DGYq.sit/V1RxhdhNfX1L1G', 'Barbier', 'Maxime', 'eleve', 'ACTIF'),
('chloe.fontaine@email.fr', '$2b$10$pQE7ycFxEQrELq/UnXOfeOm.dnPMG5DGYq.sit/V1RxhdhNfX1L1G', 'Fontaine', 'Chloé', 'eleve', 'ACTIF'),
('lucas.lambert@email.fr', '$2b$10$pQE7ycFxEQrELq/UnXOfeOm.dnPMG5DGYq.sit/V1RxhdhNfX1L1G', 'Lambert', 'Lucas', 'eleve', 'ACTIF'),
('emma.garcia@email.fr', '$2b$10$pQE7ycFxEQrELq/UnXOfeOm.dnPMG5DGYq.sit/V1RxhdhNfX1L1G', 'Garcia', 'Emma', 'eleve', 'ACTIF'),
('theo.martinez@email.fr', '$2b$10$pQE7ycFxEQrELq/UnXOfeOm.dnPMG5DGYq.sit/V1RxhdhNfX1L1G', 'Martinez', 'Théo', 'eleve', 'ACTIF'),
('lea.moreau@email.fr', '$2b$10$pQE7ycFxEQrELq/UnXOfeOm.dnPMG5DGYq.sit/V1RxhdhNfX1L1G', 'Moreau', 'Léa', 'eleve', 'ACTIF'),
('hugo.simon@email.fr', '$2b$10$pQE7ycFxEQrELq/UnXOfeOm.dnPMG5DGYq.sit/V1RxhdhNfX1L1G', 'Simon', 'Hugo', 'eleve', 'ACTIF'),
('alice.roux@email.fr', '$2b$10$pQE7ycFxEQrELq/UnXOfeOm.dnPMG5DGYq.sit/V1RxhdhNfX1L1G', 'Roux', 'Alice', 'eleve', 'ACTIF'),
('noah.girard@email.fr', '$2b$10$pQE7ycFxEQrELq/UnXOfeOm.dnPMG5DGYq.sit/V1RxhdhNfX1L1G', 'Girard', 'Noah', 'eleve', 'ACTIF')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- 4. FORMATEURS (table dédiée)
-- ============================================================

INSERT INTO formateurs (id_utilisateur, nom, prenom, email, telephone, specialites, formations_enseignees, tarif_journalier, statut)
SELECT id_utilisateur, nom, prenom, email, '0612345678', ARRAY['Bijouterie', 'Sertissage'], ARRAY[]::integer[], 450, 'ACTIF'
FROM utilisateurs WHERE email = 'laurent.dubois@abj.fr'
ON CONFLICT (id_utilisateur) DO NOTHING;

INSERT INTO formateurs (id_utilisateur, nom, prenom, email, telephone, specialites, formations_enseignees, tarif_journalier, statut)
SELECT id_utilisateur, nom, prenom, email, '0623456789', ARRAY['CAO/DAO', 'Joaillerie'], ARRAY[]::integer[], 520, 'ACTIF'
FROM utilisateurs WHERE email = 'marie.petit@abj.fr'
ON CONFLICT (id_utilisateur) DO NOTHING;

INSERT INTO formateurs (id_utilisateur, nom, prenom, email, telephone, specialites, formations_enseignees, tarif_journalier, statut)
SELECT id_utilisateur, nom, prenom, email, '0634567890', ARRAY['Sertissage', 'Polissage'], ARRAY[]::integer[], 380, 'ACTIF'
FROM utilisateurs WHERE email = 'thomas.bernard@abj.fr'
ON CONFLICT (id_utilisateur) DO NOTHING;

INSERT INTO formateurs (id_utilisateur, nom, prenom, email, telephone, specialites, formations_enseignees, tarif_journalier, statut)
SELECT id_utilisateur, nom, prenom, email, '0645678901', ARRAY['Gemmologie', 'Expertise'], ARRAY[]::integer[], 550, 'ACTIF'
FROM utilisateurs WHERE email = 'claire.martin@abj.fr'
ON CONFLICT (id_utilisateur) DO NOTHING;

INSERT INTO formateurs (id_utilisateur, nom, prenom, email, telephone, specialites, formations_enseignees, tarif_journalier, statut)
SELECT id_utilisateur, nom, prenom, email, '0656789012', ARRAY['Bijouterie', 'Design'], ARRAY[]::integer[], 420, 'ACTIF'
FROM utilisateurs WHERE email = 'julien.rousseau@abj.fr'
ON CONFLICT (id_utilisateur) DO NOTHING;

-- ============================================================
-- 5. SESSIONS
-- ============================================================

INSERT INTO sessions (id_formation, nom_session, date_debut, date_fin, capacite_max, nb_inscrits, statut_session, salle_principale, formateur_principal_id)
SELECT
  f.id_formation,
  'CAP BJ — Session Mars 2025',
  '2025-03-01'::date,
  '2025-09-30'::date,
  12,
  6,
  'EN_COURS',
  'Atelier A',
  (SELECT id_formateur FROM formateurs WHERE email = 'laurent.dubois@abj.fr')
FROM formations f WHERE f.code_formation = 'CAP_BJ';

INSERT INTO sessions (id_formation, nom_session, date_debut, date_fin, capacite_max, nb_inscrits, statut_session, salle_principale, formateur_principal_id)
SELECT
  f.id_formation,
  'Initiation BJ — Février 2025',
  '2025-02-10'::date,
  '2025-02-14'::date,
  8,
  2,
  'EN_COURS',
  'Atelier B',
  (SELECT id_formateur FROM formateurs WHERE email = 'julien.rousseau@abj.fr')
FROM formations f WHERE f.code_formation = 'INIT_BJ';

INSERT INTO sessions (id_formation, nom_session, date_debut, date_fin, capacite_max, nb_inscrits, statut_session, salle_principale, formateur_principal_id)
SELECT
  f.id_formation,
  'Perfectionnement Sertissage — Avril 2025',
  '2025-04-07'::date,
  '2025-04-18'::date,
  6,
  2,
  'CONFIRMEE',
  'Atelier C',
  (SELECT id_formateur FROM formateurs WHERE email = 'thomas.bernard@abj.fr')
FROM formations f WHERE f.code_formation = 'PERF_SERTI';

INSERT INTO sessions (id_formation, nom_session, date_debut, date_fin, capacite_max, nb_inscrits, statut_session, salle_principale, formateur_principal_id)
SELECT
  f.id_formation,
  'CAO/DAO — Mai 2025',
  '2025-05-12'::date,
  '2025-05-30'::date,
  8,
  0,
  'PREVUE',
  'Salle informatique',
  (SELECT id_formateur FROM formateurs WHERE email = 'marie.petit@abj.fr')
FROM formations f WHERE f.code_formation = 'CAO_DAO';

INSERT INTO sessions (id_formation, nom_session, date_debut, date_fin, capacite_max, nb_inscrits, statut_session, salle_principale, formateur_principal_id)
SELECT
  f.id_formation,
  'Gemmologie — Janvier 2025',
  '2025-01-13'::date,
  '2025-01-19'::date,
  10,
  0,
  'TERMINEE',
  'Atelier B',
  (SELECT id_formateur FROM formateurs WHERE email = 'claire.martin@abj.fr')
FROM formations f WHERE f.code_formation = 'GEMMO';

-- ============================================================
-- 6. PROSPECTS (15 prospects : 10 deviendront candidats)
-- ============================================================

INSERT INTO prospects (id_prospect, emails, telephones, nom, prenom, formations_souhaitees, formation_principale, mode_financement, statut_prospect, source_origine, date_premier_contact, date_dernier_contact) VALUES
('PROS_DUR_SOP_001', ARRAY['sophie.durand@email.fr'], ARRAY['0612345678'], 'Durand', 'Sophie', ARRAY['CAP_BJ'], 'CAP_BJ', 'CPF', 'CANDIDAT', 'Site web', '2024-11-01', '2025-02-01'),
('PROS_BAR_MAX_002', ARRAY['maxime.barbier@email.fr'], ARRAY['0623456789'], 'Barbier', 'Maxime', ARRAY['CAP_BJ'], 'CAP_BJ', 'OPCO', 'CANDIDAT', 'Site web', '2024-11-02', '2025-02-02'),
('PROS_FON_CHL_003', ARRAY['chloe.fontaine@email.fr'], ARRAY['0634567890'], 'Fontaine', 'Chloé', ARRAY['CAP_BJ'], 'CAP_BJ', 'CPF', 'CANDIDAT', 'Site web', '2024-11-03', '2025-02-03'),
('PROS_LAM_LUC_004', ARRAY['lucas.lambert@email.fr'], ARRAY['0645678901'], 'Lambert', 'Lucas', ARRAY['CAP_BJ'], 'CAP_BJ', 'France Travail', 'CANDIDAT', 'Site web', '2024-11-04', '2025-02-04'),
('PROS_GAR_EMM_005', ARRAY['emma.garcia@email.fr'], ARRAY['0656789012'], 'Garcia', 'Emma', ARRAY['CAP_BJ'], 'CAP_BJ', 'Personnel', 'CANDIDAT', 'Site web', '2024-11-05', '2025-02-05'),
('PROS_MAR_THE_006', ARRAY['theo.martinez@email.fr'], ARRAY['0667890123'], 'Martinez', 'Théo', ARRAY['CAP_BJ'], 'CAP_BJ', 'OPCO', 'CANDIDAT', 'Site web', '2024-11-06', '2025-02-06'),
('PROS_MOR_LEA_007', ARRAY['lea.moreau@email.fr'], ARRAY['0678901234'], 'Moreau', 'Léa', ARRAY['INIT_BJ'], 'INIT_BJ', 'Personnel', 'CANDIDAT', 'Site web', '2024-11-07', '2025-02-07'),
('PROS_SIM_HUG_008', ARRAY['hugo.simon@email.fr'], ARRAY['0689012345'], 'Simon', 'Hugo', ARRAY['INIT_BJ'], 'INIT_BJ', 'CPF', 'CANDIDAT', 'Site web', '2024-11-08', '2025-02-08'),
('PROS_ROU_ALI_009', ARRAY['alice.roux@email.fr'], ARRAY['0690123456'], 'Roux', 'Alice', ARRAY['PERF_SERTI'], 'PERF_SERTI', 'OPCO', 'CANDIDAT', 'Site web', '2024-11-09', '2025-02-09'),
('PROS_GIR_NOA_010', ARRAY['noah.girard@email.fr'], ARRAY['0601234567'], 'Girard', 'Noah', ARRAY['PERF_SERTI'], 'PERF_SERTI', 'Personnel', 'CANDIDAT', 'Site web', '2024-11-10', '2025-02-10'),
-- 5 prospects purs
('PROS_DUP_JEA_011', ARRAY['jean.dupont@email.fr'], ARRAY['0612340011'], 'Dupont', 'Jean', ARRAY['CAP_BJ'], 'CAP_BJ', NULL, 'NOUVEAU', 'Formulaire contact', '2025-02-01', '2025-02-06'),
('PROS_LER_MAR_012', ARRAY['marie.leroy@email.fr'], ARRAY['0623450012'], 'Leroy', 'Marie', ARRAY['INIT_BJ'], 'INIT_BJ', NULL, 'EN_ATTENTE_DOSSIER', 'Formulaire contact', '2025-02-02', '2025-02-07'),
('PROS_BOU_PIE_013', ARRAY['pierre.boucher@email.fr'], ARRAY['0634560013'], 'Boucher', 'Pierre', ARRAY['CAO_DAO'], 'CAO_DAO', NULL, 'NOUVEAU', 'Formulaire contact', '2025-02-03', '2025-02-08'),
('PROS_LAF_ANN_014', ARRAY['anne.lafont@email.fr'], ARRAY['0645670014'], 'Lafont', 'Anne', ARRAY['GEMMO'], 'GEMMO', NULL, 'NOUVEAU', 'Formulaire contact', '2025-02-04', '2025-02-09'),
('PROS_RIC_LOU_015', ARRAY['louis.richard@email.fr'], ARRAY['0656780015'], 'Richard', 'Louis', ARRAY['PERF_SERTI'], 'PERF_SERTI', NULL, 'NOUVEAU', 'Formulaire contact', '2025-02-05', '2025-02-10')
ON CONFLICT (id_prospect) DO NOTHING;

-- ============================================================
-- 7. CANDIDATS (10 candidats)
-- ============================================================

INSERT INTO candidats (id_prospect, numero_dossier, formations_demandees, formation_retenue, mode_financement, montant_total_formation, montant_prise_en_charge, reste_a_charge, statut_dossier, statut_financement, statut_inscription, score, notes_ia, entretien_telephonique, date_entretien_tel, rdv_presentiel, date_rdv_presentiel, test_technique, date_test_technique, validation_pedagogique, date_validation_pedagogique) VALUES
('PROS_DUR_SOP_001', 'DUSO00000001', ARRAY['CAP_BJ'], 'CAP_BJ', 'CPF', 8500, 8000, 500, 'INSCRIT', 'EN_COURS', 'VALIDEE', 85, 'Profil motivé. Excellent potentiel. Formation CAP_BJ adaptée au projet professionnel.', true, '2025-01-10', true, '2025-01-15', true, '2025-01-20', true, '2025-01-25'),
('PROS_BAR_MAX_002', 'BAMA00000002', ARRAY['CAP_BJ'], 'CAP_BJ', 'OPCO', 8500, 7500, 1000, 'ACCEPTE', 'VALIDE', 'EN_COURS', 78, 'Profil motivé. Bon profil. Formation CAP_BJ adaptée au projet professionnel.', true, '2025-01-11', true, '2025-01-16', true, '2025-01-21', true, '2025-01-26'),
('PROS_FON_CHL_003', 'FOCH00000003', ARRAY['CAP_BJ'], 'CAP_BJ', 'CPF', 8500, 8500, 0, 'INSCRIT', 'EN_COURS', 'VALIDEE', 92, 'Profil motivé. Excellent potentiel. Formation CAP_BJ adaptée au projet professionnel.', true, '2025-01-12', true, '2025-01-17', true, '2025-01-22', true, '2025-01-27'),
('PROS_LAM_LUC_004', 'LALU00000004', ARRAY['CAP_BJ'], 'CAP_BJ', 'France Travail', 8500, 8500, 0, 'ACCEPTE', 'VALIDE', 'EN_COURS', 68, 'Profil motivé. Profil correct. Formation CAP_BJ adaptée au projet professionnel.', true, '2025-01-13', true, '2025-01-18', false, NULL, true, '2025-01-28'),
('PROS_GAR_EMM_005', 'GAEM00000005', ARRAY['CAP_BJ'], 'CAP_BJ', 'Personnel', 8500, 0, 8500, 'INSCRIT', 'EN_COURS', 'VALIDEE', 74, 'Profil motivé. Bon profil. Formation CAP_BJ adaptée au projet professionnel.', true, '2025-01-14', true, '2025-01-19', true, '2025-01-23', true, '2025-01-29'),
('PROS_MAR_THE_006', 'MATH00000006', ARRAY['CAP_BJ'], 'CAP_BJ', 'OPCO', 8500, 6800, 1700, 'INSCRIT', 'VALIDE', 'VALIDEE', 81, 'Profil motivé. Excellent potentiel. Formation CAP_BJ adaptée au projet professionnel.', true, '2025-01-15', true, '2025-01-20', true, '2025-01-24', true, '2025-01-30'),
('PROS_MOR_LEA_007', 'MOLE00000007', ARRAY['INIT_BJ'], 'INIT_BJ', 'Personnel', 750, 0, 750, 'INSCRIT', 'VALIDE', 'VALIDEE', 55, 'Profil motivé. Profil correct. Formation INIT_BJ adaptée au projet professionnel.', true, '2025-01-16', false, NULL, false, NULL, true, '2025-01-31'),
('PROS_SIM_HUG_008', 'SIHU00000008', ARRAY['INIT_BJ'], 'INIT_BJ', 'CPF', 750, 750, 0, 'INSCRIT', 'EN_COURS', 'VALIDEE', 62, 'Profil motivé. Profil correct. Formation INIT_BJ adaptée au projet professionnel.', true, '2025-01-17', true, '2025-01-22', false, NULL, true, '2025-02-01'),
('PROS_ROU_ALI_009', 'ROAL00000009', ARRAY['PERF_SERTI'], 'PERF_SERTI', 'OPCO', 1500, 1500, 0, 'ACCEPTE', 'VALIDE', 'EN_COURS', 88, 'Profil motivé. Excellent potentiel. Formation PERF_SERTI adaptée au projet professionnel.', true, '2025-01-18', true, '2025-01-23', true, '2025-01-27', true, '2025-02-02'),
('PROS_GIR_NOA_010', 'GINO00000010', ARRAY['PERF_SERTI'], 'PERF_SERTI', 'Personnel', 1500, 1200, 300, 'ACCEPTE', 'VALIDE', 'EN_COURS', 72, 'Profil motivé. Bon profil. Formation PERF_SERTI adaptée au projet professionnel.', true, '2025-01-19', true, '2025-01-24', true, '2025-01-28', true, '2025-02-03')
ON CONFLICT (numero_dossier) DO NOTHING;

-- Mettre à jour les prospects avec numéro dossier
UPDATE prospects SET numero_dossier = 'DUSO00000001', statut_dossier = 'INSCRIT' WHERE id_prospect = 'PROS_DUR_SOP_001';
UPDATE prospects SET numero_dossier = 'BAMA00000002', statut_dossier = 'ACCEPTE' WHERE id_prospect = 'PROS_BAR_MAX_002';
UPDATE prospects SET numero_dossier = 'FOCH00000003', statut_dossier = 'INSCRIT' WHERE id_prospect = 'PROS_FON_CHL_003';
UPDATE prospects SET numero_dossier = 'LALU00000004', statut_dossier = 'ACCEPTE' WHERE id_prospect = 'PROS_LAM_LUC_004';
UPDATE prospects SET numero_dossier = 'GAEM00000005', statut_dossier = 'INSCRIT' WHERE id_prospect = 'PROS_GAR_EMM_005';
UPDATE prospects SET numero_dossier = 'MATH00000006', statut_dossier = 'INSCRIT' WHERE id_prospect = 'PROS_MAR_THE_006';
UPDATE prospects SET numero_dossier = 'MOLE00000007', statut_dossier = 'INSCRIT' WHERE id_prospect = 'PROS_MOR_LEA_007';
UPDATE prospects SET numero_dossier = 'SIHU00000008', statut_dossier = 'INSCRIT' WHERE id_prospect = 'PROS_SIM_HUG_008';
UPDATE prospects SET numero_dossier = 'ROAL00000009', statut_dossier = 'ACCEPTE' WHERE id_prospect = 'PROS_ROU_ALI_009';
UPDATE prospects SET numero_dossier = 'GINO00000010', statut_dossier = 'ACCEPTE' WHERE id_prospect = 'PROS_GIR_NOA_010';

-- ============================================================
-- 8. DOCUMENTS (4 par candidat = 40 documents)
-- ============================================================

-- Documents pour chaque candidat
INSERT INTO documents_candidat (id_prospect, numero_dossier, type_document, categorie, nom_fichier, url_drive, statut, obligatoire, date_reception, date_validation)
SELECT id_prospect, numero_dossier, 'CV', 'candidature', 'CV_' || numero_dossier || '.pdf', 'https://drive.google.com/file/d/FAKE_' || numero_dossier || '_CV', 'VALIDE', true, '2025-01-05', '2025-01-10'
FROM candidats;

INSERT INTO documents_candidat (id_prospect, numero_dossier, type_document, categorie, nom_fichier, url_drive, statut, obligatoire, date_reception, date_validation)
SELECT id_prospect, numero_dossier, 'LETTRE_MOTIVATION', 'candidature', 'LM_' || numero_dossier || '.pdf', 'https://drive.google.com/file/d/FAKE_' || numero_dossier || '_LM', 'VALIDE', true, '2025-01-05', '2025-01-10'
FROM candidats;

INSERT INTO documents_candidat (id_prospect, numero_dossier, type_document, categorie, nom_fichier, url_drive, statut, obligatoire, date_reception, date_validation)
SELECT id_prospect, numero_dossier, 'CNI_RECTO', 'candidature', 'CNI_R_' || numero_dossier || '.jpg', 'https://drive.google.com/file/d/FAKE_' || numero_dossier || '_CNI_R',
  CASE WHEN statut_dossier = 'INSCRIT' THEN 'VALIDE' ELSE 'RECU' END, true, '2025-01-05',
  CASE WHEN statut_dossier = 'INSCRIT' THEN '2025-01-10'::timestamptz ELSE NULL END
FROM candidats;

INSERT INTO documents_candidat (id_prospect, numero_dossier, type_document, categorie, nom_fichier, url_drive, statut, obligatoire, date_reception, date_validation)
SELECT id_prospect, numero_dossier, 'CNI_VERSO', 'candidature', 'CNI_V_' || numero_dossier || '.jpg', 'https://drive.google.com/file/d/FAKE_' || numero_dossier || '_CNI_V',
  CASE WHEN statut_dossier = 'INSCRIT' THEN 'VALIDE' ELSE 'RECU' END, true, '2025-01-05',
  CASE WHEN statut_dossier = 'INSCRIT' THEN '2025-01-10'::timestamptz ELSE NULL END
FROM candidats;

-- ============================================================
-- 9. ÉLÈVES (10 élèves)
-- ============================================================

INSERT INTO eleves (id_candidat, id_utilisateur, numero_dossier, formation_suivie, date_debut, date_fin_prevue, statut_formation, notes_generales)
SELECT
  c.id_candidat,
  u.id_utilisateur,
  c.numero_dossier,
  c.formation_retenue,
  CASE
    WHEN c.formation_retenue = 'CAP_BJ' THEN '2025-03-01'::date
    WHEN c.formation_retenue = 'INIT_BJ' THEN '2025-02-10'::date
    ELSE '2025-04-07'::date
  END,
  CASE
    WHEN c.formation_retenue = 'CAP_BJ' THEN '2025-09-30'::date
    WHEN c.formation_retenue = 'INIT_BJ' THEN '2025-02-14'::date
    ELSE '2025-04-18'::date
  END,
  'EN_COURS',
  'Élève sérieux'
FROM candidats c
JOIN prospects p ON c.id_prospect = p.id_prospect
JOIN utilisateurs u ON p.emails[1] = u.email
WHERE u.role = 'eleve'
ON CONFLICT (id_candidat) DO NOTHING;

-- ============================================================
-- 10. INSCRIPTIONS SESSIONS
-- ============================================================

-- Session 1 (CAP BJ) : 6 premiers élèves
INSERT INTO inscriptions_sessions (id_eleve, id_session, date_inscription, statut_inscription, date_confirmation)
SELECT e.id_eleve, s.id_session, '2025-02-15'::date, 'CONFIRME', '2025-02-20'::date
FROM eleves e
JOIN candidats c ON e.id_candidat = c.id_candidat
CROSS JOIN sessions s
WHERE c.formation_retenue = 'CAP_BJ' AND s.nom_session = 'CAP BJ — Session Mars 2025'
ON CONFLICT DO NOTHING;

-- Session 2 (Initiation) : 2 élèves
INSERT INTO inscriptions_sessions (id_eleve, id_session, date_inscription, statut_inscription, date_confirmation)
SELECT e.id_eleve, s.id_session, '2025-02-01'::date, 'CONFIRME', '2025-02-05'::date
FROM eleves e
JOIN candidats c ON e.id_candidat = c.id_candidat
CROSS JOIN sessions s
WHERE c.formation_retenue = 'INIT_BJ' AND s.nom_session = 'Initiation BJ — Février 2025'
ON CONFLICT DO NOTHING;

-- Session 3 (Perfectionnement) : 2 élèves
INSERT INTO inscriptions_sessions (id_eleve, id_session, date_inscription, statut_inscription, date_confirmation)
SELECT e.id_eleve, s.id_session, '2025-03-20'::date, 'INSCRIT', NULL
FROM eleves e
JOIN candidats c ON e.id_candidat = c.id_candidat
CROSS JOIN sessions s
WHERE c.formation_retenue = 'PERF_SERTI' AND s.nom_session = 'Perfectionnement Sertissage — Avril 2025'
ON CONFLICT DO NOTHING;

COMMIT;

-- ============================================================
-- VÉRIFICATION
-- ============================================================

SELECT 'Utilisateurs' as table_name, COUNT(*) as count FROM utilisateurs
UNION ALL SELECT 'Formateurs', COUNT(*) FROM formateurs
UNION ALL SELECT 'Formations', COUNT(*) FROM formations
UNION ALL SELECT 'Sessions', COUNT(*) FROM sessions
UNION ALL SELECT 'Prospects', COUNT(*) FROM prospects
UNION ALL SELECT 'Candidats', COUNT(*) FROM candidats
UNION ALL SELECT 'Documents', COUNT(*) FROM documents_candidat
UNION ALL SELECT 'Élèves', COUNT(*) FROM eleves
UNION ALL SELECT 'Inscriptions', COUNT(*) FROM inscriptions_sessions;

-- Afficher les comptes de test
SELECT '=== COMPTES DE TEST ===' as info;
SELECT 'Admin: admin@abj.fr / ABJ2024!' as compte
UNION ALL SELECT 'Formateur 1: laurent.dubois@abj.fr / ABJ2024!'
UNION ALL SELECT 'Élève 1: sophie.durand@email.fr / ABJ2024!';
