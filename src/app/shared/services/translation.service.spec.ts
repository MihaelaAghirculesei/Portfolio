import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranslationService);
  });

  describe('initialization', () => {
    it('should default to English', () => {
      expect(service.currentLang).toBe('en');
    });

    it('should expose defaultLang as en', () => {
      expect(service.defaultLang).toBe('en');
    });
  });

  describe('use()', () => {
    it('should switch to German', () => {
      service.use('de');
      expect(service.currentLang).toBe('de');
    });

    it('should fall back to English for unknown lang', () => {
      service.use('fr');
      expect(service.currentLang).toBe('en');
    });

    it('should emit onLangChange when switching language', () => {
      const events: string[] = [];
      service.onLangChange.subscribe(e => events.push(e.lang));

      service.use('de');
      service.use('en');

      expect(events).toEqual(['de', 'en']);
    });

    it('should return an Observable of the translations dict', (done) => {
      service.use('de').subscribe(result => {
        expect(typeof result).toBe('object');
        done();
      });
    });
  });

  describe('instant()', () => {
    it('should translate a known key in English', () => {
      service.use('en');
      expect(service.instant('landingPage.role')).toBe('Fullstack Developer');
    });

    it('should translate a known key in German', () => {
      service.use('de');
      const result = service.instant('landingPage.role');
      expect(result).toBeTruthy();
      expect(result).not.toBe('landingPage.role');
    });

    it('should return the key itself for unknown keys', () => {
      expect(service.instant('nonexistent.key.that.does.not.exist')).toBe('nonexistent.key.that.does.not.exist');
    });

    it('should return key when intermediate path does not exist', () => {
      expect(service.instant('nonexistent.deep')).toBe('nonexistent.deep');
    });

    it('should interpolate params into the translation', () => {
      service.use('en');
      const result = service.instant('references.goToSlide', { index: 3 });
      expect(result).toBe('Go to slide 3');
    });

    it('should not interpolate when no params provided', () => {
      service.use('en');
      const result = service.instant('references.goToSlide');
      expect(result).toContain('{{index}}');
    });
  });

  describe('get()', () => {
    it('should return an Observable that emits the translated string', (done) => {
      service.use('en');
      service.get('landingPage.role').subscribe(value => {
        expect(value).toBe('Fullstack Developer');
        done();
      });
    });
  });

  describe('setDefaultLang()', () => {
    it('should be callable without throwing', () => {
      expect(() => service.setDefaultLang('en')).not.toThrow();
    });
  });

  describe('addLangs()', () => {
    it('should be callable without throwing', () => {
      expect(() => service.addLangs(['en', 'de'])).not.toThrow();
    });
  });
});
