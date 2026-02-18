# Scripts de Seed - CRM ABJ

## Vue d'ensemble

Deux scripts de seed indépendants pour peupler la base de données avec des données de test.

---

## 📊 Script 1 : Prospects (50 prospects)

**Fichier** : `seed-prospects.ts`

### Objectif
Créer 50 prospects réalistes pour tester le cycle de transformation :
- Prospect → Candidat → Élève

### Répartition des statuts
- **30 prospects** : `NOUVEAU` (jamais candidaté)
- **10 prospects** : `ANCIEN_CANDIDAT` (refusés ou abandons)
- **10 prospects** : `EN_ATTENTE_DOSSIER` (formulaire envoyé)

### Données générées
- Noms et prénoms français réalistes
- Emails et téléphones valides
- Adresses dans 12 grandes villes françaises
- Formations souhaitées (CAP_BJ, INIT_BJ, PERF_SERTI, CAO_DAO, GEMMO)
- Modes de financement variés (CPF, OPCO, Pôle Emploi, Personnel, Entreprise)
- Historique de contacts (0-90 jours dans le passé)

### Utilisation

```bash
# Exécuter le seed
npx tsx scripts/seed-prospects.ts

# Sortie attendue
🌱 Début du seed : 50 Prospects
✓ 10/50 prospects créés
✓ 20/50 prospects créés
✓ 30/50 prospects créés
✓ 40/50 prospects créés
✓ 50/50 prospects créés

✅ Seed terminé !
📊 Total : 50/50 prospects créés

Répartition des statuts :
  - NOUVEAU : 30 prospects
  - ANCIEN_CANDIDAT : 10 prospects
  - EN_ATTENTE_DOSSIER : 10 prospects
```

### ⚠️ Sécurité
Le script **ne supprime PAS** les prospects existants par défaut. Pour activer la suppression, décommenter la ligne :
```typescript
// await prisma.prospect.deleteMany({})
```

---

## 👨‍🏫 Script 2 : Formateurs (10 formateurs)

**Fichier** : `seed-formateurs.ts`

### Objectif
Créer 10 formateurs avec profils complets et comptes utilisateurs.

### Profils créés
1. **Laurent Dupont** - Sertissage & Joaillerie (550€/jour, 25 ans exp.)
2. **Marie Bernard** - Joaillerie & Création (600€/jour, 18 ans exp.)
3. **Thomas Petit** - CAO/DAO & 3D (650€/jour, 10 ans exp.)
4. **Sophie Lefebvre** - Gemmologie & Expertise (500€/jour, 15 ans exp.)
5. **Nicolas Dubois** - Techniques de base (450€/jour, 12 ans exp.)
6. **Catherine Moreau** - Histoire de l'art (400€/jour, 20 ans exp.)
7. **Philippe Rousseau** - Polissage & Finition (500€/jour, 22 ans exp.)
8. **Isabelle Garnier** - Taille lapidaire (550€/jour, 16 ans exp.)
9. **Alexandre Lambert** - Fonte cire perdue (480€/jour, 14 ans exp.)
10. **Claire Fontaine** - Restauration (520€/jour, 19 ans exp.)

### Données générées
- **Compte utilisateur** avec role `professeur`
- **Email professionnel** : `prenom.nom@formateur-abj.fr`
- **Mot de passe temporaire** : `formateurX2026` (X = numéro 1-10)
- **Fiche formateur complète** :
  - Spécialités
  - Tarif journalier
  - Biographie professionnelle
  - Années d'expérience
  - SIRET
  - Méthodes pédagogiques
  - Statut ACTIF

### Utilisation

```bash
# Exécuter le seed
npx tsx scripts/seed-formateurs.ts

# Sortie attendue
🌱 Début du seed : 10 Formateurs
✓ 1/10 - Laurent Dupont créé (SERTISSAGE, JOAILLERIE)
✓ 2/10 - Marie Bernard créé (JOAILLERIE, CREATION)
✓ 3/10 - Thomas Petit créé (CAO_DAO, MODELISATION_3D)
...
✓ 10/10 - Claire Fontaine créé (RESTAURATION, REPARATION)

✅ Seed terminé !
📊 Total : 10/10 formateurs créés

📝 Mots de passe temporaires :
  - Formateur 1 : formateur12026
  - Formateur 2 : formateur22026
  ...
  - Formateur 10 : formateur102026

⚠️  Les formateurs devront compléter leur dossier Qualiopi (12 documents)
```

### ⚠️ Sécurité
Le script **ne supprime PAS** les formateurs existants par défaut. Pour activer la suppression, décommenter la ligne :
```typescript
// await prisma.formateur.deleteMany({})
```

---

## 🔄 Workflow recommandé

### 1. Peupler la base initiale
```bash
# Créer les formateurs d'abord
npx tsx scripts/seed-formateurs.ts

# Puis créer les prospects
npx tsx scripts/seed-prospects.ts
```

### 2. Transformer les prospects en candidats
Via l'interface admin :
1. Aller sur `/admin/prospects`
2. Sélectionner un prospect `NOUVEAU`
3. Envoyer le dossier de candidature
4. Le prospect passe en `EN_ATTENTE_DOSSIER`

Via n8n (automatique) :
- Marjorie traite les emails
- Crée automatiquement les candidats
- Met à jour les statuts

### 3. Transformer les candidats en élèves
1. Valider le dossier du candidat
2. Envoyer le devis
3. Valider le financement
4. Inscrire dans une session
5. Le candidat devient élève avec `statut_formation: EN_COURS`

---

## 📝 Notes importantes

### Données réalistes
- Noms, prénoms et villes françaises
- Emails avec domaines variés (gmail, yahoo, hotmail, orange, free)
- Téléphones mobiles français (06/07)
- Dates de contact dans le passé (cohérence temporelle)

### Isolation des scripts
- Les deux scripts sont **complètement indépendants**
- Peuvent être exécutés séparément ou ensemble
- Aucune dépendance entre eux

### Gestion des erreurs
- Les erreurs de création sont catchées individuellement
- Le script continue même si un élément échoue
- Rapport final avec compteur de succès

### Performance
- Création séquentielle (pas de batch)
- ~2-3 secondes pour 50 prospects
- ~1-2 secondes pour 10 formateurs

---

## 🚀 Déploiement VPS

Pour exécuter sur le VPS :

```bash
# Se connecter au VPS
ssh user@vps-abj.fr

# Aller dans le dossier du projet
cd /path/to/crm_abj

# Exécuter les seeds
npx tsx scripts/seed-formateurs.ts
npx tsx scripts/seed-prospects.ts
```

---

**Dernière mise à jour** : 18 février 2026
**Version** : 1.0
**Auteur** : Claude Code
