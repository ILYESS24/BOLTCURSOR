import React from 'react';
import type { LinksFunction } from '@remix-run/cloudflare';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';

// Temporarily removed CSS imports to fix build
// import '~/styles/index.scss';
// import '~/styles/aurion-ui.scss';
// import '~/styles/components/index.scss';
// import 'virtual:uno.css';

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


export default function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
