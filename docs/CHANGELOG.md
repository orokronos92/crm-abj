# Changelog — CRM ABJ

## [2026-02-25] Session 10 : Pipeline Conversion Prospect→Candidat→Élève

### Corrections Pipeline n8n → CRM

**Fichiers modifiés** :
- `src/components/admin/ConvertirCandidatModal.tsx`
- `src/components/admin/ProspectDetailPanel.tsx`
- `src/app/api/webhook/callback/route.ts`
- `src/services/candidat.service.ts`
- `src/services/eleve.service.ts`
- `src/app/api/candidats/[id]/route.ts`

**Changements** :

1. **modeFinancement transmis à n8n** : Ajout du champ dans les props du modal et dans le payload `metadonnees` envoyé à n8n lors de la conversion prospect→candidat

2. **tarifFormation transmis à n8n** : Lookup dans le state `formations` pour récupérer `tarifStandard` de la formation sélectionnée et l'inclure dans le payload

3. **Documents requis pour eleve_created** : Le callback webhook gère maintenant `eleve_created` en plus de `candidat_created` pour créer les placeholders de documents

4. **Filtre liste Candidats** : Ajout d'un filtre par défaut `notIn: ['INSCRIT', 'CONVERTI']` pour masquer les candidats déjà convertis en élèves (même logique que Prospects avec `notIn: ['CANDIDAT', 'ELEVE']`)

5. **Fallback formationSuivie** : La liste Élèves utilisait `inscriptionsSessions[0].session.formation` mais n8n écrit directement `formation_suivie` sur la table `eleves` sans créer de jointure `inscriptions_sessions`. Ajout d'un fallback `eleve.formationSuivie`

6. **Calcul reste à charge null** : Remplacement de `|| 0` par `?? (montantTotal - montantPEC)` pour distinguer "pas encore défini" (null → calculer) de "tout payé" (0 → garder 0)

**Commits** :
- `fix: transmission modeFinancement prospect → n8n lors de la conversion en candidat`
- `fix: masquer candidats INSCRIT/CONVERTI de la liste candidats par défaut`
- `fix: calcul reste à charge quand resteACharge est null (montant total - PEC)`
- `fix: fallback formationSuivie pour élèves créés par n8n sans inscription_session`

---

## [2026-02-07] Session UI/UX - Logo & Modal Candidat

### Logo Diamant ABJ

**Fichiers modifiés** :
- `src/components/ui/diamond-logo.tsx`
- `src/components/ui/splash-screen.tsx`
- `src/app/connexion/page.tsx`

