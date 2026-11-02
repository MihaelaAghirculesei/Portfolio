import { ActivatedRouteSnapshot, BaseRouteReuseStrategy } from '@angular/router';

/**
 * Switching language keeps the rendered page instead of rebuilding it. The page
 * routes are shared between both languages, so only their two parents differ.
 */
export class LocaleRouteReuseStrategy extends BaseRouteReuseStrategy {
  override shouldReuseRoute(future: ActivatedRouteSnapshot, current: ActivatedRouteSnapshot): boolean {
    return super.shouldReuseRoute(future, current) || (isLocaleRoot(future) && isLocaleRoot(current));
  }
}

function isLocaleRoot(route: ActivatedRouteSnapshot): boolean {
  // routeConfig.data, because route.data also inherits from componentless parents.
  return route.routeConfig?.data?.['localeRoot'] === true;
}
