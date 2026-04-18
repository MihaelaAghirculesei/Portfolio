import { Injectable } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class TranslatedTitleStrategy extends TitleStrategy {
  constructor(
    private readonly translate: TranslateService,
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
