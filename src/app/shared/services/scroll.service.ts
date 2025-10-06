import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { BREAKPOINTS, SCROLL_CONFIG } from '../constants/app.constants';

@Injectable({
  providedIn: 'root',
})
export class ScrollService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

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
    const extraOffset = isMobile ? this.mobileOffsets[elementId] ?? 0 : 0;
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
}
