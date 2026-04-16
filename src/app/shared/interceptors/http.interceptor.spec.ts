import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../services/logger.service';
import { httpInterceptor } from './http.interceptor';

describe('httpInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let loggerSpy: jasmine.SpyObj<LoggerService>;
  let translateStub: { currentLang: string; defaultLang: string };

  beforeEach(() => {
    loggerSpy = jasmine.createSpyObj('LoggerService', ['info', 'warn', 'error', 'debug']);
    translateStub = { currentLang: 'en', defaultLang: 'en' };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpInterceptor])),
        provideHttpClientTesting(),
        { provide: LoggerService, useValue: loggerSpy },
        { provide: TranslateService, useValue: translateStub },
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

      const [req1, req2] = httpMock.match((r) =>
        r.url === '/api/test' || r.url === '/api/other'
      );

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
        jasmine.stringContaining('GET /api/test'),
        jasmine.objectContaining({ correlationId: jasmine.any(String) })
      );
    });

    it('should log a successful response with status and duration', () => {
      http.get('/api/test').subscribe();

      httpMock.expectOne('/api/test').flush({}, { status: 200, statusText: 'OK' });

      const successLog = loggerSpy.info.calls.allArgs().find((args) =>
        (args[0] as string).includes('200')
      );
      expect(successLog).toBeTruthy();
    });

    it('should log an error response with status', () => {
      http.get('/api/test').subscribe({ error: () => { /* empty */ } });

      httpMock.expectOne('/api/test').flush('error', { status: 404, statusText: 'Not Found' });

      expect(loggerSpy.error).toHaveBeenCalledWith(
        jasmine.stringContaining('GET /api/test'),
        jasmine.objectContaining({ status: 404 })
      );
    });

    it('should include the same correlationId in request and response logs', () => {
      http.get('/api/test').subscribe();

      httpMock.expectOne('/api/test').flush({}, { status: 200, statusText: 'OK' });

      const requestLog = loggerSpy.info.calls.allArgs().find((args) =>
        (args[0] as string).includes('→')
      );
      const responseLog = loggerSpy.info.calls.allArgs().find((args) =>
        (args[0] as string).includes('←')
      );

      expect(requestLog).toBeTruthy();
      expect(responseLog).toBeTruthy();

      const requestCorrelationId = (requestLog![1] as { correlationId: string }).correlationId;
      const responseCorrelationId = (responseLog![1] as { correlationId: string }).correlationId;
      expect(requestCorrelationId).toBe(responseCorrelationId);
    });
  });

  // ─── Retry Logic ──────────────────────────────────────────────────────────

  describe('Retry Logic', () => {
    it('should not retry on 4xx client errors', fakeAsync(() => {
      let errorCaught = false;

      http.get('/api/test').subscribe({ error: () => (errorCaught = true) });

      httpMock.expectOne('/api/test').flush('Bad request', { status: 400, statusText: 'Bad Request' });
      tick(5000);

      // No retry: only the one initial request
      httpMock.verify();
      expect(errorCaught).toBeTrue();
    }));

    it('should not retry on 401 unauthorized', fakeAsync(() => {
      let errorCaught = false;

      http.get('/api/test').subscribe({ error: () => (errorCaught = true) });

      httpMock.expectOne('/api/test').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      tick(5000);

      httpMock.verify();
      expect(errorCaught).toBeTrue();
    }));

    it('should not retry on 404 not found', fakeAsync(() => {
      let errorCaught = false;

      http.get('/api/test').subscribe({ error: () => (errorCaught = true) });

      httpMock.expectOne('/api/test').flush('Not found', { status: 404, statusText: 'Not Found' });
      tick(5000);

      httpMock.verify();
      expect(errorCaught).toBeTrue();
    }));

    it('should retry on 500 server error and succeed on retry', fakeAsync(() => {
      let result: unknown;

      http.get('/api/test').subscribe({ next: (r) => (result = r) });

      // First attempt: fails with 500
      httpMock.expectOne('/api/test').flush('error', { status: 500, statusText: 'Server Error' });
      tick(1000); // retry delay: 1 * 1000ms

      // First retry: succeeds
      httpMock.expectOne('/api/test').flush({ ok: true });
      tick(0);

      expect(result).toEqual({ ok: true });
    }));

    it('should retry on 503 service unavailable', fakeAsync(() => {
      let errorCaught = false;

      http.get('/api/test').subscribe({ error: () => (errorCaught = true) });

      // Initial attempt
      httpMock.expectOne('/api/test').flush('error', { status: 503, statusText: 'Service Unavailable' });
      tick(1000);

      // Retry 1
      httpMock.expectOne('/api/test').flush('error', { status: 503, statusText: 'Service Unavailable' });
      tick(2000);

      // Retry 2 (last)
      httpMock.expectOne('/api/test').flush('error', { status: 503, statusText: 'Service Unavailable' });
      tick(0);

      expect(errorCaught).toBeTrue();
    }));

    it('should retry on network error (status 0)', fakeAsync(() => {
      let errorCaught = false;

      http.get('/api/test').subscribe({ error: () => (errorCaught = true) });

      httpMock.expectOne('/api/test').error(new ProgressEvent('error'));
      tick(1000);

      httpMock.expectOne('/api/test').error(new ProgressEvent('error'));
      tick(2000);

      httpMock.expectOne('/api/test').error(new ProgressEvent('error'));
      tick(0);

      expect(errorCaught).toBeTrue();
    }));

    it('should log a warning for each retry attempt', fakeAsync(() => {
      http.get('/api/test').subscribe({ error: () => { /* empty */ } });

      httpMock.expectOne('/api/test').flush('error', { status: 502, statusText: 'Bad Gateway' });
      tick(1000);

      httpMock.expectOne('/api/test').flush('error', { status: 502, statusText: 'Bad Gateway' });
      tick(2000);

      httpMock.expectOne('/api/test').flush('error', { status: 502, statusText: 'Bad Gateway' });
      tick(0);

      expect(loggerSpy.warn).toHaveBeenCalledTimes(2);
      expect(loggerSpy.warn).toHaveBeenCalledWith(
        jasmine.stringContaining('Retry 1/2'),
        jasmine.any(Object)
      );
      expect(loggerSpy.warn).toHaveBeenCalledWith(
        jasmine.stringContaining('Retry 2/2'),
        jasmine.any(Object)
      );
    }));

    it('should use linear backoff delay between retries', fakeAsync(() => {
      let retryCount = 0;
      http.get('/api/test').subscribe({ error: () => { /* empty */ } });

      httpMock.expectOne('/api/test').flush('error', { status: 500, statusText: 'Error' });

      // After 999ms retry should NOT have fired yet
      tick(999);
      expect(httpMock.match('/api/test').length).toBe(0);

      // At 1000ms first retry fires
      tick(1);
      httpMock.expectOne('/api/test').flush('error', { status: 500, statusText: 'Error' });
      retryCount++;

      // After another 1999ms second retry should NOT have fired yet
      tick(1999);
      expect(httpMock.match('/api/test').length).toBe(0);

      // At 2000ms second retry fires
      tick(1);
      httpMock.expectOne('/api/test').flush('error', { status: 500, statusText: 'Error' });
      retryCount++;

      tick(0);
      expect(retryCount).toBe(2);
    }));
  });
});
