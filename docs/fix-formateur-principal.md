# Correction : Calcul du Formateur Principal

**Date** : 16 février 2026
**Problème identifié** : Le formateur principal était défini comme le premier formateur de la liste au lieu du formateur qui enseigne le plus d'heures

---

## Problème

### Code Original (INCORRECT)

```typescript
// Ligne 229 de /api/sessions/validate/route.ts
formateurPrincipalId: data.formateurs.length > 0 ? data.formateurs[0].id : null,
```

**Logique erronée** : Utilisait simplement le premier formateur de la liste (`data.formateurs[0]`), indépendamment du nombre d'heures qu'il enseigne.

**Exemple problématique** :
- Session CAP avec 2 formateurs :
  - Formateur A : Enseigne 2 matières (350h au total)
  - Formateur B : Enseigne 1 matière (170h au total)
- Résultat incorrect : Si Formateur B était listé en premier, il devenait formateur principal malgré moins d'heures

---

## Solution Implémentée

### Nouveau Code (CORRECT)

```typescript
// Calculer le formateur principal (celui qui enseigne le plus d'heures)
let formateurPrincipalId = null
if (data.formateurs.length > 0 && data.programme.length > 0) {
  // Map pour compter les heures par formateur
  const heuresParFormateur = new Map<number, number>()

  // Initialiser avec 0 heures pour chaque formateur
  data.formateurs.forEach(f => heuresParFormateur.set(f.id, 0))

  // Calculer les heures pour chaque formateur
  data.programme.forEach(matiere => {
    // Trouver les formateurs qui enseignent cette matière
    data.formateurs.forEach(formateur => {
      if (formateur.matieres.includes(matiere.nom)) {
        const heuresActuelles = heuresParFormateur.get(formateur.id) || 0
        heuresParFormateur.set(formateur.id, heuresActuelles + matiere.heures)
      }
    })
  })

  // Trouver le formateur avec le plus d'heures
  let maxHeures = 0
  heuresParFormateur.forEach((heures, formateurId) => {
    if (heures > maxHeures) {
      maxHeures = heures
      formateurPrincipalId = formateurId
    }
  })
}

const session = await prisma.session.create({
  data: {
    // ... autres champs
    formateurPrincipalId: formateurPrincipalId, // Formateur qui enseigne le plus d'heures
  },
})
```

### Algorithme

1. **Initialisation** : Créer une Map pour compter les heures de chaque formateur
2. **Parcours du programme** : Pour chaque matière du programme :
   - Vérifier quels formateurs enseignent cette matière
   - Ajouter les heures de la matière au compteur du formateur
3. **Sélection du principal** : Parcourir la Map et sélectionner le formateur avec le maximum d'heures
4. **Attribution** : Définir ce formateur comme `formateurPrincipalId`

---

## Validation

### Test avec données réelles

**Script de test** : `scripts/test-carte-provisoire-complete.ts`

**Données de test** :
- **Formateur 1** (ID 2 - Nicolas Dubois) : Enseigne Sertissage (200h) + Polissage (150h) = **350h**
- **Formateur 2** (ID 3 - Sophie Martin) : Enseigne Joaillerie création (170h) = **170h**

**Résultat attendu** : Formateur principal = Nicolas Dubois (ID 2) car 350h > 170h

### Vérification en base de données

**Script** : `scripts/check-formateur-principal.ts`

```
📋 Session: CAP Bijouterie - Promotion Mars 2026
   ID Session: 18

👨‍🏫 Formateur principal:
   ID: 2
   Nom: Philippe Dubois

📊 Analyse des heures par formateur:
   👑 Nicolas Dubois: 350h
      Matières: Sertissage, Polissage
      Sophie Martin: 170h
      Matières: Joaillerie création

✅ Formateur avec le plus d'heures: ID 2 (350h)
✅ Le formateur principal est correctement calculé !
```

**Résultat** : ✅ Le formateur avec le plus d'heures (350h) est bien défini comme formateur principal

---

## Impact

### Formations CAP
- ✅ Le formateur principal est maintenant correctement identifié
- ✅ Calcul basé sur les heures réelles d'enseignement
- ✅ Cohérent avec la logique métier (le formateur le plus impliqué)

### Formations COURTE
- ℹ️ Pas d'impact : Les formations courtes n'ont généralement qu'un seul formateur
- ℹ️ Le code existant pour COURTE (ligne 89) reste inchangé car il n'y a pas de programme multi-matières

---

## Fichiers Modifiés

1. **`src/app/api/sessions/validate/route.ts`** (lignes 218-231)
   - Ajout du calcul du formateur principal basé sur les heures
   - Remplacement de `data.formateurs[0].id` par la logique de calcul

---

## Scripts Créés

1. **`scripts/check-formateur-principal.ts`**
   - Vérifie que le formateur principal est correctement calculé
   - Affiche l'analyse des heures par formateur
   - Compare le résultat attendu avec le résultat obtenu

---

## Prochaines Étapes

Maintenant que le formateur principal est correctement calculé lors de la création de la session, il faut :

1. ✅ **Terminé** : Le calcul du formateur principal fonctionne
2. 🔜 **À faire** : Mettre à jour l'API `/api/sessions` (GET) pour retourner les sessions avec le formateur principal
3. 🔜 **À faire** : Mettre à jour `src/app/admin/sessions/page.tsx` pour utiliser les vraies données de l'API au lieu de MOCK_SESSIONS
4. 🔜 **À faire** : Afficher correctement le formateur principal dans les tuiles de sessions

---

**Auteur** : Claude Code
**Version** : 1.0
