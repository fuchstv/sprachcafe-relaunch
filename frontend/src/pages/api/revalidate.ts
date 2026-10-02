export const prerender = false;

import type { APIRoute } from 'astro';
import { purgeCache } from '../../lib/cms-api';

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || 'sprachcafe-revalidate-secret-2026';

export const ALL: APIRoute = async ({ request, url }) => {
  const secretParam = url.searchParams.get('secret');
  const authHeader = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  // Allow loopback without secret, or valid secret from anywhere
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
  const isLoopback = clientIp === '127.0.0.1' || clientIp.startsWith('172.18.') || clientIp === '';

  const isAuthorized = (secretParam === REVALIDATE_SECRET) || (authHeader === REVALIDATE_SECRET) || isLoopback;

  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: 'Unauthorized', message: 'Invalid or missing secret' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const key = url.searchParams.get('key') || undefined;
  purgeCache(key);
  console.log(`[Revalidate] Cache purged (${key || 'ALL'}) via ${request.method} from ${clientIp || 'unknown'} [${request.headers.get('x-purge-source') || 'direct'}]`);

  return new Response(
    JSON.stringify({
      success: true,
      purged: key || 'ALL',
      timestamp: new Date().toISOString(),
      message: 'WordPress-Astro cache successfully purged',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
