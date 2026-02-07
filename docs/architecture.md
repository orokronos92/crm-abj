# Architecture Technique — CRM ABJ

## Vue d'ensemble

Le CRM ABJ est construit sur une architecture moderne avec Next.js 16 (App Router), PostgreSQL avec Prisma ORM, et des workflows n8n pour l'automatisation via l'agent IA Marjorie.

---

## État d'Avancement du Projet

**Date de mise à jour** : 5 février 2026

### Phase Actuelle : Mise en place de la base de données

#### ✅ Terminé
- **Infrastructure Docker** : PostgreSQL 16 + pgAdmin configurés en local
- **Schéma Prisma** : Créé avec 19 tables (7 existantes + 12 nouvelles)
- **Base de données** : Toutes les tables créées et fonctionnelles
  - 7 tables existantes (développement Marjorie)
  - 12 nouvelles tables Phase 1 (utilisateurs, élèves, formations, etc.)
- **Extensions PostgreSQL** : pg_trgm installée pour recherche floue
- **Champs ajoutés** : `score` et `notes_ia` à la table `candidats` (UI élève)

#### 🔄 En cours
- Configuration Prisma Client
- Seed data de base (formations, statuts, types documents)

#### 📋 À venir
- NextAuth.js (authentification 3 rôles)
- API Routes Next.js (endpoints REST)
- Composants UI (interfaces admin, formateur, élève)
- Intégration n8n webhooks
- Tests et validation

### Tables Créées

**Tables existantes (7)** — Développement Marjorie :
1. `prospects` — Mémoire longue contacts
2. `candidats` — Dossiers candidature
3. `documents_candidat` — Gestion documents
4. `historique_emails` — Traçabilité emails
5. `journal_erreurs` — Monitoring n8n
6. `statuts_documents` — Référentiel statuts
7. `types_documents` — Référentiel types

**Nouvelles tables Phase 1 (12)** :
8. `utilisateurs` — Comptes CRM (auth)
9. `eleves` — Candidats inscrits
10. `formations` — Catalogue formations
11. `sessions` — Sessions planifiées
12. `inscriptions_sessions` — Lien élèves ↔ sessions
13. `formateurs` — Professeurs
14. `disponibilites_formateurs` — Calendrier dynamique
15. `interventions_formateurs` — Suivi interventions
16. `evaluations` — Notes élèves
17. `presences` — Assiduité
18. `historique_marjorie_crm` — Chat Marjorie dans CRM
19. `sessions_auth` — Sessions NextAuth.js

---

## 1. Base de Données PostgreSQL

### 1.1. Schéma Existant (7 tables)

#### Table `prospects`
**Rôle** : Mémoire longue de tous les contacts ABJ, même après échec ou abandon de candidature.

```sql
id_prospect              TEXT PRIMARY KEY        -- Format: email + 3L nom + 3L prénom
emails                   TEXT[]                  -- Historique emails (multi-adresses)
telephones               TEXT[]                  -- Historique téléphones
nom                      TEXT
prenom                   TEXT
date_naissance           DATE
adresse                  TEXT
code_postal              TEXT
ville                    TEXT

-- Formations et financement
formations_souhaitees    TEXT[]                  -- Liste formations d'intérêt
formation_principale     TEXT                    -- Formation prioritaire
mode_financement         TEXT
organisme_financeur      TEXT

-- Contexte et projet
situation_actuelle       TEXT
niveau_etudes            TEXT
projet_professionnel     TEXT
freins_identifies        TEXT[]                  -- Détectés par IA
motivations              TEXT[]                  -- Détectées par IA
resume_ia                TEXT                    -- Synthèse Marjorie

-- Statuts
statut_prospect          TEXT CHECK (...)        -- NOUVEAU | FROID | TIEDE | CHAUD | INSCRIT | PERDU | EN_ATTENTE_DOSSIER | CANDIDAT | CONTACT
statut_dossier           TEXT CHECK (...)        -- AUCUN | FORMULAIRE_ENVOYE | DOSSIER_RECU | DOSSIER_COMPLET | etc.
statut_devis             TEXT

-- Origine et tracking
source_origine           TEXT
mode_decouverte          TEXT
message_initial          TEXT
derniere_intention       TEXT
prochaine_action         TEXT
derniere_action          TEXT
notes                    TEXT

-- Dates et traçabilité
date_premier_contact     TIMESTAMPTZ
date_dernier_contact     TIMESTAMPTZ
dossier_envoye_le        TIMESTAMPTZ
dossier_recu_le          TIMESTAMPTZ
cree_le                  TIMESTAMPTZ DEFAULT now()
modifie_le               TIMESTAMPTZ DEFAULT now()
nb_echanges              INTEGER DEFAULT 0

-- Liens
numero_dossier           TEXT                    -- Si devient candidat
lien_dossier_drive       TEXT
lien_fiche_candidat      TEXT
```

**Index** :
- `idx_prospects_emails` (GIN) — Recherche rapide par email
- `idx_prospects_telephones` (GIN) — Recherche rapide par téléphone
- `idx_prospects_nom` (BTREE lower) — Recherche insensible à la casse
- `idx_prospects_statut` — Filtres tableaux de bord
- `idx_prospects_date_contact` (DESC) — Tri par dernière activité

**Relations** :
- `prospects` 1→N `candidats` (un prospect peut candidater plusieurs fois)
- `prospects` 1→N `historique_emails`
- `prospects` 1→N `documents_candidat`

---

