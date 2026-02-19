# 🎯 Guide de Finalisation des Handlers (Vraie Notification + User ID)

**Date** : 19 février 2026
**Objectif** : Remplacer `Date.now()` et `decidePar: 1` par des valeurs réelles dans les 13 handlers

---

## ✅ Solution Implémentée

### Hook Créé : `use-action-notification.ts`

Ce hook gère automatiquement :
1. ✅ Récupération de l'utilisateur connecté via NextAuth
2. ✅ Création d'une vraie notification en BDD via `/api/notifications/ingest`
3. ✅ Retour de l'ID notification + user ID pour le payload

**Localisation** : `src/hooks/use-action-notification.ts`

### Exemple Implémenté : `EnvoyerEmailModal.tsx`

**Avant** :
```typescript
const notificationId = Date.now() // TODO
const decidePar = 1 // TODO
```

**Après** :
```typescript
import { useActionNotification } from '@/hooks/use-action-notification'

export function EnvoyerEmailModal({ ... }) {
  const { createActionNotification, userId } = useActionNotification()

  const handleSubmit = async () => {
    // 1. Créer vraie notification
    const { notificationId, userId: currentUserId } = await createActionNotification({
      categorie: 'PROSPECT',
      type: 'ENVOI_EMAIL',
      priorite: 'NORMALE',
      titre: `Email à ${prospect.prenom} ${prospect.nom}`,
      message: `Objet: ${formData.objet}`,
      entiteType: 'prospect',
      entiteId: prospect.idProspect,
      actionRequise: true,
      typeAction: 'RELANCER'
    })

    // 2. Utiliser dans le payload
    const payload = {
      ...
      decidePar: currentUserId, // ✅ User ID réel
      ...
    }

    const response = await fetch(`/api/notifications/${notificationId}/action`, ...)
  }
}
```

---

## 📋 Checklist d'Implémentation par Handler

### Section PROSPECTS (4 handlers)

#### 1. ✅ `EnvoyerEmailModal.tsx` - FAIT (exemple de référence)
- Catégorie: `PROSPECT`
- Type: `ENVOI_EMAIL`

#### 2. ✅ `EnvoyerDossierModal.tsx` - FAIT
- Catégorie: `PROSPECT`
- Type: `ENVOI_DOSSIER`
- Titre: `Dossier envoyé à ${prospect.prenom} ${prospect.nom}`

#### 3. ✅ `GenererDevisModal.tsx` - FAIT
- Catégorie: `PROSPECT`
- Type: `GENERATION_DEVIS`
- Titre: `Devis généré pour ${prospect.prenom} ${prospect.nom}`

#### 4. ✅ `ConvertirCandidatModal.tsx` - FAIT
- Catégorie: `PROSPECT`
- Type: `CONVERSION_CANDIDAT`
- Titre: `Conversion prospect → candidat : ${prospect.prenom} ${prospect.nom}`

---

### Section CANDIDATS (3 handlers)

#### 5. ✅ `CandidatDetailModal.tsx::handleValiderEtape` - FAIT
- Catégorie: `CANDIDAT`
- Type: `VALIDATION_ETAPE`
- Titre: `Étape ${etape} validée pour ${candidat.prenom} ${candidat.nom}`

#### 6. ✅ `GenererDevisCandidatModal.tsx` - FAIT
- Catégorie: `CANDIDAT`
- Type: `GENERATION_DEVIS`
- Titre: `Devis généré pour candidat ${candidat.numeroDossier}`

#### 7. ✅ `EnvoyerMessageCandidatModal.tsx` - FAIT
- Catégorie: `CANDIDAT`
- Type: `ENVOI_MESSAGE`
- Titre: `Message envoyé à ${candidat.prenom} ${candidat.nom}`

---

### Section ÉLÈVES (3 handlers)

#### 8. ✅ `EnvoyerMessageEleveModal.tsx` - FAIT
- Catégorie: `ELEVE`
- Type: `ENVOI_MESSAGE`
- Titre: `Message envoyé à ${eleve.prenom} ${eleve.nom}`

#### 9. ✅ `EleveDetailModal.tsx::handleDemanderAnalyse` - FAIT
- Catégorie: `ELEVE`
- Type: `DEMANDE_ANALYSE`
- Titre: `Analyse demandée pour ${eleve.prenom} ${eleve.nom}`

