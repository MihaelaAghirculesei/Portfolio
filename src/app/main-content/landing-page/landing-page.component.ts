import { Component } from '@angular/core';
import { BannerSectionComponent } from './banner-section/banner-section.component';
import { ScrollService } from '../../shared/services/scroll.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-landingpage',
  standalone: true,
  imports: [BannerSectionComponent, TranslatePipe],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingpageComponent {

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