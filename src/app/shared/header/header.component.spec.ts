import type { MockedObject } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslationService } from '../services/translation.service';
import { HeaderComponent } from './header.component';
import { ScrollService } from '../services/scroll.service';
import { PlatformService } from '../services/platform.service';
import { NavigationService } from '../services/navigation.service';
import { EMPTY } from 'rxjs';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockScrollService: Pick<MockedObject<ScrollService>, 'scrollToElement' | 'isScrolledBeyond'>;
  let mockPlatformService: Pick<MockedObject<PlatformService>, 'isWindowDefined'>;
  let mockNavService: Pick<MockedObject<NavigationService>, 'scrollToSection' | 'navigateToHome'>;
  let translateService: TranslationService;

  beforeEach(async () => {
    mockScrollService = {
      scrollToElement: vi.fn().mockName('ScrollService.scrollToElement'),
      isScrolledBeyond: vi.fn().mockName('ScrollService.isScrolledBeyond')
    };
    mockPlatformService = {
      isWindowDefined: vi.fn().mockName('PlatformService.isWindowDefined')
    };
    (mockPlatformService as any).window = window;
    mockNavService = {
      scrollToSection: vi.fn().mockName('NavigationService.scrollToSection'),
      navigateToHome: vi.fn().mockName('NavigationService.navigateToHome')
    };

    mockScrollService.isScrolledBeyond.mockReturnValue(false);
    mockPlatformService.isWindowDefined.mockReturnValue(true);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: ScrollService, useValue: mockScrollService },
        { provide: PlatformService, useValue: mockPlatformService },
        { provide: NavigationService, useValue: mockNavService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslationService);
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.isHovered).toBe(false);
      expect(component.isScrolled).toBe(false);
      expect(component.isGerman).toBe(false);
      expect(component.isMenuOpen).toBe(false);
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should setup scroll listener on init', () => {
      vi.spyOn(window, 'addEventListener').mockImplementation(() => undefined);

      component.ngOnInit();

      expect(window.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
    });

    it('should check scroll on init', () => {
      vi.spyOn(component, 'checkScroll').mockImplementation(() => undefined);

      component.ngOnInit();

      expect(component.checkScroll).toHaveBeenCalled();
    });

    it('should not add scroll listener if not browser', () => {
      mockPlatformService.isWindowDefined.mockReturnValue(false);
      vi.spyOn(window, 'addEventListener').mockImplementation(() => undefined);

      component.ngOnInit();

      expect(window.addEventListener).not.toHaveBeenCalled();
    });

    it('should remove scroll listener on destroy', () => {
      vi.spyOn(window, 'removeEventListener').mockImplementation(() => undefined);
      component.ngOnInit();

      component.ngOnDestroy();

      expect(window.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    });

    it('should not remove listener on destroy if not browser', () => {
      mockPlatformService.isWindowDefined.mockReturnValue(false);
      vi.spyOn(window, 'removeEventListener').mockImplementation(() => undefined);

      component.ngOnDestroy();

      expect(window.removeEventListener).not.toHaveBeenCalled();
    });
  });

  describe('Scroll Detection', () => {
    it('should detect when scrolled beyond threshold', () => {
      mockScrollService.isScrolledBeyond.mockReturnValue(true);

      component.checkScroll();

      expect(component.isScrolled).toBe(true);
      expect(mockScrollService.isScrolledBeyond).toHaveBeenCalledWith(100);
    });

    it('should detect when not scrolled beyond threshold', () => {
      mockScrollService.isScrolledBeyond.mockReturnValue(false);

      component.checkScroll();

      expect(component.isScrolled).toBe(false);
    });

    it('should mark for check after scroll detection', () => {
      vi.spyOn(component['cdr'], 'markForCheck').mockImplementation(() => undefined);

      component.checkScroll();

      expect(component['cdr'].markForCheck).toHaveBeenCalled();
    });
  });

  describe('Language Toggle', () => {
    it('should toggle between German and English', () => {
      vi.spyOn(translateService, 'use').mockReturnValue(EMPTY);
      component.isGerman = false;

      component.toggleLanguage();
      expect(component.isGerman).toBe(true);
      expect(translateService.use).toHaveBeenCalledWith('de');

      component.toggleLanguage();
      expect(component.isGerman).toBe(false);
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

    it('should activate focus trap when menu is still open after timeout fires', async () => {
      vi.useFakeTimers();
      vi.spyOn(component['focusTrap'], 'activate').mockReturnValue(true);
      component.isMenuOpen = false;

      component.toggleMenu();
      expect(component.isMenuOpen).toBe(true);

      await vi.advanceTimersByTimeAsync(200);

      expect(component['focusTrap'].activate).toHaveBeenCalledWith('.mobile-dropdown');
    });
  });

  describe('Logo Hover', () => {
    it('should set isHovered to true on onLogoHover', () => {
      component.isHovered = false;
      component.onLogoHover();
      expect(component.isHovered).toBe(true);
    });

    it('should set isHovered to false on onLogoUnhover', () => {
      component.isHovered = true;
      component.onLogoUnhover();
      expect(component.isHovered).toBe(false);
    });
  });

  describe('Menu Close on Mobile', () => {
    it('should close menu on mobile viewport', () => {
      (mockPlatformService as any).window = { innerWidth: 768 } as Window;
      component.isMenuOpen = true;

      component.closeMenuIfMobile();

      expect(component.isMenuOpen).toBe(false);
    });

    it('should not close menu on desktop viewport', () => {
      (mockPlatformService as any).window = { innerWidth: 1920 } as Window;
      component.isMenuOpen = true;

      component.closeMenuIfMobile();

      expect(component.isMenuOpen).toBe(true);
    });

    it('should handle edge cases', () => {
      (mockPlatformService as any).window = null;
      component.isMenuOpen = true;
      component.closeMenuIfMobile();
      expect(component.isMenuOpen).toBe(true);

      (mockPlatformService as any).window = { innerWidth: 1024 } as Window;
      component.isMenuOpen = true;
      component.closeMenuIfMobile();
      expect(component.isMenuOpen).toBe(true);
    });
  });

  describe('Scroll to Section', () => {
    it('should delegate to NavigationService.scrollToSection', () => {
      component.scrollToSection('about');

      expect(mockNavService.scrollToSection).toHaveBeenCalledWith('about');
    });

    it('should pass any section id through', () => {
      component.scrollToSection('contact');
      expect(mockNavService.scrollToSection).toHaveBeenCalledWith('contact');

      component.scrollToSection('projects');
      expect(mockNavService.scrollToSection).toHaveBeenCalledWith('projects');
    });
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

      expect(component.isMenuOpen).toBe(false);
    });

    it('should not close menu if platform not defined', () => {
      mockPlatformService.isWindowDefined.mockReturnValue(false);
      component.isMenuOpen = true;
      const event = new Event('resize');
      Object.defineProperty(event, 'target', { value: { innerWidth: 1920 }, configurable: true });

      component.onResize(event);

      expect(component.isMenuOpen).toBe(true);
    });

    it('should handle null resize target gracefully', () => {
      component.isMenuOpen = true;
      const event = new Event('resize');
      Object.defineProperty(event, 'target', { value: null, configurable: true });

      expect(() => component.onResize(event)).not.toThrow();
      expect(component.isMenuOpen).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete user flow: open menu, scroll, close menu', () => {
      component.toggleMenu();
      expect(component.isMenuOpen).toBe(true);

      component.scrollToSection('about');
      expect(mockNavService.scrollToSection).toHaveBeenCalledWith('about');

      (mockPlatformService as any).window = { innerWidth: 768 } as Window;
      component.closeMenuIfMobile();

      expect(component.isMenuOpen).toBe(false);
    });

    it('should handle language toggle and menu toggle together', () => {
      component.toggleLanguage();
      expect(component.isGerman).toBe(true);

      component.toggleMenu();
      expect(component.isMenuOpen).toBe(true);

      component.toggleLanguage();
      expect(component.isGerman).toBe(false);

      component.toggleMenu();
      expect(component.isMenuOpen).toBe(false);
    });
  });

  describe('Change Detection', () => {
    it('should trigger change detection on scroll check', () => {
      vi.spyOn(component['cdr'], 'markForCheck').mockImplementation(() => undefined);

      component.checkScroll();

      expect(component['cdr'].markForCheck).toHaveBeenCalled();
    });
  });

  describe('Document Click Handler (onDocumentClick)', () => {
    it('should return early when menu is closed', () => {
      component.isMenuOpen = false;
      vi.spyOn(component['cdr'], 'markForCheck').mockImplementation(() => undefined);

      const event = new MouseEvent('click');
      component.onDocumentClick(event);

      expect(component.isMenuOpen).toBe(false);
      expect(component['cdr'].markForCheck).not.toHaveBeenCalled();
    });

    it('should close menu when clicking outside the component', () => {
      component.isMenuOpen = true;
      vi.spyOn(component['cdr'], 'markForCheck').mockImplementation(() => undefined);
      vi.spyOn(component['focusTrap'], 'deactivate').mockImplementation(() => undefined);

      vi.spyOn(component['elementRef'].nativeElement, 'contains').mockReturnValue(false);

      const outsideElement = document.createElement('div');
      const event = new MouseEvent('click');
      Object.defineProperty(event, 'target', { value: outsideElement, configurable: true });

      component.onDocumentClick(event);

      expect(component.isMenuOpen).toBe(false);
      expect(component['focusTrap'].deactivate).toHaveBeenCalled();
      expect(component['cdr'].markForCheck).toHaveBeenCalled();
    });

    it('should keep menu open when clicking inside the component', () => {
      component.isMenuOpen = true;
      vi.spyOn(component['cdr'], 'markForCheck').mockImplementation(() => undefined);

      vi.spyOn(component['elementRef'].nativeElement, 'contains').mockReturnValue(true);

      const insideElement = document.createElement('div');
      const event = new MouseEvent('click');
      Object.defineProperty(event, 'target', { value: insideElement, configurable: true });

      component.onDocumentClick(event);

      expect(component.isMenuOpen).toBe(true);
      expect(component['cdr'].markForCheck).not.toHaveBeenCalled();
    });
  });

  describe('Language Toggle with browser platform', () => {
    it('should save lang to localStorage when isBrowser is true', () => {
      (mockPlatformService as any).isBrowser = true;
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => undefined);
      vi.spyOn(translateService, 'use').mockReturnValue(EMPTY);
      component.isGerman = false;

      component.toggleLanguage();

      expect(localStorage.setItem).toHaveBeenCalledWith('lang', 'de');
      delete (mockPlatformService as any).isBrowser;
    });
  });
});
