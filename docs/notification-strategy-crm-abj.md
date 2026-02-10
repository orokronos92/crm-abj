# 🔔 Stratégie de Notifications — CRM ABJ ↔ Agents IA n8n

## Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                     AGENTS IA (n8n)                          │
│  Marjorie · Morrigan · Futurs agents                        │
│                                                              │
│  Événements détectés:                                        │
│  - Nouveau prospect collecté                                 │
│  - Dossier candidat créé/mis à jour                         │
│  - Devis généré et envoyé                                    │
│  - Document reçu/validé/refusé                              │
│  - Email important détecté                                   │
│  - Erreur workflow                                           │
│  - Relance nécessaire                                        │
│  - Alerte financement                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                   WEBHOOK POST
              /api/notifications/ingest
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              TABLE notifications (PostgreSQL)                 │
│                                                              │
│  Stockage persistant + métadonnées de routage                │
│  - Qui reçoit ? (audience cible)                            │
│  - Quelle priorité ?                                         │
│  - Quelle action requise ?                                   │
│  - Lien vers l'entité concernée                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                  SSE (Server-Sent Events)
              /api/notifications/stream
                       │
              ┌────────┼────────┐
              ▼        ▼        ▼
          ┌──────┐ ┌──────┐ ┌──────┐
          │ADMIN │ │PROF  │ │ÉLÈVE │
          │ UI   │ │ UI   │ │ UI   │
          └──────┘ └──────┘ └──────┘
              │        │        │
              └────────┼────────┘
                       │
              Actions CRM → n8n
              (webhooks retour)
```

---

## 1. Modèle de Données — Tables Prisma à ajouter

### Table principale : `Notification`

```prisma
/// Système centralisé de notifications CRM ↔ Agents IA
model Notification {
  idNotification     Int       @id @default(autoincrement()) @map("id_notification")
  
  // === SOURCE ===
  sourceAgent        String    @map("source_agent")       // "marjorie" | "morrigan" | "system" | "admin"
  sourceWorkflow     String?   @map("source_workflow")     // ID ou nom du workflow n8n
  sourceExecutionId  String?   @map("source_execution_id") // ID d'exécution n8n pour traçabilité
  
  // === CONTENU ===
  categorie          String    // PROSPECT | CANDIDAT | DEVIS | DOCUMENT | EMAIL | PLANNING | EVALUATION | FINANCE | SYSTEM | ALERTE
  type               String    // Ex: "NOUVEAU_PROSPECT" | "DEVIS_ENVOYE" | "DOCUMENT_RECU" | "ERREUR_WORKFLOW" etc.
  priorite           String    @default("NORMALE") // BASSE | NORMALE | HAUTE | URGENTE
  titre              String    // Titre court affiché dans la cloche
  message            String    // Description détaillée
  icone              String?   // Emoji ou code icône pour l'UI
  couleur            String?   // Code couleur selon catégorie
  
  // === CIBLAGE (qui voit cette notification) ===
  audience           String    @default("ADMIN") // TOUS | ADMIN | FORMATEUR | ELEVE | SPECIFIQUE
  idUtilisateurCible Int?      @map("id_utilisateur_cible") // Si audience = SPECIFIQUE
  idFormateurCible   Int?      @map("id_formateur_cible")   // Notification pour un formateur précis
  idEleveCible       Int?      @map("id_eleve_cible")       // Notification pour un élève précis
  
  // === ENTITÉ LIÉE (navigation deep-link) ===
  entiteType         String?   @map("entite_type")  // "prospect" | "candidat" | "document" | "session" | "evaluation"
  entiteId           String?   @map("entite_id")    // ID de l'entité pour construire le lien
  lienAction         String?   @map("lien_action")  // URL relative directe ex: "/admin/candidats/JURI102025"
  
  // === ACTION REQUISE ===
  actionRequise      Boolean   @default(false) @map("action_requise")
  typeAction         String?   @map("type_action")      // "VALIDER" | "RELANCER" | "CORRIGER" | "DECIDER" | "VERIFIER"
  actionEffectuee    Boolean   @default(false) @map("action_effectuee")
  dateAction         DateTime? @map("date_action") @db.Timestamptz(6)
  actionPar          Int?      @map("action_par")       // idUtilisateur qui a agi
  resultatAction     String?   @map("resultat_action")  // Résultat de l'action (JSON ou texte)
  
  // === STATUT LECTURE ===
  lue                Boolean   @default(false)
  dateLecture        DateTime? @map("date_lecture") @db.Timestamptz(6)
  archivee           Boolean   @default(false)
  dateArchivage      DateTime? @map("date_archivage") @db.Timestamptz(6)
  
  // === MÉTADONNÉES ===
  metadonnees        Json?     // Données additionnelles libres (contexte IA, scores, etc.)
  expirationDate     DateTime? @map("expiration_date") @db.Timestamptz(6) // Auto-archive après cette date
  
  // === TRAÇABILITÉ ===
  creeLe             DateTime  @default(now()) @map("cree_le") @db.Timestamptz(6)
  modifieLe          DateTime  @default(now()) @updatedAt @map("modifie_le") @db.Timestamptz(6)
  
  // === RELATIONS ===
  utilisateurCible   Utilisateur? @relation("NotificationsRecues", fields: [idUtilisateurCible], references: [idUtilisateur])
  actionParUtilisateur Utilisateur? @relation("NotificationsTraitees", fields: [actionPar], references: [idUtilisateur])
  lecturesUtilisateurs NotificationLecture[]

  @@index([audience])
  @@index([categorie])
  @@index([priorite])
  @@index([lue])
  @@index([actionRequise, actionEffectuee])
  @@index([idUtilisateurCible])
  @@index([idEleveCible])
  @@index([idFormateurCible])
  @@index([creeLe(sort: Desc)])
  @@index([entiteType, entiteId])
  @@map("notifications")
}

