import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let routerEventsSubject: Subject<unknown>;

  beforeEach(async () => {
    routerEventsSubject = new Subject();
    mockRouter = jasmine.createSpyObj('Router', [], {
      url: '/',
      events: routerEventsSubject.asObservable(),
    });
    mockTranslateService = jasmine.createSpyObj('TranslateService', [
      'setDefaultLang',
      'use',
    ]);

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    }).compileComponents();

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
    fixture.detectChanges();
    expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(mockTranslateService.use).toHaveBeenCalledWith('en');
  });

  it('should show header and footer', () => {
    expect(component.showHeaderFooter).toBe(true);
  });

  it('should show main content when on home route', () => {
    fixture.detectChanges();
    expect(component.showMainContent).toBe(true);
  });

  it('should hide main content when navigating away from home', () => {
    fixture.detectChanges();
    routerEventsSubject.next(new NavigationEnd(1, '/legal-notice', '/legal-notice'));
    expect(component.showMainContent).toBe(false);
  });

  it('should show main content when navigating back to home', () => {
    fixture.detectChanges();
    routerEventsSubject.next(new NavigationEnd(1, '/legal-notice', '/legal-notice'));
    routerEventsSubject.next(new NavigationEnd(2, '/', '/'));
    expect(component.showMainContent).toBe(true);
  });
});
