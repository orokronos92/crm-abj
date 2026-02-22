# Roadmap CRM ABJ — Tâches en cours et à venir

**Dernière mise à jour** : 2026-02-21 (fix router.refresh() — liste prospects mise à jour sans F5)

---

## ✅ TERMINÉ

### T1 — Éjection dynamique après conversion prospect → candidat

**But** : Quand la conversion réussit, ne pas laisser le prospect dans la liste ni le volet ouvert.

**Problème** : Après callback n8n (succès), le popup se fermait mais le volet droit restait ouvert avec le prospect converti. La ligne disparaissait seulement après F5.

**Actions mises en œuvre** :
- `ProspectsPageClient` : liste gérée en état local (`useState`), ajout de `handleProspectConverti(id)` qui filtre la liste et ferme le volet
- `ProspectDetailPanel` : nouvelle prop `onProspectConverti`, le `handleConversionSuccess` appelle `onProspectConverti` + `onClose` au lieu de recharger le prospect
- Aucune modification du modal `ConvertirCandidatModal`

**Objectif atteint** : Dès que le popup de succès se ferme (auto après 5s), la ligne disparaît de la liste et le volet se ferme instantanément. Zéro rechargement page.

**Commit** : `99c7d7d` — `feat: éjection dynamique ligne + fermeture volet après conversion prospect → candidat`

---

## ✅ TERMINÉ (suite)

### T2 — Refonte architecture notifications actions

**But** : Corriger le comportement actuel où la notification de résultat arrive dans la cloche AVANT que n8n ait confirmé l'action.

**Problème identifié** :
- `useActionNotification` crée la notification en BDD + broadcast SSE **immédiatement** à l'envoi vers n8n
- La notification apparaît dans la cloche avant le callback n8n
- Si n8n échoue, la notification est quand même visible (partiellement corrigé)

**Correctif partiel déjà appliqué** (commit `4429d33`) :
- Suppression du broadcast SSE "pending" prématuré dans `/api/notifications/[id]/action`
- `callN8nWebhook` retourne `true`/`false` — si échec → broadcast SSE "error" + HTTP 502

**Architecture cible** : Les notifications de résultat devraient venir de **n8n** (via callback `/api/notifications/ingest`) plutôt que du CRM au moment de l'envoi. Cela garantit qu'une notification = une action confirmée.

**Implications** :
- Côté CRM : supprimer `createActionNotification()` dans les ~7 modals concernés
- Côté n8n : chaque workflow envoie un POST `/api/notifications/ingest` en fin d'exécution (succès ET erreur)
- Le popup résultat continue via `useCallbackListener` (SSE) — pas impacté

**Modals concernés** :
1. `ConvertirCandidatModal.tsx`
2. `EnvoyerDossierModal.tsx`
3. `EnvoyerEmailModal.tsx`
4. `EnvoyerMessageCandidatModal.tsx`
5. `EnvoyerMessageEleveModal.tsx`
6. `GenererDevisCandidatModal.tsx`
7. `GenererDevisModal.tsx`

**Statut** : ✅ TERMINÉ — commit `968b0ec`

**Actions mises en œuvre** :
- Suppression de `useActionNotification` et `createActionNotification()` dans les 7 modals
- Remplacement par `correlationId = useRef(crypto.randomUUID())` généré côté client
- Nouveau hook `use-callback-listener.ts` : écoute SSE filtré par `correlationId` (ou `notificationId` en mode legacy)
- Nouvel endpoint `POST /api/actions/trigger` : appel direct n8n sans écriture BDD
- Endpoint `POST /api/webhook/callback` : mode dual — T2 (correlationId → broadcast SSE immédiat) + legacy (notificationId → mise à jour BDD)
- `sse-manager.ts` : `broadcastActionCompleted` accepte `correlationId` optionnel

**Flux final** :
1. Clic bouton → `correlationId` UUID généré côté client
2. `POST /api/actions/trigger` → n8n appelé directement (aucune écriture BDD)
3. n8n traite → `POST /api/webhook/callback` avec le même `correlationId`
4. SSE broadcast → `useCallbackListener` détecte → modal passe en `success` ou `error`

**Résultat** : Une notification dans la cloche = une action **confirmée par n8n**. Zéro notification prématurée.

---

