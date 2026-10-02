#!/usr/bin/env node
// Postbuild step: Angular emits <link rel="modulepreload" href="chunk-X.js">
// with document-relative hrefs and relies on <base href="/"> to resolve them.
// Cloudflare Pages turns those <link>s into HTTP `Link` headers (Early Hints)
// and the browser resolves a header against the request URL, not against
// <base>. On every route except "/" (e.g. /projects/) that yields
// /projects/chunk-X.js, which falls through to the HTML fallback: wasted
// requests, "Failed to load module script" console errors, and Early Hints
// that never help. wrangler's local Pages runtime emits no Link headers, so
// the smoke test cannot observe this; the check at the end of this script is
// the regression guard instead.
//
// The fix rewrites each relative modulepreload href to a root-absolute one.
// Only the href values change: edits are spliced in at the source offsets
// parse5 reports, so every other byte (including the inline scripts that
// generate-csp-headers.mjs hashes) stays identical.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'parse5';

const browserDist = join('dist', 'angular-portofolio', 'browser');

function findIndexHtmlFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) found.push(...findIndexHtmlFiles(full));
    else if (entry === 'index.html') found.push(full);
  }
  return found;
}

const isRelative = (href) => !/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(href);

function relativeModulePreloadHrefs(html) {
  const hrefs = [];
  const document = parse(html, { sourceCodeLocationInfo: true });

  function walk(node) {
    if (node.tagName === 'link') {
      const attr = (name) => node.attrs.find((a) => a.name === name);
      const rel = attr('rel')?.value.toLowerCase().split(/\s+/) ?? [];
      const href = attr('href');
      if (rel.includes('modulepreload') && href && isRelative(href.value)) {
        hrefs.push({ value: href.value, location: node.sourceCodeLocation.attrs.href });
      }
    }
    for (const child of node.childNodes ?? []) walk(child);
  }
  walk(document);
  return hrefs;
}

let rewritten = 0;
const files = findIndexHtmlFiles(browserDist);
for (const file of files) {
  let html = readFileSync(file, 'utf8');
  // Splice from the end so earlier offsets stay valid.
  const hrefs = relativeModulePreloadHrefs(html).sort((a, b) => b.location.startOffset - a.location.startOffset);
  for (const { value, location } of hrefs) {
    html = `${html.slice(0, location.startOffset)}href="/${value}"${html.slice(location.endOffset)}`;
    rewritten += 1;
  }
  if (hrefs.length > 0) writeFileSync(file, html);
}

const leftovers = files.flatMap((file) =>
  relativeModulePreloadHrefs(readFileSync(file, 'utf8')).map(({ value }) => `${file}: ${value}`),
);
if (leftovers.length > 0) {
  console.error('[absolutize-preload-links] relative modulepreload hrefs remain:');
  for (const leftover of leftovers) console.error(`  - ${leftover}`);
  process.exit(1);
}

console.log(`[absolutize-preload-links] rewrote ${rewritten} modulepreload href(s) across ${files.length} route(s)`);
