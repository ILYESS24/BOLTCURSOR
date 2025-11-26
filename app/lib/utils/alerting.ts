/**
 * 🚨 SYSTÈME D'ALERTES AVANCÉ
 * Monitoring en temps réel avec alertes automatiques
 */

interface AlertConfig {
  threshold: number;
  duration: number; // en millisecondes
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

interface Alert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  resolved: boolean;
  metadata?: Record<string, any>;
}

class AlertingSystem {
  private alerts: Alert[] = [];
  private configs: Map<string, AlertConfig> = new Map();
  private alertHistory: Alert[] = [];
  private maxHistorySize = 1000;

  constructor() {
    this.initializeDefaultConfigs();
  }

  private initializeDefaultConfigs(): void {
    // Configuration des alertes par défaut
    this.configs.set('high_error_rate', {
      threshold: 0.1, // 10% d'erreurs
      duration: 60000, // 1 minute
      severity: 'high',
      enabled: true
    });

    this.configs.set('slow_response', {
      threshold: 2000, // 2 secondes
      duration: 30000, // 30 secondes
      severity: 'medium',
      enabled: true
    });

    this.configs.set('high_memory_usage', {
      threshold: 0.8, // 80% de mémoire
      duration: 120000, // 2 minutes
      severity: 'critical',
      enabled: true
    });

    this.configs.set('low_success_rate', {
      threshold: 0.8, // 80% de succès
      duration: 90000, // 1.5 minutes
      severity: 'high',
      enabled: true
    });
  }

  public createAlert(
    type: string,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    metadata?: Record<string, any>
  ): Alert {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      severity,
      message,
      timestamp: Date.now(),
      resolved: false,
      metadata
    };

    this.alerts.push(alert);
    this.addToHistory(alert);

    // Log de l'alerte
    console.log(`🚨 ALERTE ${severity.toUpperCase()}: ${message}`, metadata);

    return alert;
  }

  public checkThresholds(metrics: Record<string, any>): void {
    // Vérifier le taux d'erreur
    if (metrics.errorRate && metrics.errorRate > this.configs.get('high_error_rate')!.threshold) {
      this.createAlert(
        'high_error_rate',
        `Taux d'erreur élevé: ${(metrics.errorRate * 100).toFixed(2)}%`,
        'high',
        { errorRate: metrics.errorRate }
      );
    }

    // Vérifier les temps de réponse
    if (metrics.avgResponseTime && metrics.avgResponseTime > this.configs.get('slow_response')!.threshold) {
      this.createAlert(
        'slow_response',
        `Temps de réponse lent: ${metrics.avgResponseTime}ms`,
        'medium',
        { responseTime: metrics.avgResponseTime }
      );
    }

    // Vérifier le taux de succès
    if (metrics.successRate && metrics.successRate < this.configs.get('low_success_rate')!.threshold) {
      this.createAlert(
        'low_success_rate',
        `Taux de succès faible: ${(metrics.successRate * 100).toFixed(2)}%`,
        'high',
        { successRate: metrics.successRate }
      );
    }
  }

  public resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log(`✅ Alerte résolue: ${alert.message}`);
      return true;
    }
    return false;
  }

  public getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  public getAlertsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): Alert[] {
    return this.alerts.filter(alert => alert.severity === severity && !alert.resolved);
  }

  public getAlertStats(): {
    total: number;
    active: number;
    resolved: number;
    bySeverity: Record<string, number>;
  } {
    const active = this.getActiveAlerts();
    const resolved = this.alerts.filter(alert => alert.resolved);
    
    const bySeverity = {
      low: this.getAlertsBySeverity('low').length,
      medium: this.getAlertsBySeverity('medium').length,
      high: this.getAlertsBySeverity('high').length,
      critical: this.getAlertsBySeverity('critical').length
    };

    return {
      total: this.alerts.length,
      active: active.length,
      resolved: resolved.length,
      bySeverity
    };
  }

  private addToHistory(alert: Alert): void {
    this.alertHistory.push(alert);
    
    // Limiter la taille de l'historique
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory = this.alertHistory.slice(-this.maxHistorySize);
    }
  }

  public getAlertHistory(limit: number = 100): Alert[] {
    return this.alertHistory.slice(-limit);
  }

  public updateConfig(type: string, config: Partial<AlertConfig>): void {
    const existing = this.configs.get(type);
    if (existing) {
      this.configs.set(type, { ...existing, ...config });
    }
  }

  public getConfig(type: string): AlertConfig | undefined {
    return this.configs.get(type);
  }

  public getAllConfigs(): Map<string, AlertConfig> {
    return new Map(this.configs);
  }

  public clearResolvedAlerts(): void {
    this.alerts = this.alerts.filter(alert => !alert.resolved);
  }

  public getCriticalAlerts(): Alert[] {
    return this.getAlertsBySeverity('critical');
  }

  public hasCriticalAlerts(): boolean {
    return this.getCriticalAlerts().length > 0;
  }
}

// Instance globale
let alertingInstance: AlertingSystem | null = null;

export function getAlertingSystem(): AlertingSystem {
  if (!alertingInstance) {
    alertingInstance = new AlertingSystem();
  }
  return alertingInstance;
}

export const alerting = {
  createAlert: (type: string, message: string, severity?: 'low' | 'medium' | 'high' | 'critical', metadata?: Record<string, any>) => 
    getAlertingSystem().createAlert(type, message, severity, metadata),
  checkThresholds: (metrics: Record<string, any>) => getAlertingSystem().checkThresholds(metrics),
  resolveAlert: (alertId: string) => getAlertingSystem().resolveAlert(alertId),
  getActiveAlerts: () => getAlertingSystem().getActiveAlerts(),
  getAlertsBySeverity: (severity: 'low' | 'medium' | 'high' | 'critical') => 
    getAlertingSystem().getAlertsBySeverity(severity),
  getAlertStats: () => getAlertingSystem().getAlertStats(),
  getAlertHistory: (limit?: number) => getAlertingSystem().getAlertHistory(limit),
  updateConfig: (type: string, config: Partial<AlertConfig>) => 
    getAlertingSystem().updateConfig(type, config),
  getConfig: (type: string) => getAlertingSystem().getConfig(type),
  getAllConfigs: () => getAlertingSystem().getAllConfigs(),
  clearResolvedAlerts: () => getAlertingSystem().clearResolvedAlerts(),
  getCriticalAlerts: () => getAlertingSystem().getCriticalAlerts(),
  hasCriticalAlerts: () => getAlertingSystem().hasCriticalAlerts()
};
