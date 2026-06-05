import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
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
    spyOn(TestBed.inject(LoggerService), 'error');
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
        expect(component.isInvalid('name')).toBeTrue();
      });

      it('should be invalid with less than 3 characters', () => {
        component.form.get('name')!.setValue('Jo');
        component.form.get('name')!.markAsTouched();
        expect(component.isInvalid('name')).toBeTrue();
      });

      it('should be invalid with only whitespace', () => {
        component.form.get('name')!.setValue('  ');
        component.form.get('name')!.markAsTouched();
        expect(component.isInvalid('name')).toBeTrue();
      });

      it('should be valid with 3 or more non-whitespace characters', () => {
        component.form.get('name')!.setValue('John');
        component.form.get('name')!.markAsTouched();
        expect(component.isInvalid('name')).toBeFalse();
      });
    });

    describe('Email', () => {
      it('should be invalid when empty', () => {
        component.form.get('email')!.markAsTouched();
        expect(component.isInvalid('email')).toBeTrue();
      });

      it('should be invalid with incorrect format', () => {
        ['test', 'test@', '@test.com', 'test@test', 'test.com'].forEach(email => {
          component.form.get('email')!.setValue(email);
          component.form.get('email')!.markAsTouched();
          expect(component.isInvalid('email')).withContext(`email: ${email}`).toBeTrue();
        });
      });

      it('should be valid with correct format', () => {
        ['test@example.com', 'user.name@example.co.uk', 'test+tag@domain.com'].forEach(email => {
          component.form.get('email')!.setValue(email);
          component.form.get('email')!.markAsTouched();
          expect(component.isInvalid('email')).withContext(`email: ${email}`).toBeFalse();
        });
      });
    });

    describe('Message', () => {
      it('should be invalid when empty', () => {
        component.form.get('message')!.markAsTouched();
        expect(component.isInvalid('message')).toBeTrue();
      });

      it('should be invalid with less than 10 characters', () => {
        component.form.get('message')!.setValue('Short');
        component.form.get('message')!.markAsTouched();
        expect(component.isInvalid('message')).toBeTrue();
      });

      it('should be valid with 10 or more characters', () => {
        component.form.get('message')!.setValue('This is a valid message');
        component.form.get('message')!.markAsTouched();
        expect(component.isInvalid('message')).toBeFalse();
      });
    });

    describe('Privacy Policy', () => {
      it('should be invalid when unchecked', () => {
        component.form.get('privacyPolicy')!.markAsTouched();
        expect(component.isInvalid('privacyPolicy')).toBeTrue();
      });

      it('should be valid when checked', () => {
        component.form.get('privacyPolicy')!.setValue(true);
        component.form.get('privacyPolicy')!.markAsTouched();
        expect(component.isInvalid('privacyPolicy')).toBeFalse();
      });
    });

    it('should mark all fields as touched when submitting invalid form', () => {
      spyOn(component.form, 'markAllAsTouched');
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
      });
    }

    it('should not submit if form is invalid', () => {
      component.onSubmit();
      expect(component.isSubmitting()).toBe(false);
      httpMock.expectNone(environment.emailWorkerUrl);
    });

    it('should submit form with sanitized data', fakeAsync(() => {
      // email without surrounding spaces (pattern validator does not trim),
      // but uppercase to verify lowercase normalization in sanitizeContactData
      component.form.setValue({
        name: '  John Doe  ',
        email: 'TEST@EXAMPLE.COM',
        message: '  Hello World Message  ',
        privacyPolicy: true,
      });

      component.onSubmit();
      tick();

      const req = httpMock.expectOne(environment.emailWorkerUrl);
      expect(req.request.method).toBe('POST');

      const body = JSON.parse(req.request.body);
      expect(body.name).toBe('John Doe');
      expect(body.email).toBe('test@example.com');
      expect(body.message).toBe('Hello World Message');
      expect(body.privacyPolicy).toBe(true);

      req.flush({ success: true });
      flush();
    }));

    it('should set isSubmitting to true during submission', fakeAsync(() => {
      fillValidForm();
      component.onSubmit();

      expect(component.isSubmitting()).toBe(true);

      const req = httpMock.expectOne(environment.emailWorkerUrl);
      req.flush({ success: true });
      flush();

      expect(component.isSubmitting()).toBe(false);
    }));

    it('should handle successful submission', fakeAsync(() => {
      fillValidForm();
      component.onSubmit();
      tick();

      const req = httpMock.expectOne(environment.emailWorkerUrl);
      req.flush({ success: true });
      flush();

      expect(component.submissionStatus()).toBe('success');
      expect(component.form.pristine).toBeTrue();
    }));

  });

  describe('Error Handling', () => {
    function fillValidForm(): void {
      component.form.setValue({
        name: 'John Doe',
        email: 'test@example.com',
        message: 'Hello World Message',
        privacyPolicy: true,
      });
    }

    it('should handle HTTP error during submission', fakeAsync(() => {
      fillValidForm();
      component.onSubmit();
      tick();

      const req = httpMock.expectOne(environment.emailWorkerUrl);
      req.error(new ErrorEvent('HttpError', { message: 'Server Error' }), {
        status: 500,
        statusText: 'Server Error',
      });
      tick(1000);
      flush();

      expect(component.submissionStatus()).toBe('error');
      expect(component.isSubmitting()).toBe(false);
    }));

    it('should handle server error (status >= 500)', fakeAsync(() => {
      component['handleError']({ status: 500 });
      flush();
      expect(component.submissionStatus()).toBe('error');
      expect(component.errorMessage()).toBe('contact.form.errors.server');
    }));

    it('should handle client error (status >= 400)', fakeAsync(() => {
      component['handleError']({ status: 400 });
      flush();
      expect(component.submissionStatus()).toBe('error');
      expect(component.errorMessage()).toBe('contact.form.errors.client');
    }));

    it('should handle timeout error', fakeAsync(() => {
      component['handleError']({ name: 'TimeoutError' });
      flush();
      expect(component.submissionStatus()).toBe('error');
      expect(component.errorMessage()).toBe('contact.form.errors.timeout');
    }));

    it('should handle generic error with message', fakeAsync(() => {
      component['handleError']({ message: 'Custom error message' });
      flush();
      expect(component.submissionStatus()).toBe('error');
      expect(component.errorMessage()).toBe('contact.form.errors.generic');
    }));

    it('should handle generic error without message', fakeAsync(() => {
      component['handleError']({});
      flush();
      expect(component.submissionStatus()).toBe('error');
      expect(component.errorMessage()).toBe('contact.form.errors.generic');
    }));

    it('should reset form on error', fakeAsync(() => {
      fillValidForm();
      component.onSubmit();
      tick();

      const req = httpMock.expectOne(environment.emailWorkerUrl);
      req.error(new ErrorEvent('HttpError', { message: 'Server Error' }), {
        status: 500,
        statusText: 'Server Error',
      });
      tick(1000);
      flush();

      expect(component.form.pristine).toBeTrue();
    }));
  });

  describe('Popup Management', () => {
    it('should close popup and reset status', () => {
      component.submissionStatus.set('success');
      component.errorMessage.set('Some error');

      component.closePopup();

      expect(component.submissionStatus()).toBeNull();
      expect(component.errorMessage()).toBe('');
    });

    it('should focus the close button when it exists in the DOM', fakeAsync(() => {
      const footer = document.createElement('div');
      footer.classList.add('popup-footer');
      const button = document.createElement('button');
      footer.appendChild(button);
      document.body.appendChild(footer);
      spyOn(button, 'focus');

      component.form.setValue({ name: 'Jane Doe', email: 'jane@example.com', message: 'Hello World Message', privacyPolicy: true });
      component.onSubmit();
      const req = httpMock.expectOne(environment.emailWorkerUrl);
      req.flush({ success: true });
      flush();

      expect(button.focus).toHaveBeenCalled();
      document.body.removeChild(footer);
    }));
  });

  describe('Data Sanitization', () => {
    it('should sanitize contact data correctly', () => {
      component.form.setValue({
        name: '  John Doe  ',
        email: '  TEST@EXAMPLE.COM  ',
        message: '  Hello World Message  ',
        privacyPolicy: true,
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

    it('should call sessionStorage.removeItem when clearing form data', fakeAsync(() => {
      spyOn(sessionStorage, 'removeItem');
      component.form.setValue({ name: 'Jane Doe', email: 'jane@example.com', message: 'Hello World Message', privacyPolicy: true });

      component.onSubmit();
      const req = httpMock.expectOne(environment.emailWorkerUrl);
      req.flush({ success: true });
      flush();

      expect(sessionStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    }));
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
      spyOn(scrollService, 'saveScrollPosition');

      component.saveScrollPosition();

      expect(scrollService.saveScrollPosition).toHaveBeenCalled();
    });
  });

  describe('SessionStorage error handling', () => {
    it('should log error when sessionStorage.setItem throws', () => {
      spyOn(sessionStorage, 'setItem').and.throwError('quota exceeded');
      const loggerSpy = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;

      component.form.get('name')!.setValue('trigger save');

      expect(loggerSpy.error).toHaveBeenCalledWith(
        'Failed to save form data to sessionStorage',
        jasmine.any(Error)
      );
    });

    it('should log error when sessionStorage.getItem throws', async () => {
      spyOn(sessionStorage, 'getItem').and.throwError('access denied');
      const loggerSpy = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;

      const newFixture = TestBed.createComponent(
        (await import('./contact-form.component')).ContactFormComponent
      );
      newFixture.detectChanges();
      await newFixture.whenStable();

      expect(loggerSpy.error).toHaveBeenCalledWith(
        'Failed to load form data from sessionStorage',
        jasmine.any(Error)
      );
    });

    it('should log error when sessionStorage.removeItem throws', fakeAsync(() => {
      spyOn(sessionStorage, 'removeItem').and.throwError('access denied');
      const loggerSpy = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
      component.form.setValue({ name: 'Jane Doe', email: 'jane@example.com', message: 'Hello World Message', privacyPolicy: true });

      component.onSubmit();
      const req = httpMock.expectOne(environment.emailWorkerUrl);
      req.flush({ success: true });
      flush();

      expect(loggerSpy.error).toHaveBeenCalledWith(
        'Failed to clear form data from sessionStorage',
        jasmine.any(Error)
      );
    }));
  });

  describe('Error Handling - additional branches', () => {
    it('should handle network error (status 0) via HttpErrorResponse', fakeAsync(() => {
      component['handleError'](new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' }));
      flush();
      expect(component.errorMessage()).toBe('contact.form.errors.network');
    }));

    it('should handle server error via HttpErrorResponse instanceof check', fakeAsync(() => {
      component['handleError'](new HttpErrorResponse({ status: 500, statusText: 'Server Error' }));
      flush();
      expect(component.errorMessage()).toBe('contact.form.errors.server');
    }));

    it('should handle client error via HttpErrorResponse instanceof check', fakeAsync(() => {
      component['handleError'](new HttpErrorResponse({ status: 400, statusText: 'Bad Request' }));
      flush();
      expect(component.errorMessage()).toBe('contact.form.errors.client');
    }));

    it('should fall back to UnknownError for error with no name and no constructor name', fakeAsync(() => {
      const noNameError = Object.create(null) as Record<string, unknown>;
      noNameError['status'] = undefined;
      component['handleError'](noNameError);
      flush();
      expect(component.submissionStatus()).toBe('error');
    }));
  });
});
