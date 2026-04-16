import { Page } from '@playwright/test';

/** Scroll the contact section into view and wait for the deferred form to load. */
export async function scrollToContactForm(page: Page): Promise<void> {
  // Trigger deferred block by scrolling toward the bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.locator('form').waitFor({ state: 'visible', timeout: 15_000 });
}

/** Fill the contact form with valid data. */
export async function fillContactForm(
  page: Page,
  options: { name?: string; email?: string; message?: string } = {}
): Promise<void> {
  const {
    name = 'Test User',
    email = 'test@example.com',
    message = 'This is a test message with enough characters.',
  } = options;

  await page.locator('#name').fill(name);
  await page.locator('#email').fill(email);
  await page.locator('#message').fill(message);
  await page.locator('#data-privacy-checkbox').check();
}
