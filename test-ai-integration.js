/**
 * 🧪 TEST D'INTÉGRATION IA
 * Test des clés API OpenAI et Anthropic
 */

const BASE_URL = 'https://134db3e9.ai-assistant-xlv.pages.dev';

async function testAIIntegration() {
  console.log('🤖 TEST D\'INTÉGRATION IA');
  console.log('========================');
  
  const results = {
    configuration: false,
    openai: false,
    anthropic: false,
    chat: false
  };
  
  try {
    // Test 1: Configuration
    console.log('\n🧪 Test 1: Configuration des modèles...');
    const configResponse = await fetch(`${BASE_URL}/api/chat`);
    
    if (configResponse.ok) {
      const config = await configResponse.json();
      results.configuration = true;
      console.log('✅ Configuration: OK');
      console.log(`   Modèles disponibles: ${config.models?.length || 0}`);
      console.log(`   OpenAI configuré: ${config.configuration?.openai ? 'OUI' : 'NON'}`);
      console.log(`   Anthropic configuré: ${config.configuration?.anthropic ? 'OUI' : 'NON'}`);
    } else {
      console.log(`❌ Configuration: ÉCHEC (${configResponse.status})`);
    }
    
    // Test 2: OpenAI
    console.log('\n🧪 Test 2: Test OpenAI (GPT-4)...');
    try {
      const openaiResponse = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Bonjour, peux-tu me dire bonjour en français ?',
          model: 'gpt-4'
        })
      });
      
      if (openaiResponse.ok) {
        const data = await openaiResponse.json();
        results.openai = true;
        console.log('✅ OpenAI: FONCTIONNE');
        console.log(`   Réponse: ${data.response?.substring(0, 100)}...`);
        console.log(`   Modèle: ${data.model}`);
        console.log(`   Tokens: ${data.usage?.totalTokens || 'N/A'}`);
        console.log(`   Coût: $${data.cost?.toFixed(4) || 'N/A'}`);
      } else {
        const error = await openaiResponse.text();
        console.log(`❌ OpenAI: ÉCHEC (${openaiResponse.status})`);
        console.log(`   Erreur: ${error.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`❌ OpenAI: ERREUR - ${error.message}`);
    }
    
    // Test 3: Anthropic
    console.log('\n🧪 Test 3: Test Anthropic (Claude)...');
    try {
      const anthropicResponse = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Bonjour, peux-tu me dire bonjour en français ?',
          model: 'claude-3-sonnet'
        })
      });
      
      if (anthropicResponse.ok) {
        const data = await anthropicResponse.json();
        results.anthropic = true;
        console.log('✅ Anthropic: FONCTIONNE');
        console.log(`   Réponse: ${data.response?.substring(0, 100)}...`);
        console.log(`   Modèle: ${data.model}`);
        console.log(`   Tokens: ${data.usage?.totalTokens || 'N/A'}`);
        console.log(`   Coût: $${data.cost?.toFixed(4) || 'N/A'}`);
      } else {
        const error = await anthropicResponse.text();
        console.log(`❌ Anthropic: ÉCHEC (${anthropicResponse.status})`);
        console.log(`   Erreur: ${error.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`❌ Anthropic: ERREUR - ${error.message}`);
    }
    
    // Test 4: Chat général
    console.log('\n🧪 Test 4: Test Chat général...');
    try {
      const chatResponse = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Explique-moi ce qu\'est l\'intelligence artificielle en 2 phrases.',
          model: 'gpt-4'
        })
      });
      
      if (chatResponse.ok) {
        const data = await chatResponse.json();
        results.chat = true;
        console.log('✅ Chat: FONCTIONNE');
        console.log(`   Réponse: ${data.response?.substring(0, 150)}...`);
        console.log(`   Temps de réponse: ${data.timestamp}`);
        console.log(`   Cache: ${data.cached ? 'OUI' : 'NON'}`);
      } else {
        const error = await chatResponse.text();
        console.log(`❌ Chat: ÉCHEC (${chatResponse.status})`);
        console.log(`   Erreur: ${error.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`❌ Chat: ERREUR - ${error.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Erreur générale: ${error.message}`);
  }
  
  // Résultats finaux
  console.log('\n📊 RÉSULTATS FINAUX');
  console.log('===================');
  
  const workingSystems = Object.values(results).filter(Boolean).length;
  const totalSystems = Object.keys(results).length;
  const successRate = (workingSystems / totalSystems) * 100;
  
  Object.entries(results).forEach(([system, status]) => {
    console.log(`${status ? '✅' : '❌'} ${system.toUpperCase()}: ${status ? 'FONCTIONNE' : 'ÉCHEC'}`);
  });
  
  console.log(`\n🎯 TAUX DE SUCCÈS: ${successRate.toFixed(1)}% (${workingSystems}/${totalSystems} systèmes)`);
  
  if (successRate >= 75) {
    console.log('\n🎉 INTÉGRATION IA RÉUSSIE !');
    console.log('✅ L\'application est prête avec l\'IA');
    console.log('✅ OpenAI et Anthropic configurés');
    console.log('✅ Chat fonctionnel');
  } else {
    console.log('\n⚠️ INTÉGRATION IA PARTIELLE');
    console.log('⚠️ Vérifiez la configuration des clés API');
    console.log('⚠️ Consultez setup-api-keys.md pour la configuration');
  }
  
  console.log(`\n🌐 URL de l'application: ${BASE_URL}`);
  console.log('🏁 Test terminé !');
  
  return results;
}

// Exécuter le test
testAIIntegration().catch(console.error);
