import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PortfolioComponent } from './portfolio.component';
import { PlatformService } from '../../shared/services/platform.service';
import { ElementRef, PLATFORM_ID } from '@angular/core';

describe('PortfolioComponent', () => {
  let component: PortfolioComponent;
  let fixture: ComponentFixture<PortfolioComponent>;
  let platformService: PlatformService;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioComponent, TranslateModule.forRoot()],
      providers: [
        PlatformService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioComponent);
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

    it('should have projects array with 4 projects', () => {
      expect(component.projects).toBeDefined();
      expect(component.projects.length).toBe(4);
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

      const touchEvent = {} as any;

      component.handleTouchEnd(touchEvent, 0);

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

      component.onEscapeKey();

      expect(component.closeOverlay).toHaveBeenCalled();
    });

    it('should not close overlay if no overlay is open', () => {
      component.selectedProject = null;
      spyOn(component, 'closeOverlay');

      component.onEscapeKey();

      expect(component.closeOverlay).not.toHaveBeenCalled();
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
      const alt = component.getProjectScreenshotAlt(1);
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
      const joinProject = component.projects.find(p => p.name === 'Join')!;

      const desc = component.getProjectShortDescription(joinProject);

      expect(translateService.instant).toHaveBeenCalledWith('projects.join.shortDescription');
      expect(desc).toBe('Test description');
    });

    it('should get project description with translation', () => {
      spyOn(translateService, 'instant').and.returnValue('Test description');
      const joinProject = component.projects.find(p => p.name === 'Join')!;

      const desc = component.getProjectDescription(joinProject);

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
    it('should set active project on hover', () => {
      spyOn(component, 'setActiveProject');
      const mockEvent = new MouseEvent('mouseenter');

      component.setActiveProject(0, mockEvent);

      expect(component.setActiveProject).toHaveBeenCalledWith(0, mockEvent);
    });

    it('should clear active project on leave', () => {
      spyOn(component, 'clearActiveProject');

      component.clearActiveProject();

      expect(component.clearActiveProject).toHaveBeenCalled();
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

  describe('HostListener resize and orientationchange', () => {
    it('should call checkOrientation on window resize', () => {
      spyOn(component as any, 'checkOrientation');
      component.onResize();
      expect(component['checkOrientation']).toHaveBeenCalled();
    });

    it('should call checkOrientation on orientationchange', () => {
      spyOn(component as any, 'checkOrientation');
      component.onOrientationChange();
      expect(component['checkOrientation']).toHaveBeenCalled();
    });
  });

  describe('setActiveProject - small preview and missing offsetConfig', () => {
    let mockDiv: HTMLElement;
    let mockEvent: MouseEvent;

    beforeEach(() => {
      mockDiv = document.createElement('div');
      mockDiv.getBoundingClientRect = () => ({
        top: 150, left: 0, height: 50, width: 800,
        bottom: 200, right: 800, x: 0, y: 150, toJSON: () => ({})
      });
      mockEvent = new MouseEvent('mouseenter');
      Object.defineProperty(mockEvent, 'currentTarget', { value: mockDiv, writable: false });
    });

    it('should use SMALL_PREVIEW offset when innerWidth is small', fakeAsync(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 700 });

      component.setActiveProject(0, mockEvent);
      tick(16);

      expect(component.hoverPosition).not.toBeNull();
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1920 });
    }));

    it('should use base position when offsetConfig is missing', fakeAsync(() => {
      const projects = component.projects;
      component.projects = [
        ...projects,
        { name: 'NoOffset', technologies: [], previewImg: '', description: '', githubUrl: '', liveUrl: '', offsetConfig: { x: 0, y: 0 }  }
      ] as any;

      component.setActiveProject(4, mockEvent);
      tick(16);

      expect(component.hoverPosition).not.toBeNull();
      component.projects = projects;
    }));
  });

  describe('handleTouchStart early return', () => {
    it('should return early when event has no touches', () => {
      const emptyTouchEvent = { touches: { length: 0 } } as unknown as TouchEvent;
      const initialX = component['touchStartX'];

      component.handleTouchStart(emptyTouchEvent, 0);

      expect(component['touchStartX']).toBe(initialX);
    });
  });

  describe('onTouchMove private method', () => {
    it('should return early when event has no touches', () => {
      const emptyTouchEvent = { touches: { length: 0 } } as unknown as TouchEvent;
      const initialMoved = component['touchMoved'];

      component['onTouchMove'](emptyTouchEvent);

      expect(component['touchMoved']).toBe(initialMoved);
    });

    it('should set touchMoved when deltaX exceeds threshold', () => {
      component['touchStartX'] = 0;
      component['touchStartY'] = 0;
      const moveEvent = {
        touches: [{ clientX: 100, clientY: 0 }],
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        preventDefault: () => {}
      } as any;

      component['onTouchMove'](moveEvent);

      expect(component['touchMoved']).toBe(true);
    });

    it('should set touchMoved when only deltaY exceeds threshold', () => {
      component['touchStartX'] = 0;
      component['touchStartY'] = 0;
      const moveEvent = {
        touches: [{ clientX: 0, clientY: 100 }],
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        preventDefault: () => {}
      } as any;

      component['onTouchMove'](moveEvent);

      expect(component['touchMoved']).toBe(true);
    });
  });

  describe('openProjectOverlay edge cases', () => {
    it('should use "block" fallback when headerElement has no display style', fakeAsync(() => {
      const header = document.createElement('header');
      header.style.display = '';
      document.body.appendChild(header);
      spyOn(document, 'querySelector').and.callFake((selector: string) => {
        if (selector === 'header') { return header; }
        return null;
      });

      component.openProjectOverlay(component.projects[0], 0);
      tick(200);

      expect(component['originalHeaderDisplay']).toBe('block');
      document.body.removeChild(header);
    }));

    it('should focus modal when .project-modal is found', fakeAsync(() => {
      const modal = document.createElement('div');
      modal.classList.add('project-modal');
      document.body.appendChild(modal);
      spyOn(modal, 'focus');
      spyOn(document, 'querySelector').and.callFake((selector: string) => {
        if (selector === 'header') { return null; }
        if (selector === '.project-modal') { return modal; }
        return null;
      });

      component.openProjectOverlay(component.projects[0], 0);
      tick(200);

      expect(modal.focus).toHaveBeenCalled();
      document.body.removeChild(modal);
    }));
  });

  describe('getProjectScreenshotAlt fallback', () => {
    it('should return "Project screenshot" when project name is empty', () => {
      const origProjects = component.projects;
      component.projects = [{ name: '', technologies: [], previewImg: '', description: '', githubUrl: '', liveUrl: '' }] as any;

      const alt = component.getProjectScreenshotAlt(0);

      expect(alt).toBe('Project screenshot');
      component.projects = origProjects;
    });
  });

  describe('getProjectTranslation shortDescription fallback', () => {
    it('should call translate.instant for unknown project shortDescription', () => {
      spyOn(translateService, 'instant').and.returnValue('default short');
      const unknownProject = { name: 'Unknown', technologies: [], previewImg: '', description: 'desc', githubUrl: '', liveUrl: '' };

      const result = component.getProjectShortDescription(unknownProject as any);

      expect(translateService.instant).toHaveBeenCalledWith('projects.default.shortDescription');
      expect(result).toBe('default short');
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
