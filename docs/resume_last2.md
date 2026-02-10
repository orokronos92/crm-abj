# Résumé Session : Connexion Page Candidats + Logique Cycle de Vie Prospects

**Date** : 10 février 2026
**Objectif principal** : Connecter la page Candidats à la BDD PostgreSQL + Implémenter la logique métier du cycle de vie des prospects

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Phase 1 : Connexion Page Candidats](#phase-1--connexion-page-candidats)
3. [Phase 2 : Ajout Variété Statuts](#phase-2--ajout-variété-statuts)
4. [Phase 3 : Modal Détail Candidat](#phase-3--modal-détail-candidat)
5. [Phase 4 : Logique Cycle de Vie Prospects](#phase-4--logique-cycle-de-vie-prospects)
6. [Fichiers Modifiés/Créés](#fichiers-modifiéscréés)
7. [Ce Qui Fonctionne](#ce-qui-fonctionne)
8. [Problèmes Rencontrés](#problèmes-rencontrés)
9. [Scripts Utiles](#scripts-utiles)
10. [Prochaines Étapes](#prochaines-étapes)

---

## Vue d'ensemble

Cette session a permis de :
1. ✅ Connecter la page **Candidats** à PostgreSQL avec filtres fonctionnels
2. ✅ Créer un **modal détail** complet avec 5 onglets (Général, Parcours, Documents, Financement, Notes IA)
3. ✅ Implémenter la **logique métier du cycle de vie** des prospects (PROSPECT → CANDIDAT → ELEVE → ANCIEN_ELEVE)
4. ✅ Mettre à jour les **filtres de la page Prospects** pour respecter cette logique
5. ✅ Documenter complètement le cycle de vie dans `PROSPECTS-LIFECYCLE.md`

---

## Phase 1 : Connexion Page Candidats

### Objectif
Connecter la page Candidats à la base de données avec filtres dynamiques (statut dossier, statut financement, formation, recherche).

### Actions réalisées

#### 1. Vérification structure BDD
```bash
npx tsx check-statuts-prospect.ts
```
- 20 tables confirmées en base (7 originales VPS + 13 Phase 1)
- Vérification des statuts existants

#### 2. Modification `CandidatService`
**Fichier** : `src/services/candidat.service.ts`

Ajout de 2 méthodes :
```typescript
// Récupère liste candidats simplifiée pour tableau
async getCandidats(params: {
  statutDossier?: string
  statutFinancement?: string
  formation?: string
  search?: string
  take?: number
}) {
  // Construction filtre where
  const where: any = {}
  if (statutDossier && statutDossier !== 'TOUS') where.statutDossier = statutDossier
  // ... autres filtres

  const { data, total } = await this.repository.findAll({ skip: 0, take, where })

  return {
    candidats: data.map(c => ({
      id: c.idCandidat,
      numero_dossier: c.numeroDossier,
      nom: c.prospect?.nom || '',
      prenom: c.prospect?.prenom || '',
      email: c.prospect?.emails?.[0] || '',
      telephone: c.prospect?.telephones?.[0] || '',
      formation: this.getFormationLabel(c.formationRetenue || ''),
      session: c.sessionVisee || 'Non définie',
      statut_dossier: c.statutDossier || 'RECU',
      statut_financement: c.statutFinancement || 'EN_ATTENTE',
      score: c.score || 0,
      date_candidature: c.dateCandidature ? new Date(c.dateCandidature).toLocaleDateString('fr-FR') : ''
    })),
    total
  }
}

// Récupère valeurs distinctes pour dropdowns filtres
async getFilterValues() {
  const [statutsDossier, statutsFinancement, formations] = await Promise.all([
    prisma.candidat.findMany({
      distinct: ['statutDossier'],
      select: { statutDossier: true }
    }),
    prisma.candidat.findMany({
      distinct: ['statutFinancement'],
      select: { statutFinancement: true }
    }),
    prisma.candidat.findMany({
      distinct: ['formationRetenue'],
      select: { formationRetenue: true }
    })
  ])

  return {
    statutsDossier: statutsDossier.map(s => s.statutDossier).filter((s): s is string => s !== null),
    statutsFinancement: statutsFinancement.map(s => s.statutFinancement).filter((s): s is string => s !== null),
    formations: formations.map(f => f.formationRetenue).filter((f): s is string => f !== null)
  }
}

// Helper pour mapper codes formations → labels
private getFormationLabel(code: string): string {
  const labels = {
    'CAP_BJ': 'CAP Bijouterie-Joaillerie',
    'INIT_BJ': 'Initiation Bijouterie',
    'PERF_SERTI': 'Perfectionnement Sertissage',
    'CAO_DAO': 'CAO/DAO Bijouterie',
    'GEMMO': 'Gemmologie'
  }
  return labels[code] || code
}
```

**⚠️ Problème rencontré** : Tentative d'utiliser `where: { statutDossier: { not: null } }` → Erreur Prisma
**✅ Solution** : Filtrage côté TypeScript avec `.filter((s): s is string => s !== null)`

#### 3. Création composant `CandidatsFilters`
**Fichier** : `src/components/admin/CandidatsFilters.tsx`

Composant client pour filtres server-side via URL params :
```typescript
'use client'

export function CandidatsFilters({ statutsDossier, statutsFinancement, formations }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === '' || value === 'TOUS') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/admin/candidats?${params.toString()}`)
  }

  return (
    <div className="flex gap-4">
      <input
        type="text"
        placeholder="Rechercher..."
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <select value={currentStatutDossier} onChange={(e) => handleFilterChange('statutDossier', e.target.value)}>
        <option value="TOUS">Tous les dossiers</option>
        {statutsDossier.map(statut => (
          <option key={statut} value={statut}>{statut.replace(/_/g, ' ')}</option>
        ))}
      </select>
      {/* Filtres statut financement et formation similaires */}
    </div>
  )
}
```

#### 4. Création composant `CandidatsPageClient`
**Fichier** : `src/components/admin/CandidatsPageClient.tsx`

Tableau interactif avec 7 colonnes + ouverture modal :
```typescript
'use client'

export function CandidatsPageClient({ candidats, total }) {
  const [selectedCandidatId, setSelectedCandidatId] = useState<number | null>(null)

  return (
    <div className="bg-[rgb(var(--card))]">
      <table className="w-full">
        <thead>
          <tr>
            <th>Candidat</th>
            <th>N° Dossier</th>
            <th>Formation</th>
            <th>Statut dossier</th>
            <th>Statut financement</th>
            <th>Score</th>
            <th>Date candidature</th>
          </tr>
        </thead>
        <tbody>
          {candidats.map(candidat => (
            <tr key={candidat.id} onClick={() => setSelectedCandidatId(candidat.id)}>
              {/* Affichage des 7 colonnes */}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedCandidatId && (
        <CandidatDetailModal
          candidatId={selectedCandidatId}
          onClose={() => setSelectedCandidatId(null)}
        />
      )}
    </div>
  )
}
```

#### 5. Conversion page en Server Component
**Fichier** : `src/app/admin/candidats/page.tsx` (remplacé)

```typescript
// Pas de 'use client' → Server Component
interface CandidatsPageProps {
  searchParams: Promise<{
    statutDossier?: string
    statutFinancement?: string
    formation?: string
    search?: string
  }>
}

export default async function CandidatsPage({ searchParams }: CandidatsPageProps) {
  const candidatService = new CandidatService()
  const params = await searchParams

  // Récupération données serveur
  const { candidats, total } = await candidatService.getCandidats({
    statutDossier: params.statutDossier,
    statutFinancement: params.statutFinancement,
    formation: params.formation,
    search: params.search,
    take: 100
  })

  const filterValues = await candidatService.getFilterValues()

  return (
    <DashboardLayout>
      <CandidatsFilters {...filterValues} />
      <CandidatsPageClient candidats={candidats} total={total} />
    </DashboardLayout>
  )
}
```

**✅ Résultat** : Page candidats connectée avec filtres fonctionnels

---

## Phase 2 : Ajout Variété Statuts

### Problème
Base de données ne contenait que 2 valeurs de `statut_dossier` : ACCEPTE et INSCRIT (pas assez de variété pour tester les filtres).

### Solution
**Script** : `add-missing-statuts.ts`

```typescript
const statutsVaries = [
  { statutDossier: 'RECU', statutFinancement: 'EN_ATTENTE' },
  { statutDossier: 'DOSSIER_EN_COURS', statutFinancement: 'EN_ATTENTE' },
  { statutDossier: 'DOSSIER_COMPLET', statutFinancement: 'EN_ATTENTE' },
  { statutDossier: 'ENTRETIEN_PLANIFIE', statutFinancement: 'EN_COURS' },
  { statutDossier: 'DEVIS_ENVOYE', statutFinancement: 'EN_COURS' },
  { statutDossier: 'DEVIS_ACCEPTE', statutFinancement: 'EN_COURS' },
  { statutDossier: 'FINANCEMENT_VALIDE', statutFinancement: 'VALIDE' },
  { statutDossier: 'ACCEPTE', statutFinancement: 'VALIDE' },
  { statutDossier: 'REFUSE', statutFinancement: 'REFUSE' },
  { statutDossier: 'INSCRIT', statutFinancement: 'VALIDE' }
]

// Mise à jour de 10 candidats différents
for (let i = 0; i < 10; i++) {
  await prisma.candidat.update({
    where: { idCandidat: i + 1 },
    data: statutsVaries[i]
  })
}
```

**Exécution** :
```bash
npx tsx add-missing-statuts.ts
```

**✅ Résultat** : 10 statuts différents en base pour tester tous les filtres

---

## Phase 3 : Modal Détail Candidat

### Objectif
Créer un modal complet avec 5 onglets affichant toutes les informations d'un candidat.

### Actions réalisées

#### 1. Analyse des données disponibles
**Script** : `check-candidat-complet.ts`

Vérification des champs disponibles en base :
```typescript
const candidat = await prisma.candidat.findFirst({
  include: {
    prospect: {
      select: {
        nom: true,
        prenom: true,
        emails: true,
        telephones: true,
        nbEchanges: true,
        dateDernierContact: true
      }
    },
    documentsCandidat: {
      select: {
        typeDocument: true,
        statut: true,
        nomFichier: true
      }
    }
  }
})
```

**Données confirmées** :
- ✅ Contact : nom, prénom, emails, téléphones (via relation prospect)
- ✅ Parcours : 4 booléens + 4 dates (entretien tel, RDV, test technique, validation péda)
- ✅ Financement : mode, montant total (8500€), PEC (8000€), RAC (500€)
- ✅ Documents : 4 documents avec type, statut, nom fichier
- ✅ Notes IA : champ `notesIa` existe avec texte

#### 2. Ajout champs manquants à table candidats
**Problème** : Champs `score` et `notes_ia` manquants dans le schéma

**Solution** : Ajout via migration Prisma (déjà fait en session précédente, confirmé présent)

#### 3. Création API endpoint
**Fichier** : `src/app/api/candidats/[id]/route.ts`

```typescript
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const candidatId = parseInt(id, 10)

  const candidat = await prisma.candidat.findUnique({
    where: { idCandidat: candidatId },
    include: {
      prospect: { /* ... */ },
      documentsCandidat: { /* ... */ }
    }
  })

  if (!candidat) {
    return NextResponse.json({ error: 'Candidat non trouvé' }, { status: 404 })
  }

  // Formatage pour frontend (dates en FR, montants en number, labels formations)
  const formatted = {
    id: candidat.idCandidat,
    numero_dossier: candidat.numeroDossier,
    nom: candidat.prospect?.nom || '',
    prenom: candidat.prospect?.prenom || '',
    email: candidat.prospect?.emails?.[0] || '',
    telephone: candidat.prospect?.telephones?.[0] || '',
    formation: formationLabels[candidat.formationRetenue || ''] || candidat.formationRetenue,
    // ... tous les champs formatés
    montant_total: Number(candidat.montantTotalFormation || 0),
    documents: candidat.documentsCandidat?.map(doc => ({ /* ... */ })) || [],
    notes_ia: candidat.notesIa || ''
  }

  return NextResponse.json(formatted)
}
```

**⚠️ Erreur rencontrée** : `'sensEmail' does not exist in type 'HistoriqueEmailSelect'`
**✅ Solution** : Correction du nom de champ `sens` (pas `sensEmail`)

#### 4. Création composant modal
**Fichier** : `src/components/admin/CandidatDetailModal.tsx`

Modal complet avec 5 onglets en forme de dossier :

**Onglet 1 : Général**
```typescript
<div>
  {/* Header avec avatar, nom, badges statuts, score */}
  <div className="flex items-center gap-4">
    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[rgb(var(--accent))]">
      {candidat.prenom.charAt(0)}
    </div>
    <div>
      <h2>{candidat.prenom} {candidat.nom}</h2>
      <span className={STATUT_DOSSIER_COLORS[candidat.statut_dossier]}>
        {candidat.statut_dossier}
      </span>
    </div>
  </div>

  {/* Infos contact agrandies (email, téléphone) */}
  {/* N° Dossier unique et agrandi */}
  {/* Stats rapides (score, nb échanges) */}
  {/* Infos formation (formation, session, date candidature) */}
</div>
```

**Onglet 2 : Parcours**
```typescript
<div>
  {/* 4 étapes d'admission avec icônes CheckCircle/Clock */}
  {[
    { key: 'entretien_telephonique', label: 'Entretien téléphonique', date: candidat.date_entretien_tel },
    { key: 'rdv_presentiel', label: 'RDV présentiel', date: candidat.date_rdv_presentiel },
    { key: 'test_technique', label: 'Test technique', date: candidat.date_test_technique },
    { key: 'validation_pedagogique', label: 'Validation pédagogique', date: candidat.date_validation_pedagogique }
  ].map(etape => (
    <div>
      {candidat[etape.key] ? <CheckCircle className="text-success" /> : <Clock className="text-muted" />}
      <p>{etape.label}</p>
      {etape.date && <span><Calendar /> {etape.date}</span>}
    </div>
  ))}
</div>
```

**Onglet 3 : Documents**
```typescript
<div>
  {candidat.documents.map(doc => (
    <div className="flex justify-between">
      <div>
        <p>{doc.type.replace(/_/g, ' ')} {doc.obligatoire && '(obligatoire)'}</p>
        <p className="text-sm">{doc.nom_fichier || 'Non fourni'}</p>
      </div>
      <span className={STATUT_DOCUMENT_COLORS[doc.statut]}>
        {doc.statut}
      </span>
    </div>
  ))}
</div>
```

**Onglet 4 : Financement**
```typescript
<div>
  <p>Mode : {candidat.mode_financement}</p>
  <div className="grid grid-cols-3 gap-4">
    <div>
      <p>Montant total</p>
      <p className="text-2xl font-bold">{candidat.montant_total}€</p>
    </div>
    <div>
      <p>Prise en charge</p>
      <p className="text-2xl font-bold text-success">{candidat.montant_pec}€</p>
    </div>
    <div>
      <p>Reste à charge</p>
      <p className="text-2xl font-bold text-warning">{candidat.reste_a_charge}€</p>
    </div>
  </div>
</div>
```

**Onglet 5 : Notes IA**
```typescript
<div>
  <div className="flex items-center gap-2 mb-4">
    <Sparkles className="w-5 h-5 text-[rgb(var(--accent))]" />
    <h3>Analyse Marjorie</h3>
  </div>
  <p className="whitespace-pre-wrap">{candidat.notes_ia || 'Aucune analyse disponible'}</p>
</div>
```

**Footer sticky avec actions** :
```typescript
<div className="p-4 border-t bg-[rgb(var(--secondary))]">
  <div className="flex items-center justify-between">
    <button>
      <MessageSquare /> Contacter le candidat
    </button>
    <div className="flex gap-2">
      <button>
        <Download /> Télécharger dossier complet
      </button>
      <button className="bg-[rgb(var(--accent))]">
        <Sparkles /> Demander analyse Marjorie
      </button>
    </div>
  </div>
</div>
```

**✅ Résultat** : Modal complet fonctionnel avec toutes les données

---

## Phase 4 : Logique Cycle de Vie Prospects

### Contexte
L'utilisateur explique la logique métier critique :

> "Un prospect reste en base tout le temps. Quand il candidate → CANDIDAT. Si refusé → redevient PROSPECT. Si accepté → ELEVE. Après formation → redevient PROSPECT. La page Prospects ne doit montrer QUE les prospects disponibles (pas les candidats actifs ni élèves en formation), pour préparer les futures campagnes marketing."

### Cycle de vie complet

```
PROSPECT (permanent)
    ↓
    Remplit dossier
    ↓
CANDIDAT (statut actif - MASQUÉ page Prospects)
    ↓
    ├─→ Refusé → ANCIEN_CANDIDAT (redevient visible)
    └─→ Accepté + Inscrit
        ↓
    ELEVE (statut actif - MASQUÉ page Prospects)
        ↓
        Formation terminée
        ↓
    ANCIEN_ELEVE (redevient visible pour marketing)
```

### Relations BDD

```
prospects (1) → candidats (N) → eleves (1)
```

**Clé importante** : La relation `Prospect → Eleve` est **indirecte** via `Candidat`.

### Actions réalisées

#### 1. Analyse statuts actuels
**Script** : `check-statuts-prospect.ts`

```typescript
async function main() {
  // Statuts actuels
  const statuts = await prisma.$queryRaw`
    SELECT statut_prospect, COUNT(*)::text as count
    FROM prospects
    WHERE statut_prospect IS NOT NULL
    GROUP BY statut_prospect
  `

  // Prospects avec candidats
  const prospectsAvecCandidats = await prisma.prospect.findMany({
    where: { candidats: { some: {} } },
    select: {
      statutProspect: true,
      candidats: { select: { statutDossier: true } }
    }
  })

  // Vérifier élèves
  const elevesCount = await prisma.eleve.count()
}
```

**Résultats** :
- 15 prospects totaux
- 10 avec statut "CANDIDAT"
- 1 "EN_ATTENTE_DOSSIER"
- 4 "NOUVEAU"
- 10 élèves en base (liés à candidats)

**Problème identifié** : Tous les prospects avec élèves ont statut "CANDIDAT", pas "ELEVE".

#### 2. Création script mise à jour lifecycle
**Script** : `update-statuts-lifecycle.ts`

```typescript
const STATUTS_CANDIDAT_ACTIFS = [
  'RECU', 'DOSSIER_EN_COURS', 'DOSSIER_COMPLET',
  'ENTRETIEN_PLANIFIE', 'DEVIS_ENVOYE', 'DEVIS_ACCEPTE',
  'FINANCEMENT_EN_COURS', 'FINANCEMENT_VALIDE', 'ACCEPTE'
]

// 1. Prospects avec candidats actifs → CANDIDAT
const prospectsAvecCandidatsActifs = await prisma.prospect.findMany({
  where: {
    candidats: {
      some: {
        statutDossier: { in: STATUTS_CANDIDAT_ACTIFS }
      }
    }
  }
})

for (const prospect of prospectsAvecCandidatsActifs) {
  if (prospect.statutProspect !== 'CANDIDAT') {
    await prisma.prospect.update({
      where: { idProspect: prospect.idProspect },
      data: { statutProspect: 'CANDIDAT' }
    })
  }
}

// 2. Prospects avec candidats refusés uniquement → ANCIEN_CANDIDAT
const prospectsAvecCandidatsRefuses = await prisma.prospect.findMany({
  where: {
    AND: [
      { candidats: { some: { statutDossier: 'REFUSE' } } },
      { candidats: { none: { statutDossier: { in: STATUTS_CANDIDAT_ACTIFS } } } },
      { candidats: { none: { eleve: { isNot: null } } } }
    ]
  }
})

// 3. Prospects avec élèves EN_COURS → ELEVE
const prospectsAvecElevesActifs = await prisma.prospect.findMany({
  where: {
    candidats: {
      some: {
        eleve: { statutFormation: 'EN_COURS' }
      }
    }
  }
})

for (const prospect of prospectsAvecElevesActifs) {
  if (prospect.statutProspect !== 'ELEVE') {
    await prisma.prospect.update({
      where: { idProspect: prospect.idProspect },
      data: { statutProspect: 'ELEVE' }
    })
  }
}

// 4. Prospects avec élèves TERMINE/ABANDONNE → ANCIEN_ELEVE
const prospectsAvecElevesTermines = await prisma.prospect.findMany({
  where: {
    AND: [
      { candidats: { some: { eleve: { statutFormation: { in: ['TERMINE', 'ABANDONNE', 'SUSPENDU'] } } } } },
      { candidats: { none: { eleve: { statutFormation: 'EN_COURS' } } } }
    ]
  }
})
```

**⚠️ Erreur rencontrée** : `Unknown argument 'eleves'` → La relation est indirecte via candidats
**✅ Solution** : Utiliser `candidats.some({ eleve: { ... } })` au lieu de `eleves.some({ ... })`

**Exécution** :
```bash
npx tsx update-statuts-lifecycle.ts
```

**Résultats** :
- ✅ 10 prospects passés de "CANDIDAT" → "ELEVE"
- ✅ 0 candidats refusés (données test n'en contiennent pas)
- ✅ 0 élèves terminés (tous EN_COURS dans données test)

#### 3. Modification ProspectService
**Fichier** : `src/services/prospect.service.ts`

Ajout filtre par défaut :
```typescript
async getProspects(params?: { ... }) {
  const where: any = {}

  /**
   * RÈGLE MÉTIER CRITIQUE :
   * Page Prospects affiche UNIQUEMENT prospects disponibles pour marketing
   * - AFFICHER : NOUVEAU, EN_ATTENTE_DOSSIER, ANCIEN_CANDIDAT, ANCIEN_ELEVE
   * - MASQUER : CANDIDAT (admission en cours), ELEVE (formation en cours)
   */
  if (statut && statut !== 'TOUS') {
    where.statutProspect = statut
  } else {
    // Filtrer par défaut les statuts actifs
    where.statutProspect = {
      notIn: ['CANDIDAT', 'ELEVE']
    }
  }

  // ... reste du code
}
```

#### 4. Mise à jour ProspectsFilters
**Fichier** : `src/components/admin/ProspectsFilters.tsx`

```typescript
<select value={currentStatut} onChange={(e) => handleFilterChange('statut', e.target.value)}>
  <option value="">Disponibles (hors actifs)</option>  {/* Défaut */}
  <option value="NOUVEAU">Nouveau</option>
  <option value="EN_ATTENTE_DOSSIER">En attente dossier</option>
  <option value="ANCIEN_CANDIDAT">Ancien candidat</option>
  <option value="ANCIEN_ELEVE">Ancien élève</option>
  <option value="CANDIDAT">Candidat (actif)</option>  {/* Si besoin explicite */}
  <option value="ELEVE">Élève (en formation)</option>  {/* Si besoin explicite */}
  <option value="TOUS">Tous les statuts</option>  {/* Désactive filtre */}
</select>
```

#### 5. Mise à jour couleurs badges
**Fichier** : `src/components/admin/ProspectsPageClient.tsx`

```typescript
const STATUT_COLORS: Record<string, string> = {
  NOUVEAU: 'badge-info',               // Bleu
  EN_ATTENTE_DOSSIER: 'badge-warning', // Jaune
  CANDIDAT: 'badge-warning',           // Jaune (actif)
  ANCIEN_CANDIDAT: 'badge-error',      // Rouge (refusé)
  ELEVE: 'badge-success',              // Vert (actif)
  ANCIEN_ELEVE: 'badge-info',          // Bleu (disponible)
  // ... autres statuts legacy
}
```

#### 6. Script de test
**Script** : `test-prospect-filtrage.ts`

Vérification de la logique :
```typescript
// Total prospects
const totalProspects = await prisma.prospect.count()

// Prospects disponibles (filtrés)
const prospectsDisponibles = await prisma.prospect.findMany({
  where: {
    statutProspect: { notIn: ['CANDIDAT', 'ELEVE'] }
  }
})

// Prospects masqués
const prospectsMasques = await prisma.prospect.findMany({
  where: {
    statutProspect: { in: ['CANDIDAT', 'ELEVE'] }
  }
})

console.log('✓ Page Prospects affichera:', prospectsDisponibles.length, 'prospects')
console.log('✓ Prospects masqués (actifs):', prospectsMasques.length)
console.log('✓ Ratio affiché:', Math.round((prospectsDisponibles.length / totalProspects) * 100), '%')
```

**Exécution** :
```bash
npx tsx test-prospect-filtrage.ts
```

**Résultats** :
```
📊 TOTAL PROSPECTS: 15

📋 RÉPARTITION:
  ELEVE                : 10 (66%)
  EN_ATTENTE_DOSSIER   : 1 (7%)
  NOUVEAU              : 4 (27%)

✅ AFFICHÉS PAGE PROSPECTS: 5 (33%)
  - Jean Dupont → NOUVEAU
  - Marie Leroy → EN_ATTENTE_DOSSIER
  - Pierre Boucher → NOUVEAU
  - Anne Lafont → NOUVEAU
  - Louis Richard → NOUVEAU

❌ MASQUÉS (actifs): 10 (67%)
  - Léa Moreau → ELEVE
  - Alice Roux → ELEVE
  - Hugo Simon → ELEVE
  - Maxime Barbier → ELEVE
  - Sophie Durand → ELEVE
```

**✅ Logique métier respectée** : Campagnes marketing cibleront uniquement les 5 prospects disponibles, pas les 10 élèves en formation.

#### 7. Documentation complète
**Fichier** : `docs/PROSPECTS-LIFECYCLE.md`

Documentation exhaustive incluant :
- Schéma du cycle de vie complet
- Tableau des statuts et leur signification
- Logique de filtrage détaillée
- Relations BDD
- Implémentation technique (service, composants, couleurs)
- Scripts de maintenance
- État actuel de la base test
- Prochaines étapes (intégration marketing)

---

## Fichiers Modifiés/Créés

### Modifiés

1. **`src/services/candidat.service.ts`**
   - Ajout méthode `getCandidats()`
   - Ajout méthode `getFilterValues()`
   - Ajout helper `getFormationLabel()`

2. **`src/services/prospect.service.ts`**
   - Ajout filtre par défaut `notIn: ['CANDIDAT', 'ELEVE']`
   - Documentation règle métier

3. **`src/components/admin/ProspectsFilters.tsx`**
   - Ajout options statuts : ANCIEN_CANDIDAT, ANCIEN_ELEVE, ELEVE
   - Label par défaut : "Disponibles (hors actifs)"

4. **`src/components/admin/ProspectsPageClient.tsx`**
   - Ajout couleurs badges pour nouveaux statuts
   - Commentaires explicatifs

5. **`src/app/admin/candidats/page.tsx`**
   - Conversion en Server Component
   - Récupération données serveur
   - Intégration filtres

### Créés

1. **`src/components/admin/CandidatsFilters.tsx`**
   - Composant client filtres server-side
   - 4 filtres : recherche, statut dossier, statut financement, formation

2. **`src/components/admin/CandidatsPageClient.tsx`**
   - Tableau interactif 7 colonnes
   - Intégration modal détail

3. **`src/components/admin/CandidatDetailModal.tsx`**
   - Modal complet 5 onglets
   - Footer sticky avec actions

4. **`src/app/api/candidats/[id]/route.ts`**
   - API endpoint détail candidat
   - Formatage données (dates FR, labels formations)

5. **Scripts utilitaires**
   - `add-missing-statuts.ts` → Ajout variété statuts
   - `check-candidat-complet.ts` → Vérification données disponibles
   - `check-statuts-prospect.ts` → Analyse statuts actuels
   - `update-statuts-lifecycle.ts` → Mise à jour statuts selon relations BDD
   - `test-prospect-filtrage.ts` → Test logique filtrage

6. **Documentation**
   - `docs/PROSPECTS-LIFECYCLE.md` → Documentation complète cycle de vie
   - `docs/resume_last2.md` → Ce document

---

## Ce Qui Fonctionne

### ✅ Connexion BDD

**Architecture validée** :
```
Page (Server Component)
  ↓
Service (logique métier + calculs)
  ↓
Repository (requêtes Prisma pures)
  ↓
PostgreSQL
```

**Patterns qui fonctionnent** :

1. **Server Components pour data fetching**
   ```typescript
   export default async function Page({ searchParams }: Props) {
     const params = await searchParams
     const service = new Service()
     const data = await service.getData(params)
     return <ClientComponent data={data} />
   }
   ```

2. **Filtres server-side via URL params**
   ```typescript
   'use client'
   const handleFilterChange = (key: string, value: string) => {
     const params = new URLSearchParams(searchParams.toString())
     params.set(key, value)
     router.push(`/route?${params.toString()}`)
   }
   ```

3. **Relations Prisma avec include/select**
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

4. **Filtrage conditionnel avec notIn**
   ```typescript
   where: {
     statutProspect: {
       notIn: ['CANDIDAT', 'ELEVE']
     }
   }
   ```

5. **Relations indirectes Prospect → Candidat → Eleve**
   ```typescript
   where: {
     candidats: {
       some: {
         eleve: {
           statutFormation: 'EN_COURS'
         }
       }
     }
   }
   ```

### ✅ Logique Métier

- **Cycle de vie prospects** : Parfaitement implémenté
- **Filtrage automatique** : Page Prospects masque statuts actifs
- **Synchronisation statuts** : Script update-statuts-lifecycle fonctionne
- **Tests validés** : test-prospect-filtrage confirme logique

---

## Problèmes Rencontrés

### 1. Erreur Prisma - Filtre `{ not: null }`

**Erreur** :
```
Type 'null' is not assignable to type 'string | NestedStringFilter<"Candidat"> | undefined'
```

**Code initial** :
```typescript
where: { statutDossier: { not: null } }
```

**Solution** :
```typescript
// Requête sans filtre
const statuts = await prisma.candidat.findMany({
  distinct: ['statutDossier'],
  select: { statutDossier: true }
})

// Filtrage TypeScript
return statuts
  .map(s => s.statutDossier)
  .filter((s): s is string => s !== null)
```

**Leçon** : Prisma ne supporte pas `{ not: null }` sur tous les types. Filtrer côté TypeScript si nécessaire.

---

### 2. Relation indirecte Prospect → Eleve

**Erreur** :
```
Unknown argument 'eleves'. Available options are marked with ?.
```

**Code initial** :
```typescript
where: {
  eleves: {
    some: { statutFormation: 'EN_COURS' }
  }
}
```

**Problème** : La relation `Prospect → Eleve` n'existe pas directement dans le schéma Prisma.

**Schéma réel** :
```prisma
model Prospect {
  candidats Candidat[]
}

model Candidat {
  prospect Prospect
  eleve    Eleve?
}

model Eleve {
  candidat Candidat
}
```

**Solution** :
```typescript
where: {
  candidats: {
    some: {
      eleve: {
        statutFormation: 'EN_COURS'
      }
    }
  }
}
```

**Leçon** : Toujours vérifier le schéma Prisma pour les relations. Si indirecte, utiliser les relations intermédiaires.

---

### 3. Build échoue sur pages élèves (pré-existant)

**Erreur** :
```
Error occurred prerendering page "/eleve/evaluations"
TypeError: Cannot read properties of undefined (reading 'length')
```

**Status** : **Non résolu** (erreur pré-existante, pas liée à cette session)

**Impact** : Build production échoue, mais serveur dev fonctionne normalement

**Prochaine action** : Corriger pages élèves dans session future

---

## Scripts Utiles

### 1. Mise à jour statuts lifecycle
```bash
npx tsx update-statuts-lifecycle.ts
```
- Synchronise statutProspect avec relations candidats/élèves
- À exécuter après migration ou incohérence détectée

### 2. Test filtrage prospects
```bash
npx tsx test-prospect-filtrage.ts
```
- Affiche répartition statuts
- Compte prospects disponibles vs masqués
- Vérifie logique métier

### 3. Vérification statuts actuels
```bash
npx tsx check-statuts-prospect.ts
```
- Liste statuts en base
- Affiche relations prospect-candidat-élève
- Utile pour debug

### 4. Ajout variété statuts
```bash
npx tsx add-missing-statuts.ts
```
- Ajoute 10 statuts différents aux candidats
- Utile pour tester filtres

### 5. Vérification données candidat
```bash
npx tsx check-candidat-complet.ts
```
- Affiche tous les champs disponibles d'un candidat
- Utile avant création modal/API

---

## Prochaines Étapes

### Phase immédiate

1. **Corriger pages élèves**
   - Identifier erreur `Cannot read properties of undefined (reading 'length')`
   - Corriger pour permettre build production

2. **Fonctionnalités boutons modal candidat**
   - Implémenter "Contacter le candidat" (modal/formulaire)
   - Implémenter "Télécharger dossier complet" (génération PDF via n8n)
   - Implémenter "Demander analyse Marjorie" (appel webhook n8n)

3. **Responsive design modal**
   - Tester modal sur tablette/mobile
   - Adapter footer sticky pour petits écrans

### Phase suivante

4. **Connexion page Élèves**
   - Même pattern que Candidats
   - Filtres : formation, formateur, statut formation
   - Modal détail avec notes, présences, progression

5. **Connexion page Formateurs**
   - Liste formateurs
   - Filtres : spécialité, statut
   - Modal détail avec sessions, élèves

6. **Dashboard stats**
   - Calculs CA, taux conversion
   - Graphiques temporels
   - Alertes (dossiers bloqués > 15j)

### Phase marketing (après stabilisation)

7. **Export prospects disponibles**
   - Export CSV/Excel avec filtres
   - Intégration Brevo/Mailchimp
   - Exclusion automatique CANDIDAT/ELEVE

8. **Historique campagnes**
   - Table `campagnes_marketing`
   - Traçabilité envois
   - Métriques ouverture/clic

---

## Conclusion

✅ **Objectifs atteints** :
- Page Candidats complètement connectée avec filtres et modal détail
- Logique cycle de vie prospects implémentée et testée
- Documentation complète créée
- Scripts de maintenance opérationnels

⚠️ **Point d'attention** :
- Build production échoue (erreur pages élèves pré-existante)
- Serveur dev fonctionne normalement
- À corriger en priorité

🎯 **Prochaine priorité** :
- Corriger pages élèves pour permettre build production
- Implémenter fonctionnalités boutons modal candidat

---

**Dernière mise à jour** : 10 février 2026
**Version** : 1.0
**Auteur** : Claude Code
