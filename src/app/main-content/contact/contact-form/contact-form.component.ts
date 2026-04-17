import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, ChangeDetectionStrategy, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AriaAnnouncerService } from '../../../shared/services/aria-announcer.service';
import { LoggerService } from '../../../shared/services/logger.service';
import { FocusTrapService } from '../../../shared/services/focus-trap.service';
import { ScrollService } from '../../../shared/services/scroll.service';
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
    imports: [FormsModule, CommonModule, RouterLink, TranslatePipe],
    templateUrl: './contact-form.component.html',
    styleUrl: './contact-form.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactFormComponent implements OnInit {
  private readonly FORM_STORAGE_KEY = 'contact-form-data';
  private readonly http = inject(HttpClient);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ariaAnnouncer = inject(AriaAnnouncerService);
  private readonly logger = inject(LoggerService);
  private readonly scrollService = inject(ScrollService);
  private readonly focusTrap = inject(FocusTrapService);

  contactData: ContactData = {
    name: '',
    email: '',
    message: '',
    privacypolicy: false,
  };

  mailTest = false;

  readonly isSubmitting = signal(false);
  readonly submissionStatus = signal<'success' | 'error' | null>(null);
  readonly errorMessage = signal('');
  readonly invalidFields = signal<string[]>([]);
  readonly checkboxWasCheckedBefore = signal(false);

  post = {
    endPoint: environment.emailWorkerUrl,
    body: (payload: ContactData) => JSON.stringify(payload),
    options: {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json',
      },
    },
  };

  ngOnInit(): void {
    this.loadFormData();
    setTimeout(() => this.scrollService.restoreScrollPosition(), 100);
  }

  private saveFormData(): void {
    try {
      sessionStorage.setItem(this.FORM_STORAGE_KEY, JSON.stringify(this.contactData));
    } catch (error) {
      this.logger.error('Failed to save form data to sessionStorage', error);
    }
  }

  private loadFormData(): void {
    try {
      const savedData = sessionStorage.getItem(this.FORM_STORAGE_KEY);
      if (savedData) {
        this.contactData = JSON.parse(savedData) as ContactData;
      }
    } catch (error) {
      this.logger.error('Failed to load form data from sessionStorage', error);
    }
  }

  private clearFormData(): void {
    try {
      sessionStorage.removeItem(this.FORM_STORAGE_KEY);
    } catch (error) {
      this.logger.error('Failed to clear form data from sessionStorage', error);
    }
  }

  onFormDataChange(): void {
    this.saveFormData();
  }

  saveScrollPosition(): void {
    this.scrollService.saveScrollPosition();
  }

  validateForm(field: string): void {
    this.invalidFields.update(fields => fields.filter(f => f !== field));

    if (field === 'name' && (!this.contactData.name || this.contactData.name.trim().length < VALIDATION_CONFIG.MIN_NAME_LENGTH)) {
      this.invalidFields.update(fields => [...fields, 'name']);
    }

    if (field === 'email' && (!this.contactData.email || !VALIDATION_CONFIG.EMAIL_PATTERN.test(this.contactData.email.trim()))) {
      this.invalidFields.update(fields => [...fields, 'email']);
    }

    const msgTooShort = !this.contactData.message || this.contactData.message.trim().length < VALIDATION_CONFIG.MIN_MESSAGE_LENGTH;
    if (field === 'message' && msgTooShort) {
      this.invalidFields.update(fields => [...fields, 'message']);
    }

    if (field === 'checkbox' && !this.contactData.privacypolicy) {
      this.invalidFields.update(fields => [...fields, 'checkbox']);
    }
  }

  onSubmit(ngForm: NgForm): void {
    if (ngForm.submitted && ngForm.form.valid && !this.mailTest) {
      this.isSubmitting.set(true);

      this.http
        .post<ContactResponse>(
          this.post.endPoint,
          this.post.body(this.sanitizeContactData()),
          this.post.options
        )
        .pipe(
          timeout(HTTP_CONFIG.TIMEOUT),
          catchError((error: HttpErrorResponse) => of<ContactResponse>({ error: true, errorDetails: error })),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: (response: ContactResponse) => {
            this.isSubmitting.set(false);

            if (response?.error && response.errorDetails) {
              this.handleError(response.errorDetails);
            } else {
              this.submissionStatus.set('success');
              this.invalidFields.set([]);
              this.clearFormData();
              this.showPopupWithAnnouncement('contact.form.successMessage');
            }

            this.checkboxWasCheckedBefore.set(false);
            ngForm.resetForm();
          },
          error: (error: HttpErrorResponse) => {
            this.isSubmitting.set(false);
            this.handleError(error);
            this.checkboxWasCheckedBefore.set(false);
            ngForm.resetForm();
          },
        });
    } else if (ngForm.submitted && ngForm.form.valid && this.mailTest) {
      this.submissionStatus.set('success');
      this.clearFormData();
      ngForm.resetForm();
      this.checkboxWasCheckedBefore.set(false);
      this.invalidFields.set([]);
    }
  }

  private sanitizeContactData(): ContactData {
    return {
      name: this.contactData.name.trim(),
      email: this.contactData.email.trim().toLowerCase(),
      message: this.contactData.message.trim(),
      privacypolicy: this.contactData.privacypolicy,
    };
  }

  private handleError(error: unknown): void {
    this.submissionStatus.set('error');

    const errorLike = error as ErrorLike;
    const isHttpError = error instanceof HttpErrorResponse;
    const errorName = isHttpError
      ? 'HttpError'
      : (errorLike.name ?? (error as { constructor?: { name?: string } })?.constructor?.name ?? 'UnknownError');
    const errorStatus = isHttpError ? error.status : errorLike.status;

    this.logger.error('Contact form submission failed:', {
      type: errorName,
      status: errorStatus,
      message: isHttpError ? error.message : (errorLike.message ?? 'No message'),
      timestamp: new Date().toISOString()
    });

    let msg: string;
    if (errorLike.name === 'TimeoutError') {
      msg = 'Request timeout. Please try again.';
    } else if ((error instanceof HttpErrorResponse && error.status === 0) || errorLike.status === 0) {
      msg = 'Network error. Please check your connection.';
    } else if ((error instanceof HttpErrorResponse && error.status >= HTTP_CONFIG.STATUS_SERVER_ERROR)
      || (errorLike.status && errorLike.status >= HTTP_CONFIG.STATUS_SERVER_ERROR)) {
      msg = 'Server error. Please try again later.';
    } else if ((error instanceof HttpErrorResponse && error.status >= HTTP_CONFIG.STATUS_CLIENT_ERROR)
      || (errorLike.status && errorLike.status >= HTTP_CONFIG.STATUS_CLIENT_ERROR)) {
      msg = 'Bad request. Please check your input.';
    } else {
      msg = errorLike.message || 'An error occurred while sending your message.';
    }
    this.errorMessage.set(msg);

    const errorMsg = `${this.translate.instant('contact.form.errorMessage')} ${this.errorMessage()}`;
    this.showPopupWithAnnouncement(errorMsg, false);
  }

  closePopup(): void {
    this.submissionStatus.set(null);
    this.errorMessage.set('');
    this.focusTrap.restoreFocus();
  }

  private showPopupWithAnnouncement(message: string, translate = true): void {
    const announcement = translate ? this.translate.instant(message) : message;
    this.ariaAnnouncer.announce(announcement, 'assertive');

    setTimeout(() => this.focusPopup(), TIMING_CONFIG.FOCUS_DELAY);
  }

  private focusPopup(): void {
    this.focusTrap.saveFocus();
    const closeButton = document.querySelector('.popup-footer button') as HTMLElement;
    closeButton?.focus();
  }

  checkboxChanged(): void {
    if (this.contactData.privacypolicy) {
      this.checkboxWasCheckedBefore.set(true);
    }
  }
}
