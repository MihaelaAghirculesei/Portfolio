import { basePath, langFromPath, localizePath } from './locale-path';

describe('locale paths', () => {
  describe('langFromPath()', () => {
    it.each([
      ['/', 'en'], ['/skills', 'en'], ['/privacy-policy', 'en'], ['/design', 'en'],
      ['/de', 'de'], ['/de/', 'de'], ['/de/skills', 'de'], ['/de?x=1', 'de'], ['/datenschutz', 'de'],
    ])('%s is %s', (path, lang) => {
      expect(langFromPath(path)).toBe(lang);
    });
  });

  describe('basePath()', () => {
    it.each([
      ['/', '/'], ['', '/'], ['/de', '/'], ['/de/', '/'], ['/de/skills', '/skills'], ['/skills/', '/skills'],
      ['/de/case-study/charge-hub#top', '/case-study/charge-hub'], ['/datenschutz', '/privacy-policy'], ['/design', '/design'],
    ])('%s is %s', (path, base) => {
      expect(basePath(path)).toBe(base);
    });
  });

  describe('localizePath()', () => {
    it.each([
      ['/', 'de', '/de'], ['/skills', 'de', '/de/skills'], ['/de/skills', 'de', '/de/skills'],
      ['/privacy-policy', 'de', '/datenschutz'], ['/', 'en', '/'], ['/de', 'en', '/'],
      ['/de/skills', 'en', '/skills'], ['/datenschutz', 'en', '/privacy-policy'],
    ] as const)('%s in %s is %s', (path, lang, localized) => {
      expect(localizePath(path, lang)).toBe(localized);
    });
  });
});
