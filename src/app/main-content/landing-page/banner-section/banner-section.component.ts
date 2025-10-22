import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

interface BannerItem {
  key: string;
}

@Component({
  selector: 'app-banner-section',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './banner-section.component.html',
  styleUrl: './banner-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BannerSectionComponent {
  readonly bannerItems: BannerItem[] = [
    { key: 'banner.remoteWork' },
    { key: 'banner.role' },
    { key: 'banner.openToWork' },
    { key: 'banner.location' },
    { key: 'banner.skills' },
    { key: 'banner.passion' },
  ];

  private readonly numberOfTracks = 3;
  readonly bannerTracks = Array(this.numberOfTracks).fill(0);
}
