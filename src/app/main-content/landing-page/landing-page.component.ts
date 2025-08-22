import { Component } from '@angular/core';
import { BannerSectionComponent } from './banner-section/banner-section.component';
import { ScrollService } from '../../shared/services/scroll.service';

@Component({
  selector: 'app-landingpage',
  standalone: true,
  imports: [BannerSectionComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingpageComponent {

  constructor(private scrollService: ScrollService) {}

  scrollToAboutMe(): void {
    this.scrollService.scrollToElement('aboutMe', 'start');
  }
}