import { inject, Injectable, PLATFORM_ID, DOCUMENT } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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

  getDocument(): Document | null {
    return this.isBrowser ? this.document : null;
  }

  isWindowDefined(): boolean {
    return this.isBrowser;
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