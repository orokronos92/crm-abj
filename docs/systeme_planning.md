# Système de Planification Avancé — CRM ABJ

**Date** : 14 février 2026
**Statut** : En réflexion (attente données client)

---

## 📋 Contexte du Besoin

### Formations Simples (Actuellement Géré)
- **Exemple** : Sertissage 40h
- **Caractéristiques** :
  - 1 formateur unique
  - 2-5 jours consécutifs
  - 1 salle dédiée
  - Planification linéaire facile

### Formations Complexes (CAP 800h - Problématique)
- **Caractéristiques** :
  - 6-8 matières différentes
  - 6-8 formateurs différents (avec disponibilités à gérer)
  - Plusieurs salles à coordonner
  - Contraintes croisées : dispos formateurs × salles × progression pédagogique
  - Durée longue : 800h étalées sur 6-9 mois
  - 2-3 sessions CAP par an dans le centre

### Contraintes Identifiées

**Pédagogiques** :
- ⏳ Volume horaire par matière bien défini (données client à venir)
- ❓ Ordre des matières : à confirmer avec client
- ✅ Élèves peuvent être divisés en groupes

**Formateurs** :
- ✅ Un formateur peut enseigner plusieurs matières
- ✅ Disponibilités déclarées dans le CRM (`DisponibiliteFormateur`)

**Salles** :
- ✅ Salles dédiées équipées : Atelier bijouterie, Sertissage, Lapidaire
- ✅ Contraintes d'équipements spécifiques

**Organisation** :
- ✅ Mode semi-automatique souhaité : Admin attribue salle/formateur, IA vérifie la faisabilité
- ✅ Agent IA futur pour planification automatique complète

---

## 🧩 Analyse du Schéma Prisma Actuel

### ✅ Tables Existantes

**Formation** :
- Catalogue des formations (CAP, Sertissage, etc.)
- `dureeHeures`, `dureeJours`, `programme` (texte libre)

**Session** :
- Sessions planifiées avec `dateDebut`, `dateFin` globales
- `formateurPrincipalId` (un seul formateur principal)
- `idSalle` (une seule salle)
- **Limitation** : Pas de granularité jour/heure

**Salle** :
- 9 salles avec équipements et compatibilités
- `equipements[]`, `formationsCompatibles[]`

**Formateur** :
- Formateurs avec `specialites[]`
- `formationsEnseignees[]`

**DisponibiliteFormateur** :
- Disponibilités par période (`dateDebut`, `dateFin`)

**InterventionFormateur** :
- Suivi des interventions réalisées

### ❌ Tables Manquantes (CRITIQUES)