## 📅 JOURNAL — 2026-02-20 (suite)

### Fix — Ordre inversé popup "en cours" / popup vert (ConvertirCandidatModal)

**Symptôme** : Le popup vert "Candidat créé" apparaissait AVANT le popup "Conversion en cours..." — ordre inversé. Sans wait n8n : popup vert en flash puis spinner. Avec wait : spinner visible mais popup vert jamais affiché.

**Cause racine** : `setActionStatus('pending')` était appelé **après** le `await fetch` (ligne 209). Si n8n répond rapidement, le callback SSE `action_completed` arrivait pendant ou juste après la réponse HTTP. React batchifiait alors `setActionStatus('pending')` et `setActionStatus('success')` dans le même cycle de rendu → ne rendait que `success`, sautant `pending` complètement.

**Fix appliqué** : Déplacement de `setActionStatus('pending')` **avant** le `await fetch`. React rend d'abord le spinner, puis quand le SSE arrive, passe à `success`. Ajout de `setActionStatus('idle')` dans les branches erreur/409 pour revenir au formulaire si l'envoi échoue.

**Fichier modifié** : `src/components/admin/ConvertirCandidatModal.tsx`

**Séquence correcte après fix** : Formulaire → Spinner "en cours" → Popup vert "Candidat créé" → Éjection prospect + compteur + notification cloche ✅

---

## 📅 JOURNAL — 2026-02-20

### Fix — Popup succès invisible après callback n8n (ConvertirCandidatModal)

**Symptôme** : Après callback n8n confirmant la conversion, le popup "Candidat converti avec succès" n'apparaissait jamais. Les logs montraient pourtant que le callback était bien reçu et `onCallback('success')` appelé.

**Cause racine** : `ProspectDetailPanel.handleConversionSuccess` appelait immédiatement `onProspectConverti(id)` + `onClose()` dès réception du succès. Cela déclenchait `setSelectedProspectId(null)` dans le parent (`ProspectsPageClient`), ce qui démontait le panel — et par effet de cascade, le modal `ConvertirCandidatModal`. React ignorait alors silencieusement le `setActionStatus('success')` exécuté sur un composant démonté.

**Fix appliqué** : Ajout d'un `setTimeout` de 5500ms dans `handleConversionSuccess` — légèrement supérieur aux 5000ms d'auto-fermeture du modal — pour laisser le temps au modal d'afficher et fermer le popup succès avant de démonter le panel.

```typescript
// ProspectDetailPanel.tsx
const handleConversionSuccess = () => {
  setTimeout(() => {
    if (onProspectConverti) onProspectConverti(prospectId)
    onClose()
  }, 5500)
}
```

**Fichier modifié** : `src/components/admin/ProspectDetailPanel.tsx`
**Commit** : `4e4a70e` — `fix: ajout délai 5500ms dans handleConversionSuccess pour laisser le popup succès s'afficher`

---

### Architecture T2 — Clarification notification cloche

**Question** : Pourquoi la notification ne remonte pas dans la cloche après une action réussie ?

**Réponse** : C'est voulu. En T2, le CRM n'écrit **plus** de notification en BDD lors du déclenchement d'une action. Le popup résultat (modal) est géré via SSE + `correlationId` directement. La notification dans la cloche doit être créée par **n8n** via un POST vers `/api/notifications/ingest` en fin de workflow.

**Node n8n à ajouter** dans chaque workflow, après le node `✅ Callback Success` :

```json
{
  "name": "🔔 Notification Cloche",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://crm.abj.fr/api/notifications/ingest",
    "headers": {
      "X-API-Key": "{{ $env.CRM_API_KEY }}"
    },
    "body": {
      "sourceAgent": "marjorie",
      "categorie": "CANDIDAT",
      "type": "CONVERSION_REUSSIE",
      "priorite": "NORMALE",
      "titre": "Candidat converti avec succès",
      "message": "Le prospect {{ $json.prenom }} {{ $json.nom }} a été converti en candidat.",
      "audience": "ADMIN",
      "lienAction": "/admin/candidats"
    }
  }
}
```

**Principe** : Une notification dans la cloche = une action **confirmée par n8n**. C'est le rôle de n8n de créer cette notification, pas du CRM.

---

### Fix — Race condition popup pending/success (use-callback-listener)

