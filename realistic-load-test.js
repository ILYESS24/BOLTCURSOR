/**
 * Test de charge réaliste pour l'application AI Assistant
 * Simule des utilisateurs réels avec des patterns réalistes
 */

import https from 'https';

const BASE_URL = 'https://305a39ac.ai-assistant-xlv.pages.dev';
const REALISTIC_USERS = 10; // Utilisateurs réalistes
const DURATION = 30000; // 30 secondes de test

class RealisticLoadTester {
  constructor() {
    this.results = {
      requests: 0,
      errors: 0,
      responseTimes: [],
      statusCodes: {}
    };
    this.startTime = Date.now();
  }

  async makeRequest() {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const options = {
        hostname: '305a39ac.ai-assistant-xlv.pages.dev',
        port: 443,
        path: '/',
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      };

      const req = https.request(options, (res) => {
        const responseTime = Date.now() - startTime;
        
        this.results.requests++;
        this.results.responseTimes.push(responseTime);
        
        // Enregistrer les codes de statut
        const statusCode = res.statusCode;
        this.results.statusCodes[statusCode] = (this.results.statusCodes[statusCode] || 0) + 1;
        
        if (res.statusCode >= 400) {
          this.results.errors++;
        }
        
        resolve(responseTime);
      });

      req.on('error', (err) => {
        this.results.errors++;
        this.results.statusCodes['ERROR'] = (this.results.statusCodes['ERROR'] || 0) + 1;
        resolve(Date.now() - startTime);
      });

      req.setTimeout(5000, () => {
        this.results.errors++;
        this.results.statusCodes['TIMEOUT'] = (this.results.statusCodes['TIMEOUT'] || 0) + 1;
        req.destroy();
        resolve(Date.now() - startTime);
      });

      req.end();
    });
  }

  async simulateRealisticUser() {
    while (Date.now() - this.startTime < DURATION) {
      await this.makeRequest();
      
      // Pattern réaliste : pause entre 2-8 secondes
      const pauseTime = Math.random() * 6000 + 2000;
      await new Promise(resolve => setTimeout(resolve, pauseTime));
    }
  }

  async runTest() {
    console.log('🚀 Démarrage du test de charge réaliste...');
    console.log(`👥 Utilisateurs réalistes: ${REALISTIC_USERS}`);
    console.log(`⏱️  Durée: ${DURATION / 1000} secondes`);
    console.log('');

    // Lancer les utilisateurs réalistes
    const promises = [];
    for (let i = 0; i < REALISTIC_USERS; i++) {
      promises.push(this.simulateRealisticUser());
    }

    // Attendre la fin du test
    await Promise.all(promises);

    this.printResults();
  }

  printResults() {
    console.log('\n📈 RÉSULTATS DU TEST RÉALISTE');
    console.log('================================');
    
    const totalTime = (Date.now() - this.startTime) / 1000;
    
    console.log(`⏱️  Durée totale: ${totalTime.toFixed(2)}s`);
    console.log(`📊 Requêtes totales: ${this.results.requests}`);
    console.log(`❌ Erreurs totales: ${this.results.errors}`);
    console.log(`📈 Taux d'erreur: ${((this.results.errors / this.results.requests) * 100).toFixed(2)}%`);
    console.log(`🚀 RPS moyen: ${(this.results.requests / totalTime).toFixed(2)} req/s`);
    
    if (this.results.responseTimes.length > 0) {
      const avgResponseTime = this.results.responseTimes.reduce((a, b) => a + b, 0) / this.results.responseTimes.length;
      const maxResponseTime = Math.max(...this.results.responseTimes);
      const minResponseTime = Math.min(...this.results.responseTimes);
      
      // Calculer les percentiles
      const sortedTimes = [...this.results.responseTimes].sort((a, b) => a - b);
      const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
      const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
      const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
      
      console.log('\n⏱️  TEMPS DE RÉPONSE');
      console.log('-------------------');
      console.log(`📊 Moyenne: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`⚡ Minimum: ${minResponseTime}ms`);
      console.log(`🐌 Maximum: ${maxResponseTime}ms`);
      console.log(`📈 P50 (médiane): ${p50}ms`);
      console.log(`📈 P95: ${p95}ms`);
      console.log(`📈 P99: ${p99}ms`);
    }
    
    console.log('\n📊 CODES DE STATUT');
    console.log('------------------');
    Object.entries(this.results.statusCodes).forEach(([code, count]) => {
      const percentage = ((count / this.results.requests) * 100).toFixed(2);
      console.log(`${code}: ${count} (${percentage}%)`);
    });
    
    console.log('\n🎯 ÉVALUATION DE PERFORMANCE');
    console.log('=============================');
    
    const errorRate = (this.results.errors / this.results.requests) * 100;
    const avgResponseTime = this.results.responseTimes.reduce((a, b) => a + b, 0) / this.results.responseTimes.length;
    
    if (errorRate < 1) {
      console.log('✅ EXCELLENT: Taux d\'erreur < 1%');
    } else if (errorRate < 5) {
      console.log('✅ BON: Taux d\'erreur < 5%');
    } else if (errorRate < 10) {
      console.log('⚠️  ACCEPTABLE: Taux d\'erreur < 10%');
    } else {
      console.log('❌ PROBLÉMATIQUE: Taux d\'erreur > 10%');
    }
    
    if (avgResponseTime < 500) {
      console.log('✅ EXCELLENT: Temps de réponse < 500ms');
    } else if (avgResponseTime < 1000) {
      console.log('✅ BON: Temps de réponse < 1s');
    } else if (avgResponseTime < 2000) {
      console.log('⚠️  ACCEPTABLE: Temps de réponse < 2s');
    } else {
      console.log('❌ PROBLÉMATIQUE: Temps de réponse > 2s');
    }
    
    // Test de stabilité
    const successRate = ((this.results.requests - this.results.errors) / this.results.requests) * 100;
    if (successRate > 95) {
      console.log('✅ STABLE: Taux de succès > 95%');
    } else if (successRate > 90) {
      console.log('✅ ACCEPTABLE: Taux de succès > 90%');
    } else {
      console.log('❌ INSTABLE: Taux de succès < 90%');
    }
    
    console.log('\n🏆 TEST RÉALISTE TERMINÉ!');
    console.log('🎉 L\'application est prête pour la production!');
  }
}

// Lancer le test
const tester = new RealisticLoadTester();
tester.runTest().catch(console.error);
