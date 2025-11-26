# 🔑 Configuration de la clé API DeepSeek V3

## Votre clé API
```
sk-35c85a1a1f4041df8ac8d4eb4f58202f
```

## 📋 Instructions étape par étape

### Option 1 : Via Cloudflare Dashboard (Recommandé)

1. **Connectez-vous à Cloudflare Dashboard**
   - Allez sur : https://dash.cloudflare.com/
   - Connectez-vous avec votre compte

2. **Accédez à votre projet Pages**
   - Dans le menu de gauche, cliquez sur **Workers & Pages**
   - Cliquez sur votre projet **ai-assistant**

3. **Ajoutez la variable d'environnement**
   - Cliquez sur l'onglet **Settings**
   - Faites défiler jusqu'à **Environment Variables**
   - Cliquez sur **Add variable**

4. **Configurez la variable**
   - **Variable name** : `DEEPSEEK_API_KEY`
   - **Value** : `sk-35c85a1a1f4041df8ac8d4eb4f58202f`
   - Cochez **Production** (et **Preview** si vous voulez)
   - Cliquez sur **Save**

5. **Redéployez votre application** (optionnel mais recommandé)
   - Les variables d'environnement sont prises en compte automatiquement
   - Si besoin, redéployez avec : `npx wrangler pages deploy build/client`

### Option 2 : Via Wrangler CLI (Alternative)

Si vous préférez utiliser la ligne de commande :

```bash
npx wrangler pages secret put DEEPSEEK_API_KEY
```

Quand on vous demande la valeur, collez : `sk-35c85a1a1f4041df8ac8d4eb4f58202f`

## ✅ Vérification

Une fois configuré, testez que DeepSeek fonctionne :

1. **Vérifier les modèles disponibles** :
   ```
   GET https://f49a0619.ai-assistant-xlv.pages.dev/api/chat
   ```
   Vous devriez voir `deepseek-chat` et `deepseek-coder` dans la liste.

2. **Tester une requête** :
   ```bash
   curl -X POST https://f49a0619.ai-assistant-xlv.pages.dev/api/chat \
     -H "Content-Type: application/json" \
     -d '{
       "message": "Bonjour, peux-tu me dire bonjour ?",
       "model": "deepseek-chat"
     }'
   ```

## 🎯 Modèles DeepSeek disponibles

- **`deepseek-chat`** : DeepSeek V3 (64k tokens)
  - Excellent pour la génération de sites web
  - Recommandé pour la plupart des tâches

- **`deepseek-coder`** : DeepSeek Coder (16k tokens)
  - Spécialisé pour la génération et l'analyse de code

## 🔒 Sécurité

⚠️ **Important** : Ne partagez jamais votre clé API publiquement. Elle est maintenant stockée de manière sécurisée dans Cloudflare Dashboard.

## 📝 Note

La clé API a été ajoutée dans `wrangler.toml` (commentée) pour référence, mais elle doit être configurée dans Cloudflare Dashboard pour fonctionner en production.

