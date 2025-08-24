import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PlatformService } from '../../shared/services/platform.service';
import { SLIDER_CONFIG } from '../../shared/constants/app.constants';

@Component({
  selector: 'app-feedbacks',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss',
})
export class FeedbacksComponent {

  constructor(private platformService: PlatformService) {}
  feedbacks = [
    {
      name: 'Marvin Schneemann',
      feedbackKey: 'references.feedbacks.marvin1',
      ref: 'Kochwelt',
    },
    {
      name: 'Christian Duus',
      feedbackKey: 'references.feedbacks.christian',
      ref: 'Join',
    },
    {
      name: 'Marvin Schneemann',
      feedbackKey: 'references.feedbacks.marvin2',
      ref: 'Join',
    },
    {
      name: 'Soufiane Nouira',
      feedbackKey: 'references.feedbacks.soufiane',
      ref: 'Join',
    },
    {
      name: 'Ha Dao',
      feedbackKey: 'references.feedbacks.ha',
      ref: 'Join',
    },
  ];
  
  middleIndex = 2;
  
  slideLeft() {
    if (this.middleIndex < this.feedbacks.length - 1) {
      this.middleIndex++;
    } else {
      this.middleIndex = 0;
    }
    this.updateCards();
  }
  
  slideRight() {
    if (this.middleIndex != 0) {
      this.middleIndex--;
    } else {
      this.middleIndex = this.feedbacks.length - 1;
    }
    this.updateCards();
  }
  
  updateCards() {
    const document = this.platformService.getDocument();
    if (document) {
      const feedbackCards = document.querySelectorAll('.feedback-card');
      
      const baseOffset = (2 - this.middleIndex) * SLIDER_CONFIG.FEEDBACK_OFFSET;
      
      feedbackCards.forEach((card: any, index: number) => {
        let isActive: boolean = index === this.middleIndex;
        card.style.transform = `translateX(${baseOffset}%) scale(${isActive ? 1.1 : 0.8})`;
      });
    }
  }
  
  
  getCardClass(index: number): string {
    if (index < this.middleIndex) return 'left feedback-card';
    if (index > this.middleIndex) return 'right feedback-card';
    return 'feedback-card';
  }
}