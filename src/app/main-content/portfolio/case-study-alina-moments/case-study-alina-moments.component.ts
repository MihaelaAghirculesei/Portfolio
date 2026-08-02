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

interface CaseStudyEngineeringItem {
  titleKey: string;
  bodyKey: string;
}

interface CaseStudyScreenshot {
  file: string;
  altKey: string;
}

@Component({
  selector: 'app-case-study-alina-moments',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './case-study-alina-moments.component.html',
  styleUrl: './case-study-alina-moments.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaseStudyAlinaMomentsComponent implements OnInit {
  private readonly translateService = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly scrollService = inject(ScrollService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly liveUrl = 'https://alina-moments-photography.vercel.app/it';
  protected readonly liveUrlDisplay = 'alina-moments-photography.vercel.app';
  protected readonly screenshotsBasePath = 'assets/img/case-studies/alina-moments/';

  protected readonly stats: CaseStudyStat[] = [
    {
      value: '86/100',
      labelKey: 'caseStudyAlinaMoments.results.performanceLabel',
      detailKey: 'caseStudyAlinaMoments.results.performanceDetail',
    },
    { value: '100/100', labelKey: 'caseStudyAlinaMoments.results.accessibilityLabel' },
    { value: '100/100', labelKey: 'caseStudyAlinaMoments.results.seoLabel' },
    { value: '96/100', labelKey: 'caseStudyAlinaMoments.results.bestPracticesLabel' },
    { value: '279', labelKey: 'caseStudyAlinaMoments.results.unitTestsLabel' },
    { value: '192', labelKey: 'caseStudyAlinaMoments.results.e2eTestsLabel' },
    { value: '374', labelKey: 'caseStudyAlinaMoments.results.commitsLabel' },
    { value: '48', labelKey: 'caseStudyAlinaMoments.results.pullRequestsLabel' },
    { value: '447/500 KB', labelKey: 'caseStudyAlinaMoments.results.bundleSizeLabel' },
  ];

  protected readonly engineeringItems: CaseStudyEngineeringItem[] = [1, 2, 3, 4, 5].map((n) => ({
    titleKey: `caseStudyAlinaMoments.engineering.item${n}Title`,
    bodyKey: `caseStudyAlinaMoments.engineering.item${n}Body`,
  }));

  protected readonly honestStatusKeys: string[] = [1, 2, 3, 4].map(
    (n) => `caseStudyAlinaMoments.honestStatus.item${n}`
  );

  protected readonly techStack: string[] = [
    'Next.js 16 (App Router)', 'React 19', 'TypeScript 5', 'Tailwind CSS 4', 'Framer Motion',
    'GSAP + ScrollTrigger', 'Lenis', 'Drizzle ORM', 'Neon Postgres', 'Vercel KV', 'Cal.com',
    'Resend', 'Sentry', 'Vitest + Testing Library', 'Playwright', 'Codecov', 'GitHub Actions', 'Vercel Hosting',
  ];

  protected readonly screenshots: CaseStudyScreenshot[] = [
    { file: '01-hero-desktop.webp', altKey: 'caseStudyAlinaMoments.screenshots.hero' },
    { file: '02-home-mobile.webp', altKey: 'caseStudyAlinaMoments.screenshots.homeMobile' },
    { file: '03-portfolio.webp', altKey: 'caseStudyAlinaMoments.screenshots.portfolio' },
    { file: '04-leistungen.webp', altKey: 'caseStudyAlinaMoments.screenshots.leistungen' },
    { file: '05-testimonial-giuseppe.webp', altKey: 'caseStudyAlinaMoments.screenshots.testimonialShot' },
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
