import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, NavigationError } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { TranslationService, Lang } from './shared/services/translation.service';
import { basePath, langFromPath, localizePath } from './shared/i18n/locale-path';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { TranslatePipe } from './shared/pipes/translate.pipe';
import { LoggerService } from './shared/services/logger.service';
import { SeoService, SeoConfig } from './shared/services/seo.service';
import { PlatformService } from './shared/services/platform.service';
import { environment } from '../environments/environment';

const SITE_URL = environment.siteUrl;
const STALE_CHUNK_RELOAD_KEY = 'stale-chunk-reload';

interface RouteSeoMeta {
  i18nKey: string;
  ogType?: string;
  noIndex?: boolean;
}

const NOT_FOUND_SEO_META: RouteSeoMeta = { i18nKey: 'notFound', noIndex: true };

// Keyed by language-neutral path; the language itself comes from the URL.
const ROUTE_SEO_META = new Map<string, RouteSeoMeta>([
  ['/', { i18nKey: 'home', ogType: 'profile' }],
  ['/legal-notice', { i18nKey: 'legalNotice' }],
  ['/skills', { i18nKey: 'skills' }],
  ['/projects', { i18nKey: 'projects' }],
  ['/case-study/alina-moments', { i18nKey: 'caseStudyAlinaMoments' }],
  ['/case-study/bfsg-scanner', { i18nKey: 'caseStudyBfsgScanner' }],
  ['/case-study/charge-hub', { i18nKey: 'caseStudyChargeHub' }],
  ['/feedback', { i18nKey: 'feedback' }],
  ['/contact', { i18nKey: 'contact' }],
  ['/privacy-policy', { i18nKey: 'privacyPolicy' }],
]);

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, TranslatePipe],
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
  private readonly platformLocation = inject(PlatformLocation);

  ngOnInit(): void {
    this.initializeTranslation();
    this.setupRouterSubscription();
  }

  private initializeTranslation(): void {
    const path = this.platformLocation.pathname;
    const lang = langFromPath(path);
    this.translate.use(lang);

    // The URL decides the language, so links keep working for everyone. Only a
    // visitor who chose German, arriving on an English URL, is sent to its twin.
    if (this.platformService.isBrowser && lang === 'en' && localStorage.getItem('lang') === 'de') {
      void this.router.navigateByUrl(localizePath(path, 'de'), { replaceUrl: true });
    }
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
            const lang = langFromPath(path);
            if (this.translate.currentLang !== lang) {
              this.translate.use(lang);
            }
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
    const lang = langFromPath(path);
    const base = basePath(path);
    const meta = ROUTE_SEO_META.get(base) ?? NOT_FOUND_SEO_META;
    const config: SeoConfig = {
      title: this.translate.instant(`seo.${meta.i18nKey}.title`, undefined, lang),
      description: this.translate.instant(`seo.${meta.i18nKey}.description`, undefined, lang),
      ogUrl: meta === NOT_FOUND_SEO_META ? `${SITE_URL}/404` : this.absoluteUrl(base, lang),
      lang,
      alternates: { en: this.absoluteUrl(base, 'en'), de: this.absoluteUrl(base, 'de') },
      ...(meta.ogType ? { ogType: meta.ogType } : {}),
      ...(meta.noIndex ? { noIndex: true } : {}),
    };
    this.seoService.update(config);
  }

  private absoluteUrl(base: string, lang: Lang): string {
    // Cloudflare Pages redirects /skills to /skills/, so that is the page's real URL.
    const path = localizePath(base, lang);
    return path === '/' ? SITE_URL : `${SITE_URL}${path}/`;
  }
}