#### 1. Référentiel des Matières
**Problème** : Aucune entité "Matière" distincte (ex: Sertissage, Dessin technique, Histoire de l'art)

**Impact** :
- Impossible de savoir automatiquement quelles matières composer une formation
- Pas de référentiel pour planifier par matière
- Pas de contraintes pédagogiques (durée min/max séance, ordre)

#### 2. Composition des Formations (Programme)
**Problème** : Aucune table définissant qu'un CAP = X heures de dessin + Y heures de sertissage

**Impact** :
- Impossible de connaître les heures requises par matière
- Pas de suivi de la complétion (80h dessin planifiées sur 80h requises)

#### 3. Séances Détaillées (Granularité Jour/Heure)
**Problème** : Session a juste `dateDebut` et `dateFin` globales

**Impact** :
- Impossible de planifier "Lundi 9h-12h Sertissage salle A, 14h-17h Théorie salle B"
- Pas de vue détaillée du planning jour par jour

---

## 💡 Solution Proposée

### Architecture Tables de Référence

#### Table `Matiere`
```prisma
/// Référentiel des matières/modules enseignables
model Matiere {
  idMatiere     Int     @id @default(autoincrement())
  code          String  @unique // "SERTI_BASE", "DESSIN_TECH", "HISTOIRE_ART"
  nom           String  // "Sertissage de base", "Dessin technique"
  categorie     String  // "PRATIQUE" | "THEORIQUE" | "PROJET"

  // Contraintes pédagogiques par défaut
  dureeMinSeance      Int?    // Ex: minimum 2h par séance
  dureeMaxSeance      Int?    // Ex: maximum 6h par séance
  nbJoursConsecutifs  Int?    // Ex: 3 jours consécutifs recommandés

  // Contraintes salles
  sallesCompatibles   String[] // ["Atelier A", "Atelier B"] ou codes salles
  equipementsRequis   String[] // ["ETABLI_BIJOU", "CHALUMEAU"]

  creeLe    DateTime @default(now())
  modifieLe DateTime @default(now()) @updatedAt

  // Relations
  programmesFormations ProgrammeFormation[]
  seances             Seance[]

  @@map("matieres")
}
```

**Données exemple** :
```json
[
  {
    "code": "SERTI_BASE",
    "nom": "Sertissage de base",
    "categorie": "PRATIQUE",
    "dureeMinSeance": 2,
    "dureeMaxSeance": 6,
    "nbJoursConsecutifs": 3,
    "sallesCompatibles": ["Atelier A", "Atelier sertissage"],
    "equipementsRequis": ["ETABLI_BIJOU", "POSTE_SERTI"]
  },
  {
    "code": "DESSIN_TECH",
    "nom": "Dessin technique",
    "categorie": "THEORIQUE",
    "dureeMinSeance": 2,
    "dureeMaxSeance": 4,
    "sallesCompatibles": ["Salle théorie", "Salle informatique"],
    "equipementsRequis": []
  }
]
```

#### Table `ProgrammeFormation`
```prisma
/// Composition d'une formation (ex: CAP = X matières avec Y heures chacune)
model ProgrammeFormation {
  idProgramme   Int @id @default(autoincrement())
  idFormation   Int
  idMatiere     Int

  // Volume horaire OBLIGATOIRE pour cette matière dans cette formation
  nbHeuresRequises Int // Ex: 150h de sertissage dans un CAP

  // Contraintes pédagogiques
  ordre            Int?     // Ordre recommandé (1, 2, 3...)
  prerequisMatiere Int?     // idMatiere pré-requis (ex: théorie avant pratique)
  matiereBloquante Boolean @default(false) // Doit être terminée avant de passer à la suite ?

  creeLe    DateTime @default(now())
  modifieLe DateTime @default(now()) @updatedAt

  // Relations
  formation Formation @relation(fields: [idFormation], references: [idFormation])
  matiere   Matiere   @relation(fields: [idMatiere], references: [idMatiere])

  @@unique([idFormation, idMatiere])
  @@map("programmes_formations")
}
```

**Données exemple (CAP Bijouterie)** :
```json
{
  "formation": "CAP Bijouterie-Joaillerie",
  "matieres": [
    { "matiere": "Dessin technique", "heures": 80, "ordre": 1 },
    { "matiere": "Histoire de l'art", "heures": 40, "ordre": 2 },
    { "matiere": "Sertissage", "heures": 150, "ordre": 3 },
    { "matiere": "Polissage", "heures": 100, "ordre": 4 },
    { "matiere": "CAO/DAO", "heures": 80, "ordre": 5 },
    { "matiere": "Théorie métaux", "heures": 60, "ordre": 6 },
    { "matiere": "Gemmologie", "heures": 50, "ordre": 7 },
    { "matiere": "Projet final", "heures": 100, "ordre": 8 }
  ],
  "total": 660
}
```

#### Table `Seance`
```prisma
/// Séances détaillées d'une session (granularité jour/heure)
model Seance {
  idSeance    Int      @id @default(autoincrement())
  idSession   Int
  idMatiere   Int
  idFormateur Int
  idSalle     Int

  // Date et horaires précis
  date        DateTime @db.Date
  heureDebut  String   // "09:00"
  heureFin    String   // "12:00"
  dureeHeures Decimal  @db.Decimal(4,2) // Calculé automatiquement (3.00 pour 3h)

  // Organisation
  typeSeance  String   // "COURS" | "TP" | "EVALUATION" | "PROJET"
  titre       String?  // Ex: "Introduction au sertissage griffe"
  contenu     String?  @db.Text

  // Statut
  statut      String   @default("PREVUE") // PREVUE | CONFIRMEE | ANNULEE | REALISEE
  motifAnnulation String?

  creeLe    DateTime @default(now())
  modifieLe DateTime @default(now()) @updatedAt

  // Relations
  session   Session   @relation(fields: [idSession], references: [idSession])
  matiere   Matiere   @relation(fields: [idMatiere], references: [idMatiere])
  formateur Formateur @relation(fields: [idFormateur], references: [idFormateur])
  salle     Salle     @relation(fields: [idSalle], references: [idSalle])

  @@index([idSession, date])
  @@index([idFormateur, date])
  @@index([idSalle, date])
  @@map("seances")
}
```

---

## 🔄 Workflows de Planification

### Workflow 1 : Formation Simple (Sertissage 40h)

**Étape 1** : Admin crée une session
- Formation : "Sertissage Niveau 1"
- Dates : 15-19 février 2026 (5 jours)
- Capacité : 8 élèves

**Étape 2** : CRM propose automatiquement via IA
- Requête formateurs avec spécialité "Sertissage" disponibles 15-19 fév
- Requête salles équipées "ETABLI_SERTI" disponibles 15-19 fév
- Génère proposition : "Laurent Dupont - Atelier C - 9h-17h (5 jours)"

**Étape 3** : Admin valide ou ajuste
- Click "Valider" → Crée les 5 séances automatiquement
- Ou change manuellement formateur/salle si besoin

---

### Workflow 2 : CAP Bijouterie 800h (Complexe)

#### Phase A : Création Session

**Input Admin** :
- Formation : "CAP Bijouterie-Joaillerie"
- Dates globales : 1er mars - 30 novembre 2026 (9 mois)
- Capacité : 12 élèves
- Rythme : 3 jours/semaine (Lundi, Mardi, Mercredi)
- Amplitude : 09:00-17:00 avec pause 12:00-13:00

#### Phase B : Récupération Programme

CRM requête `ProgrammeFormation` pour CAP :
```
Programme CAP Bijouterie :
  - Dessin technique : 80h (ordre 1)
  - Histoire de l'art : 40h (ordre 2)
  - Sertissage : 150h (ordre 3)
  - Polissage : 100h (ordre 4)
  - CAO/DAO : 80h (ordre 5)
  - Théorie métaux : 60h (ordre 6)
  - Gemmologie : 50h (ordre 7)
  - Projet final : 100h (ordre 8)
Total : 660h
```

#### Phase C : Agent IA Planification (n8n)

**Inputs Agent** :
```json
{
  "idSession": 15,
  "codeFormation": "CAP_BJ",
  "dateDebut": "2026-03-01",
  "dateFin": "2026-11-30",
  "nbEleves": 12,
  "joursFormation": ["Lundi", "Mardi", "Mercredi"],
  "amplitude": { "debut": "09:00", "fin": "17:00", "pause": "12:00-13:00" },
  "contraintes": {
    "ordreMatiere": "optionnel",
    "parallelisme": false,
    "blocMinimum": 2
  }
}
```

**Processus Agent** :

1. **Analyse disponibilités formateurs**
   - Requête `DisponibiliteFormateur` par spécialité/matière
   - Laurent Dupont (Sertissage) : mars-mai
   - Marie Bernard (Dessin) : toute l'année
   - Thomas Petit (CAO) : juin-août
   - etc.

2. **Analyse disponibilités salles**
   - Requête `Salle` avec `equipements` compatibles
   - Atelier A : libre lundi/mardi/mercredi sauf semaines 12, 15, 20
   - Salle informatique : libre jeudi/vendredi
   - etc.

3. **Génération planning optimisé**
   ```
   Bloc 1 (Mars) : Dessin technique
     - 80h ÷ 6h/jour = 13 jours
     - Formateur : Marie Bernard
     - Salle : Salle théorie
     - Dates : 3, 4, 5, 10, 11, 12, 17, 18, 19, 24, 25, 26, 31 mars

   Bloc 2 (Avril-Mai) : Sertissage
     - 150h ÷ 6h/jour = 25 jours
     - Formateur : Laurent Dupont
     - Salle : Atelier A
     - Dates : 1-23 avril + 1-7 mai

   [...]
   ```

4. **Vérification contraintes**
   - ✅ Tous formateurs disponibles sur leurs périodes
   - ✅ Toutes salles libres
   - ✅ Pas de chevauchement
   - ✅ Heures requises couvertes

5. **Création séances en BDD**
   - Insert 103 séances dans table `Seance`
   - Statut initial : "PREVUE"

#### Phase D : Validation Admin

**Notification reçue** :
```
🤖 Planning CAP Bijouterie généré avec succès
103 séances créées
8 matières planifiées
5 formateurs mobilisés
4 salles utilisées
→ Cliquer pour valider ou ajuster
```

**Actions possibles** :
- ✅ Valider tout → Séances passent statut "CONFIRMEE"
- ✏️ Ajuster manuellement (drag & drop)
- 🔄 Regénérer avec nouvelles contraintes

---

### Workflow 3 : Mode Semi-Auto (Validation IA)

**Utilisé pour** : Admin crée séances manuellement une par une

**Flow** :

1. **Admin crée séance** :
   - Date : 15 février 2026
   - Heure : 9h-12h
   - Matière : Sertissage
   - Formateur : Laurent Dupont
   - Salle : Atelier A

2. **Au clic "Sauvegarder", IA vérifie** :
   ```
   Vérification en cours...
   ✅ Salle Atelier A disponible le 15/02 9h-12h
   ✅ Laurent Dupont disponible le 15/02
   ✅ Atelier A équipé pour Sertissage (ETABLI_BIJOU présent)
   ⚠️ Laurent Dupont a déjà 6h ce jour-là (session Sertissage N2)
      Confirmer surcharge horaire ?
   ```

3. **Admin décide** :
   - "Confirmer quand même" → Séance créée avec flag warning
   - "Proposer alternatives" → IA suggère :
     - Autre formateur dispo (Sophie Moreau - Sertissage)
     - Autre créneau (16/02 9h-12h)
     - Autre salle (Atelier C si équipée)

---

## 🤖 Agent IA : Planning Generator

### Spécifications Techniques

**Nom Agent** : `planning-session-generator`

**Plateforme** : n8n workflow

**Trigger** : Webhook POST depuis CRM lors création session CAP

**Inputs** :
```json
{
  "idSession": 15,
  "codeFormation": "CAP_BJ",
  "dateDebut": "2026-03-01",
  "dateFin": "2026-11-30",
  "nbEleves": 12,
  "reglesPlanification": {
    "joursFormation": ["Lundi", "Mardi", "Mercredi"],
    "amplitude": { "debut": "09:00", "fin": "17:00", "pauseDejeune": "12:00-13:00" },
    "dureeMinSeance": 2,
    "dureeMaxSeance": 6,
    "blocMinimum": 2,
    "ordreMatiere": "recommande",
    "parallelisme": false
  }
}
```

**Étapes Workflow** :

1. **Node: Get Programme Formation**
   - SQL : `SELECT * FROM programmes_formations WHERE id_formation = ?`
   - Output : Liste matières avec heures requises

2. **Node: Get Disponibilites Formateurs**
   - SQL : Joindre `formateurs` + `disponibilites_formateurs`
   - Filtrer par spécialités compatibles avec matières
   - Output : Disponibilités par formateur par matière

3. **Node: Get Disponibilites Salles**
   - SQL : `SELECT * FROM salles WHERE statut = 'ACTIVE'`
   - Filtrer par équipements requis par matière
   - Output : Disponibilités par salle par matière

4. **Node: AI Planning Algorithm**
   - LLM (GPT-4 ou Claude) avec prompt spécialisé
   - Context : Programme + Dispos formateurs + Dispos salles + Règles
   - Output : JSON planning complet

5. **Node: Validate Planning**
   - Vérifier contraintes (heures, chevauchements, disponibilités)
   - Output : Validation OK/KO avec détails erreurs

6. **Node: Create Seances Draft**
   - Insert bulk dans table `seances` avec statut "PROPOSITION"
   - Output : IDs séances créées

7. **Node: Notify Admin**
   - POST vers `/api/notifications/ingest`
   - Notification avec lien vers page validation planning

---

## 📊 Interface Admin : Validation Planning

### Composant `PlanningValidationModal`

**Affichage** :
- Timeline horizontale par matière
- Séances groupées par semaine/mois
- Code couleur par formateur
- Indicateurs : salle, durée, statut

**Actions** :
- ✅ "Valider tout" → Batch update statut CONFIRMEE
- ✏️ "Éditer séance" → Modal modification
- 🔄 "Regénérer" → Relancer agent avec nouvelles contraintes
- 📅 Drag & drop pour déplacer séance

**Détection conflits** :
- ⚠️ Badge rouge si formateur surchargé
- ⚠️ Badge orange si salle déjà réservée
- ⚠️ Badge jaune si heures matière < heures requises

---

## 📝 Questions en Attente Client

### 1. Programmes CAP Détaillés
**Question** : Pour chaque CAP (Bijouterie, Sertissage, etc.), quel est le détail exact des matières et heures ?

**Format souhaité** :
```
CAP Bijouterie-Joaillerie (800h) :
  - Matière 1 : X heures
  - Matière 2 : Y heures
  - [...]
```

### 2. Ordre des Matières
**Question** : Y a-t-il des contraintes pédagogiques strictes sur l'ordre ?

**Options** :
- a) Ordre strict (ex: théorie AVANT pratique obligatoirement)
- b) Ordre recommandé (flexible)
- c) Aucun ordre (totalement libre)

