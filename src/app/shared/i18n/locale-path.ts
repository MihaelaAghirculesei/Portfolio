import type { Lang } from '../services/translation.service';

const DE_PREFIX = '/de';
// The privacy policy keeps the URL each language already has: German lives at
// /datenschutz, the only German page outside the /de prefix.
const PRIVACY_PATH = '/privacy-policy';
const DE_PRIVACY_PATH = '/datenschutz';

function pathOnly(url: string): string {
  const path = url.split(/[?#]/)[0].replace(/\/+$/, '');
  return path === '' ? '/' : path;
}

export function langFromPath(url: string): Lang {
  const path = pathOnly(url);
  return path === DE_PREFIX || path.startsWith(`${DE_PREFIX}/`) || path === DE_PRIVACY_PATH ? 'de' : 'en';
}

/** The language-neutral form of a path: `/de/skills` becomes `/skills`. */
export function basePath(url: string): string {
  const path = pathOnly(url);
  if (path === DE_PRIVACY_PATH) { return PRIVACY_PATH; }
  if (path === DE_PREFIX) { return '/'; }
  return path.startsWith(`${DE_PREFIX}/`) ? path.slice(DE_PREFIX.length) : path;
}

export function localizePath(url: string, lang: Lang): string {
  const base = basePath(url);
  if (lang !== 'de') { return base; }
  if (base === PRIVACY_PATH) { return DE_PRIVACY_PATH; }
  return base === '/' ? DE_PREFIX : `${DE_PREFIX}${base}`;
}
