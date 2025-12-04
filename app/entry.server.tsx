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
  const body = await renderToString(
    <RemixServer context={remixContext} url={request.url} />,
  );

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Aurion - L'ingénieur IA fullstack qui transforme vos idées en réalité" />
  <title>Aurion - AI Fullstack Engineer</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" href="/favicon.ico" />
  <meta property="og:title" content="Aurion - AI Fullstack Engineer" />
  <meta property="og:description" content="Créez des applications complètes en quelques secondes avec l'IA" />
  <meta property="og:image" content="/project-visibility.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Aurion - AI Fullstack Engineer" />
  <meta name="twitter:description" content="Créez des applications complètes en quelques secondes avec l'IA" />
  <meta name="twitter:image" content="/social_preview_index.jpg" />
</head>
<body>
  <div id="root">${body}</div>
</body>
</html>`;

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
  responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

  return new Response(html, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
