# Spécifications Fonctionnelles — CRM ABJ

## Vue d'ensemble

Le CRM de l'Académie de Bijouterie Joaillerie (ABJ) est une solution sur mesure qui remplace l'ancien CRM Loop. Il centralise la gestion des candidats, formations, communications et documents dans un système piloté par l'intelligence artificielle.

### Principes architecturaux

- **Tableau de bord intelligent** : Le CRM affiche des interfaces riches avec toutes les données pertinentes selon le rôle
- **Marjorie au cœur** : Toutes les actions de création/modification/génération passent par l'agent IA via messagerie interne
- **Traçabilité totale** : Historique complet de toutes les demandes et actions effectuées
- **Automatisation 80%** : L'objectif est d'automatiser 80% du travail de gestion et administration

---

## 1. Rôles et Permissions

### Trois rôles utilisateurs

1. **ADMINISTRATIF** — Équipes ABJ (secrétariat, direction pédagogique)
2. **FORMATEUR** — Professeurs externes payés à la journée
3. **ÉLÈVE** — Candidats acceptés et inscrits dans une formation

> **Note** : Le super-admin (accès serveur Hostinger) n'est pas un rôle applicatif.

### Matrice des permissions

| Fonctionnalité | Administratif | Formateur | Élève |
|----------------|---------------|-----------|-------|
| **Consultation** |
| Voir tous les candidats | ✅ | ❌ | ❌ |
| Voir ses élèves | ✅ | ✅ (uniquement les siens) | ❌ |
| Voir son profil/planning | ✅ | ✅ | ✅ |
| Voir documents/notes | ✅ | ✅ (ses classes) | ✅ (les siens) |
| **Actions directes** |
| Valider dates présence prévisionnelles | ❌ | ✅ | ❌ |
| Renseigner disponibilités (calendrier) | ❌ | ✅ | ❌ |
| Saisir notes via formulaire | ❌ | ✅ | ❌ |
| **Actions via Marjorie** |
| Chat avec Marjorie | ✅ | ✅ | ✅ |
| Créer/modifier candidats | ✅ | ❌ | ❌ |
| Envoyer emails/devis | ✅ | ❌ | ❌ |
| Générer documents | ✅ | ❌ | ❌ |
| Demander téléchargement attestation | ❌ | ❌ | ✅ |

### Permissions de Marjorie selon le rôle

**Marjorie (rôle: "admin")** :
- Accès complet lecture/écriture BDD
- Génération tous documents
- Envoi emails/devis
- Validation cohérence dossiers
- Trigger workflows automatiques

**Marjorie (rôle: "professeur")** :
- Accès lecture à SES classes et SES élèves uniquement
- Réponses sur plannings, notes, présences de ses élèves
- Ajout de disponibilités au calendrier
- Pas d'accès aux données financières ni process admin

**Marjorie (rôle: "eleve")** :
- Accès lecture uniquement à SES propres données
- Réponses sur son planning, ses formations, ses documents
- Génération/envoi de ses attestations
- AUCUN accès aux infos des autres élèves ni process internes

---

## 2. Modèle de Données

### Base de données PostgreSQL `abj_crm`

#### Table `prospects`
Mémoire longue des contacts. Un prospect reste en base même si son projet de formation avorte.

```sql
id_prospect          VARCHAR(50)  PRIMARY KEY  -- Généré : email + 3 lettres nom + 3 lettres prénom
emails               TEXT[]                     -- Historique des emails utilisés
telephones           TEXT[]                     -- Historique des téléphones
nom                  VARCHAR(100)
prenom               VARCHAR(100)
formation_principale VARCHAR(100)               -- Formation d'intérêt principal
statut_prospect      VARCHAR(50)                -- NOUVEAU | CANDIDAT | EN_ATTENTE_DOSSIER
statut_dossier       VARCHAR(50)                -- Réplication du statut candidat si existe
numero_dossier       VARCHAR(20)                -- Lien vers candidats
nb_echanges          INTEGER      DEFAULT 0
date_premier_contact TIMESTAMP
date_dernier_contact TIMESTAMP
```

**Logique Prospect/Candidat** :
- Un **prospect** = une personne identifiée (nom, email, téléphone)
- Si le prospect candidate → création d'un **candidat** lié
- Si candidat refusé ou reporte son projet → redevient prospect simple
- Peut recandidater plus tard → nouveau candidat créé, lié au même prospect

#### Table `candidats`
Dossiers de candidature formels.

```sql
id_candidat           SERIAL       PRIMARY KEY
id_prospect           VARCHAR(50)  REFERENCES prospects(id_prospect)
numero_dossier        VARCHAR(20)  UNIQUE       -- Format: 2L nom + 2L prénom + JJMMAAAA (ex: DUMI15091992)
formations_demandees  TEXT[]                     -- Liste des formations souhaitées
formation_retenue     VARCHAR(100)               -- Formation finale validée par direction péda
mode_financement      VARCHAR(50)                -- CPF | OPCO | PERSONNEL | ENTREPRISE | POLE_EMPLOI
statut_dossier        VARCHAR(50)                -- Voir ci-dessous
statut_financement    VARCHAR(50)                -- EN_ATTENTE | EN_COURS | VALIDE
statut_inscription    VARCHAR(50)                -- EN_COURS | VALIDEE
lien_dossier_drive    TEXT                       -- URL dossier Google Drive
lien_fiche_candidat   TEXT                       -- URL fiche candidat PDF
date_creation         TIMESTAMP
date_modification     TIMESTAMP
```

