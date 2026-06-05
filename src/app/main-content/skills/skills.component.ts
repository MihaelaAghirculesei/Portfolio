import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ScrollService } from '../../shared/services/scroll.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

interface SkillItem {
  url: string;
  name: string;
}

@Component({
    selector: 'app-skills',
    imports: [TranslatePipe],
    templateUrl: './skills.component.html',
    styleUrl: './skills.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillsComponent {
  readonly skillItems: readonly SkillItem[] = [
    // Core web
    { url: 'assets/img/skills/html.svg', name: 'HTML' },
    { url: 'assets/img/skills/css.svg', name: 'CSS' },
    { url: 'assets/img/skills/javascript.svg', name: 'JavaScript' },
    { url: 'assets/img/skills/typescript.svg', name: 'TypeScript' },
    { url: 'assets/img/skills/sass.svg', name: 'SASS' },
    // Angular ecosystem
    { url: 'assets/img/skills/angular.svg', name: 'Angular' },
    { url: 'assets/img/skills/ngrx.svg', name: 'NgRx' },
    { url: 'assets/img/skills/rxjs.svg', name: 'RxJS' },
    { url: 'assets/img/skills/materialDesign.svg', name: 'Material Design' },
    // Servizi & API
    { url: 'assets/img/skills/firebase.svg', name: 'Firebase' },
    { url: 'assets/img/skills/rest-api.svg', name: 'Rest-API' },
    // Modern web
    { url: 'assets/img/skills/pwa.svg', name: 'PWA' },
    { url: 'assets/img/skills/ssr.svg', name: 'SSR' },
    { url: 'assets/img/skills/capacitor.svg', name: 'Capacitor' },
    // Backend
    { url: 'assets/img/skills/python.svg', name: 'Python' },
    { url: 'assets/img/skills/fastapi.svg', name: 'FastAPI' },
    { url: 'assets/img/skills/sqlalchemy.svg', name: 'SQLAlchemy' },
    { url: 'assets/img/skills/pydantic.svg', name: 'Pydantic 2' },
    { url: 'assets/img/skills/sqlite.svg', name: 'SQLite' },
    { url: 'assets/img/skills/postgresql.svg', name: 'PostgreSQL' },
    { url: 'assets/img/skills/pytest.svg', name: 'Pytest' },
    // Strumenti & processo
    { url: 'assets/img/skills/vite.svg', name: 'Vite' },
    { url: 'assets/img/skills/vitest.svg', name: 'Vitest' },
    { url: 'assets/img/skills/playwright.svg', name: 'Playwright' },
    { url: 'assets/img/skills/cypress.svg', name: 'Cypress' },
    { url: 'assets/img/skills/workbox.svg', name: 'Workbox' },
    { url: 'assets/img/skills/sentry.svg', name: 'Sentry' },
    { url: 'assets/img/skills/indexeddb.svg', name: 'IndexedDB' },
    { url: 'assets/img/skills/zod.svg', name: 'Zod' },
    { url: 'assets/img/skills/git.svg', name: 'Git' },
    { url: 'assets/img/skills/figma.svg', name: 'Figma' },
    { url: 'assets/img/skills/scrum.svg', name: 'Scrum' },
    // Soft skill
    { url: 'assets/img/skills/mindset.svg', name: 'Growth Mindset' },
  ];

  readonly futureSkills: readonly SkillItem[] = [
    { url: 'assets/img/skills/react.svg', name: 'React' },
  ];

  private readonly scrollService = inject(ScrollService);

  isLastItem(index: number): boolean {
    return index === this.skillItems.length - 1;
  }

  handleContactClick(event: Event): void {
    event.preventDefault();
    this.scrollService.scrollToElement('contact', 'start');
  }
}