#### Table `candidats`
**Rôle** : Dossiers formels de candidature à une formation.

```sql
id_candidat                   SERIAL PRIMARY KEY
id_prospect                   TEXT REFERENCES prospects(id_prospect)
numero_dossier                TEXT UNIQUE         -- Format: 2L nom + 2L prénom + JJMMAAAA

-- Formations
formations_demandees          TEXT[]
formation_retenue             TEXT                -- Validée par direction pédagogique
session_visee                 TEXT
date_debut_souhaitee          DATE

-- Financement détaillé
mode_financement              TEXT
organisme_financeur           TEXT
montant_total_formation       NUMERIC(10,2)
montant_prise_en_charge       NUMERIC(10,2)
reste_a_charge                NUMERIC(10,2)

-- Statuts principaux
statut_dossier                TEXT DEFAULT 'RECU' -- RECU | DOSSIER_EN_COURS | DOSSIER_COMPLET | ENTRETIEN_PLANIFIE | DEVIS_ENVOYE | DEVIS_ACCEPTE | FINANCEMENT_EN_COURS | FINANCEMENT_VALIDE | ACCEPTE | LISTE_ATTENTE | REFUSE | INSCRIT
statut_financement            TEXT DEFAULT 'EN_ATTENTE' -- EN_ATTENTE | EN_COURS | VALIDE
statut_inscription            TEXT DEFAULT 'EN_COURS'   -- EN_COURS | VALIDEE

-- Tracking booléens (étapes process)
devis_envoye                  BOOLEAN DEFAULT false
date_devis                    DATE
accord_prise_en_charge        BOOLEAN DEFAULT false
dossier_opco_depose           BOOLEAN DEFAULT false
financement_valide            BOOLEAN DEFAULT false
acompte_recu                  BOOLEAN DEFAULT false
date_acompte                  DATE
solde_regle                   BOOLEAN DEFAULT false
date_solde                    DATE

-- Process validation pédagogique
entretien_telephonique        BOOLEAN DEFAULT false
date_entretien_tel            DATE
rdv_presentiel                BOOLEAN DEFAULT false
date_rdv_presentiel           DATE
test_technique                BOOLEAN DEFAULT false
date_test_technique           DATE
validation_pedagogique        BOOLEAN DEFAULT false
date_validation_pedagogique   DATE

-- Décision finale
date_decision                 TIMESTAMPTZ
decision                      TEXT                -- ACCEPTE | REFUSE | LISTE_ATTENTE
decide_par                    TEXT                -- Nom du décideur
motif_decision                TEXT

-- Liens Drive
url_dossier_drive             TEXT
url_fiche_candidat            TEXT

-- Notes et traçabilité
notes                         TEXT
date_candidature              TIMESTAMPTZ DEFAULT now()
cree_le                       TIMESTAMPTZ DEFAULT now()
modifie_le                    TIMESTAMPTZ DEFAULT now()
```

**Index** :
- `idx_candidats_numero_dossier` (UNIQUE)
- `idx_candidats_id_prospect` — Jointure rapide
- `idx_candidats_statut_dossier` — Filtres dashboard
- `idx_candidats_date_candidature` (DESC) — Tri chronologique

**Relations** :
- `candidats` N→1 `prospects`
- `candidats` 1→N `documents_candidat`
- `candidats` 1→1 `eleves` (après inscription)

---

#### Table `documents_candidat`
**Rôle** : Gestion complète des documents (collectés et générés).

```sql
id_document              SERIAL PRIMARY KEY
id_prospect              TEXT REFERENCES prospects(id_prospect)
numero_dossier           TEXT

-- Identification document
type_document            TEXT NOT NULL           -- CNI_RECTO | CV | LETTRE_MOTIVATION | DIPLOME | DEVIS | CONTRAT | ATTESTATION | etc.
categorie                TEXT NOT NULL DEFAULT 'candidature' -- candidature | financement | eleve

-- Métadonnées fichier
nom_fichier              TEXT
url_drive                TEXT
id_drive                 TEXT
mime_type                TEXT
taille_octets            INTEGER

-- Statut et validation
statut                   TEXT DEFAULT 'ATTENDU'  -- ATTENDU | RECU | A_VALIDER | VALIDE | REFUSE | EXPIRE
obligatoire              BOOLEAN DEFAULT false
date_reception           TIMESTAMPTZ
date_validation          TIMESTAMPTZ
valide_par               TEXT
motif_refus              TEXT
commentaire              TEXT

-- Traçabilité
cree_le                  TIMESTAMPTZ DEFAULT now()
modifie_le               TIMESTAMPTZ DEFAULT now()

CONSTRAINT check_statut_document CHECK (statut IN ('ATTENDU', 'RECU', 'A_VALIDER', 'VALIDE', 'REFUSE', 'EXPIRE'))
```

**Types de documents (via commentaires SQL)** :

**CANDIDATURE** :
- `CNI_RECTO`, `CNI_VERSO` : Carte identité
- `PHOTO_IDENTITE` : Photo identité
- `CV` : Curriculum Vitae
- `LETTRE_MOTIVATION` : Lettre de motivation
- `DIPLOMES` : Justificatifs diplômes
- `JUSTIF_DOMICILE` : Justificatif domicile

**FINANCEMENT** :
- `DEVIS` : Devis formation
- `DEVIS_SIGNE` : Devis signé par candidat
- `ACCORD_OPCO` : Accord prise en charge OPCO
- `ACCORD_CPF` : Validation CPF
- `ACCORD_POLE_EMPLOI` : Accord France Travail
- `CONVENTION_FORMATION` : Convention signée

