import React from 'react';
import type { LinksFunction } from '@remix-run/cloudflare';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';

export const links: LinksFunction = () => [
  // Temporarily removed favicon to avoid routing error
  // {
  //   rel: 'icon',
  //   href: '/favicon.svg',
  //   type: 'image/svg+xml',
  // },
];



export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ScrollRestoration />
      <Scripts />
    </>
  );
}

// Handle favicon.ico requests at the root level
export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);

  // Handle favicon.ico requests
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

  // For other routes, return null to let Remix handle normally
  return null;
}

export default function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
