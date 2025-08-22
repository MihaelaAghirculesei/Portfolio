import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  TranslateModule,
  TranslateLoader,
  provideTranslateService,
} from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { CustomTranslationLoader } from './shared/services/translation-loader.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useClass: CustomTranslationLoader,
      },
    }),
    provideHttpClient(withFetch()),
    importProvidersFrom([
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: CustomTranslationLoader,
        },
      }),
    ]),
  ],
};