import connectToDatabase from '../src/lib/mongodb.js';
import Offer from '../src/models/Offer.js';
import CouponUsage from '../src/models/CouponUsage.js';
import Order from '../src/models/Order.js';
import Product from '../src/models/Product.js';
import { validateCoupon } from '../src/lib/couponValidation.js';
import {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  createOrder,
  updateOrderStatus,
} from '../src/lib/db.js';

import fs from 'fs';

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

function cleanJSONDB(prefix) {
  try {
    const dbPath = 'src/data/db.json';
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      if (Array.isArray(data.couponUsages)) {
        data.couponUsages = data.couponUsages.filter((u) => !u.couponCode?.startsWith(prefix));
      }
      if (Array.isArray(data.offers)) {
        data.offers = data.offers.filter((o) => !o.code?.startsWith(prefix));
      }
      if (Array.isArray(data.orders)) {
        data.orders = data.orders.filter((ord) => !ord.id?.startsWith('#SETEST'));
      }
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    }
  } catch (e) {}
}

async function run() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧪 RUNNING COMPREHENSIVE COUPON SYSTEM AUDIT & TESTS');
  console.log('═══════════════════════════════════════════════════════\n');

  await connectToDatabase();
  console.log('📡 Connected to MongoDB Atlas\n');

  // Clean up any previous test records
  const TEST_PREFIX = 'TEST_CPN_';
  await Offer.deleteMany({ code: new RegExp(`^${TEST_PREFIX}`) });
  await CouponUsage.deleteMany({ couponCode: new RegExp(`^${TEST_PREFIX}`) });
  await Order.deleteMany({ id: new RegExp('^#SETEST') });
  cleanJSONDB(TEST_PREFIX);

  // Create a dedicated isolated test product with sufficient stock
  const testProdId = `prod-test-cpn-${Date.now()}`;
  const testProd = {
    id: testProdId,
    name: 'Coupon Test Jewelry',
    price: 1000,
    category: 'footwear',
    stockCount: 100,
    stockStatus: 'in_stock',
    isDeleted: false,
    status: 'active',
  };
  await Product.deleteOne({ id: testProdId });
  await Product.create(testProd);

  // ─────────────────────────────────────────────────────────────
  // SCENARIO 1: Create New Active Coupon & Customer Visibility
  // ─────────────────────────────────────────────────────────────
  console.log('🔹 SCENARIO 1: Create active coupon & check public API visibility');
  const code1 = `${TEST_PREFIX}SAVE20`;
  const offer1 = await createOffer({
    id: `offer-test-${Date.now()}-1`,
    code: code1,
    title: '20% OFF',
    discountPercent: 20,
    category: 'all',
    minOrderAmount: 500,
    isActive: true,
    status: 'ACTIVE',
  });

  const publicOffers1 = await getOffers({ includeInactive: false, includeDeleted: false });
  const foundInPublic = publicOffers1.some((o) => o.code === code1);
  assert(foundInPublic, 'Newly created active coupon appears in public offers');

  const valRes1 = await validateCoupon({
    couponCode: code1,
    items: [{ id: testProd.id, productId: testProd.id, price: 1000, quantity: 1, category: testProd.category }],
    cartSubtotal: 1000,
  });
  assert(valRes1.valid === true, 'Coupon validates successfully');
  assert(valRes1.discountPercent === 20, 'Discount percentage is 20%');
  assert(valRes1.discountAmount === 200, 'Discount amount is ₹200 on ₹1000 subtotal');

  // ─────────────────────────────────────────────────────────────
  // SCENARIO 2: Pause Coupon
  // ─────────────────────────────────────────────────────────────
  console.log('\n🔹 SCENARIO 2: Pause coupon & enforce unavailability');
  await updateOffer(offer1.id, { isActive: false, status: 'PAUSED' });

  const publicOffers2 = await getOffers({ includeInactive: false, includeDeleted: false });
  const inPublicAfterPause = publicOffers2.some((o) => o.code === code1);
  assert(!inPublicAfterPause, 'Paused coupon disappears from public customer offers');

  const adminOffers2 = await getOffers({ includeInactive: true, includeDeleted: false });
  const inAdminAfterPause = adminOffers2.some((o) => o.code === code1);
  assert(inAdminAfterPause, 'Paused coupon remains visible in admin dashboard with paused status');

  const valRes2 = await validateCoupon({
    couponCode: code1,
    items: [{ id: testProd.id, productId: testProd.id, price: 1000, quantity: 1 }],
  });
  assert(valRes2.valid === false, 'Paused coupon is rejected during validation');
  assert(valRes2.code === 'COUPON_PAUSED', 'Error code is COUPON_PAUSED');

  // ─────────────────────────────────────────────────────────────
  // SCENARIO 3: Resume Coupon
  // ─────────────────────────────────────────────────────────────
  console.log('\n🔹 SCENARIO 3: Resume coupon & verify re-availability');
  await updateOffer(offer1.id, { isActive: true, status: 'ACTIVE' });

  const publicOffers3 = await getOffers({ includeInactive: false, includeDeleted: false });
  const inPublicAfterResume = publicOffers3.some((o) => o.code === code1);
  assert(inPublicAfterResume, 'Resumed coupon becomes available again to customers');

  const valRes3 = await validateCoupon({
    couponCode: code1,
    items: [{ id: testProd.id, productId: testProd.id, price: 1000, quantity: 1 }],
  });
  assert(valRes3.valid === true, 'Resumed coupon can be applied again');

  // ─────────────────────────────────────────────────────────────
  // SCENARIO 4: Soft-Delete Coupon
  // ─────────────────────────────────────────────────────────────
  console.log('\n🔹 SCENARIO 4: Soft-delete coupon & verify total unavailability');
  await deleteOffer(offer1.id);

  const publicOffers4 = await getOffers({ includeInactive: false, includeDeleted: false });
  const inPublicAfterDelete = publicOffers4.some((o) => o.code === code1);
  assert(!inPublicAfterDelete, 'Deleted coupon does NOT appear in public customer offers');

  const adminOffers4 = await getOffers({ includeInactive: true, includeDeleted: false });
  const inAdminAfterDelete = adminOffers4.some((o) => o.code === code1);
  assert(!inAdminAfterDelete, 'Deleted coupon does NOT appear in active admin dashboard listing');

  const valRes4 = await validateCoupon({
    couponCode: code1,
    items: [{ id: testProd.id, productId: testProd.id, price: 1000, quantity: 1 }],
  });
  assert(valRes4.valid === false, 'Deleted coupon is rejected by validation');
  assert(valRes4.code === 'COUPON_DELETED', 'Error code is COUPON_DELETED');

  // ─────────────────────────────────────────────────────────────
  // SCENARIO 5: Expired Coupon
  // ─────────────────────────────────────────────────────────────
  console.log('\n🔹 SCENARIO 5: Expired coupon handling');
  const codeExpired = `${TEST_PREFIX}EXPIRED10`;
  const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  await createOffer({
    id: `offer-test-${Date.now()}-exp`,
    code: codeExpired,
    title: '10% Expired',
    discountPercent: 10,
    category: 'all',
    endDate: pastDate,
    expiry: 'Expired on Sep 1',
    isActive: true,
  });

  const publicOffers5 = await getOffers({ includeInactive: false, includeDeleted: false });
  const inPublicExpired = publicOffers5.some((o) => o.code === codeExpired);
  assert(!inPublicExpired, 'Expired coupon does NOT appear in customer offers');

  const valRes5 = await validateCoupon({
    couponCode: codeExpired,
    items: [{ id: testProd.id, productId: testProd.id, price: 1000, quantity: 1 }],
  });
  assert(valRes5.valid === false, 'Expired coupon is rejected by validation');
  assert(valRes5.code === 'COUPON_EXPIRED', 'Error code is COUPON_EXPIRED');

  // ─────────────────────────────────────────────────────────────
  // SCENARIO 6: Category Restriction & Minimum Order Amount
  // ─────────────────────────────────────────────────────────────
  console.log('\n🔹 SCENARIO 6: Category restriction & minimum order amount');
  const codeCat = `${TEST_PREFIX}JEWELRY30`;
  await createOffer({
    id: `offer-test-${Date.now()}-cat`,
    code: codeCat,
    title: '30% OFF Jewelry',
    discountPercent: 30,
    category: 'jewelry',
    minOrderAmount: 1500,
    isActive: true,
    status: 'ACTIVE',
  });

  // Test mismatch category
  const valCatMismatch = await validateCoupon({
    couponCode: codeCat,
    items: [{ id: testProd.id, productId: testProd.id, price: 2000, quantity: 1, category: 'electronics' }],
    cartSubtotal: 2000,
  });
  assert(valCatMismatch.valid === false, 'Rejected when cart has no items matching coupon category');
  assert(valCatMismatch.code === 'COUPON_CATEGORY_MISMATCH', 'Error code is COUPON_CATEGORY_MISMATCH');

  // Test minimum order not met
  const valMinNotMet = await validateCoupon({
    couponCode: codeCat,
    items: [{ id: 'prod-ring', productId: 'prod-ring', price: 800, quantity: 1, category: 'jewelry' }],
    cartSubtotal: 800,
  });
  assert(valMinNotMet.valid === false, 'Rejected when subtotal is below minimum order amount');
  assert(valMinNotMet.code === 'MINIMUM_ORDER_NOT_MET', 'Error code is MINIMUM_ORDER_NOT_MET');

  // Test category & min order pass
  const valCatPass = await validateCoupon({
    couponCode: codeCat,
    items: [{ id: 'prod-ring', productId: 'prod-ring', price: 2000, quantity: 1, category: 'jewelry' }],
    cartSubtotal: 2000,
  });
  assert(valCatPass.valid === true, 'Valid when category and minimum order amount requirements are met');
  assert(valCatPass.discountAmount === 600, 'Discount amount correctly calculated server-side (30% of ₹2000 = ₹600)');

  // ─────────────────────────────────────────────────────────────
  // SCENARIO 7: One Coupon Use Per User ID (Order Lifecycle)
  // ─────────────────────────────────────────────────────────────
  console.log('\n🔹 SCENARIO 7: One coupon use per User ID');
  const codeUser = `${TEST_PREFIX}ONCE25`;
  const offerUser = await createOffer({
    id: `offer-test-${Date.now()}-once`,
    code: codeUser,
    title: '25% OFF Once',
    discountPercent: 25,
    category: 'all',
    isActive: true,
    status: 'ACTIVE',
  });

  const USER_A = 'customer_user_abc_001';
  const USER_B = 'customer_user_xyz_002';

  // 1. User A places order with coupon
  const orderA1 = await createOrder({
    id: `#SETEST-USER-A1-${Date.now()}`,
    userId: USER_A,
    customerName: 'User A',
    customerPhone: '9876543210',
    couponCode: codeUser,
    items: [{ id: testProd.id, productId: testProd.id, price: testProd.price, quantity: 1 }],
  });
  assert(orderA1 && orderA1.id, 'User A places first order with coupon successfully');
  assert(orderA1.discountPercent === 25, 'Discount applied on first order');

  // Verify CouponUsage recorded in DB
  const usageRecord = await CouponUsage.findOne({ couponId: offerUser.id, userId: USER_A }).lean();
  assert(usageRecord !== null, 'CouponUsage record created in database for User A');

  // 2. User A attempts to use the SAME coupon again
  let userASecondOrderFailed = false;
  let userAErrorCode = '';
  try {
    await createOrder({
      id: `#SETEST-USER-A2-${Date.now()}`,
      userId: USER_A,
      customerName: 'User A',
      customerPhone: '9876543210',
      couponCode: codeUser,
      items: [{ id: testProd.id, productId: testProd.id, price: testProd.price, quantity: 1 }],
    });
  } catch (err) {
    userASecondOrderFailed = true;
    userAErrorCode = err.code;
  }
  assert(userASecondOrderFailed, 'User A is rejected when attempting to reuse the same coupon');
  assert(userAErrorCode === 'COUPON_ALREADY_USED', 'Error code is COUPON_ALREADY_USED');

  // Also verify validateCoupon directly rejects User A
  const valUserAAgain = await validateCoupon({
    couponCode: codeUser,
    userId: USER_A,
    items: [{ id: testProd.id, productId: testProd.id, price: testProd.price, quantity: 1 }],
  });
  assert(valUserAAgain.valid === false && valUserAAgain.code === 'COUPON_ALREADY_USED', 'validateCoupon immediately rejects User A for consumed coupon');

  // 3. User B (different account) uses the same coupon -> should be ALLOWED
  const orderB = await createOrder({
    id: `#SETEST-USER-B1-${Date.now()}`,
    userId: USER_B,
    customerName: 'User B',
    customerPhone: '9123456780',
    couponCode: codeUser,
    items: [{ id: testProd.id, productId: testProd.id, price: testProd.price, quantity: 1 }],
  });
  assert(orderB && orderB.id, 'User B can still use the same coupon');
  assert(orderB.discountPercent === 25, 'User B receives the 25% discount');

  // ─────────────────────────────────────────────────────────────
  // SCENARIO 8: Anti-Tampering & Security (Client manipulating amount)
  // ─────────────────────────────────────────────────────────────
  console.log('\n🔹 SCENARIO 8: Price manipulation security check');
  // Client attempts to pass fake low price amount: 1 and high fake discount
  const orderTampered = await createOrder({
    id: `#SETEST-TAMPER-${Date.now()}`,
    userId: 'user_tamper_999',
    customerName: 'Tamper Tester',
    customerPhone: '9999999999',
    amount: 1, // Client claims order amount is ₹1
    items: [{ id: testProd.id, productId: testProd.id, price: 1, quantity: 2 }], // Client sends unit price ₹1
  });
  // Server-side price calculation must enforce verified catalog unit price
  const expectedServerAmount = testProd.price * 2;
  assert(orderTampered.amount === expectedServerAmount, `Server ignores client amount ₹1 and calculates true amount ₹${expectedServerAmount}`);

  // ─────────────────────────────────────────────────────────────
  // SCENARIO 9: Database Race-Condition / Concurrent Checkout Protection
  // ─────────────────────────────────────────────────────────────
  console.log('\n🔹 SCENARIO 9: Concurrent checkout race-condition double-spend prevention');
  const codeConcurrent = `${TEST_PREFIX}RACE50`;
  const offerConcurrent = await createOffer({
    id: `offer-test-${Date.now()}-race`,
    code: codeConcurrent,
    title: '50% Race Test',
    discountPercent: 50,
    category: 'all',
    isActive: true,
    status: 'ACTIVE',
  });

  const CONCURRENT_USER = 'customer_user_race_condition_test';

  // Fire two order creations concurrently at the exact same millisecond
  const orderReq1 = createOrder({
    id: `#SETEST-RACE1-${Date.now()}`,
    userId: CONCURRENT_USER,
    customerName: 'Race User',
    customerPhone: '9999888877',
    couponCode: codeConcurrent,
    items: [{ id: testProd.id, productId: testProd.id, price: testProd.price, quantity: 1 }],
  });

  const orderReq2 = createOrder({
    id: `#SETEST-RACE2-${Date.now()}`,
    userId: CONCURRENT_USER,
    customerName: 'Race User',
    customerPhone: '9999888877',
    couponCode: codeConcurrent,
    items: [{ id: testProd.id, productId: testProd.id, price: testProd.price, quantity: 1 }],
  });

  const results = await Promise.allSettled([orderReq1, orderReq2]);
  const successes = results.filter((r) => r.status === 'fulfilled');
  const rejections = results.filter((r) => r.status === 'rejected');

  assert(successes.length === 1, `Exactly ONE concurrent checkout succeeded (successes: ${successes.length})`);
  assert(rejections.length === 1, `The second concurrent checkout was rejected (rejections: ${rejections.length})`);
  assert(
    rejections[0]?.reason?.code === 'COUPON_ALREADY_USED',
    'Second concurrent request was blocked with COUPON_ALREADY_USED'
  );

  // ─────────────────────────────────────────────────────────────
  // SCENARIO 10: Cancelled Order Releases Coupon
  // ─────────────────────────────────────────────────────────────
  console.log('\n🔹 SCENARIO 10: Cancelled order releases coupon for reuse');
  const successfulOrder = successes[0].value;
  await updateOrderStatus(successfulOrder.id, 'cancelled', 'Customer cancelled order');

  // Verify that CouponUsage was removed
  const usageAfterCancel = await CouponUsage.findOne({ couponId: offerConcurrent.id, userId: CONCURRENT_USER }).lean();
  assert(usageAfterCancel === null, 'CouponUsage record released after order cancellation');

  // Verify that the user can now validate and apply the coupon again
  const valAfterCancel = await validateCoupon({
    couponCode: codeConcurrent,
    userId: CONCURRENT_USER,
    items: [{ id: testProd.id, productId: testProd.id, price: testProd.price, quantity: 1 }],
  });
  assert(valAfterCancel.valid === true, 'Coupon is available again after order cancellation');

  // ─────────────────────────────────────────────────────────────
  // CLEANUP & REPORT
  // ─────────────────────────────────────────────────────────────
  console.log('\n🧹 Cleaning up test records...');
  await Offer.deleteMany({ code: new RegExp(`^${TEST_PREFIX}`) });
  await CouponUsage.deleteMany({ couponCode: new RegExp(`^${TEST_PREFIX}`) });
  await Order.deleteMany({ id: new RegExp('^#SETEST') });
  await Product.deleteOne({ id: testProdId });
  cleanJSONDB(TEST_PREFIX);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`📊 FINAL TEST REPORT: ${passed} PASSED | ${failed} FAILED`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
