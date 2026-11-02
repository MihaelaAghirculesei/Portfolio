import { inject, Pipe, PipeTransform } from '@angular/core';
import { localizePath } from '../i18n/locale-path';
import { TranslationService } from '../services/translation.service';

/** Turns a language-neutral path into the current language's URL. */
@Pipe({
  name: 'localePath',
  pure: false,
  standalone: true,
})
export class LocalePathPipe implements PipeTransform {
  private readonly translation = inject(TranslationService);

  transform(path: string): string {
    return localizePath(path, this.translation.currentLang);
  }
}
