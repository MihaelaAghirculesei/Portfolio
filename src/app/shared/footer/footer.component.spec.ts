import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterLink } from '@angular/router';
import { Directive, HostListener, Input } from '@angular/core';
import { FooterComponent } from './footer.component';
import { ScrollService } from '../services/scroll.service';
import { NavigationService } from '../services/navigation.service';

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
  let mockNavService: jasmine.SpyObj<NavigationService>;
  let mockScrollService: jasmine.SpyObj<ScrollService>;

  beforeEach(async () => {
    mockNavService = jasmine.createSpyObj('NavigationService', ['scrollToSection', 'navigateToHome']);
    mockScrollService = jasmine.createSpyObj('ScrollService', ['scrollToElement', 'saveScrollPosition']);

    await TestBed.configureTestingModule({
      imports: [FooterComponent, MockRouterLinkDirective],
      providers: [
        { provide: NavigationService, useValue: mockNavService },
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

  it('should delegate scrollToTop to NavigationService.scrollToSection with headLine', () => {
    component.scrollToTop();
    expect(mockNavService.scrollToSection).toHaveBeenCalledWith('headLine');
  });

  it('should save scroll position via scrollService', () => {
    component.saveScrollPosition();
    expect(mockScrollService.saveScrollPosition).toHaveBeenCalled();
  });

  it('should set isHovered to true on onLogoHover', () => {
    component.isHovered = false;
    component.onLogoHover();
    expect(component.isHovered).toBe(true);
  });

  it('should set isHovered to false on onLogoUnhover', () => {
    component.isHovered = true;
    component.onLogoUnhover();
    expect(component.isHovered).toBe(false);
  });
});
