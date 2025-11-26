/**
 * Système analytics avancé
 */

import { logger } from './logger';

interface AnalyticsEvent {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  metadata: Record<string, any>;
}

interface AnalyticsConfig {
  enableTracking: boolean;
  enableRealTime: boolean;
  enablePredictive: boolean;
  enableABTesting: boolean;
  enableHeatmaps: boolean;
  enableSessionRecording: boolean;
  enablePerformanceTracking: boolean;
  enableBusinessMetrics: boolean;
}

class AdvancedAnalytics {
  private config: AnalyticsConfig;
  private events: AnalyticsEvent[] = [];
  private sessions = new Map<string, any>();
  private users = new Map<string, any>();
  private metrics = {
    totalEvents: 0,
    uniqueUsers: 0,
    totalSessions: 0,
    averageSessionDuration: 0,
    bounceRate: 0,
    conversionRate: 0,
    revenue: 0
  };

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enableTracking: true,
      enableRealTime: true,
      enablePredictive: true,
      enableABTesting: true,
      enableHeatmaps: true,
      enableSessionRecording: true,
      enablePerformanceTracking: true,
      enableBusinessMetrics: true,
      ...config
    };
  }

  /**
   * Enregistre un événement
   */
  track(eventType: string, data: any, userId?: string, sessionId?: string): void {
    if (!this.config.enableTracking) return;

    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      type: eventType,
      data,
      timestamp: Date.now(),
      userId,
      sessionId,
      metadata: {}
    };

    this.events.push(event);
    this.metrics.totalEvents++;

    // Mettre à jour les métriques utilisateur
    if (userId) {
      this.updateUserMetrics(userId, event);
    }

    // Mettre à jour les métriques de session
    if (sessionId) {
      this.updateSessionMetrics(sessionId, event);
    }

    logger.business(`Analytics event tracked`, userId, {
      eventType,
      data: JSON.stringify(data),
      sessionId
    });
  }

  /**
   * Enregistre un événement de page
   */
  trackPageView(page: string, userId?: string, sessionId?: string): void {
    this.track('page_view', {
      page,
      referrer: document?.referrer || 'direct',
      timestamp: Date.now()
    }, userId, sessionId);
  }

  /**
   * Enregistre un événement de clic
   */
  trackClick(element: string, page: string, userId?: string, sessionId?: string): void {
    this.track('click', {
      element,
      page,
      coordinates: { x: 0, y: 0 }, // Simulé
      timestamp: Date.now()
    }, userId, sessionId);
  }

  /**
   * Enregistre un événement de conversion
   */
  trackConversion(conversionType: string, value: number, userId?: string, sessionId?: string): void {
    this.track('conversion', {
      type: conversionType,
      value,
      timestamp: Date.now()
    }, userId, sessionId);

    this.metrics.revenue += value;
  }

  /**
   * Enregistre un événement de performance
   */
  trackPerformance(metrics: {
    loadTime: number;
    renderTime: number;
    memoryUsage: number;
    networkLatency: number;
  }, userId?: string, sessionId?: string): void {
    if (!this.config.enablePerformanceTracking) return;

    this.track('performance', {
      ...metrics,
      timestamp: Date.now()
    }, userId, sessionId);
  }

  /**
   * Enregistre un événement d'erreur
   */
  trackError(error: Error, context: string, userId?: string, sessionId?: string): void {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now()
    }, userId, sessionId);
  }

  /**
   * Obtient les métriques business
   */
  getBusinessMetrics() {
    return {
      ...this.metrics,
      eventsByType: this.getEventsByType(),
      topPages: this.getTopPages(),
      userRetention: this.calculateUserRetention(),
      conversionFunnel: this.calculateConversionFunnel()
    };
  }

  /**
   * Obtient les métriques en temps réel
   */
  getRealTimeMetrics() {
    const now = Date.now();
    const lastHour = now - 3600000;
    const lastMinute = now - 60000;

    return {
      activeUsers: this.getActiveUsers(lastMinute),
      eventsLastHour: this.getEventsInTimeRange(lastHour, now),
      eventsLastMinute: this.getEventsInTimeRange(lastMinute, now),
      topEvents: this.getTopEvents(lastHour),
      averageResponseTime: this.calculateAverageResponseTime(lastHour)
    };
  }

  /**
   * Obtient les insights prédictifs
   */
  getPredictiveInsights() {
    if (!this.config.enablePredictive) return null;

    return {
      churnRisk: this.calculateChurnRisk(),
      nextBestAction: this.calculateNextBestAction(),
      revenueForecast: this.calculateRevenueForecast(),
      userSegmentation: this.calculateUserSegmentation()
    };
  }

  /**
   * Obtient les résultats A/B Testing
   */
  getABTestResults(testId: string) {
    if (!this.config.enableABTesting) return null;

    const testEvents = this.events.filter(e => 
      e.type === 'ab_test' && e.data.testId === testId
    );

    return {
      testId,
      variants: this.calculateABTestVariants(testEvents),
      statisticalSignificance: this.calculateStatisticalSignificance(testEvents),
      winner: this.calculateABTestWinner(testEvents)
    };
  }

  /**
   * Obtient les métriques de performance
   */
  getPerformanceMetrics() {
    const performanceEvents = this.events.filter(e => e.type === 'performance');
    
    return {
      averageLoadTime: this.calculateAverageMetric(performanceEvents, 'loadTime'),
      averageRenderTime: this.calculateAverageMetric(performanceEvents, 'renderTime'),
      averageMemoryUsage: this.calculateAverageMetric(performanceEvents, 'memoryUsage'),
      averageNetworkLatency: this.calculateAverageMetric(performanceEvents, 'networkLatency'),
      performanceScore: this.calculatePerformanceScore(performanceEvents)
    };
  }

  /**
   * Obtient les métriques de session
   */
  getSessionMetrics() {
    return {
      totalSessions: this.sessions.size,
      averageSessionDuration: this.metrics.averageSessionDuration,
      bounceRate: this.metrics.bounceRate,
      pagesPerSession: this.calculatePagesPerSession(),
      sessionDurationDistribution: this.calculateSessionDurationDistribution()
    };
  }

  /**
   * Obtient les métriques utilisateur
   */
  getUserMetrics() {
    return {
      totalUsers: this.users.size,
      newUsers: this.calculateNewUsers(),
      returningUsers: this.calculateReturningUsers(),
      userRetention: this.calculateUserRetention(),
      userLifetimeValue: this.calculateUserLifetimeValue()
    };
  }

  /**
   * Met à jour les métriques utilisateur
   */
  private updateUserMetrics(userId: string, event: AnalyticsEvent): void {
    if (!this.users.has(userId)) {
      this.users.set(userId, {
        firstSeen: event.timestamp,
        lastSeen: event.timestamp,
        totalEvents: 0,
        totalSessions: 0,
        totalRevenue: 0
      });
      this.metrics.uniqueUsers++;
    }

    const user = this.users.get(userId);
    user.lastSeen = event.timestamp;
    user.totalEvents++;

    if (event.type === 'conversion') {
      user.totalRevenue += event.data.value || 0;
    }
  }

  /**
   * Met à jour les métriques de session
   */
  private updateSessionMetrics(sessionId: string, event: AnalyticsEvent): void {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        startTime: event.timestamp,
        endTime: event.timestamp,
        totalEvents: 0,
        userId: event.userId,
        pages: new Set()
      });
      this.metrics.totalSessions++;
    }

    const session = this.sessions.get(sessionId);
    session.endTime = event.timestamp;
    session.totalEvents++;

    if (event.type === 'page_view') {
      session.pages.add(event.data.page);
    }
  }

  /**
   * Obtient les événements par type
   */
  private getEventsByType(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const event of this.events) {
      counts[event.type] = (counts[event.type] || 0) + 1;
    }
    return counts;
  }

  /**
   * Obtient les pages les plus visitées
   */
  private getTopPages(): Array<{ page: string; views: number }> {
    const pageViews = this.events.filter(e => e.type === 'page_view');
    const pageCounts: Record<string, number> = {};

    for (const event of pageViews) {
      const page = event.data.page;
      pageCounts[page] = (pageCounts[page] || 0) + 1;
    }

    return Object.entries(pageCounts)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }

  /**
   * Calcule la rétention utilisateur
   */
  private calculateUserRetention(): number {
    // Simulation de calcul de rétention
    return 0.75; // 75% de rétention
  }

  /**
   * Calcule le funnel de conversion
   */
  private calculateConversionFunnel(): Array<{ step: string; users: number; rate: number }> {
    const funnel = [
      { step: 'visitors', users: this.metrics.totalEvents },
      { step: 'signups', users: Math.floor(this.metrics.totalEvents * 0.1) },
      { step: 'activations', users: Math.floor(this.metrics.totalEvents * 0.05) },
      { step: 'conversions', users: Math.floor(this.metrics.totalEvents * 0.02) }
    ];

    return funnel.map((step, index) => ({
      ...step,
      rate: index === 0 ? 1 : step.users / funnel[0].users
    }));
  }

  /**
   * Obtient les utilisateurs actifs
   */
  private getActiveUsers(timeWindow: number): number {
    const now = Date.now();
    const activeUsers = new Set<string>();

    for (const event of this.events) {
      if (event.timestamp >= now - timeWindow && event.userId) {
        activeUsers.add(event.userId);
      }
    }

    return activeUsers.size;
  }

  /**
   * Obtient les événements dans une plage de temps
   */
  private getEventsInTimeRange(start: number, end: number): number {
    return this.events.filter(e => e.timestamp >= start && e.timestamp <= end).length;
  }

  /**
   * Obtient les événements les plus fréquents
   */
  private getTopEvents(timeWindow: number): Array<{ type: string; count: number }> {
    const now = Date.now();
    const recentEvents = this.events.filter(e => e.timestamp >= now - timeWindow);
    const eventCounts: Record<string, number> = {};

    for (const event of recentEvents) {
      eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
    }

    return Object.entries(eventCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Calcule le temps de réponse moyen
   */
  private calculateAverageResponseTime(timeWindow: number): number {
    const now = Date.now();
    const performanceEvents = this.events.filter(e => 
      e.type === 'performance' && e.timestamp >= now - timeWindow
    );

    if (performanceEvents.length === 0) return 0;

    const totalTime = performanceEvents.reduce((sum, event) => 
      sum + (event.data.networkLatency || 0), 0
    );

    return totalTime / performanceEvents.length;
  }

  /**
   * Calcule le risque de churn
   */
  private calculateChurnRisk(): number {
    // Simulation de calcul de risque de churn
    return 0.15; // 15% de risque
  }

  /**
   * Calcule la prochaine meilleure action
   */
  private calculateNextBestAction(): string {
    // Simulation de recommandation
    return 'Send personalized email';
  }

  /**
   * Calcule la prévision de revenus
   */
  private calculateRevenueForecast(): number {
    // Simulation de prévision
    return this.metrics.revenue * 1.2;
  }

  /**
   * Calcule la segmentation utilisateur
   */
  private calculateUserSegmentation(): Record<string, number> {
    return {
      'high_value': 0.1,
      'medium_value': 0.3,
      'low_value': 0.6
    };
  }

  /**
   * Calcule les variantes A/B
   */
  private calculateABTestVariants(events: AnalyticsEvent[]): Record<string, any> {
    // Simulation de calcul A/B
    return {
      'control': { users: 100, conversions: 10 },
      'variant_a': { users: 100, conversions: 15 }
    };
  }

  /**
   * Calcule la significativité statistique
   */
  private calculateStatisticalSignificance(events: AnalyticsEvent[]): number {
    // Simulation de calcul statistique
    return 0.95; // 95% de confiance
  }

  /**
   * Calcule le gagnant A/B
   */
  private calculateABTestWinner(events: AnalyticsEvent[]): string {
    // Simulation de calcul de gagnant
    return 'variant_a';
  }

  /**
   * Calcule une métrique moyenne
   */
  private calculateAverageMetric(events: AnalyticsEvent[], metric: string): number {
    if (events.length === 0) return 0;

    const total = events.reduce((sum, event) => sum + (event.data[metric] || 0), 0);
    return total / events.length;
  }

  /**
   * Calcule le score de performance
   */
  private calculatePerformanceScore(events: AnalyticsEvent[]): number {
    // Simulation de calcul de score
    return 85; // Score sur 100
  }

  /**
   * Calcule les pages par session
   */
  private calculatePagesPerSession(): number {
    if (this.sessions.size === 0) return 0;

    let totalPages = 0;
    for (const session of this.sessions.values()) {
      totalPages += session.pages.size;
    }

    return totalPages / this.sessions.size;
  }

  /**
   * Calcule la distribution de durée de session
   */
  private calculateSessionDurationDistribution(): Record<string, number> {
    return {
      '0-30s': 0.2,
      '30s-2m': 0.3,
      '2m-10m': 0.3,
      '10m+': 0.2
    };
  }

  /**
   * Calcule les nouveaux utilisateurs
   */
  private calculateNewUsers(): number {
    const now = Date.now();
    const last24Hours = now - 86400000;
    
    let newUsers = 0;
    for (const user of this.users.values()) {
      if (user.firstSeen >= last24Hours) {
        newUsers++;
      }
    }
    
    return newUsers;
  }

  /**
   * Calcule les utilisateurs de retour
   */
  private calculateReturningUsers(): number {
    const now = Date.now();
    const last24Hours = now - 86400000;
    
    let returningUsers = 0;
    for (const user of this.users.values()) {
      if (user.firstSeen < last24Hours && user.lastSeen >= last24Hours) {
        returningUsers++;
      }
    }
    
    return returningUsers;
  }

  /**
   * Calcule la valeur vie client
   */
  private calculateUserLifetimeValue(): number {
    if (this.users.size === 0) return 0;

    let totalRevenue = 0;
    for (const user of this.users.values()) {
      totalRevenue += user.totalRevenue;
    }

    return totalRevenue / this.users.size;
  }

  /**
   * Génère un ID unique pour un événement
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }
}

// Instance globale
export const analytics = new AdvancedAnalytics({
  enableTracking: true,
  enableRealTime: true,
  enablePredictive: true,
    enableABTesting: true,
  enablePerformanceTracking: true,
  enableBusinessMetrics: true
});
