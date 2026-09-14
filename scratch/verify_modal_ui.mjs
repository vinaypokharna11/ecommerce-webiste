import { chromium } from 'playwright';

async function verify() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Set sessionStorage to bypass splash
  await page.addInitScript(() => {
    window.sessionStorage.setItem('has_loaded_brand', 'true');
  });

  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Wait for brand loading screen if any
  const loading = page.locator('#brand-loading-screen');
  if (await loading.count() > 0) {
    await loading.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
  }

  // Find a product card with quick view or click first card
  const productCard = page.locator('article.group').first();
  await productCard.waitFor({ state: 'visible', timeout: 8000 });
  await productCard.click();

  // Wait for quick view modal dialog to be visible
  const modal = page.locator('.product-quickview-modal');
  await modal.waitFor({ state: 'visible', timeout: 8000 });

  // Take screenshot of the open modal
  await page.screenshot({ path: 'C:/Users/visha/.gemini/antigravity-ide/brain/c9927e00-cbee-4997-9440-16df404d7552/modal_fixed_layout.png' });
  console.log('Screenshot saved to modal_fixed_layout.png');

  await browser.close();
}

verify().catch(console.error);