**Symptôme** : Le popup "en cours..." apparaissait une fraction de seconde APRÈS le popup "succès", ou n'apparaissait pas du tout. L'ordre logique (pending → success) était inversé visuellement.

**Cause racine** : `useCallbackListener` connecte le SSE dès le montage du modal, avant même la soumission. Si n8n répond très vite, `setActionStatus('pending')` et `setActionStatus('success')` arrivent dans le même cycle de rendu React — React les batchifie et ne rend que le dernier état (`success`), sautant `pending` complètement.

**Fix appliqué** : Ajout d'un `setTimeout(0)` dans `use-callback-listener.ts` autour de l'appel `onCallbackRef.current`. Ce délai nul sort le callback du cycle de rendu courant, garantissant que React a le temps de rendre `pending` avant de traiter `success`/`error`.

```typescript
// use-callback-listener.ts — avant
cleanup()
onCallbackRef.current(status, data)

// après
cleanup()
setTimeout(() => {
  onCallbackRef.current(status, data)
}, 0)
```

**Fichier modifié** : `src/hooks/use-callback-listener.ts`

---

### Fix — Compteur "Total prospects" figé après conversion

**Symptôme** : Après conversion d'un prospect en candidat, la ligne disparaissait bien de la liste, mais la card "Total prospects : 3" restait à 3 au lieu de passer à 2.

**Cause racine** : La card "Total prospects" était rendue dans `ProspectsPage` (Server Component). La valeur `{total}` était calculée une seule fois au chargement de la page et ne pouvait pas réagir aux changements d'état gérés côté client dans `ProspectsPageClient`.

**Fix appliqué** :
- Déplacement de la card "Total prospects" depuis le Server Component vers `ProspectsPageClient`
- Compteur calculé dynamiquement depuis la liste locale : `initialTotal - (initialProspects.length - prospects.length)`
- Chaque appel à `handleProspectConverti` filtre la liste → `prospects.length` diminue → `total` se décrémente automatiquement

```typescript
// ProspectsPageClient.tsx
const total = initialTotal - (initialProspects.length - prospects.length)
```

**Fichiers modifiés** : `src/components/admin/ProspectsPageClient.tsx`, `src/app/admin/prospects/page.tsx`
**Commit** : `3eea377` — `fix: race condition popup pending/success + compteur prospects réactif`

---

## 📅 JOURNAL — 2026-02-21

### T3 — Branchement formulaire "Nouveau prospect" → n8n

**But** : Relier le bouton "Créer le prospect" du formulaire `/admin/prospects/nouveau` à Marjorie via n8n. Avant ce changement, le `handleSubmit()` était un faux `setTimeout` de 1.5s qui ne faisait rien.

**Flux implémenté** : CRM → `POST /api/prospects/creer` → webhook n8n `/prospect/creer` → Marjorie crée le prospect en BDD et gère le suivi.

**Actions mises en œuvre** :

- `src/lib/webhook-client.ts` : ajout de `prospectWebhooks.creerProspect()` qui appelle le chemin `/prospect/creer` sur n8n. Le payload inclut `sourceOrigine: "CRM_ADMIN"` pour distinguer une création manuelle admin d'un email entrant.

- `src/app/api/prospects/creer/route.ts` *(nouveau fichier)* : route `POST` Fire-and-Forget (pattern identique à `convertir-candidat`). Valide les 5 champs obligatoires (nom, prenom, email, telephone, formationPrincipale). Crée un verrou `ConversionEnCours` avec `typeAction: 'CREER_PROSPECT'` avant de lancer le webhook. Retourne `202 Accepted` immédiatement. Si le webhook échoue, le verrou passe à `ERREUR` et l'exception est loggée en `JournalErreur`.

- `src/app/admin/prospects/nouveau/page.tsx` : suppression du `setTimeout` fictif. `handleSubmit()` appelle désormais `fetch('POST /api/prospects/creer')` avec le mapping des champs (`code_postal` → `codePostal`, `formation_souhaitee` → `formationPrincipale`, `financement` → `modeFinancement`). Sur `response.ok` → message vert + redirection vers `/admin/prospects` après 1.5s. Sur erreur → message rouge affiché, bouton réactivé, pas de redirection.

