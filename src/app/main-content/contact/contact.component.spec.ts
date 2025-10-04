import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { ContactComponent } from './contact.component';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactComponent, TranslateModule.forRoot()],
      providers: [provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should be defined', () => {
      expect(component).toBeDefined();
    });
  });

  describe('Template Rendering', () => {
    it('should render contact section with correct id', () => {
      const sectionElement = fixture.debugElement.query(
        By.css('section#contact')
      );
      expect(sectionElement).toBeTruthy();
    });

    it('should have correct ARIA attributes', () => {
      const sectionElement = fixture.debugElement.query(By.css('section'));
      const ctaElement = fixture.debugElement.query(By.css('.contact-cta'));
      const formElement = fixture.debugElement.query(
        By.css('app-contact-form')
      );

      expect(sectionElement.nativeElement.getAttribute('aria-labelledby')).toBe(
        'contact-title'
      );
      expect(ctaElement.nativeElement.getAttribute('role')).toBe('region');
      expect(ctaElement.nativeElement.getAttribute('aria-label')).toBe(
        'Call to action'
      );
      expect(formElement.nativeElement.getAttribute('role')).toBe('form');
      expect(formElement.nativeElement.getAttribute('aria-label')).toBe(
        'Contact form'
      );
    });

    it('should render header with contact title', () => {
      const headerElement = fixture.debugElement.query(
        By.css('header.contactDiv')
      );
      expect(headerElement).toBeTruthy();
    });

    it('should render h2 with correct id', () => {
      const h2Element = fixture.debugElement.query(By.css('h2#contact-title'));
      expect(h2Element).toBeTruthy();
    });

    it('should render all content elements', () => {
      const h2 = fixture.debugElement.query(By.css('h2'));
      const h3 = fixture.debugElement.query(By.css('h3'));
      const paragraphs = fixture.debugElement.queryAll(By.css('p'));
      const ctaDiv = fixture.debugElement.query(By.css('.contact-cta'));

      expect(h2).toBeTruthy();
      expect(h3).toBeTruthy();
      expect(paragraphs.length).toBeGreaterThanOrEqual(2);
      expect(ctaDiv).toBeTruthy();
    });
  });

  describe('Child Component Integration', () => {
    it('should render contact-form component', () => {
      const contactFormElement = fixture.debugElement.query(
        By.css('app-contact-form')
      );
      expect(contactFormElement).toBeTruthy();
    });
  });

  describe('Translation Integration', () => {
    it('should have translation keys', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('h2#contact-title')).toBeTruthy();
      expect(compiled.querySelector('h3')).toBeTruthy();
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive wrapper class', () => {
      const wrapperElement = fixture.debugElement.query(
        By.css('.contentWrapper')
      );
      expect(wrapperElement).toBeTruthy();
    });

    it('should have proper CSS classes for styling', () => {
      const contactDiv = fixture.debugElement.query(By.css('.contactDiv'));
      const ctaDiv = fixture.debugElement.query(By.css('.contact-cta'));

      expect(contactDiv).toBeTruthy();
      expect(ctaDiv).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      const section = fixture.debugElement.query(By.css('section'));
      const header = fixture.debugElement.query(By.css('header'));

      expect(section).toBeTruthy();
      expect(header).toBeTruthy();
    });

    it('should have proper heading hierarchy', () => {
      const h2 = fixture.debugElement.query(By.css('h2'));
      const h3 = fixture.debugElement.query(By.css('h3'));

      expect(h2).toBeTruthy();
      expect(h3).toBeTruthy();

      const h2Index = Array.from(h2.nativeElement.parentNode.children).indexOf(
        h2.nativeElement
      );
      const h3Index = Array.from(h3.nativeElement.parentNode.children).indexOf(
        h3.nativeElement
      );
      expect(h2Index).toBeLessThan(h3Index);
    });
  });
});
