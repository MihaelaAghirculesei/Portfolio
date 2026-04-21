import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router, NavigationEnd, RouterOutlet, ActivatedRoute } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Component, NO_ERRORS_SCHEMA, PLATFORM_ID } from '@angular/core';
import { Subject } from 'rxjs';
import { AppComponent } from './app.component';
import { LoggerService } from './shared/services/logger.service';
import { SeoService } from './shared/services/seo.service';

@Component({
  selector: 'router-outlet',
  template: '',
  standalone: true
})
class MockRouterOutlet {}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: Partial<ActivatedRoute>;
  let mockSeoService: jasmine.SpyObj<SeoService>;
  let routerEventsSubject: Subject<unknown>;

  beforeEach(async () => {
    routerEventsSubject = new Subject();
    mockRouter = jasmine.createSpyObj('Router', ['createUrlTree', 'serializeUrl'], {
      url: '/',
      events: routerEventsSubject.asObservable(),
    });
    mockRouter.createUrlTree.and.returnValue({} as any);
    mockRouter.serializeUrl.and.returnValue('/');
    mockActivatedRoute = {
      snapshot: { params: {}, queryParams: {}, data: {} } as any
    };
    mockSeoService = jasmine.createSpyObj('SeoService', ['update']);

    await TestBed.configureTestingModule({
      imports: [AppComponent, TranslateModule.forRoot(), MockRouterOutlet],
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

    const translateService = TestBed.inject(TranslateService);
    spyOn(translateService, 'setDefaultLang');
    spyOn(translateService, 'use');

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize translation service with English', () => {
    const translateService = TestBed.inject(TranslateService);
    component.ngOnInit();
    expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(translateService.use).toHaveBeenCalledWith('en');
  });

  it('should call seoService.update with home config on init', () => {
    component.ngOnInit();
    expect(mockSeoService.update).toHaveBeenCalledWith(
      jasmine.objectContaining({ title: 'Mihaela Melania Aghirculesei — Frontend Developer' })
    );
  });

  it('should update SEO when navigating to legal-notice', () => {
    component.ngOnInit();
    mockSeoService.update.calls.reset();
    routerEventsSubject.next(new NavigationEnd(1, '/legal-notice', '/legal-notice'));
    expect(mockSeoService.update).toHaveBeenCalledWith(
      jasmine.objectContaining({ title: 'Legal Notice — Mihaela Aghirculesei' })
    );
  });

  it('should update SEO when navigating back to home', () => {
    component.ngOnInit();
    routerEventsSubject.next(new NavigationEnd(1, '/legal-notice', '/legal-notice'));
    mockSeoService.update.calls.reset();
    routerEventsSubject.next(new NavigationEnd(2, '/', '/'));
    expect(mockSeoService.update).toHaveBeenCalledWith(
      jasmine.objectContaining({ title: 'Mihaela Melania Aghirculesei — Frontend Developer' })
    );
  });

  it('should use German when localStorage lang is de', () => {
    localStorage.setItem('lang', 'de');
    const translateService = TestBed.inject(TranslateService);

    component.ngOnInit();

    expect(translateService.use).toHaveBeenCalledWith('de');
    localStorage.removeItem('lang');
  });

  it('should fall back to home SEO config for unknown routes', () => {
    component.ngOnInit();
    mockSeoService.update.calls.reset();
    routerEventsSubject.next(new NavigationEnd(1, '/unknown-route', '/unknown-route'));
    expect(mockSeoService.update).toHaveBeenCalledWith(
      jasmine.objectContaining({ title: 'Mihaela Melania Aghirculesei — Frontend Developer' })
    );
  });
});

describe('AppComponent on server platform', () => {
  let component: AppComponent;
  let serverEventsSubject: Subject<unknown>;

  beforeEach(async () => {
    serverEventsSubject = new Subject();
    const serverRouter = jasmine.createSpyObj('Router', ['createUrlTree', 'serializeUrl'], {
      url: '/',
      events: serverEventsSubject.asObservable(),
    });
    serverRouter.createUrlTree.and.returnValue({} as any);
    serverRouter.serializeUrl.and.returnValue('/');

    await TestBed.configureTestingModule({
      imports: [AppComponent, TranslateModule.forRoot(), MockRouterOutlet],
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

    const translateService = TestBed.inject(TranslateService);
    spyOn(translateService, 'setDefaultLang');
    spyOn(translateService, 'use');

    const fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should default to English on server (localStorage not available)', () => {
    const translateService = TestBed.inject(TranslateService);
    component.ngOnInit();
    expect(translateService.use).toHaveBeenCalledWith('en');
  });
});

describe('AppComponent router error handling', () => {
  let mockLogger: jasmine.SpyObj<LoggerService>;
  let errorEventsSubject: Subject<unknown>;

  beforeEach(async () => {
    errorEventsSubject = new Subject();
    mockLogger = jasmine.createSpyObj('LoggerService', ['error', 'warn', 'info', 'debug']);
    const errorRouter = jasmine.createSpyObj('Router', ['createUrlTree', 'serializeUrl'], {
      url: '/',
      events: errorEventsSubject.asObservable(),
    });
    errorRouter.createUrlTree.and.returnValue({} as any);
    errorRouter.serializeUrl.and.returnValue('/');

    await TestBed.configureTestingModule({
      imports: [AppComponent, TranslateModule.forRoot(), MockRouterOutlet],
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

    const translateService = TestBed.inject(TranslateService);
    spyOn(translateService, 'setDefaultLang');
    spyOn(translateService, 'use');
  });

  it('should log error when router events emit an error', () => {
    const errorFixture = TestBed.createComponent(AppComponent);
    errorFixture.componentInstance.ngOnInit();

    const routerError = new Error('Router error');
    errorEventsSubject.error(routerError);

    expect(mockLogger.error).toHaveBeenCalledWith('Router events error:', routerError);
  });
});
