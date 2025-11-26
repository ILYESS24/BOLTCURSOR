import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { StreamingTextResponse, parseStreamPart } from 'ai';
import { streamText } from '~/lib/.server/llm/stream-text';
import { stripIndents } from '~/utils/stripIndent';
import { withTimeout, TIMEOUT_CONFIG } from '~/lib/utils/timeout';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function action(args: ActionFunctionArgs) {
  return enhancerAction(args);
}

async function enhancerAction({ context, request }: ActionFunctionArgs) {
  // Validation et gestion d'erreur robuste
  if (!request) {
    return new Response(JSON.stringify({ error: 'Request is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let message: string;
  try {
    const body = await request.json();
    if (!body || !body.message || typeof body.message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    message = body.message;
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Vérification de l'environnement
  if (!context?.cloudflare?.env) {
    return new Response(JSON.stringify({ error: 'Environment not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const result = await withTimeout(
      streamText(
        [
          {
            role: 'user',
            content: stripIndents`
            I want you to improve the user prompt that is wrapped in \`<original_prompt>\` tags.

            IMPORTANT: Only respond with the improved prompt and nothing else!

            <original_prompt>
              ${message}
            </original_prompt>
          `,
          },
        ],
        context.cloudflare.env,
      ),
      TIMEOUT_CONFIG.ENHANCER,
      'Enhancer request timeout'
    );

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const processedChunk = decoder
          .decode(chunk)
          .split('\n')
          .filter((line) => line !== '')
          .map(parseStreamPart)
          .map((part) => part.value)
          .join('');

        controller.enqueue(encoder.encode(processedChunk));
      },
    });

    const transformedStream = result.toAIStream().pipeThrough(transformStream);

    return new StreamingTextResponse(transformedStream);
  } catch (error) {
    console.error('Enhancer API Error:', error);
    
    // Gestion d'erreur améliorée
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return new Response(JSON.stringify({ error: 'Request timeout' }), {
          status: 408,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (error.message.includes('rate limit')) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
