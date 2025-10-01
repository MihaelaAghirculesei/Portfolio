import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'legal-notice',
    loadComponent: () =>
      import('./main-content/legal-notice/legal-notice.component').then(
        (m) => m.LegalNoticeComponent
      ),
    title: 'Legal Notice',
  },
  {
    path: 'datenschutz',
    loadComponent: () =>
      import('./main-content/privacy-policy/privacy-policy.component').then(
        (m) => m.PrivacyPolicyComponent
      ),
    title: 'Datenschutz',
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./main-content/privacy-policy/privacy-policy.component').then(
        (m) => m.PrivacyPolicyComponent
      ),
    title: 'Privacy Policy',
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];