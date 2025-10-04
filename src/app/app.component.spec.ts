import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router, NavigationEnd, RouterOutlet, ActivatedRoute } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { Subject } from 'rxjs';
import { AppComponent } from './app.component';

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
  let routerEventsSubject: Subject<unknown>;

  beforeEach(async () => {
    routerEventsSubject = new Subject();
    mockRouter = jasmine.createSpyObj('Router', ['createUrlTree'], {
      url: '/',
      events: routerEventsSubject.asObservable(),
    });
    mockRouter.createUrlTree.and.returnValue({} as any);
    mockActivatedRoute = {
      snapshot: { params: {}, queryParams: {}, data: {} } as any
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent, TranslateModule.forRoot(), MockRouterOutlet],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
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

  it('should have the correct title', () => {
    expect(component.title).toBe('angular-portofolio');
  });

  it('should initialize translation service with English', () => {
    const translateService = TestBed.inject(TranslateService);
    component.ngOnInit();
    expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(translateService.use).toHaveBeenCalledWith('en');
  });

  it('should show header and footer', () => {
    expect(component.showHeaderFooter).toBe(true);
  });

  it('should show main content when on home route', () => {
    component.ngOnInit();
    expect(component.showMainContent).toBe(true);
  });

  it('should hide main content when navigating away from home', () => {
    component.ngOnInit();
    routerEventsSubject.next(new NavigationEnd(1, '/legal-notice', '/legal-notice'));
    expect(component.showMainContent).toBe(false);
  });

  it('should show main content when navigating back to home', () => {
    component.ngOnInit();
    routerEventsSubject.next(new NavigationEnd(1, '/legal-notice', '/legal-notice'));
    routerEventsSubject.next(new NavigationEnd(2, '/', '/'));
    expect(component.showMainContent).toBe(true);
  });
});
