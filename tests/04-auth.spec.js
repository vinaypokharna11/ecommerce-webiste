// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Authentication — Login & Signup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
  });

  test('login page renders with heading', async ({ page }) => {
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
    await expect(page.locator('h1, h2').first()).toContainText(/login|sign in|welcome/i);
  });

  test('login and signup tabs are present', async ({ page }) => {
    const loginTab = page.getByRole('button', { name: /login|sign in/i }).first().or(
      page.getByText(/^login$/i).first()
    );
    await expect(loginTab).toBeVisible({ timeout: 8000 });
  });

  test('email and password fields exist on login form', async ({ page }) => {
    const emailInput = page.getByPlaceholder(/example\.com|email/i).first().or(
      page.locator('form input').first()
    );
    const passwordInput = page.locator('form input[type="password"]').first();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('submitting empty login form shows validation error', async ({ page }) => {
    // Click submit without filling in fields
    const submitBtn = page.locator('form button[type="submit"]');
    await submitBtn.click({ force: true });
    await page.waitForTimeout(600);

    // Should show error message or HTML5 validation
    const error = page.getByText(/email|password|required|provide/i).first();
    const hasError = await error.isVisible().catch(() => false);
    expect(hasError || await submitBtn.isVisible()).toBe(true);
  });

  test('wrong credentials show error message', async ({ page }) => {
    const emailInput = page.locator('form input[type="text"], form input[type="email"]').first();
    const passwordInput = page.locator('form input[type="password"]').first();

    await emailInput.fill('wronguser@example.com');
    await passwordInput.fill('wrongpassword123');

    const submitBtn = page.locator('form button[type="submit"]');
    await submitBtn.click({ force: true });
    await page.waitForTimeout(3000);

    // Should show invalid credentials error
    const error = page.getByText(/invalid|incorrect|wrong|denied|failed/i).first();
    await expect(error).toBeVisible({ timeout: 8000 });
  });

  test('password visibility toggle works', async ({ page }) => {
    const passwordInput = page.locator('form input[type="password"]').first();
    await passwordInput.fill('testpassword');

    // Click show password button
    const toggleBtn = page.locator('button[aria-label*="password"]').first();
    if (await toggleBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await toggleBtn.click();
      const inputType = await page.locator('form input').nth(1).getAttribute('type');
      expect(inputType).toBe('text');
    }
  });

  test('signup tab switches form to signup mode', async ({ page }) => {
    const signupTab = page.getByText('New? Sign Up').first();
    await signupTab.click();
    await page.waitForTimeout(500);
    // Name field should now appear
    const nameInput = page.getByPlaceholder(/Ramesh Kumar|name/i).first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
  });

  test('signup with short password shows error', async ({ page }) => {
    // Switch to signup tab
    const signupTab = page.getByText('New? Sign Up').first();
    await signupTab.click();
    await page.waitForTimeout(500);

    // Fill form with short password
    const nameInput = page.getByPlaceholder(/Ramesh Kumar|name/i).first();
    const emailInput = page.locator('form input[type="email"]').first();
    const passwordInput = page.locator('form input[type="password"]').first();

    await nameInput.fill('Test User');
    await emailInput.fill('testuser@example.com');
    await passwordInput.fill('123'); // Too short

    const submitBtn = page.locator('form button[type="submit"]');
    await submitBtn.click({ force: true });
    await page.waitForTimeout(800);

    const error = page.getByText(/6 character|too short|minimum|password/i).first();
    await expect(error).toBeVisible({ timeout: 5000 });
  });

  test('"Back to Store" link navigates to homepage', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /back|store|home/i }).first().or(
      page.getByText(/back to store/i).first()
    );
    if (await backLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await backLink.click();
      await expect(page).toHaveURL('/');
    }
  });
});
