import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { GlobalErrorHandler } from './global-error-handler.service';
import { LoggerService } from './logger.service';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let loggerSpy: jasmine.SpyObj<LoggerService>;

  describe('Browser Platform', () => {
    beforeEach(() => {
      const loggerSpyObj = jasmine.createSpyObj('LoggerService', ['error', 'warn', 'info', 'debug']);

      TestBed.configureTestingModule({
        providers: [
          GlobalErrorHandler,
          { provide: LoggerService, useValue: loggerSpyObj },
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });

      handler = TestBed.inject(GlobalErrorHandler);
      loggerSpy = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
    });

    describe('Service Creation', () => {
      it('should be created', () => {
        expect(handler).toBeTruthy();
      });

      it('should be provided in root', () => {
        const handler1 = TestBed.inject(GlobalErrorHandler);
        const handler2 = TestBed.inject(GlobalErrorHandler);
        expect(handler1).toBe(handler2);
      });
    });

    describe('handleError() with Standard Error', () => {
      it('should log error message and stack', () => {
        const error = new Error('Test error');

        expect(() => handler.handleError(error)).toThrowError('Test error');

        expect(loggerSpy.error).toHaveBeenCalledWith(
          'Global Error Handler:',
          jasmine.objectContaining({
            message: 'Test error',
            stack: jasmine.any(String),
            timestamp: jasmine.any(String)
          })
        );
      });

      it('should throw critical errors', () => {
        const error = new Error('Critical error');

        expect(() => handler.handleError(error)).toThrow(error);
      });

      it('should include timestamp in ISO format', () => {
        const error = new Error('Test');
        const beforeTime = new Date().toISOString();

        try {
          handler.handleError(error);
        } catch (e) {
          // Expected to throw
        }

        const loggedData = loggerSpy.error.calls.mostRecent().args[1] as any;
        expect(loggedData.timestamp).toBeTruthy();
        expect(new Date(loggedData.timestamp).toISOString()).toBe(loggedData.timestamp);
      });

      it('should handle error without stack trace', () => {
        const error = new Error('Error without stack');
        error.stack = undefined;

        expect(() => handler.handleError(error)).toThrowError();

        expect(loggerSpy.error).toHaveBeenCalledWith(
          'Global Error Handler:',
          jasmine.objectContaining({
            message: 'Error without stack',
            stack: ''
          })
        );
      });
    });

    describe('handleError() with HttpErrorResponse', () => {
      it('should handle HTTP 404 error', () => {
        const httpError = new HttpErrorResponse({
          error: 'Not found',
          status: 404,
          statusText: 'Not Found',
          url: '/api/test'
        });

        expect(() => handler.handleError(httpError)).toThrow(httpError);

        expect(loggerSpy.error).toHaveBeenCalledWith(
          'Global Error Handler:',
          jasmine.objectContaining({
            message: jasmine.stringContaining('404')
          })
        );
      });

      it('should handle HTTP 500 error', () => {
        const httpError = new HttpErrorResponse({
          error: 'Server error',
          status: 500,
          statusText: 'Internal Server Error',
          url: '/api/test'
        });

        expect(() => handler.handleError(httpError)).toThrow(httpError);

        expect(loggerSpy.error).toHaveBeenCalledWith(
          'Global Error Handler:',
          jasmine.objectContaining({
            message: jasmine.stringContaining('500')
          })
        );
      });

      it('should handle HTTP error without message', () => {
        const httpError = new HttpErrorResponse({
          status: 400,
          statusText: 'Bad Request'
        });

        expect(() => handler.handleError(httpError)).toThrow(httpError);

        expect(loggerSpy.error).toHaveBeenCalledWith(
          'Global Error Handler:',
          jasmine.objectContaining({
            message: jasmine.stringContaining('400')
          })
        );
      });

      it('should handle HTTP 0 error (network error)', () => {
        const httpError = new HttpErrorResponse({
          error: 'Network failure',
          status: 0,
          statusText: 'Unknown Error'
        });

        expect(() => handler.handleError(httpError)).toThrow(httpError);

        expect(loggerSpy.error).toHaveBeenCalled();
      });
    });

    describe('handleError() with Non-Critical Errors', () => {
      it('should not throw ExpressionChangedAfterItHasBeenCheckedError', () => {
        const error = new Error('ExpressionChangedAfterItHasBeenCheckedError: value changed');

        expect(() => handler.handleError(error)).not.toThrow();

        expect(loggerSpy.error).toHaveBeenCalled();
      });

      it('should not throw Navigation cancelled error', () => {
        const error = new Error('Navigation cancelled by user');

        expect(() => handler.handleError(error)).not.toThrow();

        expect(loggerSpy.error).toHaveBeenCalled();
      });

      it('should not throw ResizeObserver loop limit exceeded', () => {
        const error = new Error('ResizeObserver loop limit exceeded');

        expect(() => handler.handleError(error)).not.toThrow();

        expect(loggerSpy.error).toHaveBeenCalled();
      });

      it('should still log non-critical errors', () => {
        const error = new Error('ExpressionChangedAfterItHasBeenCheckedError');

        handler.handleError(error);

        expect(loggerSpy.error).toHaveBeenCalledWith(
          'Global Error Handler:',
          jasmine.objectContaining({
            message: jasmine.stringContaining('ExpressionChangedAfterItHasBeenCheckedError')
          })
        );
      });
    });

    describe('handleError() with Custom Error Objects', () => {
      it('should handle error with message property', () => {
        const customError = {
          message: 'Custom error message',
          toString: (): string => 'Custom error'
        };

        expect(() => handler.handleError(customError)).toThrow(customError);

        expect(loggerSpy.error).toHaveBeenCalledWith(
          'Global Error Handler:',
          jasmine.objectContaining({
            message: 'Custom error message'
          })
        );
      });

      it('should handle error with toString() only', () => {
        const customError = {
          toString: (): string => 'ToString error'
        };

        expect(() => handler.handleError(customError)).toThrow(customError);

        expect(loggerSpy.error).toHaveBeenCalledWith(
          'Global Error Handler:',
          jasmine.objectContaining({
            message: 'ToString error'
          })
        );
      });

      it('should handle error with stack trace', () => {
        const customError = {
          message: 'Custom error',
          stack: 'Error: Custom error\n    at file.ts:10:5',
          toString: (): string => 'Custom error'
        };

        expect(() => handler.handleError(customError)).toThrow(customError);

        expect(loggerSpy.error).toHaveBeenCalledWith(
          'Global Error Handler:',
          jasmine.objectContaining({
            stack: 'Error: Custom error\n    at file.ts:10:5'
          })
        );
      });

      it('should handle error with empty message but toString', () => {
        const customError = {
          message: '',
          toString: (): string => 'Fallback toString'
        };

        expect(() => handler.handleError(customError)).toThrow(customError);

        expect(loggerSpy.error).toHaveBeenCalledWith(
          'Global Error Handler:',
          jasmine.objectContaining({
            message: 'Fallback toString'
          })
        );
      });
    });

    describe('handleError() with Unknown Error Types', () => {
      it('should handle null error', () => {
        expect(() => handler.handleError(null)).toThrow(null);

        expect(loggerSpy.error).toHaveBeenCalledWith(
          'Global Error Handler:',
          jasmine.objectContaining({
            message: 'Unknown error',
            stack: ''
          })
        );
      });

      it('should handle undefined error', () => {
        expect(() => handler.handleError(undefined)).toThrow(undefined);

        expect(loggerSpy.error).toHaveBeenCalledWith(
          'Global Error Handler:',
          jasmine.objectContaining({
            message: 'Unknown error'
          })
        );
      });

      it('should handle string error', () => {
        const error = 'String error message';

        expect(() => handler.handleError(error)).toThrow(error);

        expect(loggerSpy.error).toHaveBeenCalledWith(
          'Global Error Handler:',
          jasmine.objectContaining({
            message: 'Unknown error'
          })
        );
      });

      it('should handle number error', () => {
        const error = 404;

        expect(() => handler.handleError(error)).toThrow(error);

        expect(loggerSpy.error).toHaveBeenCalled();
      });

      it('should handle plain object without message', () => {
        const error = { code: 500, details: 'Something went wrong' };

        expect(() => handler.handleError(error)).toThrow(error);

        expect(loggerSpy.error).toHaveBeenCalledWith(
          'Global Error Handler:',
          jasmine.objectContaining({
            message: '[object Object]'
          })
        );
      });
    });

    describe('Error Message Extraction', () => {
      it('should prioritize Error.message', () => {
        const error = new Error('Error message');

        try {
          handler.handleError(error);
        } catch (e) {
          // Expected
        }

        const loggedData = loggerSpy.error.calls.mostRecent().args[1] as any;
        expect(loggedData.message).toBe('Error message');
      });

      it('should extract message from HttpErrorResponse', () => {
        const error = new HttpErrorResponse({
          error: 'Bad request',
          status: 400,
          statusText: 'Bad Request'
        });

        try {
          handler.handleError(error);
        } catch (e) {
          // Expected
        }

        const loggedData = loggerSpy.error.calls.mostRecent().args[1] as any;
        expect(loggedData.message).toContain('400');
      });

      it('should use toString for objects with toString method', () => {
        const error = {
          toString: (): string => 'Custom toString result',
          message: undefined
        };

        try {
          handler.handleError(error);
        } catch (e) {
          // Expected
        }

        const loggedData = loggerSpy.error.calls.mostRecent().args[1] as any;
        expect(loggedData.message).toBe('Custom toString result');
      });
    });

    describe('Error Stack Extraction', () => {
      it('should extract stack from Error', () => {
        const error = new Error('Test');

        try {
          handler.handleError(error);
        } catch (e) {
          // Expected
        }

        const loggedData = loggerSpy.error.calls.mostRecent().args[1] as any;
        expect(loggedData.stack).toBeTruthy();
        expect(typeof loggedData.stack).toBe('string');
      });

      it('should return empty string for errors without stack', () => {
        const error = new HttpErrorResponse({ status: 500 });

        try {
          handler.handleError(error);
        } catch (e) {
          // Expected
        }

        const loggedData = loggerSpy.error.calls.mostRecent().args[1] as any;
        expect(loggedData.stack).toBe('');
      });

      it('should extract stack from custom error objects', () => {
        const error = {
          message: 'Custom',
          stack: 'Error stack trace here',
          toString: (): string => 'Custom'
        };

        try {
          handler.handleError(error);
        } catch (e) {
          // Expected
        }

        const loggedData = loggerSpy.error.calls.mostRecent().args[1] as any;
        expect(loggedData.stack).toBe('Error stack trace here');
      });
    });

    describe('Multiple Error Handling', () => {
      it('should handle consecutive errors independently', () => {
        const error1 = new Error('First error');
        const error2 = new Error('Second error');

        expect(() => handler.handleError(error1)).toThrow(error1);
        expect(() => handler.handleError(error2)).toThrow(error2);

        expect(loggerSpy.error).toHaveBeenCalledTimes(2);
      });

      it('should handle mix of critical and non-critical errors', () => {
        const criticalError = new Error('Critical');
        const nonCriticalError = new Error('Navigation cancelled');

        expect(() => handler.handleError(criticalError)).toThrow(criticalError);
        expect(() => handler.handleError(nonCriticalError)).not.toThrow();

        expect(loggerSpy.error).toHaveBeenCalledTimes(2);
      });
    });

    describe('Edge Cases', () => {
      it('should handle very long error messages', () => {
        const longMessage = 'A'.repeat(10000);
        const error = new Error(longMessage);

        expect(() => handler.handleError(error)).toThrow(error);

        const loggedData = loggerSpy.error.calls.mostRecent().args[1] as any;
        expect(loggedData.message).toBe(longMessage);
      });

      it('should handle error with special characters', () => {
        const error = new Error('Error with <script>alert("xss")</script>');

        expect(() => handler.handleError(error)).toThrow(error);

        expect(loggerSpy.error).toHaveBeenCalled();
      });

      it('should handle error with unicode characters', () => {
        const error = new Error('Error avec des caractères spéciaux: é, ñ, ü, 中文');

        expect(() => handler.handleError(error)).toThrow(error);

        const loggedData = loggerSpy.error.calls.mostRecent().args[1] as any;
        expect(loggedData.message).toContain('é, ñ, ü, 中文');
      });

      it('should handle circular reference in error object', () => {
        const error: any = { message: 'Circular error' };
        error.self = error;
        error.toString = (): string => 'Circular';

        expect(() => handler.handleError(error)).toThrow(error);

        expect(loggerSpy.error).toHaveBeenCalled();
      });
    });
  });

  describe('Server Platform', () => {
    beforeEach(() => {
      const loggerSpyObj = jasmine.createSpyObj('LoggerService', ['error', 'warn', 'info', 'debug']);

      TestBed.configureTestingModule({
        providers: [
          GlobalErrorHandler,
          { provide: LoggerService, useValue: loggerSpyObj },
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });

      handler = TestBed.inject(GlobalErrorHandler);
      loggerSpy = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
    });

    it('should be created', () => {
      expect(handler).toBeTruthy();
    });

    it('should not log errors on server platform', () => {
      const error = new Error('Server error');

      expect(() => handler.handleError(error)).toThrow(error);

      expect(loggerSpy.error).not.toHaveBeenCalled();
    });

    it('should still throw critical errors on server', () => {
      const error = new Error('Critical server error');

      expect(() => handler.handleError(error)).toThrow(error);
    });

    it('should not throw non-critical errors on server', () => {
      const error = new Error('ExpressionChangedAfterItHasBeenCheckedError');

      expect(() => handler.handleError(error)).not.toThrow();

      expect(loggerSpy.error).not.toHaveBeenCalled();
    });

    it('should handle HttpErrorResponse on server without logging', () => {
      const httpError = new HttpErrorResponse({ status: 500 });

      expect(() => handler.handleError(httpError)).toThrow(httpError);

      expect(loggerSpy.error).not.toHaveBeenCalled();
    });
  });

  describe('Non-Critical Error Detection', () => {
    beforeEach(() => {
      const loggerSpyObj = jasmine.createSpyObj('LoggerService', ['error', 'warn', 'info', 'debug']);

      TestBed.configureTestingModule({
        providers: [
          GlobalErrorHandler,
          { provide: LoggerService, useValue: loggerSpyObj },
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });

      handler = TestBed.inject(GlobalErrorHandler);
      loggerSpy = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
    });

    it('should detect partial match of non-critical error message', () => {
      const error = new Error('Something before Navigation cancelled something after');

      expect(() => handler.handleError(error)).not.toThrow();
    });

    it('should detect ExpressionChangedAfterItHasBeenCheckedError with context', () => {
      const error = new Error(
        'ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked'
      );

      expect(() => handler.handleError(error)).not.toThrow();
    });

    it('should detect ResizeObserver error variations', () => {
      const error = new Error('ResizeObserver loop limit exceeded in component');

      expect(() => handler.handleError(error)).not.toThrow();
    });

    it('should throw errors that do not match non-critical patterns', () => {
      const error = new Error('Some other critical error');

      expect(() => handler.handleError(error)).toThrow(error);
    });
  });
});
