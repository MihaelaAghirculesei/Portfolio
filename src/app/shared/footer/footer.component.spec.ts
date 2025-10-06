import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Directive, HostListener, Input } from '@angular/core';
import { FooterComponent } from './footer.component';
import { ScrollService } from '../services/scroll.service';

@Directive({
  selector: '[routerLink]',
  standalone: true
})
class MockRouterLinkDirective {
  @Input() routerLink: string | any[] = '';

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

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate'], { url: '/' });
    mockRouter.navigate.and.returnValue(Promise.resolve(true));
    mockScrollService = jasmine.createSpyObj('ScrollService', ['scrollToElement']);

    await TestBed.configureTestingModule({
      imports: [FooterComponent, TranslateModule.forRoot(), MockRouterLinkDirective],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ScrollService, useValue: mockScrollService }
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
});
