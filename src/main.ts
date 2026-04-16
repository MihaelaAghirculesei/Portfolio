import { bootstrapApplication } from '@angular/platform-browser';
import * as sentry from '@sentry/angular';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production && environment.sentryDsn) {
  sentry.init({
    dsn: environment.sentryDsn,
    environment: 'production',
  });
}

bootstrapApplication(AppComponent, appConfig)
  // eslint-disable-next-line no-console
  .catch((err) => console.error(err));
