/**
 * Système de fonctionnalités temps réel
 */

import { logger } from './logger';

interface RealtimeEvent {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  userId?: string;
  roomId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface RealtimeConfig {
  maxConnections: number;
  heartbeatInterval: number;
  connectionTimeout: number;
  enableStats: boolean;
  enableLogging: boolean;
  enableCompression: boolean;
  enableEncryption: boolean;
}

interface ConnectionInfo {
  id: string;
  userId?: string;
  roomId?: string;
  lastHeartbeat: number;
  isActive: boolean;
  subscriptions: Set<string>;
  metadata: Record<string, any>;
}

class RealtimeManager {
  private config: RealtimeConfig;
  private connections = new Map<string, ConnectionInfo>();
  private rooms = new Map<string, Set<string>>(); // roomId -> connectionIds
  private eventQueue: RealtimeEvent[] = [];
  private stats = {
    totalConnections: 0,
    activeConnections: 0,
    totalEvents: 0,
    eventsByType: {} as Record<string, number>,
    averageLatency: 0,
    totalLatency: 0
  };
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<RealtimeConfig> = {}) {
    this.config = {
      maxConnections: 1000,
      heartbeatInterval: 30000, // 30 secondes
      connectionTimeout: 60000, // 1 minute
      enableStats: true,
      enableLogging: true,
      enableCompression: true,
      enableEncryption: true,
      ...config
    };

    // Ne pas démarrer le heartbeat automatiquement dans Cloudflare Workers
    // this.startHeartbeat();
  }

  /**
   * Ajoute une nouvelle connexion
   */
  addConnection(
    connectionId: string,
    userId?: string,
    roomId?: string,
    metadata: Record<string, any> = {}
  ): void {
    const connection: ConnectionInfo = {
      id: connectionId,
      userId,
      roomId,
      lastHeartbeat: Date.now(),
      isActive: true,
      subscriptions: new Set(),
      metadata
    };

    this.connections.set(connectionId, connection);
    this.stats.totalConnections++;
    this.stats.activeConnections++;

    // Ajouter à la room si spécifiée
    if (roomId) {
      this.joinRoom(connectionId, roomId);
    }

    if (this.config.enableLogging) {
      logger.info('Realtime connection added', {
        connectionId,
        userId,
        roomId,
        totalConnections: this.stats.activeConnections
      });
    }
  }

  /**
   * Supprime une connexion
   */
  removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Retirer de toutes les rooms
    for (const [roomId, connectionIds] of this.rooms.entries()) {
      connectionIds.delete(connectionId);
      if (connectionIds.size === 0) {
        this.rooms.delete(roomId);
      }
    }

    this.connections.delete(connectionId);
    this.stats.activeConnections--;

