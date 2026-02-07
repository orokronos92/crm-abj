Quelque chose est cassé dans le projet. Procédure de réparation :

1. Lance `npm run build` et montre-moi les erreurs exactes
2. Lance `npm run lint` et montre-moi les warnings/erreurs
3. Vérifie `git status` pour voir les fichiers modifiés récemment
4. Vérifie `git diff` pour voir les changements récents
5. Identifie la cause racine de chaque erreur
6. Corrige les erreurs UNE PAR UNE en commençant par la plus simple
7. Après chaque correction, relance `npm run build` pour vérifier
8. Quand tout passe, fais un commit : `fix: correction [description]`

RÈGLES :
- Ne modifie PAS les fichiers de config (next.config, tsconfig, etc.)
- Ne supprime PAS de code fonctionnel pour "résoudre" une erreur
- Si tu ne peux pas corriger sans casser autre chose, ARRÊTE et explique
