-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "prospects" (
    "id_prospect" TEXT NOT NULL,
    "emails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "telephones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "nom" TEXT,
    "prenom" TEXT,
    "date_naissance" DATE,
    "adresse" TEXT,
    "code_postal" TEXT,
    "ville" TEXT,
    "formations_souhaitees" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "formation_principale" TEXT,
    "mode_financement" TEXT,
    "organisme_financeur" TEXT,
    "situation_actuelle" TEXT,
    "niveau_etudes" TEXT,
    "projet_professionnel" TEXT,
    "freins_identifies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "motivations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "resume_ia" TEXT,
    "statut_prospect" TEXT,
    "statut_dossier" TEXT,
    "statut_devis" TEXT,
    "source_origine" TEXT,
    "mode_decouverte" TEXT,
    "message_initial" TEXT,
    "derniere_intention" TEXT,
    "prochaine_action" TEXT,
    "derniere_action" TEXT,
    "notes" TEXT,
    "date_premier_contact" TIMESTAMPTZ(6),
    "date_dernier_contact" TIMESTAMPTZ(6),
    "dossier_envoye_le" TIMESTAMPTZ(6),
    "dossier_recu_le" TIMESTAMPTZ(6),
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifie_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nb_echanges" INTEGER NOT NULL DEFAULT 0,
    "numero_dossier" TEXT,
    "lien_dossier_drive" TEXT,
    "lien_fiche_candidat" TEXT,

    CONSTRAINT "prospects_pkey" PRIMARY KEY ("id_prospect")
);

-- CreateTable
CREATE TABLE "candidats" (
    "id_candidat" SERIAL NOT NULL,
    "id_prospect" TEXT NOT NULL,
    "numero_dossier" TEXT NOT NULL,
    "formations_demandees" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "formation_retenue" TEXT,
    "session_visee" TEXT,
    "date_debut_souhaitee" DATE,
    "mode_financement" TEXT,
    "organisme_financeur" TEXT,
    "montant_total_formation" DECIMAL(10,2),
    "montant_prise_en_charge" DECIMAL(10,2),
    "reste_a_charge" DECIMAL(10,2),
    "statut_dossier" TEXT NOT NULL DEFAULT 'RECU',
    "statut_financement" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "statut_inscription" TEXT NOT NULL DEFAULT 'EN_COURS',
    "devis_envoye" BOOLEAN NOT NULL DEFAULT false,
    "date_devis" DATE,
    "accord_prise_en_charge" BOOLEAN NOT NULL DEFAULT false,
    "dossier_opco_depose" BOOLEAN NOT NULL DEFAULT false,
    "financement_valide" BOOLEAN NOT NULL DEFAULT false,
    "acompte_recu" BOOLEAN NOT NULL DEFAULT false,
    "date_acompte" DATE,
    "solde_regle" BOOLEAN NOT NULL DEFAULT false,
    "date_solde" DATE,
    "entretien_telephonique" BOOLEAN NOT NULL DEFAULT false,
    "date_entretien_tel" DATE,
    "rdv_presentiel" BOOLEAN NOT NULL DEFAULT false,
    "date_rdv_presentiel" DATE,
    "test_technique" BOOLEAN NOT NULL DEFAULT false,
    "date_test_technique" DATE,
    "validation_pedagogique" BOOLEAN NOT NULL DEFAULT false,
    "date_validation_pedagogique" DATE,
    "date_decision" TIMESTAMPTZ(6),
    "decision" TEXT,
    "decide_par" TEXT,
    "motif_decision" TEXT,
    "url_dossier_drive" TEXT,
    "url_fiche_candidat" TEXT,
    "notes" TEXT,
    "date_candidature" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifie_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER,
    "notes_ia" TEXT,

    CONSTRAINT "candidats_pkey" PRIMARY KEY ("id_candidat")
);

