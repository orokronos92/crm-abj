---
name: ui-components
description: Conventions UI et patterns de composants pour le CRM ABJ. Utiliser quand on crée ou modifie des composants React, pages, ou layouts.
---

# Conventions UI — CRM ABJ

## 3 interfaces, même codebase

| Rôle | Route group | Design |
|------|-------------|--------|
| Admin | `(admin)/` | Professionnel, tableaux, dashboards |
| Formateur | `(formateur)/` | Professionnel, focus élèves/planning |
| Élève | `(eleve)/` | Moderne/gaming, immersif, motivant |

## Structure d'un composant type

```typescript
// src/components/admin/candidat-card.tsx
import type { Candidat } from '@/types/candidat'

interface CandidatCardProps {
  candidat: Candidat
  onSelect?: (id: number) => void
}

export function CandidatCard({ candidat, onSelect }: CandidatCardProps) {
  return (
    // JSX < 100 lignes
  )
}
```

## Règles de découpage

Un composant qui affiche une fiche détaillée (ex: fiche candidat) :

```tsx
// ❌ INTERDIT — un seul fichier de 300+ lignes
function CandidatFiche() { /* tout dedans */ }

// ✅ OBLIGATOIRE — découpé
function CandidatFiche({ candidat }: Props) {
  return (
    <>
      <CandidatHeader candidat={candidat} />
      <CandidatInfos candidat={candidat} />
      <CandidatParcours etapes={candidat.etapes} />
      <CandidatDocuments documents={candidat.documents} />
      <CandidatFinancement candidat={candidat} />
      <CandidatNotesIA notes={candidat.notes_ia} />
    </>
  )
}
```

## Composants partagés (`src/components/shared/`)

- `marjorie-chat.tsx` — Chat Marjorie (utilisé par les 3 rôles)
- `stat-card.tsx` — Carte statistique dashboard
- `status-badge.tsx` — Badge coloré pour les statuts
- `data-table.tsx` — Tableau de données avec tri/filtre/pagination
- `document-viewer.tsx` — Affichage liste documents avec statuts
- `sidebar-nav.tsx` — Navigation latérale

## Composants UI de base (`src/components/ui/`)

- `button.tsx`, `input.tsx`, `select.tsx`, `textarea.tsx`
- `card.tsx`, `dialog.tsx`, `dropdown.tsx`
- `loading.tsx`, `error-boundary.tsx`

## Couleurs et thème

Utiliser les CSS variables définies dans `globals.css` :
- `var(--background)`, `var(--foreground)` pour le thème clair/sombre
- Classes Tailwind standard pour les couleurs métier :
  - Succès/validé : `text-emerald-*`, `bg-emerald-*`
  - En attente : `text-amber-*`, `bg-amber-*`
  - Erreur/refusé : `text-red-*`, `bg-red-*`
  - Info/neutre : `text-blue-*`, `bg-blue-*`

## Statut badges — mapping couleurs

```typescript
const STATUT_COLORS: Record<string, string> = {
  // Candidat
  RECU: 'bg-blue-100 text-blue-800',
  DOSSIER_EN_COURS: 'bg-amber-100 text-amber-800',
  DOSSIER_COMPLET: 'bg-emerald-100 text-emerald-800',
  ACCEPTE: 'bg-emerald-100 text-emerald-800',
  REFUSE: 'bg-red-100 text-red-800',
  INSCRIT: 'bg-purple-100 text-purple-800',
  // Financement
  EN_ATTENTE: 'bg-gray-100 text-gray-800',
  EN_COURS: 'bg-amber-100 text-amber-800',
  VALIDE: 'bg-emerald-100 text-emerald-800',
  // Documents
  ATTENDU: 'bg-gray-100 text-gray-800',
  A_VALIDER: 'bg-amber-100 text-amber-800',
}
```

## Responsive

- Mobile-first avec Tailwind breakpoints
- Admin : desktop prioritaire (tableaux larges)
- Élève : mobile prioritaire (consultation en déplacement)
- Formateur : tablette prioritaire (usage en salle)
