import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID, DOCUMENT } from '@angular/core';

import { ScrollService } from './scroll.service';
import { LoggerService } from './logger.service';

interface MockWindow {
  scrollTo: jasmine.Spy;
  scrollY: number | undefined;
  pageYOffset: number | undefined;
  innerWidth: number;
}

interface MockDocument {
  getElementById: jasmine.Spy;
  defaultView: MockWindow | null;
  body: HTMLElement;
  querySelectorAll: jasmine.Spy;
}

describe('ScrollService', () => {
  let service: ScrollService;
  let mockDocument: MockDocument;
  let mockWindow: MockWindow;
  let mockLogger: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    mockWindow = {
      scrollTo: jasmine.createSpy('scrollTo'),
      scrollY: 0,
      pageYOffset: 0,
      innerWidth: 1920
    };

    mockDocument = {
      getElementById: jasmine.createSpy('getElementById'),
      defaultView: mockWindow,
      body: document.body,
      querySelectorAll: jasmine.createSpy('querySelectorAll').and.returnValue([])
    };

    mockLogger = jasmine.createSpyObj('LoggerService', ['error', 'warn', 'info', 'debug']);

    TestBed.configureTestingModule({
      providers: [
        ScrollService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: DOCUMENT, useValue: mockDocument },
        { provide: LoggerService, useValue: mockLogger }
      ]
    });

    service = TestBed.inject(ScrollService);
    sessionStorage.clear();
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with browser platform', () => {
      expect(service['isBrowser']).toBe(true);
    });

    it('should have mobile offsets configured', () => {
      expect(service['mobileOffsets']).toEqual({
        aboutMe: 0,
        skills: -5,
        projects: 20,
        references: 100
      });
    });
  });

  describe('scrollToElement', () => {
    it('should scroll to element on desktop', () => {
      const mockElement = {
        offsetTop: 500
      } as HTMLElement;

      mockDocument.getElementById.and.returnValue(mockElement);
      mockWindow.innerWidth = 1920;

      service.scrollToElement('test-element');

      expect(mockDocument.getElementById).toHaveBeenCalledWith('test-element');
      expect(mockWindow.scrollTo).toHaveBeenCalledWith({
        top: 402, // 500 - 98 (HEADER_HEIGHT) - 0 (no mobile offset)
        behavior: 'smooth'
      });
    });

    it('should scroll to element on mobile with offset', () => {
      const mockElement = {
        offsetTop: 500
      } as HTMLElement;

      mockDocument.getElementById.and.returnValue(mockElement);
      mockWindow.innerWidth = 768;

      service.scrollToElement('skills');

      expect(mockWindow.scrollTo).toHaveBeenCalledWith({
        top: 407, // 500 - 98 - (-5)
        behavior: 'smooth'
      });
    });

    it('should use default mobile offset for unknown element', () => {
      const mockElement = {
        offsetTop: 500
      } as HTMLElement;

      mockDocument.getElementById.and.returnValue(mockElement);
      mockWindow.innerWidth = 768;

      service.scrollToElement('unknown-element');

      expect(mockWindow.scrollTo).toHaveBeenCalledWith({
        top: 402, // 500 - 98 - 0
        behavior: 'smooth'
      });
    });

    it('should not scroll if element not found', () => {
      mockDocument.getElementById.and.returnValue(null);

      service.scrollToElement('non-existent');

      expect(mockWindow.scrollTo).not.toHaveBeenCalled();
    });

    it('should not scroll if window is null', () => {
      const mockElement = {
        offsetTop: 500
      } as HTMLElement;

      mockDocument.getElementById.and.returnValue(mockElement);
      mockDocument.defaultView = null;

      service.scrollToElement('test-element');

      expect(mockWindow.scrollTo).not.toHaveBeenCalled();
    });

    it('should handle all block positions', () => {
      const mockElement = {
        offsetTop: 500
      } as HTMLElement;

      mockDocument.getElementById.and.returnValue(mockElement);

      service.scrollToElement('test', 'start');
      service.scrollToElement('test', 'center');
      service.scrollToElement('test', 'end');

      expect(mockWindow.scrollTo).toHaveBeenCalledTimes(3);
    });
  });

  describe('scrollToPosition', () => {
    it('should scroll to specific position', () => {
      service.scrollToPosition(500);

      expect(mockWindow.scrollTo).toHaveBeenCalledWith({
        top: 500,
        behavior: 'smooth'
      });
    });

    it('should handle position 0', () => {
      service.scrollToPosition(0);

      expect(mockWindow.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth'
      });
    });

    it('should not scroll if window is null', () => {
      mockDocument.defaultView = null;

      service.scrollToPosition(500);

      expect(mockWindow.scrollTo).not.toHaveBeenCalled();
    });
  });

  describe('scrollToTop', () => {
    it('should scroll to position 0', () => {
      spyOn(service, 'scrollToPosition');

      service.scrollToTop();

      expect(service.scrollToPosition).toHaveBeenCalledWith(0);
    });
  });

  describe('getCurrentScrollPosition', () => {
    it('should return scrollY position', () => {
      mockWindow.scrollY = 250;

      const position = service.getCurrentScrollPosition();

      expect(position).toBe(250);
    });

    it('should fallback to pageYOffset if scrollY is undefined', () => {
      mockWindow.scrollY = undefined;
      mockWindow.pageYOffset = 300;

      const position = service.getCurrentScrollPosition();

      expect(position).toBe(300);
    });

    it('should return 0 if window is null', () => {
      mockDocument.defaultView = null;

      const position = service.getCurrentScrollPosition();

      expect(position).toBe(0);
    });

    it('should return 0 if both scrollY and pageYOffset are undefined', () => {
      mockWindow.scrollY = undefined;
      mockWindow.pageYOffset = undefined;

      const position = service.getCurrentScrollPosition();

      expect(position).toBe(0);
    });
  });

  describe('isScrolledBeyond', () => {
    it('should return true if scrolled beyond threshold', () => {
      mockWindow.scrollY = 150;

      const result = service.isScrolledBeyond(100);

      expect(result).toBe(true);
    });

    it('should return false if not scrolled beyond threshold', () => {
      mockWindow.scrollY = 50;

      const result = service.isScrolledBeyond(100);

      expect(result).toBe(false);
    });

    it('should return false if at exactly the threshold', () => {
      mockWindow.scrollY = 100;

      const result = service.isScrolledBeyond(100);

      expect(result).toBe(false);
    });

    it('should handle threshold of 0', () => {
      mockWindow.scrollY = 0;

      const result = service.isScrolledBeyond(0);

      expect(result).toBe(false);
    });
  });

  describe('Server-side rendering (browser service)', () => {
    it('should be truthy', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('saveScrollPosition', () => {
    it('should save current scroll position to sessionStorage', () => {
      mockWindow.scrollY = 350;

      service.saveScrollPosition();

      expect(sessionStorage.getItem('contact-scroll-position')).toBe('350');
    });

    it('should log error when sessionStorage is unavailable', () => {
      spyOn(sessionStorage, 'setItem').and.throwError('QuotaExceededError');

      service.saveScrollPosition();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to save scroll position',
        jasmine.any(Error)
      );
    });
  });

  describe('restoreScrollPosition', () => {
    it('should restore saved position and scroll to it', () => {
      sessionStorage.setItem('contact-scroll-position', '500');

      service.restoreScrollPosition();

      expect(mockWindow.scrollTo).toHaveBeenCalledWith(0, 500);
    });

    it('should remove the key from sessionStorage after restoring', () => {
      sessionStorage.setItem('contact-scroll-position', '200');

      service.restoreScrollPosition();

      expect(sessionStorage.getItem('contact-scroll-position')).toBeNull();
    });

    it('should not scroll if no saved position exists', () => {
      service.restoreScrollPosition();

      expect(mockWindow.scrollTo).not.toHaveBeenCalled();
    });

    it('should log error when sessionStorage is unavailable', () => {
      spyOn(sessionStorage, 'getItem').and.throwError('SecurityError');

      service.restoreScrollPosition();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to restore scroll position',
        jasmine.any(Error)
      );
    });
  });
});