/// Suivi de lecture par utilisateur (pour notifications collectives)
/// Quand audience = TOUS/ADMIN/FORMATEUR/ELEVE, chaque user a son propre état de lecture
model NotificationLecture {
  idLecture          Int       @id @default(autoincrement()) @map("id_lecture")
  idNotification     Int       @map("id_notification")
  idUtilisateur      Int       @map("id_utilisateur")
  lue                Boolean   @default(false)
  dateLecture        DateTime? @map("date_lecture") @db.Timestamptz(6)
  archivee           Boolean   @default(false)
  dateArchivage      DateTime? @map("date_archivage") @db.Timestamptz(6)
  
  notification       Notification @relation(fields: [idNotification], references: [idNotification], onDelete: Cascade)
  utilisateur        Utilisateur  @relation(fields: [idUtilisateur], references: [idUtilisateur])
  
  @@unique([idNotification, idUtilisateur])
  @@index([idUtilisateur, lue])
  @@map("notifications_lectures")
}

/// Préférences de notification par utilisateur
model PreferenceNotification {
  idPreference       Int       @id @default(autoincrement()) @map("id_preference")
  idUtilisateur      Int       @map("id_utilisateur")
  categorie          String    // Catégorie de notification
  activee            Boolean   @default(true)
  emailActivee       Boolean   @default(false) @map("email_activee")  // Aussi par email ?
  prioriteMinimale   String    @default("BASSE") @map("priorite_minimale") // Filtre par priorité
  
  utilisateur        Utilisateur @relation(fields: [idUtilisateur], references: [idUtilisateur])
  
  @@unique([idUtilisateur, categorie])
  @@map("preferences_notifications")
}
```

### Relations à ajouter dans le modèle Utilisateur existant

```prisma
model Utilisateur {
  // ... champs existants ...
  
  // AJOUTER ces relations :
  notificationsRecues    Notification[] @relation("NotificationsRecues")
  notificationsTraitees  Notification[] @relation("NotificationsTraitees")
  lecturesNotifications  NotificationLecture[]
  preferencesNotifications PreferenceNotification[]
}
```

---

## 2. Catalogue des Types de Notifications

### Par catégorie et audience

| Catégorie | Type | Titre exemple | Audience | Priorité | Action requise |
|-----------|------|---------------|----------|----------|---------------|
| **PROSPECT** | `NOUVEAU_PROSPECT` | "Nouveau prospect : Sophie Martin" | ADMIN | NORMALE | Non |
| **PROSPECT** | `PROSPECTS_SEMAINE` | "3 nouveaux prospects cette semaine" | ADMIN | BASSE | Non |
| **PROSPECT** | `PROSPECT_CHAUD` | "Prospect chaud — relance recommandée" | ADMIN | HAUTE | Oui: RELANCER |
| **PROSPECT** | `PROSPECT_INACTIF` | "5 prospects sans nouvelles depuis 14j" | ADMIN | NORMALE | Oui: RELANCER |
| **CANDIDAT** | `DOSSIER_CREE` | "Dossier JURI102025 créé par Marjorie" | ADMIN | NORMALE | Oui: VERIFIER |
| **CANDIDAT** | `DOSSIER_COMPLET` | "Dossier complet — prêt pour validation" | ADMIN | HAUTE | Oui: VALIDER |
| **CANDIDAT** | `DOSSIER_INCOMPLET` | "Documents manquants pour DUMI1509" | ADMIN | NORMALE | Oui: RELANCER |
| **CANDIDAT** | `ENTRETIEN_PLANIFIE` | "Entretien planifié le 15/02 avec X" | ADMIN + FORMATEUR | NORMALE | Non |
| **DEVIS** | `DEVIS_ENVOYE` | "Devis envoyé : 8 400€ CAP ATBJ" | ADMIN | NORMALE | Non |
| **DEVIS** | `DEVIS_SIGNE` | "Devis signé par Juliette Rimbo !" | ADMIN | HAUTE | Non |
| **DEVIS** | `DEVIS_EXPIRE` | "Devis non signé depuis 14j" | ADMIN | HAUTE | Oui: RELANCER |
| **DEVIS** | `DEMANDE_ANNULEE` | "Demande annulée — devis déjà envoyé" | ADMIN | NORMALE | Non |
| **DOCUMENT** | `DOCUMENT_RECU` | "CV reçu pour JURI102025" | ADMIN | BASSE | Non |
| **DOCUMENT** | `DOCUMENT_VALIDE` | "Pièce d'identité validée" | ADMIN + ELEVE | BASSE | Non |
| **DOCUMENT** | `DOCUMENT_REFUSE` | "Document refusé : qualité insuffisante" | ADMIN + ELEVE | NORMALE | Oui: CORRIGER |
| **EMAIL** | `EMAIL_IMPORTANT` | "Email urgent de l'OPCO reçu" | ADMIN | HAUTE | Oui: VERIFIER |
| **EMAIL** | `REPONSE_AUTO_ENVOYEE` | "Marjorie a répondu à Sophie Martin" | ADMIN | BASSE | Non |
| **PLANNING** | `SESSION_BIENTOT` | "Session CAP ATBJ dans 7 jours" | TOUS | NORMALE | Non |
| **PLANNING** | `ABSENCE_DETECTEE` | "3 absences non justifiées — Élève X" | ADMIN + FORMATEUR | HAUTE | Oui: VERIFIER |
| **PLANNING** | `DISPONIBILITE_FORMATEUR` | "Formateur Y indisponible le 20/02" | ADMIN | NORMALE | Oui: DECIDER |
| **EVALUATION** | `NOTE_SAISIE` | "Nouvelle évaluation saisie" | ADMIN + ELEVE | NORMALE | Non |
| **EVALUATION** | `RESULTAT_DISPONIBLE` | "Vos résultats d'examen sont disponibles" | ELEVE | HAUTE | Non |
| **FINANCE** | `PAIEMENT_RECU` | "Acompte reçu : 2 100€" | ADMIN | NORMALE | Non |
| **FINANCE** | `PAIEMENT_EN_RETARD` | "Solde en retard pour JURI102025" | ADMIN | URGENTE | Oui: RELANCER |
| **FINANCE** | `FINANCEMENT_VALIDE` | "Financement OPCO validé pour X" | ADMIN + ELEVE | HAUTE | Non |
| **SYSTEM** | `ERREUR_WORKFLOW` | "Erreur workflow Marjorie-emails" | ADMIN | URGENTE | Oui: CORRIGER |
| **SYSTEM** | `AGENT_HORS_LIGNE` | "Agent Marjorie ne répond plus" | ADMIN | URGENTE | Oui: VERIFIER |
| **ALERTE** | `CAPACITE_SESSION` | "Session CAP ATBJ — 1 place restante" | ADMIN | HAUTE | Non |
| **ALERTE** | `ECHEANCE_PROCHE` | "Date limite inscription dans 3 jours" | ADMIN + ELEVE | HAUTE | Oui: VERIFIER |

---

## 3. Architecture Technique — Flux Bidirectionnel

### 3A. n8n → CRM (Push de notifications)

**Endpoint d'ingestion** : `POST /api/notifications/ingest`

```typescript
// Payload envoyé par n8n via HTTP Request node
interface NotificationPayload {
  // Authentification
  apiKey: string;              // Clé API partagée (env variable)
  
