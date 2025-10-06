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
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Projects } from '../../interfaces/projects';
import { PlatformService } from '../../shared/services/platform.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PassiveTouchStartDirective, PassiveTouchEndDirective } from '../../shared/directives/passive-listeners.directive';
import { BREAKPOINTS, PORTFOLIO_CONFIG, TIMING_CONFIG } from '../../shared/constants/app.constants';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-portofolio',
  standalone: true,
  imports: [TranslatePipe, PassiveTouchStartDirective, PassiveTouchEndDirective],
  templateUrl: './portofolio.component.html',
  styleUrl: './portofolio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortofolioComponent implements OnInit, OnDestroy {
  @ViewChild('projectsTable') projectsTable!: ElementRef;

  projects: Projects[] = [
    {
      name: 'Join',
      technologies: ['Firebase', 'Angular', 'TypeScript', 'HTML', 'SCSS'],
      previewImg: 'assets/img/projects/join.png',
      description: `Join Kanban Board is the project management revolution! An extraordinary application that transforms every project into a success through spectacular visual boards and real-time collaboration. With Join, you can easily organize tasks, track progress, and collaborate with your team in a dynamic and intuitive environment. Say goodbye to chaos and hello to productivity! Join Kanban Board is the perfect tool for teams of all sizes, from startups to large enterprises. Experience the future of project management with Join Kanban Board and take your projects to the next level. Your next big victory starts here.`,
      githubUrl: environment.projects.join.github,
      liveUrl: environment.projects.join.live,
    },
    {
      name: 'El Pollo Loco',
      technologies: ['JavaScript', 'HTML', 'CSS'],
      previewImg: 'assets/img/projects/el-pollo-locco.png',
      description:
        'An exciting game where courage meets chicken chaos! Built with JavaScript, HTML and CSS, it offers smooth gameplay with keyboard and touch controls, epic Endboss challenges, immersive sound effects and responsive design for all devices.',
      githubUrl: environment.projects.elPolloLoco.github,
      liveUrl: environment.projects.elPolloLoco.live,
    },
    {
      name: 'Pokédex',
      technologies: ['Rest-Api', 'JavaScript', 'HTML', 'CSS'],
      previewImg: 'assets/img/projects/pokedex.png',
      description:
        'An interactive portal into the magical world of Pokemon! Designed with passion, it offers a smooth and engaging experience built with modern technologies: PokeAPI for always up-to-date data, responsive design for all devices, performant JavaScript and captivating CSS animations.',
      githubUrl: environment.projects.pokedex.github,
      liveUrl: environment.projects.pokedex.live,
    },
  ];

  activeProjectId: number | null = null;
  hoverPosition: number | null = null;
  activePreview: string = '';

  selectedProject: Projects | null = null;
  selectedIndex: number = 0;
  isLandscape = false;

  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchMoved: boolean = false;
  private headerElement: HTMLElement | null = null;
  private originalHeaderDisplay: string = '';
  private rafPending: boolean = false;
  private boundOnTouchMove = this.onTouchMove.bind(this);
  private previousFocusedElement: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];
  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;

  constructor(
    private platformService: PlatformService,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object,
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

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkOrientation();
  }

  @HostListener('window:orientationchange', ['$event'])
  onOrientationChange() {
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
    if (event.touches.length > 0) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
      this.touchMoved = false;

      this.activeProjectId = projectIndex;
      this.activePreview = this.projects[projectIndex].previewImg;

      const trElement = event.currentTarget as HTMLElement;

      requestAnimationFrame(() => {
        const tableRect =
          this.projectsTable.nativeElement.getBoundingClientRect();
        const trRect = trElement.getBoundingClientRect();

        this.hoverPosition = trRect.top - tableRect.top + trRect.height / 2 - PORTFOLIO_CONFIG.PREVIEW_BASE_OFFSET;
        this.cdr.markForCheck();
      });
    }
  }

  handleTouchEnd(event: TouchEvent, index: number): void {
    event.preventDefault();

    if (!this.touchMoved) {
      this.openProjectOverlay(this.projects[index], index);
    }

    this.clearActiveProject();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.selectedProject) {
      event.preventDefault();
      this.closeOverlay();
    }
  }

  private onTouchMove(event: TouchEvent): void {
    if (event.touches.length > 0) {
      const touchX = event.touches[0].clientX;
      const touchY = event.touches[0].clientY;

      const deltaX = Math.abs(touchX - this.touchStartX);
      const deltaY = Math.abs(touchY - this.touchStartY);

      if (deltaX > PORTFOLIO_CONFIG.TOUCH_THRESHOLD || deltaY > PORTFOLIO_CONFIG.TOUCH_THRESHOLD) {
        this.touchMoved = true;
        this.clearActiveProject();
      }
    }
  }

  openProjectOverlay(project: Projects, index: number) {
    this.selectedProject = project;
    this.selectedIndex = index;
    this.checkOrientation();

    this.platformService.disableScroll();

    if (isPlatformBrowser(this.platformId)) {
      this.previousFocusedElement = document.activeElement as HTMLElement;

      this.headerElement = document.querySelector('header');
      if (this.headerElement) {
        this.originalHeaderDisplay =
          this.headerElement.style.display || 'block';
        this.headerElement.style.display = 'none';
      }

      setTimeout(() => {
        this.setupFocusTrap();
        const modal = document.querySelector('.project-modal') as HTMLElement;
        if (modal) {
          modal.focus();
        }
      }, TIMING_CONFIG.MODAL_FOCUS_DELAY);
    }
    this.cdr.markForCheck();
  }

  closeOverlay() {
    this.selectedProject = null;

    this.platformService.enableScroll();

    if (isPlatformBrowser(this.platformId)) {
      if (this.headerElement) {
        this.headerElement.style.display = this.originalHeaderDisplay;
      }

      if (this.previousFocusedElement) {
        this.previousFocusedElement.focus();
        this.previousFocusedElement = null;
      }
    }
    this.cdr.markForCheck();
  }

  nextProject() {
    if (this.selectedIndex < this.projects.length - 1) {
      this.selectedIndex++;
    } else {
      this.selectedIndex = 0;
    }
    this.selectedProject = this.projects[this.selectedIndex];
    this.cdr.markForCheck();
  }

  getProjectScreenshotAlt(projectIndex: number | null): string {
    if (
      projectIndex === null ||
      projectIndex < 0 ||
      projectIndex >= this.projects.length
    ) {
      return 'Project screenshot';
    }
    const project = this.projects[projectIndex];
    const projectName = project ? project.name : 'Project';
    return `${projectName} screenshot`;
  }

  getProjectShortDescription(project: Projects): string {
    return this.getProjectTranslation(project, 'shortDescription');
  }

  getProjectDescription(project: Projects): string {
    const projectMap: Record<string, string> = {
      'Join': 'join',
      'El Pollo Loco': 'elPolloLoco',
      'Pokédex': 'pokedex'
    };

    const projectKey = projectMap[project.name];
    return projectKey
      ? this.translate.instant(`projects.${projectKey}.description`)
      : project.description;
  }

  private getProjectTranslation(project: Projects, type: 'shortDescription' | 'description'): string {
    const projectMap: Record<string, string> = {
      'Join': 'join',
      'El Pollo Loco': 'elPolloLoco',
      'Pokédex': 'pokedex'
    };

    const projectKey = projectMap[project.name];
    return projectKey
      ? this.translate.instant(`projects.${projectKey}.${type}`)
      : this.translate.instant(`projects.default.${type}`);
  }

  hasTechIcon(technology: string): boolean {
    const techIcons = [
      'Angular',
      'Firebase',
      'TypeScript',
      'HTML',
      'CSS',
      'SCSS',
      'JavaScript',
      'Rest-Api',
    ];
    return techIcons.includes(technology);
  }

  getTechIconPath(technology: string): string | null {
    const iconMap: { [key: string]: string } = {
      Angular: 'assets/img/projects/icons/angular.svg',
      Firebase: 'assets/img/projects/icons/firebase.svg',
      TypeScript: 'assets/img/projects/icons/typescript.svg',
      HTML: 'assets/img/projects/icons/html.svg',
      CSS: 'assets/img/projects/icons/css.svg',
      SCSS: 'assets/img/projects/icons/sass.svg',
      JavaScript: 'assets/img/projects/icons/javascript.svg',
      'Rest-Api': 'assets/img/projects/icons/rest-api.svg',
    };

    return iconMap[technology] || null;
  }

  onHover(event: MouseEvent, project: Projects) {
    const index = this.projects.findIndex((p) => p.name === project.name);
    if (index !== -1) {
      this.setActiveProject(index, event);
    }
  }

  onLeave() {
    this.clearActiveProject();
  }

  private setupFocusTrap(): void {
    const modal = document.querySelector('.project-modal');
    if (!modal) return;

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    this.focusableElements = Array.from(modal.querySelectorAll(focusableSelectors));

    if (this.focusableElements.length > 0) {
      this.firstFocusableElement = this.focusableElements[0];
      this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];

      modal.addEventListener('keydown', this.handleFocusTrap.bind(this));
    }
  }

  private handleFocusTrap(event: Event): void {
    if (!(event instanceof KeyboardEvent) || event.key !== 'Tab') return;

    if (event.shiftKey) {
      if (document.activeElement === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement?.focus();
      }
    } else {
      if (document.activeElement === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement?.focus();
      }
    }
  }
}
