import fs from 'fs';
import path from 'path';

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
import connectToDatabase from '../src/lib/mongodb.js';
import { getOrders, createOrder, getProducts } from '../src/lib/db.js';

const BASE_URL = 'http://localhost:3000';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runDeepSecurityAudit() {
  console.log('================================================================');
  console.log('  AUTHORIZED SECURITY ASSESSMENT & DEEP AUDIT VERIFICATION');
  console.log('================================================================\n');

  await connectToDatabase();

  // 1. IDOR Defense: Order Search Query Isolation
  console.log('Test 1: IDOR Defense — Order Search Query Isolation in Database');
  try {
    const prods = await getProducts();
    const testProd = prods[0] || { id: 'p1', name: 'Ruby Ring', price: 500 };
    const prodId = testProd.id || testProd._id;

    // Create order for Alice
    const orderAlice = await createOrder({
      id: `#SE${Math.floor(1000 + Math.random() * 9000)}`,
      userId: 'alice-id-101',
      customerName: 'Alice Smith',
      customerEmail: 'alice@example.com',
      customerPhone: '9876543210',
      items: [{ id: prodId, name: testProd.name || 'Ruby Ring', price: testProd.price || 500, quantity: 1 }],
      amount: testProd.price || 500,
      deliveryAddress: 'Alice House, Mumbai',
    });

    // Create order for Bob
    const orderBob = await createOrder({
      id: `#SE${Math.floor(1000 + Math.random() * 9000)}`,
      userId: 'bob-id-202',
      customerName: 'Bob Jones',
      customerEmail: 'bob@example.com',
      customerPhone: '9123456780',
      items: [{ id: prodId, name: testProd.name || 'Emerald Pendant', price: testProd.price || 800, quantity: 1 }],
      amount: testProd.price || 800,
      deliveryAddress: 'Bob House, Delhi',
    });

    // Alice queries orders with search="Bob"
    const aliceOrders = await getOrders('alice-id-101', { search: 'Bob' });
    const containsBobOrder = aliceOrders.some(o => o.userId === 'bob-id-202' || o.customerName.includes('Bob'));
    assert(!containsBobOrder && aliceOrders.length === 0, 'Alice cannot access Bob\'s orders when searching for "Bob" (IDOR strictly blocked)');

    // Alice queries orders with search="Alice"
    const aliceSelfOrders = await getOrders('alice-id-101', { search: 'Alice' });
    assert(aliceSelfOrders.length >= 1 && aliceSelfOrders.every(o => o.userId === 'alice-id-101'), 'Alice can only search within her own order history');
  } catch (err) {
    assert(false, `IDOR test failed: ${err.message}`);
  }

  // 2. Authentication Bypass & Edge Middleware Hardening
  console.log('\nTest 2: Edge Middleware Route Gating & Malformed Token Rejection');
  try {
    // Case A: No cookie
    const resA = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' });
    assert(resA.status === 307 && resA.headers.get('location')?.includes('/admin/login'), 'Unauthenticated GET /admin redirected to /admin/login');

    // Case B: Malformed string cookie
    const resB = await fetch(`${BASE_URL}/admin`, {
      redirect: 'manual',
      headers: { Cookie: 'admin_token=malformed-junk-token' },
    });
    assert(resB.status === 307 && resB.headers.get('location')?.includes('/admin/login'), 'Malformed admin_token cookie redirected to /admin/login');

    // Case C: Customer role token passed as admin_token
    const customerToken = signToken({ id: 'c1', email: 'cust@test.com', role: 'customer' });
    const resC = await fetch(`${BASE_URL}/admin`, {
      redirect: 'manual',
      headers: { Cookie: `admin_token=${customerToken}` },
    });
    assert(resC.status === 307 && resC.headers.get('location')?.includes('/admin/login'), 'Customer JWT disguised as admin_token rejected at Edge');

    // Case D: Valid admin token
    const validAdminToken = signAdminToken({ email: 'admin@nakodastore.com', role: 'admin' });
    const resD = await fetch(`${BASE_URL}/admin`, {
      redirect: 'manual',
      headers: { Cookie: `admin_token=${validAdminToken}` },
    });
    const loc = resD.headers.get('location');
    assert(resD.status === 200 || resD.status === 304, `Valid admin JWT admitted to /admin (Got status: ${resD.status}, location: ${loc})`);
  } catch (err) {
    assert(false, `Middleware authentication test failed: ${err.message}`);
  }

  // 3. XSS Escaping in JSON-LD
  console.log('\nTest 3: Stored XSS Protection in JSON-LD Structured Data');
  try {
    const productPageContent = fs.readFileSync(path.resolve('./src/app/product/[id]/page.jsx'), 'utf-8');
    assert(productPageContent.includes('.replace(/</g, \'\\\\u003c\')') || productPageContent.includes(".replace(/</g, '\\u003c')"), 'JSON-LD structured data script escapes < to \\u003c to prevent script tag breakout');
  } catch (err) {
    assert(false, `JSON-LD test failed: ${err.message}`);
  }

  // 4. Sensitive Data Exposure: Password Hash Sanitization
  console.log('\nTest 4: Sensitive Data Sanitization (Passwords Never Returned)');
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`);
    const data = await res.json().catch(() => ({}));
    assert(data.passwordHash === undefined && data.password === undefined, 'Public / unauthenticated /api/auth/me does not disclose password fields');
  } catch (err) {
    assert(false, `Sensitive data test failed: ${err.message}`);
  }

  // 5. Cross-Seller Isolation on Order Chat & Actions
  console.log('\nTest 5: Cross-Seller Isolation on Order Endpoints');
  try {
    const prods = await getProducts();
    const testProd = prods[0] || { id: 'p1', name: 'Ruby Ring', price: 500 };
    const prodId = testProd.id || testProd._id;

    const sellerAToken = signAdminToken({ email: 'sellerA@nakodastore.com', role: 'seller', sellerId: 'seller_a' });
    const sellerBToken = signAdminToken({ email: 'sellerB@nakodastore.com', role: 'seller', sellerId: 'seller_b' });

    // Create an order belonging strictly to seller_a
    const orderA = await createOrder({
      id: `#SE${Math.floor(1000 + Math.random() * 9000)}`,
      userId: 'customer-1',
      customerName: 'Cust One',
      customerEmail: 'cust1@test.com',
      customerPhone: '9999999999',
      items: [{ id: prodId, name: testProd.name || 'Product A', price: testProd.price || 300, quantity: 1, sellerId: 'seller_a' }],
      amount: testProd.price || 300,
      sellerId: 'seller_a',
    });

    const encodedOrderId = encodeURIComponent(orderA.id);

    // Seller B attempts to read Seller A's order chat
    const resChat = await fetch(`${BASE_URL}/api/orders/${encodedOrderId}/chat`, {
      headers: { Cookie: `admin_token=${sellerBToken}` },
    });
    assert(resChat.status === 403, `Seller B blocked from reading Seller A order chat (HTTP 403)`);

    // Seller B attempts to accept Seller A's order
    const resAccept = await fetch(`${BASE_URL}/api/admin/orders/${encodedOrderId}/accept`, {
      method: 'POST',
      headers: { Cookie: `admin_token=${sellerBToken}` },
    });
    assert(resAccept.status === 403, `Seller B blocked from accepting Seller A order (HTTP 403)`);
  } catch (err) {
    assert(false, `Cross-seller isolation test failed: ${err.message}`);
  }

  // 6. Rate Limiting Protection (Brute-Force Attack Simulation)
  console.log('\nTest 6: Brute Force & Rate Limit Protection');
  try {
    const testEmail = `bruteforce_target_${Date.now()}@example.com`;
    const statuses = [];
    const simulatedIp = `198.51.100.${Math.floor(Math.random() * 200 + 10)}`;

    for (let i = 0; i < 7; i++) {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': simulatedIp,
        },
        body: JSON.stringify({ email: testEmail, password: 'wrong_password_123' }),
      });
      statuses.push(res.status);
    }
    const has429 = statuses.includes(429);
    assert(has429, `Rate limiter triggered HTTP 429 after repeated requests (Statuses: ${statuses.join(', ')})`);
  } catch (err) {
    assert(false, `Rate limiting test failed: ${err.message}`);
  }

  // 7. Cookie Security Attributes
  console.log('\nTest 7: Security Headers & Cookie Flags');
  try {
    const res = await fetch(`${BASE_URL}/api/settings`);
    const csp = res.headers.get('content-security-policy');
    const xcto = res.headers.get('x-content-type-options');
    const xfo = res.headers.get('x-frame-options');
    assert(xcto === 'nosniff', 'X-Content-Type-Options is nosniff');
    assert(xfo === 'DENY', 'X-Frame-Options is DENY');
    assert(csp && csp.includes("frame-ancestors 'none'"), 'Content-Security-Policy contains frame-ancestors none');
  } catch (err) {
    assert(false, `Security headers test failed: ${err.message}`);
  }

  console.log('\n================================================================');
  console.log(`TOTAL DEEP SECURITY CHECKS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

runDeepSecurityAudit().catch(err => {
  console.error('Fatal deep security test runner error:', err);
  process.exit(1);
});
