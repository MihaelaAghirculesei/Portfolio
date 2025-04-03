import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, NgForm, NgModel } from '@angular/forms';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslatePipe, TranslateDirective],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  contactData = {
    name: '',
    email: '',
    message: '',
    privacyPolicy: false,
  };

  invalidFields: string[] = [];

  validateForm() {
    this.invalidFields = [];

    if (!this.contactData.name || this.contactData.name.length < 3) {
      this.invalidFields.push('name');
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!this.contactData.email || !emailRegex.test(this.contactData.email)) {
      this.invalidFields.push('email');
      this.contactData.email = '';
    }

    if (!this.contactData.message || this.contactData.message.length < 10) {
      this.invalidFields.push('message');
    }

    if (!this.contactData.privacyPolicy) {
      this.invalidFields.push('checkBox');
    }

    if (this.invalidFields.length === 0) {
      console.log('Form submitted successfully!', this.contactData);
    } else {
      console.log('Validation errors:', this.invalidFields);
    }
  }

  // sendMail(ngForm: NgForm) {
  //   if (ngForm.submitted && this.invalidFields.length === 0) {
  //     this.http
  //       .post(this.post.endPoint, this.post.body(this.contactData))
  //       .subscribe({
  //         next: (response) => {
  //           ngForm.resetForm();
  //         },
  //         error: (error) => {},
  //         complete: () => console.info('send post complete'),
  //       });
  //   } else if (ngForm.submitted && ngForm.form.valid) {
  //     ngForm.resetForm();
  //   }
  // }
}
