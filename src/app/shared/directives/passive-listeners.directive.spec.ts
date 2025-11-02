import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PassiveTouchStartDirective, PassiveTouchEndDirective } from './passive-listeners.directive';

function createTouch(target: HTMLElement, x = 100, y = 100, id = 1): Touch {
  return new Touch({
    identifier: id,
    target: target,
    clientX: x,
    clientY: y,
    screenX: x,
    screenY: y,
    pageX: x,
    pageY: y,
    radiusX: 10,
    radiusY: 10,
    rotationAngle: 0,
    force: 1
  });
}

@Component({
  template: '<div appPassiveTouchStart (passiveTouchStart)="onTouchStart($event)"></div>',
  standalone: true,
  imports: [PassiveTouchStartDirective]
})
class TestTouchStartComponent {
  touchStartEvent: TouchEvent | null = null;
  onTouchStart(event: TouchEvent): void {
    this.touchStartEvent = event;
  }
}

@Component({
  template: '<div appPassiveTouchEnd (passiveTouchEnd)="onTouchEnd($event)"></div>',
  standalone: true,
  imports: [PassiveTouchEndDirective]
})
class TestTouchEndComponent {
  touchEndEvent: TouchEvent | null = null;
  onTouchEnd(event: TouchEvent): void {
    this.touchEndEvent = event;
  }
}

