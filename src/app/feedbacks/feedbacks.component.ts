import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-feedbacks',
  standalone: true,
  imports: [CommonModule, TranslatePipe, TranslateDirective],
  templateUrl: './feedbacks.component.html',
  styleUrl: './feedbacks.component.scss',
})
export class FeedbacksComponent {
  feedbacks = [
    {
      name: 'Ana S.',
      feedback:
        'Es war eine großartige Erfahrung, mit dir zusammenzuarbeiten! Dein strukturiertes Arbeiten haben das Projekt erheblich vorangebracht. Besonders schätze ich deine klare Kommunikation und deine Hilfsbereitschaft im Team. Ich freue mich auf zukünftige gemeinsame Projekte!',
      ref: 'Erfolgreiche Zusammenarbeit in der Entwicklung eines Projects ',
    },
    {
      name: 'Max Mustermann',
      feedback:
        'Die Zusammenarbeit mit dir war wirklich angenehm und produktiv! Deine Lösungen waren durchdacht, und deine Effizienz hat das Projekt spürbar vorangebracht. Besonders beeindruckt hat mich deine Offenheit für neue Ideen und dein Teamgeist. Ich würde jederzeit wieder mit dir arbeiten! 😊',
      ref: 'tolle Zusammenarbeit in______. ',
    },
    {
      name: 'Victoria R.',
      feedback: 'Es war eine Freude, mit dir zusammenzuarbeiten! ',
      ref: 'Gemeinsame Arbeit an einem herausfordernden Projekt',
    },
  ];
  
  currentOffset = 0;
  middleIndex = 2;
  
  slideLeft() {
    if (this.middleIndex < this.feedbacks.length - 1) {
      this.middleIndex++;
    } else {
      this.middleIndex = this.middleIndex;
    }
    this.shiftCards('right');
  }
  
  slideRight() {
    if (this.middleIndex != 0) {
      this.middleIndex--;
    } else {
      this.middleIndex = 0;
    }
    this.shiftCards('left');
  }
  
  shiftCards(direction: string) {
    if (typeof document !== 'undefined') {
      const feedbackCards = document.querySelectorAll('.feedback-card');
      
      if (direction === 'left') {
        this.currentOffset += 105;
      } else if (direction === 'right') {
        this.currentOffset -= 105;
      }
      
      if (this.currentOffset > 210) {
        this.currentOffset = 210;
      }
      if (this.currentOffset < -210) {
        this.currentOffset = -210;
      }
      
      feedbackCards.forEach((card: any, index: number) => {
        let isActive: boolean = index === this.middleIndex;
        card.style.transform = `translateX(${this.currentOffset}%) scale(${
          isActive ? 1.1 : 0.8
        })`;
      });
    }
  }
  
  getCardClass(index: number): string {
    if (index < this.middleIndex) return 'left feedback-card';
    if (index > this.middleIndex) return 'right feedback-card';
    return 'feedback-card';
  }
}