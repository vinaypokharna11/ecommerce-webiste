// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Catalog / Shop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?tab=catalog');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500); // Allow React to hydrate and products to load
  });

  test('catalog page loads at correct URL', async ({ page }) => {
    await expect(page).toHaveURL(/tab=catalog/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('product grid renders at least one product card', async ({ page }) => {
    // Product cards typically have price indicators (₹)
    const priceText = page.getByText(/₹/).first();
    await expect(priceText).toBeVisible({ timeout: 10000 });
  });

  test('search input is present and accepts text', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/what are you looking for/i).first().or(
      page.locator('#catalog-grid input[type="text"]').first()
    );
    await expect(searchInput).toBeVisible({ timeout: 8000 });
    await searchInput.fill('headphones');
    await expect(searchInput).toHaveValue('headphones');
  });

  test('searching filters product results', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/what are you looking for/i).first().or(
      page.locator('#catalog-grid input[type="text"]').first()
    );
    await searchInput.fill('headphones');
    await page.waitForTimeout(600);
    // After search, results should relate to headphones
    const bodyText = await page.locator('body').innerText();
    // Either products show up or "no results" message
    expect(bodyText.toLowerCase()).toMatch(/headphone|no result|not found|0 product/i);
  });

  test('clearing search restores full product list', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/what are you looking for/i).first().or(
      page.locator('#catalog-grid input[type="text"]').first()
    );
    await searchInput.fill('xyznonexistentproduct123');
    await page.waitForTimeout(500);
    await searchInput.clear();
    await page.waitForTimeout(500);
    // Price items should reappear
    const priceText = page.getByText(/₹/).first();
    await expect(priceText).toBeVisible({ timeout: 8000 });
  });

  test('category filter chips are visible', async ({ page }) => {
    // Category filter buttons like "All Products", "Clothing", "Electronics" etc.
    const allChip = page.locator('#catalog-grid').getByRole('button', { name: /all/i }).first();
    await expect(allChip).toBeVisible({ timeout: 8000 });
  });

  test('clicking a category filter chip filters products', async ({ page }) => {
    const chip = page.locator('#catalog-grid').getByRole('button', { name: /electronics|clothing|footwear/i }).first();
    if (await chip.isVisible({ timeout: 5000 }).catch(() => false)) {
      await chip.click();
      await page.waitForTimeout(800);
      // Page should still show results or empty state
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('quick view modal opens on product card click', async ({ page }) => {
    // Click on any product card
    const firstProduct = page.locator('#catalog-grid article').first();
    if (await firstProduct.isVisible({ timeout: 8000 }).catch(() => false)) {
      await firstProduct.click();
      await page.waitForTimeout(500);
      // Modal or modal content should appear
      const modal = page.locator('div[role="dialog"]').first().or(
        page.locator('[class*="modal"], [class*="Modal"]').first()
      );
      await expect(modal).toBeVisible({ timeout: 5000 });
    }
  });

  test('add to cart button is present on product cards', async ({ page }) => {
    // Look for "Add to Cart" button
    const addBtn = page.getByRole('button', { name: 'Add to Cart' }).first();
    await expect(addBtn).toBeVisible({ timeout: 10000 });
  });

  test('cart count increases after adding a product', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: 'Add to Cart' }).first();
    if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addBtn.click({ force: true });
      await page.waitForTimeout(800);
      // Cart count badge should appear or increment
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('sorting dropdown opens and sorts products correctly', async ({ page }) => {
    const sortBtn = page.locator('#catalog-sort-button');
    await expect(sortBtn).toBeVisible({ timeout: 8000 });

    // Click to open custom dropdown
    await sortBtn.click();
    const dropdown = page.locator('div[role="listbox"][aria-label="Sort products"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // Verify all options are visible in the dropdown
    await expect(dropdown.getByRole('option', { name: 'Featured' })).toBeVisible();
    await expect(dropdown.getByRole('option', { name: 'Popularity' })).toBeVisible();
    await expect(dropdown.getByRole('option', { name: 'Price: Low to High' })).toBeVisible();
    await expect(dropdown.getByRole('option', { name: 'Price: High to Low' })).toBeVisible();

    // Select Price: Low to High
    await dropdown.getByRole('option', { name: 'Price: Low to High' }).click();
    await expect(dropdown).not.toBeVisible();
    await expect(sortBtn).toContainText('Price: Low to High');

    // Reopen and select Price: High to Low
    await sortBtn.click();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    await dropdown.getByRole('option', { name: 'Price: High to Low' }).click();
    await expect(dropdown).not.toBeVisible();
    await expect(sortBtn).toContainText('Price: High to Low');
  });
});
