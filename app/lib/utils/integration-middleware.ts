/**
 * 🔗 MIDDLEWARE D'INTÉGRATION GLOBALE
 * Applique tous les systèmes backend aux routes API
 */

import { cloudflareCache } from './cloudflare-cache';
import { errorHandler } from './error-handler';
import { alerting } from './alerting';
import { getRateLimiter } from './rate-limiter';
import { getMonitoring } from './monitoring';

interface MiddlewareConfig {
  enableCaching: boolean;
  enableRateLimiting: boolean;
  enableMonitoring: boolean;
  enableErrorHandling: boolean;
  enableAlerting: boolean;
  cacheTTL?: number;
  rateLimitConfig?: {
    windowMs: number;
    max: number;
  };
}

interface RequestContext {
  requestId: string;
  userId?: string;
  sessionId?: string;
  endpoint: string;
  method: string;
  timestamp: number;
  userAgent?: string;
  ip?: string;
}

class IntegrationMiddleware {
  private config: MiddlewareConfig;

  constructor(config: Partial<MiddlewareConfig> = {}) {
    this.config = {
      enableCaching: true,
      enableRateLimiting: true,
      enableMonitoring: true,
      enableErrorHandling: true,
      enableAlerting: true,
      cacheTTL: 300000, // 5 minutes
      rateLimitConfig: {
        windowMs: 60000, // 1 minute
        max: 10
      },
      ...config
    };
  }

  public async processRequest(
    request: Request,
    handler: (request: Request, context: RequestContext) => Promise<Response>
  ): Promise<Response> {
    const startTime = Date.now();
    const context = this.createRequestContext(request);
    
    try {
      // 1. Rate Limiting
      if (this.config.enableRateLimiting) {
        const rateLimitResult = await this.checkRateLimit(request, context);
        if (!rateLimitResult.allowed) {
          return this.createRateLimitResponse(rateLimitResult);
        }
      }

      // 2. Cache Check
      let response: Response;
      if (this.config.enableCaching) {
        const cachedResponse = await this.getCachedResponse(request, context);
        if (cachedResponse) {
          return cachedResponse;
        }
      }

      // 3. Execute Handler
      response = await handler(request, context);

      // 4. Cache Response
      if (this.config.enableCaching && response.ok) {
        await this.cacheResponse(request, response, context);
      }

      // 5. Monitoring
      if (this.config.enableMonitoring) {
        this.recordMetrics(response, startTime, context);
      }

      // 6. Error Handling
      if (this.config.enableErrorHandling && !response.ok) {
        this.handleResponseError(response, context);
      }

      return response;

    } catch (error) {
      // Global Error Handling
      if (this.config.enableErrorHandling) {
        const errorReport = errorHandler.handleApiError(
          error as Error,
          context.endpoint,
          context.requestId,
          context.userId
        );

        // Alerting for critical errors
        if (this.config.enableAlerting) {
          alerting.createAlert(
            'api_error',
            `API Error in ${context.endpoint}: ${(error as Error).message}`,
            'high',
            { errorId: errorReport.id, context }
          );
        }

        return this.createErrorResponse(error as Error, context);
      }

      throw error;
    }
  }