    if (this.config.enableLogging) {
      logger.info('Realtime connection removed', {
        connectionId,
        userId: connection.userId,
        totalConnections: this.stats.activeConnections
      });
    }
  }

  /**
   * Met à jour le heartbeat d'une connexion
   */
  updateHeartbeat(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastHeartbeat = Date.now();
    }
  }

  /**
   * Ajoute une connexion à une room
   */
  joinRoom(connectionId: string, roomId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.roomId = roomId;
    
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    
    this.rooms.get(roomId)!.add(connectionId);

    if (this.config.enableLogging) {
      logger.info('Connection joined room', {
        connectionId,
        roomId,
        roomSize: this.rooms.get(roomId)!.size
      });
    }
  }

  /**
   * Retire une connexion d'une room
   */
  leaveRoom(connectionId: string, roomId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(connectionId);
      if (room.size === 0) {
        this.rooms.delete(roomId);
      }
    }

    if (this.config.enableLogging) {
      logger.info('Connection left room', {
        connectionId,
        roomId
      });
    }
  }

  /**
   * Envoie un événement à une connexion spécifique
   */
  sendToConnection(connectionId: string, event: Omit<RealtimeEvent, 'id' | 'timestamp'>): void {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.isActive) return;

    const realtimeEvent: RealtimeEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      ...event
    };

    this.processEvent(realtimeEvent, [connectionId]);
  }

  /**
   * Envoie un événement à une room
   */
  sendToRoom(roomId: string, event: Omit<RealtimeEvent, 'id' | 'timestamp'>): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const realtimeEvent: RealtimeEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      ...event
    };

    this.processEvent(realtimeEvent, Array.from(room));
  }

  /**
   * Envoie un événement à un utilisateur spécifique
   */
  sendToUser(userId: string, event: Omit<RealtimeEvent, 'id' | 'timestamp'>): void {
    const userConnections = Array.from(this.connections.values())
      .filter(conn => conn.userId === userId && conn.isActive)
      .map(conn => conn.id);

    if (userConnections.length === 0) return;

    const realtimeEvent: RealtimeEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      ...event
    };

    this.processEvent(realtimeEvent, userConnections);
  }

  /**
   * Envoie un événement à toutes les connexions
   */
  broadcast(event: Omit<RealtimeEvent, 'id' | 'timestamp'>): void {
    const realtimeEvent: RealtimeEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      ...event
    };

    const allConnections = Array.from(this.connections.keys());
    this.processEvent(realtimeEvent, allConnections);
  }

  /**
   * Envoie un événement de notification
   */
  sendNotification(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    metadata: Record<string, any> = {}
  ): void {
    this.sendToUser(userId, {
      type: 'notification',
      data: {
        title,
        message,
        type,
        metadata
      },
      priority: 'medium'
    });
  }

  /**
   * Envoie un événement de collaboration
   */
  sendCollaborationEvent(
    roomId: string,
    action: string,
    data: any,
    userId: string
  ): void {
    this.sendToRoom(roomId, {
      type: 'collaboration',
      data: {
        action,
        data,
        userId,
        timestamp: Date.now()
      },
      priority: 'high'
    });
  }

  /**
   * Envoie un événement de statut
   */
  sendStatusUpdate(
    userId: string,
    status: 'online' | 'away' | 'busy' | 'offline',
    metadata: Record<string, any> = {}
  ): void {
    this.broadcast({
      type: 'user_status',
      data: {
        userId,
        status,
        metadata,
        timestamp: Date.now()
      },
      priority: 'low'
    });
  }

  /**
   * Envoie un événement de performance
   */
  sendPerformanceUpdate(
    metrics: {
      responseTime: number;
      memoryUsage: number;
      cpuUsage: number;
      activeConnections: number;
    }
  ): void {
    this.broadcast({
      type: 'performance_update',
      data: metrics,
      priority: 'low'
    });
  }

  /**
   * Obtient les statistiques temps réel
   */
  getStats() {
    return {
      ...this.stats,
      rooms: this.rooms.size,
      averageRoomSize: this.rooms.size > 0 ? 
        Array.from(this.rooms.values()).reduce((sum, room) => sum + room.size, 0) / this.rooms.size : 0,
      eventQueueSize: this.eventQueue.length
    };
  }

  /**
   * Obtient les connexions actives
   */
  getActiveConnections(): ConnectionInfo[] {
    return Array.from(this.connections.values()).filter(conn => conn.isActive);
  }

  /**
   * Obtient les connexions d'une room
   */
  getRoomConnections(roomId: string): ConnectionInfo[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return Array.from(room)
      .map(id => this.connections.get(id))
      .filter(conn => conn && conn.isActive) as ConnectionInfo[];
  }

  /**
   * Obtient les connexions d'un utilisateur
   */
  getUserConnections(userId: string): ConnectionInfo[] {
    return Array.from(this.connections.values())
      .filter(conn => conn.userId === userId && conn.isActive);
  }

  /**
   * Traite un événement
   */
  private processEvent(event: RealtimeEvent, targetConnections: string[]): void {
    const startTime = Date.now();
    
    // Mettre à jour les statistiques
    this.stats.totalEvents++;
    this.stats.eventsByType[event.type] = (this.stats.eventsByType[event.type] || 0) + 1;

    // Traiter l'événement pour chaque connexion
    for (const connectionId of targetConnections) {
      const connection = this.connections.get(connectionId);
      if (!connection || !connection.isActive) continue;

      // Simuler l'envoi de l'événement
      this.sendEventToConnection(connection, event);
    }

    // Calculer la latence
    const latency = Date.now() - startTime;
    this.stats.totalLatency += latency;
    this.stats.averageLatency = this.stats.totalLatency / this.stats.totalEvents;

    if (this.config.enableLogging) {
      logger.info('Realtime event processed', {
        eventId: event.id,
        eventType: event.type,
        targetConnections: targetConnections.length,
        latency
      });
    }
  }

  /**
   * Envoie un événement à une connexion
   */
  private sendEventToConnection(connection: ConnectionInfo, event: RealtimeEvent): void {
    // Dans un environnement réel, on enverrait l'événement via WebSocket
    // Ici on simule l'envoi
    if (this.config.enableLogging) {
      logger.debug('Event sent to connection', {
        connectionId: connection.id,
        eventId: event.id,
        eventType: event.type
      });
    }
  }

  /**
   * Démarre le heartbeat
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.checkHeartbeats();
    }, this.config.heartbeatInterval);
  }

  /**
   * Vérifie les heartbeats
   */
  private checkHeartbeats(): void {
    const now = Date.now();
    const timeoutThreshold = this.config.connectionTimeout;

    for (const [connectionId, connection] of this.connections.entries()) {
      if (now - connection.lastHeartbeat > timeoutThreshold) {
        connection.isActive = false;
        this.stats.activeConnections--;

        if (this.config.enableLogging) {
          logger.warn('Connection timeout', {
            connectionId,
            userId: connection.userId,
            lastHeartbeat: new Date(connection.lastHeartbeat).toISOString()
          });
        }
      }
    }
  }

  /**
   * Génère un ID unique pour un événement
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Arrête le heartbeat
   */
  stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Détruit le gestionnaire temps réel
   */
  destroy(): void {
    this.stopHeartbeat();
    this.connections.clear();
    this.rooms.clear();
    this.eventQueue = [];
  }
}

