# Connexion Section Prospects - Analyse et Plan d'Implémentation

**Date** : 17 février 2026
**Objectif** : Analyser l'état actuel de la section Prospects et planifier la connexion des actions avec n8n

---

## 📊 ÉTAT DES LIEUX - CE QUI FONCTIONNE

### ✅ Lecture et Affichage (100% Connecté à la BDD)

**Services et Repositories :**
- ✅ `ProspectService` - Logique métier
- ✅ `ProspectRepository` - Requêtes Prisma
- ✅ Filtres actifs : statut, formation, financement, recherche
- ✅ Pagination fonctionnelle

**Endpoints API :**
- ✅ `GET /api/prospects` - Liste avec filtres
- ✅ `GET /api/prospects/[id]` - Détail prospect
- ✅ `GET /api/prospects/[id]/emails` - Historique échanges

**Composants UI :**
- ✅ `ProspectsPageClient` - Tableau interactif
- ✅ `ProspectsFilters` - Filtres URL params
- ✅ `ProspectDetailPanel` - Panel latéral avec détails
- ✅ `HistoriqueEchangesModal` - Modal historique emails

**Données affichées :**
- Contact complet (nom, prénom, email, téléphone, adresse)
- Formation souhaitée + mode financement
- Statut + source + nb échanges
- Dates premier/dernier contact
- Résumé IA

---

## ❌ CE QUI NE FONCTIONNE PAS - BOUTONS SANS ACTIONS

**Tous les boutons d'action du panel latéral sont des coquilles vides.**

### Fichier : `src/components/admin/ProspectDetailPanel.tsx`

**Boutons header (lignes 131-138) :**
```typescript
<button className="...">  // ❌ Pas de onClick
  <Mail /> Envoyer email
</button>
<button className="...">  // ❌ Pas de onClick (année prochaine)
  <Phone /> Appeler
</button>
```

**Boutons section Actions (lignes 237-248) :**
```typescript
<button className="...">  // ❌ Pas de onClick
  <FileText /> Générer devis
</button>
<button className="...">  // ❌ Pas de onClick
  <Send /> Envoyer dossier
</button>
<button className="...">  // ❌ Pas de onClick
  <User /> Convertir en candidat
</button>
```

**Constat** : Aucune intégration n8n détectée dans tout le code de la section Prospects.

---

## 🏗️ INFRASTRUCTURE DISPONIBLE

### 1. ✅ Serveur SSE (Confirmé Opérationnel)

**Fichier** : `src/lib/sse-manager.ts` (344 lignes)

**Fonctionnalités confirmées :**
- ✅ Singleton global (survit aux hot reloads)
- ✅ Heartbeat automatique toutes les 30 secondes
- ✅ Broadcast par audience (ADMIN, FORMATEUR, ELEVE, TOUS)
- ✅ Reconnexion automatique côté client
- ✅ Nettoyage automatique clients morts
- ✅ Méthodes disponibles :
  - `broadcast(notification)` - Envoyer notification
  - `broadcastCount(counts)` - Mettre à jour badge cloche
  - `broadcastActionCompleted()` - Action terminée
  - `getStats()` - Statistiques clients connectés

**Utilisation simple :**
```typescript
import { sseManager } from '@/lib/sse-manager'

sseManager.broadcast({
  type: 'notification',
  data: {
    categorie: 'PROSPECT',
    type: 'ACTION_TERMINEE',
    priorite: 'NORMALE',
    titre: '✅ Email envoyé',
    message: `Email envoyé à ${prospect.prenom} ${prospect.nom}`,
    audience: 'ADMIN',
    lienAction: `/admin/prospects`
  }
})
```

---

### 2. ✅ Table `journal_erreurs` (Schéma 100% Adapté)

**Fichier** : `prisma/schema.prisma` (lignes 270-280)

```prisma
model JournalErreur {
  id            Int      @id @default(autoincrement())
  dateErreur    DateTime @default(now()) @map("date_erreur")
  nomWorkflow   String?  @map("nom_workflow")
  nomNoeud      String?  @map("nom_noeud")
  messageErreur String?  @map("message_erreur")
  donneesEntree Json?    @map("donnees_entree")
  resolu        Boolean  @default(false)

  @@map("journal_erreurs")
}
```

