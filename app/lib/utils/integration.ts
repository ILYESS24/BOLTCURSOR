/**
 * Intégration de tous les systèmes backend
 */

import { chatCache, aiBuilderCache, enhancerCache, generalCache } from './cache';
import { logger, securityLogger, performanceLogger, businessLogger } from './logger';
import { securityManager } from './security';
import { aiBuilderQueue, generalQueue, emailQueue } from './queue';
import { database } from './database';
import { realtimeManager } from './realtime';
import { analytics } from './analytics';

interface SystemIntegration {
  cache: boolean;
  logging: boolean;
  security: boolean;
  queue: boolean;
  database: boolean;
  realtime: boolean;
  analytics: boolean;
}

class SystemIntegrator {
  private integration: SystemIntegration;
  private isInitialized = false;

  constructor(integration: Partial<SystemIntegration> = {}) {
    this.integration = {
      cache: true,
      logging: true,
      security: true,
      queue: true,
      database: true,
      realtime: true,
      analytics: true,
      ...integration
    };
  }

  /**
   * Initialise tous les systèmes
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    logger.info('Initializing system integration...');

    try {
      // Initialiser le cache
      if (this.integration.cache) {
        await this.initializeCache();
      }

      // Initialiser le logging
      if (this.integration.logging) {
        await this.initializeLogging();
      }

      // Initialiser la sécurité
      if (this.integration.security) {
        await this.initializeSecurity();
      }

      // Initialiser les queues
      if (this.integration.queue) {
        await this.initializeQueues();
      }

      // Initialiser la base de données
      if (this.integration.database) {
        await this.initializeDatabase();
      }

      // Initialiser le temps réel
      if (this.integration.realtime) {
        await this.initializeRealtime();
      }

      // Initialiser les analytics
      if (this.integration.analytics) {
        await this.initializeAnalytics();
      }

      this.isInitialized = true;
      logger.info('System integration completed successfully');

    } catch (error) {
      logger.error('System integration failed', error as Error);
      throw error;
    }
  }

  /**
   * Obtient le statut de tous les systèmes
   */
  getSystemStatus() {
    return {
      initialized: this.isInitialized,
      cache: this.getCacheStatus(),
      logging: this.getLoggingStatus(),
      security: this.getSecurityStatus(),
      queue: this.getQueueStatus(),
      database: this.getDatabaseStatus(),
      realtime: this.getRealtimeStatus(),
      analytics: this.getAnalyticsStatus()
    };
  }

  /**
   * Obtient les métriques globales
   */
  getGlobalMetrics() {
    return {
      cache: this.getCacheMetrics(),
      logging: this.getLoggingMetrics(),
      security: this.getSecurityMetrics(),
      queue: this.getQueueMetrics(),
      database: this.getDatabaseMetrics(),
      realtime: this.getRealtimeMetrics(),
      analytics: this.getAnalyticsMetrics()
    };
  }

  /**
   * Initialise le cache
   */
  private async initializeCache(): Promise<void> {
    logger.info('Initializing cache systems...');
    
    // Vérifier que les caches sont opérationnels
    const cacheTests = [
      { name: 'Chat Cache', cache: chatCache },
      { name: 'AI Builder Cache', cache: aiBuilderCache },
      { name: 'Enhancer Cache', cache: enhancerCache },
      { name: 'General Cache', cache: generalCache }
    ];

    for (const test of cacheTests) {
      try {
        test.cache.set('test', 'value', 1000);
        const result = test.cache.get('test');
        if (result !== 'value') {
          throw new Error(`Cache test failed for ${test.name}`);
        }
        test.cache.delete('test');
        logger.info(`${test.name} initialized successfully`);
      } catch (error) {
        logger.error(`Failed to initialize ${test.name}`, error as Error);
        throw error;
      }
    }
  }

