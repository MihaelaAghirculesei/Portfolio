/**
 * E2E Scenario: German routes
 *
 * The URL decides the language, so crawlers get German pages without
 * JavaScript and without a stored preference.
 */
import { test, expect } from '@playwright/test';

const GERMAN_ABOUT_LINK = 'nav.desktop-nav a[aria-label*="Über mich"]';
const ENGLISH_ABOUT_LINK = 'nav.desktop-nav a[aria-label="Navigate to About me section"]';

test.describe('German routes', () => {
  test('are served in German before any JavaScript runs', async ({ request }) => {
    const html = await (await request.get('/de/skills')).text();

    expect(html).toContain('<html lang="de"');
    expect(html).toContain('Kenntnisse — Mihaela Aghirculesei');
    expect(html).toMatch(/rel="canonical" href="[^"]+\/de\/skills"/);
    expect(html).toMatch(/rel="alternate" hreflang="en" href="[^"]+\/skills"/);
    expect(html).toMatch(/rel="alternate" hreflang="de" href="[^"]+\/de\/skills"/);
    expect(html).toMatch(/rel="alternate" hreflang="x-default" href="[^"]+\/skills"/);
  });

  test('English routes stay English and link to their German twin', async ({ request }) => {
    const html = await (await request.get('/skills')).text();

    expect(html).toContain('<html lang="en"');
    expect(html).toMatch(/rel="alternate" hreflang="de" href="[^"]+\/de\/skills"/);
  });

  test('a German URL wins over a stored English preference', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('lang', 'en'));

    await page.goto('/de');

    await expect(page.locator(GERMAN_ABOUT_LINK)).toHaveText('Über mich');
    await expect(page).toHaveURL(/\/de\/?$/);
  });

  test('a stored German preference opens the German twin of an English URL', async ({ page }) => {
    await page.goto('/skills');
    await page.evaluate(() => localStorage.setItem('lang', 'de'));

    await page.goto('/skills');

    await expect(page).toHaveURL(/\/de\/skills\/?$/);
    await expect(page.locator(GERMAN_ABOUT_LINK)).toHaveText('Über mich');
  });

  test('footer links stay in German', async ({ page }) => {
    await page.goto('/de');

    await page.locator('footer a.legal-notice-link').click();

    await expect(page).toHaveURL(/\/de\/legal-notice\/?$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  });

  test('the toggle keeps the page and the scroll position', async ({ page }) => {
    await page.goto('/skills');
    await page.mouse.wheel(0, 300);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    const scrollY = await page.evaluate(() => window.scrollY);

    await page.locator('label[for="language-toggle"]').click();

    await expect(page).toHaveURL(/\/de\/skills\/?$/);
    await expect(page.locator(GERMAN_ABOUT_LINK)).toHaveText('Über mich');
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
  });

  test('the browser back button restores the language', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('lang'));
    await page.goto('/');
    await page.locator('label[for="language-toggle"]').click();
    await expect(page).toHaveURL(/\/de\/?$/);

    await page.goBack();

    await expect(page.locator(ENGLISH_ABOUT_LINK)).toHaveText('About me');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});
