/**
 * Test de charge personnalisé pour l'application AI Assistant
 * Simule des utilisateurs normaux et extrêmes
 */

import https from 'https';
import http from 'http';

const BASE_URL = 'https://305a39ac.ai-assistant-xlv.pages.dev';
const NORMAL_USERS = 50; // Utilisateurs normaux
const EXTREME_USERS = 200; // Utilisateurs extrêmes
const DURATION = 60000; // 1 minute de test

class LoadTester {
  constructor() {
    this.results = {
      normal: { requests: 0, errors: 0, responseTimes: [] },
      extreme: { requests: 0, errors: 0, responseTimes: [] }
    };
    this.startTime = Date.now();
  }

  async makeRequest(type = 'normal') {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const options = {
        hostname: '305a39ac.ai-assistant-xlv.pages.dev',
        port: 443,
        path: '/',
        method: 'GET',
        headers: {
          'User-Agent': 'LoadTest/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      };

      const req = https.request(options, (res) => {
        const responseTime = Date.now() - startTime;
        
        this.results[type].requests++;
        this.results[type].responseTimes.push(responseTime);
        
        if (res.statusCode >= 400) {
          this.results[type].errors++;
        }
        
        resolve(responseTime);
      });

      req.on('error', (err) => {
        this.results[type].errors++;
        resolve(Date.now() - startTime);
      });

      req.setTimeout(10000, () => {
        this.results[type].errors++;
        req.destroy();
        resolve(Date.now() - startTime);
      });

      req.end();
    });
  }

  async simulateNormalUser() {
    while (Date.now() - this.startTime < DURATION) {
      await this.makeRequest('normal');
      // Attendre entre 1-3 secondes entre les requêtes
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    }
  }

  async simulateExtremeUser() {
    while (Date.now() - this.startTime < DURATION) {
      await this.makeRequest('extreme');
      // Attendre entre 100-500ms entre les requêtes (très agressif)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 100));
    }
  }

  async runTest() {
    console.log('🚀 Démarrage des tests de charge...');
    console.log(`📊 Utilisateurs normaux: ${NORMAL_USERS}`);
    console.log(`🔥 Utilisateurs extrêmes: ${EXTREME_USERS}`);
    console.log(`⏱️  Durée: ${DURATION / 1000} secondes`);
    console.log('');

    // Lancer les utilisateurs normaux
    const normalPromises = [];
    for (let i = 0; i < NORMAL_USERS; i++) {
      normalPromises.push(this.simulateNormalUser());
    }

    // Lancer les utilisateurs extrêmes
    const extremePromises = [];
    for (let i = 0; i < EXTREME_USERS; i++) {
      extremePromises.push(this.simulateExtremeUser());
    }

    // Attendre la fin du test
    await Promise.all([...normalPromises, ...extremePromises]);

    this.printResults();
  }

  printResults() {
    console.log('\n📈 RÉSULTATS DES TESTS DE CHARGE');
    console.log('=====================================');
    
    const totalRequests = this.results.normal.requests + this.results.extreme.requests;
    const totalErrors = this.results.normal.errors + this.results.extreme.errors;
    const totalTime = (Date.now() - this.startTime) / 1000;
    
    console.log(`⏱️  Durée totale: ${totalTime.toFixed(2)}s`);
    console.log(`📊 Requêtes totales: ${totalRequests}`);
    console.log(`❌ Erreurs totales: ${totalErrors}`);
    console.log(`📈 Taux d'erreur: ${((totalErrors / totalRequests) * 100).toFixed(2)}%`);
    console.log(`🚀 RPS moyen: ${(totalRequests / totalTime).toFixed(2)} req/s`);
    
    console.log('\n👥 UTILISATEURS NORMAUX');
    console.log('------------------------');
    console.log(`📊 Requêtes: ${this.results.normal.requests}`);
    console.log(`❌ Erreurs: ${this.results.normal.errors}`);
    console.log(`📈 Taux d'erreur: ${((this.results.normal.errors / this.results.normal.requests) * 100).toFixed(2)}%`);
    if (this.results.normal.responseTimes.length > 0) {
      const avgResponseTime = this.results.normal.responseTimes.reduce((a, b) => a + b, 0) / this.results.normal.responseTimes.length;
      const maxResponseTime = Math.max(...this.results.normal.responseTimes);
      const minResponseTime = Math.min(...this.results.normal.responseTimes);
      console.log(`⏱️  Temps de réponse moyen: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`⚡ Temps de réponse min: ${minResponseTime}ms`);
      console.log(`🐌 Temps de réponse max: ${maxResponseTime}ms`);
    }
    
    console.log('\n🔥 UTILISATEURS EXTRÊMES');
    console.log('-------------------------');
    console.log(`📊 Requêtes: ${this.results.extreme.requests}`);
    console.log(`❌ Erreurs: ${this.results.extreme.errors}`);
    console.log(`📈 Taux d'erreur: ${((this.results.extreme.errors / this.results.extreme.requests) * 100).toFixed(2)}%`);
    if (this.results.extreme.responseTimes.length > 0) {
      const avgResponseTime = this.results.extreme.responseTimes.reduce((a, b) => a + b, 0) / this.results.extreme.responseTimes.length;
      const maxResponseTime = Math.max(...this.results.extreme.responseTimes);
      const minResponseTime = Math.min(...this.results.extreme.responseTimes);
      console.log(`⏱️  Temps de réponse moyen: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`⚡ Temps de réponse min: ${minResponseTime}ms`);
      console.log(`🐌 Temps de réponse max: ${maxResponseTime}ms`);
    }
    
    console.log('\n🎯 ÉVALUATION DE PERFORMANCE');
    console.log('=============================');
    
    if (totalErrors / totalRequests < 0.01) {
      console.log('✅ EXCELLENT: Taux d\'erreur < 1%');
    } else if (totalErrors / totalRequests < 0.05) {
      console.log('✅ BON: Taux d\'erreur < 5%');
    } else if (totalErrors / totalRequests < 0.10) {
      console.log('⚠️  ACCEPTABLE: Taux d\'erreur < 10%');
    } else {
      console.log('❌ PROBLÉMATIQUE: Taux d\'erreur > 10%');
    }
    
    const avgResponseTime = [...this.results.normal.responseTimes, ...this.results.extreme.responseTimes]
      .reduce((a, b) => a + b, 0) / totalRequests;
    
    if (avgResponseTime < 500) {
      console.log('✅ EXCELLENT: Temps de réponse < 500ms');
    } else if (avgResponseTime < 1000) {
      console.log('✅ BON: Temps de réponse < 1s');
    } else if (avgResponseTime < 2000) {
      console.log('⚠️  ACCEPTABLE: Temps de réponse < 2s');
    } else {
      console.log('❌ PROBLÉMATIQUE: Temps de réponse > 2s');
    }
    
    console.log('\n🏆 TEST TERMINÉ AVEC SUCCÈS!');
  }
}

// Lancer le test
const tester = new LoadTester();
tester.runTest().catch(console.error);
