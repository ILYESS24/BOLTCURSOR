/**
 * Système de logging avancé pour l'application
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata: Record<string, any>;
  userId?: string;
  requestId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
  memory?: NodeJS.MemoryUsage;
  stack?: string;
}

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  maxFileSize: number;
  maxFiles: number;
  enableStats: boolean;
  enablePerformance: boolean;
}

class AdvancedLogger {
  private config: LoggerConfig;
  private stats = {
    totalLogs: 0,
    logsByLevel: {} as Record<LogLevel, number>,
    errors: 0,
    warnings: 0,
    performanceLogs: 0
  };
  private performanceTimers = new Map<string, number>();

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: false,
      enableRemote: false,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      enableStats: true,
      enablePerformance: true,
      ...config
    };
  }

  /**
   * Log avec niveau et métadonnées
   */
  private log(
    level: LogLevel,
    message: string,
    metadata: Record<string, any> = {},
    error?: Error
  ): void {
    if (level < this.config.level) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata: {
        ...metadata,
        ...(this.config.enablePerformance && { memory: process.memoryUsage() })
      },
      ...(error && { stack: error.stack })
    };

    // Mettre à jour les statistiques
    this.updateStats(level);

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // File logging (simulé pour Cloudflare Workers)
    if (this.config.enableFile) {
      this.logToFile(logEntry);
    }

    // Remote logging (simulé)
    if (this.config.enableRemote) {
      this.logToRemote(logEntry);
    }
  }

  /**
   * Log de debug
   */
  debug(message: string, metadata: Record<string, any> = {}): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  /**
   * Log d'information
   */
  info(message: string, metadata: Record<string, any> = {}): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  /**
   * Log d'avertissement
   */
  warn(message: string, metadata: Record<string, any> = {}): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  /**
   * Log d'erreur
   */
  error(message: string, error?: Error, metadata: Record<string, any> = {}): void {
    this.log(LogLevel.ERROR, message, metadata, error);
  }

  /**
   * Log critique
   */
  critical(message: string, error?: Error, metadata: Record<string, any> = {}): void {
    this.log(LogLevel.CRITICAL, message, metadata, error);
  }

  /**
   * Log de performance
   */
  performance(message: string, metadata: Record<string, any> = {}): void {
    if (this.config.enablePerformance) {
      this.log(LogLevel.INFO, `[PERFORMANCE] ${message}`, {
        ...metadata,
        performance: true
      });
      this.stats.performanceLogs++;
    }
  }

  /**
   * Démarre un timer de performance
   */
  startTimer(label: string): void {
    if (this.config.enablePerformance) {
      this.performanceTimers.set(label, Date.now());
    }
  }

  /**
   * Arrête un timer de performance
   */
  endTimer(label: string, message?: string): number {
    if (!this.config.enablePerformance) return 0;
    
    const startTime = this.performanceTimers.get(label);
    if (!startTime) return 0;

    const duration = Date.now() - startTime;
    this.performanceTimers.delete(label);

    this.performance(`${message || label} completed`, {
      label,
      duration: `${duration}ms`
    });

    return duration;
  }

  /**
   * Log d'audit pour la sécurité
   */
  audit(action: string, userId?: string, metadata: Record<string, any> = {}): void {
    this.log(LogLevel.INFO, `[AUDIT] ${action}`, {
      ...metadata,
      audit: true,
      userId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log de requête HTTP
   */
  httpRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    metadata: Record<string, any> = {}
  ): void {
    this.log(LogLevel.INFO, `[HTTP] ${method} ${url}`, {
      ...metadata,
      http: true,
      method,
      url,
      statusCode,
      duration: `${duration}ms`
    });
  }

  /**
   * Log d'erreur HTTP
   */
  httpError(
    method: string,
    url: string,
    statusCode: number,
    error: Error,
    metadata: Record<string, any> = {}
  ): void {
    this.error(`[HTTP ERROR] ${method} ${url}`, error, {
      ...metadata,
      http: true,
      method,
      url,
      statusCode
    });
  }

  /**
   * Log de base de données
   */
  database(operation: string, query: string, duration: number, metadata: Record<string, any> = {}): void {
    this.log(LogLevel.INFO, `[DATABASE] ${operation}`, {
      ...metadata,
      database: true,
      operation,
      query: query.substring(0, 200), // Limiter la taille
      duration: `${duration}ms`
    });
  }

  /**
   * Log d'erreur de base de données
   */
  databaseError(operation: string, query: string, error: Error, metadata: Record<string, any> = {}): void {
    this.error(`[DATABASE ERROR] ${operation}`, error, {
      ...metadata,
      database: true,
      operation,
      query: query.substring(0, 200)
    });
  }

  /**
   * Log d'API externe
   */
  externalAPI(service: string, endpoint: string, duration: number, metadata: Record<string, any> = {}): void {
    this.log(LogLevel.INFO, `[EXTERNAL API] ${service}`, {
      ...metadata,
      externalAPI: true,
      service,
      endpoint,
      duration: `${duration}ms`
    });
  }

  /**
   * Log d'erreur d'API externe
   */
  externalAPIError(service: string, endpoint: string, error: Error, metadata: Record<string, any> = {}): void {
    this.error(`[EXTERNAL API ERROR] ${service}`, error, {
      ...metadata,
      externalAPI: true,
      service,
      endpoint
    });
  }

  /**
   * Log de cache
   */
  cache(operation: 'hit' | 'miss' | 'set' | 'delete', key: string, metadata: Record<string, any> = {}): void {
    this.log(LogLevel.DEBUG, `[CACHE] ${operation.toUpperCase()} ${key}`, {
      ...metadata,
      cache: true,
      operation,
      key
    });
  }

  /**
   * Log de sécurité
   */
  security(event: string, severity: 'low' | 'medium' | 'high' | 'critical', metadata: Record<string, any> = {}): void {
    const level = severity === 'critical' ? LogLevel.CRITICAL : 
                  severity === 'high' ? LogLevel.ERROR :
                  severity === 'medium' ? LogLevel.WARN : LogLevel.INFO;

    this.log(level, `[SECURITY] ${event}`, {
      ...metadata,
      security: true,
      severity
    });
  }

  /**
   * Log de business
   */
  business(event: string, userId?: string, metadata: Record<string, any> = {}): void {
    this.log(LogLevel.INFO, `[BUSINESS] ${event}`, {
      ...metadata,
      business: true,
      userId
    });
  }

  /**
   * Obtient les statistiques de logging
   */
  getStats() {
    return {
      ...this.stats,
      activeTimers: this.performanceTimers.size,
      config: this.config
    };
  }

  /**
   * Met à jour les statistiques
   */
  private updateStats(level: LogLevel): void {
    this.stats.totalLogs++;
    this.stats.logsByLevel[level] = (this.stats.logsByLevel[level] || 0) + 1;
    
    if (level >= LogLevel.ERROR) {
      this.stats.errors++;
    }
    if (level === LogLevel.WARN) {
      this.stats.warnings++;
    }
  }

  /**
   * Log vers la console avec formatage
   */
  private logToConsole(entry: LogEntry): void {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
    const levelName = levelNames[entry.level];
    const timestamp = entry.timestamp;
    
    const message = `[${timestamp}] ${levelName}: ${entry.message}`;
    const metadata = Object.keys(entry.metadata).length > 0 ? 
      `\nMetadata: ${JSON.stringify(entry.metadata, null, 2)}` : '';
    const stack = entry.stack ? `\nStack: ${entry.stack}` : '';

    const fullMessage = message + metadata + stack;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(fullMessage);
        break;
      case LogLevel.INFO:
        console.info(fullMessage);
        break;
      case LogLevel.WARN:
        console.warn(fullMessage);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(fullMessage);
        break;
    }
  }

  /**
   * Log vers fichier (simulé pour Cloudflare Workers)
   */
  private logToFile(entry: LogEntry): void {
    // Dans un environnement réel, on écrirait dans un fichier
    // Pour Cloudflare Workers, on simule avec console
    console.log(`[FILE] ${JSON.stringify(entry)}`);
  }

  /**
   * Log vers service distant (simulé)
   */
  private logToRemote(entry: LogEntry): void {
    // Dans un environnement réel, on enverrait vers un service comme Datadog, New Relic, etc.
    console.log(`[REMOTE] ${JSON.stringify(entry)}`);
  }
}

