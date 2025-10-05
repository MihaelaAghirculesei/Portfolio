import { CommonModule } from '@angular/common';
import { Component, HostListener, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnDestroy {
  isHovered: boolean = false;
  isScrolled: boolean = false;
  isEnglish: boolean = false;
  isMenuOpen: boolean = false;
  private boundCheckScroll = this.checkScroll.bind(this);
  private menuToggleButton: HTMLElement | null = null;
  private focusableMenuElements: HTMLElement[] = [];
  private firstMenuFocusable: HTMLElement | null = null;
  private lastMenuFocusable: HTMLElement | null = null;

  constructor(
    private scrollService: ScrollService,
    private platformService: PlatformService,
    private translate: TranslateService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkScroll();
    this.translate.setDefaultLang('en');
    this.translate.use('en');

    if (this.platformService.isWindowDefined()) {
      window.addEventListener('scroll', this.boundCheckScroll, { passive: true });
    }
  }

  ngOnDestroy(): void {
    if (this.platformService.isWindowDefined()) {
      window.removeEventListener('scroll', this.boundCheckScroll);
    }
  }

  checkScroll(): void {
    this.isScrolled = this.scrollService.isScrolledBeyond(
      SCROLL_CONFIG.THRESHOLD
    );
    this.cdr.markForCheck();
  }

  toggleLanguage(): void {
    this.isEnglish = !this.isEnglish;
    const lang = this.isEnglish ? 'de' : 'en';
    this.translate.use(lang);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;

    if (this.isMenuOpen) {
      setTimeout(() => {
        this.setupMenuFocusTrap();
      }, 100);
    }
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

  private setupMenuFocusTrap(): void {
    const mobileMenu = document.querySelector('.mobile-dropdown');
    if (!mobileMenu) return;

    const focusableSelectors = [
      'a[href]:not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      'input:not([disabled]):not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    this.focusableMenuElements = Array.from(
      mobileMenu.querySelectorAll(focusableSelectors)
    );

    if (this.focusableMenuElements.length > 0) {
      this.firstMenuFocusable = this.focusableMenuElements[0];
      this.lastMenuFocusable = this.focusableMenuElements[this.focusableMenuElements.length - 1];

      // Focus first element in menu
      this.firstMenuFocusable?.focus();

      // Add Tab trap listener
      mobileMenu.addEventListener('keydown', this.handleMenuFocusTrap.bind(this));
    }
  }

  private handleMenuFocusTrap(event: Event): void {
    if (!(event instanceof KeyboardEvent) || event.key !== 'Tab' || !this.isMenuOpen) return;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstMenuFocusable) {
        event.preventDefault();
        this.lastMenuFocusable?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastMenuFocusable) {
        event.preventDefault();
        this.firstMenuFocusable?.focus();
      }
    }
  }
}
