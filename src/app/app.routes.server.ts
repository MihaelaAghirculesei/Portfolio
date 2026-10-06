import { RenderMode, ServerRoute } from '@angular/ssr';

// The site is deployed as static files (Cloudflare Pages): every route is
// prerendered at build time, there is no server runtime.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
