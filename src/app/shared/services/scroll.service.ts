import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {

  scrollToElement(elementId: string, block: 'start' | 'center' | 'end' = 'start'): void {
    if (typeof window !== 'undefined') {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: block 
        });
      }
    }
  }

  scrollToElementWithOffset(elementId: string, offset: number = 0): void {
    if (typeof window !== 'undefined') {
      const element = document.getElementById(elementId);
      if (element) {
        const elementPosition = element.offsetTop + offset;
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
      }
    }
  }

  scrollToPosition(position: number): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: position,
        behavior: 'smooth'
      });
    }
  }

  scrollToTop(): void {
    this.scrollToPosition(0);
  }

  getCurrentScrollPosition(): number {
    if (typeof window !== 'undefined') {
      return window.scrollY || window.pageYOffset || 0;
    }
    return 0;
  }

  isScrolledBeyond(threshold: number): boolean {
    return this.getCurrentScrollPosition() > threshold;
  }
}