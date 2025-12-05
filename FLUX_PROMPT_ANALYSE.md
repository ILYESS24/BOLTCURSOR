# 🔍 ANALYSE DU FLUX : QUAND VOUS ENVOYEZ UN PROMPT

## 📍 ÉTAPE 1 : PAGE D'ACCUEIL (`_index.tsx`)

**Fichier :** `app/routes/_index.tsx`

**Ce qui se passe :**
1. Vous tapez votre prompt dans le `textarea` (ligne 97-103)
2. Vous cliquez sur le bouton "ArrowUp" ou appuyez sur **Enter** (ligne 52-57)
3. La fonction `handleSubmit()` est appelée (ligne 43-48)

```typescript
const handleSubmit = () => {
  if (prompt.trim()) {
    // Redirige vers /chat avec le message et le modèle sélectionné
    navigate(`/chat?q=${encodeURIComponent(prompt)}&model=${encodeURIComponent(selectedModel)}`);
  }
};
```

**Résultat :** Navigation vers `/chat?q=VOTRE_PROMPT&model=MODEL_ID`

---

## 📍 ÉTAPE 2 : ROUTE CHAT (`chat.tsx`)

**Fichier :** `app/routes/chat.tsx`

### 2.1 Loader (côté serveur)
```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');        // Votre prompt
  const model = url.searchParams.get('model') || DEFAULT_MODEL;  // Modèle sélectionné
  return json({ initialMessage: q || null, initialModel: model });
}
```

### 2.2 Composant Chat (côté client)

**Quand le composant charge :**
1. Il récupère `initialMessage` et `initialModel` depuis le loader (ligne 19)
2. Un `useEffect` détecte le message initial (lignes 48-64) :

```typescript
useEffect(() => {
  if (initialMessage && messages.length === 0) {
    // Active le chat
    chatStore.setKey('started', true);
    chatStore.setKey('showChat', true);
    
    // Ajoute votre message à l'interface
    const userMessage = { role: 'user', content: initialMessage };
    setMessages([userMessage]);
    
    // ENVOIE LA REQUÊTE AU BACKEND
    setIsLoading(true);
    fetcher.submit(
      { message: initialMessage, model: selectedModel },
      { method: 'POST', action: '/api/chat' }  // ← Appel API
    );
  }
}, [initialMessage]);
```

**Résultat :** 
- Votre message apparaît dans l'interface
- Une requête POST est envoyée à `/api/chat` avec votre message et le modèle

---

## 📍 ÉTAPE 3 : API CHAT (`api.chat.ts`)

**Fichier :** `app/routes/api.chat.ts`

### 3.1 Réception de la requête (ligne 12)
```typescript
export async function action({ request, context }: ActionFunctionArgs) {
  const env = context?.cloudflare?.env;  // Variables d'environnement
```

### 3.2 Vérifications (lignes 18-57)
- ✅ Vérifie que les clés API sont configurées
- ✅ Parse le JSON de la requête
- ✅ Extrait `message` et `model` du body
- ✅ Vérifie le cache (si réponse déjà en cache, la retourne)

### 3.3 Préparation des messages (lignes 76-86)
```typescript
const messages = [
  {
    role: 'system',
    content: `Tu es un assistant IA intelligent et utile...`
  },
  {
    role: 'user',
    content: message  // Votre prompt
  }
];
```

### 3.4 Appel au service IA (lignes 91-96)
```typescript
aiResponse = await aiService.chat({
  messages,
  model,              // Le modèle sélectionné (ex: "openrouter/claude-3-5-sonnet")
  temperature: 0.7,
  maxTokens: 4000
}, env);
```

### 3.5 Retour de la réponse (ligne 165)
```typescript
return json({
  response: aiResponse.content,    // La réponse de l'IA
  model: aiResponse.model,
  usage: aiResponse.usage,          // Tokens utilisés
  cost: aiResponse.cost,            // Coût estimé
  timestamp: aiResponse.timestamp,
  requestId,
  cached: false
});
```

---

## 📍 ÉTAPE 4 : SERVICE IA (`ai-service.ts`)

**Fichier :** `app/lib/ai-service.ts`

