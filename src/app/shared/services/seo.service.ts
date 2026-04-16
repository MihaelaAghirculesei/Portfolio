import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../../environments/environment';

export interface SeoConfig {
  title: string;
  description: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  noIndex?: boolean;
}

const SITE_URL = environment.siteUrl;
const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/img/about-me/mihaela-aghirculesei(2).jpg`;

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly titleService = inject(Title);
  private readonly doc = inject(DOCUMENT);

  update(config: SeoConfig): void {
    const ogUrl = config.ogUrl ?? SITE_URL;
    const ogImage = config.ogImage ?? DEFAULT_OG_IMAGE;
    const ogType = config.ogType ?? 'website';

    this.titleService.setTitle(config.title);

    this.meta.updateTag({ name: 'description', content: config.description });

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:image', content: ogImage });
    this.meta.updateTag({ property: 'og:url', content: ogUrl });
    this.meta.updateTag({ property: 'og:type', content: ogType });
    this.meta.updateTag({ property: 'og:site_name', content: 'Mihaela Melania Aghirculesei' });

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    this.meta.updateTag({ name: 'twitter:image', content: ogImage });

    // Canonical link
    this.setCanonical(ogUrl);

    // Robots
    const robotsContent = config.noIndex ? 'noindex, nofollow' : 'index, follow';
    this.meta.updateTag({ name: 'robots', content: robotsContent });

    // JSON-LD structured data
    this.updateJsonLd(ogUrl, config.description);
  }

  // ── JSON-LD ──────────────────────────────────────────────────────────────

  private updateJsonLd(ogUrl: string, description: string): void {
    const isHome = ogUrl === SITE_URL || ogUrl === `${SITE_URL}/`;
    const schemas: object[] = [this.buildWebSiteSchema()];

    if (isHome) {
      schemas.push(this.buildPersonSchema(description));
    } else {
      schemas.push(this.buildBreadcrumbSchema(ogUrl));
    }

    this.setJsonLd(schemas);
  }

  private buildWebSiteSchema(): object {
    /* eslint-disable @typescript-eslint/naming-convention */
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Mihaela Melania Aghirculesei',
      url: SITE_URL,
      description:
        'Portfolio of Mihaela Melania Aghirculesei, ' +
        'Frontend Developer specializing in Angular and TypeScript.',
      author: { '@type': 'Person', name: 'Mihaela Melania Aghirculesei' },
    };
    /* eslint-enable @typescript-eslint/naming-convention */
  }

  private buildPersonSchema(description: string): object {
    /* eslint-disable @typescript-eslint/naming-convention */
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Mihaela Melania Aghirculesei',
      url: SITE_URL,
      image: DEFAULT_OG_IMAGE,
      description,
      jobTitle: 'Frontend Developer',
      knowsAbout: ['Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'SASS'],
      sameAs: [
        environment.social.github,
        environment.social.linkedin,
      ],
    };
    /* eslint-enable @typescript-eslint/naming-convention */
  }

  private buildBreadcrumbSchema(ogUrl: string): object {
    const segment = ogUrl.replace(SITE_URL, '').replace(/^\//, '');
    const label = segment
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    /* eslint-disable @typescript-eslint/naming-convention */
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: label, item: ogUrl },
      ],
    };
    /* eslint-enable @typescript-eslint/naming-convention */
  }

  private setJsonLd(schemas: object[]): void {
    this.doc
      .querySelectorAll('script[type="application/ld+json"][data-seo]')
      .forEach(el => el.parentNode?.removeChild(el));

    for (const schema of schemas) {
      const script = this.doc.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-seo', 'true');
      script.textContent = JSON.stringify(schema);
      this.doc.head.appendChild(script);
    }
  }

  // ── Canonical ────────────────────────────────────────────────────────────


  private setCanonical(url: string): void {
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
