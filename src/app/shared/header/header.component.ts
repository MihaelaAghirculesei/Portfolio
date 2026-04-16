import { CommonModule } from '@angular/common';
import {
  Component, HostListener, ChangeDetectionStrategy, ChangeDetectorRef,
  OnDestroy, OnInit, inject, ElementRef, DestroyRef
} from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ScrollService } from '../services/scroll.service';
import { PlatformService } from '../services/platform.service';
import { LoggerService } from '../services/logger.service';
import { FocusTrapService } from '../services/focus-trap.service';
import { BREAKPOINTS, SCROLL_CONFIG, TIMING_CONFIG } from '../constants/app.constants';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-header',
    imports: [CommonModule, TranslatePipe],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {
  isHovered = false;
  isScrolled = false;
  isGerman = false;
  isMenuOpen = false;
  private boundCheckScroll = this.checkScroll.bind(this);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly focusTrap = inject(FocusTrapService);

  constructor(
    private scrollService: ScrollService,
    private platformService: PlatformService,
    private translate: TranslateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.isGerman = this.translate.currentLang === 'de';

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ lang }) => {
        this.isGerman = lang === 'de';
        this.cdr.markForCheck();
      });

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
    this.isGerman = !this.isGerman;
    const lang = this.isGerman ? 'de' : 'en';
    this.translate.use(lang);
    if (this.platformService.isBrowser) {
      localStorage.setItem('lang', lang);
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;

    if (this.isMenuOpen) {
      setTimeout(() => {
        this.focusTrap.activate('.mobile-dropdown');
      }, TIMING_CONFIG.MENU_SETUP_DELAY);
    } else {
      this.focusTrap.deactivate();
    }
  }

  closeMenuIfMobile(): void {
    const window = this.platformService.getWindow();
    if (window && window.innerWidth <= BREAKPOINTS.TABLET_MAX) {
      this.isMenuOpen = false;
      this.focusTrap.deactivate();
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
      this.focusTrap.deactivate();
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
      this.focusTrap.deactivate();
      this.cdr.markForCheck();
    }
  }
}
