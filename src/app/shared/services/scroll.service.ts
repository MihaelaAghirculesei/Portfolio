import { Injectable } from '@angular/core';
import { BREAKPOINTS, SCROLL_CONFIG } from '../constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {

  scrollToElement(elementId: string, block: 'start' | 'center' | 'end' = 'start'): void {
    if (typeof window !== 'undefined') {
      const element = document.getElementById(elementId);
      if (element) {
        const headerHeight = SCROLL_CONFIG.HEADER_HEIGHT;
        let elementPosition = element.offsetTop - headerHeight;

        const isMobile = window.innerWidth <= BREAKPOINTS.TABLET_MAX;
        let extraOffset = 0;

        if (isMobile) {
          switch (elementId) {
            case 'aboutMe':
              extraOffset = 0;
              break;
            case 'skills':
              extraOffset = SCROLL_CONFIG.MOBILE_SKILLS_OFFSET;
              break;
            case 'projects':
              extraOffset = 20;
              break;
            case 'references':
              extraOffset = 100;
              break;
            default:
              extraOffset = 0;
          }
        }

        elementPosition = element.offsetTop - headerHeight - extraOffset;

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