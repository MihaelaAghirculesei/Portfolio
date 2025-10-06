import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly enableLogging = environment.enableLogging;

  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.enableLogging || !this.isBrowser) {
      return;
    }

    switch (level) {
      case 'error':
        // eslint-disable-next-line no-console
        console.error(message, data);
        break;
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(message, data);
        break;
      case 'info':
        // eslint-disable-next-line no-console
        console.info(message, data);
        break;
      case 'debug':
        // eslint-disable-next-line no-console
        console.debug(message, data);
        break;
    }
  }
}
