import { Routes } from '@angular/router';

export const routes: Routes = [
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
    path: 'datenschutz',
    loadComponent: () =>
      import('./main-content/privacy-policy/privacy-policy.component').then(
        (m) => m.PrivacyPolicyComponent
      ),
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./main-content/privacy-policy/privacy-policy.component').then(
        (m) => m.PrivacyPolicyComponent
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
  {
    // Prerendered to /404/index.html and published as /404.html, which
    // Cloudflare Pages serves with a real 404 status for unknown URLs.
    path: '404',
    loadComponent: () =>
      import('./main-content/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./main-content/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];