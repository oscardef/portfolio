/**
 * First-party endpoint for the analytics tracker (public/v/s.js). It passes each
 * page view or event on to Umami on Oscar's server, so visitors only ever talk to
 * this site: no third-party domain, no cookies.
 *
 * Umami works out the visitor's browser from the user agent and the place from
 * Vercel's location headers; the address is only used to tell visits apart and
 * is never stored.
 */

// Umami's public side on m70q (Caddy lets only the tracker through)
const UPSTREAM = process.env.ANALYTICS_UPSTREAM ?? 'https://stats.defrancesca.com';

const FORWARDED = [
  'user-agent',
  'accept-language',
  'x-umami-cache',
  'x-vercel-ip-country',
  'x-vercel-ip-country-region',
  'x-vercel-ip-city',
];

export async function POST(request: Request) {
  const body = await request.text();
  if (!body || body.length > 16_000) return new Response(null, { status: 400 });

  const headers = new Headers({ 'content-type': 'application/json' });
  for (const name of FORWARDED) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const ip =
    request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (ip) headers.set('x-real-ip', ip);

  try {
    const upstream = await fetch(`${UPSTREAM}/api/send`, {
      method: 'POST',
      headers,
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  } catch {
    // The server may be down; the page doesn't care
    return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
  }
}
