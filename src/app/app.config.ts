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
import { routes } from './app.routes';
import { GlobalErrorHandler } from './shared/services/global-error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withEnabledBlockingInitialNavigation(),
      withViewTransitions({ skipInitialTransition: true }),
    ),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch(), withInterceptors([httpInterceptor])),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};
