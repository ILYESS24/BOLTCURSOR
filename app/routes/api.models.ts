/**
 * 📋 API MODÈLES - Récupère tous les modèles OpenRouter
 */

import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { aiService } from '~/lib/ai-service';

export async function loader({ context }: LoaderFunctionArgs) {
  try {
    const env = context?.cloudflare?.env;
    
    // Récupérer tous les modèles depuis OpenRouter
    const openRouterModels = await aiService.fetchOpenRouterModels(env);
    
    // Convertir au format AIModel
    const models = openRouterModels.map((model: any) => {
      // Calculer le coût moyen par token (basé sur pricing si disponible)
      const pricing = model.pricing || {};
      const promptPrice = pricing.prompt || 0;
      const completionPrice = pricing.completion || 0;
      const avgCostPerToken = (promptPrice + completionPrice) / 2 / 1000000; // Convertir de $/1M tokens à $/token
      
      // Déterminer les capacités basées sur le nom et la description
      const nameLower = (model.name || '').toLowerCase();
      const descLower = (model.description || '').toLowerCase();
      const capabilities: string[] = [];
      
      if (nameLower.includes('code') || nameLower.includes('coder') || descLower.includes('code')) {
        capabilities.push('code');
      }
      if (nameLower.includes('vision') || nameLower.includes('multimodal') || descLower.includes('image')) {
        capabilities.push('multimodal');
      }
      if (nameLower.includes('research') || nameLower.includes('web') || descLower.includes('search')) {
        capabilities.push('research');
        capabilities.push('web');
      }
      if (!capabilities.includes('code')) {
        capabilities.push('analysis', 'creative');
      }
      if (nameLower.includes('reasoning') || descLower.includes('reason')) {
        capabilities.push('reasoning');
      }
      
      return {
        id: model.id,
        name: model.name || model.id.split('/').pop() || model.id,
        provider: 'openrouter' as const,
        maxTokens: model.context_length || 4096,
        costPerToken: avgCostPerToken || 0.000001,
        capabilities: capabilities.length > 0 ? capabilities : ['code', 'analysis', 'creative'],
        description: model.description || `${model.name || model.id} via OpenRouter`
      };
    });
    
    // Trier par nom pour faciliter la navigation
    models.sort((a, b) => a.name.localeCompare(b.name));
    
    return json({
      models,
      count: models.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Models API] Error:', error);
    return json({
      error: 'Erreur lors de la récupération des modèles',
      message: (error as Error).message,
      models: []
    }, { status: 500 });
  }
}

