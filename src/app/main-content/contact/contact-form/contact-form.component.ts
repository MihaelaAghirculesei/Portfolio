import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule, TranslatePipe],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss'
})
export class ContactFormComponent {

  http = inject(HttpClient);
  translate = inject(TranslateService);

  contactData = {
    name: '',
    email: '',
    message: '',
    privacypolicy: false,
  };

  mailTest = true; // Cambia a false quando il server è pronto

  submissionStatus: 'success' | 'error' | null = null;
  errorMessage = '';
  
  invalidFields: string[] = [];

  post = {
    endPoint: 'https://mihaela-melania-aghirculesei.com/sendMail.php',
    body: (payload: any) => JSON.stringify(payload),
    options: {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  };

  validateForm(field: string) {
    // Rimuovi il campo dalla lista degli errori
    this.invalidFields = this.invalidFields.filter((f) => f !== field);
    
    if (field === 'name') {
      // Se il campo è vuoto O ha meno di 3 caratteri
      if (!this.contactData.name || this.contactData.name.trim().length < 3) {
        this.invalidFields.push('name');
      }
    }

    if (field === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      // Se il campo è vuoto O non corrisponde al pattern
      if (!this.contactData.email || !emailRegex.test(this.contactData.email.trim())) {
        this.invalidFields.push('email');
      }
    }

    if (field === 'message') {
      // Se il campo è vuoto O ha meno di 10 caratteri
      if (!this.contactData.message || this.contactData.message.trim().length < 10) {
        this.invalidFields.push('message');
      }
    }

    if (field === 'checkbox') {
      // Se il checkbox non è spuntato
      if (!this.contactData.privacypolicy) {
        this.invalidFields.push('checkbox');
      }
    }
  }

  onSubmit(ngForm: NgForm) {
    if (ngForm.submitted && ngForm.form.valid && !this.mailTest) {
      this.http.post<any>(this.post.endPoint, this.post.body(this.contactData), this.post.options)
        .subscribe({
          next: (response) => {
            this.submissionStatus = 'success';
            ngForm.resetForm();
            this.checkboxWasCheckedBefore = false;
            this.invalidFields = [];
          },
          error: (error) => {
            this.submissionStatus = 'error';
            this.errorMessage = error.message || 'An error occurred while sending your message.';
            this.checkboxWasCheckedBefore = false;
            ngForm.resetForm();
          },
          complete: () => {}
        });
    } else if (ngForm.submitted && ngForm.form.valid && this.mailTest) {
      this.submissionStatus = 'success';
      ngForm.resetForm();
      this.checkboxWasCheckedBefore = false;
      this.invalidFields = [];
    }
  }

  closePopup() {
    this.submissionStatus = null;
    this.errorMessage = '';
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