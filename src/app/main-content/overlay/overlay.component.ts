import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { Projects } from '../../interfaces/projects';

@Component({
  selector: 'app-overlay',
  standalone: true,
  templateUrl: './overlay.component.html',
  styleUrl: './overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  @Input() index = 0;

  @Output() close = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  closeOverlay(): void {
    this.close.emit();
  }
}