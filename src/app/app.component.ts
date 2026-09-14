import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, NavigationError } from '@angular/router';
import { TranslationService, Lang } from './shared/services/translation.service';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { LoggerService } from './shared/services/logger.service';
import { SeoService, SeoConfig } from './shared/services/seo.service';
import { PlatformService } from './shared/services/platform.service';
import { environment } from '../environments/environment';

const SITE_URL = environment.siteUrl;
const STALE_CHUNK_RELOAD_KEY = 'stale-chunk-reload';

interface RouteSeoMeta {
  i18nKey: string;
  lang: Lang;
  ogPath: string;
  ogType?: string;
}

const ROUTE_SEO_META = new Map<string, RouteSeoMeta>([
  ['/', { i18nKey: 'home', lang: 'en', ogPath: '', ogType: 'profile' }],
  ['/legal-notice', { i18nKey: 'legalNotice', lang: 'en', ogPath: '/legal-notice' }],
  ['/datenschutz', { i18nKey: 'datenschutz', lang: 'de', ogPath: '/datenschutz' }],
  ['/skills', { i18nKey: 'skills', lang: 'en', ogPath: '/skills' }],
  ['/projects', { i18nKey: 'projects', lang: 'en', ogPath: '/projects' }],
  ['/case-study/alina-moments', { i18nKey: 'caseStudyAlinaMoments', lang: 'en', ogPath: '/case-study/alina-moments' }],
  ['/case-study/bfsg-scanner', { i18nKey: 'caseStudyBfsgScanner', lang: 'en', ogPath: '/case-study/bfsg-scanner' }],
  ['/case-study/charge-hub', { i18nKey: 'caseStudyChargeHub', lang: 'en', ogPath: '/case-study/charge-hub' }],
  ['/feedback', { i18nKey: 'feedback', lang: 'en', ogPath: '/feedback' }],
  ['/contact', { i18nKey: 'contact', lang: 'en', ogPath: '/contact' }],
  ['/privacy-policy', { i18nKey: 'privacyPolicy', lang: 'en', ogPath: '/privacy-policy' }],
]);

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly translate = inject(TranslationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);
  private readonly seoService = inject(SeoService);
  private readonly platformService = inject(PlatformService);

  ngOnInit(): void {
    this.initializeTranslation();
    this.setupRouterSubscription();
  }

  private initializeTranslation(): void {
    const saved = this.platformService.isBrowser
      ? localStorage.getItem('lang')
      : null;
    const lang = saved === 'de' ? 'de' : 'en';
    this.translate.use(lang);
  }

  private setupRouterSubscription(): void {
    this.updateSeo(this.router.url);

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd | NavigationError =>
            event instanceof NavigationEnd || event instanceof NavigationError
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (event) => {
          if (event instanceof NavigationEnd) {
            const path = event.urlAfterRedirects.split('?')[0].split('#')[0];
            this.updateSeo(path);
            // A successful navigation means chunks are loading fine again —
            // re-arm the stale-chunk recovery for any future deploy.
            this.platformService.window?.sessionStorage.removeItem(STALE_CHUNK_RELOAD_KEY);
          } else {
            this.handleNavigationError(event);
          }
        },
        error: (error) => this.logger.error('Router events error:', error),
      });
  }

  private handleNavigationError(event: NavigationError): void {
    const message = event.error instanceof Error ? event.error.message : String(event.error ?? '');
    const isStaleChunk = /Failed to fetch dynamically imported module|Loading chunk .* failed|ChunkLoadError/i.test(
      message
    );
    if (!isStaleChunk) {
      this.logger.error('Navigation error:', event.error);
      return;
    }

    const win = this.platformService.window;
    if (!win) {
      return;
    }

    // Cloudflare Pages replaces JS assets atomically on every deploy. A tab
    // left open across a deploy can still reference a chunk filename that no
    // longer exists on the new deployment. A hard reload fetches the current
    // index.html (and its matching chunks); the sessionStorage guard stops a
    // genuinely broken deployment from reload-looping.
    if (win.sessionStorage.getItem(STALE_CHUNK_RELOAD_KEY)) {
      this.logger.error('Stale-chunk reload already attempted, giving up:', event.error);
      return;
    }
    win.sessionStorage.setItem(STALE_CHUNK_RELOAD_KEY, '1');
    win.location.href = event.url;
  }

  private updateSeo(path: string): void {
    const meta = ROUTE_SEO_META.get(path) ?? ROUTE_SEO_META.get('/')!;
    const config: SeoConfig = {
      title: this.translate.instant(`seo.${meta.i18nKey}.title`, undefined, meta.lang),
      description: this.translate.instant(`seo.${meta.i18nKey}.description`, undefined, meta.lang),
      ogUrl: `${SITE_URL}${meta.ogPath}`,
      ...(meta.ogType ? { ogType: meta.ogType } : {}),
    };
    this.seoService.update(config);
  }
}
