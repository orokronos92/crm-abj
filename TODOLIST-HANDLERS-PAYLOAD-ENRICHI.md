# TODO: Enrichir les Handlers UI avec Nouveau Format Payload

## 📋 Vue d'ensemble

**Objectif** : Modifier tous les handlers `onClick` des composants UI admin pour envoyer le payload enrichi vers n8n via l'endpoint `/api/notifications/[id]/action`.

**Contexte** : L'endpoint backend est prêt et accepte le nouveau format avec `responseConfig`. Il faut maintenant connecter les boutons UI.

---

## 🎯 Sections UI Admin à Modifier

### 1. 📂 Section PROSPECTS

#### Fichiers concernés
- `src/components/admin/ProspectDetailPanel.tsx` (panel latéral détail)
- `src/components/admin/EnvoyerEmailModal.tsx`
- `src/components/admin/EnvoyerDossierModal.tsx`
- `src/components/admin/GenererDevisModal.tsx`
- `src/components/admin/ConvertirCandidatModal.tsx`

#### Actions à enrichir

- [ ] **Envoyer Email Prospect** (EnvoyerEmailModal.tsx:45)
  - `actionType: "RELANCE_PROSPECT_EMAIL"`
  - `actionSource: "admin.prospects.detail"`
  - `actionButton: "envoyer_email"`
  - `entiteType: "prospect"`
  - `entiteId: prospect.idProspect`
  - `entiteData: { nom, prenom, email, formationPrincipale }`
  - `responseConfig.expectedResponse: "email_sent"`

- [ ] **Envoyer Dossier Complet** (EnvoyerDossierModal.tsx:33)
  - `actionType: "ENVOYER_DOSSIER_PROSPECT"`
  - `actionSource: "admin.prospects.detail"`
  - `actionButton: "envoyer_dossier"`
  - `responseConfig.expectedResponse: "dossier_sent"`

- [ ] **Générer Devis Prospect** (GenererDevisModal.tsx:67)
  - `actionType: "GENERER_DEVIS"`
  - `actionSource: "admin.prospects.detail"`
  - `actionButton: "generer_devis"`
  - `responseConfig.expectedResponse: "devis_generated"`
  - `responseConfig.timeoutSeconds: 60` (génération peut prendre du temps)

- [ ] **Convertir en Candidat** (ConvertirCandidatModal.tsx:148)
  - `actionType: "CONVERTIR_PROSPECT_CANDIDAT"`
  - `actionSource: "admin.prospects.detail"`
  - `actionButton: "convertir_candidat"`
  - `responseConfig.expectedResponse: "candidat_created"`

---

### 2. 📋 Section CANDIDATS

#### Fichiers concernés
- `src/components/admin/CandidatDetailModal.tsx` (modal détail avec footer)
- `src/components/admin/EnvoyerMessageCandidatModal.tsx`
- `src/components/admin/GenererDevisCandidatModal.tsx`

#### Actions à enrichir

- [ ] **Envoyer Message Candidat** (EnvoyerMessageCandidatModal.tsx:46)
  - `actionType: "RELANCE_CANDIDAT_EMAIL"`
  - `actionSource: "admin.candidats.detail"`
  - `actionButton: "envoyer_message"`
  - `entiteType: "candidat"`
  - `entiteId: candidat.numeroDossier`
  - `entiteData: { nom, prenom, email, formation, statutDossier }`
  - `responseConfig.expectedResponse: "email_sent"`

- [ ] **Générer Devis Candidat** (GenererDevisCandidatModal.tsx:68)
  - `actionType: "GENERER_DEVIS"`
  - `actionSource: "admin.candidats.detail"`
  - `actionButton: "generer_devis"`
  - `responseConfig.expectedResponse: "devis_generated"`
  - `responseConfig.timeoutSeconds: 60`

- [ ] **Valider Étape Parcours** (CandidatDetailModal.tsx:136)
  - `actionType: "VALIDER_ETAPE_PARCOURS"`
  - `actionSource: "admin.candidats.detail"`
  - `actionButton: "valider_etape"`
  - `metadonnees: { etape: "entretien_tel" | "rdv_presentiel" | etc. }`
  - `responseConfig.expectedResponse: "etape_validated"`

---

### 3. 🎓 Section ÉLÈVES

#### Fichiers concernés
- `src/components/admin/EleveDetailModal.tsx` (modal détail)
- `src/components/admin/EnvoyerMessageEleveModal.tsx`
- `src/components/admin/eleve-tabs/TabSynthese.tsx`

#### Actions à enrichir

- [ ] **Envoyer Message Élève** (EnvoyerMessageEleveModal.tsx:46)
  - `actionType: "ENVOYER_MESSAGE_ELEVE"`
  - `actionSource: "admin.eleves.detail"`
  - `actionButton: "envoyer_message"`
  - `entiteType: "eleve"`
  - `entiteId: eleve.numeroDossier`
  - `entiteData: { nom, prenom, email, formation, progression }`
  - `responseConfig.expectedResponse: "email_sent"`

- [ ] **Demander Analyse Élève** (EleveDetailModal.tsx:67)
  - `actionType: "ANALYSER_ELEVE"`
  - `actionSource: "admin.eleves.detail"`
  - `actionButton: "demander_analyse"`
  - `responseConfig.expectedResponse: "analyse_generated"`
  - `responseConfig.timeoutSeconds: 60`

- [ ] **Envoyer Rappel Paiement** (TabSynthese.tsx:20)
  - `actionType: "RELANCE_PAIEMENT_ELEVE"`
  - `actionSource: "admin.eleves.synthese"`
  - `actionButton: "rappel_paiement"`
  - `responseConfig.expectedResponse: "email_sent"`

---

### 4. 👨‍🏫 Section FORMATEURS