**Validation :**
- ✅ Tous les champs nécessaires présents
- ✅ Type `Json?` flexible pour contexte libre
- ✅ Tous champs `nullable` (String?, Json?) → sécurisé si erreur lors du log
- ✅ Champ `resolu` pour tracking admin
- ✅ Pas de migration Prisma nécessaire

**Utilisation :**
```typescript
await prisma.journalErreur.create({
  data: {
    nomWorkflow: 'prospect_convert_to_candidat',
    nomNoeud: 'webhook_n8n_call',
    messageErreur: error.message,
    donneesEntree: {
      prospectId: params.id,
      formation: body.formation,
      timestamp: new Date().toISOString(),
      errorStack: error.stack,
      httpStatus: webhookResponse?.status || null,
      retryAttempt: 3
    }
  }
})
```

---

### 3. 💡 Améliorations OPTIONNELLES du Schéma (Recommandations)

**Si tu veux être ultra-précis, on pourrait ajouter 3 champs :**

```prisma
model JournalErreur {
  id            Int      @id @default(autoincrement())
  dateErreur    DateTime @default(now())
  nomWorkflow   String?
  nomNoeud      String?
  messageErreur String?
  donneesEntree Json?
  resolu        Boolean  @default(false)

  // 🆕 OPTIONNEL : Gravité de l'erreur
  severite      String?  @default("ERREUR") @map("severite")
  // Valeurs : INFO | WARNING | ERREUR | CRITIQUE

  // 🆕 OPTIONNEL : Traçabilité de résolution
  resoluPar     String?  @map("resolu_par")  // Nom admin qui a résolu
  dateResolution DateTime? @map("date_resolution") @db.Timestamptz(6)

  @@map("journal_erreurs")
}
```

**Bénéfices :**
- `severite` : Permet de filtrer les erreurs critiques vs warnings
- `resoluPar` : Traçabilité (qui a corrigé ?)
- `dateResolution` : Calcul du temps moyen de résolution

**MAIS** : Le schéma actuel suffit ! On peut mettre ces infos dans le JSON `donneesEntree` si besoin.

**Décision à prendre** : Veux-tu qu'on ajoute ces 3 champs ou on reste avec le schéma actuel ?

---

## 📝 STRATÉGIE DE LOGGING COMPLÈTE

### Double Logging : BDD + Console

```typescript
try {
  // ... logique métier

} catch (error: any) {

  // 1️⃣ CONSOLE.LOG (pour toi, dev, debug immédiat)
  console.error('❌ [API Prospect] Erreur:', {
    prospectId: params.id,
    action: 'convert_to_candidat',
    error: error.message,
    stack: error.stack
  })

  // 2️⃣ BDD (pour admin, traçabilité, analytics)
  await prisma.journalErreur.create({
    data: {
      nomWorkflow: 'prospect_convert_to_candidat',
      nomNoeud: 'webhook_n8n_call',
      messageErreur: error.message,
      donneesEntree: {
        prospectId: params.id,
        timestamp: new Date().toISOString(),
        errorStack: error.stack,
        // Si champs optionnels ajoutés :
        // severite: 'CRITIQUE',
        // resoluPar: null
      }
    }
  }).catch(dbError => {
    // Si même la BDD plante, au moins on a console.log
    console.error('❌❌ CRITICAL: Impossible de logger en BDD:', dbError)
  })

  // 3️⃣ NOTIFICATION SSE (pour feedback utilisateur temps réel)
  sseManager.broadcast({
    type: 'notification',
    data: {
      categorie: 'SYSTEM',
      type: 'ERREUR_WEBHOOK',
      priorite: 'URGENTE',
      titre: '❌ Échec transformation candidat',
      message: error.message,
      audience: 'ADMIN',
      lienAction: '/admin/logs' // Future page pour voir les erreurs
    }
  })

  return NextResponse.json({ error: error.message }, { status: 500 })
}
```

### Différence BDD vs Console

