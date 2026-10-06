#!/usr/bin/env node
// Accessibility gate: scans every page of the production build for WCAG 2.1 AA
// violations with bfsg-scanner (axe-core in Chromium, findings mapped to
// EN 301 549 / BFSG clauses) and fails on any `serious` or `critical` finding.
//
// The scanner discovers pages from sitemap.xml, whose URLs point at the
// production host. Scanning the local build therefore needs a sitemap that
// points at the local server — so this serves a throwaway copy of the build
// with the host rewritten, leaving dist/ (the deploy artifact) untouched.
// Reports (JSON + HTML) land in reports/a11y/.
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { startPagesDevServer } from './lib/pages-dev-server.mjs';

const PORT = 45679;
const PRODUCTION_ORIGIN = 'https://aghirculesei.pages.dev';
const BROWSER_DIST = join('dist', 'angular-portfolio', 'browser');
const OUTPUT_DIR = resolve('reports', 'a11y');

const workDir = mkdtempSync(join(tmpdir(), 'a11y-scan-'));
const siteDir = join(workDir, 'site');
cpSync(BROWSER_DIST, siteDir, { recursive: true });

const sitemapPath = join(siteDir, 'sitemap.xml');
const sitemap = readFileSync(sitemapPath, 'utf8');
writeFileSync(sitemapPath, sitemap.replaceAll(PRODUCTION_ORIGIN, `http://localhost:${PORT}`));
const expectedPages = (sitemap.match(/<loc>/g) ?? []).length;

const configPath = join(workDir, 'bfsg.config.yaml');
writeFileSync(
  configPath,
  [
    `baseUrl: "http://localhost:${PORT}/"`,
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
  server = await startPagesDevServer(siteDir, PORT);
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