#### 10. ✅ `TabSynthese.tsx::handleEnvoyerRappel` - FAIT
- Catégorie: `ELEVE`
- Type: `RAPPEL_PAIEMENT`
- Titre: `Rappel paiement envoyé à ${eleve.prenom} ${eleve.nom}`

---

### Section FORMATEURS (2 handlers)

#### 11. ✅ `DemanderDocumentModal.tsx` - FAIT
- Catégorie: `FORMATEUR`
- Type: `DEMANDE_DOCUMENT`
- Titre: `Document ${document.libelle} demandé à ${formateur.prenom} ${formateur.nom}`

#### 12. ✅ `EnvoyerMessageFormateurModal.tsx` - FAIT
- Catégorie: `FORMATEUR`
- Type: `ENVOI_MESSAGE`
- Titre: `Message envoyé à ${formateur.prenom} ${formateur.nom}`

---

### Section SESSIONS (1 handler)

#### 13. ⏳ `SessionFormModal.tsx::handleConfirmReview`
- Catégorie: `SESSION`
- Type: `CREATION_SESSION`
- Titre: `Session ${sessionType} créée et soumise à validation IA`

---

## 🔧 Pattern d'Implémentation (copier-coller)

### Étape 1 : Import du hook
```typescript
import { useActionNotification } from '@/hooks/use-action-notification'
```

### Étape 2 : Utilisation dans le composant
```typescript
export function MonModal({ ... }) {
  const { createActionNotification } = useActionNotification()

  const handleSubmit = async () => {
    setSubmitting(true)

    try {
      // 1. Créer notification
      const { notificationId, userId: currentUserId } = await createActionNotification({
        categorie: 'CATEGORIE', // Voir checklist ci-dessus
        type: 'TYPE', // Voir checklist ci-dessus
        priorite: 'NORMALE',
        titre: 'Titre descriptif',
        message: 'Message détaillé',
        entiteType: 'prospect', // ou 'candidat', 'eleve', 'formateur', 'session'
        entiteId: entite.id.toString(),
        actionRequise: true,
        typeAction: 'RELANCER' // ou 'VALIDER', 'GENERER', etc.
      })

      // 2. Remplacer dans le payload
      const payload = {
        // ... autres champs ...
        decidePar: currentUserId, // ✅ au lieu de 1
        // ... autres champs ...
      }

      const response = await fetch(`/api/notifications/${notificationId}/action`, ...)
      // ... reste du code inchangé
    }
  }
}
```

---

## ⚠️ Points d'Attention

### 1. API Key Notification
Le hook utilise `process.env.NEXT_PUBLIC_NOTIFICATIONS_API_KEY`
- En dev : `'dev-key'` par défaut
- En prod : Définir la vraie clé dans `.env.local`

### 2. Fallback en Cas d'Erreur
Si la création de notification échoue :
- Le hook retourne `Date.now()` en fallback
- L'action continue normalement
- Un log d'erreur est affiché dans la console

### 3. Type Session NextAuth
- Propriété utilisateur : `session.user.id` (pas `idUtilisateur`)
- Nom : `session.user.nom` (pas `name`)
- Email : `session.user.email`

---

## 🎯 Prochaines Étapes

### Option 1 : Implémentation Manuelle (recommandé)
Appliquer le pattern handler par handler avec tests entre chaque :
```bash
# Modifier un handler
# Test compilation
npm run build

# Test runtime (si serveur BDD dispo)
npm run dev

# Commit
git add .
git commit -m "feat: vraie notification + user ID pour HandlerName"
```

### Option 2 : Script Automatisé
Créer un script qui applique automatiquement le pattern :
```typescript
// TODO: Script à créer si besoin
```

---

## ✅ Validation Finale

Une fois tous les handlers mis à jour :

1. **Compilation** : `npm run build` doit passer
2. **Types** : Aucune erreur TypeScript
3. **Runtime** : Tester au moins 1 handler par section
4. **Logs** : Vérifier que les notifications sont créées en BDD
5. **Session** : Vérifier que `decidePar` contient le vrai user ID

---

**Status actuel** : 1/13 handlers finalisés (EnvoyerEmailModal)
**Dernière mise à jour** : 19 février 2026
**Auteur** : Claude Code
