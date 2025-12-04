/**
 * Script pour récupérer tous les modèles OpenRouter et les ajouter à la configuration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchOpenRouterModels() {
  const apiKey = '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';

  try {
    console.log('Fetching OpenRouter models...');

    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    const models = data.data || [];

    console.log(`Found ${models.length} models from OpenRouter`);

    // Convertir les modèles OpenRouter au format AIModel
    const aiModels = models.map(model => ({
      id: model.id,
      name: model.name || model.id.split('/').pop(),
      provider: 'openrouter',
      maxTokens: model.context_length || 4096,
      costPerToken: calculateCostPerToken(model),
      capabilities: determineCapabilities(model),
      description: model.description || `${model.name} via OpenRouter`
    }));

    // Lire le fichier de configuration actuel
    const configPath = path.join(__dirname, '..', 'app', 'lib', 'ai-config.ts');
    let configContent = fs.readFileSync(configPath, 'utf8');

    // Trouver la section AI_MODELS
    const modelsStart = configContent.indexOf('export const AI_MODELS: AIModel[] = [');
    const modelsEnd = configContent.indexOf('];', modelsStart) + 2;

    if (modelsStart === -1) {
      throw new Error('Could not find AI_MODELS array in config file');
    }

    // Extraire les modèles existants
    const existingModelsSection = configContent.substring(modelsStart, modelsEnd);

    // Créer la nouvelle section avec tous les modèles
    const existingModels = configContent.substring(0, modelsStart);
    const afterModels = configContent.substring(modelsEnd);

    // Générer le code pour les nouveaux modèles OpenRouter
    const openRouterModelsCode = aiModels.map(model => {
      // Échapper correctement les chaînes pour TypeScript
      const escapedName = model.name.replace(/'/g, "\\'").replace(/"/g, '\\"');
      const escapedDescription = model.description
        .replace(/\\/g, '\\\\')  // Échapper les backslashes
        .replace(/'/g, "\\'")    // Échapper les single quotes
        .replace(/"/g, '\\"')    // Échapper les double quotes
        .replace(/\n/g, '\\n')   // Échapper les nouvelles lignes
        .replace(/\r/g, '\\r')   // Échapper les retours chariot
        .replace(/\t/g, '\\t');  // Échapper les tabulations

      return `  {
    id: '${model.id}',
    name: '${escapedName}',
    provider: '${model.provider}',
    maxTokens: ${model.maxTokens},
    costPerToken: ${model.costPerToken},
    capabilities: ${JSON.stringify(model.capabilities)},
    description: '${escapedDescription}'
  }`;
    }).join(',\n');

    // Insérer les modèles OpenRouter après les modèles existants
    const newModelsSection = existingModelsSection.replace(
      '];',
      `,
${openRouterModelsCode}
];`
    );

    const newConfigContent = existingModels + newModelsSection + afterModels;

    // Écrire le fichier mis à jour
    fs.writeFileSync(configPath, newConfigContent);

    console.log(`Successfully added ${aiModels.length} OpenRouter models to configuration`);

    // Afficher un résumé
    console.log('\n=== OpenRouter Models Added ===');
    const providers = {};
    aiModels.forEach(model => {
      const provider = model.id.split('/')[0];
      providers[provider] = (providers[provider] || 0) + 1;
    });

    Object.entries(providers).forEach(([provider, count]) => {
      console.log(`${provider}: ${count} models`);
    });

  } catch (error) {
    console.error('Error fetching OpenRouter models:', error);
    process.exit(1);
  }
}

function calculateCostPerToken(model) {
  // Calculer le coût par token basé sur les prix OpenRouter
  const pricing = model.pricing || {};
  const promptPrice = pricing.prompt || 0;
  const completionPrice = pricing.completion || 0;

  // Utiliser le prix le plus élevé entre prompt et completion
  const maxPrice = Math.max(promptPrice, completionPrice);

  // Convertir de "par million de tokens" à "par token"
  return maxPrice / 1000000 || 0.000001; // Prix par défaut très bas si non spécifié
}

function determineCapabilities(model) {
  const capabilities = [];

  // Analyse basique des capacités basée sur le nom du modèle et sa description
  const modelId = model.id.toLowerCase();
  const description = (model.description || '').toLowerCase();

  if (modelId.includes('gpt') || modelId.includes('claude') || modelId.includes('deepseek')) {
    capabilities.push('text-generation');
  }

  if (modelId.includes('gpt') || modelId.includes('claude') || modelId.includes('deepseek') ||
      modelId.includes('code') || description.includes('code')) {
    capabilities.push('code-generation');
  }

  if (modelId.includes('gpt-4') || modelId.includes('claude-3') || modelId.includes('deepseek-v3')) {
    capabilities.push('analysis', 'reasoning');
  }

  if (model.context_length && model.context_length > 100000) {
    capabilities.push('long-context');
  }

  if (modelId.includes('turbo') || modelId.includes('haiku') || modelId.includes('fast')) {
    capabilities.push('fast-response');
  }

  // Assurer au moins une capacité de base
  if (capabilities.length === 0) {
    capabilities.push('text-generation');
  }

  return capabilities;
}

// Exécuter le script
fetchOpenRouterModels();
