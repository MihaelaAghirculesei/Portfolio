import { Component, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { Projects } from '../../interfaces/projects';
import { PlatformService } from '../../shared/services/platform.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-portofolio',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './portofolio.component.html',
  styleUrl: './portofolio.component.scss'
})
export class PortofolioComponent implements OnDestroy {
  @ViewChild('projectsTable') projectsTable!: ElementRef;

  projects: Projects[] = [
    {
      name: 'Join',
      technologies: ['Firebase', 'Angular', 'TypeScript', 'HTML', 'SCSS'],
      previewImg: 'assets/img/projects/join.png',
      description: `Join Kanban Board is the project management revolution! An extraordinary application that transforms every project into a success through spectacular visual boards and real-time collaboration. With Join, you can easily organize tasks, track progress, and collaborate with your team in a dynamic and intuitive environment. Say goodbye to chaos and hello to productivity! Join Kanban Board is the perfect tool for teams of all sizes, from startups to large enterprises. Experience the future of project management with Join Kanban Board and take your projects to the next level. Your next big victory starts here.`,
      githubUrl: 'https://github.com/MihaelaAghirculesei/join-kanban-board',
      liveUrl: 'https://mihaela-melania-aghirculesei.de/join/'
    },
    {
      name: 'El Pollo Loco',
      technologies: ['JavaScript', 'HTML', 'CSS'],
      previewImg: 'assets/img/projects/el-pollo-locco.png',
      description: 'An exciting game where courage meets chicken chaos! Built with JavaScript, HTML and CSS, it offers smooth gameplay with keyboard and touch controls, epic Endboss challenges, immersive sound effects and responsive design for all devices.',
      githubUrl: 'https://github.com/MihaelaAghirculesei/El-Pollo-Loco',
      liveUrl: 'https://mihaela-melania-aghirculesei.de/el_pollo_loco/'
    },
    {
      name: 'Pokédex',
      technologies: ['Rest-Api', 'JavaScript', 'HTML', 'CSS'],
      previewImg: 'assets/img/projects/pokedex.png',
      description: 'An interactive portal into the magical world of Pokemon! Designed with passion, it offers a smooth and engaging experience built with modern technologies: PokeAPI for always up-to-date data, responsive design for all devices, performant JavaScript and captivating CSS animations.',
      githubUrl: 'https://github.com/MihaelaAghirculesei/Pokedex',
      liveUrl: 'https://mihaela-melania-aghirculesei.de/pokedex/'
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
  private readonly TOUCH_THRESHOLD: number = 10;

  constructor(private platformService: PlatformService) {
    this.checkOrientation();
  }

  ngOnDestroy(): void {
    this.platformService.enableScroll();
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
    }
  }

  setActiveProject(projectIndex: number, event: MouseEvent): void {
    this.activeProjectId = projectIndex;
    this.activePreview = this.projects[projectIndex].previewImg;

    const trElement = (event.currentTarget as HTMLElement);
    const tableRect = this.projectsTable.nativeElement.getBoundingClientRect();
    const trRect = trElement.getBoundingClientRect();

    this.hoverPosition = trRect.top - tableRect.top + (trRect.height / 2) - 100;
  }

  clearActiveProject(): void {
    this.activeProjectId = null;
    this.hoverPosition = null;
    this.activePreview = '';
  }

  handleTouchStart(event: TouchEvent, projectIndex: number): void {
    if (event.touches.length > 0) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
      this.touchMoved = false;

      this.activeProjectId = projectIndex;
      this.activePreview = this.projects[projectIndex].previewImg;

      const trElement = (event.currentTarget as HTMLElement);
      const tableRect = this.projectsTable.nativeElement.getBoundingClientRect();
      const trRect = trElement.getBoundingClientRect();

      this.hoverPosition = trRect.top - tableRect.top + (trRect.height / 2) - 100;
    }
  }

  handleTouchEnd(event: TouchEvent, index: number): void {
    event.preventDefault();

    if (!this.touchMoved) {
      this.openProjectOverlay(this.projects[index], index);
    }

    this.clearActiveProject();
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (event.touches.length > 0) {
      const touchX = event.touches[0].clientX;
      const touchY = event.touches[0].clientY;

      const deltaX = Math.abs(touchX - this.touchStartX);
      const deltaY = Math.abs(touchY - this.touchStartY);

      if (deltaX > this.TOUCH_THRESHOLD || deltaY > this.TOUCH_THRESHOLD) {
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
  }

  closeOverlay() {
    this.selectedProject = null;

    this.platformService.enableScroll();
  }

  nextProject() {
    if (this.selectedIndex < this.projects.length - 1) {
      this.selectedIndex++;
    } else {
      this.selectedIndex = 0;
    }
    this.selectedProject = this.projects[this.selectedIndex];
  }

  getProjectScreenshotAlt(projectIndex: number | null): string {
    if (projectIndex === null || projectIndex < 0 || projectIndex >= this.projects.length) {
      return 'Project screenshot';
    }
    const project = this.projects[projectIndex];
    const projectName = project ? project.name : 'Project';
    return `${projectName} screenshot`;
  }

  getProjectShortDescription(project: Projects): string {
    switch (project.name) {
      case 'Join':
        return 'Kanban Board Application';
      case 'El Pollo Loco':
        return 'Adventure Game';
      case 'Pokedex':
        return 'Pokemon Database';
      default:
        return 'Web Application';
    }
  }

  hasTechIcon(technology: string): boolean {
    const techIcons = [
      'Angular', 'Firebase', 'TypeScript', 'HTML', 'CSS', 'SCSS',
      'JavaScript', 'Rest-Api'
    ];
    return techIcons.includes(technology);
  }

  getTechIconPath(technology: string): string | null {
    const iconMap: { [key: string]: string } = {
      'Angular': 'assets/img/projects/icons/angular.svg',
      'Firebase': 'assets/img/projects/icons/firebase.svg',
      'TypeScript': 'assets/img/projects/icons/typescript.svg',
      'HTML': 'assets/img/projects/icons/html.svg',
      'CSS': 'assets/img/projects/icons/css.svg',
      'SCSS': 'assets/img/projects/icons/sass.svg',
      'JavaScript': 'assets/img/projects/icons/javascript.svg',
      'Rest-Api': 'assets/img/projects/icons/rest-api.svg'
    };
    
    return iconMap[technology] || null;
  }

  onHover(event: MouseEvent, project: Projects) {
    const index = this.projects.findIndex(p => p.name === project.name);
    if (index !== -1) {
      this.setActiveProject(index, event);
    }
  }

  onLeave() {
    this.clearActiveProject();
  }
}