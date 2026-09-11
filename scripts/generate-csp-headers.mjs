#!/usr/bin/env node
// Postbuild step: the prerendered build emits several inline <script> blocks
// per route (jsaction event replay, Angular transfer-state __nghData__,
// JSON-LD structured data). Of those, only the jsaction bootstrap is actually
// JS-executing and CSP-gated — and its content (the event types that route's
// components bind) differs per route. Hand-maintaining a CSP script-src hash
// for that is exactly how the site's CSP broke last time (one hardcoded
// hash, ten routes each needing a different one). This scans every
// prerendered index.html, hashes every distinct inline, JS-executing script
// it actually finds (skipping non-JS `type`s like JSON-LD/transfer-state,
// which CSP script-src doesn't gate anyway), and injects the deduplicated
// set into dist/.../browser/_headers in place of the __CSP_SCRIPT_HASHES__
// placeholder that src/_headers ships with.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const browserDist = join('dist', 'angular-portofolio', 'browser');
const headersPath = join(browserDist, '_headers');
const placeholder = '__CSP_SCRIPT_HASHES__';

// Non-JS `type` values this build actually emits (JSON-LD, Angular transfer-state).
// CSP script-src exempts any <script> whose type is set and isn't a JS/module type.
const NON_EXECUTABLE_SCRIPT_TYPES = new Set(['application/ld+json', 'application/json']);

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

function extractInlineScripts(html) {
  const scripts = [];
  // Case-insensitive and whitespace-tolerant on the end tag: this parses
  // Angular's own deterministic build output, not untrusted input, but a
  // loose HTML tag match is a flagged CodeQL pattern (js/bad-tag-filter)
  // regardless of what the match feeds into — match <SCRIPT>/<Script> and
  // </script > (space before >) too rather than carry the finding.
  const re = /<script(\s[^>]*)?>([\s\S]*?)<\/script\s*>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const attrs = match[1] ?? '';
    if (/\bsrc\s*=/i.test(attrs)) continue; // external bundle, not inline
    // CSP script-src only gates JavaScript-executing <script> elements: a
    // non-empty, non-JS, non-"module" type attribute (e.g. the JSON-LD and
    // Angular transfer-state blocks this build emits) is exempt per the CSP3
    // spec, so browsers never check it against script-src. Hashing it anyway
    // would just be dead weight in the header — and the transfer-state block
    // embeds non-deterministic component ids, so its hash isn't even stable
    // across builds of identical content.
    const typeMatch = attrs.match(/\btype\s*=\s*["']?([^"'\s>]*)/i);
    const type = typeMatch?.[1]?.toLowerCase() ?? '';
    if (NON_EXECUTABLE_SCRIPT_TYPES.has(type)) continue;
    const content = match[2];
    if (content.trim().length === 0) continue;
    scripts.push(content);
  }
  return scripts;
}

const indexFiles = findIndexHtmlFiles(browserDist);
if (indexFiles.length === 0) {
  console.error(`[generate-csp-headers] no index.html found under ${browserDist} — did the build run first?`);
  process.exit(1);
}

const hashes = new Set();
for (const file of indexFiles) {
  const html = readFileSync(file, 'utf8');
  for (const script of extractInlineScripts(html)) {
    hashes.add(`'sha256-${createHash('sha256').update(script, 'utf8').digest('base64')}'`);
  }
}

if (hashes.size === 0) {
  console.error('[generate-csp-headers] found zero inline <script> blocks across all prerendered routes — that would be a real change from the last known build; refusing to write an empty CSP script-src allowlist. If this is expected (e.g. event replay was disabled), remove the __CSP_SCRIPT_HASHES__ placeholder from src/_headers instead of leaving this script silently write nothing.');
  process.exit(1);
}

const headers = readFileSync(headersPath, 'utf8');
const occurrences = headers.split(placeholder).length - 1;
if (occurrences !== 1) {
  console.error(
    `[generate-csp-headers] expected exactly one "${placeholder}" in ${headersPath}, found ${occurrences}. ` +
      'A single string .replace() only fills the first match, so a second occurrence (e.g. the placeholder ' +
      'literally repeated in a comment) would silently leave the real Content-Security-Policy line broken. ' +
      'Fix src/_headers rather than relaxing this check.',
  );
  process.exit(1);
}

const hashList = [...hashes].sort().join(' ');
writeFileSync(headersPath, headers.replace(placeholder, hashList));

console.log(`[generate-csp-headers] wrote ${hashes.size} inline script hash(es) across ${indexFiles.length} route(s) into ${headersPath}`);
