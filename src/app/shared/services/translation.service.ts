import { Injectable, signal } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import enTranslations from '../../../assets/i18n/en.json';
import deTranslations from '../../../assets/i18n/de.json';

type Lang = 'en' | 'de';
type TranslationDict = Record<string, unknown>;

export interface LangChangeEvent {
  lang: string;
}

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly _lang = signal<Lang>('en');
  private readonly translations: Record<Lang, TranslationDict> = {
    en: enTranslations as TranslationDict,
    de: deTranslations as TranslationDict,
  };

  readonly onLangChange = new Subject<LangChangeEvent>();
  readonly defaultLang = 'en';

  get currentLang(): Lang {
    return this._lang();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addLangs(_langs: string[]): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setDefaultLang(_lang: string): void {}

  use(lang: string): Observable<TranslationDict> {
    const newLang: Lang = lang === 'de' ? 'de' : 'en';
    this._lang.set(newLang);
    this.onLangChange.next({ lang: newLang });
    return of(this.translations[newLang]);
  }

  instant(key: string, params?: Record<string, unknown>): string {
    let result = this.resolve(key, this._lang()) ?? key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        result = result.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, 'g'), String(v));
      });
    }
    return result;
  }

  get(key: string): Observable<string> {
    return of(this.instant(key));
  }

  private resolve(key: string, lang: Lang): string | null {
    const parts = key.split('.');
    let current: unknown = this.translations[lang];
    for (const part of parts) {
      if (typeof current !== 'object' || current === null) { return null; }
      current = (current as Record<string, unknown>)[part];
    }
    return typeof current === 'string' ? current : null;
  }
}
