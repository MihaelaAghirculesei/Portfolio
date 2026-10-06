import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let fixture: ComponentFixture<NotFoundComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should render a single h1 labelling the section', () => {
    const headings = element.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(element.querySelector('section')?.getAttribute('aria-labelledby')).toBe(headings[0].id);
  });

  it('should hide the decorative status code from assistive technology', () => {
    expect(element.querySelector('.status-code')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should link back to the home page and to the projects page', () => {
    const hrefs = Array.from(element.querySelectorAll('nav a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/', '/projects']);
  });
});
