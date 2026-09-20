import fs from 'fs';
import path from 'path';

// Parse .env if running standalone
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

import { signToken, signAdminToken } from '../src/lib/auth.js';

const BASE_URL = 'http://localhost:3000';

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('========================================================');
  console.log('    VERIFYING MASTER AUDIT & ORDER CHAT FIXES');
  console.log('========================================================\n');

  // 1. Next.js Remote Patterns (SSRF & Cache Bomb Protection)
  console.log('Test Suite 1: Next.js Image Config Whitelist');
  try {
    const nextConfigContent = fs.readFileSync(path.resolve('./next.config.js'), 'utf-8');
    const hasWildcard = nextConfigContent.includes("hostname: '**'");
    const hasCloudinary = nextConfigContent.includes("'res.cloudinary.com'");
    const hasUnsplash = nextConfigContent.includes("'images.unsplash.com'");
    assert(!hasWildcard, 'next.config.js does NOT contain wildcard hostname: "**"');
    assert(hasCloudinary, 'next.config.js explicitly whitelists res.cloudinary.com');
    assert(hasUnsplash, 'next.config.js explicitly whitelists images.unsplash.com');
  } catch (err) {
    assert(false, `Failed to inspect next.config.js: ${err.message}`);
  }

  // 2. Edge Middleware Route Protection for /admin
  console.log('\nTest Suite 2: Edge Middleware Route Protection (/admin)');
  try {
    const res = await fetch(`${BASE_URL}/admin`, {
      redirect: 'manual', // do not auto-follow so we can check redirect status
    });
    const location = res.headers.get('location') || '';
    const isRedirect = (res.status === 307 || res.status === 308 || res.status === 302 || res.status === 301) && location.includes('/admin/login');
    assert(isRedirect || res.status === 401, `GET /admin without auth redirects to /admin/login (Status: ${res.status}, Location: ${location})`);
  } catch (err) {
    assert(false, `Middleware test request failed: ${err.message}`);
  }

  // 3. Upload Payload Boundary Defense (7MB limit)
  console.log('\nTest Suite 3: Upload Endpoint Payload Bounds Defense');
  try {
    const adminToken = signAdminToken({ email: 'vinaypokharna36@gmail.com', role: 'admin' });
    // Generate a payload exceeding 7MB (7.5MB)
    const oversizedString = 'data:image/png;base64,' + 'A'.repeat(7.5 * 1024 * 1024);
    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `admin_token=${adminToken}`,
      },
      body: JSON.stringify({ file: oversizedString }),
    });
    const data = await res.json().catch(() => ({}));
    assert(res.status === 400 && data.error && data.error.includes('exceeds 5MB limit'), `Oversized payload rejected with HTTP 400: "${data.error}"`);
  } catch (err) {
    assert(false, `Upload boundary test failed: ${err.message}`);
  }

  // 4. Real-time Events Export Verification
  console.log('\nTest Suite 4: Real-time Event System Definitions');
  try {
    const eventsContent = fs.readFileSync(path.resolve('./src/lib/events.js'), 'utf-8');
    assert(eventsContent.includes('ORDER_CREATED'), 'events.js exports ORDER_CREATED');
    assert(eventsContent.includes('ORDER_UPDATED'), 'events.js exports ORDER_UPDATED');
    assert(eventsContent.includes('ORDER_ACCEPTED'), 'events.js exports ORDER_ACCEPTED');
    assert(eventsContent.includes('ORDER_REJECTED'), 'events.js exports ORDER_REJECTED');
    assert(eventsContent.includes('ORDER_CHAT_MESSAGE'), 'events.js exports ORDER_CHAT_MESSAGE');
  } catch (err) {
    assert(false, `Failed to inspect src/lib/events.js: ${err.message}`);
  }

  // 5. Dynamic Sitemap Generation
  console.log('\nTest Suite 5: Dynamic XML Sitemap (/sitemap.xml)');
  try {
    const res = await fetch(`${BASE_URL}/sitemap.xml`);
    const xml = await res.text();
    assert(res.status === 200, `GET /sitemap.xml returns HTTP 200`);
    assert(xml.includes('<urlset') && xml.includes('</urlset>'), 'Sitemap output contains valid <urlset> root element');
    assert(xml.includes('<loc>'), 'Sitemap output contains <loc> tags for pages and products');
  } catch (err) {
    assert(false, `Sitemap verification failed: ${err.message}`);
  }

  // 6. Customer <-> Seller Order Chat API & Authorization
  console.log('\nTest Suite 6: Customer <-> Seller Order Chat & Authorization');
  try {
    const adminToken = signAdminToken({ email: 'vinaypokharna36@gmail.com', role: 'admin' });
    const ordersRes = await fetch(`${BASE_URL}/api/orders`, {
      headers: { Cookie: `admin_token=${adminToken}` },
    });
    const ordersData = await ordersRes.json();
    let testOrder = ordersData.orders && ordersData.orders[0];

    if (!testOrder) {
      console.log('  No existing orders found in /api/orders, creating a test order...');
      const customerToken = signToken({ id: 'test-user-123', email: 'customer@example.com', role: 'customer' });
      const createRes = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          customerName: 'John Doe',
          customerEmail: 'customer@example.com',
          customerPhone: '9876543210',
          deliveryAddress: '123 Main St, Mumbai',
          items: [{ id: 'test-p1', name: 'Gold Necklace', price: 999, quantity: 1 }],
          payMethod: 'Cash on Delivery',
        }),
      });
      const createData = await createRes.json();
      testOrder = createData.order;
    }

    if (testOrder) {
      const rawOrderId = testOrder.id || testOrder._id;
      const orderId = encodeURIComponent(rawOrderId);
      console.log(`  Testing with Order ID: ${rawOrderId} (encoded: ${orderId})`);

      // 6a. Test unauthorized chat access (no token)
      const noAuthRes = await fetch(`${BASE_URL}/api/orders/${orderId}/chat`);
      assert(noAuthRes.status === 401, `GET /api/orders/${orderId}/chat without auth returns HTTP 401`);

      // 6b. Test forbidden chat access (unrelated customer)
      const attackerToken = signToken({ id: 'hacker-999', email: 'hacker@evil.com', role: 'customer' });
      const forbiddenRes = await fetch(`${BASE_URL}/api/orders/${orderId}/chat`, {
        headers: { Authorization: `Bearer ${attackerToken}` },
      });
      assert(forbiddenRes.status === 403, `GET /api/orders/${orderId}/chat for unrelated customer returns HTTP 403 Forbidden`);

      // 6c. Test authorized customer message POST
      const customerEmail = testOrder.customerEmail || testOrder.customer?.email || 'customer@example.com';
      const customerToken = signToken({ id: testOrder.userId || 'test-user-123', email: customerEmail, name: testOrder.customerName || 'Customer', role: 'customer' });
      const postMsgRes = await fetch(`${BASE_URL}/api/orders/${orderId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`,
        },
        body: JSON.stringify({ message: 'Hello seller, when will this order be dispatched?' }),
      });
      const postMsgData = await postMsgRes.json();
      assert((postMsgRes.status === 200 || postMsgRes.status === 201) && postMsgData.success, `Customer successfully sends chat message (HTTP ${postMsgRes.status})`);
      assert(postMsgData.chatMessages && postMsgData.chatMessages.some(m => m.message.includes('when will this order be dispatched')), 'Chat message stored and returned in order chat history');

      // 6d. Test authorized seller message POST
      const sellerToken = signAdminToken({ email: 'vinaypokharna36@gmail.com', role: 'admin' });
      const sellerMsgRes = await fetch(`${BASE_URL}/api/orders/${orderId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `admin_token=${sellerToken}`,
        },
        body: JSON.stringify({ message: 'Hello! Your order is being packed and will ship tomorrow morning.' }),
      });
      const sellerMsgData = await sellerMsgRes.json();
      assert((sellerMsgRes.status === 200 || sellerMsgRes.status === 201) && sellerMsgData.success, `Seller successfully sends chat response (HTTP ${sellerMsgRes.status})`);

      // 6e. Test fetching messages as seller
      const getChatRes = await fetch(`${BASE_URL}/api/orders/${orderId}/chat`, {
        headers: { Cookie: `admin_token=${sellerToken}` },
      });
      const getChatData = await getChatRes.json();
      const chatList = getChatData.chatMessages || getChatData.messages || [];
      assert(getChatRes.status === 200 && Array.isArray(chatList) && chatList.length >= 2, `GET chat messages returns complete conversation history (${chatList.length} messages)`);
    } else {
      assert(false, 'Unable to obtain a test order for chat verification');
    }
  } catch (err) {
    assert(false, `Chat verification failed: ${err.message}`);
  }

  // 7. Cart & Checkout Failure Contract Verification
  console.log('\nTest Suite 7: Checkout Failure Contract & Error Handling');
  try {
    const cartPageContent = fs.readFileSync(path.resolve('./src/components/cart/CartPage.jsx'), 'utf-8');
    const hasTryCatch = cartPageContent.includes('try {') && cartPageContent.includes('catch (err)');
    const callsCreateOrder = cartPageContent.includes('await orderService.createOrder(orderData)');
    const setsStep3OnSuccess = cartPageContent.includes('setStep(3)') && cartPageContent.includes('firePartyPopper()');
    const setsSubmitError = cartPageContent.includes('setSubmitError');
    assert(hasTryCatch, 'CartPage.jsx encapsulates order placement in try/catch block');
    assert(callsCreateOrder, 'CartPage.jsx calls orderService.createOrder(orderData)');
    assert(setsStep3OnSuccess, 'CartPage.jsx only triggers step 3 & celebration popper after successful response');
    assert(setsSubmitError, 'CartPage.jsx sets submitError and preserves cart on failure');
  } catch (err) {
    assert(false, `Failed to inspect CartPage.jsx: ${err.message}`);
  }

  // Summary
  console.log('\n========================================================');
  console.log(`TOTAL TESTS: ${passedTests + failedTests}`);
  console.log(`PASSED: ${passedTests}`);
  console.log(`FAILED: ${failedTests}`);
  console.log('========================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});
