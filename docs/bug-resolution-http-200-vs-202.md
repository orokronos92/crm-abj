# Résolution Bug : Popup erreur sur actions modals (HTTP 200 vs 202)

**Date** : 19 février 2026
**Statut** : ✅ Résolu

---

## Symptôme

Dans les modals d'action (GenererDevis, EnvoyerEmail, etc.), après avoir cliqué sur le bouton de confirmation :
- L'action s'exécutait correctement côté serveur
- **Mais un popup d'erreur s'affichait quand même** dans l'UI
- L'utilisateur voyait "Erreur" alors que l'action avait réussi

---

## Cause Racine

Le code frontend vérifiait un code HTTP **202 spécifiquement** :

```javascript
if (response.status === 202 && result.success) {
  // Afficher succès
} else {
  // Afficher erreur ← déclenchait même si l'API renvoyait 200
}
```

Or l'API `/api/notifications/[id]/action` retourne **HTTP 200**, pas 202.
Résultat : la condition était toujours fausse → popup erreur systématique.

---

## Solution Appliquée

Remplacer `response.status === 202` par `response.ok` dans **tous** les modals.

`response.ok` est `true` pour **tous les codes 2xx** (200, 201, 202, 204...).
C'est plus robuste et insensible aux variations de code retour des APIs.

```javascript
// AVANT (cassé)
if (response.status === 202 && result.success) {

// APRÈS (correct)
if (response.ok && result.success) {
```

---

## Fichiers Corrigés (19 février 2026)

| Fichier | Occurrences corrigées |
|---------|----------------------|
| `src/components/admin/GenererDevisModal.tsx` | 1 |
| `src/components/admin/EnvoyerEmailModal.tsx` | 1 |
| `src/components/admin/EnvoyerDossierModal.tsx` | 1 |
| `src/components/admin/ConvertirCandidatModal.tsx` | 4 |
| `src/components/admin/GenererDevisCandidatModal.tsx` | 1 |
| `src/components/admin/EnvoyerMessageCandidatModal.tsx` | 1 |
| `src/components/admin/EnvoyerMessageEleveModal.tsx` | 1 |
| `src/components/admin/EnvoyerMessageFormateurModal.tsx` | 1 |
| `src/components/admin/DemanderDocumentModal.tsx` | 1 |
| `src/components/admin/SessionFormModal.tsx` | 1 |
| `src/components/admin/EleveDetailModal.tsx` | 2 |
| `src/components/admin/eleve-tabs/TabSynthese.tsx` | 1 |

---

## Fichiers UI Restants à Vérifier

Lors de la création de nouveaux modals ou de nouvelles interfaces (formateur, élève), **toujours vérifier** que le pattern utilisé est `response.ok` et non `response.status === XXX`.

Interfaces non encore auditées pour ce pattern :
- `src/components/formateur/` — à vérifier lors de la prochaine session
- `src/components/eleve/` — à vérifier lors de la prochaine session
- Tout nouveau modal créé dans le futur

---

## Règle à Appliquer Systématiquement

> **Ne jamais vérifier un code HTTP spécifique pour déterminer le succès d'une requête.**
> Toujours utiliser `response.ok` qui couvre tous les codes 2xx.

```javascript
// ✅ Pattern correct pour tous les appels fetch
const response = await fetch('/api/...', { method: 'POST', ... })
const result = await response.json()

if (response.ok && result.success) {
  // Succès
} else {
  // Erreur
}
```

---

## Timeout Popup Succès

Corrigé en même temps : durée d'affichage du popup succès passée de **3000ms à 5000ms** dans tous les modals.

```javascript
// AVANT
setTimeout(() => { onSuccess(); onClose() }, 3000)

// APRÈS
setTimeout(() => { onSuccess(); onClose() }, 5000)
```

Fichiers concernés : les mêmes 8 modals listés ci-dessus.

---

---

# Refonte Async — Pattern `useCallbackListener` (Pending/Callback)

**Date** : 19 février 2026
**Statut** : ✅ Appliqué sur tous les modals admin existants

---

## Problème

Les modals affichaient un écran **succès immédiatement** après l'envoi de la requête à n8n, **avant que n8n ne confirme** le résultat réel. L'utilisateur voyait "✅ Succès" alors que Marjorie n'avait pas encore traité l'action.

---

## Architecture du Fix (4 couches)

```
Layer 1 : /api/notifications/[id]/action/route.ts
  → Retourne { success: true, status: 'pending' } au lieu de déclencher succès

Layer 2 : /api/webhook/callback/route.ts
  → Reçoit le vrai résultat de n8n et broadcast via SSE (event: action_completed)

Layer 3 : src/hooks/use-notifications.ts
  → Écoute les events SSE 'action_completed' et les diffuse

Layer 4 : Modals (composants React)
  → Restent en état 'pending' jusqu'à réception du callback, puis affichent succès ou erreur
```

---

## Hook Créé : `useCallbackListener`

**Fichier** : `src/hooks/use-callback-listener.ts`

