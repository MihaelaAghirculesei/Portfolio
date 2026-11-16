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

interface CaseStudyLink {
  labelKey: string;
  href: string;
  display: string;
}

@Component({
  selector: 'app-case-study-normeon',
  imports: [RouterLink, TranslatePipe, LocalePathPipe],
  templateUrl: './case-study-normeon.component.html',
  styleUrl: './case-study-normeon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaseStudyNormeonComponent implements OnInit {
  private readonly translateService = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly scrollService = inject(ScrollService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly liveUrl = 'https://normeon.onrender.com';
  protected readonly liveUrlDisplay = 'normeon.onrender.com';
  protected readonly codeUrl = 'https://github.com/MihaelaAghirculesei/normeon-german-technical-rag';
  protected readonly screenshotsBasePath = 'assets/img/case-studies/normeon/';

  protected readonly stats: CaseStudyStat[] = [
    {
      value: '39 / 40',
      labelKey: 'caseStudyNormeon.results.recallLabel',
      detailKey: 'caseStudyNormeon.results.recallDetail',
    },
    { value: '10 / 10', labelKey: 'caseStudyNormeon.results.declinedLabel' },
    { value: '0', labelKey: 'caseStudyNormeon.results.inventedLabel' },
    { value: '50', labelKey: 'caseStudyNormeon.results.questionsLabel' },
    { value: '750+', labelKey: 'caseStudyNormeon.results.testsLabel' },
    { value: '60+', labelKey: 'caseStudyNormeon.results.pullRequestsLabel' },
    { value: '5', labelKey: 'caseStudyNormeon.results.adrLabel' },
    { value: '0 €', labelKey: 'caseStudyNormeon.results.costLabel' },
  ];

  protected readonly whatItDoesKeys: string[] = [1, 2, 3, 4, 5].map(
    (n) => `caseStudyNormeon.whatItDoes.item${n}`
  );

  protected readonly highlightItems: CaseStudyHighlightItem[] = [1, 2, 3, 4, 5, 6].map((n) => ({
    titleKey: `caseStudyNormeon.highlights.item${n}Title`,
    bodyKey: `caseStudyNormeon.highlights.item${n}Body`,
  }));

  protected readonly learnedKeys: string[] = [1, 2, 3, 4].map(
    (n) => `caseStudyNormeon.learned.item${n}`
  );

  protected readonly techStack: string[] = [
    'Python 3.13', 'FastAPI', 'SQLAlchemy (async)', 'PostgreSQL 18', 'pgvector', 'Alembic',
    'Angular 22', 'TypeScript', 'Gemini', 'Docker', 'Pytest', 'Testcontainers', 'Vitest',
    'GitHub Actions', 'Render', 'Neon',
  ];

  protected readonly links: CaseStudyLink[] = [
    {
      labelKey: 'caseStudyNormeon.links.demo',
      href: this.liveUrl,
      display: this.liveUrlDisplay,
    },
    {
      labelKey: 'caseStudyNormeon.links.video',
      href: 'https://cdn.jsdelivr.net/gh/MihaelaAghirculesei/normeon-german-technical-rag@main/docs/video/normeon-demo.mp4',
      display: 'normeon-demo.mp4',
    },
    {
      labelKey: 'caseStudyNormeon.links.evaluation',
      href: `${this.codeUrl}/blob/main/docs/EVALUATION.md`,
      display: 'docs/EVALUATION.md',
    },
    {
      labelKey: 'caseStudyNormeon.links.code',
      href: this.codeUrl,
      display: 'github.com/MihaelaAghirculesei/normeon-german-technical-rag',
    },
  ];

  protected readonly screenshots: CaseStudyScreenshot[] = [
    { file: '01-cited-answer.webp', altKey: 'caseStudyNormeon.screenshots.citedAnswer' },
    { file: '02-version-conflict.webp', altKey: 'caseStudyNormeon.screenshots.versionConflict' },
    { file: '03-declined-question.webp', altKey: 'caseStudyNormeon.screenshots.declinedQuestion' },
    { file: '04-recall-by-category.webp', altKey: 'caseStudyNormeon.screenshots.recallByCategory' },
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