**ELEVE** :
- `REGLEMENT_INTERIEUR` : Règlement signé
- `CONTRAT_FORMATION` : Contrat signé
- `BULLETIN_1`, `BULLETIN_2`, `BULLETIN_3` : Bulletins trimestriels
- `ATTESTATION_ASSIDUITE` : Attestation présence
- `ATTESTATION_FIN_FORMATION` : Attestation fin
- `DIPLOME_OBTENU` : Diplôme final

**Index** :
- `idx_docs_prospect`
- `idx_docs_dossier`
- `idx_docs_type`
- `idx_docs_statut`
- `idx_docs_categorie`

---

#### Table `historique_emails`
**Rôle** : Mémoire complète de tous les échanges emails (IN/OUT) avec traçabilité et analyse IA.

```sql
id_email                 TEXT PRIMARY KEY
id_prospect              TEXT REFERENCES prospects(id_prospect)

-- Métadonnées email
date_reception           TIMESTAMPTZ DEFAULT now()
modifie_le               TIMESTAMPTZ DEFAULT now()
sens                     TEXT CHECK (sens IN ('entrant', 'sortant'))
email_expediteur         TEXT
nom_expediteur           TEXT
email_destinataire       TEXT
objet                    TEXT
objet_normalise          TEXT
contenu                  TEXT
extrait                  TEXT

-- Fils de conversation
cle_conversation         TEXT
cle_conversation_v2      TEXT
cle_participants         TEXT
id_fil                   TEXT
id_message               TEXT

-- Analyse IA (Marjorie)
intention_detectee       TEXT
formation_detectee       TEXT
session_detectee         TEXT
financement_detecte      TEXT
telephone_detecte        TEXT
resume                   TEXT
classification_ia        JSONB                   -- Résultat complet analyse GPT-4o

-- Statut et actions
statut                   TEXT DEFAULT 'NOUVEAU'
reponse_envoyee          BOOLEAN DEFAULT false
date_reponse             TIMESTAMPTZ
responsable              TEXT
prochaine_action         TEXT

-- Brouillons Marjorie (réponses générées)
brouillon_objet          TEXT
brouillon_contenu        TEXT

-- Suivi
relance_necessaire       BOOLEAN DEFAULT false
needs_followup           BOOLEAN DEFAULT false
infos_manquantes         TEXT
notes                    TEXT

-- Données brutes
metadonnees_brutes       JSONB
```

**Index** :
- `idx_emails_prospect`
- `idx_emails_date` (DESC)
- `idx_emails_sens`
- `idx_emails_statut`
- `idx_emails_cle_conv` — Regroupement conversations
- `idx_emails_participants` — Recherche par participants

**Utilisation** :
- Marjorie lit l'historique complet pour contextualiser ses réponses
- Traçabilité complète des échanges (audit, RGPD)
- Détection doublons et fils de conversation

---

#### Table `journal_erreurs`
**Rôle** : Monitoring et debug des workflows n8n.

```sql
id                       SERIAL PRIMARY KEY
date_erreur              TIMESTAMPTZ DEFAULT now()
nom_workflow             TEXT
nom_noeud                TEXT
message_erreur           TEXT
donnees_entree           JSONB
resolu                   BOOLEAN DEFAULT false
```

**Usage** :
- Capture automatique des erreurs n8n
- Aide au debug des workflows
- Alertes si erreurs non résolues

---

#### Tables `statuts_documents` et `types_documents`
**Rôle** : Tables de référence pour standardisation.

```sql
-- statuts_documents
code                     TEXT PRIMARY KEY
libelle                  TEXT NOT NULL
description              TEXT
couleur                  TEXT                    -- Code couleur UI
ordre                    INTEGER                 -- Ordre affichage
action_requise           TEXT

-- types_documents
code                     TEXT PRIMARY KEY
libelle                  TEXT NOT NULL
categorie                TEXT DEFAULT 'candidature'
obligatoire              BOOLEAN DEFAULT false
ordre_affichage          INTEGER
description              TEXT
```

---

### 1.2. Tables Manquantes à Créer

Selon l'analyse des specs et des besoins du CRM, voici les **15-17 nouvelles tables** nécessaires :

#### 🎓 Gestion des Élèves et Formations

**1. `eleves`** — Candidats inscrits qui suivent une formation
```sql
id_eleve                 SERIAL PRIMARY KEY
id_candidat              INTEGER REFERENCES candidats(id_candidat)
id_utilisateur           INTEGER REFERENCES utilisateurs(id_utilisateur) -- Pour auth CRM
numero_dossier           TEXT UNIQUE
formation_suivie         TEXT                    -- CAP Bijou, Sertissage, etc.
date_debut               DATE
date_fin_prevue          DATE
date_fin_reelle          DATE
statut_formation         TEXT                    -- EN_COURS | TERMINE | ABANDONNE | SUSPENDU
motif_abandon            TEXT
notes_generales          TEXT
cree_le                  TIMESTAMPTZ DEFAULT now()
modifie_le               TIMESTAMPTZ DEFAULT now()
```