**Commit** : `45bc849` — `feat: branchement formulaire nouveau prospect vers n8n via Marjorie`

---

## 📅 JOURNAL — 2026-02-21 (suite)

### T4 — Câblage bulle flottante Marjorie → chat conversationnel réel

**But** : Relier la bulle flottante (bas droite) à un vrai chat avec historique, bulles de messages et envoi réel vers n8n. Avant ce changement, `handleSendMessage()` était un faux `setTimeout` + `alert()` qui ne faisait rien.

**Flux implémenté** : Bulle → bannière chat → `useMarjorieChat()` → `POST /api/marjorie/chat` → webhook n8n `marjorie-chat` → agent IA → réponse JSON `{ reply, suggestions }` → bulle Marjorie dans le chat.

**Actions mises en œuvre** :

- `src/components/shared/marjorie-chat-banner.tsx` *(nouveau fichier)* : composant bannière pleine largeur (420px). Affiche l'historique de conversation sous forme de bulles scrollables (or = user, gris = Marjorie). Message de bienvenue automatique à l'ouverture. Indicateur typing (3 points animés) pendant l'attente de réponse. Bouton corbeille pour effacer la conversation. Support des suggestions cliquables retournées par n8n. Entrée pour envoyer, Shift+Entrée pour nouvelle ligne. Utilise le hook `useMarjorieChat()` déjà existant.

- `src/components/layout/dashboard-layout.tsx` : suppression du faux `handleSendMessage()` et de l'état `marjorieMessage`. Remplacement du bloc JSX bannière (78 lignes) par `<MarjorieChatBanner onClose={...} />`. Import du nouveau composant.

