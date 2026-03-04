---
name: n8n-debug
description: Guide de débogage rapide pour les intégrations n8n / Marjorie. Utiliser quand un webhook ne fonctionne pas, qu'un candidat ou élève n'est pas créé, ou qu'une notification n'arrive pas.
---

# Débogage n8n — Guide Rapide ABJ

## Étapes de débogage dans l'ordre

### 1. Consulter journal_erreurs

```bash
npx tsx scripts/check-db-state.ts
```

Ou requête directe :
```bash
npx prisma studio
# Ouvrir table journal_erreurs → trier par date_erreur DESC
```

### 2. Vérifier les variables d'environnement

Fichier `.env.local` doit contenir :
```env
N8N_WEBHOOK_URL=https://...
N8N_SECRET=...
NOTIFICATIONS_API_KEY=...
```

### 3. Tester les endpoints manuellement

```bash
# Tester le webhook callback
curl -X POST http://localhost:3000/api/webhook/callback \
  -H "Content-Type: application/json" \
  -H "x-n8n-signature: [N8N_SECRET]" \
  -d '{"type":"candidat_created","numero_dossier":"TEST001"}'

# Tester l'ingestion de notification
curl -X POST http://localhost:3000/api/notifications/ingest \
  -H "Content-Type: application/json" \
  -H "X-API-Key: [NOTIFICATIONS_API_KEY]" \
  -d '{"sourceAgent":"test","categorie":"SYSTEM","type":"TEST","titre":"Test","message":"Message test","audience":"ADMIN"}'
```

### 4. Vérifier les notifications

```bash
npx tsx scripts/check-notifications.ts
npx tsx scripts/send-notification-admin.ts 1
```

### 5. Vérifier le SSE en temps réel

Ouvrir dans le navigateur :
```
http://localhost:3000/api/notifications/stream
```
Doit afficher du texte SSE en continu.

---

## Erreurs courantes

| Erreur | Cause probable | Solution |
|--------|---------------|---------|
| `401 Unauthorized` webhook | Mauvaise signature | Vérifier `N8N_SECRET` |
| `401` sur `/api/notifications` | Middleware bloque | Vérifier `publicRoutes` dans `middleware.ts` |
| Candidat non créé | Webhook callback non appelé | Vérifier workflow n8n `abj_createur_dossier` |
| Élève non créé | `eleve_created` non géré | Vérifier `src/app/api/webhook/callback/route.ts` |
| Notification non reçue | API Key incorrecte | Vérifier `NOTIFICATIONS_API_KEY` |
| SSE déconnecté | Problème réseau | Le hook reconnecte auto après 5s |
| `resteACharge` incorrect | `null` interprété comme `0` | Utiliser `?? (montantTotal - montantPEC)` |

---

## Flow complet : prospect → candidat → élève

```
1. Email/formulaire reçu par n8n
   ↓
2. Workflow abj_createur_dossier
   → INSERT prospects (statutProspect: 'CANDIDAT')
   → INSERT candidats (statutDossier: 'RECU')
   ↓
3. POST /api/webhook/callback {type: "candidat_created"}
   → Création placeholders documents requis
   ↓
4. POST /api/notifications/ingest (notification admin)
   → SSE broadcast → badge cloche mis à jour
   ↓
5. [Pipeline...] Candidat passe à INSCRIT
   ↓
6. POST /api/webhook/callback {type: "eleve_created"}
   → INSERT eleves
   → UPDATE statutProspect → 'ELEVE'
   ↓
7. Candidat masqué de la liste (notIn: ['INSCRIT', 'CONVERTI'])
   Prospect masqué de la liste (notIn: ['CANDIDAT', 'ELEVE'])
```

---

## Scripts de test disponibles

```bash
npx tsx scripts/send-notification-admin.ts 1    # Une notif admin
npx tsx scripts/send-notification-admin.ts 2    # Plusieurs notifs
npx tsx scripts/send-notification-formateur.ts  # Notifs formateur
npx tsx scripts/send-notification-eleve.ts      # Notifs élève
npx tsx scripts/test-sse-system.ts              # Test système SSE complet
npx tsx scripts/check-notifications.ts          # Vérifier BDD
npx tsx scripts/test-dashboard-counts.ts        # Vérifier compteurs
```
