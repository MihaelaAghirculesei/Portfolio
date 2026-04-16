import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { timer } from 'rxjs';
import { retry, tap } from 'rxjs/operators';
import { HTTP_CONFIG } from '../constants/app.constants';
import { LoggerService } from '../services/logger.service';

function isRetryable(error: HttpErrorResponse): boolean {
  return error.status === 0 || error.status >= 500;
}

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const translate = inject(TranslateService);

  const correlationId = crypto.randomUUID();
  const lang = translate.currentLang || translate.defaultLang || 'en';
  const startTime = Date.now();

  const isExternalUrl = req.url.startsWith('http://') || req.url.startsWith('https://');

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const headers: Record<string, string> = { 'Accept-Language': lang };
  if (!isExternalUrl) {
    headers['X-Correlation-Id'] = correlationId;
  }

  const enrichedReq = req.clone({ setHeaders: headers });

  logger.info(`[HTTP] → ${enrichedReq.method} ${enrichedReq.url}`, { correlationId });

  return next(enrichedReq).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          logger.info(
            `[HTTP] ← ${enrichedReq.method} ${enrichedReq.url} ${event.status} (${Date.now() - startTime}ms)`,
            { correlationId }
          );
        }
      },
      error: (error: unknown) => {
        const status = error instanceof HttpErrorResponse ? error.status : 'unknown';
        logger.error(
          `[HTTP] ✗ ${enrichedReq.method} ${enrichedReq.url} failed (${Date.now() - startTime}ms)`,
          { correlationId, status }
        );
      },
    }),
    retry({
      count: HTTP_CONFIG.RETRY_ATTEMPTS,
      delay: (error: unknown, retryCount: number) => {
        if (error instanceof HttpErrorResponse && isRetryable(error)) {
          const delayMs = retryCount * 1000;
          logger.warn(
            `[HTTP] Retry ${retryCount}/${HTTP_CONFIG.RETRY_ATTEMPTS}: ${enrichedReq.method} ${enrichedReq.url}`,
            { correlationId, status: error.status, delayMs }
          );
          return timer(delayMs);
        }
        throw error;
      },
    })
  );
};
