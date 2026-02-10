# Gestion du Cycle de Vie des Prospects

## Vue d'ensemble

La table `prospects` est la **mémoire permanente** de tous les contacts ABJ. Elle n'est jamais vidée et trace l'ensemble du parcours d'une personne, même après plusieurs candidatures ou formations.

## Cycle de Vie Complet

```
┌─────────────┐
│   NOUVEAU   │ ← Premier contact (formulaire, email, téléphone)
└──────┬──────┘
       │
       ↓ Remplit formulaire de candidature
┌──────────────────┐
│ EN_ATTENTE_      │ ← Formulaire dossier envoyé, en attente de réception
│ DOSSIER          │
└──────┬───────────┘
       │
       ↓ Dossier reçu complet → devient CANDIDAT
┌──────────────┐
│  CANDIDAT    │ ← Admission en cours (statut actif, MASQUÉ page Prospects)
└──────┬───────┘   Table candidats créée avec relation idProspect
       │
       ├─→ Refusé ou abandon ──→ ANCIEN_CANDIDAT (redevient visible Prospects)
       │
       └─→ Accepté + Inscrit
           ↓
┌──────────────┐
│    ELEVE     │ ← Formation en cours (statut actif, MASQUÉ page Prospects)
└──────┬───────┘   Table eleves créée avec relation idCandidat
       │
       ↓ Formation terminée ou abandon
┌──────────────┐
│ ANCIEN_ELEVE │ ← Redevient prospect disponible (visible Prospects)
└──────────────┘   Peut recandidater plus tard
```

## Statuts `statutProspect`

| Statut | Signification | Visible Prospects | Relation BDD |
|--------|---------------|-------------------|--------------|
| `NOUVEAU` | Premier contact, jamais candidaté | ✅ OUI | Prospect seul |
| `EN_ATTENTE_DOSSIER` | Formulaire envoyé, pas encore reçu | ✅ OUI | Prospect seul |
| `CANDIDAT` | Admission en cours | ❌ NON (actif) | Prospect → Candidat(s) |
| `ANCIEN_CANDIDAT` | Refusé ou abandonné | ✅ OUI | Prospect → Candidat REFUSE |
| `ELEVE` | Formation en cours | ❌ NON (actif) | Prospect → Candidat → Eleve |
| `ANCIEN_ELEVE` | Formation terminée | ✅ OUI | Prospect → Candidat → Eleve TERMINE |

## Logique de Filtrage

### Page Prospects (par défaut)

**Affichage** : Prospects **DISPONIBLES** uniquement
```typescript
where: {
  statutProspect: {
    notIn: ['CANDIDAT', 'ELEVE']
  }
}
```

**Résultat** :
- ✅ NOUVEAU
- ✅ EN_ATTENTE_DOSSIER
- ✅ ANCIEN_CANDIDAT
- ✅ ANCIEN_ELEVE

**Masqués** :
- ❌ CANDIDAT (admission en cours)
- ❌ ELEVE (formation en cours)

### Pourquoi ce filtrage ?

**Objectif** : Préparer les futures campagnes marketing

Lorsque l'utilisateur envoie une campagne email/SMS depuis la page Prospects, il cible uniquement les personnes **disponibles**, pas celles déjà engagées dans un processus (admission ou formation).

