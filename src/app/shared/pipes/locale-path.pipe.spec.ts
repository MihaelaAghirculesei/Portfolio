import { TestBed } from '@angular/core/testing';
import { TranslationService } from '../services/translation.service';
import { LocalePathPipe } from './locale-path.pipe';

describe('LocalePathPipe', () => {
  const transform = (path: string): string =>
    TestBed.runInInjectionContext(() => new LocalePathPipe()).transform(path);

  it('keeps the path in English', () => {
    expect(transform('/projects')).toBe('/projects');
  });

  it('adds the German prefix in German', () => {
    TestBed.inject(TranslationService).use('de');
    expect(transform('/projects')).toBe('/de/projects');
  });
});
