import { Routes } from '@angular/router';
import { LegalNoticeComponent } from './main-content/legal-notice/legal-notice.component';
import { PrivacyPolicyComponent } from './main-content/privacy-policy/privacy-policy.component';

export const routes: Routes = [
  { path: 'legal-notice', component: LegalNoticeComponent },
  { path: 'datenschutz', component: PrivacyPolicyComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent }
];