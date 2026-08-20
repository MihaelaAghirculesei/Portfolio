import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NavigationService } from './navigation.service';
import { ScrollService } from './scroll.service';
import { LoggerService } from './logger.service';
import { DeferGateService } from './defer-gate.service';

describe('NavigationService', () => {
  let service: NavigationService;
  let mockRouter: { navigate: jasmine.Spy; url: string };
  let scrollServiceSpy: jasmine.SpyObj<ScrollService>;
  let loggerSpy: jasmine.SpyObj<LoggerService>;
  let deferGate: DeferGateService;

  beforeEach(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate'),
      url: '/'
    };
    const scrollServiceSpyObj = jasmine.createSpyObj('ScrollService', ['scrollToElement', 'waitForLayoutStable']);
    scrollServiceSpyObj.waitForLayoutStable.and.returnValue(Promise.resolve());
    const loggerSpyObj = jasmine.createSpyObj('LoggerService', ['error', 'warn', 'info', 'debug']);

    TestBed.configureTestingModule({
      providers: [
        NavigationService,
        { provide: Router, useValue: mockRouter },
        { provide: ScrollService, useValue: scrollServiceSpyObj },
        { provide: LoggerService, useValue: loggerSpyObj }
      ]
    });

    service = TestBed.inject(NavigationService);
    scrollServiceSpy = TestBed.inject(ScrollService) as jasmine.SpyObj<ScrollService>;
    loggerSpy = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
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
      mockRouter.navigate.and.returnValue(Promise.resolve(true));

      const result = await service.navigateToHome();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
      expect(result).toBe(true);
    });

    it('should return true on successful navigation', async () => {
      mockRouter.navigate.and.returnValue(Promise.resolve(true));

      const result = await service.navigateToHome();

      expect(result).toBe(true);
    });

    it('should return false on failed navigation', async () => {
      mockRouter.navigate.and.returnValue(Promise.resolve(false));

      const result = await service.navigateToHome();

      expect(result).toBe(false);
    });

    it('should handle navigation error and return false', async () => {
      const error = new Error('Navigation failed');
      mockRouter.navigate.and.returnValue(Promise.reject(error));

      const result = await service.navigateToHome();

      expect(result).toBe(false);
      expect(loggerSpy.error).toHaveBeenCalledWith('Navigation to home failed:', error);
    });

    it('should log error when navigation fails', async () => {
      const error = new Error('Route not found');
      mockRouter.navigate.and.returnValue(Promise.reject(error));

      await service.navigateToHome();

      expect(loggerSpy.error).toHaveBeenCalledTimes(1);
      expect(loggerSpy.error).toHaveBeenCalledWith('Navigation to home failed:', error);
    });

    it('should handle navigation rejection gracefully', async () => {
      mockRouter.navigate.and.returnValue(Promise.reject('Navigation cancelled'));

      const result = await service.navigateToHome();

      expect(result).toBe(false);
      expect(loggerSpy.error).toHaveBeenCalled();
    });

    it('should not throw error on navigation failure', async () => {
      mockRouter.navigate.and.returnValue(Promise.reject(new Error('Test error')));

      await expectAsync(service.navigateToHome()).toBeResolved();
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

      it('should re-scroll once more after the correction delay, to correct for deferred sections still growing', fakeAsync(() => {
        service.scrollToSection('skills');

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledTimes(1);

        tick(349);
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledTimes(1);

        tick(1);
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledTimes(2);
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('skills', 'start', 'smooth');
      }));
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

      it('should navigate to home first', fakeAsync(() => {
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.scrollToSection('contact');

        tick();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        flush();
      }));

      it('should force deferred home sections to reveal immediately, then release the gate once settled', fakeAsync(() => {
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.scrollToSection('contact');

        expect(deferGate.revealAll()).toBe(true);

        tick(100 + 1200 + 199);
        expect(deferGate.revealAll()).toBe(true);

        tick(1);
        expect(deferGate.revealAll()).toBe(false);
        flush();
      }));

      it('should scroll after navigation with default delay', fakeAsync(() => {
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.scrollToSection('contact');

        tick();
        tick(100);

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('contact', 'start', 'instant', 320);
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('contact', 'start', 'smooth');
        flush();
      }));

      it('should use custom delay when provided', fakeAsync(() => {
        mockRouter.navigate.and.returnValue(Promise.resolve(true));
        const customDelay = 500;

        service.scrollToSection('portfolio', customDelay);

        tick();
        tick(customDelay);

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('portfolio', 'start', 'instant', 320);
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('portfolio', 'start', 'smooth');
        flush();
      }));

      it('should not scroll before delay expires', fakeAsync(() => {
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.scrollToSection('about-me', 200);

        tick();
        tick(199);

        expect(scrollServiceSpy.scrollToElement).not.toHaveBeenCalled();

        tick(1);
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalled();
        flush();
      }));

      it('should scroll to correct section after navigation', fakeAsync(() => {
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.scrollToSection('skills');

        tick();
        tick(100);

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('skills', 'start', 'instant', 320);
        flush();
      }));

      it('should wait for the layout to settle, then land short instantly and glide in smoothly', fakeAsync(() => {
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.scrollToSection('portfolio');

        tick();
        tick(100);

        expect(scrollServiceSpy.waitForLayoutStable).toHaveBeenCalledWith('portfolio');
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledTimes(2);
        expect(scrollServiceSpy.scrollToElement.calls.argsFor(0)).toEqual(['portfolio', 'start', 'instant', 320]);
        expect(scrollServiceSpy.scrollToElement.calls.argsFor(1)).toEqual(['portfolio', 'start', 'smooth']);
        flush();
      }));

      it('should not land until the layout-stability wait resolves', fakeAsync(() => {
        mockRouter.navigate.and.returnValue(Promise.resolve(true));
        let resolveStable!: () => void;
        scrollServiceSpy.waitForLayoutStable.and.returnValue(
          new Promise<void>(resolve => { resolveStable = resolve; })
        );

        service.scrollToSection('portfolio');

        tick();
        tick(100);
        expect(scrollServiceSpy.scrollToElement).not.toHaveBeenCalled();

        resolveStable();
        tick();
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledTimes(2);
        flush();
      }));

      it('should handle navigation error and log it', fakeAsync(() => {
        const error = new Error('Navigation error');
        mockRouter.navigate.and.returnValue(Promise.reject(error));

        service.scrollToSection('contact');

        tick();
        tick(100);

        expect(loggerSpy.error).toHaveBeenCalledWith('Navigation to home failed:', error);
        expect(scrollServiceSpy.scrollToElement).not.toHaveBeenCalled();
      }));

      it('should not scroll when navigation fails', fakeAsync(() => {
        mockRouter.navigate.and.returnValue(Promise.reject('Navigation cancelled'));

        service.scrollToSection('portfolio');

        tick();
        tick(100);

        expect(scrollServiceSpy.scrollToElement).not.toHaveBeenCalled();
      }));

      it('should handle multiple section IDs correctly', fakeAsync(() => {
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        const sections = ['about-me', 'skills', 'portfolio', 'contact'];

        sections.forEach(section => {
          scrollServiceSpy.scrollToElement.calls.reset();
          service.scrollToSection(section);
          tick();
          tick(100);
          expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith(section, 'start', 'instant', 320);
        });
        flush();
      }));
    });

    describe('Different route scenarios', () => {
      it('should navigate from /legal-notice to home with scroll', fakeAsync(() => {
        mockRouter.url = '/legal-notice';
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.scrollToSection('contact');

        tick();
        tick(100);

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalled();
        flush();
      }));

      it('should handle deep routes', fakeAsync(() => {
        mockRouter.url = '/some/deep/route';
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.scrollToSection('about-me');

        tick();
        tick(100);

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        flush();
      }));

      it('should handle routes with query parameters', fakeAsync(() => {
        mockRouter.url = '/page?param=value';
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.scrollToSection('skills');

        tick();
        tick(100);

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        flush();
      }));

      it('should handle routes with fragments', fakeAsync(() => {
        mockRouter.url = '/page#section';
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.scrollToSection('portfolio');

        tick();
        tick(100);

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        flush();
      }));
    });

    describe('Edge Cases', () => {
      it('should handle empty section ID', fakeAsync(() => {
        mockRouter.url = '/';

        service.scrollToSection('');

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('', 'start', 'smooth');
        flush();
      }));

      it('should handle zero delay', fakeAsync(() => {
        mockRouter.url = '/other';
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.scrollToSection('contact', 0);

        tick();
        tick(0);

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalled();
        flush();
      }));

      it('should handle large delay value', fakeAsync(() => {
        mockRouter.url = '/other';
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.scrollToSection('about-me', 5000);

        tick();
        tick(5000);

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalled();
        flush();
      }));

      it('should handle special characters in section ID', fakeAsync(() => {
        mockRouter.url = '/';

        service.scrollToSection('section-with-special_chars123');

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith(
          'section-with-special_chars123',
          'start',
          'smooth'
        );
        flush();
      }));

      it('should always use "start" as scroll behavior', fakeAsync(() => {
        mockRouter.url = '/';

        service.scrollToSection('any-section');

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('any-section', 'start', 'smooth');
        flush();
      }));
    });

    describe('Timing and Asynchronous Behavior', () => {
      beforeEach(() => {
        mockRouter.url = '/other';
      });

      it('should wait for navigation to complete before scheduling scroll', fakeAsync(() => {
        let navigationResolved = false;
        mockRouter.navigate.and.returnValue(
          new Promise(resolve => {
            setTimeout(() => {
              navigationResolved = true;
              resolve(true);
            }, 50);
          })
        );

        service.scrollToSection('contact', 100);

        tick(49);
        expect(navigationResolved).toBe(false);
        expect(scrollServiceSpy.scrollToElement).not.toHaveBeenCalled();

        tick(1);
        expect(navigationResolved).toBe(true);

        tick(100);
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalled();
        flush();
      }));

      it('should handle immediate navigation resolution', fakeAsync(() => {
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.scrollToSection('skills', 50);

        tick();
        tick(50);

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalled();
        flush();
      }));
    });

    describe('Integration Scenarios', () => {
      it('should handle rapid consecutive calls on same route', () => {
        mockRouter.url = '/';

        service.scrollToSection('about-me');
        service.scrollToSection('skills');
        service.scrollToSection('contact');

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledTimes(3);
      });

      it('should handle rapid consecutive calls on different routes', fakeAsync(() => {
        mockRouter.url = '/other';
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.scrollToSection('about-me');
        service.scrollToSection('skills');

        tick();
        tick(100);

        expect(mockRouter.navigate).toHaveBeenCalledTimes(2);
        flush();
      }));
    });
  });
});
