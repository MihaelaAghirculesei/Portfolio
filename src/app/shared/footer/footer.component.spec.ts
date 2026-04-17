import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Directive, HostListener, Input } from '@angular/core';
import { FooterComponent } from './footer.component';
import { ScrollService } from '../services/scroll.service';
import { LoggerService } from '../services/logger.service';

@Directive({
  selector: '[appRouterLink]',
  standalone: true
})
class MockRouterLinkDirective {
  @Input() routerLink: string | string[] = '';

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    event.preventDefault();
  }
}

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockScrollService: jasmine.SpyObj<ScrollService>;
  let mockLogger: jasmine.SpyObj<LoggerService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate'], { url: '/' });
    mockRouter.navigate.and.returnValue(Promise.resolve(true));
    mockScrollService = jasmine.createSpyObj('ScrollService', ['scrollToElement', 'saveScrollPosition']);
    mockLogger = jasmine.createSpyObj('LoggerService', ['error', 'warn', 'info', 'debug']);

    await TestBed.configureTestingModule({
      imports: [FooterComponent, TranslateModule.forRoot(), MockRouterLinkDirective],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ScrollService, useValue: mockScrollService },
        { provide: LoggerService, useValue: mockLogger }
      ]
    }).overrideComponent(FooterComponent, {
      remove: { imports: [RouterLink] },
      add: { imports: [MockRouterLinkDirective] }
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have current year', () => {
    expect(component.currentYear).toBe(new Date().getFullYear());
  });

  it('should scroll to top when on home route', () => {
    Object.defineProperty(mockRouter, 'url', { value: '/', writable: true });
    component.scrollToTop();
    expect(mockScrollService.scrollToElement).toHaveBeenCalledWith('headLine', 'start');
  });

  it('should navigate to home when not on home route', () => {
    Object.defineProperty(mockRouter, 'url', { value: '/legal-notice', writable: true });
    component.scrollToTop();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should log error when navigation fails', async () => {
    const error = new Error('Nav failed');
    Object.defineProperty(mockRouter, 'url', { value: '/legal-notice', writable: true });
    mockRouter.navigate.and.returnValue(Promise.reject(error));

    component.scrollToTop();

    await fixture.whenStable();
    expect(mockLogger.error).toHaveBeenCalledWith('Navigation to home failed:', error);
  });

  it('should not scroll when navigation fails', async () => {
    Object.defineProperty(mockRouter, 'url', { value: '/legal-notice', writable: true });
    mockRouter.navigate.and.returnValue(Promise.reject(new Error('Nav failed')));

    component.scrollToTop();

    await fixture.whenStable();
    expect(mockScrollService.scrollToElement).not.toHaveBeenCalled();
  });

  it('should save scroll position via scrollService', () => {
    component.saveScrollPosition();
    expect(mockScrollService.saveScrollPosition).toHaveBeenCalled();
  });
});
