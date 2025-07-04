import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MainContentComponent } from './main-content/main-content.component';
import { LandingpageComponent } from './main-content/landing-page/landing-page.component';
import { AboutmeComponent } from './main-content/about-me/about-me.component';
import { SkillsComponent } from './main-content/skills/skills.component';
import { PortofolioComponent } from './main-content/portofolio/portofolio.component';
import { FeedbacksComponent } from './main-content/feedback/feedback.component';
import { ContactComponent } from './main-content/contact/contact.component';

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
  ],
  providers: [TranslateService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'angular-portofolio';

  // constructor(private translate: TranslateService) {
  //   this.translate.addLangs(['de', 'en']);
  //   // this.translate.setDefaultLang('en');
  //   this.translate.use('en');
  // }
}
