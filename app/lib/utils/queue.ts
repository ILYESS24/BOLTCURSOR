/**
 * Système de queue pour les tâches lourdes
 */

import { logger } from './logger';

interface QueueJob<T = any> {
  id: string;
  type: string;
  data: T;
  priority: number;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  scheduledAt: number;
  startedAt?: number;
  completedAt?: number;
  failedAt?: number;
  error?: string;
  result?: any;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
}

interface QueueConfig {
  maxConcurrency: number;
  retryDelay: number;
  maxRetries: number;
  enableStats: boolean;
  enableLogging: boolean;
  cleanupInterval: number;
  maxJobs: number;
}

interface QueueStats {
  totalJobs: number;
  pendingJobs: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  cancelledJobs: number;
  averageProcessingTime: number;
  throughput: number;
  errorRate: number;
}

class AdvancedQueue<T = any> {
  private jobs = new Map<string, QueueJob<T>>();
  private pendingJobs: string[] = [];
  private runningJobs = new Set<string>();
  private config: QueueConfig;
  private stats = {
    totalJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    cancelledJobs: 0,
    totalProcessingTime: 0,
    lastReset: Date.now()
  };
  private processors = new Map<string, (data: T) => Promise<any>>();
  private cleanupTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = {
      maxConcurrency: 5,
      retryDelay: 5000,
      maxRetries: 3,
      enableStats: true,
      enableLogging: true,
      cleanupInterval: 300000, // 5 minutes
      maxJobs: 10000,
      ...config
    };

