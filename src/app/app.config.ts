import {
  ApplicationConfig,
  ErrorHandler,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { httpInterceptor } from './shared/interceptors/http.interceptor';
import { routes } from './app.routes';
import { GlobalErrorHandler } from './shared/services/global-error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withViewTransitions({ skipInitialTransition: true }),
    ),
    provideZonelessChangeDetection(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([httpInterceptor])),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};
