import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HeaderComponent } from './header.component';
import { ScrollService } from '../services/scroll.service';
import { PlatformService } from '../services/platform.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockScrollService: jasmine.SpyObj<ScrollService>;
  let mockPlatformService: jasmine.SpyObj<PlatformService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let translateService: TranslateService;

  beforeEach(async () => {
    mockScrollService = jasmine.createSpyObj('ScrollService', [
      'scrollToElement',
      'isScrolledBeyond'
    ]);
    mockPlatformService = jasmine.createSpyObj('PlatformService', [
      'getWindow',
      'isWindowDefined'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate'], {
      url: '/'
    });

    mockScrollService.isScrolledBeyond.and.returnValue(false);
    mockPlatformService.isWindowDefined.and.returnValue(true);
    mockPlatformService.getWindow.and.returnValue(window);
    mockRouter.navigate.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ScrollService, useValue: mockScrollService },
        { provide: PlatformService, useValue: mockPlatformService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.isHovered).toBe(false);
      expect(component.isScrolled).toBe(false);
      expect(component.isEnglish).toBe(false);
      expect(component.isMenuOpen).toBe(false);
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should setup scroll listener on init', () => {
      spyOn(window, 'addEventListener');

      component.ngOnInit();

      expect(window.addEventListener).toHaveBeenCalledWith(
        'scroll',
        jasmine.any(Function),
        { passive: true }
      );
    });

    it('should set default language on init', () => {
      spyOn(translateService, 'setDefaultLang');
      spyOn(translateService, 'use');

      component.ngOnInit();

      expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
      expect(translateService.use).toHaveBeenCalledWith('en');
    });

    it('should check scroll on init', () => {
      spyOn(component, 'checkScroll');

      component.ngOnInit();

      expect(component.checkScroll).toHaveBeenCalled();
    });

    it('should not add scroll listener if not browser', () => {
      mockPlatformService.isWindowDefined.and.returnValue(false);
      spyOn(window, 'addEventListener');

      component.ngOnInit();

      expect(window.addEventListener).not.toHaveBeenCalled();
    });

    it('should remove scroll listener on destroy', () => {
      spyOn(window, 'removeEventListener');
      component.ngOnInit();

      component.ngOnDestroy();

      expect(window.removeEventListener).toHaveBeenCalledWith(
        'scroll',
        jasmine.any(Function)
      );
    });

    it('should not remove listener on destroy if not browser', () => {
      mockPlatformService.isWindowDefined.and.returnValue(false);
      spyOn(window, 'removeEventListener');

      component.ngOnDestroy();

      expect(window.removeEventListener).not.toHaveBeenCalled();
    });
  });

  describe('Scroll Detection', () => {
    it('should detect when scrolled beyond threshold', () => {
      mockScrollService.isScrolledBeyond.and.returnValue(true);

      component.checkScroll();

      expect(component.isScrolled).toBe(true);
      expect(mockScrollService.isScrolledBeyond).toHaveBeenCalledWith(100);
    });

    it('should detect when not scrolled beyond threshold', () => {
      mockScrollService.isScrolledBeyond.and.returnValue(false);

      component.checkScroll();

      expect(component.isScrolled).toBe(false);
    });

    it('should mark for check after scroll detection', () => {
      spyOn(component['cdr'], 'markForCheck');

      component.checkScroll();

      expect(component['cdr'].markForCheck).toHaveBeenCalled();
    });
  });

  describe('Language Toggle', () => {
    it('should toggle between German and English', () => {
      spyOn(translateService, 'use');
      component.isEnglish = false;

      component.toggleLanguage();
      expect(component.isEnglish).toBe(true);
      expect(translateService.use).toHaveBeenCalledWith('de');

      component.toggleLanguage();
      expect(component.isEnglish).toBe(false);
      expect(translateService.use).toHaveBeenCalledWith('en');
    });
  });

  describe('Menu Toggle', () => {
    it('should toggle menu open and closed', () => {
      component.isMenuOpen = false;

      component.toggleMenu();
      expect(component.isMenuOpen).toBe(true);

      component.toggleMenu();
      expect(component.isMenuOpen).toBe(false);
    });
  });

  describe('Menu Close on Mobile', () => {
    it('should close menu on mobile viewport', () => {
      const mockWindow = { innerWidth: 768 } as Window;
      mockPlatformService.getWindow.and.returnValue(mockWindow);
      component.isMenuOpen = true;

      component.closeMenuIfMobile();

      expect(component.isMenuOpen).toBe(false);
    });

    it('should not close menu on desktop viewport', () => {
      const mockWindow = { innerWidth: 1920 } as Window;
      mockPlatformService.getWindow.and.returnValue(mockWindow);
      component.isMenuOpen = true;

      component.closeMenuIfMobile();

      expect(component.isMenuOpen).toBe(true);
    });

    it('should handle edge cases', () => {
      mockPlatformService.getWindow.and.returnValue(null);
      component.isMenuOpen = true;
      component.closeMenuIfMobile();
      expect(component.isMenuOpen).toBe(true);

      const mockWindow = { innerWidth: 1024 } as Window;
      mockPlatformService.getWindow.and.returnValue(mockWindow);
      component.closeMenuIfMobile();
      expect(component.isMenuOpen).toBe(false);
    });
  });

  describe('Scroll to Section', () => {
    it('should scroll immediately when on home page', () => {
      Object.defineProperty(mockRouter, 'url', { value: '/', configurable: true });

      component.scrollToSection('about');

      expect(mockScrollService.scrollToElement).toHaveBeenCalledWith('about', 'start');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should scroll immediately when on empty route', () => {
      Object.defineProperty(mockRouter, 'url', { value: '', configurable: true });

      component.scrollToSection('contact');

      expect(mockScrollService.scrollToElement).toHaveBeenCalledWith('contact', 'start');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should navigate then scroll when not on home page', fakeAsync(() => {
      Object.defineProperty(mockRouter, 'url', { value: '/privacy-policy', configurable: true });

      component.scrollToSection('skills');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);

      tick(100); // Wait for navigation delay

      expect(mockScrollService.scrollToElement).toHaveBeenCalledWith('skills', 'start');
    }));

    it('should use correct navigation delay', fakeAsync(() => {
      Object.defineProperty(mockRouter, 'url', { value: '/legal-notice', configurable: true });
      let scrollCalled = false;

      mockScrollService.scrollToElement.and.callFake(() => {
        scrollCalled = true;
      });

      component.scrollToSection('projects');

      tick(50);
      expect(scrollCalled).toBe(false);

      tick(50);
      expect(scrollCalled).toBe(true);
    }));
  });

  describe('Window Resize Handler', () => {
    it('should close menu on resize to desktop', () => {
      component.isMenuOpen = true;
      const event = new Event('resize');
      Object.defineProperty(event, 'target', { value: { innerWidth: 1920 }, configurable: true });

      component.onResize(event);

      expect(component.isMenuOpen).toBe(false);
    });

    it('should not close menu on resize to mobile', () => {
      component.isMenuOpen = true;
      const event = new Event('resize');
      Object.defineProperty(event, 'target', { value: { innerWidth: 768 }, configurable: true });

      component.onResize(event);

      expect(component.isMenuOpen).toBe(true);
    });

    it('should handle resize at breakpoint boundary', () => {
      component.isMenuOpen = true;
      const event = new Event('resize');
      Object.defineProperty(event, 'target', { value: { innerWidth: 1025 }, configurable: true });

      component.onResize(event);

      // At 1025px (> TABLET_MAX), menu should close
      expect(component.isMenuOpen).toBe(false);
    });

    it('should not close menu if platform not defined', () => {
      mockPlatformService.isWindowDefined.and.returnValue(false);
      component.isMenuOpen = true;
      const event = new Event('resize');
      Object.defineProperty(event, 'target', { value: { innerWidth: 1920 }, configurable: true });

      component.onResize(event);

      expect(component.isMenuOpen).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete user flow: open menu, scroll, close menu', fakeAsync(() => {
      // Open menu
      component.toggleMenu();
      expect(component.isMenuOpen).toBe(true);

      // Scroll to section (should navigate)
      Object.defineProperty(mockRouter, 'url', { value: '/privacy-policy', configurable: true });
      component.scrollToSection('about');

      tick(100);

      expect(mockScrollService.scrollToElement).toHaveBeenCalledWith('about', 'start');

      // Close menu if on mobile
      const mockWindow = { innerWidth: 768 } as Window;
      mockPlatformService.getWindow.and.returnValue(mockWindow);
      component.closeMenuIfMobile();

      expect(component.isMenuOpen).toBe(false);
    }));

    it('should handle language toggle and menu toggle together', () => {
      component.toggleLanguage();
      expect(component.isEnglish).toBe(true);

      component.toggleMenu();
      expect(component.isMenuOpen).toBe(true);

      component.toggleLanguage();
      expect(component.isEnglish).toBe(false);

      component.toggleMenu();
      expect(component.isMenuOpen).toBe(false);
    });
  });

  describe('Change Detection', () => {
    it('should trigger change detection on scroll check', () => {
      spyOn(component['cdr'], 'markForCheck');

      component.checkScroll();

      expect(component['cdr'].markForCheck).toHaveBeenCalled();
    });
  });
});
