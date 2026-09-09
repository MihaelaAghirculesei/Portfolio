import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { timer } from 'rxjs';
import { retry, tap } from 'rxjs/operators';
import { HTTP_CONFIG } from '../constants/app.constants';
import { LoggerService } from '../services/logger.service';

function isRetryable(error: HttpErrorResponse): boolean {
  return error.status === 0 || error.status >= 500;
}

/**
 * Only replay requests that are safe to send more than once. Retrying a POST
 * (e.g. the contact form) risks a duplicate side effect — such as a second
 * email — when the first attempt actually reached the server but the response
 * was lost.
 */
const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const translate = inject(TranslationService);

  const correlationId = crypto.randomUUID();
  const lang = translate.currentLang || translate.defaultLang || 'en';
  const startTime = Date.now();

  const isExternalUrl = req.url.startsWith('http://') || req.url.startsWith('https://');
  const isIdempotent = IDEMPOTENT_METHODS.has(req.method.toUpperCase());

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
        if (isIdempotent && error instanceof HttpErrorResponse && isRetryable(error)) {
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
