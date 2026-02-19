# Guide n8n : Recevoir et Dispatcher les Actions CRM

## 🎯 Vue d'ensemble

Ce guide explique comment configurer **n8n pour recevoir et dispatcher** les actions du CRM vers les bons agents IA.

---

## 📥 Étape 1 : Créer le Webhook Principal

### Configuration Webhook Node

**Node Type** : `Webhook`
**Path** : `/webhook/crm-action`
**Method** : `POST`
**Authentication** : `Header Auth`
- Header Name: `X-API-Key`
- Header Value: `{{ $env.N8N_API_KEY }}`

### Payload Reçu

```json
{
  "timestamp": "2026-02-19T10:30:00.000Z",
  "source": "crm-abj",

  "actionType": "RELANCE_CANDIDAT_EMAIL",
  "actionSource": "admin.candidats.detail",
  "actionButton": "relancer_email",

  "entiteType": "candidat",
  "entiteId": "DUMI15091992",
  "entiteData": {
    "nom": "Dumitru",
    "prenom": "Marie",
    "email": "marie.dumitru@example.com",
    "telephone": "0612345678",
    "statutDossier": "DOSSIER_COMPLET"
  },

  "decidePar": 1,
  "decisionType": "relance_email",
  "commentaire": "Relance pour documents manquants",

  "metadonnees": {
    "documentsManquants": ["CNI_VERSO"],
    "delaiDepuisDernierContact": 15,
    "priorite": "HAUTE"
  },

  "notificationId": 42,
  "notificationCategorie": "CANDIDAT",
  "notificationType": "DOSSIER_INCOMPLET",
  "notificationTitre": "Documents manquants pour DUMI15091992"
}
```

---

## 🔀 Étape 2 : Switch Node Dispatcher

### Configuration Switch Node

**Node Type** : `Switch`
**Mode** : `Rules`

### Règles de Routing

```javascript
// Règle 1 : Actions Candidat
{{ $json.actionType }}.startsWith('RELANCE_CANDIDAT_') ||
{{ $json.actionType }}.startsWith('GENERER_DEVIS') ||
{{ $json.actionType }}.startsWith('DEMANDER_DOCUMENTS')
→ Output 0 (marjorie-candidat)

// Règle 2 : Actions Prospect
{{ $json.actionType }}.startsWith('RELANCE_PROSPECT_') ||
{{ $json.actionType }}.startsWith('ENVOYER_DOSSIER_')
→ Output 1 (marjorie-prospect)

// Règle 3 : Génération Documents
{{ $json.actionType }}.startsWith('GENERER_') ||
{{ $json.actionType }}.startsWith('TELECHARGER_')
→ Output 2 (marjorie-documents)

// Règle 4 : Validation
{{ $json.actionType }}.startsWith('VALIDER_') ||
{{ $json.actionType }}.startsWith('REFUSER_')
→ Output 3 (marjorie-validation)

// Règle 5 : Planning
{{ $json.actionType }}.startsWith('PLANIFIER_')
→ Output 4 (marjorie-planning)

// Règle 6 : Fallback (log erreur)
true
→ Output 5 (log-erreur)
```

### Exemple Visuel Switch Node

```
┌─────────────────┐
│ Webhook Input   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Switch Node    │
│  (actionType)   │
└────┬──┬──┬──┬──┬┘
     0  1  2  3  4  5
     │  │  │  │  │  │
     ▼  ▼  ▼  ▼  ▼  ▼
    Cand Pros Docs Val Plan Err
```

---

## 🤖 Étape 3 : Workflows Agents

### Agent 1 : Marjorie Candidat Relance

**Workflow Name** : `marjorie-candidat-relance`
**Trigger** : Execute Workflow (depuis dispatcher)

#### Nodes

1. **Webhook Input** (données reçues du dispatcher)
2. **Function Node** : Construire contexte email
3. **AI Agent Node** : Générer email personnalisé
4. **Markdown to HTML** : Convertir réponse IA
5. **SMTP Node** : Envoyer email
6. **HTTP Request** : Notifier CRM (succès)
7. **Error Handler** : Notifier CRM (échec)

#### Exemple Function Node

```javascript
// Node: Construire Contexte Email
const candidat = $json.entiteData
const metadonnees = $json.metadonnees

return {
  destinataire: candidat.email,
  nom: candidat.nom,
  prenom: candidat.prenom,
  statutDossier: candidat.statutDossier,
  documentsManquants: metadonnees.documentsManquants || [],
  delai: metadonnees.delaiDepuisDernierContact || 0,
  priorite: metadonnees.priorite || 'NORMALE'
}
```

