/**
 * Test simple de l'endpoint de santé
 */

import https from 'https';

const BASE_URL = 'https://f0c0f610.ai-assistant-xlv.pages.dev';

async function testHealthEndpoint() {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const options = {
      hostname: 'f0c0f610.ai-assistant-xlv.pages.dev',
      port: 443,
      path: '/api/health',
      method: 'GET',
      headers: {
        'User-Agent': 'HealthTest',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          responseTime,
          data: data ? JSON.parse(data) : null,
          success: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        statusCode: 'ERROR',
        responseTime: Date.now() - startTime,
        error: err.message,
        success: false
      });
    });

    req.setTimeout(10000, () => {
      resolve({
        statusCode: 'TIMEOUT',
        responseTime: Date.now() - startTime,
        error: 'Timeout',
        success: false
      });
      req.destroy();
    });

    req.end();
  });
}

async function runHealthTest() {
  console.log('🏥 TEST DE L\'ENDPOINT DE SANTÉ');
  console.log('================================');
  console.log(`🌐 URL: ${BASE_URL}/api/health`);
  console.log('');

  const result = await testHealthEndpoint();
  
  console.log('📊 RÉSULTATS');
  console.log('============');
  console.log(`📈 Statut: ${result.statusCode}`);
  console.log(`⏱️  Temps de réponse: ${result.responseTime}ms`);
  console.log(`✅ Succès: ${result.success ? 'OUI' : 'NON'}`);
  
  if (result.data) {
    console.log('\n📋 DONNÉES DE SANTÉ');
    console.log('===================');
    console.log(`Status: ${result.data.status || 'N/A'}`);
    console.log(`Timestamp: ${result.data.timestamp || 'N/A'}`);
    console.log(`Uptime: ${result.data.uptime || 'N/A'}s`);
    
    if (result.data.metrics) {
      console.log('\n📊 MÉTRIQUES');
      console.log('============');
      Object.entries(result.data.metrics).forEach(([api, metrics]) => {
        console.log(`${api}: ${metrics.totalRequests} requêtes, ${metrics.errorRate.toFixed(2)}% erreurs`);
      });
    }
    
    if (result.data.health) {
      console.log('\n🏥 RAPPORT DE SANTÉ');
      console.log('===================');
      console.log(`Status: ${result.data.health.status}`);
      if (result.data.health.issues.length > 0) {
        console.log('Issues:');
        result.data.health.issues.forEach(issue => console.log(`  - ${issue}`));
      }
      if (result.data.health.recommendations.length > 0) {
        console.log('Recommendations:');
        result.data.health.recommendations.forEach(rec => console.log(`  - ${rec}`));
      }
    }
  }
  
  if (result.error) {
    console.log(`\n❌ Erreur: ${result.error}`);
  }
  
  console.log('\n🎯 VERDICT');
  console.log('==========');
  if (result.success) {
    console.log('✅ L\'endpoint de santé fonctionne correctement');
  } else {
    console.log('❌ L\'endpoint de santé ne fonctionne pas');
  }
  
  console.log('\n🏥 TEST TERMINÉ!');
}

runHealthTest().catch(console.error);
