#!/usr/bin/env node
// Lighthouse CI against the production build (budgets in .lighthouserc.js).
// @lhci/cli is run through npx at a pinned version instead of being a
// devDependency: its puppeteer/extract-zip chain carries open high-severity
// advisories that would otherwise sit in our lockfile and trip Dependabot and
// the dependency-review gate, for a tool that only runs in its own CI job.
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { startPagesDevServer } from './lib/pages-dev-server.mjs';

const LHCI_VERSION = '0.15.1';
const PORT = 45681; // keep in sync with BASE_URL in .lighthouserc.js

let exitCode = 1;
let server;
try {
  server = await startPagesDevServer(join('dist', 'angular-portfolio', 'browser'), PORT);
  const result = spawnSync('npx', ['--yes', `@lhci/cli@${LHCI_VERSION}`, 'autorun'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  exitCode = result.status ?? 1;
} catch (err) {
  console.error('[lighthouse]', err.message);
} finally {
  server?.stop();
}

process.exit(exitCode);