| Critère | `journal_erreurs` (BDD) | `console.log` (Next.js) |
|---------|------------------------|-------------------------|
| **Persistance** | ✅ Permanent | ❌ Disparaît au restart |
| **Accessible admin** | ✅ Via UI `/admin/logs` | ❌ NON (technique) |
| **Recherche** | ✅ SQL queries | ❌ Grep dans logs |
| **Export** | ✅ CSV, Excel, API | ❌ Copy/paste |
| **Notification** | ✅ Trigger alerte SSE | ❌ Pas auto |
| **Résolution** | ✅ Champ `resolu` | ❌ Impossible |
| **Performance** | ⚠️ INSERT 50-100ms | ✅ Instantané |
| **Usage** | 🎯 Erreurs métier | 🛠️ Debug dev |

**Recommandation** : Utiliser LES DEUX en parallèle.

---

## 🔄 LOGIQUE MÉTIER PROSPECT → CANDIDAT

### Clarification Importante

**❌ FAUX :** "Convertir" supprime le prospect de la table
**✅ VRAI :** Le prospect **reste en base**, seul son statut change

### Cycle de Vie Correct

```
Table prospects (PERMANENT - jamais vidé)
    ↓
Prospect (statut_prospect: NOUVEAU)
    ↓ Action admin "Transformer en candidat"
Prospect (statut_prospect: CANDIDAT) ← Juste le statut change !
    ↓
Table candidats (nouveau record créé)
    - numero_dossier généré (ex: DUMI15092024)
    - relation idProspect vers prospects
    ↓
Google Drive
    - Dossier créé "[DUMI15092024] Marie Dumitru"
    - Sous-dossiers selon formation choisie
    - Documents requis listés
```

### Ce Qui Se Passe Techniquement

1. **Dans `prospects` :**
   ```sql
   UPDATE prospects
   SET statut_prospect = 'CANDIDAT'
   WHERE id_prospect = 'PROS_123'
   ```

2. **Dans `candidats` :**
   ```sql
   INSERT INTO candidats (
     id_prospect,
     numero_dossier,
     formation_retenue,
     statut_dossier,
     ...
   ) VALUES (
     'PROS_123',
     'DUMI15092024',
     'CAP_BJ',
     'RECU',
     ...
   )
   ```

3. **Webhook n8n :** Création dossier Drive + sous-dossiers

**Important** : Le prospect reste visible dans la BDD, mais **filtré de la page Prospects** (car statut = CANDIDAT).

---

## 🎯 ACTION PRIORITAIRE : Convertir en Candidat

### Modal de Transformation Requis

**Spécifications utilisateur :**
> "Pour transformer en candidat, il faut ouvrir un modal au clic qui reprend les données, permet d'afficher la liste des formations pour pouvoir changer si le prospect le demande, pareil pour la période voulue"

### Contenu du Modal

```
┌─────────────────────────────────────────────┐
│  🔄 Transformer en candidat                 │
├─────────────────────────────────────────────┤
│                                             │
│  Prospect concerné :                        │
│  ┌─────────────────────────────────────┐   │
│  │ 👤 Marie Dumitru                    │   │
│  │ 📧 marie.dumitru@email.com         │   │
│  │ 📍 Paris (75001)                    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Formation souhaitée : (modifiable)         │
│  ┌─────────────────────────────────────┐   │
│  │ [Dropdown]                          │   │
│  │ ✓ CAP Bijouterie-Joaillerie         │   │ ← Pré-rempli
│  │   Sertissage Niveau 1               │   │
│  │   CAO/DAO 3D                        │   │
│  │   Gemmologie                        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Période souhaitée :                        │
│  ┌─────────────────────────────────────┐   │
│  │ [Dropdown]                          │   │
│  │   Mars 2026                         │   │
│  │   Septembre 2026                    │   │
│  │   Janvier 2027                      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  📋 Ce qui va se passer :                   │
│  ┌─────────────────────────────────────┐   │
│  │ • Statut changé en CANDIDAT         │   │
│  │ • Numéro dossier généré             │   │
│  │ • Dossier Google Drive créé         │   │
│  │ • Sous-dossiers selon formation     │   │
│  │ • Documents requis listés           │   │
│  │ • Prospect masqué liste prospects   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ⚠️ Cette action est irréversible           │
│                                             │
│  [Annuler]    [Confirmer transformation]   │
│                                             │
└─────────────────────────────────────────────┘
```

