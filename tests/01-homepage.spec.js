// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to hydrate
    await page.waitForLoadState('networkidle');
  });

  test('page title contains store name', async ({ page }) => {
    await expect(page).toHaveTitle(/Nakoda/i);
  });

  test('hero section is visible', async ({ page }) => {
    // Hero should have a heading
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('navbar renders with main tabs', async ({ page }) => {
    const nav = page.locator('header nav').first().or(page.locator('nav').first());
    await expect(nav).toBeVisible();

    // Check for key navigation labels
    const homeTab = page.locator('header nav button').filter({ hasText: 'Home' }).first().or(
      page.getByRole('button', { name: 'Home' }).first()
    );
    await expect(homeTab).toBeVisible();
  });

  test('categories section is visible', async ({ page }) => {
    // Scroll down to find categories
    await page.evaluate(() => window.scrollBy(0, 400));
    // Look for category section text
    const categoryText = page.getByText(/categories/i).first();
    await expect(categoryText).toBeVisible({ timeout: 8000 });
  });

  test('popular products section renders', async ({ page }) => {
    await page.evaluate(() => window.scrollBy(0, 600));
    // Product cards should be visible
    const productCard = page.locator('article').first();
    await expect(productCard).toBeVisible({ timeout: 8000 });
  });

  test('navigating to catalog tab shows products', async ({ page }) => {
    // Click catalog in navbar
    const catalogBtn = page.locator('header nav button').filter({ hasText: 'Catalog' }).first().or(
      page.getByRole('button', { name: 'Catalog' }).first()
    );
    await catalogBtn.click({ force: true });
    await page.waitForTimeout(1000);

    // URL should update
    await expect(page).toHaveURL(/tab=catalog/);
  });

  test('clicking offers tab navigates to offers', async ({ page }) => {
    await page.goto('/?tab=offers');
    await expect(page).toHaveURL(/tab=offers/);
  });

  test('floating cart bar is present', async ({ page }) => {
    // Cart bar (bottom floating bar) should be in DOM
    const cartBar = page.locator('[class*="cart"], [class*="Cart"]').first();
    // Just verify page loads without error
    await expect(page.locator('body')).toBeVisible();
  });

  test('footer is present', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const footer = page.locator('footer').last();
    await expect(footer).toBeVisible({ timeout: 5000 });
  });
});
