import { ElementRef, Inject, Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Projects } from '../../../interfaces/projects';
import { PlatformService } from '../../../shared/services/platform.service';
import { FocusTrapService } from '../../../shared/services/focus-trap.service';
import { TIMING_CONFIG } from '../../../shared/constants/app.constants';

@Injectable()
export class PortfolioOverlayService {
  private readonly platformService = inject(PlatformService);
  private readonly focusTrap = inject(FocusTrapService);

  selectedProject: Projects | null = null;
  selectedIndex = 0;

  private headerElement: HTMLElement | null = null;
  private originalHeaderDisplay = '';

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  open(project: Projects, index: number): void {
    this.selectedProject = project;
    this.selectedIndex = index;
    this.platformService.disableScroll();

    if (isPlatformBrowser(this.platformId)) {
      this.focusTrap.saveFocus();
      this.headerElement = document.querySelector('header');
      if (this.headerElement) {
        this.originalHeaderDisplay = this.headerElement.style.display || 'block';
        this.headerElement.style.display = 'none';
      }
      setTimeout(() => {
        this.focusTrap.activate('.project-modal', false);
        const modal = document.querySelector('.project-modal') as HTMLElement;
        if (modal) { modal.focus(); }
      }, TIMING_CONFIG.MODAL_FOCUS_DELAY);
    }
  }

  close(): void {
    this.selectedProject = null;
    this.platformService.enableScroll();

    if (isPlatformBrowser(this.platformId)) {
      if (this.headerElement) {
        this.headerElement.style.display = this.originalHeaderDisplay;
      }
      this.focusTrap.deactivate(true);
    }
  }

  next(projects: Projects[], descriptionEl?: ElementRef<HTMLParagraphElement>): void {
    this.selectedIndex = (this.selectedIndex + 1) % projects.length;
    this.selectedProject = projects[this.selectedIndex];
    if (descriptionEl) {
      descriptionEl.nativeElement.scrollTop = 0;
    }
  }
}