  /**
   * Initialise le logging
   */
  private async initializeLogging(): Promise<void> {
    logger.info('Initializing logging systems...');
    
    // Test des différents loggers
    const loggers = [
      { name: 'Main Logger', logger: logger },
      { name: 'Security Logger', logger: securityLogger },
      { name: 'Performance Logger', logger: performanceLogger },
      { name: 'Business Logger', logger: businessLogger }
    ];

    for (const test of loggers) {
      try {
        test.logger.info('Logger test message');
        logger.info(`${test.name} initialized successfully`);
      } catch (error) {
        logger.error(`Failed to initialize ${test.name}`, error as Error);
        throw error;
      }
    }
  }

  /**
   * Initialise la sécurité
   */
  private async initializeSecurity(): Promise<void> {
    logger.info('Initializing security systems...');
    
    try {
      // Test de validation de requête
      const testRequest = new Request('https://example.com', {
        method: 'GET',
        headers: {
          'user-agent': 'test-agent',
          'content-length': '0'
        }
      });

      const validation = securityManager.validateRequest(testRequest);
      if (!validation.valid) {
        throw new Error('Security validation test failed');
      }

      logger.info('Security systems initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize security systems', error as Error);
      throw error;
    }
  }

  /**
   * Initialise les queues
   */
  private async initializeQueues(): Promise<void> {
    logger.info('Initializing queue systems...');
    
    try {
      // Test des queues
      const queues = [
        { name: 'AI Builder Queue', queue: aiBuilderQueue },
        { name: 'General Queue', queue: generalQueue },
        { name: 'Email Queue', queue: emailQueue }
      ];

      for (const test of queues) {
        const stats = test.queue.getStats();
        if (stats.totalJobs < 0) {
          throw new Error(`Queue test failed for ${test.name}`);
        }
        logger.info(`${test.name} initialized successfully`);
      }
    } catch (error) {
      logger.error('Failed to initialize queue systems', error as Error);
      throw error;
    }
  }

  /**
   * Initialise la base de données
   */
  private async initializeDatabase(): Promise<void> {
    logger.info('Initializing database systems...');
    
    try {
      // Test de connexion à la base de données
      const testResult = await database.executeQuery('SELECT 1 as test');
      if (!testResult) {
        throw new Error('Database connection test failed');
      }

      logger.info('Database systems initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize database systems', error as Error);
      throw error;
    }
  }

  /**
   * Initialise le temps réel
   */
  private async initializeRealtime(): Promise<void> {
    logger.info('Initializing realtime systems...');
    
    try {
      // Test du gestionnaire temps réel
      const stats = realtimeManager.getStats();
      if (stats.activeConnections < 0) {
        throw new Error('Realtime system test failed');
      }

      logger.info('Realtime systems initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize realtime systems', error as Error);
      throw error;
    }
  }

  /**
   * Initialise les analytics
   */
  private async initializeAnalytics(): Promise<void> {
    logger.info('Initializing analytics systems...');
    
    try {
      // Test des analytics
      analytics.track('system_init', { timestamp: Date.now() });
      const metrics = analytics.getBusinessMetrics();
      if (metrics.totalEvents < 0) {
        throw new Error('Analytics system test failed');
      }

      logger.info('Analytics systems initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize analytics systems', error as Error);
      throw error;
    }
  }

  /**
   * Obtient le statut du cache
   */
  private getCacheStatus() {
    return {
      chat: chatCache.getStats(),
      aiBuilder: aiBuilderCache.getStats(),
      enhancer: enhancerCache.getStats(),
      general: generalCache.getStats()
    };
  }

  /**
   * Obtient le statut du logging
   */
  private getLoggingStatus() {
    return {
      main: logger.getStats(),
      security: securityLogger.getStats(),
      performance: performanceLogger.getStats(),
      business: businessLogger.getStats()
    };
  }

  /**
   * Obtient le statut de la sécurité
   */
  private getSecurityStatus() {
    return securityManager.getSecurityStats();
  }

  /**
   * Obtient le statut des queues
   */
  private getQueueStatus() {
    return {
      aiBuilder: aiBuilderQueue.getStats(),
      general: generalQueue.getStats(),
      email: emailQueue.getStats()
    };
  }