**2. `formations`** — Catalogue des formations proposées
```sql
id_formation             SERIAL PRIMARY KEY
code_formation           TEXT UNIQUE             -- CAP_ATBJ | SERTI_N1 | SERTI_N2 | CAO_DAO | etc.
nom                      TEXT NOT NULL
categorie                TEXT                    -- CAP | FORMATION_COURTE | PERFECTIONNEMENT
duree_jours              INTEGER
duree_heures             INTEGER
niveau_requis            TEXT
diplome_delivre          TEXT
tarif_standard           NUMERIC(10,2)
description              TEXT
prerequis                TEXT[]
objectifs                TEXT[]
programme                TEXT
actif                    BOOLEAN DEFAULT true
cree_le                  TIMESTAMPTZ DEFAULT now()
modifie_le               TIMESTAMPTZ DEFAULT now()
```

**3. `sessions`** — Sessions planifiées d'une formation
```sql
id_session               SERIAL PRIMARY KEY
id_formation             INTEGER REFERENCES formations(id_formation)
nom_session              TEXT                    -- Ex: "CAP Bijou — Promotion Mars 2026"
date_debut               DATE NOT NULL
date_fin                 DATE NOT NULL
capacite_max             INTEGER
nb_inscrits              INTEGER DEFAULT 0
statut_session           TEXT                    -- PREVUE | CONFIRMEE | EN_COURS | TERMINEE | ANNULEE
salle_principale         TEXT                    -- Sera FK vers salles plus tard
formateur_principal_id   INTEGER                 -- FK vers formateurs
cout_formateur_total     NUMERIC(10,2)
notes                    TEXT
cree_le                  TIMESTAMPTZ DEFAULT now()
modifie_le               TIMESTAMPTZ DEFAULT now()
```

**4. `inscriptions_sessions`** — Lien élèves ↔ sessions
```sql
id_inscription           SERIAL PRIMARY KEY
id_eleve                 INTEGER REFERENCES eleves(id_eleve)
id_session               INTEGER REFERENCES sessions(id_session)
date_inscription         DATE
statut_inscription       TEXT                    -- INSCRIT | EN_ATTENTE | CONFIRME | ANNULE
date_confirmation        DATE
motif_annulation         TEXT
cree_le                  TIMESTAMPTZ DEFAULT now()

UNIQUE(id_eleve, id_session)
```

#### 👨‍🏫 Gestion des Formateurs

**5. `formateurs`** — Professeurs externes
```sql
id_formateur             SERIAL PRIMARY KEY
id_utilisateur           INTEGER REFERENCES utilisateurs(id_utilisateur) -- Pour auth CRM
nom                      TEXT NOT NULL
prenom                   TEXT NOT NULL
email                    TEXT UNIQUE
telephone                TEXT
specialites              TEXT[]                  -- [CAP_ATBJ, SERTI_N1, CAO_DAO]
formations_enseignees    INTEGER[]               -- FK vers formations
tarif_journalier         NUMERIC(10,2)
adresse                  TEXT
code_postal              TEXT
ville                    TEXT
siret                    TEXT                    -- Si auto-entrepreneur
statut                   TEXT DEFAULT 'ACTIF'    -- ACTIF | INACTIF | ARCHIVE
date_premier_cours       DATE
notes                    TEXT
cree_le                  TIMESTAMPTZ DEFAULT now()
modifie_le               TIMESTAMPTZ DEFAULT now()
```

**6. `disponibilites_formateurs`** — Calendrier dynamique
```sql
id_disponibilite         SERIAL PRIMARY KEY
id_formateur             INTEGER REFERENCES formateurs(id_formateur)
date_debut               DATE NOT NULL
date_fin                 DATE NOT NULL
type_disponibilite       TEXT                    -- DISPONIBLE | RESERVE | CONFIRME | INDISPONIBLE
id_session               INTEGER REFERENCES sessions(id_session) -- Si CONFIRME
formation_concernee      TEXT                    -- Formation pour laquelle il est dispo
commentaire              TEXT
cree_le                  TIMESTAMPTZ DEFAULT now()
modifie_le               TIMESTAMPTZ DEFAULT now()

CHECK (date_fin >= date_debut)
```

**7. `interventions_formateurs`** — Suivi des interventions réelles
```sql
id_intervention          SERIAL PRIMARY KEY
id_formateur             INTEGER REFERENCES formateurs(id_formateur)
id_session               INTEGER REFERENCES sessions(id_session)
date_intervention        DATE
duree_heures             NUMERIC(5,2)
sujet                    TEXT
notes                    TEXT
cout                     NUMERIC(10,2)           -- tarif_journalier * nb_jours
facture_numero           TEXT
facture_payee            BOOLEAN DEFAULT false
date_paiement            DATE
cree_le                  TIMESTAMPTZ DEFAULT now()
```

#### 📝 Évaluations et Présences

**8. `evaluations`** — Notes et évaluations des élèves
```sql
id_evaluation            SERIAL PRIMARY KEY
id_eleve                 INTEGER REFERENCES eleves(id_eleve)
id_session               INTEGER REFERENCES sessions(id_session)
id_formateur             INTEGER REFERENCES formateurs(id_formateur) -- Qui a évalué
type_evaluation          TEXT                    -- CONTROLE_CONTINU | EXAMEN_BLANC | EXAMEN_FINAL | APPRECIATION
date_evaluation          DATE
note                     NUMERIC(5,2)            -- Note sur 20 ou NULL si appréciation
note_sur                 NUMERIC(5,2) DEFAULT 20 -- Barème
appreciation             TEXT
competences_validees     TEXT[]
competences_a_travailler TEXT[]
commentaire              TEXT
valide_par_admin         BOOLEAN DEFAULT false
date_validation          TIMESTAMPTZ
cree_le                  TIMESTAMPTZ DEFAULT now()
modifie_le               TIMESTAMPTZ DEFAULT now()
```

