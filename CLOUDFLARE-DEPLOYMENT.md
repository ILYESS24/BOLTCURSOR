# 🚀 Guide de Déploiement Cloudflare Pages

Ce guide explique comment déployer le projet AI Assistant sur Cloudflare Pages.

## 📋 Prérequis

- Node.js 18+ avec pnpm ou npm
- Compte Cloudflare
- Wrangler CLI (installé automatiquement)

## 🚀 Déploiement Rapide

### Option 1: Script Automatique (Recommandé)

#### Windows PowerShell:
```powershell
.\deploy.ps1
```

#### Linux/macOS:
```bash
./deploy.sh
```

#### Via npm/pnpm:
```bash
pnpm deploy:auto
```

### Option 2: Commandes Manuelles

```bash
# 1. Installer les dépendances
pnpm install

# 2. Build du projet
pnpm build

# 3. Déploiement sur Cloudflare Pages
npx wrangler pages deploy build/client
```

## 🔧 Configuration

### Fichier wrangler.toml
```toml
name = "bolt"
compatibility_flags = ["nodejs_compat"]
compatibility_date = "2024-07-01"
pages_build_output_dir = "./build/client"
```

### Variables d'Environnement

Pour configurer les variables d'environnement sur Cloudflare Pages :

1. Allez sur le dashboard Cloudflare Pages
2. Sélectionnez votre projet
3. Allez dans "Settings" > "Environment variables"
4. Ajoutez les variables nécessaires :

```
ANTHROPIC_API_KEY=your_api_key_here
NODE_ENV=production
```

## 📊 Vérification du Déploiement

### Vérifier le statut des projets :
```bash
npx wrangler pages project list
```

### Vérifier les déploiements :
```bash
npx wrangler pages deployment list --project-name=bolt
```

### Logs en temps réel :
```bash
npx wrangler pages deployment tail --project-name=bolt
```

## 🌐 URLs de Déploiement

Votre application est maintenant accessible à :
- **URL principale** : `https://bolt-dhm.pages.dev`
- **URL de déploiement** : `https://3564e79e.bolt-dhm.pages.dev`

## 🔄 Déploiement Automatique

### GitHub Actions

Le projet inclut un workflow GitHub Actions (`.github/workflows/ci.yml`) qui :
- Exécute les tests et le linting
- Build automatiquement
- Déploie sur Cloudflare Pages (branche main uniquement)

### Configuration des Secrets GitHub

Pour activer le déploiement automatique, configurez ces secrets dans GitHub :

1. `CLOUDFLARE_API_TOKEN` - Token API Cloudflare
2. `CLOUDFLARE_ACCOUNT_ID` - ID du compte Cloudflare

### Obtenir les Credentials Cloudflare

1. **API Token** :
   - Allez sur [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
   - Créez un token avec permissions "Cloudflare Pages:Edit"

2. **Account ID** :
   - Trouvez votre Account ID dans le dashboard Cloudflare
   - Ou utilisez : `npx wrangler whoami`

## 🛠️ Commandes Utiles

### Déploiement
```bash
# Déploiement simple
pnpm deploy

# Déploiement avec script automatique
pnpm deploy:auto

# Déploiement manuel
npx wrangler pages deploy build/client
```

### Gestion des Projets
```bash
# Lister les projets
npx wrangler pages project list

# Créer un nouveau projet
npx wrangler pages project create bolt-new

# Supprimer un projet
npx wrangler pages project delete bolt
```

### Monitoring
```bash
# Voir les logs
npx wrangler pages deployment tail --project-name=bolt

# Voir les métriques
npx wrangler pages deployment get --project-name=bolt
```

## 🔍 Dépannage

### Problèmes Courants

1. **"Build failed"**
   - Vérifiez que tous les tests passent : `pnpm test`
   - Vérifiez le linting : `pnpm lint`
   - Vérifiez les types : `pnpm typecheck`

2. **"Deployment failed"**
   - Vérifiez que le build s'est bien terminé
   - Vérifiez les permissions du token API
   - Vérifiez que le dossier `build/client` existe

3. **"Environment variables not found"**
   - Configurez les variables dans le dashboard Cloudflare Pages
   - Vérifiez les noms des variables

### Logs de Debug

```bash
# Activer les logs détaillés
npx wrangler pages deploy build/client --verbose

# Voir les logs en temps réel
npx wrangler pages deployment tail --project-name=bolt --format=pretty
```

## 📈 Optimisations

### Performance
- Le projet utilise Vite pour un build optimisé
- Code splitting automatique
- Compression gzip activée
- CDN Cloudflare global

### Sécurité
- Audit de sécurité automatique
- Variables d'environnement sécurisées
- HTTPS forcé
- Headers de sécurité configurés

## 🎯 Résultat Final

✅ **Déploiement réussi !**

- 🌍 **URL** : https://bolt-dhm.pages.dev
- 🚀 **Performance** : Optimisé avec Vite + Cloudflare CDN
- 🔒 **Sécurité** : HTTPS + audit automatique
- 🔄 **CI/CD** : Déploiement automatique configuré
- 📊 **Monitoring** : Logs et métriques disponibles

Votre application AI Assistant est maintenant **live et opérationnelle** sur Cloudflare Pages ! 🎉
