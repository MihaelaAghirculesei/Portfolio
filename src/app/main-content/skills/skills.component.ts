import { Component } from '@angular/core';
import { ScrollService } from '../../shared/services/scroll.service';
import { SCROLL_CONFIG } from '../../shared/constants/app.constants';
import { TranslatePipe } from '@ngx-translate/core';

interface SkillItem {
  url: string;
  name: string;
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
})
export class SkillsComponent {

  constructor(private scrollService: ScrollService) {}
  
  readonly skillItems: SkillItem[] = [
    { url: 'assets/img/skills/angular.svg', name: 'Angular' },
    { url: 'assets/img/skills/typescript.svg', name: 'TypeScript' },
    { url: 'assets/img/skills/javascript.svg', name: 'JavaScript' },
    { url: 'assets/img/skills/html.svg', name: 'HTML' },
    { url: 'assets/img/skills/css.svg', name: 'CSS' },
    { url: 'assets/img/skills/firebase.svg', name: 'Firebase' },
    { url: 'assets/img/skills/git.svg', name: 'Git' },
    { url: 'assets/img/skills/figma.svg', name: 'Figma' },
    { url: 'assets/img/skills/materialDesign.svg', name: 'Material Design' },
    { url: 'assets/img/skills/rest-api.svg', name: 'Rest-API' },
    { url: 'assets/img/skills/scrum.svg', name: 'Scrum' },
    { url: 'assets/img/skills/mindset.svg', name: 'Growth Mindset' }
  ];

  readonly futureSkills: SkillItem[] = [
    { url: 'assets/img/skills/react.svg', name: 'React' },
    { url: 'assets/img/skills/vuejs.svg', name: 'Vue.js' }
  ];

  scrollToContact(): void {
    this.scrollService.scrollToElementWithOffset('contact', SCROLL_CONFIG.CONTACT_OFFSET);
  }

  isLastItem(index: number): boolean {
    return index === this.skillItems.length - 1;
  }

  handleContactClick(event: Event): void {
    event.preventDefault();
    this.scrollToContact();
  }
}