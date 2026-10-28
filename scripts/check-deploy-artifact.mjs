#!/usr/bin/env node
// Pre-deploy check: runs the post-deploy live-site check against the build
// artifact exactly as the deploy job downloads it, served through wrangler's
// local Pages runtime. Catches files lost between build and deploy (e.g.
// upload-artifact dropping hidden directories like .well-known/) on the PR,
// instead of after the merge, when production is already broken.
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { startPagesDevServer } from './lib/pages-dev-server.mjs';

const PORT = 45679;
const BROWSER_DIST = join('dist', 'angular-portfolio', 'browser');

const server = await startPagesDevServer(BROWSER_DIST, PORT);
let status;
try {
  ({ status } = spawnSync(process.execPath, ['scripts/check-live-site.mjs', server.url], {
    stdio: 'inherit',
    env: { ...process.env, ATTEMPTS: '1' },
  }));
} finally {
  server.stop();
}
process.exit(status ?? 1);
