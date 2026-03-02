# Analyse du Workflow n8n — Branche CAP (Création de Sessions)

**Date** : 2 mars 2026
**Auteur** : Claude Code (session d'analyse)
**Statut** : Analyse uniquement — Aucun code modifié
**Périmètre** : Workflow `crm-session` (20 nodes), branche CAP

---

## Table des matières

1. [Contexte et objectif](#1-contexte-et-objectif)
2. [Architecture du workflow](#2-architecture-du-workflow)
3. [Données de test analysées](#3-données-de-test-analysées)
4. [Problèmes critiques](#4-problèmes-critiques)
5. [Problèmes importants](#5-problèmes-importants)
6. [Problèmes mineurs](#6-problèmes-mineurs)
7. [Synthèse : cause racine du comportement erratique](#7-synthèse--cause-racine-du-comportement-erratique)
8. [Matrice de priorité des corrections](#8-matrice-de-priorité-des-corrections)
9. [Recommandations de correction](#9-recommandations-de-correction)
10. [Annexes](#annexes)

---

## 1. Contexte et objectif

### Pourquoi cette analyse

Le workflow n8n de création de sessions CAP "fonctionne plus ou moins mais n'est pas optimal et fait des choses bizarres". L'objectif est d'identifier précisément les causes de ce comportement avant toute modification.

### Périmètre

- **Workflow analysé** : `crm-session` (webhook → planification → insertion BDD → réponse)
- **Branche ciblée** : CAP uniquement (formations longues multi-matières)
- **Source de données** : Données pinnées dans le workflow + schéma Prisma du CRM
- **CRM** : Code source de la branche `claude/n8n-scheduling-agent-MrlTp`

### Ce qui a été analysé côté CRM

| Fichier CRM | Rôle |
|---|---|
| `prisma/schema.prisma` | Modèles Session, ReservationSalle, Salle, Formateur, DisponibiliteFormateur, Formation |
| `src/app/api/sessions/callback/route.ts` | Endpoint callback n8n → CRM (non utilisé) |
| `src/app/api/sessions/validate/route.ts` | Endpoint validation session (chemin alternatif) |
| `src/components/admin/SessionFormModal.tsx` | Formulaire envoi direct vers n8n |
| `src/components/admin/session-form/FormationCAPForm.tsx` | Formulaire CAP avec programme matières |
| `src/components/admin/session-form/session-form.types.ts` | Types TypeScript du payload |
| `scripts/seed-complete-dataset.ts` | Données initiales (confirmation code `CAP_BJ`) |

---

## 2. Architecture du workflow

### Vue d'ensemble (20 nodes)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        WORKFLOW CRM-SESSION (CAP)                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [1] Webhook Session                                                    │
│       ↓                                                                 │
│  [2] Type Formation? ──────── (non-CAP) → autres branches              │
│       ↓ CAP                                                             │
│  [3] Type Formation?1 ─────── (redondant, même vérification)           │
│       ↓ CAP                                                             │
│  [4] Extraire Programme CAP                                             │
│       ↓                                                                 │
│  [5] Payload Valide CAP?                                                │
│       ↓ valide                                                          │
│  [6] Budget Suffisant?                                                  │
│       ↓ oui                                                             │
│  ┌────────────────────────────────────────────┐                         │
│  │ REQUÊTES SQL PARALLÈLES                    │                         │
│  │  [7] Query Formation CAP                   │                         │
│  │  [8] Query Salles CAP                      │                         │
│  │  [9] Query Formateurs CAP                  │                         │
│  └────────┬───────────────────────────────────┘                         │
│           ↓                                                             │
│  [10] Agreger Donnees CAP                                               │
│       ↓                                                                 │
│  [11] IA Macro-Planning (GPT-4.1)                                       │
│       ↓                                                                 │
│  [12] Parser Macro-Planning                                             │
│       ↓                                                                 │
│  [13] Micro-Planning CAP (algorithme déterministe)                      │
│       ↓                                                                 │
│  [14] Validateur CAP                                                    │
│       ↓                                                                 │
│  [15] Validation CAP OK?                                                │
│       ↓ oui                                                             │
│  [16] Creer Session BDD CAP                                             │
│       ↓                                                                 │
│  [17] Preparer Reservations CAP ──→ génère ~200 items                   │
│       ↓ (×200)                                                          │
│  [18] Creer Reservations CAP ──→ INSERT unitaire (×200)                 │
│       ↓ (×200)                                                          │
│  [19] Notification CAP ──→ INSERT notification (×200) ⚠️                │
│       ↓ (×200)                                                          │
│  [20] Repondre Succes CAP ──→ Tente réponse webhook (×200) ⚠️          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Phase 1 — Validation et enrichissement (nodes 1-6)

Le webhook reçoit le payload du CRM, vérifie le type de formation (CAP), extrait le programme des matières, valide le payload, et vérifie le "budget" (en réalité : `nbParticipants >= 1`).

### Phase 2 — Collecte données BDD (nodes 7-10)

Trois requêtes SQL parallèles récupèrent la formation, les salles compatibles et les formateurs disponibles. Un node d'agrégation fusionne les résultats.

### Phase 3 — Planification IA (nodes 11-13)

Deux étapes :
- **Macro-Planning** (GPT-4.1) : Répartit les matières en blocs de dates sur l'année
- **Micro-Planning** (algorithme JS) : Remplit les créneaux horaires jour par jour

### Phase 4 — Validation et insertion (nodes 14-20)

Le validateur vérifie le planning, puis la session et les réservations sont insérées en BDD. Une notification est envoyée et le webhook répond.

---

## 3. Données de test analysées

### Payload pinné dans le workflow

```json
{
  "type": "CAP",
  "codeFormation": "CAP_ATBJ",
  "nomSession": "CAP Art et Techniques du Bijou - Promo 2026",
  "dateDebut": "2026-06-01",
  "dateFin": "2027-05-29",
  "nbParticipants": 8,
  "plageHoraire": {
    "heureDebut": "09:00",
    "heureFin": "17:00",
    "pauseDebut": "12:00",
    "pauseFin": "13:00"
  },
  "joursActifs": ["lundi", "mardi", "mercredi", "jeudi", "vendredi"],
  "programme": [
    { "nom": "Techniques de fabrication de bijoux", "heures": 200, "heuresConsecutivesMax": 4 },
    { "nom": "Techniques de soudure et assemblage", "heures": 200, "heuresConsecutivesMax": 4 },
    { "nom": "Polissage et finition", "heures": 200, "heuresConsecutivesMax": 4 },
    { "nom": "Histoire de l'art et du bijou", "heures": 200, "heuresConsecutivesMax": 4 }
  ]
}
```

### Calculs clés dérivés

| Paramètre | Valeur |
|---|---|
| Heures totales | 4 × 200 = **800h** |
| Heures/jour (avec pause) | 3h matin (09:00-12:00) + 4h AM (13:00-17:00) = **7h/jour** |
| Jours ouvrés dans la période | ~239 jours (juin 2026 → mai 2027, lun-ven) |
| Jours nécessaires si 7h/jour | 800 / 7 = **~115 jours** |
| `heuresConsecutivesMax` pour toutes | **4h** → < 7h/jour → toutes classées **DEMI_JOURNEE** |

### Classification des matières

Comme `heuresConsecutivesMax (4h) < heuresParJour (7h)`, le node "Extraire Programme CAP" classe les 4 matières en `typeCreneau: "DEMI_JOURNEE"`.

Cela signifie que chaque matière ne peut occuper qu'un demi-journée par jour (MATIN ou APRES_MIDI), pas les deux.

---

## 4. Problèmes critiques

> Problèmes qui causent des résultats incorrects ou un crash du workflow.

### C1. Code formation incompatible — `CAP_ATBJ` vs `CAP_BJ`

**Localisation** : Node "Query Formation CAP" (node 7)

**Problème** :
Le payload envoie `codeFormation: "CAP_ATBJ"`. La base de données ne contient que `CAP_BJ` (confirmé dans `scripts/seed-complete-dataset.ts` et `prisma/schema.prisma`).

```sql
-- Query exécutée par le node
SELECT * FROM formations WHERE code_formation = 'CAP_ATBJ'
-- Résultat : 0 lignes
```

**Impact** :
Le node "Agreger Donnees CAP" reçoit une formation vide. Les nodes suivants (IA, micro-planning) travaillent sans référence de formation.

**Correction** :
Aligner le code formation dans le formulaire CRM (`FormationCAPForm.tsx` envoie `codeFormation` depuis le state) ou dans le seed (`CAP_BJ` → `CAP_ATBJ`). Une seule source de vérité est nécessaire.

---

### C2. Sous-estimation de `joursNecessaires` qui trompe l'IA

**Localisation** : Node "Extraire Programme CAP" (node 4)

**Problème** :
Le calcul de `joursNecessaires` par matière utilise le maximum entre matin et après-midi :

```js
const heuresMatin = plageHoraire.pauseDebut
  ? /* calcul */ : heuresParJour / 2  // = 3h
const heuresAM = plageHoraire.pauseFin
  ? /* calcul */ : heuresParJour / 2  // = 4h

joursNecessaires: Math.ceil(m.heures / Math.max(heuresMatin, heuresAM))
// = Math.ceil(200 / Math.max(3, 4))
// = Math.ceil(200 / 4)
// = 50 jours
```

Mais si la matière est assignée au créneau **MATIN** (3h par session), il faudrait :
```
Math.ceil(200 / 3) = 67 jours
```

**Impact** :
L'IA reçoit `joursNecessaires: 50` et crée des blocs de ~50 jours. Quand le micro-planning essaie de placer 200h en créneaux de 3h sur 50 jours, il ne peut placer que `50 × 3 = 150h`. Il manque **50h** par matière.

**Pire cas** : L'IA reçoit `joursNecessaires: 50` × 4 matières = 200 slots. Mais il n'y a que ~239 jours et chaque matière est en DEMI_JOURNEE. Si toutes sont en MATIN (voir C3), il faut 4 × 67 = 268 slots MATIN, mais il n'y a que 239 jours → **impossible**.

**Correction** :
Calculer `joursNecessaires` avec le créneau le plus restrictif :

```js
joursNecessaires: Math.ceil(m.heures / Math.min(heuresMatin, heuresAM))
// = Math.ceil(200 / Math.min(3, 4))
// = Math.ceil(200 / 3)
// = 67 jours
```

Ou mieux : fournir les deux valeurs (`joursNecessairesMatin: 67, joursNecessairesAM: 50`) pour que l'IA puisse optimiser.

---

### C3. Le parser DEMI_JOURNEE force systématiquement en MATIN

**Localisation** : Node "Parser Macro-Planning" (node 12)

**Problème** :
Quand l'IA assigne un créneau `"JOURNEE"` à une matière classée DEMI_JOURNEE, le parser applique un fallback :

```js
if (m.typeCreneau === 'DEMI_JOURNEE') {
  if (!['MATIN', 'APRES_MIDI'].includes(assignedCreneau)) {
    assignedCreneau = 'MATIN'  // Fallback systématique
  }
}
```

L'IA assigne souvent `"JOURNEE"` car elle ne distingue pas finement les contraintes de créneaux. Résultat : **toutes les matières DEMI_JOURNEE sont forcées en MATIN**.

**Impact** :
Avec les données test :
- 4 matières × 67 jours MATIN = **268 slots MATIN nécessaires**
- Seulement **239 jours** dans la période
- Les matières se battent pour le même créneau
- L'APRES_MIDI reste entièrement vide

**Correction** :
Alterner MATIN et APRES_MIDI au lieu de tout forcer en MATIN :

```js
if (m.typeCreneau === 'DEMI_JOURNEE') {
  if (!['MATIN', 'APRES_MIDI'].includes(assignedCreneau)) {
    // Alterner pour équilibrer la répartition
    assignedCreneau = (index % 2 === 0) ? 'MATIN' : 'APRES_MIDI'
  }
}
```

Ou mieux : ne pas fixer le créneau ici et laisser le micro-planning décider dynamiquement selon les disponibilités.

---

### C4. `matieresEnParallele` non exploité dans le micro-planning

**Localisation** : Node "Micro-Planning CAP" (node 13)

**Problème** :
Le champ `matieresEnParallele` est calculé dans "Extraire Programme CAP" :

```js
matieresEnParallele: matieresDemiJournee.length >= 2
// = true (4 matières DEMI_JOURNEE)
```

Cependant, dans le micro-planning, chaque matière est verrouillée sur son `periodesAutorisees` dérivé du créneau assigné par le parser. Si une matière est assignée à MATIN, elle ne pourra **jamais** utiliser un slot APRES_MIDI, même si :
- Le parallélisme est activé
- L'APRES_MIDI est libre
- La matière pourrait s'y insérer

**Impact** :
Le parallélisme théorique (deux matières le même jour : une MATIN, une APRES_MIDI) est rendu impossible par le verrouillage des créneaux.

**Correction** :
Quand `matieresEnParallele = true`, le micro-planning devrait pouvoir assigner dynamiquement MATIN ou APRES_MIDI selon ce qui est disponible, sans se limiter au créneau assigné par le macro-planning.

---

### C5. Notification dupliquée ~200 fois

**Localisation** : Nodes 17 → 18 → 19 → 20 (chaîne séquentielle)

**Problème** :
Le node "Preparer Reservations CAP" génère un tableau de ~200 items (une réservation par créneau). Ce tableau traverse les nodes suivants **item par item** :

```
Preparer Reservations → [item1, item2, ..., item200]
    ↓
Creer Reservations CAP → exécuté 200 fois (INSERT SQL × 200)
    ↓
Notification CAP → exécuté 200 fois (INSERT notification × 200)
    ↓
Repondre Succes CAP → exécuté 200 fois (seule la 1ère réponse passe)
```

**Impact** :
- **~200 notifications identiques** dans la table `notifications`
- **~199 erreurs silencieuses** sur le webhook de réponse (déjà répondu)
- **Performance** : 200 INSERT unitaires au lieu d'un batch

**Correction** :
Séparer le flow après "Creer Reservations CAP" :
1. Les réservations continuent en batch (SQL batch INSERT)
2. La notification est envoyée **une seule fois** après toutes les réservations
3. La réponse webhook est envoyée **une seule fois** à la fin

---

## 5. Problèmes importants

> Problèmes qui dégradent la qualité du résultat ou la robustesse.

### I1. Double vérification du type de formation

**Localisation** : Nodes 2 et 3

**Problème** :
"Type Formation?" et "Type Formation?1" vérifient tous les deux `$json.body.type === "CAP"` avec la même condition exacte. Le second node est redondant.

**Impact** : Aucun impact fonctionnel, mais confusion pour la maintenance.

**Correction** : Supprimer le node "Type Formation?1".

---

### I2. Débordement de bloc avec fallback sur toutes les dates

**Localisation** : Node "Micro-Planning CAP" (node 13)

**Problème** :
Quand le bloc de dates assigné par l'IA est épuisé, le code fait :

```js
if (datesCandidates.length === 0) {
  datesCandidates = toutesLesDates  // Fallback total
}
```

**Impact** :
La matière se retrouve dispersée sur toute l'année au lieu de rester dans son bloc. Le macro-planning perd tout son sens.

**Correction** :
Étendre progressivement : d'abord les blocs adjacents, puis l'ensemble des dates en dernier recours, avec un flag `depassementBloc: true` pour le validateur.

---

### I3. Absence de transaction BDD

**Localisation** : Nodes 16 → 17 → 18

**Problème** :
La session est créée (node 16), puis ~200 réservations sont insérées une par une (node 18). Si une insertion échoue :
- La session existe avec `statutValidation: 'VALIDE'`
- Le planning est partiel (certaines réservations manquent)
- Aucun mécanisme de rollback

**Impact** :
État incohérent en base en cas d'erreur partielle.

**Correction** :
Utiliser une transaction PostgreSQL ou, à défaut, insérer les réservations en batch avec un seul INSERT multi-values.

---

### I4. Timezone hardcodée en +02 (heure d'été)

**Localisation** : Node "Micro-Planning CAP" (node 13)

**Problème** :
```js
dateDebut: c.date + ' ' + c.heureDebut + ':00+02'
dateFin: c.date + ' ' + c.heureFin + ':00+02'
```

`+02` = CEST (Central European Summer Time), valide d'avril à octobre.
De novembre à mars, il faudrait `+01` = CET (Central European Time).

**Impact** :
Pour une formation de juin 2026 à mai 2027 :
- Juin → octobre : OK (+02)
- Novembre → mars : **décalage d'1 heure** (+02 au lieu de +01)
- Avril → mai : OK (+02)

Les séances d'hiver seraient décalées d'une heure dans le planning.

**Correction** :
Utiliser `Europe/Paris` comme timezone et laisser la BDD gérer la conversion :

```js
dateDebut: c.date + 'T' + c.heureDebut + ':00'  // Sans offset
// Ou utiliser une bibliothèque de dates pour déterminer l'offset correct
```

---

### I5. Requêtes SQL avec ~240 dates en IN(...)

**Localisation** : Nodes "Query Salles CAP" et "Query Formateurs CAP" (nodes 8, 9)

**Problème** :
Les requêtes construisent une clause `IN (...)` avec chaque date de la période :

```sql
WHERE date_debut IN ('2026-06-01', '2026-06-02', ..., '2027-05-29')
```

~240 valeurs littérales dans la clause.

**Impact** :
- Requête très longue en texte
- Plan d'exécution potentiellement sous-optimal

**Correction** :
```sql
WHERE date_debut BETWEEN '2026-06-01' AND '2027-05-29'
```

---

## 6. Problèmes mineurs

> Problèmes de design ou d'optimisation, non bloquants.

### M1. Disponibilités formateurs vides = toujours disponible

**Localisation** : Node "Agreger Donnees CAP" (node 10)

**Problème** :
```js
if (!f.dispos || f.dispos.length === 0) return true  // Considéré disponible
```

Si un formateur n'a déclaré aucune disponibilité, il est considéré disponible 365 jours/an.

**Impact** :
Un formateur sans disponibilités déclarées pourrait être assigné à une session de 200h répartie sur 67 jours sans que ce soit réellement possible.

**Recommandation** :
Au minimum, loguer un warning. Idéalement, exiger au moins une déclaration de disponibilité.

---

### M2. Architecture duale non connectée

**Localisation** : CRM (deux chemins d'envoi vers n8n)

**Problème** :
Deux chemins coexistent dans le CRM :

| Chemin | Composant | Webhook n8n | Crée session en BDD avant ? | Callback ? |
|---|---|---|---|---|
| A (actif) | `SessionFormModal.tsx` | `/webhook/crm-session` | Non | Non |
| B (inactif) | `sessions/validate` API | `/webhook/validate-session` | Oui (`EN_ANALYSE`) | Endpoint existe mais jamais appelé |

L'endpoint `/api/sessions/callback/route.ts` attend un callback de n8n pour mettre à jour le statut de la session, mais le workflow actuel n'appelle jamais ce callback. Il crée la session directement en BDD via SQL.

**Impact** :
Confusion architecturale. Le chemin B est du code mort.

**Recommandation** :
Choisir une seule architecture et supprimer l'autre.

---

### M3. "Budget Suffisant" ne vérifie pas le budget

**Localisation** : Node "Budget Suffisant?" (node 6)

**Problème** :
```js
condition: $json.nbParticipants >= 1
```

Le nom du node suggère une vérification budgétaire, mais il vérifie uniquement que le nombre de participants est ≥ 1.

**Impact** : Trompeur pour la maintenance.

**Recommandation** : Renommer en "Participants Valides?" ou ajouter une vraie vérification budgétaire.

---

### M4. Voeux formateur/salle ignorés

**Localisation** : Node "Micro-Planning CAP" (node 13)

**Problème** :
Les matières contiennent `formateurVoeux: number[]` et `salleVoeux: number[]` (IDs préférés). Le micro-planning assigne les formateurs et salles par rotation cyclique sans consulter ces préférences.

**Impact** :
L'utilisateur peut exprimer des préférences dans le formulaire, mais elles sont ignorées.

**Recommandation** :
Prioriser les voeux : tenter d'abord les formateurs/salles préférés, puis les autres en fallback.

---

## 7. Synthèse : cause racine du comportement erratique

Le comportement "bizarre" du workflow est causé par une **chaîne de problèmes interdépendants** dans la planification des matières DEMI_JOURNEE :

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHAÎNE CAUSALE PRINCIPALE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [C2] joursNecessaires = 50 (devrait être 67)                   │
│       ↓                                                          │
│  L'IA crée des blocs trop courts (~50 jours par matière)        │
│       ↓                                                          │
│  [C3] Le parser force toutes les matières en MATIN              │
│       ↓                                                          │
│  4 matières × 67 jours MATIN = 268 slots nécessaires            │
│  Mais seulement 239 jours disponibles                            │
│       ↓                                                          │
│  [C4] Le parallélisme est impossible (tout est MATIN)           │
│       ↓                                                          │
│  Les matières se battent pour les mêmes créneaux                │
│       ↓                                                          │
│  [I2] Débordement → fallback sur toutes les dates               │
│       ↓                                                          │
│  Planning chaotique : matières dispersées, heures manquantes     │
│       ↓                                                          │
│  [C5] + 200 notifications dupliquées amplifient le problème     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Simulation avec les données test

| Étape | Ce qui se passe | Ce qui devrait se passer |
|---|---|---|
| Extraction | 4 matières DEMI_JOURNEE, `joursNecessaires: 50` | `joursNecessaires: 67` |
| IA Macro | Crée 4 blocs de ~50 jours | Blocs de ~67 jours ou répartition MATIN/AM |
| Parser | Force les 4 matières en MATIN | 2 en MATIN + 2 en APRES_MIDI |
| Micro-Planning | 268 slots MATIN demandés, 239 dispo → débordement | 134 MATIN + 134 AM = 268 sur 239 jours → OK |
| Résultat | Heures manquantes, dispersion chaotique | Planning équilibré, toutes les heures placées |

### Ce qui fonctionnerait

Avec 2 matières en MATIN et 2 en APRES_MIDI :
- 2 × 67 MATIN = 134 slots MATIN nécessaires (< 239 disponibles)
- 2 × 50 APRES_MIDI = 100 slots AM nécessaires (< 239 disponibles)
- Parallélisme : 1 matière MATIN + 1 matière AM le même jour
- Total : ~134 jours effectifs (au lieu de 268 en conflit)

---

## 8. Matrice de priorité des corrections

| ID | Problème | Sévérité | Effort | Priorité |
|---|---|---|---|---|
| **C1** | Code formation `CAP_ATBJ` vs `CAP_BJ` | Critique | Faible | **P0** |
| **C5** | Notification × 200 + réponse × 200 | Critique | Faible | **P0** |
| **C2** | `joursNecessaires` sous-estimé | Critique | Faible | **P1** |
| **C3** | Parser force tout en MATIN | Critique | Moyen | **P1** |
| **C4** | Parallélisme non exploité | Critique | Moyen | **P1** |
| **I3** | Pas de transaction BDD | Important | Moyen | **P2** |
| **I4** | Timezone +02 hardcodée | Important | Faible | **P2** |
| **I1** | Double vérification type formation | Important | Trivial | **P3** |
| **I2** | Fallback bloc → toutes dates | Important | Moyen | **P3** |
| **I5** | IN(...) 240 dates → BETWEEN | Important | Trivial | **P3** |
| **M1** | Dispo vide = toujours dispo | Mineur | Faible | **P4** |
| **M2** | Architecture duale | Mineur | Moyen | **P4** |
| **M3** | Nom "Budget Suffisant" trompeur | Mineur | Trivial | **P4** |
| **M4** | Voeux formateur/salle ignorés | Mineur | Moyen | **P4** |

**Légende effort** : Trivial = quelques minutes | Faible = <1h | Moyen = quelques heures

---

## 9. Recommandations de correction

### Ordre de correction suggéré

#### Étape 1 : Corrections immédiates (P0) — ~30 min

1. **C1** : Aligner le code formation (`CAP_ATBJ` partout ou `CAP_BJ` partout)
2. **C5** : Séparer le flow après "Creer Reservations" :
   - Ajouter un node "Merge" qui attend toutes les réservations
   - La notification et la réponse passent après le merge (×1 au lieu de ×200)

#### Étape 2 : Corrections du planning (P1) — ~2-3h

3. **C2** : Modifier le calcul dans "Extraire Programme CAP" :
   ```js
   joursNecessairesMatin: Math.ceil(m.heures / heuresMatin),
   joursNecessairesAM: Math.ceil(m.heures / heuresAM),
   joursNecessaires: Math.ceil(m.heures / Math.min(heuresMatin, heuresAM))
   ```

4. **C3** : Modifier le parser pour alterner MATIN/APRES_MIDI :
   ```js
   if (m.typeCreneau === 'DEMI_JOURNEE' && !['MATIN','APRES_MIDI'].includes(assignedCreneau)) {
     assignedCreneau = (index % 2 === 0) ? 'MATIN' : 'APRES_MIDI'
   }
   ```

5. **C4** : Déverrouiller le micro-planning quand `matieresEnParallele = true` :
   - Permettre qu'une matière MATIN utilise un slot APRES_MIDI si son slot MATIN est pris
   - Objectif : remplir les deux demi-journées chaque jour

#### Étape 3 : Robustesse (P2) — ~1-2h

6. **I3** : Batch INSERT pour les réservations (un seul INSERT multi-values)
7. **I4** : Remplacer `+02` par une logique timezone correcte

#### Étape 4 : Nettoyage (P3-P4) — ~1h

8. **I1** : Supprimer le node redondant "Type Formation?1"
9. **I5** : Remplacer IN(...) par BETWEEN
10. **M3** : Renommer "Budget Suffisant?" en "Participants Valides?"

---

## Annexes

### A. Modèles Prisma pertinents

#### Session
```prisma
model Session {
  idSession             Int       @id @default(autoincrement())
  idFormation           Int?
  nomSession            String?
  dateDebut             DateTime
  dateFin               DateTime
  capaciteMax           Int?
  nbInscrits            Int       @default(0)
  statutSession         String?   @default("PREVUE")
  statutValidation      String?   @default("EN_ATTENTE")
  typeFormation         String?
  totalHeuresProgramme  Int?
  nbMatieres            Int?
  programmeResume       String?   @db.Text
  planningIA            Json?
  rapportIA             String?   @db.Text
  // ... relations
}
```

#### ReservationSalle
```prisma
model ReservationSalle {
  idReservation      Int       @id @default(autoincrement())
  idSalle            Int
  idSession          Int?
  dateDebut          DateTime
  dateFin            DateTime
  matiere            String?
  idFormateur        Int?
  typeFormation      String?
  statutReservation  String?   @default("PREVUE")
  // ... relations
}
```

#### DisponibiliteFormateur
```prisma
model DisponibiliteFormateur {
  idDisponibilite     Int      @id @default(autoincrement())
  idFormateur         Int
  dateDebut           DateTime
  dateFin             DateTime
  typeDisponibilite   String?  @default("DISPONIBLE")
  creneauJournee      String?  @default("JOURNEE")  // MATIN | APRES_MIDI | JOURNEE
  // ... relations
}
```

### B. Types TypeScript du payload (CRM)

```typescript
interface Matiere {
  nom: string
  heures: number
  heuresConsecutivesMax: number
  salleVoeux: number[]
  formateurVoeux: number[]
}

interface SessionAIPayload {
  type: 'CAP' | 'COURTE'
  codeFormation: string
  nomSession: string
  dateDebut: string
  dateFin: string
  nbParticipants: number
  plageHoraire: PlageHoraire
  joursActifs: string[]
  programme: Matiere[]
  periodesInterdites?: PeriodeInterdite[]
  formateurs?: any[]
  salles?: any[]
}
```

### C. Valeurs en base de données

| Table | Données pertinentes |
|---|---|
| `formations` | `code_formation: 'CAP_BJ'`, `duree_heures: 800`, `categorie: 'CAP'` |
| `salles` | 9 salles (Atelier A/B/C, Salle informatique, Salle théorie, etc.) |
| `formateurs` | 7 formateurs avec spécialités variées |

---

**Document produit dans le cadre de l'analyse du workflow n8n de création de sessions CAP.**
**Aucune modification de code n'a été effectuée.**
