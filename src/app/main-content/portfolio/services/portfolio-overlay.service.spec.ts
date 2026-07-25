import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { PortfolioOverlayService } from './portfolio-overlay.service';
import { PlatformService } from '../../../shared/services/platform.service';
import { FocusTrapService } from '../../../shared/services/focus-trap.service';
import { Projects } from '../../../interfaces/projects';
import { TIMING_CONFIG } from '../../../shared/constants/app.constants';

describe('PortfolioOverlayService', () => {
  let service: PortfolioOverlayService;
  let platformService: PlatformService;
  let focusTrap: FocusTrapService;

  const mockProjects: Projects[] = [
    { id: 'a', name: 'A', technologies: [], previewImg: '', githubUrl: '', liveUrl: '' },
    { id: 'b', name: 'B', technologies: [], previewImg: '', githubUrl: '', liveUrl: '' },
    { id: 'c', name: 'C', technologies: [], previewImg: '', githubUrl: '', liveUrl: '' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PortfolioOverlayService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(PortfolioOverlayService);
    platformService = TestBed.inject(PlatformService);
    focusTrap = TestBed.inject(FocusTrapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with no selected project', () => {
    expect(service.selectedProject).toBeNull();
    expect(service.selectedIndex).toBe(0);
  });

  describe('open', () => {
    it('should set selectedProject and selectedIndex', () => {
      service.open(mockProjects[1], 1);

      expect(service.selectedProject).toBe(mockProjects[1]);
      expect(service.selectedIndex).toBe(1);
    });

    it('should disable scroll', () => {
      spyOn(platformService, 'disableScroll');

      service.open(mockProjects[0], 0);

      expect(platformService.disableScroll).toHaveBeenCalled();
    });

    it('should save focus and hide the header in the browser', fakeAsync(() => {
      const header = document.createElement('header');
      header.style.display = 'block';
      document.body.appendChild(header);
      spyOn(focusTrap, 'saveFocus');

      service.open(mockProjects[0], 0);

      expect(focusTrap.saveFocus).toHaveBeenCalled();
      expect(header.style.display).toBe('none');

      tick(TIMING_CONFIG.MODAL_FOCUS_DELAY);
      document.body.removeChild(header);
    }));

    it('should default originalHeaderDisplay to "block" when the header has no inline display', fakeAsync(() => {
      const header = document.createElement('header');
      document.body.appendChild(header);

      service.open(mockProjects[0], 0);
      tick(TIMING_CONFIG.MODAL_FOCUS_DELAY);
      service.close();

      expect(header.style.display).toBe('block');

      document.body.removeChild(header);
    }));

    it('should activate the focus trap on the modal after the timing delay', fakeAsync(() => {
      spyOn(focusTrap, 'activate');

      service.open(mockProjects[0], 0);
      tick(TIMING_CONFIG.MODAL_FOCUS_DELAY);

      expect(focusTrap.activate).toHaveBeenCalledWith('.project-modal', false);
    }));

    it('should focus the modal element when found after the timing delay', fakeAsync(() => {
      const modal = document.createElement('div');
      modal.classList.add('project-modal');
      document.body.appendChild(modal);
      spyOn(modal, 'focus');

      service.open(mockProjects[0], 0);
      tick(TIMING_CONFIG.MODAL_FOCUS_DELAY);

      expect(modal.focus).toHaveBeenCalled();
      document.body.removeChild(modal);
    }));

    it('should not throw when no header or modal element exists', fakeAsync(() => {
      expect(() => {
        service.open(mockProjects[0], 0);
        tick(TIMING_CONFIG.MODAL_FOCUS_DELAY);
      }).not.toThrow();
    }));
  });

  describe('close', () => {
    it('should clear selectedProject', () => {
      service.selectedProject = mockProjects[0];

      service.close();

      expect(service.selectedProject).toBeNull();
    });

    it('should enable scroll', () => {
      spyOn(platformService, 'enableScroll');

      service.close();

      expect(platformService.enableScroll).toHaveBeenCalled();
    });

    it('should restore the header display and deactivate the focus trap in the browser', fakeAsync(() => {
      const header = document.createElement('header');
      header.style.display = 'block';
      document.body.appendChild(header);
      spyOn(focusTrap, 'deactivate');

      service.open(mockProjects[0], 0);
      tick(TIMING_CONFIG.MODAL_FOCUS_DELAY);
      service.close();

      expect(header.style.display).toBe('block');
      expect(focusTrap.deactivate).toHaveBeenCalledWith(true);

      document.body.removeChild(header);
    }));

    it('should not throw when closing without a previously opened header', () => {
      expect(() => service.close()).not.toThrow();
    });
  });

  describe('next', () => {
    it('should advance to the next project and update the selected project', () => {
      service.selectedIndex = 0;

      service.next(mockProjects);

      expect(service.selectedIndex).toBe(1);
      expect(service.selectedProject).toBe(mockProjects[1]);
    });

    it('should wrap around to the first project at the end of the list', () => {
      service.selectedIndex = mockProjects.length - 1;

      service.next(mockProjects);

      expect(service.selectedIndex).toBe(0);
      expect(service.selectedProject).toBe(mockProjects[0]);
    });

    it('should reset descriptionEl scrollTop when provided', () => {
      const descriptionEl = { nativeElement: { scrollTop: 150 } } as any;

      service.next(mockProjects, descriptionEl);

      expect(descriptionEl.nativeElement.scrollTop).toBe(0);
    });

    it('should not throw when descriptionEl is not provided', () => {
      expect(() => service.next(mockProjects)).not.toThrow();
    });
  });
});

describe('PortfolioOverlayService - SSR (server platform)', () => {
  let service: PortfolioOverlayService;
  let platformService: PlatformService;
  let focusTrap: FocusTrapService;

  const mockProjects: Projects[] = [
    { id: 'a', name: 'A', technologies: [], previewImg: '', githubUrl: '', liveUrl: '' },
    { id: 'b', name: 'B', technologies: [], previewImg: '', githubUrl: '', liveUrl: '' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PortfolioOverlayService,
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    service = TestBed.inject(PortfolioOverlayService);
    platformService = TestBed.inject(PlatformService);
    focusTrap = TestBed.inject(FocusTrapService);
  });

  it('should report isBrowser as false', () => {
    expect(platformService.isBrowser).toBe(false);
  });

  it('open should not touch the focus trap or the DOM on the server', () => {
    spyOn(focusTrap, 'saveFocus');
    spyOn(focusTrap, 'activate');

    service.open(mockProjects[0], 0);

    expect(focusTrap.saveFocus).not.toHaveBeenCalled();
    expect(focusTrap.activate).not.toHaveBeenCalled();
    expect(service.selectedProject).toBe(mockProjects[0]);
    expect(service.selectedIndex).toBe(0);
  });

  it('open should still disable scroll through the platform service on the server', () => {
    spyOn(platformService, 'disableScroll');

    service.open(mockProjects[0], 0);

    expect(platformService.disableScroll).toHaveBeenCalled();
  });

  it('close should not touch the focus trap or the DOM on the server', () => {
    spyOn(focusTrap, 'deactivate');
    service.selectedProject = mockProjects[0];

    service.close();

    expect(focusTrap.deactivate).not.toHaveBeenCalled();
    expect(service.selectedProject).toBeNull();
  });

  it('close should still enable scroll through the platform service on the server', () => {
    spyOn(platformService, 'enableScroll');

    service.close();

    expect(platformService.enableScroll).toHaveBeenCalled();
  });
});