```typescript
export function useCallbackListener({
  notificationId,   // number | null — active le listener quand non-null
  onCallback,       // (status: 'success' | 'error', data?) => void
  timeoutSeconds    // défaut: 60 — timeout fallback en erreur
}) {
  useEffect(() => {
    if (!notificationId) return
    const eventSource = new EventSource('/api/notifications/stream')
    eventSource.addEventListener('action_completed', (event) => {
      const data = JSON.parse(event.data)
      if (data.notificationId !== notificationId) return
      if (data.resultat === 'pending') return  // ignorer les pending
      cleanup()
      onCallback(data.resultat, data)  // 'success' ou 'error'
    })
    // Timeout fallback → erreur après N secondes
    timeoutRef.current = setTimeout(() => {
      cleanup()
      onCallback('error', { notificationId, resultat: 'error' })
    }, timeoutSeconds * 1000)
    return cleanup
  }, [notificationId])
}
```

---

## Pattern Appliqué dans les Modals

### Avant (faux succès immédiat)

```typescript
const [submitted, setSubmitted] = useState(false)

// Dans handleSubmit, branche succès :
setSubmitted(true)
setTimeout(() => { onSuccess(); onClose() }, 5000)

// Rendu :
if (submitted) {
  return <SuccessScreen />
}
```

### Après (vrai succès asynchrone)

```typescript
const [actionStatus, setActionStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
const [pendingNotificationId, setPendingNotificationId] = useState<number | null>(null)

useCallbackListener({
  notificationId: pendingNotificationId,
  onCallback: (status) => {
    setSubmitting(false)
    setActionStatus(status)
    if (status === 'success') {
      setTimeout(() => { onSuccess(); onClose() }, 5000)
    }
  },
  timeoutSeconds: 60
})

// Dans handleSubmit, branche succès :
if (response.ok && result.success) {
  setPendingNotificationId(notificationId)
  setActionStatus('pending')
  // NE PAS appeler setSubmitting(false) ici — géré par onCallback
}

// Rendu :
if (actionStatus === 'pending') return <PendingScreen />   // Loader2 + "En attente de confirmation (max 60s)"
if (actionStatus === 'success') return <SuccessScreen />   // CheckCircle + fermeture 5s
if (actionStatus === 'error')   return <ErrorScreen />     // AlertCircle + bouton Fermer
```

### Points clés

- Supprimer le `finally { setSubmitting(false) }` — appeler `setSubmitting(false)` uniquement dans `onCallback` et dans les branches d'erreur synchrone (409, else, catch)
- Le branchement 409 garde sa logique métier spécifique (ex: `setConversionEnCours(true)`) mais ajoute `setSubmitting(false)` explicitement
- `timeoutSeconds: 60` — délai généreux pour laisser n8n traiter

---

## Modals Mis à Jour

| Fichier | Particularité |
|---------|---------------|
| `src/components/admin/GenererDevisModal.tsx` | Standard |
| `src/components/admin/EnvoyerEmailModal.tsx` | Standard |
| `src/components/admin/EnvoyerDossierModal.tsx` | Pas de champs à afficher dans succès |
| `src/components/admin/EnvoyerMessageCandidatModal.tsx` | Standard |
| `src/components/admin/EnvoyerMessageEleveModal.tsx` | Affiche `formData.objet` dans succès |
| `src/components/admin/GenererDevisCandidatModal.tsx` | A `FORMATIONS_TARIFS` et `MODES_FINANCEMENT` constants |
| `src/components/admin/ConvertirCandidatModal.tsx` | Le plus complexe : a `checkingConversion` + `conversionEnCours` + useEffects API + `handleSubmit(e: React.FormEvent)` |

---

## À Appliquer sur les Prochaines Interfaces

Lors de la création de nouveaux modals d'action dans les interfaces **formateur** ou **élève**, appliquer le même pattern :

1. Importer `useCallbackListener` depuis `@/hooks/use-callback-listener`
2. Remplacer `submitted: boolean` par `actionStatus + pendingNotificationId`
3. Appeler `useCallbackListener` avec `notificationId: pendingNotificationId`
4. 3 écrans de statut : `pending` (Loader2), `success` (CheckCircle, autoclose 5s), `error` (AlertCircle + bouton Fermer)
5. Ne jamais appeler `setSubmitting(false)` dans un `finally` — le gérer branche par branche

```typescript
// Template de référence — à copier pour tout nouveau modal d'action
import { useCallbackListener } from '@/hooks/use-callback-listener'

const [submitting, setSubmitting] = useState(false)
const [actionStatus, setActionStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
const [pendingNotificationId, setPendingNotificationId] = useState<number | null>(null)
const { createActionNotification } = useActionNotification()

useCallbackListener({
  notificationId: pendingNotificationId,
  onCallback: (status) => {
    setSubmitting(false)
    setActionStatus(status)
    if (status === 'success') {
      setTimeout(() => { onSuccess(); onClose() }, 5000)
    }
  },
  timeoutSeconds: 60
})

// handleSubmit :
if (response.ok && result.success) {
  setPendingNotificationId(notificationId)
  setActionStatus('pending')
} else if (response.status === 409) {
  // logique métier spécifique
  setSubmitting(false)
  onClose()
} else {
  setSubmitting(false)
  alert(result.error || 'Erreur')
}

// Rendu (avant le JSX principal) :
if (actionStatus === 'pending') return <PendingScreen />
if (actionStatus === 'success') return <SuccessScreen />
if (actionStatus === 'error')   return <ErrorScreen />
```
