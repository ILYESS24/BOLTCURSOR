/**
 * Système de timeout optimisé pour les APIs
 */

export class TimeoutManager {
  private static timeouts = new Map<string, NodeJS.Timeout>();

  /**
   * Crée un timeout avec gestion automatique
   */
  static createTimeout(
    key: string, 
    callback: () => void, 
    delay: number
  ): NodeJS.Timeout {
    // Annuler le timeout précédent s'il existe
    this.clearTimeout(key);
    
    const timeout = setTimeout(() => {
      callback();
      this.timeouts.delete(key);
    }, delay);
    
    this.timeouts.set(key, timeout);
    return timeout;
  }

  /**
   * Annule un timeout
   */
  static clearTimeout(key: string): void {
    const timeout = this.timeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(key);
    }
  }

  /**
   * Annule tous les timeouts
   */
  static clearAllTimeouts(): void {
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts.clear();
  }
}

/**
 * Wrapper pour les requêtes avec timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Request timeout'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Configuration des timeouts par type d'API
 */
export const TIMEOUT_CONFIG = {
  CHAT: 15000,        // 15 secondes pour le chat
  AI_BUILDER: 30000,  // 30 secondes pour l'AI Builder
  ENHANCER: 10000,    // 10 secondes pour l'enhancer
  INTEGRATION: 20000, // 20 secondes pour les intégrations
  DEFAULT: 5000       // 5 secondes par défaut
} as const;

/**
 * Retry avec backoff exponentiel
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Backoff exponentiel
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}