- `.env.local` : ajout de `N8N_MARJORIE_CHAT_WEBHOOK_URL=http://localhost:5678/webhook/marjorie-chat` (à adapter au chemin réel du workflow n8n de l'agent).

**Format réponse attendu côté n8n** :
```json
{ "reply": "Voici ce que j'ai fait...", "suggestions": ["Voir le candidat"] }
```
Le champ `suggestions` est optionnel — s'il est présent, des boutons cliquables apparaissent sous la réponse pour enchaîner rapidement.

**Commit** : `1a0cb31` — `feat: câblage bulle Marjorie → chat conversationnel réel avec historique et typing indicator`

---

## 📅 JOURNAL — 2026-02-21 (suite 2)

### T5 — Pattern callback SSE sur formulaire "Nouveau prospect"

**But** : Ajouter la confirmation réelle de n8n sur le formulaire `/admin/prospects/nouveau`. Avant ce changement, le succès était affiché dès que l'API répondait `202` — sans attendre que Marjorie ait réellement créé le prospect.

**Flux implémenté** : Clic "Créer le prospect" → popup spinner "Création en cours…" → webhook n8n traite → callback SSE avec `correlationId` → popup succès + reset formulaire (prêt pour saisie suivante). Timeout 50s → popup erreur si n8n ne répond pas.

**Même pattern que `ConvertirCandidatModal`** pour la cohérence du comportement utilisateur.

**Actions mises en œuvre** :

- `src/app/admin/prospects/nouveau/page.tsx` : refactoré pour utiliser `useCallbackListener`. `correlationId = useRef(crypto.randomUUID())` généré au montage. `setActionStatus('pending')` placé **avant** le `await fetch` (fix race condition). Trois popups overlay distincts : spinner doré (`pending`), vert (`success`), rouge (`error`). Après succès : **reset formulaire** vers les valeurs vides (pas de redirection) + regénération du `correlationId` pour permettre la saisie en série (ex : 10 prospects saisis à la volée lors d'une journée portes ouvertes). Timeout 50s avant popup erreur automatique.

- `src/app/api/prospects/creer/route.ts` : accepte et transmet le champ `correlationId` dans le payload envoyé à n8n.

- `src/lib/webhook-client.ts` : signature de `creerProspect()` étendue avec `correlationId?: string`.

**Commit** : `7bc0c21` — `feat: branchement formulaire nouveau prospect vers n8n via callback SSE`

---

## 📅 JOURNAL — 2026-02-21 (suite 3)

### Fix — Contrainte FK bloquant la création de prospect (conversions_en_cours)

**Symptôme** : Le formulaire `/admin/prospects/nouveau` retournait une erreur 500 au clic sur "Créer le prospect". L'endpoint `/api/prospects/creer` échouait dès la création du verrou `ConversionEnCours`.

**Cause racine** : Le modèle `ConversionEnCours` avait une relation Prisma `@relation` vers `Prospect` sur le champ `idProspect`. PostgreSQL imposait donc une contrainte FK — `conversions_en_cours.id_prospect` devait référencer un `prospects.id_prospect` existant. Or pour `CREER_PROSPECT`, le prospect **n'existe pas encore** en BDD au moment de l'envoi : c'est Marjorie qui le crée côté n8n. L'ID temporaire `creer-email@x.fr-1234567890` provoquait une violation de clé étrangère.

**Fix appliqué** :
- `prisma/schema.prisma` : suppression de la relation `prospect Prospect @relation(...)` sur `ConversionEnCours` et retrait de `conversionsEnCours ConversionEnCours[]` sur `Prospect`. Le champ `idProspect` reste en tant que simple `String` libre, sans contrainte FK.
- `src/app/api/prospects/conversion-complete/route.ts` : retrait de l'`include: { prospect: ... }` rendu invalide par la suppression de la relation. Le nom du prospect dans les messages de notification utilise désormais `conversion.idProspect` directement.
- BDD synchronisée via `npx prisma db push` (le migrate dev échoue sur la shadow database en raison d'une vieille migration, db push s'applique directement).

**Commit** : `6de779a` — `fix: suppression FK conversions_en_cours → prospects pour permettre CREER_PROSPECT`

---

## 📅 JOURNAL — 2026-02-21 (suite 4)

### Fix — creerProspect envoyait sur un chemin webhook inexistant en prod

**Symptôme** : Le formulaire `/admin/prospects/nouveau` retournait 500 en prod. Le webhook `/prospect/creer` n'existait pas dans n8n.

**Cause racine** : `creerProspect()` dans `webhook-client.ts` appelait `callWebhook('/prospect/creer', data)` — un chemin dédié qui n'a jamais été créé côté n8n. Toutes les autres actions (CONVERTIR_CANDIDAT, ENVOYER_EMAIL, etc.) passent par le dispatcher unique `/crm-action` avec un champ `actionType` dans le payload, routé par un Switch n8n.

**Fix appliqué** :
- `src/lib/webhook-client.ts` : `creerProspect()` appelle désormais `callWebhook('/crm-action', { actionType: 'CREER_PROSPECT', ...data })` — aligné sur le même dispatcher que toutes les autres actions.

**Commit** : `85b8a9d` — `fix: aligner creerProspect sur le dispatcher /crm-action avec actionType`

---

## 📅 JOURNAL — 2026-02-21 (suite 5)

### Fix — Popups succès sans fermeture + blocage UI formulaire nouveau prospect

**Symptôme 1** : Sur les modals EnvoyerDossier, GenererDevis et EnvoyerEmail, le popup vert de succès s'affichait mais ne se fermait jamais — l'utilisateur devait cliquer manuellement pour sortir.

**Cause** : Les handlers `handleEnvoiDossierSuccess`, `handleGenererDevisSuccess`, `handleEnvoyerEmailSuccess` dans `ProspectDetailPanel` rechargaient les données du prospect mais n'appelaient jamais `setShowXxxModal(false)`.

**Fix** : Ajout d'un `setTimeout(() => setShowXxxModal(false), 1500)` dans chaque handler — 1.5s pour laisser le popup vert visible avant fermeture automatique.

---

**Symptôme 2** : Sur le formulaire `/admin/prospects/nouveau`, le popup "Création en cours…" s'affichait en overlay `fixed inset-0` avec `backdrop-blur-sm` — bloquant toute interaction sur la page. Si n8n ne répondait pas, l'utilisateur était bloqué sans échappatoire.

**Cause** : Les 3 popups (pending/success/error) étaient rendus en inline `{actionStatus === 'pending' && (...)}` à l'intérieur du `return` principal — le formulaire continuait d'exister derrière l'overlay.

**Fix** : Remplacement par des `return` anticipés (pattern identique à `ConvertirCandidatModal`) — quand `actionStatus !== 'idle'`, le composant retourne uniquement le popup, le formulaire n'est plus rendu du tout. Suppression des `disabled={actionStatus === 'pending'}` devenus inutiles sur les boutons.

**Fichiers modifiés** : `src/components/admin/ProspectDetailPanel.tsx`, `src/app/admin/prospects/nouveau/page.tsx`
**Commit** : `96ccba5` — `fix: fermeture auto popups succès + suppression blocage formulaire nouveau prospect`

---

## 📅 JOURNAL — 2026-02-21 (suite 6)

### Fix — Nouveau prospect créé non visible sans F5

**Symptôme** : Après création d'un prospect via le formulaire, le prospect n'apparaissait pas dans la liste `/admin/prospects` sans recharger manuellement la page (F5 ou navigation vers un autre onglet puis retour).

**Cause** : La page Prospects est un Server Component — ses données sont chargées une seule fois au rendu initial. Quand Marjorie crée le prospect côté n8n, le CRM n'est pas notifié et la liste reste figée.

**Fix** : Ajout de `router.refresh()` dans le callback SSE de succès, juste après le reset du formulaire. Next.js revalide silencieusement les Server Components en arrière-plan sans changer de page ni interrompre la saisie. Le prospect apparaît dans la liste dès que l'utilisateur y retourne, sans aucune action manuelle.

```typescript
if (status === 'success') {
  setFormData(FORM_INITIAL_STATE)
  correlationId.current = crypto.randomUUID()
  router.refresh() // ← revalide la liste prospects en arrière-plan
  setTimeout(() => setActionStatus('idle'), 3000)
}
```

**Fichier modifié** : `src/app/admin/prospects/nouveau/page.tsx`
**Commit** : `c3efc75` — `fix: router.refresh() après succès création prospect — liste mise à jour sans F5`

---

## 🔄 EN COURS / À FAIRE

*(Aucune tâche en cours)*

---

## 📋 BACKLOG

*(Tâches identifiées, non planifiées)*

- Connexion page Planning à la BDD (remplacer MOCK_SESSIONS, MOCK_EVENEMENTS, MOCK_DISPONIBILITES)
- Fonctionnalité "Télécharger planning" (export PDF)
- Notifications desktop (Web Push API)
- Purge automatique des vieilles notifications lues

---

## 📐 ARCHITECTURE — Webhooks CRM ↔ n8n

### Deux webhooks distincts et indépendants

Le CRM communique avec n8n via **deux webhooks séparés**, chacun avec un rôle précis.

#### Webhook 1 — Dispatcher actions directes
**Endpoint CRM** : `POST /api/actions/trigger`
**Cible n8n** : `N8N_WEBHOOK_BASE_URL` + chemin spécifique par type d'action

Toutes les actions métier déclenchées depuis les modals du CRM (envoyer devis, convertir candidat, envoyer email, demander document, etc.) arrivent sur ce webhook. Le payload contient un champ `actionType` qui permet à un Switch node n8n de router vers le bon agent spécialisé.

```
CRM /api/actions/trigger
        ↓
n8n /webhook/crm-dispatcher
        Switch sur actionType
        ├─→ Agent "Envoyer devis"
        ├─→ Agent "Convertir candidat"
        ├─→ Agent "Envoyer email"
        └─→ etc.
```

Le callback de confirmation retourne via `POST /api/webhook/callback` avec le `correlationId` — ce qui déclenche le popup succès/erreur dans le modal côté CRM.

#### Webhook 2 — Chat Marjorie (conversationnel)
**Endpoint CRM** : `POST /api/marjorie/chat`
**Cible n8n** : `N8N_MARJORIE_CHAT_WEBHOOK_URL` = `/webhook/marjorie-chat`

Le chat conversationnel de la bulle flottante utilise ce webhook **séparé**. Le payload contient `{ userId, userRole, message, conversationHistory }`. n8n retourne une réponse synchrone `{ reply, suggestions }` affichée directement dans la bulle de chat.

```
CRM /api/marjorie/chat
        ↓
n8n /webhook/marjorie-chat
        Agent conversationnel (mémoire longue, rôle adaptatif)
        ↓
{ "reply": "...", "suggestions": ["..."] }
```

### Résumé

| | Webhook dispatcher | Webhook chat |
|---|---|---|
| **Endpoint CRM** | `/api/actions/trigger` | `/api/marjorie/chat` |
| **Chemin n8n** | `/webhook/crm-dispatcher` | `/webhook/marjorie-chat` |
| **Mode** | Fire-and-Forget + callback SSE | Requête/réponse synchrone |
| **Retour** | Via `POST /api/webhook/callback` (correlationId) | JSON direct dans la réponse HTTP |
| **Usage** | Actions métier (modals) | Chat conversationnel (bulle) |

---

**Légende** :
- ✅ Terminé et committé
- 🔄 En cours ou prêt à démarrer
- 📋 Backlog (identifié, pas encore planifié)

---

## Journal de session — 2026-02-22

### T8 — Reset et seed réaliste prospects / candidats / élèves

**But** : Remplacer les anciennes données de test par un dataset cohérent avec les nouvelles tables.

**Actions** :
- Suppression des données existantes dans l'ordre FK
- Création de **39 prospects** : 27 visibles page Prospects (NOUVEAU, EN_ATTENTE_DOSSIER, ANCIEN_CANDIDAT, ANCIEN_ELEVE), 12 masqués (CANDIDAT, ELEVE)
- Création de **10 candidats actifs** avec pipeline varié (DOSSIER_EN_COURS → ACCEPTE)
- Création de **10 élèves** : 7 EN_COURS, 2 TERMINE, 1 ABANDONNE
- 20 évaluations et 44 présences créées

**Script** : `scripts/reset-seed-prospects-candidats.ts`
**Commit** : `1856942`

---

### T9 — Mini-formulaire validation étapes parcours candidat

**But** : Permettre à l'admin de valider manuellement chaque étape du parcours d'admission depuis le modal candidat.

**Actions** :
- Ajout de **8 champs** dans `prisma/schema.prisma` : `valideParXxx` + `observationXxx` pour les 4 étapes
- Création de **`ValiderEtapeModal.tsx`** : popup avec date (auto = aujourd'hui), validateur (requis), observation (optionnel), succès 4s puis fermeture auto
- Pattern : appel direct POST `/api/candidats/valider-etape` (pas via `/api/actions/trigger`), n8n notifié en fire-and-forget pour la cloche
- Onglet Parcours : affiche validateur + observation quand étape déjà validée
- `npx tsc --noEmit` : 0 erreurs TypeScript

**Fichiers** : `ValiderEtapeModal.tsx` *(nouveau)*, `CandidatDetailModal.tsx`, `/api/candidats/valider-etape/route.ts`, `/api/candidats/[id]/route.ts`, `prisma/schema.prisma`
**Commit** : `aa579b3`

---

### T10 — Bouton Exempter sur étapes parcours candidat

**But** : Permettre à l'admin d'exempter une étape (sans la passer physiquement) avec une valeur fonctionnelle identique à "Validé" mais un badge distinct.

**Contexte** : Certains candidats n'ont pas besoin de passer toutes les étapes (ex : candidat déjà connu, profil évident). L'exemption marque l'étape comme faite sans créer de procédure formelle.

**Actions** :
- Ajout de **4 champs** dans `prisma/schema.prisma` : `exemptEntretienTelephonique`, `exemptRdvPresentiel`, `exemptTestTechnique`, `exemptValidationPedagogique` (Boolean, default false)
- BDD synchronisée via `npx prisma db push`
- Route `/api/candidats/valider-etape` : accepte `exempt: boolean` — quand `true`, pose `booleen=true` + `exemptXxx=true` simultanément
- Route GET `/api/candidats/[id]` : retourne les 4 champs `exempt_xxx` dans la réponse
- `CandidatDetailModal` : bouton **"Exempter"** (orange, bordure warning) côte à côte avec "Valider" sur chaque étape non faite. Click = appel API direct sans modal (pas de popup intermédiaire). Badge **"Exempté"** orange distinct du badge vert "Validée". Icône CheckCircle orange au lieu de vert quand exempté. État `disabled` pendant l'appel avec indicateur `...`
- `npx tsc --noEmit` : 0 erreurs TypeScript

**Fichiers** : `prisma/schema.prisma`, `CandidatDetailModal.tsx`, `/api/candidats/valider-etape/route.ts`, `/api/candidats/[id]/route.ts`
**Commit** : `0ecbca6`
