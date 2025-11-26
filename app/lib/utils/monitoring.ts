/**
 * Système de monitoring et observabilité pour les APIs
 */

interface Metrics {
  requestCount: number;
  errorCount: number;
  responseTime: number[];
  statusCodes: Record<number, number>;
  lastRequest: number;
  peakConcurrency: number;
  currentConcurrency: number;
}

interface APIMetrics {
  chat: Metrics;
  aiBuilder: Metrics;
  enhancer: Metrics;
  general: Metrics;
}

class MonitoringSystem {
  private metrics: APIMetrics = {
    chat: this.createEmptyMetrics(),
    aiBuilder: this.createEmptyMetrics(),
    enhancer: this.createEmptyMetrics(),
    general: this.createEmptyMetrics()
  };

  private createEmptyMetrics(): Metrics {
    return {
      requestCount: 0,
      errorCount: 0,
      responseTime: [],
      statusCodes: {},
      lastRequest: 0,
      peakConcurrency: 0,
      currentConcurrency: 0
    };
  }

  /**
   * Enregistre une requête
   */
  recordRequest(
    apiType: keyof APIMetrics,
    responseTime: number,
    statusCode: number,
    isError: boolean = false
  ): void {
    const metrics = this.metrics[apiType];
    
    metrics.requestCount++;
    metrics.responseTime.push(responseTime);
    metrics.statusCodes[statusCode] = (metrics.statusCodes[statusCode] || 0) + 1;
    metrics.lastRequest = Date.now();
    
    if (isError) {
      metrics.errorCount++;
    }
    
    // Garder seulement les 1000 dernières mesures de temps de réponse
    if (metrics.responseTime.length > 1000) {
      metrics.responseTime = metrics.responseTime.slice(-1000);
    }
  }

  /**
   * Met à jour la concurrence
   */
  updateConcurrency(apiType: keyof APIMetrics, current: number): void {
    const metrics = this.metrics[apiType];
    metrics.currentConcurrency = current;
    metrics.peakConcurrency = Math.max(metrics.peakConcurrency, current);
  }

  /**
   * Obtient les métriques pour une API
   */
  getMetrics(apiType: keyof APIMetrics): {
    totalRequests: number;
    errorRate: number;
    avgResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    statusCodes: Record<number, number>;
    uptime: number;
    peakConcurrency: number;
    currentConcurrency: number;
  } {
    const metrics = this.metrics[apiType];
    const sortedTimes = [...metrics.responseTime].sort((a, b) => a - b);
    
    return {
      totalRequests: metrics.requestCount,
      errorRate: metrics.requestCount > 0 ? (metrics.errorCount / metrics.requestCount) * 100 : 0,
      avgResponseTime: metrics.responseTime.length > 0 
        ? metrics.responseTime.reduce((a, b) => a + b, 0) / metrics.responseTime.length 
        : 0,
      p95ResponseTime: sortedTimes.length > 0 
        ? sortedTimes[Math.floor(sortedTimes.length * 0.95)] 
        : 0,
      p99ResponseTime: sortedTimes.length > 0 
        ? sortedTimes[Math.floor(sortedTimes.length * 0.99)] 
        : 0,
      statusCodes: { ...metrics.statusCodes },
      uptime: metrics.lastRequest > 0 ? Date.now() - metrics.lastRequest : 0,
      peakConcurrency: metrics.peakConcurrency,
      currentConcurrency: metrics.currentConcurrency
    };
  }

  /**
   * Obtient toutes les métriques
   */
  getAllMetrics(): APIMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset les métriques
   */
  resetMetrics(apiType?: keyof APIMetrics): void {
    if (apiType) {
      this.metrics[apiType] = this.createEmptyMetrics();
    } else {
      this.metrics = {
        chat: this.createEmptyMetrics(),
        aiBuilder: this.createEmptyMetrics(),
        enhancer: this.createEmptyMetrics(),
        general: this.createEmptyMetrics()
      };
    }
  }

  /**
   * Génère un rapport de santé
   */
  getHealthReport(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Vérifier chaque API
    for (const [apiType, metrics] of Object.entries(this.metrics) as [keyof APIMetrics, Metrics][]) {
      const errorRate = metrics.requestCount > 0 ? (metrics.errorCount / metrics.requestCount) * 100 : 0;
      const avgResponseTime = metrics.responseTime.length > 0 
        ? metrics.responseTime.reduce((a, b) => a + b, 0) / metrics.responseTime.length 
        : 0;
      
      if (errorRate > 20) {
        issues.push(`${apiType}: High error rate (${errorRate.toFixed(2)}%)`);
        recommendations.push(`Investigate ${apiType} API errors`);
      }
      
      if (avgResponseTime > 2000) {
        issues.push(`${apiType}: Slow response time (${avgResponseTime.toFixed(2)}ms)`);
        recommendations.push(`Optimize ${apiType} API performance`);
      }
      
      if (metrics.peakConcurrency > 50) {
        issues.push(`${apiType}: High concurrency (${metrics.peakConcurrency})`);
        recommendations.push(`Consider scaling ${apiType} API`);
      }
    }
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (issues.length > 3) {
      status = 'unhealthy';
    } else if (issues.length > 0) {
      status = 'degraded';
    }
    
    return {
      status,
      issues,
      recommendations
    };
  }
}

// Instance globale - initialisation lazy
let monitoringInstance: MonitoringSystem | null = null;

export function getMonitoring(): MonitoringSystem {
  if (!monitoringInstance) {
    monitoringInstance = new MonitoringSystem();
  }
  return monitoringInstance;
}

export const monitoring = {
  recordRequest: (apiType: keyof APIMetrics, responseTime: number, statusCode: number, isError: boolean = false) => 
    getMonitoring().recordRequest(apiType, responseTime, statusCode, isError),
  updateConcurrency: (apiType: keyof APIMetrics, current: number) => 
    getMonitoring().updateConcurrency(apiType, current),
  getMetrics: (apiType: keyof APIMetrics) => getMonitoring().getMetrics(apiType),
  getAllMetrics: () => getMonitoring().getAllMetrics(),
  resetMetrics: (apiType?: keyof APIMetrics) => getMonitoring().resetMetrics(apiType),
  getHealthReport: () => getMonitoring().getHealthReport()
};

/**
 * Middleware de monitoring pour les APIs
 */
export function createMonitoringMiddleware(apiType: keyof APIMetrics) {
  return {
    start: () => {
      const startTime = Date.now();
      monitoring.updateConcurrency(apiType, monitoring.metrics[apiType].currentConcurrency + 1);
      return startTime;
    },
    
    end: (startTime: number, statusCode: number) => {
      const responseTime = Date.now() - startTime;
      const isError = statusCode >= 400;
      
      monitoring.recordRequest(apiType, responseTime, statusCode, isError);
      monitoring.updateConcurrency(apiType, monitoring.metrics[apiType].currentConcurrency - 1);
    }
  };
}

/**
 * Endpoint de santé pour le monitoring
 */
export function createHealthEndpoint() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    metrics: monitoring.getAllMetrics(),
    health: monitoring.getHealthReport()
  };
}
