import type { MockedObject } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  HttpBackend, HttpClient, HttpEvent, HttpRequest, provideHttpClient, withInterceptors, HttpHandlerFn, HttpInterceptorFn,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslationService } from '../services/translation.service';
import { LoggerService } from '../services/logger.service';
import { httpInterceptor } from './http.interceptor';
import { Observable, noop, throwError } from 'rxjs';

describe('httpInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let loggerSpy: Pick<MockedObject<LoggerService>, 'info' | 'warn' | 'error' | 'debug'>;
  let translateStub: {
    currentLang: string;
    defaultLang: string;
  };

  beforeEach(() => {
    loggerSpy = {
      info: vi.fn().mockName('LoggerService.info'),
      warn: vi.fn().mockName('LoggerService.warn'),
      error: vi.fn().mockName('LoggerService.error'),
      debug: vi.fn().mockName('LoggerService.debug')
    };
    translateStub = { currentLang: 'en', defaultLang: 'en' };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpInterceptor])),
        provideHttpClientTesting(),
        { provide: LoggerService, useValue: loggerSpy },
        { provide: TranslationService, useValue: translateStub },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ─── Common Headers ────────────────────────────────────────────────────────

  describe('Common Headers', () => {
    it('should add Accept-Language header from current language', () => {
      translateStub.currentLang = 'de';
      http.get('/api/test').subscribe();

      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.get('Accept-Language')).toBe('de');
      req.flush({});
    });

    it('should fall back to defaultLang when currentLang is empty', () => {
      translateStub.currentLang = '';
      translateStub.defaultLang = 'fr';
      http.get('/api/test').subscribe();

      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.get('Accept-Language')).toBe('fr');
      req.flush({});
    });

    it('should use "en" when both currentLang and defaultLang are empty', () => {
      translateStub.currentLang = '';
      translateStub.defaultLang = '';
      http.get('/api/test').subscribe();

      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.get('Accept-Language')).toBe('en');
      req.flush({});
    });

    it('should add X-Correlation-Id header', () => {
      http.get('/api/test').subscribe();

      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.get('X-Correlation-Id')).toBeTruthy();
      req.flush({});
    });

    it('should generate a unique X-Correlation-Id per request', () => {
      http.get('/api/test').subscribe();
      http.get('/api/other').subscribe();

      const [req1, req2] = httpMock.match((r) => r.url === '/api/test' || r.url === '/api/other');

      const id1 = req1.request.headers.get('X-Correlation-Id');
      const id2 = req2.request.headers.get('X-Correlation-Id');
      expect(id1).not.toBe(id2);

      req1.flush({});
      req2.flush({});
    });

    it('should not override existing headers on the original request', () => {
      http.get('/api/test', { headers: { contentType: 'application/json' } }).subscribe();

      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.get('contentType')).toBe('application/json');
      req.flush({});
    });
  });

  // ─── Centralized Logging ───────────────────────────────────────────────────

  describe('Centralized Logging', () => {
    it('should log the outgoing request', () => {
      http.get('/api/test').subscribe();

      httpMock.expectOne('/api/test').flush({});

      expect(loggerSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('GET /api/test'),
        expect.objectContaining({ correlationId: expect.any(String) }),
      );
    });

    it('should log a successful response with status and duration', () => {
      http.get('/api/test').subscribe();

      httpMock.expectOne('/api/test').flush({}, { status: 200, statusText: 'OK' });

      const successLog = vi.mocked(loggerSpy.info).mock.calls.find((args) => (args[0] as string).includes('200'));
      expect(successLog).toBeTruthy();
    });

    it('should log an error response with status', () => {
      http.get('/api/test').subscribe({ error: noop });

      httpMock.expectOne('/api/test').flush('error', { status: 404, statusText: 'Not Found' });

      expect(loggerSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('GET /api/test'),
        expect.objectContaining({ status: 404 }),
      );
    });

    it('should include the same correlationId in request and response logs', () => {
      http.get('/api/test').subscribe();

      httpMock.expectOne('/api/test').flush({}, { status: 200, statusText: 'OK' });

      const requestLog = vi.mocked(loggerSpy.info).mock.calls.find((args) => (args[0] as string).includes('→'));
      const responseLog = vi.mocked(loggerSpy.info).mock.calls.find((args) => (args[0] as string).includes('←'));

      expect(requestLog).toBeTruthy();
      expect(responseLog).toBeTruthy();

      const requestCorrelationId = (requestLog![1] as {
        correlationId: string;
      }).correlationId;
      const responseCorrelationId = (responseLog![1] as {
        correlationId: string;
      }).correlationId;
      expect(requestCorrelationId).toBe(responseCorrelationId);
    });
  });

  // ─── Retry Logic ──────────────────────────────────────────────────────────

  describe('Retry Logic', () => {
    it('should not retry on 4xx client errors', async () => {
      vi.useFakeTimers();
      let errorCaught = false;

      http.get('/api/test').subscribe({ error: () => (errorCaught = true) });

      httpMock.expectOne('/api/test').flush('Bad request', { status: 400, statusText: 'Bad Request' });
      await vi.advanceTimersByTimeAsync(5000);

      // No retry: only the one initial request
      httpMock.verify();
      expect(errorCaught).toBe(true);
    });

    it('should not retry on 401 unauthorized', async () => {
      vi.useFakeTimers();
      let errorCaught = false;

      http.get('/api/test').subscribe({ error: () => (errorCaught = true) });

      httpMock.expectOne('/api/test').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      await vi.advanceTimersByTimeAsync(5000);

      httpMock.verify();
      expect(errorCaught).toBe(true);
    });

    it('should not retry on 404 not found', async () => {
      vi.useFakeTimers();
      let errorCaught = false;

      http.get('/api/test').subscribe({ error: () => (errorCaught = true) });

      httpMock.expectOne('/api/test').flush('Not found', { status: 404, statusText: 'Not Found' });
      await vi.advanceTimersByTimeAsync(5000);

      httpMock.verify();
      expect(errorCaught).toBe(true);
    });

    it('should not retry non-idempotent requests (POST) even on 500', async () => {
      vi.useFakeTimers();
      let errorCaught = false;

      http.post('/api/contact', { name: 'x' }).subscribe({ error: () => (errorCaught = true) });

      httpMock.expectOne('/api/contact').flush('error', { status: 500, statusText: 'Server Error' });
      await vi.advanceTimersByTimeAsync(5000);

      // No retry: a replayed POST could send a duplicate email
      httpMock.verify();
      expect(errorCaught).toBe(true);
    });

    it('should retry on 500 server error and succeed on retry', async () => {
      vi.useFakeTimers();
      let result: unknown;

      http.get('/api/test').subscribe({ next: (r) => (result = r) });

      // First attempt: fails with 500
      httpMock.expectOne('/api/test').flush('error', { status: 500, statusText: 'Server Error' });
      await vi.advanceTimersByTimeAsync(1000); // retry delay: 1 * 1000ms

      // First retry: succeeds
      httpMock.expectOne('/api/test').flush({ ok: true });
      await vi.advanceTimersByTimeAsync(0);

      expect(result).toEqual({ ok: true });
    });

    it('should retry on 503 service unavailable', async () => {
      vi.useFakeTimers();
      let errorCaught = false;

      http.get('/api/test').subscribe({ error: () => (errorCaught = true) });

      // Initial attempt
      httpMock.expectOne('/api/test').flush('error', { status: 503, statusText: 'Service Unavailable' });
      await vi.advanceTimersByTimeAsync(1000);

      // Retry 1
      httpMock.expectOne('/api/test').flush('error', { status: 503, statusText: 'Service Unavailable' });
      await vi.advanceTimersByTimeAsync(2000);

      // Retry 2 (last)
      httpMock.expectOne('/api/test').flush('error', { status: 503, statusText: 'Service Unavailable' });
      await vi.advanceTimersByTimeAsync(0);

      expect(errorCaught).toBe(true);
    });

    it('should retry on network error (status 0)', async () => {
      vi.useFakeTimers();
      let errorCaught = false;

      http.get('/api/test').subscribe({ error: () => (errorCaught = true) });

      httpMock.expectOne('/api/test').error(new ProgressEvent('error'));
      await vi.advanceTimersByTimeAsync(1000);

      httpMock.expectOne('/api/test').error(new ProgressEvent('error'));
      await vi.advanceTimersByTimeAsync(2000);

      httpMock.expectOne('/api/test').error(new ProgressEvent('error'));
      await vi.advanceTimersByTimeAsync(0);

      expect(errorCaught).toBe(true);
    });

    it('should log a warning for each retry attempt', async () => {
      vi.useFakeTimers();
      http.get('/api/test').subscribe({ error: noop });

      httpMock.expectOne('/api/test').flush('error', { status: 502, statusText: 'Bad Gateway' });
      await vi.advanceTimersByTimeAsync(1000);

      httpMock.expectOne('/api/test').flush('error', { status: 502, statusText: 'Bad Gateway' });
      await vi.advanceTimersByTimeAsync(2000);

      httpMock.expectOne('/api/test').flush('error', { status: 502, statusText: 'Bad Gateway' });
      await vi.advanceTimersByTimeAsync(0);

      expect(loggerSpy.warn).toHaveBeenCalledTimes(2);
      expect(loggerSpy.warn).toHaveBeenCalledWith(expect.stringContaining('Retry 1/2'), expect.any(Object));
      expect(loggerSpy.warn).toHaveBeenCalledWith(expect.stringContaining('Retry 2/2'), expect.any(Object));
    });

    it('should use linear backoff delay between retries', async () => {
      vi.useFakeTimers();
      let retryCount = 0;
      http.get('/api/test').subscribe({ error: noop });

      httpMock.expectOne('/api/test').flush('error', { status: 500, statusText: 'Error' });

      // After 999ms retry should NOT have fired yet
      await vi.advanceTimersByTimeAsync(999);
      expect(httpMock.match('/api/test').length).toBe(0);

      // At 1000ms first retry fires
      await vi.advanceTimersByTimeAsync(1);
      httpMock.expectOne('/api/test').flush('error', { status: 500, statusText: 'Error' });
      retryCount++;

      // After another 1999ms second retry should NOT have fired yet
      await vi.advanceTimersByTimeAsync(1999);
      expect(httpMock.match('/api/test').length).toBe(0);

      // At 2000ms second retry fires
      await vi.advanceTimersByTimeAsync(1);
      httpMock.expectOne('/api/test').flush('error', { status: 500, statusText: 'Error' });
      retryCount++;

      await vi.advanceTimersByTimeAsync(0);
      expect(retryCount).toBe(2);
    });
  });
});

