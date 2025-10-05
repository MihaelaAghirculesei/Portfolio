import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(private router: Router) {}

  navigateToHome(): Promise<boolean> {
    return this.router.navigate(['/']).catch((error) => {
      console.error('Navigation to home failed:', error);
      return false;
    });
  }

  navigateToHomeWithScroll(scrollService: any, sectionId: string, delay: number = 100): void {
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
          console.error('Navigation to home failed:', error);
        }
      );
    }
  }
}
