import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, NgForm, NgModel } from '@angular/forms';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    TranslatePipe,
    TranslateDirective,
    RouterLink,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  http = inject(HttpClient);
  contactData = {
    name: '',
    email: '',
    message: '',
    privacyPolicy: false,
  };

  post = {
    endPoint: 'https://mihaela-melania-aghirculesei.com/sendMail.php',
    body: (payload: any) => JSON.stringify(payload),
    options: {
      headers: {
        'Content-Type': 'text/plain',
        responseType: 'text',
      },
    },
  };

  invalidFields: string[] = [];
  showOverlay: boolean = false;
  emailBlurred = false;
  nameBlurred = false;
  messageBlurred = false;

  validateForm(field: string) {
    this.invalidFields = this.invalidFields.filter((f) => f !== field);
    if (field === 'name') {
      if (!this.contactData.name || this.contactData.name.length < 3) {
        this.invalidFields.push('name');
        this.contactData.name = '';
      }
    }

    if (field === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!this.contactData.email || !emailRegex.test(this.contactData.email)) {
        this.invalidFields.push('email');
        this.emailBlurred = true;
        this.contactData.email = '';
      }
    }

    if (field === 'message') {
      if (!this.contactData.message || this.contactData.message.length < 10) {
        this.invalidFields.push('message');
        this.contactData.message = '';
      }
    }

    if (field === 'checkbox') {
      if (!this.contactData.privacyPolicy) {
        this.invalidFields.push('checkBox');
      }
    }
  }

  onSubmit(ngForm: NgForm) {
    if (ngForm.submitted && this.invalidFields.length === 0) {
      this.http
        .post(this.post.endPoint, this.post.body(this.contactData))
        .subscribe({
          next: (response) => {
            this.showOverlay = true;
            ngForm.resetForm();
          },
          error: (error) => {
            console.log(error);
          },
          complete: () => '',
        });
    } else if (ngForm.submitted && ngForm.form.valid) {
      ngForm.resetForm();
    }
  }

  closeOverlay() {
    this.showOverlay = false;
  }
}
