import { CommonModule } from '@angular/common';
import { Component, HostListener, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, OnInit, inject, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ScrollService } from '../services/scroll.service';
import { PlatformService } from '../services/platform.service';
import { LoggerService } from '../services/logger.service';
import { BREAKPOINTS, SCROLL_CONFIG, TIMING_CONFIG } from '../constants/app.constants';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
  isHovered = false;
  isScrolled = false;
  isEnglish = false;
  isMenuOpen = false;
  private boundCheckScroll = this.checkScroll.bind(this);
  private focusableMenuElements: HTMLElement[] = [];
  private firstMenuFocusable: HTMLElement | null = null;
  private lastMenuFocusable: HTMLElement | null = null;
  private readonly logger = inject(LoggerService);

  constructor(
    private scrollService: ScrollService,
    private platformService: PlatformService,
    private translate: TranslateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.checkScroll();

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
      }, TIMING_CONFIG.MENU_SETUP_DELAY);
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
      this.router.navigate(['/']).then(
        () => {
          setTimeout(() => {
            this.scrollService.scrollToElement(sectionId, 'start');
          }, SCROLL_CONFIG.NAVIGATION_DELAY);
        },
        (error) => {
          this.logger.error('Navigation to home failed:', error);
        }
      );
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isMenuOpen) {
      return;
    }

    const clickedInside = this.elementRef.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.isMenuOpen = false;
      this.cdr.markForCheck();
    }
  }

  private setupMenuFocusTrap(): void {
    const mobileMenu = document.querySelector('.mobile-dropdown');
    if (!mobileMenu) {return;}

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

      this.firstMenuFocusable?.focus();

      mobileMenu.addEventListener('keydown', this.handleMenuFocusTrap.bind(this));
    }
  }

  private handleMenuFocusTrap(event: Event): void {
    if (!(event instanceof KeyboardEvent) || event.key !== 'Tab' || !this.isMenuOpen) {return;}

    if (event.shiftKey) {
      if (document.activeElement === this.firstMenuFocusable) {
        event.preventDefault();
        this.lastMenuFocusable?.focus();
      }
    } else {
      if (document.activeElement === this.lastMenuFocusable) {
        event.preventDefault();
        this.firstMenuFocusable?.focus();
      }
    }
  }
}
