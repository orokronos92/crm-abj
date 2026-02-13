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

## Système de Notifications (SSE Temps Réel)

### Architecture
- **Server-Sent Events (SSE)** pour notifications temps réel
- **SSE Manager Singleton** côté serveur pour broadcast
- **Reconnexion automatique** après 5 secondes si déconnexion
- **Heartbeat** toutes les 30 secondes pour maintenir connexion

### Envoi de notifications (depuis n8n ou tests)
```bash
# Envoyer des notifications de test à l'UI admin
npx tsx scripts/send-notification-admin.ts 1  # 1 = une notification simple
npx tsx scripts/send-notification-admin.ts 2  # 2 = plusieurs exemples

# Envoyer des notifications de test pour formateur
npx tsx scripts/send-notification-formateur.ts

# Envoyer des notifications de test pour élève
npx tsx scripts/send-notification-eleve.ts
npx tsx scripts/send-notification-eleve.ts test  # Test filtrage par audience

# Test navigation complète (3 rôles)
npx tsx scripts/test-navigation-complete.ts
npx tsx scripts/test-navigation-complete.ts charge  # Test de charge (50 notifs)

# Test navigation formateur spécifique
npx tsx scripts/test-formateur-navigation.ts

# Test complet système SSE (connexion, envoi, action)
npx tsx scripts/test-sse-system.ts

# Test continu temps réel (envoie toutes les 5s)
npx tsx scripts/test-hook-sse.ts

# Test du filtrage par rôle (admin/formateur/élève)
npx tsx scripts/test-role-filtering.ts

# Vérifier les notifications en base
npx tsx scripts/check-notifications.ts
```

### Structure notification pour n8n (supporte snake_case ET camelCase)
```json
{
  "sourceAgent": "marjorie",        // ou source_agent
  "categorie": "CANDIDAT",
  "type": "NOUVEAU_DOSSIER",
  "priorite": "HAUTE",
  "titre": "Nouveau candidat - Marie Dupont",
  "message": "Dossier complet reçu pour formation CAP ATBJ",
  "audience": "ADMIN",
  "lienAction": "/admin/candidats/DUMI15092024"  // ou lien_action
}
```

### Endpoints disponibles
- `POST /api/notifications/ingest` — Réception notification simple (API Key requis)
- `POST /api/notifications/ingest/batch` — Réception batch multiple
- `GET /api/notifications/stream` — SSE temps réel (EventSource)
- `GET /api/notifications` — Récupération avec filtres
- `PATCH /api/notifications` — Marquer comme lu
- `POST /api/notifications/[id]/action` — Exécuter action + callback n8n

**API Key** : Dans `.env.local` → `NOTIFICATIONS_API_KEY`

### Comportement UI
- **Cloche badge** : Mise à jour temps réel sans refresh
- **Popup notifications** : Click → redirige vers page avec highlight
- **Page notifications** : Scroll automatique + animation pulse sur notification ciblée
- **Pas de boutons refresh** : SSE gère tout automatiquement
- **Filtrage par rôle** : Admin voit ADMIN seulement, Formateur voit FORMATEUR+TOUS, Élève voit ELEVE+TOUS
- **Détection automatique du rôle** : Basée sur l'URL (/admin, /formateur, /eleve)
- **Navigation intelligente** : Popup détecte le rôle et redirige vers la bonne page notifications

### Interfaces Notifications Complètes
- **Admin** : `/admin/notifications` - Toutes notifications admin (prospects, candidats, devis)
- **Formateur** : `/formateur/notifications` - Notifications formateur + globales (sessions, évaluations)
- **Élève** : `/eleve/notifications` - Notifications personnelles + globales (notes, planning, documents)

## Structure

