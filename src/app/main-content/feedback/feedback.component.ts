import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener, ChangeDetectionStrategy, ChangeDetectorRef, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PlatformService } from '../../shared/services/platform.service';
import { SLIDER_CONFIG } from '../../shared/constants/app.constants';
import { PassiveTouchStartDirective, PassiveTouchEndDirective } from '../../shared/directives/passive-listeners.directive';

@Component({
  selector: 'app-feedbacks',
  standalone: true,
  imports: [CommonModule, TranslatePipe, PassiveTouchStartDirective, PassiveTouchEndDirective],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbacksComponent implements OnInit, OnDestroy {
  @ViewChildren('feedbackCard') feedbackCards!: QueryList<ElementRef>;

  constructor(
    private platformService: PlatformService,
    private cdr: ChangeDetectorRef
  ) {}

  private autoPlayInterval?: number;
  private touchStartX = 0;
  private touchEndX = 0;
  private readonly SWIPE_THRESHOLD = 50;
  private readonly AUTO_PLAY_INTERVAL = 5000;

  isTransitioning = false;
  isAutoPlaying = true;
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
  
  slideLeft() {
    if (this.isTransitioning) return;

    if (this.middleIndex < this.feedbacks.length - 1) {
      this.middleIndex++;
    } else {
      this.middleIndex = 0;
    }
    this.updateCards();
    this.cdr.markForCheck();
  }
  
  slideRight() {
    if (this.isTransitioning) return;

    if (this.middleIndex != 0) {
      this.middleIndex--;
    } else {
      this.middleIndex = this.feedbacks.length - 1;
    }
    this.updateCards();
    this.cdr.markForCheck();
  }
  
  updateCards() {
    if (this.feedbackCards) {
      this.isTransitioning = true;

      const baseOffset = (2 - this.middleIndex) * SLIDER_CONFIG.FEEDBACK_OFFSET;

      this.feedbackCards.forEach((card, index: number) => {
        let isActive: boolean = index === this.middleIndex;
        card.nativeElement.style.transform = `translateX(${baseOffset}%) scale(${isActive ? 1.1 : 0.8})`;
      });

      setTimeout(() => {
        this.isTransitioning = false;
        this.cdr.markForCheck();
      }, 500);
    }
  }
  
  
  getCardClass(index: number): string {
    if (index < this.middleIndex) return 'left feedback-card';
    if (index > this.middleIndex) return 'right feedback-card';
    return 'feedback-card';
  }

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  goToSlide(index: number) {
    if (this.isTransitioning || index === this.middleIndex) return;

    this.middleIndex = index;
    this.updateCards();
    this.resetAutoPlay();
    this.cdr.markForCheck();
  }

  onKeyDown(event: KeyboardEvent) {
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
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.toggleAutoPlay();
        break;
    }
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe() {
    const swipeDistance = this.touchStartX - this.touchEndX;

    if (Math.abs(swipeDistance) < this.SWIPE_THRESHOLD) return;

    if (swipeDistance > 0) {
      this.slideLeft();
    } else {
      this.slideRight();
    }
  }

  startAutoPlay() {
    if (!this.isAutoPlaying) return;

    const document = this.platformService.getDocument();
    if (!document?.defaultView) return;

    this.stopAutoPlay();
    this.autoPlayInterval = document.defaultView.setInterval(() => {
      this.slideLeft();
    }, this.AUTO_PLAY_INTERVAL);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = undefined;
    }
  }

  pauseAutoPlay() {
    this.stopAutoPlay();
  }

  resumeAutoPlay() {
    if (this.isAutoPlaying) {
      this.startAutoPlay();
    }
  }

  toggleAutoPlay() {
    this.isAutoPlaying = !this.isAutoPlaying;
    if (this.isAutoPlaying) {
      this.startAutoPlay();
    } else {
      this.stopAutoPlay();
    }
    this.cdr.markForCheck();
  }

  private resetAutoPlay() {
    if (this.isAutoPlaying) {
      this.startAutoPlay();
    }
  }

  @HostListener('window:visibilitychange')
  onVisibilityChange() {
    const document = this.platformService.getDocument();
    if (document) {
      if (document.hidden) {
        this.stopAutoPlay();
      } else if (this.isAutoPlaying) {
        this.startAutoPlay();
      }
    }
  }
}