import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {

  isWindowDefined(): boolean {
    return typeof window !== 'undefined';
  }

  isDocumentDefined(): boolean {
    return typeof document !== 'undefined';
  }

  isBrowser(): boolean {
    return this.isWindowDefined() && this.isDocumentDefined();
  }

  getWindow(): Window | null {
    return this.isWindowDefined() ? window : null;
  }

  getDocument(): Document | null {
    return this.isDocumentDefined() ? document : null;
  }

  setBodyOverflow(overflow: string): void {
    const doc = this.getDocument();
    if (doc?.body) {
      doc.body.style.overflow = overflow;
    }
  }

  disableScroll(): void {
    const doc = this.getDocument();
    if (doc?.body) {
      doc.body.style.overflow = 'hidden';
      doc.body.style.position = 'fixed';
      doc.body.style.width = '100%';
    }
  }

  enableScroll(): void {
    const doc = this.getDocument();
    if (doc?.body) {
      doc.body.style.overflow = 'auto';
      doc.body.style.position = 'static';
      doc.body.style.width = 'auto';
    }
  }
}