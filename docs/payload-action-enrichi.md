# Payload Action Enrichi : CRM → n8n

## 📋 Vue d'ensemble

Ce document explique le **nouveau format de payload** pour les actions CRM → n8n.

### Objectif

Permettre à n8n de **dispatcher intelligemment** les actions vers le bon agent en fonction :
- Du **contexte UI** (quelle page, quel bouton)
- De l'**entité métier** (candidat, prospect, élève)
- Des **données complètes** pour traitement sans requête supplémentaire

---

## 🔄 Ancien vs Nouveau Format

### ❌ Ancien Format (Insuffisant)

```json
{
  "typeAction": "RELANCER",
  "resultat": "relance_email",
  "commentaire": "Relance pour documents"
}
```

**Problèmes** :
- ❌ Pas de contexte UI (impossible de savoir d'où vient l'action)
- ❌ Pas de données métier (n8n doit faire une requête pour récupérer le candidat)
- ❌ Pas de dispatch intelligent (tout va au même workflow)

### ✅ Nouveau Format (Enrichi)

```json
{
  // === IDENTIFICATION ACTION ===
  "actionType": "RELANCE_CANDIDAT_EMAIL",
  "actionSource": "admin.candidats.detail",
  "actionButton": "relancer_email",

  // === CONTEXTE MÉTIER ===
  "entiteType": "candidat",
  "entiteId": "DUMI15091992",
  "entiteData": {
    "nom": "Dumitru",
    "prenom": "Marie",
    "email": "marie.dumitru@example.com",
    "telephone": "0612345678",
    "statutDossier": "DOSSIER_COMPLET",
    "formation": "CAP Bijouterie-Joaillerie"
  },

  // === DÉCISION UTILISATEUR ===
  "decidePar": 1,
  "decisionType": "relance_email",
  "commentaire": "Relance pour documents manquants",

  // === MÉTADONNÉES SPÉCIFIQUES ===
  "metadonnees": {
    "documentsManquants": ["CNI_VERSO", "LETTRE_MOTIVATION"],
    "delaiDepuisDernierContact": 15,
    "priorite": "HAUTE"
  }
}
```

**Avantages** :
- ✅ **Contexte complet** : n8n sait exactement d'où vient l'action
- ✅ **Données métier incluses** : pas de requête supplémentaire
- ✅ **Dispatch intelligent** : routage automatique vers le bon agent
- ✅ **Traçabilité** : qui a fait quoi, depuis où, pourquoi

---

## 📝 Structure du Payload

### 1. Identification Action

| Champ | Type | Description | Exemple |
|-------|------|-------------|---------|
| `actionType` | string | Code unique de l'action | `"RELANCE_CANDIDAT_EMAIL"` |
| `actionSource` | string | Chemin UI d'origine | `"admin.candidats.detail"` |
| `actionButton` | string | ID du bouton cliqué | `"relancer_email"` |

**Format actionType** : `VERBE_ENTITE_METHODE`
- `RELANCE_CANDIDAT_EMAIL`
- `GENERER_DEVIS`
- `VALIDER_DOCUMENT`
- `PLANIFIER_ENTRETIEN`

**Format actionSource** : `role.section.page`
- `admin.candidats.detail`
- `admin.prospects.list`
- `formateur.eleves.detail`
- `eleve.documents.list`

### 2. Contexte Métier

| Champ | Type | Description | Exemple |
|-------|------|-------------|---------|
| `entiteType` | string | Type d'entité | `"candidat"` |
| `entiteId` | string | ID ou numéro dossier | `"DUMI15091992"` |
| `entiteData` | object | Données complètes | `{ nom, prenom, email, ... }` |

**Types d'entités** :
- `prospect`
- `candidat`
- `eleve`
- `formateur`
- `session`
- `document`

**Contenu recommandé de `entiteData`** :
```json
{
  "nom": "Dumitru",
  "prenom": "Marie",
  "email": "marie.dumitru@example.com",
  "telephone": "0612345678",
  "statutDossier": "DOSSIER_COMPLET",
  "formation": "CAP Bijouterie-Joaillerie",
  "session": "Septembre 2025",
  "dateInscription": "2024-09-15"
}
```

### 3. Décision Utilisateur

| Champ | Type | Description | Exemple |
|-------|------|-------------|---------|
| `decidePar` | number | ID utilisateur | `1` |
| `decisionType` | string | Type de décision | `"relance_email"` |
| `commentaire` | string | Commentaire optionnel | `"Relance urgente"` |

### 4. Métadonnées Spécifiques

```json
{
  "metadonnees": {
    // Exemples selon le type d'action
    "documentsManquants": ["CNI_VERSO"],
    "delaiDepuisDernierContact": 15,
    "priorite": "HAUTE",
    "montantDevis": 8500,
    "dateEntretien": "2026-03-15T10:00:00Z"
  }
}
```

---

## 🎯 Catalogue des Actions

### Actions Prospects

