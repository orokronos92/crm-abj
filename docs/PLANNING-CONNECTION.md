# Plan de Connexion Section Planning

**Date** : 13 février 2026
**Objectif** : Connecter complètement la section Planning au backend (BDD + API)

---

## État Actuel

### ✅ Déjà fait
- ✅ Table `Evenement` créée (5 types, soft delete, traçabilité)
- ✅ Table `Salle` créée (9 salles seedées, soft delete)
- ✅ Relation `Session.idSalle` ajoutée (FK optionnelle)
- ✅ UI Planning complète avec 3 onglets (Salles, Formateurs, Événements)
- ✅ Composants modaux : `EvenementFormModal`, `MonthDetailModal`
- ✅ Timeline annuelle 12 mois fonctionnelle (avec mock data)

### ❌ À faire
- ❌ API Routes pour salles et événements
- ❌ Connexion formulaire événement au backend
- ❌ Connexion timelines avec données BDD
- ❌ Validation conflit de salle
- ❌ Tests end-to-end

---

## Phase 1 : API Routes

### 1.1 API Salles

**Fichier** : `src/app/api/salles/route.ts`

**Endpoint** : `GET /api/salles`

**Paramètres query** :
- `disponibleWeekend` (boolean optionnel)
- `disponibleSoir` (boolean optionnel)
- `capaciteMin` (number optionnel)
- `statut` (string optionnel, défaut: ACTIVE)

**Réponse** :
```json
{
  "success": true,
  "salles": [
    {
      "idSalle": 1,
      "nom": "Atelier A",
      "code": "ATEL_A",
      "capaciteMax": 12,
      "surfaceM2": 60,
      "etage": 0,
      "equipements": ["ETABLI_BIJOU", ...],
      "disponibleWeekend": false,
      "disponibleSoir": true,
      "statut": "ACTIVE"
    },
    ...
  ]
}
```

**Cas d'usage** :
- Dropdown sélection salle dans `EvenementFormModal`
- Dropdown sélection salle dans futur formulaire Session
- Page admin gestion salles

---

### 1.2 API Événements

#### POST /api/evenements (Créer)

**Fichier** : `src/app/api/evenements/route.ts`

**Body** :
```json
{
  "type": "PORTES_OUVERTES",
  "titre": "Portes ouvertes printemps 2026",
  "description": "Découverte des métiers...",
  "date": "2026-03-15",
  "heureDebut": "09:00",
  "heureFin": "17:00",
  "salle": "Tous les ateliers",
  "nombreParticipants": 50,
  "notes": "Prévoir rafraîchissements"
}
```

**Validation AVANT création** :
1. Vérifier que la salle existe (si pas "Tous les ateliers")
2. **Vérifier conflit** : Salle déjà occupée à ces dates/heures ?
   - Check dans `evenements` (statut ≠ ANNULE)
   - Check dans `sessions` (si `sallePrincipale` ou `idSalle` match)
3. Si conflit → Erreur 409 avec détails
4. Si OK → Créer avec `creePar` = userId de la session

**Réponse succès** :
```json
{
  "success": true,
  "evenement": { ...données complètes... }
}
```

**Réponse erreur 409** :
```json
{
  "success": false,
  "error": "Salle déjà occupée",
  "details": {
    "salle": "Atelier B",
    "date": "2026-03-15",
    "conflitAvec": "Session CAP Bijou (09:00-17:00)"
  }
}
```

---

#### GET /api/evenements (Lister)

**Paramètres query** :
- `annee` (number, défaut: année courante)
- `mois` (number optionnel, 1-12)
- `type` (string optionnel)
- `salle` (string optionnel)
- `statut` (string optionnel, défaut: tous sauf ANNULE)
- `includeAnnules` (boolean, défaut: false)

**Réponse** :
```json
{
  "success": true,
  "evenements": [
    {
      "idEvenement": 1,
      "type": "PORTES_OUVERTES",
      "titre": "...",
      "date": "2026-03-15",
      "heureDebut": "09:00",
      "heureFin": "17:00",
      "salle": "Tous les ateliers",
      "nombreParticipants": 50,
      "participantsInscrits": 12,
      "statut": "CONFIRME",
      "creeLe": "2026-02-13T10:30:00Z"
    },
    ...
  ],
  "total": 15
}
```

---

#### PATCH /api/evenements/[id] (Modifier)

**Fichier** : `src/app/api/evenements/[id]/route.ts`

