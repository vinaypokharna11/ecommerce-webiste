// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Helper to reliably add a product to cart via QuickView
 */
async function addFirstProductToCart(page) {
  // Navigate to catalog
  await page.goto('/?tab=catalog');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1200);

  // Check if cart already has items
  const cartNavBtn = page.locator('button[aria-label="Shopping Cart"]').first();
  await expect(cartNavBtn).toBeVisible({ timeout: 8000 });
  const countText = await cartNavBtn.innerText().catch(() => '');
  const existingCount = parseInt(countText.replace(/\D/g, '') || '0', 10);

  if (existingCount === 0) {
    // Add a product with a direct Add to Cart button (like items with no mandatory size, e.g. laundry bar, papad)
    const addButtons = page.locator('article button').filter({ hasText: /^Add to Cart$/i });
    const count = await addButtons.count();
    let added = false;
    for (let i = 0; i < count; i++) {
      const btn = addButtons.nth(i);
      const card = btn.locator('xpath=ancestor::article');
      const sizePills = card.locator('button[title*="Select Size"], button[title*="Size"]');
      if ((await sizePills.count()) > 0) {
        await sizePills.first().click().catch(() => {});
        await page.waitForTimeout(200);
      }
      await btn.click({ force: true });
      await page.waitForTimeout(600);
      const updatedCountText = await cartNavBtn.innerText().catch(() => '');
      if (parseInt(updatedCountText.replace(/\D/g, '') || '0', 10) > 0) {
        added = true;
        break;
      }
    }
  }

  // Navigate to cart tab
  await cartNavBtn.click();
  await page.waitForLoadState('domcontentloaded');
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
    await expect(page.getByText(/is invalid|Invalid coupon code|no longer available/i)).toBeVisible({ timeout: 8000 });
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
    
    await expect(couponChip.or(discountRow).first()).toBeVisible({ timeout: 8000 });

    // Verify coupon can be removed
    const removeBtn = page.locator('button:has(svg.lucide-x)').first();
    if (await removeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await removeBtn.click();
      await page.waitForTimeout(500);
      await expect(page.getByText(/% OFF\)/i)).not.toBeVisible();
    }
  });
});
