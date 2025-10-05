import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timeout, retry, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AriaAnnouncerService } from '../../../shared/services/aria-announcer.service';

interface ContactData {
  name: string;
  email: string;
  message: string;
  privacypolicy: boolean;
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
  private destroyRef = takeUntilDestroyed();
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

  private readonly HTTP_TIMEOUT = 10000;
  private readonly HTTP_RETRY_ATTEMPTS = 2;

  post = {
    endPoint: 'https://mihaela-melania-aghirculesei.de/sendMail.php',
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
      if (!this.contactData.name || this.contactData.name.trim().length < 3) {
        this.invalidFields.push('name');
      }
    }

    if (field === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (
        !this.contactData.email ||
        !emailRegex.test(this.contactData.email.trim())
      ) {
        this.invalidFields.push('email');
      }
    }

    if (field === 'message') {
      if (
        !this.contactData.message ||
        this.contactData.message.trim().length < 10
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
        .post<any>(
          this.post.endPoint,
          this.post.body(this.sanitizeContactData()),
          this.post.options
        )
        .pipe(
          timeout(this.HTTP_TIMEOUT),
          retry(this.HTTP_RETRY_ATTEMPTS),
          catchError((error: HttpErrorResponse) => {
            return of({ error: true, errorDetails: error } as const);
          }),
          this.destroyRef
        )
        .subscribe({
          next: (response: any) => {
            this.isSubmitting = false;

            if (response?.error) {
              this.handleError(response.errorDetails);
            } else {
              this.submissionStatus = 'success';
              ngForm.resetForm();
              this.checkboxWasCheckedBefore = false;
              this.invalidFields = [];

              this.showPopupWithAnnouncement('contact.form.successMessage');
            }

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

  private handleError(error: any) {
    this.submissionStatus = 'error';

    if (error?.name === 'TimeoutError') {
      this.errorMessage = 'Request timeout. Please try again.';
    } else if (error?.status === 0) {
      this.errorMessage = 'Network error. Please check your connection.';
    } else if (error?.status >= 500) {
      this.errorMessage = 'Server error. Please try again later.';
    } else if (error?.status >= 400) {
      this.errorMessage = 'Bad request. Please check your input.';
    } else {
      this.errorMessage =
        error?.message || 'An error occurred while sending your message.';
    }

    const errorMsg = `${this.translate.instant('contact.form.errorMessage')} ${this.errorMessage}`;
    this.showPopupWithAnnouncement(errorMsg, false);
  }

  closePopup() {
    this.submissionStatus = null;
    this.errorMessage = '';

    // Restore focus to previously focused element
    if (this.previousFocusedElement) {
      this.previousFocusedElement.focus();
      this.previousFocusedElement = null;
    }
  }

  private showPopupWithAnnouncement(message: string, translate: boolean = true): void {
    // Announce to screen readers
    const announcement = translate ? this.translate.instant(message) : message;
    this.ariaAnnouncer.announce(announcement, 'assertive');

    // Focus management
    setTimeout(() => this.focusPopup(), 100);
  }

  private focusPopup(): void {
    // Save current focus
    this.previousFocusedElement = document.activeElement as HTMLElement;

    // Focus the popup close button
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
    if (currentLang === 'de') {
      window.open('/datenschutz', '_blank');
    } else {
      window.open('/privacy-policy', '_blank');
    }
  }
}
