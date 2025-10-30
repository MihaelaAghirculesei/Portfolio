import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TIMING_CONFIG } from '../constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class AriaAnnouncerService {
  private liveRegion: HTMLElement | null = null;
  private announcementTimer?: ReturnType<typeof setTimeout>;
  private clearTimer?: ReturnType<typeof setTimeout>;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      this.createLiveRegion();
    }
  }

  private createLiveRegion(): void {
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.setAttribute('class', 'sr-only');
    this.liveRegion.style.position = 'absolute';
    this.liveRegion.style.left = '-10000px';
    this.liveRegion.style.width = '1px';
    this.liveRegion.style.height = '1px';
    this.liveRegion.style.overflow = 'hidden';
    document.body.appendChild(this.liveRegion);
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion) {return;}

    clearTimeout(this.announcementTimer);
    clearTimeout(this.clearTimer);

    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = '';

    this.announcementTimer = setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = message;
      }
    }, TIMING_CONFIG.ARIA_ANNOUNCEMENT_DELAY);

    this.clearTimer = setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, TIMING_CONFIG.ARIA_CLEAR_DELAY);
  }
}
