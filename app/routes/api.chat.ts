/**
 * 💬 API CHAT AVEC INTÉGRATION IA
 * Endpoint pour les conversations avec l'IA
 */

import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { aiService } from '~/lib/ai-service';
import { errorHandler } from '~/lib/utils/error-handler';
import { alerting } from '~/lib/utils/alerting';
import { cloudflareCache } from '~/lib/utils/cloudflare-cache';

export async function action({ request, context }: ActionFunctionArgs) {
  const startTime = Date.now();
  const requestId = `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const env = context?.cloudflare?.env;
  
  try {
    // Vérifier la configuration IA
    let configStatus;
    try {
      configStatus = aiService.getConfigurationStatus(env);
    } catch (e) {
      console.error('[Chat API] Error getting config status:', e);
      return json({
        error: 'Erreur de configuration',
        message: 'Impossible de vérifier la configuration IA',
        details: e instanceof Error ? e.message : String(e)
      }, { status: 500 });
    }
    
    if (!configStatus.configured) {
      return json({
        error: 'Service IA non configuré',
        message: 'Les clés API ne sont pas configurées',
        configuration: configStatus
      }, { status: 503 });
    }

    // Parser la requête
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return json({
        error: 'Requête invalide',
        message: 'Le corps de la requête n\'est pas un JSON valide'
      }, { status: 400 });
    }
    
    const { message, model = 'deepseek-chat' } = body;

    if (!message || typeof message !== 'string') {
      return json({
        error: 'Message requis',
        message: 'Le champ message est obligatoire'
      }, { status: 400 });
    }

    // Vérifier le cache (utiliser btoa au lieu de Buffer pour Cloudflare Workers)
    const cacheKey = `chat:${model}:${btoa(unescape(encodeURIComponent(message)))}`;
    let cachedResponse = null;
    try {
      cachedResponse = cloudflareCache.get(cacheKey);
    } catch (e) {
      // Ignorer les erreurs de cache
    }
    
    if (cachedResponse) {
      return json({
        ...cachedResponse,
        cached: true,
        requestId
      });
    }

    // Préparer les messages pour l'IA
    const messages = [
      {
        role: 'system' as const,
        content: `Tu es un assistant IA intelligent et utile. Tu peux aider avec la programmation, l'analyse, la génération de code, et bien d'autres tâches. Réponds de manière claire et professionnelle.`
      },
      {
        role: 'user' as const,
        content: message
      }
    ];

    // Appeler le service IA
    let aiResponse;
    try {
      aiResponse = await aiService.chat({
        messages,
        model,
        temperature: 0.7,
        maxTokens: 4000
      }, env);
    } catch (e) {
      const error = e as Error;
      
      // Détecter les erreurs de quota/payment
      const status = (error as any)?.status || 500;
      if ((error as any)?.isQuotaError || status === 429 || status === 402 || 
          error.message.includes('quota') || error.message.includes('insufficient') ||
          error.message.includes('payment') || error.message.includes('billing') ||
          error.message.includes('credit')) {
        const isPaymentError = status === 402 || error.message.includes('payment') || error.message.includes('billing');
        return json({
          error: isPaymentError ? 'Paiement requis' : 'Quota insuffisant',
          message: isPaymentError 
            ? 'Les crédits de l\'API IA sont épuisés ou un paiement est requis. Veuillez recharger votre compte API ou configurer un mode de paiement.'
            : 'Le quota de l\'API IA est insuffisant ou a été atteint. Veuillez réessayer plus tard ou recharger votre compte API.',
          details: error.message,
          requestId,
          timestamp: new Date().toISOString()
        }, { status: status === 402 ? 402 : 429 });
      }
      
      throw e; // Re-throw pour être capturé par le catch global
    }

    // Préparer la réponse
    const response = {
      response: aiResponse.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      cost: aiResponse.cost,
      timestamp: aiResponse.timestamp,
      requestId,
      cached: false
    };

    // Mettre en cache la réponse (TTL: 1 heure)
    try {
      cloudflareCache.set(cacheKey, response, 3600000);
    } catch (e) {
      // Ignorer les erreurs de cache
    }

    // Enregistrer les métriques
    const responseTime = Date.now() - startTime;

    // Vérifier les alertes (optionnel, ne pas bloquer en cas d'erreur)
    try {
      if (responseTime > 5000) {
        alerting.createAlert(
          'slow_chat_response',
          `Réponse chat lente: ${responseTime}ms`,
          'medium',
          { responseTime, model, requestId }
        );
      }

      if (aiResponse.cost > 0.1) {
        alerting.createAlert(
          'high_chat_cost',
          `Coût élevé pour le chat: $${aiResponse.cost.toFixed(4)}`,
          'medium',
          { cost: aiResponse.cost, model, requestId }
        );
      }
    } catch (e) {
      // Ignorer les erreurs d'alerting
    }

    return json(response);

  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    console.error('[Chat API] Error:', errorObj.message);
    
    // Gestion d'erreur avec le système global (optionnel, ne pas bloquer)
    try {
      errorHandler.handleApiError(errorObj, '/api/chat', requestId);
    } catch (e) {
      // Ignorer les erreurs du handler
    }

    // Alerte pour les erreurs critiques (optionnel, ne pas bloquer)
    try {
      alerting.createAlert('chat_api_error', `Erreur dans l'API Chat: ${errorObj.message}`, 'high', { requestId });
    } catch (e) {
      // Ignorer les erreurs d'alerting
    }

    return json({
      error: 'Erreur interne du serveur',
      message: errorObj.message || 'Erreur inconnue',
      requestId,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function loader({ request, context }: ActionFunctionArgs) {
  try {
    const env = context?.cloudflare?.env;
    // Retourner les modèles disponibles
    const models = aiService.getAvailableModels(env);
    const configStatus = aiService.getConfigurationStatus(env);

    return json({
      models,
      configuration: configStatus,
      endpoints: {
        chat: '/api/chat',
        health: '/api/health',
        models: '/api/chat'
      },
      documentation: 'https://docs.ai-assistant.com'
    });
  } catch (error) {
    return json({
      error: 'Erreur lors de la récupération des informations',
      message: (error as Error).message
    }, { status: 500 });
  }
}