**Body** (tous champs optionnels) :
```json
{
  "titre": "Nouveau titre",
  "date": "2026-03-20",
  "heureDebut": "10:00",
  "salle": "Atelier A",
  "statut": "CONFIRME",
  "participantsInscrits": 25
}
```

**Validation** :
- Si changement date/heure/salle → Revérifier conflit
- Ajouter `modifiePar` = userId

**Réponse** : Même format que GET

---

#### DELETE /api/evenements/[id] (Soft delete)

**Body optionnel** :
```json
{
  "motifAnnulation": "Formateur indisponible - report prévu"
}
```

**Action** :
- Ne PAS supprimer physiquement
- Update : `statut = ANNULE`, `annulePar = userId`, `dateAnnulation = now()`, `motifAnnulation`

**Réponse** :
```json
{
  "success": true,
  "message": "Événement annulé (conservé en base)",
  "evenement": { ...données... }
}
```

---

## Phase 2 : Connexion EvenementFormModal

### 2.1 Modifications composant

**Fichier** : `src/components/admin/EvenementFormModal.tsx`

**Changements** :

1. **Remplacer SALLES_OPTIONS** (hardcodé) par appel API :
```typescript
const [salles, setSalles] = useState<Salle[]>([])
const [loading, setLoading] = useState(false)

useEffect(() => {
  async function fetchSalles() {
    const res = await fetch('/api/salles')
    const data = await res.json()
    if (data.success) setSalles(data.salles)
  }
  fetchSalles()
}, [])

// Dans le select
<select value={formData.salle} onChange={...}>
  {salles.map(salle => (
    <option key={salle.idSalle} value={salle.nom}>
      {salle.nom} ({salle.capaciteMax} places)
    </option>
  ))}
</select>
```

2. **Remplacer onSave** (callback) par appel API :
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  const method = evenement ? 'PATCH' : 'POST'
  const url = evenement
    ? `/api/evenements/${evenement.id}`
    : '/api/evenements'

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    const data = await res.json()

    if (res.ok && data.success) {
      // Succès
      onClose()
      // Trigger refresh de la timeline (via callback parent)
      onSuccess?.()
    } else if (res.status === 409) {
      // Conflit de salle
      setError(`Salle déjà occupée : ${data.details.conflitAvec}`)
    } else {
      setError(data.error || 'Erreur lors de la création')
    }
  } catch (err) {
    setError('Erreur réseau')
  } finally {
    setLoading(false)
  }
}
```

3. **Afficher message d'erreur** si conflit :
```typescript
{error && (
  <div className="bg-[rgba(var(--error),0.1)] border border-[rgb(var(--error))] rounded-lg p-3 mb-4">
    <p className="text-[rgb(var(--error))] text-sm">{error}</p>
  </div>
)}
```

---

## Phase 3 : Connexion Timelines

### 3.1 Timeline Événements (onglet 3)

**Fichier** : `src/app/admin/planning/page.tsx`

**État actuel** : Mock data hardcodé

**Changements** :

1. **Fetch événements au chargement** :
```typescript
const [evenements, setEvenements] = useState<Evenement[]>([])

useEffect(() => {
  async function fetchEvenements() {
    const res = await fetch(`/api/evenements?annee=${selectedYear}`)
    const data = await res.json()
    if (data.success) setEvenements(data.evenements)
  }
  fetchEvenements()
}, [selectedYear])
```

2. **Calculer événements par mois** (remplace mock) :
```typescript
const evenementsDuMois = (mois: number) => {
  return evenements.filter(evt => {
    const evtDate = new Date(evt.date)
    return evtDate.getFullYear() === selectedYear &&
           evtDate.getMonth() === mois &&
           evt.statut !== 'ANNULE'
  })
}
```

3. **Callback refresh après création/modification** :
```typescript
const refreshEvenements = async () => {
  const res = await fetch(`/api/evenements?annee=${selectedYear}`)
  const data = await res.json()
  if (data.success) setEvenements(data.evenements)
}

// Passer à EvenementFormModal
<EvenementFormModal
  evenement={selectedEvent}
  onClose={...}
  onSuccess={refreshEvenements} // ← AJOUT
/>
```

---

### 3.2 Timeline Salles (onglet 1)

**Données nécessaires** :
- Événements utilisant chaque salle (déjà fetch)
- Sessions utilisant chaque salle (à fetch)

**À ajouter** :
```typescript
const [sessions, setSessions] = useState<Session[]>([])

