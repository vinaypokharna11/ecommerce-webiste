import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);

  const firstCard = page.locator('article').first();
  const text = await firstCard.innerText();
  console.log('Card text summary:\n', text.split('\n').slice(0, 5).join(' | '));

  const sizeButtons = await firstCard.locator('button[title*="Size"], button[title*="size"]').all();
  console.log('Size buttons found:', sizeButtons.length);
  for (const b of sizeButtons) {
    console.log(' -> Text:', await b.innerText(), '| Title:', await b.getAttribute('title'));
  }

  const sizeBtn = firstCard.locator('button[title^="Select Size"]').first();
  if (await sizeBtn.isVisible().catch(() => false)) {
    console.log('Clicking available size:', await sizeBtn.innerText(), await sizeBtn.getAttribute('title'));
    await sizeBtn.click({ force: true });
    console.log('Clicked in-stock size button');
  }

  const addBtn = firstCard.locator('button:has-text("Add to Cart")');
  console.log('Add to cart button visible:', await addBtn.isVisible());
  await addBtn.click({ force: true });
  await page.waitForTimeout(1000);

  const cartCounter = page.locator('button[aria-label="Shopping Cart"] span');
  console.log('Cart count after click:', await cartCounter.innerText());

  await browser.close();
}

run().catch(console.error);
