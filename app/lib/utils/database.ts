/**
 * Optimisation de la base de données
 */

import { logger } from './logger';

interface DatabaseConfig {
  maxConnections: number;
  connectionTimeout: number;
  queryTimeout: number;
  enableQueryLogging: boolean;
  enablePerformanceMonitoring: boolean;
  enableConnectionPooling: boolean;
  enableQueryCaching: boolean;
  cacheSize: number;
  cacheTTL: number;
}

interface QueryStats {
  totalQueries: number;
  averageExecutionTime: number;
  slowQueries: number;
  failedQueries: number;
  cacheHits: number;
  cacheMisses: number;
}

interface ConnectionInfo {
  id: string;
  createdAt: number;
  lastUsed: number;
  isActive: boolean;
  queryCount: number;
}

class DatabaseOptimizer {
  private config: DatabaseConfig;
  private queryCache = new Map<string, { result: any; timestamp: number; ttl: number }>();
  private connectionPool: ConnectionInfo[] = [];
  private queryStats: QueryStats = {
    totalQueries: 0,
    averageExecutionTime: 0,
    slowQueries: 0,
    failedQueries: 0,
    cacheHits: 0,
    cacheMisses: 0
  };
  private slowQueryThreshold = 1000; // 1 seconde

  constructor(config: Partial<DatabaseConfig> = {}) {
    this.config = {
      maxConnections: 10,
      connectionTimeout: 30000,
      queryTimeout: 10000,
      enableQueryLogging: true,
      enablePerformanceMonitoring: true,
      enableConnectionPooling: true,
      enableQueryCaching: true,
      cacheSize: 1000,
      cacheTTL: 300000, // 5 minutes
      ...config
    };
  }

  /**
   * Exécute une requête avec optimisation
   */
  async executeQuery<T = any>(
    query: string,
    params: any[] = [],
    options: {
      useCache?: boolean;
      cacheTTL?: number;
      timeout?: number;
    } = {}
  ): Promise<T> {
    const startTime = Date.now();
    const queryId = this.generateQueryId();
    
    // Vérifier le cache si activé
    if (this.config.enableQueryCaching && options.useCache !== false) {
      const cacheKey = this.generateCacheKey(query, params);
      const cached = this.queryCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        this.queryStats.cacheHits++;
        
        if (this.config.enableQueryLogging) {
          logger.database('SELECT (cached)', query, Date.now() - startTime, {
            queryId,
            cacheHit: true
          });
        }
        
        return cached.result;
      }
      
      this.queryStats.cacheMisses++;
    }