**Exemple** :
- Prospect avec statut `ELEVE` (en CAP Bijou jusqu'à juin) → **ne reçoit PAS** de relance marketing
- Prospect avec statut `ANCIEN_ELEVE` (formation terminée) → **reçoit** les offres pour nouvelles formations

## Mise à Jour Automatique des Statuts

Le script `update-statuts-lifecycle.ts` synchronise les statuts selon les relations BDD :

```typescript
// Règles de mise à jour automatique
if (prospect.candidats.some(c => c.statutDossier IN ['RECU', 'EN_COURS', ...])) {
  statutProspect = 'CANDIDAT'
}

if (prospect.candidats.some(c => c.statutDossier === 'REFUSE' && PAS d'autre candidat actif)) {
  statutProspect = 'ANCIEN_CANDIDAT'
}

if (prospect.candidats.some(c => c.eleve.statutFormation === 'EN_COURS')) {
  statutProspect = 'ELEVE'
}

if (prospect.candidats.some(c => c.eleve.statutFormation IN ['TERMINE', 'ABANDONNE'])) {
  statutProspect = 'ANCIEN_ELEVE'
}
```

## Relations BDD

```
prospects (permanent)
    ↓ 1:N
candidats (temporaire - dossier candidature)
    ↓ 1:1
eleves (temporaire - inscription formation)
```

**Clé** : `idProspect` est la clé primaire permanente, conservée tout au long du parcours.

## Implémentation Technique

### Service ProspectService

**Fichier** : `src/services/prospect.service.ts`

```typescript
async getProspects(params?: { ... }) {
  const where: any = {}

  if (statut && statut !== 'TOUS') {
    where.statutProspect = statut
  } else {
    // Filtrage par défaut : masquer actifs
    where.statutProspect = {
      notIn: ['CANDIDAT', 'ELEVE']
    }
  }

  // ... reste du code
}
```

### Composant ProspectsFilters

**Fichier** : `src/components/admin/ProspectsFilters.tsx`

Options du filtre statut :
```typescript
<option value="">Disponibles (hors actifs)</option> {/* Défaut */}
<option value="NOUVEAU">Nouveau</option>
<option value="EN_ATTENTE_DOSSIER">En attente dossier</option>
<option value="ANCIEN_CANDIDAT">Ancien candidat</option>
<option value="ANCIEN_ELEVE">Ancien élève</option>
<option value="CANDIDAT">Candidat (actif)</option> {/* Si besoin explicite */}
<option value="ELEVE">Élève (en formation)</option> {/* Si besoin explicite */}
<option value="TOUS">Tous les statuts</option> {/* Désactive le filtre */}
```

### Couleurs des Badges

**Fichier** : `src/components/admin/ProspectsPageClient.tsx`

```typescript
const STATUT_COLORS: Record<string, string> = {
  NOUVEAU: 'badge-info',           // Bleu
  EN_ATTENTE_DOSSIER: 'badge-warning', // Jaune
  CANDIDAT: 'badge-warning',       // Jaune (actif)
  ANCIEN_CANDIDAT: 'badge-error',  // Rouge (refusé)
  ELEVE: 'badge-success',          // Vert (actif)
  ANCIEN_ELEVE: 'badge-info',      // Bleu (disponible)
}
```

## Scripts de Maintenance

### `update-statuts-lifecycle.ts`

**Usage** :
```bash
npx tsx update-statuts-lifecycle.ts
```

**Actions** :
1. Détecte prospects avec candidats actifs → `CANDIDAT`
2. Détecte prospects avec candidats refusés uniquement → `ANCIEN_CANDIDAT`
3. Détecte prospects avec élèves EN_COURS → `ELEVE`
4. Détecte prospects avec élèves TERMINE/ABANDONNE → `ANCIEN_ELEVE`

**Quand l'exécuter** :
- Après migration de données
- Si incohérence détectée entre relations BDD et statutProspect
- Normalement géré automatiquement par agents n8n Marjorie

### `test-prospect-filtrage.ts`

**Usage** :
```bash
npx tsx test-prospect-filtrage.ts
```

**Vérifie** :
- Comptage total prospects
- Répartition par statut
- Nombre de prospects disponibles (affichés page Prospects)
- Nombre de prospects masqués (actifs)
- Ratio affichage

## État Actuel (Base Test)

```
📊 TOTAL PROSPECTS: 15

📋 RÉPARTITION:
  ELEVE                : 10 (66%)
  EN_ATTENTE_DOSSIER   : 1 (7%)
  NOUVEAU              : 4 (27%)

✅ AFFICHÉS PAGE PROSPECTS: 5 (33%)
❌ MASQUÉS (actifs):        10 (67%)
```

## Futur : Intégration Marketing

**Phase à venir** :
1. Export liste prospects disponibles vers outil marketing (Brevo, Mailchimp, etc.)
2. Synchronisation automatique des statuts via webhook
3. Exclusion automatique des prospects actifs (CANDIDAT, ELEVE)
4. Historique des campagnes envoyées (table à créer)

**Garantie** : Aucun élève actuellement en formation ne recevra de relance marketing intempestive.

---

**Version** : 1.0
**Dernière mise à jour** : 2026-02-10
**Auteur** : Claude Code
