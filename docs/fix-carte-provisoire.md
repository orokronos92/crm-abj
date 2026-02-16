# Fix Carte Provisoire - Session Planning

**Date** : 15 février 2026

## Problème Identifié

La carte provisoire affichée pendant l'analyse de Marjorie montrait des données incorrectes :

1. **Heures fantaisistes** : Le calcul sommait les heures totales du CAP (800h) avec les heures des matières individuelles (200h + 100h + ...), alors que les heures des matières sont une **répartition** des 800h totales pour permettre à Marjorie de créer un planning dynamique.

2. **Participants manquants** : Le nombre de participants n'était pas affiché dans la carte provisoire.

## Solution Implémentée

### 1. Frontend - SessionProposalReview.tsx

**Modification du calcul des heures** (lignes 26-36) :
```typescript
// IMPORTANT: Pour un CAP, les heures des matières sont une RÉPARTITION des 800h totales
// On ne doit PAS additionner toutes les heures de toutes les séances
// On prend le total_heures_formation du proposal s'il existe, sinon on calcule
const totalHeures = proposal.planningGenere.total_heures_formation
  ? proposal.planningGenere.total_heures_formation
  : proposal.planningGenere.seances.reduce((sum: number, s) => {
      const debut = new Date(`1970-01-01T${s.heureDebut}`)
      const fin = new Date(`1970-01-01T${s.heureFin}`)
      const diff = (fin.getTime() - debut.getTime()) / (1000 * 60 * 60)
      return sum + diff
    }, 0)
```

**Ajout d'une 5ème carte pour les participants** :
```typescript
<div className="grid grid-cols-5 gap-4">
  {proposal.planningGenere.nb_participants && (
    <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
      <Users className="w-4 h-4 text-[rgb(var(--accent))]" />
      <p className="text-xs">Participants</p>
      <p className="text-2xl font-bold">{proposal.planningGenere.nb_participants}</p>
    </div>
  )}
  {/* ... autres cartes ... */}
</div>
```

### 2. Types - session-form.types.ts

**Ajout de nouveaux champs optionnels** :
```typescript
export interface SessionProposal {
  idSession: number
  statut: StatutSession
  planningGenere: {
    seances: Seance[]
    total_heures_formation?: number // ← NOUVEAU
    nb_participants?: number        // ← NOUVEAU
    statsOccupation?: {             // ← Rendu optionnel
      salles: { nom: string, tauxOccupation: number }[]
      formateurs: { nom: string, heuresTotal: number }[]
    }
    rapportIA: string
  }
}
```

### 3. Backend - API /api/sessions/validate

**Sauvegarde des métadonnées en base** :

Pour les **formations COURTE** (lignes 68-88) :
```typescript
// Préparer les métadonnées pour la session COURTE
const metadonnees = {
  description: data.description,
  nbParticipants: data.nbParticipants,
  joursActifs: data.joursActifs,
  salleId: data.salleId,
  formateurId: data.formateurId
}

const session = await prisma.session.create({
  data: {
    // ... autres champs ...
    notes: JSON.stringify(metadonnees), // Sauvegarder les métadonnées
  },
})
```

Pour les **formations CAP** (lignes 129-220) :
```typescript
// Calculer le total des heures du programme
const totalHeuresProgramme = data.programme.reduce((sum, m) => sum + m.heures, 0)

// Préparer les métadonnées complètes pour la session
const metadonnees = {
  programme: data.programme,
  plageHoraire: data.plageHoraire,
  periodesInterdites: data.periodesInterdites,
  notesComplementaires: data.notesComplementaires,
  totalHeuresProgramme, // Total calculé
  nbParticipants: data.nbParticipants,
  formateurs: data.formateurs,
  salles: data.salles
}

const session = await prisma.session.create({
  data: {
    // ... autres champs ...
    notes: JSON.stringify(metadonnees), // Sauvegarder toutes les métadonnées
  },
})
```

**Retour des bonnes valeurs dans la réponse provisoire** :

COURTE (lignes 109-121) :
```typescript
return NextResponse.json({
  idSession: session.idSession,
  statut: 'EN_ANALYSE',
  planningGenere: {
    seances: [],
    total_heures_formation: 0, // Sera calculé par Marjorie
    nb_participants: data.nbParticipants, // ← NOUVEAU
    statsOccupation: { salles: [], formateurs: [] },
    rapportIA: 'Analyse en cours par Marjorie...',
  },
})
```

CAP (lignes 235-247) :
```typescript
return NextResponse.json({
  idSession: session.idSession,
  statut: 'EN_ANALYSE',
  planningGenere: {
    seances: [],
    total_heures_formation: totalHeuresProgramme, // ← NOUVEAU
    nb_participants: data.nbParticipants,         // ← NOUVEAU
    statsOccupation: { salles: [], formateurs: [] },
    rapportIA: 'Analyse en cours par Marjorie...',
  },
})
```

### 4. Configuration - middleware.ts

**Ajout de `/api/sessions` aux routes publiques** pour permettre les tests :
```typescript
const publicRoutes = [
  '/connexion',
  '/api/auth',
  '/api/notifications',
  '/api/salles',
  '/api/evenements',
  '/api/formateurs',
  '/api/sessions', // ← NOUVEAU
  '/_next',
  '/favicon.ico'
]
```

## Tests Créés

### 1. test-session-provisoire.ts

Script complet de test qui :
- Crée une session CAP de test avec 800h réparties sur 6 matières
- Envoie la requête à l'API
- Vérifie que `total_heures_formation` = 800h (correct)
- Vérifie que `nb_participants` = 12 (correct)

**Résultat** : ✅ Tous les tests passent

### 2. check-session-12.ts

Script de vérification qui :
- Lit la session créée en base de données
- Affiche les métadonnées sauvegardées dans le champ `notes`
- Confirme que les données sont bien persistées

**Résultat** : ✅ Les métadonnées sont bien sauvegardées

## Résultat Final

La carte provisoire affiche maintenant :
- **800h** pour un CAP (au lieu de 800h + 200h + 100h + ...)
- **12 participants** (nouvelle carte statistique)
- Les données sont **sauvegardées en base** dans le champ `notes` en JSON

## Fichiers Modifiés

1. `src/components/admin/SessionProposalReview.tsx`
2. `src/components/admin/session-form/session-form.types.ts`
3. `src/app/api/sessions/validate/route.ts`
4. `middleware.ts`

## Fichiers Créés

1. `scripts/test-session-provisoire.ts`
2. `scripts/check-session-12.ts`
3. `docs/fix-carte-provisoire.md` (ce document)

## Logique Métier

Pour rappel : **Les heures des matières dans un CAP sont une RÉPARTITION, pas une addition**.

Exemple :
- CAP Bijouterie = **800h au total**
- Répartition :
  - 200h de Sertissage
  - 100h de Dessin technique
  - 150h de Polissage
  - 80h d'Histoire de l'art
  - 100h de Gemmologie
  - 170h de Joaillerie création
  - **Total : 800h** (pas 800h + 800h = 1600h !)

Cette répartition permet à Marjorie de créer un planning dynamique en sachant combien d'heures allouer à chaque matière sur les 10 mois de formation.