  // Contenu
  sourceAgent: string;         // "marjorie"
  sourceWorkflow?: string;     // "email-processing-v2"
  sourceExecutionId?: string;  // ID n8n
  
  categorie: string;           // "DEVIS"
  type: string;                // "DEVIS_ENVOYE"
  priorite?: string;           // "NORMALE"
  titre: string;               // "Devis envoyé avec succès"
  message: string;             // "Devis pour Juliette Rimbo..."
  
  // Ciblage
  audience?: string;           // "ADMIN"
  idUtilisateurCible?: number;
  
  // Deep link
  entiteType?: string;         // "candidat"
  entiteId?: string;           // "JURI102025"
  
  // Action
  actionRequise?: boolean;
  typeAction?: string;         // "RELANCER"
  
  // Extra
  metadonnees?: Record<string, any>;
  expirationDate?: string;     // ISO date
  
  // Batch : possibilité d'envoyer plusieurs notifications d'un coup
  batch?: NotificationPayload[];
}
```

**Sécurité** : API Key dans le header `X-API-Key` + vérification IP du VPS n8n (même serveur = localhost).

### 3B. CRM → n8n (Actions retour)

**Webhook de callback** : Quand un admin agit sur une notification qui requiert une action

```typescript
// Le CRM appelle n8n quand une action est effectuée
interface ActionCallback {
  notificationId: number;
  type: string;           // "DEVIS_EXPIRE"
  typeAction: string;     // "RELANCER"
  actionPar: number;      // idUtilisateur
  resultat: string;       // "relance_email" | "relance_telephone" | "annuler"
  entiteType: string;     // "candidat"
  entiteId: string;       // "JURI102025"
  metadonnees?: any;
}