-- CreateTable
CREATE TABLE "documents_candidat" (
    "id_document" SERIAL NOT NULL,
    "id_prospect" TEXT NOT NULL,
    "numero_dossier" TEXT,
    "type_document" TEXT NOT NULL,
    "categorie" TEXT NOT NULL DEFAULT 'candidature',
    "nom_fichier" TEXT,
    "url_drive" TEXT,
    "id_drive" TEXT,
    "mime_type" TEXT,
    "taille_octets" INTEGER,
    "statut" TEXT NOT NULL DEFAULT 'ATTENDU',
    "obligatoire" BOOLEAN NOT NULL DEFAULT false,
    "date_reception" TIMESTAMPTZ(6),
    "date_validation" TIMESTAMPTZ(6),
    "valide_par" TEXT,
    "motif_refus" TEXT,
    "commentaire" TEXT,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifie_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_candidat_pkey" PRIMARY KEY ("id_document")
);

-- CreateTable
CREATE TABLE "historique_emails" (
    "id_email" TEXT NOT NULL,
    "id_prospect" TEXT,
    "date_reception" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifie_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sens" TEXT NOT NULL,
    "email_expediteur" TEXT,
    "nom_expediteur" TEXT,
    "email_destinataire" TEXT,
    "objet" TEXT,
    "objet_normalise" TEXT,
    "contenu" TEXT,
    "extrait" TEXT,
    "cle_conversation" TEXT,
    "cle_conversation_v2" TEXT,
    "cle_participants" TEXT,
    "id_fil" TEXT,
    "id_message" TEXT,
    "intention_detectee" TEXT,
    "formation_detectee" TEXT,
    "session_detectee" TEXT,
    "financement_detecte" TEXT,
    "telephone_detecte" TEXT,
    "resume" TEXT,
    "classification_ia" JSONB,
    "statut" TEXT NOT NULL DEFAULT 'NOUVEAU',
    "reponse_envoyee" BOOLEAN NOT NULL DEFAULT false,
    "date_reponse" TIMESTAMPTZ(6),
    "responsable" TEXT,
    "prochaine_action" TEXT,
    "brouillon_objet" TEXT,
    "brouillon_contenu" TEXT,
    "relance_necessaire" BOOLEAN NOT NULL DEFAULT false,
    "needs_followup" BOOLEAN NOT NULL DEFAULT false,
    "infos_manquantes" TEXT,
    "notes" TEXT,
    "metadonnees_brutes" JSONB,

    CONSTRAINT "historique_emails_pkey" PRIMARY KEY ("id_email")
);

