import { test, expect } from '@playwright/test';

test.describe('Wishlist & Cart User Isolation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    // Wait for brand loading animation to complete
    await page.waitForSelector('#navbar-brand-logo:not(.opacity-0)', { timeout: 10000 }).catch(() => {});
  });

  test('Guest wishlist flow: click heart opens login modal, closing modal reverts heart to unliked', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#navbar-brand-logo:not(.opacity-0)', { timeout: 10000 }).catch(() => {});

    // Locate the first wishlist heart button on a product card
    const firstHeartBtn = page.locator('button[aria-label="Save to wishlist"]').first();
    await expect(firstHeartBtn).toBeVisible({ timeout: 10000 });

    // Click the heart as guest
    await firstHeartBtn.click();

    // Verify AuthModal is opened with custom wishlist message
    const modalHeading = page.locator('text=Save to your Wishlist ❤️');
    await expect(modalHeading).toBeVisible({ timeout: 5000 });

    const modalSubtitle = page.locator('text=Please sign in or create an account to save products to your wishlist.').first();
    await expect(modalSubtitle).toBeVisible();

    // Close the modal via the exact close button
    const closeBtn = page.locator('button[aria-label="Close auth modal"]');
    await closeBtn.click();

    // Wait for modal to close
    await expect(modalHeading).not.toBeVisible({ timeout: 5000 });

    // Verify the product heart has reverted to unliked ("Save to wishlist")
    const revertedHeartBtn = page.locator('button[aria-label="Save to wishlist"]').first();
    await expect(revertedHeartBtn).toBeVisible();
    await expect(revertedHeartBtn).not.toHaveClass(/bg-rose-50/);
    await expect(revertedHeartBtn).toHaveAttribute('aria-label', 'Save to wishlist');
  });

  test('Guest wishlist flow: click heart -> sign up -> product remains liked in wishlist', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `wish_user_${timestamp}@test.com`;

    await page.goto('/');
    await page.waitForSelector('#navbar-brand-logo:not(.opacity-0)', { timeout: 10000 }).catch(() => {});

    // Click the heart as guest
    const firstHeartBtn = page.locator('button[aria-label="Save to wishlist"]').first();
    await expect(firstHeartBtn).toBeVisible({ timeout: 10000 });
    await firstHeartBtn.click();

    // Wait for modal
    await expect(page.locator('text=Save to your Wishlist ❤️')).toBeVisible();

    // Switch to Sign Up tab in AuthModal
    const signupTab = page.locator('div[class*="rounded-full"] button:has-text("Create Account")');
    await signupTab.click();

    // Fill signup form in AuthModal
    await page.fill('input[placeholder*="John Doe"]', 'Test Wishlist User');
    const emailInputs = page.locator('input[type="email"]');
    await emailInputs.last().fill(testEmail);
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.last().fill('Password@123');

    // Submit signup
    const submitBtn = page.locator('button[type="submit"]:has-text("Create Account & Continue")');
    await submitBtn.click();

    // Modal should close upon successful authentication
    await expect(page.locator('text=Save to your Wishlist ❤️')).not.toBeVisible({ timeout: 10000 });

    // The heart should remain selected/liked ("Remove from wishlist")
    const likedHeartBtn = page.locator('button[aria-label="Remove from wishlist"]').first();
    await expect(likedHeartBtn).toBeVisible({ timeout: 8000 });
  });

  test('User cart isolation: User A adds product -> logs out -> User B logs in -> sees empty cart', async ({ page }) => {
    const timestamp = Date.now();
    const userAEmail = `cart_a_${timestamp}@test.com`;
    const userBEmail = `cart_b_${timestamp}@test.com`;

    // 1. Sign up User A via /login?tab=signup
    await page.goto('/login?tab=signup');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);

    const signupTabA = page.locator('button', { hasText: 'New? Sign Up' }).first();
    await signupTabA.click();
    await expect(page.locator('input[placeholder*="Ramesh Kumar"]')).toBeVisible({ timeout: 8000 });

    await page.fill('input[placeholder*="Ramesh Kumar"]', 'Cart User A');
    await page.fill('input[type="email"]', userAEmail);
    await page.fill('input[type="password"]', 'Password@123');
    await page.click('button[type="submit"]:has-text("Create My Account")');

    await page.waitForURL((url) => url.pathname === '/' && !url.searchParams.has('tab'), { timeout: 12000 });
    await page.waitForSelector('#navbar-brand-logo:not(.opacity-0)', { timeout: 10000 }).catch(() => {});

    // Scroll first product card into view
    const firstCard = page.locator('article').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    await firstCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    // Click available in-stock size 'M' on the card
    const availableSizeBtn = firstCard.getByRole('button', { name: 'M', exact: true }).or(
      firstCard.locator('button:not([class*="cursor-not-allowed"])', { hasText: /^M$/ })
    ).first();
    await expect(availableSizeBtn).toBeVisible({ timeout: 5000 });
    await availableSizeBtn.click({ force: true });
    await page.waitForTimeout(300);

    // Add product to cart
    const addToCartBtn = firstCard.locator('button:has-text("Add to Cart")');
    await expect(addToCartBtn).toBeVisible({ timeout: 8000 });
    await addToCartBtn.click({ force: true });
    await page.waitForTimeout(500);

    // Scroll to top so navbar is fully in view
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    // Verify cart counter increased to 1
    const cartCounter = page.locator('button[aria-label="Shopping Cart"] span');
    await expect(cartCounter).toHaveText('1', { timeout: 8000 });

    // Logout User A via Profile tab
    await page.goto('/?tab=profile');
    const logoutBtn = page.locator('button:has-text("Sign Out of Account")').first();
    await expect(logoutBtn).toBeVisible({ timeout: 5000 });
    await logoutBtn.click();

    // Confirm sign out if confirmation appears
    const confirmLogout = page.locator('button:has-text("Yes, Sign Out")');
    if (await confirmLogout.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmLogout.click();
    }

    // Wait until logged out
    await page.waitForTimeout(1000);

    // Verify cart count is reset to 0
    await expect(cartCounter).toHaveText('0');

    // 2. Sign up User B via /login?tab=signup
    await page.goto('/login?tab=signup');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);

    const signupTabB = page.locator('button', { hasText: 'New? Sign Up' }).first();
    await signupTabB.click();
    await expect(page.locator('input[placeholder*="Ramesh Kumar"]')).toBeVisible({ timeout: 8000 });

    await page.fill('input[placeholder*="Ramesh Kumar"]', 'Cart User B');
    await page.fill('input[type="email"]', userBEmail);
    await page.fill('input[type="password"]', 'Password@123');
    await page.click('button[type="submit"]:has-text("Create My Account")');

    await page.waitForURL((url) => url.pathname === '/' && !url.searchParams.has('tab'), { timeout: 12000 });
    await page.waitForSelector('#navbar-brand-logo:not(.opacity-0)', { timeout: 10000 }).catch(() => {});

    // User B's cart counter must be strictly 0!
    await expect(cartCounter).toHaveText('0');

    // Navigate to cart tab and verify empty state
    await page.goto('/?tab=cart');
    await expect(page.locator('text=Your Cart is Empty').first()).toBeVisible({ timeout: 5000 });
  });
});
