import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslationService } from '../../../shared/services/translation.service';
import { ScrollService } from '../../../shared/services/scroll.service';
import { CaseStudyBirthdayReminderComponent } from './case-study-birthday-reminder.component';

describe('CaseStudyBirthdayReminderComponent', () => {
  let component: CaseStudyBirthdayReminderComponent;
  let fixture: ComponentFixture<CaseStudyBirthdayReminderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseStudyBirthdayReminderComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CaseStudyBirthdayReminderComponent);
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
    expect(component.screenshotSrc('01-dashboard.webp')).toBe(
      'assets/img/case-studies/birthday-reminder/01-dashboard.webp'
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

  it('should render 4 "what I learned" bullets', () => {
    const items = fixture.nativeElement.querySelectorAll('.cs-honest-list > li');
    expect(items.length).toBe(4);
  });

  it('should render 4 external links', () => {
    const items = fixture.nativeElement.querySelectorAll('.cs-link-list > li');
    expect(items.length).toBe(4);
  });

  it('should render the hero title from translations', () => {
    const title = fixture.nativeElement.querySelector('#case-study-title');
    expect(title.textContent).toContain('Birthday Reminder Pro');
  });

  it('should link the live demo from the hero', () => {
    const link = fixture.nativeElement.querySelector('.cs-meta a');
    expect(link.getAttribute('href')).toBe('https://birthday-reminder-aghirculesei.pages.dev');
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