#### Fichiers concernés
- `src/components/admin/FormateurDetailModal.tsx` (modal détail)
- `src/components/admin/EnvoyerMessageFormateurModal.tsx`
- `src/components/admin/DemanderDocumentModal.tsx`
- `src/components/admin/FormateurFormModal.tsx`
- `src/components/admin/formateur-tabs/FormateurProfilTab.tsx`

#### Actions à enrichir

- [ ] **Envoyer Message Formateur** (EnvoyerMessageFormateurModal.tsx:47)
  - `actionType: "ENVOYER_MESSAGE_FORMATEUR"`
  - `actionSource: "admin.formateurs.detail"`
  - `actionButton: "envoyer_message"`
  - `entiteType: "formateur"`
  - `entiteId: formateur.idFormateur.toString()`
  - `entiteData: { nom, prenom, email, specialite }`
  - `responseConfig.expectedResponse: "email_sent"`

- [ ] **Demander Document Formateur** (DemanderDocumentModal.tsx:58)
  - `actionType: "DEMANDER_DOCUMENT_FORMATEUR"`
  - `actionSource: "admin.formateurs.detail"`
  - `actionButton: "demander_document"`
  - `metadonnees: { typeDocument, urgent: boolean }`
  - `responseConfig.expectedResponse: "email_sent"`

- [ ] **Changer Statut Formateur** (FormateurProfilTab.tsx:34)
  - `actionType: "MODIFIER_STATUT_FORMATEUR"`
  - `actionSource: "admin.formateurs.profil"`
  - `actionButton: "changer_statut"`
  - `metadonnees: { nouveauStatut: "ACTIF" | "INACTIF" }`
  - `responseConfig.expectedResponse: "statut_updated"`

---

### 5. 📅 Section SESSIONS & PLANNING

#### Fichiers concernés
- `src/components/admin/SessionFormModal.tsx`
- `src/components/admin/EvenementFormModal.tsx`

#### Actions à enrichir

- [ ] **Créer/Valider Session** (SessionFormModal.tsx:62)
  - `actionType: "CREER_SESSION"`
  - `actionSource: "admin.sessions.form"`
  - `actionButton: "valider_session"`
  - `entiteType: "session"`
  - `entiteData: { formation, dateDebut, dateFin, formateur, salle }`
  - `responseConfig.expectedResponse: "session_created"`

---

## 📝 Template de Modification

Pour chaque handler, remplacer le `fetch` direct par un appel enrichi :

### Avant (exemple actuel)
```typescript
const response = await fetch('/api/prospects/envoyer-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    idProspect: prospect.idProspect,
    destinataire: prospect.email,
    objet: formData.objet,
    contenu: formData.contenu
  })
})
```

### Après (enrichi)
```typescript
// 1. Créer une notification si besoin (ou utiliser une existante)
const notificationId = await createOrGetNotificationId()

// 2. Envoyer l'action enrichie
const payload = {
  // === IDENTIFICATION ACTION ===
  actionType: 'RELANCE_PROSPECT_EMAIL',
  actionSource: 'admin.prospects.detail',
  actionButton: 'envoyer_email',

  // === CONTEXTE MÉTIER ===
  entiteType: 'prospect',
  entiteId: prospect.idProspect,
  entiteData: {
    nom: prospect.nom,
    prenom: prospect.prenom,
    email: prospect.email,
    formationPrincipale: prospect.formationPrincipale
  },

  // === DÉCISION UTILISATEUR ===
  decidePar: session.user.idUtilisateur, // Récupérer depuis NextAuth
  decisionType: 'envoi_email',
  commentaire: formData.objet, // Sujet de l'email

  // === MÉTADONNÉES SPÉCIFIQUES ===
  metadonnees: {
    objet: formData.objet,
    contenu: formData.contenu
  },

  // === CONFIGURATION RÉPONSE ===
  responseConfig: {
    callbackUrl: `${window.location.origin}/api/webhook/callback`,
    updateNotification: true,
    expectedResponse: 'email_sent',
    timeoutSeconds: 30
  }
}

const response = await fetch(`/api/notifications/${notificationId}/action`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
```

---

## 🎯 Priorisation

### Phase 1 - PRIORITÉ HAUTE (semaine 1)
- [ ] Section CANDIDATS (3 actions) - plus utilisée
- [ ] Section PROSPECTS (4 actions) - flux principal

### Phase 2 - PRIORITÉ MOYENNE (semaine 2)
- [ ] Section ÉLÈVES (3 actions)
- [ ] Section FORMATEURS (3 actions)

### Phase 3 - PRIORITÉ BASSE (semaine 3)
- [ ] Section SESSIONS/PLANNING (1 action)

---

## ✅ Checklist de Validation

Pour chaque handler modifié :

- [ ] Le payload contient les 7 champs obligatoires (actionType, actionSource, actionButton, entiteType, entiteId, decidePar, decisionType)
- [ ] `entiteData` contient les infos complètes (pas de query nécessaire côté n8n)
- [ ] `responseConfig` est configuré avec les bons paramètres
- [ ] `expectedResponse` correspond au type de réponse attendue
- [ ] `timeoutSeconds` adapté à la durée de l'action (30s par défaut, 60s pour génération PDF/analyse)
- [ ] Le handler gère la réponse (success/error)
- [ ] Le toast/message utilisateur est clair
- [ ] Le modal se ferme après succès

---

## 📊 Statistiques

**Total actions à modifier** : 17
- Prospects : 4 actions
- Candidats : 3 actions
- Élèves : 3 actions
- Formateurs : 3 actions
- Sessions : 1 action
- Autres : 3 actions

**Fichiers concernés** : 16 composants modals/panels

---

**Dernière mise à jour** : 19 février 2026
**Status** : En attente validation utilisateur
