/**
 * E2E Scenario 3: Routing
 *
 * Verifies that the router correctly navigates to and from the Legal Notice
 * and Privacy Policy pages, and that an unknown URL redirects to home.
 */
import { test, expect } from '@playwright/test';

test.describe('Routing', () => {
  test('navigates to Legal Notice page via footer link', async ({ page }) => {
    await page.goto('/');

    // Click the footer Legal Notice link
    await page.locator('a[routerlink="/legal-notice"], a[href="/legal-notice"]').first().click();

    await expect(page).toHaveURL('/legal-notice');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('navigates to Privacy Policy page via footer link', async ({ page }) => {
    await page.goto('/');

    await page.locator('a[routerlink="/privacy-policy"], a[href="/privacy-policy"]').first().click();

    await expect(page).toHaveURL('/privacy-policy');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('navigates back to home when logo button is clicked from Legal Notice', async ({ page }) => {
    await page.goto('/legal-notice');

    // The footer logo scrolls to home
    await page.locator('app-footer button.logo-button').click();

    await expect(page).toHaveURL('/');
  });

  test('redirects unknown routes to home', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');

    // The wildcard route redirects to ''
    await expect(page).toHaveURL('/');
  });

  test('Privacy Policy page is reachable via /datenschutz alias', async ({ page }) => {
    await page.goto('/datenschutz');

    // Both /datenschutz and /privacy-policy load the same component
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
