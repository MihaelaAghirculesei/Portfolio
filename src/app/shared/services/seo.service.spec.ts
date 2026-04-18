import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/core';

import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;
  let metaSpy: jasmine.SpyObj<Meta>;
  let titleSpy: jasmine.SpyObj<Title>;
  let mockDoc: any;

  const SITE_URL = 'http://localhost:4200';

  function makeMockElement(): any {
    return {
      setAttribute: jasmine.createSpy('setAttribute'),
      textContent: '',
      parentNode: { removeChild: jasmine.createSpy('removeChild') },
    };
  }

  beforeEach(() => {
    metaSpy = jasmine.createSpyObj('Meta', ['updateTag']);
    titleSpy = jasmine.createSpyObj('Title', ['setTitle']);

    mockDoc = {
      querySelectorAll: jasmine.createSpy('querySelectorAll').and.returnValue([]),
      querySelector: jasmine.createSpy('querySelector').and.returnValue(null),
      createElement: jasmine.createSpy('createElement').and.callFake(() => makeMockElement()),
      head: { appendChild: jasmine.createSpy('appendChild') },
    };

    TestBed.configureTestingModule({
      providers: [
        SeoService,
        { provide: Meta, useValue: metaSpy },
        { provide: Title, useValue: titleSpy },
        { provide: DOCUMENT, useValue: mockDoc },
      ],
    });

    service = TestBed.inject(SeoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('update()', () => {
    const baseConfig = { title: 'Test Page', description: 'Test description' };

    it('should set the page title', () => {
      service.update(baseConfig);

      expect(titleSpy.setTitle).toHaveBeenCalledWith('Test Page');
    });

    it('should set description, open graph, and twitter meta tags', () => {
      service.update(baseConfig);

      expect(metaSpy.updateTag).toHaveBeenCalledWith({ name: 'description', content: 'Test description' });
      expect(metaSpy.updateTag).toHaveBeenCalledWith({ property: 'og:title', content: 'Test Page' });
      expect(metaSpy.updateTag).toHaveBeenCalledWith({ property: 'og:description', content: 'Test description' });
      expect(metaSpy.updateTag).toHaveBeenCalledWith({ property: 'og:type', content: 'website' });
      expect(metaSpy.updateTag).toHaveBeenCalledWith({ name: 'twitter:card', content: 'summary_large_image' });
      expect(metaSpy.updateTag).toHaveBeenCalledWith({ name: 'twitter:title', content: 'Test Page' });
      expect(metaSpy.updateTag).toHaveBeenCalledWith({ name: 'twitter:description', content: 'Test description' });
    });

    it('should fall back to SITE_URL and default image when optional fields are omitted', () => {
      service.update(baseConfig);

      expect(metaSpy.updateTag).toHaveBeenCalledWith({ property: 'og:url', content: SITE_URL });
      expect(metaSpy.updateTag).toHaveBeenCalledWith(
        jasmine.objectContaining({ property: 'og:image', content: jasmine.stringContaining(SITE_URL) })
      );
    });

    it('should set noindex, nofollow when noIndex is true', () => {
      service.update({ ...baseConfig, noIndex: true });

      expect(metaSpy.updateTag).toHaveBeenCalledWith({ name: 'robots', content: 'noindex, nofollow' });
    });

    it('should set index, follow when noIndex is omitted', () => {
      service.update(baseConfig);

      expect(metaSpy.updateTag).toHaveBeenCalledWith({ name: 'robots', content: 'index, follow' });
    });

    it('should create and append a canonical link element when none exists', () => {
      mockDoc.querySelector.and.returnValue(null);

      service.update(baseConfig);

      const linkCall = mockDoc.createElement.calls.all().find((c: any) => c.args[0] === 'link');
      expect(linkCall).toBeTruthy();
      const linkEl = linkCall.returnValue;
      expect(linkEl.setAttribute).toHaveBeenCalledWith('rel', 'canonical');
      expect(linkEl.setAttribute).toHaveBeenCalledWith('href', SITE_URL);
      expect(mockDoc.head.appendChild).toHaveBeenCalledWith(linkEl);
    });

    it('should update href on an existing canonical link without creating a new one', () => {
      const existingLink = makeMockElement();
      mockDoc.querySelector.and.returnValue(existingLink);

      service.update({ ...baseConfig, ogUrl: `${SITE_URL}/about` });

      expect(existingLink.setAttribute).toHaveBeenCalledWith('href', `${SITE_URL}/about`);
      expect(mockDoc.createElement.calls.all().some((c: any) => c.args[0] === 'link')).toBeFalse();
    });

    it('should inject WebSite and Person JSON-LD schemas on the home page', () => {
      service.update({ ...baseConfig, ogUrl: SITE_URL });

      const schemas = parsedScripts();
      expect(schemas.map((s: any) => s['@type'])).toContain('WebSite');
      expect(schemas.map((s: any) => s['@type'])).toContain('Person');
    });

    it('should inject WebSite and BreadcrumbList JSON-LD schemas on sub-pages', () => {
      service.update({ ...baseConfig, ogUrl: `${SITE_URL}/privacy-policy` });

      const schemas = parsedScripts();
      expect(schemas.map((s: any) => s['@type'])).toContain('WebSite');
      expect(schemas.map((s: any) => s['@type'])).toContain('BreadcrumbList');
    });

    it('should capitalise each word of the breadcrumb label from the URL segment', () => {
      service.update({ ...baseConfig, ogUrl: `${SITE_URL}/privacy-policy` });

      const breadcrumb = parsedScripts().find((s: any) => s['@type'] === 'BreadcrumbList');
      expect(breadcrumb?.itemListElement[1].name).toBe('Privacy Policy');
    });

    function parsedScripts(): any[] {
      return mockDoc.createElement.calls
        .all()
        .filter((c: any) => c.args[0] === 'script')
        .map((c: any) => c.returnValue)
        .filter((el: any) => el.textContent !== '')
        .map((el: any) => JSON.parse(el.textContent));
    }
  });
});
