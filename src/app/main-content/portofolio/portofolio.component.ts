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
import { BREAKPOINTS, PORTFOLIO_CONFIG } from '../../shared/constants/app.constants';

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
      githubUrl: 'https://github.com/MihaelaAghirculesei/join-kanban-board',
      liveUrl: 'https://mihaela-melania-aghirculesei.de/join',
    },
    {
      name: 'El Pollo Loco',
      technologies: ['JavaScript', 'HTML', 'CSS'],
      previewImg: 'assets/img/projects/el-pollo-locco.png',
      description:
        'An exciting game where courage meets chicken chaos! Built with JavaScript, HTML and CSS, it offers smooth gameplay with keyboard and touch controls, epic Endboss challenges, immersive sound effects and responsive design for all devices.',
      githubUrl: 'https://github.com/MihaelaAghirculesei/El-Pollo-Loco',
      liveUrl: 'https://mihaela-melania-aghirculesei.de/el_pollo_loco',
    },
    {
      name: 'Pokédex',
      technologies: ['Rest-Api', 'JavaScript', 'HTML', 'CSS'],
      previewImg: 'assets/img/projects/pokedex.png',
      description:
        'An interactive portal into the magical world of Pokemon! Designed with passion, it offers a smooth and engaging experience built with modern technologies: PokeAPI for always up-to-date data, responsive design for all devices, performant JavaScript and captivating CSS animations.',
      githubUrl: 'https://github.com/MihaelaAghirculesei/Pokedex',
      liveUrl: 'https://mihaela-melania-aghirculesei.de/pokedex',
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
    if (window.innerWidth <= BREAKPOINTS.MOBILE_MAX) {
      return;
    }

    this.activeProjectId = projectIndex;
    this.activePreview = this.projects[projectIndex].previewImg;

    const trElement = event.currentTarget as HTMLElement;

    if (this.rafPending) {
      return;
    }

    this.rafPending = true;

    requestAnimationFrame(() => {
      this.rafPending = false;

      const tableRect = this.projectsTable.nativeElement.getBoundingClientRect();
      const trRect = trElement.getBoundingClientRect();

      const basePosition = trRect.top - tableRect.top + trRect.height / 2 - PORTFOLIO_CONFIG.PREVIEW_BASE_OFFSET;

      const isSmallPreview = window.innerWidth <= BREAKPOINTS.SMALL_PREVIEW_MAX;

      if (projectIndex === 0) {
        const extraOffset = isSmallPreview ? PORTFOLIO_CONFIG.POSITION_OFFSETS.PROJECT_0.SMALL_PREVIEW : 0;
        this.hoverPosition = basePosition + PORTFOLIO_CONFIG.POSITION_OFFSETS.PROJECT_0.BASE + extraOffset;
      } else if (projectIndex === 1) {
        const extraOffset = isSmallPreview ? PORTFOLIO_CONFIG.POSITION_OFFSETS.PROJECT_1.SMALL_PREVIEW : 0;
        this.hoverPosition = basePosition + PORTFOLIO_CONFIG.POSITION_OFFSETS.PROJECT_1.BASE + extraOffset;
      } else if (projectIndex === 2) {
        const extraOffset = isSmallPreview ? PORTFOLIO_CONFIG.POSITION_OFFSETS.PROJECT_2.SMALL_PREVIEW : 0;
        this.hoverPosition = basePosition + PORTFOLIO_CONFIG.POSITION_OFFSETS.PROJECT_2.BASE + extraOffset;
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
      this.headerElement = document.querySelector('header');
      if (this.headerElement) {
        this.originalHeaderDisplay =
          this.headerElement.style.display || 'block';
        this.headerElement.style.display = 'none';
      }
    }
    this.cdr.markForCheck();
  }

  closeOverlay() {
    this.selectedProject = null;

    this.platformService.enableScroll();

    if (isPlatformBrowser(this.platformId) && this.headerElement) {
      this.headerElement.style.display = this.originalHeaderDisplay;
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
    switch (project.name) {
      case 'Join':
        return this.translate.instant('projects.join.shortDescription');
      case 'El Pollo Loco':
        return this.translate.instant('projects.elPolloLoco.shortDescription');
      case 'Pokédex':
        return this.translate.instant('projects.pokedex.shortDescription');
      default:
        return this.translate.instant('projects.default.shortDescription');
    }
  }

  getProjectDescription(project: Projects): string {
    switch (project.name) {
      case 'Join':
        return this.translate.instant('projects.join.description');
      case 'El Pollo Loco':
        return this.translate.instant('projects.elPolloLoco.description');
      case 'Pokédex':
        return this.translate.instant('projects.pokedex.description');
      default:
        return project.description;
    }
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
}
