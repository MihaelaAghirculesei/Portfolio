import { Directive, ElementRef, EventEmitter, OnDestroy, OnInit, Output, inject } from '@angular/core';

@Directive()
abstract class PassiveListenerDirective implements OnInit, OnDestroy {
  protected abstract readonly eventName: 'touchstart' | 'touchend';
  protected abstract emit(event: TouchEvent): void;

  private readonly el = inject(ElementRef);
  private readonly listener = (event: TouchEvent): void => this.emit(event);

  ngOnInit(): void {
    this.el.nativeElement.addEventListener(this.eventName, this.listener, { passive: true });
  }

  ngOnDestroy(): void {
    this.el.nativeElement.removeEventListener(this.eventName, this.listener);
  }
}

@Directive({
  selector: '[appPassiveTouchStart]',
  standalone: true,
})
export class PassiveTouchStartDirective extends PassiveListenerDirective {
  @Output() passiveTouchStart = new EventEmitter<TouchEvent>();

  protected readonly eventName = 'touchstart';
  protected emit(event: TouchEvent): void {
    this.passiveTouchStart.emit(event);
  }
}

@Directive({
  selector: '[appPassiveTouchEnd]',
  standalone: true,
})
export class PassiveTouchEndDirective extends PassiveListenerDirective {
  @Output() passiveTouchEnd = new EventEmitter<TouchEvent>();

  protected readonly eventName = 'touchend';
  protected emit(event: TouchEvent): void {
    this.passiveTouchEnd.emit(event);
  }
}
