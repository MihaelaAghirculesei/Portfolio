import type { MockedObject } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router, NavigationEnd, RouterOutlet, ActivatedRoute, Event as RouterEvent } from '@angular/router';
import { TranslationService } from './shared/services/translation.service';
import { Component, NO_ERRORS_SCHEMA, PLATFORM_ID } from '@angular/core';
import { EMPTY, Subject } from 'rxjs';
import { AppComponent } from './app.component';
import { LoggerService } from './shared/services/logger.service';
import { SeoService } from './shared/services/seo.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'router-outlet',
  template: '',
  standalone: true
})
class MockRouterOutlet {
}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockRouter: Pick<MockedObject<Router>, 'createUrlTree' | 'serializeUrl' | 'url' | 'events'>;
  let mockActivatedRoute: Partial<ActivatedRoute>;
  let mockSeoService: Pick<MockedObject<SeoService>, 'update'>;
  let routerEventsSubject: Subject<RouterEvent>;

  beforeEach(async () => {
    routerEventsSubject = new Subject();
    mockRouter = {
      createUrlTree: vi.fn().mockName('Router.createUrlTree'),
      serializeUrl: vi.fn().mockName('Router.serializeUrl'),
      url: '/',
      events: routerEventsSubject.asObservable()
    };
    mockRouter.createUrlTree.mockReturnValue({} as any);
    mockRouter.serializeUrl.mockReturnValue('/');
    mockActivatedRoute = {
      snapshot: { params: {}, queryParams: {}, data: {} } as any
    };
    mockSeoService = {
      update: vi.fn().mockName('SeoService.update')
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent, MockRouterOutlet],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: SeoService, useValue: mockSeoService },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(AppComponent, {
      remove: { imports: [RouterOutlet] },
      add: { imports: [MockRouterOutlet] }
    }).compileComponents();

    const translateService = TestBed.inject(TranslationService);
    vi.spyOn(translateService, 'use').mockReturnValue(EMPTY);

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize translation service with English', () => {
    const translateService = TestBed.inject(TranslationService);
    component.ngOnInit();
    expect(translateService.use).toHaveBeenCalledWith('en');
  });

  it('should call seoService.update with home config on init', () => {
    component.ngOnInit();
    expect(mockSeoService.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Mihaela Melania Aghirculesei — Fullstack Developer' }),
    );
  });

  it('should update SEO when navigating to legal-notice', () => {
    component.ngOnInit();
    mockSeoService.update.mockClear();
    routerEventsSubject.next(new NavigationEnd(1, '/legal-notice', '/legal-notice'));
    expect(mockSeoService.update).toHaveBeenCalledWith(expect.objectContaining({ title: 'Legal Notice — Mihaela Aghirculesei' }));
  });

  it('should update SEO when navigating to skills', () => {
    component.ngOnInit();
    mockSeoService.update.mockClear();
    routerEventsSubject.next(new NavigationEnd(1, '/skills', '/skills'));
    expect(mockSeoService.update).toHaveBeenCalledWith(expect.objectContaining({ title: 'Skills — Mihaela Aghirculesei' }));
  });

  it('should update SEO when navigating to feedback', () => {
    component.ngOnInit();
    mockSeoService.update.mockClear();
    routerEventsSubject.next(new NavigationEnd(1, '/feedback', '/feedback'));
    expect(mockSeoService.update).toHaveBeenCalledWith(expect.objectContaining({ title: 'Feedback — Mihaela Aghirculesei' }));
  });

  it('should update SEO when navigating to contact', () => {
    component.ngOnInit();
    mockSeoService.update.mockClear();
    routerEventsSubject.next(new NavigationEnd(1, '/contact', '/contact'));
    expect(mockSeoService.update).toHaveBeenCalledWith(expect.objectContaining({ title: 'Contact — Mihaela Aghirculesei' }));
  });

  it('should update SEO when navigating to the Alina Moments case study', () => {
    component.ngOnInit();
    mockSeoService.update.mockClear();
    routerEventsSubject.next(new NavigationEnd(1, '/case-study/alina-moments', '/case-study/alina-moments'));
    expect(mockSeoService.update).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Case Study: Alina Moments Photography — Mihaela Aghirculesei',
      ogUrl: `${environment.siteUrl}/case-study/alina-moments`,
    }));
  });

  it('should update SEO when navigating to the bfsg-scanner case study', () => {
    component.ngOnInit();
    mockSeoService.update.mockClear();
    routerEventsSubject.next(new NavigationEnd(1, '/case-study/bfsg-scanner', '/case-study/bfsg-scanner'));
    expect(mockSeoService.update).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Case Study: bfsg-scanner — Mihaela Aghirculesei',
      ogUrl: `${environment.siteUrl}/case-study/bfsg-scanner`,
    }));
  });

  it('should update SEO when navigating to the ChargeHub case study', () => {
    component.ngOnInit();
    mockSeoService.update.mockClear();
    routerEventsSubject.next(new NavigationEnd(1, '/case-study/charge-hub', '/case-study/charge-hub'));
    expect(mockSeoService.update).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Case Study: ChargeHub — Mihaela Aghirculesei',
      ogUrl: `${environment.siteUrl}/case-study/charge-hub`,
    }));
  });

  it('should update SEO when navigating back to home', () => {
    component.ngOnInit();
    routerEventsSubject.next(new NavigationEnd(1, '/legal-notice', '/legal-notice'));
    mockSeoService.update.mockClear();
    routerEventsSubject.next(new NavigationEnd(2, '/', '/'));
    expect(mockSeoService.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Mihaela Melania Aghirculesei — Fullstack Developer' }),
    );
  });

  it('should use German when localStorage lang is de', () => {
    localStorage.setItem('lang', 'de');
    const translateService = TestBed.inject(TranslationService);

    component.ngOnInit();

    expect(translateService.use).toHaveBeenCalledWith('de');
    localStorage.removeItem('lang');
  });

  it('should use the noindex "not found" SEO config for unknown routes', () => {
    component.ngOnInit();
    mockSeoService.update.mockClear();
    routerEventsSubject.next(new NavigationEnd(1, '/unknown-route', '/unknown-route'));
    expect(mockSeoService.update).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Page not found — Mihaela Aghirculesei',
        ogUrl: `${environment.siteUrl}/404`,
        noIndex: true,
      }),
    );
  });

  it('should keep known routes indexable', () => {
    component.ngOnInit();
    mockSeoService.update.mockClear();
    routerEventsSubject.next(new NavigationEnd(1, '/skills', '/skills'));
    expect(mockSeoService.update).toHaveBeenCalledWith(
      expect.not.objectContaining({ noIndex: true }),
    );
  });
});