describe('httpInterceptor with non-HttpErrorResponse error', () => {
  let http: HttpClient;
  let loggerSpy: Pick<MockedObject<LoggerService>, 'info' | 'warn' | 'error' | 'debug'>;

  class ThrowingBackend implements HttpBackend {
    handle(_req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
      return throwError(() => new Error('Non-HTTP failure'));
    }
  }

  beforeEach(() => {
    loggerSpy = {
      info: vi.fn().mockName('LoggerService.info'),
      warn: vi.fn().mockName('LoggerService.warn'),
      error: vi.fn().mockName('LoggerService.error'),
      debug: vi.fn().mockName('LoggerService.debug')
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpInterceptor])),
        { provide: HttpBackend, useClass: ThrowingBackend },
        { provide: LoggerService, useValue: loggerSpy },
        { provide: TranslationService, useValue: { currentLang: 'en', defaultLang: 'en' } },
      ],
    });

    http = TestBed.inject(HttpClient);
  });

  it('should log "unknown" status when error is not HttpErrorResponse', async () => {
    vi.useFakeTimers();
    http.get('/api/test').subscribe({ error: noop });
    await vi.advanceTimersByTimeAsync(0);

    expect(loggerSpy.error).toHaveBeenCalledWith(
      expect.stringContaining('GET /api/test'),
      expect.objectContaining({ status: 'unknown' }),
    );
  });
});
