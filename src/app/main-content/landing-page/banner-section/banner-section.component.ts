import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-banner-section',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './banner-section.component.html',
  styleUrl: './banner-section.component.scss'
})
export class BannerSectionComponent {

}