#### Exemple AI Agent Node

```
Prompt:
Tu es Marjorie, assistante de l'Académie de Bijouterie Joaillerie (ABJ).

Contexte:
- Candidat: {{ $json.prenom }} {{ $json.nom }}
- Statut dossier: {{ $json.statutDossier }}
- Documents manquants: {{ $json.documentsManquants.join(', ') }}
- Dernier contact: il y a {{ $json.delai }} jours

Tâche:
Rédige un email de relance professionnel et bienveillant pour demander les documents manquants.

Format:
- Objet court (max 60 caractères)
- Corps en markdown
- Ton chaleureux mais professionnel
- Inclure liste des documents manquants
- Proposer aide si besoin

Output attendu (JSON):
{
  "objet": "...",
  "corps": "..."
}
```

#### Exemple SMTP Node

```javascript
// To
{{ $('Webhook Input').item.json.entiteData.email }}

// Subject
{{ $('AI Agent').item.json.objet }}

// Body (HTML)
{{ $('Markdown to HTML').item.json.html }}

// From
contact@abj.fr

// Reply To
contact@abj.fr
```

#### Exemple Notification Succès

```javascript
// HTTP Request Node: Notifier CRM
POST {{ $env.CRM_API_URL }}/api/notifications/ingest

Headers:
  Content-Type: application/json
  X-API-Key: {{ $env.CRM_API_KEY }}

Body:
{
  "sourceAgent": "marjorie",
  "sourceWorkflow": "marjorie-candidat-relance",
  "sourceExecutionId": "{{ $execution.id }}",

  "categorie": "CANDIDAT",
  "type": "RELANCE_ENVOYEE",
  "priorite": "NORMALE",

  "titre": "Relance envoyée à {{ $('Webhook Input').item.json.entiteData.prenom }} {{ $('Webhook Input').item.json.entiteData.nom }}",
  "message": "Email de relance envoyé avec succès pour les documents manquants",

  "audience": "ADMIN",
  "entiteType": "candidat",
  "entiteId": "{{ $('Webhook Input').item.json.entiteId }}",
  "lienAction": "/admin/candidats/{{ $('Webhook Input').item.json.entiteId }}",

  "metadonnees": {
    "emailEnvoye": true,
    "destinataire": "{{ $('Webhook Input').item.json.entiteData.email }}",
    "objet": "{{ $('AI Agent').item.json.objet }}",
    "executionId": "{{ $execution.id }}"
  }
}
```

---

## 📊 Exemple Complet : Flow RELANCE_CANDIDAT_EMAIL

### Workflow Visuel

```
┌────────────────────────┐
│ 1. Webhook Input       │ ← Reçoit payload du dispatcher
│    actionType:         │
│    RELANCE_CANDIDAT_   │
│    EMAIL               │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ 2. Function Node       │ ← Extrait données candidat
│    Construire Contexte │
│    Email               │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ 3. AI Agent Node       │ ← Génère email personnalisé
│    GPT-4o              │
│    Prompt Marjorie     │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ 4. Markdown → HTML     │ ← Convertit format email
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ 5. SMTP Send           │ ← Envoie email
│    contact@abj.fr      │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ 6. HTTP Request        │ ← Notifie CRM (succès)
│    POST /api/          │
│    notifications/      │
│    ingest              │
└────────────────────────┘
```

### Données Passées Entre Nodes

**Node 1 → Node 2** :
```json
{
  "actionType": "RELANCE_CANDIDAT_EMAIL",
  "entiteData": {
    "nom": "Dumitru",
    "prenom": "Marie",
    "email": "marie.dumitru@example.com"
  },
  "metadonnees": {
    "documentsManquants": ["CNI_VERSO"]
  }
}
```

**Node 2 → Node 3** :
```json
{
  "destinataire": "marie.dumitru@example.com",
  "nom": "Dumitru",
  "prenom": "Marie",
  "documentsManquants": ["CNI_VERSO"],
  "delai": 15
}
```

**Node 3 → Node 4** :
```json
{
  "objet": "Documents manquants pour votre dossier CAP Bijouterie",
  "corps": "Bonjour Marie,\n\nNous avons bien reçu..."
}
```

**Node 4 → Node 5** :
```json
{
  "html": "<p>Bonjour Marie,</p>\n<p>Nous avons bien reçu...</p>"
}
```

---

## 🔧 Configuration Variables d'Environnement n8n

### Variables Requises

