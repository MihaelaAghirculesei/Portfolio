import { afterEach, vi } from 'vitest';

// Global Vitest hooks for the unit-test builder (angular.json → test.setupFiles).
// Jasmine removed spies and fake clocks after every spec on its own; Vitest
// doesn't, so without this, spies on shared globals (console, window, ...)
// would keep counting calls across tests.
// Web storage survives across tests in the shared browser context, so clear it
// too: a key written by one test must never decide another test's outcome.
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  sessionStorage.clear();
  localStorage.clear();
});
