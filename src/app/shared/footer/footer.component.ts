import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  showLegalNotice = false;

  constructor(private translate: TranslateService) {}

  openLegalNotice() {
    this.showLegalNotice = true;
  }

  closeLegalNotice() {
    this.showLegalNotice = false;
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