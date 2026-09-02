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
  selector: 'app-case-study-bfsg-scanner',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './case-study-bfsg-scanner.component.html',
  styleUrl: './case-study-bfsg-scanner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaseStudyBfsgScannerComponent implements OnInit {
  private readonly translateService = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly scrollService = inject(ScrollService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly npmUrl = 'https://www.npmjs.com/package/bfsg-scanner';
  protected readonly npmUrlDisplay = 'npmjs.com/package/bfsg-scanner';
  protected readonly reportUrl = 'https://mihaelaaghirculesei.github.io/bfsg-scanner/';
  protected readonly codeUrl = 'https://github.com/MihaelaAghirculesei/bfsg-scanner';
  protected readonly screenshotsBasePath = 'assets/img/case-studies/bfsg-scanner/';

  protected readonly stats: CaseStudyStat[] = [
    { value: '146', labelKey: 'caseStudyBfsgScanner.results.testsLabel' },
    { value: '28', labelKey: 'caseStudyBfsgScanner.results.pullRequestsLabel' },
    { value: '3', labelKey: 'caseStudyBfsgScanner.results.osLabel' },
    { value: '0·1·2·3', labelKey: 'caseStudyBfsgScanner.results.exitCodesLabel' },
    { value: 'JSON · HTML · PDF', labelKey: 'caseStudyBfsgScanner.results.reportFormatsLabel' },
    { value: 'SLSA', labelKey: 'caseStudyBfsgScanner.results.provenanceLabel' },
    {
      value: '24',
      labelKey: 'caseStudyBfsgScanner.results.demoViolationsLabel',
      detailKey: 'caseStudyBfsgScanner.results.demoViolationsDetail',
    },
    { value: 'WCAG → EN 301 549', labelKey: 'caseStudyBfsgScanner.results.mappingLabel' },
  ];

  protected readonly whatItDoesKeys: string[] = [1, 2, 3, 4, 5].map(
    (n) => `caseStudyBfsgScanner.whatItDoes.item${n}`
  );

  protected readonly highlightItems: CaseStudyHighlightItem[] = [1, 2, 3, 4, 5, 6].map((n) => ({
    titleKey: `caseStudyBfsgScanner.highlights.item${n}Title`,
    bodyKey: `caseStudyBfsgScanner.highlights.item${n}Body`,
  }));

  protected readonly learnedKeys: string[] = [1, 2, 3, 4].map(
    (n) => `caseStudyBfsgScanner.learned.item${n}`
  );

  protected readonly techStack: string[] = [
    'TypeScript', 'Node.js 24', 'Playwright', 'axe-core', 'Zod', 'Vitest', 'Biome',
    'GitHub Actions', 'npm (SLSA provenance)', 'ajv', 'JSON Schema',
  ];

  protected readonly links: CaseStudyLink[] = [
    {
      labelKey: 'caseStudyBfsgScanner.links.npm',
      href: this.npmUrl,
      display: this.npmUrlDisplay,
    },
    {
      labelKey: 'caseStudyBfsgScanner.links.report',
      href: this.reportUrl,
      display: 'mihaelaaghirculesei.github.io/bfsg-scanner',
    },
    {
      labelKey: 'caseStudyBfsgScanner.links.code',
      href: this.codeUrl,
      display: 'github.com/MihaelaAghirculesei/bfsg-scanner',
    },
  ];

  protected readonly screenshots: CaseStudyScreenshot[] = [
    { file: '01-report-overview.webp', altKey: 'caseStudyBfsgScanner.screenshots.reportOverview' },
    { file: '02-clause-mapping.webp', altKey: 'caseStudyBfsgScanner.screenshots.clauseMapping' },
    { file: '03-findings.webp', altKey: 'caseStudyBfsgScanner.screenshots.findings' },
    { file: '04-pull-requests.webp', altKey: 'caseStudyBfsgScanner.screenshots.pullRequests' },
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
