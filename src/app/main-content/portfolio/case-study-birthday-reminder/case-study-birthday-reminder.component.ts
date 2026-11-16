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
  selector: 'app-case-study-birthday-reminder',
  imports: [RouterLink, TranslatePipe, LocalePathPipe],
  templateUrl: './case-study-birthday-reminder.component.html',
  styleUrl: './case-study-birthday-reminder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaseStudyBirthdayReminderComponent implements OnInit {
  private readonly translateService = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly scrollService = inject(ScrollService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly liveUrl = 'https://birthday-reminder-aghirculesei.pages.dev';
  protected readonly liveUrlDisplay = 'birthday-reminder-aghirculesei.pages.dev';
  protected readonly codeUrl = 'https://github.com/MihaelaAghirculesei/birthday-reminder-pro';
  protected readonly screenshotsBasePath = 'assets/img/case-studies/birthday-reminder/';

  protected readonly stats: CaseStudyStat[] = [
    { value: '1200+', labelKey: 'caseStudyBirthdayReminder.results.commitsLabel' },
    {
      value: '2200+',
      labelKey: 'caseStudyBirthdayReminder.results.unitTestsLabel',
      detailKey: 'caseStudyBirthdayReminder.results.unitTestsDetail',
    },
    { value: '120+', labelKey: 'caseStudyBirthdayReminder.results.e2eTestsLabel' },
    { value: '72', labelKey: 'caseStudyBirthdayReminder.results.rulesTestsLabel' },
    {
      value: '> 91 %',
      labelKey: 'caseStudyBirthdayReminder.results.coverageLabel',
      detailKey: 'caseStudyBirthdayReminder.results.coverageDetail',
    },
    { value: '470 KB', labelKey: 'caseStudyBirthdayReminder.results.bundleLabel' },
    { value: '130+', labelKey: 'caseStudyBirthdayReminder.results.pullRequestsLabel' },
    { value: '44', labelKey: 'caseStudyBirthdayReminder.results.releasesLabel' },
  ];

  protected readonly whatItDoesKeys: string[] = [1, 2, 3, 4, 5].map(
    (n) => `caseStudyBirthdayReminder.whatItDoes.item${n}`
  );

  protected readonly highlightItems: CaseStudyHighlightItem[] = [1, 2, 3, 4, 5, 6].map((n) => ({
    titleKey: `caseStudyBirthdayReminder.highlights.item${n}Title`,
    bodyKey: `caseStudyBirthdayReminder.highlights.item${n}Body`,
  }));

  protected readonly learnedKeys: string[] = [1, 2, 3, 4].map(
    (n) => `caseStudyBirthdayReminder.learned.item${n}`
  );

  protected readonly techStack: string[] = [
    'Angular 22', 'TypeScript', 'NgRx', 'RxJS', 'Angular Material', 'Angular SSR', 'Capacitor 8',
    'IndexedDB', 'Firebase Auth', 'Firestore', 'App Check', 'Google Calendar API', 'Sentry',
    'Vitest', 'Cypress', 'axe-core', 'Lighthouse CI', 'GitHub Actions', 'semantic-release',
    'Cloudflare Pages',
  ];

  protected readonly links: CaseStudyLink[] = [
    {
      labelKey: 'caseStudyBirthdayReminder.links.demo',
      href: this.liveUrl,
      display: this.liveUrlDisplay,
    },
    {
      labelKey: 'caseStudyBirthdayReminder.links.architecture',
      href: `${this.codeUrl}/blob/main/ARCHITECTURE.md`,
      display: 'ARCHITECTURE.md',
    },
    {
      labelKey: 'caseStudyBirthdayReminder.links.changelog',
      href: `${this.codeUrl}/blob/main/CHANGELOG.md`,
      display: 'CHANGELOG.md',
    },
    {
      labelKey: 'caseStudyBirthdayReminder.links.code',
      href: this.codeUrl,
      display: 'github.com/MihaelaAghirculesei/birthday-reminder-pro',
    },
  ];

  protected readonly screenshots: CaseStudyScreenshot[] = [
    { file: '01-dashboard.webp', altKey: 'caseStudyBirthdayReminder.screenshots.dashboard' },
    { file: '02-birthday-list.webp', altKey: 'caseStudyBirthdayReminder.screenshots.birthdayList' },
    { file: '03-backup-and-chart.webp', altKey: 'caseStudyBirthdayReminder.screenshots.backupAndChart' },
    { file: '04-categories-dark.webp', altKey: 'caseStudyBirthdayReminder.screenshots.categoriesDark' },
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
