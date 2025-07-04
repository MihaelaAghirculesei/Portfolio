import { Component } from '@angular/core';
import { Projects } from '../../interfaces/projects';
import { OverlayComponent } from '../overlay/overlay.component';

@Component({
  selector: 'app-portofolio',
  standalone: true,
  imports: [OverlayComponent],
  templateUrl: './portofolio.component.html',
  styleUrl: './portofolio.component.scss',
})
export class PortofolioComponent {
  projects: Projects[] = [
    {
      name: 'El Pollo Loco',
      technologies: ['JavaScript', 'HTML', 'CSS'],
      previewImg: '/assets/img/portofolio/el_pollo_loco.png',
      description:
        'Jump, run and throw game based on object-oriented ap-proach. Help Pepe to find coins and tabasco salsa to fight against the crazy hen. ',
    },
    {
      name: 'Pokedex',
      technologies: ['JavaScript', 'Rest-Api', 'HTML', 'CSS'],
      previewImg: '/assets/img/portofolio/pokedex.png',
      description: '____einfügen__________',
    },
    {
      name: 'Join',
      technologies: ['JavaScript', 'Rest-Api', 'HTML', 'CSS'],
      previewImg: 'assets/img/portofolio/join.png',
      description: '____einfügen__________',
    },
  ];

  activePreview: string = '';
  previewPosition = { top: '0px', right: '0px' };

  onHover(event: MouseEvent, project: any) {
    if (typeof document !== 'undefined') {
      this.activePreview = project.previewImg;
      const target = event.currentTarget as HTMLElement;
      const wrapper = document.querySelector('.projectWrapper') as HTMLElement;

      if (wrapper) {
        const targetRect = target.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();
        this.previewPosition = {
          top: `${targetRect.top - wrapperRect.top}px`,
          right: '0px',
        };
      }
    }
  }

  onLeave() {
    this.activePreview = '';
  }

  selectedProject: any;
  selectedIndex: number = 0;

  openProjectOverlay(project: Projects, index: number) {
    this.selectedProject = project;
    this.selectedIndex = index;

    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeOverlay() {
    this.selectedProject = null;

    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'auto';
    }
  }

  nextProject() {
    if (this.selectedIndex < this.projects.length - 1) {
      this.selectedIndex++;
    } else {
      this.selectedIndex = 0;
    }
    this.selectedProject = this.projects[this.selectedIndex];
  }
}
