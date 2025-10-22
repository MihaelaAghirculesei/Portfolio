import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { BannerSectionComponent } from './banner-section/banner-section.component';
import { ScrollService } from '../../shared/services/scroll.service';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

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
  selector: 'app-landingpage',
  standalone: true,
  imports: [BannerSectionComponent, TranslatePipe],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingpageComponent {
  readonly profileInfo = {
    firstName: 'Mihaela Melania',
    lastName: 'Aghirculesei',
    email: 'kontakt@mihaela-melania-aghirculesei.de',
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

  private scrollService = inject(ScrollService);

  scrollTo(elementId: string): void {
    this.scrollService.scrollToElement(elementId, 'start');
  }
}
