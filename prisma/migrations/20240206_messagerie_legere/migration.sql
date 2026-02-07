-- ============================================================
-- SYSTÈME D'ANNONCES ET NOTIFICATIONS LÉGÈRES
-- Au lieu d'une messagerie interne complète (redondante)
-- ============================================================

-- Table pour les annonces/communications importantes
CREATE TABLE "annonces" (
    "id_annonce" SERIAL PRIMARY KEY,
    "auteur_id" INTEGER NOT NULL,
    "type_annonce" VARCHAR(50) NOT NULL, -- INFO | URGENT | RAPPEL | EXERCICE
    "titre" VARCHAR(255) NOT NULL,
    "contenu" TEXT NOT NULL,
    "cible_type" VARCHAR(50) NOT NULL, -- TOUS | SESSION | ELEVE | FORMATEURS
    "cible_sessions" INTEGER[], -- IDs des sessions concernées si applicable
    "cible_eleves" INTEGER[], -- IDs spécifiques si message ciblé
    "date_publication" TIMESTAMPTZ DEFAULT NOW(),
    "date_expiration" TIMESTAMPTZ, -- Pour les annonces temporaires
    "priorite" INTEGER DEFAULT 0, -- 0=normal, 1=important, 2=urgent
    "actif" BOOLEAN DEFAULT TRUE,
    "cree_le" TIMESTAMPTZ DEFAULT NOW(),
    "modifie_le" TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour tracker qui a lu quoi
CREATE TABLE "annonces_lues" (
    "id_lecture" SERIAL PRIMARY KEY,
    "id_annonce" INTEGER NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "lu_le" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("id_annonce", "id_utilisateur")
);

-- Table pour les notifications push/email
CREATE TABLE "notifications" (
    "id_notification" SERIAL PRIMARY KEY,
    "id_utilisateur" INTEGER NOT NULL,
    "type_notification" VARCHAR(50) NOT NULL, -- NOUVELLE_ANNONCE | RAPPEL_COURS | EVALUATION | DOCUMENT_MANQUANT
    "titre" VARCHAR(255) NOT NULL,
    "message" TEXT,
    "lien_action" VARCHAR(500), -- Lien vers la page concernée dans le CRM
    "lu" BOOLEAN DEFAULT FALSE,
    "envoye_email" BOOLEAN DEFAULT FALSE,
    "envoye_push" BOOLEAN DEFAULT FALSE,
    "date_creation" TIMESTAMPTZ DEFAULT NOW(),
    "date_lecture" TIMESTAMPTZ,
    "priorite" INTEGER DEFAULT 0
);

-- Extension de la table HistoriqueMarjorieCrm pour les messages proactifs de Marjorie
CREATE TABLE "messages_marjorie_proactifs" (
    "id_message_proactif" SERIAL PRIMARY KEY,
    "destinataire_id" INTEGER NOT NULL,
    "type_message" VARCHAR(50) NOT NULL, -- RAPPEL | CONSEIL | ENCOURAGEMENT | ALERTE
    "contexte" VARCHAR(100), -- formation_debut | evaluation_proche | documents_manquants
    "message" TEXT NOT NULL,
    "donnees_contexte" JSONB, -- Données qui ont déclenché le message
    "affiche" BOOLEAN DEFAULT FALSE,
    "lu" BOOLEAN DEFAULT FALSE,
    "repondu" BOOLEAN DEFAULT FALSE,
    "date_envoi" TIMESTAMPTZ DEFAULT NOW(),
    "date_lecture" TIMESTAMPTZ,
    "score_pertinence" DECIMAL(3,2) -- Score IA de pertinence du message (0-1)
);

-- Index pour les performances
CREATE INDEX "idx_annonces_actif" ON "annonces"("actif");
CREATE INDEX "idx_annonces_date_pub" ON "annonces"("date_publication" DESC);
CREATE INDEX "idx_annonces_auteur" ON "annonces"("auteur_id");
CREATE INDEX "idx_annonces_lues_user" ON "annonces_lues"("id_utilisateur");
CREATE INDEX "idx_notifications_user" ON "notifications"("id_utilisateur", "lu");
CREATE INDEX "idx_notifications_date" ON "notifications"("date_creation" DESC);
CREATE INDEX "idx_marjorie_proactif_dest" ON "messages_marjorie_proactifs"("destinataire_id", "affiche");

-- Foreign Keys
ALTER TABLE "annonces"
    ADD CONSTRAINT "fk_annonces_auteur"
    FOREIGN KEY ("auteur_id") REFERENCES "utilisateurs"("id_utilisateur");

ALTER TABLE "annonces_lues"
    ADD CONSTRAINT "fk_annonces_lues_annonce"
    FOREIGN KEY ("id_annonce") REFERENCES "annonces"("id_annonce") ON DELETE CASCADE,
    ADD CONSTRAINT "fk_annonces_lues_utilisateur"
    FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur");

ALTER TABLE "notifications"
    ADD CONSTRAINT "fk_notifications_utilisateur"
    FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur");

ALTER TABLE "messages_marjorie_proactifs"
    ADD CONSTRAINT "fk_marjorie_proactif_destinataire"
    FOREIGN KEY ("destinataire_id") REFERENCES "utilisateurs"("id_utilisateur");

-- Commentaires explicatifs
COMMENT ON TABLE "annonces" IS 'Communications importantes des formateurs vers leurs élèves ou entre formateurs';
COMMENT ON TABLE "notifications" IS 'Notifications système pour alerter les utilisateurs d événements importants';
COMMENT ON TABLE "messages_marjorie_proactifs" IS 'Messages proactifs de l IA Marjorie basés sur le contexte de l utilisateur';
COMMENT ON COLUMN "annonces"."cible_type" IS 'TOUS=tout le monde | SESSION=élèves d une session | ELEVE=élèves spécifiques | FORMATEURS=entre profs';
COMMENT ON COLUMN "messages_marjorie_proactifs"."score_pertinence" IS 'Score calculé par l IA pour déterminer la pertinence du message (0=peu pertinent, 1=très pertinent)';