/**
 * 🚀 K6 LOAD TEST - Test de charge avancé
 * Simulation de 1000+ utilisateurs simultanés
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Métriques personnalisées
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  stages: [
    // Montée en charge progressive
    { duration: '2m', target: 100 },   // 0 à 100 utilisateurs en 2 min
    { duration: '5m', target: 100 },    // 100 utilisateurs pendant 5 min
    { duration: '2m', target: 200 },    // 100 à 200 utilisateurs en 2 min
    { duration: '5m', target: 200 },    // 200 utilisateurs pendant 5 min
    { duration: '2m', target: 500 },    // 200 à 500 utilisateurs en 2 min
    { duration: '5m', target: 500 },    // 500 utilisateurs pendant 5 min
    { duration: '2m', target: 1000 },   // 500 à 1000 utilisateurs en 2 min
    { duration: '5m', target: 1000 },   // 1000 utilisateurs pendant 5 min
    { duration: '2m', target: 0 },      // Descente à 0 utilisateurs
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% des requêtes < 2s
    http_req_failed: ['rate<0.1'],     // Taux d'erreur < 10%
    errors: ['rate<0.1'],               // Taux d'erreur personnalisé < 10%
  },
};

const BASE_URL = 'https://c3a0d91d.ai-assistant-xlv.pages.dev';

export default function () {
  // Test 1: API Health
  const healthResponse = http.get(`${BASE_URL}/api/health`, {
    headers: {
      'User-Agent': 'K6 Load Test',
      'Accept': 'application/json',
    },
  });
  
  check(healthResponse, {
    'API Health Status 200': (r) => r.status === 200,
    'API Health Response Time < 2s': (r) => r.timings.duration < 2000,
    'API Health Has Status Field': (r) => r.json('status') !== undefined,
  });
  
  errorRate.add(healthResponse.status !== 200);
  responseTime.add(healthResponse.timings.duration);
  
  sleep(1);
  
  // Test 2: Interface principale
  const mainResponse = http.get(BASE_URL, {
    headers: {
      'User-Agent': 'K6 Load Test',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });
  
  check(mainResponse, {
    'Main Page Status 200': (r) => r.status === 200,
    'Main Page Response Time < 3s': (r) => r.timings.duration < 3000,
    'Main Page Has HTML Content': (r) => r.body.includes('<html'),
  });
  
  errorRate.add(mainResponse.status !== 200);
  responseTime.add(mainResponse.timings.duration);
  
  sleep(2);
  
  // Test 3: Cache et performance
  const cacheStart = new Date().getTime();
  const cacheResponse = http.get(`${BASE_URL}/api/health`);
  const cacheEnd = new Date().getTime();
  
  check(cacheResponse, {
    'Cache Test Status 200': (r) => r.status === 200,
    'Cache Test Fast Response': (r) => r.timings.duration < 1000,
  });
  
  errorRate.add(cacheResponse.status !== 200);
  responseTime.add(cacheResponse.timings.duration);
  
  sleep(0.5);
  
  // Test 4: Charge intensive (simulation d'utilisateur actif)
  for (let i = 0; i < 5; i++) {
    const intensiveResponse = http.get(`${BASE_URL}/api/health`);
    check(intensiveResponse, {
      [`Intensive Test ${i} Status 200`]: (r) => r.status === 200,
      [`Intensive Test ${i} Response Time < 1s`]: (r) => r.timings.duration < 1000,
    });
    
    errorRate.add(intensiveResponse.status !== 200);
    responseTime.add(intensiveResponse.timings.duration);
    
    sleep(0.1);
  }
  
  sleep(1);
}

export function handleSummary(data) {
  return {
    'load-test-results.json': JSON.stringify(data, null, 2),
    stdout: `
🚀 RÉSULTATS DU TEST DE CHARGE K6
================================

📊 MÉTRIQUES GLOBALES:
- Durée totale: ${data.metrics.iteration_duration.values.max / 1000}s
- Requêtes totales: ${data.metrics.http_reqs.values.count}
- Utilisateurs max: ${data.metrics.vus.values.max}
- Taux d'erreur: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%

⏱️ TEMPS DE RÉPONSE:
- Moyenne: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
- P95: ${data.metrics.http_req_duration.values.p95.toFixed(2)}ms
- P99: ${data.metrics.http_req_duration.values.p99.toFixed(2)}ms
- Max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms

🎯 SEUILS:
- P95 < 2000ms: ${data.metrics.http_req_duration.values.p95 < 2000 ? '✅ PASSÉ' : '❌ ÉCHEC'}
- Taux d'erreur < 10%: ${data.metrics.http_req_failed.values.rate < 0.1 ? '✅ PASSÉ' : '❌ ÉCHEC'}

${data.metrics.http_req_duration.values.p95 < 2000 && data.metrics.http_req_failed.values.rate < 0.1 
  ? '🎉 TOUS LES TESTS SONT PASSÉS !' 
  : '⚠️ CERTAINS TESTS ONT ÉCHOUÉ'}
    `,
  };
}
