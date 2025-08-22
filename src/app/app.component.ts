import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MainContentComponent } from './main-content/main-content.component';
import { LandingpageComponent } from './main-content/landing-page/landing-page.component';
import { AboutmeComponent } from './main-content/about-me/about-me.component';
import { SkillsComponent } from './main-content/skills/skills.component';
import { PortofolioComponent } from './main-content/portofolio/portofolio.component';
import { FeedbacksComponent } from './main-content/feedback/feedback.component';
import { ContactComponent } from './main-content/contact/contact.component';
import { FooterComponent } from './shared/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    TranslateModule,
    MainContentComponent,
    LandingpageComponent,
    AboutmeComponent,
    SkillsComponent,
    PortofolioComponent,
    FeedbacksComponent,
    ContactComponent,
    FooterComponent,
    CommonModule 
  ],
  providers: [TranslateService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'angular-portofolio';
  showMainContent = true; 

  constructor(private router: Router) {
    this.showMainContent = this.router.url === '/';
    
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showMainContent = event.url === '/';
      }
    });
  }

  get showHeaderFooter() {
    return true; 
  }
}