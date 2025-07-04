import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  Renderer2,
  HostListener,
} from '@angular/core';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { AppComponent } from '../app.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    RouterLink,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(
    private renderer: Renderer2
  ) {
    this.screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    this.activeLanguage = 'en'; // Valore fisso per ora
  }
  
  screenWidth: number;
  mobileMenuActive: boolean = false;
  activeLanguage: string = 'en';
  
  @ViewChild('langBtnDe') langBtnDe!: ElementRef<HTMLParagraphElement>;
  @ViewChild('langBtnEn') langBtnEn!: ElementRef<HTMLParagraphElement>;
  @ViewChild('langBtnDeMobile')
  langBtnDeMobile!: ElementRef<HTMLParagraphElement>;
  @ViewChild('langBtnEnMobile')
  langBtnEnMobile!: ElementRef<HTMLParagraphElement>;
  
  toggleLanguageColor() {
    this.langBtnDe.nativeElement.classList.toggle('active');
    this.langBtnEn.nativeElement.classList.toggle('active');
  }
  
  changeLanguage() {
    // Logica semplificata per ora
    this.activeLanguage = this.activeLanguage === 'en' ? 'de' : 'en';
  }
  
  toggleMobileMenu() {
    this.mobileMenuActive = !this.mobileMenuActive;
    if (this.mobileMenuActive) {
      this.renderer.addClass(document.body, 'menu-open');
    } else {
      this.renderer.removeClass(document.body, 'menu-open');
    }
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  }
}