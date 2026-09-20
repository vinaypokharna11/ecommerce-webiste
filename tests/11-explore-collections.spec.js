import { test, expect } from '@playwright/test';

test.describe('Explore Our Collections Clickable Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Set localStorage so brand loading screen transitions quickly or completes
    await page.addInitScript(() => {
      window.sessionStorage.setItem('has_loaded_brand', 'true');
    });
    await page.goto('http://localhost:3000');
    // Wait for the brand screen to dismiss if present
    const loadingScreen = page.locator('#brand-loading-screen');
    if (await loadingScreen.count() > 0) {
      await loadingScreen.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
    }
  });

  test('Categories section exists with 3D interactive collections sphere', async ({ page }) => {
    const categoriesSection = page.locator('#categories-section');
    await expect(categoriesSection).toBeVisible();

    const header = categoriesSection.locator('h2');
    await expect(header).toHaveText('Explore Our Collections');

    // Should render the InfiniteMenu container
    const infiniteMenu = categoriesSection.locator('canvas, .relative').first();
    await expect(infiniteMenu).toBeVisible();
  });
});
