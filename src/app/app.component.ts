import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
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
})
export class AppComponent implements OnInit {
  readonly title = 'angular-portofolio';
  readonly showHeaderFooter = true;
  showMainContent = true;

  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

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
      .subscribe((event: NavigationEnd) => {
        this.showMainContent = event.url === '/';
      });
  }
}