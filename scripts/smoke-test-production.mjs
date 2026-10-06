#!/usr/bin/env node
// Postbuild smoke test: serves the actual dist/ artifact through wrangler's
// local Pages runtime (same _headers/CSP handling Cloudflare Pages applies
// in production) and drives it with a real browser. `npm run e2e` never
// catches this class of bug — it runs against `ng serve`, which sends no
// CSP header and skips the production-only `inlineCritical` build
// optimization, so the exact interaction between the two never occurs
// there. This is what caught the CSP 'unsafe-hashes' regression: the
// deferred stylesheet's inline `onload` handler got silently blocked,
// which never throws a catchable error — it just leaves the stylesheet
// stuck at media="print" forever, and the banner marquee (whose @keyframes
// only live in that stylesheet) never animates.
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { startPagesDevServer } from './lib/pages-dev-server.mjs';

const PORT = 45678;
const BROWSER_DIST = join('dist', 'angular-portofolio', 'browser');
const ROUTES_TO_CHECK = ['/', '/contact', '/case-study/alina-moments'];

let exitCode = 0;
let server;
try {
  server = await startPagesDevServer(BROWSER_DIST, PORT);
  const BASE_URL = server.url;

  // There is no SPA catch-all any more: a route that isn't prerendered would
  // be a hard 404 in production. Every route the build prerendered must be 200.
  const prerendered = JSON.parse(readFileSync(join('dist', 'angular-portofolio', 'prerendered-routes.json'), 'utf8'));
  for (const route of Object.keys(prerendered.routes).filter((r) => r !== '/404')) {
    const { status } = await fetch(`${BASE_URL}${route}`);
    if (status !== 200) {
      exitCode = 1;
      console.error(`[smoke-test] ${route}: HTTP ${status}, expected 200`);
    }
  }
  console.log(`[smoke-test] ${Object.keys(prerendered.routes).length - 1} prerendered routes checked for HTTP 200`);

  const browser = await chromium.launch();
  try {
    for (const route of ROUTES_TO_CHECK) {
      const page = await browser.newPage();
      const consoleErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('pageerror', (err) => consoleErrors.push(`[pageerror] ${err.message}`));

      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });

      if (consoleErrors.length > 0) {
        exitCode = 1;
        console.error(`[smoke-test] ${route}: ${consoleErrors.length} console error(s):`);
        for (const err of consoleErrors) console.error(`  - ${err}`);
      } else {
        console.log(`[smoke-test] ${route}: no console errors`);
      }

      if (route === '/') {
        const media = await page.evaluate(() => {
          const link = [...document.querySelectorAll('link[rel="stylesheet"]')].find((l) => l.href.includes('styles-'));
          return link?.media ?? null;
        });
        if (media !== 'all') {
          exitCode = 1;
          console.error(`[smoke-test] deferred stylesheet media is "${media}", expected "all" — the inline onload handler that promotes it is being blocked (check CSP script-src 'unsafe-hashes')`);
        } else {
          console.log('[smoke-test] deferred stylesheet promoted to media="all"');
        }

        const x1 = await page.evaluate(() => document.querySelector('.banner-track')?.getBoundingClientRect().x ?? null);
        await page.waitForTimeout(1500);
        const x2 = await page.evaluate(() => document.querySelector('.banner-track')?.getBoundingClientRect().x ?? null);
        if (x1 === null || x2 === null) {
          exitCode = 1;
          console.error('[smoke-test] .banner-track not found on the home page');
        } else if (x1 === x2) {
          exitCode = 1;
          console.error('[smoke-test] .banner-track did not move over 1.5s — the scroll animation is not running');
        } else {
          console.log('[smoke-test] banner marquee is animating');
        }
      }

      await page.close();
    }

    // Unknown URLs must get a real 404 (not the home page with a 200), and the
    // 404 page must still boot when served from a nested path — its assets are
    // only reachable there because every URL in it is root-absolute.
    {
      const route = '/this/page/does-not-exist';
      const page = await browser.newPage();
      const consoleErrors = [];
      page.on('console', (msg) => {
        // the browser itself logs the 404 status of the document request
        if (msg.type() === 'error' && !/status of 404/.test(msg.text())) consoleErrors.push(msg.text());
      });
      page.on('pageerror', (err) => consoleErrors.push(`[pageerror] ${err.message}`));

      const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
      const heading = await page.locator('h1').textContent();
      if (response?.status() !== 404) {
        exitCode = 1;
        console.error(`[smoke-test] ${route}: HTTP ${response?.status()}, expected 404 — is 404.html published and the SPA catch-all gone from _redirects?`);
      } else if (heading?.trim() !== 'Page not found') {
        exitCode = 1;
        console.error(`[smoke-test] ${route}: h1 is "${heading}", expected the not-found page`);
      } else if (consoleErrors.length > 0) {
        exitCode = 1;
        console.error(`[smoke-test] ${route}: ${consoleErrors.length} console error(s):`);
        for (const err of consoleErrors) console.error(`  - ${err}`);
      } else {
        console.log(`[smoke-test] ${route}: HTTP 404 with the not-found page, no console errors`);
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
} catch (err) {
  exitCode = 1;
  console.error('[smoke-test]', err.message);
} finally {
  server?.stop();
}

if (exitCode === 0) {
  console.log('[smoke-test] all checks passed');
}
process.exit(exitCode);
