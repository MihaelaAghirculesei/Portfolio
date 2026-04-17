import { provideServerRendering } from '@angular/ssr';
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { appConfig } from './app.config';

class TranslateServerLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    const candidates = [
      join(process.cwd(), 'src', 'assets', 'i18n', `${lang}.json`),
      join(process.cwd(), 'dist', 'angular-portfolio', 'browser', 'assets', 'i18n', `${lang}.json`),
    ];
    for (const filePath of candidates) {
      try {
        return of(JSON.parse(readFileSync(filePath, 'utf8')));
      } catch {
        // try next path
      }
    }
    return of({});
  }
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    { provide: TranslateLoader, useClass: TranslateServerLoader },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