```bash
# .env n8n
N8N_API_KEY=votre_api_key_n8n
CRM_API_URL=http://localhost:3000
CRM_API_KEY=abj_secret_key_123456

# SMTP (pour envoi emails)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=contact@abj.fr
SMTP_PASSWORD=votre_password

# Google Drive (pour génération docs)
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...

# OpenAI (pour IA)
OPENAI_API_KEY=sk-...
```

---

## 📋 Checklist Configuration n8n

### Workflow Dispatcher

- [ ] Créer workflow `crm-action-dispatcher`
- [ ] Ajouter Webhook Node `/webhook/crm-action`
- [ ] Configurer Header Auth (`X-API-Key`)
- [ ] Ajouter Switch Node avec 6 règles
- [ ] Connecter outputs vers Execute Workflow Nodes
- [ ] Activer workflow

### Agent Marjorie Candidat Relance

- [ ] Créer workflow `marjorie-candidat-relance`
- [ ] Ajouter Function Node (contexte email)
- [ ] Ajouter AI Agent Node (GPT-4o)
- [ ] Ajouter Markdown to HTML Node
- [ ] Ajouter SMTP Node
- [ ] Ajouter HTTP Request Node (notification CRM)
- [ ] Ajouter Error Handler
- [ ] Tester avec payload exemple

### Variables d'Environnement

- [ ] Configurer `N8N_API_KEY`
- [ ] Configurer `CRM_API_URL`
- [ ] Configurer `CRM_API_KEY`
- [ ] Configurer SMTP
- [ ] Configurer OpenAI
- [ ] Tester connexion CRM

---

## 🧪 Test du Flow Complet

### 1. Préparer Payload Test

```json
{
  "timestamp": "2026-02-19T10:30:00.000Z",
  "source": "crm-abj",
  "actionType": "RELANCE_CANDIDAT_EMAIL",
  "actionSource": "admin.candidats.detail",
  "actionButton": "relancer_email",
  "entiteType": "candidat",
  "entiteId": "DUMI15091992",
  "entiteData": {
    "nom": "Dumitru",
    "prenom": "Marie",
    "email": "TON_EMAIL_TEST@example.com",
    "statutDossier": "DOSSIER_COMPLET"
  },
  "decidePar": 1,
  "decisionType": "relance_email",
  "metadonnees": {
    "documentsManquants": ["CNI_VERSO"],
    "delaiDepuisDernierContact": 15
  },
  "notificationId": 42
}
```

### 2. Envoyer Payload au Webhook

```bash
curl -X POST http://votre-n8n.com/webhook/crm-action \
  -H "Content-Type: application/json" \
  -H "X-API-Key: votre_api_key" \
  -d @payload-test.json
```

### 3. Vérifier Résultats

**✅ Succès si** :
1. n8n dispatcher route vers `marjorie-candidat-relance`
2. Email reçu à `TON_EMAIL_TEST@example.com`
3. Email contient le nom "Marie" et "CNI_VERSO"
4. Notification reçue dans le CRM : "Relance envoyée à Marie Dumitru"
5. Badge cloche CRM mis à jour (+1)

**❌ Échec si** :
- 401 Unauthorized → Vérifier `X-API-Key`
- 500 Server Error → Vérifier logs n8n
- Email non reçu → Vérifier config SMTP
- Pas de notification CRM → Vérifier `CRM_API_URL` et `CRM_API_KEY`

---

## 🎯 Prochains Workflows à Créer

### Priorité 1 (semaine 1)

1. ✅ `crm-action-dispatcher` (fait ci-dessus)
2. ✅ `marjorie-candidat-relance` (fait ci-dessus)
3. 🔲 `marjorie-devis-generation`
4. 🔲 `marjorie-document-validation`

### Priorité 2 (semaine 2)

5. 🔲 `marjorie-prospect-relance`
6. 🔲 `marjorie-planning-entretien`
7. 🔲 `marjorie-eleve-attestation`

### Priorité 3 (semaine 3)

8. 🔲 `marjorie-formateur-disponibilite`
9. 🔲 `marjorie-session-optimisation`
10. 🔲 `marjorie-alertes-automatiques`

---

## 📚 Ressources

### Documentation n8n

- [Webhook Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [Switch Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.switch/)
- [Execute Workflow](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executeworkflow/)
- [HTTP Request](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)

### Fichiers Projet

- `docs/payload-action-enrichi.md` → Documentation complète payload
- `docs/modifications-payload-action.md` → Modifications CRM
- `docs/n8n-dispatcher-guide.md` → Ce fichier

---

**Version** : 1.0
**Dernière mise à jour** : 19 février 2026
**Auteur** : Claude Code
