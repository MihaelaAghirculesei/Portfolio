import { Component, ChangeDetectionStrategy } from '@angular/core';

interface SkillItem {
  url: string;
  name: string;
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillsComponent {
  
  readonly skillItems: SkillItem[] = [
    { url: 'assets/img/skills/angular.svg', name: 'Angular' },
    { url: 'assets/img/skills/typescript.svg', name: 'TypeScript' },
    { url: 'assets/img/skills/javascript.svg', name: 'JavaScript' },
    { url: 'assets/img/skills/html.svg', name: 'HTML' },
    { url: 'assets/img/skills/css.svg', name: 'CSS' },
    { url: 'assets/img/skills/firebase.svg', name: 'Firebase' },
    { url: 'assets/img/skills/git.svg', name: 'Git' },
    { url: 'assets/img/skills/materialDesign.svg', name: 'Material Design' },
    { url: 'assets/img/skills/rest-api.svg', name: 'Rest-API' },
    { url: 'assets/img/skills/scrum.svg', name: 'Scrum' },
    { url: 'assets/img/skills/mindset.svg', name: 'Growth Mindset' }
  ];

  readonly futureSkills: SkillItem[] = [
    { url: 'assets/img/skills/react.svg', name: 'React' },
    { url: 'assets/img/skills/vuejs.svg', name: 'Vue.js' }
  ];

  readonly content = {
    title: 'Skill Set',
    overContent: 'Technologies',
    introduction: `I transform ideas into engaging digital experiences! With Angular, TypeScript, and Material Design, 
      I create modern applications that enhance user experience. I integrate REST APIs and Firebase for dynamic functionality, 
      always seeking innovative solutions.`,
    additionalSkillsTitle: 'You Need',
    additionalSkillsHighlight: 'another skill?',
    additionalSkillsText: `Don't see the technology your project needs? No problem! My curiosity and determination allow me to embrace new technological challenges. 
      Every project is an opportunity to grow and deliver tailored solutions for your needs.`,
    ctaText: "Let's talk",
    tooltipText: 'I have special interests in learning:'
  };

  scrollToContact(): void {
    const element = document.getElementById('contact');
    if (element) {
      const elementPosition = element.offsetTop - 100;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  }

  isLastItem(index: number): boolean {
    return index === this.skillItems.length - 1;
  }

  handleContactClick(event: Event): void {
    event.preventDefault();
    this.scrollToContact();
  }
}