describe('PassiveTouchStartDirective', () => {
  let component: TestTouchStartComponent;
  let fixture: ComponentFixture<TestTouchStartComponent>;
  let divElement: HTMLElement;
  let addEventListenerSpy: jasmine.Spy;
  let removeEventListenerSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestTouchStartComponent]
    });

    fixture = TestBed.createComponent(TestTouchStartComponent);
    component = fixture.componentInstance;
    divElement = fixture.nativeElement.querySelector('div');

    addEventListenerSpy = spyOn(divElement, 'addEventListener').and.callThrough();
    removeEventListenerSpy = spyOn(divElement, 'removeEventListener').and.callThrough();
  });

  describe('Initialization', () => {
    it('should create the directive', () => {
      expect(component).toBeTruthy();
    });

    it('should add touchstart event listener on ngOnInit', () => {
      fixture.detectChanges();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'touchstart',
        jasmine.any(Function),
        { passive: true }
      );
    });

    it('should add event listener with passive option set to true', () => {
      fixture.detectChanges();

      const calls = addEventListenerSpy.calls.all();
      const touchstartCall = calls.find(call => call.args[0] === 'touchstart');

      expect(touchstartCall).toBeDefined();
      expect(touchstartCall?.args[2]).toEqual({ passive: true });
    });

    it('should add event listener only once', () => {
      fixture.detectChanges();

      const touchstartCalls = addEventListenerSpy.calls.all()
        .filter(call => call.args[0] === 'touchstart');

      expect(touchstartCalls.length).toBe(1);
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should emit passiveTouchStart event when touchstart is triggered', () => {
      const touch = createTouch(divElement, 100, 200);
      const touchEvent = new TouchEvent('touchstart', {
        touches: [touch],
        targetTouches: [touch],
        changedTouches: [touch]
      });

      divElement.dispatchEvent(touchEvent);

      expect(component.touchStartEvent).toBe(touchEvent);
    });

    it('should emit with correct TouchEvent data', () => {
      const touch = createTouch(divElement, 150, 250);
      const touchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [touch],
        targetTouches: [touch],
        changedTouches: [touch]
      });

      divElement.dispatchEvent(touchEvent);

      expect(component.touchStartEvent).toBeTruthy();
      expect(component.touchStartEvent?.type).toBe('touchstart');
      expect(component.touchStartEvent?.touches.length).toBe(1);
    });

    it('should handle multiple touchstart events', () => {
      const touch1 = createTouch(divElement, 100, 100);
      const touchEvent1 = new TouchEvent('touchstart', {
        touches: [touch1],
        targetTouches: [touch1],
        changedTouches: [touch1]
      });

      const touch2 = createTouch(divElement, 200, 200, 2);
      const touchEvent2 = new TouchEvent('touchstart', {
        touches: [touch2],
        targetTouches: [touch2],
        changedTouches: [touch2]
      });

      divElement.dispatchEvent(touchEvent1);
      expect(component.touchStartEvent).toBe(touchEvent1);

      divElement.dispatchEvent(touchEvent2);
      expect(component.touchStartEvent).toBe(touchEvent2);
    });

    it('should handle touchstart with multiple touch points', () => {
      const touch1 = createTouch(divElement, 100, 100, 1);
      const touch2 = createTouch(divElement, 200, 200, 2);
      const touchEvent = new TouchEvent('touchstart', {
        touches: [touch1, touch2],
        targetTouches: [touch1, touch2],
        changedTouches: [touch1, touch2]
      });

      divElement.dispatchEvent(touchEvent);

      expect(component.touchStartEvent).toBeTruthy();
      expect(component.touchStartEvent?.touches.length).toBe(2);
    });

    it('should emit events in rapid succession', () => {
      const events: TouchEvent[] = [];

      for (let i = 0; i < 5; i++) {
        const touch = createTouch(divElement, i * 10, i * 10, i + 1);
        const touchEvent = new TouchEvent('touchstart', {
          touches: [touch],
          targetTouches: [touch],
          changedTouches: [touch]
        });
        divElement.dispatchEvent(touchEvent);
        events.push(component.touchStartEvent!);
      }

      expect(events.length).toBe(5);
      expect(events.every(e => e !== null)).toBe(true);
    });
  });

  describe('Cleanup & Lifecycle', () => {
    it('should remove touchstart event listener on ngOnDestroy', () => {
      fixture.detectChanges();
      fixture.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'touchstart',
        jasmine.any(Function)
      );
    });

    it('should not emit events after destroy', () => {
      fixture.detectChanges();
      fixture.destroy();

      component.touchStartEvent = null;
      const touch = createTouch(divElement, 100, 100);
      const touchEvent = new TouchEvent('touchstart', {
        touches: [touch],
        targetTouches: [touch],
        changedTouches: [touch]
      });

      divElement.dispatchEvent(touchEvent);

      expect(component.touchStartEvent).toBeNull();
    });

    it('should remove the same listener that was added', () => {
      fixture.detectChanges();

      const addedListener = addEventListenerSpy.calls.first().args[1];

      fixture.destroy();

      const removedListener = removeEventListenerSpy.calls.first().args[1];
      expect(removedListener).toBe(addedListener);
    });

    it('should handle destroy without prior initialization', () => {
      expect(() => fixture.destroy()).not.toThrow();
    });

    it('should handle multiple destroy calls gracefully', () => {
      fixture.detectChanges();

      expect(() => {
        fixture.destroy();
        fixture.destroy();
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle touchstart on element without touches', () => {
      fixture.detectChanges();

      const touchEvent = new TouchEvent('touchstart', {
        touches: [],
        targetTouches: [],
        changedTouches: []
      });

      expect(() => divElement.dispatchEvent(touchEvent)).not.toThrow();
      expect(component.touchStartEvent?.touches.length).toBe(0);
    });

    it('should maintain listener reference across multiple events', () => {
      fixture.detectChanges();

      const listener1 = addEventListenerSpy.calls.first().args[1];

      const touch = createTouch(divElement);
      divElement.dispatchEvent(new TouchEvent('touchstart', {
        touches: [touch],
        targetTouches: [touch],
        changedTouches: [touch]
      }));

      const currentCalls = addEventListenerSpy.calls.count();
      expect(currentCalls).toBe(1); 
    });

    it('should work with programmatically created TouchEvent', () => {
      fixture.detectChanges();

      const touch = createTouch(divElement, 100, 200, 1);

      const touchEvent = new TouchEvent('touchstart', {
        touches: [touch],
        targetTouches: [touch],
        changedTouches: [touch]
      });

      divElement.dispatchEvent(touchEvent);

      expect(component.touchStartEvent).toBeTruthy();
      expect(component.touchStartEvent?.touches[0].identifier).toBe(1);
    });
  });
});

