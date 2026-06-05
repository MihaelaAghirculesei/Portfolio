import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject, DestroyRef } from '@angular/core';
import { Location } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslationService } from '../../shared/services/translation.service';
import { ScrollService } from '../../shared/services/scroll.service';

@Component({
    selector: 'app-privacy-policy',
    imports: [],
    templateUrl: './privacy-policy.component.html',
    styleUrl: './privacy-policy.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyPolicyComponent implements OnInit {
  private readonly translateService = inject(TranslationService);
  private readonly location = inject(Location);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly scrollService = inject(ScrollService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.cdr.markForCheck();
      });
  }

  ngOnInit(): void {
    this.scrollService.scrollToTop();
  }

  goBack(): void {
    this.location.back();
  }

  get isGerman(): boolean {
    return this.translateService.currentLang === 'de';
  }
}
