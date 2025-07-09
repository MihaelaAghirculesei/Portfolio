import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-feedbacks',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss',
})
export class FeedbacksComponent {
  feedbacks = [
    {
      name: 'Marvin Schneemann',
      feedback:
        'I want to express my sincere appreciation for Mihaela´s dedication to our project. Even though there may have been some challenges at the beginning, it was clear how much effort you put in and how quickly you learned. Your commitment and support were key factors in helping us complete the project so efficiently. Without your contribution, things wouldn\'t have gone as smoothly. I look forward to collaborating with you again on future projects.',
      ref: 'Kochwelt',
    },
    {
      name: 'Christian Duus',
      feedback:
        'Mihaela has consistently shown initiative by independently identifying tasks and thoroughly testing features. She demonstrated a strong eye for detail, often catching issues others overlooked. Always motivated and proactive, she contributed meaningfully within her scope and helped move tasks forward with reliability and commitment.',
      ref: 'Join',
    },
    {
      name: 'Marvin Schneemann',
      feedback:
        'I had the pleasure of working with Mihaela on the Join project. During our collaboration, I found her to be an exceptionally reliable, committed, and goal-oriented colleague. She works in a structured manner, thinks in terms of solutions, and contributes actively to the team. Her professional approach and strong initiative made her a valuable asset to the project. She always completed her tasks diligently and on time. I truly appreciate Mihaela\'s work ethic and team spirit, and I can wholeheartedly recommend working with her.',
      ref: 'Join',
    },
    {
      name: 'Soufiane Nouira',
      feedback:
        'Mihaela demonstrated great determination, ambition, and eagerness to learn. She was always motivated to dive into new topics and brought fresh perspectives to the team. Her dedication played an important role in driving the project forward. Working with Mehaila was a great experience.',
      ref: 'Join',
    },
    {
      name: 'Ha Dao',
      feedback:
        'It was a real pleasure to work with Mihaela during our group project at Developer Akademie. Although programming was a challenge for her at first, she stayed committed, made remarkable progress, and often inspired others with her determination. She is extremely friendly, polite, and brings a great sense of humor to the team, creating a positive and motivating atmosphere. Mihaela is hardworking, focused, and approaches every task with precision and care.',
      ref: 'Join',
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