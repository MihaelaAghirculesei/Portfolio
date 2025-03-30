import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MainContentComponent } from './main-content/main-content.component';
import { LandingpageComponent } from './1_landing-page/landing-page.component';
import { AboutmeComponent } from './aboutme/aboutme.component';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, TranslateModule, MainContentComponent, LandingpageComponent, AboutmeComponent],
  providers: [TranslateService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-portofolio';

  // constructor(private translate: TranslateService) {
  //   this.translate.addLangs(['de', 'en']);
  //   this.translate.setDefaultLang('en');
  //   this.translate.use('en');
  // }
}