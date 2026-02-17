# Section Disponibilités Formateur - Documentation UI

**Date** : 17 février 2026
**Statut** : UI complète créée (backend à connecter)

---

## Vue d'ensemble

Section permettant au formateur de gérer ses disponibilités sur 2 ans (2026/2027) avec une interface timeline interactive inspirée du planning admin.

---

## Fichiers Créés

### 1. Page Principale
**Fichier** : `src/app/formateur/disponibilites/page.tsx`

**Fonctionnalités** :
- Sélecteur d'année (2026/2027)
- Timeline annuelle avec code couleur
- Info box explicative
- Légende des couleurs
- Gestion des modals (mois + formulaire)
- Stats résumé (jours disponibles, sessions, indisponibles)

**État** :
```typescript
const [anneeSelectionnee, setAnneeSelectionnee] = useState(2026)
const [disponibilites, setDisponibilites] = useState<any[]>([])
const [sessions, setSessions] = useState<any[]>([])
const [monthModalOpen, setMonthModalOpen] = useState<{ mois: number; annee: number } | null>(null)
const [formModalOpen, setFormModalOpen] = useState<{ date?: string; creneau?: string; dispo?: any } | null>(null)
```

**Hooks à implémenter** :
- `useEffect` pour fetch disponibilités depuis `/api/formateur/disponibilites?annee=${anneeSelectionnee}`
- `useEffect` pour fetch sessions depuis `/api/formateur/sessions?annee=${anneeSelectionnee}`

---

### 2. Composant Timeline
**Fichier** : `src/components/formateur/disponibilites/DisponibiliteTimeline.tsx` (134 lignes)

**Affichage** :
- Grille 12 mois horizontale
- Code couleur par mois :
  - 🟢 **Vert** : Jours disponibles (compte)
  - 🔴 **Rouge** : Session en cours (icône livre)
  - ⚫ **Gris/Noir** : Jours indisponibles (compte)
  - ⚪ **Transparent** : Aucune disponibilité

**Tooltip au survol** :
- Si session : Nom de la session + dates

**Stats** :
- 3 cartes : Jours disponibles (vert), Sessions en cours (rouge), Jours indisponibles (gris)

**Props** :
```typescript
interface DisponibiliteTimelineProps {
  anneeSelectionnee: number
  disponibilites: any[]
  sessions: any[]
  onMonthClick: (mois: number) => void
}
```

---

### 3. Modal Détail Mois
**Fichier** : `src/components/formateur/disponibilites/DisponibiliteMonthModal.tsx` (226 lignes)

**Affichage** :
- 3 créneaux (Matin / Après-midi / Journée)
- Grille 7 jours × N semaines
- Code couleur par cellule :
  - 🟢 Vert : Disponible (modifiable)
  - 🔴 Rouge : Session verrouillée (non modifiable)
  - ⚫ Gris : Indisponible (modifiable)
  - ⚪ Transparent : Aucune dispo (cliquable pour ajouter)

**Interactions** :
- Click cellule vide → Ouvrir formulaire ajout
- Click cellule disponible/indisponible → Ouvrir formulaire édition
- Click cellule verrouillée → Rien (tooltip affiché)

**Tooltip cellules verrouillées** :
```
🔒 Session verrouillée
Pour modifier cette date, envoyez une demande à la direction
```

**Logique de verrouillage** :
```typescript
const isLocked = dispo && (
  dispo.typeDisponibilite === 'CONFIRME' ||
  dispo.typeDisponibilite === 'RESERVE' ||
  hasSessionOnDay(jour.numero)
)
```

**Props** :
```typescript
interface DisponibiliteMonthModalProps {
  mois: number
  annee: number
  disponibilites: any[]
  sessions: any[]
  onClose: () => void
  onAddDispo: (date: string, creneau: string) => void
  onEditDispo: (dispo: any) => void
}
```

---

### 4. Modal Formulaire
**Fichier** : `src/components/formateur/disponibilites/DisponibiliteFormModal.tsx` (189 lignes)

