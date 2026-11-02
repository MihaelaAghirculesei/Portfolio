import { ActivatedRouteSnapshot, Route } from '@angular/router';
import { LocaleRouteReuseStrategy } from './locale-route-reuse.strategy';

describe('LocaleRouteReuseStrategy', () => {
  const strategy = new LocaleRouteReuseStrategy();
  const snapshot = (routeConfig: Route): ActivatedRouteSnapshot =>
    ({ routeConfig, data: { localeRoot: true } }) as unknown as ActivatedRouteSnapshot;
  const enRoot: Route = { path: '', data: { localeRoot: true } };
  const deRoot: Route = { path: 'de', data: { localeRoot: true } };
  const skills: Route = { path: 'skills' };
  const projects: Route = { path: 'projects' };

  it('reuses across the two language roots', () => {
    expect(strategy.shouldReuseRoute(snapshot(deRoot), snapshot(enRoot))).toBe(true);
  });

  it('reuses a page shared between both languages', () => {
    expect(strategy.shouldReuseRoute(snapshot(skills), snapshot(skills))).toBe(true);
  });

  it('does not reuse different pages, even with inherited data', () => {
    expect(strategy.shouldReuseRoute(snapshot(skills), snapshot(projects))).toBe(false);
  });
});
