// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Offers Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?tab=offers');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1200);
  });

  test('offers page loads at correct URL', async ({ page }) => {
    await expect(page).toHaveURL(/tab=offers/);
  });

  test('offers section heading is visible', async ({ page }) => {
    const heading = page.getByText(/offers|deals|coupons|discount/i).first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('at least one offer card is visible', async ({ page }) => {
    // Offer cards show discount codes like ELEC20, FASH30 etc.
    const offerCode = page.getByText(/ELEC20|FASH30|HOME15|ACC25|FEET35|GIFT10/i).first();
    await expect(offerCode).toBeVisible({ timeout: 8000 });
  });

  test('offer cards show discount percentage', async ({ page }) => {
    const discountText = page.getByText(/\d+% off/i).first();
    await expect(discountText).toBeVisible({ timeout: 8000 });
  });

  test('offer cards show coupon codes', async ({ page }) => {
    // Look for coupon code patterns (all uppercase)
    const couponCode = page.getByText(/ELEC|FASH|HOME|ACC|FEET|GIFT/i).first();
    await expect(couponCode).toBeVisible({ timeout: 8000 });
  });

  test('offer cards show category label', async ({ page }) => {
    const categoryLabel = page.getByText(/electronics|clothing|footwear|accessories|home/i).first();
    await expect(categoryLabel).toBeVisible({ timeout: 8000 });
  });

  test('multiple offers are displayed', async ({ page }) => {
    const offerCards = page.getByText(/% off/i).all();
    const cards = await offerCards;
    expect(cards.length).toBeGreaterThan(1);
  });
});
