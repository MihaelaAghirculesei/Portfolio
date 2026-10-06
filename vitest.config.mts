import { defineConfig } from 'vitest/config';

// Loaded by the Angular unit-test builder (angular.json → test.runnerConfig).
// The builder defaults to `isolate: false` (one shared browser context, like
// Karma), which lets global state left behind by one spec file leak into the
// next — whether that breaks anything then depends on file order, which differs
// between machines. Give every file a fresh context instead, and run the files
// one at a time: the contexts still share one origin, so parallel files could
// race on sessionStorage/localStorage.
export default defineConfig({
  test: {
    isolate: true,
    fileParallelism: false,
  },
});
