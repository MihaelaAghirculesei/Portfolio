import type { MockedObject } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/core';

import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;
  let metaSpy: Pick<MockedObject<Meta>, 'updateTag'>;
  let titleSpy: Pick<MockedObject<Title>, 'setTitle'>;
  let mockDoc: any;

  const SITE_URL = 'http://localhost:4200';

  function makeMockElement(): any {
    return {
      setAttribute: vi.fn(),
      textContent: '',
      parentNode: { removeChild: vi.fn() },
    };
  }

  beforeEach(() => {
    metaSpy = {
      updateTag: vi.fn().mockName('Meta.updateTag')
    };
    titleSpy = {
      setTitle: vi.fn().mockName('Title.setTitle')
    };

    mockDoc = {
      querySelectorAll: vi.fn().mockReturnValue([]),
      querySelector: vi.fn().mockReturnValue(null),
      createElement: vi.fn().mockImplementation(() => makeMockElement()),
      head: { appendChild: vi.fn() },
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
        expect.objectContaining({ property: 'og:image', content: expect.stringContaining(SITE_URL) }),
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
      mockDoc.querySelector.mockReturnValue(null);

      service.update(baseConfig);

      const [linkEl] = createdElements('link');
      expect(linkEl).toBeTruthy();
      expect(linkEl.setAttribute).toHaveBeenCalledWith('rel', 'canonical');
      expect(linkEl.setAttribute).toHaveBeenCalledWith('href', SITE_URL);
      expect(mockDoc.head.appendChild).toHaveBeenCalledWith(linkEl);
    });

    it('should update href on an existing canonical link without creating a new one', () => {
      const existingLink = makeMockElement();
      mockDoc.querySelector.mockReturnValue(existingLink);

      service.update({ ...baseConfig, ogUrl: `${SITE_URL}/about` });

      expect(existingLink.setAttribute).toHaveBeenCalledWith('href', `${SITE_URL}/about`);
      expect(createdElements('link')).toHaveLength(0);
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

    function createdElements(tag: string): any[] {
      const { calls, results } = vi.mocked(mockDoc.createElement).mock;
      return calls.flatMap((args: unknown[], i: number) => (args[0] === tag ? [results[i].value] : []));
    }

    function parsedScripts(): any[] {
      return createdElements('script')
        .filter((el: any) => el.textContent !== '')
        .map((el: any) => JSON.parse(el.textContent));
    }
  });
});
