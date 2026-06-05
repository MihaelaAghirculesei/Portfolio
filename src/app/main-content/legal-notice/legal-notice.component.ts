import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { Location } from '@angular/common';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ScrollService } from '../../shared/services/scroll.service';
import { CONTACT_INFO } from '../../shared/constants/app.constants';

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
  private readonly scrollService = inject(ScrollService);
  private readonly location = inject(Location);

  readonly contactInfo = CONTACT_INFO;

  readonly sourceLink: ExternalLink = {
    url: 'https://www.e-recht24.de/impressum-generator.html',
    label: 'e-recht24.de',
    isExternal: true
  };

  ngOnInit(): void {
    this.scrollService.scrollToTop();
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
