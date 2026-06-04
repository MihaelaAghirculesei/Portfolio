import { Injectable } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslationService } from './translation.service';

@Injectable()
export class TranslatedTitleStrategy extends TitleStrategy {
  constructor(
    private readonly translate: TranslationService,
    private readonly titleService: Title,
  ) {
    super();
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const key = this.buildTitle(snapshot);
    if (!key) { return; }
    this.translate.get(key).subscribe((title: string) => {
      this.titleService.setTitle(title);
    });
  }
}
