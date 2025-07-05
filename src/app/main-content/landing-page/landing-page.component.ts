import { Component } from '@angular/core';
import { BannerSectionComponent } from './banner-section/banner-section.component';

@Component({
  selector: 'app-landingpage',
  standalone: true,
  imports: [BannerSectionComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingpageComponent {

  scrollToAboutMe(): void {
    const aboutMeSection = document.getElementById('aboutMe');
    
    if (aboutMeSection) {
      aboutMeSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }
}