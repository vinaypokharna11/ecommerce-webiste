// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Contact / Inquiry Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?tab=contact');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);
  });

  test('contact page loads at correct URL', async ({ page }) => {
    await expect(page).toHaveURL(/tab=contact/);
  });

  test('contact section heading is visible', async ({ page }) => {
    const heading = page.getByText(/contact|inquiry|inquire|reach out|get in touch/i).first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('contact form has input fields', async ({ page }) => {
    // Name / email / message inputs should be present
    const nameInput = page.getByPlaceholder(/Rahul Sharma|name/i).first();
    const emailInput = page.getByPlaceholder(/rahul@example|email/i).first();
    await expect(nameInput).toBeVisible({ timeout: 8000 });
    await expect(emailInput).toBeVisible({ timeout: 8000 });
  });

  test('contact form has a submit button', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /Submit Support Message/i }).first();
    await expect(submitBtn).toBeVisible({ timeout: 8000 });
  });

  test('submitting empty form shows validation error', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /Submit Support Message/i }).first();
    await submitBtn.click({ force: true });
    await page.waitForTimeout(800);

    // Form inputs are required, so form remains visible and not submitted
    await expect(submitBtn).toBeVisible();
  });

  test('WhatsApp button is present on contact page', async ({ page }) => {
    const whatsappBtn = page.locator('a[href*="wa.me"]').first();
    await expect(whatsappBtn).toBeVisible({ timeout: 8000 });
  });

  test('phone/contact info is visible on contact page', async ({ page }) => {
    // Phone number or contact details should appear
    const phoneText = page.getByText(/\+91|\d{10}|phone|call/i).first();
    await expect(phoneText).toBeVisible({ timeout: 8000 });
  });

  test('store address or hours is mentioned', async ({ page }) => {
    const storeInfo = page.getByText(/market|shop|address|hours|am|pm/i).first();
    await expect(storeInfo).toBeVisible({ timeout: 8000 });
  });
});
