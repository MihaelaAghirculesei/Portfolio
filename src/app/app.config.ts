import {
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, NoPreloading, withPreloading } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors, HttpClient } from '@angular/common/http';
import { httpInterceptor } from './shared/interceptors/http.interceptor';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { GlobalErrorHandler } from './shared/services/global-error-handler.service';

const TRANSLATION_CONFIG = {
  prefix: '/assets/i18n/',
  suffix: '.json',
} as const;

export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(
    http,
    TRANSLATION_CONFIG.prefix,
    TRANSLATION_CONFIG.suffix
  );
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withPreloading(NoPreloading)
    ),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withFetch(), withInterceptors([httpInterceptor])),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    importProvidersFrom([
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient],
        },
      }),
    ]),
  ],
};