import { Location } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { TranslationService } from '../../shared/services/translation.service';
import { PlatformService } from '../../shared/services/platform.service';
import { Router } from '@angular/router';
import { LoggerService } from '../../shared/services/logger.service';

@Component({
    selector: 'app-privacy-policy',
    imports: [],
    templateUrl: './privacy-policy.component.html',
    styleUrl: './privacy-policy.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyPolicyComponent implements OnInit {
  private readonly logger = inject(LoggerService);

  constructor(
    public translateService: TranslationService,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private platformService: PlatformService
  ) {
    this.translateService.onLangChange.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    if (this.platformService.isBrowser) {
      window.scrollTo(0, 0);
    }
  }

  goBack(): void {
    this.location.back();
  }

  get isGerman(): boolean {
    return this.translateService.currentLang === 'de';
  }
}
