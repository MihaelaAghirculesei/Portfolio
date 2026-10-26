#!/usr/bin/env node
// Accessibility gate: scans every page of the production build for WCAG 2.1 AA
// violations with bfsg-scanner (axe-core in Chromium, findings mapped to
// EN 301 549 / BFSG clauses) and fails on any `serious` or `critical` finding.
//
// The scanner discovers pages from sitemap.xml, whose URLs point at the
// production host. `sitemapOrigin` rewrites those URLs onto the local server,
// so the build in dist/ (the deploy artifact) is served and scanned as is.
// Reports (JSON + HTML) land in reports/a11y/.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { startPagesDevServer } from './lib/pages-dev-server.mjs';

const PORT = 45679;
const PRODUCTION_ORIGIN = 'https://aghirculesei.de';
const BROWSER_DIST = join('dist', 'angular-portfolio', 'browser');
const OUTPUT_DIR = resolve('reports', 'a11y');

const sitemap = readFileSync(join(BROWSER_DIST, 'sitemap.xml'), 'utf8');
const expectedPages = (sitemap.match(/<loc>/g) ?? []).length;

const workDir = mkdtempSync(join(tmpdir(), 'a11y-scan-'));
const configPath = join(workDir, 'bfsg.config.yaml');
writeFileSync(
  configPath,
  [
    `baseUrl: "http://localhost:${PORT}/"`,
    `sitemapOrigin: "${PRODUCTION_ORIGIN}"`,
    `maxPages: ${expectedPages + 1}`,
    // Prerendered HTML is complete on load, but translations and deferred
    // blocks settle after hydration — scan the page the visitor actually sees.
    'settleMs: 1500',
    'failOn: serious',
    'reportLanguage: en',
    'reportFormats: [json, html]',
    `outputDir: ${JSON.stringify(OUTPUT_DIR)}`,
  ].join('\n'),
);

let exitCode = 1;
let server;
try {
  server = await startPagesDevServer(BROWSER_DIST, PORT);
  const scanner = join('node_modules', '.bin', process.platform === 'win32' ? 'bfsg-scanner.cmd' : 'bfsg-scanner');
  const result = spawnSync(scanner, ['--config', configPath], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  exitCode = result.status ?? 1;

  // A scan that silently found fewer pages than the sitemap lists would
  // report "no violations" for pages it never opened.
  const report = JSON.parse(readFileSync(join(OUTPUT_DIR, 'report.json'), 'utf8'));
  if (report.summary.pagesScanned < expectedPages) {
    console.error(`[a11y-scan] scanned ${report.summary.pagesScanned} page(s), but the sitemap lists ${expectedPages}`);
    exitCode = exitCode || 1;
  }
} catch (err) {
  console.error('[a11y-scan]', err.message);
} finally {
  server?.stop();
  rmSync(workDir, { recursive: true, force: true });
}

process.exit(exitCode);
