import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ScrollService } from './scroll.service';
import { LoggerService } from './logger.service';
import { DeferGateService } from './defer-gate.service';
import { SCROLL_CONFIG } from '../constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private readonly logger = inject(LoggerService);
  private readonly router = inject(Router);
  private readonly scrollService = inject(ScrollService);
  private readonly deferGate = inject(DeferGateService);

  navigateToHome(): Promise<boolean> {
    return this.router.navigate(['/']).catch((error) => {
      this.logger.error('Navigation to home failed:', error);
      return false;
    });
  }

  scrollToSection(sectionId: string, delay: number = SCROLL_CONFIG.NAVIGATION_DELAY): void {
    if (this.router.url === '/' || this.router.url === '') {
      this.scrollWithCorrection(sectionId, 'smooth');
    } else {
      // Coming from another route: force the deferred home sections to render
      // now instead of waiting for their own viewport trigger, so the target
      // section already has its real (not placeholder) height by the time we
      // scroll — otherwise we'd land short, then visibly re-scroll once the
      // real content loads in.
      this.deferGate.revealAll.set(true);
      setTimeout(
        () => this.deferGate.revealAll.set(false),
        delay + SCROLL_CONFIG.LAYOUT_STABLE_MAX_WAIT + 200
      );

      this.router.navigate(['/']).then(
        () => {
          setTimeout(() => this.landOnSection(sectionId), delay);
        },
        (error) => {
          this.logger.error('Navigation to home failed:', error);
        }
      );
    }
  }

  /**
   * Lands on a section coming from another route. Jumping straight there
   * with a smooth scroll would replay the whole home page scrolling past
   * underneath it — jarring. Jumping there instantly reads as a hard cut.
   * So instead: wait until the target's position has actually settled (the
   * sections above it may still be swapping their `@defer` placeholder for
   * real content), then jump instantly to just short of it and glide the
   * last stretch in with a short smooth scroll — a soft landing that never
   * shows the long scroll across the page above it, and isn't a guess at
   * how long that settling takes.
   */
  private landOnSection(sectionId: string): void {
    this.scrollService.waitForLayoutStable(sectionId).then(() => {
      this.scrollService.scrollToElement(sectionId, 'start', 'instant', SCROLL_CONFIG.LAND_NEAR_OFFSET);
      this.scrollService.scrollToElement(sectionId, 'start', 'smooth');
    });
  }

  /**
   * Scrolls to the section, then re-scrolls once more shortly after.
   * Sections rendered behind an `@defer (on viewport)` block (e.g. Skills,
   * Portfolio) are initially just a placeholder — the first scroll lands on
   * that placeholder's position, which triggers the block to load its real
   * content. That content can be taller or shorter than the placeholder, so
   * the correction re-aligns once layout settles.
   */
  private scrollWithCorrection(sectionId: string, behavior: ScrollBehavior): void {
    this.scrollService.scrollToElement(sectionId, 'start', behavior);
    this.scheduleCorrection(sectionId);
  }

  private scheduleCorrection(sectionId: string): void {
    setTimeout(
      () => this.scrollService.scrollToElement(sectionId, 'start', 'smooth'),
      SCROLL_CONFIG.SCROLL_CORRECTION_DELAY
    );
  }
}
