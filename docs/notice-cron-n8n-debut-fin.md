# Notice — Workflow n8n : Cron Transitions Statuts Sessions

## Objectif

Ce workflow n8n appelle automatiquement l'endpoint `/api/cron/sessions-statuts` du CRM pour mettre à jour les statuts des sessions selon leurs dates réelles :

- Session dont `date_debut <= aujourd'hui <= date_fin` → passe `EN_COURS`
- Session dont `date_fin < aujourd'hui` → passe `TERMINEE`
- Sessions `ANNULEE` et déjà `TERMINEE` → jamais touchées
- Fonctionne pour formations courtes ET longues (CAP)

---

## Prérequis côté CRM

### Variable d'environnement à ajouter

Dans le fichier `.env.local` (local) et dans la configuration Docker du VPS :

```
CRON_API_KEY=une-clé-secrète-longue-et-aléatoire
```

Exemple de valeur sûre : `abj-cron-2026-xK9mP3wQnR7vL2jT`

> ⚠️ Cette clé doit être la même dans le `.env.local`/`.env` du CRM et dans le workflow n8n.

### Endpoint disponible

```
POST https://[domaine-crm]/api/cron/sessions-statuts
Header requis : x-api-key: [valeur CRON_API_KEY]
```

Réponse en cas de succès (HTTP 200) :
```json
{
  "success": true,
  "message": "Cron sessions-statuts : 5 sessions traitées, 2 → EN_COURS, 1 → TERMINEE, 2 inchangées",
  "resultats": {
    "traites": 5,
    "enCours": 2,
    "terminees": 1,
    "inchanges": 2,
    "erreurs": []
  },
  "executeLe": "2026-03-15T00:00:00.000Z"
}
```

Réponse en cas de clé invalide (HTTP 401) :
```json
{ "success": false, "error": "Non autorisé" }
```

---

## Instructions pour créer le workflow n8n

### Nom du workflow

`ABJ — Cron Transitions Statuts Sessions`

### Fréquence recommandée

**Toutes les nuits à 00h05** (heure de Paris / Europe) — assure que les transitions du jour sont faites en début de journée.

Si tu veux plus de réactivité : toutes les heures suffit.

---

## Nodes à créer (dans l'ordre)

---

### Node 1 — Schedule Trigger

**Type** : `Schedule Trigger`

**Configuration** :
- Mode : `Cron Expression`
- Expression cron : `5 0 * * *`
  - Signification : chaque jour à 00h05
  - Alternative toutes les heures : `5 * * * *`
- Timezone : `Europe/Paris`

**Nom du node** : `Déclencheur quotidien`

---

### Node 2 — HTTP Request

**Type** : `HTTP Request`

**Configuration** :

| Champ | Valeur |
|-------|--------|
| Method | `POST` |
| URL | `https://[ton-domaine]/api/cron/sessions-statuts` |
| Authentication | None (on gère la clé manuellement dans les headers) |
| Send Headers | Activé |

**Headers à ajouter** (cliquer "Add Header" deux fois) :

| Name | Value |
|------|-------|
| `x-api-key` | `[valeur exacte de CRON_API_KEY dans .env]` |
| `Content-Type` | `application/json` |

**Options avancées** :
- Timeout : `30000` (30 secondes)
- Ignore SSL Issues : selon ton certificat (laisser désactivé si certificat valide)
- Response Format : `JSON`

**Nom du node** : `Appel CRM — Mise à jour statuts sessions`

---

### Node 3 — IF (vérification succès)

**Type** : `IF`

**Condition** :
- Valeur 1 : `{{ $json.success }}`
- Opérateur : `Equal`
- Valeur 2 : `true`

**Nom du node** : `Succès ?`

---

### Node 4A — Code (branche TRUE — log succès)

**Type** : `Code`

**Branche** : Output `true` du node IF

**Code JavaScript** :
```javascript
const res = $input.first().json
console.log('[ABJ Cron] ✅ Statuts mis à jour :', res.message)
console.log('[ABJ Cron] Détail :', JSON.stringify(res.resultats, null, 2))
return [{ json: { statut: 'OK', message: res.message } }]
```

**Nom du node** : `Log succès`

