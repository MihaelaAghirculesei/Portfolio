import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NavigationService } from './navigation.service';
import { ScrollService } from './scroll.service';
import { LoggerService } from './logger.service';

describe('NavigationService', () => {
  let service: NavigationService;
  let mockRouter: { navigate: jasmine.Spy; url: string };
  let scrollServiceSpy: jasmine.SpyObj<ScrollService>;
  let loggerSpy: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate'),
      url: '/'
    };
    const scrollServiceSpyObj = jasmine.createSpyObj('ScrollService', ['scrollToElement']);
    const loggerSpyObj = jasmine.createSpyObj('LoggerService', ['error', 'warn', 'info', 'debug']);

    TestBed.configureTestingModule({
      providers: [
        NavigationService,
        { provide: Router, useValue: mockRouter },
        { provide: LoggerService, useValue: loggerSpyObj }
      ]
    });

    service = TestBed.inject(NavigationService);
    loggerSpy = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
    scrollServiceSpy = scrollServiceSpyObj;
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

  describe('navigateToHomeWithScroll()', () => {
    describe('When already on home route', () => {
      beforeEach(() => {
        mockRouter.url = '/';
      });

      it('should scroll directly without navigation', () => {
        service.navigateToHomeWithScroll(scrollServiceSpy, 'contact');

        expect(mockRouter.navigate).not.toHaveBeenCalled();
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('contact', 'start');
      });

      it('should scroll to specified section', () => {
        service.navigateToHomeWithScroll(scrollServiceSpy, 'about-me');

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('about-me', 'start');
      });

      it('should scroll to portfolio section', () => {
        service.navigateToHomeWithScroll(scrollServiceSpy, 'portfolio');

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('portfolio', 'start');
      });

      it('should not delay scroll when already on home', () => {
        service.navigateToHomeWithScroll(scrollServiceSpy, 'skills');

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledTimes(1);
      });
    });

    describe('When on empty URL (considered home)', () => {
      beforeEach(() => {
        mockRouter.url = '';
      });

      it('should scroll directly without navigation when url is empty', () => {
        service.navigateToHomeWithScroll(scrollServiceSpy, 'contact');

        expect(mockRouter.navigate).not.toHaveBeenCalled();
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('contact', 'start');
      });
    });

    describe('When on different route', () => {
      beforeEach(() => {
        mockRouter.url = '/privacy-policy';
      });

      it('should navigate to home first', fakeAsync(() => {
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.navigateToHomeWithScroll(scrollServiceSpy, 'contact');

        tick();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        flush(); // Clear remaining timers
      }));

      it('should scroll after navigation with default delay', fakeAsync(() => {
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.navigateToHomeWithScroll(scrollServiceSpy, 'contact');

        tick(); // Wait for navigation promise
        tick(100); // Wait for default delay

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('contact', 'start');
      }));

      it('should use custom delay when provided', fakeAsync(() => {
        mockRouter.navigate.and.returnValue(Promise.resolve(true));
        const customDelay = 500;

        service.navigateToHomeWithScroll(scrollServiceSpy, 'portfolio', customDelay);

        tick(); // Wait for navigation promise
        tick(customDelay);

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('portfolio', 'start');
      }));

      it('should not scroll before delay expires', fakeAsync(() => {
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.navigateToHomeWithScroll(scrollServiceSpy, 'about-me', 200);

        tick(); 
        tick(199); 

        expect(scrollServiceSpy.scrollToElement).not.toHaveBeenCalled();

        tick(1); 
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalled();
      }));

      it('should scroll to correct section after navigation', fakeAsync(() => {
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.navigateToHomeWithScroll(scrollServiceSpy, 'skills');

        tick();
        tick(100);

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('skills', 'start');
      }));

      it('should handle navigation error and log it', fakeAsync(() => {
        const error = new Error('Navigation error');
        mockRouter.navigate.and.returnValue(Promise.reject(error));

        service.navigateToHomeWithScroll(scrollServiceSpy, 'contact');

        tick();
        tick(100);

        expect(loggerSpy.error).toHaveBeenCalledWith('Navigation to home failed:', error);
        expect(scrollServiceSpy.scrollToElement).not.toHaveBeenCalled();
      }));

      it('should not scroll when navigation fails', fakeAsync(() => {
        mockRouter.navigate.and.returnValue(Promise.reject('Navigation cancelled'));

        service.navigateToHomeWithScroll(scrollServiceSpy, 'portfolio');

        tick();
        tick(100);

        expect(scrollServiceSpy.scrollToElement).not.toHaveBeenCalled();
      }));

      it('should handle multiple section IDs correctly', fakeAsync(() => {
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        const sections = ['about-me', 'skills', 'portfolio', 'contact'];

        sections.forEach(section => {
          scrollServiceSpy.scrollToElement.calls.reset();
          service.navigateToHomeWithScroll(scrollServiceSpy, section);
          tick();
          tick(100);
          expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith(section, 'start');
        });
      }));
    });

    describe('Different route scenarios', () => {
      it('should navigate from /legal-notice to home with scroll', fakeAsync(() => {
        mockRouter.url = '/legal-notice';
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.navigateToHomeWithScroll(scrollServiceSpy, 'contact');

        tick();
        tick(100);

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalled();
      }));

      it('should handle deep routes', fakeAsync(() => {
        mockRouter.url = '/some/deep/route';
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.navigateToHomeWithScroll(scrollServiceSpy, 'about-me');

        tick();
        tick(100);

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
      }));

      it('should handle routes with query parameters', fakeAsync(() => {
        mockRouter.url = '/page?param=value';
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.navigateToHomeWithScroll(scrollServiceSpy, 'skills');

        tick();
        tick(100);

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
      }));

      it('should handle routes with fragments', fakeAsync(() => {
        mockRouter.url = '/page#section';
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.navigateToHomeWithScroll(scrollServiceSpy, 'portfolio');

        tick();
        tick(100);

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
      }));
    });

    describe('Edge Cases', () => {
      it('should handle empty section ID', fakeAsync(() => {
        mockRouter.url = '/';

        service.navigateToHomeWithScroll(scrollServiceSpy, '');

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('', 'start');
      }));

      it('should handle zero delay', fakeAsync(() => {
        mockRouter.url = '/other';
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.navigateToHomeWithScroll(scrollServiceSpy, 'contact', 0);

        tick();
        tick(0);

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalled();
      }));

      it('should handle large delay value', fakeAsync(() => {
        mockRouter.url = '/other';
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.navigateToHomeWithScroll(scrollServiceSpy, 'about-me', 5000);

        tick();
        tick(5000);

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalled();
      }));

      it('should handle special characters in section ID', fakeAsync(() => {
        mockRouter.url = '/';

        service.navigateToHomeWithScroll(scrollServiceSpy, 'section-with-special_chars123');

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith(
          'section-with-special_chars123',
          'start'
        );
      }));

      it('should always use "start" as scroll behavior', fakeAsync(() => {
        mockRouter.url = '/';

        service.navigateToHomeWithScroll(scrollServiceSpy, 'any-section');

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('any-section', 'start');
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

        service.navigateToHomeWithScroll(scrollServiceSpy, 'contact', 100);

        tick(49);
        expect(navigationResolved).toBe(false);
        expect(scrollServiceSpy.scrollToElement).not.toHaveBeenCalled();

        tick(1);
        expect(navigationResolved).toBe(true);

        tick(100);
        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalled();
      }));

      it('should handle immediate navigation resolution', fakeAsync(() => {
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.navigateToHomeWithScroll(scrollServiceSpy, 'skills', 50);

        tick();
        tick(50);

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalled();
      }));
    });

    describe('Integration Scenarios', () => {
      it('should handle rapid consecutive calls on same route', () => {
        mockRouter.url = '/';

        service.navigateToHomeWithScroll(scrollServiceSpy, 'about-me');
        service.navigateToHomeWithScroll(scrollServiceSpy, 'skills');
        service.navigateToHomeWithScroll(scrollServiceSpy, 'contact');

        expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledTimes(3);
      });

      it('should handle rapid consecutive calls on different routes', fakeAsync(() => {
        mockRouter.url = '/other';
        mockRouter.navigate.and.returnValue(Promise.resolve(true));

        service.navigateToHomeWithScroll(scrollServiceSpy, 'about-me');
        service.navigateToHomeWithScroll(scrollServiceSpy, 'skills');

        tick();
        tick(100);

        expect(mockRouter.navigate).toHaveBeenCalledTimes(2);
      }));
    });
  });
});
