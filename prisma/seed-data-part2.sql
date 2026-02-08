-- ============================================================
-- SEED ENRICHI PARTIE 2 - CRM ABJ
-- Évaluations, Présences, Interventions, Disponibilités, Emails, Marjorie
-- ============================================================

BEGIN;

-- ============================================================
-- 11. ÉVALUATIONS (~25 évaluations, 2-3 par élève)
-- ============================================================

-- Élèves CAP BJ (6 élèves, session 1)
INSERT INTO evaluations (id_eleve, id_session, id_formateur, type_evaluation, date_evaluation, note, note_sur, appreciation, competences_validees, commentaire, valide_par_admin, date_validation)
SELECT
  e.id_eleve,
  s.id_session,
  s.formateur_principal_id,
  'CONTROLE_CONTINU',
  '2025-02-15'::date,
  14.5,
  20,
  'Très bien',
  ARRAY['Maîtrise technique', 'Précision'],
  'Bon travail',
  true,
  '2025-02-20'::timestamptz
FROM eleves e
JOIN candidats c ON e.id_candidat = c.id_candidat
JOIN sessions s ON s.nom_session = 'CAP BJ — Session Mars 2025'
WHERE c.formation_retenue = 'CAP_BJ'
LIMIT 6;

INSERT INTO evaluations (id_eleve, id_session, id_formateur, type_evaluation, date_evaluation, note, note_sur, appreciation, competences_validees, commentaire, valide_par_admin, date_validation)
SELECT
  e.id_eleve,
  s.id_session,
  s.formateur_principal_id,
  'CONTROLE_CONTINU',
  '2025-02-22'::date,
  CASE
    WHEN e.id_eleve % 3 = 0 THEN 16.5
    WHEN e.id_eleve % 3 = 1 THEN 12.0
    ELSE 15.0
  END,
  20,
  CASE
    WHEN e.id_eleve % 3 = 0 THEN 'Excellent travail'
    WHEN e.id_eleve % 3 = 1 THEN 'Bien'
    ELSE 'Très bien'
  END,
  ARRAY['Maîtrise technique'],
  'Deuxième évaluation',
  true,
  '2025-02-27'::timestamptz
FROM eleves e
JOIN candidats c ON e.id_candidat = c.id_candidat
JOIN sessions s ON s.nom_session = 'CAP BJ — Session Mars 2025'
WHERE c.formation_retenue = 'CAP_BJ'
LIMIT 6;

-- Élèves Initiation (2 élèves, session 2)
INSERT INTO evaluations (id_eleve, id_session, id_formateur, type_evaluation, date_evaluation, note, note_sur, appreciation, competences_validees, commentaire, valide_par_admin, date_validation)
SELECT
  e.id_eleve,
  s.id_session,
  s.formateur_principal_id,
  'CONTROLE_CONTINU',
  '2025-02-13'::date,
  13.5,
  20,
  'Bien',
  ARRAY['Découverte des outils'],
  'Bon début',
  true,
  '2025-02-14'::timestamptz
FROM eleves e
JOIN candidats c ON e.id_candidat = c.id_candidat
JOIN sessions s ON s.nom_session = 'Initiation BJ — Février 2025'
WHERE c.formation_retenue = 'INIT_BJ';

-- Élèves Perfectionnement (2 élèves)
INSERT INTO evaluations (id_eleve, id_session, id_formateur, type_evaluation, date_evaluation, note, note_sur, appreciation, competences_validees, commentaire, valide_par_admin, date_validation)
SELECT
  e.id_eleve,
  s.id_session,
  s.formateur_principal_id,
  'EXAMEN_BLANC',
  '2025-04-10'::date,
  17.0,
  20,
  'Excellent travail',
  ARRAY['Sertissage avancé', 'Précision'],
  'Très bon niveau',
  true,
  '2025-04-15'::timestamptz
FROM eleves e
JOIN candidats c ON e.id_candidat = c.id_candidat
JOIN sessions s ON s.nom_session = 'Perfectionnement Sertissage — Avril 2025'
WHERE c.formation_retenue = 'PERF_SERTI';

-- ============================================================
-- 12. PRÉSENCES (~70 présences, 6-8 par élève)
-- ============================================================

-- Générer 7 présences pour chaque élève CAP BJ
INSERT INTO presences (id_eleve, id_session, date_cours, demi_journee, statut_presence, justificatif_fourni, saisi_par)
SELECT
  e.id_eleve,
  s.id_session,
  '2025-02-10'::date + (serie.n || ' days')::interval,
  CASE WHEN serie.n % 2 = 0 THEN 'MATIN' ELSE 'APRES_MIDI' END,
  CASE
    WHEN serie.n = 3 THEN 'ABSENT'
    WHEN serie.n = 5 THEN 'RETARD'
    ELSE 'PRESENT'
  END,
  false,
  'Formateur'
