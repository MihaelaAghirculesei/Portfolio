import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import enTranslations from '../../../assets/i18n/en.json';
import deTranslations from '../../../assets/i18n/de.json';

const TRANSLATIONS: Record<string, TranslationObject> = {
  en: enTranslations as TranslationObject,
  de: deTranslations as TranslationObject,
};

export class InlineTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    return of(TRANSLATIONS[lang] ?? TRANSLATIONS['en']);
  }
}