**9. `presences`** — Suivi assiduité élèves
```sql
id_presence              SERIAL PRIMARY KEY
id_eleve                 INTEGER REFERENCES eleves(id_eleve)
id_session               INTEGER REFERENCES sessions(id_session)
date_cours               DATE NOT NULL
demi_journee             TEXT                    -- MATIN | APRES_MIDI | JOURNEE_COMPLETE
statut_presence          TEXT                    -- PRESENT | ABSENT | ABSENT_JUSTIFIE | RETARD
justificatif_fourni      BOOLEAN DEFAULT false
url_justificatif         TEXT                    -- Lien Drive si document
motif_absence            TEXT
saisi_par                TEXT                    -- Formateur ou admin
commentaire              TEXT
cree_le                  TIMESTAMPTZ DEFAULT now()
modifie_le               TIMESTAMPTZ DEFAULT now()
```

#### 🏢 Infrastructure et Ressources

**10. `salles`** — Salles de formation (pour calendrier dynamique Phase 3)
```sql
id_salle                 SERIAL PRIMARY KEY
nom                      TEXT UNIQUE NOT NULL
capacite_max             INTEGER
equipements              TEXT[]                  -- [ETABLI_BIJOU, POSTE_SERTI, ORDINATEUR_CAO, FOUR, LAMINOIR, etc.]
surface_m2               INTEGER
etage                    INTEGER
disponible_weekend       BOOLEAN DEFAULT false
disponible_soir          BOOLEAN DEFAULT false
formations_compatibles   TEXT[]                  -- Formations pouvant utiliser cette salle
statut                   TEXT DEFAULT 'ACTIVE'   -- ACTIVE | MAINTENANCE | HORS_SERVICE
notes                    TEXT
cree_le                  TIMESTAMPTZ DEFAULT now()
modifie_le               TIMESTAMPTZ DEFAULT now()
```

**11. `reservations_salles`** — Planning salles
```sql
id_reservation           SERIAL PRIMARY KEY
id_salle                 INTEGER REFERENCES salles(id_salle)
id_session               INTEGER REFERENCES sessions(id_session)
date_debut               TIMESTAMP NOT NULL
date_fin                 TIMESTAMP NOT NULL
statut_reservation       TEXT                    -- PREVUE | CONFIRMEE | ANNULEE
reserve_par              TEXT
commentaire              TEXT
cree_le                  TIMESTAMPTZ DEFAULT now()
modifie_le               TIMESTAMPTZ DEFAULT now()

CHECK (date_fin > date_debut)
```

#### 👤 Authentification et Utilisateurs CRM

**12. `utilisateurs`** — Comptes d'accès au CRM
```sql
id_utilisateur           SERIAL PRIMARY KEY
email                    TEXT UNIQUE NOT NULL
mot_de_passe_hash        TEXT                    -- Si auth local (ou NULL si OAuth)
nom                      TEXT
prenom                   TEXT
role                     TEXT NOT NULL           -- admin | professeur | eleve
statut_compte            TEXT DEFAULT 'ACTIF'    -- ACTIF | SUSPENDU | DESACTIVE
date_derniere_connexion  TIMESTAMPTZ
preferences              JSONB                   -- Préférences UI, notifications, etc.
avatar_url               TEXT
cree_le                  TIMESTAMPTZ DEFAULT now()
modifie_le               TIMESTAMPTZ DEFAULT now()

CHECK (role IN ('admin', 'professeur', 'eleve'))
```

**13. `sessions_auth`** — Sessions NextAuth.js (si auth local)
```sql
id_session               TEXT PRIMARY KEY
id_utilisateur           INTEGER REFERENCES utilisateurs(id_utilisateur)
expires_at               TIMESTAMPTZ NOT NULL
session_token            TEXT UNIQUE NOT NULL
cree_le                  TIMESTAMPTZ DEFAULT now()
```

**14. `tokens_verification`** — Tokens email/reset password
```sql
id_token                 SERIAL PRIMARY KEY
id_utilisateur           INTEGER REFERENCES utilisateurs(id_utilisateur)
type_token               TEXT                    -- EMAIL_VERIFICATION | PASSWORD_RESET
token                    TEXT UNIQUE NOT NULL
expire_le                TIMESTAMPTZ NOT NULL
utilise                  BOOLEAN DEFAULT false
date_utilisation         TIMESTAMPTZ
cree_le                  TIMESTAMPTZ DEFAULT now()
```

#### 💬 Messagerie Interne CRM

**15. `historique_marjorie_crm`** — Traçabilité chat Marjorie dans le CRM
```sql
id_message               SERIAL PRIMARY KEY
id_utilisateur           INTEGER REFERENCES utilisateurs(id_utilisateur)
role_utilisateur         TEXT NOT NULL           -- admin | professeur | eleve
message_utilisateur      TEXT NOT NULL
reponse_marjorie         TEXT
contexte                 JSONB                   -- {page: "candidat", numero_dossier: "DUMI15091992"}
action_executee          TEXT                    -- "GENERATION_DEVIS" | "ENVOI_EMAIL" | "CONSULTATION_BDD" | NULL
resultat_action          JSONB                   -- Résultat de l'action si applicable
erreur                   TEXT                    -- Si erreur lors de l'action
duree_traitement_ms      INTEGER
date_envoi               TIMESTAMPTZ DEFAULT now()
date_reponse             TIMESTAMPTZ

CHECK (role_utilisateur IN ('admin', 'professeur', 'eleve'))
```

