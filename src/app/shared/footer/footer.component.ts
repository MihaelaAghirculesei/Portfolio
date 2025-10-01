import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ScrollService } from '../services/scroll.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  isHovered = false;
  currentYear = new Date().getFullYear();

  constructor(private scrollService: ScrollService, private router: Router) {}

  scrollToTop(): void {
    if (this.router.url === '/') {
      this.scrollService.scrollToElement('headLine', 'start');
    } else {
      this.router.navigate(['/']);
    }
  }
}
