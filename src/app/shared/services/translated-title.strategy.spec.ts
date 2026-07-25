import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter, Router, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { of } from 'rxjs';
import { TranslatedTitleStrategy } from './translated-title.strategy';
import { TranslationService } from './translation.service';

@Component({ selector: 'app-stub-title-route', template: '', standalone: true })
class StubComponent {}

function snapshotWithTitleData(data: Record<string, unknown> = {}): RouterStateSnapshot {
  const leaf = { data, children: [] as unknown[] };
  const root = { data: {}, children: [{ ...leaf, outlet: 'primary' }] };
  return { root } as unknown as RouterStateSnapshot;
}

describe('TranslatedTitleStrategy - unit', () => {
  let strategy: TranslatedTitleStrategy;
  let mockTranslate: jasmine.SpyObj<TranslationService>;
  let mockTitleService: jasmine.SpyObj<Title>;

  beforeEach(() => {
    mockTranslate = jasmine.createSpyObj('TranslationService', ['get']);
    mockTitleService = jasmine.createSpyObj('Title', ['setTitle']);
    strategy = new TranslatedTitleStrategy(mockTranslate, mockTitleService);
  });

  it('should be created', () => {
    expect(strategy).toBeTruthy();
  });

  it('should translate the resolved title key and set it on the Title service', () => {
    spyOn(strategy, 'buildTitle').and.returnValue('skills.pageTitle');
    mockTranslate.get.and.returnValue(of('Skills — Mihaela Aghirculesei'));

    strategy.updateTitle(snapshotWithTitleData());

    expect(mockTranslate.get).toHaveBeenCalledWith('skills.pageTitle');
    expect(mockTitleService.setTitle).toHaveBeenCalledWith('Skills — Mihaela Aghirculesei');
  });

  it('should not call the translation service or set a title when no route resolves a title', () => {
    spyOn(strategy, 'buildTitle').and.returnValue(undefined);

    strategy.updateTitle(snapshotWithTitleData());

    expect(mockTranslate.get).not.toHaveBeenCalled();
    expect(mockTitleService.setTitle).not.toHaveBeenCalled();
  });

  it('should not call the translation service or set a title when the resolved key is an empty string', () => {
    spyOn(strategy, 'buildTitle').and.returnValue('');

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

  it('should set the translated page title after navigating to a route with a title key', fakeAsync(() => {
    spyOn(titleService, 'setTitle');

    router.navigateByUrl('/');
    tick();

    expect(titleService.setTitle).toHaveBeenCalledWith('About me');
  }));

  it('should reflect the currently active language when resolving the title', fakeAsync(() => {
    translationService.use('de');
    spyOn(titleService, 'setTitle');

    router.navigateByUrl('/');
    tick();

    expect(titleService.setTitle).toHaveBeenCalledWith('Über mich');
  }));

  it('should not set a title when the matched route has no title key', fakeAsync(() => {
    spyOn(titleService, 'setTitle');

    router.navigateByUrl('/no-title');
    tick();

    expect(titleService.setTitle).not.toHaveBeenCalled();
  }));
});