### 4.1 Méthode `chat()` (ligne 58)
```typescript
public async chat(request: ChatRequest): Promise<ChatResponse> {
  const model = request.model || 'gpt-4';
  const aiModel = getModelById(model);  // Récupère la config du modèle
  
  // Détermine le provider (openrouter dans notre cas)
  if (aiModel.provider === 'openrouter') {
    return await this.chatWithOpenRouter(request, aiModel);
  }
}
```

### 4.2 Appel OpenRouter (`chatWithOpenRouter`) (lignes 384-443)

**Requête HTTP vers OpenRouter :**
```typescript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${this.openrouterApiKey}`,  // Votre clé API
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://bolt.new',
    'X-Title': 'Bolt.new AI Assistant'
  },
  body: JSON.stringify({
    model: model.id,              // Ex: "openrouter/claude-3-5-sonnet"
    messages: request.messages,    // Votre prompt + system message
    temperature: 0.7,
    max_tokens: 4000,
    stream: false
  })
});
```

**Traitement de la réponse :**
```typescript
const data = await response.json();

return {
  content: data.choices[0].message.content,  // La réponse de l'IA
  model: model.id,
  usage: {
    promptTokens: data.usage?.prompt_tokens || 0,
    completionTokens: data.usage?.completion_tokens || 0,
    totalTokens: data.usage?.total_tokens || 0
  },
  cost: estimateCost(...),  // Coût calculé
  timestamp: new Date().toISOString()
};
```

---

## 📍 ÉTAPE 5 : RETOUR AU CLIENT (`chat.tsx`)

**Fichier :** `app/routes/chat.tsx`

### 5.1 Réception de la réponse (lignes 67-78)
```typescript
useEffect(() => {
  if (fetcher.data && fetcher.state === 'idle') {
    setIsLoading(false);
    if (fetcher.data.response) {
      const assistantMessage = { 
        role: 'assistant', 
        content: fetcher.data.response  // La réponse de l'IA
      };
      setMessages(prev => [...prev, assistantMessage]);  // Ajoute à l'interface
    }
  }
}, [fetcher.data, fetcher.state]);
```

### 5.2 Affichage (lignes 100-115)
```typescript
{messages.map((msg, idx) => (
  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className="max-w-3xl rounded-lg p-4">
      {msg.content}  {/* Affiche le contenu */}
    </div>
  </div>
))}
```

---

## 🔄 RÉSUMÉ DU FLUX COMPLET

```
1. _index.tsx
   └─> Vous tapez un prompt
   └─> handleSubmit() → navigate('/chat?q=...&model=...')

2. chat.tsx (loader)
   └─> Extrait q et model de l'URL
   └─> Retourne { initialMessage, initialModel }

3. chat.tsx (composant)
   └─> useEffect détecte initialMessage
   └─> fetcher.submit({ message, model }, { action: '/api/chat' })

4. api.chat.ts
   └─> Parse la requête
   └─> Vérifie le cache
   └─> Prépare les messages (system + user)
   └─> Appelle aiService.chat({ messages, model })

5. ai-service.ts
   └─> chat() → détermine le provider (openrouter)
   └─> chatWithOpenRouter() → fetch vers OpenRouter API
   └─> Retourne { content, usage, cost, ... }

6. api.chat.ts
   └─> Retourne json({ response: aiResponse.content, ... })

7. chat.tsx
   └─> useEffect reçoit fetcher.data
   └─> Ajoute le message assistant à l'interface
   └─> Affiche la réponse dans le chat
```

---

## ⚠️ POINTS IMPORTANTS

1. **Le Workbench n'est PAS encore connecté** : 
   - Le composant `<Workbench />` est présent (ligne 209)
   - Mais les messages ne sont PAS parsés pour extraire le code/artefacts
   - Il manque l'utilisation de `useMessageParser` pour détecter les blocs de code

2. **Pas de streaming** :
   - `stream: false` dans l'appel OpenRouter
   - La réponse arrive en une seule fois

3. **Pas de persistance** :
   - Les messages sont stockés dans `useState` (mémoire locale)
   - Pas de sauvegarde dans une base de données ou localStorage

4. **Cache activé** :
   - Les réponses identiques sont mises en cache (TTL: 1 heure)
   - Économise les appels API

---

## 🚀 AMÉLIORATIONS POSSIBLES

1. **Parser les messages** pour extraire le code et l'afficher dans le Workbench
2. **Streaming** pour afficher la réponse au fur et à mesure
3. **Persistance** des conversations
4. **Gestion d'erreurs** plus robuste avec retry automatique

