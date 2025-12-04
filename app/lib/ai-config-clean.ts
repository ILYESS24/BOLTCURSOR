/**
 * 🤖 CONFIGURATION DES MODÈLES IA
 * Configuration centralisée pour OpenAI et Anthropic
 */

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'deepseek' | 'openrouter';
  maxTokens: number;
  costPerToken: number;
  capabilities: string[];
  description: string;
}

export const AI_MODELS: AIModel[] = [
  // OpenAI Models
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    maxTokens: 8192,
    costPerToken: 0.00003,
    capabilities: ['text-generation', 'code-generation', 'analysis', 'reasoning'],
    description: 'Modèle le plus avancé d\'OpenAI, excellent pour le raisonnement complexe'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    maxTokens: 128000,
    costPerToken: 0.00001,
    capabilities: ['text-generation', 'code-generation', 'analysis', 'long-context'],
    description: 'Version optimisée de GPT-4 avec contexte étendu'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    maxTokens: 4096,
    costPerToken: 0.000002,
    capabilities: ['text-generation', 'code-generation', 'chat'],
    description: 'Modèle rapide et économique pour la plupart des tâches'
  },

  // Anthropic Models
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    maxTokens: 200000,
    costPerToken: 0.000015,
    capabilities: ['text-generation', 'analysis', 'reasoning', 'long-context'],
    description: 'Modèle le plus puissant d\'Anthropic, excellent pour l\'analyse'
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    maxTokens: 200000,
    costPerToken: 0.000003,
    capabilities: ['text-generation', 'code-generation', 'analysis', 'long-context'],
    description: 'Équilibre parfait entre performance et coût'
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    maxTokens: 200000,
    costPerToken: 0.00000025,
    capabilities: ['text-generation', 'code-generation', 'fast-response'],
    description: 'Modèle rapide et économique pour les tâches simples'
  },

  // DeepSeek Models
  {
    id: 'deepseek-chat',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    maxTokens: 64000,
    costPerToken: 0.00000014,
    capabilities: ['text-generation', 'code-generation', 'analysis', 'reasoning', 'long-context'],
    description: 'Modèle DeepSeek V3 avancé, excellent pour la génération de code et le raisonnement'
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'deepseek',
    maxTokens: 16000,
    costPerToken: 0.00000014,
    capabilities: ['code-generation', 'code-analysis', 'debugging'],
    description: 'Modèle spécialisé pour la génération et l\'analyse de code'
  }
];

export const DEFAULT_MODEL = 'gpt-4';
export const FALLBACK_MODEL = 'claude-3-sonnet';

export function getModelById(id: string): AIModel | undefined {
  return AI_MODELS.find(model => model.id === id);
}

export function getModelsByProvider(provider: 'openai' | 'anthropic' | 'deepseek' | 'openrouter'): AIModel[] {
  return AI_MODELS.filter(model => model.provider === provider);
}

export function getRecommendedModel(task: string): AIModel {
  const taskLower = task.toLowerCase();

  if (taskLower.includes('code') || taskLower.includes('programming')) {
    return getModelById('gpt-4') || AI_MODELS[0];
  }

  if (taskLower.includes('analysis') || taskLower.includes('research')) {
    return getModelById('claude-3-opus') || AI_MODELS[3];
  }

  if (taskLower.includes('chat') || taskLower.includes('conversation')) {
    return getModelById('claude-3-sonnet') || AI_MODELS[4];
  }

  return getModelById(DEFAULT_MODEL) || AI_MODELS[0];
}

export function getModelCapabilities(modelId: string): string[] {
  const model = getModelById(modelId);
  return model?.capabilities || [];
}

export function estimateCost(modelId: string, inputTokens: number, outputTokens: number): number {
  const model = getModelById(modelId);
  if (!model) return 0;

  const totalTokens = inputTokens + outputTokens;
  return totalTokens * model.costPerToken;
}