```
src/
  app/
    (auth)/           # Login, register
    (admin)/          # Interface admin (7 vues)
    (formateur)/      # Interface formateur
      notifications/  # ✅ Page notifications formateur avec SSE
    (eleve)/          # Interface élève
      notifications/  # ✅ Page notifications élève avec SSE
    api/              # API Routes REST
  components/
    admin/            # Composants admin
    formateur/        # Composants formateur
      NotificationStats.tsx   # ✅ Stats notifications formateur
      NotificationFilters.tsx # ✅ Filtres notifications formateur
      NotificationCard.tsx    # ✅ Carte notification formateur
    eleve/            # Composants élève
      NotificationFiltersEleve.tsx # ✅ Filtres élève
      NotificationStatsEleve.tsx   # ✅ Stats élève
    shared/           # Composants partagés (MarjorieChat, etc.)
    ui/               # Composants UI de base
  lib/                # Utilitaires (prisma.ts, auth.ts, n8n.ts, sse-manager.ts)
  hooks/              # Hooks custom (use-notifications.ts avec SSE)
  types/              # Types TypeScript partagés
prisma/
  schema.prisma       # Schéma BDD complet
  migrations/         # Migrations SQL
  seed.ts             # Données initiales
scripts/              # Scripts utilitaires et tests
  seed-complete-dataset.ts        # ✅ Dataset professionnel complet (12 prospects, 20 candidats, 10 élèves, 7 formateurs)
  send-notification-admin.ts      # Test notifications admin
  send-notification-formateur.ts  # Test notifications formateur
  send-notification-eleve.ts      # ✅ Test notifications élève
  test-navigation-complete.ts     # ✅ Test complet 3 rôles
  test-sse-system.ts              # Test système SSE
  check-notifications.ts          # Vérification BDD
  test-dashboard-counts.ts        # ✅ Vérification compteurs dashboard
docs/                 # Spécifications (ne pas modifier sans demander)
```

## Documentation de référence

- @docs/spec.md — Spécifications fonctionnelles complètes
- @docs/architecture.md — Architecture technique et schéma BDD
- @docs/ui-analysis.md — Analyse des maquettes UI et mapping BDD
- @docs/CHANGELOG.md — Historique des modifications par session
- @docs/PROSPECTS-LIFECYCLE.md — Cycle de vie des prospects (IMPORTANT)
- @docs/notification-strategy-crm-abj.md — Stratégie notifications CRM ↔ n8n
- @docs/resume_last2.md — Session connexion BDD + cycle vie prospects
- @docs/resume_last3.md — Session système notifications SSE complet v1.1 (avec multi-interface)
- @docs/resume_last4.md — Session système documentaire Qualiopi + dataset professionnel complet
- @docs/resume_last6.md — Session refonte section Planning avec vues annuelles et gestion événements

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
- **7 tables n8n** : `prospects`, `candidats`, `documents_candidat`, `historique_emails`, `journal_erreurs`, `statuts_documents`, `types_documents` — Ces tables sont utilisées par les workflows n8n. Tu peux AJOUTER des champs mais JAMAIS modifier/supprimer les existants

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

#### Patterns Prisma qui FONCTIONNENT

**✅ Relations indirectes (Prospect → Candidat → Eleve)**
```typescript
// CORRECT : Utiliser la chaîne de relations
where: {
  candidats: {
    some: {
      eleve: {
        statutFormation: 'EN_COURS'
      }
    }
  }
}

// ❌ INCORRECT : Relation directe n'existe pas
where: {
  eleves: {
    some: { statutFormation: 'EN_COURS' }
  }
}
```

**✅ Filtrage avec notIn**
```typescript
where: {
  statutProspect: {
    notIn: ['CANDIDAT', 'ELEVE']
  }
}
```

**✅ Filtrage NULL côté TypeScript (pas Prisma)**
```typescript
// ❌ Ne fonctionne PAS avec Prisma
where: { statutDossier: { not: null } }

// ✅ Faire le filtrage côté TypeScript
const statuts = await prisma.candidat.findMany({
  distinct: ['statutDossier'],
  select: { statutDossier: true }
})
return statuts
  .map(s => s.statutDossier)
  .filter((s): s is string => s !== null)
```

**✅ Relations avec include/select**
```typescript
const candidat = await prisma.candidat.findUnique({
  where: { idCandidat },
  include: {
    prospect: {
      select: { nom: true, prenom: true, emails: true }
    },
    documentsCandidat: true
  }
})
```

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

---

## Logique Métier Critique : Cycle de Vie Prospects

**Documentation complète** : `@docs/PROSPECTS-LIFECYCLE.md`

### Règle Fondamentale
La table `prospects` est la **mémoire permanente**. Elle n'est JAMAIS vidée et trace tout le parcours d'une personne.

### Cycle de Vie
```
PROSPECT → candidate → CANDIDAT (actif)
    ↓ refusé                ↓ accepté + inscrit
ANCIEN_CANDIDAT         ELEVE (actif)
    ↓                       ↓ formation terminée
Peut recandidater      ANCIEN_ELEVE
```

### Statuts `statutProspect`
- `NOUVEAU` : Premier contact, jamais candidaté
- `EN_ATTENTE_DOSSIER` : Formulaire envoyé
- `CANDIDAT` : Admission en cours (**MASQUÉ page Prospects**)
- `ANCIEN_CANDIDAT` : Refusé ou abandonné (redevenu visible)
- `ELEVE` : Formation en cours (**MASQUÉ page Prospects**)
- `ANCIEN_ELEVE` : Formation terminée (redevenu visible)

