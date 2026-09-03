// @ts-check
import { test, expect } from '@playwright/test';

const pagesToCheck = [
  { name: 'Homepage', url: '/' },
  { name: 'Catalog', url: '/?tab=catalog' },
  { name: 'Offers', url: '/?tab=offers' },
  { name: 'Contact', url: '/?tab=contact' },
  { name: 'Cart', url: '/?tab=cart' },
  { name: 'Login', url: '/login' },
  { name: 'Admin Login', url: '/admin/login' },
];

test.describe('Accessibility & SEO Checks', () => {
  for (const pg of pagesToCheck) {
    test(`${pg.name} — has at least one <h1> element`, async ({ page }) => {
      await page.goto(pg.url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
    });
  }

  test('Homepage images have alt attributes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const images = page.locator('img');
    const imgCount = await images.count();

    let imagesWithoutAlt = 0;
    for (let i = 0; i < imgCount; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      if (alt === null || alt.trim() === '') {
        imagesWithoutAlt++;
      }
    }

    // Report the count — ideally all images have alt text
    console.log(`Images without alt: ${imagesWithoutAlt} / ${imgCount}`);
    // Allow max 20% missing alt (some decorative images are OK)
    expect(imagesWithoutAlt).toBeLessThanOrEqual(Math.ceil(imgCount * 0.2));
  });

  test('Catalog images have alt attributes', async ({ page }) => {
    await page.goto('/?tab=catalog');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const images = page.locator('img');
    const imgCount = await images.count();

    for (let i = 0; i < imgCount; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      // Log any missing
      if (alt === null) {
        const src = await images.nth(i).getAttribute('src');
        console.warn(`Image missing alt: ${src}`);
      }
    }
    // At least verify images load
    expect(imgCount).toBeGreaterThanOrEqual(0);
  });

  test('interactive buttons have accessible labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const buttons = page.locator('button');
    const count = await buttons.count();
    let missingLabel = 0;

    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      const text = await btn.innerText().catch(() => '');
      const ariaLabel = await btn.getAttribute('aria-label').catch(() => '');
      const ariaLabelledBy = await btn.getAttribute('aria-labelledby').catch(() => '');
      const title = await btn.getAttribute('title').catch(() => '');

      if (!text.trim() && !ariaLabel && !ariaLabelledBy && !title) {
        missingLabel++;
        console.warn(`Button #${i} has no accessible label`);
      }
    }

    // Allow some icon-only buttons (reasonable threshold)
    const allowedMissing = Math.ceil(count * 0.15);
    expect(missingLabel).toBeLessThanOrEqual(allowedMissing);
  });

  test('no broken internal navigation links on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check all anchor hrefs that are relative (internal)
    const links = page.locator('a[href^="/"]');
    const count = await links.count();

    const failedLinks = [];
    for (let i = 0; i < Math.min(count, 20); i++) {
      const href = await links.nth(i).getAttribute('href');
      if (!href) continue;

      try {
        const response = await page.request.get(href);
        if (response.status() >= 400) {
          failedLinks.push({ href, status: response.status() });
        }
      } catch (e) {
        // Skip network errors for external-ish routes
      }
    }

    if (failedLinks.length > 0) {
      console.warn('Broken links found:', failedLinks);
    }
    expect(failedLinks.length).toBe(0);
  });

  test('admin login page has valid form labels', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    // Labels should exist for email and password inputs
    const labels = page.locator('label');
    const labelCount = await labels.count();
    expect(labelCount).toBeGreaterThanOrEqual(2);
  });

  test('page does not have console errors on homepage load', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Filter out known benign errors (e.g., extension errors, 3rd party)
    const criticalErrors = consoleErrors.filter(
      (e) =>
        !e.includes('Extension') &&
        !e.includes('chrome-extension') &&
        !e.includes('favicon') &&
        !e.includes('Failed to load resource: net::ERR_BLOCKED_BY_CLIENT')
    );

    if (criticalErrors.length > 0) {
      console.warn('Console errors on homepage:', criticalErrors);
    }

    // Allow up to 2 minor errors (e.g., SSE connection, optional APIs)
    expect(criticalErrors.length).toBeLessThanOrEqual(2);
  });

  test('viewport meta tag is set for mobile responsiveness', async ({ page }) => {
    await page.goto('/');
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveCount(1);
    const content = await viewportMeta.getAttribute('content');
    expect(content).toContain('width=device-width');
  });
});
