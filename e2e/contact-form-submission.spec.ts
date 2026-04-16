/**
 * E2E Scenario 2: Contact Form — Happy Path Submission
 *
 * Intercepts the real email-worker HTTP request and asserts the success
 * popup is displayed. Also covers the error path by simulating a 500 response.
 */
import { test, expect } from '@playwright/test';
import { scrollToContactForm, fillContactForm } from './helpers';

const WORKER_URL = '**/api.aghirculesei.workers.dev/**';

test.describe('Contact Form — Submission', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await scrollToContactForm(page);
  });

  test('shows success popup after valid form is submitted (mocked API)', async ({ page }) => {
    await page.route(WORKER_URL, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    );

    await fillContactForm(page);
    await page.locator('input[type="submit"]').click();

    const popup = page.locator('.popup.success');
    await expect(popup).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('#popup-title')).toHaveText('Success!');
    await expect(page.locator('.popup-content p')).toHaveText(
      'Your message has been sent successfully!'
    );
  });

  test('closes success popup when the Close button is clicked', async ({ page }) => {
    await page.route(WORKER_URL, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    );

    await fillContactForm(page);
    await page.locator('input[type="submit"]').click();
    await page.locator('.popup-footer button').click();

    await expect(page.locator('.popup')).not.toBeVisible();
  });

  test('shows error popup when API returns a server error (mocked 500)', async ({ page }) => {
    await page.route(WORKER_URL, route =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      })
    );

    await fillContactForm(page);
    await page.locator('input[type="submit"]').click();

    const popup = page.locator('.popup.error');
    await expect(popup).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('#popup-title')).toHaveText('Error');
  });
});
