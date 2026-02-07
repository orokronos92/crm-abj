# 🎮 MODE DÉMO ACTIVÉ

## Connexion sans base de données

L'application fonctionne maintenant en **mode démo** car Docker n'est pas lancé.

### 🔑 Identifiants de connexion MODE DÉMO

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | admin@abj.fr | **demo** |
| **Formateur** | formateur@abj.fr | **demo** |
| **Élève** | eleve@abj.fr | **demo** |

### 🚀 Pour lancer l'application

```bash
npm run dev
```

Puis aller sur http://localhost:3000

### ⚠️ Limitations du mode démo

- ❌ Pas de persistance des données
- ❌ Les API de données (prospects, candidats) ne fonctionnent pas
- ✅ L'authentification fonctionne
- ✅ Les interfaces sont visibles
- ✅ La navigation entre pages fonctionne

### 🔧 Pour activer le mode complet avec BDD

1. **Lancer Docker Desktop**
2. **Exécuter le script** : `start-db.bat`
3. **Modifier** `src/app/api/auth/[...nextauth]/route.ts` :
   - Remplacer `auth.config.demo` par `auth.config`
4. **Redémarrer** l'application

### 📝 Notes

Ce mode démo est parfait pour :
- Voir l'interface utilisateur
- Tester la navigation
- Comprendre la structure de l'application

Mais pour les fonctionnalités complètes (création de prospects, gestion des candidatures, etc.), il faut une base de données.