/**
 * 🚀 CACHE OPTIMISÉ POUR CLOUDFLARE WORKERS
 * Système de cache haute performance compatible Cloudflare
 */

interface CacheEntry<T> {
  value: T;
  expiry: number;
  hits: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
  evictions: number;
}

class CloudflareCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    hitRate: 0,
    evictions: 0
  };
  private maxSize: number = 1000;
  private defaultTTL: number = 300000; // 5 minutes

  constructor(maxSize: number = 1000, defaultTTL: number = 300000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Vérifier l'expiration
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      this.updateHitRate();
      return null;
    }

    // Mettre à jour les statistiques
    entry.hits++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;
    this.updateHitRate();
    
    return entry.value as T;
  }

  public set<T>(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs || this.defaultTTL;
    const expiry = Date.now() + ttl;

    // Si le cache est plein, évincer l'entrée la moins récemment utilisée
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      expiry,
      hits: 0,
      lastAccessed: Date.now()
    });

    this.stats.size = this.cache.size;
  }

  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size = this.cache.size;
    }
    return deleted;
  }

  public clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.evictions += this.cache.size;
  }

  public has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  public getStats(): CacheStats {
    return { ...this.stats };
  }

  public getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  public getSize(): number {
    return this.cache.size;
  }

  public cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        cleaned++;
        this.stats.evictions++;
      }
    }
    
    this.stats.size = this.cache.size;
    return cleaned;
  }

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

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  public warmup<T>(entries: Array<{ key: string; value: T; ttl?: number }>): void {
    for (const entry of entries) {
      this.set(entry.key, entry.value, entry.ttl);
    }
  }

  public getTopKeys(limit: number = 10): Array<{ key: string; hits: number; lastAccessed: number }> {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, hits: entry.hits, lastAccessed: entry.lastAccessed }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit);
    
    return entries;
  }

  public invalidatePattern(pattern: RegExp): number {
    let invalidated = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        invalidated++;
        this.stats.evictions++;
      }
    }
    this.stats.size = this.cache.size;
    return invalidated;
  }
}

// Instances spécialisées
let cacheInstance: CloudflareCacheManager | null = null;

export function getCacheManager(): CloudflareCacheManager {
  if (!cacheInstance) {
    cacheInstance = new CloudflareCacheManager();
  }
  return cacheInstance;
}

export const cloudflareCache = {
  get: <T>(key: string) => getCacheManager().get<T>(key),
  set: <T>(key: string, value: T, ttlMs?: number) => getCacheManager().set(key, value, ttlMs),
  delete: (key: string) => getCacheManager().delete(key),
  clear: () => getCacheManager().clear(),
  has: (key: string) => getCacheManager().has(key),
  getStats: () => getCacheManager().getStats(),
  getKeys: () => getCacheManager().getKeys(),
  getSize: () => getCacheManager().getSize(),
  cleanup: () => getCacheManager().cleanup(),
  warmup: <T>(entries: Array<{ key: string; value: T; ttl?: number }>) => 
    getCacheManager().warmup(entries),
  getTopKeys: (limit?: number) => getCacheManager().getTopKeys(limit),
  invalidatePattern: (pattern: RegExp) => getCacheManager().invalidatePattern(pattern)
};

// Cache spécialisé pour les API
export const apiCache = {
  get: <T>(endpoint: string, params?: Record<string, any>) => {
    const key = `api:${endpoint}:${JSON.stringify(params || {})}`;
    return cloudflareCache.get<T>(key);
  },
  set: <T>(endpoint: string, params: Record<string, any> | undefined, value: T, ttlMs?: number) => {
    const key = `api:${endpoint}:${JSON.stringify(params || {})}`;
    return cloudflareCache.set(key, value, ttlMs);
  },
  invalidate: (endpoint: string) => {
    const pattern = new RegExp(`^api:${endpoint}:`);
    return cloudflareCache.invalidatePattern(pattern);
  }
};

// Cache spécialisé pour les sessions utilisateur
export const sessionCache = {
  get: <T>(sessionId: string, key: string) => {
    return cloudflareCache.get<T>(`session:${sessionId}:${key}`);
  },
  set: <T>(sessionId: string, key: string, value: T, ttlMs?: number) => {
    return cloudflareCache.set(`session:${sessionId}:${key}`, value, ttlMs);
  },
  delete: (sessionId: string, key: string) => {
    return cloudflareCache.delete(`session:${sessionId}:${key}`);
  },
  clear: (sessionId: string) => {
    const pattern = new RegExp(`^session:${sessionId}:`);
    return cloudflareCache.invalidatePattern(pattern);
  }
};
