# 🔑 CONFIGURATION DES CLÉS API

## 📋 **ÉTAPES POUR CONFIGURER LES CLÉS API**

### **1. Accéder au Dashboard Cloudflare**
1. Connectez-vous à [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Sélectionnez votre projet `ai-assistant-xlv`
3. Allez dans **Pages** > **Settings** > **Environment Variables**

### **2. Ajouter les Variables d'Environnement**

#### **Variables à ajouter :**

```bash
# OpenAI API Key
OPENAI_API_KEY = votre_clé_api_openai_ici

# Anthropic API Key
ANTHROPIC_API_KEY = votre_clé_api_anthropic_ici

# DeepSeek API Key
DEEPSEEK_API_KEY = votre_clé_api_deepseek_ici

# Configuration de l'application
NODE_ENV = production
DEFAULT_MODEL = gpt-4
FALLBACK_MODEL = claude-3-sonnet
```

### **3. Redéployer l'Application**

```bash
npm run deploy
```

### **4. Vérifier la Configuration**

Testez l'endpoint de configuration :
```bash
curl https://134db3e9.ai-assistant-xlv.pages.dev/api/chat
```

## 🧪 **TEST DES CLÉS API**

### **Test OpenAI**
```bash
curl -X POST https://134db3e9.ai-assistant-xlv.pages.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Bonjour, comment allez-vous ?",
    "model": "gpt-4"
  }'
```

### **Test Anthropic**
```bash
curl -X POST https://134db3e9.ai-assistant-xlv.pages.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Bonjour, comment allez-vous ?",
    "model": "claude-3-sonnet"
  }'
```

## 🔒 **SÉCURITÉ**

### **Bonnes Pratiques**
- ✅ Les clés API sont stockées de manière sécurisée dans Cloudflare
- ✅ Pas d'exposition des clés dans le code source
- ✅ Rotation régulière des clés recommandée
- ✅ Monitoring des utilisations et coûts

### **Monitoring**
- Surveillez l'utilisation via les logs Cloudflare
- Configurez des alertes pour les coûts élevés
- Surveillez les erreurs d'API

## 📊 **MODÈLES DISPONIBLES**

### **OpenAI**
- `gpt-4` - Modèle le plus avancé
- `gpt-4-turbo` - Version optimisée
- `gpt-3.5-turbo` - Rapide et économique

### **Anthropic**
- `claude-3-opus` - Le plus puissant
- `claude-3-sonnet` - Équilibre performance/coût
- `claude-3-haiku` - Rapide et économique

## 🚀 **DÉPLOIEMENT**

Une fois les clés configurées, redéployez :

```bash
npm run build
npm run deploy
```

L'application sera alors pleinement fonctionnelle avec l'IA ! 🎉