useEffect(() => {
  async function fetchSessions() {
    const res = await fetch(`/api/sessions?annee=${selectedYear}`)
    const data = await res.json()
    if (data.success) setSessions(data.sessions)
  }
  fetchSessions()
}, [selectedYear])
```

**Calcul occupation salle** :
```typescript
const getOccupationSalle = (salle: string, mois: number) => {
  const evtsSalle = evenements.filter(e =>
    e.salle === salle &&
    new Date(e.date).getMonth() === mois &&
    e.statut !== 'ANNULE'
  )

  const sessionsSalle = sessions.filter(s =>
    (s.sallePrincipale === salle || s.salle?.nom === salle) &&
    // ... date overlaps mois
  )

  return {
    nbEvenements: evtsSalle.length,
    nbSessions: sessionsSalle.length,
    occupation: calculerPourcentage(evtsSalle, sessionsSalle)
  }
}
```

---

### 3.3 Timeline Formateurs (onglet 2)

**Données nécessaires** :
- DisponibilitesFormateur (déjà en BDD)
- Sessions avec formateur

**À créer** : API `/api/disponibilites-formateurs`

**Logique** :
- Vert foncé : Disponible
- Jaune : Réservé (session prévue)
- Rouge : Indisponible
- Gris : Aucune info

---

## Phase 4 : Tests End-to-End

### Test Scénario 1 : Création événement sans conflit

1. Ouvrir Planning → Onglet Événements
2. Click "Créer événement"
3. Remplir formulaire : Portes ouvertes, 15/03/2026, 9h-17h, "Tous les ateliers"
4. Submit
5. ✅ Modal se ferme
6. ✅ Timeline rafraîchie, événement apparaît en mars
7. ✅ Click sur mars → Modal détail affiche l'événement

### Test Scénario 2 : Création événement avec conflit

1. Créer événement : Atelier B, 10/04/2026, 14h-18h
2. Essayer de créer autre événement : Atelier B, 10/04/2026, 16h-20h
3. ✅ Message d'erreur "Salle déjà occupée : Stage initiation sertissage (14:00-18:00)"
4. ✅ Formulaire reste ouvert, peut modifier

### Test Scénario 3 : Modification événement

1. Click sur événement existant dans timeline
2. Modal s'ouvre en mode édition
3. Changer titre + date
4. Submit
5. ✅ Timeline rafraîchie avec nouvelles infos

### Test Scénario 4 : Annulation événement

1. Click sur événement
2. Click "Supprimer" (implémenté dans modal)
3. Confirmation demandée
4. ✅ Événement disparaît de la timeline
5. ✅ Reste en BDD avec statut ANNULE

---

## Checklist Finale

- [ ] API GET /api/salles fonctionne
- [ ] API POST /api/evenements fonctionne + validation conflit
- [ ] API GET /api/evenements fonctionne
- [ ] API PATCH /api/evenements/[id] fonctionne
- [ ] API DELETE /api/evenements/[id] fonctionne (soft delete)
- [ ] EvenementFormModal connecté au backend
- [ ] Dropdown salles chargé depuis API
- [ ] Message erreur si conflit salle
- [ ] Timeline Événements affiche données BDD
- [ ] Timeline Salles affiche occupation réelle
- [ ] Timeline Formateurs affiche disponibilités
- [ ] Refresh automatique après création/modification
- [ ] Tests scénarios 1-4 passent

---

## Notes Techniques

### Validation Conflit de Salle

**Query Prisma pour détecter conflit** :
```typescript
// Pour un événement (jour complet)
const conflitEvenement = await prisma.evenement.findFirst({
  where: {
    salle: salleChoisie,
    date: dateChoisie,
    statut: { notIn: ['ANNULE'] }
  }
})

// Pour une session (période)
const conflitSession = await prisma.session.findFirst({
  where: {
    OR: [
      { sallePrincipale: salleChoisie },
      { salle: { nom: salleChoisie } }
    ],
    AND: [
      { dateDebut: { lte: dateFin } },
      { dateFin: { gte: dateDebut } }
    ],
    statutSession: { notIn: ['ANNULEE'] }
  }
})

if (conflitEvenement || conflitSession) {
  return { error: 'Conflit détecté', conflit: ... }
}
```

### Gestion des Dates

- Frontend → Backend : Format ISO `"2026-03-15"`
- Backend → Prisma : `new Date("2026-03-15")`
- Prisma → Frontend : `.toISOString()` puis `.split('T')[0]`

### Authentification

- Récupérer `userId` depuis session NextAuth
- Passer dans `creePar`, `modifiePar`, `annulePar`

---

**Version** : 1.0
**Dernière mise à jour** : 13 février 2026
