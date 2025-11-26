/**
 * 🤖 SERVICE IA UNIFIÉ
 * Interface unifiée pour OpenAI, Anthropic et DeepSeek
 */

import { AI_MODELS, getModelById, estimateCost } from './ai-config';

// Type pour les variables d'environnement Cloudflare
interface Env {
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
  timestamp: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

class AIService {
  private openaiApiKey: string;
  private anthropicApiKey: string;
  private deepseekApiKey: string;
  private env?: Env;

  constructor(env?: Env) {
    // Support pour Cloudflare Workers/Pages via context.env
    // Fallback sur process.env pour compatibilité
    this.env = env;
    this.openaiApiKey = env?.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';
    this.anthropicApiKey = env?.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || '';
    this.deepseekApiKey = env?.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY || '';
  }

  public async chat(request: ChatRequest): Promise<ChatResponse> {
    const model = request.model || 'gpt-4';
    const aiModel = getModelById(model);
    
    if (!aiModel) {
      throw new Error(`Modèle non supporté: ${model}`);
    }

    // Liste des modèles de fallback à essayer en cas d'erreur
    const fallbackModels = [
      { id: 'deepseek-chat', provider: 'deepseek' },
      { id: 'gpt-3.5-turbo', provider: 'openai' },
      { id: 'claude-3-haiku', provider: 'anthropic' },
      { id: 'claude-3-sonnet', provider: 'anthropic' }
    ];
    
    let lastError: Error | null = null;
    const triedProviders = new Set<string>();
    
    // Essayer d'abord le modèle demandé
    try {
      if (aiModel.provider === 'openai') {
        triedProviders.add('openai');
        return await this.chatWithOpenAI(request, aiModel);
      } else if (aiModel.provider === 'anthropic') {
        triedProviders.add('anthropic');
        return await this.chatWithAnthropic(request, aiModel);
      } else if (aiModel.provider === 'deepseek') {
        triedProviders.add('deepseek');
        return await this.chatWithDeepSeek(request, aiModel);
      } else {
        throw new Error(`Provider non supporté: ${aiModel.provider}`);
      }
    } catch (error) {
      lastError = error as Error;
      
      // Si c'est une erreur de quota/payment, essayer d'autres modèles
      const isQuotaError = (error as any)?.isQuotaError || (error as any)?.status === 429 || (error as any)?.status === 402;
      
      if (isQuotaError) {
        // Essayer les modèles de fallback dans l'ordre
        for (const fallback of fallbackModels) {
          if (triedProviders.has(fallback.provider)) continue;
          
          const fallbackModel = getModelById(fallback.id);
          if (!fallbackModel) continue;
          
          // Vérifier que la clé API est disponible
          if (fallback.provider === 'openai' && !this.openaiApiKey) continue;
          if (fallback.provider === 'anthropic' && !this.anthropicApiKey) continue;
          if (fallback.provider === 'deepseek' && !this.deepseekApiKey) continue;
          
          try {
            triedProviders.add(fallback.provider);
            
            if (fallback.provider === 'openai') {
              return await this.chatWithOpenAI(request, fallbackModel);
            } else if (fallback.provider === 'anthropic') {
              return await this.chatWithAnthropic(request, fallbackModel);
            } else if (fallback.provider === 'deepseek') {
              return await this.chatWithDeepSeek(request, fallbackModel);
            }
          } catch (fallbackError) {
            lastError = fallbackError as Error;
          }
        }
      }
      
      throw lastError || error;
    }
  }