    // Ne pas démarrer le cleanup automatiquement dans Cloudflare Workers
    // this.startCleanup();
  }

  /**
   * Ajoute un job à la queue
   */
  addJob(
    type: string,
    data: T,
    options: {
      priority?: number;
      delay?: number;
      maxAttempts?: number;
    } = {}
  ): string {
    const jobId = this.generateJobId();
    const now = Date.now();
    const scheduledAt = now + (options.delay || 0);

    const job: QueueJob<T> = {
      id: jobId,
      type,
      data,
      priority: options.priority || 0,
      attempts: 0,
      maxAttempts: options.maxAttempts || this.config.maxRetries,
      createdAt: now,
      scheduledAt,
      status: 'pending'
    };

    // Vérifier la limite de jobs
    if (this.jobs.size >= this.config.maxJobs) {
      throw new Error('Queue is full');
    }

    this.jobs.set(jobId, job);
    this.pendingJobs.push(jobId);
    this.stats.totalJobs++;

    // Trier par priorité (plus haute priorité en premier)
    this.pendingJobs.sort((a, b) => {
      const jobA = this.jobs.get(a)!;
      const jobB = this.jobs.get(b)!;
      return jobB.priority - jobA.priority;
    });

    if (this.config.enableLogging) {
      logger.info(`Job added to queue`, {
        jobId,
        type,
        priority: job.priority,
        scheduledAt: new Date(scheduledAt).toISOString()
      });
    }

    // Démarrer le traitement si pas déjà en cours
    if (!this.isProcessing) {
      this.processJobs();
    }

    return jobId;
  }

  /**
   * Enregistre un processeur pour un type de job
   */
  registerProcessor(type: string, processor: (data: T) => Promise<any>): void {
    this.processors.set(type, processor);
  }

  /**
   * Obtient le statut d'un job
   */
  getJobStatus(jobId: string): QueueJob<T> | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Annule un job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === 'pending') {
      job.status = 'cancelled';
      this.stats.cancelledJobs++;
      
      // Retirer de la liste des jobs en attente
      const index = this.pendingJobs.indexOf(jobId);
      if (index > -1) {
        this.pendingJobs.splice(index, 1);
      }

      if (this.config.enableLogging) {
        logger.info(`Job cancelled`, { jobId, type: job.type });
      }

      return true;
    }

    return false;
  }

  /**
   * Obtient les statistiques de la queue
   */
  getStats(): QueueStats {
    const now = Date.now();
    const timeSinceReset = now - this.stats.lastReset;
    const throughput = timeSinceReset > 0 ? 
      (this.stats.completedJobs / (timeSinceReset / 1000)) : 0;
    
    const errorRate = this.stats.totalJobs > 0 ? 
      (this.stats.failedJobs / this.stats.totalJobs) * 100 : 0;

    const averageProcessingTime = this.stats.completedJobs > 0 ?
      this.stats.totalProcessingTime / this.stats.completedJobs : 0;

    return {
      totalJobs: this.stats.totalJobs,
      pendingJobs: this.pendingJobs.length,
      runningJobs: this.runningJobs.size,
      completedJobs: this.stats.completedJobs,
      failedJobs: this.stats.failedJobs,
      cancelledJobs: this.stats.cancelledJobs,
      averageProcessingTime,
      throughput,
      errorRate
    };
  }

  /**
   * Obtient les jobs en cours
   */
  getRunningJobs(): QueueJob<T>[] {
    return Array.from(this.runningJobs).map(id => this.jobs.get(id)!);
  }

  /**
   * Obtient les jobs en attente
   */
  getPendingJobs(): QueueJob<T>[] {
    return this.pendingJobs.map(id => this.jobs.get(id)!);
  }

  /**
   * Obtient les jobs récents
   */
  getRecentJobs(limit: number = 50): QueueJob<T>[] {
    return Array.from(this.jobs.values())
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  /**
   * Vide la queue
   */
  clear(): void {
    this.jobs.clear();
    this.pendingJobs = [];
    this.runningJobs.clear();
    this.stats = {
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      cancelledJobs: 0,
      totalProcessingTime: 0,
      lastReset: Date.now()
    };

    if (this.config.enableLogging) {
      logger.info('Queue cleared');
    }
  }

  /**
   * Traite les jobs
   */
  private async processJobs(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;

    try {
      while (this.pendingJobs.length > 0 && this.runningJobs.size < this.config.maxConcurrency) {
        const jobId = this.pendingJobs.shift();
        if (!jobId) break;

        const job = this.jobs.get(jobId);
        if (!job) continue;

        // Vérifier si le job est programmé pour plus tard
        if (job.scheduledAt > Date.now()) {
          this.pendingJobs.unshift(jobId);
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        this.runningJobs.add(jobId);
        this.processJob(job);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Traite un job individuel
   */
  private async processJob(job: QueueJob<T>): Promise<void> {
    const startTime = Date.now();
    job.status = 'running';
    job.startedAt = startTime;

    if (this.config.enableLogging) {
      logger.info(`Processing job`, {
        jobId: job.id,
        type: job.type,
        attempt: job.attempts + 1
      });
    }

    try {
      const processor = this.processors.get(job.type);
      if (!processor) {
        throw new Error(`No processor registered for job type: ${job.type}`);
      }

      const result = await processor(job.data);
      
      job.status = 'completed';
      job.completedAt = Date.now();
      job.result = result;
      
      this.stats.completedJobs++;
      this.stats.totalProcessingTime += job.completedAt - startTime;

      if (this.config.enableLogging) {
        logger.info(`Job completed`, {
          jobId: job.id,
          type: job.type,
          duration: job.completedAt - startTime
        });
      }

    } catch (error) {
      job.attempts++;
      job.error = error instanceof Error ? error.message : String(error);

      if (job.attempts >= job.maxAttempts) {
        job.status = 'failed';
        job.failedAt = Date.now();
        this.stats.failedJobs++;

        if (this.config.enableLogging) {
          logger.error(`Job failed permanently`, {
            jobId: job.id,
            type: job.type,
            attempts: job.attempts,
            error: job.error
          });
        }
      } else {
        // Réessayer plus tard
        job.status = 'pending';
        job.scheduledAt = Date.now() + this.config.retryDelay;
        this.pendingJobs.push(job.id);

        if (this.config.enableLogging) {
          logger.warn(`Job will be retried`, {
            jobId: job.id,
            type: job.type,
            attempt: job.attempts,
            nextAttempt: new Date(job.scheduledAt).toISOString()
          });
        }
      }
    } finally {
      this.runningJobs.delete(job.id);
      
      // Continuer le traitement
      if (this.pendingJobs.length > 0) {
        setTimeout(() => this.processJobs(), 100);
      }
    }
  }

  /**
   * Génère un ID unique pour un job
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Nettoie les anciens jobs
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 heures
    const jobsToDelete: string[] = [];

    for (const [jobId, job] of this.jobs.entries()) {
      if (job.status === 'completed' || job.status === 'failed') {
        if (now - job.createdAt > maxAge) {
          jobsToDelete.push(jobId);
        }
      }
    }

    jobsToDelete.forEach(jobId => {
      this.jobs.delete(jobId);
    });

    if (jobsToDelete.length > 0 && this.config.enableLogging) {
      logger.info(`Cleaned up old jobs`, { count: jobsToDelete.length });
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
   * Détruit la queue
   */
  destroy(): void {
    this.stopCleanup();
    this.clear();
    this.processors.clear();
  }
}

// Instances spécialisées
export const aiBuilderQueue = new AdvancedQueue({
  maxConcurrency: 3,
  retryDelay: 10000,
  maxRetries: 2,
  enableStats: true,
  enableLogging: true
});

export const generalQueue = new AdvancedQueue({
  maxConcurrency: 10,
  retryDelay: 5000,
  maxRetries: 3,
  enableStats: true,
  enableLogging: true
});

export const emailQueue = new AdvancedQueue({
  maxConcurrency: 5,
  retryDelay: 30000,
  maxRetries: 5,
  enableStats: true,
  enableLogging: true
});

/**
 * Processeurs prédéfinis
 */
export function registerDefaultProcessors() {
  // Processeur pour l'AI Builder
  aiBuilderQueue.registerProcessor('generate-app', async (data: any) => {
    logger.startTimer('ai-builder-generation');
    
    // Simulation de génération d'application
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const duration = logger.endTimer('ai-builder-generation', 'AI Builder generation');
    
    return {
      success: true,
      appId: `app_${Date.now()}`,
      duration
    };
  });

  // Processeur pour les emails
  emailQueue.registerProcessor('send-email', async (data: any) => {
    logger.startTimer('email-sending');
    
    // Simulation d'envoi d'email
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const duration = logger.endTimer('email-sending', 'Email sending');
    
    return {
      success: true,
      messageId: `msg_${Date.now()}`,
      duration
    };
  });

  // Processeur pour les tâches générales
  generalQueue.registerProcessor('data-processing', async (data: any) => {
    logger.startTimer('data-processing');
    
    // Simulation de traitement de données
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const duration = logger.endTimer('data-processing', 'Data processing');
    
    return {
      success: true,
      processedItems: data.items?.length || 0,
      duration
    };
  });
}

// Enregistrer les processeurs par défaut
registerDefaultProcessors();
