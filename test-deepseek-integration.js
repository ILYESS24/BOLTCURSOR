/**
 * 🧪 TEST D'INTÉGRATION DEEPSEEK V3
 * Script pour vérifier que DeepSeek est bien intégré dans le backend
 */

const API_URL = process.env.APP_URL || 'http://localhost:8788';

async function testDeepSeekIntegration() {
  console.log('🧪 Test d\'intégration DeepSeek V3\n');
  console.log(`📍 URL de l'API: ${API_URL}\n`);

  // Test 1: Vérifier que les modèles DeepSeek sont disponibles
  console.log('📋 Test 1: Vérification des modèles disponibles...');
  try {
    const modelsResponse = await fetch(`${API_URL}/api/chat`, {
      method: 'GET',
    });

    if (!modelsResponse.ok) {
      throw new Error(`Erreur HTTP: ${modelsResponse.status}`);
    }

    const modelsData = await modelsResponse.json();
    console.log('✅ Modèles disponibles:', modelsData.models?.length || 0);
    
    const deepseekModels = modelsData.models?.filter(m => 
      m.id?.includes('deepseek') || m.provider === 'deepseek'
    ) || [];
    
    if (deepseekModels.length > 0) {
      console.log('✅ Modèles DeepSeek trouvés:');
      deepseekModels.forEach(model => {
        console.log(`   - ${model.name} (${model.id})`);
      });
    } else {
      console.log('⚠️  Aucun modèle DeepSeek trouvé dans la liste');
    }

    // Vérifier la configuration
    console.log('\n📊 Statut de configuration:');
    console.log(`   - OpenAI: ${modelsData.configuration?.openai ? '✅' : '❌'}`);
    console.log(`   - Anthropic: ${modelsData.configuration?.anthropic ? '✅' : '❌'}`);
    console.log(`   - DeepSeek: ${modelsData.configuration?.deepseek ? '✅' : '❌'}`);
    console.log(`   - Configuré: ${modelsData.configuration?.configured ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Erreur lors de la vérification des modèles:', error.message);
    return;
  }

  // Test 2: Tester une requête avec DeepSeek (si la clé API est configurée)
  console.log('\n\n💬 Test 2: Test d\'une requête avec DeepSeek V3...');
  try {
    const chatResponse = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Bonjour, peux-tu me dire bonjour en retour ?',
        model: 'deepseek-chat'
      })
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      if (chatResponse.status === 503) {
        console.log('⚠️  Service IA non configuré - Vérifiez les clés API dans Cloudflare Dashboard');
        console.log('   Pour configurer DeepSeek:');
        console.log('   1. Allez dans Cloudflare Dashboard → Pages → votre projet');
        console.log('   2. Settings → Environment Variables');
        console.log('   3. Ajoutez DEEPSEEK_API_KEY avec votre clé API');
      } else {
        throw new Error(`Erreur HTTP: ${chatResponse.status} - ${errorText}`);
      }
      return;
    }

    const chatData = await chatResponse.json();
    console.log('✅ Requête réussie !');
    console.log(`   Modèle utilisé: ${chatData.model}`);
    console.log(`   Réponse: ${chatData.response?.substring(0, 100)}...`);
    console.log(`   Tokens utilisés: ${chatData.usage?.totalTokens || 'N/A'}`);
    console.log(`   Coût estimé: $${chatData.cost?.toFixed(6) || 'N/A'}`);

  } catch (error) {
    console.error('❌ Erreur lors du test de requête:', error.message);
  }

  console.log('\n\n✅ Tests terminés !');
}

// Exécuter les tests
testDeepSeekIntegration().catch(console.error);

