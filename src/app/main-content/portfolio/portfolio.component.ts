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
  // On the home page, "view all" expands the list in place instead of
  // navigating to /projects — no route change, so no scroll/timing dance.
  showAll = false;

  // ── Delegating accessors — keep the template and tests unchanged ────────────
  get projects(): Projects[] {
    if (this.isProjectsPage) { return this.data.projects; }
    const featured = this.data.projects.filter((p) => p.featured !== false);
    if (!this.showAll) { return featured; }
    // Keep the featured projects in place and append the rest below them,
    // so expanding the list never reshuffles what was already on screen.
    const rest = this.data.projects.filter((p) => p.featured === false);
    return [...featured, ...rest];
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
    const rowEl = event.currentTarget as HTMLElement;

    this.pendingRafId = requestAnimationFrame(() => {
      this.pendingRafId = null;
      this.hoverPosition = this.calculatePreviewPosition(rowEl);
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
    const rowEl = event.currentTarget as HTMLElement;

    requestAnimationFrame(() => {
      this.hoverPosition = this.calculatePreviewPosition(rowEl);
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

  toggleShowAll(event: Event): void {
    event.preventDefault();
    this.showAll = !this.showAll;
    this.cdr.markForCheck();
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

  /**
   * Vertical position (px, relative to the table) for the hover preview of the
   * given project row. The image's visible top edge is aligned with that row's
   * top border line, so previews line up with the project regardless of how
   * tall each row is. The result is clamped so the preview never spills past
   * the bottom of the table (which would overlap the button below it).
   */
  private calculatePreviewPosition(rowEl: HTMLElement): number {
    const tableEl = this.projectsTable.nativeElement as HTMLElement;
    const tableRect = tableEl.getBoundingClientRect();
    const wrapperRect = tableEl.parentElement?.getBoundingClientRect() ?? tableRect;
    const rowRect = rowEl.getBoundingClientRect();

    // The preview column mirrors the table width: it starts one gutter past the
    // table's right edge and ends at the wrapper's right inset (which collapses
    // to 0 on narrow viewports). Deriving the preview height from that lets us
    // clamp the bottom without measuring the (not-yet-rendered) node.
    const gutter = 36;
    const rightInset = (this.platformService.window?.innerWidth ?? 0) <= 944 ? 0 : 15;
    const previewWidth = Math.max(wrapperRect.width - tableRect.width - gutter - rightInset, 0);
    const previewHeight = previewWidth * (250 / 370);

    // $preview-lift cancels the image's own translate, so `top` here places the
    // image's *visible* top edge exactly on the row's top border.
    const lift = PORTFOLIO_CONFIG.PREVIEW_LIFT;
    const alignedTop = rowRect.top - tableRect.top + lift;
    const maxTop = Math.max(tableRect.height - previewHeight + lift, lift);
    return Math.round(Math.min(Math.max(alignedTop, lift), maxTop));
  }
}
