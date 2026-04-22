module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist/angular-portofolio/browser',
      numberOfRuns: 1,
    },
    assert: {
      assertMatrix: [
        {
          // index.csr.html is a CSR shell (build artifact, not served in production)
          matchingUrlPattern: '.*\\.csr\\.html$',
          assertions: {
            'categories:performance': ['warn', { minScore: 0.6 }],
            'categories:accessibility': ['error', { minScore: 0.9 }],
            'categories:seo': ['error', { minScore: 0.9 }],
            'categories:best-practices': ['error', { minScore: 0.9 }],
          },
        },
        {
          matchingUrlPattern: '.*',
          assertions: {
            'categories:performance': ['error', { minScore: 0.65 }],
            'categories:accessibility': ['error', { minScore: 0.9 }],
            'categories:seo': ['error', { minScore: 0.9 }],
            'categories:best-practices': ['error', { minScore: 0.9 }],
          },
        },
      ],
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
