import {
  ApplicationConfig,
  ErrorHandler,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, RouteReuseStrategy, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay, withNoIncrementalHydration } from '@angular/platform-browser';
import { httpInterceptor } from './shared/interceptors/http.interceptor';
import { routes } from './app.routes';
import { GlobalErrorHandler } from './shared/services/global-error-handler.service';
import { LocaleRouteReuseStrategy } from './shared/i18n/locale-route-reuse.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withViewTransitions({ skipInitialTransition: true }),
    ),
    { provide: RouteReuseStrategy, useClass: LocaleRouteReuseStrategy },
    provideZonelessChangeDetection(),
    provideClientHydration(withEventReplay(), withNoIncrementalHydration()),
    provideHttpClient(withFetch(), withInterceptors([httpInterceptor])),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};
