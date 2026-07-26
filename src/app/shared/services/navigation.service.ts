import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ScrollService } from './scroll.service';
import { LoggerService } from './logger.service';
import { SCROLL_CONFIG } from '../constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private readonly logger = inject(LoggerService);
  private readonly router = inject(Router);
  private readonly scrollService = inject(ScrollService);

  navigateToHome(): Promise<boolean> {
    return this.router.navigate(['/']).catch((error) => {
      this.logger.error('Navigation to home failed:', error);
      return false;
    });
  }

  scrollToSection(sectionId: string, delay: number = SCROLL_CONFIG.NAVIGATION_DELAY): void {
    if (this.router.url === '/' || this.router.url === '') {
      this.scrollWithCorrection(sectionId);
    } else {
      this.router.navigate(['/']).then(
        () => {
          setTimeout(() => this.scrollWithCorrection(sectionId), delay);
        },
        (error) => {
          this.logger.error('Navigation to home failed:', error);
        }
      );
    }
  }

  /**
   * Scrolls to the section, then re-scrolls once more shortly after.
   * Sections rendered behind an `@defer (on viewport)` block (e.g. Skills)
   * can still be growing to their real height when the first scroll fires,
   * undershooting the target — the correction re-aligns once layout settles.
   */
  private scrollWithCorrection(sectionId: string): void {
    this.scrollService.scrollToElement(sectionId, 'start');
    setTimeout(
      () => this.scrollService.scrollToElement(sectionId, 'start'),
      SCROLL_CONFIG.SCROLL_CORRECTION_DELAY
    );
  }
}
