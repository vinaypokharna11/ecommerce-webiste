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

  test('Categories section exists with interactive collection cards', async ({ page }) => {
    const categoriesSection = page.locator('#categories-section');
    await expect(categoriesSection).toBeVisible();

    const header = categoriesSection.locator('h2');
    await expect(header).toHaveText('Explore Our Collections');

    // Should have multiple category cards
    const cards = categoriesSection.locator('[role="button"]');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('Clicking "Bags & Trolleys" card navigates to catalog filtered by bags-luggage', async ({ page }) => {
    const bagsCard = page.locator('#categories-section [role="button"]', { hasText: 'Bags & Trolleys' });
    await expect(bagsCard).toBeVisible();
    await bagsCard.click();

    // Verify URL updated to catalog with category
    await expect(page).toHaveURL(/tab=catalog/);
    await expect(page).toHaveURL(/category=bags-luggage/);

    // Verify catalog page is displayed
    const catalogGrid = page.locator('#catalog-grid');
    await expect(catalogGrid).toBeVisible();
  });

  test('Clicking "Jewelry & Watches" card navigates to catalog filtered by jewelry', async ({ page }) => {
    const jewelryCard = page.locator('#categories-section [role="button"]', { hasText: 'Jewelry & Watches' });
    await expect(jewelryCard).toBeVisible();
    await jewelryCard.click();

    await expect(page).toHaveURL(/tab=catalog/);
    await expect(page).toHaveURL(/category=jewelry/);
  });


  test('Keyboard navigation (Enter key) on collection card opens catalog', async ({ page }) => {
    const papadCard = page.locator('#categories-section [role="button"]', { hasText: 'Papad & Gourmet' });
    await expect(papadCard).toBeVisible();
    await papadCard.focus();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/tab=catalog/);
    await expect(page).toHaveURL(/category=food-grocery/);
  });
});