### Filtrage Page Prospects
**Par défaut** : Afficher UNIQUEMENT prospects disponibles pour marketing
```typescript
where: {
  statutProspect: {
    notIn: ['CANDIDAT', 'ELEVE']
  }
}
```

**Raison** : Les campagnes marketing ne doivent PAS cibler les personnes actuellement en admission ou en formation.

### Relations BDD
```
prospects (1) → candidats (N) → eleves (1)
```
⚠️ **Attention** : La relation `Prospect → Eleve` est **indirecte** via `Candidat`

### Scripts Maintenance
- `update-statuts-lifecycle.ts` : Synchronise statutProspect avec relations BDD
- `test-prospect-filtrage.ts` : Vérifie logique filtrage

---

## Sections Admin UI Connectées

### Section Élèves

**Pattern** : Même architecture que candidats
- Canevas principal avec filtres server-side
- Modal détaillé 5 onglets sur click de ligne
- Server Components + Repository/Service

**Composants** :
- `ElevesPageClient.tsx` : Tableau interactif
- `ElevesFilters.tsx` : Filtres URL params
- `EleveDetailModal.tsx` : Modal avec Général/Notes/Présences/Documents/Planning

**Point d'attention** : Le mot `eval` est réservé, utiliser `evaluation` partout

### Section Formateurs - Conformité Qualiopi

**Architecture Modal 6 Onglets** :
1. **Profil** : Bio, contact, années d'expérience
2. **Compétences & Qualifications** : Diplômes, certifications, spécialités
3. **Expertise & Méthodes** : Pédagogie, outils, approche
4. **Maintien des Compétences** : Formations continues, veille
5. **Traçabilité Pédagogique** : Stats, témoignages, résultats
6. **Documents & Preuves** : 12 types organisés en 3 catégories

**Tables Documents Qualiopi** :
- `DocumentFormateur` : Documents avec expiration et validation
- `TypeDocumentFormateur` : 12 types (CV, CNI, RCP, DIPLOME, etc.)
- `DocumentRequis` : Exigences par formation

**Système Placeholders** :
```typescript
// Repository crée automatiquement des placeholders pour documents manquants
if (!existingDoc) {
  documentsWithPlaceholders.push({
    idDocument: 0,
    codeTypeDocument: type.code,
    statut: 'ATTENDU'
  })
}
```

**Vérification Qualiopi** :
- Méthode `checkQualiopi(id, useFullData)` uniforme
- Badge visuel liste : "Conforme" ou "X documents manquants"
- Seuls les documents obligatoires comptent pour le manquant

**16 Champs Ajoutés au Schema** :
- `cvUrl`, `qualificationsResume`, `dateValidationQualiopi`
- `anneesExperience`, `anneesEnseignement`, `bio`
- `methodesPedagogiques`, `approchePedagogique`, `outilsSupports`
- `competencesTechniques`, `portfolio`, `publicationsArticles`
- `satisfactionMoyenne`, `tauxReussite`, `nombreElevesFormes`
- `temoignagesEleves`, `formationsContinues`, `certifications`, `languesParlees`

### Section Planning - Gestion Stratégique

**Architecture 3 Onglets** :
1. **Salles** : Vue annuelle timeline avec taux d'occupation
2. **Formateurs** : Vue annuelle timeline avec disponibilités
3. **Événements** : Gestion complète création/édition

**Composants Modaux** :
- `MonthDetailModal.tsx` : Drill-down mensuel avec granularité jour/heure (195 lignes)
- `EvenementFormModal.tsx` : Formulaire création/édition événements (220 lignes)

**Fonctionnalités Clés** :
- Timeline annuelle 12 mois avec code couleur
- Sélecteur année 2026/2027 sur tous les onglets
- Click sur mois → modal détail jour/heure
- Salles : créneaux 9h-21h (6 blocs de 2h)
- Formateurs : créneaux Matin/Après-midi/Soir
- Alertes automatiques si <2 formateurs disponibles
- Gestion événements : 5 types (Portes ouvertes, Stage initiation, Réunion, Remise diplômes, Entretien)
- 9 salles disponibles (Ateliers A/B/C, Salle informatique, Salle théorie, etc.)

**Code Couleur Occupation Salles** :
- 🟢 Vert (≥80%) : Forte occupation
- 🟡 Jaune (50-79%) : Occupation moyenne
- 🔵 Bleu (<50%) : Faible occupation → opportunité marketing
- ⚪ Transparent : Aucune session

**Indicateurs Formateurs** :
- 📘 Icône livre : En session (occupé)
- ✅ Check vert : Disponible
- ❌ X rouge : Indisponible

### Scripts Maintenance
