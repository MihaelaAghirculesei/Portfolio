import { Component, OnInit, OnDestroy } from '@angular/core';
import { BannerSectionComponent } from './banner-section/banner-section.component';
import { ScrollService } from '../../shared/services/scroll.service';
import { TranslatePipe } from '@ngx-translate/core';

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
})
export class LandingpageComponent implements OnInit, OnDestroy {
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
      url: 'https://github.com/MihaelaAghirculesei',
      iconSrc: '../../assets/img/github_green.svg',
      alt: 'GitHub',
      isExternal: true,
    },
    {
      url: 'https://www.linkedin.com/in/mihaela-aghirculesei-84147a23b/',
      iconSrc: '../../assets/img/linkedin_green.svg',
      alt: 'LinkedIn',
      isExternal: true,
    },
  ];

  constructor(private scrollService: ScrollService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

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
