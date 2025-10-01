import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  readonly isBrowser = isPlatformBrowser(this.platformId);

  get window(): Window | null {
    return this.isBrowser ? this.document.defaultView : null;
  }

  getWindow(): Window | null {
    return this.window;
  }

  getDocument(): Document | null {
    return this.isBrowser ? this.document : null;
  }

  isWindowDefined(): boolean {
    return this.isBrowser;
  }

  setBodyOverflow(overflow: string): void {
    if (this.isBrowser) {
      this.document.body.style.overflow = overflow;
    }
  }

  disableScroll(): void {
    if (this.isBrowser) {
      const body = this.document.body;
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.width = '100%';
    }
  }

  enableScroll(): void {
    if (this.isBrowser) {
      const body = this.document.body;
      body.style.overflow = 'auto';
      body.style.position = 'static';
      body.style.width = 'auto';
    }
  }
}