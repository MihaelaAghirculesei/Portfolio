import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  constructor(private translate: TranslateService) {
    this.translate.addLangs(['de', 'en']);
    
    
    const savedLang = localStorage.getItem('language');
    const defaultLang = savedLang || 'en'; 
    this.translate.setDefaultLang('en');
    this.translate.use(defaultLang);
  }

  switchLanguage(language: string) {
    this.translate.use(language);
    localStorage.setItem('language', language); 
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang;
  }
}
