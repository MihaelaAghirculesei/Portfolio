import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { BannerSectionComponent } from './banner-section.component';

describe('BannerSectionComponent', () => {
  let component: BannerSectionComponent;
  let fixture: ComponentFixture<BannerSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerSectionComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(BannerSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Creation ───────────────────────────────────────────────────────────────

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  // ─── Data: bannerItems ──────────────────────────────────────────────────────

  describe('bannerItems', () => {
    it('should have exactly 6 banner items', () => {
      expect(component.bannerItems.length).toBe(6);
    });

    it('should contain the expected translation keys', () => {
      const keys = component.bannerItems.map(item => item.key);
      expect(keys).toContain('banner.remoteWork');
      expect(keys).toContain('banner.role');
      expect(keys).toContain('banner.openToWork');
      expect(keys).toContain('banner.location');
      expect(keys).toContain('banner.skills');
      expect(keys).toContain('banner.passion');
    });

    it('should have all items with a non-empty key', () => {
      component.bannerItems.forEach(item => {
        expect(item.key).toBeTruthy();
        expect(typeof item.key).toBe('string');
      });
    });

    it('should have unique keys', () => {
      const keys = component.bannerItems.map(item => item.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(component.bannerItems.length);
    });
  });

  // ─── Data: bannerTracks ─────────────────────────────────────────────────────

  describe('bannerTracks', () => {
    it('should have exactly 3 tracks', () => {
      expect(component.bannerTracks.length).toBe(3);
    });

    it('should be an array (used for @for in template)', () => {
      expect(Array.isArray(component.bannerTracks)).toBe(true);
    });
  });

  // ─── Template Rendering ─────────────────────────────────────────────────────

  describe('Template Rendering', () => {
    it('should render a <section> as the root element', () => {
      const section = fixture.debugElement.query(By.css('section.banner-container'));
      expect(section).toBeTruthy();
    });

    it('should render 3 banner track divs', () => {
      const tracks = fixture.debugElement.queryAll(By.css('.banner-track'));
      expect(tracks.length).toBe(3);
    });

    it('should render 6 text spans per track (one per bannerItem)', () => {
      const tracks = fixture.debugElement.queryAll(By.css('.banner-track'));
      tracks.forEach(track => {
        // Each item produces a text <span> + a separator <span>
        const textSpans = track.queryAll(By.css('span:not(.separator)'));
        expect(textSpans.length).toBe(6);
      });
    });

    it('should render 6 separator spans per track', () => {
      const tracks = fixture.debugElement.queryAll(By.css('.banner-track'));
      tracks.forEach(track => {
        const separators = track.queryAll(By.css('span.separator'));
        expect(separators.length).toBe(6);
      });
    });

    it('should render 36 spans in total (6 items × 2 spans × 3 tracks)', () => {
      const allSpans = fixture.debugElement.queryAll(By.css('.banner-track span'));
      expect(allSpans.length).toBe(36);
    });
  });

  // ─── Accessibility ──────────────────────────────────────────────────────────

  describe('Accessibility', () => {
    it('should set role="banner" on the section', () => {
      const section = fixture.debugElement.query(By.css('section'));
      expect(section.nativeElement.getAttribute('role')).toBe('banner');
    });

    it('should mark duplicate tracks as aria-hidden to avoid repetition for screen readers', () => {
      const tracks = fixture.debugElement.queryAll(By.css('.banner-track'));
      // Angular binds [attr.aria-hidden]="$index > 0": track[0] → "false", tracks[1/2] → "true"
      expect(tracks[0].nativeElement.getAttribute('aria-hidden')).toBe('false');
      expect(tracks[1].nativeElement.getAttribute('aria-hidden')).toBe('true');
      expect(tracks[2].nativeElement.getAttribute('aria-hidden')).toBe('true');
    });

    it('should set aria-live="off" on each track to prevent screen-reader announcements', () => {
      const tracks = fixture.debugElement.queryAll(By.css('.banner-track'));
      tracks.forEach(track => {
        expect(track.nativeElement.getAttribute('aria-live')).toBe('off');
      });
    });

    it('should mark separator spans as aria-hidden', () => {
      const separators = fixture.debugElement.queryAll(By.css('span.separator'));
      separators.forEach(sep => {
        expect(sep.nativeElement.getAttribute('aria-hidden')).toBe('true');
      });
    });
  });
});
