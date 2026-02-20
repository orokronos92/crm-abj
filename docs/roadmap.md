# Roadmap CRM ABJ — Tâches en cours et à venir

**Dernière mise à jour** : 2026-02-20

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

## 🔄 EN COURS / À FAIRE

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

**Statut** : Décision architecturale prise, implémentation à planifier

---

## 📋 BACKLOG

*(Tâches identifiées, non planifiées)*

- Connexion page Planning à la BDD (remplacer MOCK_SESSIONS, MOCK_EVENEMENTS, MOCK_DISPONIBILITES)
- Fonctionnalité "Télécharger planning" (export PDF)
- Notifications desktop (Web Push API)
- Purge automatique des vieilles notifications lues

---

**Légende** :
- ✅ Terminé et committé
- 🔄 En cours ou prêt à démarrer
- 📋 Backlog (identifié, pas encore planifié)
