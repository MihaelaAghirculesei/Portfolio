import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslationService } from '../../../shared/services/translation.service';
import { ScrollService } from '../../../shared/services/scroll.service';
import { CaseStudyDineosComponent } from './case-study-dineos.component';

describe('CaseStudyDineosComponent', () => {
  let component: CaseStudyDineosComponent;
  let fixture: ComponentFixture<CaseStudyDineosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseStudyDineosComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CaseStudyDineosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should scroll to top on init', () => {
    const scrollService = TestBed.inject(ScrollService);
    const scrollSpy = vi.spyOn(scrollService, 'scrollToTop').mockImplementation(() => undefined);

    component.ngOnInit();

    expect(scrollSpy).toHaveBeenCalled();
  });

  it('should mark for check when language changes', () => {
    const translateService = TestBed.inject(TranslationService);
    expect(() => {
      translateService.use('de');
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('should build screenshot paths under the case-studies assets folder', () => {
    expect(component.screenshotSrc('02-kitchen-board.webp')).toBe('assets/img/case-studies/dineos/02-kitchen-board.webp');
  });

  it('should render 8 result stat tiles', () => {
    const tiles = fixture.nativeElement.querySelectorAll('.cs-stat-tile');
    expect(tiles.length).toBe(8);
  });

  it('should render 5 "what it does" steps', () => {
    const items = fixture.nativeElement.querySelectorAll('.cs-steps-list > li');
    expect(items.length).toBe(5);
  });

  it('should render 6 technical highlights', () => {
    const items = fixture.nativeElement.querySelectorAll('.cs-engineering-list > li');
    expect(items.length).toBe(6);
  });

  it('should render 4 "what I learned" bullets', () => {
    const items = fixture.nativeElement.querySelectorAll('.cs-honest-list > li');
    expect(items.length).toBe(4);
  });

  it('should render the hero title from translations', () => {
    const title = fixture.nativeElement.querySelector('#case-study-title');
    expect(title.textContent).toContain('DineOS');
  });

  it('should link the guest view of the demo table from the hero', () => {
    const link = fixture.nativeElement.querySelector('.cs-meta a');
    expect(link.getAttribute('href')).toMatch(
      /^https:\/\/dineos-frontend-staging-aghirculesei\.onrender\.com\/menu\/[A-Za-z0-9]+$/
    );
  });

  it('should link the live demo externally and the private source code to the contact page', () => {
    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('.cs-link-list a'));
    expect(links.length).toBe(2);
    expect(links[0].getAttribute('target')).toBe('_blank');
    expect(links[1].getAttribute('href')).toBe('/contact');
    expect(links[1].getAttribute('target')).toBeNull();
  });

  it('should not link to a public repository', () => {
    const hosts = Array.from(fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>)
      .map((a) => a.getAttribute('href') ?? '')
      .filter((href) => /^https?:\/\//.test(href))
      .map((href) => new URL(href).hostname);
    expect(hosts.length).toBeGreaterThan(0);
    expect(hosts).not.toContain('github.com');
  });

  it('should render a back link to /projects', () => {
    const link = fixture.nativeElement.querySelector('a.back-link');
    expect(link.getAttribute('href')).toBe('/projects');
  });

  it('should render one screenshot image per configured screenshot', () => {
    const images = fixture.nativeElement.querySelectorAll('.cs-screenshot-item img');
    expect(images.length).toBe(4);
  });
});
