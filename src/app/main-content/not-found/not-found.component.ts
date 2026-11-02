import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LocalePathPipe } from '../../shared/pipes/locale-path.pipe';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, TranslatePipe, LocalePathPipe],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {}
