import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ScrollService } from '../services/scroll.service';
import { PlatformService } from '../services/platform.service';
import { BREAKPOINTS, SCROLL_CONFIG } from '../constants/app.constants';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  isHovered: boolean = false;
  isScrolled: boolean = false;
  isEnglish: boolean = false;
  isMenuOpen: boolean = false;

  constructor(
    private scrollService: ScrollService,
    private platformService: PlatformService,
    private translate: TranslateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkScroll();
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  @HostListener('window:scroll', [])
  checkScroll(): void {
    this.isScrolled = this.scrollService.isScrolledBeyond(
      SCROLL_CONFIG.THRESHOLD
    );
  }

  toggleLanguage(): void {
    this.isEnglish = !this.isEnglish;
    const lang = this.isEnglish ? 'de' : 'en';
    this.translate.use(lang);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenuIfMobile(): void {
    const window = this.platformService.getWindow();
    if (window && window.innerWidth <= BREAKPOINTS.TABLET_MAX) {
      this.isMenuOpen = false;
    }
  }

  scrollToSection(sectionId: string): void {
    if (this.router.url === '/' || this.router.url === '') {
      this.scrollService.scrollToElement(sectionId, 'start');
    } else {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          this.scrollService.scrollToElement(sectionId, 'start');
        }, SCROLL_CONFIG.NAVIGATION_DELAY);
      });
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const target = event.target as Window;
    if (
      this.platformService.isWindowDefined() &&
      target.innerWidth > BREAKPOINTS.TABLET_MAX
    ) {
      this.isMenuOpen = false;
    }
  }
}
