import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Projects } from '../../interfaces/projects';

@Component({
  selector: 'app-overlay',
  standalone: true,
  templateUrl: './overlay.component.html',
  styleUrl: './overlay.component.scss',
})
export class OverlayComponent {
  @Input() singleProject: Projects = {
    name: '',
    technologies: [],
    previewImg: '',
    description: '',
    githubUrl: '',
    liveUrl: '',
  };

  @Input() index: number = 0;
  @Output() close = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  closeOverlay() {
    this.close.emit();
  }
}