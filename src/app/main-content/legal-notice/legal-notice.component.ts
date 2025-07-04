import { Component } from '@angular/core';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-legal-notice',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './legal-notice.component.html',
  styleUrl: './legal-notice.component.scss'
})
export class ImpressumComponent {
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0});
    }
  }
}