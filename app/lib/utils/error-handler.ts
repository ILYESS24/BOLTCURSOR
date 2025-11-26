/**
 * 🛡️ GESTION D'ERREURS GLOBALE AVANCÉE
 * Système de gestion d'erreurs robuste pour production
 */

interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  endpoint?: string;
  timestamp: number;
  userAgent?: string;
  ip?: string;
}

interface ErrorReport {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  context: ErrorContext;
  resolved: boolean;
  resolvedAt?: number;
  resolvedBy?: string;
}

class GlobalErrorHandler {
  private errors: ErrorReport[] = [];
  private maxErrors: number = 1000;
  private errorPatterns: Map<string, { count: number; lastSeen: number }> = new Map();

  public handleError(
    error: Error,
    context: Partial<ErrorContext> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): ErrorReport {
    const errorReport: ErrorReport = {
      id: `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: error.constructor.name,
      severity,
      message: error.message,
      stack: error.stack,
      context: {
        timestamp: Date.now(),
        ...context
      },
      resolved: false
    };

    this.errors.push(errorReport);
    this.trackErrorPattern(error);

    // Limiter le nombre d'erreurs stockées
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log de l'erreur
    this.logError(errorReport);

    return errorReport;
  }

  public handleAsyncError(
    error: unknown,
    context: Partial<ErrorContext> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): ErrorReport {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    return this.handleError(errorObj, context, severity);
  }

  public handleApiError(
    error: Error,
    endpoint: string,
    requestId: string,
    userId?: string
  ): ErrorReport {
    return this.handleError(error, {
      endpoint,
      requestId,
      userId,
      timestamp: Date.now()
    }, 'high');
  }

  public handleDatabaseError(
    error: Error,
    operation: string,
    table?: string
  ): ErrorReport {
    return this.handleError(error, {
      endpoint: `database:${operation}`,
      timestamp: Date.now()
    }, 'critical');
  }

  public handleValidationError(
    error: Error,
    field: string,
    value: any
  ): ErrorReport {
    return this.handleError(error, {
      endpoint: `validation:${field}`,
      timestamp: Date.now()
    }, 'medium');
  }

  public handleSecurityError(
    error: Error,
    threat: string,
    ip?: string
  ): ErrorReport {
    return this.handleError(error, {
      endpoint: `security:${threat}`,
      ip,
      timestamp: Date.now()
    }, 'critical');
  }

  public getErrors(
    severity?: 'low' | 'medium' | 'high' | 'critical',
    resolved?: boolean
  ): ErrorReport[] {
    let filtered = this.errors;

    if (severity) {
      filtered = filtered.filter(error => error.severity === severity);
    }

    if (resolved !== undefined) {
      filtered = filtered.filter(error => error.resolved === resolved);
    }

    return filtered.sort((a, b) => b.context.timestamp - a.context.timestamp);
  }

  public getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    resolved: number;
    unresolved: number;
    topPatterns: Array<{ pattern: string; count: number; lastSeen: number }>;
  } {
    const bySeverity = {
      low: this.getErrors('low').length,
      medium: this.getErrors('medium').length,
      high: this.getErrors('high').length,
      critical: this.getErrors('critical').length
    };

    const resolved = this.getErrors(undefined, true).length;
    const unresolved = this.getErrors(undefined, false).length;

    const topPatterns = Array.from(this.errorPatterns.entries())
      .map(([pattern, data]) => ({ pattern, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total: this.errors.length,
      bySeverity,
      resolved,
      unresolved,
      topPatterns
    };
  }

  public resolveError(errorId: string, resolvedBy: string): boolean {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      error.resolvedAt = Date.now();
      error.resolvedBy = resolvedBy;
      return true;
    }
    return false;
  }

  public getCriticalErrors(): ErrorReport[] {
    return this.getErrors('critical', false);
  }

  public hasCriticalErrors(): boolean {
    return this.getCriticalErrors().length > 0;
  }

  public clearResolvedErrors(): void {
    this.errors = this.errors.filter(error => !error.resolved);
  }

  public getErrorPatterns(): Map<string, { count: number; lastSeen: number }> {
    return new Map(this.errorPatterns);
  }

  private trackErrorPattern(error: Error): void {
    const pattern = this.extractErrorPattern(error);
    const existing = this.errorPatterns.get(pattern);
    
    if (existing) {
      existing.count++;
      existing.lastSeen = Date.now();
    } else {
      this.errorPatterns.set(pattern, {
        count: 1,
        lastSeen: Date.now()
      });
    }
  }

  private extractErrorPattern(error: Error): string {
    // Extraire un pattern significatif de l'erreur
    const message = error.message.toLowerCase();
    const stack = error.stack || '';
    
    // Patterns communs
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('connection')) return 'connection';
    if (message.includes('validation')) return 'validation';
    if (message.includes('permission')) return 'permission';
    if (message.includes('not found')) return 'not_found';
    if (message.includes('unauthorized')) return 'unauthorized';
    
    // Pattern basé sur le type d'erreur
    return error.constructor.name;
  }

  private logError(errorReport: ErrorReport): void {
    const severity = errorReport.severity.toUpperCase();
    const message = `🚨 ERREUR ${severity}: ${errorReport.message}`;
    
    console.error(message, {
      id: errorReport.id,
      type: errorReport.type,
      context: errorReport.context,
      stack: errorReport.stack
    });
  }

  public createErrorMiddleware() {
    return (error: Error, request: Request, response: Response) => {
      const errorReport = this.handleError(error, {
        endpoint: new URL(request.url).pathname,
        userAgent: request.headers.get('User-Agent') || undefined,
        timestamp: Date.now()
      });

      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        id: errorReport.id,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    };
  }
}

// Instance globale
let errorHandlerInstance: GlobalErrorHandler | null = null;

export function getErrorHandler(): GlobalErrorHandler {
  if (!errorHandlerInstance) {
    errorHandlerInstance = new GlobalErrorHandler();
  }
  return errorHandlerInstance;
}

export const errorHandler = {
  handleError: (error: Error, context?: Partial<ErrorContext>, severity?: 'low' | 'medium' | 'high' | 'critical') => 
    getErrorHandler().handleError(error, context, severity),
  handleAsyncError: (error: unknown, context?: Partial<ErrorContext>, severity?: 'low' | 'medium' | 'high' | 'critical') => 
    getErrorHandler().handleAsyncError(error, context, severity),
  handleApiError: (error: Error, endpoint: string, requestId: string, userId?: string) => 
    getErrorHandler().handleApiError(error, endpoint, requestId, userId),
  handleDatabaseError: (error: Error, operation: string, table?: string) => 
    getErrorHandler().handleDatabaseError(error, operation, table),
  handleValidationError: (error: Error, field: string, value: any) => 
    getErrorHandler().handleValidationError(error, field, value),
  handleSecurityError: (error: Error, threat: string, ip?: string) => 
    getErrorHandler().handleSecurityError(error, threat, ip),
  getErrors: (severity?: 'low' | 'medium' | 'high' | 'critical', resolved?: boolean) => 
    getErrorHandler().getErrors(severity, resolved),
  getErrorStats: () => getErrorHandler().getErrorStats(),
  resolveError: (errorId: string, resolvedBy: string) => 
    getErrorHandler().resolveError(errorId, resolvedBy),
  getCriticalErrors: () => getErrorHandler().getCriticalErrors(),
  hasCriticalErrors: () => getErrorHandler().hasCriticalErrors(),
  clearResolvedErrors: () => getErrorHandler().clearResolvedErrors(),
  getErrorPatterns: () => getErrorHandler().getErrorPatterns(),
  createErrorMiddleware: () => getErrorHandler().createErrorMiddleware()
};
