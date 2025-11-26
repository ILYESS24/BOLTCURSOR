/**
 * Endpoint de santé ultra-simplifié pour Cloudflare Workers
 */

import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    return json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Application is operational',
      version: '1.0.0',
      platform: 'Cloudflare Workers'
    });
  } catch (error) {
    return json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function action({ request }: LoaderFunctionArgs) {
  return json({
    message: 'Health endpoint action',
    timestamp: new Date().toISOString()
  });
}