FROM eleves e
JOIN candidats c ON e.id_candidat = c.id_candidat
JOIN sessions s ON s.nom_session = 'CAP BJ — Session Mars 2025'
CROSS JOIN generate_series(0, 6) AS serie(n)
WHERE c.formation_retenue = 'CAP_BJ';

-- Présences pour élèves Initiation
INSERT INTO presences (id_eleve, id_session, date_cours, demi_journee, statut_presence, justificatif_fourni, saisi_par)
SELECT
  e.id_eleve,
  s.id_session,
  '2025-02-10'::date + (serie.n || ' days')::interval,
  'JOURNEE_COMPLETE',
  'PRESENT',
  false,
  'Formateur'
FROM eleves e
JOIN candidats c ON e.id_candidat = c.id_candidat
JOIN sessions s ON s.nom_session = 'Initiation BJ — Février 2025'
CROSS JOIN generate_series(0, 4) AS serie(n)
WHERE c.formation_retenue = 'INIT_BJ';

-- Présences pour élèves Perfectionnement
INSERT INTO presences (id_eleve, id_session, date_cours, demi_journee, statut_presence, justificatif_fourni, saisi_par)
SELECT
  e.id_eleve,
  s.id_session,
  '2025-04-07'::date + (serie.n * 2 || ' days')::interval,
  CASE WHEN serie.n % 2 = 0 THEN 'MATIN' ELSE 'APRES_MIDI' END,
  'PRESENT',
  false,
  'Formateur'
FROM eleves e
JOIN candidats c ON e.id_candidat = c.id_candidat
JOIN sessions s ON s.nom_session = 'Perfectionnement Sertissage — Avril 2025'
CROSS JOIN generate_series(0, 5) AS serie(n)
WHERE c.formation_retenue = 'PERF_SERTI';

-- ============================================================
-- 13. INTERVENTIONS FORMATEURS (~15-20 interventions)
-- ============================================================

INSERT INTO interventions_formateurs (id_formateur, id_session, date_intervention, duree_heures, sujet, cout, facture_payee, date_paiement)
SELECT
  f.id_formateur,
  s.id_session,
  s.date_debut + (serie.n * 7 || ' days')::interval,
  7,
  'Cours ' || (serie.n + 1) || ' - ' || f.specialites[1],
  f.tarif_journalier,
  CASE WHEN serie.n = 0 THEN true ELSE false END,
  CASE WHEN serie.n = 0 THEN '2025-03-01'::date ELSE NULL END
FROM formateurs f
CROSS JOIN sessions s
CROSS JOIN generate_series(0, 2) AS serie(n)
WHERE f.id_formateur = s.formateur_principal_id
LIMIT 20;

-- ============================================================
-- 14. DISPONIBILITÉS FORMATEURS (~12 disponibilités)
-- ============================================================

INSERT INTO disponibilites_formateurs (id_formateur, date_debut, date_fin, type_disponibilite, formation_concernee)
SELECT
  f.id_formateur,
  '2025-04-01'::date + (f.id_formateur * 5 + serie.n * 14 || ' days')::interval,
  '2025-04-01'::date + (f.id_formateur * 5 + serie.n * 14 + 5 || ' days')::interval,
  CASE WHEN serie.n = 0 THEN 'CONFIRME' ELSE 'DISPONIBLE' END,
  f.specialites[1]
FROM formateurs f
CROSS JOIN generate_series(0, 1) AS serie(n);

-- ============================================================
-- 15. HISTORIQUE EMAILS (~20 emails)
-- ============================================================

