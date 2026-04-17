import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AboutMeComponent } from './about-me.component';
import { AOS_CONFIG } from '../../shared/constants/app.constants';

describe('AboutMeComponent', () => {
  let component: AboutMeComponent;
  let fixture: ComponentFixture<AboutMeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutMeComponent, TranslateModule.forRoot()],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AboutMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with browser platform', () => {
      expect(component['isBrowser']).toBe(true);
    });
  });

  describe('About Sections', () => {
    it('should have 3 about sections', () => {
      expect(component.aboutSections.length).toBe(3);
    });

    it('should have correct section structure', () => {
      component.aboutSections.forEach(section => {
        expect(section.icon).toBeDefined();
        expect(section.titleKey).toBeDefined();
        expect(section.textKey).toBeDefined();
        expect(section.alt).toBeDefined();
        expect(section.delay).toBeGreaterThan(0);
      });
    });

    it('should have vision section', () => {
      const visionSection = component.aboutSections.find(s => s.icon === 'about_me.svg');
      expect(visionSection).toBeDefined();
      expect(visionSection?.titleKey).toBe('aboutMe.visionTitle');
    });

    it('should have location section', () => {
      const locationSection = component.aboutSections.find(s => s.icon === 'location.svg');
      expect(locationSection).toBeDefined();
      expect(locationSection?.titleKey).toBe('aboutMe.locationTitle');
    });

    it('should have growth section', () => {
      const growthSection = component.aboutSections.find(s => s.icon === 'about_me_highlights.svg');
      expect(growthSection).toBeDefined();
      expect(growthSection?.titleKey).toBe('aboutMe.growthTitle');
    });
  });

  describe('TrackBy Function', () => {
    it('should track by icon', () => {
      const section = component.aboutSections[0];
      const result = component.trackByIcon(0, section);
      expect(result).toBe(section.icon);
    });

    it('should return unique keys for different sections', () => {
      const keys = component.aboutSections.map((section, index) =>
        component.trackByIcon(index, section)
      );
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(component.aboutSections.length);
    });
  });

  describe('Constants', () => {
    it('should have correct assets path', () => {
      expect(component.ASSETS_PATH).toBe('../../assets/img/about-me/');
    });

    it('should have AOS config from constants', () => {
      expect(AOS_CONFIG.DURATION).toBe(800);
      expect(AOS_CONFIG.OFFSET).toBe(100);
      expect(AOS_CONFIG.DELAY_STEP_1).toBe(400);
      expect(AOS_CONFIG.DELAY_STEP_2).toBe(500);
      expect(AOS_CONFIG.DELAY_STEP_3).toBe(600);
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should initialize scroll animations on init', () => {
      spyOn<any>(component, 'initScrollAnimations');
      component.ngOnInit();
      expect(component['initScrollAnimations']).toHaveBeenCalled();
    });

    it('should cleanup event listeners on destroy', () => {
      const mockCleanup = jasmine.createSpy('cleanup');
      component['eventListeners'] = [mockCleanup];

      component.ngOnDestroy();

      expect(mockCleanup).toHaveBeenCalled();
      expect(component['eventListeners'].length).toBe(0);
    });

    it('should disconnect observer on destroy', () => {
      component['observer'] = {
        disconnect: jasmine.createSpy('disconnect'),
        observe: jasmine.createSpy('observe'),
        unobserve: jasmine.createSpy('unobserve'),
        takeRecords: jasmine.createSpy('takeRecords')
      } as any;

      component.ngOnDestroy();

      expect(component['observer']?.disconnect).toHaveBeenCalled();
    });

    it('should cancel animation frame on destroy', () => {
      spyOn(window, 'cancelAnimationFrame');
      component['animationFrameId'] = 123;

      component.ngOnDestroy();

      expect(window.cancelAnimationFrame).toHaveBeenCalledWith(123);
    });
  });

  describe('Server-Side Rendering', () => {
    it('should handle SSR gracefully', () => {
      const ssrComponent = new AboutMeComponent({} as object);
      expect(ssrComponent['isBrowser']).toBe(false);
    });

    it('should not initialize animations on server', () => {
      const ssrComponent = new AboutMeComponent({} as object);
      spyOn<any>(ssrComponent, 'initScrollAnimations');

      ssrComponent.ngOnInit();

      expect(ssrComponent['initScrollAnimations']).not.toHaveBeenCalled();
    });
  });

  describe('AOS Initialization', () => {
    it('should call AOS.init when window.AOS is defined', () => {
      const mockAOS = { init: jasmine.createSpy('init') };
      (window as any).AOS = mockAOS;

      component['initScrollAnimations']();

      expect(mockAOS.init).toHaveBeenCalledWith(jasmine.objectContaining({
        duration: AOS_CONFIG.DURATION,
        easing: 'ease-in-out',
        once: true,
        offset: AOS_CONFIG.OFFSET
      }));

      delete (window as any).AOS;
    });

    it('should not throw when AOS is not defined', () => {
      delete (window as any).AOS;
      expect(() => component['initScrollAnimations']()).not.toThrow();
    });
  });

  describe('IntersectionObserver callback', () => {
    let originalIntersectionObserver: typeof IntersectionObserver;

    beforeEach(() => {
      originalIntersectionObserver = window.IntersectionObserver;
    });

    afterEach(() => {
      (window as any).IntersectionObserver = originalIntersectionObserver;
    });

    it('should add animate-in class when entry is intersecting', () => {
      let capturedCallback: ((entries: IntersectionObserverEntry[]) => void) | null = null;

      class MockIntersectionObserver {
        observe = jasmine.createSpy('observe');
        disconnect = jasmine.createSpy('disconnect');
        unobserve = jasmine.createSpy('unobserve');
        takeRecords = jasmine.createSpy('takeRecords');
        constructor(cb: any) { capturedCallback = cb; }
      }
      (window as any).IntersectionObserver = MockIntersectionObserver;

      component['initIntersectionObserver']();

      const mockElement = document.createElement('div');
      const mockEntry = { isIntersecting: true, target: mockElement } as unknown as IntersectionObserverEntry;
      capturedCallback!([mockEntry]);

      expect(mockElement.classList.contains('animate-in')).toBe(true);
    });

    it('should not add animate-in class when entry is not intersecting', () => {
      let capturedCallback: ((entries: IntersectionObserverEntry[]) => void) | null = null;

      class MockIntersectionObserver {
        observe = jasmine.createSpy('observe');
        disconnect = jasmine.createSpy('disconnect');
        unobserve = jasmine.createSpy('unobserve');
        takeRecords = jasmine.createSpy('takeRecords');
        constructor(cb: any) { capturedCallback = cb; }
      }
      (window as any).IntersectionObserver = MockIntersectionObserver;

      component['initIntersectionObserver']();

      const mockElement = document.createElement('div');
      const mockEntry = { isIntersecting: false, target: mockElement } as unknown as IntersectionObserverEntry;
      capturedCallback!([mockEntry]);

      expect(mockElement.classList.contains('animate-in')).toBe(false);
    });
  });
});