**Statuts du dossier candidat** (pipeline de conversion) :
```
RECU                    → Premier contact, dossier créé
DOSSIER_EN_COURS        → Documents en cours de collecte
DOSSIER_COMPLET         → Tous les documents reçus
ENTRETIEN_PLANIFIE      → Convocation jury envoyée
DEVIS_ENVOYE            → Devis transmis au candidat
DEVIS_ACCEPTE           → Signature électronique validée ⚡ TRIGGER CLÉ
FINANCEMENT_EN_COURS    → Dossier OPCO/CPF/autre en cours
FINANCEMENT_VALIDE      → Financement confirmé
ACCEPTE                 → Candidat validé par direction pédagogique
LISTE_ATTENTE           → Candidat accepté mais pas de place immédiate
REFUSE                  → Candidat non retenu
INSCRIT                 → Candidat inscrit définitivement → bascule en ÉLÈVE
```

#### Table `historique_emails`
Mémoire de tous les échanges avec les prospects et candidats.

```sql
id_email              SERIAL       PRIMARY KEY
id_prospect           VARCHAR(50)  REFERENCES prospects(id_prospect)
sens                  VARCHAR(10)              -- IN | OUT
objet                 TEXT
contenu               TEXT
intention_detectee    VARCHAR(100)             -- Classification IA
formation_detectee    VARCHAR(100)
classification_ia     JSONB                    -- Détails analyse Marjorie
statut                VARCHAR(50)              -- RECU | ANALYSE | REPONDU | ERREUR
brouillon_objet       TEXT                     -- Si OUT : objet généré par Marjorie
brouillon_contenu     TEXT                     -- Si OUT : contenu généré par Marjorie
date_envoi            TIMESTAMP
date_reception        TIMESTAMP
```

#### Table `documents_candidat`
Pièces jointes des dossiers.

```sql
id_document           SERIAL       PRIMARY KEY
numero_dossier        VARCHAR(20)  REFERENCES candidats(numero_dossier)
type_document         VARCHAR(50)              -- CARTE_IDENTITE | CV | LETTRE_MOTIVATION | DIPLOME | CONTRAT | DEVIS | ATTESTATION
nom_fichier           VARCHAR(255)
lien_drive            TEXT                     -- URL Google Drive
statut                VARCHAR(50)              -- EN_ATTENTE | RECU | VALIDE | REFUSE
date_upload           TIMESTAMP
```

#### Table `eleves` (à créer)
Candidats inscrits qui ont basculé en élèves actifs.

```sql
id_eleve              SERIAL       PRIMARY KEY
id_candidat           INTEGER      REFERENCES candidats(id_candidat)
numero_dossier        VARCHAR(20)
formation_suivie      VARCHAR(100)
date_debut            DATE
date_fin_prevue       DATE
formateur_principal   INTEGER                  -- Référence vers table formateurs
statut_formation      VARCHAR(50)              -- EN_COURS | TERMINE | ABANDONNE
notes                 JSONB                    -- Historique des évaluations
presences             JSONB                    -- Historique présence/absence
```

#### Table `formateurs` (à créer)
Professeurs externes.

```sql
id_formateur          SERIAL       PRIMARY KEY
nom                   VARCHAR(100)
prenom                VARCHAR(100)
email                 VARCHAR(255) UNIQUE
telephone             VARCHAR(20)
specialites           TEXT[]                   -- CAP_BIJOU | SERTISSAGE | CAO_DAO | etc.
tarif_journalier      DECIMAL(10,2)
statut                VARCHAR(50)              -- ACTIF | INACTIF
```

#### Table `disponibilites_formateurs` (à créer)
Calendrier dynamique des disponibilités.

```sql
id_disponibilite      SERIAL       PRIMARY KEY
id_formateur          INTEGER      REFERENCES formateurs(id_formateur)
date_debut            DATE
date_fin              DATE
statut                VARCHAR(50)              -- DISPONIBLE | RESERVE | CONFIRME
formation_concernee   VARCHAR(100)
salle_assignee        VARCHAR(50)
```

#### Table `salles` (à créer - pour plus tard)
Configuration des salles et capacités.

```sql
id_salle              SERIAL       PRIMARY KEY
nom                   VARCHAR(100)
capacite_max          INTEGER
equipements           TEXT[]                   -- ETABLI_BIJOU | POSTE_SERTI | ORDINATEUR_CAO | etc.
disponible_weekend    BOOLEAN      DEFAULT FALSE
disponible_soir       BOOLEAN      DEFAULT FALSE
```

#### Table `journal_erreurs`
Monitoring et debug des workflows n8n.

