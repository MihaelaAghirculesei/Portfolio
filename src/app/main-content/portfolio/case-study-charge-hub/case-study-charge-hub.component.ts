import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslationService } from '../../../shared/services/translation.service';
import { ScrollService } from '../../../shared/services/scroll.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

interface CaseStudyStat {
  value: string;
  labelKey: string;
  detailKey?: string;
}

interface CaseStudyHighlightItem {
  titleKey: string;
  bodyKey: string;
}

interface CaseStudyScreenshot {
  file: string;
  altKey: string;
}

interface CaseStudyLink {
  labelKey: string;
  href: string;
  display: string;
}

@Component({
  selector: 'app-case-study-charge-hub',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './case-study-charge-hub.component.html',
  styleUrl: './case-study-charge-hub.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaseStudyChargeHubComponent implements OnInit {
  private readonly translateService = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly scrollService = inject(ScrollService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly liveUrl = 'https://charge-hub-one.vercel.app/de';
  protected readonly liveUrlDisplay = 'charge-hub-one.vercel.app';
  protected readonly codeUrl = 'https://github.com/MihaelaAghirculesei/ChargeHub';
  protected readonly dataUrl = 'https://openchargemap.org/';
  protected readonly screenshotsBasePath = 'assets/img/case-studies/charge-hub/';

  protected readonly stats: CaseStudyStat[] = [
    { value: '232', labelKey: 'caseStudyChargeHub.results.commitsLabel' },
    { value: '40+', labelKey: 'caseStudyChargeHub.results.pullRequestsLabel' },
    { value: '7', labelKey: 'caseStudyChargeHub.results.adrLabel' },
    { value: '~92%', labelKey: 'caseStudyChargeHub.results.coverageLabel' },
    {
      value: '4',
      labelKey: 'caseStudyChargeHub.results.e2eLabel',
      detailKey: 'caseStudyChargeHub.results.e2eDetail',
    },
    { value: '19', labelKey: 'caseStudyChargeHub.results.evalLabel' },
    {
      value: '46 → ≥82',
      labelKey: 'caseStudyChargeHub.results.perfLabel',
      detailKey: 'caseStudyChargeHub.results.perfDetail',
    },
    { value: '100 · 100', labelKey: 'caseStudyChargeHub.results.a11ySeoLabel' },
  ];

  protected readonly whatItDoesKeys: string[] = [1, 2, 3, 4, 5].map(
    (n) => `caseStudyChargeHub.whatItDoes.item${n}`
  );

  protected readonly highlightItems: CaseStudyHighlightItem[] = [1, 2, 3, 4, 5, 6].map((n) => ({
    titleKey: `caseStudyChargeHub.highlights.item${n}Title`,
    bodyKey: `caseStudyChargeHub.highlights.item${n}Body`,
  }));

  protected readonly limitationsKeys: string[] = [1, 2, 3, 4, 5].map(
    (n) => `caseStudyChargeHub.limitations.item${n}`
  );

  protected readonly learnedKeys: string[] = [1, 2, 3, 4].map(
    (n) => `caseStudyChargeHub.learned.item${n}`
  );

  protected readonly techStack: string[] = [
    'Nuxt 4', 'Vue 3', 'TypeScript (strict)', 'Vuetify 3', 'SCSS', 'Pinia',
    'MapLibre GL + OpenStreetMap', 'Chart.js (vue-chartjs)', 'Zod',
    'Claude Haiku 4.5 (@anthropic-ai/sdk)', 'Nitro server routes', '@nuxtjs/i18n',
    'Vitest + @nuxt/test-utils', 'Playwright', 'axe-core', 'GitHub Actions',
    'Lighthouse CI', 'Vercel',
  ];

  protected readonly links: CaseStudyLink[] = [
    {
      labelKey: 'caseStudyChargeHub.links.code',
      href: this.codeUrl,
      display: 'github.com/MihaelaAghirculesei/ChargeHub',
    },
    {
      labelKey: 'caseStudyChargeHub.links.live',
      href: this.liveUrl,
      display: 'charge-hub-one.vercel.app',
    },
    {
      labelKey: 'caseStudyChargeHub.links.data',
      href: this.dataUrl,
      display: 'openchargemap.org',
    },
  ];

  protected readonly screenshots: CaseStudyScreenshot[] = [
    { file: '01-dashboard.webp', altKey: 'caseStudyChargeHub.screenshots.dashboard' },
    { file: '02-station-detail.webp', altKey: 'caseStudyChargeHub.screenshots.stationDetail' },
    { file: '03-analytics.webp', altKey: 'caseStudyChargeHub.screenshots.analytics' },
    { file: '04-nl-search.webp', altKey: 'caseStudyChargeHub.screenshots.nlSearch' },
  ];

  constructor() {
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cdr.markForCheck());
  }

  ngOnInit(): void {
    this.scrollService.scrollToTop();
  }

  screenshotSrc(file: string): string {
    return this.screenshotsBasePath + file;
  }
}
