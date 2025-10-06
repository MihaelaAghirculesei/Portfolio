import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PlatformService } from './platform.service';

interface MockWindow {
  scrollTo: jasmine.Spy;
  innerWidth: number;
}

interface MockDocument {
  defaultView: MockWindow;
  body: {
    style: {
      overflow: string;
      position: string;
      width: string;
    };
  };
  querySelectorAll: jasmine.Spy;
}

describe('PlatformService', () => {
  let service: PlatformService;
  let mockDocument: MockDocument;
  let mockWindow: MockWindow;

  beforeEach(() => {
    mockWindow = {
      scrollTo: jasmine.createSpy('scrollTo'),
      innerWidth: 1920
    };

    mockDocument = {
      defaultView: mockWindow,
      body: {
        style: {
          overflow: '',
          position: '',
          width: ''
        }
      },
      querySelectorAll: jasmine.createSpy('querySelectorAll').and.returnValue([])
    };

    TestBed.configureTestingModule({
      providers: [
        PlatformService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: DOCUMENT, useValue: mockDocument }
      ]
    });

    service = TestBed.inject(PlatformService);
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should detect browser platform', () => {
      expect(service.isBrowser).toBe(true);
    });
  });

  describe('Window Access', () => {
    it('should return window on browser', () => {
      expect(service.window).toBe(mockWindow);
      expect(service.getWindow()).toBe(mockWindow);
    });
  });

  describe('Document and Window Detection', () => {
    it('should return document and detect window on browser', () => {
      expect(service.getDocument()).toBe(mockDocument);
      expect(service.isWindowDefined()).toBe(true);
    });
  });

  describe('Body Overflow Control', () => {
    it('should set body overflow to different values', () => {
      service.setBodyOverflow('hidden');
      expect(mockDocument.body.style.overflow).toBe('hidden');

      service.setBodyOverflow('visible');
      expect(mockDocument.body.style.overflow).toBe('visible');

      service.setBodyOverflow('auto');
      expect(mockDocument.body.style.overflow).toBe('auto');
    });
  });

  describe('Scroll Control', () => {
    it('should disable and enable scroll', () => {
      service.disableScroll();
      expect(mockDocument.body.style.overflow).toBe('hidden');
      expect(mockDocument.body.style.position).toBe('fixed');
      expect(mockDocument.body.style.width).toBe('100%');

      service.enableScroll();
      expect(mockDocument.body.style.overflow).toBe('auto');
      expect(mockDocument.body.style.position).toBe('static');
      expect(mockDocument.body.style.width).toBe('auto');
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple disable/enable calls', () => {
      service.disableScroll();
      service.disableScroll();
      expect(mockDocument.body.style.overflow).toBe('hidden');

      service.enableScroll();
      service.enableScroll();
      expect(mockDocument.body.style.overflow).toBe('auto');
    });
  });
});