```sql
id_erreur             SERIAL       PRIMARY KEY
workflow              VARCHAR(100)
node                  VARCHAR(100)
message_erreur        TEXT
contexte              JSONB
date_erreur           TIMESTAMP
```

---

## 3. Parcours Candidat

### 3.1. Origine des candidats

Les candidats arrivent par **tous les canaux** :
- Formulaire contact site web WordPress
- Email direct à contact@abj.fr
- Téléphone (saisi manuellement dans le système via Marjorie)
- Salons, événements (saisi manuellement)

**Marjorie centralise tout** : quel que soit le canal, tout converge vers le même pipeline dans la base de données.

### 3.2. Pipeline de conversion détaillé

```
┌──────────────┐
│   PROSPECT   │ ← Première prise de contact (formulaire, email, téléphone)
└──────┬───────┘
       │ Marjorie envoie lien formulaire dossier complet
       ↓
┌──────────────┐
│ CANDIDAT     │ ← Formulaire soumis → statut RECU
│ (RECU)       │
└──────┬───────┘
       │ Marjorie collecte documents manquants par emails
       ↓
┌──────────────┐
│ DOSSIER_EN   │ ← Documents en cours de réception
│ _COURS       │
└──────┬───────┘
       │ Tous documents reçus
       ↓
┌──────────────┐
│ DOSSIER_     │ ← Fiche candidat générée automatiquement
│ COMPLET      │   Notification admin : "Dossier prêt pour jury"
└──────┬───────┘
       │ Direction pédagogique appelle le candidat (validation humaine)
       ↓
┌──────────────┐
│ ENTRETIEN_   │ ← Email "candidat validé pour [formation]" envoyé à Marjorie
│ PLANIFIE     │   ⚡ TRIGGER : Marjorie pilote la maturation du dossier
└──────┬───────┘
       │ Marjorie génère et envoie le devis
       ↓
┌──────────────┐
│ DEVIS_       │ ← Devis transmis au candidat
│ ENVOYE       │
└──────┬───────┘
       │ Candidat signe électroniquement
       ↓
┌──────────────┐
│ DEVIS_       │ ← ⚡ ENGAGEMENT FORMEL ABJ
│ ACCEPTE      │   Marjorie suit le dossier jusqu'à inscription
└──────┬───────┘
       │ Dossier OPCO/CPF/Pôle Emploi ou paiement personnel
       ↓
┌──────────────┐
│ FINANCEMENT_ │ ← Suivi du financement
│ EN_COURS     │
└──────┬───────┘
       │ Financement confirmé
       ↓
┌──────────────┐
│ FINANCEMENT_ │ ← Tous feux au vert
│ VALIDE       │
└──────┬───────┘
       │ Validation finale admin
       ↓
┌──────────────┐
│ ACCEPTE      │ ← Prêt pour inscription
└──────┬───────┘
       │ Attribution à une session (manuelle ou via calendrier dynamique)
       ↓
┌──────────────┐
│ INSCRIT      │ ← ⚡ BASCULE EN ÉLÈVE
└──────────────┘   Création dans table eleves
```

### 3.3. Cas particuliers

#### Refus ou report de projet
```
CANDIDAT (n'importe quel statut)
       ↓ Refusé par jury OU candidat reporte
┌──────────────┐
│ statut_dossier = REFUSE │
└──────┬───────┘
       │ Candidat archivé, prospect conservé
       ↓
PROSPECT (statut_prospect = EN_ATTENTE_DOSSIER ou NOUVEAU)
       ↓ Peut recandidater plus tard
NOUVEAU CANDIDAT créé, lié au même id_prospect
```

#### Liste d'attente
```
┌──────────────┐
│ LISTE_       │ ← Candidat accepté mais pas de place immédiate
│ ATTENTE      │   Marjorie le notifie automatiquement quand place disponible
└──────────────┘
```

---

## 4. Workflows Automatisés (n8n)

### 4.1. Architecture des workflows

Deux workflows principaux interconnectés :

#### **Workflow 1** : `abj_branche3_dossier_complet_simplifie` (50 nodes)
Rôle : Point d'entrée de tous les emails IMAP, classification IA, routage vers 3 branches.

```
📥 IMAP Hostinger (contact@abj.fr)
    ↓
🤖 AI Agent Classificateur (avec outil SQL check_prospect)
    ↓
📊 Parse JSON
    ↓
🔀 Switch Router
    ↓
    ├─→ BRANCHE 1: formulaire_contact (formulaire WordPress)
    ├─→ BRANCHE 2: demande_directe (Marjorie répond)
    └─→ BRANCHE 3: dossier_complet (création dossier)
```

**Catégories de classification** :
- `formulaire_contact` : Email provenant du formulaire site web
- `demande_directe` : Demande d'information sur formations
- `organisme_tiers` : OPCO, CPF, France Travail
- `dossier_complet` : Candidature avec pièces jointes
- `extra` : Spam, pub, hors sujet

**Règle importante** : Un prospect connu (dans la BDD) n'est JAMAIS classifié "extra", même si son message est vague.

