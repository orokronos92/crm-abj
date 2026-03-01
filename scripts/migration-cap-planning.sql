-- =============================================================
-- Migration : Support formations CAP dans le planning
-- Date      : 2026-03-01
-- Base      : abj_crm (VPS Hostinger)
-- Auteur    : Claude Code
-- =============================================================
-- À exécuter dans l'ordre. Toutes les colonnes sont nullable
-- → aucun risque sur les données existantes.
-- =============================================================

-- -------------------------------------------------------------
-- 1. TABLE matieres — référentiel des matières enseignées ABJ
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "matieres" (
    "id_matiere"  SERIAL          NOT NULL,
    "nom"         TEXT            NOT NULL,
    "code"        TEXT,
    "categorie"   TEXT,                        -- 'PRATIQUE' | 'THEORIQUE'
    "actif"       BOOLEAN         NOT NULL DEFAULT true,
    "cree_le"     TIMESTAMPTZ(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifie_le"  TIMESTAMPTZ(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matieres_pkey" PRIMARY KEY ("id_matiere")
);

CREATE UNIQUE INDEX IF NOT EXISTS "matieres_nom_key"  ON "matieres"("nom");
CREATE UNIQUE INDEX IF NOT EXISTS "matieres_code_key" ON "matieres"("code");
CREATE INDEX        IF NOT EXISTS "matieres_actif_idx" ON "matieres"("actif");

GRANT ALL ON "matieres" TO crm_dev;
GRANT USAGE, SELECT ON SEQUENCE "matieres_id_matiere_seq" TO crm_dev;

-- -------------------------------------------------------------
-- 2. TABLE sessions — type et statistiques programme CAP
-- -------------------------------------------------------------
ALTER TABLE "sessions"
    ADD COLUMN IF NOT EXISTS "type_formation"         TEXT    DEFAULT 'COURTE',  -- 'COURTE' | 'CAP'
    ADD COLUMN IF NOT EXISTS "total_heures_programme" INTEGER,                    -- ex: 800 pour un CAP
    ADD COLUMN IF NOT EXISTS "nb_matieres"            INTEGER,                    -- nb matières distinctes
    ADD COLUMN IF NOT EXISTS "programme_resume"       TEXT;                       -- résumé lisible Marjorie

CREATE INDEX IF NOT EXISTS "sessions_type_formation_idx" ON "sessions"("type_formation");

-- -------------------------------------------------------------
-- 3. TABLE reservations_salles — contexte pédagogique créneau
-- -------------------------------------------------------------

-- 3a. Fix timezone (déjà appliqué sur VPS — clause USING pour sécurité)
ALTER TABLE "reservations_salles"
    ALTER COLUMN "date_debut" SET DATA TYPE TIMESTAMPTZ(6),
    ALTER COLUMN "date_fin"   SET DATA TYPE TIMESTAMPTZ(6);

-- 3b. Nouveaux champs CAP
ALTER TABLE "reservations_salles"
    ADD COLUMN IF NOT EXISTS "matiere"        TEXT,                       -- matière enseignée sur ce créneau
    ADD COLUMN IF NOT EXISTS "id_formateur"   INTEGER,                    -- formateur du créneau (peut ≠ formateur principal)
    ADD COLUMN IF NOT EXISTS "type_formation" TEXT DEFAULT 'COURTE';      -- 'COURTE' | 'CAP'

-- 3c. Clé étrangère vers formateurs
ALTER TABLE "reservations_salles"
    DROP CONSTRAINT IF EXISTS "reservations_salles_id_formateur_fkey";

ALTER TABLE "reservations_salles"
    ADD CONSTRAINT "reservations_salles_id_formateur_fkey"
    FOREIGN KEY ("id_formateur")
    REFERENCES "formateurs"("id_formateur")
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- 3d. Index
CREATE INDEX IF NOT EXISTS "reservations_salles_id_formateur_idx"   ON "reservations_salles"("id_formateur");
CREATE INDEX IF NOT EXISTS "reservations_salles_matiere_idx"         ON "reservations_salles"("matiere");
CREATE INDEX IF NOT EXISTS "reservations_salles_type_formation_idx"  ON "reservations_salles"("type_formation");

-- =============================================================
-- Vérification rapide après exécution :
-- =============================================================
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name IN ('matieres','sessions','reservations_salles')
--   ORDER BY table_name, ordinal_position;
-- =============================================================
