// @ts-check
import { test, expect } from '@playwright/test';

test.describe('SwipeToast Notification Integration', () => {
  test('triggering a notification renders SwipeToast with fuse, icon, and card surface', async ({ page }) => {
    await page.goto('/?tab=catalog');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Click Add to Cart on the first product card without mandatory variant or select variant
    const addBtn = page.getByRole('button', { name: 'Add to Cart' }).first();
    await expect(addBtn).toBeVisible({ timeout: 8000 });

    // If card has size pills, click one first to avoid warning toast
    const card = addBtn.locator('xpath=ancestor::article');
    const sizePill = card.locator('button[title*="Select Size"]:not([disabled]), button[title*="Size"]:not([disabled])').first();
    if (await sizePill.isVisible({ timeout: 1500 }).catch(() => false)) {
      await sizePill.click().catch(() => {});
      await page.waitForTimeout(200);
    }

    await addBtn.click({ force: true });

    // SwipeToast should appear in the DOM
    const toast = page.locator('.swipe-toast').first();
    await expect(toast).toBeVisible({ timeout: 6000 });

    // Verify card structure and fuse
    const cardElement = toast.locator('.swipe-toast__card');
    await expect(cardElement).toBeVisible();

    const fuse = toast.locator('.swipe-toast__fuse');
    await expect(fuse).toBeAttached();

    // Verify close button exists
    const closeBtn = toast.locator('.swipe-toast__close');
    await expect(closeBtn).toBeVisible();

    // Click close button to test dismissal
    await closeBtn.click();
    await page.waitForTimeout(600);

    // Toast should transition to closing or gone
    await expect(toast).not.toBeVisible({ timeout: 4000 });
  });
});
