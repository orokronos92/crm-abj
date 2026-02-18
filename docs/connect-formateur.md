# Documentation : Intégration Webhook Nouveau Formateur

**Date** : 18 février 2026
**Objectif** : Notifier Marjorie automatiquement lors de la création d'un nouveau formateur pour qu'elle demande les documents requis par email

---

## 📋 Vue d'ensemble

### Flow complet

```
Admin clique "Créer un formateur"
    ↓
Modal FormateurFormModal s'ouvre
    ↓
Admin remplit les informations principales
    ↓
POST /api/formateurs
    ↓
Transaction Prisma :
  - Création Utilisateur (role: 'professeur')
  - Création Formateur (statut: 'EN_COURS_INTEGRATION')
    ↓
✨ NOUVEAU : Webhook n8n (fire-and-forget)
    ↓
POST /webhook/formateur/nouveau-formateur
    ↓
n8n reçoit la notification
    ↓
Marjorie envoie email de bienvenue + demande documents
```

---

## 🔧 Implémentation Technique

### 1. Webhook Client

**Fichier** : `src/lib/webhook-client.ts`

Ajout de la méthode `nouveauFormateur` dans `formateurWebhooks` :

```typescript
export const formateurWebhooks = {
  // ... autres méthodes ...

  /**
   * Notifier Marjorie de la création d'un nouveau formateur
   * Déclenche la demande automatique des documents requis
   */
  async nouveauFormateur(data: {
    idFormateur: number
    email: string
    nom: string
    prenom: string
    telephone?: string
    specialites?: string[]
  }): Promise<WebhookResponse> {
    return callWebhook('/formateur/nouveau-formateur', data)
  }
}
```

### 2. API Route

**Fichier** : `src/app/api/formateurs/route.ts`

Appel fire-and-forget après création du formateur (ligne 96-111) :

```typescript
// ===== FIRE-AND-FORGET : Notifier Marjorie du nouveau formateur =====
// Marjorie va envoyer un email de bienvenue et demander les documents requis
formateurWebhooks.nouveauFormateur({
  idFormateur: result.formateur.idFormateur,
  email: result.formateur.email,
  nom: result.formateur.nom,
  prenom: result.formateur.prenom,
  telephone: result.formateur.telephone || undefined,
  specialites: result.formateur.specialites as string[]
}).then(webhookResult => {
  if (!webhookResult.success) {
    console.error(`[API] ❌ Webhook échoué pour nouveau formateur ${result.formateur.idFormateur}:`, webhookResult.error)
  } else {
    console.log(`[API] ✅ Webhook nouveau formateur envoyé avec succès pour ${result.formateur.prenom} ${result.formateur.nom}`)
  }
}).catch(error => {
  console.error(`[API] ❌ Erreur critique webhook nouveau formateur ${result.formateur.idFormateur}:`, error)
})
```

**Points clés** :
- Pattern fire-and-forget : le CRM ne bloque pas en attendant la réponse
- Logging des succès et erreurs
- Pas d'échec de la création si le webhook échoue (résilience)

---

## 📡 Endpoint n8n à Implémenter

### URL

```
POST {N8N_WEBHOOK_BASE_URL}/formateur/nouveau-formateur
```

### Headers

```
Content-Type: application/json
Authorization: Bearer {N8N_API_KEY}
```

### Payload

```json
{
  "idFormateur": 42,
  "email": "laurent.dupont@example.com",
  "nom": "Dupont",
  "prenom": "Laurent",
  "telephone": "+33612345678",
  "specialites": ["SERTISSAGE", "JOAILLERIE"]
}
```

### Champs

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `idFormateur` | number | ✅ Oui | ID du formateur créé en BDD |
| `email` | string | ✅ Oui | Email du formateur (destinataire) |
| `nom` | string | ✅ Oui | Nom du formateur |
| `prenom` | string | ✅ Oui | Prénom du formateur |
| `telephone` | string | ❌ Non | Téléphone du formateur (optionnel) |
| `specialites` | string[] | ❌ Non | Liste des spécialités du formateur |

---

## 🤖 Workflow n8n Attendu

### Étapes à Implémenter

1. **Webhook Trigger**
   - Réception du POST `/formateur/nouveau-formateur`
   - Validation du payload

2. **Récupération Documents Requis**
   - Query BDD : `SELECT * FROM type_document_formateur WHERE obligatoire = true`
   - Récupération de la liste des 12 types de documents requis