describe('AppComponent on server platform', () => {
  let component: AppComponent;
  let serverEventsSubject: Subject<unknown>;

  beforeEach(async () => {
    serverEventsSubject = new Subject();
    const serverRouter = {
      createUrlTree: vi.fn().mockName('Router.createUrlTree'),
      serializeUrl: vi.fn().mockName('Router.serializeUrl'),
      url: '/',
      events: serverEventsSubject.asObservable()
    };
    serverRouter.createUrlTree.mockReturnValue({} as any);
    serverRouter.serializeUrl.mockReturnValue('/');

    await TestBed.configureTestingModule({
      imports: [AppComponent, MockRouterOutlet],
      providers: [
        { provide: Router, useValue: serverRouter },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {}, queryParams: {}, data: {} } } },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(AppComponent, {
      remove: { imports: [RouterOutlet] },
      add: { imports: [MockRouterOutlet] }
    }).compileComponents();

    const translateService = TestBed.inject(TranslationService);
    vi.spyOn(translateService, 'use').mockReturnValue(EMPTY);

    const fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should default to English on server (localStorage not available)', () => {
    const translateService = TestBed.inject(TranslationService);
    component.ngOnInit();
    expect(translateService.use).toHaveBeenCalledWith('en');
  });
});

describe('AppComponent router error handling', () => {
  let mockLogger: Pick<MockedObject<LoggerService>, 'error' | 'warn' | 'info' | 'debug'>;
  let errorEventsSubject: Subject<unknown>;

  beforeEach(async () => {
    errorEventsSubject = new Subject();
    mockLogger = {
      error: vi.fn().mockName('LoggerService.error'),
      warn: vi.fn().mockName('LoggerService.warn'),
      info: vi.fn().mockName('LoggerService.info'),
      debug: vi.fn().mockName('LoggerService.debug')
    };
    const errorRouter = {
      createUrlTree: vi.fn().mockName('Router.createUrlTree'),
      serializeUrl: vi.fn().mockName('Router.serializeUrl'),
      url: '/',
      events: errorEventsSubject.asObservable()
    };
    errorRouter.createUrlTree.mockReturnValue({} as any);
    errorRouter.serializeUrl.mockReturnValue('/');

    await TestBed.configureTestingModule({
      imports: [AppComponent, MockRouterOutlet],
      providers: [
        { provide: Router, useValue: errorRouter },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {}, queryParams: {}, data: {} } } },
        { provide: LoggerService, useValue: mockLogger }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(AppComponent, {
      remove: { imports: [RouterOutlet] },
      add: { imports: [MockRouterOutlet] }
    }).compileComponents();

    const translateService = TestBed.inject(TranslationService);
    vi.spyOn(translateService, 'use').mockReturnValue(EMPTY);
  });

  it('should log error when router events emit an error', () => {
    const errorFixture = TestBed.createComponent(AppComponent);
    errorFixture.componentInstance.ngOnInit();

    const routerError = new Error('Router error');
    errorEventsSubject.error(routerError);

    expect(mockLogger.error).toHaveBeenCalledWith('Router events error:', routerError);
  });
});