**16. `messages_internes`** — Messagerie entre utilisateurs (si implémentée)
```sql
id_message               SERIAL PRIMARY KEY
id_expediteur            INTEGER REFERENCES utilisateurs(id_utilisateur)
id_destinataire          INTEGER REFERENCES utilisateurs(id_utilisateur)
objet                    TEXT
contenu                  TEXT NOT NULL
lu                       BOOLEAN DEFAULT false
date_lecture             TIMESTAMPTZ
fichiers_joints          TEXT[]                  -- URLs Drive si pièces jointes
date_envoi               TIMESTAMPTZ DEFAULT now()
```

#### 📊 Optimisation et Analytics

**17. `sessions_optimisees`** — Propositions sessions générées par IA (calendrier dynamique)
```sql
id_proposition           SERIAL PRIMARY KEY
id_formation             INTEGER REFERENCES formations(id_formation)
id_formateur_propose     INTEGER REFERENCES formateurs(id_formateur)
id_salle_proposee        INTEGER REFERENCES salles(id_salle)
date_debut_proposee      DATE
date_fin_proposee        DATE
nb_candidats_cibles      INTEGER
candidats_cibles_ids     INTEGER[]               -- IDs candidats en LISTE_ATTENTE ou ACCEPTE
score_optimisation       NUMERIC(5,2)            -- Score IA (0-100)
statut_proposition       TEXT                    -- PROPOSEE | VALIDEE_ADMIN | REFUSEE | ANNULEE
valide_par               TEXT
date_validation          TIMESTAMPTZ
raison_refus             TEXT
cree_le                  TIMESTAMPTZ DEFAULT now()
```

---

### 1.3. Relations entre Tables

```
prospects (1) ──→ (N) candidats
                  │
                  └──→ (N) documents_candidat
                  └──→ (N) historique_emails

candidats (1) ──→ (1) eleves

eleves (N) ──→ (N) inscriptions_sessions (N) ──→ (N) sessions
eleves (1) ──→ (N) evaluations
eleves (1) ──→ (N) presences

formateurs (1) ──→ (N) disponibilites_formateurs
formateurs (1) ──→ (N) interventions_formateurs
formateurs (1) ──→ (N) sessions (via FK formateur_principal_id)
formateurs (1) ──→ (1) utilisateurs

formations (1) ──→ (N) sessions
sessions (1) ──→ (N) inscriptions_sessions
sessions (1) ──→ (N) evaluations
sessions (1) ──→ (N) presences
sessions (1) ──→ (N) reservations_salles

salles (1) ──→ (N) reservations_salles

utilisateurs (1) ──→ (1) eleves (si role=eleve)
utilisateurs (1) ──→ (1) formateurs (si role=professeur)
utilisateurs (1) ──→ (N) historique_marjorie_crm
utilisateurs (1) ──→ (N) messages_internes (expéditeur + destinataire)
```

---

## 2. Architecture Applicative

### 2.1. Stack Technique

**Frontend** :
- Next.js 16.1.6 (App Router)
- React 19.2.3 (composants fonctionnels uniquement)
- Tailwind CSS v4 (styling)
- TypeScript 5 (strict mode, pas de `any`)

**Backend** :
- Next.js API Routes (App Router)
- Prisma ORM (accès PostgreSQL)
- NextAuth.js (authentification)

**Base de données** :
- PostgreSQL 16 (hébergé sur VPS Hostinger)
- Utilisateur BDD : `marjorie`

**Automatisation** :
- n8n (workflows hébergés sur VPS Hostinger)
- Agent IA Marjorie (système multi-agent)

**Infrastructure** :
- VPS Hostinger
- Docker (conteneurisation)
- Traefik (reverse proxy + SSL)

### 2.2. Prisma Schema (à créer)

Le schéma Prisma doit mapper toutes les tables PostgreSQL existantes + nouvelles tables.

**Fichier** : `prisma/schema.prisma`

Conventions :
- Nommage tables : snake_case (PostgreSQL convention)
- Nommage modèles Prisma : PascalCase
- Relations explicites avec `@relation`
- Index définis via `@@index`
- Contraintes CHECK via `@@check` (Prisma 5+)

### 2.3. Sécurité et Permissions

**Row Level Security (RLS) via Prisma Middleware** :

```typescript
// prisma/middleware/rls.ts
export function applyRLS(role: 'admin' | 'professeur' | 'eleve', userId: number) {
  if (role === 'professeur') {
    // Un formateur ne voit QUE ses élèves
    return {
      where: {
        inscriptions_sessions: {
          some: {
            session: {
              formateur_principal_id: userId
            }
          }
        }
      }
    };
  }

  if (role === 'eleve') {
    // Un élève ne voit QUE ses propres données
    return {
      where: {
        id_utilisateur: userId
      }
    };
  }

  // Admin : pas de filtre
  return {};
}
```

**Authentification NextAuth.js** :
- Providers : Credentials (email/password) ou OAuth (Google, Microsoft)
- JWT avec rôle et userId
- Session cookie sécurisé (httpOnly, secure, sameSite)

---

## 3. Architecture n8n

### 3.1. Workflows Existants

**Workflow 1** : `abj_branche3_dossier_complet_simplifie` (50 nodes)
- IMAP → Classificateur IA → 3 branches (formulaire, Marjorie email, dossier complet)

