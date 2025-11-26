/**
 * Moteur de workflows avancé - Comme Tempo + Zapier + Bubble
 * Système de workflows visuels et automatisés
 */

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'webhook' | 'api' | 'database' | 'email' | 'notification';
  name: string;
  description: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  connections: string[];
}

export interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
  condition?: string;
  data?: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  enabled: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  currentStep: string;
  data: Record<string, any>;
  logs: WorkflowLog[];
  error?: string;
}

export interface WorkflowLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

/**
 * Moteur de workflows principal
 */
export class WorkflowEngine {
  private workflows: Map<string, Workflow>;
  private executions: Map<string, WorkflowExecution>;
  private nodeTypes: Map<string, WorkflowNodeType>;

  constructor() {
    this.workflows = new Map();
    this.executions = new Map();
    this.nodeTypes = new Map();
    this.initializeNodeTypes();
  }

  /**
   * Initialise tous les types de nœuds disponibles
   */
  private initializeNodeTypes() {
    // Triggers
    this.addNodeType({
      type: 'trigger',
      name: 'Webhook',
      description: 'Triggered by incoming webhook',
      icon: '🔗',
      inputs: [],
      outputs: ['data'],
      configSchema: {
        url: { type: 'string', required: true },
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'], default: 'POST' },
        headers: { type: 'object', default: {} }
      }
    });

    this.addNodeType({
      type: 'trigger',
      name: 'Schedule',
      description: 'Triggered on schedule',
      icon: '⏰',
      inputs: [],
      outputs: ['data'],
      configSchema: {
        cron: { type: 'string', required: true },
        timezone: { type: 'string', default: 'UTC' }
      }
    });

    this.addNodeType({
      type: 'trigger',
      name: 'Database Change',
      description: 'Triggered by database changes',
      icon: '🗄️',
      inputs: [],
      outputs: ['data'],
      configSchema: {
        table: { type: 'string', required: true },
        operation: { type: 'string', enum: ['INSERT', 'UPDATE', 'DELETE'], required: true },
        conditions: { type: 'object', default: {} }
      }
    });

    // Actions
    this.addNodeType({
      type: 'action',
      name: 'Send Email',
      description: 'Send email notification',
      icon: '📧',
      inputs: ['data'],
      outputs: ['result'],
      configSchema: {
        to: { type: 'string', required: true },
        subject: { type: 'string', required: true },
        template: { type: 'string', required: true },
        variables: { type: 'object', default: {} }
      }
    });

    this.addNodeType({
      type: 'action',
      name: 'API Call',
      description: 'Make HTTP API call',
      icon: '🌐',
      inputs: ['data'],
      outputs: ['response'],
      configSchema: {
        url: { type: 'string', required: true },
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'], default: 'GET' },
        headers: { type: 'object', default: {} },
        body: { type: 'string', default: '' }
      }
    });

    this.addNodeType({
      type: 'action',
      name: 'Database Query',
      description: 'Execute database query',
      icon: '🔍',
      inputs: ['data'],
      outputs: ['result'],
      configSchema: {
        query: { type: 'string', required: true },
        parameters: { type: 'array', default: [] }
      }
    });

    this.addNodeType({
      type: 'action',
      name: 'Push Notification',
      description: 'Send push notification',
      icon: '📱',
      inputs: ['data'],
      outputs: ['result'],
      configSchema: {
        title: { type: 'string', required: true },
        body: { type: 'string', required: true },
        data: { type: 'object', default: {} }
      }
    });

    // Conditions
    this.addNodeType({
      type: 'condition',
      name: 'If/Else',
      description: 'Conditional branching',
      icon: '❓',
      inputs: ['data'],
      outputs: ['true', 'false'],
      configSchema: {
        condition: { type: 'string', required: true },
        operator: { type: 'string', enum: ['equals', 'not_equals', 'greater_than', 'less_than', 'contains'], default: 'equals' },
        value: { type: 'string', required: true }
      }
    });

    this.addNodeType({
      type: 'condition',
      name: 'Switch',
      description: 'Multiple condition branching',
      icon: '🔀',
      inputs: ['data'],
      outputs: ['case1', 'case2', 'default'],
      configSchema: {
        field: { type: 'string', required: true },
        cases: { type: 'array', required: true }
      }
    });

    // Utilities
    this.addNodeType({
      type: 'action',
      name: 'Delay',
      description: 'Wait for specified time',
      icon: '⏳',
      inputs: ['data'],
      outputs: ['data'],
      configSchema: {
        duration: { type: 'number', required: true },
        unit: { type: 'string', enum: ['seconds', 'minutes', 'hours', 'days'], default: 'seconds' }
      }
    });

    this.addNodeType({
      type: 'action',
      name: 'Transform Data',
      description: 'Transform data using JavaScript',
      icon: '🔄',
      inputs: ['data'],
      outputs: ['transformed'],
      configSchema: {
        script: { type: 'string', required: true }
      }
    });

    this.addNodeType({
      type: 'action',
      name: 'Log',
      description: 'Log data for debugging',
      icon: '📝',
      inputs: ['data'],
      outputs: ['data'],
      configSchema: {
        message: { type: 'string', required: true },
        level: { type: 'string', enum: ['info', 'warn', 'error', 'debug'], default: 'info' }
      }
    });
  }

