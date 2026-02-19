# Résumé Ultra-Synthétique : Payload Enrichi CRM → n8n

## 🎯 Ce Qui A Été Fait

J'ai **enrichi le payload** envoyé du CRM vers n8n pour qu'il contienne **tout le contexte nécessaire au dispatch intelligent**.

---

## 📊 Avant vs Après

### ❌ AVANT (Problème)

```json
{
  "typeAction": "RELANCER",
  "resultat": "relance_email"
}
```

**Problèmes** :
- n8n ne sait pas d'où vient l'action
- n8n ne sait pas sur quelle entité (prospect, candidat, élève)
- n8n doit faire une requête au CRM pour récupérer les données
- Impossible de dispatcher intelligemment vers le bon agent

### ✅ APRÈS (Solution)

```json
{
  // D'où vient l'action
  "actionType": "RELANCE_CANDIDAT_EMAIL",
  "actionSource": "admin.candidats.detail",
  "actionButton": "relancer_email",

  // Sur quelle entité
  "entiteType": "candidat",
  "entiteId": "DUMI15091992",

  // Données complètes (pas de requête nécessaire)
  "entiteData": {
    "nom": "Dumitru",
    "prenom": "Marie",
    "email": "marie.dumitru@example.com",
    "statutDossier": "DOSSIER_COMPLET"
  },

  // Métadonnées contextuelles
  "metadonnees": {
    "documentsManquants": ["CNI_VERSO"],
    "delaiDepuisDernierContact": 15
  }
}
```

**Avantages** :
- ✅ n8n sait exactement d'où vient l'action
- ✅ n8n a TOUTES les données pour traiter
- ✅ Dispatch intelligent vers le bon agent
- ✅ Pas de requête supplémentaire au CRM

---

## 🔀 Comment n8n Dispatch

### Switch Node Simple

```javascript
// Dans n8n Switch Node
if (actionType.startsWith('RELANCE_CANDIDAT_')) {
  return 'marjorie-candidat-relance'
}
else if (actionType.startsWith('GENERER_DEVIS')) {
  return 'marjorie-devis-generation'
}
else if (actionType.startsWith('RELANCE_PROSPECT_')) {
  return 'marjorie-prospect-relance'
}
// etc...
```

### Flow Complet

```
CRM UI
  ↓ Click bouton "Relancer Email"
POST /api/notifications/42/action
  {
    "actionType": "RELANCE_CANDIDAT_EMAIL",
    "entiteData": { nom, prenom, email, ... }
  }
  ↓
CRM Backend
  ↓ Appelle webhook n8n
POST http://n8n.com/webhook/crm-action
  (même payload + infos notification)
  ↓
n8n Dispatcher
  ↓ Switch sur actionType
  ↓ Route vers agent adapté
Workflow: marjorie-candidat-relance
  ↓ AI génère email
  ↓ SMTP envoie email
  ↓ Notifie CRM
POST http://crm.com/api/notifications/ingest
  {
    "type": "RELANCE_ENVOYEE",
    "titre": "Relance envoyée à Marie Dumitru"
  }
  ↓
CRM UI
  ✅ Badge cloche +1
  ✅ Notification "Relance envoyée"
```

---

## 📝 Nomenclature Actions

### Format : `VERBE_ENTITE_METHODE`

**Exemples** :
- `RELANCE_CANDIDAT_EMAIL` → Relancer un candidat par email
- `RELANCE_PROSPECT_TELEPHONE` → Relancer un prospect par téléphone
- `GENERER_DEVIS` → Générer un devis
- `VALIDER_DOCUMENT` → Valider un document
- `PLANIFIER_ENTRETIEN` → Planifier un entretien

**Préfixes** :
- `RELANCE_*` → Workflows de relance (email/tel/SMS)
- `GENERER_*` → Workflows de génération de documents
- `VALIDER_*` / `REFUSER_*` → Workflows de validation
- `PLANIFIER_*` → Workflows de planning

---

## 🔧 Fichiers Modifiés

### 1 seul fichier modifié :

**`src/app/api/notifications/[id]/action/route.ts`**

