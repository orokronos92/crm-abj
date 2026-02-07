# CLAUDE.md — CRM ABJ (Académie de Bijouterie Joaillerie)

## Langue

**OBLIGATOIRE** : Tout en français — réponses, commentaires, commits, logs.

## Projet

CRM sur mesure remplaçant Loop CRM. Gère candidats, formations, emails, documents.
Agent IA "Marjorie" via n8n pour automatisation (80% des tâches admin).

## Stack

- **Framework** : Next.js 16+ (App Router, TypeScript strict)
- **UI** : Tailwind CSS v4
- **ORM** : Prisma → PostgreSQL
- **Automatisation** : n8n (webhooks)
- **Auth** : NextAuth.js (3 rôles : admin, professeur, eleve)
- **Déploiement** : Docker / Hostinger VPS / Traefik

## Commandes

```bash
npm run dev          # Dev server (port 3000)
npm run build        # Build production
npm run lint         # ESLint
npx prisma generate  # Régénérer client Prisma
npx prisma migrate dev --name "description"  # Migration BDD
npx prisma studio    # Interface BDD visuelle
```

## Structure

```
src/
  app/
    (auth)/           # Login, register
    (admin)/          # Interface admin (7 vues)
    (formateur)/      # Interface formateur
    (eleve)/          # Interface élève
    api/              # API Routes REST
  components/
    admin/            # Composants admin
    formateur/        # Composants formateur
    eleve/            # Composants élève
    shared/           # Composants partagés (MarjorieChat, etc.)
    ui/               # Composants UI de base
  lib/                # Utilitaires (prisma.ts, auth.ts, n8n.ts)
  hooks/              # Hooks custom
  types/              # Types TypeScript partagés
prisma/
  schema.prisma       # Schéma BDD complet
  migrations/         # Migrations SQL
  seed.ts             # Données initiales
docs/                 # Spécifications (ne pas modifier sans demander)
```

## Documentation de référence

- @docs/spec.md — Spécifications fonctionnelles complètes
- @docs/architecture.md — Architecture technique et schéma BDD
- @docs/ui-analysis.md — Analyse des maquettes UI et mapping BDD
- @docs/CHANGELOG.md — Historique des modifications par session

## Imports

Toujours utiliser l'alias `@/` :
```typescript
import { Composant } from '@/components/shared/composant'
import { useCandidats } from '@/hooks/use-candidats'
import type { Candidat } from '@/types/candidat'
```

---

## ⛔ RÈGLES CRITIQUES — NE JAMAIS ENFREINDRE

### 1. Ne JAMAIS modifier sans demander

- **Fichiers de config** : `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `package.json`, `prisma/schema.prisma`
- **Fichiers dans `docs/`** : Ce sont les specs validées, ne pas les modifier
- **`.env` et `.env.local`** : Ne jamais toucher aux variables d'environnement

### 2. Ne JAMAIS casser ce qui fonctionne

- Avant de modifier un fichier existant, vérifier que le build passe : `npm run build`
- Après modification, vérifier à nouveau : `npm run build`
- Si le build casse → **ANNULER immédiatement** et expliquer le problème
- Ne JAMAIS supprimer du code existant qui fonctionne sans explication

### 3. Ne JAMAIS faire plusieurs choses à la fois

- **UNE fonctionnalité par session**
- Terminer complètement une tâche avant d'en commencer une autre
- Si une tâche est trop grosse, la découper et demander validation du plan

### 4. Toujours commiter

- `git add . && git commit -m "type: description"` après chaque étape fonctionnelle
- Types : `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `chore:`
- Messages en français

---

## Règles de code

### TypeScript
- **INTERDIT** : `any`, `as any`, `@ts-ignore`, `@ts-nocheck`
- Typer explicitement toutes les props, retours de fonction, et états
- Types partagés dans `src/types/`

### Composants React
- Composants fonctionnels uniquement (pas de classes)
- **Maximum 150 lignes** par composant (idéal < 100)
- **Maximum absolu 300 lignes** → au-delà, découper obligatoirement
- Un composant = un fichier
- Nommage fichiers : `kebab-case.tsx`
- Nommage composants : `PascalCase`

### Si un composant dépasse 150 lignes
1. Extraire les sous-composants dans des fichiers séparés
2. Extraire la logique dans des hooks custom (`src/hooks/`)
3. Extraire les types dans `src/types/`
4. Extraire les utilitaires dans `src/lib/`

### API Routes
- Validation des inputs avec Zod
- Format de réponse : `{ success: boolean, data?: T, error?: string }`
- Gestion d'erreurs avec try/catch systématique
- Vérification du rôle utilisateur sur chaque endpoint

### Prisma
- Toujours utiliser `select` ou `include` — jamais de `findMany()` sans filtre
- Pagination obligatoire sur les listes : `take` + `skip` ou `cursor`
- Transactions pour les opérations multi-tables

---

## Workflow de travail

1. **Comprendre** : Lire la demande, consulter les specs si besoin
2. **Planifier** : Expliquer ce que tu vas faire AVANT de coder
3. **Coder** : Implémenter une seule chose à la fois
4. **Vérifier** : `npm run build` + `npm run lint`
5. **Commiter** : Message descriptif en français
6. **Confirmer** : Dire ce qui a été fait et ce qui reste
7. **Documenter** : Mettre à jour `docs/CHANGELOG.md` en fin de session

---

## Design System & Conventions UI

### Logo Officiel ABJ
**Composant** : `@/components/ui/diamond-logo.tsx`
- Emoji diamond SVG adapté aux couleurs ABJ
- Couleurs : Or (#D4AF37, #FFD700) + Noir (#1a1a1a)
- Props : `size` (default 32), `className`

### Badges Statuts
**Constantes à utiliser** :
```typescript
STATUT_DOSSIER_COLORS = {
  RECU: 'badge-info',
  EN_COURS: 'badge-warning',
  COMPLET: 'badge-success',
  REFUSE: 'badge-error',
}

STATUT_FINANCEMENT_COLORS = {
  EN_ATTENTE: 'badge-warning',
  EN_COURS: 'badge-info',
  VALIDE: 'badge-success',
  REFUSE: 'badge-error',
}
```

### Score Candidat
**Fonction à utiliser** :
```typescript
const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-[rgb(var(--success))]'
  if (score >= 60) return 'text-[rgb(var(--warning))]'
  return 'text-[rgb(var(--error))]'
}
```

### Modals - Footer Sticky
**Pattern à suivre** (inspiré de `src/app/admin/eleves/page.tsx`) :
```tsx
<div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
  <div className="flex items-center justify-between">
    {/* Bouton gauche : action secondaire */}
    <button className="px-4 py-2 bg-[rgb(var(--secondary))] ...">
      <MessageSquare className="w-4 h-4" />
      Contacter
    </button>
    {/* Boutons droite : actions principales */}
    <div className="flex gap-2">
      <button className="...">Télécharger</button>
      <button className="bg-[rgb(var(--accent))] ...">Action principale</button>
    </div>
  </div>
</div>
```

### Onglets Type Dossier
**Pattern "Folder Tabs"** :
- Positionnement : En haut du modal avec `pt-4 px-4`
- Onglet actif : `bg-[rgb(var(--card))]` avec border-t-2 accent
- Onglet inactif : `bg-[rgb(var(--secondary))]` avec hover
- Icons : 4x4 avec couleur accent si actif
