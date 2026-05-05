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
import { FocusTrapService } from '../../shared/services/focus-trap.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {PassiveTouchStartDirective, PassiveTouchEndDirective} from '../../shared/directives/passive-listeners.directive';
import {BREAKPOINTS, PORTFOLIO_CONFIG, TIMING_CONFIG} from '../../shared/constants/app.constants';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-portfolio',
    imports: [TranslatePipe, PassiveTouchStartDirective, PassiveTouchEndDirective],
    templateUrl: './portfolio.component.html',
    styleUrl: './portfolio.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfolioComponent implements OnInit, OnDestroy {
  @ViewChild('projectsTable') projectsTable!: ElementRef;

  projects: Projects[] = [
    {
      name: 'Birthday Reminder Pro',
      technologies: [
        'Angular', 'TypeScript', 'SCSS', 'NgRx', 'RxJS',
        'Material Design', 'Capacitor', 'Firebase', 'OAuth 2.0', 'PWA', 'SSR',
      ],
      previewImg: 'assets/img/projects/birthday-reminder.webp',
      previewImgSrcset:
        'assets/img/projects/birthday-reminder-400w.webp 400w, ' +
        'assets/img/projects/birthday-reminder-800w.webp 800w, ' +
        'assets/img/projects/birthday-reminder-1200w.webp 1200w',
      githubUrl: environment.projects.birthdayReminder.github,
      liveUrl: environment.projects.birthdayReminder.live,
      isPersonal: true,
      inProgress: true,
    },
    {
      name: 'Join',
      technologies: ['Firebase', 'Angular', 'TypeScript', 'HTML', 'SCSS'],
      previewImg: 'assets/img/projects/join.webp',
      previewImgSrcset:
        'assets/img/projects/join-400w.webp 400w, ' +
        'assets/img/projects/join-800w.webp 800w, ' +
        'assets/img/projects/join-1200w.webp 1200w',
      githubUrl: environment.projects.join.github,
      liveUrl: environment.projects.join.live,
      isTeam: true,
    },
    {
      name: 'Todo Platform API',
      technologies: ['Python 3.11', 'TypeScript', 'FastAPI', 'SQLAlchemy 2.0', 'Pydantic 2', 'SQLite', 'Pytest', 'React', 'Vite'],
      previewImg: 'assets/img/projects/todo-api.webp',
      githubUrl: environment.projects.todoApi.github,
      liveUrl: environment.projects.todoApi.live,
      isTeam: true,
    },
    {
      name: 'Pokédex',
      technologies: ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'REST API', 'PWA', 'Vite', 'Workbox', 'Vitest'],
      previewImg: 'assets/img/projects/pokedex.webp',
      previewImgSrcset:
        'assets/img/projects/pokedex-400w.webp 400w, ' +
        'assets/img/projects/pokedex-800w.webp 800w, ' +
        'assets/img/projects/pokedex-1200w.webp 1200w',
      githubUrl: environment.projects.pokedex.github,
      liveUrl: environment.projects.pokedex.live,
    },
    {
      name: 'El Pollo Loco',
      technologies: ['JavaScript', 'HTML', 'CSS'],
      previewImg: 'assets/img/projects/el-pollo-locco.webp',
      previewImgSrcset:
        'assets/img/projects/el-pollo-locco-400w.webp 400w, ' +
        'assets/img/projects/el-pollo-locco-800w.webp 800w, ' +
        'assets/img/projects/el-pollo-locco-1200w.webp 1200w',
      githubUrl: environment.projects.elPolloLoco.github,
      liveUrl: environment.projects.elPolloLoco.live,
    },
  ];

  activeProjectId: number | null = null;
  hoverPosition: number | null = null;
  activePreview = '';

  selectedProject: Projects | null = null;
  selectedIndex = 0;
  isLandscape = false;

  private touchStartX = 0;
  private touchStartY = 0;
  private touchMoved = false;
  private headerElement: HTMLElement | null = null;
  private originalHeaderDisplay = '';
  private rafPending = false;
  private boundOnTouchMove = this.onTouchMove.bind(this);
  private readonly focusTrap = inject(FocusTrapService);

  private readonly PROJECT_MAP = (() => {
    const map: Record<string, string> = {};
    map['Join'] = 'join';
    map['El Pollo Loco'] = 'elPolloLoco';
    map['Pokédex'] = 'pokedex';
    map['Birthday Reminder Pro'] = 'birthdayReminder';
    map['Todo Platform API'] = 'todoApi';
    return map;
  })();

  private readonly ICONS_BASE = 'assets/img/projects/icons/';
  private readonly TECH_ICONS: Record<string, string> = {
    angular: 'angular.svg',
    firebase: 'firebase.svg',
    typescript: 'typescript.svg',
    html: 'html.svg',
    css: 'css.svg',
    scss: 'sass.svg',
    javascript: 'javascript.svg',
    restapi: 'rest-api.svg',
    ngrx: 'ngrx.svg',
    rxjs: 'rxjs.svg',
    materialdesign: 'material-design.svg',
    capacitor: 'capacitor.svg',
    indexeddb: 'indexeddb.svg',
    oauth20: 'oauth.svg',
    pwa: 'pwa.svg',
    ssr: 'ssr.svg',
    vite: 'vite.svg',
    vitest: 'vitest.svg',
    workbox: 'workbox.svg',
    python311: 'python.svg',
    fastapi: 'fastapi.svg',
    sqlalchemy20: 'sqlalchemy.svg',
    pydantic2: 'pydantic.svg',
    sqlite: 'sqlite.svg',
    pytest: 'pytest.svg',
    react: 'react.svg',
  };

  constructor(
    private platformService: PlatformService,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: object,
    private cdr: ChangeDetectorRef
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
  onResize(): void {
    this.checkOrientation();
  }

  @HostListener('window:orientationchange')
  onOrientationChange(): void {
    this.checkOrientation();
  }

  private checkOrientation(): void {
    const window = this.platformService.getWindow();
    if (window) {
      this.isLandscape = window.innerWidth > window.innerHeight;
      this.cdr.markForCheck();
    }
  }

  setActiveProject(projectIndex: number, event: MouseEvent): void {
    const windowObj = this.platformService.getWindow();
    if (!windowObj || windowObj.innerWidth <= BREAKPOINTS.MOBILE_MAX) {
      return;
    }

    if (this.rafPending) {
      return;
    }

    this.activeProjectId = projectIndex;
    this.activePreview = this.projects[projectIndex].previewImg;

    const trElement = event.currentTarget as HTMLElement;

    this.rafPending = true;

    requestAnimationFrame(() => {
      this.rafPending = false;

      const tableRect = this.projectsTable.nativeElement.getBoundingClientRect();
      const trRect = trElement.getBoundingClientRect();

      const basePosition = trRect.top - tableRect.top + trRect.height / 2 - PORTFOLIO_CONFIG.PREVIEW_BASE_OFFSET;

      const isSmallPreview = windowObj && windowObj.innerWidth <= BREAKPOINTS.SMALL_PREVIEW_MAX;

      const offsetConfig = PORTFOLIO_CONFIG.POSITION_OFFSETS[`PROJECT_${projectIndex}` as keyof typeof PORTFOLIO_CONFIG.POSITION_OFFSETS];

      if (offsetConfig) {
        const extraOffset = isSmallPreview ? offsetConfig.SMALL_PREVIEW : 0;
        this.hoverPosition = basePosition + offsetConfig.BASE + extraOffset;
      } else {
        this.hoverPosition = basePosition;
      }
      this.cdr.markForCheck();
    });
  }

  clearActiveProject(): void {
    this.activeProjectId = null;
    this.hoverPosition = null;
    this.activePreview = '';
    this.cdr.markForCheck();
  }

  handleTouchStart(event: TouchEvent, projectIndex: number): void {
    if (event.touches.length === 0) {
      return;
    }

    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
    this.touchMoved = false;
    this.activeProjectId = projectIndex;
    this.activePreview = this.projects[projectIndex].previewImg;

    const trElement = event.currentTarget as HTMLElement;
    requestAnimationFrame(() => {
      const tableRect = this.projectsTable.nativeElement.getBoundingClientRect();
      const trRect = trElement.getBoundingClientRect();
      this.hoverPosition = trRect.top - tableRect.top + trRect.height / 2 - PORTFOLIO_CONFIG.PREVIEW_BASE_OFFSET;
      this.cdr.markForCheck();
    });
  }

  handleTouchEnd(_event: TouchEvent, index: number): void {
    if (!this.touchMoved) {
      this.openProjectOverlay(this.projects[index], index);
    }

    this.clearActiveProject();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.selectedProject) {
      this.closeOverlay();
    }
  }

  private onTouchMove(event: TouchEvent): void {
    if (event.touches.length === 0) {
      return;
    }

    const deltaX = Math.abs(event.touches[0].clientX - this.touchStartX);
    const deltaY = Math.abs(event.touches[0].clientY - this.touchStartY);

    if (deltaX > PORTFOLIO_CONFIG.TOUCH_THRESHOLD || deltaY > PORTFOLIO_CONFIG.TOUCH_THRESHOLD) {
      this.touchMoved = true;
      this.clearActiveProject();
    }
  }

  openProjectOverlay(project: Projects, index: number): void {
    this.selectedProject = project;
    this.selectedIndex = index;
    this.checkOrientation();

    this.platformService.disableScroll();

    if (isPlatformBrowser(this.platformId)) {
      this.focusTrap.saveFocus();

      this.headerElement = document.querySelector('header');
      if (this.headerElement) {
        this.originalHeaderDisplay =
          this.headerElement.style.display || 'block';
        this.headerElement.style.display = 'none';
      }

      setTimeout(() => {
        this.focusTrap.activate('.project-modal', false);
        const modal = document.querySelector('.project-modal') as HTMLElement;
        if (modal) {
          modal.focus();
        }
      }, TIMING_CONFIG.MODAL_FOCUS_DELAY);
    }
    this.cdr.markForCheck();
  }

  closeOverlay(): void {
    this.selectedProject = null;

    this.platformService.enableScroll();

    if (isPlatformBrowser(this.platformId)) {
      if (this.headerElement) {
        this.headerElement.style.display = this.originalHeaderDisplay;
      }

      this.focusTrap.deactivate(true);
    }
    this.cdr.markForCheck();
  }

  nextProject(): void {
    this.selectedIndex = (this.selectedIndex + 1) % this.projects.length;
    this.selectedProject = this.projects[this.selectedIndex];
    this.cdr.markForCheck();
  }

  getProjectScreenshotAlt(projectIndex: number | null): string {
    if (projectIndex === null || projectIndex < 0 || projectIndex >= this.projects.length) {
      return 'Project screenshot';
    }
    const projectName = this.projects[projectIndex]?.name || 'Project';
    return `${projectName} screenshot`;
  }

  getProjectShortDescription(project: Projects): string {
    return this.getProjectTranslation(project, 'shortDescription');
  }

  getProjectDescription(project: Projects): string {
    return this.getProjectTranslation(project, 'description');
  }

  private getProjectTranslation(project: Projects, type: 'shortDescription' | 'description'): string {
    const projectKey = this.PROJECT_MAP[project.name];
    if (!projectKey) {
      return type === 'description' ? (project.description ?? '') : this.translate.instant(`projects.default.${type}`);
    }
    return this.translate.instant(`projects.${projectKey}.${type}`);
  }

  hasTechIcon(technology: string): boolean {
    return this.getTechIconPath(technology) !== null;
  }

  getTechIconPath(technology: string): string | null {
    const normalized = technology.replace(/[-\s.]/g, '').toLowerCase();
    const icon = this.TECH_ICONS[normalized];
    return icon ? this.ICONS_BASE + icon : null;
  }

}
