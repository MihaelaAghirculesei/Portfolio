import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { Projects } from '../../interfaces/projects';

@Component({
    selector: 'app-overlay',
    imports: [TranslatePipe, NgOptimizedImage],
    templateUrl: './overlay.component.html',
    styleUrl: './overlay.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverlayComponent {
  @Input() singleProject: Projects = {
    id: '',
    name: '',
    technologies: [],
    previewImg: '',
    githubUrl: '',
    liveUrl: '',
  };

  @Input() index = 0;

  @Output() closeOverlay = new EventEmitter<void>();
  @Output() nextProject = new EventEmitter<void>();

  handleClose(): void {
    this.closeOverlay.emit();
  }
}