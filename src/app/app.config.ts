import {
  ApplicationConfig,
  ErrorHandler,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withViewTransitions,
} from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { httpInterceptor } from './shared/interceptors/http.interceptor';
import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { routes } from './app.routes';
import { GlobalErrorHandler } from './shared/services/global-error-handler.service';
import { InlineTranslateLoader } from './shared/i18n/inline-translate-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withEnabledBlockingInitialNavigation(),
      withViewTransitions(),
    ),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch(), withInterceptors([httpInterceptor])),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideTranslateService({
      loader: { provide: TranslateLoader, useClass: InlineTranslateLoader },
    }),
  ],
};