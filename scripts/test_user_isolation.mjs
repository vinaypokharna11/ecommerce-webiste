/**
 * test_user_isolation.mjs
 *
 * Verifies strict per-user cart and wishlist isolation:
 * - Test 1: Guest Wishlist (401 without auth)
 * - Test 2: User A Login & Cart + Wishlist Addition
 * - Test 3: User B Login & Empty Cart + Wishlist Isolation Verification
 * - Test 4: User B Cart Addition (Product C)
 * - Test 5: User A Login Again & Full Cart/Wishlist Restoration (Product A + B present, C absent)
 * - Test 6: Cart Quantity & Deletion
 */

const BASE_URL = 'http://localhost:3000';

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

async function run() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 VERIFYING USER-SPECIFIC CART & WISHLIST ISOLATION FLOWS');
  console.log('═══════════════════════════════════════════════════════════\n');

  const timestamp = Date.now();
  const userAEmail = `user_a_${timestamp}@example.com`;
  const userBEmail = `user_b_${timestamp}@example.com`;
  const password = 'Password@123';

  // Fetch valid products from catalog for relational testing
  const prodsRes = await fetch(`${BASE_URL}/api/products`);
  const prodsData = await prodsRes.json();
  const catalogList = prodsData.products || [];
  const prodId1 = catalogList[0]?.id || 'prod-1';
  const prodId2 = catalogList[1]?.id || 'prod-2';
  const prodId3 = catalogList[2]?.id || 'prod-3';

  // ─── TEST 1: Guest Behavior ───
  console.log('1️⃣  Testing Guest Unauthenticated Access:');
  const guestWishlistRes = await fetch(`${BASE_URL}/api/wishlist`);
  assert(guestWishlistRes.status === 401, 'Guest GET /api/wishlist blocked with 401');

  const guestCartRes = await fetch(`${BASE_URL}/api/cart`);
  assert(guestCartRes.status === 401, 'Guest GET /api/cart blocked with 401');

  const guestWishlistPost = await fetch(`${BASE_URL}/api/wishlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: prodId1 }),
  });
  assert(guestWishlistPost.status === 401, 'Guest POST /api/wishlist blocked with 401');

  // ─── TEST 2: Signup & Login User A ───
  console.log('\n2️⃣  Testing User A Signup & Cart/Wishlist Population:');
  const signupARes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'User A', email: userAEmail, password }),
  });
  const signupAData = await signupARes.json();
  assert(signupAData.success, `User A registered successfully (${userAEmail})`);
  const tokenA = signupAData.token;

  // Add Product 1 and Product 2 to User A Cart
  const cartItemsA = [
    { productId: prodId1, name: 'Wireless Headphones', price: 2999, quantity: 2 },
    { productId: prodId2, name: 'Smart Watch', price: 4999, quantity: 1 },
  ];
  const syncCartARes = await fetch(`${BASE_URL}/api/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({ items: cartItemsA }),
  });
  const syncCartAData = await syncCartARes.json();
  assert(syncCartAData.success && syncCartAData.cart?.items?.length === 2, 'User A synced 2 items to cart');

  // Add Product 1 to User A Wishlist
  const wishARes = await fetch(`${BASE_URL}/api/wishlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({ productId: prodId1 }),
  });
  const wishAData = await wishARes.json();
  assert(wishAData.success, 'User A saved prod-1 to wishlist');

  // Verify User A Wishlist has 1 item
  const getWishARes = await fetch(`${BASE_URL}/api/wishlist`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const getWishAData = await getWishARes.json();
  assert(getWishAData.success && getWishAData.wishlist?.length === 1, 'User A wishlist confirmed with 1 item');

  // ─── TEST 3: User B Signup & Isolation Check ───
  console.log('\n3️⃣  Testing User B (Must Have Completely EMPTY Cart & Wishlist):');
  const signupBRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'User B', email: userBEmail, password }),
  });
  const signupBData = await signupBRes.json();
  assert(signupBData.success, `User B registered successfully (${userBEmail})`);
  const tokenB = signupBData.token;

  // Fetch User B Cart - MUST BE EMPTY!
  const getCartBRes = await fetch(`${BASE_URL}/api/cart`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  const getCartBData = await getCartBRes.json();
  assert(
    getCartBData.success && (!getCartBData.cart || !getCartBData.cart.items || getCartBData.cart.items.length === 0),
    'User B cart is strictly EMPTY (User A items NOT leaked)'
  );

  // Fetch User B Wishlist - MUST BE EMPTY!
  const getWishBRes = await fetch(`${BASE_URL}/api/wishlist`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  const getWishBData = await getWishBRes.json();
  assert(
    getWishBData.success && (!getWishBData.wishlist || getWishBData.wishlist.length === 0),
    'User B wishlist is strictly EMPTY (User A wishlist NOT leaked)'
  );

  // ─── TEST 4: User B adds Product 3 to Cart ───
  console.log('\n4️⃣  User B Adds Product 3 to Cart:');
  const cartItemsB = [
    { productId: prodId3, name: 'Premium Backpack', price: 1499, quantity: 3 },
  ];
  const syncCartBRes = await fetch(`${BASE_URL}/api/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenB}`,
    },
    body: JSON.stringify({ items: cartItemsB }),
  });
  const syncCartBData = await syncCartBRes.json();
  assert(syncCartBData.success && syncCartBData.cart?.items?.length === 1, 'User B saved Product 3 to cart');

  // ─── TEST 5: User A Logs In Again & Restores Their Cart & Wishlist ───
  console.log('\n5️⃣  User A Re-authentication & Data Restoration Verification:');
  const loginARes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userAEmail, password }),
  });
  const loginAData = await loginARes.json();
  assert(loginAData.success, 'User A logged back in successfully');
  const freshTokenA = loginAData.token;

  // Verify User A Cart: Must have Product 1 & Product 2, and NOT Product 3!
  const restoredCartARes = await fetch(`${BASE_URL}/api/cart`, {
    headers: { Authorization: `Bearer ${freshTokenA}` },
  });
  const restoredCartAData = await restoredCartARes.json();
  const restoredItems = restoredCartAData.cart?.items || [];
  const hasProd1 = restoredItems.some((it) => it.productId === prodId1);
  const hasProd2 = restoredItems.some((it) => it.productId === prodId2);
  const hasProd3 = restoredItems.some((it) => it.productId === prodId3);

  assert(hasProd1 && hasProd2, 'User A previous cart items (Product 1 & 2) restored correctly');
  assert(!hasProd3, 'User B item (Product 3) is NOT in User A cart (Isolation Guaranteed)');

  // Verify User A Wishlist: Must still have Product 1
  const restoredWishARes = await fetch(`${BASE_URL}/api/wishlist`, {
    headers: { Authorization: `Bearer ${freshTokenA}` },
  });
  const restoredWishAData = await restoredWishARes.json();
  const restoredWishItems = restoredWishAData.wishlist || [];
  assert(
    restoredWishItems.some((w) => w.productId === prodId1),
    'User A wishlist still contains Product 1 after re-login'
  );

  // ─── TEST 6: Cart Modification & Deletion ───
  console.log('\n6️⃣  Testing Cart Update & Clearing:');
  // Update quantity of prod-1 to 5
  const updatedItemsA = [
    { productId: prodId1, name: 'Wireless Headphones', price: 2999, quantity: 5 },
  ];
  const updateRes = await fetch(`${BASE_URL}/api/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${freshTokenA}`,
    },
    body: JSON.stringify({ items: updatedItemsA }),
  });
  const updateData = await updateRes.json();
  assert(
    updateData.success && updateData.cart?.items?.[0]?.quantity === 5,
    'Updated Product 1 quantity to 5 in DB'
  );

  // Clear Cart
  const clearRes = await fetch(`${BASE_URL}/api/cart`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${freshTokenA}` },
  });
  const clearData = await clearRes.json();
  assert(clearData.success, 'Cart cleared successfully via DELETE /api/cart');

  const afterClearRes = await fetch(`${BASE_URL}/api/cart`, {
    headers: { Authorization: `Bearer ${freshTokenA}` },
  });
  const afterClearData = await afterClearRes.json();
  assert(
    afterClearData.success && (!afterClearData.cart || afterClearData.cart.items?.length === 0),
    'Cart verified empty in database after clear'
  );

  // Remove from Wishlist
  const delWishRes = await fetch(`${BASE_URL}/api/wishlist?productId=${prodId1}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${freshTokenA}` },
  });
  const delWishData = await delWishRes.json();
  assert(delWishData.success, 'Product 1 removed from wishlist via DELETE /api/wishlist');

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`📊 FINAL TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal error during test execution:', err);
  process.exit(1);
});
