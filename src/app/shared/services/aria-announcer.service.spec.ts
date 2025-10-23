import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { AriaAnnouncerService } from './aria-announcer.service';
import { TIMING_CONFIG } from '../constants/app.constants';

describe('AriaAnnouncerService', () => {
  let service: AriaAnnouncerService;
  let liveRegionElement: HTMLElement | null;

  describe('Browser Platform', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          AriaAnnouncerService,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });

      service = TestBed.inject(AriaAnnouncerService);
      liveRegionElement = document.querySelector('.sr-only');
    });

    afterEach(() => {
      // Cleanup live region
      const elements = document.querySelectorAll('.sr-only');
      elements.forEach(el => el.remove());
    });

    describe('Service Creation', () => {
      it('should be created', () => {
        expect(service).toBeTruthy();
      });

      it('should create live region on browser platform', () => {
        expect(liveRegionElement).toBeTruthy();
      });

      it('should append live region to document body', () => {
        expect(liveRegionElement?.parentElement).toBe(document.body);
      });
    });

    describe('Live Region Configuration', () => {
      it('should have correct default ARIA attributes', () => {
        expect(liveRegionElement?.getAttribute('aria-live')).toBe('polite');
        expect(liveRegionElement?.getAttribute('aria-atomic')).toBe('true');
        expect(liveRegionElement?.getAttribute('class')).toBe('sr-only');
      });

      it('should have correct positioning styles', () => {
        expect(liveRegionElement?.style.position).toBe('absolute');
        expect(liveRegionElement?.style.left).toBe('-10000px');
        expect(liveRegionElement?.style.width).toBe('1px');
        expect(liveRegionElement?.style.height).toBe('1px');
        expect(liveRegionElement?.style.overflow).toBe('hidden');
      });

      it('should be visually hidden but accessible to screen readers', () => {
        const isHidden =
          liveRegionElement?.style.position === 'absolute' &&
          liveRegionElement?.style.left === '-10000px' &&
          liveRegionElement?.style.overflow === 'hidden';
        expect(isHidden).toBe(true);
      });
    });

    describe('announce() method', () => {
      it('should announce message with default polite priority', fakeAsync(() => {
        const message = 'Test announcement';

        service.announce(message);

        // Initially empty
        expect(liveRegionElement?.textContent).toBe('');

        // After delay, message appears
        tick(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe(message);

        // After clear delay, message is removed
        tick(TIMING_CONFIG.ARIA_CLEAR_DELAY - TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe('');
      }));

      it('should announce message with assertive priority', fakeAsync(() => {
        const message = 'Important announcement';

        service.announce(message, 'assertive');

        expect(liveRegionElement?.getAttribute('aria-live')).toBe('assertive');

        tick(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe(message);

        tick(TIMING_CONFIG.ARIA_CLEAR_DELAY - TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe('');
      }));

      it('should update aria-live priority for each announcement', fakeAsync(() => {
        service.announce('Polite message', 'polite');
        expect(liveRegionElement?.getAttribute('aria-live')).toBe('polite');

        tick(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY + TIMING_CONFIG.ARIA_CLEAR_DELAY);

        service.announce('Assertive message', 'assertive');
        expect(liveRegionElement?.getAttribute('aria-live')).toBe('assertive');

        tick(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY + TIMING_CONFIG.ARIA_CLEAR_DELAY);
      }));

      it('should clear previous message before new announcement', fakeAsync(() => {
        service.announce('First message');

        tick(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe('First message');

        service.announce('Second message');

        // Should be immediately cleared
        expect(liveRegionElement?.textContent).toBe('');

        tick(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe('Second message');

        tick(TIMING_CONFIG.ARIA_CLEAR_DELAY - TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
      }));

      it('should handle empty message', fakeAsync(() => {
        service.announce('');

        tick(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe('');

        tick(TIMING_CONFIG.ARIA_CLEAR_DELAY - TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
      }));

      it('should handle long messages', fakeAsync(() => {
        const longMessage =
          'This is a very long message that should still be announced correctly by screen readers ' +
          'regardless of its length.';

        service.announce(longMessage);

        tick(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe(longMessage);

        tick(TIMING_CONFIG.ARIA_CLEAR_DELAY - TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe('');
      }));

      it('should handle special characters', fakeAsync(() => {
        const specialMessage = 'Test <script>alert("xss")</script> & special chars';

        service.announce(specialMessage);

        tick(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe(specialMessage);

        tick(TIMING_CONFIG.ARIA_CLEAR_DELAY - TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
      }));

      it('should handle rapid consecutive announcements', fakeAsync(() => {
        service.announce('Message 1');
        service.announce('Message 2');
        service.announce('Message 3');

        // Last message should win
        tick(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe('Message 3');

        tick(TIMING_CONFIG.ARIA_CLEAR_DELAY - TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
      }));
    });

    describe('Timing Configuration', () => {
      it('should use configured announcement delay', fakeAsync(() => {
        const message = 'Delayed message';
        service.announce(message);

        tick(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY - 1);
        expect(liveRegionElement?.textContent).toBe('');

        tick(1);
        expect(liveRegionElement?.textContent).toBe(message);

        tick(TIMING_CONFIG.ARIA_CLEAR_DELAY - TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
      }));

      it('should use configured clear delay', fakeAsync(() => {
        const message = 'Message to clear';
        service.announce(message);

        tick(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe(message);

        tick(TIMING_CONFIG.ARIA_CLEAR_DELAY - TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY - 1);
        expect(liveRegionElement?.textContent).toBe(message);

        tick(1);
        expect(liveRegionElement?.textContent).toBe('');
      }));
    });
  });

  describe('Server Platform', () => {
    beforeEach(() => {
      // Cleanup any leftover live regions from previous tests
      const elements = document.querySelectorAll('.sr-only');
      elements.forEach(el => el.remove());

      TestBed.configureTestingModule({
        providers: [
          AriaAnnouncerService,
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });

      service = TestBed.inject(AriaAnnouncerService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should not create live region on server platform', () => {
      const serverLiveRegion = document.querySelector('.sr-only');
      expect(serverLiveRegion).toBeNull();
    });

    it('should handle announce() gracefully on server platform', fakeAsync(() => {
      // Should not throw error even without live region
      expect(() => {
        service.announce('Server message');
        tick(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY + TIMING_CONFIG.ARIA_CLEAR_DELAY);
      }).not.toThrow();
    }));
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          AriaAnnouncerService,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });

      service = TestBed.inject(AriaAnnouncerService);
    });

    afterEach(() => {
      const elements = document.querySelectorAll('.sr-only');
      elements.forEach(el => el.remove());
    });

    it('should handle null message gracefully', fakeAsync(() => {
      expect(() => {
        service.announce(null as any);
        tick(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY + TIMING_CONFIG.ARIA_CLEAR_DELAY);
      }).not.toThrow();
    }));

    it('should handle undefined priority gracefully', fakeAsync(() => {
      expect(() => {
        service.announce('Test', undefined as any);
        tick(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY + TIMING_CONFIG.ARIA_CLEAR_DELAY);
      }).not.toThrow();
    }));
  });
});
