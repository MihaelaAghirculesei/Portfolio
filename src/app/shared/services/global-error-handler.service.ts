import { ErrorHandler, Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  handleError(error: Error | any): void {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    const errorStack = error?.stack || '';

    if (isPlatformBrowser(this.platformId)) {
      console.error('Global Error Handler:', {
        message: errorMessage,
        stack: errorStack,
        timestamp: new Date().toISOString()
      });
    }

    if (this.isNonCriticalError(error)) {
      return;
    }


    
    throw error;
  }

  private isNonCriticalError(error: any): boolean {
    const nonCriticalErrors = [
      'ExpressionChangedAfterItHasBeenCheckedError',
      'Navigation cancelled',
      'ResizeObserver loop limit exceeded'
    ];

    const errorMessage = error?.message || error?.toString() || '';
    return nonCriticalErrors.some(msg => errorMessage.includes(msg));
  }
}
