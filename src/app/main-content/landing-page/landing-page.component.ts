import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BannerSectionComponent } from './banner-section/banner-section.component';
import { ScrollService } from '../../shared/services/scroll.service';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

interface ActionButton {
  labelKey: string;
  action: () => void;
  primary?: boolean;
}

interface SocialLink {
  url: string;
  iconSrc: string;
  alt: string;
  isExternal: boolean;
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

  readonly actionButtons: ActionButton[] = [
    {
      labelKey: 'landingPage.checkWork',
      action: () => this.scrollToProjects(),
      primary: true,
    },
    {
      labelKey: 'landingPage.contactMe',
      action: () => this.scrollToContact(),
      primary: false,
    },
  ];

  readonly socialLinks: SocialLink[] = [
    {
      url: `mailto:${this.profileInfo.email}`,
      iconSrc: '../../assets/img/landingPage/mail.svg',
      alt: 'Email',
      isExternal: false,
    },
    {
      url: environment.social.github,
      iconSrc: '../../assets/img/github_green.svg',
      alt: 'GitHub',
      isExternal: true,
    },
    {
      url: environment.social.linkedin,
      iconSrc: '../../assets/img/linkedin_green.svg',
      alt: 'LinkedIn',
      isExternal: true,
    },
  ];

  constructor(private scrollService: ScrollService) {}

  scrollToAboutMe(): void {
    this.scrollService.scrollToElement('aboutMe', 'start');
  }

  scrollToProjects(): void {
    this.scrollService.scrollToElement('projects', 'start');
  }

  scrollToContact(): void {
    this.scrollService.scrollToElement('contact', 'start');
  }
}
