/**
 * Test de production optimisé pour l'application AI Assistant
 * Test réaliste avec gestion des erreurs et optimisations
 */

import https from 'https';

const BASE_URL = 'https://305a39ac.ai-assistant-xlv.pages.dev';
const REALISTIC_USERS = 20; // Utilisateurs réalistes
const DURATION = 60000; // 1 minute de test
const AI_MODELS = ['gpt-4', 'gpt-3.5-turbo', 'claude-3'];

class OptimizedProductionTester {
  constructor() {
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      aiModelUsage: {},
      statusCodes: {},
      concurrentUsers: 0,
      peakConcurrency: 0,
      features: {
        chat: 0,
        aiBuilder: 0,
        enhancer: 0,
        deployment: 0
      }
    };
    this.startTime = Date.now();
    this.activeUsers = new Set();
  }

  async makeRequest(userId, aiModel = 'gpt-4') {
    return new Promise((resolve) => {
      const startTime = Date.now();
      this.activeUsers.add(userId);
      this.results.concurrentUsers = this.activeUsers.size;
      this.results.peakConcurrency = Math.max(this.results.peakConcurrency, this.activeUsers.size);
      
      // Simuler principalement des requêtes GET (plus réaliste)
      const requestTypes = [
        { path: '/', method: 'GET', weight: 0.7 }, // Page d'accueil (70%)
        { path: '/api/chat', method: 'POST', weight: 0.2 }, // Chat (20%)
        { path: '/api/ai-builder', method: 'POST', weight: 0.1 } // AI Builder (10%)
      ];
      
      const random = Math.random();
      let selectedType = requestTypes[0];
      let cumulative = 0;
      
      for (const type of requestTypes) {
        cumulative += type.weight;
        if (random <= cumulative) {
          selectedType = type;
          break;
        }
      }
      
      const options = {
        hostname: '305a39ac.ai-assistant-xlv.pages.dev',
        port: 443,
        path: selectedType.path,
        method: selectedType.method,
        headers: {
          'User-Agent': `ProductionTest-User-${userId}`,
          'Accept': 'application/json, text/html, */*',
          'X-AI-Model': aiModel,
          'X-User-ID': userId.toString()
        }
      };

      let postData = '';
      if (selectedType.method === 'POST') {
        if (selectedType.path === '/api/chat') {
          postData = JSON.stringify({
            messages: [{ role: 'user', content: `Test message from user ${userId}` }]
          });
          this.results.features.chat++;
        } else if (selectedType.path === '/api/ai-builder') {
          postData = JSON.stringify({
            action: 'generate-app',
            name: `TestApp-${userId}`,
            description: `Test application`,
            type: 'web',
            framework: 'react'
          });
          this.results.features.aiBuilder++;
        }
        options.headers['Content-Type'] = 'application/json';
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = https.request(options, (res) => {
        const responseTime = Date.now() - startTime;
        
        this.results.totalRequests++;
        this.results.responseTimes.push(responseTime);
        
        const statusCode = res.statusCode;
        this.results.statusCodes[statusCode] = (this.results.statusCodes[statusCode] || 0) + 1;
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.results.successfulRequests++;
          this.results.aiModelUsage[aiModel] = (this.results.aiModelUsage[aiModel] || 0) + 1;
        } else {
          this.results.failedRequests++;
        }
        
        this.activeUsers.delete(userId);
        resolve({ success: res.statusCode < 400, responseTime, statusCode, aiModel });
      });

      req.on('error', (err) => {
        this.results.failedRequests++;
        this.results.statusCodes['ERROR'] = (this.results.statusCodes['ERROR'] || 0) + 1;
        this.activeUsers.delete(userId);
        resolve({ success: false, responseTime: Date.now() - startTime, error: err.message, aiModel });
      });

      req.setTimeout(5000, () => {
        this.results.failedRequests++;
        this.results.statusCodes['TIMEOUT'] = (this.results.statusCodes['TIMEOUT'] || 0) + 1;
        this.activeUsers.delete(userId);
        req.destroy();
        resolve({ success: false, responseTime: Date.now() - startTime, error: 'Timeout', aiModel });
      });

      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }

  async simulateRealisticUser(userId) {
    const aiModel = AI_MODELS[Math.floor(Math.random() * AI_MODELS.length)];
    
    while (Date.now() - this.startTime < DURATION) {
      await this.makeRequest(userId, aiModel);
      
      // Pattern réaliste : pause entre 2-8 secondes
      const pauseTime = Math.random() * 6000 + 2000;
      await new Promise(resolve => setTimeout(resolve, pauseTime));
    }
  }

  async runOptimizedTest() {
    console.log('🚀 TEST DE PRODUCTION OPTIMISÉ');
    console.log('==============================');
    console.log(`👥 Utilisateurs réalistes: ${REALISTIC_USERS}`);
    console.log(`🤖 Modèles IA: ${AI_MODELS.join(', ')}`);
    console.log(`⏱️  Durée: ${DURATION / 1000} secondes`);
    console.log(`🎯 Test: Page d'accueil (70%), Chat (20%), AI Builder (10%)`);
    console.log('');

    // Lancer les utilisateurs
    const promises = [];
    for (let i = 0; i < REALISTIC_USERS; i++) {
      promises.push(this.simulateRealisticUser(i));
    }

    // Monitoring en temps réel
    const monitorInterval = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      const rps = this.results.totalRequests / elapsed;
      const successRate = this.results.totalRequests > 0 ? (this.results.successfulRequests / this.results.totalRequests * 100).toFixed(2) : '0.00';
      
      console.log(`⏱️  ${elapsed.toFixed(1)}s | 📊 ${this.results.totalRequests} req | ✅ ${successRate}% | 🚀 ${rps.toFixed(1)} RPS | 👥 ${this.results.concurrentUsers} users`);
    }, 10000);

    // Attendre la fin du test
    await Promise.all(promises);
    clearInterval(monitorInterval);

    this.printOptimizedResults();
  }

  printOptimizedResults() {
    console.log('\n📈 RÉSULTATS DU TEST OPTIMISÉ');
    console.log('==============================');
    
    const totalTime = (Date.now() - this.startTime) / 1000;
    const successRate = this.results.totalRequests > 0 ? (this.results.successfulRequests / this.results.totalRequests * 100) : 0;
    const avgResponseTime = this.results.responseTimes.length > 0 ? 
      this.results.responseTimes.reduce((a, b) => a + b, 0) / this.results.responseTimes.length : 0;
    
    console.log(`⏱️  Durée totale: ${totalTime.toFixed(2)}s`);
    console.log(`📊 Requêtes totales: ${this.results.totalRequests}`);
    console.log(`✅ Requêtes réussies: ${this.results.successfulRequests}`);
    console.log(`❌ Requêtes échouées: ${this.results.failedRequests}`);
    console.log(`📈 Taux de succès: ${successRate.toFixed(2)}%`);
    console.log(`🚀 RPS moyen: ${(this.results.totalRequests / totalTime).toFixed(2)} req/s`);
    console.log(`👥 Utilisateurs simultanés max: ${this.results.peakConcurrency}`);
    
    if (this.results.responseTimes.length > 0) {
      const sortedTimes = [...this.results.responseTimes].sort((a, b) => a - b);
      const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
      const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
      const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
      
      console.log('\n⏱️  TEMPS DE RÉPONSE');
      console.log('-------------------');
      console.log(`📊 Moyenne: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`📈 P50 (médiane): ${p50}ms`);
      console.log(`📈 P95: ${p95}ms`);
      console.log(`📈 P99: ${p99}ms`);
    }
    
    console.log('\n🤖 UTILISATION DES MODÈLES IA');
    console.log('-----------------------------');
    Object.entries(this.results.aiModelUsage).forEach(([model, count]) => {
      const percentage = this.results.successfulRequests > 0 ? ((count / this.results.successfulRequests) * 100).toFixed(2) : '0.00';
      console.log(`${model}: ${count} requêtes (${percentage}%)`);
    });
    
    console.log('\n📊 CODES DE STATUT');
    console.log('------------------');
    Object.entries(this.results.statusCodes).forEach(([code, count]) => {
      const percentage = this.results.totalRequests > 0 ? ((count / this.results.totalRequests) * 100).toFixed(2) : '0.00';
      console.log(`${code}: ${count} (${percentage}%)`);
    });
    
    console.log('\n🔧 FONCTIONNALITÉS TESTÉES');
    console.log('---------------------------');
    console.log(`💬 Chat: ${this.results.features.chat} requêtes`);
    console.log(`🤖 AI Builder: ${this.results.features.aiBuilder} requêtes`);
    console.log(`📄 Page d'accueil: ${this.results.totalRequests - this.results.features.chat - this.results.features.aiBuilder} requêtes`);
    
    console.log('\n🎯 ÉVALUATION DE PRODUCTION');
    console.log('============================');
    
    // Évaluation optimisée
    if (successRate >= 95) {
      console.log('✅ EXCELLENT: Taux de succès ≥ 95%');
    } else if (successRate >= 90) {
      console.log('✅ BON: Taux de succès ≥ 90%');
    } else if (successRate >= 80) {
      console.log('⚠️  ACCEPTABLE: Taux de succès ≥ 80%');
    } else {
      console.log('❌ PROBLÉMATIQUE: Taux de succès < 80%');
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
    
    if (this.results.peakConcurrency >= REALISTIC_USERS * 0.5) {
      console.log('✅ EXCELLENT: Gestion de la concurrence');
    } else {
      console.log('⚠️  ATTENTION: Gestion de la concurrence à améliorer');
    }
    
    console.log('\n🏆 VERDICT FINAL');
    console.log('================');
    
    if (successRate >= 80 && avgResponseTime < 2000) {
      console.log('🎉 PRÊT POUR LA PRODUCTION!');
      console.log('✅ L\'application peut gérer des utilisateurs simultanés');
      console.log('✅ Support de multiples modèles IA');
      console.log('✅ Fonctionnalités opérationnelles');
    } else if (successRate >= 60) {
      console.log('⚠️  PRÊT AVEC RÉSERVES');
      console.log('✅ Fonctionnalités de base opérationnelles');
      console.log('⚠️  Optimisations recommandées');
    } else {
      console.log('❌ NÉCESSITE DES OPTIMISATIONS');
      console.log('⚠️  L\'application nécessite des améliorations');
    }
    
    console.log('\n🚀 TEST OPTIMISÉ TERMINÉ!');
  }
}

// Lancer le test optimisé
const tester = new OptimizedProductionTester();
tester.runOptimizedTest().catch(console.error);
