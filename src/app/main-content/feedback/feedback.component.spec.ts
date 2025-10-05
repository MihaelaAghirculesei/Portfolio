import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FeedbacksComponent } from './feedback.component';
import { PlatformService } from '../../shared/services/platform.service';
import { QueryList, ElementRef } from '@angular/core';

describe('FeedbacksComponent', () => {
  let component: FeedbacksComponent;
  let fixture: ComponentFixture<FeedbacksComponent>;
  let mockPlatformService: jasmine.SpyObj<PlatformService>;

  beforeEach(async () => {
    mockPlatformService = jasmine.createSpyObj('PlatformService', ['getDocument', 'getWindow']);
    mockPlatformService.getDocument.and.returnValue(document);

    await TestBed.configureTestingModule({
      imports: [FeedbacksComponent, TranslateModule.forRoot()],
      providers: [
        { provide: PlatformService, useValue: mockPlatformService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbacksComponent);
    component = fixture.componentInstance;

    // Mock feedbackCards QueryList
    const mockElements = Array.from({ length: 5 }, () => ({
      nativeElement: {
        style: { transform: '' }
      }
    })) as ElementRef[];

    component.feedbackCards = {
      forEach: (fn: any) => mockElements.forEach(fn),
      length: mockElements.length
    } as QueryList<ElementRef>;

    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.middleIndex).toBe(2);
      expect(component.isTransitioning).toBe(false);
      expect(component.isAutoPlaying).toBe(true);
    });

    it('should have feedbacks array', () => {
      expect(component.feedbacks).toBeDefined();
      expect(component.feedbacks.length).toBe(5);
    });

    it('should have correct feedback data structure', () => {
      const feedback = component.feedbacks[0];
      expect(feedback.name).toBeDefined();
      expect(feedback.feedbackKey).toBeDefined();
      expect(feedback.ref).toBeDefined();
      expect(feedback.role).toBeDefined();
    });
  });

  describe('Slide Navigation', () => {
    it('should slide left', () => {
      component.middleIndex = 2;
      component.slideLeft();
      expect(component.middleIndex).toBe(3);
    });

    it('should wrap to first when sliding left from last', () => {
      component.middleIndex = component.feedbacks.length - 1;
      component.slideLeft();
      expect(component.middleIndex).toBe(0);
    });

    it('should slide right', () => {
      component.middleIndex = 2;
      component.slideRight();
      expect(component.middleIndex).toBe(1);
    });

    it('should wrap to last on slide right from first', () => {
      component.middleIndex = 0;
      component.slideRight();
      expect(component.middleIndex).toBe(component.feedbacks.length - 1);
    });

    it('should not slide when transitioning', () => {
      component.isTransitioning = true;
      const initialIndex = component.middleIndex;

      component.slideLeft();
      expect(component.middleIndex).toBe(initialIndex);

      component.slideRight();
      expect(component.middleIndex).toBe(initialIndex);
    });

    it('should call updateCards when sliding', () => {
      spyOn(component, 'updateCards');

      component.slideLeft();
      expect(component.updateCards).toHaveBeenCalled();
    });
  });

  describe('Card Updates', () => {
    it('should update cards with correct transforms', fakeAsync(() => {
      component.updateCards();

      expect(component.isTransitioning).toBe(true);

      tick(500);

      expect(component.isTransitioning).toBe(false);
    }));

    it('should apply correct CSS class for left cards', () => {
      const className = component.getCardClass(0);
      expect(className).toBe('left feedback-card');
    });

    it('should apply correct CSS class for right cards', () => {
      const className = component.getCardClass(4);
      expect(className).toBe('right feedback-card');
    });

    it('should apply correct CSS class for middle card', () => {
      const className = component.getCardClass(2);
      expect(className).toBe('feedback-card');
    });
  });

  describe('Direct Navigation', () => {
    it('should go to specific slide', () => {
      component.goToSlide(3);
      expect(component.middleIndex).toBe(3);
    });

    it('should not navigate if already on target slide', () => {
      component.middleIndex = 2;
      spyOn(component, 'updateCards');

      component.goToSlide(2);

      expect(component.updateCards).not.toHaveBeenCalled();
    });

    it('should not navigate if transitioning', () => {
      component.isTransitioning = true;
      const initialIndex = component.middleIndex;

      component.goToSlide(0);

      expect(component.middleIndex).toBe(initialIndex);
    });

    it('should reset autoplay when navigating', () => {
      spyOn<any>(component, 'resetAutoPlay');

      component.goToSlide(3);

      expect(component['resetAutoPlay']).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should slide right on left arrow key', () => {
      spyOn(component, 'slideRight');
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      spyOn(event, 'preventDefault');

      component.onKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.slideRight).toHaveBeenCalled();
    });

    it('should slide left on right arrow key', () => {
      spyOn(component, 'slideLeft');
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      spyOn(event, 'preventDefault');

      component.onKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.slideLeft).toHaveBeenCalled();
    });

    it('should go to first slide on Home key', () => {
      spyOn(component, 'goToSlide');
      const event = new KeyboardEvent('keydown', { key: 'Home' });
      spyOn(event, 'preventDefault');

      component.onKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.goToSlide).toHaveBeenCalledWith(0);
    });

    it('should go to last slide on End key', () => {
      spyOn(component, 'goToSlide');
      const event = new KeyboardEvent('keydown', { key: 'End' });
      spyOn(event, 'preventDefault');

      component.onKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.goToSlide).toHaveBeenCalledWith(component.feedbacks.length - 1);
    });

    it('should toggle autoplay on space key', () => {
      spyOn(component, 'toggleAutoPlay');
      const event = new KeyboardEvent('keydown', { key: ' ' });
      spyOn(event, 'preventDefault');

      component.onKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.toggleAutoPlay).toHaveBeenCalled();
    });

    it('should toggle autoplay on enter key', () => {
      spyOn(component, 'toggleAutoPlay');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      spyOn(event, 'preventDefault');

      component.onKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.toggleAutoPlay).toHaveBeenCalled();
    });
  });

  describe('Touch Events', () => {
    it('should handle touch start', () => {
      const event = {
        changedTouches: [{ screenX: 100 }]
      } as any;

      component.onTouchStart(event);

      expect(component['touchStartX']).toBe(100);
    });

    it('should handle touch end', () => {
      const event = {
        changedTouches: [{ screenX: 50 }]
      } as any;
      component['touchStartX'] = 100;

      component.onTouchEnd(event);

      expect(component['touchEndX']).toBe(50);
    });

    it('should slide left on swipe left', () => {
      spyOn(component, 'slideLeft');
      component['touchStartX'] = 100;
      component['touchEndX'] = 0;

      component['handleSwipe']();

      expect(component.slideLeft).toHaveBeenCalled();
    });

    it('should slide right on swipe right', () => {
      spyOn(component, 'slideRight');
      component['touchStartX'] = 0;
      component['touchEndX'] = 100;

      component['handleSwipe']();

      expect(component.slideRight).toHaveBeenCalled();
    });

    it('should not slide if swipe distance is too small', () => {
      spyOn(component, 'slideLeft');
      spyOn(component, 'slideRight');
      component['touchStartX'] = 100;
      component['touchEndX'] = 90;

      component['handleSwipe']();

      expect(component.slideLeft).not.toHaveBeenCalled();
      expect(component.slideRight).not.toHaveBeenCalled();
    });
  });

  describe('AutoPlay Management', () => {
    it('should handle autoplay lifecycle', () => {
      spyOn(component, 'startAutoPlay');
      spyOn(component, 'stopAutoPlay');

      component.ngOnInit();
      expect(component.startAutoPlay).toHaveBeenCalled();

      component.ngOnDestroy();
      expect(component.stopAutoPlay).toHaveBeenCalled();
    });

    it('should toggle autoplay on and off', () => {
      spyOn(component, 'startAutoPlay');
      spyOn(component, 'stopAutoPlay');
      component.isAutoPlaying = false;

      component.toggleAutoPlay();
      expect(component.isAutoPlaying).toBe(true);
      expect(component.startAutoPlay).toHaveBeenCalled();

      component.toggleAutoPlay();
      expect(component.isAutoPlaying).toBe(false);
      expect(component.stopAutoPlay).toHaveBeenCalled();
    });

    it('should pause and resume autoplay', () => {
      spyOn(component, 'startAutoPlay');
      spyOn(component, 'stopAutoPlay');

      component.pauseAutoPlay();
      expect(component.stopAutoPlay).toHaveBeenCalled();

      component.isAutoPlaying = true;
      component.resumeAutoPlay();
      expect(component.startAutoPlay).toHaveBeenCalled();

      component.isAutoPlaying = false;
      component.resumeAutoPlay();
      expect(component.startAutoPlay).toHaveBeenCalledTimes(1);
    });
  });

  describe('Visibility Change', () => {
    it('should stop autoplay when page is hidden', () => {
      spyOn(component, 'stopAutoPlay');
      Object.defineProperty(document, 'hidden', {
        writable: true,
        configurable: true,
        value: true
      });

      component.onVisibilityChange();

      expect(component.stopAutoPlay).toHaveBeenCalled();
    });

    it('should start autoplay when page is visible and autoplay is on', () => {
      spyOn(component, 'startAutoPlay');
      component.isAutoPlaying = true;
      Object.defineProperty(document, 'hidden', {
        writable: true,
        configurable: true,
        value: false
      });

      component.onVisibilityChange();

      expect(component.startAutoPlay).toHaveBeenCalled();
    });

    it('should not start autoplay when page is visible but autoplay is off', () => {
      spyOn(component, 'startAutoPlay');
      component.isAutoPlaying = false;
      Object.defineProperty(document, 'hidden', {
        writable: true,
        configurable: true,
        value: false
      });

      component.onVisibilityChange();

      expect(component.startAutoPlay).not.toHaveBeenCalled();
    });
  });

  describe('Computed Properties', () => {
    it('should calculate current slide correctly', () => {
      component.middleIndex = 2;
      expect(component.currentSlide).toBe(3);
    });

    it('should return total slides count', () => {
      expect(component.totalSlides).toBe(5);
    });
  });

  describe('Change Detection', () => {
    it('should mark for check on user interactions', () => {
      spyOn(component['cdr'], 'markForCheck');

      component.slideLeft();
      component.goToSlide(3);
      component.toggleAutoPlay();

      expect(component['cdr'].markForCheck).toHaveBeenCalledTimes(3);
    });
  });
});
