---
name: candidate-management
description: Logique métier de gestion des candidats ABJ. Utiliser quand on travaille sur les statuts candidats, le pipeline de conversion, les relations prospect/candidat/élève, ou les documents.
---

# Gestion des Candidats — Logique Métier ABJ

## Pipeline Prospect → Candidat → Élève

```
PROSPECT (contact initial)
  ↓ candidature formelle
CANDIDAT (dossier ouvert)
  ↓ statut → INSCRIT
ÉLÈVE (en formation active)
```

Un prospect peut avoir PLUSIEURS candidatures (ex: refuse en 2025, recandidature en 2026).

## Identifiants

- **id_prospect** : `email + 3 lettres nom + 3 lettres prénom` (ex: `dupont.marie@gmail.comDUPMAR`)
- **numero_dossier** : `2L nom + 2L prénom + JJMMAAAA` (ex: `DUMI15091992`)

## Statuts du dossier candidat (dans l'ordre)

```
RECU → DOSSIER_EN_COURS → DOSSIER_COMPLET → ENTRETIEN_PLANIFIE
→ DEVIS_ENVOYE → DEVIS_ACCEPTE → FINANCEMENT_EN_COURS
→ FINANCEMENT_VALIDE → ACCEPTE → INSCRIT
```

Branches alternatives :
- `LISTE_ATTENTE` : accepté mais pas de place
- `REFUSE` : non retenu

⚡ **DEVIS_ACCEPTE** est le trigger clé — déclenche la suite automatiquement via Marjorie.

## Parcours d'admission (4 étapes booléennes)

Chaque candidat passe par ces étapes (champs booléens dans `candidats`) :
1. `entretien_telephonique` → premier contact qualifié
2. `rdv_presentiel` → visite des locaux + entretien
3. `test_technique` → évaluation compétences
4. `validation_pedagogique` → décision direction pédagogique

## Documents par candidat

Types obligatoires : `CNI_RECTO`, `CV`, `LETTRE_MOTIVATION`
Types optionnels : `CNI_VERSO`, `PHOTO_IDENTITE`, `DIPLOME`
Types générés : `DEVIS`, `CONTRAT`, `ATTESTATION`

Statuts : `ATTENDU → RECU → A_VALIDER → VALIDE` (ou `REFUSE`)

## Score candidat

Champ `score` (0-100) calculé par Marjorie basé sur :
- Complétude du dossier
- Résultats entretien/test
- Cohérence projet professionnel
- Motivation détectée dans les échanges

## Financement

Modes : `CPF | OPCO | PERSONNEL | ENTREPRISE | POLE_EMPLOI`
Statuts : `EN_ATTENTE → EN_COURS → VALIDE`

Champs financiers dans `candidats` :
- `montant_total_formation` : coût total
- `montant_prise_en_charge` : part financeur
- `reste_a_charge` : montant_total - prise_en_charge

## Requêtes Prisma fréquentes

```typescript
// Liste candidats avec filtre statut (dashboard admin)
const candidats = await prisma.candidats.findMany({
  where: { statut_dossier: { in: ['RECU', 'DOSSIER_EN_COURS', 'DOSSIER_COMPLET'] } },
  include: {
    prospect: { select: { nom: true, prenom: true, emails: true } },
    documents_candidat: { select: { type_document: true, statut: true } },
  },
  orderBy: { date_candidature: 'desc' },
  take: 50,
})

// Fiche candidat complète
const candidat = await prisma.candidats.findUnique({
  where: { numero_dossier: 'DUMI15091992' },
  include: {
    prospect: true,
    documents_candidat: true,
  },
})
```

## Formations ABJ

- CAP Art et Techniques de la Bijouterie-Joaillerie (CAP ATBJ)
- Sertissage Niveau 1
- Sertissage Niveau 2
- CAO/DAO Bijouterie
- Joaillerie
- Gemmologie
- Lapidaire
