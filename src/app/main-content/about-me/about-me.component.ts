import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-aboutme',
  standalone: true,
  imports: [],
  templateUrl: './about-me.component.html',
  styleUrl: './about-me.component.scss'
})
export class AboutmeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('aboutMeSection', { static: false }) sectionRef!: ElementRef;
  
  private observer?: IntersectionObserver;
  private animationFrameId?: number;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
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
    }
  }

  private initScrollAnimations(): void {
    if ((window as any).AOS) {
      (window as any).AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100
      });
    }
  }

  private initIntersectionObserver(): void {
    if ('IntersectionObserver' in window) {
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

      const animatedElements = document.querySelectorAll('.aboutMePs, .imgDiv, .aboutMeWrapper');
      animatedElements.forEach(el => {
        this.observer?.observe(el);
      });
    }
  }

  private addHoverEffects(): void {
    const iconWrappers = document.querySelectorAll('.iconWrapper');
    iconWrappers.forEach(wrapper => {
      wrapper.addEventListener('mouseenter', this.onIconHover.bind(this));
      wrapper.addEventListener('mouseleave', this.onIconLeave.bind(this));
    });

    const imgDiv = document.querySelector('.imgDiv');
    if (imgDiv) {
      imgDiv.addEventListener('mouseenter', this.onImageHover.bind(this));
      imgDiv.addEventListener('mouseleave', this.onImageLeave.bind(this));
    }
  }

  private onIconHover(event: Event): void {
    const target = event.target as HTMLElement;
    const icon = target.querySelector('img');
    if (icon) {
      icon.style.transform = 'scale(1.1) rotate(5deg)';
      icon.style.filter = 'brightness(1.4) drop-shadow(0 4px 8px rgba(61, 207, 182, 0.3))';
    }
  }

  private onIconLeave(event: Event): void {
    const target = event.target as HTMLElement;
    const icon = target.querySelector('img');
    if (icon) {
      icon.style.transform = 'scale(1) rotate(0deg)';
      icon.style.filter = 'brightness(1.2)';
    }
  }

  private onImageHover(event: Event): void {
    const img = document.querySelector('.imageContainer img') as HTMLImageElement;
    if (img) {
      img.style.transform = 'scale(1.05)';
      img.style.filter = 'brightness(1.2) contrast(1.1)';
    }
  }

  private onImageLeave(event: Event): void {
    const img = document.querySelector('.imageContainer img') as HTMLImageElement;
    if (img) {
      img.style.transform = 'scale(1)';
      img.style.filter = 'brightness(1.1) contrast(1.05)';
    }
  }
}