import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Inject, PLATFORM_ID, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { LoggerService } from '../../shared/services/logger.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPolicyComponent implements OnInit {
  private readonly logger = inject(LoggerService);

  constructor(
    public translateService: TranslateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.translateService.onLangChange.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }
  }

  goBack(): void {
    this.router.navigate(['/']).catch((error) => {
      this.logger.error('Navigation to home failed:', error);
    });
  }

  get isGerman(): boolean {
    return this.translateService.currentLang === 'de';
  }
}
