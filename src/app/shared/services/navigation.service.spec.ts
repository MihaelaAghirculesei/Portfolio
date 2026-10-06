import type { Mock, MockedObject } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NavigationService } from './navigation.service';
import { ScrollService } from './scroll.service';
import { LoggerService } from './logger.service';
import { DeferGateService } from './defer-gate.service';

describe('NavigationService', () => {
  let service: NavigationService;
  let mockRouter: {
    navigate: Mock;
    url: string;
  };
  let scrollServiceSpy: MockedObject<ScrollService>;
  let loggerSpy: MockedObject<LoggerService>;
  let deferGate: DeferGateService;

  beforeEach(() => {
    mockRouter = {
      navigate: vi.fn(),
      url: '/'
    };
    const scrollServiceSpyObj = {
      scrollToElement: vi.fn().mockName('ScrollService.scrollToElement'),
      waitForLayoutStable: vi.fn().mockName('ScrollService.waitForLayoutStable')
    };
    scrollServiceSpyObj.waitForLayoutStable.mockReturnValue(Promise.resolve());
    const loggerSpyObj = {
      error: vi.fn().mockName('LoggerService.error'),
      warn: vi.fn().mockName('LoggerService.warn'),
      info: vi.fn().mockName('LoggerService.info'),
      debug: vi.fn().mockName('LoggerService.debug')
    };

    TestBed.configureTestingModule({
      providers: [
        NavigationService,
        { provide: Router, useValue: mockRouter },
        { provide: ScrollService, useValue: scrollServiceSpyObj },
        { provide: LoggerService, useValue: loggerSpyObj }
      ]
    });

    service = TestBed.inject(NavigationService);
    scrollServiceSpy = TestBed.inject(ScrollService) as MockedObject<ScrollService>;
    loggerSpy = TestBed.inject(LoggerService) as MockedObject<LoggerService>;
    deferGate = TestBed.inject(DeferGateService);
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should be provided in root', () => {
      const service1 = TestBed.inject(NavigationService);
      const service2 = TestBed.inject(NavigationService);
      expect(service1).toBe(service2);
    });
  });

  describe('navigateToHome()', () => {
    it('should navigate to home route', async () => {
      mockRouter.navigate.mockReturnValue(Promise.resolve(true));

      const result = await service.navigateToHome();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
      expect(result).toBe(true);
    });

    it('should return true on successful navigation', async () => {
      mockRouter.navigate.mockReturnValue(Promise.resolve(true));

      const result = await service.navigateToHome();

      expect(result).toBe(true);
    });

    it('should return false on failed navigation', async () => {
      mockRouter.navigate.mockReturnValue(Promise.resolve(false));

      const result = await service.navigateToHome();

      expect(result).toBe(false);
    });

    it('should handle navigation error and return false', async () => {
      const error = new Error('Navigation failed');
      mockRouter.navigate.mockReturnValue(Promise.reject(error));

      const result = await service.navigateToHome();

      expect(result).toBe(false);
      expect(loggerSpy.error).toHaveBeenCalledWith('Navigation to home failed:', error);
    });

    it('should log error when navigation fails', async () => {
      const error = new Error('Route not found');
      mockRouter.navigate.mockReturnValue(Promise.reject(error));

      await service.navigateToHome();

      expect(loggerSpy.error).toHaveBeenCalledTimes(1);
      expect(loggerSpy.error).toHaveBeenCalledWith('Navigation to home failed:', error);
    });

    it('should handle navigation rejection gracefully', async () => {
      mockRouter.navigate.mockReturnValue(Promise.reject('Navigation cancelled'));

      const result = await service.navigateToHome();

      expect(result).toBe(false);
      expect(loggerSpy.error).toHaveBeenCalled();
    });

    it('should not throw error on navigation failure', async () => {
      mockRouter.navigate.mockReturnValue(Promise.reject(new Error('Test error')));

      await expect(service.navigateToHome()).resolves.not.toThrow();
    });
  });

  describe('scrollToSection()', () => {
    describe('When already on home route', () => {
      beforeEach(() => {
        mockRouter.url = '/';
      });

      it('should scroll directly without navigation', () => {
        service.scrollToSection('contact');

        expect(mockRouter.navigate).not.toHaveBeenCalled();
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('contact', 'start', 'smooth');
      });

      it('should scroll to specified section', () => {
        service.scrollToSection('about-me');

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('about-me', 'start', 'smooth');
      });

      it('should scroll to portfolio section', () => {
        service.scrollToSection('portfolio');

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('portfolio', 'start', 'smooth');
      });

      it('should not delay scroll when already on home', () => {
        service.scrollToSection('skills');

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledTimes(1);
      });

      it('should re-scroll once more after the correction delay, to correct for deferred sections still growing', async () => {
        vi.useFakeTimers();
        service.scrollToSection('skills');

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledTimes(1);

        await vi.advanceTimersByTimeAsync(349);
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledTimes(1);

        await vi.advanceTimersByTimeAsync(1);
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledTimes(2);
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('skills', 'start', 'smooth');
      });
    });

    describe('When on empty URL (considered home)', () => {
      beforeEach(() => {
        mockRouter.url = '';
      });

      it('should scroll directly without navigation when url is empty', () => {
        service.scrollToSection('contact');

        expect(mockRouter.navigate).not.toHaveBeenCalled();
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('contact', 'start', 'smooth');
      });
    });

    describe('When on different route', () => {
      beforeEach(() => {
        mockRouter.url = '/privacy-policy';
      });

      it('should navigate to home first', async () => {
        vi.useFakeTimers();
        mockRouter.navigate.mockReturnValue(Promise.resolve(true));

        service.scrollToSection('contact');

        await vi.advanceTimersByTimeAsync(0);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        await vi.runAllTimersAsync();
      });

      it('should force deferred home sections to reveal immediately, then release the gate once settled', async () => {
        vi.useFakeTimers();
        mockRouter.navigate.mockReturnValue(Promise.resolve(true));

        service.scrollToSection('contact');

        expect(deferGate.revealAll()).toBe(true);

        await vi.advanceTimersByTimeAsync(100 + 1200 + 199);
        expect(deferGate.revealAll()).toBe(true);

        await vi.advanceTimersByTimeAsync(1);
        expect(deferGate.revealAll()).toBe(false);
        await vi.runAllTimersAsync();
      });

      it('should scroll after navigation with default delay', async () => {
        vi.useFakeTimers();
        mockRouter.navigate.mockReturnValue(Promise.resolve(true));

        service.scrollToSection('contact');

        await vi.advanceTimersByTimeAsync(0);
        await vi.advanceTimersByTimeAsync(100);

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('contact', 'start', 'instant', 320);
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('contact', 'start', 'smooth');
        await vi.runAllTimersAsync();
      });

      it('should use custom delay when provided', async () => {
        vi.useFakeTimers();
        mockRouter.navigate.mockReturnValue(Promise.resolve(true));
        const customDelay = 500;

        service.scrollToSection('portfolio', customDelay);

        await vi.advanceTimersByTimeAsync(0);
        await vi.advanceTimersByTimeAsync(customDelay);

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('portfolio', 'start', 'instant', 320);
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('portfolio', 'start', 'smooth');
        await vi.runAllTimersAsync();
      });

      it('should not scroll before delay expires', async () => {
        vi.useFakeTimers();
        mockRouter.navigate.mockReturnValue(Promise.resolve(true));

        service.scrollToSection('about-me', 200);

        await vi.advanceTimersByTimeAsync(0);
        await vi.advanceTimersByTimeAsync(199);

        expect(scrollServiceSpy.scrollToElement).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(1);
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalled();
        await vi.runAllTimersAsync();
      });

      it('should scroll to correct section after navigation', async () => {
        vi.useFakeTimers();
        mockRouter.navigate.mockReturnValue(Promise.resolve(true));

        service.scrollToSection('skills');

        await vi.advanceTimersByTimeAsync(0);
        await vi.advanceTimersByTimeAsync(100);

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('skills', 'start', 'instant', 320);
        await vi.runAllTimersAsync();
      });

      it('should wait for the layout to settle, then land short instantly and glide in smoothly', async () => {
        vi.useFakeTimers();
        mockRouter.navigate.mockReturnValue(Promise.resolve(true));

        service.scrollToSection('portfolio');

        await vi.advanceTimersByTimeAsync(0);
        await vi.advanceTimersByTimeAsync(100);

        expect(scrollServiceSpy.waitForLayoutStable).toHaveBeenCalledWith('portfolio');
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledTimes(2);
        expect(vi.mocked(scrollServiceSpy.scrollToElement).mock.calls[0]).toEqual(['portfolio', 'start', 'instant', 320]);
        expect(vi.mocked(scrollServiceSpy.scrollToElement).mock.calls[1]).toEqual(['portfolio', 'start', 'smooth']);
        await vi.runAllTimersAsync();
      });

      it('should not land until the layout-stability wait resolves', async () => {
        vi.useFakeTimers();
        mockRouter.navigate.mockReturnValue(Promise.resolve(true));
        let resolveStable!: () => void;
        scrollServiceSpy.waitForLayoutStable.mockReturnValue(new Promise<void>(resolve => { resolveStable = resolve; }));

        service.scrollToSection('portfolio');

        await vi.advanceTimersByTimeAsync(0);
        await vi.advanceTimersByTimeAsync(100);
        expect(scrollServiceSpy.scrollToElement).not.toHaveBeenCalled();

        resolveStable();
        await vi.advanceTimersByTimeAsync(0);
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledTimes(2);
        await vi.runAllTimersAsync();
      });

      it('should handle navigation error and log it', async () => {
        vi.useFakeTimers();
        const error = new Error('Navigation error');
        mockRouter.navigate.mockReturnValue(Promise.reject(error));

        service.scrollToSection('contact');

        await vi.advanceTimersByTimeAsync(0);
        await vi.advanceTimersByTimeAsync(100);

        expect(loggerSpy.error).toHaveBeenCalledWith('Navigation to home failed:', error);
        expect(scrollServiceSpy.scrollToElement).not.toHaveBeenCalled();
      });

      it('should not scroll when navigation fails', async () => {
        vi.useFakeTimers();
        mockRouter.navigate.mockReturnValue(Promise.reject('Navigation cancelled'));

        service.scrollToSection('portfolio');

        await vi.advanceTimersByTimeAsync(0);
        await vi.advanceTimersByTimeAsync(100);

        expect(scrollServiceSpy.scrollToElement).not.toHaveBeenCalled();
      });

      it('should handle multiple section IDs correctly', async () => {
        vi.useFakeTimers();
        mockRouter.navigate.mockReturnValue(Promise.resolve(true));

        const sections = ['about-me', 'skills', 'portfolio', 'contact'];

        for (const section of sections) {
          scrollServiceSpy.scrollToElement.mockClear();
          service.scrollToSection(section);
          await vi.advanceTimersByTimeAsync(0);
          await vi.advanceTimersByTimeAsync(100);
          expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith(section, 'start', 'instant', 320);
        }
        await vi.runAllTimersAsync();
      });
    });

    describe('Different route scenarios', () => {
      it('should navigate from /legal-notice to home with scroll', async () => {
        vi.useFakeTimers();
        mockRouter.url = '/legal-notice';
        mockRouter.navigate.mockReturnValue(Promise.resolve(true));

        service.scrollToSection('contact');

        await vi.advanceTimersByTimeAsync(0);
        await vi.advanceTimersByTimeAsync(100);

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalled();
        await vi.runAllTimersAsync();
      });

      it('should handle deep routes', async () => {
        vi.useFakeTimers();
        mockRouter.url = '/some/deep/route';
        mockRouter.navigate.mockReturnValue(Promise.resolve(true));

        service.scrollToSection('about-me');

        await vi.advanceTimersByTimeAsync(0);
        await vi.advanceTimersByTimeAsync(100);

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        await vi.runAllTimersAsync();
      });

      it('should handle routes with query parameters', async () => {
        vi.useFakeTimers();
        mockRouter.url = '/page?param=value';
        mockRouter.navigate.mockReturnValue(Promise.resolve(true));

        service.scrollToSection('skills');

        await vi.advanceTimersByTimeAsync(0);
        await vi.advanceTimersByTimeAsync(100);

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        await vi.runAllTimersAsync();
      });

      it('should handle routes with fragments', async () => {
        vi.useFakeTimers();
        mockRouter.url = '/page#section';
        mockRouter.navigate.mockReturnValue(Promise.resolve(true));

        service.scrollToSection('portfolio');

        await vi.advanceTimersByTimeAsync(0);
        await vi.advanceTimersByTimeAsync(100);

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        await vi.runAllTimersAsync();
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty section ID', async () => {
        vi.useFakeTimers();
        mockRouter.url = '/';

        service.scrollToSection('');

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('', 'start', 'smooth');
        await vi.runAllTimersAsync();
      });

      it('should handle zero delay', async () => {
        vi.useFakeTimers();
        mockRouter.url = '/other';
        mockRouter.navigate.mockReturnValue(Promise.resolve(true));

        service.scrollToSection('contact', 0);

        await vi.advanceTimersByTimeAsync(0);
        await vi.advanceTimersByTimeAsync(0);

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalled();
        await vi.runAllTimersAsync();
      });

      it('should handle large delay value', async () => {
        vi.useFakeTimers();
        mockRouter.url = '/other';
        mockRouter.navigate.mockReturnValue(Promise.resolve(true));

        service.scrollToSection('about-me', 5000);

        await vi.advanceTimersByTimeAsync(0);
        await vi.advanceTimersByTimeAsync(5000);

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalled();
        await vi.runAllTimersAsync();
      });

      it('should handle special characters in section ID', async () => {
        vi.useFakeTimers();
        mockRouter.url = '/';

        service.scrollToSection('section-with-special_chars123');

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('section-with-special_chars123', 'start', 'smooth');
        await vi.runAllTimersAsync();
      });

      it('should always use "start" as scroll behavior', async () => {
        vi.useFakeTimers();
        mockRouter.url = '/';

        service.scrollToSection('any-section');

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('any-section', 'start', 'smooth');
        await vi.runAllTimersAsync();
      });
    });

    describe('Timing and Asynchronous Behavior', () => {
      beforeEach(() => {
        mockRouter.url = '/other';
      });

      it('should wait for navigation to complete before scheduling scroll', async () => {
        vi.useFakeTimers();
        let navigationResolved = false;
        mockRouter.navigate.mockReturnValue(new Promise(resolve => {
          setTimeout(() => {
            navigationResolved = true;
            resolve(true);
          }, 50);
        }));

        service.scrollToSection('contact', 100);

        await vi.advanceTimersByTimeAsync(49);
        expect(navigationResolved).toBe(false);
        expect(scrollServiceSpy.scrollToElement).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(1);
        expect(navigationResolved).toBe(true);

        await vi.advanceTimersByTimeAsync(100);
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalled();
        await vi.runAllTimersAsync();
      });

      it('should handle immediate navigation resolution', async () => {
        vi.useFakeTimers();
        mockRouter.navigate.mockReturnValue(Promise.resolve(true));

        service.scrollToSection('skills', 50);

        await vi.advanceTimersByTimeAsync(0);
        await vi.advanceTimersByTimeAsync(50);

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalled();
        await vi.runAllTimersAsync();
      });
    });

    describe('Integration Scenarios', () => {
      it('should handle rapid consecutive calls on same route', () => {
        mockRouter.url = '/';

        service.scrollToSection('about-me');
        service.scrollToSection('skills');
        service.scrollToSection('contact');

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledTimes(3);
      });

      it('should handle rapid consecutive calls on different routes', async () => {
        vi.useFakeTimers();
        mockRouter.url = '/other';
        mockRouter.navigate.mockReturnValue(Promise.resolve(true));

        service.scrollToSection('about-me');
        service.scrollToSection('skills');

        await vi.advanceTimersByTimeAsync(0);
        await vi.advanceTimersByTimeAsync(100);

        expect(mockRouter.navigate).toHaveBeenCalledTimes(2);
        await vi.runAllTimersAsync();
      });
    });
  });
});
