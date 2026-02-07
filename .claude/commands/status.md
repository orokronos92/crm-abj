Fais un diagnostic complet du projet :

1. `git status` — fichiers modifiés/non commités
2. `git log --oneline -10` — derniers commits
3. `npm run build` — est-ce que ça compile ?
4. `npm run lint` — erreurs de lint ?
5. Compte le nombre de fichiers dans chaque dossier clé :
   - `src/app/` (pages)
   - `src/components/` (composants)
   - `src/lib/` (utilitaires)
   - `src/hooks/` (hooks)
   - `src/types/` (types)
6. Vérifie si `prisma/schema.prisma` existe et est valide

Résumé final format :
```
## État du projet CRM ABJ

### Git
- Branche : ...
- Dernier commit : ...
- Fichiers non commités : X

### Build
- Statut : ✅/❌
- Erreurs : ...

### Structure
- Pages : X
- Composants : X
- Types : X

### Base de données
- Schéma Prisma : ✅/❌
- Tables définies : X
```
