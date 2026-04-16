import { TestBed } from '@angular/core/testing';
import { FocusTrapService } from './focus-trap.service';

describe('FocusTrapService', () => {
  let service: FocusTrapService;
  let container: HTMLElement;

  function makeButton(tabindex?: string): HTMLButtonElement {
    const btn = document.createElement('button');
    if (tabindex !== undefined) { btn.setAttribute('tabindex', tabindex); }
    return btn;
  }

  function tabEvent(shift = false): KeyboardEvent {
    return new KeyboardEvent('keydown', { key: 'Tab', shiftKey: shift, bubbles: true });
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FocusTrapService);

    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    service.deactivate();
    document.body.removeChild(container);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('activate()', () => {
    it('returns false when selector matches nothing', () => {
      expect(service.activate('#does-not-exist')).toBe(false);
    });

    it('returns false when container has no focusable children', () => {
      container.id = 'empty-trap';
      expect(service.activate('#empty-trap')).toBe(false);
      container.id = '';
    });

    it('accepts a DOM element directly', () => {
      container.appendChild(makeButton());
      container.appendChild(makeButton());
      expect(service.activate(container)).toBe(true);
    });

    it('accepts a CSS selector string', () => {
      container.id = 'trap-test';
      container.appendChild(makeButton());
      expect(service.activate('#trap-test')).toBe(true);
      container.id = '';
    });

    it('focuses the first focusable element by default', () => {
      const btn1 = makeButton();
      const btn2 = makeButton();
      container.appendChild(btn1);
      container.appendChild(btn2);
      spyOn(btn1, 'focus');

      service.activate(container);

      expect(btn1.focus).toHaveBeenCalled();
    });

    it('does not focus first element when focusFirst=false', () => {
      const btn = makeButton();
      container.appendChild(btn);
      spyOn(btn, 'focus');

      service.activate(container, false);

      expect(btn.focus).not.toHaveBeenCalled();
    });

    it('saves the previously focused element', () => {
      const trigger = makeButton();
      document.body.appendChild(trigger);
      trigger.focus();

      container.appendChild(makeButton());
      service.activate(container, false);

      const restoreSpy = spyOn(trigger, 'focus');
      service.deactivate(true);

      expect(restoreSpy).toHaveBeenCalled();
      document.body.removeChild(trigger);
    });
  });

  describe('Tab key trapping', () => {
    let first: HTMLButtonElement;
    let last: HTMLButtonElement;

    beforeEach(() => {
      first = makeButton();
      last = makeButton();
      container.appendChild(first);
      container.appendChild(last);
      service.activate(container, false);
    });

    it('wraps forward from last to first on Tab', () => {
      last.focus();
      spyOn(first, 'focus');

      container.dispatchEvent(tabEvent(false));

      expect(first.focus).toHaveBeenCalled();
    });

    it('wraps backward from first to last on Shift+Tab', () => {
      first.focus();
      spyOn(last, 'focus');

      container.dispatchEvent(tabEvent(true));

      expect(last.focus).toHaveBeenCalled();
    });

    it('does not wrap when tabbing from a middle element', () => {
      const middle = makeButton();
      container.insertBefore(middle, last);
      service.deactivate();
      service.activate(container, false);

      middle.focus();
      spyOn(first, 'focus');
      spyOn(last, 'focus');

      container.dispatchEvent(tabEvent(false));

      expect(first.focus).not.toHaveBeenCalled();
      expect(last.focus).not.toHaveBeenCalled();
    });

    it('does not react to non-Tab keys', () => {
      last.focus();
      spyOn(first, 'focus');

      container.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      expect(first.focus).not.toHaveBeenCalled();
    });
  });

  describe('deactivate()', () => {
    it('removes the keydown listener', () => {
      const btn1 = makeButton();
      const btn2 = makeButton();
      container.appendChild(btn1);
      container.appendChild(btn2);
      service.activate(container, false);
      service.deactivate();

      btn2.focus();
      spyOn(btn1, 'focus');
      container.dispatchEvent(tabEvent(false));

      expect(btn1.focus).not.toHaveBeenCalled();
    });

    it('restores focus when restoreFocus=true', () => {
      const trigger = makeButton();
      document.body.appendChild(trigger);
      trigger.focus();

      container.appendChild(makeButton());
      service.activate(container, false);
      spyOn(trigger, 'focus');

      service.deactivate(true);

      expect(trigger.focus).toHaveBeenCalled();
      document.body.removeChild(trigger);
    });

    it('does not restore focus when restoreFocus=false (default)', () => {
      const trigger = makeButton();
      document.body.appendChild(trigger);
      trigger.focus();

      container.appendChild(makeButton());
      service.activate(container, false);
      spyOn(trigger, 'focus');

      service.deactivate();

      expect(trigger.focus).not.toHaveBeenCalled();
      document.body.removeChild(trigger);
    });
  });

  describe('saveFocus() / restoreFocus()', () => {
    it('saves current focus and restores it', () => {
      const trigger = makeButton();
      document.body.appendChild(trigger);
      trigger.focus();

      service.saveFocus();
      spyOn(trigger, 'focus');

      service.restoreFocus();

      expect(trigger.focus).toHaveBeenCalled();
      document.body.removeChild(trigger);
    });

    it('clears saved focus after restoreFocus()', () => {
      const trigger = makeButton();
      document.body.appendChild(trigger);
      trigger.focus();

      service.saveFocus();
      service.restoreFocus();

      // Second call should be a no-op (previousFocus is null)
      spyOn(trigger, 'focus');
      service.restoreFocus();

      expect(trigger.focus).not.toHaveBeenCalled();
      document.body.removeChild(trigger);
    });

    it('activate() preserves focus saved by saveFocus()', () => {
      const trigger = makeButton();
      document.body.appendChild(trigger);
      trigger.focus();

      service.saveFocus();  // saves trigger

      // Focus moves elsewhere before activate() is called (simulates setTimeout)
      const other = makeButton();
      document.body.appendChild(other);
      other.focus();

      container.appendChild(makeButton());
      service.activate(container, false);  // should NOT overwrite saved focus

      spyOn(trigger, 'focus');
      service.deactivate(true);

      expect(trigger.focus).toHaveBeenCalled();
      document.body.removeChild(trigger);
      document.body.removeChild(other);
    });
  });
});
