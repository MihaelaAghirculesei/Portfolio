import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  HostListener,
  Inject,
  PLATFORM_ID,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Projects } from '../../interfaces/projects';
import { PlatformService } from '../../shared/services/platform.service';
import { TranslatePipe } from '@ngx-translate/core';
import { PassiveTouchStartDirective, PassiveTouchEndDirective } from '../../shared/directives/passive-listeners.directive';
import { BREAKPOINTS, PORTFOLIO_CONFIG } from '../../shared/constants/app.constants';
import { ProjectDataService } from './services/project-data.service';
import { PortfolioOverlayService } from './services/portfolio-overlay.service';

@Component({
  selector: 'app-portfolio',
  imports: [TranslatePipe, PassiveTouchStartDirective, PassiveTouchEndDirective],
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

  // ── Local UI state ──────────────────────────────────────────────────────────
  activeProjectId: number | null = null;
  hoverPosition: number | null = null;
  activePreview = '';
  isLandscape = false;

  // ── Delegating accessors — keep the template and tests unchanged ────────────
  get projects(): Projects[] { return this.data.projects; }

  get selectedProject(): Projects | null { return this.overlay.selectedProject; }
  set selectedProject(v: Projects | null) { this.overlay.selectedProject = v; }

  get selectedIndex(): number { return this.overlay.selectedIndex; }
  set selectedIndex(v: number) { this.overlay.selectedIndex = v; }

  // ── Touch gesture state ─────────────────────────────────────────────────────
  private touchStartX = 0;
  private touchStartY = 0;
  private touchMoved = false;
  private rafPending = false;
  private readonly boundOnTouchMove = this.onTouchMove.bind(this);

  constructor(
    private platformService: PlatformService,
    @Inject(PLATFORM_ID) private platformId: object,
    private cdr: ChangeDetectorRef,
  ) {
    this.checkOrientation();
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('touchmove', this.boundOnTouchMove, { passive: true });
    }
  }

  ngOnDestroy(): void {
    this.platformService.enableScroll();
    if (isPlatformBrowser(this.platformId)) {
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
    const win = this.platformService.getWindow();
    if (!win || win.innerWidth <= BREAKPOINTS.MOBILE_MAX || this.rafPending) { return; }

    this.activeProjectId = index;
    this.activePreview = this.data.projects[index].previewImg;
    this.rafPending = true;
    const trElement = event.currentTarget as HTMLElement;

    requestAnimationFrame(() => {
      this.rafPending = false;
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
    this.activePreview = this.data.projects[index].previewImg;

    requestAnimationFrame(() => {
      const tableRect = this.projectsTable.nativeElement.getBoundingClientRect();
      const trRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      this.hoverPosition = trRect.top - tableRect.top + trRect.height / 2 - PORTFOLIO_CONFIG.PREVIEW_BASE_OFFSET;
      this.cdr.markForCheck();
    });
  }

  handleTouchEnd(_event: TouchEvent, index: number): void {
    if (!this.touchMoved) { this.openProjectOverlay(this.data.projects[index], index); }
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
    this.overlay.next(this.data.projects, this.descriptionEl);
    this.cdr.markForCheck();
  }

  // ── Template helpers delegated to ProjectDataService ───────────────────────
  hasTechIcon(technology: string): boolean { return this.data.hasTechIcon(technology); }
  getTechIconPath(technology: string): string | null { return this.data.getTechIconPath(technology); }
  getProjectScreenshotAlt(idx: number | null): string { return this.data.getProjectScreenshotAlt(idx); }
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
    const win = this.platformService.getWindow();
    if (win) {
      this.isLandscape = win.innerWidth > win.innerHeight;
      this.cdr.markForCheck();
    }
  }

  private calculatePreviewPosition(trElement: HTMLElement, index: number, win: Window): number {
    const tableRect = this.projectsTable.nativeElement.getBoundingClientRect();
    const trRect = trElement.getBoundingClientRect();
    const base = trRect.top - tableRect.top + trRect.height / 2 - PORTFOLIO_CONFIG.PREVIEW_BASE_OFFSET;
    const hoverOffset = this.data.projects[index]?.hoverOffset;
    if (!hoverOffset) { return base; }
    const isSmall = win.innerWidth <= BREAKPOINTS.SMALL_PREVIEW_MAX;
    return base + hoverOffset.base + (isSmall ? hoverOffset.smallPreview : 0);
  }
}