**Champs** :
1. **Date** (input date, requis)
2. **Créneau** (select, requis)
   - MATIN (9h-12h)
   - APRES_MIDI (14h-17h)
   - JOURNEE (Journée complète)
3. **Type** (boutons radio, requis)
   - DISPONIBLE (vert)
   - INDISPONIBLE (gris)
4. **Commentaire** (textarea, optionnel)

**Actions** :
- Mode création : Bouton "Ajouter"
- Mode édition : Boutons "Supprimer" + "Enregistrer"

**État** :
```typescript
const [formData, setFormData] = useState({
  date: dispo?.date || date || new Date().toISOString().split('T')[0],
  creneauJournee: dispo?.creneauJournee || creneau || 'MATIN',
  typeDisponibilite: dispo?.typeDisponibilite || 'DISPONIBLE',
  commentaire: dispo?.commentaire || '',
})
```

**Validation** :
- Date : Requis
- Créneau : Requis
- Type : Requis (défaut DISPONIBLE)

**Props** :
```typescript
interface DisponibiliteFormModalProps {
  date?: string
  creneau?: string
  dispo?: any
  onClose: () => void
  onSave: (data: any) => void
}
```

---

## Code Couleur Système

### Timeline (vue mois)
| Statut | Couleur | RGB | Signification |
|--------|---------|-----|---------------|
| Session en cours | 🔴 Rouge | `239, 68, 68` | Verrouillé, non modifiable |
| Disponible | 🟢 Vert | `34, 197, 94` | Jours où le formateur peut enseigner |
| Indisponible | ⚫ Gris | `71, 85, 105` | Jours bloqués par le formateur |
| Vide | ⚪ Transparent | - | Aucune info renseignée |

### Modal détail (cellules)
| Statut | Couleur fond | Bordure | Indicateur |
|--------|--------------|---------|------------|
| Session verrouillée | `rgba(239, 68, 68, 0.15)` | `rgba(239, 68, 68, 0.4)` | 🔒 |
| Disponible | `rgba(34, 197, 94, 0.15)` | `rgba(34, 197, 94, 0.4)` | ✓ |
| Indisponible | `rgba(71, 85, 105, 0.15)` | `rgba(71, 85, 105, 0.4)` | ✗ |
| Vide | `transparent` | `rgba(var(--border), 0.3)` | - |

---

## Endpoints API à Créer

### GET `/api/formateur/disponibilites`
**Query params** :
- `annee` : 2026 ou 2027

**Retour** :
```json
{
  "success": true,
  "disponibilites": [
    {
      "idDisponibilite": 1,
      "idFormateur": 7,
      "date": "2026-03-15",
      "creneauJournee": "MATIN",
      "typeDisponibilite": "DISPONIBLE",
      "commentaire": "Disponible uniquement le matin",
      "idSession": null
    }
  ]
}
```

### GET `/api/formateur/sessions`
**Query params** :
- `annee` : 2026 ou 2027

**Retour** :
```json
{
  "success": true,
  "sessions": [
    {
      "idSession": 1,
      "nomSession": "CAP ATBJ - Mars 2026",
      "dateDebut": "2026-03-15",
      "dateFin": "2026-09-15",
      "statutSession": "EN_COURS"
    }
  ]
}
```

### POST `/api/formateur/disponibilites`
**Body** :
```json
{
  "date": "2026-03-15",
  "creneauJournee": "MATIN",
  "typeDisponibilite": "DISPONIBLE",
  "commentaire": "Disponible ce jour"
}
```

**Validation backend** :
- Vérifier `idFormateur` depuis session
- Vérifier pas de conflit avec session verrouillée

### PATCH `/api/formateur/disponibilites/[id]`
**Body** :
```json
{
  "typeDisponibilite": "INDISPONIBLE",
  "commentaire": "Congés"
}
```

**Validation backend** :
- Vérifier ownership (idFormateur)
- Vérifier pas verrouillée (CONFIRME/RESERVE ou session EN_COURS)
- Si verrouillée → retour 403 avec message

