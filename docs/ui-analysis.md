# Analyse des Maquettes UI — CRM ABJ

## Vue d'ensemble

4 maquettes ont été analysées pour comprendre les besoins en données et valider la cohérence avec le schéma BDD proposé.

---

## 1. Interface Admin (`abj-crm-v3.jsx`)

### 1.1. Dashboard Principal

**Composants** :
- **Statistiques globales** (StatCards)
  - Prospects total : `MOCK_PROSPECTS.length`
  - Candidats actifs : `MOCK_CANDIDATS.length`
  - Élèves en formation : `MOCK_ELEVES.length`
  - Dossiers complets : `MOCK_CANDIDATS.filter(c => c.statut_dossier === "COMPLET").length`
  - Taux de conversion : `62%` (calculé)
- **CA financier**
  - CA réalisé : `18 600€`
  - CA prévisionnel : `36 100€`
- **Derniers prospects** (liste avec avatar, nom, formation, statut)
- **Formations demandées** (graphique avec compteurs par formation)

**Données BDD nécessaires** :
```sql
-- Requête dashboard admin
SELECT COUNT(*) FROM prospects;
SELECT COUNT(*) FROM candidats;
SELECT COUNT(*) FROM eleves WHERE statut_formation = 'EN_COURS';
SELECT COUNT(*) FROM candidats WHERE statut_dossier = 'COMPLET';

-- CA
SELECT SUM(montant_total_formation) FROM candidats WHERE statut_financement = 'VALIDE';
SELECT SUM(montant_total_formation) FROM candidats WHERE statut_dossier IN ('EN_COURS', 'COMPLET', 'ACCEPTE');

-- Formations demandées
SELECT formation_retenue, COUNT(*) FROM candidats GROUP BY formation_retenue;
```

### 1.2. Vue Prospects

**Composants** :
- **Liste tableau** avec colonnes : Prospect, Formation souhaitée, Statut, Source, Échanges, Dernier contact
- **Panel latéral détail** : Infos contact, formation, financement, résumé IA

**Données MOCK utilisées** :
```javascript
{
  id, nom, prenom, email, tel,
  formation_souhaitee,
  statut,  // NOUVEAU | EN_ATTENTE_DOSSIER | CANDIDAT
  financement,
  source,  // formulaire_contact | demande_directe
  nb_echanges,
  dernier_contact,
  date_premier_contact,
  resume_ia  // Généré par Marjorie
}
```

**Tables BDD** : ✅ `prospects` (déjà en place)

### 1.3. Vue Candidats

**Composants** :
- **Liste tableau** : Candidat, N° Dossier, Formation, Statut dossier, Statut financement, Score, Date candidature
- **Fiche détaillée complète** avec :
  - Header (nom, email, tel, badges statuts, score progression)
  - Stats : N° Dossier, Formation, Date candidature, Nb échanges
  - **Parcours d'admission** (4 étapes) :
    - Entretien téléphonique (booléen + icône)
    - RDV présentiel (booléen + icône)
    - Test technique (booléen + icône)
    - Validation pédagogique (booléen + icône)
  - **Documents** (liste avec type + statut) :
    - CV, Lettre motivation, CNI, Diplômes
    - Statuts : VALIDE | RECU | MANQUANT
  - **Détail financier** :
    - Montant total formation
    - Montant prise en charge
    - Reste à charge
    - Mode financement (CPF, OPCO, France Travail, auto-financement)
  - **Notes IA Marjorie** : Analyse qualitative du profil

**Données MOCK utilisées** :
```javascript
{
  id, id_prospect, nom, prenom, email, tel,
  numero_dossier,  // "RELY15032001"
  formation, session,
  statut_dossier,  // RECU | EN_COURS | COMPLET
  statut_financement,  // EN_ATTENTE | EN_COURS | VALIDE
  financement,  // CPF | OPCO | France Travail | auto-financement
  montant_total, montant_pec, reste_a_charge,
  score,  // 0-100
  nb_echanges,
  dernier_contact,
  date_candidature,
  documents: [{ type, statut }],  // Array documents
  etapes: {  // Object booléens
    entretien_tel: true,
    rdv_presentiel: false,
    test_technique: false,
    validation_pedagogique: false
  },
  notes_ia  // Texte analyse Marjorie
}
```

**Tables BDD** :
- ✅ `candidats` (déjà en place, contient déjà les champs nécessaires)
- ✅ `documents_candidat` (déjà en place)

