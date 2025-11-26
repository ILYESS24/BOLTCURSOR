import type { AppLoadContext, EntryContext } from '@remix-run/cloudflare';
import { RemixServer } from '@remix-run/react';
import { isbot } from 'isbot';
import { renderToString } from 'react-dom/server';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  _loadContext: AppLoadContext,
) {
  // Simple HTML response without React SSR to avoid getCurrentStack error
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Test - Aurion</title>
</head>
<body>
  <div style="padding: 20px; font-family: Arial, sans-serif;">
    <h1 style="color: #fff; font-size: 2rem; margin-bottom: 1rem;">Test - Aurion</h1>
    <p style="color: #ccc; font-size: 1.1rem; line-height: 1.6;">Page de test simplifiée</p>
  </div>
</body>
</html>`;

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
  responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

  return new Response(html, {
    headers: responseHeaders,
    status: 200,
  });
}
