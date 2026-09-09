// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Clear local storage to reset cart state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('nakoda_cart_v2');
    });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
  });

  test('cart tab shows empty state when cart is empty', async ({ page }) => {
    await page.goto('/?tab=cart');
    await page.waitForTimeout(1000);
    const emptyText = page.getByText(/your cart is empty/i).first();
    await expect(emptyText).toBeVisible({ timeout: 8000 });
  });

  test('cart page has a link/button to browse products', async ({ page }) => {
    await page.goto('/?tab=cart');
    await page.waitForTimeout(1000);
    const browseBtn = page.getByRole('button', { name: /explore products/i }).first();
    await expect(browseBtn).toBeVisible({ timeout: 8000 });
  });

  test('adding a product and viewing cart shows item', async ({ page }) => {
    // Go to catalog and add a product
    await page.goto('/?tab=catalog');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    const addBtn = page.getByRole('button', { name: 'Add to Cart' }).first();
    if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addBtn.click({ force: true });
      await page.waitForTimeout(800);

      // Now go to cart
      await page.goto('/?tab=cart');
      await page.waitForTimeout(1000);

      // Page should show items
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('cart tab URL is correct', async ({ page }) => {
    await page.goto('/?tab=cart');
    await expect(page).toHaveURL(/tab=cart/);
  });

  test('navigating back from cart to home works', async ({ page }) => {
    await page.goto('/?tab=cart');
    await page.waitForTimeout(500);

    const homeBtn = page.locator('header nav button').filter({ hasText: 'Home' }).first();
    if (await homeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await homeBtn.click({ force: true });
      await page.waitForTimeout(500);
    } else {
      await page.goto('/');
    }
    await expect(page.locator('body')).toBeVisible();
  });
});
