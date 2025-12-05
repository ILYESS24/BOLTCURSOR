# 🔑 CONFIGURATION DE LA CLÉ API OPENROUTER

## ❌ Erreur Actuelle

**Erreur 401: "User not found"** signifie que la clé API OpenRouter n'est pas valide ou n'est pas configurée.

## ✅ Solution : Configurer la clé API dans Cloudflare Pages

### Étape 1 : Obtenir une clé API OpenRouter

1. Allez sur https://openrouter.ai/
2. Créez un compte ou connectez-vous
3. Allez dans **Settings** → **Keys**
4. Cliquez sur **Create Key**
5. Copiez votre clé API (commence par `sk-or-v1-...`)

### Étape 2 : Configurer dans Cloudflare Pages

1. Allez sur https://dash.cloudflare.com/
2. Sélectionnez votre projet **ai-assistant**
3. Allez dans **Settings** → **Environment Variables**
4. Cliquez sur **Add variable**
5. Ajoutez :
   - **Variable name:** `OPENROUTER_API_KEY`
   - **Value:** Votre clé API OpenRouter (ex: `sk-or-v1-...`)
6. Cliquez sur **Save**
7. **Redéployez** votre application pour que les changements prennent effet

### Étape 3 : Vérifier la configuration

Après le redéploiement, testez à nouveau. L'erreur 401 devrait disparaître.

## 🔒 Sécurité

⚠️ **Important:** Ne partagez jamais votre clé API publiquement. Elle est stockée de manière sécurisée dans Cloudflare Pages et n'est accessible que par votre application.

## 📝 Note

La clé API hardcodée dans le code (`ai-service.ts`) n'est qu'un fallback. Pour la production, utilisez toujours les variables d'environnement Cloudflare.

