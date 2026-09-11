import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslationService } from '../../../shared/services/translation.service';
import { ScrollService } from '../../../shared/services/scroll.service';
import { CaseStudyChargeHubComponent } from './case-study-charge-hub.component';

describe('CaseStudyChargeHubComponent', () => {
  let component: CaseStudyChargeHubComponent;
  let fixture: ComponentFixture<CaseStudyChargeHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseStudyChargeHubComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CaseStudyChargeHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should scroll to top on init', () => {
    const scrollService = TestBed.inject(ScrollService);
    const scrollSpy = spyOn(scrollService, 'scrollToTop');

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
    expect(component.screenshotSrc('01-dashboard.webp')).toBe(
      'assets/img/case-studies/charge-hub/01-dashboard.webp'
    );
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

  it('should render a limitations list and a learnings list', () => {
    const lists = fixture.nativeElement.querySelectorAll('.cs-honest-list');
    expect(lists.length).toBe(2);
    expect(lists[0].querySelectorAll('li').length).toBe(5);
    expect(lists[1].querySelectorAll('li').length).toBe(4);
  });

  it('should render 3 external links', () => {
    const items = fixture.nativeElement.querySelectorAll('.cs-link-list > li');
    expect(items.length).toBe(3);
  });

  it('should render the hero title from translations', () => {
    const title = fixture.nativeElement.querySelector('#case-study-title');
    expect(title.textContent).toContain('ChargeHub');
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
