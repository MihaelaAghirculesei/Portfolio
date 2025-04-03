import { Component } from '@angular/core';
import { LandingpageComponent } from '../landing-page/landing-page.component';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [LandingpageComponent,],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent {

}
