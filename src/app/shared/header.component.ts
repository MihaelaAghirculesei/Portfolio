import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isHovered: boolean = false;
  isScrolled: boolean = false;
  isEnglish: boolean = false;
  isMenuOpen: boolean = false;

  ngOnInit() {
    this.checkScroll();
  }

  @HostListener('window:scroll', [])
  checkScroll() {
    if (typeof window !== 'undefined') {
      this.isScrolled = window.scrollY > 100;
    }
  }

  toggleLanguage() {
    this.isEnglish = !this.isEnglish;
   // TODO: Implement translation logic
    console.log('Language toggled to:', this.isEnglish ? 'DE' : 'EN');
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenuIfMobile() {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      this.isMenuOpen = false;
    }
  }

  scrollToSection(sectionId: string) {
    if (typeof window !== 'undefined') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (typeof window !== 'undefined' && event.target.innerWidth > 768) {
      this.isMenuOpen = false;
    }
  }
}