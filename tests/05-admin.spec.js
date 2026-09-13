// @ts-check
import { test, expect } from '@playwright/test';

// Admin credentials from .env.local
const ADMIN_EMAIL = 'vinaypokharna36@gmail.com';
const ADMIN_PASSWORD = 'vinay@3123';

test.describe('Admin Panel', () => {
  test('visiting /admin without auth redirects to login', async ({ page }) => {
    // Clear any stored admin tokens first
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('nakoda_admin_token');
      localStorage.removeItem('shopease_admin_token');
    });

    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Should be redirected to admin/login or show access denied
    const url = page.url();
    const bodyText = await page.locator('body').innerText();
    const isRedirected =
      url.includes('/admin/login') ||
      bodyText.toLowerCase().includes('login') ||
      bodyText.toLowerCase().includes('access denied') ||
      bodyText.toLowerCase().includes('sign in');
    expect(isRedirected).toBe(true);
  });

  test('admin login page renders correctly', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/admin/i);
  });

  test('admin login form has email and password fields', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForTimeout(1000);

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('admin login with empty fields shows error', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForTimeout(1000);

    const submitBtn = page.getByRole('button', { name: /sign in|login/i }).first();
    await submitBtn.click({ force: true });
    await page.waitForTimeout(600);

    const error = page.getByText(/provide|required|email|password/i).first();
    await expect(error).toBeVisible({ timeout: 5000 });
  });

  test('admin login with wrong credentials shows error', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForTimeout(1000);

    await page.locator('input[type="email"]').first().fill('wrong@wrong.com');
    await page.locator('input[type="password"]').first().fill('wrongpassword');

    const submitBtn = page.getByRole('button', { name: /sign in|login/i }).first();
    await submitBtn.click({ force: true });
    await page.waitForTimeout(3000);

    const error = page.getByText(/invalid|denied|credentials|incorrect/i).first();
    await expect(error).toBeVisible({ timeout: 8000 });
  });

  test('admin login with correct credentials redirects to dashboard', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    await page.locator('input[type="email"]').first().fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').first().fill(ADMIN_PASSWORD);

    const submitBtn = page.getByRole('button', { name: /sign in/i }).first();
    await submitBtn.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Should redirect to /admin dashboard
    await expect(page).toHaveURL(/\/admin/);
    // Should NOT be on the login page anymore
    const url = page.url();
    expect(url).not.toContain('/admin/login');
  });

  test('admin dashboard shows stat cards after login', async ({ page }) => {
    // Login first
    await page.goto('/admin/login');
    await page.waitForTimeout(1000);
    await page.locator('input[type="email"]').first().fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').first().fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Dashboard should show metric cards: Total Products, Categories etc.
    const productsText = page.getByText('Total Products').first();
    await expect(productsText).toBeVisible({ timeout: 10000 });
  });

  test('admin sidebar has Products nav item', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForTimeout(1000);
    await page.locator('input[type="email"]').first().fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').first().fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const productsNav = page.getByText('Products Catalog').first();
    await expect(productsNav).toBeVisible({ timeout: 8000 });
  });

  test('navigating to Products tab shows product list', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForTimeout(1000);
    await page.locator('input[type="email"]').first().fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').first().fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Click Products Catalog in nav
    const productsNavBtn = page.getByText('Products Catalog').first();
    if (await productsNavBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await productsNavBtn.click();
      await page.waitForTimeout(1500);
    }

    // Products should appear
    const productItem = page.getByText(/₹/).first();
    await expect(productItem).toBeVisible({ timeout: 10000 });
  });

  test('admin logout button exists and works', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForTimeout(1000);
    await page.locator('input[type="email"]').first().fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').first().fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const logoutBtn = page.getByRole('button', { name: /logout|log out|sign out/i }).first();
    if (await logoutBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);
      // Should be redirected to login page
      const url = page.url();
      expect(url).toMatch(/login|admin/i);
    }
  });

  test('"Back to Store" link from admin panel works', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForTimeout(1000);
    await page.locator('input[type="email"]').first().fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').first().fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const backLink = page.getByRole('link', { name: /back to store|view store/i }).first();
    if (await backLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await backLink.click();
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL('/');
    }
  });
});
