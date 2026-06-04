import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { Location } from '@angular/common';
import { PlatformService } from '../../shared/services/platform.service';
import { LoggerService } from '../../shared/services/logger.service';

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
    imports: [TranslatePipe],
    templateUrl: './legal-notice.component.html',
    styleUrl: './legal-notice.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegalNoticeComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly platformService = inject(PlatformService);

  readonly contactInfo: ContactInfo = {
    name: 'Mihaela Melania Aghirculesei',
    address: {
      street: 'Springwiesen, 29',
      postalCode: '38446',
      city: 'Wolfsburg'
    },
    phone: '+49 174 9627899',
    email: 'aghirculesei@gmail.com'
  };

  readonly sourceLink: ExternalLink = {
    url: 'https://www.e-recht24.de/impressum-generator.html',
    label: 'e-recht24.de',
    isExternal: true
  };

  constructor(
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    if (this.platformService.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goBack(): void {
    this.location.back();
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
