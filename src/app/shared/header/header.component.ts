import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { ScrollService } from '../services/scroll.service';
import { PlatformService } from '../services/platform.service';
import { BREAKPOINTS, SCROLL_CONFIG } from '../constants/app.constants';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isHovered: boolean = false;
  isScrolled: boolean = false;
  isEnglish: boolean = true;
  isMenuOpen: boolean = false;

  constructor(
    private scrollService: ScrollService,
    private platformService: PlatformService,
    private translate: TranslateService
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
    const lang = this.isEnglish ? 'de' : 'en';
    this.translate.use(lang);
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