### Questions en Attente

**Avant d'implémenter, j'ai besoin de savoir :**

1. **Liste des formations :**
   - Option A : Récupérer depuis table `formations` en BDD ?
   - Option B : Liste hardcodée temporaire ?

2. **Liste des périodes :**
   - Option A : Liste fixe ("Mars 2026", "Sept 2026", etc.) ?
   - Option B : Liée aux `sessions` réelles en BDD ?

3. **Documents requis selon formation :**
   - Existe-t-il un mapping dans table `documents_requis` ?
   - Ou logique hardcodée pour l'instant ?

4. **Workflow n8n :**
   - Existe-t-il déjà un workflow pour créer dossier Drive ?
   - Quelle est l'URL du webhook ?

5. **Variables d'environnement :**
   - `N8N_WEBHOOK_BASE_URL` déjà configurée ?
   - `N8N_API_KEY` déjà configurée ?

---

## 🛠️ AUTRES ACTIONS À IMPLÉMENTER

### 2. Envoyer Dossier de Candidature

**Objectif** : Envoyer email avec lien formulaire dossier complet

**Modal** : Confirmation simple
- Email destinataire (pré-rempli, modifiable)
- "Un email va être envoyé à [email]"

**Endpoint** : `POST /api/prospects/[id]/send-dossier`

**Webhook n8n** :
- Générer lien unique formulaire
- Email personnalisé Marjorie
- Update statut → EN_ATTENTE_DOSSIER

---

### 3. Générer Devis

