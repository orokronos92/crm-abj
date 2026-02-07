---
name: n8n-integration
description: Conventions pour les webhooks et intégrations n8n avec Marjorie. Utiliser quand on travaille sur les endpoints webhook, les appels API vers n8n, ou la communication CRM ↔ Marjorie.
---

# Intégration n8n — Agent Marjorie

## Principe

Le CRM Next.js ne fait PAS de logique métier complexe. Il affiche des données et envoie des demandes à Marjorie (agent IA n8n) qui exécute les actions.

## Architecture

```
[CRM Next.js] → webhook POST → [n8n Marjorie] → action BDD/email/doc → réponse
[CRM Next.js] ← webhook POST ← [n8n Marjorie] (notifications, mises à jour)
```

## Endpoints CRM → n8n

Tous les appels vers n8n passent par le client `src/lib/n8n.ts` :

```typescript
// src/lib/n8n.ts
const N8N_WEBHOOK_BASE = process.env.N8N_WEBHOOK_URL

export async function appelMarjorie(action: string, data: Record<string, unknown>) {
  const response = await fetch(`${N8N_WEBHOOK_BASE}/marjorie`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-crm-secret': process.env.N8N_SECRET!,
    },
    body: JSON.stringify({ action, ...data }),
  })
  return response.json()
}
```

## Endpoints n8n → CRM (webhooks entrants)

Tous dans `src/app/api/webhooks/n8n/` :

| Endpoint | Usage |
|----------|-------|
| `POST /api/webhooks/n8n/candidate` | Nouveau candidat créé par Marjorie |
| `POST /api/webhooks/n8n/email` | Email traité par Marjorie |
| `POST /api/webhooks/n8n/document` | Document généré |
| `POST /api/webhooks/n8n/status-update` | Changement de statut candidat |

### Validation obligatoire

Chaque webhook entrant DOIT :
1. Vérifier le header `x-n8n-signature`
2. Valider le body avec Zod
3. Logger dans `journal_erreurs` en cas d'échec
4. Retourner `{ success: true/false, error?: string }`

```typescript
// Pattern type pour un webhook n8n
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  numero_dossier: z.string(),
  statut: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier signature
    const signature = request.headers.get('x-n8n-signature')
    if (signature !== process.env.N8N_SECRET) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
    }

    // 2. Valider body
    const body = await request.json()
    const data = schema.parse(body)

    // 3. Traiter
    // ... logique Prisma ici

    return NextResponse.json({ success: true, data })
  } catch (error) {
    // 4. Logger erreur
    console.error('Webhook n8n erreur:', error)
    return NextResponse.json({ success: false, error: 'Erreur interne' }, { status: 500 })
  }
}
```

## Chat Marjorie

Le composant `MarjorieChat` envoie les messages via :

```typescript
POST /api/marjorie/chat
Body: {
  userId: string,
  role: "admin" | "professeur" | "eleve",
  message: string,
  context?: {
    page: string,
    numero_dossier?: string,
    id_eleve?: number
  }
}
```

Ce endpoint relaye vers n8n qui route vers le bon agent selon le rôle.

## Variables d'environnement

```env
N8N_WEBHOOK_URL=https://n8n.example.com/webhook
N8N_SECRET=secret_partage_entre_crm_et_n8n
```
