import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;
  let consoleErrorSpy: jasmine.Spy;
  let consoleWarnSpy: jasmine.Spy;
  let consoleInfoSpy: jasmine.Spy;
  let consoleDebugSpy: jasmine.Spy;

  describe('Browser Platform with Logging Enabled', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          LoggerService,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });

      service = TestBed.inject(LoggerService);

      consoleErrorSpy = spyOn(console, 'error');
      consoleWarnSpy = spyOn(console, 'warn');
      consoleInfoSpy = spyOn(console, 'info');
      consoleDebugSpy = spyOn(console, 'debug');
    });

    describe('Service Creation', () => {
      it('should be created', () => {
        expect(service).toBeTruthy();
      });

      it('should be provided in root', () => {
        const service1 = TestBed.inject(LoggerService);
        const service2 = TestBed.inject(LoggerService);
        expect(service1).toBe(service2);
      });
    });

    describe('error() method', () => {
      it('should call console.error with message only', () => {
        const message = 'Error message';

        service.error(message);

        expect(consoleErrorSpy).toHaveBeenCalledWith(message, undefined);
      });

      it('should call console.error with message and data', () => {
        const message = 'Error with data';
        const data = { code: 500, details: 'Server error' };

        service.error(message, data);

        expect(consoleErrorSpy).toHaveBeenCalledWith(message, data);
      });

      it('should handle complex data objects', () => {
        const message = 'Complex error';
        const data = {
          nested: { value: 123 },
          array: [1, 2, 3],
          nullValue: null,
          undefinedValue: undefined
        };

        service.error(message, data);

        expect(consoleErrorSpy).toHaveBeenCalledWith(message, data);
      });

      it('should not call other console methods', () => {
        service.error('Error');

        expect(consoleWarnSpy).not.toHaveBeenCalled();
        expect(consoleInfoSpy).not.toHaveBeenCalled();
        expect(consoleDebugSpy).not.toHaveBeenCalled();
      });
    });

    describe('warn() method', () => {
      it('should call console.warn with message only', () => {
        const message = 'Warning message';

        service.warn(message);

        expect(consoleWarnSpy).toHaveBeenCalledWith(message, undefined);
      });

      it('should call console.warn with message and data', () => {
        const message = 'Warning with data';
        const data = { deprecated: true, alternative: 'newMethod()' };

        service.warn(message, data);

        expect(consoleWarnSpy).toHaveBeenCalledWith(message, data);
      });

      it('should not call other console methods', () => {
        service.warn('Warning');

        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(consoleInfoSpy).not.toHaveBeenCalled();
        expect(consoleDebugSpy).not.toHaveBeenCalled();
      });
    });

    describe('info() method', () => {
      it('should call console.info with message only', () => {
        const message = 'Info message';

        service.info(message);

        expect(consoleInfoSpy).toHaveBeenCalledWith(message, undefined);
      });

      it('should call console.info with message and data', () => {
        const message = 'Info with data';
        const data = { user: 'John', action: 'login' };

        service.info(message, data);

        expect(consoleInfoSpy).toHaveBeenCalledWith(message, data);
      });

      it('should not call other console methods', () => {
        service.info('Info');

        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        expect(consoleDebugSpy).not.toHaveBeenCalled();
      });
    });

    describe('debug() method', () => {
      it('should call console.debug with message only', () => {
        const message = 'Debug message';

        service.debug(message);

        expect(consoleDebugSpy).toHaveBeenCalledWith(message, undefined);
      });

      it('should call console.debug with message and data', () => {
        const message = 'Debug with data';
        const data = { timestamp: Date.now(), performance: 123 };

        service.debug(message, data);

        expect(consoleDebugSpy).toHaveBeenCalledWith(message, data);
      });

      it('should not call other console methods', () => {
        service.debug('Debug');

        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        expect(consoleInfoSpy).not.toHaveBeenCalled();
      });
    });

    describe('Multiple Log Levels', () => {
      it('should handle multiple log calls independently', () => {
        service.error('Error 1');
        service.warn('Warning 1');
        service.info('Info 1');
        service.debug('Debug 1');

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
        expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      });

      it('should handle consecutive calls of same level', () => {
        service.error('Error 1');
        service.error('Error 2');
        service.error('Error 3');

        expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty string message', () => {
        service.info('');

        expect(consoleInfoSpy).toHaveBeenCalledWith('', undefined);
      });

      it('should handle undefined data', () => {
        service.error('Error', undefined);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error', undefined);
      });

      it('should handle null data', () => {
        service.warn('Warning', null);

        expect(consoleWarnSpy).toHaveBeenCalledWith('Warning', null);
      });

      it('should handle zero as data', () => {
        service.info('Info', 0);

        expect(consoleInfoSpy).toHaveBeenCalledWith('Info', 0);
      });

      it('should handle false as data', () => {
        service.debug('Debug', false);

        expect(consoleDebugSpy).toHaveBeenCalledWith('Debug', false);
      });

      it('should handle string data', () => {
        service.error('Error', 'Additional error info');

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error', 'Additional error info');
      });

      it('should handle array data', () => {
        const data = [1, 2, 3, 'test'];

        service.warn('Warning', data);

        expect(consoleWarnSpy).toHaveBeenCalledWith('Warning', data);
      });

      it('should handle special characters in message', () => {
        const message = 'Error: <script>alert("test")</script> & special chars';

        service.error(message);

        expect(consoleErrorSpy).toHaveBeenCalledWith(message, undefined);
      });

      it('should handle very long messages', () => {
        const longMessage = 'A'.repeat(10000);

        service.info(longMessage);

        expect(consoleInfoSpy).toHaveBeenCalledWith(longMessage, undefined);
      });

      it('should handle circular reference in data', () => {
        const circular: any = { prop: 'value' };
        circular.self = circular;

        expect(() => {
          service.debug('Debug', circular);
        }).not.toThrow();

        expect(consoleDebugSpy).toHaveBeenCalledWith('Debug', circular);
      });
    });
  });

  describe('Server Platform', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          LoggerService,
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });

      service = TestBed.inject(LoggerService);

      consoleErrorSpy = spyOn(console, 'error');
      consoleWarnSpy = spyOn(console, 'warn');
      consoleInfoSpy = spyOn(console, 'info');
      consoleDebugSpy = spyOn(console, 'debug');
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should not log error on server platform', () => {
      service.error('Server error');

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should not log warn on server platform', () => {
      service.warn('Server warning');

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should not log info on server platform', () => {
      service.info('Server info');

      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it('should not log debug on server platform', () => {
      service.debug('Server debug');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });

    it('should not log even with data on server platform', () => {
      const data = { some: 'data' };

      service.error('Error', data);
      service.warn('Warning', data);
      service.info('Info', data);
      service.debug('Debug', data);

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });

    it('should handle multiple calls gracefully on server', () => {
      service.error('Error 1');
      service.error('Error 2');
      service.warn('Warning 1');

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('Type Safety', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          LoggerService,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });

      service = TestBed.inject(LoggerService);
      consoleErrorSpy = spyOn(console, 'error');
      consoleInfoSpy = spyOn(console, 'info');
    });

    it('should accept unknown type for data parameter', () => {
      const unknownData: unknown = { test: 'value' };

      service.info('Test', unknownData);

      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should accept any object type for data', () => {
      class CustomError extends Error {
        code = 500;
      }

      const error = new CustomError('Custom error');

      service.error('Error occurred', error);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error occurred', error);
    });
  });
});