#### **Workflow 2** : `abj_createur_dossier` (25 nodes)
Rôle : Sous-workflow appelé par Branche 3. Crée le dossier complet d'un candidat.

```
🔌 Webhook Input (données formulaire + pièces jointes)
    ↓
🔢 Générer numero_dossier (2L nom + 2L prénom + JJMMAAAA)
    ↓
🔍 Vérifier si candidat existe déjà
    ↓
❓ Doublon détecté ?
    ├─→ OUI: Retourne infos dossier existant
    └─→ NON: Création complète
         ↓
    💾 Upsert Prospect (création ou mise à jour)
         ↓
    💾 Insert Candidat (statut: RECU, financement: EN_ATTENTE)
         ↓
    📁 Créer dossier Google Drive [numero_dossier][nom]
         ↓
    📁 Créer sous-dossier DOCUMENTS
         ↓
    📤 Upload pièces jointes dans Drive
         ↓
    💾 Insert documents_candidat (liens Drive)
         ↓
    📄 Copier template fiche candidat Google Docs
         ↓
    📝 Remplir placeholders dynamiquement (nom, prénom, formation, etc.)
         ↓
    📥 Télécharger fiche en PDF
         ↓
    📤 Upload PDF dans Drive
         ↓
    💾 Update candidat (lien_dossier_drive, lien_fiche_candidat)
         ↓
    📦 Output → retour workflow principal
```

### 4.2. Branche 1 — Formulaire Contact

Traite les emails du formulaire WordPress.

```
📧 Email formulaire_contact
    ↓
🤖 LLM Classifier → Intention = Formation ?
    ├─→ OUI
    │   ↓
    │   👤 Extraction données contact (nom, prénom, email, tel, formation)
    │   ↓
    │   💾 Upsert Prospect (statut: NOUVEAU)
    │   ↓
    │   📝 Log email en historique_emails
    │   ↓
    │   📧 Envoi email avec lien formulaire dossier complet
    │   ↓
    │   💾 Update statut_prospect → EN_ATTENTE_DOSSIER
    │
    └─→ NON: Redirection vers Branche 2 (Marjorie répond)
```

### 4.3. Branche 2 — Demande Directe (Agent Marjorie Email)

**C'est le cœur intelligent du système.** Marjorie analyse, contextualise et répond aux prospects avec mémoire longue.

```
📧 Email entrant
    ↓
📋 Normalisation (nettoyage, extraction expéditeur)
    ↓
💾 Insert historique_emails (sens: IN, statut: RECU)
    ↓
🔍 Find Prospect (recherche par email, id_prospect, téléphone)
    ↓
📊 Format Context Prospect (infos + statut + historique)
    ↓
🤖 AI_Analyze (GPT-4o)
    ├─→ Classification intention
    ├─→ Détection formation souhaitée
    ├─→ Détection mode financement
    └─→ Évaluation urgence
    ↓
💾 Update historique_emails.classification_ia (résultat analyse)
    ↓
┌─────────────────┬─────────────────┬─────────────────┐
↓                 ↓                 ↓                 ↓
📚 RAG Google    📜 Historique    🔗 Contexte       🔗 Merge All
   Drive ABJ         IN/OUT           Prospect
    ↓
🤖 AI_Reply (GPT-4o) avec contexte complet
    ├─→ reply_subject
    ├─→ reply_body_markdown
    ├─→ needs_followup (booléen)
    └─→ missing_info (liste)
    ↓
💾 Save Draft (brouillon_objet, brouillon_contenu)
    ↓
📝 Convert Markdown → HTML
    ↓
📧 SMTP Send Reply
    ↓
┌──────────┬──────────┬──────────┐
↓          ↓          ↓          ↓
💾 Log     💾 Update  🧠 Update   ✅ Fin
   OUT        IN sent    Prospect
              statut     profile
```

#### Caractéristiques de Marjorie Email

**Mémoire longue** :
- Lit l'historique complet des échanges IN/OUT avec chaque prospect
- Comprend le contexte et la progression du dossier

**RAG (Retrieval-Augmented Generation)** :
- Recherche dans les documents Google Drive de l'ABJ
- Fournit des réponses précises sur les formations, modalités, financements

**Règle entonnoir** :
- Si `statut_dossier = AUCUN` → inclut systématiquement le lien du formulaire de candidature
- Si dossier existe → mentionne le `numero_dossier` dans la réponse

**Enrichissement automatique** :
- Après chaque échange, met à jour le profil prospect (formation_principale, nb_echanges, date_dernier_contact)

**Sortie JSON stricte** :
```json
{
  "reply_subject": "Objet de l'email",
  "reply_body_markdown": "Contenu au format Markdown",
  "needs_followup": true,
  "missing_info": ["pièce identité", "lettre motivation"]
}
```

#### Formations reconnues par Marjorie

- CAP Art du Bijou et du Joyau (CAP ATBJ)
- Sertissage Niveau 1 (initiation)
- Sertissage Niveau 2 (perfectionnement)
- Joaillerie Création
- Taille Lapidaire
- CAO/DAO Bijouterie (3D, Rhino, MatrixGold)
- Gemmologie
- Polissage

