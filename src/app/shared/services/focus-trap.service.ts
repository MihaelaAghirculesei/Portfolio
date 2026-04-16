import { Injectable } from '@angular/core';

/**
 * Manages keyboard focus trapping for accessible modals and overlays.
 * Supports a single active trap at a time — sufficient for a portfolio app
 * where only one modal/overlay can be open simultaneously.
 */
@Injectable({ providedIn: 'root' })
export class FocusTrapService {
  private static readonly FOCUSABLE_SELECTORS = [
    'a[href]:not([tabindex="-1"])',
    'button:not([disabled]):not([tabindex="-1"])',
    'input:not([disabled]):not([tabindex="-1"])',
    'select:not([disabled]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([tabindex="-1"])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  private trapElement: Element | null = null;
  private firstFocusable: HTMLElement | null = null;
  private lastFocusable: HTMLElement | null = null;
  private boundHandler: ((e: Event) => void) | null = null;
  private previousFocus: HTMLElement | null = null;

  /**
   * Activates focus trap on the given container.
   * If saveFocus() was called before, the pre-saved element is preserved
   * (useful when the trap is set up in a setTimeout after the focus was saved).
   *
   * @param container CSS selector string or DOM element to trap focus within
   * @param focusFirst Whether to move focus to the first focusable element (default: true)
   * @returns true if the trap was successfully activated
   */
  activate(container: Element | string, focusFirst = true): boolean {
    const el = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!el) { return false; }

    // Clean up any previous trap listener without resetting previousFocus,
    // so a pre-saved focus (from saveFocus()) is preserved.
    if (this.trapElement && this.boundHandler) {
      this.trapElement.removeEventListener('keydown', this.boundHandler);
    }

    // Only capture focus if not already saved (e.g. by saveFocus())
    if (!this.previousFocus) {
      this.previousFocus = document.activeElement as HTMLElement;
    }

    this.trapElement = el;

    const focusable = Array.from(
      el.querySelectorAll<HTMLElement>(FocusTrapService.FOCUSABLE_SELECTORS)
    );

    if (focusable.length === 0) { return false; }

    this.firstFocusable = focusable[0];
    this.lastFocusable = focusable[focusable.length - 1];

    this.boundHandler = this.handleKeydown.bind(this);
    el.addEventListener('keydown', this.boundHandler);

    if (focusFirst) {
      this.firstFocusable.focus();
    }

    return true;
  }

  /**
   * Deactivates the current focus trap and removes the keydown listener.
   * @param restoreFocus Whether to return focus to the element active before activate() was called
   */
  deactivate(restoreFocus = false): void {
    if (this.trapElement && this.boundHandler) {
      this.trapElement.removeEventListener('keydown', this.boundHandler);
    }

    if (restoreFocus) {
      this.previousFocus?.focus();
    }

    this.trapElement = null;
    this.firstFocusable = null;
    this.lastFocusable = null;
    this.boundHandler = null;
    this.previousFocus = null;
  }

  /**
   * Saves the currently focused element for later restoration via restoreFocus().
   * Call this before opening a popup/overlay, especially when the trap will be
   * set up asynchronously (e.g. inside a setTimeout).
   */
  saveFocus(): void {
    this.previousFocus = document.activeElement as HTMLElement;
  }

  /**
   * Restores focus to the element saved by the last saveFocus() or activate() call.
   */
  restoreFocus(): void {
    this.previousFocus?.focus();
    this.previousFocus = null;
  }

  private handleKeydown(event: Event): void {
    if (!(event instanceof KeyboardEvent) || event.key !== 'Tab') { return; }

    if (event.shiftKey) {
      if (document.activeElement === this.firstFocusable) {
        event.preventDefault();
        this.lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === this.lastFocusable) {
        event.preventDefault();
        this.firstFocusable?.focus();
      }
    }
  }
}