### DELETE `/api/formateur/disponibilites/[id]`
**Validation backend** :
- Même validation que PATCH
- Si verrouillée → 403

---

## Logique de Verrouillage

### Côté Backend (CRITIQUE)
```typescript
function estVerrouillee(dispo: DisponibiliteFormateur, session?: Session): boolean {
  // Cas 1 : Type verrouillé
  if (['CONFIRME', 'RESERVE'].includes(dispo.typeDisponibilite)) {
    return true
  }

  // Cas 2 : Session verrouillée
  if (dispo.idSession && session) {
    const statutsVerrouilles = ['CONFIRMEE', 'EN_COURS', 'VALIDE_MARJORIE', 'DIFFUSEE']
    return statutsVerrouilles.includes(session.statutSession || '')
  }

  return false
}
```

### Côté Frontend
```typescript
const isLocked = dispo && (
  dispo.typeDisponibilite === 'CONFIRME' ||
  dispo.typeDisponibilite === 'RESERVE' ||
  hasSessionOnDay(jour.numero)
)
```

---

## Workflow Utilisateur

```
1. Formateur clique "Disponibilités" dans menu
    ↓
2. Affichage timeline 12 mois année sélectionnée
    ↓
3. Click sur un mois
    ↓
4. Modal détail avec grille jours × créneaux
    ↓
5a. Click cellule vide → Formulaire ajout
    → Sélectionne type (DISPONIBLE/INDISPONIBLE)
    → Sauvegarde → POST API

5b. Click cellule existante (vert/gris) → Formulaire édition
    → Modifie ou supprime
    → Sauvegarde → PATCH/DELETE API

5c. Survol cellule rouge → Tooltip "Session verrouillée"
    → Click désactivé
    → Message : "Envoyez demande direction"
```

---

## Futures Améliorations (Post-MVP)

### Phase 2 : Notification demande modification
- Bouton dans tooltip cellule rouge : "Demander modification"
- Modal confirmation avec formulaire motif
- Envoi notification ADMIN via API `/api/formateur/disponibilites/demande-modification`

### Phase 3 : Récurrence
- Bouton "Répéter cette disponibilité"
- Modal sélection : Toutes les semaines / Tous les mardis / Personnalisé
- Génération batch de disponibilités

### Phase 4 : Import/Export
- Export calendrier (format iCal)
- Import disponibilités depuis fichier

### Phase 5 : Statistiques
- Graphique évolution disponibilités par mois
- Comparaison année N vs N-1
- Taux de remplissage (jours disponibles utilisés)

---

## Checklist Intégration Backend

- [ ] Créer endpoint GET `/api/formateur/disponibilites`
- [ ] Créer endpoint GET `/api/formateur/sessions`
- [ ] Créer endpoint POST `/api/formateur/disponibilites`
- [ ] Créer endpoint PATCH `/api/formateur/disponibilites/[id]`
- [ ] Créer endpoint DELETE `/api/formateur/disponibilites/[id]`
- [ ] Implémenter validation verrouillage backend
- [ ] Tester avec données réelles
- [ ] Gérer erreurs (403 si verrouillé, 404 si not found)
- [ ] Implémenter refresh après create/update/delete
- [ ] Ajouter loading states (skeleton?)

---

## Notes Techniques

### Composants Taille
- ✅ DisponibiliteTimeline.tsx : 134 lignes (< 150)
- ✅ DisponibiliteMonthModal.tsx : 226 lignes (< 300)
- ✅ DisponibiliteFormModal.tsx : 189 lignes (< 300)

### Build TypeScript
✅ Build réussi sans erreurs

### Respect Charte Graphique
- ✅ Utilisation variables CSS (`rgb(var(--accent))`)
- ✅ Code couleur cohérent (vert/rouge/gris)
- ✅ Icons lucide-react
- ✅ Modals avec backdrop blur
- ✅ Transitions smooth
- ✅ Footer sticky sur modals

---

**Dernière mise à jour** : 17 février 2026
**Auteur** : Claude Code
**Status** : ✅ UI Complète - Backend à connecter
