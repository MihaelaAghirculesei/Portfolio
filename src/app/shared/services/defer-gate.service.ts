import { Injectable, signal } from '@angular/core';

/**
 * Lets NavigationService force the home page's below-the-fold `@defer (on
 * viewport)` sections to render immediately when jumping to a section from
 * another route, instead of waiting for their own viewport trigger. Without
 * this, a cross-page jump lands on placeholder-sized sections and then has
 * to visibly re-scroll once their real (differently sized) content loads.
 */
@Injectable({ providedIn: 'root' })
export class DeferGateService {
  readonly revealAll = signal(false);
}
