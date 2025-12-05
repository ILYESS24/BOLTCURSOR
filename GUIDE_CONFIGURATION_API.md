# 🔑 GUIDE COMPLET : Configuration de la Clé API OpenRouter

## 📋 Étape par Étape

### ÉTAPE 1 : Obtenir votre clé API OpenRouter

1. **Allez sur OpenRouter**
   - Ouvrez https://openrouter.ai/ dans votre navigateur
   - Cliquez sur **Sign In** ou **Sign Up** si vous n'avez pas de compte

2. **Créer/Accéder à votre compte**
   - Si nouveau compte : Créez un compte avec votre email
   - Si compte existant : Connectez-vous

3. **Accéder aux clés API**
   - Une fois connecté, allez sur : https://openrouter.ai/keys
   - Ou cliquez sur votre profil → **Keys**

4. **Créer une nouvelle clé**
   - Cliquez sur **Create Key** ou **+ New Key**
   - Donnez un nom à votre clé (ex: "AURION Production")
   - Copiez la clé immédiatement (elle commence par `sk-or-v1-...`)
   - ⚠️ **Important** : Vous ne pourrez plus voir la clé complète après, alors copiez-la maintenant !

### ÉTAPE 2 : Configurer dans Cloudflare Pages

1. **Accéder à Cloudflare Dashboard**
   - Allez sur https://dash.cloudflare.com/
   - Connectez-vous à votre compte Cloudflare

2. **Trouver votre projet**
   - Dans le menu de gauche, cliquez sur **Workers & Pages**
   - Cliquez sur **ai-assistant** (votre projet)

3. **Accéder aux variables d'environnement**
   - Cliquez sur l'onglet **Settings**
   - Faites défiler jusqu'à **Environment Variables**
   - Cliquez sur **Add variable**

4. **Ajouter la variable**
   - **Variable name:** `OPENROUTER_API_KEY`
   - **Value:** Collez votre clé API OpenRouter (ex: `sk-or-v1-...`)
   - **Environment:** Sélectionnez **Production** (ou **All environments**)
   - Cliquez sur **Save**

5. **Redéployer l'application**
   - Allez dans l'onglet **Deployments**
   - Cliquez sur les **3 points** (⋯) du dernier déploiement
   - Cliquez sur **Retry deployment** ou créez un nouveau déploiement

### ÉTAPE 3 : Vérifier que ça fonctionne

1. Attendez que le déploiement soit terminé (1-2 minutes)
2. Allez sur votre site : https://main.ai-assistant-xlv.pages.dev
3. Essayez d'envoyer un message
4. Si l'erreur 401 disparaît, c'est bon ! ✅

## 🔍 Vérification Alternative

Si vous voulez tester votre clé API avant de la configurer dans Cloudflare, vous pouvez utiliser ce script :

```bash
# Testez votre clé API avec curl
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer VOTRE_CLE_API_ICI"
```

Si vous obtenez une liste de modèles, votre clé est valide ! ✅

## ❓ Problèmes Courants

### "La clé n'est toujours pas reconnue"
- Vérifiez que vous avez bien redéployé après avoir ajouté la variable
- Vérifiez que le nom de la variable est exactement `OPENROUTER_API_KEY` (sensible à la casse)
- Vérifiez que vous avez sélectionné le bon environnement (Production)

### "Je n'ai pas de compte Cloudflare"
- Créez un compte gratuit sur https://dash.cloudflare.com/
- C'est gratuit et prend 2 minutes

### "Je ne trouve pas où ajouter la variable"
- Dans Cloudflare Pages → Votre projet → Settings → Environment Variables
- Si vous ne voyez pas cette section, vérifiez que vous êtes bien sur un projet Cloudflare Pages

## 💡 Astuce

Vous pouvez aussi mettre la clé API directement dans le code temporairement pour tester (mais ne le faites pas en production !) :

Dans `app/lib/ai-service.ts` ligne 55, remplacez la clé hardcodée par votre clé.

