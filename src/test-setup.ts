import { afterEach, vi } from 'vitest';

// Global Vitest hooks for the unit-test builder (angular.json → test.setupFiles).
// Jasmine removed spies and fake clocks after every spec on its own; Vitest
// doesn't, so without this, spies on shared globals (console, window, ...)
// would keep counting calls across tests.
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
