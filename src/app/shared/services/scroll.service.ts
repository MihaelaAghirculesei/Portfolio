import { inject, Injectable, DOCUMENT } from '@angular/core';
import { BREAKPOINTS, SCROLL_CONFIG } from '../constants/app.constants';
import { LoggerService } from './logger.service';
import { PlatformService } from './platform.service';

@Injectable({
  providedIn: 'root',
})
export class ScrollService {
  private readonly platformService = inject(PlatformService);
  private readonly document = inject(DOCUMENT);
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
    _block: 'start' | 'center' | 'end' = 'start',
    behavior: ScrollBehavior = 'smooth',
    preOffset = 0
  ): void {
    if (!this.platformService.isBrowser) {return;}

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
      element.offsetTop - SCROLL_CONFIG.HEADER_HEIGHT - extraOffset - preOffset;

    window.scrollTo({
      top: elementPosition,
      behavior,
    });
  }

  /**
   * Resolves once an element's `offsetTop` has stopped changing (or after
   * `maxWaitMs`, whichever comes first). Elements sitting behind an
   * `@defer (on viewport)` block can keep shifting position as preceding
   * sections swap their placeholder for real content — scrolling before
   * that settles lands short, then has to visibly re-scroll once the real
   * layout is in. Polling avoids guessing a fixed delay that may be too
   * short (a slow chunk load) or needlessly long (already-cached content).
   */
  waitForLayoutStable(elementId: string, maxWaitMs: number = SCROLL_CONFIG.LAYOUT_STABLE_MAX_WAIT): Promise<void> {
    if (!this.platformService.isBrowser) { return Promise.resolve(); }

    const window = this.document.defaultView;
    if (!window) { return Promise.resolve(); }

    const pollIntervalMs = 16;
    const requiredStableReadings = 3;

    return new Promise<void>((resolve) => {
      let elapsed = 0;
      let lastTop: number | null = null;
      let stableCount = 0;

      const check = (): void => {
        const element = this.document.getElementById(elementId);
        const top = element ? element.offsetTop : null;

        if (top === lastTop) {
          stableCount++;
        } else {
          stableCount = 0;
          lastTop = top;
        }

        if (stableCount >= requiredStableReadings || elapsed >= maxWaitMs) {
          resolve();
          return;
        }

        elapsed += pollIntervalMs;
        window.setTimeout(check, pollIntervalMs);
      };

      check();
    });
  }

  scrollToPosition(position: number): void {
    if (!this.platformService.isBrowser) {return;}

    this.document.defaultView?.scrollTo({
      top: position,
      behavior: 'smooth',
    });
  }

  scrollToTop(): void {
    this.scrollToPosition(0);
  }

  getCurrentScrollPosition(): number {
    if (!this.platformService.isBrowser) {return 0;}

    const window = this.document.defaultView;
    return window?.scrollY ?? window?.pageYOffset ?? 0;
  }

  isScrolledBeyond(threshold: number): boolean {
    return this.getCurrentScrollPosition() > threshold;
  }

  saveScrollPosition(): void {
    if (!this.platformService.isBrowser) { return; }
    try {
      sessionStorage.setItem(this.SCROLL_STORAGE_KEY, this.getCurrentScrollPosition().toString());
    } catch (error) {
      this.logger.error('Failed to save scroll position', error);
    }
  }

  restoreScrollPosition(): void {
    if (!this.platformService.isBrowser) { return; }
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
