#!/usr/bin/env node
// Postbuild step: Cloudflare Pages answers any URL that matches no asset with
// the top-level 404.html and a real 404 status — but only if that file exists.
// The /404 route is prerendered to 404/index.html like every other route, so
// publish it under the name Pages looks for. Runs after
// absolutize-preload-links.mjs (the page is served at arbitrary depths, so its
// modulepreload hrefs must already be root-absolute) and before
// generate-csp-headers.mjs (which hashes the inline scripts of 404/index.html;
// the copy is byte-identical, so those hashes cover it too).
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const browserDist = join('dist', 'angular-portfolio', 'browser');
const source = join(browserDist, '404', 'index.html');
const target = join(browserDist, '404.html');

if (!existsSync(source)) {
  console.error(`[publish-404-page] ${source} is missing — is the /404 route still prerendered?`);
  process.exit(1);
}

copyFileSync(source, target);
console.log(`[publish-404-page] published ${target}`);
