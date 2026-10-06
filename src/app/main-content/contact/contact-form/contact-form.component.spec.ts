import type { MockedObject } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslationService } from '../../../shared/services/translation.service';
import { ReactiveFormsModule } from '@angular/forms';
import { ContactFormComponent } from './contact-form.component';
import { HttpErrorResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { of } from 'rxjs';
import { HTTP_CONFIG } from '../../../shared/constants/app.constants';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { LoggerService } from '../../../shared/services/logger.service';

describe('ContactFormComponent', () => {
  let component: ContactFormComponent;
  let fixture: ComponentFixture<ContactFormComponent>;
  let httpMock: HttpTestingController;
  let translateService: TranslationService;

  beforeEach(async () => {
    sessionStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ContactFormComponent, ReactiveFormsModule],
      providers: [
        { provide: ActivatedRoute, useValue: { fragment: of(null) } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactFormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    translateService = TestBed.inject(TranslationService);
    vi.spyOn(TestBed.inject(LoggerService), 'error').mockImplementation(() => undefined);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty values', () => {
      expect(component.form.value).toEqual({
        name: '',
        email: '',
        message: '',
        privacyPolicy: false,
        website: '',
      });
      expect(component.isSubmitting()).toBe(false);
      expect(component.submissionStatus()).toBeNull();
    });

    it('should have correct endpoint configuration', () => {
      expect(environment.emailWorkerUrl).toContain('workers.dev');
    });
  });

  describe('Form Validation', () => {
    describe('Name', () => {
      it('should be invalid when empty', () => {
        component.form.get('name')!.markAsTouched();
        expect(component.isInvalid('name')).toBe(true);
      });

      it('should be invalid with less than 3 characters', () => {
        component.form.get('name')!.setValue('Jo');
        component.form.get('name')!.markAsTouched();
        expect(component.isInvalid('name')).toBe(true);
      });

      it('should be invalid with only whitespace', () => {
        component.form.get('name')!.setValue('  ');
        component.form.get('name')!.markAsTouched();
        expect(component.isInvalid('name')).toBe(true);
      });

      it('should be valid with 3 or more non-whitespace characters', () => {
        component.form.get('name')!.setValue('John');
        component.form.get('name')!.markAsTouched();
        expect(component.isInvalid('name')).toBe(false);
      });
    });

    describe('Email', () => {
      it('should be invalid when empty', () => {
        component.form.get('email')!.markAsTouched();
        expect(component.isInvalid('email')).toBe(true);
      });

      it('should be invalid with incorrect format', () => {
        ['test', 'test@', '@test.com', 'test@test', 'test.com'].forEach(email => {
          component.form.get('email')!.setValue(email);
          component.form.get('email')!.markAsTouched();
          expect(component.isInvalid('email'), `email: ${email}`).toBe(true);
        });
      });

      it('should be valid with correct format', () => {
        ['test@example.com', 'user.name@example.co.uk', 'test+tag@domain.com'].forEach(email => {
          component.form.get('email')!.setValue(email);
          component.form.get('email')!.markAsTouched();
          expect(component.isInvalid('email'), `email: ${email}`).toBe(false);
        });
      });
    });

    describe('Message', () => {
      it('should be invalid when empty', () => {
        component.form.get('message')!.markAsTouched();
        expect(component.isInvalid('message')).toBe(true);
      });

      it('should be invalid with less than 10 characters', () => {
        component.form.get('message')!.setValue('Short');
        component.form.get('message')!.markAsTouched();
        expect(component.isInvalid('message')).toBe(true);
      });

      it('should be valid with 10 or more characters', () => {
        component.form.get('message')!.setValue('This is a valid message');
        component.form.get('message')!.markAsTouched();
        expect(component.isInvalid('message')).toBe(false);
      });
    });

    describe('Privacy Policy', () => {
      it('should be invalid when unchecked', () => {
        component.form.get('privacyPolicy')!.markAsTouched();
        expect(component.isInvalid('privacyPolicy')).toBe(true);
      });

      it('should be valid when checked', () => {
        component.form.get('privacyPolicy')!.setValue(true);
        component.form.get('privacyPolicy')!.markAsTouched();
        expect(component.isInvalid('privacyPolicy')).toBe(false);
      });
    });

    it('should mark all fields as touched when submitting invalid form', () => {
      vi.spyOn(component.form, 'markAllAsTouched').mockImplementation(() => undefined);
      component.onSubmit();
      expect(component.form.markAllAsTouched).toHaveBeenCalled();
    });

    it('should return early when already submitting', () => {
      component.isSubmitting.set(true);
      component.onSubmit();
      httpMock.expectNone(environment.emailWorkerUrl);
      expect(component.isSubmitting()).toBe(true);
    });
  });

  describe('Form Submission', () => {
    function fillValidForm(): void {
      component.form.setValue({
        name: 'John Doe',
        email: 'test@example.com',
        message: 'Hello World Message',
        privacyPolicy: true,
        website: '',
      });
    }

    it('should not submit if form is invalid', () => {
      component.onSubmit();
      expect(component.isSubmitting()).toBe(false);
      httpMock.expectNone(environment.emailWorkerUrl);
    });

    it('should submit form with sanitized data', async () => {
      vi.useFakeTimers();
      // email without surrounding spaces (pattern validator does not trim),
      // but uppercase to verify lowercase normalization in sanitizeContactData
      component.form.setValue({
        name: '  John Doe  ',
        email: 'TEST@EXAMPLE.COM',
        message: '  Hello World Message  ',
        privacyPolicy: true,
        website: '',
      });

      component.onSubmit();
      await vi.advanceTimersByTimeAsync(0);

      const req = httpMock.expectOne(environment.emailWorkerUrl);
      expect(req.request.method).toBe('POST');

      const body = JSON.parse(req.request.body);
      expect(body.name).toBe('John Doe');
      expect(body.email).toBe('test@example.com');
      expect(body.message).toBe('Hello World Message');
      expect(body.privacyPolicy).toBe(true);

      req.flush({ success: true });
      await vi.runAllTimersAsync();
    });

    it('should set isSubmitting to true during submission', async () => {
      vi.useFakeTimers();
      fillValidForm();
      component.onSubmit();

      expect(component.isSubmitting()).toBe(true);

      const req = httpMock.expectOne(environment.emailWorkerUrl);
      req.flush({ success: true });
      await vi.runAllTimersAsync();

      expect(component.isSubmitting()).toBe(false);
    });

    it('should handle successful submission', async () => {
      vi.useFakeTimers();
      fillValidForm();
      component.onSubmit();
      await vi.advanceTimersByTimeAsync(0);

      const req = httpMock.expectOne(environment.emailWorkerUrl);
      req.flush({ success: true });
      await vi.runAllTimersAsync();

      expect(component.submissionStatus()).toBe('success');
      expect(component.form.pristine).toBe(true);
    });

  });

  describe('Error Handling', () => {
    function fillValidForm(): void {
      component.form.setValue({
        name: 'John Doe',
        email: 'test@example.com',
        message: 'Hello World Message',
        privacyPolicy: true,
        website: '',
      });
    }

    it('should handle HTTP error during submission', async () => {
      vi.useFakeTimers();
      fillValidForm();
      component.onSubmit();
      await vi.advanceTimersByTimeAsync(0);

      const req = httpMock.expectOne(environment.emailWorkerUrl);
      req.error(new ErrorEvent('HttpError', { message: 'Server Error' }), {
        status: 500,
        statusText: 'Server Error',
      });
      await vi.advanceTimersByTimeAsync(1000);
      await vi.runAllTimersAsync();

      expect(component.submissionStatus()).toBe('error');
      expect(component.isSubmitting()).toBe(false);
    });

    it('should handle server error (status >= 500)', async () => {
      vi.useFakeTimers();
      component['handleError']({ status: 500 });
      await vi.runAllTimersAsync();
      expect(component.submissionStatus()).toBe('error');
      expect(component.errorMessage()).toBe('contact.form.errors.server');
    });

    it('should handle client error (status >= 400)', async () => {
      vi.useFakeTimers();
      component['handleError']({ status: 400 });
      await vi.runAllTimersAsync();
      expect(component.submissionStatus()).toBe('error');
      expect(component.errorMessage()).toBe('contact.form.errors.client');
    });

    it('should handle rate-limit error (status 429)', async () => {
      vi.useFakeTimers();
      component['handleError']({ status: 429 });
      await vi.runAllTimersAsync();
      expect(component.submissionStatus()).toBe('error');
      expect(component.errorMessage()).toBe('contact.form.errors.rateLimit');
    });

    it('should handle timeout error', async () => {
      vi.useFakeTimers();
      component['handleError']({ name: 'TimeoutError' });
      await vi.runAllTimersAsync();
      expect(component.submissionStatus()).toBe('error');
      expect(component.errorMessage()).toBe('contact.form.errors.timeout');
    });

    it('should handle generic error with message', async () => {
      vi.useFakeTimers();
      component['handleError']({ message: 'Custom error message' });
      await vi.runAllTimersAsync();
      expect(component.submissionStatus()).toBe('error');
      expect(component.errorMessage()).toBe('contact.form.errors.generic');
    });

    it('should handle generic error without message', async () => {
      vi.useFakeTimers();
      component['handleError']({});
      await vi.runAllTimersAsync();
      expect(component.submissionStatus()).toBe('error');
      expect(component.errorMessage()).toBe('contact.form.errors.generic');
    });

    it('should reset form on error', async () => {
      vi.useFakeTimers();
      fillValidForm();
      component.onSubmit();
      await vi.advanceTimersByTimeAsync(0);

      const req = httpMock.expectOne(environment.emailWorkerUrl);
      req.error(new ErrorEvent('HttpError', { message: 'Server Error' }), {
        status: 500,
        statusText: 'Server Error',
      });
      await vi.advanceTimersByTimeAsync(1000);
      await vi.runAllTimersAsync();

      expect(component.form.pristine).toBe(true);
    });
  });

  describe('Popup Management', () => {
    it('should close popup and reset status', () => {
      component.submissionStatus.set('success');
      component.errorMessage.set('Some error');

      component.closePopup();

      expect(component.submissionStatus()).toBeNull();
      expect(component.errorMessage()).toBe('');
    });

    it('should focus the close button when it exists in the DOM', async () => {
      vi.useFakeTimers();
      component.form.setValue({
        name: 'Jane Doe', email: 'jane@example.com', message: 'Hello World Message', privacyPolicy: true, website: '',
      });
      component.onSubmit();
      const req = httpMock.expectOne(environment.emailWorkerUrl);
      req.flush({ success: true });
      await vi.runAllTimersAsync();

      const closeButton = fixture.nativeElement.querySelector('.popup-footer button');
      expect(closeButton).toBeTruthy();
      expect(document.activeElement).toBe(closeButton);
    });
  });

  describe('Data Sanitization', () => {
    it('should sanitize contact data correctly', () => {
      component.form.setValue({
        name: '  John Doe  ',
        email: '  TEST@EXAMPLE.COM  ',
        message: '  Hello World Message  ',
        privacyPolicy: true,
        website: '',
      });

      const sanitized = component['sanitizeContactData']();

      expect(sanitized.name).toBe('John Doe');
      expect(sanitized.email).toBe('test@example.com');
      expect(sanitized.message).toBe('Hello World Message');
      expect(sanitized.privacyPolicy).toBe(true);
    });
  });

  describe('Form Persistence', () => {
    const STORAGE_KEY = 'contact-form-data';

    it('should restore saved form data from sessionStorage on init', async () => {
      const saved = { name: 'Jane', email: 'jane@example.com', message: 'Test message here', privacyPolicy: true };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

      const newFixture = TestBed.createComponent(ContactFormComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();
      await newFixture.whenStable();

      expect(newComponent.form.get('name')!.value).toBe('Jane');
      expect(newComponent.form.get('email')!.value).toBe('jane@example.com');
    });

    it('should save form data to sessionStorage when form changes', () => {
      component.form.get('name')!.setValue('SaveTest');

      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY)!);
      expect(saved.name).toBe('SaveTest');
    });

    it('should call sessionStorage.removeItem when clearing form data', async () => {
      vi.useFakeTimers();
      vi.spyOn(sessionStorage, 'removeItem').mockImplementation(() => undefined);
      component.form.setValue({
        name: 'Jane Doe', email: 'jane@example.com', message: 'Hello World Message', privacyPolicy: true, website: '',
      });

      component.onSubmit();
      const req = httpMock.expectOne(environment.emailWorkerUrl);
      req.flush({ success: true });
      await vi.runAllTimersAsync();

      expect(sessionStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });
  });

  describe('HTTP Configuration', () => {
    it('should have correct HTTP timeout', () => {
      expect(HTTP_CONFIG.TIMEOUT).toBe(10000);
    });

    it('should have correct retry attempts', () => {
      expect(HTTP_CONFIG.RETRY_ATTEMPTS).toBe(2);
    });

    it('should have correct content-type header', () => {
      expect(component['postConfig'].options.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('saveScrollPosition', () => {
    it('should delegate to scrollService.saveScrollPosition', () => {
      const scrollService = component['scrollService'];
      vi.spyOn(scrollService, 'saveScrollPosition').mockImplementation(() => undefined);

      component.saveScrollPosition();

      expect(scrollService.saveScrollPosition).toHaveBeenCalled();
    });
  });

  describe('SessionStorage error handling', () => {
    it('should log error when sessionStorage.setItem throws', () => {
      vi.spyOn(sessionStorage, 'setItem').mockImplementation(() => {
        throw new Error('quota exceeded');
      });
      const loggerSpy = TestBed.inject(LoggerService) as MockedObject<LoggerService>;

      component.form.get('name')!.setValue('trigger save');

      expect(loggerSpy.error).toHaveBeenCalledWith('Failed to save form data to sessionStorage', expect.any(Error));
    });

    it('should log error when sessionStorage.getItem throws', async () => {
      vi.spyOn(sessionStorage, 'getItem').mockImplementation(() => {
        throw new Error('access denied');
      });
      const loggerSpy = TestBed.inject(LoggerService) as MockedObject<LoggerService>;

      const newFixture = TestBed.createComponent((await import('./contact-form.component')).ContactFormComponent);
      newFixture.detectChanges();
      await newFixture.whenStable();

      expect(loggerSpy.error).toHaveBeenCalledWith('Failed to load form data from sessionStorage', expect.any(Error));
    });

    it('should log error when sessionStorage.removeItem throws', async () => {
      vi.useFakeTimers();
      vi.spyOn(sessionStorage, 'removeItem').mockImplementation(() => {
        throw new Error('access denied');
      });
      const loggerSpy = TestBed.inject(LoggerService) as MockedObject<LoggerService>;
      component.form.setValue({
        name: 'Jane Doe', email: 'jane@example.com', message: 'Hello World Message', privacyPolicy: true, website: '',
      });

      component.onSubmit();
      const req = httpMock.expectOne(environment.emailWorkerUrl);
      req.flush({ success: true });
      await vi.runAllTimersAsync();

      expect(loggerSpy.error).toHaveBeenCalledWith('Failed to clear form data from sessionStorage', expect.any(Error));
    });
  });

  describe('Error Handling - additional branches', () => {
    it('should handle network error (status 0) via HttpErrorResponse', async () => {
      vi.useFakeTimers();
      component['handleError'](new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' }));
      await vi.runAllTimersAsync();
      expect(component.errorMessage()).toBe('contact.form.errors.network');
    });

    it('should handle server error via HttpErrorResponse instanceof check', async () => {
      vi.useFakeTimers();
      component['handleError'](new HttpErrorResponse({ status: 500, statusText: 'Server Error' }));
      await vi.runAllTimersAsync();
      expect(component.errorMessage()).toBe('contact.form.errors.server');
    });

    it('should handle client error via HttpErrorResponse instanceof check', async () => {
      vi.useFakeTimers();
      component['handleError'](new HttpErrorResponse({ status: 400, statusText: 'Bad Request' }));
      await vi.runAllTimersAsync();
      expect(component.errorMessage()).toBe('contact.form.errors.client');
    });

    it('should fall back to UnknownError for error with no name and no constructor name', async () => {
      vi.useFakeTimers();
      const noNameError = Object.create(null) as Record<string, unknown>;
      noNameError['status'] = undefined;
      component['handleError'](noNameError);
      await vi.runAllTimersAsync();
      expect(component.submissionStatus()).toBe('error');
    });
  });
});
