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

export const AI_MODELS: AIModel[] = [];

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