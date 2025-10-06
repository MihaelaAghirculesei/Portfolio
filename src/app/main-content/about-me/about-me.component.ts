import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  QueryList,
  ViewChildren,
  ChangeDetectionStrategy
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { AOS_CONFIG } from '../../shared/constants/app.constants';

interface AboutSection {
  icon: string;
  titleKey: string;
  textKey: string;
  alt: string;
  delay: number;
}

interface AOS {
  init(options?: {
    duration?: number;
    easing?: string;
    once?: boolean;
    offset?: number;
  }): void;
}

declare global {
  interface Window {
    AOS?: AOS;
  }
}

@Component({
  selector: 'app-aboutme',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './about-me.component.html',
  styleUrl: './about-me.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutmeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('imgDiv', { static: false }) imgDivRef!: ElementRef;
  @ViewChild('imageContainer', { static: false }) imageContainerRef!: ElementRef;
  @ViewChildren('iconWrapper') iconWrappers!: QueryList<ElementRef>;
  @ViewChildren('animatedElement') animatedElements!: QueryList<ElementRef>;

  private observer?: IntersectionObserver;
  private animationFrameId?: number;
  private isBrowser: boolean;
  private eventListeners: (() => void)[] = [];

  readonly ASSETS_PATH = '../../assets/img/about-me/';

  readonly aboutSections: AboutSection[] = [
    {
      icon: 'about_me.svg',
      titleKey: 'aboutMe.visionTitle',
      textKey: 'aboutMe.visionText',
      alt: 'Brain Icon',
      delay: AOS_CONFIG.DELAY_STEP_1
    },
    {
      icon: 'location.svg',
      titleKey: 'aboutMe.locationTitle',
      textKey: 'aboutMe.locationText',
      alt: 'Location Marker',
      delay: AOS_CONFIG.DELAY_STEP_2
    },
    {
      icon: 'about_me_highlights.svg',
      titleKey: 'aboutMe.growthTitle',
      textKey: 'aboutMe.growthText',
      alt: 'Skills Icon',
      delay: AOS_CONFIG.DELAY_STEP_3
    }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  trackByIcon(index: number, item: AboutSection): string {
    return item.icon;
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.initScrollAnimations();
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.initIntersectionObserver();
      this.addHoverEffects();
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      if (this.observer) {
        this.observer.disconnect();
      }
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }

      this.eventListeners.forEach(cleanup => cleanup());
      this.eventListeners = [];
    }
  }

  private initScrollAnimations(): void {
    if (window.AOS) {
      window.AOS.init({
        duration: AOS_CONFIG.DURATION,
        easing: 'ease-in-out',
        once: true,
        offset: AOS_CONFIG.OFFSET
      });
    }
  }

  private initIntersectionObserver(): void {
    if ('IntersectionObserver' in window && this.animatedElements) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-in');
            }
          });
        },
        {
          threshold: 0.2,
          rootMargin: '50px'
        }
      );

      this.animatedElements.forEach(el => {
        this.observer?.observe(el.nativeElement);
      });
    }
  }

  private addHoverEffects(): void {
    if (this.iconWrappers) {
      this.iconWrappers.forEach(wrapper => {
        const mouseEnterHandler = this.onIconHover.bind(this);
        const mouseLeaveHandler = this.onIconLeave.bind(this);

        wrapper.nativeElement.addEventListener('mouseenter', mouseEnterHandler);
        wrapper.nativeElement.addEventListener('mouseleave', mouseLeaveHandler);

        this.eventListeners.push(() => {
          wrapper.nativeElement.removeEventListener('mouseenter', mouseEnterHandler);
          wrapper.nativeElement.removeEventListener('mouseleave', mouseLeaveHandler);
        });
      });
    }

    if (this.imgDivRef?.nativeElement) {
      const mouseEnterHandler = this.onImageHover.bind(this);
      const mouseLeaveHandler = this.onImageLeave.bind(this);

      this.imgDivRef.nativeElement.addEventListener('mouseenter', mouseEnterHandler);
      this.imgDivRef.nativeElement.addEventListener('mouseleave', mouseLeaveHandler);

      this.eventListeners.push(() => {
        this.imgDivRef.nativeElement.removeEventListener('mouseenter', mouseEnterHandler);
        this.imgDivRef.nativeElement.removeEventListener('mouseleave', mouseLeaveHandler);
      });
    }
  }

  private onIconHover(event: Event): void {
    const target = event.target as HTMLElement;
    const icon = target.querySelector('img');
    if (icon) {
      icon.classList.remove('icon-normal');
      icon.classList.add('icon-hover');
    }
  }

  private onIconLeave(_event: Event): void {
    const target = _event.target as HTMLElement;
    const icon = target.querySelector('img');
    if (icon) {
      icon.classList.remove('icon-hover');
      icon.classList.add('icon-normal');
    }
  }

  private onImageHover(_event: Event): void {
    const img = this.imageContainerRef?.nativeElement.querySelector('img');
    if (img) {
      img.classList.remove('image-normal');
      img.classList.add('image-hover');
    }
  }

  private onImageLeave(_event: Event): void {
    const img = this.imageContainerRef?.nativeElement.querySelector('img');
    if (img) {
      img.classList.remove('image-hover');
      img.classList.add('image-normal');
    }
  }
}