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
      name: 'Join',
      technologies: ['Firebase', 'Angular', 'TypeScript', 'HTML', 'SCSS'],
      previewImg: 'assets/img/portofolio/join.png',
      description:`Join Kanban Board is the project management revolution! An extraordinary application that transforms every project into a success through spectacular visual boards and real-time collaboration. With Join, you can easily organize tasks, track progress, and collaborate with your team in a dynamic and intuitive environment. Say goodbye to chaos and hello to productivity! Join Kanban Board is the perfect tool for teams of all sizes, from startups to large enterprises. Experience the future of project management with Join Kanban Board and take your projects to the next level. Your next big victory starts here.`,
    },
    {
      name: 'El Pollo Loco',
      technologies: ['JavaScript', 'HTML', 'CSS'],
      previewImg: '/assets/img/portofolio/el_pollo_loco.png',
      description:
        'An exciting game where courage meets chicken chaos! Built with JavaScript, HTML and CSS, it offers smooth gameplay with keyboard and touch controls, epic Endboss challenges, immersive sound effects and responsive design for all devices.',
    },
    {
      name: 'Pokedex',
      technologies: ['Rest-Api', 'JavaScript', 'HTML', 'CSS'],
      previewImg: '/assets/img/portofolio/pokedex.png',
      description: 'An interactive portal into the magical world of Pokemon! Designed with passion, it offers a smooth and engaging experience built with modern technologies: PokeAPI for always up-to-date data, responsive design for all devices, performant JavaScript and captivating CSS animations.',
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
