/**
 * Automated Security Validation Script
 * Tests and verifies all implemented security fixes programmatically against the running server.
 */

const BASE_URL = 'http://localhost:3000';

async function runSecurityTests() {
  console.log('🚀 Starting Programmatic Security Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ── TEST 1: Unauthenticated Upload Rejection (POST /api/upload) ──
  console.log('🔍 Test 1: Upload Route Protection (POST /api/upload)');
  try {
    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' }),
    });
    assert(res.status === 401, `Unauthenticated POST /api/upload returns 401 (got ${res.status})`);
    const data = await res.json();
    assert(data.success === false, 'Response indicates failure');
  } catch (err) {
    assert(false, `Test 1 encountered error: ${err.message}`);
  }

  // ── TEST 2: Unauthenticated Cloudinary Config Leak Rejection (GET /api/upload) ──
  console.log('\n🔍 Test 2: Upload Config Protection (GET /api/upload)');
  try {
    const res = await fetch(`${BASE_URL}/api/upload`);
    assert(res.status === 401, `Unauthenticated GET /api/upload returns 401 (got ${res.status})`);
  } catch (err) {
    assert(false, `Test 2 encountered error: ${err.message}`);
  }

  // ── TEST 3: Unauthenticated Seed Inspection Rejection (GET /api/admin/seed) ──
  console.log('\n🔍 Test 3: Master Seed Route Protection (GET /api/admin/seed)');
  try {
    const res = await fetch(`${BASE_URL}/api/admin/seed`);
    assert(res.status === 401, `Unauthenticated GET /api/admin/seed returns 401 (got ${res.status})`);
  } catch (err) {
    assert(false, `Test 3 encountered error: ${err.message}`);
  }

  // ── TEST 4: E-Commerce Anti-Tampering & Price Verification (POST /api/orders) ──
  console.log('\n🔍 Test 4: Order Creation Anti-Tampering (POST /api/orders)');
  try {
    // 4a. Reject empty items
    const emptyOrderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Attacker',
        customerPhone: '9999999999',
        items: [],
        amount: 1, // Attempt to set 1 rupee total
      }),
    });
    assert(emptyOrderRes.status === 400, `Empty items array rejected with 400 (got ${emptyOrderRes.status})`);

    // 4b. Reject nonexistent product ID
    const fakeProductRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Attacker',
        customerPhone: '9999999999',
        items: [{ id: 'nonexistent-product-id', price: 0.01, quantity: 1 }],
      }),
    });
    assert(fakeProductRes.status === 400, `Fake product ID rejected with 400 (got ${fakeProductRes.status})`);

    // 4c. Verify price tampering override: client claims price 1, DB price should prevail
    const catRes = await fetch(`${BASE_URL}/api/catalog`);
    const catData = await catRes.json();
    const testProd = (catData.products || [])[0];

    if (testProd) {
      const spoofOrderRes = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: 'Security Tester',
          customerPhone: '9876543210',
          items: [{ id: testProd.id, productId: testProd.id, price: 1, quantity: 2 }], // Spoofed 1 unit price
          amount: 2, // Spoofed total
          status: 'delivered', // Spoofed status
          paymentStatus: 'paid', // Spoofed payment status
          discountPercent: 95, // Spoofed discount without coupon
        }),
      });

      assert(spoofOrderRes.status === 201, `Order creation succeeded with 201 (got ${spoofOrderRes.status})`);
      const spoofData = await spoofOrderRes.json();
      const order = spoofData.order;

      const expectedUnitPrice = Number(testProd.price);
      const expectedTotal = expectedUnitPrice * 2;

      assert(order.amount === expectedTotal, `Order total recomputed from DB price: ${order.amount} === ${expectedTotal} (ignored spoofed amount: 2)`);
      assert(order.status === 'processing', `Order status forced to 'processing' (got '${order.status}', ignored 'delivered')`);
      assert(order.paymentStatus === 'pending', `Order payment status forced to 'pending' (got '${order.paymentStatus}', ignored 'paid')`);
      assert(order.discountPercent === 0, `Unverified 95% discount dropped to 0% (got ${order.discountPercent}%)`);
    } else {
      console.warn('  ⚠️ Skipping 4c: No products in catalog');
    }
  } catch (err) {
    assert(false, `Test 4 encountered error: ${err.message}`);
  }

  // ── TEST 5: Admin Login & Token Revocation on Logout ──
  console.log('\n🔍 Test 5: Admin Login & Token Revocation on Logout');
  try {
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'vinaypokharna36@gmail.com',
        password: 'vinay@3123',
      }),
    });

    assert(loginRes.status === 200, `Admin login succeeds with 200 (got ${loginRes.status})`);
    const loginData = await loginRes.json();
    const token = loginData.token;
    assert(Boolean(token), 'Admin JWT token returned in response');

    // Use token to access protected seed endpoint
    const authedSeedRes = await fetch(`${BASE_URL}/api/admin/seed`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(authedSeedRes.status === 200, `Protected seed endpoint accessible with valid token (got ${authedSeedRes.status})`);

    // Now logout and revoke token
    const logoutRes = await fetch(`${BASE_URL}/api/admin/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(logoutRes.status === 200, `Admin logout succeeds with 200 (got ${logoutRes.status})`);

    // Now attempt to reuse revoked token -> MUST RETURN 401!
    const reusedRes = await fetch(`${BASE_URL}/api/admin/seed`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(reusedRes.status === 401, `Revoked token rejected with 401 on subsequent requests (got ${reusedRes.status})`);
  } catch (err) {
    assert(false, `Test 5 encountered error: ${err.message}`);
  }

  // ── TEST 6: Account Brute-Force Lockout Protection ──
  console.log('\n🔍 Test 6: Account-Level Brute-Force Protection');
  try {
    const testEmail = `brute_test_${Date.now()}@example.com`;
    let lockedOut = false;

    for (let i = 1; i <= 6; i++) {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': `198.51.100.${i}`, // Rotating IPs!
        },
        body: JSON.stringify({ email: testEmail, password: 'wrong_password' }),
      });

      if (res.status === 429) {
        lockedOut = true;
        assert(true, `Account lockout triggered on attempt ${i} despite rotating X-Forwarded-For IPs!`);
        break;
      }
    }
    assert(lockedOut, 'Account lockout successfully intercepted multi-IP brute force attack');
  } catch (err) {
    assert(false, `Test 6 encountered error: ${err.message}`);
  }

  // ── Summary ──
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`Security Test Suite Complete: ${passed} PASSED, ${failed} FAILED`);
  console.log('═══════════════════════════════════════════════════════');

  process.exit(failed > 0 ? 1 : 0);
}

runSecurityTests().catch((e) => {
  console.error('Fatal script error:', e);
  process.exit(1);
});
