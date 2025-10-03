import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

interface BannerItem {
  key: string;
  priority: number;
}

@Component({
  selector: 'app-banner-section',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './banner-section.component.html',
  styleUrl: './banner-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BannerSectionComponent implements OnInit, OnDestroy {
  readonly bannerItems: BannerItem[] = [
    { key: 'banner.remoteWork', priority: 1 },
    { key: 'banner.role', priority: 2 },
    { key: 'banner.openToWork', priority: 3 },
    { key: 'banner.location', priority: 4 },
    { key: 'banner.skills', priority: 5 },
    { key: 'banner.passion', priority: 6 },
  ];

  readonly bannerTracks = Array(3).fill(0);

  private animationPaused = false;

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  pauseAnimation(): void {
    this.animationPaused = true;
  }

  resumeAnimation(): void {
    this.animationPaused = false;
  }

  get isAnimationPaused(): boolean {
    return this.animationPaused;
  }
}
