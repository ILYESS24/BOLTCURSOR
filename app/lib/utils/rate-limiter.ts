/**
 * Système de rate limiting pour les APIs
 */

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Nettoyage automatique toutes les 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 300000);
  }

  /**
   * Vérifie si une requête est autorisée
   */
  isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now >= entry.resetTime) {
      // Nouvelle fenêtre ou fenêtre expirée
      this.store.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }

    if (entry.count >= config.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  /**
   * Obtient les informations de rate limiting
   */
  getInfo(key: string, config: RateLimitConfig): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    total: number;
  } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now >= entry.resetTime) {
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs,
        total: config.maxRequests
      };
    }

    return {
      allowed: entry.count < config.maxRequests,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      total: config.maxRequests
    };
  }

  /**
   * Nettoie les entrées expirées
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Détruit le rate limiter
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Instance globale - initialisation lazy
let rateLimiterInstance: RateLimiter | null = null;

export function getRateLimiter(): RateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter();
  }
  return rateLimiterInstance;
}

export const rateLimiter = {
  isAllowed: (key: string, config: RateLimitConfig) => getRateLimiter().isAllowed(key, config),
  getInfo: (key: string, config: RateLimitConfig) => getRateLimiter().getInfo(key, config),
  destroy: () => {
    if (rateLimiterInstance) {
      rateLimiterInstance.destroy();
      rateLimiterInstance = null;
    }
  }
};

/**
 * Configuration par défaut pour différents types d'APIs
 */
export const RATE_LIMIT_CONFIGS = {
  CHAT: {
    windowMs: 60000,    // 1 minute
    maxRequests: 10,     // 10 requêtes par minute
    skipSuccessfulRequests: false,
    skipFailedRequests: true
  },
  AI_BUILDER: {
    windowMs: 300000,   // 5 minutes
    maxRequests: 5,     // 5 requêtes par 5 minutes
    skipSuccessfulRequests: false,
    skipFailedRequests: true
  },
  ENHANCER: {
    windowMs: 60000,    // 1 minute
    maxRequests: 15,    // 15 requêtes par minute
    skipSuccessfulRequests: false,
    skipFailedRequests: true
  },
  GENERAL: {
    windowMs: 60000,    // 1 minute
    maxRequests: 20,    // 20 requêtes par minute
    skipSuccessfulRequests: false,
    skipFailedRequests: true
  }
} as const;

/**
 * Middleware de rate limiting pour les APIs
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return (key: string) => {
    const info = rateLimiter.getInfo(key, config);
    
    if (!info.allowed) {
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((info.resetTime - Date.now()) / 1000)} seconds.`);
    }
    
    return info;
  };
}

/**
 * Génère une clé de rate limiting basée sur l'IP et l'utilisateur
 */
export function generateRateLimitKey(
  request: Request,
  userId?: string
): string {
  const ip = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown';
  
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  if (userId) {
    return `user:${userId}`;
  }
  
  return `ip:${ip}:${userAgent.slice(0, 50)}`;
}
