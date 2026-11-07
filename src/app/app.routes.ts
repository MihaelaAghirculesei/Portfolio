import { Routes } from '@angular/router';

// Rendered in both languages: English at the root, German under /de.
const LOCALIZED_PAGES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./main-content/home/home.component').then(
        (m) => m.HomeComponent
      ),
  },
  {
    path: 'legal-notice',
    loadComponent: () =>
      import('./main-content/legal-notice/legal-notice.component').then(
        (m) => m.LegalNoticeComponent
      ),
  },
  {
    path: 'skills',
    loadComponent: () =>
      import('./main-content/skills/skills.component').then(
        (m) => m.SkillsComponent
      ),
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./main-content/portfolio/portfolio.component').then(
        (m) => m.PortfolioComponent
      ),
  },
  {
    path: 'case-study/alina-moments',
    loadComponent: () =>
      import(
        './main-content/portfolio/case-study-alina-moments/case-study-alina-moments.component'
      ).then((m) => m.CaseStudyAlinaMomentsComponent),
  },
  {
    path: 'case-study/bfsg-scanner',
    loadComponent: () =>
      import(
        './main-content/portfolio/case-study-bfsg-scanner/case-study-bfsg-scanner.component'
      ).then((m) => m.CaseStudyBfsgScannerComponent),
  },
  {
    path: 'case-study/charge-hub',
    loadComponent: () =>
      import(
        './main-content/portfolio/case-study-charge-hub/case-study-charge-hub.component'
      ).then((m) => m.CaseStudyChargeHubComponent),
  },
  {
    path: 'feedback',
    loadComponent: () =>
      import('./main-content/feedback/feedback.component').then(
        (m) => m.FeedbacksComponent
      ),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./main-content/contact/contact-form/contact-form.component').then(
        (m) => m.ContactFormComponent
      ),
  },
];

const NOT_FOUND: Routes[number] = {
  path: '**',
  loadComponent: () =>
    import('./main-content/not-found/not-found.component').then(
      (m) => m.NotFoundComponent
    ),
};

// Prerendered to 404/index.html and de/404/index.html, then published as
// 404.html and de/404.html. Cloudflare Pages serves the closest 404.html with
// a real 404 status, so unknown URLs under /de get the German page.
const NOT_FOUND_PAGE: Routes[number] = { ...NOT_FOUND, path: '404' };

export const routes: Routes = [
  {
    path: 'de',
    data: { localeRoot: true },
    children: [...LOCALIZED_PAGES, NOT_FOUND_PAGE, NOT_FOUND],
  },
  {
    path: '',
    data: { localeRoot: true },
    children: [
      ...LOCALIZED_PAGES,
      {
        path: 'privacy-policy',
        loadComponent: () =>
          import('./main-content/privacy-policy/privacy-policy.component').then(
            (m) => m.PrivacyPolicyComponent
          ),
      },
      {
        path: 'datenschutz',
        loadComponent: () =>
          import('./main-content/privacy-policy/privacy-policy.component').then(
            (m) => m.PrivacyPolicyComponent
          ),
      },
      NOT_FOUND_PAGE,
      NOT_FOUND,
    ],
  },
];
