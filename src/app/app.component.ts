import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/header/header.component';
import { LandingpageComponent } from './main-content/landing-page/landing-page.component';
import { AboutmeComponent } from './main-content/about-me/about-me.component';
import { SkillsComponent } from './main-content/skills/skills.component';
import { PortofolioComponent } from './main-content/portofolio/portofolio.component';
import { FeedbacksComponent } from './main-content/feedback/feedback.component';
import { ContactComponent } from './main-content/contact/contact.component';
import { FooterComponent } from './shared/footer/footer.component';
import { LoggerService } from './shared/services/logger.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    LandingpageComponent,
    AboutmeComponent,
    SkillsComponent,
    PortofolioComponent,
    FeedbacksComponent,
    ContactComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  showMainContent = true;

  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);
  private readonly titleService = inject(Title);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.initializeTranslation();
    this.setupRouterSubscription();
  }

  private initializeTranslation(): void {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  private setupRouterSubscription(): void {
    this.showMainContent = this.router.url === '/';

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (event: NavigationEnd) => {
          this.showMainContent = event.url === '/';
          if (this.showMainContent) {
            this.titleService.setTitle('Mihaela Melania Aghirculesei');
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.logger.error('Router events error:', error);
        }
      });
  }
}