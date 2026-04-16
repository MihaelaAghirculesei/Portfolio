/**
 * E2E Scenario 1: Contact Form — Validation
 *
 * Verifies that submitting the contact form with missing or invalid data
 * shows the correct inline validation error messages for each field.
 */
import { test, expect } from '@playwright/test';
import { scrollToContactForm } from './helpers';

test.describe('Contact Form — Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await scrollToContactForm(page);
  });

  test('shows name error for input shorter than 3 characters', async ({ page }) => {
    await page.locator('#name').fill('AB');
    await page.locator('#name').blur();

    await expect(page.locator('#name-error')).toBeVisible();
    await expect(page.locator('#name-error')).toHaveText('Please enter at least 3 letters');
  });

  test('shows email error for malformed email address', async ({ page }) => {
    await page.locator('#email').fill('not-an-email');
    await page.locator('#email').blur();

    await expect(page.locator('#email-error')).toBeVisible();
    await expect(page.locator('#email-error')).toHaveText('Your email appears to be invalid');
  });

  test('shows message error for text shorter than 10 characters', async ({ page }) => {
    await page.locator('#message').fill('Hi');
    await page.locator('#message').blur();

    await expect(page.locator('#message-error')).toBeVisible();
    await expect(page.locator('#message-error')).toHaveText('Please enter at least 10 characters');
  });

  test('submit button is disabled when form is invalid', async ({ page }) => {
    // Form is empty — button must be disabled
    const submitBtn = page.locator('input[type="submit"]');
    await expect(submitBtn).toBeDisabled();

    // Fill only name — still disabled
    await page.locator('#name').fill('Alice');
    await expect(submitBtn).toBeDisabled();
  });

  test('submit button becomes enabled only when all fields are valid', async ({ page }) => {
    const submitBtn = page.locator('input[type="submit"]');
    await expect(submitBtn).toBeDisabled();

    await page.locator('#name').fill('Alice');
    await page.locator('#email').fill('alice@example.com');
    await page.locator('#message').fill('Hello Mihaela, I would like to work with you.');
    await page.locator('#data-privacy-checkbox').check();

    await expect(submitBtn).toBeEnabled();
  });
});