3. **Génération Email de Bienvenue**
   - Template personnalisé avec nom/prénom
   - Explication du processus d'intégration
   - Lien vers l'interface formateur (connexion temporaire)

4. **Génération Email Demande Documents**
   - Liste des documents requis
   - Dates limites si applicables
   - Instructions d'upload

5. **Envoi Emails**
   - Email bienvenue
   - Email liste documents requis
   - Option : email unique combiné

6. **Mise à Jour BDD (Optionnel)**
   - Logger l'envoi des emails dans `historique_emails`
   - Créer des placeholders dans `document_formateur` avec statut `EN_ATTENTE`

7. **Retour Réponse**
   - JSON : `{ "success": true, "workflowId": "...", "executionId": "..." }`

---

## 🔍 Tests et Validation

### Test Manuel

1. **Créer un formateur** :
   - Se connecter en admin
   - Aller sur `/admin/formateurs`
   - Cliquer "Créer un formateur"
   - Remplir le formulaire
   - Valider

2. **Vérifier les logs** :
   ```bash
   # Dans la console du serveur Next.js
   [Webhook] Tentative 1/3 - /formateur/nouveau-formateur
   [Webhook] ✅ Succès - /formateur/nouveau-formateur
   [API] ✅ Webhook nouveau formateur envoyé avec succès pour Laurent Dupont
   ```

3. **Vérifier côté n8n** :
   - Check executions du workflow
   - Vérifier email envoyé

### Gestion des Erreurs

**Si n8n est down** :
- Le formateur est quand même créé en BDD ✅
- Le webhook échoue après 3 tentatives (retry avec backoff exponentiel)
- Erreur loggée dans `journal_erreurs` ✅
- L'admin peut manuellement déclencher la demande de documents plus tard

**Si l'email échoue** :
- n8n retourne une erreur
- CRM logge l'erreur
- Possibilité de retry manuel depuis l'interface formateur

---

## 📝 Documents Qualiopi Requis

Les 12 types de documents que Marjorie doit demander :

### Identité et Légal (3)
1. **CV** : Curriculum Vitae à jour
2. **CNI** : Carte d'identité (recto/verso)
3. **CASIER_B3** : Casier judiciaire bulletin 3

### Assurances (2)
4. **RC_PRO** : Attestation assurance Responsabilité Civile Professionnelle
5. **PROTECTION_SOCIALE** : Attestation de vigilance URSSAF

### Qualifications (3)
6. **DIPLOME** : Diplômes et certifications
7. **CERTIFICAT_QUALIOPI** : Certification formateur Qualiopi
8. **JUSTIF_COMPETENCES** : Justificatifs de compétences techniques

### Pédagogique (2)
9. **PORTFOLIO** : Portfolio de réalisations
10. **CERTIF_FORMATION_CONTINUE** : Certificats de formation continue

### Autres (2)
11. **PHOTO_PROFIL** : Photo professionnelle
12. **RIB** : RIB pour paiements

---

## 🚀 Variables d'Environnement

Vérifier dans `.env.local` :

```env
# Base URL du serveur n8n
N8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook

# Clé API pour authentification
N8N_API_KEY=your-secret-api-key-here
```

**Production** :
```env
N8N_WEBHOOK_BASE_URL=https://n8n.abj.fr/webhook
N8N_API_KEY=prod-api-key-secure-xxxx
```

---

## ✅ Checklist Implémentation n8n

- [ ] Créer workflow "Nouveau Formateur Intégration"
- [ ] Configurer webhook trigger `/formateur/nouveau-formateur`
- [ ] Implémenter génération email bienvenue
- [ ] Implémenter génération email demande documents
- [ ] Ajouter query pour récupérer liste documents requis
- [ ] Configurer envoi emails (SMTP)
- [ ] Tester avec formateur de test
- [ ] Valider que les emails sont bien reçus
- [ ] Vérifier logs CRM + n8n
- [ ] Documenter workflow n8n (export JSON)

---

## 📊 Métriques de Succès

**Objectifs** :
- ⏱️ Temps de réponse webhook : < 2 secondes
- 📧 Taux d'envoi emails : 99%+
- 🔄 Taux de retry réussi : > 95%
- ✅ Documents reçus sous 7 jours : > 80%

**Monitoring** :
- Compter les appels webhook dans `journal_erreurs` (échecs uniquement)
- Dashboard n8n pour executions
- Notifications admin si > 5 échecs en 24h

---

**Dernière mise à jour** : 18 février 2026
**Version** : 1.0
**Auteur** : Claude Code
