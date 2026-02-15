# Résumé Session 9 : Modification Formulaire Profil Formateur - Alignement Schéma Prisma

**Date** : 15 février 2026
**Objectif principal** : Modifier le formulaire de profil formateur pour aligner tous les noms de champs avec le schéma Prisma

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Décision Stratégique](#décision-stratégique)
3. [Modifications par Section](#modifications-par-section)
4. [Problèmes Rencontrés](#problèmes-rencontrés)
5. [État Final](#état-final)

---

## Vue d'ensemble

Cette session fait suite à une session précédente où le formulaire de profil formateur devait être aligné avec le schéma Prisma. L'utilisateur avait le choix entre :
- **Option A** : Modifier le formulaire pour correspondre au schéma (moins risqué car formulaire non connecté)
- **Option B** : Modifier le schéma pour correspondre au formulaire

**Décision de l'utilisateur** : "option a modifie le formulaire pour correspondre au shema moin risqué le formulaire n'est pas encore connecte je croit"

### Travail Accompli

✅ **5 sections de formulaire modifiées** :
1. EtapeDiplomes
2. EtapeFormationsPedagogiques
3. EtapePortfolio
4. EtapeCompetences
5. EtapeFormationsContinues

⏳ **Vérification non terminée** : Problèmes de fichier de verrouillage Next.js ont empêché la vérification finale de compilation.

---

## Décision Stratégique

### Contexte
Le formulaire multi-étapes (`C:\crm_abj\src\app\formateur\profil\page.tsx`) collecte les qualifications des formateurs dans 7 sections :
1. Informations générales
2. Diplômes
3. Formations pédagogiques
4. Portfolio
5. Compétences techniques
6. Formations continues
7. Documents administratifs

Le fichier fait **36 707 tokens**, trop volumineux pour être lu entièrement d'un coup.

### Approche Adoptée
Modification systématique section par section avec TODO tracking :
- 6 tâches créées
- 5 terminées (modifications de formulaire)
- 1 en cours (vérification)

---

## Modifications par Section

### Section 1 : EtapeDiplomes (✅ TERMINÉ)

**Schéma Prisma** :
```prisma
model FormateurDiplome {
  nomDiplome      String    @map("nom_diplome")
  typeFormation   String?   @map("type_formation")  // ÉTAIT: niveau
  specialite      String?
  etablissement   String?                           // ÉTAIT: organisme
  dateObtention   DateTime? @map("date_obtention") @db.Date
  documentUrl     String?   @map("document_url")
}
```

#### Changements État

**Avant** :
```typescript
const [nouveauDiplome, setNouveauDiplome] = useState({
  nomDiplome: '',
  niveau: 'CAP',
  specialite: '',
  organisme: '',
  dateObtention: '',
  documentUrl: ''
})
```

**Après** :
```typescript
const [nouveauDiplome, setNouveauDiplome] = useState({
  nomDiplome: '',
  typeFormation: 'CAP',      // ✅ ÉTAIT: niveau
  specialite: '',
  etablissement: '',          // ✅ ÉTAIT: organisme
  dateObtention: '',
  documentUrl: ''
})
```

#### Changements Validation

**Ligne ~1249** :
```typescript
// AVANT
if (nouveauDiplome.nomDiplome && nouveauDiplome.organisme && nouveauDiplome.dateObtention)

// APRÈS
if (nouveauDiplome.nomDiplome && nouveauDiplome.etablissement && nouveauDiplome.dateObtention)
```

#### Changements Affichage

**Lignes ~1281-1292** :
```typescript
// Badge type de formation
<span className="px-2 py-0.5 rounded text-xs font-medium bg-[rgba(var(--accent),0.2)] text-[rgb(var(--accent))]">
  {diplome.typeFormation}  // ✅ ÉTAIT: diplome.niveau
</span>

// Établissement
<p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
  {diplome.etablissement}  // ✅ ÉTAIT: diplome.organisme
</p>
```

#### Changements Formulaire

**Lignes ~1341-1366** :
```typescript
// Label et select du type de formation
<label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
  Type de formation *  // ✅ ÉTAIT: "Niveau *"
</label>
<select
  value={nouveauDiplome.typeFormation}  // ✅ ÉTAIT: niveau
  onChange={(e) => setNouveauDiplome({ ...nouveauDiplome, typeFormation: e.target.value })}
>

// Label et input de l'établissement
<label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
  Établissement délivrant *  // ✅ ÉTAIT: "Organisme délivrant *"
</label>
<input
  value={nouveauDiplome.etablissement}  // ✅ ÉTAIT: organisme
  onChange={(e) => setNouveauDiplome({ ...nouveauDiplome, etablissement: e.target.value })}
/>
```

---

### Section 2 : EtapeFormationsPedagogiques (✅ TERMINÉ)

**Schéma Prisma** :
```prisma
model FormateurFormationPedagogique {
  intitule        String    @map("intitule")
  organisme       String?
  dateFormation   DateTime? @map("date_formation") @db.Date  // ✅ UN SEUL champ
  dureeHeures     Decimal?  @map("duree_heures") @db.Decimal(5, 2)
  certificatUrl   String?   @map("certificat_url")          // ✅ ÉTAIT: documentUrl
}
```

#### Changements État

**Avant** :
```typescript
const [nouvelleFormation, setNouvelleFormation] = useState({
  intitule: '',
  organisme: '',
  dateDebut: '',     // ❌ 2 champs de date
  dateFin: '',
  dureeHeures: '',
  documentUrl: '',   // ❌ Mauvais nom
  domaine: ''        // ❌ Pas dans le schéma
})
```

**Après** :
```typescript
const [nouvelleFormation, setNouvelleFormation] = useState({
  intitule: '',
  organisme: '',
  dateFormation: '',     // ✅ 1 seul champ
  dureeHeures: '',
  certificatUrl: ''      // ✅ Nom corrigé
})
```

#### Changements Validation

**Ligne ~864** :
```typescript
// AVANT
if (nouvelleFormation.intitule && nouvelleFormation.organisme && nouvelleFormation.dateDebut)

// APRÈS
if (nouvelleFormation.intitule && nouvelleFormation.organisme && nouvelleFormation.dateFormation)
```

#### Changements Affichage

**Lignes ~1068, 2015** (2 occurrences, utilisé `replace_all: true`) :
```typescript
// AVANT
<div>
  <span className="text-[rgb(var(--muted-foreground))]">Période : </span>
  <span className="text-[rgb(var(--foreground))]">
    {new Date(formation.dateDebut).toLocaleDateString('fr-FR')} -
    {new Date(formation.dateFin).toLocaleDateString('fr-FR')}
  </span>
</div>

// APRÈS
<div>
  <span className="text-[rgb(var(--muted-foreground))]">Date : </span>
  <span className="text-[rgb(var(--foreground))]">
    {new Date(formation.dateFormation).toLocaleDateString('fr-FR')}
  </span>
</div>
```

#### Changements Formulaire

**Structure grille modifiée** - De 2 colonnes (dateDebut/dateFin) à 1 champ unique :
```typescript
// AVANT: grid-cols-2 avec deux inputs de date

// APRÈS:
<div>
  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
    Date de formation *
  </label>
  <input
    type="date"
    value={nouvelleFormation.dateFormation}
    onChange={(e) => setNouvelleFormation({ ...nouvelleFormation, dateFormation: e.target.value })}
    className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
    required
  />
</div>
```

#### Changements Gestionnaires Fichiers

**Utilisé `replace_all: true`** pour toutes les occurrences :
```typescript
// Upload handler
setNouvelleFormation({ ...nouvelleFormation, certificatUrl: file.name })  // ✅ ÉTAIT: documentUrl

// Affichage fichier
{nouvelleFormation.certificatUrl && (  // ✅ ÉTAIT: documentUrl

// Suppression fichier
setNouvelleFormation({ ...nouvelleFormation, certificatUrl: '' })  // ✅ ÉTAIT: documentUrl
```

---

### Section 3 : EtapePortfolio (✅ TERMINÉ)

**Schéma Prisma** :
```prisma
model FormateurPortfolio {
  titre       String
  description String? @db.Text
  annee       String  // Format "2024" ou "2023-2024"
  imageUrl    String? @map("image_url")
  // ❌ PAS de client, type, ou typeTravail
}
```

#### Changements État

**Avant** :
```typescript
const [nouveauProjet, setNouveauProjet] = useState({
  titre: '',
  description: '',
  annee: new Date().getFullYear().toString(),
  imageUrl: '',
  client: '',           // ❌ N'existe pas dans le schéma
  type: 'Réalisation'   // ❌ N'existe pas dans le schéma
})
```

**Après** :
```typescript
const [nouveauProjet, setNouveauProjet] = useState({
  titre: '',
  description: '',
  annee: new Date().getFullYear().toString(),
  imageUrl: ''
  // ✅ Supprimé: client et type
})
```

#### Changements Affichage

**Suppression badge type et section client** :
```typescript
// AVANT
<div className="flex items-center gap-2">
  <h4>{projet.titre}</h4>
  <span className="badge">{projet.annee}</span>
  <span className="badge">{projet.type}</span>  // ❌ SUPPRIMÉ
</div>
<p>{projet.description}</p>
{projet.client && <p>Client: {projet.client}</p>}  // ❌ SUPPRIMÉ

// APRÈS
<div className="flex items-center gap-2">
  <h4 className="font-medium text-[rgb(var(--foreground))]">
    {projet.titre}
  </h4>
  <span className="px-2 py-0.5 rounded text-xs font-medium bg-[rgba(var(--success),0.2)] text-[rgb(var(--success))]">
    {projet.annee}
  </span>
</div>
<p className="text-sm text-[rgb(var(--muted-foreground))] mt-2">
  {projet.description}
</p>
```

#### Changements Formulaire

**De grille 3 colonnes à champ unique** :
```typescript
// AVANT: grid-cols-3 avec Type, Année, Client

// APRÈS:
<div>
  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
    Année *
  </label>
  <input
    type="number"
    value={nouveauProjet.annee}
    onChange={(e) => setNouveauProjet({ ...nouveauProjet, annee: e.target.value })}
    min="1950"
    max={new Date().getFullYear()}
    className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
    required
  />
</div>
```

---

### Section 4 : EtapeCompetences (✅ TERMINÉ)

**Schéma Prisma** :
```prisma
model FormateurCompetenceTechnique {
  domaine        String
  technique      String               // ✅ ÉTAIT: competence
  niveau         String
  anneesPratique Int    @map("annees_pratique")  // ✅ ÉTAIT: anneesExperience (String)
  // ❌ PAS de documentUrl
}
```

#### Changements État

**Avant** :
```typescript
const [nouvelleCompetence, setNouvelleCompetence] = useState({
  domaine: '',
  competence: '',           // ❌ Mauvais nom
  niveau: 'Intermédiaire',
  anneesExperience: '',     // ❌ Mauvais nom et type (String au lieu de Int)
  documentUrl: ''           // ❌ N'existe pas dans le schéma
})
```

**Après** :
```typescript
const [nouvelleCompetence, setNouvelleCompetence] = useState({
  domaine: '',
  technique: '',           // ✅ Nom corrigé
  niveau: 'Intermédiaire',
  anneesPratique: 0        // ✅ Nom et type corrigés (Int avec défaut 0)
  // ✅ Supprimé: documentUrl
})
```

#### Changements Validation

**Ligne ~1549** :
```typescript
// AVANT
if (nouvelleCompetence.domaine && nouvelleCompetence.competence)

// APRÈS
if (nouvelleCompetence.domaine && nouvelleCompetence.technique)
```

**Réinitialisation** :
```typescript
// AVANT
setNouvelleCompetence({
  domaine: '',
  competence: '',
  niveau: 'Intermédiaire',
  anneesExperience: '',
  documentUrl: ''
})

// APRÈS
setNouvelleCompetence({
  domaine: '',
  technique: '',
  niveau: 'Intermédiaire',
  anneesPratique: 0
})
```

#### Changements Affichage

**Lignes ~1582-1597** :
```typescript
// Titre de la compétence
<h4 className="font-medium text-[rgb(var(--foreground))]">
  {comp.technique}  // ✅ ÉTAIT: comp.competence
</h4>

// Badge années de pratique
{comp.anneesPratique > 0 && (  // ✅ ÉTAIT: comp.anneesExperience &&
  <span className="px-2 py-0.5 rounded text-xs font-medium bg-[rgba(var(--success),0.2)] text-[rgb(var(--success))]">
    {comp.anneesPratique} ans de pratique  // ✅ ÉTAIT: {comp.anneesExperience} ans d'exp.
  </span>
)}
```

#### Changements Formulaire

**Technique** :
```typescript
<div>
  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
    Technique spécifique *  // ✅ ÉTAIT: "Compétence spécifique *"
  </label>
  <input
    type="text"
    value={nouvelleCompetence.technique}  // ✅ ÉTAIT: competence
    onChange={(e) => setNouvelleCompetence({ ...nouvelleCompetence, technique: e.target.value })}
    placeholder="Ex: Serti griffe 4 griffes, Polissage miroir..."
    className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
    required
  />
</div>
```

**Années de pratique** (avec conversion parseInt) :
```typescript
<div>
  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
    Années de pratique *  // ✅ ÉTAIT: "Années d'expérience (optionnel)"
  </label>
  <input
    type="number"
    value={nouvelleCompetence.anneesPratique}  // ✅ ÉTAIT: anneesExperience
    onChange={(e) => setNouvelleCompetence({
      ...nouvelleCompetence,
      anneesPratique: parseInt(e.target.value) || 0  // ✅ Conversion en Int
    })}
    // ✅ ÉTAIT: anneesExperience: e.target.value (String)
    placeholder="Ex: 5"
    min="0"
    max="60"
    className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
    required  // ✅ Maintenant requis
  />
</div>
```

#### Suppression Section Justificatif

**Lignes 1639-1676 complètement supprimées** :
```typescript
// ❌ SECTION COMPLÈTE SUPPRIMÉE:
{/* Justificatif */}
<div>
  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
    Justificatif (PDF, JPG, PNG - max 5 Mo)
  </label>
  <div className="space-y-2">
    <input type="file" ... />
    {nouvelleCompetence.documentUrl && (
      <div className="...">
        <FileText className="..." />
        <span className="...">{nouvelleCompetence.documentUrl}</span>
        <button onClick={() => setNouvelleCompetence({ ...nouvelleCompetence, documentUrl: '' })}>
          <X className="..." />
        </button>
      </div>
    )}
  </div>
</div>
```

---

### Section 5 : EtapeFormationsContinues (✅ TERMINÉ)

**Schéma Prisma** :
```prisma
model FormateurFormationContinue {
  intitule      String
  organisme     String
  dateDebut     DateTime @map("date_debut") @db.Date    // ✅ Deux champs de date
  dateFin       DateTime? @map("date_fin") @db.Date
  dureeHeures   Int      @map("duree_heures")
  domaine       String
  certificatUrl String?  @map("certificat_url")         // ✅ ÉTAIT: documentUrl
  statut        String   @default("TERMINE")
}
```

#### Changements État

**Ligne ~1902** :
```typescript
// AVANT
const [nouvelleFormation, setNouvelleFormation] = useState({
  intitule: '',
  organisme: '',
  dateDebut: '',
  dateFin: '',
  dureeHeures: '',
  domaine: 'Technique métier',
  statut: 'TERMINE',
  documentUrl: ''  // ❌ Mauvais nom
})

// APRÈS
const [nouvelleFormation, setNouvelleFormation] = useState({
  intitule: '',
  organisme: '',
  dateDebut: '',
  dateFin: '',
  dureeHeures: '',
  domaine: 'Technique métier',
  statut: 'TERMINE',
  certificatUrl: ''  // ✅ Nom corrigé
})
```

#### Changements Réinitialisation

**Ligne ~1937** :
```typescript
// AVANT
setNouvelleFormation({
  intitule: '',
  organisme: '',
  dateDebut: '',
  dateFin: '',
  dureeHeures: '',
  domaine: 'Technique métier',
  statut: 'TERMINE',
  documentUrl: ''  // ❌
})

// APRÈS
setNouvelleFormation({
  intitule: '',
  organisme: '',
  dateDebut: '',
  dateFin: '',
  dureeHeures: '',
  domaine: 'Technique métier',
  statut: 'TERMINE',
  certificatUrl: ''  // ✅
})
```

#### Changements Affichage

**Ligne ~2015** (contexte incluant `supprimerFormationContinue`) :
```typescript
// AVANT
<div className="grid grid-cols-2 gap-4 text-sm">
  <div>
    <span className="text-[rgb(var(--muted-foreground))]">Date : </span>
    <span className="text-[rgb(var(--foreground))]">
      {new Date(formation.dateFormation).toLocaleDateString('fr-FR')}
    </span>
  </div>
  ...
</div>

// APRÈS
<div className="grid grid-cols-2 gap-4 text-sm">
  <div>
    <span className="text-[rgb(var(--muted-foreground))]">Période : </span>
    <span className="text-[rgb(var(--foreground))]">
      {new Date(formation.dateDebut).toLocaleDateString('fr-FR')}
      {formation.dateFin && ` - ${new Date(formation.dateFin).toLocaleDateString('fr-FR')}`}
    </span>
  </div>
  {formation.dureeHeures && (
    <div>
      <span className="text-[rgb(var(--muted-foreground))]">Durée : </span>
      <span className="text-[rgb(var(--foreground))]">
        {formation.dureeHeures}h
      </span>
    </div>
  )}
</div>
```

**Note** : Les gestionnaires de téléchargement de fichier (lignes 2170, 2175, 2178, 2180) utilisaient déjà `certificatUrl`, donc seules l'initialisation de l'état et la réinitialisation nécessitaient des modifications.

---

## Problèmes Rencontrés

### 1. Erreur : Chaîne à Remplacer Non Trouvée

**Section** : EtapePortfolio affichage

**Problème** : La première tentative de modification a échoué car l'indentation ne correspondait pas exactement.

**Solution** : Lu le contenu exact du fichier avec grep pour obtenir l'indentation et la structure précises, puis utilisé la correspondance exacte de la chaîne.

**Statut** : ✅ Résolu

---

### 2. Erreur : Occurrences Multiples de documentUrl

**Section** : EtapeFormationsPedagogiques gestionnaires fichiers

**Problème** : L'outil a trouvé 2 correspondances lors du remplacement de `setNouvelleFormation({ ...nouvelleFormation, documentUrl: file.name })`.

**Solution** : Utilisé le paramètre `replace_all: true` pour mettre à jour toutes les occurrences en une fois, ce qui était approprié car le contexte était spécifique à l'état `nouvelleFormation`.

**Statut** : ✅ Résolu

---

### 3. Erreur : Occurrences Multiples de formation.dateFormation

**Section** : EtapeFormationsContinues affichage

**Problème** : L'outil a trouvé 2 occurrences :
- Ligne 1068 dans EtapeFormationsPedagogiques (✅ correct)
- Ligne 2015 dans EtapeFormationsContinues (❌ à modifier)

**Solution** : Ajouté plus de contexte en incluant le bouton `supprimerFormationContinue` pour identifier uniquement l'occurrence EtapeFormationsContinues.

**Statut** : ✅ Résolu

---

### 4. Erreur : Fichier de Verrouillage Serveur Next.js Dev

**Problème** : Toutes les tentatives de démarrage du serveur de développement ont échoué avec :
```
Unable to acquire lock at C:\crm_abj\.next\dev\lock, is another instance of next dev running?
```

**Tentatives de correction** :
1. Tué le processus PID 3176 avec `taskkill /F /PID 3176`
2. Tué le processus PID 22720 avec commande combinée
3. Essayé de supprimer le fichier de verrouillage
4. Plusieurs redémarrages du serveur

**Processus dev en arrière-plan détectés** : 955920, c707c0, f4c9dc, 47e3af, 403c9b, 2d4fb4

**Statut** : ❌ Non résolu - L'utilisateur a demandé de créer un document de résumé au lieu de continuer le dépannage.

---

## État Final

### ✅ Tâches Terminées

1. ✅ **EtapeDiplomes** : Renommage `niveau` → `typeFormation`, `organisme` → `établissement`
2. ✅ **EtapeFormationsPedagogiques** : Consolidation `dateDebut`/`dateFin` → `dateFormation`, renommage `documentUrl` → `certificatUrl`
3. ✅ **EtapePortfolio** : Suppression champs non-schéma (`client`, `type`)
4. ✅ **EtapeCompetences** : Renommage `competence` → `technique`, `anneesExperience` → `anneesPratique` (avec conversion Int), suppression section `documentUrl`
5. ✅ **EtapeFormationsContinues** : Renommage `documentUrl` → `certificatUrl`, affichage `dateDebut`/`dateFin` au lieu de `dateFormation`

### ⏳ Tâches En Cours

6. ⏳ **Vérification et tests** : Non terminé en raison de problèmes de serveur de développement

### 📝 Fichier Modifié

**`C:\crm_abj\src\app\formateur\profil\page.tsx`**
- Taille : 36 707 tokens
- Modifications : 5 sections de formulaire
- Lignes modifiées : ~100+ lignes au total

### 🔍 Schéma de Référence

**`C:\crm_abj\prisma\schema.prisma`**
- 5 modèles utilisés comme référence :
  - `FormateurDiplome`
  - `FormateurFormationPedagogique`
  - `FormateurPortfolio`
  - `FormateurCompetenceTechnique`
  - `FormateurFormationContinue`

---

## Prochaines Étapes (pour nouvelle session)

### Priorité Immédiate

1. **Résoudre problèmes de verrouillage Next.js**
   - Redémarrer complètement l'environnement
   - Nettoyer manuellement le dossier `.next`
   - Vérifier qu'aucun processus Node fantôme ne tourne

2. **Vérifier compilation**
   - Démarrer le serveur dev : `npm run dev`
   - Vérifier qu'il n'y a pas d'erreurs TypeScript
   - Confirmer que la page se charge sans erreur

### Tests Manuels

3. **Tester chaque section du formulaire**
   - ✅ EtapeDiplomes : Ajouter un diplôme, vérifier affichage
   - ✅ EtapeFormationsPedagogiques : Ajouter une formation, vérifier date unique
   - ✅ EtapePortfolio : Ajouter un projet, vérifier absence de client/type
   - ✅ EtapeCompetences : Ajouter une compétence, vérifier parseInt années
   - ✅ EtapeFormationsContinues : Ajouter une formation, vérifier période

4. **Vérifier console navigateur**
   - Aucune erreur JavaScript
   - Aucun warning React

5. **Compléter TODO**
   - Marquer tâche 6 comme terminée

### Phase Connexion Backend (après vérification)

6. **Créer API endpoints**
   - `POST /api/formateur/profil/diplomes`
   - `POST /api/formateur/profil/formations-pedagogiques`
   - `POST /api/formateur/profil/portfolio`
   - `POST /api/formateur/profil/competences`
   - `POST /api/formateur/profil/formations-continues`

7. **Connecter formulaire**
   - Remplacer états locaux par mutations API
   - Gérer états de chargement
   - Gérer erreurs de soumission

8. **Tests end-to-end**
   - Soumettre formulaire complet
   - Vérifier données en BDD Prisma
   - Vérifier cohérence noms de colonnes

---

## Résumé Technique

### Changements Majeurs par Type

**Renommages simples** :
- `niveau` → `typeFormation` (EtapeDiplomes)
- `organisme` → `établissement` (EtapeDiplomes)
- `competence` → `technique` (EtapeCompetences)
- `anneesExperience` → `anneesPratique` (EtapeCompetences)
- `documentUrl` → `certificatUrl` (EtapeFormationsPedagogiques, EtapeFormationsContinues)

**Consolidations** :
- `dateDebut` + `dateFin` → `dateFormation` (EtapeFormationsPedagogiques)

**Séparations** :
- `dateFormation` → `dateDebut` + `dateFin` (EtapeFormationsContinues affichage)

**Suppressions** :
- `client` et `type` (EtapePortfolio)
- `documentUrl` et section Justificatif (EtapeCompetences)
- `domaine` (EtapeFormationsPedagogiques)

**Conversions de type** :
- `anneesExperience: ''` (String) → `anneesPratique: 0` (Int avec parseInt)

### Méthodes de Modification Utilisées

1. **Read avec grep** : Pour trouver sections spécifiques dans fichier volumineux
2. **Edit avec replace_all** : Pour remplacer toutes les occurrences d'un même contexte
3. **Edit avec contexte étendu** : Pour cibler une occurrence spécifique parmi plusieurs
4. **Suppression de sections** : En remplaçant par une chaîne vide les sections complètes

---

**Dernière mise à jour** : 15 février 2026
**Version** : 1.0
**Auteur** : Claude Code

**Note pour reprise** : Tous les changements de code sont terminés. La prochaine session doit commencer par résoudre les problèmes de fichier de verrouillage Next.js, puis vérifier que le formulaire se compile et fonctionne correctement avant de passer à la connexion backend.
