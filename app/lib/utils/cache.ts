/**
 * Système de cache intelligent pour l'application
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  enableStats: boolean;
}

class IntelligentCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0
  };
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      defaultTTL: 300000, // 5 minutes
      cleanupInterval: 60000, // 1 minute
      enableStats: true,
      ...config
    };

    // Ne pas démarrer le cleanup automatiquement dans Cloudflare Workers
    // this.startCleanup();
  }

  /**
   * Récupère une valeur du cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    
    // Vérifier si l'entrée a expiré
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Mettre à jour les statistiques
    entry.hits++;
    entry.lastAccessed = now;
    this.stats.hits++;
    
    return entry.data;
  }

  /**
   * Stocke une valeur dans le cache
   */
  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const entryTTL = ttl || this.config.defaultTTL;

    // Si le cache est plein, supprimer l'entrée la moins récemment utilisée
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      ttl: entryTTL,
      hits: 0,
      lastAccessed: now
    });

    this.stats.sets++;
  }

  /**
   * Supprime une entrée du cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  /**
   * Vide le cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0
    };
  }

  /**
   * Vérifie si une clé existe dans le cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Obtient les statistiques du cache
   */
  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Obtient toutes les clés du cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Obtient la taille du cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Supprime les entrées expirées
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.stats.evictions++;
    });
  }

  /**
   * Supprime l'entrée la moins récemment utilisée
   */
  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * Démarre le nettoyage automatique
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Arrête le nettoyage automatique
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Estime l'utilisation mémoire
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      totalSize += key.length * 2; // UTF-16
      totalSize += JSON.stringify(entry.data).length * 2;
      totalSize += 32; // Overhead de l'objet
    }
    
    return totalSize;
  }

  /**
   * Détruit le cache
   */
  destroy(): void {
    this.stopCleanup();
    this.clear();
  }
}

// Instances de cache spécialisées
export const chatCache = new IntelligentCache({
  maxSize: 500,
  defaultTTL: 300000, // 5 minutes
  enableStats: true
});

export const aiBuilderCache = new IntelligentCache({
  maxSize: 100,
  defaultTTL: 1800000, // 30 minutes
  enableStats: true
});

export const enhancerCache = new IntelligentCache({
  maxSize: 200,
  defaultTTL: 600000, // 10 minutes
  enableStats: true
});

export const generalCache = new IntelligentCache({
  maxSize: 1000,
  defaultTTL: 300000, // 5 minutes
  enableStats: true
});

/**
 * Cache distribué simulé (pour Cloudflare Workers)
 */
class DistributedCache {
  private caches: Map<string, IntelligentCache> = new Map();

  getCache(name: string): IntelligentCache {
    if (!this.caches.has(name)) {
      this.caches.set(name, new IntelligentCache());
    }
    return this.caches.get(name)!;
  }

  getAllStats() {
    const stats: Record<string, any> = {};
    for (const [name, cache] of this.caches.entries()) {
      stats[name] = cache.getStats();
    }
    return stats;
  }

  clearAll() {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
  }

  destroyAll() {
    for (const cache of this.caches.values()) {
      cache.destroy();
    }
    this.caches.clear();
  }
}

export const distributedCache = new DistributedCache();

/**
 * Utilitaires de cache
 */
export class CacheUtils {
  /**
   * Génère une clé de cache basée sur les paramètres
   */
  static generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `${prefix}:${Buffer.from(sortedParams).toString('base64')}`;
  }

  /**
   * Cache avec fonction de fallback
   */
  static async getOrSet<T>(
    cache: IntelligentCache<T>,
    key: string,
    fallback: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fallback();
    cache.set(key, data, ttl);
    return data;
  }

  /**
   * Invalidation par pattern
   */
  static invalidatePattern(cache: IntelligentCache, pattern: RegExp): number {
    let count = 0;
    for (const key of cache.keys()) {
      if (pattern.test(key)) {
        cache.delete(key);
        count++;
      }
    }
    return count;
  }
}
