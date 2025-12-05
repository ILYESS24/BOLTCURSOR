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
  // OpenAI Models via OpenRouter
  {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openrouter',
    maxTokens: 128000,
    costPerToken: 0.00001,
    capabilities: ['code', 'analysis', 'creative', 'reasoning'],
    description: 'GPT-4 Turbo - Le modèle le plus avancé d\'OpenAI'
  },
  {
    id: 'openai/gpt-4',
    name: 'GPT-4',
    provider: 'openrouter',
    maxTokens: 8192,
    costPerToken: 0.00003,
    capabilities: ['code', 'analysis', 'creative', 'reasoning'],
    description: 'GPT-4 - Modèle premium d\'OpenAI'
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openrouter',
    maxTokens: 128000,
    costPerToken: 0.000005,
    capabilities: ['code', 'analysis', 'creative', 'reasoning', 'multimodal'],
    description: 'GPT-4o - Modèle optimisé et rapide'
  },
  {
    id: 'openai/gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openrouter',
    maxTokens: 16385,
    costPerToken: 0.0000015,
    capabilities: ['code', 'analysis', 'creative'],
    description: 'GPT-3.5 Turbo - Rapide et économique'
  },
  
  // Anthropic Models via OpenRouter
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'openrouter',
    maxTokens: 200000,
    costPerToken: 0.000003,
    capabilities: ['code', 'analysis', 'creative', 'reasoning'],
    description: 'Claude 3.5 Sonnet - Le plus puissant modèle d\'Anthropic'
  },
  {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'openrouter',
    maxTokens: 200000,
    costPerToken: 0.000015,
    capabilities: ['code', 'analysis', 'creative', 'reasoning'],
    description: 'Claude 3 Opus - Excellence en raisonnement'
  },
  {
    id: 'anthropic/claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'openrouter',
    maxTokens: 200000,
    costPerToken: 0.000003,
    capabilities: ['code', 'analysis', 'creative'],
    description: 'Claude 3 Sonnet - Équilibre performance/coût'
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'openrouter',
    maxTokens: 200000,
    costPerToken: 0.00000025,
    capabilities: ['code', 'analysis', 'creative'],
    description: 'Claude 3 Haiku - Rapide et économique'
  },
  
  // Google Models via OpenRouter
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    provider: 'openrouter',
    maxTokens: 1000000,
    costPerToken: 0.000000125,
    capabilities: ['code', 'analysis', 'creative', 'multimodal'],
    description: 'Gemini Pro 1.5 - Contexte ultra-long (1M tokens)'
  },
  {
    id: 'google/gemini-pro',
    name: 'Gemini Pro',
    provider: 'openrouter',
    maxTokens: 32768,
    costPerToken: 0.0000005,
    capabilities: ['code', 'analysis', 'creative'],
    description: 'Gemini Pro - Modèle polyvalent de Google'
  },
  
  // Meta Models via OpenRouter
  {
    id: 'meta-llama/llama-3-70b-instruct',
    name: 'Llama 3 70B',
    provider: 'openrouter',
    maxTokens: 8192,
    costPerToken: 0.0000007,
    capabilities: ['code', 'analysis', 'creative'],
    description: 'Llama 3 70B - Open source puissant'
  },
  {
    id: 'meta-llama/llama-3-8b-instruct',
    name: 'Llama 3 8B',
    provider: 'openrouter',
    maxTokens: 8192,
    costPerToken: 0.0000001,
    capabilities: ['code', 'analysis', 'creative'],
    description: 'Llama 3 8B - Rapide et efficace'
  },
  
  // Mistral Models via OpenRouter
  {
    id: 'mistralai/mistral-large',
    name: 'Mistral Large',
    provider: 'openrouter',
    maxTokens: 32000,
    costPerToken: 0.000002,
    capabilities: ['code', 'analysis', 'creative'],
    description: 'Mistral Large - Excellence européenne'
  },
  {
    id: 'mistralai/mixtral-8x7b-instruct',
    name: 'Mixtral 8x7B',
    provider: 'openrouter',
    maxTokens: 32000,
    costPerToken: 0.00000027,
    capabilities: ['code', 'analysis', 'creative'],
    description: 'Mixtral 8x7B - Modèle MoE performant'
  },
  
  // DeepSeek Models via OpenRouter
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'openrouter',
    maxTokens: 64000,
    costPerToken: 0.00000014,
    capabilities: ['code', 'analysis', 'creative'],
    description: 'DeepSeek Chat - Excellent pour le code'
  },
  {
    id: 'deepseek/deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'openrouter',
    maxTokens: 16000,
    costPerToken: 0.00000014,
    capabilities: ['code'],
    description: 'DeepSeek Coder - Spécialisé en programmation'
  },
  
  // Perplexity Models via OpenRouter
  {
    id: 'perplexity/llama-3.1-sonar-large-128k-online',
    name: 'Perplexity Sonar Large',
    provider: 'openrouter',
    maxTokens: 128000,
    costPerToken: 0.000001,
    capabilities: ['code', 'analysis', 'research', 'web'],
    description: 'Perplexity Sonar - Recherche web en temps réel'
  },
  
  // Cohere Models via OpenRouter
  {
    id: 'cohere/command-r-plus',
    name: 'Command R+',
    provider: 'openrouter',
    maxTokens: 128000,
    costPerToken: 0.000003,
    capabilities: ['code', 'analysis', 'creative'],
    description: 'Command R+ - Modèle avancé de Cohere'
  },
  
  // xAI Models via OpenRouter
  {
    id: 'x-ai/grok-beta',
    name: 'Grok Beta',
    provider: 'openrouter',
    maxTokens: 32768,
    costPerToken: 0.000001,
    capabilities: ['code', 'analysis', 'creative'],
    description: 'Grok Beta - Modèle de xAI'
  }
];

export const DEFAULT_MODEL = 'openai/gpt-4-turbo';
export const FALLBACK_MODEL = 'anthropic/claude-3.5-sonnet';

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

  if (taskLower.includes('creative') || taskLower.includes('writing')) {
    return getModelById('claude-3-sonnet') || AI_MODELS[4];
  }

  return getModelById(DEFAULT_MODEL) || AI_MODELS[0];
}

export function getModelCapabilities(modelId: string): string[] {
  const model = getModelById(modelId);
  return model?.capabilities || [];
}

export function estimateCost(modelId: string, promptTokens: number, completionTokens: number): number {
  const model = getModelById(modelId);
  if (!model) return 0;

  const totalTokens = promptTokens + completionTokens;
  return totalTokens * model.costPerToken;
}