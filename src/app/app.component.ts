import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { LoggerService } from './shared/services/logger.service';
import { SeoService, SeoConfig } from './shared/services/seo.service';
import { environment } from '../environments/environment';

const SITE_URL = environment.siteUrl;

const SEO_CONFIGS = new Map<string, SeoConfig>([
  ['/', {
    title: 'Mihaela Melania Aghirculesei — Frontend Developer',
    description:
      'Mihaela Aghirculesei — Frontend Developer based in Germany, ' +
      'specializing in Angular, TypeScript, and modern web design. ' +
      'Available for new projects.',
    ogUrl: SITE_URL,
    ogType: 'profile',
  }],
  ['/legal-notice', {
    title: 'Legal Notice — Mihaela Aghirculesei',
    description:
      'Legal notice and imprint for the portfolio of Mihaela Melania Aghirculesei, ' +
      'Frontend Developer based in Wolfsburg, Germany. Contact and legal information.',
    ogUrl: `${SITE_URL}/legal-notice`,
  }],
  ['/datenschutz', {
    title: 'Datenschutzerklärung — Mihaela Aghirculesei',
    description:
      'Datenschutzerklärung für das Portfolio von Mihaela Melania Aghirculesei. ' +
      'Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO.',
    ogUrl: `${SITE_URL}/datenschutz`,
  }],
  ['/privacy-policy', {
    title: 'Privacy Policy — Mihaela Aghirculesei',
    description:
      'Privacy policy for the portfolio of Mihaela Melania Aghirculesei, ' +
      'Frontend Developer. Information on data processing in accordance with GDPR.',
    ogUrl: `${SITE_URL}/privacy-policy`,
  }],
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
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);
  private readonly seoService = inject(SeoService);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.initializeTranslation();
    this.setupRouterSubscription();
  }

  private initializeTranslation(): void {
    this.translate.addLangs(['en', 'de']);
    this.translate.setDefaultLang('en');

    const saved = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('lang')
      : null;
    const lang = saved === 'de' ? 'de' : 'en';
    this.translate.use(lang);
  }

  private setupRouterSubscription(): void {
    this.updateSeo(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (event: NavigationEnd) => {
          const path = event.urlAfterRedirects.split('?')[0].split('#')[0];
          this.updateSeo(path);
        },
        error: (error) => this.logger.error('Router events error:', error),
      });
  }

  private updateSeo(path: string): void {
    const config = SEO_CONFIGS.get(path) ?? SEO_CONFIGS.get('/')!;
    this.seoService.update(config);
  }
}