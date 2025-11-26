import React from 'react';
import type { LinksFunction } from '@remix-run/cloudflare';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';

// Import styles
import tailwindReset from '~/styles/index.scss';
import globalStyles from '~/styles/aurion-ui.scss';
import componentStyles from '~/styles/components/index.scss';
import 'virtual:uno.css';

export const links: LinksFunction = () => [
  // Styles
  { rel: 'stylesheet', href: tailwindReset },
  { rel: 'stylesheet', href: globalStyles },
  { rel: 'stylesheet', href: componentStyles },

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
