# 🔑 Configuration de DeepSeek V3

## Clé API DeepSeek
Votre clé API DeepSeek : `sk-35c85a1a1f4041df8ac8d4eb4f58202f`

## Méthode 1 : Via Cloudflare Dashboard (Recommandé)

1. Allez sur [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Sélectionnez votre projet Pages : **ai-assistant**
3. Allez dans **Settings** → **Environment Variables**
4. Cliquez sur **Add variable**
5. Ajoutez :
   - **Variable name** : `DEEPSEEK_API_KEY`
   - **Value** : `sk-35c85a1a1f4041df8ac8d4eb4f58202f`
   - **Environment** : Production (et Preview si vous voulez)
6. Cliquez sur **Save**

## Méthode 2 : Via Wrangler CLI

Exécutez cette commande dans votre terminal :

```bash
npx wrangler pages secret put DEEPSEEK_API_KEY
```

Quand on vous demande la valeur, entrez : `sk-35c85a1a1f4041df8ac8d4eb4f58202f`

## Vérification

Une fois la clé configurée, vous pouvez vérifier que DeepSeek fonctionne en testant l'endpoint :

```bash
curl -X POST https://f49a0619.ai-assistant-xlv.pages.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Bonjour, peux-tu me dire bonjour ?",
    "model": "deepseek-chat"
  }'
```

Ou visitez : `https://f49a0619.ai-assistant-xlv.pages.dev/api/chat` (GET) pour voir les modèles disponibles.

## Modèles DeepSeek disponibles

- **deepseek-chat** : DeepSeek V3 (64k tokens) - Recommandé pour la génération de sites
- **deepseek-coder** : DeepSeek Coder (16k tokens) - Spécialisé pour le code

