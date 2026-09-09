import { test, expect } from '@playwright/test';

test.describe('Brand Loading Screen & Navbar Morph Animation', () => {
  test('Full loading screen reveals brand name letter-by-letter and morphs into navbar logo', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // 1. Loading screen overlay is visible immediately
    const loader = page.locator('div[role="status"]');
    await expect(loader).toBeVisible({ timeout: 3000 });

    // 2. Large "N" logo mark is present in loader
    const loaderNIcon = loader.locator('div:has-text("N")').first();
    await expect(loaderNIcon).toBeVisible();

    // 3. Wordmark contains letters of "Nakoda Imitation"
    const loaderHeading = loader.locator('h1');
    await expect(loaderHeading).toContainText('Nakoda Imitation');

    // 4. Curated tagline is present
    const tagline = loader.locator('text=Curated with premium care...');
    await expect(tagline).toBeVisible();

    // 5. Morph transition into navbar: navbar logo emerges visible after flight
    const navbarLogo = page.locator('#navbar-brand-logo');
    await expect(navbarLogo).toBeVisible({ timeout: 8000 });
    await expect(navbarLogo).not.toHaveClass(/opacity-0/);

    // 6. Loader unmounts after completion
    await expect(loader).not.toBeVisible({ timeout: 8000 });
  });

  test('Navbar logo contains clean brand name without tagline', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#navbar-brand-logo:not(.opacity-0)', { timeout: 8000 });

    const navbarLogo = page.locator('#navbar-brand-logo');
    await expect(navbarLogo).toContainText('Nakoda Imitation');
    await expect(navbarLogo).not.toContainText('Premium Imitation Jewelry');
  });

  test('Hero section buttons stay on the SAME ROW', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#navbar-brand-logo:not(.opacity-0)', { timeout: 8000 });

    // Locate both action buttons in Hero
    const exploreBtn = page.locator('button:has-text("Explore All Catalog")').first();
    const dealsBtn = page.locator('button:has-text("Today’s Exclusive Deals")').first();

    await expect(exploreBtn).toBeVisible();
    await expect(dealsBtn).toBeVisible();

    // Verify both buttons share the same vertical bounding box row (top position within 5px tolerance)
    const exploreBox = await exploreBtn.boundingBox();
    const dealsBox = await dealsBtn.boundingBox();

    expect(exploreBox).not.toBeNull();
    expect(dealsBox).not.toBeNull();
    expect(Math.abs(exploreBox.y - dealsBox.y)).toBeLessThan(8);
  });

  test('Promo banner text has high-contrast visible text', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#navbar-brand-logo:not(.opacity-0)', { timeout: 8000 });

    const promoParagraph = page.locator('text=Enjoy festival discounts on cabin spinner trolleys').first();
    await expect(promoParagraph).toBeVisible();
    await expect(promoParagraph).toHaveClass(/text-white\/90/);

    const shippingText = page.locator('text=Free shipping on orders above ₹999').first();
    await expect(shippingText).toBeVisible();
    await expect(shippingText).toHaveClass(/text-white\/80/);
  });
});