  private addNodeType(nodeType: WorkflowNodeType) {
    this.nodeTypes.set(nodeType.type, nodeType);
  }

  /**
   * Crée un nouveau workflow
   */
  async createWorkflow(workflow: Omit<Workflow, 'id' | 'version' | 'createdAt' | 'updatedAt'>): Promise<Workflow> {
    const id = this.generateId();
    const now = new Date();
    
    const newWorkflow: Workflow = {
      ...workflow,
      id,
      version: 1,
      createdAt: now,
      updatedAt: now
    };

    // Valider le workflow
    await this.validateWorkflow(newWorkflow);

    this.workflows.set(id, newWorkflow);
    return newWorkflow;
  }

  /**
   * Exécute un workflow
   */
  async executeWorkflow(workflowId: string, triggerData: any): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    if (!workflow.enabled) {
      throw new Error('Workflow is disabled');
    }

    const executionId = this.generateId();
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'pending',
      startTime: new Date(),
      currentStep: 'initializing',
      data: { ...triggerData },
      logs: []
    };

    this.executions.set(executionId, execution);

    try {
      execution.status = 'running';
      await this.runWorkflow(workflow, execution);
      execution.status = 'completed';
      execution.endTime = new Date();
    } catch (error) {
      execution.status = 'failed';
      execution.error = (error as Error).message;
      execution.endTime = new Date();
      this.log(execution, 'error', `Workflow execution failed: ${(error as Error).message}`);
    }

    return execution;
  }

  /**
   * Exécute les nœuds d'un workflow
   */
  private async runWorkflow(workflow: Workflow, execution: WorkflowExecution): Promise<void> {
    const visited = new Set<string>();
    const queue: string[] = [];

    // Trouver les nœuds de déclenchement
    const triggerNodes = workflow.nodes.filter(node => node.type === 'trigger');
    if (triggerNodes.length === 0) {
      throw new Error('No trigger nodes found');
    }

    // Ajouter les nœuds de déclenchement à la queue
    for (const node of triggerNodes) {
      queue.push(node.id);
    }

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      
      if (visited.has(nodeId)) {
        continue;
      }

      visited.add(nodeId);
      const node = workflow.nodes.find(n => n.id === nodeId);
      if (!node) {
        continue;
      }

      try {
        execution.currentStep = node.name;
        this.log(execution, 'info', `Executing node: ${node.name}`);

        const result = await this.executeNode(node, execution.data);
        
        // Mettre à jour les données d'exécution
        execution.data = { ...execution.data, ...result };

        // Trouver les nœuds connectés
        const connections = workflow.connections.filter(conn => conn.from === nodeId);
        for (const connection of connections) {
          // Vérifier les conditions de connexion
          if (this.evaluateConnectionCondition(connection, execution.data)) {
            queue.push(connection.to);
          }
        }

        this.log(execution, 'info', `Node ${node.name} completed successfully`);
      } catch (error) {
        this.log(execution, 'error', `Node ${node.name} failed: ${(error as Error).message}`);
        throw error;
      }
    }
  }

  /**
   * Exécute un nœud individuel
   */
  private async executeNode(node: WorkflowNode, data: any): Promise<any> {
    const nodeType = this.nodeTypes.get(node.type);
    if (!nodeType) {
      throw new Error(`Unknown node type: ${node.type}`);
    }

    switch (node.type) {
      case 'trigger':
        return await this.executeTriggerNode(node, data);
      case 'action':
        return await this.executeActionNode(node, data);
      case 'condition':
        return await this.executeConditionNode(node, data);
      default:
        throw new Error(`Unsupported node type: ${node.type}`);
    }
  }

  /**
   * Exécute un nœud de déclenchement
   */
  private async executeTriggerNode(node: WorkflowNode, data: any): Promise<any> {
    // Les nœuds de déclenchement passent simplement les données
    return data;
  }

  /**
   * Exécute un nœud d'action
   */
  private async executeActionNode(node: WorkflowNode, data: any): Promise<any> {
    const { config } = node;

    switch (node.name) {
      case 'Send Email':
        return await this.sendEmail(config, data);
      case 'API Call':
        return await this.makeAPICall(config, data);
      case 'Database Query':
        return await this.executeDatabaseQuery(config, data);
      case 'Push Notification':
        return await this.sendPushNotification(config, data);
      case 'Delay':
        return await this.delay(config, data);
      case 'Transform Data':
        return await this.transformData(config, data);
      case 'Log':
        return await this.logData(config, data);
      default:
        throw new Error(`Unknown action: ${node.name}`);
    }
  }

  /**
   * Exécute un nœud de condition
   */
  private async executeConditionNode(node: WorkflowNode, data: any): Promise<any> {
    const { config } = node;

    switch (node.name) {
      case 'If/Else':
        return await this.evaluateIfElse(config, data);
      case 'Switch':
        return await this.evaluateSwitch(config, data);
      default:
        throw new Error(`Unknown condition: ${node.name}`);
    }
  }

  /**
   * Actions spécifiques
   */
  private async sendEmail(config: any, data: any): Promise<any> {
    // Implémentation d'envoi d'email
    const { to, subject, template, variables } = config;
    
    // Remplacer les variables dans le template
    let processedTemplate = template;
    for (const [key, value] of Object.entries(variables)) {
      processedTemplate = processedTemplate.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }

    // Simuler l'envoi d'email
    console.log(`Sending email to ${to}: ${subject}`);
    console.log(`Content: ${processedTemplate}`);

    return { success: true, messageId: this.generateId() };
  }

  private async makeAPICall(config: any, data: any): Promise<any> {
    const { url, method, headers, body } = config;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(this.processTemplate(body, data)) : undefined
    });

    return await response.json();
  }

  private async executeDatabaseQuery(config: any, data: any): Promise<any> {
    const { query, parameters } = config;
    
    // Simuler l'exécution de requête
    console.log(`Executing query: ${query}`);
    console.log(`Parameters:`, parameters);

    return { rows: [], rowCount: 0 };
  }

  private async sendPushNotification(config: any, data: any): Promise<any> {
    const { title, body, notificationData } = config;
    
    // Simuler l'envoi de notification push
    console.log(`Sending push notification: ${title} - ${body}`);
    console.log(`Data:`, notificationData);

    return { success: true, notificationId: this.generateId() };
  }

  private async delay(config: any, data: any): Promise<any> {
    const { duration, unit } = config;
    
    let milliseconds = duration;
    switch (unit) {
      case 'seconds':
        milliseconds *= 1000;
        break;
      case 'minutes':
        milliseconds *= 60 * 1000;
        break;
      case 'hours':
        milliseconds *= 60 * 60 * 1000;
        break;
      case 'days':
        milliseconds *= 24 * 60 * 60 * 1000;
        break;
    }

    await new Promise(resolve => setTimeout(resolve, milliseconds));
    return data;
  }

  private async transformData(config: any, data: any): Promise<any> {
    const { script } = config;
    
    // Exécuter le script JavaScript pour transformer les données
    try {
      // Utiliser Function constructor au lieu d'eval pour plus de sécurité
      const transformFunction = new Function('data', `return (${script})(data)`);
      const transformedData = transformFunction(data);
      return transformedData;
    } catch (error) {
      throw new Error(`Transform script error: ${(error as Error).message}`);
    }
  }

  private async logData(config: any, data: any): Promise<any> {
    const { message, level } = config;
    
    console.log(`[${level.toUpperCase()}] ${message}:`, data);
    return data;
  }

  /**
   * Conditions
   */
  private async evaluateIfElse(config: any, data: any): Promise<any> {
    const { condition, operator, value } = config;
    
    const fieldValue = this.getNestedValue(data, condition);
    const result = this.compareValues(fieldValue, operator, value);
    
    return { condition: result, data };
  }

  private async evaluateSwitch(config: any, data: any): Promise<any> {
    const { field, cases } = config;
    
    const fieldValue = this.getNestedValue(data, field);
    
    for (const caseItem of cases) {
      if (fieldValue === caseItem.value) {
        return { case: caseItem.name, data };
      }
    }
    
    return { case: 'default', data };
  }

  /**
   * Utilitaires
   */
  private evaluateConnectionCondition(connection: WorkflowConnection, data: any): boolean {
    if (!connection.condition) {
      return true;
    }

    // Évaluer la condition de connexion
    try {
      // Utiliser Function constructor au lieu d'eval pour plus de sécurité
      const conditionFunction = new Function('data', `return ${connection.condition}`);
      return conditionFunction(data);
    } catch (error) {
      console.error('Connection condition evaluation error:', error);
      return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private compareValues(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'not_equals':
        return actual !== expected;
      case 'greater_than':
        return actual > expected;
      case 'less_than':
        return actual < expected;
      case 'contains':
        return String(actual).includes(String(expected));
      default:
        return false;
    }
  }

  private processTemplate(template: string, data: any): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  private log(execution: WorkflowExecution, level: string, message: string, data?: any): void {
    execution.logs.push({
      timestamp: new Date(),
      level: level as any,
      message,
      data
    });
  }

  private async validateWorkflow(workflow: Workflow): Promise<void> {
    // Vérifier qu'il y a au moins un nœud de déclenchement
    const triggerNodes = workflow.nodes.filter(node => node.type === 'trigger');
    if (triggerNodes.length === 0) {
      throw new Error('Workflow must have at least one trigger node');
    }

    // Vérifier que tous les nœuds sont connectés
    const connectedNodes = new Set<string>();
    for (const connection of workflow.connections) {
      connectedNodes.add(connection.from);
      connectedNodes.add(connection.to);
    }

    for (const node of workflow.nodes) {
      if (node.type !== 'trigger' && !connectedNodes.has(node.id)) {
        throw new Error(`Node ${node.name} is not connected`);
      }
    }

    // Vérifier qu'il n'y a pas de cycles
    if (this.hasCycle(workflow)) {
      throw new Error('Workflow contains cycles');
    }
  }

  private hasCycle(workflow: Workflow): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        return true; // Cycle détecté
      }

      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const connections = workflow.connections.filter(conn => conn.from === nodeId);
      for (const connection of connections) {
        if (dfs(connection.to)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of workflow.nodes) {
      if (!visited.has(node.id) && dfs(node.id)) {
        return true;
      }
    }

    return false;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

/**
 * Types pour les nœuds de workflow
 */
export interface WorkflowNodeType {
  type: string;
  name: string;
  description: string;
  icon: string;
  inputs: string[];
  outputs: string[];
  configSchema: Record<string, any>;
}

/**
 * Générateur de workflows prédéfinis
 */
export class WorkflowTemplateGenerator {
  /**
   * Génère des workflows prédéfinis basés sur les fonctionnalités
   */
  generateTemplates(features: string[]): Workflow[] {
    const templates = [];

    if (features.includes('authentication')) {
      templates.push(this.generateUserRegistrationWorkflow());
      templates.push(this.generateUserLoginWorkflow());
      templates.push(this.generatePasswordResetWorkflow());
    }

    if (features.includes('notification')) {
      templates.push(this.generateNotificationWorkflow());
      templates.push(this.generateEmailCampaignWorkflow());
    }

    if (features.includes('payment')) {
      templates.push(this.generatePaymentProcessingWorkflow());
      templates.push(this.generateSubscriptionWorkflow());
    }

    if (features.includes('crud')) {
      templates.push(this.generateDataSyncWorkflow());
      templates.push(this.generateAuditLogWorkflow());
    }

    return templates;
  }

  private generateUserRegistrationWorkflow(): Workflow {
    return {
      id: 'user-registration',
      name: 'User Registration Workflow',
      description: 'Handles new user registration process',
      nodes: [
        {
          id: 'webhook-trigger',
          type: 'trigger',
          name: 'Registration Webhook',
          description: 'Triggered when user registers',
          config: { url: '/api/webhooks/registration' },
          position: { x: 100, y: 100 },
          connections: ['validate-data']
        },
        {
          id: 'validate-data',
          type: 'condition',
          name: 'Validate Data',
          description: 'Validate registration data',
          config: {
            condition: 'email',
            operator: 'contains',
            value: '@'
          },
          position: { x: 300, y: 100 },
          connections: ['create-user', 'send-error']
        },
        {
          id: 'create-user',
          type: 'action',
          name: 'Create User',
          description: 'Create user in database',
          config: { query: 'INSERT INTO users (email, password) VALUES (?, ?)' },
          position: { x: 500, y: 50 },
          connections: ['send-welcome-email']
        },
        {
          id: 'send-welcome-email',
          type: 'action',
          name: 'Send Welcome Email',
          description: 'Send welcome email to new user',
          config: {
            to: '{{email}}',
            subject: 'Welcome to our platform!',
            template: 'welcome-email'
          },
          position: { x: 700, y: 50 },
          connections: []
        },
        {
          id: 'send-error',
          type: 'action',
          name: 'Send Error',
          description: 'Send error response',
          config: { message: 'Invalid registration data' },
          position: { x: 500, y: 150 },
          connections: []
        }
      ],
      connections: [
        { id: 'conn1', from: 'webhook-trigger', to: 'validate-data' },
        { id: 'conn2', from: 'validate-data', to: 'create-user', condition: 'true' },
        { id: 'conn3', from: 'validate-data', to: 'send-error', condition: 'false' },
        { id: 'conn4', from: 'create-user', to: 'send-welcome-email' }
      ],
      enabled: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private generateUserLoginWorkflow(): Workflow {
    return {
      id: 'user-login',
      name: 'User Login Workflow',
      description: 'Handles user login process',
      nodes: [
        {
          id: 'login-trigger',
          type: 'trigger',
          name: 'Login Trigger',
          description: 'Triggered when user attempts login',
          config: { url: '/api/auth/login' },
          position: { x: 100, y: 100 },
          connections: ['validate-credentials']
        },
        {
          id: 'validate-credentials',
          type: 'action',
          name: 'Validate Credentials',
          description: 'Validate user credentials',
          config: { query: 'SELECT * FROM users WHERE email = ?' },
          position: { x: 300, y: 100 },
          connections: ['check-password']
        },
        {
          id: 'check-password',
          type: 'condition',
          name: 'Check Password',
          description: 'Check if password is correct',
          config: {
            condition: 'password_valid',
            operator: 'equals',
            value: 'true'
          },
          position: { x: 500, y: 100 },
          connections: ['generate-token', 'login-failed']
        },
        {
          id: 'generate-token',
          type: 'action',
          name: 'Generate Token',
          description: 'Generate JWT token',
          config: { algorithm: 'HS256', expiresIn: '7d' },
          position: { x: 700, y: 50 },
          connections: ['update-last-login']
        },
        {
          id: 'update-last-login',
          type: 'action',
          name: 'Update Last Login',
          description: 'Update user last login timestamp',
          config: { query: 'UPDATE users SET last_login = NOW() WHERE id = ?' },
          position: { x: 900, y: 50 },
          connections: []
        },
        {
          id: 'login-failed',
          type: 'action',
          name: 'Login Failed',
          description: 'Handle failed login',
          config: { message: 'Invalid credentials' },
          position: { x: 700, y: 150 },
          connections: []
        }
      ],
      connections: [
        { id: 'conn1', from: 'login-trigger', to: 'validate-credentials' },
        { id: 'conn2', from: 'validate-credentials', to: 'check-password' },
        { id: 'conn3', from: 'check-password', to: 'generate-token', condition: 'true' },
        { id: 'conn4', from: 'check-password', to: 'login-failed', condition: 'false' },
        { id: 'conn5', from: 'generate-token', to: 'update-last-login' }
      ],
      enabled: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private generatePasswordResetWorkflow(): Workflow {
    return {
      id: 'password-reset',
      name: 'Password Reset Workflow',
      description: 'Handles password reset process',
      nodes: [
        {
          id: 'reset-trigger',
          type: 'trigger',
          name: 'Reset Trigger',
          description: 'Triggered when user requests password reset',
          config: { url: '/api/auth/reset-password' },
          position: { x: 100, y: 100 },
          connections: ['generate-reset-token']
        },
        {
          id: 'generate-reset-token',
          type: 'action',
          name: 'Generate Reset Token',
          description: 'Generate password reset token',
          config: { algorithm: 'HS256', expiresIn: '1h' },
          position: { x: 300, y: 100 },
          connections: ['send-reset-email']
        },
        {
          id: 'send-reset-email',
          type: 'action',
          name: 'Send Reset Email',
          description: 'Send password reset email',
          config: {
            to: '{{email}}',
            subject: 'Password Reset Request',
            template: 'password-reset'
          },
          position: { x: 500, y: 100 },
          connections: []
        }
      ],
      connections: [
        { id: 'conn1', from: 'reset-trigger', to: 'generate-reset-token' },
        { id: 'conn2', from: 'generate-reset-token', to: 'send-reset-email' }
      ],
      enabled: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private generateNotificationWorkflow(): Workflow {
    return {
      id: 'notification',
      name: 'Notification Workflow',
      description: 'Handles user notifications',
      nodes: [
        {
          id: 'notification-trigger',
          type: 'trigger',
          name: 'Notification Trigger',
          description: 'Triggered by user actions',
          config: { url: '/api/notifications' },
          position: { x: 100, y: 100 },
          connections: ['determine-notification-type']
        },
        {
          id: 'determine-notification-type',
          type: 'condition',
          name: 'Determine Type',
          description: 'Determine notification type',
          config: {
            condition: 'type',
            operator: 'equals',
            value: 'urgent'
          },
          position: { x: 300, y: 100 },
          connections: ['send-push', 'send-email']
        },
        {
          id: 'send-push',
          type: 'action',
          name: 'Send Push',
          description: 'Send push notification',
          config: {
            title: '{{title}}',
            body: '{{message}}'
          },
          position: { x: 500, y: 50 },
          connections: []
        },
        {
          id: 'send-email',
          type: 'action',
          name: 'Send Email',
          description: 'Send email notification',
          config: {
            to: '{{email}}',
            subject: '{{title}}',
            template: 'notification'
          },
          position: { x: 500, y: 150 },
          connections: []
        }
      ],
      connections: [
        { id: 'conn1', from: 'notification-trigger', to: 'determine-notification-type' },
        { id: 'conn2', from: 'determine-notification-type', to: 'send-push', condition: 'true' },
        { id: 'conn3', from: 'determine-notification-type', to: 'send-email', condition: 'false' }
      ],
      enabled: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private generateEmailCampaignWorkflow(): Workflow {
    return {
      id: 'email-campaign',
      name: 'Email Campaign Workflow',
      description: 'Handles email marketing campaigns',
      nodes: [
        {
          id: 'campaign-trigger',
          type: 'trigger',
          name: 'Campaign Trigger',
          description: 'Triggered by campaign schedule',
          config: { cron: '0 9 * * *' },
          position: { x: 100, y: 100 },
          connections: ['get-subscribers']
        },
        {
          id: 'get-subscribers',
          type: 'action',
          name: 'Get Subscribers',
          description: 'Get email subscribers',
          config: { query: 'SELECT * FROM subscribers WHERE active = true' },
          position: { x: 300, y: 100 },
          connections: ['send-bulk-email']
        },
        {
          id: 'send-bulk-email',
          type: 'action',
          name: 'Send Bulk Email',
          description: 'Send bulk email to subscribers',
          config: {
            template: 'newsletter',
            batchSize: 100
          },
          position: { x: 500, y: 100 },
          connections: ['update-campaign-stats']
        },
        {
          id: 'update-campaign-stats',
          type: 'action',
          name: 'Update Stats',
          description: 'Update campaign statistics',
          config: { query: 'UPDATE campaigns SET sent_count = sent_count + ? WHERE id = ?' },
          position: { x: 700, y: 100 },
          connections: []
        }
      ],
      connections: [
        { id: 'conn1', from: 'campaign-trigger', to: 'get-subscribers' },
        { id: 'conn2', from: 'get-subscribers', to: 'send-bulk-email' },
        { id: 'conn3', from: 'send-bulk-email', to: 'update-campaign-stats' }
      ],
      enabled: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private generatePaymentProcessingWorkflow(): Workflow {
    return {
      id: 'payment-processing',
      name: 'Payment Processing Workflow',
      description: 'Handles payment processing',
      nodes: [
        {
          id: 'payment-trigger',
          type: 'trigger',
          name: 'Payment Trigger',
          description: 'Triggered by payment request',
          config: { url: '/api/payments' },
          position: { x: 100, y: 100 },
          connections: ['validate-payment']
        },
        {
          id: 'validate-payment',
          type: 'condition',
          name: 'Validate Payment',
          description: 'Validate payment data',
          config: {
            condition: 'amount',
            operator: 'greater_than',
            value: '0'
          },
          position: { x: 300, y: 100 },
          connections: ['process-payment', 'payment-error']
        },
        {
          id: 'process-payment',
          type: 'action',
          name: 'Process Payment',
          description: 'Process payment with Stripe',
          config: {
            provider: 'stripe',
            action: 'create-payment-intent'
          },
          position: { x: 500, y: 50 },
          connections: ['update-order-status']
        },
        {
          id: 'update-order-status',
          type: 'action',
          name: 'Update Order Status',
          description: 'Update order status to paid',
          config: { query: 'UPDATE orders SET status = "paid" WHERE id = ?' },
          position: { x: 700, y: 50 },
          connections: ['send-confirmation']
        },
        {
          id: 'send-confirmation',
          type: 'action',
          name: 'Send Confirmation',
          description: 'Send payment confirmation email',
          config: {
            to: '{{email}}',
            subject: 'Payment Confirmation',
            template: 'payment-confirmation'
          },
          position: { x: 900, y: 50 },
          connections: []
        },
        {
          id: 'payment-error',
          type: 'action',
          name: 'Payment Error',
          description: 'Handle payment error',
          config: { message: 'Payment processing failed' },
          position: { x: 500, y: 150 },
          connections: []
        }
      ],
      connections: [
        { id: 'conn1', from: 'payment-trigger', to: 'validate-payment' },
        { id: 'conn2', from: 'validate-payment', to: 'process-payment', condition: 'true' },
        { id: 'conn3', from: 'validate-payment', to: 'payment-error', condition: 'false' },
        { id: 'conn4', from: 'process-payment', to: 'update-order-status' },
        { id: 'conn5', from: 'update-order-status', to: 'send-confirmation' }
      ],
      enabled: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private generateSubscriptionWorkflow(): Workflow {
    return {
      id: 'subscription',
      name: 'Subscription Workflow',
      description: 'Handles subscription management',
      nodes: [
        {
          id: 'subscription-trigger',
          type: 'trigger',
          name: 'Subscription Trigger',
          description: 'Triggered by subscription events',
          config: { url: '/api/subscriptions' },
          position: { x: 100, y: 100 },
          connections: ['check-subscription-status']
        },
        {
          id: 'check-subscription-status',
          type: 'condition',
          name: 'Check Status',
          description: 'Check subscription status',
          config: {
            condition: 'status',
            operator: 'equals',
            value: 'active'
          },
          position: { x: 300, y: 100 },
          connections: ['renew-subscription', 'cancel-subscription']
        },
        {
          id: 'renew-subscription',
          type: 'action',
          name: 'Renew Subscription',
          description: 'Renew active subscription',
          config: {
            provider: 'stripe',
            action: 'create-subscription'
          },
          position: { x: 500, y: 50 },
          connections: ['send-renewal-email']
        },
        {
          id: 'send-renewal-email',
          type: 'action',
          name: 'Send Renewal Email',
          description: 'Send subscription renewal email',
          config: {
            to: '{{email}}',
            subject: 'Subscription Renewed',
            template: 'subscription-renewal'
          },
          position: { x: 700, y: 50 },
          connections: []
        },
        {
          id: 'cancel-subscription',
          type: 'action',
          name: 'Cancel Subscription',
          description: 'Cancel subscription',
          config: {
            provider: 'stripe',
            action: 'cancel-subscription'
          },
          position: { x: 500, y: 150 },
          connections: ['send-cancellation-email']
        },
        {
          id: 'send-cancellation-email',
          type: 'action',
          name: 'Send Cancellation Email',
          description: 'Send subscription cancellation email',
          config: {
            to: '{{email}}',
            subject: 'Subscription Cancelled',
            template: 'subscription-cancellation'
          },
          position: { x: 700, y: 150 },
          connections: []
        }
      ],
      connections: [
        { id: 'conn1', from: 'subscription-trigger', to: 'check-subscription-status' },
        { id: 'conn2', from: 'check-subscription-status', to: 'renew-subscription', condition: 'true' },
        { id: 'conn3', from: 'check-subscription-status', to: 'cancel-subscription', condition: 'false' },
        { id: 'conn4', from: 'renew-subscription', to: 'send-renewal-email' },
        { id: 'conn5', from: 'cancel-subscription', to: 'send-cancellation-email' }
      ],
      enabled: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private generateDataSyncWorkflow(): Workflow {
    return {
      id: 'data-sync',
      name: 'Data Sync Workflow',
      description: 'Handles data synchronization',
      nodes: [
        {
          id: 'sync-trigger',
          type: 'trigger',
          name: 'Sync Trigger',
          description: 'Triggered by data changes',
          config: { table: 'sync_queue' },
          position: { x: 100, y: 100 },
          connections: ['get-sync-data']
        },
        {
          id: 'get-sync-data',
          type: 'action',
          name: 'Get Sync Data',
          description: 'Get data to sync',
          config: { query: 'SELECT * FROM sync_queue WHERE status = "pending"' },
          position: { x: 300, y: 100 },
          connections: ['sync-to-external']
        },
        {
          id: 'sync-to-external',
          type: 'action',
          name: 'Sync to External',
          description: 'Sync data to external API',
          config: {
            url: '{{external_api_url}}',
            method: 'POST'
          },
          position: { x: 500, y: 100 },
          connections: ['update-sync-status']
        },
        {
          id: 'update-sync-status',
          type: 'action',
          name: 'Update Sync Status',
          description: 'Update sync status',
          config: { query: 'UPDATE sync_queue SET status = "completed" WHERE id = ?' },
          position: { x: 700, y: 100 },
          connections: []
        }
      ],
      connections: [
        { id: 'conn1', from: 'sync-trigger', to: 'get-sync-data' },
        { id: 'conn2', from: 'get-sync-data', to: 'sync-to-external' },
        { id: 'conn3', from: 'sync-to-external', to: 'update-sync-status' }
      ],
      enabled: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private generateAuditLogWorkflow(): Workflow {
    return {
      id: 'audit-log',
      name: 'Audit Log Workflow',
      description: 'Handles audit logging',
      nodes: [
        {
          id: 'audit-trigger',
          type: 'trigger',
          name: 'Audit Trigger',
          description: 'Triggered by user actions',
          config: { url: '/api/audit' },
          position: { x: 100, y: 100 },
          connections: ['log-audit-event']
        },
        {
          id: 'log-audit-event',
          type: 'action',
          name: 'Log Audit Event',
          description: 'Log audit event to database',
          config: {
            query: 'INSERT INTO audit_logs (user_id, action, timestamp, data) VALUES (?, ?, NOW(), ?)'
          },
          position: { x: 300, y: 100 },
          connections: ['check-sensitive-action']
        },
        {
          id: 'check-sensitive-action',
          type: 'condition',
          name: 'Check Sensitive Action',
          description: 'Check if action is sensitive',
          config: {
            condition: 'action',
            operator: 'contains',
            value: 'delete'
          },
          position: { x: 500, y: 100 },
          connections: ['send-security-alert', 'complete-audit']
        },
        {
          id: 'send-security-alert',
          type: 'action',
          name: 'Send Security Alert',
          description: 'Send security alert for sensitive actions',
          config: {
            to: 'security@company.com',
            subject: 'Sensitive Action Detected',
            template: 'security-alert'
          },
          position: { x: 700, y: 50 },
          connections: ['complete-audit']
        },
        {
          id: 'complete-audit',
          type: 'action',
          name: 'Complete Audit',
          description: 'Complete audit logging',
          config: { message: 'Audit logging completed' },
          position: { x: 700, y: 150 },
          connections: []
        }
      ],
      connections: [
        { id: 'conn1', from: 'audit-trigger', to: 'log-audit-event' },
        { id: 'conn2', from: 'log-audit-event', to: 'check-sensitive-action' },
        { id: 'conn3', from: 'check-sensitive-action', to: 'send-security-alert', condition: 'true' },
        { id: 'conn4', from: 'check-sensitive-action', to: 'complete-audit', condition: 'false' },
        { id: 'conn5', from: 'send-security-alert', to: 'complete-audit' }
      ],
      enabled: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}