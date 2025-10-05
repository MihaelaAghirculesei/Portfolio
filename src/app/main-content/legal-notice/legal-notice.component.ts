import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';

interface ContactInfo {
  name: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
  };
  phone: string;
  email: string;
}

interface ExternalLink {
  url: string;
  label: string;
  isExternal: boolean;
}

@Component({
  selector: 'app-legal-notice',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './legal-notice.component.html',
  styleUrl: './legal-notice.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalNoticeComponent implements OnInit {

  readonly contactInfo: ContactInfo = {
    name: 'Mihaela Melania Aghirculesei',
    address: {
      street: 'Springwiesen, 29',
      postalCode: '38446',
      city: 'Wolfsburg'
    },
    phone: '+49 174 9627899',
    email: 'kontakt@mihaela-melania-aghirculesei.de'
  };

  readonly sourceLink: ExternalLink = {
    url: 'https://www.e-recht24.de/impressum-generator.html',
    label: 'e-recht24.de',
    isExternal: true
  };

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goBack(): void {
    this.router.navigate(['/']).catch((error) => {
      console.error('Navigation to home failed:', error);
    });
  }

  get phoneLink(): string {
    return `tel:${this.contactInfo.phone}`;
  }

  get emailLink(): string {
    return `mailto:${this.contactInfo.email}`;
  }

  get fullAddress(): string {
    const { street, postalCode, city } = this.contactInfo.address;
    return `${street}, ${postalCode} ${city}`;
  }
}