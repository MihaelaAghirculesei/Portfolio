import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ScrollService } from './scroll.service';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private readonly logger = inject(LoggerService);

  constructor(private router: Router) {}

  navigateToHome(): Promise<boolean> {
    return this.router.navigate(['/']).catch((error) => {
      this.logger.error('Navigation to home failed:', error);
      return false;
    });
  }

  navigateToHomeWithScroll(scrollService: ScrollService, sectionId: string, delay = 100): void {
    if (this.router.url === '/' || this.router.url === '') {
      scrollService.scrollToElement(sectionId, 'start');
    } else {
      this.router.navigate(['/']).then(
        () => {
          setTimeout(() => {
            scrollService.scrollToElement(sectionId, 'start');
          }, delay);
        },
        (error) => {
          this.logger.error('Navigation to home failed:', error);
        }
      );
    }
  }
}