```typescript
"RELANCE_PROSPECT_EMAIL"          // Relancer prospect par email
"RELANCE_PROSPECT_TELEPHONE"      // Relancer prospect par téléphone
"RELANCE_PROSPECT_SMS"            // Relancer prospect par SMS
"ENVOYER_DOSSIER_PROSPECT"        // Envoyer formulaire dossier complet
"CONVERTIR_PROSPECT_CANDIDAT"     // Convertir prospect en candidat
```

### Actions Candidats

```typescript
"RELANCE_CANDIDAT_EMAIL"          // Relancer candidat par email
"RELANCE_CANDIDAT_TELEPHONE"      // Relancer candidat par téléphone
"GENERER_DEVIS"                   // Générer et envoyer devis
"ENVOYER_DEVIS"                   // Renvoyer devis existant
"VALIDER_DOSSIER"                 // Valider dossier complet
"REFUSER_DOSSIER"                 // Refuser candidature
"DEMANDER_DOCUMENTS"              // Relancer documents manquants
"PLANIFIER_ENTRETIEN"             // Planifier entretien pédagogique
"GENERER_CONTRAT"                 // Générer contrat formation
```

### Actions Documents

```typescript
"VALIDER_DOCUMENT"                // Valider un document reçu
"REFUSER_DOCUMENT"                // Refuser un document (qualité insuffisante)
"DEMANDER_REUPLOAD"               // Demander un nouveau téléversement
"TELECHARGER_DOSSIER_COMPLET"     // Télécharger tous les documents
```

### Actions Élèves

```typescript
"GENERER_ATTESTATION"             // Générer attestation de formation
"GENERER_BULLETIN"                // Générer bulletin de notes
"RELANCE_PRESENCE"                // Relancer élève pour absences
"NOTIFIER_NOTE"                   // Notifier élève d'une nouvelle note
```

### Actions Formateurs

```typescript
"VALIDER_DISPONIBILITE"           // Valider disponibilité formateur
"GENERER_CONTRAT_FORMATEUR"       // Générer contrat formateur
"DEMANDER_DOCUMENTS_FORMATEUR"    // Demander documents Qualiopi
```

---

## 🔀 Dispatch n8n : Switch Node

### Configuration du Dispatcher

```javascript
// n8n Switch Node
const actionType = {{ $json.actionType }}

// Dispatch par préfixe
if (actionType.startsWith('RELANCE_CANDIDAT_')) {
  return 0  // → marjorie-candidat-relance
}
else if (actionType.startsWith('RELANCE_PROSPECT_')) {
  return 1  // → marjorie-prospect-relance
}
else if (actionType.startsWith('GENERER_')) {
  return 2  // → marjorie-documents-generation
}
else if (actionType.startsWith('VALIDER_') || actionType.startsWith('REFUSER_')) {
  return 3  // → marjorie-validation
}
else if (actionType.startsWith('PLANIFIER_')) {
  return 4  // → marjorie-planning
}
else {
  return 5  // → log-erreur
}
```

### Table de Routage Complète

| Préfixe actionType | Route | Workflow n8n |
|-------------------|-------|--------------|
| `RELANCE_CANDIDAT_*` | 0 | `marjorie-candidat-relance` |
| `RELANCE_PROSPECT_*` | 1 | `marjorie-prospect-relance` |
| `GENERER_*` | 2 | `marjorie-documents-generation` |
| `VALIDER_*` / `REFUSER_*` | 3 | `marjorie-validation` |
| `PLANIFIER_*` | 4 | `marjorie-planning` |
| `DEMANDER_*` | 5 | `marjorie-communication` |
| Autre | 6 | `log-erreur` |

---

## 📚 Exemples d'Utilisation

### Exemple 1 : Relance Candidat Email

**Payload envoyé** :
```json
{
  "actionType": "RELANCE_CANDIDAT_EMAIL",
  "actionSource": "admin.candidats.detail",
  "actionButton": "relancer_email",

  "entiteType": "candidat",
  "entiteId": "DUMI15091992",
  "entiteData": {
    "nom": "Dumitru",
    "prenom": "Marie",
    "email": "marie.dumitru@example.com",
    "statutDossier": "DOSSIER_COMPLET"
  },

  "decidePar": 1,
  "decisionType": "relance_email",
  "commentaire": "Relance pour documents CNI manquants",

  "metadonnees": {
    "documentsManquants": ["CNI_VERSO"],
    "delaiDepuisDernierContact": 15,
    "priorite": "HAUTE"
  }
}
```

**Workflow n8n déclenché** :
1. Dispatcher route vers `marjorie-candidat-relance`
2. Agent IA génère email personnalisé avec :
   - Nom/prénom du candidat
   - Liste des documents manquants
   - Délai depuis dernier contact
3. Envoi SMTP automatique
4. Notification retour CRM : "Relance envoyée à Marie Dumitru"

### Exemple 2 : Générer Devis

**Payload envoyé** :
```json
{
  "actionType": "GENERER_DEVIS",
  "actionSource": "admin.candidats.detail",
  "actionButton": "generer_devis",

  "entiteType": "candidat",
  "entiteId": "JURI102025",
  "entiteData": {
    "nom": "Rimbo",
    "prenom": "Juliette",
    "email": "juliette.rimbo@example.com",
    "formation": "CAP ATBJ",
    "montantTotal": 8500,
    "montantPriseEnCharge": 8000,
    "resteACharge": 500,
    "modeFinancement": "CPF"
  },

  "decidePar": 1,
  "decisionType": "generation_devis",

  "metadonnees": {
    "urgence": true,
    "sessionVisee": "Septembre 2026"
  }
}
```