  private createRequestContext(request: Request): RequestContext {
    const url = new URL(request.url);
    return {
      requestId: `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      endpoint: url.pathname,
      method: request.method,
      timestamp: Date.now(),
      userAgent: request.headers.get('User-Agent') || undefined,
      ip: request.headers.get('CF-Connecting-IP') || undefined
    };
  }

  private async checkRateLimit(request: Request, context: RequestContext): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const rateLimiter = getRateLimiter();
    const key = this.generateRateLimitKey(request, context);
    const config = this.config.rateLimitConfig!;

    const info = rateLimiter.getInfo(key, config);
    
    if (!info.allowed) {
      // Alert for rate limiting
      if (this.config.enableAlerting) {
        alerting.createAlert(
          'rate_limit_exceeded',
          `Rate limit exceeded for ${context.endpoint}`,
          'medium',
          { key, remaining: info.remaining, resetTime: info.resetTime }
        );
      }
    }

    return {
      allowed: info.allowed,
      remaining: info.remaining,
      resetTime: info.resetTime
    };
  }

  private generateRateLimitKey(request: Request, context: RequestContext): string {
    const ip = context.ip || 'unknown';
    const userId = context.userId || 'anonymous';
    return `rate:${ip}:${userId}:${context.endpoint}`;
  }

  private createRateLimitResponse(rateLimitResult: {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }): Response {
    return new Response(JSON.stringify({
      error: 'Rate limit exceeded',
      message: 'Too many requests',
      remaining: rateLimitResult.remaining,
      resetTime: new Date(rateLimitResult.resetTime).toISOString()
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
      }
    });
  }

  private async getCachedResponse(request: Request, context: RequestContext): Promise<Response | null> {
    const cacheKey = this.generateCacheKey(request, context);
    const cachedData = cloudflareCache.get(cacheKey);
    
    if (cachedData) {
      return new Response(JSON.stringify(cachedData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
          'X-Cache-Key': cacheKey
        }
      });
    }
    
    return null;
  }

  private async cacheResponse(request: Request, response: Response, context: RequestContext): Promise<void> {
    if (response.ok && request.method === 'GET') {
      const cacheKey = this.generateCacheKey(request, context);
      const responseData = await response.clone().json();
      
      cloudflareCache.set(cacheKey, responseData, this.config.cacheTTL);
    }
  }

  private generateCacheKey(request: Request, context: RequestContext): string {
    const url = new URL(request.url);
    const params = url.searchParams.toString();
    return `cache:${context.endpoint}:${params}:${context.userId || 'anonymous'}`;
  }

  private recordMetrics(response: Response, startTime: number, context: RequestContext): void {
    const responseTime = Date.now() - startTime;
    const monitoring = getMonitoring();
    
    // Déterminer le type d'API basé sur l'endpoint
    let apiType: 'chat' | 'aiBuilder' | 'enhancer' | 'general' = 'general';
    
    if (context.endpoint.includes('/chat')) {
      apiType = 'chat';
    } else if (context.endpoint.includes('/ai-builder')) {
      apiType = 'aiBuilder';
    } else if (context.endpoint.includes('/enhancer')) {
      apiType = 'enhancer';
    }

    monitoring.recordRequest(apiType, responseTime, response.status, !response.ok);
  }

  private handleResponseError(response: Response, context: RequestContext): void {
    if (this.config.enableAlerting) {
      const severity = response.status >= 500 ? 'high' : 'medium';
      alerting.createAlert(
        'api_response_error',
        `API returned ${response.status} for ${context.endpoint}`,
        severity,
        { status: response.status, endpoint: context.endpoint }
      );
    }
  }

  private createErrorResponse(error: Error, context: RequestContext): Response {
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error.message,
      requestId: context.requestId,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': context.requestId
      }
    });
  }

  public updateConfig(config: Partial<MiddlewareConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): MiddlewareConfig {
    return { ...this.config };
  }
}

// Instance globale
let middlewareInstance: IntegrationMiddleware | null = null;

export function getIntegrationMiddleware(): IntegrationMiddleware {
  if (!middlewareInstance) {
    middlewareInstance = new IntegrationMiddleware();
  }
  return middlewareInstance;
}

export const integrationMiddleware = {
  processRequest: (request: Request, handler: (request: Request, context: RequestContext) => Promise<Response>) => 
    getIntegrationMiddleware().processRequest(request, handler),
  updateConfig: (config: Partial<MiddlewareConfig>) => 
    getIntegrationMiddleware().updateConfig(config),
  getConfig: () => getIntegrationMiddleware().getConfig()
};

// Helper pour appliquer le middleware à une route
export function withIntegrationMiddleware(
  handler: (request: Request, context: RequestContext) => Promise<Response>,
  config?: Partial<MiddlewareConfig>
) {
  const middleware = getIntegrationMiddleware();
  if (config) {
    middleware.updateConfig(config);
  }
  
  return (request: Request) => middleware.processRequest(request, handler);
}