### 4.4. Branche 3 — Dossier Complet

Traite les candidatures complètes avec pièces jointes.

```
📧 Email dossier_complet (avec PJ)
    ↓
📋 Parser formulaire (extraction champs structurés)
    ↓
🔧 Appeler Workflow 2: abj_createur_dossier
    ↓
❓ Nouveau dossier créé ?
    ├─→ OUI
    │   ↓
    │   📧 Email bienvenue candidat
    │   ↓
    │   📧 Email notification admin ("Nouveau dossier DUMI15091992")
    │
    └─→ NON (doublon)
        ↓
        📧 Email candidat ("Dossier déjà existant")
    ↓
💾 Log action en journal_erreurs (si erreur) ou historique_emails
    ↓
✅ Fin workflow
```

### 4.5. Calendrier Dynamique et Optimisation Sessions

**Objectif** : Croiser automatiquement les disponibilités formateurs, salles et candidats en attente pour proposer de nouvelles sessions.

#### Workflow proposé (à développer)

```
⏰ CRON (quotidien ou hebdomadaire)
    ↓
🔍 Requête SQL: Formateurs disponibles 6 mois à venir
    ↓
🔍 Requête SQL: Salles disponibles (capacité, équipements)
    ↓
🔍 Requête SQL: Candidats LISTE_ATTENTE ou ACCEPTE (par formation)
    ↓
🤖 AI Agent Optimisation
    ├─→ Croise formateur.specialites avec candidats.formation_retenue
    ├─→ Vérifie capacité salle ≥ nombre candidats
    ├─→ Respecte contraintes (week-end, soir, durée formation)
    └─→ Génère propositions de sessions optimisées
    ↓
💾 Insert sessions_proposees (table temporaire)
    ↓
📧 Email admin: "3 sessions optimisées détectées pour semaine 32-35"
    ↓
❓ Admin valide session ?
    ├─→ OUI
    │   ↓
    │   💾 Confirme session (disponibilites_formateurs.statut = CONFIRME)
    │   ↓
    │   📧 Marjorie envoie propositions aux candidats concernés
    │   ↓
    │   ❓ Candidat accepte ?
    │       ├─→ OUI: Update candidat.statut_dossier → INSCRIT
    │       └─→ NON: Reste LISTE_ATTENTE
    │
    └─→ NON: Session annulée
```

**Exemple concret** :
```
Semaine 32 détectée :
✅ Formateur sertissage : 4 jours disponibles
✅ Salle sertissage : 4 jours libres, 6 places
✅ 5 candidats LISTE_ATTENTE pour Sertissage Niveau 1

→ Marjorie propose automatiquement :
   "Session Sertissage Niveau 1 — Semaine 32 (4 jours)"
   Envoi email aux 5 candidats : "Place disponible, acceptez-vous ?"
```

---

## 5. Agent Marjorie dans le CRM (Messagerie Interne)

### 5.1. Architecture système multi-agent

**Marjorie** est le nom unifié perçu par les utilisateurs, mais techniquement c'est un **système multi-agent n8n** avec des agents spécialisés :

- **Agent Messagerie** : Gère les conversations chat CRM
- **Agent Planning** : Optimise les sessions, calendrier
- **Agent Documents** : Génère contrats, attestations, devis
- **Agent Devis** : Suivi devis + signature électronique
- **Agent Notes** : Traite les relevés de notes des formateurs (détection anomalies)
- **Agent Absences** : Traite les absences des élèves (alertes si anomalies)

**Un seul endpoint n8n** : Le CRM envoie tous les messages à un webhook unique qui route vers le bon agent selon le contexte.

### 5.2. Contexte de rôle adaptatif

Le webhook n8n reçoit :
```json
{
  "userId": "eleve_123",
  "role": "eleve",
  "message": "Je veux télécharger mon attestation CAP Bijou"
}
```

Le prompt système de Marjorie s'adapte :
```
Tu es Marjorie, assistante intelligente de l'Académie de Bijouterie Joaillerie (ABJ).
L'utilisateur actuel a le rôle : {{ role }}

RÈGLES PAR RÔLE :

- eleve : Tu réponds uniquement sur SES cours, SES notes, SES documents, SON planning.
  Tu n'as AUCUN accès aux infos des autres élèves ni aux process internes de l'ABJ.

- professeur : Tu peux accéder aux infos de TES classes et TES élèves uniquement.
  Pas d'accès aux données financières ni aux process admin.

- admin : Accès complet. Tu peux gérer candidats, élèves, formateurs, documents,
  stats, process internes, envoi emails, génération contrats.
```

### 5.3. Capacités par rôle

#### Marjorie pour ÉLÈVE

**Demandes possibles** :
- "Je veux télécharger mon attestation de formation"
  → Marjorie génère le PDF et l'envoie
