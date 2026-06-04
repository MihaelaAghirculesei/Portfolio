import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Projects } from '../../../interfaces/projects';
import projectsData from '../../../../assets/data/projects.json';

@Injectable({ providedIn: 'root' })
export class ProjectDataService {
  private readonly translate = inject(TranslateService);

  projects: Projects[] = projectsData as Projects[];

  private readonly ICONS_BASE = 'assets/img/projects/icons/';
  private readonly TECH_ICONS: Record<string, string> = {
    angular: 'angular.svg',
    firebase: 'firebase.svg',
    typescript: 'typescript.svg',
    html: 'html.svg',
    css: 'css.svg',
    scss: 'sass.svg',
    javascript: 'javascript.svg',
    restapi: 'rest-api.svg',
    ngrx: 'ngrx.svg',
    rxjs: 'rxjs.svg',
    materialdesign: 'material-design.svg',
    capacitor: 'capacitor.svg',
    indexeddb: 'indexeddb.svg',
    oauth20: 'oauth.svg',
    pwa: 'pwa.svg',
    ssr: 'ssr.svg',
    vite: 'vite.svg',
    vitest: 'vitest.svg',
    playwright: 'playwright.svg',
    workbox: 'workbox.svg',
    python311: 'python.svg',
    fastapi: 'fastapi.svg',
    sqlalchemy20: 'sqlalchemy.svg',
    pydantic2: 'pydantic.svg',
    sqlite: 'sqlite.svg',
    postgresql: 'postgresql.svg',
    pytest: 'pytest.svg',
    react: 'react.svg',
    sentry: 'sentry.svg',
    cypress: 'cypress.svg',
    zod: 'zod.svg',
  };

  hasTechIcon(technology: string): boolean {
    return this.getTechIconPath(technology) !== null;
  }

  getTechIconPath(technology: string): string | null {
    const normalized = technology.replace(/[-\s.]/g, '').toLowerCase();
    const icon = this.TECH_ICONS[normalized];
    return icon ? this.ICONS_BASE + icon : null;
  }

  getProjectScreenshotAlt(projectIndex: number | null): string {
    if (projectIndex === null || projectIndex < 0 || projectIndex >= this.projects.length) {
      return 'Project screenshot';
    }
    const name = this.projects[projectIndex]?.name;
    return name ? `${name} screenshot` : 'Project screenshot';
  }

  getProjectShortDescription(project: Projects): string {
    const key = project.id ? `projects.${project.id}.shortDescription` : 'projects.default.shortDescription';
    return this.translate.instant(key);
  }

  getProjectDescription(project: Projects): string {
    if (!project.id) { return project.description ?? ''; }
    return this.translate.instant(`projects.${project.id}.description`);
  }
}