// n8n reçoit via webhook et déclenche le workflow approprié
// Ex: relance_email → workflow envoi email de relance
// Ex: annuler → workflow mise à jour statut
```

### 3C. Temps réel — SSE (Server-Sent Events)

**Pourquoi SSE et pas WebSocket ?**
- Communication unidirectionnelle suffisante (serveur → client)
- Natif dans les navigateurs (EventSource API)
- Compatible HTTP standard, pas besoin de serveur WS séparé
- Reconnexion automatique intégrée
- Parfait avec Next.js App Router (ReadableStream)
- Les actions retour passent par des appels API classiques (POST)

**Endpoint SSE** : `GET /api/notifications/stream`

```typescript
// Route API Next.js (App Router)
// app/api/notifications/stream/route.ts

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return new Response('Unauthorized', { status: 401 });
  
  const { idUtilisateur, role } = session.user;
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Enregistrer ce client dans le pool de connexions SSE
      const clientId = addSSEClient(idUtilisateur, role, controller);
      
      // Heartbeat toutes les 30s pour garder la connexion
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 30000);
      
      // Envoyer le compteur initial de notifications non lues
      sendInitialCount(idUtilisateur, role, controller);
      
      // Nettoyage à la déconnexion
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        removeSSEClient(clientId);
      });
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    }
  });
}
```

**Format des événements SSE envoyés** :

```
event: notification
data: {"id":42,"categorie":"DEVIS","type":"DEVIS_ENVOYE","priorite":"NORMALE","titre":"Devis envoyé avec succès","message":"...","actionRequise":false,"lienAction":"/admin/candidats/JURI102025","creeLe":"2024-02-07T14:32:00Z"}

event: count
data: {"total":12,"nonLues":2,"urgentes":1,"actionsRequises":3}

