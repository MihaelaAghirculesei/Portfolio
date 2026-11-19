import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslationService } from '../../../shared/services/translation.service';
import { ScrollService } from '../../../shared/services/scroll.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LocalePathPipe } from '../../../shared/pipes/locale-path.pipe';

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

/** An external link (`href`) or a page of this site (`route`). */
interface CaseStudyLink {
  labelKey: string;
  href?: string;
  route?: string;
  displayKey?: string;
  display?: string;
}

@Component({
  selector: 'app-case-study-dineos',
  imports: [RouterLink, TranslatePipe, LocalePathPipe],
  templateUrl: './case-study-dineos.component.html',
  styleUrl: '../case-study.shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaseStudyDineosComponent implements OnInit {
  private readonly translateService = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly scrollService = inject(ScrollService);
  private readonly destroyRef = inject(DestroyRef);

  // The guest view of a demo table: the page a diner sees after scanning the QR code.
  protected readonly liveUrl =
    'https://dineos-frontend-staging-aghirculesei.onrender.com/menu/SOJArCas5AbVgDWPhGYL2udnAax8FsGXeRBH3cybjazR7LbixIekaUONXi0cDdrD';
  protected readonly liveUrlDisplay = 'dineos-frontend-staging-aghirculesei.onrender.com';
  protected readonly screenshotsBasePath = 'assets/img/case-studies/dineos/';

  protected readonly stats: CaseStudyStat[] = [
    {
      value: '750+',
      labelKey: 'caseStudyDineos.results.testsLabel',
      detailKey: 'caseStudyDineos.results.testsDetail',
    },
    {
      value: '93 %',
      labelKey: 'caseStudyDineos.results.coverageLabel',
      detailKey: 'caseStudyDineos.results.coverageDetail',
    },
    {
      value: '6–83 ms',
      labelKey: 'caseStudyDineos.results.medianLabel',
      detailKey: 'caseStudyDineos.results.medianDetail',
    },
    {
      value: '0 %',
      labelKey: 'caseStudyDineos.results.errorsLabel',
      detailKey: 'caseStudyDineos.results.errorsDetail',
    },
    { value: '65+', labelKey: 'caseStudyDineos.results.pullRequestsLabel' },
    { value: '7', labelKey: 'caseStudyDineos.results.adrLabel' },
    { value: '30', labelKey: 'caseStudyDineos.results.scenariosLabel' },
    { value: '3', labelKey: 'caseStudyDineos.results.languagesLabel' },
  ];

  protected readonly whatItDoesKeys: string[] = [1, 2, 3, 4, 5].map(
    (n) => `caseStudyDineos.whatItDoes.item${n}`
  );

  protected readonly highlightItems: CaseStudyHighlightItem[] = [1, 2, 3, 4, 5, 6].map((n) => ({
    titleKey: `caseStudyDineos.highlights.item${n}Title`,
    bodyKey: `caseStudyDineos.highlights.item${n}Body`,
  }));

  protected readonly learnedKeys: string[] = [1, 2, 3, 4].map(
    (n) => `caseStudyDineos.learned.item${n}`
  );

  protected readonly techStack: string[] = [
    'Python 3.11', 'FastAPI', 'SQLAlchemy (async)', 'PostgreSQL', 'Alembic', 'Redis (Pub/Sub)',
    'WebSocket', 'Angular 21', 'NgRx', 'TypeScript', 'Stripe', 'Docker', 'Pytest', 'Vitest',
    'Playwright', 'OpenTelemetry', 'Prometheus', 'Grafana', 'Sentry', 'GitHub Actions', 'Render',
    'Neon',
  ];

  protected readonly links: CaseStudyLink[] = [
    {
      labelKey: 'caseStudyDineos.links.demo',
      href: this.liveUrl,
      display: this.liveUrlDisplay,
    },
    {
      labelKey: 'caseStudyDineos.links.code',
      route: '/contact',
      displayKey: 'caseStudyDineos.links.codeOnRequest',
    },
  ];

  protected readonly screenshots: CaseStudyScreenshot[] = [
    { file: '01-guest-phone.webp', altKey: 'caseStudyDineos.screenshots.guestPhone' },
    { file: '02-kitchen-board.webp', altKey: 'caseStudyDineos.screenshots.kitchenBoard' },
    { file: '03-tables-overview.webp', altKey: 'caseStudyDineos.screenshots.tablesOverview' },
    { file: '04-admin-menu.webp', altKey: 'caseStudyDineos.screenshots.adminMenu' },
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
