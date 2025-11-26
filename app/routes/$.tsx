// Catch-all route for any unmatched URLs - Remix convention
export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);

  // Handle favicon.ico specifically
  if (url.pathname === '/favicon.ico') {
    const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
  <rect width="16" height="16" rx="2" fill="#1389fd" />
  <path d="M7.398 9.091h-3.58L10.364 2 8.602 6.909h3.58L5.636 14l1.762-4.909Z" fill="#fff" />
</svg>`;

    return new Response(faviconSvg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  }

  // For other unmatched routes, return 404
  throw new Response('Not Found', { status: 404 });
}
