import { ErrorHandler, Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

interface ErrorWithMessage {
  message?: string;
  stack?: string;
  toString(): string;
}

type ApplicationError = Error | HttpErrorResponse | ErrorWithMessage | unknown;

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  handleError(error: ApplicationError): void {
    const errorMessage = this.getErrorMessage(error);
    const errorStack = this.getErrorStack(error);

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

  private getErrorMessage(error: ApplicationError): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (error instanceof HttpErrorResponse) {
      return error.message || `HTTP Error ${error.status}`;
    }
    if (this.isErrorWithMessage(error)) {
      return error.message || error.toString();
    }
    return 'Unknown error';
  }

  private getErrorStack(error: ApplicationError): string {
    if (error instanceof Error) {
      return error.stack || '';
    }
    if (this.isErrorWithMessage(error)) {
      return error.stack || '';
    }
    return '';
  }

  private isErrorWithMessage(error: unknown): error is ErrorWithMessage {
    return (
      typeof error === 'object' &&
      error !== null &&
      ('message' in error || 'toString' in error)
    );
  }

  private isNonCriticalError(error: ApplicationError): boolean {
    const nonCriticalErrors = [
      'ExpressionChangedAfterItHasBeenCheckedError',
      'Navigation cancelled',
      'ResizeObserver loop limit exceeded'
    ];

    const errorMessage = this.getErrorMessage(error);
    return nonCriticalErrors.some(msg => errorMessage.includes(msg));
  }
}
