# CRM ABJ - Académie de Bijouterie Joaillerie

## 🚀 Vue d'ensemble

CRM sur mesure pour l'Académie de Bijouterie Joaillerie (ABJ) construit avec Next.js 16, TypeScript et PostgreSQL. Le système gère les candidatures, formations, et communications avec l'assistance de l'IA Marjorie.

## 🛠️ Stack Technique

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS v4
- **Base de données**: PostgreSQL 16 avec Prisma ORM
- **Authentification**: NextAuth.js
- **IA**: Intégration Marjorie via webhooks n8n

## 📁 Structure du Projet

```
src/
├── app/                    # Pages Next.js App Router
│   ├── api/               # API Routes
│   ├── admin/             # Interface administrateur
│   ├── formateur/         # Interface formateur
│   ├── eleve/             # Interface élève
│   └── connexion/         # Page de connexion
├── components/            # Composants React
│   ├── ui/               # Composants UI de base
│   └── providers/        # Providers (Auth, etc.)
├── lib/                   # Utilitaires et configurations
├── types/                 # Types TypeScript
├── config/                # Configurations (auth, constantes)
└── hooks/                 # Custom React hooks
```

## 🚀 Installation et Démarrage

### Prérequis

- Node.js 18+
- Docker Desktop (pour PostgreSQL)
- Git

### Installation

1. **Cloner le repository**
```bash
git clone [votre-repo]
cd crm_abj
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Démarrer la base de données**
```bash
docker-compose up -d
```

4. **Configurer les variables d'environnement**
Le fichier `.env` est déjà configuré avec les valeurs de développement.

5. **Initialiser la base de données**
```bash
npm run db:push
npm run db:seed
```

6. **Démarrer le serveur de développement**
```bash
npm run dev
```

Accéder à l'application : http://localhost:3000

## 🔐 Comptes de Test

Après le seed de la base de données, vous pouvez vous connecter avec :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@abj.fr | ABJ2024! |
| Formateur | formateur@abj.fr | ABJ2024! |
| Élève | eleve@abj.fr | ABJ2024! |

## 📝 Scripts Disponibles

```bash
npm run dev         # Démarrage en développement
npm run build       # Build de production
npm run start       # Démarrage en production
npm run lint        # Vérification du code
npm run db:push     # Sync schéma Prisma avec BDD
npm run db:seed     # Données initiales
npm run db:studio   # Interface Prisma Studio
```

## 🎯 Fonctionnalités Principales

### Pour les Administrateurs
- Gestion complète des prospects et candidatures
- Planification des sessions de formation
- Validation des documents
- Génération de devis et attestations
- Chat avec Marjorie pour automatisation

### Pour les Formateurs
- Consultation du planning
- Gestion des disponibilités
- Saisie des notes et appréciations
- Suivi de présence des élèves

### Pour les Élèves
- Consultation du parcours de formation
- Accès aux documents
- Suivi de progression
- Téléchargement d'attestations

## 🔄 État du Projet

### ✅ Implémenté
- Structure complète du projet
- Authentification 3 rôles avec NextAuth
- Base de données PostgreSQL avec 23 tables
- API Routes de base (prospects, candidats)
- Composants UI réutilisables
- Pages dashboard pour chaque rôle
- Middleware de protection des routes
- Seed avec données de test

### 📋 À Faire
- Interface chat Marjorie
- Intégration webhooks n8n
- Gestion complète des candidatures
- Module de génération de documents
- Interface de gestion des formations
- Tableaux de données avec filtres
- Export Excel/PDF
- Tests unitaires et E2E

## 🐛 Dépannage

### Erreur de connexion à la base de données
1. Vérifier que Docker Desktop est lancé
2. Relancer les conteneurs : `docker-compose restart`
3. Vérifier les logs : `docker-compose logs postgres`

### Erreur d'authentification
1. Vérifier le NEXTAUTH_SECRET dans `.env`
2. Vider les cookies du navigateur
3. Redémarrer le serveur de développement

## 📚 Documentation

- [Next.js](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org)
- [Tailwind CSS](https://tailwindcss.com)

## 🤝 Contribution

Pour contribuer au projet :
1. Créer une branche feature
2. Commiter les changements
3. Pousser vers la branche
4. Créer une Pull Request

## 📄 Licence

Propriétaire - Académie de Bijouterie Joaillerie (ABJ)