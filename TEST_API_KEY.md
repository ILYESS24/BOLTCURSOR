# 🧪 TESTER VOTRE CLÉ API OPENROUTER

## Méthode 1 : Via le navigateur (Console)

1. Ouvrez https://openrouter.ai/keys dans votre navigateur
2. Ouvrez la console (F12)
3. Collez ce code :

```javascript
fetch('https://openrouter.ai/api/v1/models', {
  headers: {
    'Authorization': 'Bearer VOTRE_CLE_API_ICI'
  }
})
.then(r => r.json())
.then(data => {
  if (data.data) {
    console.log('✅ Clé API valide !', data.data.length, 'modèles disponibles');
  } else {
    console.error('❌ Erreur:', data);
  }
});
```

## Méthode 2 : Via curl (Terminal)

```bash
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer VOTRE_CLE_API_ICI"
```

## Méthode 3 : Via Postman ou Insomnia

- **URL:** `https://openrouter.ai/api/v1/models`
- **Method:** GET
- **Headers:**
  - `Authorization: Bearer VOTRE_CLE_API_ICI`

## ✅ Résultat attendu

Si votre clé est valide, vous devriez voir une liste de modèles JSON.

Si vous voyez `{"error": {"message": "User not found"}}`, votre clé est invalide.