**Champs additionnels nécessaires dans `candidats`** :
- ✅ `score` : INTEGER (0-100) — **À AJOUTER**
- ✅ `notes_ia` : TEXT — **À AJOUTER**

### 1.4. Vue Élèves

**Composants** :
- **Grille de cartes** : Avatar, nom, formation, progression (ring), moyenne, heures, absences
- **Fiche détaillée** :
  - Header : nom, email, tel, badges (EN_FORMATION, formation, paiement), progression %
  - Stats : Moyenne, Heures effectuées/totales, Absences, Retards, Prochaine éval
  - Formation & encadrement : Formation, Session, Formateur, Salle, Dates, Financement, N° Dossier
  - **Évaluations** : Liste avec date, type (Pratique/Théorique), note /20, commentaire
  - **Historique** : Liste chronologique des événements

**Données MOCK utilisées** :
```javascript
{
  id, nom, prenom, email, tel,
  numero_dossier,
  formation, session,
  formateur,  // "M. Laurent"
  salle,  // "Atelier B"
  statut,  // EN_FORMATION
  progression,  // %
  date_debut, date_fin,
  heures_effectuees, heures_totales,
  prochaine_eval,
  notes_moyennes,  // Float
  absences, retards,
  financement,
  paiement_statut,  // A_JOUR | RETARD
  evaluations: [{
    date, type, note, commentaire
  }],
  historique: [string]  // Array événements
}
```

**Tables BDD nécessaires** :
- 🆕 `eleves` (à créer)
- 🆕 `evaluations` (à créer)
- 🆕 `presences` (pour calculer absences/retards)
- 🆕 `formateurs` (à créer, référencé dans élève)

### 1.5. Vue Formateurs

**Composants** :
- **Grille de cartes** : Avatar, nom, spécialité, email, tel, élèves actifs, sessions, salles
- **Fiche détaillée** :
  - Header : Nom, spécialité, badges (Formateur, nb élèves, heures/semaine)
  - Stats : Élèves actifs, Heures/semaine, Sessions actives
  - Coordonnées : Email, Tel, Salle(s)
  - Sessions en cours : Liste des sessions
  - Élèves suivis : Liste des élèves
  - Prochaines évaluations : Liste dates + matières
  - Biographie : Texte descriptif

**Données MOCK utilisées** :
```javascript
{
  id, nom, prenom,
  specialite,  // "Sertissage & Joaillerie"
  email, tel,
  eleves_actifs,  // Nombre
  sessions: [string],  // Array noms sessions
  salle,  // "Atelier B / C"
  bio,  // Texte long
  eleves: [string],  // Array noms élèves
  prochaines_evaluations: [string],  // Array "15/02 — Session (type)"
  heures_semaine
}
```

**Tables BDD nécessaires** :
- 🆕 `formateurs` (à créer)
- 🆕 `sessions` (à créer, pour lier formateurs et formations)

### 1.6. Vue Planning & Sessions

**Composants** :
- **Grille de sessions** : Formation, Session (nom), Formateur, Salle, Places (prises/total), Dates, Statut

**Données MOCK utilisées** :
```javascript
{
  id,
  formation,  // "CAP ATBJ"
  session,  // "Septembre 2025"
  formateur,  // "Mme. Petit"
  salle,  // "Atelier A"
  places_total, places_prises,
  date_debut, date_fin,
  statut  // EN_COURS | INSCRIPTIONS_OUVERTES
}
```

**Tables BDD nécessaires** :
- 🆕 `sessions` (à créer)
- 🆕 `formations` (à créer, référence catalogue formations)
- 🆕 `formateurs` (à créer)
- 🆕 `salles` (à créer, référence salles)

### 1.7. Vue Finances

**Composants** :
- **Stats globales** : Total formations, Prises en charge, Reste à charge total
- **Tableau détaillé** : Candidat, Formation, Financement, Total, Prise en charge, Reste, Statut

**Données BDD** :
```sql
-- Calculs financiers
SELECT
  SUM(montant_total_formation) as total,
  SUM(montant_prise_en_charge) as pec,
  SUM(reste_a_charge) as rac
FROM candidats;

-- Liste détaillée
SELECT
  c.prenom, c.nom, c.formation_retenue,
  c.mode_financement,
  c.montant_total_formation,
  c.montant_prise_en_charge,
  c.reste_a_charge,
  c.statut_financement
FROM candidats c;
```

**Tables BDD** : ✅ `candidats` (déjà suffisant)

