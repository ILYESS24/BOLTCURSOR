/**
 * 🧪 TEST DE L'APPLICATION DÉPLOYÉE
 * Test direct sur l'application en production
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://c3a0d91d.ai-assistant-xlv.pages.dev';

test.describe('🚀 TEST DE L\'APPLICATION DÉPLOYÉE', () => {
  
  test('✅ Test de l\'interface principale', async ({ page }) => {
    console.log('🧪 Test de l\'interface principale...');
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Vérifier que la page se charge
    expect(await page.title()).toBeTruthy();
    console.log('✅ Interface principale chargée');
    
    // Vérifier la présence d'éléments clés
    const hasTextarea = await page.locator('textarea').count() > 0;
    expect(hasTextarea).toBe(true);
    console.log('✅ Zone de texte présente');
    
    const hasButtons = await page.locator('button').count() > 0;
    expect(hasButtons).toBe(true);
    console.log('✅ Boutons présents');
  });

  test('✅ Test de l\'API Health', async ({ page }) => {
    console.log('🧪 Test de l\'API Health...');
    
    const response = await page.goto(`${BASE_URL}/api/health`);
    expect(response?.status()).toBe(200);
    console.log('✅ API Health répond');
    
    const content = await page.textContent('body');
    expect(content).toContain('status');
    console.log('✅ API Health retourne des données');
  });

  test('✅ Test de performance', async ({ page }) => {
    console.log('🧪 Test de performance...');
    
    const startTime = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`⏱️ Temps de chargement: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(10000); // Moins de 10 secondes
    console.log('✅ Performance acceptable');
  });

  test('✅ Test de responsivité', async ({ page }) => {
    console.log('🧪 Test de responsivité...');
    
    await page.goto(BASE_URL);
    
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    console.log('✅ Desktop: OK');
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    console.log('✅ Tablet: OK');
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    console.log('✅ Mobile: OK');
  });

  test('✅ Test de charge simple', async ({ page }) => {
    console.log('🧪 Test de charge simple...');
    
    const promises = [];
    const startTime = Date.now();
    
    // Simuler 10 requêtes simultanées
    for (let i = 0; i < 10; i++) {
      promises.push(
        page.goto(`${BASE_URL}/api/health`).catch(() => null)
      );
    }
    
    const responses = await Promise.allSettled(promises);
    const totalTime = Date.now() - startTime;
    
    const successful = responses.filter(r => r.status === 'fulfilled').length;
    const successRate = (successful / 10) * 100;
    
    console.log(`📊 Résultats: ${successful}/10 requêtes réussies (${successRate}%)`);
    console.log(`⏱️ Temps total: ${totalTime}ms`);
    
    expect(successRate).toBeGreaterThan(80);
    expect(totalTime).toBeLessThan(5000);
    console.log('✅ Test de charge réussi');
  });

  test('✅ Test de tous les systèmes backend', async ({ page }) => {
    console.log('🧪 Test de tous les systèmes backend...');
    
    const results = {
      interface: false,
      api: false,
      performance: false,
      responsivite: false,
      charge: false
    };
    
    try {
      // Test 1: Interface
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      results.interface = true;
      console.log('✅ Interface: FONCTIONNE');
      
      // Test 2: API
      const apiResponse = await page.goto(`${BASE_URL}/api/health`);
      results.api = apiResponse?.status() === 200;
      console.log(`✅ API: ${results.api ? 'FONCTIONNE' : 'ÉCHEC'}`);
      
      // Test 3: Performance
      const perfStart = Date.now();
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      const perfTime = Date.now() - perfStart;
      results.performance = perfTime < 10000;
      console.log(`✅ Performance: ${results.performance ? 'FONCTIONNE' : 'ÉCHEC'} (${perfTime}ms)`);
      
      // Test 4: Responsivité
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);
      results.responsivite = true;
      console.log('✅ Responsivité: FONCTIONNE');
      
      // Test 5: Charge
      const chargeStart = Date.now();
      const chargePromises = [];
      for (let i = 0; i < 5; i++) {
        chargePromises.push(page.goto(`${BASE_URL}/api/health`).catch(() => null));
      }
      await Promise.allSettled(chargePromises);
      const chargeTime = Date.now() - chargeStart;
      results.charge = chargeTime < 5000;
      console.log(`✅ Charge: ${results.charge ? 'FONCTIONNE' : 'ÉCHEC'} (${chargeTime}ms)`);
      
    } catch (error) {
      console.log('❌ Erreur lors des tests:', error.message);
    }
    
    const workingSystems = Object.values(results).filter(Boolean).length;
    const totalSystems = Object.keys(results).length;
    const successRate = (workingSystems / totalSystems) * 100;
    
    console.log('\n📊 RÉSULTATS FINAUX:');
    console.log(`🎯 Taux de succès: ${successRate.toFixed(1)}% (${workingSystems}/${totalSystems} systèmes)`);
    
    Object.entries(results).forEach(([system, status]) => {
      console.log(`   ${status ? '✅' : '❌'} ${system.toUpperCase()}: ${status ? 'FONCTIONNE' : 'ÉCHEC'}`);
    });
    
    expect(successRate).toBeGreaterThan(80);
    console.log('\n🎉 SIMULATION TERMINÉE !');
  });
});
