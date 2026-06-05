import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../pipes/translate.pipe';
import { ScrollService } from '../services/scroll.service';
import { NavigationService } from '../services/navigation.service';
import { CONTACT_INFO } from '../constants/app.constants';

@Component({
    selector: 'app-footer',
    imports: [RouterLink, TranslatePipe],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  isHovered = false;
  currentYear = new Date().getFullYear();
  readonly mailtoLink = `mailto:${CONTACT_INFO.email}`;

  private readonly navigationService = inject(NavigationService);
  private readonly scrollService = inject(ScrollService);

  onLogoHover(): void { this.isHovered = true; }
  onLogoUnhover(): void { this.isHovered = false; }

  scrollToTop(): void {
    this.navigationService.scrollToSection('headLine');
  }

  saveScrollPosition(): void {
    this.scrollService.saveScrollPosition();
  }
}
