import type { MockedObject } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter, Router, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { of } from 'rxjs';
import { TranslatedTitleStrategy } from './translated-title.strategy';
import { TranslationService } from './translation.service';

@Component({ selector: 'app-stub-title-route', template: '', standalone: true })
class StubComponent {
}

function snapshotWithTitleData(data: Record<string, unknown> = {}): RouterStateSnapshot {
  const leaf = { data, children: [] as unknown[] };
  const root = { data: {}, children: [{ ...leaf, outlet: 'primary' }] };
  return { root } as unknown as RouterStateSnapshot;
}

describe('TranslatedTitleStrategy - unit', () => {
  let strategy: TranslatedTitleStrategy;
  let mockTranslate: Pick<MockedObject<TranslationService>, 'get'>;
  let mockTitleService: Pick<MockedObject<Title>, 'setTitle'>;

  beforeEach(() => {
    mockTranslate = {
      get: vi.fn().mockName('TranslationService.get')
    };
    mockTitleService = {
      setTitle: vi.fn().mockName('Title.setTitle')
    };
    strategy = new TranslatedTitleStrategy(mockTranslate as unknown as TranslationService, mockTitleService as unknown as Title);
  });

  it('should be created', () => {
    expect(strategy).toBeTruthy();
  });

  it('should translate the resolved title key and set it on the Title service', () => {
    vi.spyOn(strategy, 'buildTitle').mockReturnValue('skills.pageTitle');
    mockTranslate.get.mockReturnValue(of('Skills — Mihaela Aghirculesei'));

    strategy.updateTitle(snapshotWithTitleData());

    expect(mockTranslate.get).toHaveBeenCalledWith('skills.pageTitle');
    expect(mockTitleService.setTitle).toHaveBeenCalledWith('Skills — Mihaela Aghirculesei');
  });

  it('should not call the translation service or set a title when no route resolves a title', () => {
    vi.spyOn(strategy, 'buildTitle').mockReturnValue(undefined);

    strategy.updateTitle(snapshotWithTitleData());

    expect(mockTranslate.get).not.toHaveBeenCalled();
    expect(mockTitleService.setTitle).not.toHaveBeenCalled();
  });

  it('should not call the translation service or set a title when the resolved key is an empty string', () => {
    vi.spyOn(strategy, 'buildTitle').mockReturnValue('');

    strategy.updateTitle(snapshotWithTitleData());

    expect(mockTranslate.get).not.toHaveBeenCalled();
    expect(mockTitleService.setTitle).not.toHaveBeenCalled();
  });
});

describe('TranslatedTitleStrategy - integration with real Router navigation', () => {
  let router: Router;
  let titleService: Title;
  let translationService: TranslationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: StubComponent, title: 'nav.about' },
          { path: 'no-title', component: StubComponent },
        ]),
        { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
      ],
    });

    router = TestBed.inject(Router);
    titleService = TestBed.inject(Title);
    translationService = TestBed.inject(TranslationService);
  });

  it('should set the translated page title after navigating to a route with a title key', async () => {
    vi.useFakeTimers();
    vi.spyOn(titleService, 'setTitle').mockImplementation(() => undefined);

    router.navigateByUrl('/');
    await vi.advanceTimersByTimeAsync(0);

    expect(titleService.setTitle).toHaveBeenCalledWith('About me');
  });

  it('should reflect the currently active language when resolving the title', async () => {
    vi.useFakeTimers();
    translationService.use('de');
    vi.spyOn(titleService, 'setTitle').mockImplementation(() => undefined);

    router.navigateByUrl('/');
    await vi.advanceTimersByTimeAsync(0);

    expect(titleService.setTitle).toHaveBeenCalledWith('Über mich');
  });

  it('should not set a title when the matched route has no title key', async () => {
    vi.useFakeTimers();
    vi.spyOn(titleService, 'setTitle').mockImplementation(() => undefined);

    router.navigateByUrl('/no-title');
    await vi.advanceTimersByTimeAsync(0);

    expect(titleService.setTitle).not.toHaveBeenCalled();
  });
});