event: action_completed
data: {"notificationId":38,"typeAction":"RELANCER","resultat":"success"}
```

---

## 4. Gestion du Pool SSE — Singleton en mémoire

```typescript
// lib/sse-manager.ts
// Singleton côté serveur pour gérer les connexions SSE actives

interface SSEClient {
  id: string;
  idUtilisateur: number;
  role: string;           // "admin" | "professeur" | "eleve"
  controller: ReadableStreamDefaultController;
  connectedAt: Date;
}

class SSEManager {
  private clients: Map<string, SSEClient> = new Map();
  private encoder = new TextEncoder();
  
  addClient(idUtilisateur: number, role: string, controller: ReadableStreamDefaultController): string {
    const clientId = `${idUtilisateur}-${Date.now()}`;
    this.clients.set(clientId, { id: clientId, idUtilisateur, role, controller, connectedAt: new Date() });
    return clientId;
  }
  
  removeClient(clientId: string) {
    this.clients.delete(clientId);
  }
  
  // Envoyer une notification aux clients concernés
  broadcast(notification: Notification) {
    const targetClients = this.getTargetClients(notification);
    const eventData = `event: notification\ndata: ${JSON.stringify(notification)}\n\n`;
    
    for (const client of targetClients) {
      try {
        client.controller.enqueue(this.encoder.encode(eventData));
      } catch {
        this.removeClient(client.id); // Client déconnecté
      }
    }
  }
  
  private getTargetClients(notif: Notification): SSEClient[] {
    return Array.from(this.clients.values()).filter(client => {
      switch (notif.audience) {
        case 'TOUS': return true;
        case 'ADMIN': return client.role === 'admin';
        case 'FORMATEUR': return client.role === 'professeur';
        case 'ELEVE': return client.role === 'eleve';
        case 'SPECIFIQUE': return client.idUtilisateur === notif.idUtilisateurCible;
        default: return false;
      }
    });
  }
}

// Singleton global (survit aux hot reloads en dev)
const globalForSSE = globalThis as unknown as { sseManager: SSEManager };
export const sseManager = globalForSSE.sseManager ??= new SSEManager();
```

---

## 5. Intégration côté n8n — Workflow type

### Workflow n8n "Notification Push"

```
[Trigger: workflow terminé]
        │
        ▼
[Function Node: Construire le payload notification]
        │
        ▼
[HTTP Request Node]
   POST https://crm.abj.fr/api/notifications/ingest
   Headers:
     X-API-Key: {{$env.CRM_API_KEY}}
     Content-Type: application/json
   Body: payload notification
        │
        ▼
[IF Node: Vérifier réponse 200]
   ├─ Succès → fin
   └─ Erreur → [Error Handler / Log dans journal_erreurs]
```

### Exemple concret : Marjorie traite un email et crée un prospect

```javascript
// Function Node n8n — après création du prospect
const notification = {
  sourceAgent: "marjorie",
  sourceWorkflow: "email-processing-v2",
  sourceExecutionId: $execution.id,
  categorie: "PROSPECT",
  type: "NOUVEAU_PROSPECT",
  priorite: "NORMALE",
  titre: `Nouveau prospect : ${$json.prenom} ${$json.nom}`,
  message: `${$json.prenom} ${$json.nom} s'intéresse à la formation ${$json.formationPrincipale}. Source: ${$json.sourceOrigine}. Marjorie a envoyé une réponse automatique.`,
  audience: "ADMIN",
  entiteType: "prospect",
  entiteId: $json.idProspect,
  lienAction: `/admin/prospects/${$json.idProspect}`,
  actionRequise: false,
  metadonnees: {
    resumeIa: $json.resumeIa,
    scoreInteret: $json.scoreInteret,
    formationsDetectees: $json.formationsSouhaitees
  }
};

return [{ json: notification }];
```

---

## 6. Composants Frontend

### Hook React `useNotifications`

```typescript
// hooks/useNotifications.ts
'use client';
import { useEffect, useState, useCallback, useRef } from 'react';

