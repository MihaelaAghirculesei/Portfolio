// Lighthouse CI budgets — run via `npm run ci:lighthouse` (scripts/lighthouse.mjs),
// which serves the production build through wrangler's local Pages runtime on
// this port, so the audit sees the same _headers/CSP as production.
const BASE_URL = 'http://localhost:45681';

module.exports = {
  ci: {
    collect: {
      url: ['/', '/skills', '/projects', '/case-study/charge-hub', '/contact'].map((path) => `${BASE_URL}${path}`),
      // Median of three runs per URL: a single run is too noisy to gate on.
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --disable-gpu --no-first-run --disable-extensions',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.65 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
