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
      this.scrollService.scrollToElement(sectionId, 'start');
    } else {
      this.router.navigate(['/']).then(
        () => {
          setTimeout(() => this.scrollService.scrollToElement(sectionId, 'start'), delay);
        },
        (error) => {
          this.logger.error('Navigation to home failed:', error);
        }
      );
    }
  }
}