  /**
   * Obtient le statut de la base de données
   */
  private getDatabaseStatus() {
    return database.getStats();
  }

  /**
   * Obtient le statut du temps réel
   */
  private getRealtimeStatus() {
    return realtimeManager.getStats();
  }

  /**
   * Obtient le statut des analytics
   */
  private getAnalyticsStatus() {
    return analytics.getBusinessMetrics();
  }

  /**
   * Obtient les métriques du cache
   */
  private getCacheMetrics() {
    const caches = [chatCache, aiBuilderCache, enhancerCache, generalCache];
    const totalHits = caches.reduce((sum, cache) => sum + cache.getStats().hits, 0);
    const totalMisses = caches.reduce((sum, cache) => sum + cache.getStats().misses, 0);
    const totalRequests = totalHits + totalMisses;
    const hitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;

    return {
      totalHits,
      totalMisses,
      hitRate: Math.round(hitRate * 100) / 100,
      totalSize: caches.reduce((sum, cache) => sum + cache.size(), 0)
    };
  }

  /**
   * Obtient les métriques du logging
   */
  private getLoggingMetrics() {
    const loggers = [logger, securityLogger, performanceLogger, businessLogger];
    const totalLogs = loggers.reduce((sum, logger) => sum + logger.getStats().totalLogs, 0);
    const totalErrors = loggers.reduce((sum, logger) => sum + logger.getStats().errors, 0);
    const errorRate = totalLogs > 0 ? (totalErrors / totalLogs) * 100 : 0;

    return {
      totalLogs,
      totalErrors,
      errorRate: Math.round(errorRate * 100) / 100
    };
  }

  /**
   * Obtient les métriques de sécurité
   */
  private getSecurityMetrics() {
    return securityManager.getSecurityStats();
  }

  /**
   * Obtient les métriques des queues
   */
  private getQueueMetrics() {
    const queues = [aiBuilderQueue, generalQueue, emailQueue];
    const totalJobs = queues.reduce((sum, queue) => sum + queue.getStats().totalJobs, 0);
    const completedJobs = queues.reduce((sum, queue) => sum + queue.getStats().completedJobs, 0);
    const failedJobs = queues.reduce((sum, queue) => sum + queue.getStats().failedJobs, 0);
    const successRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

    return {
      totalJobs,
      completedJobs,
      failedJobs,
      successRate: Math.round(successRate * 100) / 100
    };
  }

  /**
   * Obtient les métriques de la base de données
   */
  private getDatabaseMetrics() {
    return database.getStats();
  }

  /**
   * Obtient les métriques du temps réel
   */
  private getRealtimeMetrics() {
    return realtimeManager.getStats();
  }

  /**
   * Obtient les métriques des analytics
   */
  private getAnalyticsMetrics() {
    return analytics.getBusinessMetrics();
  }
}

// Instance globale
export const systemIntegrator = new SystemIntegrator();

/**
 * Middleware d'intégration pour les requêtes
 */
export function createIntegrationMiddleware() {
  return {
    before: async (request: Request) => {
      // Initialiser les systèmes si nécessaire
      if (!systemIntegrator.getSystemStatus().initialized) {
        await systemIntegrator.initialize();
      }

      // Validation de sécurité
      const securityValidation = securityManager.validateRequest(request);
      if (!securityValidation.valid) {
        throw new Error(`Security validation failed: ${securityValidation.reason}`);
      }

      // Logging de la requête
      logger.info('Request received', {
        method: request.method,
        url: request.url,
        timestamp: Date.now()
      });

      return { request };
    },

    after: async (response: Response, request: Request) => {
      // Ajouter les headers de sécurité
      const securedResponse = securityManager.addSecurityHeaders(response);

      // Logging de la réponse
      logger.info('Response sent', {
        status: response.status,
        timestamp: Date.now()
      });

      // Analytics
      analytics.track('api_request', {
        method: request.method,
        url: request.url,
        status: response.status,
        timestamp: Date.now()
      });

      return securedResponse;
    }
  };
}
