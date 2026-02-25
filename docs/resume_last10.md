# Résumé Session 10 : Pipeline Conversion Prospect→Candidat→Élève + Corrections BDD

**Date** : 25 février 2026
**Objectif principal** : Corriger la transmission des données lors des conversions n8n, créer les documents requis automatiquement, et aligner la visibilité des entités dans les listes UI

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Phase 1 : Transmission modeFinancement prospect→candidat](#phase-1--transmission-modefinancement-prospectrightarrowcandidat)
3. [Phase 2 : Transmission tarifFormation](#phase-2--transmission-tarifformation)
4. [Phase 3 : Documents requis lors de la conversion en élève](#phase-3--documents-requis-lors-de-la-conversion-en-élève)
5. [Phase 4 : Candidat visible dans les deux sections après conversion](#phase-4--candidat-visible-dans-les-deux-sections-après-conversion)
6. [Phase 5 : Formation "Non définie" dans la liste élèves](#phase-5--formation-non-définie-dans-la-liste-élèves)
7. [Phase 6 : Calcul reste à charge null](#phase-6--calcul-reste-à-charge-null)
8. [Fichiers Modifiés](#fichiers-modifiés)
9. [Commits et Push](#commits-et-push)

---

## Vue d'ensemble

Cette session a permis de corriger 6 problèmes liés au pipeline de conversion prospect → candidat → élève géré par n8n :

1. ✅ `modeFinancement` non transmis à n8n lors de la conversion prospect→candidat
2. ✅ `tarifFormation` non transmis à n8n lors de la conversion prospect→candidat
3. ✅ Documents requis non créés lors de la conversion candidat→élève (`eleve_created`)
4. ✅ Candidat converti en élève restait visible dans la liste Candidats
5. ✅ Formation affichée "Non définie" dans la liste Élèves (fallback `formationSuivie`)
6. ✅ Reste à charge affiché `0€` quand `resteACharge` est `null` en base

---

## Phase 1 : Transmission modeFinancement prospect→candidat

### Problème
Lors de la conversion d'un prospect en candidat via `ConvertirCandidatModal`, le champ `modeFinancement` n'était pas transmis dans le payload envoyé à n8n. Le nœud n8n "Insert Candidat" recevait `null` pour ce champ.

### Cause
Le composant `ConvertirCandidatModal` ne recevait pas `modeFinancement` en props depuis `ProspectDetailPanel`.

### Correction

**Fichier** : `src/components/admin/ConvertirCandidatModal.tsx`

Ajout de `modeFinancement` dans l'interface props et dans le payload `metadonnees` :
```typescript
// Interface props
interface ConvertirCandidatModalProps {
  prospect: {
    idProspect: string
    nom: string
    prenom: string
    email: string
    formationPrincipale?: string
    modeFinancement?: string  // ← ajouté
  }
  // ...
}

// Payload envoyé à n8n
metadonnees: {
  formationRetenue: formData.formationRetenue,
  sessionVisee: formData.sessionVisee || null,
  dateDebutSouhaitee: formData.dateDebutSouhaitee || null,
  modeFinancement: prospect.modeFinancement || null,  // ← ajouté
  tarifFormation: formations.find(f => f.codeFormation === formData.formationRetenue)?.tarifStandard || null
}
```

**Fichier** : `src/components/admin/ProspectDetailPanel.tsx`

Passage de `modeFinancement` au modal :
```typescript
<ConvertirCandidatModal
  prospect={{
    idProspect: prospect.id,
    nom: prospect.nom,
    prenom: prospect.prenom,
    email: prospect.email,
    formationPrincipale: prospect.formationSouhaitee,
    modeFinancement: prospect.financement  // ← ajouté
  }}
/>
```

---

## Phase 2 : Transmission tarifFormation

### Problème
Le tarif de la formation sélectionnée n'était jamais transmis à n8n, empêchant la création correcte du devis et du dossier financier.

### Correction

**Fichier** : `src/components/admin/ConvertirCandidatModal.tsx`

Le tarif est récupéré depuis le state `formations` (déjà chargé dans le modal) :
```typescript
tarifFormation: formations.find(f => f.codeFormation === formData.formationRetenue)?.tarifStandard || null
```

---

## Phase 3 : Documents requis lors de la conversion en élève

### Problème
Les documents requis (placeholders `ATTENDU`) étaient créés lors de la conversion prospect→candidat (`candidat_created`) mais **pas** lors de la conversion candidat→élève (`eleve_created`).

### Cause
Dans `src/app/api/webhook/callback/route.ts`, la condition ne testait que `candidat_created` :
```typescript
// Avant
if (body.status === 'success' && body.response === 'candidat_created') {
```

### Correction

**Fichier** : `src/app/api/webhook/callback/route.ts`

Extension de la condition pour inclure `eleve_created` :
```typescript
// Après
if (body.status === 'success' && (body.response === 'candidat_created' || body.response === 'eleve_created')) {
  const numeroDossier = body.data?.numeroDossier as string | undefined
  if (numeroDossier) {
    creerDocumentsRequis(numeroDossier, body.correlationId!).catch(err =>
      console.error('[webhook/callback] Erreur création documents requis:', err)
    )
  } else {
    console.warn(`[webhook/callback] ${body.response} reçu sans data.numeroDossier`)
  }
}
```

---

## Phase 4 : Candidat visible dans les deux sections après conversion

### Problème
Après conversion d'un candidat en élève par n8n, la ligne restait visible dans la section **Candidats** ET dans la section **Élèves** simultanément.

### Investigation
- N8n met `statut_dossier = 'CONVERTI'` (ancien workflow) ou `'INSCRIT'` (après correction n8n)
- Le service `getCandidats()` n'avait **aucun filtre par défaut** sur `statutDossier`
- Résultat : tous les candidats remontaient, y compris les convertis

### Correction

**Fichier** : `src/services/candidat.service.ts`

Ajout d'un filtre par défaut excluant `INSCRIT` et `CONVERTI`, exactement comme les prospects excluent `CANDIDAT` et `ELEVE` :

```typescript
if (statutDossier && statutDossier !== 'TOUS') {
  where.statutDossier = statutDossier
} else {
  // Par défaut, masquer les candidats déjà convertis en élèves
  where.statutDossier = {
    notIn: ['INSCRIT', 'CONVERTI']
  }
}
```

**Comportement** :
- Liste Candidats → masque automatiquement les convertis
- Filtre statut dossier → sélectionner `INSCRIT` ou `CONVERTI` pour les voir
- Section Élèves → reste l'endroit unique pour les élèves actifs

---

## Phase 5 : Formation "Non définie" dans la liste Élèves

### Problème
La colonne Formation affichait "Non définie" pour tous les élèves créés par n8n.

### Cause
Le service `EleveService` cherchait la formation via la jointure `inscriptions_sessions → session → formation` :
```typescript
const sessionActive = eleve.inscriptionsSessions?.[0]?.session
const formation = sessionActive?.formation
// formation?.nom → undefined → "Non définie"
```

Mais **n8n ne crée pas d'entrée dans `inscriptions_sessions`**. N8n écrit directement `formation_suivie` dans la table `eleves`.

### Correction

**Fichier** : `src/services/eleve.service.ts`

Ajout d'un fallback sur `eleve.formationSuivie` dans les deux méthodes (`getEleves` et `getEleveDetail`) :

```typescript
const sessionActive = eleve.inscriptionsSessions?.[0]?.session
const formation = sessionActive?.formation
// Fallback sur formationSuivie si pas d'inscription_session (cas n8n)
const formationNom = formation?.nom || eleve.formationSuivie || 'Non définie'
const formationCode = formation?.codeFormation || eleve.formationSuivie || ''
```

Et utilisation de `formationNom` / `formationCode` partout à la place de `formation?.nom` / `formation?.codeFormation`.

---

## Phase 6 : Calcul reste à charge null

### Problème
Le reste à charge s'affichait `0€` quand `resteACharge` est `null` en base (candidat nouvellement créé, pas encore de paiement enregistré). L'opérateur `|| 0` transformait `null` en `0`, faisant croire que tout était payé.

### Correction 1

**Fichier** : `src/app/api/candidats/[id]/route.ts` (ligne 118)

```typescript
// Avant
reste_a_charge: Number(candidat.resteACharge || 0),

// Après
reste_a_charge: Number(candidat.resteACharge ?? (Number(candidat.montantTotalFormation || 0) - Number(candidat.montantPriseEnCharge || 0))),
```

### Correction 2

**Fichier** : `src/services/eleve.service.ts` (méthode `calculateFinancement`)

```typescript
// Avant
const resteACharge = Number(candidat.resteACharge || 0)

// Après
const resteACharge = candidat.resteACharge != null ? Number(candidat.resteACharge) : montantTotal - montantPEC
```

**Logique** :
- `resteACharge` est `null` → on calcule : montant total - prise en charge
- `resteACharge` est `0` (explicitement) → tout est payé, on garde `0`
- `resteACharge` a une valeur → on l'utilise telle quelle

---

## Fichiers Modifiés

| Fichier | Modification |
|---------|-------------|
| `src/components/admin/ConvertirCandidatModal.tsx` | Ajout `modeFinancement` et `tarifFormation` dans payload n8n |
| `src/components/admin/ProspectDetailPanel.tsx` | Passage `modeFinancement` au modal de conversion |
| `src/app/api/webhook/callback/route.ts` | Gestion `eleve_created` pour création documents requis |
| `src/services/candidat.service.ts` | Filtre par défaut `notIn: ['INSCRIT', 'CONVERTI']` |
| `src/services/eleve.service.ts` | Fallback `formationSuivie` + calcul `resteACharge` null |
| `src/app/api/candidats/[id]/route.ts` | Calcul `resteACharge` null avec opérateur `??` |

---

## Commits et Push

```
930891d fix: transmission modeFinancement prospect → n8n lors de la conversion en candidat
801d0ec fix: création documents requis dans webhook/callback lors de candidat_created
738bc59 feat: ajout champ date de naissance obligatoire dans formulaire création prospect
1ab1890 fix: lecture payload n8n — correlationId + data.numeroDossier + status
01d1322 feat: création automatique documents requis lors de la conversion prospect → candidat
5435527 fix: masquer candidats INSCRIT/CONVERTI de la liste candidats par défaut
37ae47c fix: calcul reste à charge quand resteACharge est null (montant total - PEC)
8bea0e9 fix: fallback formationSuivie pour élèves créés par n8n sans inscription_session
```

---

## Points Clés à Retenir

### 1. Cycle de vie n8n vs CRM

N8n est le seul acteur qui écrit dans les tables `candidats` et `eleves`. Le CRM ne fait que lire.
Conséquences :
- N8n n'utilise pas toujours les mêmes valeurs de statut que le CRM (ex: `CONVERTI` vs `INSCRIT`)
- N8n ne crée pas les jointures de la table `inscriptions_sessions`
- Les fallbacks côté CRM sont nécessaires pour s'adapter

### 2. Opérateurs null en TypeScript

| Cas | Opérateur à utiliser |
|-----|---------------------|
| `null` et `undefined` → valeur par défaut | `??` (nullish coalescing) |
| `null`, `undefined`, `0`, `''` → valeur par défaut | `\|\|` |
| Tester explicitement si null | `!= null` |

`resteACharge || 0` était incorrect car il transformait `0` (tout payé) en `0` mais aussi `null` (inconnu) en `0`.
`resteACharge ?? calcul` est correct : `null` → calcul, `0` → `0`.

### 3. Pattern Filtre par Défaut

Le même pattern est appliqué à Prospects et Candidats :
```typescript
// Prospects : masquer les actifs (en admission ou en formation)
where.statutProspect = { notIn: ['CANDIDAT', 'ELEVE'] }

// Candidats : masquer les convertis en élèves
where.statutDossier = { notIn: ['INSCRIT', 'CONVERTI'] }
```

### 4. Capacités n8n

Claude Code est capable de :
- Analyser et corriger des nœuds n8n existants
- Générer des flows complets en JSON importable
- Écrire le code des nœuds Function/Code (JavaScript)
- Écrire les requêtes SQL des nœuds Postgres
- Concevoir la logique d'un flow complet

---

**Dernière mise à jour** : 25 février 2026
**Version** : 1.0
**Auteur** : Claude Code

---

---

# Session 11 : Connexion BDD — Pages Planning + Sessions

**Date** : 25 février 2026 (suite)
**Objectif** : Connecter les pages Planning (salles, formateurs) et Sessions à la base de données réelle, supprimer tous les mocks restants.

---

## Vue d'ensemble

1. ✅ Planning Salles : API `/api/planning/salles` + connexion page
2. ✅ Planning Formateurs : API `/api/planning/formateurs` + connexion page
3. ✅ Planning Sessions : suppression `MOCK_SESSIONS` + alignement interface avec l'API
4. ✅ Modal Sessions — onglet Élèves : API `/api/sessions/[id]` + chargement réel des inscrits

---

## Phase 1 : API Planning Salles

**Fichier créé** : `src/app/api/planning/salles/route.ts`

- Récupère toutes les salles `ACTIVE` depuis Prisma
- Pour chaque salle, calcule sur 12 mois : sessions, événements, réservations
- Calcule les **jours réellement occupés** via `Set<number>` (évite les doublons si session multi-mois)
- Calcul occupation : `Math.round((joursOccupes / nbJoursDansMois) * 100)`
- Retourne : `{ salles: [{ id, nom, code, capaciteMax, mois: [{ occupation, joursOccupes, nbJoursDansMois, sessions, evenements, reservations }] }] }`

---

## Phase 2 : API Planning Formateurs

**Fichier créé** : `src/app/api/planning/formateurs/route.ts`

- Récupère tous les formateurs `ACTIF`
- Pour chaque formateur et chaque mois : sessions (via `formateurPrincipalId`), disponibilités déclarées
- Calcule `statut` dominant : `'session' | 'disponible' | 'indisponible' | 'libre'`
- Calcule alertes : si <2 formateurs disponibles ou libres → `alerte: true`
- Retourne : `{ formateurs: [...], alertesDisponibilite: [{ moisIndex, count, alerte }] }`

---

## Phase 3 : Connexion Page Planning

**Fichier modifié** : `src/app/admin/planning/page.tsx`

Remplacement des mocks `MOCK_SESSIONS`, `MOCK_DISPONIBILITES`, `MOCK_EVENEMENTS` par :

```typescript
// Fetch au montage + au changement d'année
useEffect(() => {
  fetchSalles()
  fetchFormateurs()
}, [anneeSelectionnee])

const fetchSalles = async () => {
  const res = await fetch(`/api/planning/salles?annee=${anneeSelectionnee}`)
  const data = await res.json()
  if (data.success) setSallesData(data.salles)
}
const fetchFormateurs = async () => {
  const res = await fetch(`/api/planning/formateurs?annee=${anneeSelectionnee}`)
  const data = await res.json()
  if (data.success) {
    setFormateursData(data.formateurs)
    setAlertesDisponibilite(data.alertesDisponibilite)
  }
}
```

Les calculs d'occupation (jours, pourcentages, statuts) sont désormais **pré-calculés côté API** et consommés directement dans la page — plus aucun calcul dans le frontend.

---

## Phase 4 : Connexion Page Sessions

**Fichier modifié** : `src/app/admin/sessions/page.tsx`

- Suppression du tableau `MOCK_SESSIONS` (196 lignes de données hardcodées)
- La page utilisait déjà `fetch('/api/sessions')` via `useEffect`, mais avec des noms de champs incohérents

**Corrections d'interface** :

| Ancien (camelCase mock) | Nouveau (snake_case API) |
|-------------------------|--------------------------|
| `session.capaciteMax` | `session.capacite_max` |
| `session.nbInscrits` | `session.places_prises` |
| `session.listeAttente` | `session.liste_attente` |

- Ajout helper `formatDate(isoDate: string)` pour convertir `YYYY-MM-DD` → `DD/MM/YYYY`
- Correction filtre : `session.statut` (statutValidation) → `session.statut_session` (PREVUE/EN_COURS/TERMINEE)
- Ajout spinner de chargement

---

## Phase 5 : Modal Sessions — Onglet Élèves

**Fichier créé** : `src/app/api/sessions/[id]/route.ts`

Endpoint `GET /api/sessions/[id]` :
- Requête `prisma.inscriptionSession.findMany` avec chaîne complète : `Eleve → Candidat → Prospect`
- Calcule la **moyenne** depuis `evaluations.note` de l'élève
- Compte les **absences** (`ABSENT` + `ABSENT_JUSTIFIE`) filtrées par `idSession`
- Gère deux cas :
  - `inscription.eleve` présent → élève formé (type `'eleve'`)
  - `inscription.candidat` présent → en liste d'attente (type `'candidat'`)
- Exclut les inscriptions `ANNULE`

**Fichier modifié** : `src/app/admin/sessions/page.tsx`

- Ajout état `loadingEleves`
- Nouvelle fonction `loadElevesSession(session)` : fetch `/api/sessions/{id}` → met à jour `selectedSession.eleves`
- Le click sur une session appelle `loadElevesSession` au lieu de `setSelectedSession` direct
- Spinner dans l'onglet Élèves pendant le chargement
- Affichage enrichi : numéro de dossier, badge "Liste d'attente #position", moyenne conditionnelle

---

## Fichiers Créés / Modifiés

| Fichier | Action |
|---------|--------|
| `src/app/api/planning/salles/route.ts` | Créé — occupation réelle par mois |
| `src/app/api/planning/formateurs/route.ts` | Créé — disponibilités et alertes par mois |
| `src/app/api/sessions/[id]/route.ts` | Créé — détail session avec élèves inscrits |
| `src/app/admin/planning/page.tsx` | Modifié — suppression mocks, fetch APIs |
| `src/app/admin/sessions/page.tsx` | Modifié — suppression MOCK_SESSIONS, fix interfaces, onglet Élèves |

---

## Commits

```
feat: page sessions connectée à la BDD (suppression MOCK_SESSIONS)
feat: modal sessions — onglet Élèves connecté aux inscriptions réelles de la BDD
```

---

## Points Clés à Retenir

### Calcul d'occupation avec Set
Pour éviter les doublons quand une session couvre plusieurs semaines dans un mois :
```typescript
const joursOccupes = new Set<number>()
sessionsCeMois.forEach(session => {
  const current = new Date(dateDebutEffective)
  while (current <= dateFinEffective) {
    joursOccupes.add(current.getDate())
    current.setDate(current.getDate() + 1)
  }
})
const occupation = Math.round((joursOccupes.size / nbJoursDansMois) * 100)
```

### Chaîne de relations pour les élèves
```typescript
// InscriptionSession → Eleve → Candidat → Prospect
prisma.inscriptionSession.findMany({
  include: {
    eleve: {
      include: {
        candidat: { include: { prospect: true } },
        evaluations: true,
        presences: { where: { idSession } }
      }
    }
  }
})
```

### Pattern load-on-open
Au lieu de charger toutes les données en amont, charger les détails (élèves) uniquement quand le modal s'ouvre — évite les requêtes N+1 sur la liste.

---

**Dernière mise à jour** : 25 février 2026
**Version** : 1.1
**Auteur** : Claude Code
