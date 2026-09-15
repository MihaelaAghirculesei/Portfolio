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
import { spawn, spawnSync } from 'node:child_process';
import { join } from 'node:path';

const PORT = 45678;
const BASE_URL = `http://localhost:${PORT}`;
const BROWSER_DIST = join('dist', 'angular-portofolio', 'browser');
const ROUTES_TO_CHECK = ['/', '/contact', '/case-study/alina-moments'];

function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    (function poll() {
      fetch(url)
        .then(() => resolve())
        .catch(() => {
          if (Date.now() > deadline) reject(new Error(`server did not come up within ${timeoutMs}ms`));
          else setTimeout(poll, 500);
        });
    })();
  });
}

// wrangler (via its .cmd shim on Windows, or directly on POSIX) spawns its
// own workerd child to actually serve requests. `server.kill()` only signals
// the immediate child — on Windows that's the cmd.exe shim, so the real
// wrangler + workerd processes are orphaned and keep the port (and the
// shared .wrangler/state SQLite files) locked for every run after. Kill the
// whole tree instead: `taskkill /T` on Windows, or the detached process
// group on POSIX.
const wranglerBin = join('node_modules', '.bin', process.platform === 'win32' ? 'wrangler.cmd' : 'wrangler');
const server = spawn(wranglerBin, ['pages', 'dev', BROWSER_DIST, '--port', String(PORT)], {
  stdio: 'ignore',
  shell: process.platform === 'win32',
  detached: process.platform !== 'win32',
});

function stopServer() {
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    try {
      process.kill(-server.pid, 'SIGKILL');
    } catch {
      server.kill('SIGKILL');
    }
  }
}

let exitCode = 0;
try {
  await waitForServer(BASE_URL, 30_000);

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
  } finally {
    await browser.close();
  }
} catch (err) {
  exitCode = 1;
  console.error('[smoke-test]', err.message);
} finally {
  stopServer();
}

if (exitCode === 0) {
  console.log('[smoke-test] all checks passed');
}
process.exit(exitCode);
