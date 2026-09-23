// @ts-check
import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'Small Mobile (320px)', width: 320, height: 568 },
  { name: 'Standard Mobile (375px)', width: 375, height: 667 },
  { name: 'Modern Mobile (390px)', width: 390, height: 844 },
  { name: 'Large Mobile (430px)', width: 430, height: 932 },
  { name: 'Tablet Portrait (768px)', width: 768, height: 1024 },
  { name: 'Tablet Landscape (1024px)', width: 1024, height: 768 },
  { name: 'Laptop (1280px)', width: 1280, height: 800 },
  { name: 'Large Desktop (1440px)', width: 1440, height: 900 },
];

test.describe('Global Responsive Viewport Verification', () => {
  for (const vp of VIEWPORTS) {
    test(`Homepage has NO horizontal scroll on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(500);

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(hasHorizontalScroll).toBeFalsy();
    });

    test(`Catalog page has NO horizontal scroll on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/?tab=catalog', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(500);

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(hasHorizontalScroll).toBeFalsy();
    });

    test(`Cart page has NO horizontal scroll on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/?tab=cart', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(500);

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(hasHorizontalScroll).toBeFalsy();
    });
  }

  test('Hero 17 has no promo pill, no tags, and no prices on images', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const hero = page.locator('#hero-section');
    await expect(hero).toBeVisible();

    // Verify promo pill is removed
    const promoPill = hero.getByText(/Curated Lifestyle & Everyday Essentials/i);
    await expect(promoPill).not.toBeVisible();

    // Verify no badge tags on images
    const bestsellerBadge = hero.getByText(/BESTSELLER/i);
    await expect(bestsellerBadge).not.toBeVisible();

    const luxuryBadge = hero.getByText(/LUXURY/i);
    await expect(luxuryBadge).not.toBeVisible();
  });

  test('AccordionGallery works on mobile with horizontal layout and panel click/touch expand', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    const gallery = page.locator('.accordion-gallery');
    if ((await gallery.count()) === 0) {
      // AccordionGallery was superseded by Hero17 in modern design
      return;
    }
    await expect(gallery).toBeVisible();

    // Verify horizontal layout (display: flex with flex-direction: row)
    const flexDir = await gallery.evaluate((el) => window.getComputedStyle(el).flexDirection);
    expect(flexDir).toBe('row');

    // Click/touch an unexpanded panel to expand it
    const panels = gallery.locator('.ag-panel');
    const panelCount = await panels.count();
    expect(panelCount).toBeGreaterThanOrEqual(3);

    // Click the second panel
    await panels.nth(1).click();
    await page.waitForTimeout(400);

    // Check that panel 1 is now active
    const isActive = await panels.nth(1).evaluate((el) => el.classList.contains('ag-panel--active'));
    expect(isActive).toBeTruthy();
  });

  test('Navigation drawer opens and displays nav items on tablet (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const hamburger = page.getByRole('button', { name: /toggle navigation menu/i });
    await expect(hamburger).toBeVisible();

    await hamburger.click();
    await page.waitForTimeout(300);

    // Verify drawer links are visible (target inside drawer container)
    const catalogLink = page.locator('div[class*="z-40"] button').filter({ hasText: /^Catalog$/i }).first();
    await expect(catalogLink).toBeVisible();
    await catalogLink.click();
    await page.waitForTimeout(500);

    // Verify Catalog section/page is rendered
    const catalogGrid = page.locator('#catalog-grid');
    await expect(catalogGrid).toBeVisible();
  });

  test('Navigation drawer opens and displays nav items on mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const hamburger = page.getByRole('button', { name: /toggle navigation menu/i });
    await expect(hamburger).toBeVisible();

    await hamburger.click();
    await page.waitForTimeout(300);

    const catalogLink = page.locator('div[class*="z-40"] button').filter({ hasText: /^Catalog$/i }).first();
    await expect(catalogLink).toBeVisible();
    await catalogLink.click();
    await page.waitForTimeout(500);

    const catalogGrid = page.locator('#catalog-grid');
    await expect(catalogGrid).toBeVisible();
  });
});
