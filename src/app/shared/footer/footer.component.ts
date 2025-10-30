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
  private readonly SCROLL_STORAGE_KEY = 'contact-scroll-position';

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

  saveScrollPosition(): void {
    try {
      const scrollY = window.scrollY || window.pageYOffset;
      sessionStorage.setItem(this.SCROLL_STORAGE_KEY, scrollY.toString());
    } catch (error) {
      this.logger.error('Failed to save scroll position', error);
    }
  }
}