---

## 2. Interface Élève (`abj-eleve-portal.jsx` + `abj-eleve-gaming.jsx`)

### 2.1. Dashboard Élève

**Composants** :
- **Banner bienvenue** : Avatar, nom, formation, session, formateur, badges (EN_FORMATION, Paiement), progression %
- **Statistiques** : Moyenne générale, Heures effectuées, Absences, Jours restants
- **Prochains événements** : Liste avec date, label (cours/évaluation), type
- **Dernières évaluations** : Liste avec matière, date, type, note, badge
- **Avancement heures** : Barre progression

**Données identiques à la fiche élève admin** (voir 1.4)

### 2.2. Mes Évaluations

**Composants** :
- **Moyennes** : Moyenne pondérée, Moyenne pratique, Moyenne théorique, Total évaluations
- **Liste évaluations expandables** :
  - Badge note, Matière, Date, Coeff
  - Expansion : Commentaire formateur, Évaluateur

**Données MOCK utilisées** :
```javascript
evaluations: [{
  id, date, type,  // Pratique | Théorique
  matiere,  // "Serti griffe"
  note,  // Float /20
  coeff,  // Integer
  commentaire,  // Texte formateur
  formateur  // "M. Laurent"
}]
```

**Tables BDD** : 🆕 `evaluations` (à créer)

### 2.3. Mon Planning

**Composants** :
- **Stats** : Formation, Formateur, Salle, Période
- **Emploi du temps hebdomadaire** : Par jour (Lundi-Vendredi), créneaux matin/après-midi avec horaires, matière, salle

**Données MOCK utilisées** :
```javascript
planning: [{
  jour,  // "Lundi"
  horaire,  // "9h00 – 12h30"
  matiere,  // "Serti griffe (pratique)"
  salle  // "Atelier B"
}]
```

**Tables BDD nécessaires** :
- 🆕 `planning_cours` ou `creneaux_horaires` (à créer)
- Ou stockage en JSONB dans `eleves` pour flexibilité

### 2.4. Mes Documents

**Composants** :
- **Stats** : Documents déposés, Documents validés, N° Dossier, Financement + Paiement
- **Liste documents** : Type, Date dépôt, Statut (badge)

**Données** : Identiques à documents candidat (voir 1.3)

**Tables BDD** : ✅ `documents_candidat` (déjà en place)

---

## 3. Interface Formateur (`abj-formateur-portal.jsx`)

### 3.1. Dashboard Formateur

**Composants** :
- **Banner** : Avatar formateur, nom, spécialité, heures/semaine, badges (Formateur, sessions actives, nb élèves)
- **Statistiques** : Élèves suivis, Moyenne globale (tous élèves), Élèves en alerte, Prochaine évaluation
- **Élèves en alerte** : Liste avec absences ≥3 OU retards ≥4 OU paiement retard OU moyenne <12
- **Prochaines évaluations** : Date, matière, formation, nb élèves, type
- **Résumé sessions** : Formation, session, nb élèves, avancement %

**Données MOCK utilisées** :
```javascript
// Formateur
{ id, nom, prenom, specialite, email, tel, salle, heures_semaine, bio }

// Ses élèves (même structure que admin.eleves)
{ ...eleve, observations }  // + champ observations formateur

// Ses sessions
{ id, formation, session, salle, places_total, places_prises, date_debut, date_fin, statut, nb_eleves, heures_totales, heures_effectuees, prochaine_eval }

// Évaluations à venir
{ id, date, formation, matiere, type, nb_eleves, salle }
```

**Tables BDD nécessaires** :
- 🆕 `formateurs` (à créer)
- 🆕 `sessions` (à créer)
- 🆕 `evaluations` (avec lien formateur)
- 🆕 `eleves` (avec champ observations formateur)

### 3.2. Mes Élèves

**Composants** :
- **Recherche + Filtres** : Par nom, email, formation + Filtre par session
- **Tableau élèves** : Avatar, Nom, Formation, Progression %, Moyenne, Absences, Retards, Paiement, Alerte icône
- **Fiche élève détaillée** : Identique à admin mais avec focus sur pédagogique + **observations formateur** (champ texte personnel)

**Champ additionnel** :
```javascript
{ ...eleve, observations }  // Texte privé du formateur
```

**Tables BDD** : 🆕 Champ `observations_formateur` dans `eleves` ou table dédiée `observations_formateurs`

### 3.3. Mes Sessions

