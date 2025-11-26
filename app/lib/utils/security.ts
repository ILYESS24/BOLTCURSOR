/**
 * Système de sécurité renforcé pour l'application
 */

import { securityLogger } from './logger';

interface SecurityConfig {
  maxRequestSize: number;
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  enableCSRF: boolean;
  enableXSSProtection: boolean;
  enableSQLInjectionProtection: boolean;
  enableRateLimiting: boolean;
  enableInputValidation: boolean;
  enableOutputEncoding: boolean;
  enableSecurityHeaders: boolean;
  enableAuditLogging: boolean;
}

interface SecurityEvent {
  type: 'suspicious_activity' | 'rate_limit_exceeded' | 'invalid_input' | 'security_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  timestamp: string;
  ip?: string;
  userAgent?: string;
  userId?: string;
}

class SecurityManager {
  private config: SecurityConfig;
  private suspiciousIPs = new Set<string>();
  private blockedIPs = new Set<string>();
  private securityEvents: SecurityEvent[] = [];
  private requestCounts = new Map<string, { minute: number; hour: number; lastReset: number }>();

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      maxRequestSize: 10 * 1024 * 1024, // 10MB
      maxRequestsPerMinute: 60,
      maxRequestsPerHour: 1000,
      enableCSRF: true,
      enableXSSProtection: true,
      enableSQLInjectionProtection: true,
      enableRateLimiting: true,
      enableInputValidation: true,
      enableOutputEncoding: true,
      enableSecurityHeaders: true,
      enableAuditLogging: true,
      ...config
    };
  }

  /**
   * Valide une requête entrante
   */
  validateRequest(request: Request, userId?: string): { valid: boolean; reason?: string } {
    const ip = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // Vérifier si l'IP est bloquée
    if (this.blockedIPs.has(ip)) {
      this.logSecurityEvent('security_violation', 'high', {
        reason: 'blocked_ip',
        ip,
        userAgent
      });
      return { valid: false, reason: 'IP blocked' };
    }

    // Vérifier la taille de la requête
    const contentLength = parseInt(request.headers.get('content-length') || '0');
    if (contentLength > this.config.maxRequestSize) {
      this.logSecurityEvent('security_violation', 'medium', {
        reason: 'request_too_large',
        size: contentLength,
        maxSize: this.config.maxRequestSize,
        ip,
        userAgent
      });
      return { valid: false, reason: 'Request too large' };
    }

    // Vérifier le rate limiting
    if (this.config.enableRateLimiting) {
      const rateLimitResult = this.checkRateLimit(ip);
      if (!rateLimitResult.allowed) {
        this.logSecurityEvent('rate_limit_exceeded', 'medium', {
          reason: 'rate_limit_exceeded',
          ip,
          userAgent,
          requests: rateLimitResult.requests
        });
        return { valid: false, reason: 'Rate limit exceeded' };
      }
    }

    // Vérifier les headers de sécurité
    if (this.config.enableSecurityHeaders) {
      const headerResult = this.validateSecurityHeaders(request);
      if (!headerResult.valid) {
        this.logSecurityEvent('security_violation', 'low', {
          reason: 'invalid_headers',
          ip,
          userAgent,
          details: headerResult.details
        });
      }
    }

    return { valid: true };
  }

  /**
   * Valide les données d'entrée
   */
  validateInput(data: any, schema: any): { valid: boolean; errors: string[] } {
    if (!this.config.enableInputValidation) {
      return { valid: true, errors: [] };
    }

    const errors: string[] = [];

    // Vérifier les injections SQL
    if (this.config.enableSQLInjectionProtection) {
      const sqlInjectionResult = this.detectSQLInjection(data);
      if (sqlInjectionResult.detected) {
        errors.push('Potential SQL injection detected');
        this.logSecurityEvent('security_violation', 'high', {
          reason: 'sql_injection_attempt',
          data: JSON.stringify(data),
          patterns: sqlInjectionResult.patterns
        });
      }
    }

    // Vérifier les attaques XSS
    if (this.config.enableXSSProtection) {
      const xssResult = this.detectXSS(data);
      if (xssResult.detected) {
        errors.push('Potential XSS attack detected');
        this.logSecurityEvent('security_violation', 'high', {
          reason: 'xss_attempt',
          data: JSON.stringify(data),
          patterns: xssResult.patterns
        });
      }
    }

    // Vérifier les données malformées
    const malformedResult = this.detectMalformedData(data);
    if (malformedResult.detected) {
      errors.push('Malformed data detected');
      this.logSecurityEvent('security_violation', 'medium', {
        reason: 'malformed_data',
        data: JSON.stringify(data),
        details: malformedResult.details
      });
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Encode les données de sortie pour prévenir XSS
   */
  encodeOutput(data: any): any {
    if (!this.config.enableOutputEncoding) {
      return data;
    }

    if (typeof data === 'string') {
      return this.escapeHTML(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.encodeOutput(item));
    }

    if (typeof data === 'object' && data !== null) {
      const encoded: any = {};
      for (const [key, value] of Object.entries(data)) {
        encoded[key] = this.encodeOutput(value);
      }
      return encoded;
    }

    return data;
  }

  /**
   * Ajoute les headers de sécurité
   */
  addSecurityHeaders(response: Response): Response {
    if (!this.config.enableSecurityHeaders) {
      return response;
    }

    const headers = new Headers(response.headers);
    
    // Headers de sécurité
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Content Security Policy
    headers.set('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https:; " +
      "frame-ancestors 'none';"
    );

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  /**
   * Génère un token CSRF
   */
  generateCSRFToken(): string {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    return Buffer.from(token).toString('base64');
  }

  /**
   * Valide un token CSRF
   */
  validateCSRFToken(token: string, sessionToken: string): boolean {
    if (!this.config.enableCSRF) {
      return true;
    }

    try {
      const decodedToken = Buffer.from(token, 'base64').toString();
      const decodedSession = Buffer.from(sessionToken, 'base64').toString();
      return decodedToken === decodedSession;
    } catch {
      return false;
    }
  }

  /**
   * Bloque une IP
   */
  blockIP(ip: string, reason: string): void {
    this.blockedIPs.add(ip);
    this.logSecurityEvent('security_violation', 'critical', {
      reason: 'ip_blocked',
      ip,
      blockReason: reason
    });
  }

  /**
   * Débloque une IP
   */
  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
    securityLogger.info(`IP unblocked: ${ip}`);
  }

  /**
   * Obtient les statistiques de sécurité
   */
  getSecurityStats() {
    return {
      blockedIPs: this.blockedIPs.size,
      suspiciousIPs: this.suspiciousIPs.size,
      totalEvents: this.securityEvents.length,
      eventsByType: this.getEventsByType(),
      eventsBySeverity: this.getEventsBySeverity(),
      recentEvents: this.securityEvents.slice(-10)
    };
  }

  /**
   * Obtient les événements de sécurité récents
   */
  getRecentSecurityEvents(limit: number = 50): SecurityEvent[] {
    return this.securityEvents
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Vérifie le rate limiting
   */
  private checkRateLimit(ip: string): { allowed: boolean; requests: number } {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const hour = Math.floor(now / 3600000);

    const counts = this.requestCounts.get(ip) || { minute: 0, hour: 0, lastReset: now };

    // Reset si nouvelle minute/heure
    if (minute !== Math.floor(counts.lastReset / 60000)) {
      counts.minute = 0;
    }
    if (hour !== Math.floor(counts.lastReset / 3600000)) {
      counts.hour = 0;
    }

    counts.minute++;
    counts.hour++;
    counts.lastReset = now;

    this.requestCounts.set(ip, counts);

    const allowed = counts.minute <= this.config.maxRequestsPerMinute && 
                   counts.hour <= this.config.maxRequestsPerHour;

    return { allowed, requests: counts.minute };
  }

  /**
   * Valide les headers de sécurité
   */
  private validateSecurityHeaders(request: Request): { valid: boolean; details: string[] } {
    const details: string[] = [];
    const userAgent = request.headers.get('user-agent') || '';

    // Vérifier les user agents suspects
    const suspiciousPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /python/i, /java/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
      details.push('Suspicious user agent');
    }

    // Vérifier les headers manquants
    if (!request.headers.get('accept')) {
      details.push('Missing Accept header');
    }

    if (!request.headers.get('accept-language')) {
      details.push('Missing Accept-Language header');
    }

    return { valid: details.length === 0, details };
  }

  /**
   * Détecte les injections SQL
   */
  private detectSQLInjection(data: any): { detected: boolean; patterns: string[] } {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\b(OR|AND)\s+['"]\s*=\s*['"])/i,
      /(\b(OR|AND)\s+1\s*=\s*1)/i,
      /(\b(OR|AND)\s+true)/i,
      /(\b(OR|AND)\s+false)/i,
      /(\b(OR|AND)\s+null)/i,
      /(\b(OR|AND)\s+not\s+null)/i,
      /(\b(OR|AND)\s+exists\s*\()/i,
      /(\b(OR|AND)\s+not\s+exists\s*\()/i
    ];

    const patterns: string[] = [];
    const dataString = JSON.stringify(data);

    for (const pattern of sqlPatterns) {
      if (pattern.test(dataString)) {
        patterns.push(pattern.source);
      }
    }

    return { detected: patterns.length > 0, patterns };
  }

  /**
   * Détecte les attaques XSS
   */
  private detectXSS(data: any): { detected: boolean; patterns: string[] } {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
      /<link[^>]*>.*?<\/link>/gi,
      /<meta[^>]*>.*?<\/meta>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
      /onmouseover\s*=/gi,
      /onfocus\s*=/gi,
      /onblur\s*=/gi,
      /onchange\s*=/gi,
      /onsubmit\s*=/gi,
      /onreset\s*=/gi,
      /onselect\s*=/gi,
      /onkeydown\s*=/gi,
      /onkeyup\s*=/gi,
      /onkeypress\s*=/gi
    ];

    const patterns: string[] = [];
    const dataString = JSON.stringify(data);

    for (const pattern of xssPatterns) {
      if (pattern.test(dataString)) {
        patterns.push(pattern.source);
      }
    }

    return { detected: patterns.length > 0, patterns };
  }

  /**
   * Détecte les données malformées
   */
  private detectMalformedData(data: any): { detected: boolean; details: string[] } {
    const details: string[] = [];

    try {
      JSON.stringify(data);
    } catch (error) {
      details.push('Circular reference detected');
    }

    if (typeof data === 'string' && data.length > 10000) {
      details.push('String too long');
    }

    if (Array.isArray(data) && data.length > 1000) {
      details.push('Array too large');
    }

    return { detected: details.length > 0, details };
  }

  /**
   * Échappe le HTML
   */
  private escapeHTML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Obtient l'IP du client
   */
  private getClientIP(request: Request): string {
    return request.headers.get('x-forwarded-for') || 
           request.headers.get('x-real-ip') || 
           request.headers.get('cf-connecting-ip') ||
           'unknown';
  }

  /**
   * Enregistre un événement de sécurité
   */
  private logSecurityEvent(
    type: SecurityEvent['type'],
    severity: SecurityEvent['severity'],
    details: Record<string, any>
  ): void {
    const event: SecurityEvent = {
      type,
      severity,
      details,
      timestamp: new Date().toISOString()
    };

    this.securityEvents.push(event);

    // Garder seulement les 1000 derniers événements
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000);
    }

    securityLogger.security(`${type} detected`, severity, details);
  }

  /**
   * Obtient les événements par type
   */
  private getEventsByType(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const event of this.securityEvents) {
      counts[event.type] = (counts[event.type] || 0) + 1;
    }
    return counts;
  }

  /**
   * Obtient les événements par sévérité
   */
  private getEventsBySeverity(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const event of this.securityEvents) {
      counts[event.severity] = (counts[event.severity] || 0) + 1;
    }
    return counts;
  }
}

// Instance globale
export const securityManager = new SecurityManager();

/**
 * Middleware de sécurité pour les requêtes
 */
export function createSecurityMiddleware() {
  return {
    validate: (request: Request, userId?: string) => {
      return securityManager.validateRequest(request, userId);
    },
    
    validateInput: (data: any, schema: any) => {
      return securityManager.validateInput(data, schema);
    },
    
    encodeOutput: (data: any) => {
      return securityManager.encodeOutput(data);
    },
    
    addHeaders: (response: Response) => {
      return securityManager.addSecurityHeaders(response);
    }
  };
}