interface NotificationCount {
  total: number;
  nonLues: number;
  urgentes: number;
  actionsRequises: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [counts, setCounts] = useState<NotificationCount>({ total: 0, nonLues: 0, urgentes: 0, actionsRequises: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  
  useEffect(() => {
    const es = new EventSource('/api/notifications/stream');
    eventSourceRef.current = es;
    
    es.onopen = () => setIsConnected(true);
    es.onerror = () => setIsConnected(false);
    
    // Nouvelle notification en temps réel
    es.addEventListener('notification', (e) => {
      const notif = JSON.parse(e.data);
      setNotifications(prev => [notif, ...prev]);
      setCounts(prev => ({
        ...prev,
        total: prev.total + 1,
        nonLues: prev.nonLues + 1,
        urgentes: notif.priorite === 'URGENTE' ? prev.urgentes + 1 : prev.urgentes,
        actionsRequises: notif.actionRequise ? prev.actionsRequises + 1 : prev.actionsRequises,
      }));
      
      // Notification browser native si urgente
      if (notif.priorite === 'URGENTE' && Notification.permission === 'granted') {
        new Notification(notif.titre, { body: notif.message, icon: '/icons/abj-logo.png' });
      }
    });
    
    // Mise à jour des compteurs
    es.addEventListener('count', (e) => {
      setCounts(JSON.parse(e.data));
    });
    
    return () => es.close();
  }, []);
  
  const markAsRead = useCallback(async (id: number) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lue: true } : n));
    setCounts(prev => ({ ...prev, nonLues: Math.max(0, prev.nonLues - 1) }));
  }, []);
  
  const executeAction = useCallback(async (id: number, resultat: string) => {
    await fetch(`/api/notifications/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ resultat }),
    });
  }, []);
  
  return { notifications, counts, isConnected, markAsRead, executeAction };
}
```

### Composant Cloche (Header)

```tsx
// components/NotificationBell.tsx
function NotificationBell() {
  const { counts, notifications } = useNotifications();
  const [open, setOpen] = useState(false);
  
  // Les 5 dernières notifications non lues pour le dropdown
  const recentUnread = notifications
    .filter(n => !n.lue)
    .slice(0, 5);
  
  return (
    <div className="relative">
      {/* Cloche avec badge */}
      <button onClick={() => setOpen(!open)}>
        <BellIcon />
        {counts.nonLues > 0 && (
          <span className="badge">{counts.nonLues}</span>
        )}
        {counts.urgentes > 0 && (
          <span className="badge-urgent pulse" />  // Point rouge pulsant
        )}
      </button>
      
      {/* Dropdown rapide */}
      {open && (
        <div className="dropdown">
          <div className="header">
            <span>Notifications Marjorie</span>
            <span className="badge-new">{counts.nonLues} nouvelles</span>
          </div>
          
          {recentUnread.map(notif => (
            <NotificationCard key={notif.id} notification={notif} compact />
          ))}
          
          <Link href="/admin/notifications">
            Voir toutes les notifications
          </Link>
        </div>
      )}
    </div>
  );
}
```

---

## 7. Logique de Routage par Interface

### Matrice de visibilité

| Événement | Admin | Formateur | Élève |
|-----------|-------|-----------|-------|
| Nouveau prospect | ✅ | ❌ | ❌ |
| Dossier créé | ✅ | ❌ | ❌ |
| Devis envoyé/signé | ✅ | ❌ | ❌ |
| Document reçu/validé | ✅ | ❌ | ✅ (son dossier) |
| Session bientôt | ✅ | ✅ (ses sessions) | ✅ (ses sessions) |
| Absence détectée | ✅ | ✅ (ses élèves) | ✅ (le sien) |
| Évaluation saisie | ✅ | ❌ | ✅ (la sienne) |
| Résultat disponible | ✅ | ❌ | ✅ |
| Paiement reçu/retard | ✅ | ❌ | ✅ (le sien) |
| Erreur système | ✅ | ❌ | ❌ |
| Planning modifié | ✅ | ✅ | ✅ |
| Formateur indisponible | ✅ | ✅ (le sien) | ❌ |

---

## 8. Actions Interactives — Du CRM vers n8n

Quand une notification a `actionRequise: true`, l'UI affiche des boutons d'action contextuelle.

### Exemples d'actions et workflows déclenchés

| Notification | Boutons d'action | Webhook n8n déclenché |
|-------------|------------------|----------------------|
| Devis expiré (14j) | "Relancer par email" / "Relancer par tél" / "Annuler" | `POST /webhook/relance-candidat` |
| Dossier incomplet | "Voir documents manquants" / "Envoyer rappel" | `POST /webhook/rappel-documents` |
| Prospect chaud | "Appeler maintenant" / "Planifier rappel" | `POST /webhook/action-prospect` |
| Document refusé | "Renvoyer demande" / "Accepter quand même" | `POST /webhook/validation-document` |
| Erreur workflow | "Relancer le workflow" / "Ignorer" | `POST /webhook/retry-workflow` |
| Paiement en retard | "Envoyer relance" / "Marquer résolu" | `POST /webhook/relance-paiement` |

### Flow d'une action

```
[Admin clique "Relancer par email"]
        │
        ▼
[CRM: PATCH /api/notifications/:id/action]
   → Met à jour: actionEffectuee=true, dateAction, actionPar
        │
        ▼
[CRM: POST vers webhook n8n]
   → Payload: { type, candidatId, action: "relance_email", decidePar }
        │
        ▼
[n8n: Workflow relance]
   → Génère email personnalisé (Marjorie)
   → Envoie l'email
   → Met à jour le prospect/candidat en BDD
   → Crée une nouvelle notification de confirmation
        │
        ▼
[CRM reçoit notification: "Relance envoyée avec succès"]
   → SSE push vers le navigateur de l'admin
```

---

## 9. API Endpoints — Résumé complet

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/notifications/ingest` | Réception depuis n8n (authentifié API Key) |
| `GET` | `/api/notifications/stream` | SSE temps réel (authentifié session) |
| `GET` | `/api/notifications` | Liste paginée + filtres (catégorie, priorité, lu/non lu) |
| `GET` | `/api/notifications/counts` | Compteurs rapides pour la cloche |
| `PATCH` | `/api/notifications/:id/read` | Marquer comme lu |
| `PATCH` | `/api/notifications/read-all` | Tout marquer comme lu |
| `POST` | `/api/notifications/:id/action` | Exécuter une action + callback n8n |
| `DELETE` | `/api/notifications/purge` | Supprimer les notifications lues/archivées (admin) |
| `GET` | `/api/notifications/preferences` | Préférences utilisateur |
| `PUT` | `/api/notifications/preferences` | Modifier préférences |

---

## 10. Règles de Priorité et Sons/Visuels

| Priorité | Couleur | Icône cloche | Son | Comportement |
|----------|---------|-------------|-----|-------------|
| BASSE | Gris `#888` | Aucun | Aucun | Silencieux, visible dans la liste |
| NORMALE | Jaune `#F59E0B` | Badge compteur | Aucun | Badge + dot sur la cloche |
| HAUTE | Orange `#F97316` | Badge + animation | Bip discret | Badge animé + mise en avant dans le dropdown |
| URGENTE | Rouge `#EF4444` | Badge pulsant rouge | Notification sonore | Notification browser native + bandeau en haut de page |

---

## 11. Plan d'implémentation — Phases

### Phase 1 : Fondation (Priorité immédiate)
1. ✅ Ajouter les tables Prisma (Notification, NotificationLecture, PreferenceNotification)
2. ✅ Créer l'endpoint POST `/api/notifications/ingest`
3. ✅ Créer l'endpoint GET `/api/notifications` (liste avec filtres)
4. ✅ Page admin `/admin/notifications` (affichage statique avec polling)
5. ✅ Adapter le workflow Marjorie n8n pour envoyer des notifications

### Phase 2 : Temps réel (Semaine suivante)
1. Implémenter le SSE Manager singleton
2. Endpoint SSE `/api/notifications/stream`
3. Hook `useNotifications` avec EventSource
4. Composant NotificationBell dans le header
5. Notifications browser natives (permission + push)

### Phase 3 : Actions bidirectionnelles (Sprint suivant)
1. Boutons d'action dans les cartes de notification
2. Endpoint POST `/api/notifications/:id/action`
3. Callbacks webhook vers n8n
4. Workflows n8n de réaction aux actions

### Phase 4 : Multi-interface (Sprint final)
1. Adapter les notifications pour l'interface formateur
2. Adapter les notifications pour l'interface élève
3. Préférences de notification par utilisateur
4. Purge automatique des vieilles notifications (cron)