describe('ScrollService - SSR (server platform)', () => {
  let ssrService: ScrollService;
  let ssrMockWindow: { scrollTo: jasmine.Spy; scrollY: number; pageYOffset: number; innerWidth: number };
  let ssrMockDocument: {
    getElementById: jasmine.Spy;
    defaultView: typeof ssrMockWindow | null;
    body: HTMLElement;
    querySelectorAll: jasmine.Spy;
  };
  let ssrMockLogger: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    ssrMockWindow = {
      scrollTo: jasmine.createSpy('scrollTo'),
      scrollY: 0,
      pageYOffset: 0,
      innerWidth: 1920
    };
    ssrMockDocument = {
      getElementById: jasmine.createSpy('getElementById'),
      defaultView: ssrMockWindow,
      body: document.body,
      querySelectorAll: jasmine.createSpy('querySelectorAll').and.returnValue([])
    };
    ssrMockLogger = jasmine.createSpyObj('LoggerService', ['error', 'warn', 'info', 'debug']);

    TestBed.configureTestingModule({
      providers: [
        ScrollService,
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: DOCUMENT, useValue: ssrMockDocument },
        { provide: LoggerService, useValue: ssrMockLogger }
      ]
    });

    ssrService = TestBed.inject(ScrollService);
  });

  it('should report isBrowser as false', () => {
    expect(ssrService['isBrowser']).toBe(false);
  });

  it('scrollToElement should not scroll on server', () => {
    const mockEl = { offsetTop: 500 } as HTMLElement;
    ssrMockDocument.getElementById.and.returnValue(mockEl);

    ssrService.scrollToElement('test');

    expect(ssrMockWindow.scrollTo).not.toHaveBeenCalled();
  });

  it('scrollToPosition should not scroll on server', () => {
    ssrService.scrollToPosition(300);

    expect(ssrMockWindow.scrollTo).not.toHaveBeenCalled();
  });

  it('getCurrentScrollPosition should return 0 on server', () => {
    expect(ssrService.getCurrentScrollPosition()).toBe(0);
  });

  it('saveScrollPosition should do nothing on server', () => {
    sessionStorage.clear();
    ssrService.saveScrollPosition();
    expect(sessionStorage.getItem('contact-scroll-position')).toBeNull();
  });

  it('restoreScrollPosition should do nothing on server', () => {
    sessionStorage.setItem('contact-scroll-position', '200');
    ssrService.restoreScrollPosition();
    expect(ssrMockWindow.scrollTo).not.toHaveBeenCalled();
    sessionStorage.clear();
  });
});