Modifications :
1. Interface `ActionPayload` enrichie (4 → 13 champs)
2. Validation du nouveau format (7 champs obligatoires)
3. Stockage résultat enrichi (5 → 15 champs)
4. Fonction `callN8nWebhook()` enrichie (8 → 24 champs)
5. Logs de debug détaillés

### 3 fichiers créés :

1. **`docs/payload-action-enrichi.md`** (180 lignes)
   - Documentation complète
   - Catalogue des actions
   - Exemples d'utilisation

2. **`docs/modifications-payload-action.md`** (450 lignes)
   - Explications avant/après
   - Checklist implémentation

3. **`docs/n8n-dispatcher-guide.md`** (450 lignes)
   - Guide configuration n8n
   - Exemple workflow complet
   - Tests

---

## ✅ Ce Qui Fonctionne Maintenant

### Backend CRM

- ✅ Endpoint accepte nouveau format
- ✅ Validation complète des champs
- ✅ Compatibilité avec ancien format (legacy)
- ✅ Webhook n8n enrichi
- ✅ Logs détaillés

### À Faire

- [ ] Modifier boutons UI pour envoyer nouveau format
- [ ] Créer webhook n8n `/webhook/crm-action`
- [ ] Créer dispatcher n8n avec Switch Node
- [ ] Créer workflows agents (marjorie-candidat-relance, etc.)

---

## 🧪 Test Rapide

### 1. Test Backend Seul (Postman)

```bash
POST http://localhost:3000/api/notifications/42/action

Body:
{
  "actionType": "RELANCE_CANDIDAT_EMAIL",
  "actionSource": "admin.candidats.detail",
  "actionButton": "relancer_email",
  "entiteType": "candidat",
  "entiteId": "DUMI15091992",
  "entiteData": {
    "nom": "Dumitru",
    "prenom": "Marie",
    "email": "marie.dumitru@example.com"
  },
  "decidePar": 1,
  "decisionType": "relance_email"
}
```

**Résultat attendu** :
```
✅ 200 OK
✅ Log console: "[n8n] Envoi webhook avec payload enrichi"
✅ BDD: notification.actionEffectuee = true
```

### 2. Test Ancien Format (compatibilité)

```bash
Body:
{
  "typeAction": "RELANCER",
  "resultat": "relance_email"
}
```

**Résultat attendu** :
```
✅ 200 OK (compatibilité assurée)
```

---

## 📚 Prochaines Étapes

### Semaine 1 : Test CRM → n8n

1. Modifier 1 bouton UI (relancer email modal candidat)
2. Créer webhook n8n `/webhook/crm-action`
3. Créer dispatcher n8n
4. Créer workflow test `marjorie-candidat-relance`
5. Tester flow complet

### Semaine 2 : Agents Principaux

1. `marjorie-devis-generation`
2. `marjorie-document-validation`
3. `marjorie-prospect-relance`

### Semaine 3 : Agents Avancés

1. `marjorie-planning-entretien`
2. `marjorie-eleve-attestation`
3. `marjorie-formateur-disponibilite`

---

## 💡 Réponse à Ta Question

> "quand crm communique vers n8n est ce que dans le payload envoyer je sais de qu'el section de l'ui voir quelle bouton ca a ete declenche pour filtrer dans n8n et dispatche au bon agent"

**OUI, maintenant tu sais EXACTEMENT** :

1. **Section UI** → `actionSource: "admin.candidats.detail"`
2. **Bouton cliqué** → `actionButton: "relancer_email"`
3. **Type action** → `actionType: "RELANCE_CANDIDAT_EMAIL"`
4. **Entité métier** → `entiteType: "candidat"` + `entiteId: "DUMI15091992"`
5. **Données complètes** → `entiteData: { nom, prenom, email, ... }`

**Dispatch n8n simple** :
```javascript
if (actionType === "RELANCE_CANDIDAT_EMAIL") {
  route to: marjorie-candidat-relance
}
```

---

**Version** : 1.0
**Dernière mise à jour** : 19 février 2026
**Auteur** : Claude Code
