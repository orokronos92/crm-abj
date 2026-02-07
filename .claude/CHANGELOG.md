# CRM ABJ - Historique des Modifications

## 2026-02-06

### Correction de la page Élève Formation
- **Fichier**: `src/app/eleve/formation/page.tsx`
- **Problème**: Erreur de syntaxe - `eval` utilisé comme nom de variable
- **Solution**: Renommé `eval` en `evaluation` car `eval` est un mot réservé en JavaScript
- **Import manquant**: Ajouté `MessageSquare` aux imports de lucide-react

### Déplacement du SplashScreen (Pattern Standard)
- **Motivation**: Le splash screen s'affichait APRÈS l'authentification, ce qui n'est pas le pattern standard
- **Pattern adopté**: Affichage du splash au niveau racine, AVANT l'authentification (comme la majorité des applications modernes)

#### Fichiers modifiés:
1. **Nouveau**: `src/components/providers/client-layout.tsx`
   - Composant ClientLayout qui gère le SplashScreen au niveau racine
   - Utilise `sessionStorage` pour afficher le splash une seule fois par session
   - Transition fluide avec opacity

2. **Modifié**: `src/app/layout.tsx`
   - Import et intégration de ClientLayout
   - ClientLayout enveloppe maintenant tout le contenu de l'application

3. **Modifié**: `src/components/layout/dashboard-layout.tsx`
   - Suppression de l'import SplashScreen
   - Suppression du state `showSplash` et du useEffect associé
   - Suppression du rendu conditionnel du SplashScreen
   - Nettoyage de l'import useEffect (plus utilisé)

#### Avantages du nouveau pattern:
- ✅ Expérience utilisateur plus fluide et professionnelle
- ✅ Le splash "accueille" l'utilisateur dès l'arrivée sur le site
- ✅ Conforme aux standards UX (Instagram, apps bancaires, etc.)
- ✅ Cache le temps de chargement initial de l'application
- ✅ Plus logique sémantiquement
