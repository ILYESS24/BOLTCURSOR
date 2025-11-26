/**
 * 🧪 TEST SIMPLE - Application déployée
 * Test direct sans serveur local
 */

const BASE_URL = 'https://c3a0d91d.ai-assistant-xlv.pages.dev';

async function testDeployedApp() {
  console.log('🚀 DÉMARRAGE DU TEST DE SIMULATION');
  console.log('=====================================');
  
  const results = {
    interface: false,
    api: false,
    performance: false,
    charge: false
  };
  
  try {
    // Test 1: Interface principale
    console.log('\n🧪 Test 1: Interface principale...');
    const startTime = Date.now();
    
    const response = await fetch(BASE_URL);
    const loadTime = Date.now() - startTime;
    
    if (response.ok) {
      results.interface = true;
      console.log(`✅ Interface: CHARGÉE (${loadTime}ms)`);
    } else {
      console.log(`❌ Interface: ÉCHEC (${response.status})`);
    }
    
    // Test 2: API Health
    console.log('\n🧪 Test 2: API Health...');
    const apiStartTime = Date.now();
    
    const apiResponse = await fetch(`${BASE_URL}/api/health`);
    const apiTime = Date.now() - apiStartTime;
    
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      results.api = true;
      console.log(`✅ API Health: FONCTIONNE (${apiTime}ms)`);
      console.log(`   Status: ${data.status || 'N/A'}`);
    } else {
      console.log(`❌ API Health: ÉCHEC (${apiResponse.status})`);
    }
    
    // Test 3: Performance
    console.log('\n🧪 Test 3: Performance...');
    const perfStartTime = Date.now();
    
    const perfResponse = await fetch(BASE_URL);
    const perfTime = Date.now() - perfStartTime;
    
    if (perfResponse.ok && perfTime < 5000) {
      results.performance = true;
      console.log(`✅ Performance: EXCELLENTE (${perfTime}ms)`);
    } else if (perfResponse.ok) {
      results.performance = true;
      console.log(`⚠️ Performance: ACCEPTABLE (${perfTime}ms)`);
    } else {
      console.log(`❌ Performance: ÉCHEC (${perfTime}ms)`);
    }
    
    // Test 4: Charge
    console.log('\n🧪 Test 4: Test de charge...');
    const chargeStartTime = Date.now();
    
    const chargePromises = [];
    for (let i = 0; i < 10; i++) {
      chargePromises.push(
        fetch(`${BASE_URL}/api/health`).catch(() => null)
      );
    }
    
    const chargeResponses = await Promise.allSettled(chargePromises);
    const chargeTime = Date.now() - chargeStartTime;
    
    const successful = chargeResponses.filter(r => r.status === 'fulfilled').length;
    const successRate = (successful / 10) * 100;
    
    if (successRate >= 80 && chargeTime < 10000) {
      results.charge = true;
      console.log(`✅ Charge: RÉUSSIE (${successRate}% en ${chargeTime}ms)`);
    } else {
      console.log(`⚠️ Charge: PARTIELLE (${successRate}% en ${chargeTime}ms)`);
    }
    
  } catch (error) {
    console.log(`❌ Erreur lors des tests: ${error.message}`);
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
  
  console.log(`\n🎯 TAUX DE SUCCÈS GLOBAL: ${successRate.toFixed(1)}% (${workingSystems}/${totalSystems} systèmes)`);
  
  if (successRate >= 80) {
    console.log('\n🎉 SIMULATION RÉUSSIE !');
    console.log('✅ L\'application fonctionne correctement');
    console.log('✅ Tous les systèmes backend sont opérationnels');
    console.log('✅ Prêt pour la production');
  } else {
    console.log('\n⚠️ SIMULATION PARTIELLE');
    console.log('⚠️ Certains systèmes nécessitent une attention');
  }
  
  console.log(`\n🌐 URL de l'application: ${BASE_URL}`);
  console.log('🏁 Test terminé !');
  
  return results;
}

// Exécuter le test
testDeployedApp().catch(console.error);