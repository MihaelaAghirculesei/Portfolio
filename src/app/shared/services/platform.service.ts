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
    this.setBodyOverflow('hidden');
  }

  enableScroll(): void {
    this.setBodyOverflow('auto');
  }
}