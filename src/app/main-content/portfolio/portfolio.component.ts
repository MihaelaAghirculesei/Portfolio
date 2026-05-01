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
      description:
        'Enterprise-grade Birthday Reminder App built with Angular 19. Implements NgRx for predictable state management ' +
        'with effects for side effects and entity adapters for normalized state. Features Firebase backend with Google OAuth 2.0 ' +
        'authentication and Firestore for cloud synchronization with offline-first capabilities. Cross-platform support includes ' +
        'Web PWA with Service Worker for offline access and Android native via Capacitor with local push notifications. ' +
        'Server-Side Rendering (SSR) ensures optimal performance and SEO. Material Design UI with custom theming provides ' +
        'a responsive, accessible interface. Comprehensive testing strategy includes Cypress e2e tests and Karma unit tests, ' +
        'with CI/CD pipeline ready. Features bundle optimization, Git hooks with Husky, and lint-staged for code quality.',
      githubUrl: environment.projects.birthdayReminder.github,
      liveUrl: environment.projects.birthdayReminder.live,
      isPersonal: true,
    },
    {
      name: 'Join',
      technologies: ['Firebase', 'Angular', 'TypeScript', 'HTML', 'SCSS'],
      previewImg: 'assets/img/projects/join.webp',
      previewImgSrcset:
        'assets/img/projects/join-400w.webp 400w, ' +
        'assets/img/projects/join-800w.webp 800w, ' +
        'assets/img/projects/join-1200w.webp 1200w',
      description:
        'Join Kanban Board is the project management revolution! ' +
        'An extraordinary application that transforms every project into a success through ' +
        'spectacular visual boards and real-time collaboration. With Join, you can easily ' +
        'organize tasks, track progress, and collaborate with your team in a dynamic and ' +
        'intuitive environment. Say goodbye to chaos and hello to productivity! ' +
        'Join Kanban Board is the perfect tool for teams of all sizes, from startups to ' +
        'large enterprises. Experience the future of project management with Join Kanban ' +
        'Board and take your projects to the next level. Your next big victory starts here.',
      githubUrl: environment.projects.join.github,
      liveUrl: environment.projects.join.live,
      isTeam: true,
    },
    {
      name: 'Todo Platform API',
      technologies: ['Python 3.13', 'TypeScript', 'FastAPI', 'SQLAlchemy 2.0', 'Pydantic 2', 'SQLite', 'Pytest', 'React', 'Vite'],
      previewImg: 'assets/img/projects/todo-api.webp',
      description:
        'Production-ready RESTful API built with FastAPI and SQLAlchemy 2.0, following a ' +
        'strict layered architecture (Router → Service → Repository → Database). Developed ' +
        'as part of a team project to deliver a robust backend for a Todo platform. ' +
        'Features full CRUD, Pydantic input validation, custom exception handling, and ISO ' +
        '8601 UTC timestamps. Covered by 23 tests (unit + integration) using an in-memory ' +
        'SQLite database for fast, isolated test runs.',
      githubUrl: environment.projects.todoApi.github,
      liveUrl: environment.projects.todoApi.live,
      isTeam: true,
      inProgress: true,
    },
    {
      name: 'Pokédex',
      technologies: ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'REST API', 'PWA', 'Vite', 'Workbox', 'Vitest'],
      previewImg: 'assets/img/projects/pokedex.webp',
      previewImgSrcset:
        'assets/img/projects/pokedex-400w.webp 400w, ' +
        'assets/img/projects/pokedex-800w.webp 800w, ' +
        'assets/img/projects/pokedex-1200w.webp 1200w',
      description:
        'An interactive portal into the magical world of Pokemon! Designed with passion, ' +
        'it offers a smooth and engaging experience built with modern technologies: ' +
        'PokeAPI for always up-to-date data, responsive design for all devices, ' +
        'performant JavaScript and captivating CSS animations.',
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
      description:
        'An exciting game where courage meets chicken chaos! Built with JavaScript, ' +
        'HTML and CSS, it offers smooth gameplay with keyboard and touch controls, ' +
        'epic Endboss challenges, immersive sound effects and responsive design for all devices.',
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

  private readonly TECH_ICONS: Record<string, string> = {
    angular: 'assets/img/projects/icons/angular.svg',
    firebase: 'assets/img/projects/icons/firebase.svg',
    typescript: 'assets/img/projects/icons/typescript.svg',
    html: 'assets/img/projects/icons/html.svg',
    css: 'assets/img/projects/icons/css.svg',
    scss: 'assets/img/projects/icons/sass.svg',
    javascript: 'assets/img/projects/icons/javascript.svg',
    restapi: 'assets/img/projects/icons/rest-api.svg',
    ngrx: 'assets/img/projects/icons/ngrx.svg',
    rxjs: 'assets/img/projects/icons/rxjs.svg',
    materialdesign: 'assets/img/projects/icons/material-design.svg',
    capacitor: 'assets/img/projects/icons/capacitor.svg',
    indexeddb: 'assets/img/projects/icons/indexeddb.svg',
    oauth20: 'assets/img/projects/icons/oauth.svg',
    pwa: 'assets/img/projects/icons/pwa.svg',
    ssr: 'assets/img/projects/icons/ssr.svg',
    vite: 'assets/img/projects/icons/vite.svg',
    vitest: 'assets/img/projects/icons/vitest.svg',
    workbox: 'assets/img/projects/icons/workbox.svg',
    python313: 'assets/img/projects/icons/python.svg',
    fastapi: 'assets/img/projects/icons/fastapi.svg',
    sqlalchemy20: 'assets/img/projects/icons/sqlalchemy.svg',
    pydantic2: 'assets/img/projects/icons/pydantic.svg',
    sqlite: 'assets/img/projects/icons/sqlite.svg',
    pytest: 'assets/img/projects/icons/pytest.svg',
    react: 'assets/img/projects/icons/react.svg',
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
      return type === 'description' ? project.description : this.translate.instant(`projects.default.${type}`);
    }
    return this.translate.instant(`projects.${projectKey}.${type}`);
  }

  hasTechIcon(technology: string): boolean {
    return this.getTechIconPath(technology) !== null;
  }

  getTechIconPath(technology: string): string | null {
    const normalized = technology.replace(/[-\s.]/g, '').toLowerCase();
    return this.TECH_ICONS[normalized] || null;
  }

}