**Objectif** : Générer PDF devis (sans l'envoyer)

**Modal** : Aucun (action non destructive)

**Endpoint** : `POST /api/prospects/[id]/generate-devis`

**Webhook n8n** :
- Copier template Google Docs
- Remplir placeholders
- Export PDF + upload Drive

---

### 4. Envoyer Email

**Objectif** : Email de relance/information

**Modal** : Optionnel selon type
- Relance simple : pas de confirmation
- Email commercial : confirmation

**Endpoint** : `POST /api/prospects/[id]/send-email`

**Webhook n8n** :
- Marjorie génère email contextualisé
- Envoi SMTP
- Log historique_emails

---

### 5. Appeler (⏸️ Année Prochaine)

**Note utilisateur** : "Sauf appeler ça on le connecte pas tout de suite c'est l'année prochaine"

Comportement actuel : Bouton présent mais désactivé.

---

## 📦 COMPOSANTS À CRÉER

### 1. Infrastructure Commune

**Fichier** : `src/lib/webhook-client.ts`
```typescript
export async function callWebhookWithRetry(
  url: string,
  payload: any,
  options?: {
    maxRetries?: number      // Default: 3
    initialDelay?: number    // Default: 1000ms
    backoffMultiplier?: number // Default: 2
  }
): Promise<any>
```

**Fichier** : `src/components/shared/ConfirmActionModal.tsx`
- Modal réutilisable pour confirmations
- Props : title, description, onConfirm, onCancel

**Fichier** : `src/components/shared/LoadingOverlay.tsx`
- Overlay avec spinner + message
- Props : message, visible

---

### 2. Modals Spécifiques

**Fichier** : `src/components/admin/ConvertToCandidatModal.tsx`
- Modal complet transformation candidat
- Dropdown formations
- Sélecteur période
- Récapitulatif actions
- Loading state intégré

---

### 3. Handlers dans ProspectDetailPanel

**Fichier** : `src/components/admin/ProspectDetailPanel.tsx`

Ajouter états :
```typescript
const [actionLoading, setActionLoading] = useState<string | null>(null)
const [showConvertModal, setShowConvertModal] = useState(false)
const [showConfirmEmail, setShowConfirmEmail] = useState(false)
```

Ajouter handlers :
```typescript
const handleConvertToCandidat = async (formation, periode) => { ... }
const handleSendDossier = async () => { ... }
const handleGenerateDevis = async () => { ... }
const handleSendEmail = async (type) => { ... }
```

---

## 📐 PATTERN TYPE D'ENDPOINT

```typescript
// src/app/api/prospects/[id]/[action]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sseManager } from '@/lib/sse-manager'
import { callWebhookWithRetry } from '@/lib/webhook-client'

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_BASE_URL

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: prospectId } = await params
  const startTime = Date.now()

  try {
    // 1. Récupérer prospect
    const prospect = await prisma.prospect.findUnique({
      where: { idProspect: prospectId }
    })

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect non trouvé' }, { status: 404 })
    }

    // 2. Notification SSE démarrage
    sseManager.broadcast({
      type: 'notification',
      data: {
        categorie: 'PROSPECT',
        type: 'ACTION_START',
        priorite: 'NORMALE',
        titre: '🔄 Traitement en cours',
        message: `Action pour ${prospect.prenom} ${prospect.nom}`,
        audience: 'ADMIN'
      }
    })

    // 3. Préparer payload
    const body = await request.json()
    const payload = {
      prospectId: prospect.idProspect,
      nom: prospect.nom,
      prenom: prospect.prenom,
      email: prospect.emails?.[0],
      ...body,
      timestamp: new Date().toISOString()
    }

    // 4. Appel webhook avec retry
    const result = await callWebhookWithRetry(
      `${N8N_WEBHOOK_URL}/prospect/action`,
      payload,
      { maxRetries: 3 }
    )

    // 5. Notification SSE succès
    sseManager.broadcast({
      type: 'notification',
      data: {
        categorie: 'PROSPECT',
        type: 'ACTION_SUCCESS',
        priorite: 'HAUTE',
        titre: '✅ Action terminée',
        message: 'Action effectuée avec succès',
        audience: 'ADMIN'
      }
    })

    return NextResponse.json({
      success: true,
      data: result,
      executionTime: Date.now() - startTime
    })

  } catch (error: any) {
    // 6. Console.log
    console.error('❌ [API] Erreur:', error)

    // 7. Logging BDD
    await prisma.journalErreur.create({
      data: {
        nomWorkflow: 'prospect_action',
        nomNoeud: 'webhook_call',
        messageErreur: error.message,
        donneesEntree: {
          prospectId,
          timestamp: new Date().toISOString(),
          errorStack: error.stack,
          duration: Date.now() - startTime
        }
      }
    }).catch(console.error)

    // 8. Notification SSE erreur
    sseManager.broadcast({
      type: 'notification',
      data: {
        categorie: 'SYSTEM',
        type: 'ERREUR',
        priorite: 'URGENTE',
        titre: '❌ Échec action',
        message: error.message,
        audience: 'ADMIN'
      }
    })

    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

---

## 🎯 DÉCISIONS À PRENDRE

### Avant de Coder

1. **Schéma `journal_erreurs` :**
   - ❓ Garder tel quel ?
   - ❓ Ajouter `severite`, `resoluPar`, `dateResolution` ?

2. **Formations dropdown :**
   - ❓ Depuis BDD table `formations` ?
   - ❓ Liste hardcodée temporaire ?

3. **Périodes dropdown :**
   - ❓ Liste fixe ?
   - ❓ Depuis BDD table `sessions` ?

4. **Documents requis :**
   - ❓ Table `documents_requis` existe ?
   - ❓ Mapping hardcodé ?

5. **Webhooks n8n :**
   - ❓ URLs des webhooks ?
   - ❓ Workflows déjà créés ?

---

## 📋 ORDRE D'IMPLÉMENTATION PROPOSÉ

### Phase 1 : Infrastructure
1. Créer `callWebhookWithRetry` dans `src/lib/webhook-client.ts`
2. Créer composants `ConfirmActionModal` et `LoadingOverlay`
3. Créer page `/admin/logs` pour voir `journal_erreurs` (optionnel)

### Phase 2 : Action "Convertir en Candidat"
1. Répondre aux 5 questions ci-dessus
2. Créer `ConvertToCandidatModal`
3. Créer endpoint `POST /api/prospects/[id]/convert-to-candidat`
4. Implémenter handler dans `ProspectDetailPanel`
5. Tester le flow complet

### Phase 3 : Autres Actions
- "Envoyer dossier"
- "Générer devis"
- "Envoyer email"

---

**Dernière mise à jour** : 17 février 2026
**Version** : 2.0 (corrigée)
**Auteur** : Claude Code

