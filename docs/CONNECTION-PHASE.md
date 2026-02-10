# Phase de Connexion UI-BDD — CRM ABJ

## 📊 Vue d'ensemble

Ce document trace l'évolution complète de la phase de connexion entre l'interface utilisateur et la base de données PostgreSQL.

**Date de début** : 2026-02-09
**Architecture cible** : Services → Repositories → Prisma → PostgreSQL
**Environnement** : ~~Local (Docker)~~ → PostgreSQL Windows natif (changé suite problèmes réseau Docker)
**État actuel** : Architecture services/repositories créée ✅

---

## 🏗️ Architecture de Connexion

### Principe de Séparation des Responsabilités

```
┌─────────────────────────────────────────┐
│            PAGE (Server Component)       │
│         Récupère les données du service  │
└─────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────┐
│              SERVICE LAYER               │
│    Logique métier, calculs, agrégations  │
└─────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────┐
│             REPOSITORY LAYER             │
│        Requêtes Prisma pures             │
└─────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────┐
│              DATABASE                    │
│        PostgreSQL (Windows Local)        │
└─────────────────────────────────────────┘
```

### Règles d'Architecture

| Couche | Responsabilité | Ce qu'on y fait | Ce qu'on n'y fait PAS |
|--------|---------------|-----------------|----------------------|
| **Page/Component** | Présentation | Affichage, formatage, styles | Requêtes BDD, calculs |
| **Service** | Logique métier | Calculs, agrégations, règles business | Requêtes SQL directes |
| **Repository** | Accès données | Requêtes Prisma simples | Logique métier, calculs |

---

## 📈 État d'Avancement Global

### Interfaces à Connecter

- [ ] **Admin** (13 pages)
  - [ ] Dashboard
  - [ ] Candidats
  - [ ] Prospects
  - [ ] Élèves
  - [ ] Formateurs
  - [ ] Sessions
  - [ ] Planning
  - [ ] Stats
  - [ ] Notifications
  - [ ] Settings
  - [ ] Marjorie
- [ ] **Formateur** (5 pages)
- [ ] **Élève** (4 pages)

---

## 🎯 Dashboard Admin - Analyse Détaillée

### Composants et Sources de Données

#### ✅ CONNEXION DIRECTE (peuvent être connectés immédiatement)

| Composant | Requête BDD | Table(s) | Priorité |
|-----------|-------------|----------|----------|
| **Card Prospects Total** | `COUNT(*) FROM prospects` | prospects | P1 |
| Sous-métrique "+8 cette semaine" | `COUNT(*) WHERE date_premier_contact >= NOW() - 7 days` | prospects | P2 |
| **Card Candidats Actifs** | `COUNT(*) FROM candidats` | candidats | P1 |
| Sous-métrique "18 en cours" | `COUNT(*) WHERE statut_dossier = 'EN_COURS'` | candidats | P1 |
| **Card Élèves Formation** | `COUNT(*) FROM eleves WHERE statut_formation = 'EN_COURS'` | eleves | P1 |
| **Section Derniers Prospects** | `SELECT * FROM prospects ORDER BY date_premier_contact DESC LIMIT 3` | prospects | P1 |
| **Graphique Formations** | `SELECT formation_principale, COUNT(*) GROUP BY formation_principale` | prospects | P2 |

#### ⚠️ CALCULS NÉCESSAIRES (requêtes multiples + logique)

| Composant | Calcul | Tables | Complexité |
|-----------|--------|--------|------------|
| **Taux de Conversion** | `(COUNT(eleves) / COUNT(prospects)) * 100` | eleves, prospects | Moyenne |
| **CA Réalisé** | `SUM(montant_total_formation) WHERE statut_financement = 'VALIDE'` | candidats | Simple |
| **CA Prévisionnel** | `SUM(montant_total_formation) WHERE statut IN [...]` | candidats | Simple |
| **Variations %** | Comparaison période actuelle vs précédente | Toutes | Complexe |

#### ❌ NON DISPONIBLE (données manquantes)

| Composant | Problème | Solution |
|-----------|----------|----------|
| **Activité Récente** | Pas de table logs/activités | Créer système de logs OU agréger plusieurs sources |
| **Dossiers Complets** | Logique métier non définie | Définir critères "dossier complet" |

---

## 📋 Page Candidats - Analyse

### Structure des Composants

```
CandidatsPage/
├── CandidatsHeader
│   ├── SearchBar
│   └── FilterButtons
├── CandidatsStats (4 cards)
├── CandidatsTable
│   ├── TableHeader
│   ├── TableRow (x N)
│   └── Pagination
└── CandidatModal
    ├── ModalHeader
    ├── TabsNavigation
    ├── TabGeneral
    ├── TabParcours
    ├── TabDocuments
    ├── TabFinancement
    ├── TabNotesIA
    └── ModalFooter
```

### Sources de Données

| Composant | Source | Complexité |
|-----------|--------|------------|
| CandidatsStats | Agrégations COUNT/SUM | Simple |
| CandidatsTable | JOIN candidats + prospects | Moyenne |
| CandidatModal | JOIN candidats + prospects + documents_candidat | Complexe |

---

## 🛠️ Services à Créer

### 1. DashboardService

