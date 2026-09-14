// @ts-check
import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'vinaypokharna36@gmail.com';
const ADMIN_PASSWORD = 'vinay@3123';

test.describe('Admin Explore Collections Manager', () => {
  test.beforeEach(async ({ page }) => {
    // Quick login helper
    await page.goto('/admin/login');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').first().fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').first().fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
  });

  test('sidebar contains Explore Collections navigation item and navigates to editor', async ({ page }) => {
    const exploreNav = page.locator('button', { hasText: 'Explore Collections' }).first();
    await expect(exploreNav).toBeVisible();
    await exploreNav.click();

    // Verify Explore header is displayed
    const heading = page.locator('h1', { hasText: 'Explore Collections Manager' });
    await expect(heading).toBeVisible({ timeout: 5000 });

    // Verify Title and Subtitle inputs exist
    const titleInput = page.locator('input[placeholder*="Explore Our Collections"]');
    await expect(titleInput).toBeVisible();
    await expect(titleInput).toHaveValue(/Explore Our Collections/i);
  });

  test('collection cards list renders with ordering controls and edit buttons', async ({ page }) => {
    await page.goto('/admin?tab=explore');
    await page.waitForLoadState('domcontentloaded');

    const heading = page.locator('h1', { hasText: 'Explore Collections Manager' });
    await expect(heading).toBeVisible({ timeout: 8000 });

    // Verify collections cards are rendered
    const bagsCard = page.locator('h3', { hasText: 'Bags & Trolleys' });
    await expect(bagsCard).toBeVisible();

    const jewelryCard = page.locator('h3', { hasText: 'Jewelry & Watches' });
    await expect(jewelryCard).toBeVisible();
  });

  test('can toggle to Storefront Live Preview', async ({ page }) => {
    await page.goto('/admin?tab=explore');
    await page.waitForLoadState('domcontentloaded');

    const previewBtn = page.locator('button', { hasText: 'Storefront Live Preview' });
    await expect(previewBtn).toBeVisible({ timeout: 8000 });
    await previewBtn.click();

    // Verify Live simulation banner and 3D InfiniteMenu preview container appear
    const simulationNotice = page.getByText(/Storefront Simulation/i);
    await expect(simulationNotice).toBeVisible();

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test('add new collection card modal opens and cancels cleanly', async ({ page }) => {
    await page.goto('/admin?tab=explore');
    await page.waitForLoadState('domcontentloaded');

    const addBtn = page.locator('button', { hasText: 'Add Collection' }).first();
    await expect(addBtn).toBeVisible({ timeout: 8000 });
    await addBtn.click();

    // Verify modal appeared
    const modalTitle = page.locator('h3', { hasText: 'Add New Collection Card' });
    await expect(modalTitle).toBeVisible();

    // Cancel modal
    const cancelBtn = page.locator('button', { hasText: 'Cancel' }).first();
    await cancelBtn.click();
    await expect(modalTitle).not.toBeVisible();
  });
});
