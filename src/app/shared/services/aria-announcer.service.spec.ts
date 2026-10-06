import { TestBed } from '@angular/core/testing';
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
      liveRegionElement = (service as any)['liveRegion'] as HTMLElement | null;
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
      it('should announce message with default polite priority', async () => {
        vi.useFakeTimers();
        const message = 'Test announcement';

        service.announce(message);

        // Initially empty
        expect(liveRegionElement?.textContent).toBe('');

        // After delay, message appears
        await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe(message);

        // After clear delay, message is removed
        await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_CLEAR_DELAY - TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe('');
      });

      it('should announce message with assertive priority', async () => {
        vi.useFakeTimers();
        const message = 'Important announcement';

        service.announce(message, 'assertive');

        expect(liveRegionElement?.getAttribute('aria-live')).toBe('assertive');

        await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe(message);

        await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_CLEAR_DELAY - TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe('');
      });

      it('should update aria-live priority for each announcement', async () => {
        vi.useFakeTimers();
        service.announce('Polite message', 'polite');
        expect(liveRegionElement?.getAttribute('aria-live')).toBe('polite');

        await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY + TIMING_CONFIG.ARIA_CLEAR_DELAY);

        service.announce('Assertive message', 'assertive');
        expect(liveRegionElement?.getAttribute('aria-live')).toBe('assertive');

        await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY + TIMING_CONFIG.ARIA_CLEAR_DELAY);
      });

      it('should clear previous message before new announcement', async () => {
        vi.useFakeTimers();
        service.announce('First message');

        await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe('First message');

        service.announce('Second message');

        // Should be immediately cleared
        expect(liveRegionElement?.textContent).toBe('');

        await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe('Second message');

        await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_CLEAR_DELAY - TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
      });

      it('should handle empty message', async () => {
        vi.useFakeTimers();
        service.announce('');

        await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe('');

        await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_CLEAR_DELAY - TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
      });

      it('should handle long messages', async () => {
        vi.useFakeTimers();
        const longMessage = 'A'.repeat(500);

        service.announce(longMessage);

        expect(liveRegionElement?.textContent).toBe('');

        await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe(longMessage);

        await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_CLEAR_DELAY - TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe('');
      });

      it('should handle special characters', async () => {
        vi.useFakeTimers();
        const specialMessage = 'Test <script>alert("xss")</script> & special chars';

        service.announce(specialMessage);

        await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe(specialMessage);

        await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_CLEAR_DELAY - TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
      });

      it('should handle rapid consecutive announcements', async () => {
        vi.useFakeTimers();
        service.announce('Message 1');
        service.announce('Message 2');
        service.announce('Message 3');

        // Last message should win
        await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe('Message 3');

        await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_CLEAR_DELAY - TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
      });
    });

    describe('Timing Configuration', () => {
      it('should use configured announcement delay', async () => {
        vi.useFakeTimers();
        const message = 'Delayed message';
        service.announce(message);

        await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY - 1);
        expect(liveRegionElement?.textContent).toBe('');

        await vi.advanceTimersByTimeAsync(1);
        expect(liveRegionElement?.textContent).toBe(message);

        await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_CLEAR_DELAY - TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        await vi.runAllTimersAsync();
      });

      it('should use configured clear delay', async () => {
        vi.useFakeTimers();
        const message = 'Message to clear';
        service.announce(message);

        await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);
        expect(liveRegionElement?.textContent).toBe(message);

        await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_CLEAR_DELAY - TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY - 1);
        expect(liveRegionElement?.textContent).toBe(message);

        await vi.advanceTimersByTimeAsync(1);
        expect(liveRegionElement?.textContent).toBe('');
      });
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

    it('should handle announce() gracefully on server platform', async () => {
      vi.useFakeTimers();
      // Should not throw error even without live region
      expect(() => service.announce('Server message')).not.toThrow();
      await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY + TIMING_CONFIG.ARIA_CLEAR_DELAY);
    });
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

    it('should handle null message gracefully', async () => {
      vi.useFakeTimers();
      expect(() => service.announce(null as any)).not.toThrow();
      await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY + TIMING_CONFIG.ARIA_CLEAR_DELAY);
    });

    it('should handle undefined priority gracefully', async () => {
      vi.useFakeTimers();
      expect(() => service.announce('Test', undefined as any)).not.toThrow();
      await vi.advanceTimersByTimeAsync(TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY + TIMING_CONFIG.ARIA_CLEAR_DELAY);
    });
  });
});
