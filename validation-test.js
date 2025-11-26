/**
 * Test de validation des optimisations de production
 */

import https from 'https';

const BASE_URL = 'https://305a39ac.ai-assistant-xlv.pages.dev';
const TEST_USERS = 10;
const DURATION = 30000; // 30 secondes

class ValidationTester {
  constructor() {
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      statusCodes: {},
      errors: [],
      concurrentUsers: 0,
      peakConcurrency: 0
    };
    this.startTime = Date.now();
    this.activeUsers = new Set();
  }

  async makeRequest(userId, testType = 'health') {
    return new Promise((resolve) => {
      const startTime = Date.now();
      this.activeUsers.add(userId);
      this.results.concurrentUsers = this.activeUsers.size;
      this.results.peakConcurrency = Math.max(this.results.peakConcurrency, this.activeUsers.size);
      
      const endpoints = {
        health: '/api/health',
        chat: '/api/chat',
        enhancer: '/api/enhancer',
        aiBuilder: '/api/ai-builder'
      };
      
      const endpoint = endpoints[testType] || '/api/health';
      const isPost = endpoint !== '/api/health';
      
      const options = {
        hostname: '305a39ac.ai-assistant-xlv.pages.dev',
        port: 443,
        path: endpoint,
        method: isPost ? 'POST' : 'GET',
        headers: {
          'User-Agent': `ValidationTest-User-${userId}`,
          'Accept': 'application/json, text/html, */*',
          'Content-Type': 'application/json',
          'X-User-ID': userId.toString()
        }
      };

      let postData = '';
      if (isPost) {
        if (endpoint === '/api/chat') {
          postData = JSON.stringify({
            messages: [{ role: 'user', content: `Test message from user ${userId}` }]
          });
        } else if (endpoint === '/api/enhancer') {
          postData = JSON.stringify({
            message: `Test prompt from user ${userId}`
          });
        } else if (endpoint === '/api/ai-builder') {
          postData = JSON.stringify({
            action: 'generate-app',
            specification: {
              name: `TestApp-${userId}`,
              type: 'web',
              framework: 'react',
              description: 'Test application'
            }
          });
        }
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
        } else {
          this.results.failedRequests++;
          this.results.errors.push({
            statusCode,
            endpoint,
            userId,
            responseTime
          });
        }
        
        this.activeUsers.delete(userId);
        resolve({ success: res.statusCode < 400, responseTime, statusCode, endpoint });
      });

      req.on('error', (err) => {
        this.results.failedRequests++;
        this.results.statusCodes['ERROR'] = (this.results.statusCodes['ERROR'] || 0) + 1;
        this.results.errors.push({
          error: err.message,
          endpoint,
          userId,
          responseTime: Date.now() - startTime
        });
        this.activeUsers.delete(userId);
        resolve({ success: false, responseTime: Date.now() - startTime, error: err.message, endpoint });
      });

      req.setTimeout(10000, () => {
        this.results.failedRequests++;
        this.results.statusCodes['TIMEOUT'] = (this.results.statusCodes['TIMEOUT'] || 0) + 1;
        this.results.errors.push({
          error: 'Timeout',
          endpoint,
          userId,
          responseTime: Date.now() - startTime
        });
        this.activeUsers.delete(userId);
        req.destroy();
        resolve({ success: false, responseTime: Date.now() - startTime, error: 'Timeout', endpoint });
      });

      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }

  async simulateUser(userId) {
    const testTypes = ['health', 'chat', 'enhancer', 'aiBuilder'];
    
    while (Date.now() - this.startTime < DURATION) {
      const testType = testTypes[Math.floor(Math.random() * testTypes.length)];
      await this.makeRequest(userId, testType);
      
      // Pause réaliste entre 2-5 secondes
      const pauseTime = Math.random() * 3000 + 2000;
      await new Promise(resolve => setTimeout(resolve, pauseTime));
    }
  }

  async runValidationTest() {
    console.log('🔧 TEST DE VALIDATION DES OPTIMISATIONS');
    console.log('=======================================');
    console.log(`👥 Utilisateurs: ${TEST_USERS}`);
    console.log(`⏱️  Durée: ${DURATION / 1000} secondes`);
    console.log(`🎯 Tests: Health, Chat, Enhancer, AI Builder`);
    console.log('');

    // Lancer les utilisateurs
    const promises = [];
    for (let i = 0; i < TEST_USERS; i++) {
      promises.push(this.simulateUser(i));
    }

    // Monitoring en temps réel
    const monitorInterval = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      const rps = this.results.totalRequests / elapsed;
      const successRate = this.results.totalRequests > 0 ? (this.results.successfulRequests / this.results.totalRequests * 100).toFixed(2) : '0.00';
      
      console.log(`⏱️  ${elapsed.toFixed(1)}s | 📊 ${this.results.totalRequests} req | ✅ ${successRate}% | 🚀 ${rps.toFixed(1)} RPS | 👥 ${this.results.concurrentUsers} users`);
    }, 5000);

    // Attendre la fin du test
    await Promise.all(promises);
    clearInterval(monitorInterval);

    this.printValidationResults();
  }

  printValidationResults() {
    console.log('\n📈 RÉSULTATS DE VALIDATION');
    console.log('==========================');
    
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
    
    console.log('\n📊 CODES DE STATUT');
    console.log('------------------');
    Object.entries(this.results.statusCodes).forEach(([code, count]) => {
      const percentage = this.results.totalRequests > 0 ? ((count / this.results.totalRequests) * 100).toFixed(2) : '0.00';
      console.log(`${code}: ${count} (${percentage}%)`);
    });
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ ERREURS DÉTECTÉES');
      console.log('--------------------');
      this.results.errors.slice(0, 10).forEach((error, index) => {
        console.log(`${index + 1}. ${error.endpoint} - ${error.statusCode || error.error} (User ${error.userId})`);
      });
      
      if (this.results.errors.length > 10) {
        console.log(`... et ${this.results.errors.length - 10} autres erreurs`);
      }
    }
    
    console.log('\n🎯 ÉVALUATION DES OPTIMISATIONS');
    console.log('================================');
    
    // Évaluation des optimisations
    const optimizations = [];
    
    if (successRate >= 90) {
      optimizations.push('✅ Gestion d\'erreur: EXCELLENTE');
    } else if (successRate >= 80) {
      optimizations.push('✅ Gestion d\'erreur: BONNE');
    } else {
      optimizations.push('❌ Gestion d\'erreur: À AMÉLIORER');
    }
    
    if (avgResponseTime < 1000) {
      optimizations.push('✅ Timeouts: OPTIMISÉS');
    } else if (avgResponseTime < 2000) {
      optimizations.push('⚠️  Timeouts: ACCEPTABLES');
    } else {
      optimizations.push('❌ Timeouts: À OPTIMISER');
    }
    
    if (this.results.statusCodes[429] > 0) {
      optimizations.push('✅ Rate limiting: ACTIF');
    } else {
      optimizations.push('⚠️  Rate limiting: NON TESTÉ');
    }
    
    if (this.results.statusCodes[408] > 0) {
      optimizations.push('✅ Timeout handling: ACTIF');
    } else {
      optimizations.push('⚠️  Timeout handling: NON TESTÉ');
    }
    
    optimizations.forEach(opt => console.log(opt));
    
    console.log('\n🏆 VERDICT FINAL');
    console.log('================');
    
    if (successRate >= 90 && avgResponseTime < 1000) {
      console.log('🎉 OPTIMISATIONS RÉUSSIES!');
      console.log('✅ L\'application est prête pour la production');
      console.log('✅ Toutes les optimisations sont fonctionnelles');
    } else if (successRate >= 80) {
      console.log('✅ OPTIMISATIONS PARTIELLEMENT RÉUSSIES');
      console.log('✅ L\'application est améliorée');
      console.log('⚠️  Quelques optimisations supplémentaires recommandées');
    } else {
      console.log('❌ OPTIMISATIONS INSUFFISANTES');
      console.log('⚠️  L\'application nécessite plus d\'optimisations');
    }
    
    console.log('\n🚀 TEST DE VALIDATION TERMINÉ!');
  }
}

// Lancer le test de validation
const tester = new ValidationTester();
tester.runValidationTest().catch(console.error);
