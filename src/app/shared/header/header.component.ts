import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { ScrollService } from '../services/scroll.service';
import { PlatformService } from '../services/platform.service';
import { BREAKPOINTS, SCROLL_CONFIG } from '../constants/app.constants';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isHovered: boolean = false;
  isScrolled: boolean = false;
  isEnglish: boolean = false;
  isMenuOpen: boolean = false;

  constructor(
    private scrollService: ScrollService,
    private platformService: PlatformService
  ) {}

  ngOnInit() {
    this.checkScroll();
  }

  @HostListener('window:scroll', [])
  checkScroll() {
    this.isScrolled = this.scrollService.isScrolledBeyond(SCROLL_CONFIG.THRESHOLD);
  }

  toggleLanguage() {
    this.isEnglish = !this.isEnglish;
    // TODO: Implement translation logic
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenuIfMobile() {
    const window = this.platformService.getWindow();
    if (window && window.innerWidth <= BREAKPOINTS.MOBILE) {
      this.isMenuOpen = false;
    }
  }

  scrollToSection(sectionId: string) {
    this.scrollService.scrollToElement(sectionId, 'start');
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.platformService.isWindowDefined() && event.target.innerWidth > BREAKPOINTS.MOBILE) {
      this.isMenuOpen = false;
    }
  }
}