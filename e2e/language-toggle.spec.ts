/**
 * E2E Scenario 4: Language Toggle (i18n)
 *
 * Verifies that clicking the language toggle in the header switches
 * UI text between English and German and persists the choice to localStorage.
 */
import { test, expect } from '@playwright/test';

test.describe('Language Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Clear stored language preference so the app always starts in English
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('lang'));
    await page.reload();
    await page.waitForSelector('nav', { timeout: 10_000 });
  });

  test('desktop nav shows English labels by default', async ({ page }) => {
    const aboutLink = page.locator('nav.desktop-nav a[aria-label="Navigate to About me section"]');
    await expect(aboutLink).toHaveText('About me');
  });

  test('clicking the language toggle switches nav labels to German', async ({ page }) => {
    await page.locator('#language-toggle').click();

    const aboutLink = page.locator('nav.desktop-nav a[aria-label*="Über mich"]');
    await expect(aboutLink).toHaveText('Über mich');
  });

  test('clicking the language toggle twice restores English labels', async ({ page }) => {
    await page.locator('#language-toggle').click();
    await page.locator('#language-toggle').click();

    const aboutLink = page.locator('nav.desktop-nav a[aria-label="Navigate to About me section"]');
    await expect(aboutLink).toHaveText('About me');
  });

  test('language preference is persisted in localStorage', async ({ page }) => {
    await page.locator('#language-toggle').click();

    const lang = await page.evaluate(() => localStorage.getItem('lang'));
    expect(lang).toBe('de');

    // Reload and verify German is still active
    await page.reload();
    await page.waitForSelector('nav');
    const aboutLink = page.locator('nav.desktop-nav a[aria-label*="Über mich"]');
    await expect(aboutLink).toHaveText('Über mich');
  });
});
