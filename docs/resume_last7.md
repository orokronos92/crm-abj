# Résumé Session 7 : Optimisation Timeline Planning avec Calcul d'Occupation Réel

**Date** : 14 février 2026
**Objectif principal** : Corriger le calcul du pourcentage d'occupation des salles et harmoniser le code couleur

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Phase 1 : Correction Calcul d'Occupation](#phase-1--correction-calcul-doccupation)
3. [Phase 2 : Simplification Affichage](#phase-2--simplification-affichage)
4. [Phase 3 : Refonte Code Couleur](#phase-3--refonte-code-couleur)
5. [Architecture Finale](#architecture-finale)
6. [Problèmes Résolus](#problèmes-résolus)

---

## Vue d'ensemble

Cette session a permis de :
1. ✅ Corriger le calcul du pourcentage d'occupation (basé sur jours réels au lieu du nombre d'activités)
2. ✅ Simplifier l'affichage des cellules (retrait ligne de détail "2s • 1e")
3. ✅ Refondre complètement le code couleur pour une logique intuitive
4. ✅ Harmoniser la légende avec carrés noirs et textes colorés

**Contexte de la demande** :
L'utilisateur a identifié deux problèmes majeurs :
1. Formule de calcul incorrecte : "février pour l'atelier a une seule journee rempli et j'ai 25% sur la case et avril qui est remplit est afficher aussi a 25 pourcent pas logique"
2. Affichage superflu : "tu laisse que le pourcentage tu enleve l'autre mention (c'etait le nombre de seccion dans cette sale inutile)"
3. Code couleur contre-intuitif : "0 pourcent tu affiche libre en vert... au dessus de 80 rouge c'est mieux"

---

## Phase 1 : Correction Calcul d'Occupation

### Problème Identifié

**Formule incorrecte** (avant) :
```typescript
const occupation = nbTotal > 0
  ? Math.min(100, Math.round((nbTotal / 4) * 100))
  : 0
```

Cette formule calculait le pourcentage selon le **nombre d'activités** :
- 1 activité (session ou événement) = 25%
- 2 activités = 50%
- 3 activités = 75%
- 4+ activités = 100%

**Résultat aberrant** :
- Février (28 jours) avec 1 événement ponctuel le 15 → **25%** ❌
- Avril (30 jours) avec une session du 1 au 30 → **25%** ❌
- Aucune prise en compte de la durée réelle d'occupation

### Solution Implémentée

**Nouvelle formule** (après) :
```typescript
// Calculer les jours réellement occupés dans le mois
const joursOccupes = new Set<number>()

// Ajouter les jours des sessions
sessionsCeMois.forEach(session => {
  const sessionDebut = new Date(session.dateDebut)
  const sessionFin = new Date(session.dateFin)

  // Limiter au mois courant
  const dateDebutMois = sessionDebut < debutMois ? debutMois : sessionDebut
  const dateFinMois = sessionFin > finMois ? finMois : sessionFin

  // Ajouter chaque jour de la session
  const currentDate = new Date(dateDebutMois)
  while (currentDate <= dateFinMois) {
    joursOccupes.add(currentDate.getDate())
    currentDate.setDate(currentDate.getDate() + 1)
  }
})

// Ajouter les jours des événements
evenementsCeMois.forEach(evt => {
  const evtDate = new Date(evt.date)
  joursOccupes.add(evtDate.getDate())
})

// Calculer le nombre total de jours dans le mois
const nbJoursDansMois = new Date(anneeSelectionnee, moisIdx + 1, 0).getDate()

// Calculer le pourcentage réel d'occupation
const occupation = joursOccupes.size > 0
  ? Math.round((joursOccupes.size / nbJoursDansMois) * 100)
  : 0
```

### Résultats Corrigés

**Exemples concrets** :
- **Février (28 jours)** avec 1 événement le 15 → `1/28 = 4%` ✅
- **Avril (30 jours)** avec session du 1 au 30 → `30/30 = 100%` ✅
- **Mars (31 jours)** avec session 15-31 (17j) + événement le 5 → `18/31 = 58%` ✅
- **Mai (31 jours)** avec 2 sessions qui se chevauchent 1-20 et 10-25 → `25/31 = 81%` ✅

**Points clés** :
- Utilisation d'un `Set<number>` pour éviter les doublons de jours
- Prise en compte des sessions qui chevauchent le mois (début avant, fin après)
- Calcul du nombre exact de jours selon le mois (28-31)
- Combinaison sessions + événements sans double comptage

---

## Phase 2 : Simplification Affichage

### Avant

```typescript
{nbTotal > 0 ? (
  <div className="text-center">
    <div className="text-2xl font-bold">
      {occupation}%
    </div>
    <div className="text-[10px] text-[rgb(var(--muted-foreground))] mt-0.5">
      {nbSessions}s • {nbEvenements}e  // ← Ligne superflue
    </div>
  </div>
) : (
  <div className="text-xs">Libre</div>
)}
```

### Après

```typescript
{occupation === 0 ? (
  <div className="text-xs font-medium" style={{ color: 'rgb(34, 197, 94)' }}>
    Libre
  </div>
) : (
  <div className="text-3xl font-bold" style={{ color: '...' }}>
    {occupation}%
  </div>
)}
```

**Changements** :
1. Retrait de la ligne `{nbSessions}s • {nbEvenements}e`
2. Augmentation taille pourcentage : `text-2xl` → `text-3xl`
3. Simplification : affichage unique et clair

**Justification** :
- Le détail sessions/événements reste disponible dans le tooltip au survol
- L'utilisateur voulait uniquement le pourcentage visible
- Plus d'espace pour un pourcentage plus lisible

---

## Phase 3 : Refonte Code Couleur

### Problème : Logique Contre-Intuitive

**Ancien système** :
- 🟢 Vert = ≥80% (forte occupation)
- 🟡 Jaune = 50-79%
- 🔵 Bleu = <50%
- ⬜ Gris = 0% (libre)

**Problème identifié par l'utilisateur** :
> "0 pourcent tu affiche libre en vert et la case aussi... au dessus de 80 rouge c'est mieux"

Le vert pour forte occupation n'est pas intuitif. Vert devrait signifier "bon" (libre = opportunité), rouge "alerte" (saturé = problème).

### Nouveau Système : Logique Marketing

**Code couleur révisé** :
- 🟢 **Vert = 0%** → Libre (opportunité marketing maximale)
- 🟡 **Jaune = <50%** → Faible occupation (opportunité marketing)
- 🟠 **Orange = 50-79%** → Occupation moyenne
- 🔴 **Rouge = ≥80%** → Forte occupation (alerte capacité)

### Implémentation

#### Couleurs des cellules

```typescript
style={{
  backgroundColor: occupation === 0 ? 'rgba(34, 197, 94, 0.15)' // Vert pour libre (0%)
    : occupation < 50 ? 'rgba(234, 179, 8, 0.15)' // Jaune pour <50%
    : occupation < 80 ? 'rgba(249, 115, 22, 0.15)' // Orange pour 50-79%
    : 'rgba(239, 68, 68, 0.15)', // Rouge pour ≥80%
  borderColor: occupation === 0 ? 'rgba(34, 197, 94, 0.4)' // Vert
    : occupation < 50 ? 'rgba(234, 179, 8, 0.4)' // Jaune
    : occupation < 80 ? 'rgba(249, 115, 22, 0.4)' // Orange
    : 'rgba(239, 68, 68, 0.4)' // Rouge
}}
```

**Valeurs RGB utilisées** :
- Vert : `rgb(34, 197, 94)` (green-500 Tailwind)
- Jaune : `rgb(234, 179, 8)` (yellow-500)
- Orange : `rgb(249, 115, 22)` (orange-500)
- Rouge : `rgb(239, 68, 68)` (red-500)

#### Couleurs du texte

```typescript
{occupation === 0 ? (
  <div className="text-xs font-medium" style={{ color: 'rgb(34, 197, 94)' }}>
    Libre
  </div>
) : (
  <div className="text-3xl font-bold" style={{
    color: occupation < 50 ? 'rgb(234, 179, 8)' // Jaune
      : occupation < 80 ? 'rgb(249, 115, 22)' // Orange
      : 'rgb(239, 68, 68)' // Rouge
  }}>
    {occupation}%
  </div>
)}
```

#### Légende harmonisée

```typescript
<div className="flex items-center gap-8 justify-center flex-wrap">
  <div className="flex items-center gap-2">
    <div className="w-5 h-5 rounded bg-black"></div>
    <span className="text-sm font-medium">0%</span>
    <span className="text-xs" style={{ color: 'rgb(34, 197, 94)' }}>Libre (vert)</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-5 h-5 rounded bg-black"></div>
    <span className="text-sm font-medium">&lt;50%</span>
    <span className="text-xs" style={{ color: 'rgb(234, 179, 8)' }}>Faible occupation (jaune)</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-5 h-5 rounded bg-black"></div>
    <span className="text-sm font-medium">50-79%</span>
    <span className="text-xs" style={{ color: 'rgb(249, 115, 22)' }}>Occupation moyenne (orange)</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-5 h-5 rounded bg-black"></div>
    <span className="text-sm font-medium">≥80%</span>
    <span className="text-xs" style={{ color: 'rgb(239, 68, 68)' }}>Forte occupation (rouge)</span>
  </div>
</div>
<p className="text-center text-xs text-[rgb(var(--muted-foreground))] mt-3">
  💡 Astuce : Le vert (0%) et le jaune (&lt;50%) sont des opportunités marketing pour promouvoir les formations
</p>
```

**Caractéristiques** :
- 4 carrés noirs uniformes (`bg-black`)
- Texte de couleur correspondant à la case réelle
- Labels explicites avec la couleur entre parenthèses
- Message marketing ajusté (vert + jaune = opportunités)

### Justification du Nouveau Code Couleur

**Vision stratégique marketing** :
- **Vert (0%)** → Salle totalement libre = opportunité maximale pour lancer campagnes
- **Jaune (<50%)** → Faible occupation = possibilité d'ajouter sessions/événements
- **Orange (50-79%)** → Occupation correcte mais amélioration possible
- **Rouge (≥80%)** → Alerte capacité = besoin de planifier autres salles ou recruter formateurs

**Cohérence psychologique** :
- Vert = feu vert, c'est bon, action possible
- Rouge = alerte, attention, capacité limite atteinte

---

## Architecture Finale

### Fichier Modifié

**`C:\crm_abj\src\app\admin\planning\page.tsx`**

#### Section 1 : Calcul des jours occupés (lignes 422-453)

```typescript
const nbEvenements = evenementsCeMois.length
const nbSessions = sessionsCeMois.length
const nbTotal = nbEvenements + nbSessions

// Calculer les jours réellement occupés dans le mois
const joursOccupes = new Set<number>()

// Ajouter les jours des sessions
sessionsCeMois.forEach(session => {
  const sessionDebut = new Date(session.dateDebut)
  const sessionFin = new Date(session.dateFin)

  // Limiter au mois courant
  const dateDebutMois = sessionDebut < debutMois ? debutMois : sessionDebut
  const dateFinMois = sessionFin > finMois ? finMois : sessionFin

  // Ajouter chaque jour de la session
  const currentDate = new Date(dateDebutMois)
  while (currentDate <= dateFinMois) {
    joursOccupes.add(currentDate.getDate())
    currentDate.setDate(currentDate.getDate() + 1)
  }
})

// Ajouter les jours des événements
evenementsCeMois.forEach(evt => {
  const evtDate = new Date(evt.date)
  joursOccupes.add(evtDate.getDate())
})

// Calculer le nombre total de jours dans le mois
const nbJoursDansMois = new Date(anneeSelectionnee, moisIdx + 1, 0).getDate()

// Calculer le pourcentage réel d'occupation
const occupation = joursOccupes.size > 0
  ? Math.round((joursOccupes.size / nbJoursDansMois) * 100)
  : 0
```

#### Section 2 : Style des cellules (lignes 467-477)

```typescript
style={{
  backgroundColor: occupation === 0 ? 'rgba(34, 197, 94, 0.15)'
    : occupation < 50 ? 'rgba(234, 179, 8, 0.15)'
    : occupation < 80 ? 'rgba(249, 115, 22, 0.15)'
    : 'rgba(239, 68, 68, 0.15)',
  borderColor: occupation === 0 ? 'rgba(34, 197, 94, 0.4)'
    : occupation < 50 ? 'rgba(234, 179, 8, 0.4)'
    : occupation < 80 ? 'rgba(249, 115, 22, 0.4)'
    : 'rgba(239, 68, 68, 0.4)'
}}
```

#### Section 3 : Affichage simplifié (lignes 487-500)

```typescript
{occupation === 0 ? (
  <div className="text-xs font-medium" style={{ color: 'rgb(34, 197, 94)' }}>
    Libre
  </div>
) : (
  <div className="text-3xl font-bold" style={{
    color: occupation < 50 ? 'rgb(234, 179, 8)'
      : occupation < 80 ? 'rgb(249, 115, 22)'
      : 'rgb(239, 68, 68)'
  }}>
    {occupation}%
  </div>
)}
```

#### Section 4 : Légende harmonisée (lignes 550-577)

```typescript
<div className="mt-6 p-4 bg-[rgba(var(--secondary),0.3)] rounded-lg border">
  <div className="flex items-center gap-8 justify-center flex-wrap">
    {/* 4 carrés noirs avec textes colorés */}
  </div>
  <p className="text-center text-xs mt-3">
    💡 Astuce : Le vert (0%) et le jaune (&lt;50%) sont des opportunités marketing
  </p>
</div>
```

---

## Problèmes Résolus

### 1. Calcul d'Occupation Incorrect

**Problème** : Pourcentage basé sur nombre d'activités, pas sur jours occupés
**Symptômes** :
- Février avec 1 événement → 25% (devrait être ~4%)
- Avril avec session complète → 25% (devrait être 100%)

**Solution** :
- Utilisation d'un `Set<number>` pour compter les jours uniques
- Prise en compte des chevauchements de sessions
- Calcul du nombre de jours du mois (28-31)
- Formule : `(jours occupés / jours totaux) * 100`

**Résultat** : ✅ Pourcentages maintenant réalistes et cohérents

---

### 2. Affichage Surchargé

**Problème** : Ligne de détail "2s • 1e" encombrante et redondante
**Symptômes** :
- Information déjà dans le tooltip
- Espace gaspillé dans la cellule
- Lecture moins immédiate du pourcentage

**Solution** :
- Retrait complet de la ligne de détail
- Augmentation de la taille du pourcentage (text-3xl)
- Conservation du détail dans le tooltip au survol

**Résultat** : ✅ Affichage épuré, lecture instantanée du pourcentage

---

### 3. Code Couleur Contre-Intuitif

**Problème** : Vert pour forte occupation, gris pour libre
**Symptômes** :
- Confusion psychologique (vert = bon ≠ saturé)
- Opportunités marketing non visibles (gris neutre)
- Pas d'alerte visuelle pour salles saturées

**Solution** :
- Inversion logique : vert = libre, rouge = saturé
- 4 niveaux progressifs : vert → jaune → orange → rouge
- Légende avec carrés noirs et textes colorés
- Message marketing adapté

**Résultat** : ✅ Code couleur intuitif aligné avec stratégie marketing

---

## État Final et Métriques

### ✅ Fonctionnalités Complètes

1. **Calcul d'occupation précis** : Basé sur jours réels (28-31 selon mois)
2. **Affichage simplifié** : Pourcentage unique en 3xl, pas de détail superflu
3. **Code couleur stratégique** : Vert = opportunité, rouge = alerte
4. **Légende harmonisée** : 4 carrés noirs avec textes colorés

### 📊 Exemples Concrets

**Atelier A en 2026** :

| Mois | Sessions/Événements | Jours occupés | Pourcentage | Couleur |
|------|---------------------|---------------|-------------|---------|
| Janvier | Session CAP 15-31 | 17/31 | 55% | 🟠 Orange |
| Février | Événement Portes Ouvertes (15) | 1/28 | 4% | 🟢 Vert |
| Mars | Session CAP 1-31 | 31/31 | 100% | 🔴 Rouge |
| Avril | Session CAP 1-30 | 30/30 | 100% | 🔴 Rouge |
| Mai | Session CAP 1-15 | 15/31 | 48% | 🟡 Jaune |
| Juin | Session Joaillerie 1-30 | 30/30 | 100% | 🔴 Rouge |
| Juillet | Session Joaillerie 1-15 | 15/31 | 48% | 🟡 Jaune |

### 🎨 Impact Visuel

**Avant** :
- Cellules bleu/jaune/vert difficiles à interpréter
- "25%" partout, pas de différenciation
- Légende avec carrés colorés mais textes gris

**Après** :
- Dégradé vert → rouge immédiatement compréhensible
- Pourcentages réalistes (4%, 48%, 55%, 100%)
- Légende sobre (carrés noirs) avec textes colorés explicites

---

## Prochaines Étapes Suggérées

### Phase Immédiate

1. **Tester avec données réelles**
   - Connecter au backend (remplacer MOCK_SESSIONS)
   - Vérifier calculs sur sessions réelles multi-mois
   - Valider performance avec grand nombre de sessions

2. **Appliquer le même système aux formateurs**
   - Vue formateurs actuellement avec indicateurs différents
   - Harmoniser avec vert/orange/rouge si pertinent

### Phase Optimisation

3. **Cache des calculs**
   - Calculer les jours occupés une fois par mois
   - Stocker en mémoire pour éviter recalculs répétés

4. **Export planning**
   - Génération PDF avec les timelines colorées
   - Rapport mensuel d'occupation des salles

5. **Alertes automatiques**
   - Notification si salle >80% plusieurs mois consécutifs
   - Suggestion d'ouverture nouvelles salles/sessions

---

## Fichiers Modifiés

### Modifiés
1. **`src/app/admin/planning/page.tsx`**
   - Lignes 422-453 : Nouveau calcul jours occupés avec Set
   - Lignes 467-477 : Nouveau code couleur vert/jaune/orange/rouge
   - Lignes 487-500 : Affichage simplifié (retrait ligne détail)
   - Lignes 550-577 : Légende harmonisée avec carrés noirs

### Aucun Fichier Créé
Cette session était purement une optimisation de code existant.

---

## Points Clés à Retenir

### 1. Calcul Basé sur Jours Réels
- Utilisation d'un `Set<number>` pour éviter doublons
- Prise en compte des limites du mois (début/fin)
- Calcul dynamique du nombre de jours (28-31)

### 2. Affichage Épuré
- Une seule information par cellule : le pourcentage
- Détails conservés dans tooltip (pas perdus)
- Taille augmentée pour meilleure lisibilité

### 3. Code Couleur Stratégique
- Vert = opportunité (libre, faible occupation)
- Rouge = alerte (forte occupation)
- Cohérence psychologique et marketing

### 4. Légende Claire
- Carrés noirs uniformes (pas de confusion)
- Textes colorés explicites
- Message marketing intégré

---

**Dernière mise à jour** : 14 février 2026
**Version** : 1.0
**Auteur** : Claude Code
