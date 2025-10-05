import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AboutmeComponent } from './about-me.component';

describe('AboutmeComponent', () => {
  let component: AboutmeComponent;
  let fixture: ComponentFixture<AboutmeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutmeComponent, TranslateModule.forRoot()],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AboutmeComponent);
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

    it('should have AOS config', () => {
      expect(component.AOS_CONFIG.duration).toBe(800);
      expect(component.AOS_CONFIG.easing).toBe('ease-in-out');
      expect(component.AOS_CONFIG.once).toBe(true);
      expect(component.AOS_CONFIG.offset).toBe(100);
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
      const ssrComponent = new AboutmeComponent('server');
      expect(ssrComponent['isBrowser']).toBe(false);
    });

    it('should not initialize animations on server', () => {
      const ssrComponent = new AboutmeComponent('server');
      spyOn<any>(ssrComponent, 'initScrollAnimations');

      ssrComponent.ngOnInit();

      expect(ssrComponent['initScrollAnimations']).not.toHaveBeenCalled();
    });
  });
});
