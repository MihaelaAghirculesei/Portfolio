import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeedbacksComponent } from './feedback.component';
import { QueryList, ElementRef } from '@angular/core';

describe('FeedbacksComponent', () => {
  let component: FeedbacksComponent;
  let fixture: ComponentFixture<FeedbacksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbacksComponent]
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
      vi.spyOn(component, 'updateCards').mockImplementation(() => undefined);

      component.slideLeft();
      expect(component.updateCards).toHaveBeenCalled();
    });
  });

  describe('Card Updates', () => {
    it('should update cards with correct transforms', async () => {
      vi.useFakeTimers();
      component.updateCards();

      expect(component.isTransitioning).toBe(true);

      await vi.advanceTimersByTimeAsync(500);

      expect(component.isTransitioning).toBe(false);
    });

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
      vi.spyOn(component, 'updateCards').mockImplementation(() => undefined);

      component.goToSlide(2);

      expect(component.updateCards).not.toHaveBeenCalled();
    });

    it('should not navigate if transitioning', () => {
      component.isTransitioning = true;
      const initialIndex = component.middleIndex;

      component.goToSlide(0);

      expect(component.middleIndex).toBe(initialIndex);
    });

  });

  describe('Keyboard Navigation', () => {
    it('should slide right on left arrow key', () => {
      vi.spyOn(component, 'slideRight').mockImplementation(() => undefined);
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      vi.spyOn(event, 'preventDefault').mockImplementation(() => undefined);

      component.onKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.slideRight).toHaveBeenCalled();
    });

    it('should slide left on right arrow key', () => {
      vi.spyOn(component, 'slideLeft').mockImplementation(() => undefined);
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      vi.spyOn(event, 'preventDefault').mockImplementation(() => undefined);

      component.onKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.slideLeft).toHaveBeenCalled();
    });

    it('should go to first slide on Home key', () => {
      vi.spyOn(component, 'goToSlide').mockImplementation(() => undefined);
      const event = new KeyboardEvent('keydown', { key: 'Home' });
      vi.spyOn(event, 'preventDefault').mockImplementation(() => undefined);

      component.onKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.goToSlide).toHaveBeenCalledWith(0);
    });

    it('should go to last slide on End key', () => {
      vi.spyOn(component, 'goToSlide').mockImplementation(() => undefined);
      const event = new KeyboardEvent('keydown', { key: 'End' });
      vi.spyOn(event, 'preventDefault').mockImplementation(() => undefined);

      component.onKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.goToSlide).toHaveBeenCalledWith(component.feedbacks.length - 1);
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
      vi.spyOn(component, 'slideLeft').mockImplementation(() => undefined);
      component['touchStartX'] = 100;
      component['touchEndX'] = 0;

      component['handleSwipe']();

      expect(component.slideLeft).toHaveBeenCalled();
    });

    it('should slide right on swipe right', () => {
      vi.spyOn(component, 'slideRight').mockImplementation(() => undefined);
      component['touchStartX'] = 0;
      component['touchEndX'] = 100;

      component['handleSwipe']();

      expect(component.slideRight).toHaveBeenCalled();
    });

    it('should not slide if swipe distance is too small', () => {
      vi.spyOn(component, 'slideLeft').mockImplementation(() => undefined);
      vi.spyOn(component, 'slideRight').mockImplementation(() => undefined);
      component['touchStartX'] = 100;
      component['touchEndX'] = 90;

      component['handleSwipe']();

      expect(component.slideLeft).not.toHaveBeenCalled();
      expect(component.slideRight).not.toHaveBeenCalled();
    });

    it('should return early from onTouchStart when changedTouches is empty', () => {
      const initialStartX = component['touchStartX'];
      const event = { changedTouches: [] } as any;
      component.onTouchStart(event);
      expect(component['touchStartX']).toBe(initialStartX);
    });

    it('should return early from onTouchEnd when changedTouches is empty', () => {
      vi.spyOn(component, 'slideLeft').mockImplementation(() => undefined);
      vi.spyOn(component, 'slideRight').mockImplementation(() => undefined);
      const event = { changedTouches: [] } as any;
      component.onTouchEnd(event);
      expect(component.slideLeft).not.toHaveBeenCalled();
      expect(component.slideRight).not.toHaveBeenCalled();
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
    it('should mark for check on user interactions', async () => {
      vi.useFakeTimers();
      vi.spyOn(component['cdr'], 'markForCheck').mockImplementation(() => undefined);

      component.slideLeft();
      await vi.advanceTimersByTimeAsync(500);
      component.goToSlide(3);
      await vi.advanceTimersByTimeAsync(500);

      expect(component['cdr'].markForCheck).toHaveBeenCalled();
    });
  });
});