---

### Node 4B — Code (branche FALSE — log erreur)

**Type** : `Code`

**Branche** : Output `false` du node IF

**Code JavaScript** :
```javascript
const res = $input.first().json
console.error('[ABJ Cron] ❌ Erreur endpoint CRM :', JSON.stringify(res))
return [{ json: { statut: 'ERREUR', details: res } }]
```

**Nom du node** : `Log erreur`

---

### Node 5B — Insert Journal Erreurs (optionnel, branche erreur)

**Type** : `Postgres` (ou `Execute Query` selon ta version n8n)

**Branche** : Après `Log erreur`

**SQL** :
```sql
INSERT INTO journal_erreurs (nom_workflow, nom_noeud, message_erreur, donnees_entree)
VALUES (
  'ABJ — Cron Transitions Statuts Sessions',
  'Appel CRM — Mise à jour statuts sessions',
  'Endpoint a retourné success=false',
  '{{ JSON.stringify($node["Appel CRM — Mise à jour statuts sessions"].json) }}'::jsonb
)
```

**Credentials** : Utiliser les credentials Postgres déjà configurés dans n8n (même BDD que le CRM)

**Nom du node** : `Log erreur en BDD`

---

## Schéma du workflow

```
[Déclencheur quotidien]
         ↓
[Appel CRM — Mise à jour statuts sessions]
  POST /api/cron/sessions-statuts
  Header: x-api-key: ***
         ↓
    [Succès ?]
    ↙        ↘
[Log succès]  [Log erreur]
                   ↓
          [Log erreur en BDD]
```

---

## Test manuel du workflow

Avant d'activer le cron, tu peux tester manuellement :

1. Dans n8n, ouvrir le workflow
2. Cliquer `Execute Workflow` (bouton play)
3. Vérifier dans l'output du node `Appel CRM` que `success: true`
4. Vérifier dans la page Sessions du CRM que les statuts ont bien changé

Tu peux aussi tester directement depuis un terminal (curl) :
```bash
curl -X POST https://[ton-domaine]/api/cron/sessions-statuts \
  -H "x-api-key: [CRON_API_KEY]" \
  -H "Content-Type: application/json"
```

---

## Comportement attendu

### Exemples concrets

| Session | dateDebut | dateFin | Statut avant | Statut après |
|---------|-----------|---------|-------------|-------------|
| CAP Bijou promo mars | 2026-03-01 | 2026-10-31 | INSCRIPTIONS_OUVERTES | EN_COURS |
| Sertissage N1 mars | 2026-03-10 | 2026-03-14 | EN_COURS | TERMINEE |
| CAO/DAO avril | 2026-04-05 | 2026-04-20 | INSCRIPTIONS_OUVERTES | inchangée |
| Sertissage N1 (annulée) | 2026-03-01 | 2026-03-31 | ANNULEE | **inchangée** |

### Règles métier appliquées

- Une session `COMPLETE` dont la date de début est passée passe `EN_COURS` (les élèves sont là, la session a commencé physiquement)
- Les sessions `ANNULEE` ne sont **jamais** modifiées
- Les sessions `TERMINEE` ne sont **jamais** re-modifiées
- Les sessions sans `date_debut` ou `date_fin` sont ignorées silencieusement

---

## Sécurité

- La clé `CRON_API_KEY` ne doit jamais apparaître dans les logs n8n visibles publiquement
- Dans n8n, utiliser une **Credential** de type `HTTP Header Auth` si tu veux éviter de taper la clé en clair dans le node HTTP Request :
  - Name : `x-api-key`
  - Value : `[CRON_API_KEY]`
  - Puis dans le node HTTP Request → Authentication → `Header Auth` → sélectionner cette credential

---

## Variables à remplacer dans ce document

| Placeholder | À remplacer par |
|-------------|----------------|
| `[ton-domaine]` | L'URL de production du CRM (ex: `crm.abj.fr`) |
| `[CRON_API_KEY]` | La valeur définie dans `.env.local` / `.env` du VPS |

---

**Document créé le** : 15 mars 2026
**Auteur** : Claude Code
**Endpoint concerné** : `src/app/api/cron/sessions-statuts/route.ts`