### 3. Organisation Élèves
**Question** : Pour un CAP avec 12 élèves, comment organiser les groupes ?

**Options** :
- a) Tous ensemble tout le temps (12 élèves → 1 seul groupe)
- b) Division possible (ex: 2 groupes de 6 pour ateliers pratiques)
- c) Rotation par atelier (groupe A en sertissage pendant que groupe B en théorie)

### 4. Rythme Hebdomadaire
**Question** : Combien de jours par semaine pour les formations longues (CAP) ?

**Contraintes** :
- Jours fixes (ex: toujours Lundi-Mardi-Mercredi) ?
- Flexibilité selon disponibilités formateurs ?
- Week-end possible ?

### 5. Amplitude Horaire
**Question** : Horaires types de formation ?

**Standard proposé** :
- Matin : 09:00-12:00 (3h)
- Après-midi : 13:00-17:00 (4h)
- Total : 6h/jour (avec pause déjeuner 12:00-13:00)

---

## 🎯 Prochaines Étapes

### Phase 1 : Attente Réponses Client
- ⏳ Récupération programmes CAP détaillés
- ⏳ Confirmation contraintes pédagogiques
- ⏳ Validation organisation élèves/rythme

### Phase 2 : Création Tables Référence
1. Créer table `Matiere` avec seed data
2. Créer table `ProgrammeFormation` avec compositions CAP
3. Créer table `Seance` pour granularité jour/heure
4. Migration Prisma + seed script

### Phase 3 : Mode Semi-Auto (Quick Win)
1. Formulaire création séance manuelle
2. API de validation (check dispo formateur/salle)
3. Feedback temps réel si conflit

### Phase 4 : Agent IA Automatique
1. Développement workflow n8n `planning-generator`
2. Algorithme de placement optimal
3. Interface validation planning avec drag & drop

---

**Dernière mise à jour** : 14 février 2026
**Auteur** : Claude Code
**Statut** : Document de réflexion — En attente données client
