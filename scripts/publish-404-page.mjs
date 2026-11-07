#!/usr/bin/env node
// Postbuild step: Cloudflare Pages answers any URL that matches no asset with
// the closest 404.html (same directory first, then up to the top-level one)
// and a real 404 status — but only if those files exist. The /404 and /de/404
// routes are prerendered to 404/index.html like every other route, so publish
// each under the name Pages looks for. Runs after
// absolutize-preload-links.mjs (the pages are served at arbitrary depths, so
// their modulepreload hrefs must already be root-absolute) and before
// generate-csp-headers.mjs (which hashes the inline scripts of every
// index.html; the copies are byte-identical, so those hashes cover them too).
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const browserDist = join('dist', 'angular-portfolio', 'browser');

for (const dir of ['', 'de']) {
  const source = join(browserDist, dir, '404', 'index.html');
  const target = join(browserDist, dir, '404.html');

  if (!existsSync(source)) {
    console.error(`[publish-404-page] ${source} is missing — is the /${dir ? `${dir}/` : ''}404 route still prerendered?`);
    process.exit(1);
  }

  copyFileSync(source, target);
  console.log(`[publish-404-page] published ${target}`);
}
