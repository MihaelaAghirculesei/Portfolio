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

  private readonly _onLangChange = new Subject<LangChangeEvent>();
  readonly onLangChange = this._onLangChange.asObservable();
  readonly defaultLang = 'en';

  get currentLang(): Lang {
    return this._lang();
  }

  use(lang: string): Observable<TranslationDict> {
    const newLang: Lang = lang === 'de' ? 'de' : 'en';
    this._lang.set(newLang);
    this._onLangChange.next({ lang: newLang });
    return of(this.translations[newLang]);
  }

  instant(key: string, params?: Record<string, unknown>): string {
    let result = this.resolve(key, this._lang()) ?? key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        const escapedKey = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        result = result.replace(new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}\\}`, 'g'), String(v));
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