```typescript
// src/services/dashboard.service.ts
class DashboardService {
  // Stats simples
  getProspectsStats(): { total, new, variation }
  getCandidatsStats(): { total, enCours, variation }
  getElevesStats(): { total, actifs, variation }

  // Calculs
  getFinanceStats(): { caRealise, caPrevisionnel, progression }
  getTauxConversion(): { taux, variation }

  // Listes
  getDerniersProspects(limit: number): Prospect[]
  getFormationsStats(): FormationStat[]
}
```

### 2. CandidatService

```typescript
// src/services/candidat.service.ts
class CandidatService {
  // CRUD
  getAllCandidats(filters, pagination): { data, total }
  getCandidatById(id): CandidatDetail
  updateCandidatStatut(id, statut): Candidat

  // Stats
  getCandidatsStats(): CandidatStats

  // Documents
  getCandidatDocuments(id): Document[]
  uploadDocument(candidatId, file): Document
}
```

### 3. ProspectService

```typescript
// src/services/prospect.service.ts
class ProspectService {
  getAllProspects(filters, pagination): { data, total }
  getProspectById(id): ProspectDetail
  convertToCandidat(prospectId): Candidat
  updateProspect(id, data): Prospect
}
```

---

## 📁 Repositories à Créer

### 1. DashboardRepository

```typescript
// src/repositories/dashboard.repository.ts
class DashboardRepository {
  // Counts simples
  getProspectsCount(): number
  getProspectsCountByDateRange(start, end): number
  getCandidatsCount(): number
  getCandidatsCountByStatut(statut): number
  getElevesCount(): number
  getElevesActifs(): number

  // Données pour calculs
  getCandidatsFinanciers(): CandidatFinance[]
  getProspectsRecents(limit): Prospect[]
}
```

---

## 📅 Planning de Connexion

### Sprint 1 : Infrastructure (2 jours)
- [ ] Créer structure dossiers services/repositories
- [ ] Configurer Prisma Client singleton
- [ ] Créer services de base
- [ ] Créer repositories de base
- [ ] Tester connexion BDD

### Sprint 2 : Dashboard (3 jours)
- [ ] Connecter cards statistiques
- [ ] Connecter derniers prospects
- [ ] Implémenter calculs CA
- [ ] Implémenter taux conversion
- [ ] Connecter graphique formations

### Sprint 3 : Page Candidats (4 jours)
- [ ] Connecter liste candidats
- [ ] Implémenter pagination
- [ ] Connecter filtres/recherche
- [ ] Connecter modal détail (5 onglets)
- [ ] Implémenter actions (changement statut)

### Sprint 4 : Page Prospects (2 jours)
- [ ] Connecter liste prospects
- [ ] Connecter panel détail
- [ ] Implémenter conversion prospect → candidat

### Sprint 5 : Page Élèves (3 jours)
- [ ] Connecter grille élèves
- [ ] Connecter fiche détaillée
- [ ] Connecter évaluations
- [ ] Connecter présences

---

## 🔄 Décisions d'Architecture Prises

### 2026-02-09
1. **Séparation Service/Repository** : Adoptée pour séparer logique métier et accès données
2. **Calculs côté Service** : Tous les calculs se font dans la couche service, jamais dans les composants
3. **Server Components** : Utilisation maximale pour le data fetching
4. **Connexion Progressive** : Composant par composant plutôt que page entière
5. **Changement BDD** : Migration de Docker vers PostgreSQL Windows natif (problèmes réseau Docker/Prisma)
6. **Architecture créée** : Services et Repositories pour Dashboard, Candidats, Prospects

---

## 📝 Notes Importantes

### Points d'Attention
- Les variations % nécessitent un système d'historique (à implémenter)
- L'activité récente nécessite un système de logs (à créer)
- Les dossiers complets nécessitent une définition métier claire

### Compatibilité Local/VPS
- Même schéma Prisma
- Même seed structure
- Seul changement : DATABASE_URL dans .env

---

## 📅 Historique des Actions

### Session du 09/02/2026

#### ✅ Réalisé
1. **Ajout tuile Formateurs** dans le Dashboard admin (5ème tuile)
2. **Tentative connexion Docker PostgreSQL** :
   - Problème d'authentification Prisma ↔ Docker
   - Modification pg_hba.conf (trust, md5) sans succès
   - Problème réseau Windows/Docker identifié (localhost vs 127.0.0.1 vs IPv6)
3. **Installation PostgreSQL 17.7 Windows natif** :
   - Installation réussie sans configuration initiale
   - Base `abj_crm_dev` déjà existante avec données de seed
   - Connexion Prisma fonctionnelle ✅
4. **Architecture Services/Repositories créée** :
   - `dashboard.repository.ts` : 15 méthodes de requêtes
   - `dashboard.service.ts` : Logique métier, calculs CA, taux conversion
   - `candidat.repository.ts` : CRUD complet candidats
   - `candidat.service.ts` : Transformation données, calcul scores
   - `prospect.repository.ts` : Gestion prospects
   - Types TypeScript créés

#### 📊 État Base de Données
- **15 prospects** présents
- **19 tables** créées et fonctionnelles
- Connexion locale : `postgresql://postgres@localhost:5432/abj_crm_dev`
- Pas de mot de passe configuré (dev local)

## 🚀 Prochaines Étapes

1. Créer l'inventaire complet des composants
2. Créer les premiers services/repositories
3. Connecter le premier composant du Dashboard
4. Valider l'architecture avec un cas simple
5. Généraliser à tous les composants

---

**Dernière mise à jour** : 2026-02-09
**Auteur** : Claude Code
**Version** : 1.0