# Inventaire des Composants — CRM ABJ

## 📊 Vue d'ensemble

Inventaire exhaustif de tous les composants du CRM avec leurs dépendances de données et leur état de connexion.

**Total composants** : ~150+ (estimé)
**Composants connectés** : 0
**Composants mockés** : Tous

---

## 🎨 Composants UI de Base (Réutilisables)

### /src/components/ui/

| Composant | Rôle | Données | État |
|-----------|------|---------|------|
| `badge.tsx` | Badges statuts | Props only | ✅ Stateless |
| `button.tsx` | Boutons | Props only | ✅ Stateless |
| `card.tsx` | Cartes conteneurs | Props only | ✅ Stateless |
| `diamond-logo.tsx` | Logo ABJ | Props only | ✅ Stateless |
| `input.tsx` | Champs de saisie | Props only | ✅ Stateless |
| `label.tsx` | Labels formulaires | Props only | ✅ Stateless |
| `splash-screen.tsx` | Écran de démarrage | Props only | ✅ Stateless |

---

## 🏗️ Composants Layout

### /src/components/layout/

| Composant | Rôle | Données Nécessaires | État |
|-----------|------|-------------------|------|
| `dashboard-layout.tsx` | Layout principal avec sidebar | Session user | 🔴 Mocké |
| `sidebar.tsx` | Menu latéral navigation | Role user, routes | 🔴 Mocké |

### /src/components/providers/

| Composant | Rôle | Données | État |
|-----------|------|---------|------|
| `auth-provider.tsx` | Context authentification | Session | 🔴 Mocké |
| `client-layout.tsx` | Wrapper client components | None | ✅ OK |

---

## 📱 Interface ADMIN

### 1. Dashboard (/admin/dashboard)

| Composant | Localisation | Données Nécessaires | Source | État |
|-----------|-------------|-------------------|---------|------|
| **StatsCards** (x4) | Inline | COUNT prospects, candidats, eleves, conversion | prospects, candidats, eleves | 🔴 Mocké |
| **FinanceCard** | Inline | SUM montants candidats | candidats | 🔴 Mocké |
| **FormationsChart** | Inline | GROUP BY formation | prospects/candidats | 🔴 Mocké |
| **ProspectsTable** | Inline | Last 3 prospects | prospects | 🔴 Mocké |
| **ActivityFeed** | Inline | Logs activités | ❌ N'existe pas | 🔴 Mocké |

### 2. Candidats (/admin/candidats)

| Composant | Localisation | Données Nécessaires | Source | État |
|-----------|-------------|-------------------|---------|------|
| **SearchBar** | Inline | - | - | ✅ Stateless |
| **FilterButtons** | Inline | Statuts possibles | Enum/Const | ✅ Stateless |
| **CandidatsTable** | Inline | Liste candidats + prospects | JOIN candidats/prospects | 🔴 Mocké |
| **CandidatRow** | Inline | Candidat details | candidats | 🔴 Mocké |
| **CandidatModal** | Inline | Candidat complet | candidats + documents + prospect | 🔴 Mocké |
| ├── **TabGeneral** | Inline | Info base candidat | candidats, prospects | 🔴 Mocké |
| ├── **TabParcours** | Inline | Étapes admission | candidats | 🔴 Mocké |
| ├── **TabDocuments** | Inline | Liste documents | documents_candidat | 🔴 Mocké |
| ├── **TabFinancement** | Inline | Infos financières | candidats | 🔴 Mocké |
| └── **TabNotesIA** | Inline | Analyse Marjorie | candidats.notes_ia | 🔴 Mocké |

### 3. Prospects (/admin/prospects)

| Composant | Localisation | Données Nécessaires | Source | État |
|-----------|-------------|-------------------|---------|------|
| **ProspectsFilters** | Inline | Sources, statuts | Enums | ✅ Stateless |
| **ProspectsGrid** | Inline | Liste prospects | prospects | 🔴 Mocké |
| **ProspectCard** | Inline | Prospect details | prospects | 🔴 Mocké |
| **ProspectDetailPanel** | Inline | Prospect complet | prospects + historique_emails | 🔴 Mocké |
| **NewProspectButton** | Inline | - | - | ✅ Stateless |

### 4. Élèves (/admin/eleves)

| Composant | Localisation | Données Nécessaires | Source | État |
|-----------|-------------|-------------------|---------|------|
| **ElevesGrid** | Inline | Liste élèves | eleves + formations | 🔴 Mocké |
| **EleveCard** | Inline | Résumé élève | eleves | 🔴 Mocké |
| **EleveModal** | Inline | Élève complet | eleves + evaluations + presences | 🔴 Mocké |
| ├── **InfoGenerales** | Inline | Infos base | eleves | 🔴 Mocké |
| ├── **Evaluations** | Inline | Notes | evaluations | 🔴 Mocké |
| ├── **Presences** | Inline | Assiduité | presences | 🔴 Mocké |
| └── **Documents** | Inline | Documents élève | documents_candidat | 🔴 Mocké |

### 5. Formateurs (/admin/formateurs)

| Composant | Localisation | Données Nécessaires | Source | État |
|-----------|-------------|-------------------|---------|------|
| **FormateursGrid** | Inline | Liste formateurs | formateurs | 🔴 Mocké |
| **FormateurCard** | Inline | Résumé formateur | formateurs | 🔴 Mocké |
| **FormateurModal** | Inline | Formateur complet | formateurs + sessions + eleves | 🔴 Mocké |

### 6. Sessions (/admin/sessions)