-- CreateTable
CREATE TABLE "journal_erreurs" (
    "id" SERIAL NOT NULL,
    "date_erreur" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nom_workflow" TEXT,
    "nom_noeud" TEXT,
    "message_erreur" TEXT,
    "donnees_entree" JSONB,
    "resolu" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "journal_erreurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statuts_documents" (
    "code" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "description" TEXT,
    "couleur" TEXT,
    "ordre" INTEGER,
    "action_requise" TEXT,

    CONSTRAINT "statuts_documents_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "types_documents" (
    "code" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "categorie" TEXT NOT NULL DEFAULT 'candidature',
    "obligatoire" BOOLEAN NOT NULL DEFAULT false,
    "ordre_affichage" INTEGER,
    "description" TEXT,

    CONSTRAINT "types_documents_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id_utilisateur" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "mot_de_passe_hash" TEXT,
    "nom" TEXT,
    "prenom" TEXT,
    "role" TEXT NOT NULL,
    "statut_compte" TEXT NOT NULL DEFAULT 'ACTIF',
    "date_derniere_connexion" TIMESTAMPTZ(6),
    "preferences" JSONB,
    "avatar_url" TEXT,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifie_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateTable
CREATE TABLE "eleves" (
    "id_eleve" SERIAL NOT NULL,
    "id_candidat" INTEGER NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "numero_dossier" TEXT NOT NULL,
    "formation_suivie" TEXT,
    "date_debut" DATE,
    "date_fin_prevue" DATE,
    "date_fin_reelle" DATE,
    "statut_formation" TEXT,
    "motif_abandon" TEXT,
    "notes_generales" TEXT,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifie_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eleves_pkey" PRIMARY KEY ("id_eleve")
);

-- CreateTable
CREATE TABLE "formations" (
    "id_formation" SERIAL NOT NULL,
    "code_formation" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "categorie" TEXT,
    "duree_jours" INTEGER,
    "duree_heures" INTEGER,
    "niveau_requis" TEXT,
    "diplome_delivre" TEXT,
    "tarif_standard" DECIMAL(10,2),
    "description" TEXT,
    "prerequis" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "objectifs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "programme" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifie_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formations_pkey" PRIMARY KEY ("id_formation")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id_session" SERIAL NOT NULL,
    "id_formation" INTEGER NOT NULL,
    "nom_session" TEXT,
    "date_debut" DATE NOT NULL,
    "date_fin" DATE NOT NULL,
    "capacite_max" INTEGER,
    "nb_inscrits" INTEGER NOT NULL DEFAULT 0,
    "statut_session" TEXT,
    "salle_principale" TEXT,
    "formateur_principal_id" INTEGER,
    "notes" TEXT,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifie_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id_session")
);

-- CreateTable
CREATE TABLE "inscriptions_sessions" (
    "id_inscription" SERIAL NOT NULL,
    "id_eleve" INTEGER NOT NULL,
    "id_session" INTEGER NOT NULL,
    "date_inscription" DATE,
    "statut_inscription" TEXT,
    "date_confirmation" DATE,
    "motif_annulation" TEXT,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inscriptions_sessions_pkey" PRIMARY KEY ("id_inscription")
);

-- CreateTable
CREATE TABLE "formateurs" (
    "id_formateur" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "specialites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "formations_enseignees" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "tarif_journalier" DECIMAL(10,2),
    "adresse" TEXT,
    "code_postal" TEXT,
    "ville" TEXT,
    "siret" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "date_premier_cours" DATE,
    "notes" TEXT,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifie_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formateurs_pkey" PRIMARY KEY ("id_formateur")
);

-- CreateTable
CREATE TABLE "disponibilites_formateurs" (
    "id_disponibilite" SERIAL NOT NULL,
    "id_formateur" INTEGER NOT NULL,
    "date_debut" DATE NOT NULL,
    "date_fin" DATE NOT NULL,
    "type_disponibilite" TEXT NOT NULL,
    "id_session" INTEGER,
    "formation_concernee" TEXT,
    "commentaire" TEXT,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifie_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disponibilites_formateurs_pkey" PRIMARY KEY ("id_disponibilite")
);

-- CreateTable
CREATE TABLE "interventions_formateurs" (
    "id_intervention" SERIAL NOT NULL,
    "id_formateur" INTEGER NOT NULL,
    "id_session" INTEGER NOT NULL,
    "date_intervention" DATE,
    "duree_heures" DECIMAL(5,2),
    "sujet" TEXT,
    "notes" TEXT,
    "cout" DECIMAL(10,2),
    "facture_numero" TEXT,
    "facture_payee" BOOLEAN NOT NULL DEFAULT false,
    "date_paiement" DATE,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interventions_formateurs_pkey" PRIMARY KEY ("id_intervention")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id_evaluation" SERIAL NOT NULL,
    "id_eleve" INTEGER NOT NULL,
    "id_session" INTEGER NOT NULL,
    "id_formateur" INTEGER NOT NULL,
    "type_evaluation" TEXT NOT NULL,
    "date_evaluation" DATE,
    "note" DECIMAL(5,2),
    "note_sur" DECIMAL(5,2) NOT NULL DEFAULT 20,
    "appreciation" TEXT,
    "competences_validees" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "competences_a_travailler" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "commentaire" TEXT,
    "valide_par_admin" BOOLEAN NOT NULL DEFAULT false,
    "date_validation" TIMESTAMPTZ(6),
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifie_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id_evaluation")
);

-- CreateTable
CREATE TABLE "presences" (
    "id_presence" SERIAL NOT NULL,
    "id_eleve" INTEGER NOT NULL,
    "id_session" INTEGER NOT NULL,
    "date_cours" DATE NOT NULL,
    "demi_journee" TEXT,
    "statut_presence" TEXT NOT NULL,
    "justificatif_fourni" BOOLEAN NOT NULL DEFAULT false,
    "url_justificatif" TEXT,
    "motif_absence" TEXT,
    "saisi_par" TEXT,
    "commentaire" TEXT,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifie_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "presences_pkey" PRIMARY KEY ("id_presence")
);

-- CreateTable
CREATE TABLE "historique_marjorie_crm" (
    "id_message" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "role_utilisateur" TEXT NOT NULL,
    "message_utilisateur" TEXT NOT NULL,
    "reponse_marjorie" TEXT NOT NULL,
    "contexte" JSONB,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duree_reponse_ms" INTEGER,

    CONSTRAINT "historique_marjorie_crm_pkey" PRIMARY KEY ("id_message")
);

-- CreateTable
CREATE TABLE "sessions_auth" (
    "id_session" TEXT NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "session_token" TEXT NOT NULL,
    "cree_le" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_auth_pkey" PRIMARY KEY ("id_session")
);

-- CreateIndex
CREATE INDEX "prospects_emails_idx" ON "prospects" USING GIN ("emails");

-- CreateIndex
CREATE INDEX "prospects_telephones_idx" ON "prospects" USING GIN ("telephones");

-- CreateIndex
CREATE INDEX "prospects_nom_idx" ON "prospects" USING GIN ("nom" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "prospects_statut_prospect_idx" ON "prospects"("statut_prospect");

-- CreateIndex
CREATE INDEX "prospects_date_dernier_contact_idx" ON "prospects"("date_dernier_contact" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "candidats_numero_dossier_key" ON "candidats"("numero_dossier");

-- CreateIndex
CREATE INDEX "candidats_numero_dossier_idx" ON "candidats"("numero_dossier");

-- CreateIndex
CREATE INDEX "candidats_id_prospect_idx" ON "candidats"("id_prospect");

-- CreateIndex
CREATE INDEX "candidats_statut_dossier_idx" ON "candidats"("statut_dossier");

-- CreateIndex
CREATE INDEX "candidats_date_candidature_idx" ON "candidats"("date_candidature" DESC);

-- CreateIndex
CREATE INDEX "documents_candidat_id_prospect_idx" ON "documents_candidat"("id_prospect");

-- CreateIndex
CREATE INDEX "documents_candidat_numero_dossier_idx" ON "documents_candidat"("numero_dossier");

-- CreateIndex
CREATE INDEX "documents_candidat_type_document_idx" ON "documents_candidat"("type_document");

-- CreateIndex
CREATE INDEX "documents_candidat_statut_idx" ON "documents_candidat"("statut");

-- CreateIndex
CREATE INDEX "documents_candidat_categorie_idx" ON "documents_candidat"("categorie");

-- CreateIndex
CREATE INDEX "historique_emails_id_prospect_idx" ON "historique_emails"("id_prospect");

-- CreateIndex
CREATE INDEX "historique_emails_date_reception_idx" ON "historique_emails"("date_reception" DESC);

-- CreateIndex
CREATE INDEX "historique_emails_sens_idx" ON "historique_emails"("sens");

-- CreateIndex
CREATE INDEX "historique_emails_statut_idx" ON "historique_emails"("statut");

-- CreateIndex
CREATE INDEX "historique_emails_cle_conversation_idx" ON "historique_emails"("cle_conversation");

-- CreateIndex
CREATE INDEX "historique_emails_cle_participants_idx" ON "historique_emails"("cle_participants");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "eleves_id_candidat_key" ON "eleves"("id_candidat");

-- CreateIndex
CREATE UNIQUE INDEX "eleves_id_utilisateur_key" ON "eleves"("id_utilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "eleves_numero_dossier_key" ON "eleves"("numero_dossier");

-- CreateIndex
CREATE UNIQUE INDEX "formations_code_formation_key" ON "formations"("code_formation");

-- CreateIndex
CREATE INDEX "sessions_id_formation_idx" ON "sessions"("id_formation");

-- CreateIndex
CREATE INDEX "sessions_date_debut_idx" ON "sessions"("date_debut");

-- CreateIndex
CREATE UNIQUE INDEX "inscriptions_sessions_id_eleve_id_session_key" ON "inscriptions_sessions"("id_eleve", "id_session");

-- CreateIndex
CREATE UNIQUE INDEX "formateurs_id_utilisateur_key" ON "formateurs"("id_utilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "formateurs_email_key" ON "formateurs"("email");

-- CreateIndex
CREATE INDEX "historique_marjorie_crm_id_utilisateur_idx" ON "historique_marjorie_crm"("id_utilisateur");

-- CreateIndex
CREATE INDEX "historique_marjorie_crm_timestamp_idx" ON "historique_marjorie_crm"("timestamp" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_auth_session_token_key" ON "sessions_auth"("session_token");

-- AddForeignKey
ALTER TABLE "candidats" ADD CONSTRAINT "candidats_id_prospect_fkey" FOREIGN KEY ("id_prospect") REFERENCES "prospects"("id_prospect") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents_candidat" ADD CONSTRAINT "documents_candidat_id_prospect_fkey" FOREIGN KEY ("id_prospect") REFERENCES "prospects"("id_prospect") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents_candidat" ADD CONSTRAINT "documents_candidat_numero_dossier_fkey" FOREIGN KEY ("numero_dossier") REFERENCES "candidats"("numero_dossier") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historique_emails" ADD CONSTRAINT "historique_emails_id_prospect_fkey" FOREIGN KEY ("id_prospect") REFERENCES "prospects"("id_prospect") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eleves" ADD CONSTRAINT "eleves_id_candidat_fkey" FOREIGN KEY ("id_candidat") REFERENCES "candidats"("id_candidat") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eleves" ADD CONSTRAINT "eleves_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_id_formation_fkey" FOREIGN KEY ("id_formation") REFERENCES "formations"("id_formation") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_formateur_principal_id_fkey" FOREIGN KEY ("formateur_principal_id") REFERENCES "formateurs"("id_formateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions_sessions" ADD CONSTRAINT "inscriptions_sessions_id_eleve_fkey" FOREIGN KEY ("id_eleve") REFERENCES "eleves"("id_eleve") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions_sessions" ADD CONSTRAINT "inscriptions_sessions_id_session_fkey" FOREIGN KEY ("id_session") REFERENCES "sessions"("id_session") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formateurs" ADD CONSTRAINT "formateurs_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilites_formateurs" ADD CONSTRAINT "disponibilites_formateurs_id_formateur_fkey" FOREIGN KEY ("id_formateur") REFERENCES "formateurs"("id_formateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interventions_formateurs" ADD CONSTRAINT "interventions_formateurs_id_formateur_fkey" FOREIGN KEY ("id_formateur") REFERENCES "formateurs"("id_formateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interventions_formateurs" ADD CONSTRAINT "interventions_formateurs_id_session_fkey" FOREIGN KEY ("id_session") REFERENCES "sessions"("id_session") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_id_eleve_fkey" FOREIGN KEY ("id_eleve") REFERENCES "eleves"("id_eleve") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_id_session_fkey" FOREIGN KEY ("id_session") REFERENCES "sessions"("id_session") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_id_formateur_fkey" FOREIGN KEY ("id_formateur") REFERENCES "formateurs"("id_formateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presences" ADD CONSTRAINT "presences_id_eleve_fkey" FOREIGN KEY ("id_eleve") REFERENCES "eleves"("id_eleve") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presences" ADD CONSTRAINT "presences_id_session_fkey" FOREIGN KEY ("id_session") REFERENCES "sessions"("id_session") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historique_marjorie_crm" ADD CONSTRAINT "historique_marjorie_crm_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions_auth" ADD CONSTRAINT "sessions_auth_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

