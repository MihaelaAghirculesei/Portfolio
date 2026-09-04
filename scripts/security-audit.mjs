/**
 * Security audit gate: `npm audit --omit=dev --audit-level=moderate`.
 *
 * - Exits 1 when npm reports vulnerabilities at/above the threshold (real finding).
 * - Tolerates npm advisory-endpoint outages: retries a few times, and if every
 *   failure is a network/endpoint error (no vulnerability data returned), passes
 *   with a warning so an npm platform incident cannot freeze CI and deploys.
 *
 * Dependabot alerts and the PR `dependency-review-action` provide defense in
 * depth, so briefly tolerating an unreachable endpoint is an acceptable trade.
 */
import { execFileSync } from 'node:child_process';

const ATTEMPTS = 3;
const RETRY_DELAY_MS = 15_000;

/** Substrings that mark an npm-side network/endpoint failure rather than a finding. */
const NETWORK_SIGNATURES = [
  'audit endpoint returned an error',
  'network timeout',
  'Internal Server Error',
  'ENOTFOUND',
  'ECONNRESET',
  'ETIMEDOUT',
  'EAI_AGAIN',
  '503 Service Unavailable',
  '502 Bad Gateway',
];

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
  try {
    const out = execFileSync(
      'npm',
      ['audit', '--omit=dev', '--audit-level=moderate'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], shell: process.platform === 'win32' },
    );
    process.stdout.write(out);
    console.log('security audit clean');
    process.exit(0);
  } catch (err) {
    const output = `${err.stdout ?? ''}${err.stderr ?? ''}`;
    process.stdout.write(output);

    const isNetworkError = NETWORK_SIGNATURES.some((sig) => output.includes(sig));
    if (!isNetworkError) {
      console.error('::error::security audit failed — vulnerabilities found (or bad invocation)');
      process.exit(1);
    }

    console.warn(
      `::warning::security audit attempt ${attempt}/${ATTEMPTS} could not reach the npm advisory endpoint`,
    );
    if (attempt < ATTEMPTS) sleep(RETRY_DELAY_MS);
  }
}

console.warn(
  '::warning::npm advisory endpoint unreachable after 3 attempts — skipping the audit gate ' +
    '(npm platform incident, not a code issue; Dependabot alerts still apply)',
);
process.exit(0);
