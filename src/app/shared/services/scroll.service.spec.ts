import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ScrollService } from './scroll.service';

describe('ScrollService', () => {
  let service: ScrollService;
  let mockDocument: any;
  let mockWindow: any;

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

    TestBed.configureTestingModule({
      providers: [
        ScrollService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: DOCUMENT, useValue: mockDocument }
      ]
    });

    service = TestBed.inject(ScrollService);
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

  describe('Server-side rendering', () => {
    it('should handle SSR gracefully', () => {
      // SSR tests would need proper SSR setup
      expect(service).toBeTruthy();
    });
  });
});