**Composants** :
- **Liste sessions** : Formation, Session, nb élèves, moyenne session, avancement %, prochaine éval
- **Mini liste élèves par session** : Nom + moyenne + indicateur alerte

**Données** : Identiques à Planning admin (voir 1.6) avec calculs moyennes

**Tables BDD** : 🆕 `sessions`, `eleves`, `evaluations`

### 3.4. Évaluations

**Composants** :
- **Évaluations à venir** : Liste avec date, matière, formation, type, nb élèves, salle
- **Notes récentes tous élèves** : Tableau avec nom élève, formation, 3 dernières notes, moyenne

**Tables BDD** : 🆕 `evaluations` (avec lien formateur + élève)

### 3.5. Mon Planning

**Composants** :
- **Stats** : Heures/semaine, Sessions actives, Salles
- **Emploi du temps hebdomadaire** : Par jour, créneaux avec horaires, matière, salle, code couleur par session

**Données MOCK utilisées** :
```javascript
planning: [{
  jour, creneaux: [{
    horaire, matiere, salle, session
  }]
}]
```

**Tables BDD** : 🆕 `planning_formateurs` ou stockage JSONB

---

## 4. Chat Marjorie (toutes interfaces)

### Composants

**Widget chat flottant** présent sur toutes les interfaces :
- Avatar diamant
- Indicateur en ligne (vert)
- Badge rôle : "Mode Élève" / "Mode Formateur" / "Assistante IA"
- Messages avec bulles différenciées user/bot
- Indicateur typing (3 dots pulsants)

### Contexte adaptatif selon rôle

**Props transmis** :
```javascript
<MarjorieChat role="admin" />   // Admin
<MarjorieChat role="professeur" userId={formateur.id} />  // Formateur
<MarjorieChat role="eleve" userId={eleve.id} />  // Élève
```

### Messages exemples

**Admin** :
- "3 nouveaux prospects cette semaine, dont Claire Martin très motivée"
- "Le dossier de Lya Rebagliato attend CNI et diplômes"
- "2 dossiers OPCO en attente de validation"

**Formateur** :
- "Vous avez 13 élèves actifs sur 2 sessions"
- "Maxime Barbier cumule 5 absences et 6 retards + paiement en retard"
- "Chloé Fontaine : 16.1 de moyenne, profil à recommander pour concours"

**Élève** :
- "Ta progression : 68% sur Sertissage N2"
- "Prochaine évaluation : 15/02 (pratique serti rail)"
- "Ta moyenne : 15.2/20, continue comme ça !"

### Tables BDD nécessaires

🆕 `historique_marjorie_crm` (à créer) :
```sql
id_message SERIAL PRIMARY KEY
id_utilisateur INTEGER REFERENCES utilisateurs(id_utilisateur)
role_utilisateur TEXT CHECK (role IN ('admin', 'professeur', 'eleve'))
message_utilisateur TEXT
reponse_marjorie TEXT
contexte JSONB  -- {page: "candidat", numero_dossier: "..."}
action_executee TEXT
resultat_action JSONB
erreur TEXT
duree_traitement_ms INTEGER
date_envoi TIMESTAMPTZ
date_reponse TIMESTAMPTZ
```

---

## 5. Validation du Schéma BDD Proposé

### 5.1. Tables Existantes (7) — ✅ Validées

Toutes les tables existantes sont bien utilisées dans les maquettes :
- ✅ `prospects` → Vue Prospects admin
- ✅ `candidats` → Vue Candidats admin
- ✅ `documents_candidat` → Toutes vues Documents
- ✅ `historique_emails` → Utilisé par Marjorie (backend)
- ✅ `journal_erreurs` → Monitoring (backend)
- ✅ `statuts_documents` → Lookup (backend)
- ✅ `types_documents` → Lookup (backend)

### 5.2. Tables Nouvelles Proposées (17) — Validation

#### ✅ VALIDÉES (utilisées dans maquettes)

1. **`eleves`** → Vue Élèves admin + Interface élève complète
2. **`formations`** → Vue Planning, Sessions
3. **`sessions`** → Vue Planning, Formateurs, Élèves
4. **`inscriptions_sessions`** → Lien élèves ↔ sessions (implicite dans maquettes)
5. **`formateurs`** → Vue Formateurs admin + Interface formateur
6. **`disponibilites_formateurs`** → Planning formateur (implicite)
7. **`evaluations`** → Vue Évaluations (élève + formateur + admin)
8. **`presences`** → Absences/retards élèves (calculs affichés)
9. **`utilisateurs`** → Authentification (3 rôles : admin, professeur, eleve)
10. **`historique_marjorie_crm`** → Chat Marjorie traçabilité

