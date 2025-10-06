import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timeout, retry, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AriaAnnouncerService } from '../../../shared/services/aria-announcer.service';
import { LoggerService } from '../../../shared/services/logger.service';
import { VALIDATION_CONFIG, HTTP_CONFIG, TIMING_CONFIG } from '../../../shared/constants/app.constants';
import { environment } from '../../../../environments/environment';

interface ContactData {
  name: string;
  email: string;
  message: string;
  privacypolicy: boolean;
}

interface ContactResponse {
  success?: boolean;
  message?: string;
  error?: boolean;
  errorDetails?: HttpErrorResponse;
}

interface ErrorLike {
  name?: string;
  status?: number;
  message?: string;
}

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslatePipe],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactFormComponent {
  http = inject(HttpClient);
  translate = inject(TranslateService);
  cdr = inject(ChangeDetectorRef);
  private ariaAnnouncer = inject(AriaAnnouncerService);
  private readonly logger = inject(LoggerService);
  private previousFocusedElement: HTMLElement | null = null;

  contactData: ContactData = {
    name: '',
    email: '',
    message: '',
    privacypolicy: false,
  };

  mailTest = false;
  isSubmitting = false;

  submissionStatus: 'success' | 'error' | null = null;
  errorMessage = '';

  invalidFields: string[] = [];

  post = {
    endPoint: `${environment.apiUrl}${environment.endpoints.sendMail}`,
    body: (payload: ContactData) => JSON.stringify(payload),
    options: {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  };

  validateForm(field: string) {
    this.invalidFields = this.invalidFields.filter((f) => f !== field);

    if (field === 'name') {
      if (!this.contactData.name || this.contactData.name.trim().length < VALIDATION_CONFIG.MIN_NAME_LENGTH) {
        this.invalidFields.push('name');
      }
    }

    if (field === 'email') {
      if (
        !this.contactData.email ||
        !VALIDATION_CONFIG.EMAIL_PATTERN.test(this.contactData.email.trim())
      ) {
        this.invalidFields.push('email');
      }
    }

    if (field === 'message') {
      if (
        !this.contactData.message ||
        this.contactData.message.trim().length < VALIDATION_CONFIG.MIN_MESSAGE_LENGTH
      ) {
        this.invalidFields.push('message');
      }
    }

    if (field === 'checkbox') {
      if (!this.contactData.privacypolicy) {
        this.invalidFields.push('checkbox');
      }
    }
  }

  onSubmit(ngForm: NgForm) {
    if (ngForm.submitted && ngForm.form.valid && !this.mailTest) {
      this.isSubmitting = true;
      this.cdr.markForCheck();

      this.http
        .post<ContactResponse>(
          this.post.endPoint,
          this.post.body(this.sanitizeContactData()),
          this.post.options
        )
        .pipe(
          timeout(HTTP_CONFIG.TIMEOUT),
          retry(HTTP_CONFIG.RETRY_ATTEMPTS),
          catchError((error: HttpErrorResponse) => {
            return of<ContactResponse>({ error: true, errorDetails: error });
          }),
          takeUntilDestroyed()
        )
        .subscribe({
          next: (response: ContactResponse) => {
            this.isSubmitting = false;

            if (response?.error && response.errorDetails) {
              this.handleError(response.errorDetails);
            } else {
              this.submissionStatus = 'success';
              this.invalidFields = [];
              this.showPopupWithAnnouncement('contact.form.successMessage');
            }

            this.checkboxWasCheckedBefore = false;
            ngForm.resetForm();
            this.cdr.markForCheck();
          },
          error: (error: HttpErrorResponse) => {
            this.isSubmitting = false;
            this.handleError(error);
            this.checkboxWasCheckedBefore = false;
            ngForm.resetForm();
            this.cdr.markForCheck();
          },
        });
    } else if (ngForm.submitted && ngForm.form.valid && this.mailTest) {
      this.submissionStatus = 'success';
      ngForm.resetForm();
      this.checkboxWasCheckedBefore = false;
      this.invalidFields = [];
    }
  }

  private sanitizeContactData() {
    return {
      name: this.contactData.name.trim(),
      email: this.contactData.email.trim().toLowerCase(),
      message: this.contactData.message.trim(),
      privacypolicy: this.contactData.privacypolicy,
    };
  }

  private handleError(error: unknown) {
    this.submissionStatus = 'error';

    const errorLike = error as ErrorLike;
    const errorName = error instanceof HttpErrorResponse ? 'HttpError' : errorLike.name;
    const errorStatus = error instanceof HttpErrorResponse ? error.status : errorLike.status;

    this.logger.error('Contact form submission failed:', {
      type: errorName,
      status: errorStatus,
      message: errorLike.message,
      timestamp: new Date().toISOString()
    });

    if (errorLike.name === 'TimeoutError') {
      this.errorMessage = 'Request timeout. Please try again.';
    } else if (error instanceof HttpErrorResponse && error.status === 0) {
      this.errorMessage = 'Network error. Please check your connection.';
    } else if (errorLike.status === 0) {
      this.errorMessage = 'Network error. Please check your connection.';
    } else if (error instanceof HttpErrorResponse && error.status >= HTTP_CONFIG.STATUS_SERVER_ERROR) {
      this.errorMessage = 'Server error. Please try again later.';
    } else if (errorLike.status && errorLike.status >= HTTP_CONFIG.STATUS_SERVER_ERROR) {
      this.errorMessage = 'Server error. Please try again later.';
    } else if (error instanceof HttpErrorResponse && error.status >= HTTP_CONFIG.STATUS_CLIENT_ERROR) {
      this.errorMessage = 'Bad request. Please check your input.';
    } else if (errorLike.status && errorLike.status >= HTTP_CONFIG.STATUS_CLIENT_ERROR) {
      this.errorMessage = 'Bad request. Please check your input.';
    } else {
      this.errorMessage = errorLike.message || 'An error occurred while sending your message.';
    }

    const errorMsg = `${this.translate.instant('contact.form.errorMessage')} ${this.errorMessage}`;
    this.showPopupWithAnnouncement(errorMsg, false);
  }

  closePopup() {
    this.submissionStatus = null;
    this.errorMessage = '';
    if (this.previousFocusedElement) {
      this.previousFocusedElement.focus();
      this.previousFocusedElement = null;
    }
  }

  private showPopupWithAnnouncement(message: string, translate: boolean = true): void {
    const announcement = translate ? this.translate.instant(message) : message;
    this.ariaAnnouncer.announce(announcement, 'assertive');

    setTimeout(() => this.focusPopup(), TIMING_CONFIG.FOCUS_DELAY);
  }

  private focusPopup(): void {
    this.previousFocusedElement = document.activeElement as HTMLElement;

    const closeButton = document.querySelector('.popup-footer button') as HTMLElement;
    if (closeButton) {
      closeButton.focus();
    }
  }

  checkboxWasCheckedBefore = false;

  checkboxChanged() {
    if (this.contactData.privacypolicy) {
      this.checkboxWasCheckedBefore = true;
    }
  }

  openPrivacyPolicy() {
    const currentLang = this.translate.currentLang || 'en';
    const url = currentLang === 'de' ? '/datenschutz' : '/privacy-policy';

    const newWindow = window.open(url, '_blank');

    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      this.logger.warn('Popup blocked. Navigating in current tab.');
      window.location.href = url;
    }
  }
}
