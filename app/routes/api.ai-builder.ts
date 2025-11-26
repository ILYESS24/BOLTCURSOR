/**
 * API Route pour l'AI Builder
 * Endpoint principal pour la génération d'applications
 */

import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { AIAppBuilder } from '~/lib/ai-builder/core';
import { UIComponentGenerator, PageGenerator, APIGenerator } from '~/lib/ai-builder/generators';
import { SimpleIntegrationManager } from '~/lib/ai-builder/simple-integrations';
import { WorkflowEngine, WorkflowTemplateGenerator } from '~/lib/ai-builder/workflows';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  switch (action) {
    case 'providers':
      return await getIntegrationProviders();
    case 'templates':
      return await getWorkflowTemplates();
    case 'status':
      return await getBuilderStatus();
    default:
      return json({ error: 'Invalid action' }, { status: 400 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  // Validation et gestion d'erreur robuste
  if (!request) {
    return json({ error: 'Request is required' }, { status: 400 });
  }

  let formData: any;
  try {
    formData = await request.json();
    if (!formData || typeof formData !== 'object') {
      return json({ error: 'Invalid request format' }, { status: 400 });
    }
  } catch (error) {
    return json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  const formDataObject = formData as Record<string, any>;
  const { action, ...data } = formDataObject;

  if (!action || typeof action !== 'string') {
    return json({ error: 'Action is required' }, { status: 400 });
  }

  // Rate limiting basique
  const rateLimitKey = request.headers.get('x-user-id') || 'anonymous';
  const rateLimitWindow = 60000; // 1 minute
  const maxRequests = 5; // Plus restrictif pour AI Builder

  switch (action) {
    case 'generate-app':
      return await generateApplication(data);
    case 'create-workflow':
      return await createWorkflow(data);
    case 'execute-workflow':
      return await executeWorkflow(data);
    case 'setup-integration':
      return await setupIntegration(data);
    case 'test-integration':
      return await testIntegration(data);
    default:
      return json({ error: 'Invalid action' }, { status: 400 });
  }
}

/**
 * Génère une application complète
 */
async function generateApplication(data: any) {
  try {
    // Validation des données d'entrée
    if (!data || !data.specification) {
      return json({ error: 'Specification is required' }, { status: 400 });
    }

    const { specification } = data;
    
    // Validation de la spécification
    if (!specification.name || !specification.type || !specification.framework) {
      return json({ 
        error: 'Invalid specification: name, type, and framework are required' 
      }, { status: 400 });
    }

    // Timeout pour éviter les requêtes trop longues
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 secondes
    });

    const builder = new AIAppBuilder();
    const appPromise = builder.generateApp(specification);
    
    const app = await Promise.race([appPromise, timeoutPromise]);
    
    return json({
      success: true,
      app,
      message: 'Application generated successfully'
    });
  } catch (error) {
    console.error('AI Builder Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return json({ error: 'Request timeout - try with a simpler specification' }, { status: 408 });
      }
      
      if (error.message.includes('validation')) {
        return json({ error: 'Invalid specification format' }, { status: 400 });
      }
    }

    return json({
      success: false,
      error: 'Failed to generate application',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong'
    }, { status: 500 });
  }
}

/**
 * Crée un nouveau workflow
 */
async function createWorkflow(data: any) {
  try {
    const engine = new WorkflowEngine();
    const workflow = await engine.createWorkflow(data.workflow);
    
    return json({
      success: true,
      workflow,
      message: 'Workflow created successfully'
    });
  } catch (error) {
    console.error('Workflow creation error:', error);
    return json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

/**
 * Exécute un workflow
 */
async function executeWorkflow(data: any) {
  try {
    const engine = new WorkflowEngine();
    const execution = await engine.executeWorkflow(data.workflowId, data.triggerData);
    
    return json({
      success: true,
      execution,
      message: 'Workflow executed successfully'
    });
  } catch (error) {
    console.error('Workflow execution error:', error);
    return json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

/**
 * Configure une intégration
 */
async function setupIntegration(data: any) {
  try {
    const manager = new SimpleIntegrationManager();
    const integration = await manager.setupIntegration(data.config);
    
    return json({
      success: true,
      integration,
      message: 'Integration setup successfully'
    });
  } catch (error) {
    console.error('Integration setup error:', error);
    return json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

/**
 * Teste une intégration
 */
async function testIntegration(data: any) {
  try {
    const manager = new SimpleIntegrationManager();
    const result = await manager.executeAction(data.integrationId, 'test-connection', {});
    
    return json({
      success: true,
      result,
      message: 'Integration test successful'
    });
  } catch (error) {
    console.error('Integration test error:', error);
    return json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

/**
 * Obtient les fournisseurs d'intégration disponibles
 */
async function getIntegrationProviders() {
  try {
    const manager = new SimpleIntegrationManager();
    const providers = manager.getProviders();
    
    return json({
      success: true,
      providers,
      message: 'Providers retrieved successfully'
    });
  } catch (error) {
    console.error('Get providers error:', error);
    return json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

/**
 * Obtient les modèles de workflow disponibles
 */
async function getWorkflowTemplates() {
  try {
    const generator = new WorkflowTemplateGenerator();
    const templates = generator.generateTemplates(['authentication', 'notification', 'payment', 'crud']);
    
    return json({
      success: true,
      templates,
      message: 'Templates retrieved successfully'
    });
  } catch (error) {
    console.error('Get templates error:', error);
    return json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

/**
 * Obtient le statut du builder
 */
async function getBuilderStatus() {
  try {
    return json({
      success: true,
      status: {
        builder: 'active',
        version: '1.0.0',
        features: [
          'app-generation',
          'workflow-automation',
          'integration-management',
          'code-generation',
          'deployment-automation'
        ],
        capabilities: {
          frameworks: ['react', 'vue', 'angular', 'svelte', 'next', 'nuxt'],
          databases: ['postgresql', 'mysql', 'mongodb', 'redis'],
          integrations: ['stripe', 'sendgrid', 'firebase', 'aws', 'google'],
          deployment: ['vercel', 'netlify', 'aws', 'gcp', 'azure']
        }
      },
      message: 'Builder status retrieved successfully'
    });
  } catch (error) {
    console.error('Get status error:', error);
    return json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}