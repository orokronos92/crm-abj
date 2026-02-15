# 📋 Comparaison Documents Prisma vs CRM UI

## Vue d'ensemble
Analyse comparative des types de documents définis dans le schéma Prisma versus ce qui est affiché dans l'UI du CRM, avec un focus sur les exigences Qualiopi.

---

## 📁 CANDIDATS - Comparaison Documents

### Documents définis dans Prisma

**Table `DocumentCandidat`** :
- Champ `typeDocument` (String) sans enum défini
- Champ `categorie` avec 3 valeurs par défaut : `candidature` (par défaut)

**Table `TypeDocument` (référentiel)** avec ces codes dans le seed :
1. `CV` - Curriculum Vitae (obligatoire)
2. `LETTRE_MOTIVATION` - Lettre de motivation (obligatoire)
3. `PIECE_IDENTITE` - Pièce d'identité (obligatoire)
4. `JUSTIF_FINANCEMENT` - Justificatif de financement (facultatif)
5. `PHOTO` - Photo d'identité (obligatoire)

### Documents affichés dans l'UI CRM

**Mock Data Candidats** (page-old-backup.tsx) :
1. `CV` - ✅ Présent
2. `Lettre de motivation` - ✅ Présent
3. `CNI` - ⚠️ Nommé différemment (vs PIECE_IDENTITE)
4. `Diplômes` - ❌ Absent du seed Prisma
5. `RIB` - ❌ Absent du seed Prisma

### 🔴 Documents manquants dans Prisma (pour candidats)

| Document | Requis pour | Qualiopi | Priorité |
|----------|-------------|----------|----------|
| `DIPLOME` / `DIPLOMES` | Validation niveau d'entrée | Non | HAUTE |
| `RIB` | Paiements et remboursements | Non | HAUTE |
| `JUSTIF_DOMICILE` | Dossier administratif | Non | MOYENNE |
| `DEVIS_SIGNE` | Engagement contractuel | Indicateur 9 | HAUTE |
| `CONTRAT_FORMATION` | Obligation légale | Indicateur 9 | HAUTE |
| `CONVENTION_FORMATION` | Si financement OPCO/CPF | Indicateur 9 | HAUTE |
| `ATTESTATION_POLE_EMPLOI` | Si demandeur d'emploi | Non | MOYENNE |
| `ACCORD_OPCO` | Si financement OPCO | Non | HAUTE |
| `ACCORD_CPF` | Si financement CPF | Non | HAUTE |

---

## 👨‍🏫 FORMATEURS - Comparaison Documents

### Documents définis dans Prisma

**❌ AUCUNE table DocumentFormateur** dans le schéma Prisma actuel

La table `Formateur` contient uniquement :
- Champs texte : `nom`, `prenom`, `email`, `siret`
- Champs array : `specialites`, `formationsEnseignees`
- Champ decimal : `tarifJournalier`
- **AUCUN champ pour stocker des URLs de documents**

### Documents affichés dans l'UI CRM

**Mock Data Formateurs** (admin/formateurs/page.tsx) :
1. `diplomes` - Array avec nom, année, organisme
2. `certifications_pedagogiques` - Array avec nom, année, organisme
3. `portfolio_url` - URL vers portfolio
4. `cv_url` - URL vers CV

**Page Compétences Formateur** (formateur/competences/page.tsx) - TRÈS COMPLET :

#### Documents Administratifs
1. `Carte d'identité`
2. `Carte Vitale`
3. `Attestation statut auto-entrepreneur`
4. `Assurance Responsabilité Civile Professionnelle`
5. `Attestation d'assurance multirisque`

#### Documents Qualifications (Qualiopi Indicateur 21)
1. `CAP Art et techniques de la bijouterie-joaillerie`
2. `BMA Bijouterie-Joaillerie`
3. `Certification Sertisseur Expert`
4. `Certificat FPA (Formation de Formateurs)`
5. `Attestation Pédagogie active et gestion de groupe`
6. `Attestation Évaluation des compétences`
7. `Attestation Digitalisation de la formation`

#### Documents Veille Professionnelle (Qualiopi Indicateur 22)
1. `Badge participant salons professionnels`
2. `Attestations participation événements`
3. `Certificats formations continues métier`
4. `Attestations formations continues pédagogiques`

### 🔴 Structures manquantes dans Prisma (pour formateurs)

**Table à créer : `DocumentFormateur`**

```prisma
model DocumentFormateur {
  idDocument         Int       @id @default(autoincrement())
  idFormateur        Int

  // Type et catégorie
  typeDocument       String    // CV | DIPLOME | CERTIFICATION | ASSURANCE | etc.
  categorie          String    // ADMINISTRATIF | QUALIFICATION | VEILLE | PEDAGOGIE

  // Métadonnées
  nomFichier         String?
  urlDrive           String?
  dateObtention      DateTime?
  dateExpiration     DateTime?
  organisme          String?

  // Validation
  statut             String    @default("EN_ATTENTE") // EN_ATTENTE | VALIDE | EXPIRE | REFUSE
  dateValidation     DateTime?
  validePar          String?

  // Traçabilité
  creeLe             DateTime  @default(now())
  modifieLe          DateTime  @updatedAt

  // Relations
  formateur          Formateur @relation(fields: [idFormateur], references: [idFormateur])
}
```

