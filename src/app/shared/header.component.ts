import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
    selector: 'app-header',
    standalone: true,
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
  })
  export class HeaderComponent {
    @ViewChild('langBtnDe') langBtnDe!: ElementRef<HTMLParagraphElement>;
    @ViewChild('langBtnEn') langBtnEn!: ElementRef<HTMLParagraphElement>;
    
    toggleLanguageColor() {
    this.langBtnDe.nativeElement.classList.toggle('active');
    this.langBtnEn.nativeElement.classList.toggle('active');
    }
  }