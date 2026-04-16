import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { BREAKPOINTS, SCROLL_CONFIG } from '../constants/app.constants';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class ScrollService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly logger = inject(LoggerService);
  private readonly SCROLL_STORAGE_KEY = 'contact-scroll-position';

  private readonly mobileOffsets: Record<string, number> = {
    aboutMe: 0,
    skills: SCROLL_CONFIG.MOBILE_SKILLS_OFFSET,
    projects: 20,
    references: 100,
  };

  scrollToElement(
    elementId: string,
    _block: 'start' | 'center' | 'end' = 'start'
  ): void {
    if (!this.isBrowser) {return;}

    const element = this.document.getElementById(elementId);
    if (!element) {return;}

    const window = this.document.defaultView;
    if (!window) {return;}

    const isMobile = window.innerWidth <= BREAKPOINTS.TABLET_MAX;
    let extraOffset = 0;

    if (isMobile) {
      extraOffset = this.mobileOffsets[elementId] ?? 0;
    }

    const elementPosition =
      element.offsetTop - SCROLL_CONFIG.HEADER_HEIGHT - extraOffset;

    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth',
    });
  }

  scrollToPosition(position: number): void {
    if (!this.isBrowser) {return;}

    this.document.defaultView?.scrollTo({
      top: position,
      behavior: 'smooth',
    });
  }

  scrollToTop(): void {
    this.scrollToPosition(0);
  }

  getCurrentScrollPosition(): number {
    if (!this.isBrowser) {return 0;}

    const window = this.document.defaultView;
    return window?.scrollY ?? window?.pageYOffset ?? 0;
  }

  isScrolledBeyond(threshold: number): boolean {
    return this.getCurrentScrollPosition() > threshold;
  }

  saveScrollPosition(): void {
    if (!this.isBrowser) { return; }
    try {
      sessionStorage.setItem(this.SCROLL_STORAGE_KEY, this.getCurrentScrollPosition().toString());
    } catch (error) {
      this.logger.error('Failed to save scroll position', error);
    }
  }

  restoreScrollPosition(): void {
    if (!this.isBrowser) { return; }
    try {
      const savedPosition = sessionStorage.getItem(this.SCROLL_STORAGE_KEY);
      if (savedPosition) {
        this.document.defaultView?.scrollTo(0, parseInt(savedPosition, 10));
        sessionStorage.removeItem(this.SCROLL_STORAGE_KEY);
      }
    } catch (error) {
      this.logger.error('Failed to restore scroll position', error);
    }
  }
}
