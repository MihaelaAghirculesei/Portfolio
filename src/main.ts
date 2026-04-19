import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

async function init(): Promise<void> {
  if (environment.production && environment.sentryDsn) {
    const {
      init,
      inboundFiltersIntegration,
      functionToStringIntegration,
      linkedErrorsIntegration,
      dedupeIntegration,
    } = await import('@sentry/browser');

    init({
      dsn: environment.sentryDsn,
      environment: 'production',
      // Disable all default integrations; only include what we actually use.
      // Removes: Breadcrumbs, GlobalHandlers, BrowserApiErrors, HttpContext
      // (those add ~200 kB; we handle errors ourselves via GlobalErrorHandler).
      defaultIntegrations: false,
      integrations: [
        inboundFiltersIntegration(),   // filters noise / allowedUrls
        functionToStringIntegration(), // improves stack trace readability
        linkedErrorsIntegration(),     // chains error causes
        dedupeIntegration(),           // suppresses duplicate events
      ],
      tracesSampleRate: 0, // no performance monitoring → strips tracing code
    });
  }

  await bootstrapApplication(AppComponent, appConfig);
}

// eslint-disable-next-line no-console
init().catch((err) => console.error(err));