describe('PassiveTouchEndDirective', () => {
  let component: TestTouchEndComponent;
  let fixture: ComponentFixture<TestTouchEndComponent>;
  let divElement: HTMLElement;
  let addEventListenerSpy: jasmine.Spy;
  let removeEventListenerSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestTouchEndComponent]
    });

    fixture = TestBed.createComponent(TestTouchEndComponent);
    component = fixture.componentInstance;
    divElement = fixture.nativeElement.querySelector('div');

    addEventListenerSpy = spyOn(divElement, 'addEventListener').and.callThrough();
    removeEventListenerSpy = spyOn(divElement, 'removeEventListener').and.callThrough();
  });

  describe('Initialization', () => {
    it('should create the directive', () => {
      expect(component).toBeTruthy();
    });

    it('should add touchend event listener on ngOnInit', () => {
      fixture.detectChanges();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'touchend',
        jasmine.any(Function),
        { passive: true }
      );
    });

    it('should add event listener with passive option set to true', () => {
      fixture.detectChanges();

      const calls = addEventListenerSpy.calls.all();
      const touchendCall = calls.find(call => call.args[0] === 'touchend');

      expect(touchendCall).toBeDefined();
      expect(touchendCall?.args[2]).toEqual({ passive: true });
    });

    it('should add event listener only once', () => {
      fixture.detectChanges();

      const touchendCalls = addEventListenerSpy.calls.all()
        .filter(call => call.args[0] === 'touchend');

      expect(touchendCalls.length).toBe(1);
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should emit passiveTouchEnd event when touchend is triggered', () => {
      const touch = createTouch(divElement, 100, 200);
      const touchEvent = new TouchEvent('touchend', {
        touches: [],
        targetTouches: [],
        changedTouches: [touch]
      });

      divElement.dispatchEvent(touchEvent);

      expect(component.touchEndEvent).toBe(touchEvent);
    });

    it('should emit with correct TouchEvent data', () => {
      const touch = createTouch(divElement, 150, 250);
      const touchEvent = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        touches: [],
        targetTouches: [],
        changedTouches: [touch]
      });

      divElement.dispatchEvent(touchEvent);

      expect(component.touchEndEvent).toBeTruthy();
      expect(component.touchEndEvent?.type).toBe('touchend');
      expect(component.touchEndEvent?.changedTouches.length).toBe(1);
    });

    it('should handle multiple touchend events', () => {
      const touch1 = createTouch(divElement, 100, 100, 1);
      const touchEvent1 = new TouchEvent('touchend', {
        touches: [],
        targetTouches: [],
        changedTouches: [touch1]
      });

      const touch2 = createTouch(divElement, 200, 200, 2);
      const touchEvent2 = new TouchEvent('touchend', {
        touches: [],
        targetTouches: [],
        changedTouches: [touch2]
      });

      divElement.dispatchEvent(touchEvent1);
      expect(component.touchEndEvent).toBe(touchEvent1);

      divElement.dispatchEvent(touchEvent2);
      expect(component.touchEndEvent).toBe(touchEvent2);
    });

    it('should handle touchend with multiple changed touches', () => {
      const touch1 = createTouch(divElement, 100, 100, 1);
      const touch2 = createTouch(divElement, 200, 200, 2);
      const touchEvent = new TouchEvent('touchend', {
        touches: [],
        targetTouches: [],
        changedTouches: [touch1, touch2]
      });

      divElement.dispatchEvent(touchEvent);

      expect(component.touchEndEvent).toBeTruthy();
      expect(component.touchEndEvent?.changedTouches.length).toBe(2);
    });

    it('should emit events in rapid succession', () => {
      const events: TouchEvent[] = [];

      for (let i = 0; i < 5; i++) {
        const touch = createTouch(divElement, i * 10, i * 10, i + 1);
        const touchEvent = new TouchEvent('touchend', {
          touches: [],
          targetTouches: [],
          changedTouches: [touch]
        });
        divElement.dispatchEvent(touchEvent);
        events.push(component.touchEndEvent!);
      }

      expect(events.length).toBe(5);
      expect(events.every(e => e !== null)).toBe(true);
    });
  });

  describe('Cleanup & Lifecycle', () => {
    it('should remove touchend event listener on ngOnDestroy', () => {
      fixture.detectChanges();
      fixture.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'touchend',
        jasmine.any(Function)
      );
    });

    it('should not emit events after destroy', () => {
      fixture.detectChanges();
      fixture.destroy();

      component.touchEndEvent = null;
      const touch = createTouch(divElement, 100, 100);
      const touchEvent = new TouchEvent('touchend', {
        touches: [],
        targetTouches: [],
        changedTouches: [touch]
      });

      divElement.dispatchEvent(touchEvent);

      expect(component.touchEndEvent).toBeNull();
    });

    it('should remove the same listener that was added', () => {
      fixture.detectChanges();

      const addedListener = addEventListenerSpy.calls.first().args[1];

      fixture.destroy();

      const removedListener = removeEventListenerSpy.calls.first().args[1];
      expect(removedListener).toBe(addedListener);
    });

    it('should handle destroy without prior initialization', () => {
      expect(() => fixture.destroy()).not.toThrow();
    });

    it('should handle multiple destroy calls gracefully', () => {
      fixture.detectChanges();

      expect(() => {
        fixture.destroy();
        fixture.destroy();
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle touchend on element without changed touches', () => {
      fixture.detectChanges();

      const touchEvent = new TouchEvent('touchend', {
        touches: [],
        targetTouches: [],
        changedTouches: []
      });

      expect(() => divElement.dispatchEvent(touchEvent)).not.toThrow();
      expect(component.touchEndEvent?.changedTouches.length).toBe(0);
    });

    it('should maintain listener reference across multiple events', () => {
      fixture.detectChanges();

      const listener1 = addEventListenerSpy.calls.first().args[1];

      const touch = createTouch(divElement);
      divElement.dispatchEvent(new TouchEvent('touchend', {
        touches: [],
        targetTouches: [],
        changedTouches: [touch]
      }));

      const currentCalls = addEventListenerSpy.calls.count();
      expect(currentCalls).toBe(1); 
    });

    it('should work with programmatically created TouchEvent', () => {
      fixture.detectChanges();

      const touch = createTouch(divElement, 100, 200, 1);

      const touchEvent = new TouchEvent('touchend', {
        touches: [],
        targetTouches: [],
        changedTouches: [touch]
      });

      divElement.dispatchEvent(touchEvent);

      expect(component.touchEndEvent).toBeTruthy();
      expect(component.touchEndEvent?.changedTouches[0].identifier).toBe(1);
    });
  });

  describe('Integration between TouchStart and TouchEnd', () => {
    it('should work independently - touchend should not interfere with touchstart', () => {
      const startFixture = TestBed.createComponent(TestTouchStartComponent);
      const endFixture = TestBed.createComponent(TestTouchEndComponent);

      startFixture.detectChanges();
      endFixture.detectChanges();

      const startDiv = startFixture.nativeElement.querySelector('div');
      const endDiv = endFixture.nativeElement.querySelector('div');

      const touchStartEvent = new TouchEvent('touchstart');
      const touchEndEvent = new TouchEvent('touchend');

      startDiv.dispatchEvent(touchStartEvent);
      endDiv.dispatchEvent(touchEndEvent);

      expect(startFixture.componentInstance.touchStartEvent).toBeTruthy();
      expect(endFixture.componentInstance.touchEndEvent).toBeTruthy();

      startFixture.destroy();
      endFixture.destroy();
    });
  });
});
