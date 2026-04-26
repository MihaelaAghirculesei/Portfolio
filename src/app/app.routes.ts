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
    path: '**',
    redirectTo: '/',
  },
];