    try {
      // Obtenir une connexion du pool
      const connection = await this.getConnection();
      
      // Exécuter la requête avec timeout
      const result = await this.executeWithTimeout(
        query,
        params,
        options.timeout || this.config.queryTimeout
      );
      
      // Libérer la connexion
      this.releaseConnection(connection);
      
      const executionTime = Date.now() - startTime;
      
      // Mettre à jour les statistiques
      this.updateQueryStats(executionTime);
      
      // Enregistrer dans le cache si activé
      if (this.config.enableQueryCaching && options.useCache !== false) {
        this.cacheQuery(query, params, result, options.cacheTTL);
      }
      
      // Logging de la requête
      if (this.config.enableQueryLogging) {
        logger.database('EXECUTE', query, executionTime, {
          queryId,
          params: params.length,
          resultSize: Array.isArray(result) ? result.length : 1
        });
      }
      
      // Détecter les requêtes lentes
      if (executionTime > this.slowQueryThreshold) {
        this.queryStats.slowQueries++;
        
        if (this.config.enableQueryLogging) {
          logger.warn('Slow query detected', {
            queryId,
            query,
            executionTime,
            threshold: this.slowQueryThreshold
          });
        }
      }
      
      return result;
      
    } catch (error) {
      this.queryStats.failedQueries++;
      
      if (this.config.enableQueryLogging) {
        logger.databaseError('EXECUTE', query, error as Error, {
          queryId,
          params: params.length
        });
      }
      
      throw error;
    }
  }

  /**
   * Exécute une requête de sélection optimisée
   */
  async select<T = any>(
    table: string,
    columns: string[] = ['*'],
    where: Record<string, any> = {},
    options: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderDirection?: 'ASC' | 'DESC';
      useCache?: boolean;
      cacheTTL?: number;
    } = {}
  ): Promise<T[]> {
    const query = this.buildSelectQuery(table, columns, where, options);
    const params = this.extractParams(where);
    
    return this.executeQuery<T[]>(query, params, {
      useCache: options.useCache,
      cacheTTL: options.cacheTTL
    });
  }

  /**
   * Exécute une requête d'insertion optimisée
   */
  async insert<T = any>(
    table: string,
    data: Record<string, any>,
    options: {
      returnId?: boolean;
      ignoreDuplicates?: boolean;
    } = {}
  ): Promise<T> {
    const query = this.buildInsertQuery(table, data, options);
    const params = Object.values(data);
    
    return this.executeQuery<T>(query, params);
  }

  /**
   * Exécute une requête de mise à jour optimisée
   */
  async update(
    table: string,
    data: Record<string, any>,
    where: Record<string, any>,
    options: {
      limit?: number;
    } = {}
  ): Promise<number> {
    const query = this.buildUpdateQuery(table, data, where, options);
    const params = [...Object.values(data), ...Object.values(where)];
    
    const result = await this.executeQuery<{ affectedRows: number }>(query, params);
    return result.affectedRows;
  }

  /**
   * Exécute une requête de suppression optimisée
   */
  async delete(
    table: string,
    where: Record<string, any>,
    options: {
      limit?: number;
    } = {}
  ): Promise<number> {
    const query = this.buildDeleteQuery(table, where, options);
    const params = Object.values(where);
    
    const result = await this.executeQuery<{ affectedRows: number }>(query, params);
    return result.affectedRows;
  }

  /**
   * Exécute une transaction
   */
  async transaction<T>(
    callback: (db: DatabaseOptimizer) => Promise<T>
  ): Promise<T> {
    const connection = await this.getConnection();
    
    try {
      // Démarrer la transaction
      await this.executeWithConnection(connection, 'BEGIN');
      
      // Exécuter le callback
      const result = await callback(this);
      
      // Commiter la transaction
      await this.executeWithConnection(connection, 'COMMIT');
      
      return result;
      
    } catch (error) {
      // Rollback en cas d'erreur
      try {
        await this.executeWithConnection(connection, 'ROLLBACK');
      } catch (rollbackError) {
        logger.error('Transaction rollback failed', rollbackError as Error);
      }
      
      throw error;
      
    } finally {
      this.releaseConnection(connection);
    }
  }

  /**
   * Obtient les statistiques de la base de données
   */
  getStats(): QueryStats & {
    activeConnections: number;
    cacheSize: number;
    cacheHitRate: number;
  } {
    const totalCacheRequests = this.queryStats.cacheHits + this.queryStats.cacheMisses;
    const cacheHitRate = totalCacheRequests > 0 ? 
      (this.queryStats.cacheHits / totalCacheRequests) * 100 : 0;

    return {
      ...this.queryStats,
      activeConnections: this.connectionPool.filter(conn => conn.isActive).length,
      cacheSize: this.queryCache.size,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100
    };
  }

  /**
   * Obtient les requêtes lentes
   */
  getSlowQueries(): Array<{
    query: string;
    executionTime: number;
    timestamp: number;
  }> {
    // Dans un environnement réel, on récupérerait depuis les logs
    return [];
  }

  /**
   * Optimise les requêtes
   */
  async optimizeQueries(): Promise<{
    optimized: number;
    suggestions: string[];
  }> {
    const suggestions: string[] = [];
    let optimized = 0;

    // Analyser les requêtes lentes
    if (this.queryStats.slowQueries > 0) {
      suggestions.push('Consider adding indexes for slow queries');
      optimized++;
    }

    // Analyser le taux de cache
    const cacheHitRate = this.getStats().cacheHitRate;
    if (cacheHitRate < 50) {
      suggestions.push('Consider increasing cache TTL or cache size');
      optimized++;
    }

    // Analyser les connexions
    const activeConnections = this.connectionPool.filter(conn => conn.isActive).length;
    if (activeConnections > this.config.maxConnections * 0.8) {
      suggestions.push('Consider increasing max connections');
      optimized++;
    }

    return { optimized, suggestions };
  }

  /**
   * Vide le cache
   */
  clearCache(): void {
    this.queryCache.clear();
    logger.info('Database cache cleared');
  }

  /**
   * Obtient une connexion du pool
   */
  private async getConnection(): Promise<ConnectionInfo> {
    if (!this.config.enableConnectionPooling) {
      return {
        id: 'direct',
        createdAt: Date.now(),
        lastUsed: Date.now(),
        isActive: true,
        queryCount: 0
      };
    }

    // Chercher une connexion libre
    let connection = this.connectionPool.find(conn => !conn.isActive);
    
    if (!connection) {
      // Créer une nouvelle connexion si possible
      if (this.connectionPool.length < this.config.maxConnections) {
        connection = {
          id: `conn_${Date.now()}_${Math.random().toString(36).substring(2)}`,
          createdAt: Date.now(),
          lastUsed: Date.now(),
          isActive: true,
          queryCount: 0
        };
        this.connectionPool.push(connection);
      } else {
        throw new Error('No available connections');
      }
    }

    connection.isActive = true;
    connection.lastUsed = Date.now();
    
    return connection;
  }

  /**
   * Libère une connexion
   */
  private releaseConnection(connection: ConnectionInfo): void {
    if (this.config.enableConnectionPooling) {
      connection.isActive = false;
      connection.lastUsed = Date.now();
    }
  }

  /**
   * Exécute une requête avec timeout
   */
  private async executeWithTimeout(
    query: string,
    params: any[],
    timeout: number
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Query timeout after ${timeout}ms`));
      }, timeout);

      // Simulation d'exécution de requête
      setTimeout(() => {
        clearTimeout(timer);
        
        // Simuler un résultat basé sur le type de requête
        if (query.toUpperCase().startsWith('SELECT')) {
          resolve([{ id: 1, data: 'sample' }]);
        } else if (query.toUpperCase().startsWith('INSERT')) {
          resolve({ affectedRows: 1, insertId: Date.now() });
        } else if (query.toUpperCase().startsWith('UPDATE')) {
          resolve({ affectedRows: 1 });
        } else if (query.toUpperCase().startsWith('DELETE')) {
          resolve({ affectedRows: 1 });
        } else {
          resolve({ success: true });
        }
      }, Math.random() * 100); // Simulation de latence
    });
  }

  /**
   * Exécute une requête avec une connexion spécifique
   */
  private async executeWithConnection(
    connection: ConnectionInfo,
    query: string,
    params: any[] = []
  ): Promise<any> {
    connection.queryCount++;
    return this.executeWithTimeout(query, params, this.config.queryTimeout);
  }

  /**
   * Met à jour les statistiques de requête
   */
  private updateQueryStats(executionTime: number): void {
    this.queryStats.totalQueries++;
    
    // Calculer la moyenne mobile
    const totalTime = this.queryStats.averageExecutionTime * (this.queryStats.totalQueries - 1);
    this.queryStats.averageExecutionTime = (totalTime + executionTime) / this.queryStats.totalQueries;
  }

  /**
   * Met en cache une requête
   */
  private cacheQuery(
    query: string,
    params: any[],
    result: any,
    ttl?: number
  ): void {
    if (this.queryCache.size >= this.config.cacheSize) {
      // Supprimer l'entrée la plus ancienne
      const oldestKey = this.queryCache.keys().next().value;
      this.queryCache.delete(oldestKey);
    }

    const cacheKey = this.generateCacheKey(query, params);
    this.queryCache.set(cacheKey, {
      result,
      timestamp: Date.now(),
      ttl: ttl || this.config.cacheTTL
    });
  }

  /**
   * Génère une clé de cache pour une requête
   */
  private generateCacheKey(query: string, params: any[]): string {
    const normalizedQuery = query.replace(/\s+/g, ' ').trim();
    const paramsString = params.map(p => JSON.stringify(p)).join('|');
    return Buffer.from(`${normalizedQuery}|${paramsString}`).toString('base64');
  }

  /**
   * Génère un ID unique pour une requête
   */
  private generateQueryId(): string {
    return `query_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Construit une requête SELECT
   */
  private buildSelectQuery(
    table: string,
    columns: string[],
    where: Record<string, any>,
    options: any
  ): string {
    let query = `SELECT ${columns.join(', ')} FROM ${table}`;
    
    if (Object.keys(where).length > 0) {
      const whereClause = Object.keys(where)
        .map(key => `${key} = ?`)
        .join(' AND ');
      query += ` WHERE ${whereClause}`;
    }
    
    if (options.orderBy) {
      query += ` ORDER BY ${options.orderBy} ${options.orderDirection || 'ASC'}`;
    }
    
    if (options.limit) {
      query += ` LIMIT ${options.limit}`;
      if (options.offset) {
        query += ` OFFSET ${options.offset}`;
      }
    }
    
    return query;
  }

  /**
   * Construit une requête INSERT
   */
  private buildInsertQuery(
    table: string,
    data: Record<string, any>,
    options: any
  ): string {
    const columns = Object.keys(data);
    const placeholders = columns.map(() => '?').join(', ');
    
    let query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
    
    if (options.ignoreDuplicates) {
      query = query.replace('INSERT', 'INSERT IGNORE');
    }
    
    if (options.returnId) {
      query += ' RETURNING id';
    }
    
    return query;
  }

  /**
   * Construit une requête UPDATE
   */
  private buildUpdateQuery(
    table: string,
    data: Record<string, any>,
    where: Record<string, any>,
    options: any
  ): string {
    const setClause = Object.keys(data)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const whereClause = Object.keys(where)
      .map(key => `${key} = ?`)
      .join(' AND ');
    
    let query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    
    if (options.limit) {
      query += ` LIMIT ${options.limit}`;
    }
    
    return query;
  }

  /**
   * Construit une requête DELETE
   */
  private buildDeleteQuery(
    table: string,
    where: Record<string, any>,
    options: any
  ): string {
    const whereClause = Object.keys(where)
      .map(key => `${key} = ?`)
      .join(' AND ');
    
    let query = `DELETE FROM ${table} WHERE ${whereClause}`;
    
    if (options.limit) {
      query += ` LIMIT ${options.limit}`;
    }
    
    return query;
  }

  /**
   * Extrait les paramètres d'un objet WHERE
   */
  private extractParams(where: Record<string, any>): any[] {
    return Object.values(where);
  }
}

// Instance globale
export const database = new DatabaseOptimizer({
  maxConnections: 10,
  enableQueryLogging: true,
  enablePerformanceMonitoring: true,
  enableConnectionPooling: true,
  enableQueryCaching: true,
  cacheSize: 1000,
  cacheTTL: 300000
});
