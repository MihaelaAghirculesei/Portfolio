import { Directive, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[passiveTouchStart]',
  standalone: true,
})
export class PassiveTouchStartDirective implements OnInit, OnDestroy {
  @Output() passiveTouchStart = new EventEmitter<TouchEvent>();

  private listener: (event: TouchEvent) => void;

  constructor(private el: ElementRef) {
    this.listener = (event: TouchEvent) => this.passiveTouchStart.emit(event);
  }

  ngOnInit(): void {
    this.el.nativeElement.addEventListener('touchstart', this.listener, { passive: true });
  }

  ngOnDestroy(): void {
    this.el.nativeElement.removeEventListener('touchstart', this.listener);
  }
}

@Directive({
  selector: '[passiveTouchEnd]',
  standalone: true,
})
export class PassiveTouchEndDirective implements OnInit, OnDestroy {
  @Output() passiveTouchEnd = new EventEmitter<TouchEvent>();

  private listener: (event: TouchEvent) => void;

  constructor(private el: ElementRef) {
    this.listener = (event: TouchEvent) => this.passiveTouchEnd.emit(event);
  }

  ngOnInit(): void {
    this.el.nativeElement.addEventListener('touchend', this.listener, { passive: true });
  }

  ngOnDestroy(): void {
    this.el.nativeElement.removeEventListener('touchend', this.listener);
  }
}
