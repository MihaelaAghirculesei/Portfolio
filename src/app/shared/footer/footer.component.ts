import { Component, ElementRef, AfterViewInit, HostListener, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ScrollService } from '../services/scroll.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class FooterComponent implements AfterViewInit {
  showLegalNotice = false;
  showPrivacyPolicy = false;
  isHovered: boolean = false;
  private footerHeight: number = 120;

  constructor(
    public translate: TranslateService,
    private scrollService: ScrollService,
    private elementRef: ElementRef
  ) {}

  ngAfterViewInit() {
    const footerElement = this.elementRef.nativeElement;
    if (footerElement) {
      this.footerHeight = footerElement.offsetHeight;
    }
  }

  openLegalNotice() {
    this.showLegalNotice = true;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    this.updateModalHeight();
  }

  closeLegalNotice() {
    this.showLegalNotice = false;
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
  }

  openPrivacyPolicy() {
    this.showPrivacyPolicy = true;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    this.updateModalHeight();
  }

  closePrivacyPolicy() {
    this.showPrivacyPolicy = false;
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
  }

  private updateModalHeight() {
    document.documentElement.style.setProperty('--footer-height', `${this.footerHeight}px`);
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    if (this.showPrivacyPolicy) {
      this.closePrivacyPolicy();
    }
    if (this.showLegalNotice) {
      this.closeLegalNotice();
    }
  }

  scrollToTop(): void {
    this.scrollService.scrollToElement('headLine', 'start');
  }
}