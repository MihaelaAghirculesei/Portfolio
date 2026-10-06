#!/usr/bin/env node
// Post-deploy check against the live site (default: production; pass another
// base URL as the first argument). Built-ins only, so the deploy job can run it
// without `npm ci`. Retries for a while because a fresh Pages deployment and
// Worker version take a few seconds to propagate.
const SITE = (process.argv[2] ?? 'https://aghirculesei.pages.dev').replace(/\/$/, '');
const WORKER = 'https://api.aghirculesei.workers.dev';
const ATTEMPTS = Number(process.env.ATTEMPTS ?? 6);
const RETRY_DELAY_MS = 10_000;

async function check() {
  const failures = [];

  const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
  const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc.replace(/^https?:\/\/[^/]+/, SITE));
  if (pages.length === 0) failures.push('sitemap.xml lists no pages');
  for (const url of pages) {
    const { status } = await fetch(url);
    if (status !== 200) failures.push(`${url}: HTTP ${status}, expected 200`);
  }

  const home = await fetch(`${SITE}/`);
  if (!home.headers.get('content-security-policy')?.includes("script-src 'self'")) {
    failures.push('/: Content-Security-Policy header missing or without script-src');
  }

  const unknown = await fetch(`${SITE}/this-page-does-not-exist-${Date.now()}`);
  if (unknown.status !== 404) failures.push(`unknown URL: HTTP ${unknown.status}, expected 404`);

  const preflight = await fetch(WORKER, {
    method: 'OPTIONS',
    headers: { Origin: SITE, 'Access-Control-Request-Method': 'POST' },
  });
  if (preflight.status !== 204 || preflight.headers.get('access-control-allow-origin') !== SITE) {
    failures.push(`Worker preflight: HTTP ${preflight.status}, allow-origin ${preflight.headers.get('access-control-allow-origin')}`);
  }

  return { failures, pages: pages.length };
}

for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
  try {
    const { failures, pages } = await check();
    if (failures.length === 0) {
      console.log(`[check-live-site] ${SITE}: ${pages} pages 200, unknown URL 404, CSP present, Worker preflight OK`);
      process.exit(0);
    }
    console.error(`[check-live-site] attempt ${attempt}/${ATTEMPTS}:\n  - ${failures.join('\n  - ')}`);
  } catch (err) {
    console.error(`[check-live-site] attempt ${attempt}/${ATTEMPTS}: ${err.message}`);
  }
  if (attempt < ATTEMPTS) await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
}
process.exit(1);
