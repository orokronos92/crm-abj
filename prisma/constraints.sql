-- =============================================================================
-- constraints.sql — Contraintes CHECK de la BDD prod abj_crm
-- =============================================================================
-- Prisma ne génère pas ces contraintes automatiquement (champs déclarés String
-- sans validation au niveau ORM). Ce script doit être exécuté manuellement
-- après chaque `prisma db push` ou `prisma migrate deploy` sur une nouvelle base.
--
-- Idempotent : DROP CONSTRAINT IF EXISTS avant chaque ADD CONSTRAINT.
--
-- Usage :
--   psql -h <host> -U <user> -d abj_crm -f prisma/constraints.sql
--
-- Pour vérifier les contraintes existantes sur la BDD :
--   SELECT c.conrelid::regclass AS table_name, c.conname, pg_get_constraintdef(c.oid)
--   FROM pg_constraint c
--   JOIN pg_namespace n ON n.oid = c.connamespace
--   WHERE n.nspname = 'public' AND c.contype = 'c'
--   ORDER BY c.conrelid::regclass, c.conname;
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table : prospects
-- -----------------------------------------------------------------------------

ALTER TABLE prospects DROP CONSTRAINT IF EXISTS prospects_statut_check;
ALTER TABLE prospects ADD CONSTRAINT prospects_statut_check
  CHECK (statut_prospect = ANY (ARRAY[
    'NOUVEAU'::text,
    'FROID'::text,
    'TIEDE'::text,
    'CHAUD'::text,
    'INSCRIT'::text,
    'PERDU'::text,
    'EN_ATTENTE_DOSSIER'::text,
    'CANDIDAT'::text,
    'CONTACT'::text,
    'ANCIEN_CANDIDAT'::text,
    'ELEVE'::text
  ]));

ALTER TABLE prospects DROP CONSTRAINT IF EXISTS prospects_statut_dossier_check;
ALTER TABLE prospects ADD CONSTRAINT prospects_statut_dossier_check
  CHECK (statut_dossier = ANY (ARRAY[
    'AUCUN'::text,
    'FORMULAIRE_ENVOYE'::text,
    'ENVOYE'::text,
    'DOSSIER_RECU'::text,
    'DOSSIER_COMPLET'::text,
    'DOSSIER_VALIDE'::text,
    'FINANCEMENT_ATTENTE'::text,
    'FINANCEMENT_OK'::text,
    'FINANCEMENT_REFUSE'::text,
    'INSCRIT'::text,
    'EN_FORMATION'::text,
    'DIPLOME'::text,
    'ABANDON'::text
  ]));

-- -----------------------------------------------------------------------------
-- Table : historique_emails
-- -----------------------------------------------------------------------------

ALTER TABLE historique_emails DROP CONSTRAINT IF EXISTS historique_emails_sens_check;
ALTER TABLE historique_emails ADD CONSTRAINT historique_emails_sens_check
  CHECK (sens = ANY (ARRAY[
    'entrant'::text,
    'sortant'::text
  ]));

-- -----------------------------------------------------------------------------
-- Table : documents_candidat
-- -----------------------------------------------------------------------------

ALTER TABLE documents_candidat DROP CONSTRAINT IF EXISTS check_statut_document;
ALTER TABLE documents_candidat ADD CONSTRAINT check_statut_document
  CHECK (statut = ANY (ARRAY[
    'ATTENDU'::text,
    'RECU'::text,
    'A_VALIDER'::text,
    'VALIDE'::text,
    'REFUSE'::text,
    'EXPIRE'::text
  ]));
