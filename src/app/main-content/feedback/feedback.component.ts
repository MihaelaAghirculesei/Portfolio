import { CommonModule } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChildren,
  QueryList,
  ElementRef
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import {
  SLIDER_CONFIG,
  ANIMATION_CONFIG
} from '../../shared/constants/app.constants';
import { PassiveTouchStartDirective, PassiveTouchEndDirective } from '../../shared/directives/passive-listeners.directive';

@Component({
  selector: 'app-feedbacks',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    PassiveTouchStartDirective,
    PassiveTouchEndDirective
  ],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbacksComponent {
  @ViewChildren('feedbackCard') feedbackCards!: QueryList<ElementRef>;

  constructor(private cdr: ChangeDetectorRef) {}

  private touchStartX = 0;
  private touchEndX = 0;

  isTransitioning = false;
  feedbacks = [
    {
      name: 'Marvin Schneemann',
      feedbackKey: 'references.feedbacks.marvin1',
      ref: 'Kochwelt',
      role: 'Frontend Developer'
    },
    {
      name: 'Christian Duus',
      feedbackKey: 'references.feedbacks.christian',
      ref: 'Join',
      role: 'Frontend Developer'
    },
    {
      name: 'Marvin Schneemann',
      feedbackKey: 'references.feedbacks.marvin2',
      ref: 'Join',
      role: 'Frontend Developer'
    },
    {
      name: 'Soufiane Nouira',
      feedbackKey: 'references.feedbacks.soufiane',
      ref: 'Join',
      role: 'Frontend Developer'
    },
    {
      name: 'Ha Dao',
      feedbackKey: 'references.feedbacks.ha',
      ref: 'Join',
      role: 'Frontend Developer'
    },
  ];
  
  middleIndex = 2;

  get currentSlide(): number {
    return this.middleIndex + 1;
  }

  get totalSlides(): number {
    return this.feedbacks.length;
  }
  
  slideLeft(): void {
    this.slide(1);
  }

  slideRight(): void {
    this.slide(-1);
  }

  private slide(direction: 1 | -1): void {
    if (this.isTransitioning) {return;}

    if (direction === 1) {
      this.middleIndex = this.middleIndex < this.feedbacks.length - 1 ? this.middleIndex + 1 : 0;
    } else {
      this.middleIndex = this.middleIndex > 0 ? this.middleIndex - 1 : this.feedbacks.length - 1;
    }

    this.updateCards();
    this.cdr.markForCheck();
  }
  
  updateCards(): void {
    if (this.feedbackCards) {
      this.isTransitioning = true;

      const baseOffset = (2 - this.middleIndex) * SLIDER_CONFIG.FEEDBACK_OFFSET;

      this.feedbackCards.forEach((card, index: number) => {
        const isActive: boolean = index === this.middleIndex;
        const scale = isActive ? ANIMATION_CONFIG.SCALE_ACTIVE : ANIMATION_CONFIG.SCALE_INACTIVE;
        card.nativeElement.style.transform = `translateX(${baseOffset}%) scale(${scale})`;
      });

      setTimeout(() => {
        this.isTransitioning = false;
        this.cdr.markForCheck();
      }, SLIDER_CONFIG.TRANSITION_DURATION);
    }
  }
  
  
  getCardClass(index: number): string {
    if (index < this.middleIndex) {return 'left feedback-card';}
    if (index > this.middleIndex) {return 'right feedback-card';}
    return 'feedback-card';
  }

  goToSlide(index: number): void {
    if (this.isTransitioning || index === this.middleIndex) {return;}

    this.middleIndex = index;
    this.updateCards();
    this.cdr.markForCheck();
  }

  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.slideRight();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.slideLeft();
        break;
      case 'Home':
        event.preventDefault();
        this.goToSlide(0);
        break;
      case 'End':
        event.preventDefault();
        this.goToSlide(this.feedbacks.length - 1);
        break;
    }
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe(): void {
    const swipeDistance = this.touchStartX - this.touchEndX;

    if (Math.abs(swipeDistance) < SLIDER_CONFIG.SWIPE_THRESHOLD) {return;}

    if (swipeDistance > 0) {
      this.slideLeft();
    } else {
      this.slideRight();
    }
  }

}