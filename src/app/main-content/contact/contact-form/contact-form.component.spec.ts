import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ContactFormComponent } from './contact-form.component';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { HTTP_CONFIG } from '../../../shared/constants/app.constants';

describe('ContactFormComponent', () => {
  let component: ContactFormComponent;
  let fixture: ComponentFixture<ContactFormComponent>;
  let httpMock: HttpTestingController;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ContactFormComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        FormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactFormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.contactData).toEqual({
        name: '',
        email: '',
        message: '',
        privacypolicy: false
      });
      expect(component.isSubmitting).toBe(false);
      expect(component.submissionStatus).toBeNull();
      expect(component.invalidFields).toEqual([]);
    });

    it('should have correct endpoint configuration', () => {
      expect(component.post.endPoint).toBe('https://mihaela-melania-aghirculesei.de/sendMail.php');
    });
  });

  describe('Form Validation', () => {
    describe('Name Validation', () => {
      it('should validate empty name as invalid', () => {
        component.contactData.name = '';
        component.validateForm('name');
        expect(component.invalidFields).toContain('name');
      });

      it('should validate name with less than 3 characters as invalid', () => {
        component.contactData.name = 'Jo';
        component.validateForm('name');
        expect(component.invalidFields).toContain('name');
      });

      it('should validate name with 3 or more characters as valid', () => {
        component.contactData.name = 'John';
        component.validateForm('name');
        expect(component.invalidFields).not.toContain('name');
      });

      it('should trim whitespace before validation', () => {
        component.contactData.name = '   ';
        component.validateForm('name');
        expect(component.invalidFields).toContain('name');
      });
    });

    describe('Email Validation', () => {
      it('should validate empty email as invalid', () => {
        component.contactData.email = '';
        component.validateForm('email');
        expect(component.invalidFields).toContain('email');
      });

      it('should validate invalid email format as invalid', () => {
        const invalidEmails = ['test', 'test@', '@test.com', 'test@test', 'test.com'];
        invalidEmails.forEach(email => {
          component.invalidFields = [];
          component.contactData.email = email;
          component.validateForm('email');
          expect(component.invalidFields).toContain('email');
        });
      });

      it('should validate correct email format as valid', () => {
        const validEmails = [
          'test@example.com',
          'user.name@example.co.uk',
          'test+tag@domain.com'
        ];
        validEmails.forEach(email => {
          component.invalidFields = [];
          component.contactData.email = email;
          component.validateForm('email');
          expect(component.invalidFields).not.toContain('email');
        });
      });
    });

    describe('Message Validation', () => {
      it('should validate empty message as invalid', () => {
        component.contactData.message = '';
        component.validateForm('message');
        expect(component.invalidFields).toContain('message');
      });

      it('should validate message with less than 10 characters as invalid', () => {
        component.contactData.message = 'Short';
        component.validateForm('message');
        expect(component.invalidFields).toContain('message');
      });

      it('should validate message with 10 or more characters as valid', () => {
        component.contactData.message = 'This is a valid message';
        component.validateForm('message');
        expect(component.invalidFields).not.toContain('message');
      });
    });

    describe('Checkbox Validation', () => {
      it('should validate unchecked privacy policy as invalid', () => {
        component.contactData.privacypolicy = false;
        component.validateForm('checkbox');
        expect(component.invalidFields).toContain('checkbox');
      });

      it('should validate checked privacy policy as valid', () => {
        component.contactData.privacypolicy = true;
        component.validateForm('checkbox');
        expect(component.invalidFields).not.toContain('checkbox');
      });
    });

    it('should remove field from invalidFields when revalidating as valid', () => {
      component.invalidFields = ['name'];
      component.contactData.name = 'Valid Name';
      component.validateForm('name');
      expect(component.invalidFields).not.toContain('name');
    });
  });

  describe('Form Submission', () => {
    let mockForm: NgForm;

    beforeEach(() => {
      mockForm = {
        submitted: true,
        form: { valid: true },
        resetForm: jasmine.createSpy('resetForm')
      } as any;
    });

    it('should not submit if form is invalid', () => {
      const invalidForm = {
        submitted: true,
        form: { valid: false },
        resetForm: jasmine.createSpy('resetForm')
      } as any;
      spyOn(component.http, 'post');

      component.onSubmit(invalidForm);

      expect(component.http.post).not.toHaveBeenCalled();
    });

    it('should not submit if form is not submitted', () => {
      const notSubmittedForm = {
        submitted: false,
        form: { valid: true },
        resetForm: jasmine.createSpy('resetForm')
      } as any;
      spyOn(component.http, 'post');

      component.onSubmit(notSubmittedForm);

      expect(component.http.post).not.toHaveBeenCalled();
    });

    it('should submit form with sanitized data', fakeAsync(() => {
      component.contactData = {
        name: '  John Doe  ',
        email: '  TEST@EXAMPLE.COM  ',
        message: '  Hello World  ',
        privacypolicy: true
      };

      component.onSubmit(mockForm);
      tick();

      const req = httpMock.expectOne(component.post.endPoint);
      expect(req.request.method).toBe('POST');

      const body = JSON.parse(req.request.body);
      expect(body.name).toBe('John Doe');
      expect(body.email).toBe('test@example.com');
      expect(body.message).toBe('Hello World');
      expect(body.privacypolicy).toBe(true);

      req.flush({ success: true });
      flush();
    }));

    it('should set isSubmitting to true during submission', fakeAsync(() => {
      component.onSubmit(mockForm);

      expect(component.isSubmitting).toBe(true);

      const req = httpMock.expectOne(component.post.endPoint);
      req.flush({ success: true });
      flush();

      expect(component.isSubmitting).toBe(false);
    }));

    it('should handle successful submission', fakeAsync(() => {
      component.onSubmit(mockForm);
      tick();

      const req = httpMock.expectOne(component.post.endPoint);
      req.flush({ success: true });
      flush();

      expect(component.submissionStatus).toBe('success');
      expect(mockForm.resetForm).toHaveBeenCalled();
      expect(component.checkboxWasCheckedBefore).toBe(false);
      expect(component.invalidFields).toEqual([]);
    }));

    it('should handle mailTest mode correctly', () => {
      component.mailTest = true;

      component.onSubmit(mockForm);

      expect(component.submissionStatus).toBe('success');
      expect(mockForm.resetForm).toHaveBeenCalled();
      httpMock.expectNone(component.post.endPoint);
    });
  });

  describe('Error Handling', () => {
    let mockForm: NgForm;

    beforeEach(() => {
      mockForm = {
        submitted: true,
        form: { valid: true },
        resetForm: jasmine.createSpy('resetForm')
      } as any;
    });

    it('should handle HTTP error during submission', fakeAsync(() => {
      component.onSubmit(mockForm);

      // Handle original request + 2 retries
      for (let i = 0; i < 3; i++) {
        const req = httpMock.expectOne(component.post.endPoint);
        req.flush(null, { status: 500, statusText: 'Server Error' });
      }

      flush();

      expect(component.submissionStatus).toBe('error');
      expect(component.isSubmitting).toBe(false);
    }));

    it('should handle network error (status 0)', fakeAsync(() => {
      const error = { name: 'NetworkError', status: 0 };
      component['handleError'](error);
      flush();

      expect(component.submissionStatus).toBe('error');
      expect(component.errorMessage).toBe('Network error. Please check your connection.');
    }));

    it('should handle server error (status >= 500)', fakeAsync(() => {
      const error = { status: 500 };
      component['handleError'](error);
      flush();

      expect(component.submissionStatus).toBe('error');
      expect(component.errorMessage).toBe('Server error. Please try again later.');
    }));

    it('should handle client error (status >= 400)', fakeAsync(() => {
      const error = { status: 400 };
      component['handleError'](error);
      flush();

      expect(component.submissionStatus).toBe('error');
      expect(component.errorMessage).toBe('Bad request. Please check your input.');
    }));

    it('should handle timeout error specifically', fakeAsync(() => {
      const error = { name: 'TimeoutError' };
      component['handleError'](error);
      flush();

      expect(component.submissionStatus).toBe('error');
      expect(component.errorMessage).toBe('Request timeout. Please try again.');
    }));

    it('should handle generic error with message', fakeAsync(() => {
      const error = { message: 'Custom error message' };
      component['handleError'](error);
      flush();

      expect(component.submissionStatus).toBe('error');
      expect(component.errorMessage).toBe('Custom error message');
    }));

    it('should handle generic error without message', fakeAsync(() => {
      const error = {};
      component['handleError'](error);
      flush();

      expect(component.submissionStatus).toBe('error');
      expect(component.errorMessage).toBe('An error occurred while sending your message.');
    }));

    it('should reset form and checkbox on error', fakeAsync(() => {
      component.checkboxWasCheckedBefore = true;
      component.onSubmit(mockForm);

      // Handle original request + 2 retries
      for (let i = 0; i < 3; i++) {
        const req = httpMock.expectOne(component.post.endPoint);
        req.flush(null, { status: 500, statusText: 'Server Error' });
      }

      flush();

      expect(mockForm.resetForm).toHaveBeenCalled();
      expect(component.checkboxWasCheckedBefore).toBe(false);
    }));
  });

  describe('Popup Management', () => {
    it('should close popup and reset status', () => {
      component.submissionStatus = 'success';
      component.errorMessage = 'Some error';

      component.closePopup();

      expect(component.submissionStatus).toBeNull();
      expect(component.errorMessage).toBe('');
    });
  });

  describe('Checkbox Management', () => {
    it('should set checkboxWasCheckedBefore when checkbox is checked', () => {
      component.contactData.privacypolicy = true;
      component.checkboxChanged();

      expect(component.checkboxWasCheckedBefore).toBe(true);
    });

    it('should not change checkboxWasCheckedBefore when checkbox is unchecked', () => {
      component.checkboxWasCheckedBefore = false;
      component.contactData.privacypolicy = false;
      component.checkboxChanged();

      expect(component.checkboxWasCheckedBefore).toBe(false);
    });
  });

  describe('Privacy Policy Navigation', () => {
    it('should open German privacy policy when language is German', () => {
      const mockWindow = { closed: false } as Window;
      spyOn(window, 'open').and.returnValue(mockWindow);
      translateService.currentLang = 'de';

      component.openPrivacyPolicy();

      expect(window.open).toHaveBeenCalledWith('/datenschutz', '_blank');
    });

    it('should open English privacy policy when language is English', () => {
      const mockWindow = { closed: false } as Window;
      spyOn(window, 'open').and.returnValue(mockWindow);
      translateService.currentLang = 'en';

      component.openPrivacyPolicy();

      expect(window.open).toHaveBeenCalledWith('/privacy-policy', '_blank');
    });

    it('should open English privacy policy when language is undefined', () => {
      const mockWindow = { closed: false } as Window;
      spyOn(window, 'open').and.returnValue(mockWindow);
      translateService.currentLang = undefined as any;

      component.openPrivacyPolicy();

      expect(window.open).toHaveBeenCalledWith('/privacy-policy', '_blank');
    });
  });

  describe('Data Sanitization', () => {
    it('should sanitize contact data correctly', () => {
      component.contactData = {
        name: '  John Doe  ',
        email: '  TEST@EXAMPLE.COM  ',
        message: '  Hello World  ',
        privacypolicy: true
      };

      const sanitized = component['sanitizeContactData']();

      expect(sanitized.name).toBe('John Doe');
      expect(sanitized.email).toBe('test@example.com');
      expect(sanitized.message).toBe('Hello World');
      expect(sanitized.privacypolicy).toBe(true);
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
      expect(component.post.options.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('Change Detection', () => {
    it('should mark for check after error', fakeAsync(() => {
      spyOn(component.cdr, 'markForCheck');
      component['handleError']({ status: 500 });
      flush();

      expect(component.submissionStatus).toBe('error');
    }));
  });
});
