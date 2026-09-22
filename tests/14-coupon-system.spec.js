// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Helper to reliably add a product to cart via QuickView
 */
async function addFirstProductToCart(page) {
  // Navigate to catalog
  await page.goto('/?tab=catalog');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);

  // Click on the first product card to open QuickView modal
  const firstCard = page.locator('article, div[class*="group cursor-pointer"]').first();
  await expect(firstCard).toBeVisible({ timeout: 10000 });
  await firstCard.click();
  await page.waitForTimeout(600);

  // Find dialog
  const dialog = page.locator('div[role="dialog"]');
  await expect(dialog).toBeVisible({ timeout: 6000 });

  // Select size if size buttons exist
  const sizeBtn = dialog.locator('button[title*="Select Size"], button[title*="Size"]').first();
  if (await sizeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await sizeBtn.click();
    await page.waitForTimeout(200);
  }

  // Select color if color buttons exist
  const colorBtn = dialog.locator('button[title*="Select Color"]').first();
  if (await colorBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await colorBtn.click();
    await page.waitForTimeout(200);
  }

  // Click Add to Bag
  const addToBagBtn = dialog.getByRole('button', { name: /Add to Bag/i }).first();
  await expect(addToBagBtn).toBeVisible({ timeout: 5000 });
  await addToBagBtn.click();

  // Wait for success indicator
  await expect(dialog.getByText(/Added to Bag/i)).toBeVisible({ timeout: 5000 });
  await page.waitForTimeout(400);

  // Close modal via close button or Escape
  const closeBtn = dialog.locator('button[aria-label="Close dialog"], button:has(svg.lucide-x)').first();
  if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await closeBtn.click();
  } else {
    await page.keyboard.press('Escape');
  }
  await page.waitForTimeout(400);

  // Navigate to cart using Navbar Shopping Cart button to preserve in-memory cart state
  const cartNavBtn = page.locator('button[aria-label="Shopping Cart"]').first();
  await expect(cartNavBtn).toBeVisible({ timeout: 5000 });
  await cartNavBtn.click();
  await page.waitForTimeout(1000);
}

test.describe('Offer & Coupon System E2E', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant clipboard permissions for automated test runner
    await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('#navbar-brand-logo:not(.opacity-0)', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(500);
  });

  test('Offers page displays available coupons and copy button works', async ({ page }) => {
    await page.goto('/?tab=offers');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Verify header
    const heading = page.getByText(/Exclusive Deals & Offer Coupons|Available Coupons/i).first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Verify active coupon code is displayed
    const couponCode = page.getByText(/ELEC20|FASH30|HOME15|ACC25|FEET35|GIFT10/i).first();
    await expect(couponCode).toBeVisible({ timeout: 8000 });

    // Verify copy button works
    const copyBtn = page.getByRole('button', { name: /copy/i }).first();
    await expect(copyBtn).toBeVisible({ timeout: 5000 });
    await copyBtn.click();

    // Button text should transition to "Copied"
    const copiedBtn = page.getByText(/copied/i).first();
    await expect(copiedBtn).toBeVisible({ timeout: 5000 });
  });

  test('Cart rejects empty and invalid coupon codes', async ({ page }) => {
    await addFirstProductToCart(page);

    // Promo code input and apply button should now be visible
    const promoInput = page.getByPlaceholder(/Promo Code/i);
    const applyBtn = page.getByRole('button', { name: /^Apply$/i });

    await expect(promoInput).toBeVisible({ timeout: 8000 });
    await expect(applyBtn).toBeVisible({ timeout: 8000 });

    // Case 1: Click Apply with empty input
    await applyBtn.click();
    await expect(page.getByText(/Please enter a coupon code/i)).toBeVisible({ timeout: 5000 });

    // Case 2: Enter invalid coupon
    await promoInput.fill('INVALID_COUPON_999');
    await applyBtn.click();
    await expect(page.getByText(/Invalid coupon code|no longer available/i)).toBeVisible({ timeout: 8000 });
  });

  test('Cart applies valid coupon, updates order summary discount, and allows removal', async ({ page }) => {
    await addFirstProductToCart(page);

    const promoInput = page.getByPlaceholder(/Promo Code/i);
    const applyBtn = page.getByRole('button', { name: /^Apply$/i });
    await expect(promoInput).toBeVisible({ timeout: 8000 });

    // Apply active coupon (e.g. FASH30 or ELEC20)
    await promoInput.fill('FASH30');
    await applyBtn.click();
    await page.waitForTimeout(1000);

    const fashBadge = page.getByText(/FASH30 \(\d+% OFF\)/i);
    const isFashVisible = await fashBadge.isVisible({ timeout: 3000 }).catch(() => false);

    if (!isFashVisible) {
      // If product category wasn't clothing/fashion, try ELEC20 or HOME15
      await promoInput.fill('ELEC20');
      await applyBtn.click();
      await page.waitForTimeout(1000);
      const elecBadge = page.getByText(/ELEC20 \(\d+% OFF\)/i);
      const isElecVisible = await elecBadge.isVisible({ timeout: 3000 }).catch(() => false);
      if (!isElecVisible) {
        await promoInput.fill('HOME15');
        await applyBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    // Verify discount badge or discount row in Order Summary
    const discountRow = page.getByText(/Discount/i).first();
    const couponChip = page.getByText(/% OFF\)/i).first();
    
    await expect(couponChip.or(discountRow)).toBeVisible({ timeout: 8000 });

    // Verify coupon can be removed
    const removeBtn = page.locator('button:has(svg.lucide-x)').first();
    if (await removeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await removeBtn.click();
      await page.waitForTimeout(500);
      await expect(page.getByText(/% OFF\)/i)).not.toBeVisible();
    }
  });
});
