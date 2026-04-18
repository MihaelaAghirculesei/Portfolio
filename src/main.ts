import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production && environment.sentryDsn) {
  import('@sentry/angular').then((sentry) => {
    sentry.init({
      dsn: environment.sentryDsn,
      environment: 'production',
    });
  });
}

bootstrapApplication(AppComponent, appConfig)
  // eslint-disable-next-line no-console
  .catch((err) => console.error(err));
