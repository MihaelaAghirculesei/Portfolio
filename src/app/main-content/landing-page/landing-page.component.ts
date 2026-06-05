import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { BannerSectionComponent } from './banner-section/banner-section.component';
import { ScrollService } from '../../shared/services/scroll.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { environment } from '../../../environments/environment';
import { CONTACT_INFO } from '../../shared/constants/app.constants';

interface ActionButton {
  labelKey: string;
  action: () => void;
}

interface SocialLink {
  url: string;
  iconSrc: string;
  alt: string;
  ariaLabel: string;
  isExternal: boolean;
  isEmail?: boolean;
}

@Component({
    selector: 'app-landing-page',
    imports: [BannerSectionComponent, TranslatePipe],
    templateUrl: './landing-page.component.html',
    styleUrl: './landing-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent {
  readonly profileInfo = {
    firstName: CONTACT_INFO.firstName,
    lastName: CONTACT_INFO.lastName,
    email: CONTACT_INFO.email,
  };

  get fullName(): string {
    return `${this.profileInfo.firstName} ${this.profileInfo.lastName}`;
  }

  readonly actionButtons: ActionButton[] = [
    {
      labelKey: 'landingPage.checkWork',
      action: () => this.scrollTo('projects'),
    },
    {
      labelKey: 'landingPage.contactMe',
      action: () => this.scrollTo('contact'),
    },
  ];

  readonly socialLinks: SocialLink[] = [
    {
      url: `mailto:${this.profileInfo.email}`,
      iconSrc: '../../assets/img/landingPage/mail.svg',
      alt: 'Email',
      ariaLabel: 'Email',
      isExternal: false,
      isEmail: true,
    },
    {
      url: environment.social.github,
      iconSrc: '../../assets/img/github_green.svg',
      alt: 'GitHub',
      ariaLabel: 'GitHub (opens in new tab)',
      isExternal: true,
    },
    {
      url: environment.social.linkedin,
      iconSrc: '../../assets/img/linkedin_green.svg',
      alt: 'LinkedIn',
      ariaLabel: 'LinkedIn (opens in new tab)',
      isExternal: true,
    },
  ];

  private readonly scrollService = inject(ScrollService);

  scrollTo(elementId: string): void {
    this.scrollService.scrollToElement(elementId, 'start');
  }
}
