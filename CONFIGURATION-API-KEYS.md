# 🔑 **CONFIGURATION DES CLÉS API - GUIDE COMPLET**

## 🚨 **IMPORTANT : Les clés API doivent être configurées dans Cloudflare Dashboard**

Votre application est déployée mais les clés API ne sont pas encore configurées. Suivez ce guide pour les activer.

---

## 📋 **ÉTAPES DE CONFIGURATION**

### **1. Accéder au Dashboard Cloudflare**
1. Allez sur [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. Connectez-vous avec votre compte Cloudflare
3. Sélectionnez votre projet `ai-assistant-xlv`

### **2. Configurer les Variables d'Environnement**
1. Dans le menu de gauche, cliquez sur **Pages**
2. Sélectionnez votre projet `ai-assistant-xlv`
3. Allez dans **Settings** > **Environment Variables**
4. Cliquez sur **Add variable**

### **3. Ajouter les Variables**

#### **Variable 1 : OpenAI API Key**
- **Name** : `OPENAI_API_KEY`
- **Value** : `votre_clé_api_openai_ici`
- **Environment** : Production

#### **Variable 2 : Anthropic API Key**
- **Name** : `ANTHROPIC_API_KEY`
- **Value** : `votre_clé_api_anthropic_ici`
- **Environment** : Production

#### **Variable 3 : Configuration de l'application**
- **Name** : `NODE_ENV`
- **Value** : `production`
- **Environment** : Production

#### **Variable 4 : Modèle par défaut**
- **Name** : `DEFAULT_MODEL`
- **Value** : `gpt-4`
- **Environment** : Production

#### **Variable 5 : Modèle de fallback**
- **Name** : `FALLBACK_MODEL`
- **Value** : `claude-3-sonnet`
- **Environment** : Production

### **4. Redéployer l'Application**
Après avoir ajouté toutes les variables, redéployez :

```bash
npm run deploy
```

---

## 🧪 **TEST DE CONFIGURATION**

### **Test 1 : Vérifier la Configuration**
```bash
curl https://907f4278.ai-assistant-xlv.pages.dev/api/chat
```

**Réponse attendue :**
```json
{
  "models": [...],
  "configuration": {
    "openai": true,
    "anthropic": true,
    "configured": true
  }
}
```

### **Test 2 : Test OpenAI**
```bash
curl -X POST https://907f4278.ai-assistant-xlv.pages.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Bonjour, comment allez-vous ?",
    "model": "gpt-4"
  }'
```

### **Test 3 : Test Anthropic**
```bash
curl -X POST https://907f4278.ai-assistant-xlv.pages.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Bonjour, comment allez-vous ?",
    "model": "claude-3-sonnet"
  }'
```

---

## 🔒 **SÉCURITÉ DES CLÉS API**

### **Bonnes Pratiques**
- ✅ **Jamais** exposer les clés dans le code source
- ✅ Utiliser les variables d'environnement Cloudflare
- ✅ Rotation régulière des clés (recommandé)
- ✅ Monitoring de l'utilisation et des coûts

### **Monitoring des Coûts**
- Surveillez l'utilisation via les logs Cloudflare
- Configurez des alertes pour les coûts élevés
- Surveillez les erreurs d'API

---

## 📊 **MODÈLES DISPONIBLES**

### **OpenAI Models**
- `gpt-4` - Modèle le plus avancé (recommandé)
- `gpt-4-turbo` - Version optimisée avec contexte étendu
- `gpt-3.5-turbo` - Rapide et économique

### **Anthropic Models**
- `claude-3-opus` - Le plus puissant
- `claude-3-sonnet` - Équilibre performance/coût (recommandé)
- `claude-3-haiku` - Rapide et économique

---

## 🚀 **APRÈS CONFIGURATION**

Une fois les clés configurées, votre application sera **100% fonctionnelle** avec :

- ✅ **Chat IA** avec OpenAI et Anthropic
- ✅ **Génération de code** intelligente
- ✅ **Analyse de code** avancée
- ✅ **Documentation automatique**
- ✅ **8 systèmes backend** opérationnels
- ✅ **Monitoring** en temps réel
- ✅ **Cache** haute performance
- ✅ **Sécurité** renforcée

---

## 🆘 **DÉPANNAGE**

### **Problème : Erreur 500**
- Vérifiez que les clés API sont correctement configurées
- Vérifiez que les variables d'environnement sont en "Production"
- Redéployez l'application après configuration

### **Problème : Erreur 503**
- Les clés API ne sont pas configurées
- Suivez le guide de configuration ci-dessus

### **Problème : Erreur 400**
- Vérifiez le format de la requête
- Vérifiez que le modèle demandé est disponible

---

## 📞 **SUPPORT**

Si vous rencontrez des problèmes :

1. **Vérifiez la configuration** des variables d'environnement
2. **Redéployez** l'application après configuration
3. **Testez** avec les commandes curl ci-dessus
4. **Consultez** les logs Cloudflare pour plus de détails

---

## 🎉 **RÉSULTAT FINAL**

Une fois configuré, votre application AI Assistant sera :

- 🤖 **Intelligente** avec OpenAI et Anthropic
- 🚀 **Performante** avec 8 systèmes backend
- 🛡️ **Sécurisée** avec monitoring avancé
- 📊 **Monitorée** en temps réel
- 🌐 **Déployée** sur Cloudflare Pages

**URL de production** : `https://907f4278.ai-assistant-xlv.pages.dev`

Votre application sera alors **100% opérationnelle** ! 🎉