**Workflow n8n déclenché** :
1. Dispatcher route vers `marjorie-documents-generation`
2. Copie template Google Docs "Devis Formation"
3. Remplissage automatique des placeholders
4. Export PDF
5. Upload Google Drive
6. Envoi email avec pièce jointe
7. Update BDD : `statutDossier = DEVIS_ENVOYE`
8. Notification CRM : "Devis généré et envoyé à Juliette Rimbo"

### Exemple 3 : Valider Document

**Payload envoyé** :
```json
{
  "actionType": "VALIDER_DOCUMENT",
  "actionSource": "admin.candidats.documents",
  "actionButton": "valider_document",

  "entiteType": "document",
  "entiteId": "42",
  "entiteData": {
    "typeDocument": "CV",
    "candidatNom": "Dumitru",
    "candidatPrenom": "Marie",
    "candidatEmail": "marie.dumitru@example.com"
  },

  "decidePar": 1,
  "decisionType": "validation",
  "commentaire": "CV conforme, profil artistique pertinent",

  "metadonnees": {
    "qualite": "EXCELLENTE",
    "score": 95
  }
}
```

**Workflow n8n déclenché** :
1. Dispatcher route vers `marjorie-validation`
2. Update BDD : `statut_document = VALIDE`
3. Check si tous documents obligatoires validés
4. Si oui : Update `statutDossier = DOSSIER_COMPLET`
5. Notification CRM : "Dossier Marie Dumitru complet et prêt pour jury"

---

## 🔐 Sécurité

### Validation Côté CRM

Le CRM valide :
- ✅ Champs requis présents
- ✅ Types de données corrects
- ✅ Utilisateur `decidePar` existe et a les permissions
- ✅ Entité `entiteId` existe

### Validation Côté n8n

n8n valide :
- ✅ API Key valide (`X-API-Key` header)
- ✅ Source = `crm-abj`
- ✅ Timestamp récent (< 5 minutes)
- ✅ `actionType` reconnu dans le catalogue

---

## 🎯 Migration Progressive

### Compatibilité Legacy

L'endpoint supporte **les deux formats** :
- ✅ Nouveau format (actionType, actionSource, etc.)
- ✅ Ancien format (typeAction, resultat)

**Code de compatibilité** :
```typescript
const actionType = body.actionType || body.typeAction
const decisionType = body.decisionType || body.resultat || 'success'
```

### Plan de Migration

**Phase 1** : Modifier 1 bouton UI (test)
- Bouton "Relancer email" modal candidat
- Utiliser nouveau format
- Valider flow CRM → n8n → CRM

**Phase 2** : Modifier tous les boutons UI admin
- Tous les boutons d'action notifications
- Tous les boutons modals

**Phase 3** : Supprimer ancien format
- Retirer compatibilité legacy
- Simplifier code

---

## 📊 Webhook n8n Reçu

### URL du Webhook

```
POST http://votre-n8n.com/webhook/crm-action
```

### Headers

```
Content-Type: application/json
X-API-Key: votre_api_key_n8n
```

### Payload Complet Reçu

```json
{
  // Timestamp et source
  "timestamp": "2026-02-19T10:30:00.000Z",
  "source": "crm-abj",

  // Contexte action
  "actionType": "RELANCE_CANDIDAT_EMAIL",
  "actionSource": "admin.candidats.detail",
  "actionButton": "relancer_email",

  // Entité métier
  "entiteType": "candidat",
  "entiteId": "DUMI15091992",
  "entiteData": { ... },

  // Décision utilisateur
  "decidePar": 1,
  "decisionType": "relance_email",
  "commentaire": "...",

  // Métadonnées
  "metadonnees": { ... },

  // Notification source
  "notificationId": 42,
  "notificationCategorie": "CANDIDAT",
  "notificationType": "DOSSIER_INCOMPLET",
  "notificationTitre": "Documents manquants pour DUMI15091992",

  // Legacy (compatibilité)
  "typeAction": "RELANCER",
  "resultat": "relance_email",
  "executedBy": 1,
  "metadata": { ... }
}
```

---

## ✅ Checklist Implémentation

### Côté CRM

- [x] Endpoint modifié pour accepter nouveau format
- [x] Validation payload enrichie
- [x] Appel webhook n8n avec payload complet
- [ ] Modifier composants UI pour envoyer nouveau format
- [ ] Tests E2E CRM → n8n

### Côté n8n

- [ ] Créer webhook `/webhook/crm-action`
- [ ] Implémenter Switch Node dispatcher
- [ ] Créer workflows agents (marjorie-candidat-relance, etc.)
- [ ] Tests unitaires par action type
- [ ] Monitoring et logs

---

**Version** : 1.0
**Dernière mise à jour** : 19 février 2026
**Auteur** : Claude Code