| Composant | Localisation | Données Nécessaires | Source | État |
|-----------|-------------|-------------------|---------|------|
| **SessionsTable** | Inline | Liste sessions | sessions + formations + formateurs | 🔴 Mocké |
| **SessionRow** | Inline | Session résumé | sessions | 🔴 Mocké |
| **NewSessionModal** | Inline | Formulaire création | formations, formateurs, salles | 🔴 Mocké |

### 7. Planning (/admin/planning)

| Composant | Localisation | Données Nécessaires | Source | État |
|-----------|-------------|-------------------|---------|------|
| **CalendarView** | Inline | Sessions + disponibilités | sessions, disponibilites_formateurs | 🔴 Mocké |
| **TimelineView** | Inline | Planning temporel | sessions | 🔴 Mocké |
| **ResourceView** | Inline | Occupation salles | salles, reservations_salles | 🔴 Mocké |

### 8. Stats (/admin/stats)

| Composant | Localisation | Données Nécessaires | Source | État |
|-----------|-------------|-------------------|---------|------|
| **ConversionFunnel** | Inline | Pipeline stats | prospects, candidats, eleves | 🔴 Mocké |
| **FinanceCharts** | Inline | CA, prévisions | candidats | 🔴 Mocké |
| **FormationsStats** | Inline | Stats formations | Toutes tables | 🔴 Mocké |
| **TimeSeriesChart** | Inline | Évolution temporelle | Historique | 🔴 Mocké |

### 9. Notifications (/admin/notifications)

| Composant | Localisation | Données Nécessaires | Source | État |
|-----------|-------------|-------------------|---------|------|
| **NotificationsList** | Inline | Alertes système | ❌ Table manquante | 🔴 Mocké |
| **NotificationItem** | Inline | Alerte unique | ❌ Table manquante | 🔴 Mocké |

### 10. Settings (/admin/settings)

| Composant | Localisation | Données Nécessaires | Source | État |
|-----------|-------------|-------------------|---------|------|
| **GeneralSettings** | Inline | Config système | ❌ Config files | 🔴 Mocké |
| **UsersManagement** | Inline | Liste utilisateurs | utilisateurs | 🔴 Mocké |
| **EmailTemplates** | Inline | Templates emails | ❌ Table manquante | 🔴 Mocké |

### 11. Marjorie (/admin/marjorie)

| Composant | Localisation | Données Nécessaires | Source | État |
|-----------|-------------|-------------------|---------|------|
| **MarjorieChat** | À créer | Historique messages | historique_marjorie_crm | 🔴 À créer |
| **ChatMessage** | À créer | Message unique | - | 🔴 À créer |
| **ChatInput** | À créer | - | - | 🔴 À créer |

---

## 👨‍🏫 Interface FORMATEUR

### Pages principales

| Page | Composants | Données | État |
|------|------------|---------|------|
| **Dashboard** | Stats, Alertes, Planning | eleves, sessions, evaluations | 🔴 Mocké |
| **Mes Élèves** | Liste, Filtres, Détail | eleves (filtrés) | 🔴 Mocké |
| **Mes Sessions** | Planning, Liste | sessions (filtrées) | 🔴 Mocké |
| **Évaluations** | Formulaire, Historique | evaluations | 🔴 Mocké |
| **Mon Planning** | Calendrier perso | disponibilites_formateurs | 🔴 Mocké |

---

## 🎓 Interface ÉLÈVE

### Pages principales

| Page | Composants | Données | État |
|------|------------|---------|------|
| **Dashboard** | Progression, Stats, Planning | eleves, evaluations, presences | 🔴 Mocké |
| **Mes Évaluations** | Notes, Moyennes | evaluations | 🔴 Mocké |
| **Mon Planning** | Emploi du temps | sessions, planning | 🔴 Mocké |
| **Mes Documents** | Liste, Téléchargement | documents_candidat | 🔴 Mocké |

---

## 📊 Statistiques d'Inventaire

### Par Interface
- **Admin** : ~80 composants
- **Formateur** : ~30 composants
- **Élève** : ~20 composants
- **Partagés** : ~20 composants

### Par État
- ✅ **Stateless** : 15 composants (10%)
- 🔴 **Mockés** : 125 composants (83%)
- 🔴 **À créer** : 10 composants (7%)

### Par Complexité de Connexion
- **Simple** (1 table) : 40%
- **Moyenne** (2-3 tables JOIN) : 45%
- **Complexe** (4+ tables ou calculs) : 15%

---

## 🎯 Priorités de Connexion

### Phase 1 : Composants Critiques
1. Dashboard Stats Cards
2. Candidats Table + Modal
3. Prospects Grid
4. Authentication

### Phase 2 : Fonctionnalités Métier
1. Élèves complet
2. Formateurs
3. Sessions
4. Évaluations

### Phase 3 : Features Avancées
1. Planning dynamique
2. Marjorie Chat
3. Stats avancées
4. Notifications

---

## 📝 Composants à Créer

| Composant | Priorité | Complexité | Dépendances |
|-----------|----------|------------|-------------|
| `MarjorieChat` | P1 | Haute | Webhook n8n |
| `DataTable` (générique) | P1 | Moyenne | - |
| `Pagination` | P1 | Faible | - |
| `SearchWithFilters` | P1 | Moyenne | - |
| `StatsCard` (générique) | P1 | Faible | - |
| `DocumentUploader` | P2 | Haute | S3/Drive |
| `CalendarScheduler` | P3 | Très haute | - |

---

**Dernière mise à jour** : 2026-02-09
**Auteur** : Claude Code
**Version** : 1.0