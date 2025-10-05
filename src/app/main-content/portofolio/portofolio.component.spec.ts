import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PortofolioComponent } from './portofolio.component';
import { PlatformService } from '../../shared/services/platform.service';
import { ElementRef, PLATFORM_ID } from '@angular/core';

describe('PortofolioComponent', () => {
  let component: PortofolioComponent;
  let fixture: ComponentFixture<PortofolioComponent>;
  let platformService: PlatformService;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortofolioComponent, TranslateModule.forRoot()],
      providers: [
        PlatformService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PortofolioComponent);
    component = fixture.componentInstance;
    platformService = TestBed.inject(PlatformService);
    translateService = TestBed.inject(TranslateService);

    // Mock projectsTable ViewChild
    component.projectsTable = {
      nativeElement: {
        getBoundingClientRect: () => ({ top: 100, left: 0, width: 800, height: 600 })
      }
    } as ElementRef;

    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.activeProjectId).toBeNull();
      expect(component.selectedProject).toBeNull();
      expect(component.selectedIndex).toBe(0);
      expect(component.hoverPosition).toBeNull();
    });

    it('should have projects array with 3 projects', () => {
      expect(component.projects).toBeDefined();
      expect(component.projects.length).toBe(3);
    });

    it('should have correct project data structure', () => {
      const project = component.projects[0];
      expect(project.name).toBeDefined();
      expect(project.technologies).toBeDefined();
      expect(project.previewImg).toBeDefined();
      expect(project.description).toBeDefined();
      expect(project.githubUrl).toBeDefined();
      expect(project.liveUrl).toBeDefined();
    });
  });

  describe('Project Overlay Management', () => {
    it('should open project overlay', () => {
      const project = component.projects[0];
      spyOn(platformService, 'disableScroll');

      component.openProjectOverlay(project, 0);

      expect(component.selectedProject).toBe(project);
      expect(component.selectedIndex).toBe(0);
      expect(platformService.disableScroll).toHaveBeenCalled();
    });

    it('should close overlay', () => {
      spyOn(platformService, 'enableScroll');
      component.selectedProject = component.projects[0];

      component.closeOverlay();

      expect(component.selectedProject).toBeNull();
      expect(platformService.enableScroll).toHaveBeenCalled();
    });

    it('should hide header when opening overlay', () => {
      const mockHeader = document.createElement('header');
      mockHeader.style.display = 'block';
      document.body.appendChild(mockHeader);

      component.openProjectOverlay(component.projects[0], 0);

      expect(mockHeader.style.display).toBe('none');

      document.body.removeChild(mockHeader);
    });

    it('should restore header display when closing overlay', () => {
      const mockHeader = document.createElement('header');
      mockHeader.style.display = 'block';
      document.body.appendChild(mockHeader);

      component.openProjectOverlay(component.projects[0], 0);
      component.closeOverlay();

      expect(mockHeader.style.display).toBe('block');

      document.body.removeChild(mockHeader);
    });

    it('should check orientation when opening overlay', () => {
      spyOn<any>(component, 'checkOrientation');

      component.openProjectOverlay(component.projects[0], 0);

      expect(component['checkOrientation']).toHaveBeenCalled();
    });
  });

  describe('Project Navigation', () => {
    it('should navigate to next project', () => {
      component.selectedProject = component.projects[0];
      component.selectedIndex = 0;

      component.nextProject();

      expect(component.selectedIndex).toBe(1);
      expect(component.selectedProject).toBe(component.projects[1]);
    });

    it('should wrap to first project when at end', () => {
      const lastIndex = component.projects.length - 1;
      component.selectedIndex = lastIndex;
      component.selectedProject = component.projects[lastIndex];

      component.nextProject();

      expect(component.selectedIndex).toBe(0);
      expect(component.selectedProject).toBe(component.projects[0]);
    });
  });

  describe('Active Project Management', () => {
    it('should set active project on hover', fakeAsync(() => {
      const mockDiv = document.createElement('div');
      mockDiv.getBoundingClientRect = () => ({
        top: 150,
        left: 0,
        height: 50,
        width: 800,
        bottom: 200,
        right: 800,
        x: 0,
        y: 150,
        toJSON: () => ({})
      });

      const mockEvent = new MouseEvent('mouseenter');
      Object.defineProperty(mockEvent, 'currentTarget', {
        value: mockDiv,
        writable: false,
      });

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920
      });

      component.setActiveProject(0, mockEvent);
      tick();

      expect(component.activeProjectId).toBe(0);
      expect(component.activePreview).toBe(component.projects[0].previewImg);
    }));

    it('should not set active project on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 400
      });

      const mockEvent = new MouseEvent('mouseenter');
      component.setActiveProject(0, mockEvent);

      expect(component.activeProjectId).toBeNull();
    });

    it('should clear active project', () => {
      component.activeProjectId = 0;
      component.hoverPosition = 100;
      component.activePreview = 'test.png';

      component.clearActiveProject();

      expect(component.activeProjectId).toBeNull();
      expect(component.hoverPosition).toBeNull();
      expect(component.activePreview).toBe('');
    });
  });

  describe('Touch Event Handling', () => {
    it('should handle touch start', fakeAsync(() => {
      const mockDiv = document.createElement('div');
      mockDiv.getBoundingClientRect = () => ({
        top: 150,
        left: 0,
        height: 50,
        width: 800,
        bottom: 200,
        right: 800,
        x: 0,
        y: 150,
        toJSON: () => ({})
      });

      const mockTouch = { clientX: 100, clientY: 100 };
      const touchEvent = {
        touches: [mockTouch],
        currentTarget: mockDiv
      } as any;

      component.handleTouchStart(touchEvent, 0);
      tick();

      expect(component.activeProjectId).toBe(0);
    }));

    it('should handle touch end and open overlay if not moved', () => {
      component['touchMoved'] = false;
      spyOn(component, 'openProjectOverlay');

      const touchEvent = {
        preventDefault: jasmine.createSpy('preventDefault')
      } as any;

      component.handleTouchEnd(touchEvent, 0);

      expect(touchEvent.preventDefault).toHaveBeenCalled();
      expect(component.openProjectOverlay).toHaveBeenCalledWith(component.projects[0], 0);
    });

    it('should not open overlay if touch moved', () => {
      component['touchMoved'] = true;
      spyOn(component, 'openProjectOverlay');

      const touchEvent = {
        preventDefault: jasmine.createSpy('preventDefault')
      } as any;

      component.handleTouchEnd(touchEvent, 0);

      expect(component.openProjectOverlay).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close overlay on escape key', () => {
      component.selectedProject = component.projects[0];
      spyOn(component, 'closeOverlay');

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      spyOn(event, 'preventDefault');

      component.onEscapeKey(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.closeOverlay).toHaveBeenCalled();
    });

    it('should not prevent default if no overlay is open', () => {
      component.selectedProject = null;

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      spyOn(event, 'preventDefault');

      component.onEscapeKey(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('Orientation Detection', () => {
    it('should detect landscape orientation', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1080
      });

      component['checkOrientation']();

      expect(component.isLandscape).toBe(true);
    });

    it('should detect portrait orientation', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024
      });

      component['checkOrientation']();

      expect(component.isLandscape).toBe(false);
    });
  });

  describe('Helper Methods', () => {
    it('should get project screenshot alt text', () => {
      const alt = component.getProjectScreenshotAlt(0);
      expect(alt).toBe('Join screenshot');
    });

    it('should return default alt text for null index', () => {
      const alt = component.getProjectScreenshotAlt(null);
      expect(alt).toBe('Project screenshot');
    });

    it('should return default alt text for invalid index', () => {
      const alt = component.getProjectScreenshotAlt(999);
      expect(alt).toBe('Project screenshot');
    });

    it('should check if technology has icon', () => {
      expect(component.hasTechIcon('Angular')).toBe(true);
      expect(component.hasTechIcon('TypeScript')).toBe(true);
      expect(component.hasTechIcon('UnknownTech')).toBe(false);
    });

    it('should get tech icon path', () => {
      expect(component.getTechIconPath('Angular')).toBe('assets/img/projects/icons/angular.svg');
      expect(component.getTechIconPath('Firebase')).toBe('assets/img/projects/icons/firebase.svg');
      expect(component.getTechIconPath('UnknownTech')).toBeNull();
    });

    it('should get project short description with translation', () => {
      spyOn(translateService, 'instant').and.returnValue('Test description');

      const desc = component.getProjectShortDescription(component.projects[0]);

      expect(translateService.instant).toHaveBeenCalledWith('projects.join.shortDescription');
      expect(desc).toBe('Test description');
    });

    it('should get project description with translation', () => {
      spyOn(translateService, 'instant').and.returnValue('Test description');

      const desc = component.getProjectDescription(component.projects[0]);

      expect(translateService.instant).toHaveBeenCalledWith('projects.join.description');
      expect(desc).toBe('Test description');
    });

    it('should return default description for unknown project', () => {
      const unknownProject = { name: 'Unknown', technologies: [], previewImg: '', description: 'Default desc', githubUrl: '', liveUrl: '' };

      const desc = component.getProjectDescription(unknownProject);

      expect(desc).toBe('Default desc');
    });
  });

  describe('Hover and Leave Handlers', () => {
    it('should call setActiveProject on hover', () => {
      spyOn(component, 'setActiveProject');
      const mockEvent = new MouseEvent('mouseenter');

      component.onHover(mockEvent, component.projects[0]);

      expect(component.setActiveProject).toHaveBeenCalledWith(0, mockEvent);
    });

    it('should call clearActiveProject on leave', () => {
      spyOn(component, 'clearActiveProject');

      component.onLeave();

      expect(component.clearActiveProject).toHaveBeenCalled();
    });

    it('should not call setActiveProject if project not found', () => {
      spyOn(component, 'setActiveProject');
      const mockEvent = new MouseEvent('mouseenter');
      const unknownProject = { name: 'Unknown', technologies: [], previewImg: '', description: '', githubUrl: '', liveUrl: '' };

      component.onHover(mockEvent, unknownProject);

      expect(component.setActiveProject).not.toHaveBeenCalled();
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should add touch event listener on init', () => {
      spyOn(document, 'addEventListener');

      component.ngOnInit();

      expect(document.addEventListener).toHaveBeenCalledWith(
        'touchmove',
        jasmine.any(Function),
        { passive: true }
      );
    });

    it('should remove touch event listener on destroy', () => {
      spyOn(document, 'removeEventListener');
      spyOn(platformService, 'enableScroll');

      component.ngOnDestroy();

      expect(document.removeEventListener).toHaveBeenCalledWith(
        'touchmove',
        jasmine.any(Function)
      );
      expect(platformService.enableScroll).toHaveBeenCalled();
    });
  });

  describe('RequestAnimationFrame Throttling', () => {
    it('should prevent multiple simultaneous setActiveProject calls', fakeAsync(() => {
      const mockDiv = document.createElement('div');
      mockDiv.getBoundingClientRect = () => ({
        top: 150,
        left: 0,
        height: 50,
        width: 800,
        bottom: 200,
        right: 800,
        x: 0,
        y: 150,
        toJSON: () => ({})
      });

      const mockEvent = new MouseEvent('mouseenter');
      Object.defineProperty(mockEvent, 'currentTarget', {
        value: mockDiv,
        writable: false,
      });

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920
      });

      component.setActiveProject(0, mockEvent);

      // Set rafPending to true to simulate ongoing animation frame
      component['rafPending'] = true;
      const initialProjectId = component.activeProjectId;

      component.setActiveProject(1, mockEvent);

      // Should return early due to rafPending flag
      expect(component.activeProjectId).toBe(initialProjectId);
    }));
  });
});