**Table à créer : `TypeDocumentFormateur`**

| Code | Libellé | Catégorie | Obligatoire Qualiopi | Indicateur |
|------|---------|-----------|----------------------|------------|
| `CV_FORMATEUR` | CV détaillé | ADMINISTRATIF | OUI | 21 |
| `CNI_FORMATEUR` | Carte d'identité | ADMINISTRATIF | OUI | - |
| `DIPLOME_METIER` | Diplômes métier | QUALIFICATION | OUI | 21 |
| `DIPLOME_PEDAGOGIE` | Diplômes/Certif pédagogiques | QUALIFICATION | OUI | 21 |
| `CERTIFICATION_PRO` | Certifications professionnelles | QUALIFICATION | NON | 21 |
| `RC_PRO` | Assurance RC Professionnelle | ADMINISTRATIF | OUI | - |
| `STATUT_JURIDIQUE` | Statut (auto-entrepreneur, etc.) | ADMINISTRATIF | OUI | - |
| `FORMATION_CONTINUE` | Attestations formations continues | VEILLE | OUI | 22 |
| `PARTICIPATION_SALON` | Badges/Attestations salons | VEILLE | NON | 22 |
| `PORTFOLIO` | Portfolio réalisations | QUALIFICATION | NON | 21 |

---

## 📊 Synthèse des Écarts

### Pour les CANDIDATS

**Écarts critiques** :
- ❌ Manque 9 types de documents essentiels dans le seed Prisma
- ⚠️ Incohérence de nommage : `CNI` vs `PIECE_IDENTITE`
- ❌ Documents contractuels absents (devis, contrat, convention)

**Impact Qualiopi** : MOYEN
- Indicateur 9 (Information du public) partiellement impacté

### Pour les FORMATEURS

**Écarts critiques** :
- ❌ **AUCUNE structure de stockage documents** en base
- ❌ Table `DocumentFormateur` complètement absente
- ❌ Pas de référentiel `TypeDocumentFormateur`
- ❌ L'UI affiche 15+ types de documents, la BDD n'en stocke AUCUN

**Impact Qualiopi** : CRITIQUE
- Indicateur 21 (Compétences des intervenants) : NON CONFORME
- Indicateur 22 (Maintien des compétences) : NON CONFORME

---

## 🚨 Actions Urgentes Recommandées

### 1. PRIORITÉ HAUTE - Formateurs
1. Créer table `DocumentFormateur` avec tous les champs nécessaires
2. Créer table `TypeDocumentFormateur` avec les 10 types minimum
3. Migration pour ajouter relation dans modèle `Formateur`
4. Seed avec les types de documents Qualiopi obligatoires

### 2. PRIORITÉ HAUTE - Candidats
1. Enrichir le seed `TypeDocument` avec les 9 documents manquants
2. Harmoniser les noms (`CNI` → `PIECE_IDENTITE`)
3. Ajouter catégories : `administratif`, `contractuel`, `financier`

### 3. PRIORITÉ MOYENNE - Global
1. Créer enum pour `typeDocument` au lieu de String libre
2. Ajouter champ `obligatoireQualiopi` dans TypeDocument
3. Ajouter champ `indicateurQualiopi` pour traçabilité

---

## 📝 Notes Importantes

1. **Qualiopi Indicateur 21** : "L'organisme s'assure des compétences des intervenants"
   - Exige CV + Diplômes + Certifications pédagogiques
   - Actuellement : **NON CONFORME** (pas de stockage BDD)

2. **Qualiopi Indicateur 22** : "L'organisme maintient les compétences de ses intervenants"
   - Exige preuves de formations continues + veille professionnelle
   - Actuellement : **NON CONFORME** (pas de stockage BDD)

3. **Qualiopi Indicateur 9** : "Information transparente sur les prestations"
   - Exige devis, contrats, conventions signés
   - Actuellement : **PARTIELLEMENT CONFORME** (manque types dans seed)

---

**Date d'analyse** : 12 février 2026
**Statut initial** : 🔴 NON CONFORME QUALIOPI
**Statut après corrections** : 🟢 CONFORME QUALIOPI

## ✅ CORRECTIONS APPLIQUÉES (12 février 2026)

Toutes les corrections ont été appliquées avec succès :

### Pour les CANDIDATS
- ✅ 18 types de documents ajoutés dans le schéma (de 5 à 23 types)
- ✅ Champs Qualiopi ajoutés : `obligatoireQualiopi`, `indicateurQualiopi`
- ✅ Tous les documents contractuels ajoutés (devis, contrats, conventions)
- ✅ Documents financiers ajoutés (OPCO, CPF, Pôle Emploi)
- ✅ Documents pédagogiques ajoutés (attestations)

### Pour les FORMATEURS
- ✅ Table `DocumentFormateur` créée avec tous les champs nécessaires
- ✅ Table `TypeDocumentFormateur` créée avec 15 types
- ✅ Relation ajoutée dans le modèle `Formateur`
- ✅ Documents exemples créés dans le seed
- ✅ Indicateurs Qualiopi 21 et 22 entièrement couverts

**Voir le détail des corrections dans** : `QUALIOPI-FIXES-SUMMARY.md`