#### ⏸️ NON VISIBLES (backend/futurs)

11. **`interventions_formateurs`** → Comptabilité formateurs (pas dans maquettes)
12. **`salles`** → Référencées par texte, pas de gestion avancée visible
13. **`reservations_salles`** → Planning salles (pas dans maquettes)
14. **`sessions_auth`** → NextAuth sessions (technique)
15. **`tokens_verification`** → Email/reset password (technique)
16. **`messages_internes`** → Messagerie user-to-user (pas dans maquettes, futur)
17. **`sessions_optimisees`** → Propositions IA calendrier dynamique (Phase 3, futur)

### 5.3. Champs Additionnels Identifiés

#### `candidats` — 2 champs à ajouter

```sql
ALTER TABLE candidats ADD COLUMN score INTEGER CHECK (score >= 0 AND score <= 100);
ALTER TABLE candidats ADD COLUMN notes_ia TEXT;
```

**Justification** :
- `score` : Affiché dans tableau candidats + fiche détail (progression ring)
- `notes_ia` : "Analyse Marjorie" affichée dans fiche candidat

#### `eleves` — Structure complète proposée

```sql
CREATE TABLE eleves (
  id_eleve SERIAL PRIMARY KEY,
  id_candidat INTEGER REFERENCES candidats(id_candidat),
  id_utilisateur INTEGER REFERENCES utilisateurs(id_utilisateur),
  numero_dossier TEXT UNIQUE,
  formation_suivie TEXT,
  date_debut DATE,
  date_fin_prevue DATE,
  date_fin_reelle DATE,
  statut_formation TEXT CHECK (statut IN ('EN_COURS', 'TERMINE', 'ABANDONNE', 'SUSPENDU')),
  motif_abandon TEXT,
  notes_moyennes NUMERIC(4,2),  -- Moyenne générale /20
  heures_effectuees INTEGER,
  heures_totales INTEGER,
  progression INTEGER,  -- % calculé
  absences INTEGER DEFAULT 0,
  retards INTEGER DEFAULT 0,
  paiement_statut TEXT CHECK (statut IN ('A_JOUR', 'RETARD')),
  observations_formateur TEXT,  -- Notes privées formateur
  notes_generales TEXT,
  cree_le TIMESTAMPTZ DEFAULT now(),
  modifie_le TIMESTAMPTZ DEFAULT now()
);
```

---

## 6. Données Calculées vs Stockées

### 6.1. Champs Calculés (pas en BDD)

Ces valeurs sont calculées à la volée :

**Admin Dashboard** :
- `taux_conversion` : `(candidats.INSCRIT / prospects.total) * 100`
- `ca_realise` : `SUM(candidats.montant WHERE financement_valide)`
- `ca_previsionnel` : `SUM(candidats.montant WHERE statut IN [...])`

**Élèves** :
- `progression` : `(heures_effectuees / heures_totales) * 100`
- `notes_moyennes` : `AVG(evaluations.note)` ou pondéré par coeff
- `jours_restants` : `date_fin - CURRENT_DATE`

**Sessions** :
- `places_restantes` : `places_total - places_prises`
- `avancement_heures` : `(heures_effectuees / heures_totales) * 100`

**Formateurs** :
- `eleves_actifs` : `COUNT(eleves WHERE formateur_id = ...)`
- `moyenne_session` : `AVG(eleves.notes_moyennes WHERE session = ...)`

### 6.2. Champs Stockés (en BDD)

**Candidats** :
- `score` : Calculé par IA Marjorie et stocké (pas recalculé en temps réel)
- `notes_ia` : Texte généré par IA et stocké

**Élèves** :
- `progression` : Peut être stocké OU calculé
- `notes_moyennes` : Peut être stocké OU calculé
- `absences`, `retards` : Compteurs stockés

---

## 7. Planning & Horaires

### 7.1. Structure Planning Élève

**Option 1 : Table dédiée `planning_cours`**
```sql
CREATE TABLE planning_cours (
  id_planning SERIAL PRIMARY KEY,
  id_session INTEGER REFERENCES sessions(id_session),
  jour_semaine TEXT CHECK (jour IN ('Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi')),
  heure_debut TIME,
  heure_fin TIME,
  matiere TEXT,
  salle TEXT,
  formateur_id INTEGER REFERENCES formateurs(id_formateur)
);
```