// Instance globale
export const realtimeManager = new RealtimeManager({
  maxConnections: 1000,
  heartbeatInterval: 30000,
  connectionTimeout: 60000,
  enableStats: true,
  enableLogging: true
});

/**
 * Utilitaires temps réel
 */
export class RealtimeUtils {
  /**
   * Crée un événement de chat
   */
  static createChatEvent(
    message: string,
    userId: string,
    roomId: string,
    metadata: Record<string, any> = {}
  ): Omit<RealtimeEvent, 'id' | 'timestamp'> {
    return {
      type: 'chat_message',
      data: {
        message,
        userId,
        metadata
      },
      priority: 'medium'
    };
  }

  /**
   * Crée un événement de collaboration
   */
  static createCollaborationEvent(
    action: 'cursor_move' | 'text_edit' | 'selection_change' | 'user_join' | 'user_leave',
    data: any,
    userId: string
  ): Omit<RealtimeEvent, 'id' | 'timestamp'> {
    return {
      type: 'collaboration',
      data: {
        action,
        data,
        userId
      },
      priority: 'high'
    };
  }

  /**
   * Crée un événement de notification
   */
  static createNotificationEvent(
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    metadata: Record<string, any> = {}
  ): Omit<RealtimeEvent, 'id' | 'timestamp'> {
    return {
      type: 'notification',
      data: {
        title,
        message,
        type,
        metadata
      },
      priority: 'medium'
    };
  }

  /**
   * Crée un événement de statut
   */
  static createStatusEvent(
    status: 'online' | 'away' | 'busy' | 'offline',
    userId: string,
    metadata: Record<string, any> = {}
  ): Omit<RealtimeEvent, 'id' | 'timestamp'> {
    return {
      type: 'user_status',
      data: {
        status,
        userId,
        metadata
      },
      priority: 'low'
    };
  }
}
