import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { LandingPageComponent } from '../landing-page/landing-page.component';
import { AboutMeComponent } from '../about-me/about-me.component';
import { SkillsComponent } from '../skills/skills.component';
import { PortfolioComponent } from '../portfolio/portfolio.component';
import { FeedbacksComponent } from '../feedback/feedback.component';
import { ContactComponent } from '../contact/contact.component';
import { DeferGateService } from '../../shared/services/defer-gate.service';

@Component({
  selector: 'app-home',
  imports: [
    LandingPageComponent,
    AboutMeComponent,
    SkillsComponent,
    PortfolioComponent,
    FeedbacksComponent,
    ContactComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected readonly deferGate = inject(DeferGateService);
}