- "Quand est-ce que j'ai cours la semaine prochaine ?"
  → Marjorie consulte son planning (mais idéalement affiché sur l'interface)
- "Je n'ai pas reçu mon certificat de réalisation"
  → Marjorie vérifie le statut, régénère si nécessaire
- "Comment contacter mon formateur M. Dupont ?"
  → Marjorie donne les coordonnées du formateur

**Actions impossibles** :
- ❌ Reporter une session (abandon = gestion admin/financeur)
- ❌ Voir les notes/infos des autres élèves
- ❌ Modifier ses propres notes

#### Marjorie pour FORMATEUR

**Demandes possibles** :
- "J'ajoute 3 jours de disponibilité semaine 35 pour CAP Bijou"
  → Marjorie met à jour `disponibilites_formateurs`
- "Envoie-moi la liste de mes élèves pour la session du 20 février"
  → Marjorie génère un PDF avec noms, emails, photos
- "Je veux soumettre le relevé de notes de ma classe"
  → Marjorie demande de remplir le formulaire dédié (pas de PJ mail)
- "Julien Dupont était absent le 12 février"
  → Marjorie enregistre l'absence

**Actions impossibles** :
- ❌ Voir les élèves des autres formateurs
- ❌ Accéder aux données financières
- ❌ Modifier le contenu des cours (passe par service informatique)

#### Marjorie pour ADMINISTRATIF

**Demandes possibles** :
- "Envoie un devis à Juliette Rimbo (JURI102025)"
  → Marjorie vérifie que le dossier est complet (check documents requis)
  → Si document manquant (ex: lettre motivation) : "Pièce manquante détectée. Autorises-tu une exemption ?"
  → Si OK : génère devis + envoi email + traçabilité complète
- "Génère le contrat pour dossier DUMI15091992"
  → Marjorie vérifie statut = DEVIS_ACCEPTE
  → Génère contrat à partir du template Google Docs
- "Liste les candidats bloqués depuis plus de 15 jours"
  → Marjorie requête SQL + affiche dans le chat (mais idéalement visible sur tableau de bord)
- "Combien de places reste-t-il pour CAP Bijou session avril ?"
  → Marjorie consulte sessions + inscrits (mais idéalement affiché sur tableau de bord)

**Human in the loop** :
- Si Marjorie ne peut pas traiter une demande complexe → "Je transmets ta demande au service informatique"
- Si incohérence détectée (ex: tentative d'envoyer devis alors que dossier incomplet) → demande confirmation avec traçabilité

### 5.4. Autonomie et sécurité

**Marjorie peut exécuter directement** :
- ✅ Toutes les opérations de lecture BDD
- ✅ Génération de documents standards (devis, contrats, attestations)
- ✅ Envoi d'emails transactionnels (confirmations, relances)
- ✅ Mise à jour statuts candidats (si cohérent avec le pipeline)
- ✅ Ajout disponibilités formateurs
- ✅ Enregistrement notes et absences (après validation formulaire)

**Marjorie demande validation humaine** :
- ⚠️ Exemption de document requis
- ⚠️ Modification de statut inhabituelle (ex: retour arrière dans le pipeline)
- ⚠️ Génération document hors process standard
- ⚠️ Envoi email marketing/masse

**Traçabilité anti-magouille** :
- Tous les messages Marjorie sont loggés en BDD (`historique_marjorie_crm`)
- Chaque action critique stocke : `user_id`, `role`, `demande`, `reponse_marjorie`, `action_executee`, `timestamp`
- Historique consultable par admin : qui a demandé quoi, quand, pourquoi

**Trigger clé — Email "candidat validé"** :
```
📧 Direction pédagogique envoie :
   "Candidat validé pour CAP Art du Bijou — Juliette Rimbo JURI102025"
    ↓
🤖 Marjorie détecte trigger (regex + classification IA)
    ↓
💾 Update candidat.statut_dossier → ENTRETIEN_PLANIFIE
💾 Update candidat.formation_retenue → "CAP Art du Bijou"
    ↓
🎯 Marjorie prend le relais :
    ├─→ Génère devis automatiquement
    ├─→ Envoie email devis au candidat
    ├─→ Suit la signature électronique
    ├─→ Relance si pas de réponse sous 7 jours
    ├─→ Suit le dossier financement
    └─→ Alerte admin si blocage > 15 jours
```

---

## 6. Gestion des Documents

### 6.1. Types de documents

#### Documents candidat (collectés)
- **Carte d'identité** (CARTE_IDENTITE)
- **CV** (CV)
- **Lettre de motivation** (LETTRE_MOTIVATION)
- **Diplômes** (DIPLOME)
- **Justificatif de financement** (si OPCO/CPF)

#### Documents générés par le système
- **Fiche candidat** (FICHE_CANDIDAT) — Générée automatiquement lors de la création du dossier
- **Devis** (DEVIS) — Avec signature électronique (à développer)
- **Contrat de formation** (CONTRAT)
- **Attestation de formation** (ATTESTATION)
- **Certificat de réalisation** (CERTIFICAT)
- **Factures** (à développer)

### 6.2. Workflow de génération de documents

**Tous les documents sont gérés par n8n, pas par le CRM.**

#### Templates Google Docs
- Chaque type de document a un template Google Docs avec des **placeholders** :
  - `{{nom}}`, `{{prenom}}`, `{{email}}`, `{{telephone}}`
  - `{{formation}}`, `{{date_debut}}`, `{{date_fin}}`
  - `{{tarif}}`, `{{mode_financement}}`
  - etc.

#### Processus de génération
```
📝 Demande génération document (via Marjorie ou workflow)
    ↓
🔍 Récupération données candidat/élève en BDD
    ↓
📄 Copie du template Google Docs
    ↓
🔧 Remplacement des placeholders via Google Docs API
    ↓
📥 Export PDF automatique
    ↓
📤 Upload PDF dans Google Drive (dossier candidat)
    ↓
💾 Insert/Update documents_candidat (lien_drive)
    ↓
📧 Envoi email avec lien de téléchargement (si demandé)
```

#### Exemple : Génération fiche candidat (déjà implémenté)
Voir Workflow 2 — `abj_createur_dossier` :
1. Copie template "Fiche Candidat ABJ"
2. Remplit : nom, prénom, email, téléphone, formation souhaitée, date candidature
3. Export PDF
4. Upload dans `/[numero_dossier][nom]/Fiche_Candidat_[numero_dossier].pdf`
5. Update `candidats.lien_fiche_candidat`

### 6.3. Stockage

**Google Drive** : Tous les fichiers (PDF, images, Google Docs)
**PostgreSQL** : Uniquement les liens vers Drive

Structure Drive :
```
ABJ - Dossiers Candidats/
├── DUMI15091992 Dumitru Marie/
│   ├── DOCUMENTS/
│   │   ├── Carte_Identite_DUMI15091992.jpg
│   │   ├── CV_DUMI15091992.pdf
│   │   ├── Lettre_Motivation_DUMI15091992.pdf
│   │   └── Diplome_CAP_DUMI15091992.pdf
│   ├── Fiche_Candidat_DUMI15091992.pdf
│   ├── Devis_DUMI15091992.pdf
│   └── Contrat_Formation_DUMI15091992.pdf
│
└── JURI102025 Rimbo Juliette/
    └── ...
```

### 6.4. Signature électronique (à développer)

**Fonctionnalité prioritaire** : Signature des devis électroniquement.

**Workflow envisagé** :
```
📝 Marjorie génère devis
    ↓
📤 Upload vers plateforme signature (Yousign, DocuSign, ou custom)
    ↓
📧 Email candidat avec lien signature
    ↓
⏳ Attente signature
    ↓
🔔 Webhook retour plateforme signature
    ↓
💾 Update candidat.statut_dossier → DEVIS_ACCEPTE
💾 Télécharge PDF signé dans Drive
💾 Insert documents_candidat (type: DEVIS, statut: SIGNE)
    ↓
🤖 Marjorie déclenche étape suivante (financement)
```

**Outil à choisir** : À définir (Yousign recommandé pour France).

---

## 7. Interfaces Utilisateur (CRM Next.js)

### 7.1. Principe général

**3 interfaces différentes selon le rôle**, mais :
- Même codebase Next.js
- Même endpoint n8n pour Marjorie
- Même base de données PostgreSQL

**Le frontend affiche des vues différentes**, le backend (n8n + Prisma) filtre les données selon le rôle.

### 7.2. Interface ADMINISTRATIF

#### Dashboard principal
- **Vue candidats** : Liste avec filtres par statut (RECU, EN_COURS, ACCEPTE, etc.)
- **Vue formations** : Sessions planifiées, places disponibles, inscrits
- **Statistiques** : Taux de conversion, CA prévisionnel, nombre de candidats par formation
- **Planning global** : Calendrier des sessions (salles + formateurs + élèves)
- **Alertes** : Candidats bloqués > 15 jours, documents manquants, relances à faire

#### Pages détaillées
- **Fiche candidat** : Toutes les infos + historique emails + documents + actions Marjorie
- **Fiche formation** : Description, prérequis, tarifs, sessions planifiées
- **Gestion formateurs** : Liste, disponibilités, tarifs

#### Chat Marjorie
- Accès complet à Marjorie (rôle: "admin")
- Demandes : génération docs, envoi emails, requêtes BDD complexes

### 7.3. Interface FORMATEUR

#### Dashboard principal
- **Mes élèves** : Liste des élèves de SES classes uniquement
- **Mes sessions** : Planning de ses interventions
- **Disponibilités** : Calendrier pour ajouter/modifier ses dispos

#### Pages détaillées
- **Fiche élève** : Infos, notes, présences, documents (uniquement SES élèves)
- **Formulaire notes** : Saisie validée par agent Marjorie (détection anomalies)
- **Formulaire présences** : Validation dates prévisionnelles

#### Chat Marjorie
- Accès restreint (rôle: "professeur")
- Demandes : infos SES élèves, ajout dispos, questions pédagogiques

### 7.4. Interface ÉLÈVE

#### Dashboard principal
- **Mon profil** : Infos personnelles, formation suivie
- **Mon planning** : Calendrier de mes sessions
- **Mes notes** : Évaluations détaillées
- **Mes documents** : Attestations, certificats, supports de cours

#### Pages détaillées
- **Détail session** : Date, formateur, salle, contenu, support téléchargeable

#### Chat Marjorie
- Accès restreint (rôle: "eleve")
- Demandes : téléchargement attestations, questions sur planning/notes

### 7.5. Messagerie interne

**Système unifié** : Tous les utilisateurs communiquent avec Marjorie via le même composant chat.

#### Composant React (proposition)
```tsx
<MarjorieChat
  userId={session.user.id}
  role={session.user.role}
  context={contextPage}
/>
```

**Contexte page** : Si l'utilisateur est sur la fiche d'un candidat spécifique, le contexte est envoyé à Marjorie pour des réponses plus pertinentes.

**Format messages** :
```json
{
  "userId": "admin_45",
  "role": "admin",
  "message": "Envoie un devis à Juliette Rimbo JURI102025",
  "context": {
    "page": "candidat",
    "numero_dossier": "JURI102025"
  }
}
```

---

## 8. Sécurité et Conformité

### 8.1. Authentification et autorisations

- **Auth provider** : NextAuth.js (ou Clerk, Auth0 selon préférence)
- **Rôles** : admin, professeur, eleve (stockés en BDD + JWT)
- **Row Level Security (RLS)** Prisma :
  - Un formateur ne voit QUE ses élèves
  - Un élève ne voit QUE ses propres données

### 8.2. Protection données personnelles (RGPD)

- Consentement explicite lors de la soumission du formulaire
- Droit d'accès : élève peut télécharger toutes ses données
- Droit à l'effacement : archivage candidats refusés après X mois
- Chiffrement des données sensibles (si nécessaire)

### 8.3. Logs et traçabilité

- **Tous les accès BDD** sont loggés
- **Toutes les demandes Marjorie** sont tracées
- **Historique des modifications** : qui a changé quoi, quand

### 8.4. Backup et résilience

- Sauvegardes PostgreSQL automatiques (quotidiennes)
- Backup Google Drive (géré par Google)
- Monitoring n8n (table `journal_erreurs`)

---

## 9. Prochaines Étapes de Développement

### Phase 1 — MVP Core (priorité immédiate)
1. ✅ Workflow n8n email (déjà fait)
2. ✅ Workflow créateur dossier (déjà fait)
3. 🔲 Base de données PostgreSQL complète (tables eleves, formateurs, salles, etc.)
4. 🔲 Interface admin : dashboard + liste candidats + fiche candidat
5. 🔲 Chat Marjorie CRM (rôle: admin uniquement pour commencer)
6. 🔲 Authentification Next.js (NextAuth + rôles)

### Phase 2 — Formateurs et Élèves
1. 🔲 Interface formateur : mes élèves, mes sessions
2. 🔲 Formulaire notes formateur (validation Marjorie)
3. 🔲 Interface élève : mon profil, mon planning, mes documents
4. 🔲 Chat Marjorie pour formateurs et élèves (filtres selon rôle)

### Phase 3 — Calendrier Dynamique
1. 🔲 Gestion disponibilités formateurs (interface + BDD)
2. 🔲 Gestion capacité salles (interface + BDD)
3. 🔲 Workflow optimisation sessions (croisement formateurs + salles + candidats)
4. 🔲 Propositions automatiques aux candidats en liste d'attente

### Phase 4 — Signature Électronique et Contrats
1. 🔲 Intégration plateforme signature (Yousign ou autre)
2. 🔲 Workflow signature devis (génération → envoi → webhook retour)
3. 🔲 Génération contrats automatiques
4. 🔲 Suivi paiements et factures

### Phase 5 — Analytics et Optimisation
1. 🔲 Dashboard stats avancées (CA, taux conversion, prédictions)
2. 🔲 Alertes intelligentes (candidats à risque d'abandon)
3. 🔲 Optimisation IA (suggestions d'amélioration process)

---

## 10. Glossaire

| Terme | Définition |
|-------|------------|
| **Prospect** | Personne ayant pris contact avec l'ABJ, conservée en base même si projet avorté |
| **Candidat** | Dossier formel de candidature à une formation, lié à un prospect |
| **Élève** | Candidat inscrit définitivement (statut INSCRIT), suivant activement une formation |
| **Marjorie** | Agent IA multi-agents centralisant toutes les actions du CRM |
| **Numéro de dossier** | Identifiant unique d'un candidat : 2L nom + 2L prénom + JJMMAAAA (ex: DUMI15091992) |
| **Trigger clé** | Email "candidat validé pour [formation]" envoyé par direction péda → Marjorie pilote le dossier |
| **Human in the loop** | Validation humaine demandée par Marjorie pour actions critiques |
| **RAG** | Retrieval-Augmented Generation : Marjorie cherche dans documents Drive pour répondre |
| **Calendrier dynamique** | Système croisant dispos formateurs + salles + candidats pour optimiser les sessions |

---

**Auteur** : Spécifications rédigées par Claude Code
**Version** : 1.0
**Dernière mise à jour** : 2026-02-05
