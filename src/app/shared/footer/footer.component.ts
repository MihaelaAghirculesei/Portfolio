import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ScrollService } from '../services/scroll.service';
import { LoggerService } from '../services/logger.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  isHovered = false;
  currentYear = new Date().getFullYear();
  private readonly logger = inject(LoggerService);

  constructor(private scrollService: ScrollService, private router: Router) {}

  scrollToTop(): void {
    if (this.router.url === '/') {
      this.scrollService.scrollToElement('headLine', 'start');
    } else {
      this.router.navigate(['/']).catch((error) => {
        this.logger.error('Navigation to home failed:', error);
      });
    }
  }
}