**Option 2 : JSONB dans `sessions`**
```sql
ALTER TABLE sessions ADD COLUMN planning_hebdomadaire JSONB;

-- Exemple structure JSONB :
{
  "Lundi": [
    {"debut": "09:00", "fin": "12:30", "matiere": "Serti griffe", "salle": "Atelier B"},
    {"debut": "14:00", "fin": "17:30", "matiere": "Serti clos", "salle": "Atelier B"}
  ],
  "Mardi": [...]
}
```

**Recommandation** : JSONB pour flexibilité et simplicité (planning fixe par session)

### 7.2. Planning Formateur

Idem, mais avec vision transversale multi-sessions :
- Requête qui agrège planning de toutes les sessions du formateur
- Ou table `disponibilites_formateurs` avec créneaux confirmés

---

## 8. Récapitulatif — Besoins BDD Validés

### Tables EXISTANTES à conserver (7)
✅ Toutes validées et utilisées

### Tables NOUVELLES prioritaires (10)

**Phase 1 — MVP Core** :
1. ✅ `utilisateurs` — Auth 3 rôles
2. ✅ `eleves` — Élèves en formation
3. ✅ `formateurs` — Professeurs
4. ✅ `formations` — Catalogue formations
5. ✅ `sessions` — Sessions planifiées
6. ✅ `inscriptions_sessions` — Lien élèves ↔ sessions
7. ✅ `evaluations` — Notes élèves
8. ✅ `presences` — Assiduité
9. ✅ `historique_marjorie_crm` — Chat traçabilité
10. ✅ `sessions_auth` — NextAuth (technique)

**Phase 2** :
11. `interventions_formateurs` — Compta formateurs
12. `salles` — Référentiel salles

**Phase 3** :
13. `disponibilites_formateurs` — Calendrier dynamique
14. `reservations_salles` — Planning salles
15. `sessions_optimisees` — Propositions IA

**Phase 4+** :
16. `messages_internes` — Messagerie user-to-user
17. `tokens_verification` — Email/reset

### Modifications tables existantes

**`candidats`** — 2 colonnes à ajouter :
```sql
ALTER TABLE candidats ADD COLUMN score INTEGER CHECK (score >= 0 AND score <= 100);
ALTER TABLE candidats ADD COLUMN notes_ia TEXT;
```

---

## 9. Recommandations Implémentation

### 9.1. Priorités Phase 1

1. **Créer les 10 tables prioritaires** listées ci-dessus
2. **Ajouter `score` et `notes_ia` à `candidats`**
3. **Créer les seed data** :
   - Formations (CAP ATBJ, Sertissage N1/N2, CAO/DAO, Joaillerie, Gemmologie, Lapidaire)
   - Statuts (statuts_documents, types_documents)
   - Formateurs initiaux
4. **Schéma Prisma complet** avec toutes relations
5. **Migrations SQL** pour tables nouvelles

### 9.2. Structure Projet Next.js

Suivre la structure proposée dans `docs/architecture.md` :
```
src/
  app/
    (auth)/              # Login, register
    (admin)/             # Interface admin (7 vues)
    (formateur)/         # Interface formateur (5 vues)
    (eleve)/             # Interface élève (4 vues)
    api/                 # API Routes
  components/
    admin/, formateur/, eleve/, shared/
  lib/
    prisma.ts, auth.ts, n8n.ts, utils.ts
  hooks/
    use-candidats.ts, use-marjorie.ts, etc.
  types/
    candidat.ts, eleve.ts, formateur.ts, database.ts
```

### 9.3. Maquettes à Implémenter

**Choix design** :
- **Admin** : `abj-crm-v3.jsx` (complet et professionnel)
- **Formateur** : `abj-formateur-portal.jsx` (cohérent avec admin)
- **Élève** : Choix entre :
  - `abj-eleve-portal.jsx` (classique, cohérent)
  - `abj-eleve-gaming.jsx` (moderne, engageant) ⭐ **Recommandé pour différenciation**

**Justification élève gaming** :
- Design plus immersif et motivant pour les élèves
- Effets visuels modernes (néon, grilles animées)
- Différenciation claire avec interfaces pro (admin/formateur)
- Gamification implicite (progression visuellement impactante)

---

**Version** : 1.0
**Dernière mise à jour** : 2026-02-05
**Auteur** : Claude Code — Analyse des 4 maquettes UI
