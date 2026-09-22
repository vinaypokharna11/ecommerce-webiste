// @ts-check
import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'vinaypokharna36@gmail.com';
const ADMIN_PASSWORD = 'vinay@3123';

async function loginAsAdmin(page) {
  await page.goto('/admin/login');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  await page.locator('input[type="email"]').first().fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').first().fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).first().click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  await expect(page).toHaveURL(/\/admin/);
}

test.use({ viewport: { width: 1440, height: 900 } });

test.describe('Real-Time Inventory & Stock Synchronization', () => {
  test('sidebar counts for Products Catalog and Inventory & Stock are synchronized', async ({ page }) => {
    await loginAsAdmin(page);

    // Verify sidebar navigation items
    const productsNav = page.locator('aside button').filter({ hasText: /Products Catalog/i }).first();
    const inventoryNav = page.locator('aside button').filter({ hasText: /Inventory & Stock/i }).first();

    await expect(productsNav).toBeVisible({ timeout: 10000 });
    await expect(inventoryNav).toBeVisible({ timeout: 10000 });

    // Extract badge numbers from both items
    const prodBadge = productsNav.locator('span[class*="rounded-full"]').first();
    const invBadge = inventoryNav.locator('span[class*="rounded-full"]').first();

    if (await prodBadge.isVisible() && await invBadge.isVisible()) {
      const prodCount = (await prodBadge.innerText()).trim();
      const invCount = (await invBadge.innerText()).trim();
      console.log(`Sidebar Counts -> Products: ${prodCount}, Inventory: ${invCount}`);
      expect(prodCount).toBe(invCount);
    }
  });

  test('navigating to Inventory & Stock Manager displays KPI metrics and controls', async ({ page }) => {
    await loginAsAdmin(page);

    const inventoryNav = page.locator('aside button').filter({ hasText: /Inventory & Stock/i }).first();
    await inventoryNav.click();
    await page.waitForTimeout(1500);

    // Check heading
    const heading = page.getByRole('heading', { name: /Inventory & Stock Manager/i }).first();
    await expect(heading).toBeVisible({ timeout: 8000 });

    // Check KPI cards
    await expect(page.getByText(/Products In Stock/i).first()).toBeVisible();
    await expect(page.getByText(/Low Stock Items/i).first()).toBeVisible();
    await expect(page.getByText(/Out of Stock/i).first()).toBeVisible();

    // Check quick restock button
    const restockBtn = page.getByRole('button', { name: /Restock All Low Items/i }).first();
    await expect(restockBtn).toBeVisible();
  });

  test('filtering inventory items by status tabs', async ({ page }) => {
    await loginAsAdmin(page);

    const inventoryNav = page.locator('aside button').filter({ hasText: /Inventory & Stock/i }).first();
    await inventoryNav.click();
    await page.waitForTimeout(1500);

    // Click All filter
    const allFilterBtn = page.locator('button').filter({ hasText: /^All \(/i }).first();
    if (await allFilterBtn.isVisible()) {
      await allFilterBtn.click();
      await page.waitForTimeout(400);
    }

    // Click Low filter
    const lowFilterBtn = page.locator('button').filter({ hasText: /^Low \(/i }).first();
    if (await lowFilterBtn.isVisible()) {
      await lowFilterBtn.click();
      await page.waitForTimeout(400);
    }

    // Click Out filter
    const outFilterBtn = page.locator('button').filter({ hasText: /^Out \(/i }).first();
    if (await outFilterBtn.isVisible()) {
      await outFilterBtn.click();
      await page.waitForTimeout(400);
    }
  });

  test('quick stock adjustment (+1) updates stock count immediately', async ({ page }) => {
    await loginAsAdmin(page);

    const inventoryNav = page.locator('aside button').filter({ hasText: /Inventory & Stock/i }).first();
    await inventoryNav.click();
    await page.waitForTimeout(1500);

    // Find first product row
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 8000 });

    // Locate the +1 button in the first row
    const plusBtn = firstRow.getByRole('button', { name: '+1', exact: true }).first();
    await expect(plusBtn).toBeVisible();

    // Read current stock text
    const stockCell = firstRow.locator('td').nth(3);
    const initialText = await stockCell.innerText();
    const initialUnits = parseInt(initialText, 10);

    // Click +1
    await plusBtn.click();
    await page.waitForTimeout(1000);

    // Stock should update to initialUnits + 1
    const updatedText = await stockCell.innerText();
    const updatedUnits = parseInt(updatedText, 10);
    console.log(`Stock adjusted from ${initialUnits} to ${updatedUnits}`);
    expect(updatedUnits).toBe(initialUnits + 1);

    // Wait for in-flight request to finish
    await page.waitForTimeout(2000);

    // Click -1 to restore initial stock
    const minusBtn = firstRow.getByRole('button', { name: '-1', exact: true }).first();
    await expect(minusBtn).toBeEnabled({ timeout: 5000 });
    await minusBtn.click();
    await page.waitForTimeout(1500);
  });
});