// Instances spécialisées
export const logger = new AdvancedLogger({
  level: LogLevel.INFO,
  enableConsole: true,
  enablePerformance: true,
  enableStats: true
});

export const securityLogger = new AdvancedLogger({
  level: LogLevel.WARN,
  enableConsole: true,
  enableStats: true
});

export const performanceLogger = new AdvancedLogger({
  level: LogLevel.DEBUG,
  enableConsole: false,
  enablePerformance: true,
  enableStats: true
});

export const businessLogger = new AdvancedLogger({
  level: LogLevel.INFO,
  enableConsole: true,
  enableStats: true
});

/**
 * Middleware de logging pour les requêtes
 */
export function createLoggingMiddleware(logger: AdvancedLogger) {
  return {
    start: (request: Request, userId?: string) => {
      const requestId = Math.random().toString(36).substring(7);
      const startTime = Date.now();
      
      logger.startTimer(`request-${requestId}`);
      
      return {
        requestId,
        startTime,
        log: (message: string, metadata: any = {}) => {
          logger.info(message, {
            ...metadata,
            requestId,
            userId
          });
        }
      };
    },
    
    end: (requestId: string, statusCode: number, duration: number) => {
      logger.endTimer(`request-${requestId}`, `Request completed with status ${statusCode}`);
      logger.httpRequest('REQUEST', 'API', statusCode, duration, { requestId });
    }
  };
}
