import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { OverlayComponent } from './overlay.component';
import { Projects } from '../../interfaces/projects';

const MOCK_PROJECT: Projects = {
  name: 'Join',
  technologies: ['Angular', 'Firebase'],
  previewImg: 'assets/img/join-preview.png',
  description: 'A task management tool built with Angular.',
  githubUrl: 'https://github.com/example/join',
  liveUrl: 'https://join.example.com',
};

describe('OverlayComponent', () => {
  let component: OverlayComponent;
  let fixture: ComponentFixture<OverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(OverlayComponent);
    component = fixture.componentInstance;
    component.singleProject = { ...MOCK_PROJECT };
    component.index = 0;
    fixture.detectChanges();
  });

  // ─── Creation ───────────────────────────────────────────────────────────────

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values when no inputs are provided', () => {
      const fresh = TestBed.createComponent(OverlayComponent);
      const comp = fresh.componentInstance;
      expect(comp.singleProject.name).toBe('');
      expect(comp.singleProject.technologies).toEqual([]);
      expect(comp.index).toBe(0);
    });
  });

  // ─── Input Binding ──────────────────────────────────────────────────────────

  describe('Input: singleProject', () => {
    it('should render the project name in an h2', () => {
      const h2 = fixture.debugElement.query(By.css('h2'));
      expect(h2.nativeElement.textContent.trim()).toBe('Join');
    });

    it('should render the project description', () => {
      const span = fixture.debugElement.query(By.css('span'));
      expect(span.nativeElement.textContent).toContain('A task management tool');
    });

    it('should render one technology chip per technology', () => {
      const chips = fixture.debugElement.queryAll(By.css('.techDiv p'));
      expect(chips.length).toBe(2);
    });

    it('should display each technology name', () => {
      const chips = fixture.debugElement.queryAll(By.css('.techDiv p'));
      const texts = chips.map(c => c.nativeElement.textContent.trim());
      expect(texts.some(t => t.includes('Angular'))).toBe(true);
      expect(texts.some(t => t.includes('Firebase'))).toBe(true);
    });

    it('should set the GitHub link href', () => {
      const link = fixture.debugElement
        .queryAll(By.css('a'))
        .find(a => (a.nativeElement as HTMLAnchorElement).href.includes('github'));
      expect(link).toBeTruthy();
      expect((link!.nativeElement as HTMLAnchorElement).href).toBe(MOCK_PROJECT.githubUrl);
    });

    it('should set the live URL href', () => {
      const link = fixture.debugElement
        .queryAll(By.css('a'))
        .find(a => (a.nativeElement as HTMLAnchorElement).href.includes('join.example'));
      expect(link).toBeTruthy();
      // Browsers may normalize URLs by appending a trailing slash
      const href = (link!.nativeElement as HTMLAnchorElement).href;
      expect(href.replace(/\/$/, '')).toBe(MOCK_PROJECT.liveUrl.replace(/\/$/, ''));
    });

    it('should set the preview image src', () => {
      const img = fixture.debugElement.query(By.css('.imageContainer img'));
      expect((img.nativeElement as HTMLImageElement).src).toContain(MOCK_PROJECT.previewImg);
    });

    it('should update rendered content when project input changes', () => {
      fixture.componentRef.setInput('singleProject', {
        ...MOCK_PROJECT,
        name: 'El Pollo Loco',
        description: 'A jump-and-run browser game.',
      });
      fixture.detectChanges();

      const h2 = fixture.debugElement.query(By.css('h2'));
      expect(h2.nativeElement.textContent.trim()).toBe('El Pollo Loco');
    });
  });

  describe('Input: index', () => {
    it('should render padded index number in the h1 (01 for index 0)', () => {
      component.index = 0;
      fixture.detectChanges();
      const h1 = fixture.debugElement.query(By.css('h1'));
      expect(h1.nativeElement.textContent.trim()).toBe('01');
    });

    it('should pad single-digit indexes with a leading zero', () => {
      fixture.componentRef.setInput('index', 2);
      fixture.detectChanges();
      const h1 = fixture.debugElement.query(By.css('h1'));
      expect(h1.nativeElement.textContent.trim()).toBe('03');
    });

    it('should bind aria-labelledby on the dialog to the project title id', () => {
      fixture.componentRef.setInput('index', 1);
      fixture.detectChanges();
      const dialog = fixture.debugElement.query(By.css('[role="dialog"]'));
      expect(dialog.nativeElement.getAttribute('aria-labelledby')).toBe('project-title-1');
    });

    it('should set the h2 id to match the aria-labelledby target', () => {
      fixture.componentRef.setInput('index', 3);
      fixture.detectChanges();
      const h2 = fixture.debugElement.query(By.css('h2'));
      expect(h2.nativeElement.id).toBe('project-title-3');
    });
  });

  // ─── Accessibility ──────────────────────────────────────────────────────────

  describe('Accessibility', () => {
    it('should have role="dialog" on the overlay root', () => {
      const overlay = fixture.debugElement.query(By.css('.overlay'));
      expect(overlay.nativeElement.getAttribute('role')).toBe('dialog');
    });

    it('should have aria-modal="true" on the dialog', () => {
      const overlay = fixture.debugElement.query(By.css('.overlay'));
      expect(overlay.nativeElement.getAttribute('aria-modal')).toBe('true');
    });

    it('should have role="document" on the content wrapper', () => {
      const wrapper = fixture.debugElement.query(By.css('.contentWrapper'));
      expect(wrapper.nativeElement.getAttribute('role')).toBe('document');
    });

    it('should have aria-hidden="true" on the decorative h1', () => {
      const h1 = fixture.debugElement.query(By.css('h1'));
      expect(h1.nativeElement.getAttribute('aria-hidden')).toBe('true');
    });

    it('should have rel="noopener noreferrer" on external links', () => {
      const links = fixture.debugElement.queryAll(By.css('a[target="_blank"]'));
      links.forEach(link => {
        expect(link.nativeElement.getAttribute('rel')).toBe('noopener noreferrer');
      });
    });

    it('should have descriptive aria-label on the GitHub link', () => {
      const githubLink = fixture.debugElement
        .queryAll(By.css('a'))
        .find(a => (a.nativeElement as HTMLAnchorElement).href.includes('github'));
      const label = githubLink!.nativeElement.getAttribute('aria-label');
      expect(label).toContain('Join');
      expect(label).toContain('GitHub');
    });

    it('should have descriptive aria-label on the live demo link', () => {
      const liveLink = fixture.debugElement
        .queryAll(By.css('a'))
        .find(a => (a.nativeElement as HTMLAnchorElement).href.includes('join.example'));
      const label = liveLink!.nativeElement.getAttribute('aria-label');
      expect(label).toContain('Join');
    });
  });

  // ─── Output Events ──────────────────────────────────────────────────────────

  describe('Output: closeOverlay', () => {
    it('should emit closeOverlay when handleClose() is called', () => {
      let emitted = false;
      component.closeOverlay.subscribe(() => (emitted = true));

      component.handleClose();

      expect(emitted).toBe(true);
    });

    it('should emit closeOverlay when the close button is clicked', () => {
      let emitted = false;
      component.closeOverlay.subscribe(() => (emitted = true));

      const closeBtn = fixture.debugElement.query(By.css('.close-button'));
      closeBtn.nativeElement.click();

      expect(emitted).toBe(true);
    });

    it('should emit exactly once per click on the close button', () => {
      let count = 0;
      component.closeOverlay.subscribe(() => count++);

      const closeBtn = fixture.debugElement.query(By.css('.close-button'));
      closeBtn.nativeElement.click();
      closeBtn.nativeElement.click();

      expect(count).toBe(2);
    });
  });

  describe('Output: nextProject', () => {
    it('should emit nextProject when the next-project button is clicked', () => {
      let emitted = false;
      component.nextProject.subscribe(() => (emitted = true));

      // The "next project" button is the second button inside .contentRight
      const buttons = fixture.debugElement.queryAll(By.css('.contentRight button'));
      const nextBtn = buttons[buttons.length - 1];
      nextBtn.nativeElement.click();

      expect(emitted).toBe(true);
    });

    it('should emit nextProject exactly once per click', () => {
      let count = 0;
      component.nextProject.subscribe(() => count++);

      const buttons = fixture.debugElement.queryAll(By.css('.contentRight button'));
      const nextBtn = buttons[buttons.length - 1];
      nextBtn.nativeElement.click();
      nextBtn.nativeElement.click();

      expect(count).toBe(2);
    });
  });

  // ─── Event Propagation ──────────────────────────────────────────────────────

  describe('Click propagation on content wrapper', () => {
    it('should stop click propagation inside .contentWrapper', () => {
      const wrapper = fixture.debugElement.query(By.css('.contentWrapper'));
      const event = new MouseEvent('click', { bubbles: true });
      spyOn(event, 'stopPropagation');

      wrapper.nativeElement.dispatchEvent(event);

      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  // ─── Technology rendering ────────────────────────────────────────────────────

  describe('Technology icons', () => {
    it('should render an img per technology with alt text', () => {
      const imgs = fixture.debugElement.queryAll(By.css('.techDiv img'));
      expect(imgs.length).toBe(2);
      imgs.forEach((img, i) => {
        const altText = (img.nativeElement as HTMLImageElement).alt;
        expect(altText).toContain('technology icon');
      });
    });

    it('should render no technology chips when technologies array is empty', () => {
      fixture.componentRef.setInput('singleProject', { ...MOCK_PROJECT, technologies: [] });
      fixture.detectChanges();
      const chips = fixture.debugElement.queryAll(By.css('.techDiv p'));
      expect(chips.length).toBe(0);
    });
  });
});