**Workflow 2** : `abj_createur_dossier` (25 nodes)
- Création dossier Google Drive + génération fiche candidat PDF

### 3.2. Nouveaux Workflows à Créer

**Workflow 3** : `marjorie_chat_crm` (à développer)
- Webhook : Reçoit messages du CRM
- Route selon `role` : admin | professeur | eleve
- Contexte adaptatif (filtres SQL selon rôle)
- Réponse JSON : `{reply, action_executee, resultat}`

**Workflow 4** : `calendrier_dynamique_optimisation` (Phase 3)
- CRON quotidien ou hebdomadaire
- Croise disponibilités formateurs + salles + candidats
- Génère propositions dans table `sessions_optimisees`
- Email admin avec suggestions

**Workflow 5** : `traitement_notes_formateurs` (à développer)
- Webhook : Reçoit formulaire notes depuis CRM
- Agent IA : Détecte anomalies (notes > 20, incohérences)
- Si OK : Insert dans table `evaluations`
- Si anomalie : Alerte admin

**Workflow 6** : `signature_electronique_devis` (Phase 4)
- Trigger : Demande génération devis via Marjorie
- Génère PDF devis
- Upload vers plateforme signature (Yousign)
- Webhook retour signature → Update `candidats.statut_dossier` = DEVIS_ACCEPTE

### 3.3. Endpoints Webhooks n8n

```
POST /webhook/chat-marjorie          → Workflow 3 (messagerie CRM)
POST /webhook/candidat/nouveau       → Workflow 2 (création dossier)
POST /webhook/notes/submit           → Workflow 5 (traitement notes)
POST /webhook/devis/generate         → Workflow 6 (génération + signature)
GET  /webhook/candidat/:numero       → Récupération infos candidat
```

---

## 4. Structure du Projet Next.js

```
crm_abj/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (auth)/                  # Groupe auth (login, register)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (admin)/                 # Groupe admin (layout spécifique)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── candidats/
│   │   │   │   ├── page.tsx         # Liste candidats
│   │   │   │   └── [numero]/
│   │   │   │       └── page.tsx     # Fiche candidat détaillée
│   │   │   ├── formations/
│   │   │   ├── formateurs/
│   │   │   └── stats/
│   │   ├── (formateur)/             # Groupe formateur
│   │   │   ├── dashboard/
│   │   │   ├── mes-eleves/
│   │   │   ├── mes-sessions/
│   │   │   └── disponibilites/
│   │   ├── (eleve)/                 # Groupe élève
│   │   │   ├── dashboard/
│   │   │   ├── mon-planning/
│   │   │   ├── mes-notes/
│   │   │   └── mes-documents/
│   │   ├── api/                     # API Routes
│   │   │   ├── auth/
│   │   │   ├── candidats/
│   │   │   ├── marjorie/
│   │   │   └── n8n/
│   │   ├── layout.tsx               # Layout racine
│   │   ├── page.tsx                 # Page d'accueil
│   │   └── globals.css
│   ├── components/                  # Composants React
│   │   ├── admin/                   # Composants spécifiques admin
│   │   ├── formateur/               # Composants spécifiques formateur
│   │   ├── eleve/                   # Composants spécifiques élève
│   │   ├── shared/                  # Composants partagés
│   │   │   ├── marjorie-chat.tsx    # Chat Marjorie
│   │   │   ├── candidat-card.tsx
│   │   │   └── document-viewer.tsx
│   │   └── ui/                      # Composants UI de base (boutons, inputs, etc.)
│   ├── lib/                         # Utilitaires
│   │   ├── prisma.ts                # Client Prisma singleton
│   │   ├── auth.ts                  # Config NextAuth
│   │   ├── n8n.ts                   # Client n8n (webhooks)
│   │   └── utils.ts
│   ├── hooks/                       # Hooks custom
│   │   ├── use-candidats.ts
│   │   ├── use-marjorie.ts
│   │   └── use-user.ts
│   └── types/                       # Types TypeScript
│       ├── candidat.ts
│       ├── eleve.ts
│       ├── formateur.ts
│       └── database.ts
├── prisma/
│   ├── schema.prisma                # Schéma Prisma complet
│   ├── migrations/                  # Migrations SQL
│   └── seed.ts                      # Seed data (types_documents, statuts, formations)
├── public/
│   └── ...
├── docs/
│   ├── spec.md                      # ✅ Spécifications fonctionnelles
│   ├── architecture.md              # ✅ Ce fichier
│   ├── api-patterns.md              # À créer : Conventions API
│   └── n8n-workflows.md             # À créer : Doc workflows n8n
├── .env
├── .env.example
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── package.json
└── CLAUDE.md                        # ✅ Guide pour Claude Code
```

---

## 5. Conventions de Développement

### 5.1. Nommage

**Fichiers** :
- Composants React : `kebab-case.tsx` (ex: `candidat-card.tsx`)
- Hooks : `use-nom-hook.ts` (ex: `use-candidats.ts`)
- Types : `kebab-case.ts` (ex: `candidat.ts`)
- API Routes : `route.ts` dans dossier `app/api/[resource]/`

**Code** :
- Composants : `PascalCase` (ex: `CandidatCard`)
- Fonctions : `camelCase` (ex: `getCandidats`)
- Constantes : `UPPER_SNAKE_CASE` (ex: `MAX_CANDIDATS`)
- Types : `PascalCase` (ex: `Candidat`)

