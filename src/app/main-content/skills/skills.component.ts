import { Component } from '@angular/core';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent {
  imgURLS = [
    { url: '/assets/img/skills/angular.svg', name: 'Angular' },
    { url: 'assets/img/skills/typescript.svg', name: 'TypeScript' },
    { url: '/assets/img/skills/javascript.svg', name: 'JavaScript' },
    { url: '/assets/img/skills/html.svg', name: 'HTML' },
    { url: '/assets/img/skills/css.svg', name: 'CSS' },
    { url: '/assets/img/skills/firebase.svg', name: 'Firebase' },
    { url: '/assets/img/skills/git.svg', name: 'Git' },
    { url: '/assets/img/skills/materialDesign.svg', name: 'Material Design' },
    { url: '/assets/img/skills/rest-api.svg', name: 'Rest-API' },
    { url: '/assets/img/skills/scrum.svg', name: 'Scrum' },
    { url: '/assets/img/skills/mindset.svg', name: 'Growth Mindset' }
  ];
}