**Changements** :
- Remplacement du logo diamant bleu par emoji diamond SVG
- Adaptation des couleurs au thème ABJ : or (#D4AF37, #FFD700) et noir (#1a1a1a)
- Application du nouveau logo sur 3 emplacements : splash screen, page connexion, sidebar CRM
- Réduction de la luminosité du halo (opacity 20% → 10%)

**Commit** : `feat: remplacement logo diamant bleu par emoji gold/black ABJ`

---

### Splash Screen

**Fichier modifié** : `src/components/ui/splash-screen.tsx`

**Changements** :
- Augmentation durée d'affichage : 4s → 5s
- Synchronisation fade out : 3.5s → 4.5s
- Réduction intensité halo lumineux : opacity 20% → 10%

**Commit** : `feat: augmentation durée splash screen et réduction luminosité halo`

---

### Bypass Authentification (Mode Démo)

**Fichier modifié** : `src/app/page.tsx`

**Changements** :
- Suppression de la vérification de session NextAuth
- Redirection directe vers `/admin/dashboard`
- Permet navigation sans authentification pour mode démo

**Code** :
```typescript
// Avant
export default async function HomePage() {
  const session = await getServerSession(authConfig)
  if (!session) {
    redirect('/connexion')
  }
  const userRole = session.user.role as keyof typeof HOME_ROUTES
  redirect(HOME_ROUTES[userRole])
}

// Après
export default async function HomePage() {
  redirect('/admin/dashboard')
}
```

**Commit** : `feat: bypass authentification pour mode démo`

---

### Restructuration Modal Candidat

**Fichier modifié** : `src/app/admin/candidats/page.tsx` (844 lignes)

**Changements majeurs** :

#### 1. Onglets en forme de dossier (Folder Tabs)
- Déplacement des onglets du milieu vers le haut du modal
- Design en forme de dossier physique avec effet 3D
- 5 onglets : Général, Parcours, Documents, Financement, Notes IA
- Tab actif par défaut : `general` (au lieu de `parcours`)

**Icons utilisés** :
- Général : `FileText`
- Parcours : `Target`
- Documents : `FolderOpen`
- Financement : `Euro`
- Notes IA : `Sparkles`

#### 2. Nouvel onglet "Général"
Contenu créé from scratch :
- **Header avec photo** : Avatar avec initiales + indicateur en ligne
- **Infos contact agrandies** :
  - Email : `text-sm` → `text-base`, icon `w-4 h-4` → `w-5 h-5`
  - Téléphone : `text-sm` → `text-base`, icon `w-4 h-4` → `w-5 h-5`
- **N° Dossier unique et agrandi** :
  - Suppression doublon dans grid (grid-cols-4 → grid-cols-3)
  - Taille : `text-sm` → `text-xl font-bold`
- **Badges statuts** : Dossier + Financement
- **Stats rapides** : Score + Nombre d'échanges
- **Infos principales** : Formation, Session, Date candidature

#### 3. Footer Sticky avec Actions
Inspiré de la page élèves (`src/app/admin/eleves/page.tsx`) :

**3 boutons** :
- "Contacter le candidat" (secondaire)
- "Télécharger dossier complet" (secondaire)
- "Demander analyse Marjorie" (accent/or)

**Code** :
```tsx
<div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
  <div className="flex items-center justify-between">
    <button className="...">
      <MessageSquare className="w-4 h-4" />
      Contacter le candidat
    </button>
    <div className="flex gap-2">
      <button className="...">
        <Download className="w-4 h-4" />
        Télécharger dossier complet
      </button>
      <button className="bg-[rgb(var(--accent))] ...">
        <Sparkles className="w-4 h-4" />
        Demander analyse Marjorie
      </button>
    </div>
  </div>
</div>
```

#### 4. Taille Constante du Modal
- Container : `flex-1 overflow-y-auto p-6`
- Scroll automatique si contenu dépasse
- Hauteur identique sur tous les onglets

#### 5. Corrections Techniques
- Fix erreur TypeScript : `getStatutDossierStyle()` n'existait pas
- Utilisation des constantes existantes : `STATUT_DOSSIER_COLORS` et `STATUT_FINANCEMENT_COLORS`

**Commits** :
1. `feat: ajout onglets dossier en haut du modal candidat`
2. `feat: suppression onglets milieu + agrandissement email/tel/dossier`
3. `feat: ajout onglet Général et footer sticky sur modal candidat`

---

## Structure des Composants UI

### DiamondLogo Component
**Fichier** : `src/components/ui/diamond-logo.tsx`

**Props** :
```typescript
interface DiamondLogoProps {
  className?: string
  size?: number // default: 32
}
```

**Couleurs** :
- Fill 1 : `#D4AF37` (or sombre)
- Fill 2 : `#FFD700` (or clair)
- Stroke : `#1a1a1a` (noir doux)

**Usage** :
```tsx
<DiamondLogo size={96} className="animate-pulse-gold" />
```

---

## Design System

### Badges Statuts Candidat

**Constantes** :
```typescript
const STATUT_DOSSIER_COLORS = {
  RECU: 'badge-info',
  EN_COURS: 'badge-warning',
  COMPLET: 'badge-success',
  REFUSE: 'badge-error',
}

const STATUT_FINANCEMENT_COLORS = {
  EN_ATTENTE: 'badge-warning',
  EN_COURS: 'badge-info',
  VALIDE: 'badge-success',
  REFUSE: 'badge-error',
}
```

### Score Couleurs

**Fonction** :
```typescript
const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-[rgb(var(--success))]'
  if (score >= 60) return 'text-[rgb(var(--warning))]'
  return 'text-[rgb(var(--error))]'
}
```

---

## Notes Techniques

### Problèmes Connus

1. **Build Production** : Erreur pré-existante sur page élève
   - `TypeError: Cannot read properties of null (reading 'useContext')`
   - N'affecte pas le dev server
   - À corriger en priorité

2. **Fast Refresh** : Warnings sur reload complet
   - Causé par modifications structurelles du modal
   - Pas d'impact sur fonctionnalité

3. **Git CRLF Warning** : Normal sur Windows
   - `warning: in the working copy of 'src/app/admin/candidats/page.tsx', LF will be replaced by CRLF`

### Serveur Dev

**Port** : `http://localhost:3000`
**Commande** : `npm run dev`
**Status** : ✅ Opérationnel

---

## Prochaines Étapes Suggérées

1. **Fonctionnalité des boutons footer** :
   - Implémenter action "Contacter le candidat" (modal/formulaire)
   - Implémenter "Télécharger dossier complet" (génération PDF via n8n)
   - Implémenter "Demander analyse Marjorie" (appel webhook n8n)

2. **Onglets restants** :
   - Vérifier cohérence design sur Documents, Financement, Notes IA
   - Harmoniser padding et spacing

3. **Responsive Design** :
   - Tester modal sur tablette/mobile
   - Adapter footer sticky pour petits écrans

4. **Tests** :
   - Tester navigation entre onglets
   - Vérifier scroll interne avec contenu long
   - Tester badges avec tous les statuts possibles

---

**Dernière mise à jour** : 2026-02-07
**Auteur** : Claude Code
**Version** : 1.0