### 5.2. Composants

**Règles strictes** :
- ✅ Composants fonctionnels uniquement (pas de classes)
- ✅ Maximum 150 lignes par composant (idéal < 100)
- ✅ Maximum absolu : 300 lignes (jamais dépasser)
- ❌ Interdiction du type `any` en TypeScript

**Si composant > 150 lignes** :
1. Découper en sous-composants
2. Extraire logique métier dans hooks (`src/hooks/`)
3. Extraire types dans fichiers séparés (`src/types/`)
4. Extraire utilitaires dans `src/lib/`

**Exemple** :
```tsx
// ❌ MAUVAIS : Composant monolithique 200 lignes
function CandidatFiche() {
  // 200 lignes de code...
}

// ✅ BON : Découpé en sous-composants
function CandidatFiche() {
  return (
    <>
      <CandidatHeader candidat={candidat} />
      <CandidatInfos candidat={candidat} />
      <CandidatDocuments documents={documents} />
      <CandidatTimeline historique={historique} />
    </>
  );
}
```

### 5.3. TypeScript

```typescript
// ❌ INTERDIT
function traiterCandidat(data: any) { ... }

// ✅ BON
interface CandidatData {
  nom: string;
  prenom: string;
  email: string;
}

function traiterCandidat(data: CandidatData): void { ... }
```

### 5.4. Commits Git

- Commiter après chaque étape fonctionnelle
- Messages en français
- Format : `type: description`
  - `feat: ajout composant liste candidats`
  - `fix: correction calcul reste à charge`
  - `refactor: découpage composant CandidatFiche`
  - `docs: mise à jour architecture.md`

---

## 6. Performance et Optimisation

### 6.1. Index PostgreSQL

**Index existants bien conçus** :
- Index GIN sur arrays (`emails`, `telephones`)
- Index BTREE sur colonnes de filtre (`statut_*`)
- Index DESC sur dates (tri chronologique)

**Nouveaux index à créer** (avec nouvelles tables) :
- `idx_eleves_statut_formation`
- `idx_sessions_date_debut`
- `idx_presences_date_cours`
- `idx_evaluations_date`

### 6.2. Prisma

**Queries optimisées** :
```typescript
// ✅ Inclure relations nécessaires uniquement
const candidats = await prisma.candidats.findMany({
  where: { statut_dossier: 'DOSSIER_COMPLET' },
  include: {
    prospect: {
      select: { nom: true, prenom: true, email: true }
    }
  },
  take: 50,
  orderBy: { date_candidature: 'desc' }
});
```

**Pagination** :
- Utiliser `skip` et `take` (ou `cursor` pour grandes tables)

### 6.3. Caching

**Next.js** :
- `revalidate` sur Server Components pour données statiques
- ISR (Incremental Static Regeneration) pour pages fréquentes

**Redis** (Phase 5) :
- Cache sessions auth
- Cache résultats queries lourdes

---

## 7. Sécurité

### 7.1. RGPD

- Consentement explicite lors de soumission formulaire
- Droit d'accès : API GET `/api/mes-donnees`
- Droit à l'effacement : Archivage soft delete
- Chiffrement données sensibles si nécessaire

### 7.2. Auth

- Passwords hachés avec bcrypt (rounds ≥ 10)
- Tokens JWT signés (secret fort)
- CSRF protection (NextAuth inclus)
- Rate limiting sur API auth

### 7.3. API

- Validation inputs (Zod recommandé)
- Sanitization SQL via Prisma (protection injection)
- CORS configuré strictement
- Logs toutes les actions sensibles

---

## 8. Monitoring et Logs

**PostgreSQL** :
- Slow query log activé
- `pg_stat_statements` pour analyse performances

**n8n** :
- Table `journal_erreurs` (déjà en place)
- Alertes email si workflow fail

**Next.js** :
- Sentry ou équivalent (Phase 5)
- Logs structurés (Winston ou Pino)

**Marjorie** :
- Table `historique_marjorie_crm` (traçabilité complète)
- Durée traitement enregistrée (`duree_traitement_ms`)

---

## 9. Roadmap Technique

### Phase 1 — MVP Core
1. ✅ Workflow n8n email (fait)
2. ✅ Workflow créateur dossier (fait)
3. 🔲 Créer schéma Prisma complet
4. 🔲 Migrations PostgreSQL (nouvelles tables)
5. 🔲 Seed data (formations, types_documents, statuts)
6. 🔲 Authentification NextAuth
7. 🔲 Interface admin : dashboard + liste candidats
8. 🔲 Chat Marjorie CRM (admin uniquement)

### Phase 2 — Formateurs et Élèves
1. 🔲 Tables formateurs + élèves + évaluations + présences
2. 🔲 Interface formateur
3. 🔲 Interface élève
4. 🔲 Chat Marjorie pour formateurs et élèves

### Phase 3 — Calendrier Dynamique
1. 🔲 Tables disponibilités + salles + sessions
2. 🔲 Workflow optimisation IA
3. 🔲 Interface gestion planning

### Phase 4 — Signature Électronique
1. 🔲 Intégration Yousign (ou autre)
2. 🔲 Workflow signature devis
3. 🔲 Suivi paiements

### Phase 5 — Analytics
1. 🔲 Dashboard stats avancées
2. 🔲 Alertes IA (candidats à risque)
3. 🔲 Optimisation continue

---

**Version** : 1.0
**Dernière mise à jour** : 2026-02-05
**Auteur** : Claude Code
