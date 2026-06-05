import { NgClass } from '@angular/common';
import {
  Component, HostListener, ChangeDetectionStrategy, ChangeDetectorRef,
  OnDestroy, OnInit, inject, ElementRef, DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ScrollService } from '../services/scroll.service';
import { PlatformService } from '../services/platform.service';
import { FocusTrapService } from '../services/focus-trap.service';
import { BREAKPOINTS, SCROLL_CONFIG, TIMING_CONFIG } from '../constants/app.constants';
import { TranslationService } from '../services/translation.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { NavigationService } from '../services/navigation.service';

@Component({
    selector: 'app-header',
    imports: [NgClass, TranslatePipe],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {
  isHovered = false;
  isScrolled = false;
  isGerman = false;
  isMenuOpen = false;

  private readonly scrollService = inject(ScrollService);
  private readonly platformService = inject(PlatformService);
  private readonly translate = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly elementRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly focusTrap = inject(FocusTrapService);
  private readonly navigationService = inject(NavigationService);

  private readonly boundCheckScroll = this.checkScroll.bind(this);

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
    this.isScrolled = this.scrollService.isScrolledBeyond(SCROLL_CONFIG.THRESHOLD);
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
        if (this.isMenuOpen) {
          this.focusTrap.activate('.mobile-dropdown');
        }
      }, TIMING_CONFIG.MENU_SETUP_DELAY);
    } else {
      this.focusTrap.deactivate();
    }
  }

  onLogoHover(): void { this.isHovered = true; }
  onLogoUnhover(): void { this.isHovered = false; }

  closeMenuIfMobile(): void {
    const win = this.platformService.window;
    if (win && win.innerWidth <= BREAKPOINTS.TABLET_MAX) {
      this.isMenuOpen = false;
      this.focusTrap.deactivate();
    }
  }

  scrollToSection(sectionId: string): void {
    this.navigationService.scrollToSection(sectionId);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const target = event.target as Window | null;
    if (
      this.platformService.isWindowDefined() &&
      target !== null &&
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