INSERT INTO historique_emails (id_email, id_prospect, sens, email_expediteur, email_destinataire, objet, contenu, statut, reponse_envoyee, date_reponse, intention_detectee, formation_detectee)
SELECT
  'EMAIL_' || LPAD((ROW_NUMBER() OVER())::text, 6, '0'),
  p.id_prospect,
  CASE WHEN (ROW_NUMBER() OVER()) % 3 = 0 THEN 'sortant' ELSE 'entrant' END,
  CASE WHEN (ROW_NUMBER() OVER()) % 3 = 0 THEN 'contact@abj.fr' ELSE p.emails[1] END,
  CASE WHEN (ROW_NUMBER() OVER()) % 3 = 0 THEN p.emails[1] ELSE 'contact@abj.fr' END,
  CASE WHEN (ROW_NUMBER() OVER()) % 3 = 0 THEN 'Réponse formation ' || p.formation_principale ELSE 'Demande information ' || p.formation_principale END,
  CASE WHEN (ROW_NUMBER() OVER()) % 3 = 0 THEN 'Bonjour, nous vous remercions de votre intérêt...' ELSE 'Bonjour, je souhaite des informations sur vos formations...' END,
  'TRAITE',
  CASE WHEN (ROW_NUMBER() OVER()) % 3 != 0 THEN true ELSE false END,
  CASE WHEN (ROW_NUMBER() OVER()) % 3 != 0 THEN ('2025-02-01'::date + ((ROW_NUMBER() OVER()) || ' days')::interval)::timestamptz ELSE NULL END,
  'Demande information',
  p.formation_principale
FROM prospects p
LIMIT 20;

-- ============================================================
-- 16. HISTORIQUE MARJORIE CRM (~11 messages)
-- ============================================================

-- Messages admin (5)
INSERT INTO historique_marjorie_crm (id_utilisateur, role_utilisateur, message_utilisateur, reponse_marjorie, contexte, duree_reponse_ms)
SELECT
  u.id_utilisateur,
  'admin',
  'Combien de candidats en attente validation ?',
  'Il y a actuellement ' || (SELECT COUNT(*) FROM candidats WHERE statut_dossier = 'ACCEPTE')::text || ' candidats en attente de validation.',
  '{"page":"dashboard"}'::jsonb,
  250 + (ROW_NUMBER() OVER()) * 50
FROM utilisateurs u
WHERE u.role = 'admin'
LIMIT 5;

-- Messages formateurs (3)
INSERT INTO historique_marjorie_crm (id_utilisateur, role_utilisateur, message_utilisateur, reponse_marjorie, contexte, duree_reponse_ms)
SELECT
  u.id_utilisateur,
  'professeur',
  'Qui sont mes élèves cette semaine ?',
  'Vous avez 6 élèves cette semaine pour la session CAP BJ.',
  '{"page":"mes-eleves"}'::jsonb,
  320 + (ROW_NUMBER() OVER()) * 40
FROM utilisateurs u
WHERE u.role = 'professeur'
LIMIT 3;

-- Messages élèves (3)
INSERT INTO historique_marjorie_crm (id_utilisateur, role_utilisateur, message_utilisateur, reponse_marjorie, contexte, duree_reponse_ms)
SELECT
  u.id_utilisateur,
  'eleve',
  'Quelle est ma moyenne actuelle ?',
  'Ta moyenne actuelle est de ' || (12 + (ROW_NUMBER() OVER()) * 2)::text || '.0/20. Continue comme ça !',
  '{"page":"mes-notes"}'::jsonb,
  180 + (ROW_NUMBER() OVER()) * 30
FROM utilisateurs u
WHERE u.role = 'eleve'
LIMIT 3;

COMMIT;

-- ============================================================
-- VÉRIFICATION FINALE
-- ============================================================

SELECT '=== RÉCAPITULATIF COMPLET ===' as info;

SELECT 'Utilisateurs' as table_name, COUNT(*) as count FROM utilisateurs
UNION ALL SELECT 'Formateurs', COUNT(*) FROM formateurs
UNION ALL SELECT 'Formations', COUNT(*) FROM formations
UNION ALL SELECT 'Sessions', COUNT(*) FROM sessions
UNION ALL SELECT 'Prospects', COUNT(*) FROM prospects
UNION ALL SELECT 'Candidats', COUNT(*) FROM candidats
UNION ALL SELECT 'Documents', COUNT(*) FROM documents_candidat
UNION ALL SELECT 'Élèves', COUNT(*) FROM eleves
UNION ALL SELECT 'Inscriptions', COUNT(*) FROM inscriptions_sessions
UNION ALL SELECT 'Évaluations', COUNT(*) FROM evaluations
UNION ALL SELECT 'Présences', COUNT(*) FROM presences
UNION ALL SELECT 'Interventions', COUNT(*) FROM interventions_formateurs
UNION ALL SELECT 'Disponibilités', COUNT(*) FROM disponibilites_formateurs
UNION ALL SELECT 'Emails', COUNT(*) FROM historique_emails
UNION ALL SELECT 'Marjorie CRM', COUNT(*) FROM historique_marjorie_crm;

SELECT '🎉 SEED ENRICHI TERMINÉ !' as message;
