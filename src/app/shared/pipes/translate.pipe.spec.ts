import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from './translate.pipe';
import { TranslationService } from '../services/translation.service';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;
  let translationService: jasmine.SpyObj<TranslationService>;

  beforeEach(() => {
    translationService = jasmine.createSpyObj('TranslationService', ['instant']);

    TestBed.configureTestingModule({
      providers: [
        TranslatePipe,
        { provide: TranslationService, useValue: translationService },
      ],
    });

    pipe = TestBed.inject(TranslatePipe);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should delegate to TranslationService.instant with the given key', () => {
    translationService.instant.and.returnValue('Hello');

    const result = pipe.transform('greeting.hello');

    expect(translationService.instant).toHaveBeenCalledWith('greeting.hello', undefined);
    expect(result).toBe('Hello');
  });

  it('should pass params through to TranslationService.instant', () => {
    translationService.instant.and.returnValue('Hello, Mihaela');

    const result = pipe.transform('greeting.named', { name: 'Mihaela' });

    expect(translationService.instant).toHaveBeenCalledWith('greeting.named', { name: 'Mihaela' });
    expect(result).toBe('Hello, Mihaela');
  });

  it('should return whatever the translation service resolves, including a missing-key fallback', () => {
    translationService.instant.and.returnValue('missing.key');

    const result = pipe.transform('missing.key');

    expect(result).toBe('missing.key');
  });
});

describe('TranslatePipe - integration with the real TranslationService', () => {
  let pipe: TranslatePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TranslatePipe],
    });

    pipe = TestBed.inject(TranslatePipe);
  });

  it('should resolve a real translation key', () => {
    expect(pipe.transform('nav.about')).toBe('About me');
  });

  it('should return the key itself when the translation is missing', () => {
    expect(pipe.transform('this.key.does.not.exist')).toBe('this.key.does.not.exist');
  });

  it('should interpolate params into a real translation with placeholders', () => {
    expect(pipe.transform('references.goToSlide', { index: 3 })).toBe('Go to slide 3');
  });
});
