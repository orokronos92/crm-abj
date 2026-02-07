# CRM ABJ - Architecture et Spécifications

## Vue d'ensemble
CRM pour l'Académie de Bijouterie Joaillerie (ABJ) avec 3 portails distincts:
- **Admin**: Gestion globale, utilisateurs, formations
- **Formateur**: Suivi des élèves, évaluations, planning
- **Élève**: Progression, notes, planning, gamification

## Stack Technique
- **Framework**: Next.js 16+ (App Router)
- **Auth**: NextAuth.js avec credentials provider
- **Styling**: CSS variables + Tailwind-like classes
- **UI**: Composants custom avec animations

## Architecture des Composants

### Providers (src/components/providers/)
- `auth-provider.tsx` - Contexte NextAuth pour l'authentification
- `client-layout.tsx` - Gestion du SplashScreen au niveau racine

### Layout (src/components/layout/)
- `dashboard-layout.tsx` - Layout principal des dashboards (sidebar + header)
- `sidebar.tsx` - Navigation latérale responsive

### UI (src/components/ui/)
- `splash-screen.tsx` - Écran de chargement animé avec logo diamant

## Flux d'Authentification

```
Arrivée sur le site
        ↓
   SplashScreen (4s, une seule fois par session)
        ↓
   Page de connexion (/connexion)
        ↓
   Authentification (NextAuth)
        ↓
   Redirection selon rôle:
   - admin    → /admin/dashboard
   - professeur → /formateur/dashboard  
   - eleve    → /eleve/dashboard
```

## Pattern SplashScreen

Le splashscreen est géré au niveau **racine** de l'application via `ClientLayout`:

1. Affiché **une seule fois** par session (stockage dans `sessionStorage`)
2. S'affiche **AVANT** l'authentification (pattern standard)
3. Durée: 4 secondes avec fade-out fluide
4. Le contenu de la page est masqué (opacity: 0) pendant le splash

## Comptes de Démo
- `admin@abj.fr` / `admin123` - Administrateur
- `formateur@abj.fr` / `formateur123` - Formateur
- `eleve@abj.fr` / `eleve123` - Élève

## Structure des Routes

```
/                      → Redirection vers dashboard ou connexion
/connexion             → Page de connexion
/admin/dashboard       → Dashboard admin
/admin/eleves          → Gestion des élèves
/admin/professeurs     → Gestion des professeurs
/admin/formations      → Gestion des formations
/admin/candidats       → Gestion des candidatures
/formateur/dashboard   → Dashboard formateur
/formateur/eleves      → Suivi des élèves
/formateur/planning    → Planning des cours
/eleve/dashboard       → Dashboard élève
/eleve/formation       → Suivi de formation
/eleve/progression     → Progression et compétences
```