  private async chatWithOpenAI(request: ChatRequest, model: any): Promise<ChatResponse> {
    if (!this.openaiApiKey) {
      throw new Error('Clé API OpenAI non configurée');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.id,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || model.maxTokens,
        stream: request.stream || false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      // Détecter les erreurs de quota/rate limit/payment
      if (response.status === 429 || response.status === 402 || 
          errorText.includes('quota') || errorText.includes('insufficient') || 
          errorText.includes('rate limit') || errorText.includes('payment') ||
          errorText.includes('billing') || errorText.includes('credit')) {
        const quotaError = new Error(`Quota OpenAI insuffisant, crédits épuisés ou paiement requis`);
        (quotaError as any).status = response.status;
        (quotaError as any).isQuotaError = true;
        (quotaError as any).provider = 'openai';
        throw quotaError;
      }
      
      throw new Error(`Erreur OpenAI: ${response.status} - ${errorData.message || errorText}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      model: model.id,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      },
      cost: estimateCost(model.id, data.usage.prompt_tokens, data.usage.completion_tokens),
      timestamp: new Date().toISOString()
    };
  }

  private async chatWithAnthropic(request: ChatRequest, model: any): Promise<ChatResponse> {
    if (!this.anthropicApiKey) {
      throw new Error('Clé API Anthropic non configurée');
    }

    // Convertir les messages pour Anthropic
    const systemMessage = request.messages.find(m => m.role === 'system');
    const userMessages = request.messages.filter(m => m.role === 'user');
    const assistantMessages = request.messages.filter(m => m.role === 'assistant');

    const messages = userMessages.map((msg, index) => ({
      role: 'user',
      content: msg.content
    }));

    // Ajouter les messages de l'assistant
    assistantMessages.forEach((msg, index) => {
      messages.push({
        role: 'assistant',
        content: msg.content
      });
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model.id,
        max_tokens: request.maxTokens || model.maxTokens,
        temperature: request.temperature || 0.7,
        system: systemMessage?.content || 'Tu es un assistant IA utile et intelligent.',
        messages: messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      // Détecter les erreurs de quota/rate limit/payment
      if (response.status === 429 || response.status === 402 || 
          errorText.includes('quota') || errorText.includes('insufficient') || 
          errorText.includes('rate limit') || errorText.includes('payment') ||
          errorText.includes('billing') || errorText.includes('credit')) {
        const quotaError = new Error(`Quota Anthropic insuffisant, crédits épuisés ou paiement requis`);
        (quotaError as any).status = response.status;
        (quotaError as any).isQuotaError = true;
        (quotaError as any).provider = 'anthropic';
        throw quotaError;
      }
      
      throw new Error(`Erreur Anthropic: ${response.status} - ${errorData.error?.message || errorText}`);
    }

    const data = await response.json();
    
    return {
      content: data.content[0].text,
      model: model.id,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens
      },
      cost: estimateCost(model.id, data.usage.input_tokens, data.usage.output_tokens),
      timestamp: new Date().toISOString()
    };
  }

  public async generateCode(prompt: string, language: string = 'javascript'): Promise<ChatResponse> {
    const systemPrompt = `Tu es un expert en programmation. Génère du code ${language} de haute qualité, bien commenté et optimisé.`;
    
    return await this.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      model: 'gpt-4',
      temperature: 0.3
    });
  }

  public async analyzeCode(code: string, language: string = 'javascript'): Promise<ChatResponse> {
    const systemPrompt = `Tu es un expert en analyse de code. Analyse le code ${language} fourni et donne des recommandations d'amélioration.`;
    
    return await this.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyse ce code ${language}:\n\n\`\`\`${language}\n${code}\n\`\`\`` }
      ],
      model: 'claude-3-sonnet',
      temperature: 0.2
    });
  }

  public async generateDocumentation(code: string, language: string = 'javascript'): Promise<ChatResponse> {
    const systemPrompt = `Tu es un expert en documentation de code. Génère une documentation claire et complète pour le code ${language} fourni.`;
    
    return await this.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Documente ce code ${language}:\n\n\`\`\`${language}\n${code}\n\`\`\`` }
      ],
      model: 'gpt-4',
      temperature: 0.1
    });
  }

  public getAvailableModels(): any[] {
    return AI_MODELS.map(model => ({
      id: model.id,
      name: model.name,
      provider: model.provider,
      capabilities: model.capabilities,
      description: model.description
    }));
  }

  private async chatWithDeepSeek(request: ChatRequest, model: any): Promise<ChatResponse> {
    if (!this.deepseekApiKey) {
      throw new Error('Clé API DeepSeek non configurée');
    }

    // DeepSeek utilise une API compatible OpenAI
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.id,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || model.maxTokens,
        stream: request.stream || false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      // Détecter les erreurs de quota/rate limit/payment
      if (response.status === 429 || response.status === 402 || 
          errorText.includes('quota') || errorText.includes('insufficient') || 
          errorText.includes('rate limit') || errorText.includes('payment') ||
          errorText.includes('billing') || errorText.includes('credit')) {
        const quotaError = new Error(`Quota DeepSeek insuffisant, crédits épuisés ou paiement requis`);
        (quotaError as any).status = response.status;
        (quotaError as any).isQuotaError = true;
        (quotaError as any).provider = 'deepseek';
        throw quotaError;
      }
      
      throw new Error(`Erreur DeepSeek: ${response.status} - ${errorData.error?.message || errorText}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      model: model.id,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      },
      cost: estimateCost(model.id, data.usage.prompt_tokens, data.usage.completion_tokens),
      timestamp: new Date().toISOString()
    };
  }

  public isConfigured(): boolean {
    return !!(this.openaiApiKey || this.anthropicApiKey || this.deepseekApiKey);
  }

  public getConfigurationStatus(): {
    openai: boolean;
    anthropic: boolean;
    deepseek: boolean;
    configured: boolean;
  } {
    return {
      openai: !!this.openaiApiKey,
      anthropic: !!this.anthropicApiKey,
      deepseek: !!this.deepseekApiKey,
      configured: !!(this.openaiApiKey || this.anthropicApiKey || this.deepseekApiKey)
    };
  }
}

// Instance globale
let aiServiceInstance: AIService | null = null;

export function getAIService(env?: Env): AIService {
  if (!aiServiceInstance || env) {
    aiServiceInstance = new AIService(env);
  }
  return aiServiceInstance;
}

export const aiService = {
  chat: (request: ChatRequest, env?: Env) => getAIService(env).chat(request),
  generateCode: (prompt: string, language?: string, env?: Env) => getAIService(env).generateCode(prompt, language),
  analyzeCode: (code: string, language?: string, env?: Env) => getAIService(env).analyzeCode(code, language),
  generateDocumentation: (code: string, language?: string, env?: Env) => getAIService(env).generateDocumentation(code, language),
  getAvailableModels: (env?: Env) => getAIService(env).getAvailableModels(),
  isConfigured: (env?: Env) => getAIService(env).isConfigured(),
  getConfigurationStatus: (env?: Env) => getAIService(env).getConfigurationStatus()
};
