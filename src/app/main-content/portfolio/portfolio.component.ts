import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Projects } from '../../interfaces/projects';
import { PlatformService } from '../../shared/services/platform.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { PassiveTouchStartDirective, PassiveTouchEndDirective } from '../../shared/directives/passive-listeners.directive';
import { BREAKPOINTS, PORTFOLIO_CONFIG } from '../../shared/constants/app.constants';
import { ProjectDataService } from './services/project-data.service';
import { PortfolioOverlayService } from './services/portfolio-overlay.service';
import { NavigationService } from '../../shared/services/navigation.service';

@Component({
  selector: 'app-portfolio',
  imports: [TranslatePipe, RouterLink, PassiveTouchStartDirective, PassiveTouchEndDirective],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PortfolioOverlayService],
})
export class PortfolioComponent implements OnInit, OnDestroy {
  @ViewChild('projectsTable') projectsTable!: ElementRef;
  @ViewChild('descriptionEl') descriptionEl?: ElementRef<HTMLParagraphElement>;

  protected readonly data = inject(ProjectDataService);
  
  protected readonly overlay = inject(PortfolioOverlayService);
  private readonly platformService = inject(PlatformService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly navigationService = inject(NavigationService);

  protected readonly isProjectsPage = this.router.url.startsWith('/projects');

  // ── Local UI state ──────────────────────────────────────────────────────────
  activeProjectId: number | null = null;
  hoverPosition: number | null = null;
  activePreview = '';
  isLandscape = false;

  // ── Delegating accessors — keep the template and tests unchanged ────────────
  get projects(): Projects[] {
    return this.isProjectsPage ? this.data.projects : this.data.projects.filter((p) => p.featured !== false);
  }

  get selectedProject(): Projects | null { return this.overlay.selectedProject; }
  set selectedProject(v: Projects | null) { this.overlay.selectedProject = v; }

  get selectedIndex(): number { return this.overlay.selectedIndex; }
  set selectedIndex(v: number) { this.overlay.selectedIndex = v; }

  // ── Touch gesture state ─────────────────────────────────────────────────────
  private touchStartX = 0;
  private touchStartY = 0;
  private touchMoved = false;
  private pendingRafId: number | null = null;
  private readonly boundOnTouchMove = this.onTouchMove.bind(this);

  constructor() {
    this.checkOrientation();
  }

  ngOnInit(): void {
    if (this.platformService.isBrowser) {
      document.addEventListener('touchmove', this.boundOnTouchMove, { passive: true });
    }
  }

  ngOnDestroy(): void {
    if (this.pendingRafId !== null) { cancelAnimationFrame(this.pendingRafId); }
    this.platformService.enableScroll();
    if (this.platformService.isBrowser) {
      document.removeEventListener('touchmove', this.boundOnTouchMove);
    }
  }

  @HostListener('window:resize')
  onResize(): void { this.checkOrientation(); }

  @HostListener('window:orientationchange')
  onOrientationChange(): void { this.checkOrientation(); }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.overlay.selectedProject) { this.closeOverlay(); }
  }

  setActiveProject(index: number, event: MouseEvent): void {
    const win = this.platformService.window;
    if (!win || win.innerWidth <= BREAKPOINTS.MOBILE_MAX || this.pendingRafId !== null) { return; }

    this.activeProjectId = index;
    this.activePreview = this.projects[index].previewImg;
    const trElement = event.currentTarget as HTMLElement;

    this.pendingRafId = requestAnimationFrame(() => {
      this.pendingRafId = null;
      this.hoverPosition = this.calculatePreviewPosition(trElement, index, win);
      this.cdr.markForCheck();
    });
  }

  clearActiveProject(): void {
    this.activeProjectId = null;
    this.hoverPosition = null;
    this.activePreview = '';
    this.cdr.markForCheck();
  }

  handleTouchStart(event: TouchEvent, index: number): void {
    if (!event.touches.length) { return; }
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
    this.touchMoved = false;
    this.activeProjectId = index;
    this.activePreview = this.projects[index].previewImg;

    requestAnimationFrame(() => {
      const tableRect = this.projectsTable.nativeElement.getBoundingClientRect();
      const trRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      this.hoverPosition = trRect.top - tableRect.top + trRect.height / 2 - PORTFOLIO_CONFIG.PREVIEW_BASE_OFFSET;
      this.cdr.markForCheck();
    });
  }

  handleTouchEnd(_event: TouchEvent, index: number): void {
    if (!this.touchMoved) { this.openProjectOverlay(this.projects[index], index); }
    this.clearActiveProject();
  }

  openProjectOverlay(project: Projects, index: number): void {
    this.checkOrientation();
    this.overlay.open(project, index);
    this.cdr.markForCheck();
  }

  closeOverlay(): void {
    this.overlay.close();
    this.cdr.markForCheck();
  }

  nextProject(): void {
    this.overlay.next(this.projects, this.descriptionEl);
    this.cdr.markForCheck();
  }

  goToFeaturedProjects(event: Event): void {
    event.preventDefault();
    this.navigationService.scrollToSection('projects');
  }

  // ── Template helpers delegated to ProjectDataService ───────────────────────
  hasTechIcon(technology: string): boolean { return this.data.hasTechIcon(technology); }
  getTechIconPath(technology: string): string | null { return this.data.getTechIconPath(technology); }
  getProjectScreenshotAlt(idx: number | null): string { return this.data.getProjectScreenshotAlt(idx, this.projects); }
  getProjectShortDescription(project: Projects): string { return this.data.getProjectShortDescription(project); }
  getProjectDescription(project: Projects): string { return this.data.getProjectDescription(project); }

  private onTouchMove(event: TouchEvent): void {
    if (!event.touches.length) { return; }
    const deltaX = Math.abs(event.touches[0].clientX - this.touchStartX);
    const deltaY = Math.abs(event.touches[0].clientY - this.touchStartY);
    if (deltaX > PORTFOLIO_CONFIG.TOUCH_THRESHOLD || deltaY > PORTFOLIO_CONFIG.TOUCH_THRESHOLD) {
      this.touchMoved = true;
      this.clearActiveProject();
    }
  }

  private checkOrientation(): void {
    const win = this.platformService.window;
    if (win) {
      this.isLandscape = win.innerWidth > win.innerHeight;
      this.cdr.markForCheck();
    }
  }

  private calculatePreviewPosition(trElement: HTMLElement, index: number, win: Window): number {
    const tableRect = this.projectsTable.nativeElement.getBoundingClientRect();
    const trRect = trElement.getBoundingClientRect();
    const base = trRect.top - tableRect.top + trRect.height / 2 - PORTFOLIO_CONFIG.PREVIEW_BASE_OFFSET;
    const hoverOffset = this.projects[index]?.hoverOffset;
    if (!hoverOffset) { return base; }
    const isSmall = win.innerWidth <= BREAKPOINTS.SMALL_PREVIEW_MAX;
    return base + hoverOffset.base + (isSmall ? hoverOffset.smallPreview : 0);
  }
}
