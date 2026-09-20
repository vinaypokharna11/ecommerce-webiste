// Dedicated Test Suite: Seller Dashboard Order Management & Acceptance Workflow
// Validates deferred inventory deduction, atomic acceptance, rejection locking,
// duplicate protection, and multi-status filtering.

import fs from 'fs';
import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

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

import mongoose from 'mongoose';
import connectToDatabase from '../src/lib/mongodb.js';
import {
  createOrder,
  acceptOrder,
  rejectOrder,
  getOrders,
  getProducts,
  createProduct,
  updateOrderStatus,
  getProductById,
  updateProduct,
} from '../src/lib/db.js';

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

async function runSellerOrdersTests() {
  console.log('================================================================');
  console.log('🧪 RUNNING SELLER DASHBOARD ORDER MANAGEMENT VERIFICATION SUITE');
  console.log('================================================================\n');

  await connectToDatabase();

  const prods = await getProducts();
  let testProd = prods[0];
  if (!testProd) {
    testProd = await createProduct({
      id: `test-prod-${Date.now()}`,
      name: 'Test Earring Set',
      category: 'jewelry',
      price: 1499,
      stockCount: 50,
      stockStatus: 'in_stock',
    });
  }
  const testProductId = testProd.id;
  const initialStock = 50;
  await updateProduct(testProductId, { stockCount: initialStock, stockStatus: 'in_stock' });

  // ── TEST 1: Customer Checkout Creates Order with PENDING Status ──
  console.log('📋 [TEST 1] Order Creation at Checkout — Strict PENDING Status');
  const order1 = await createOrder({
    customerName: 'Test Buyer Alpha',
    customerEmail: 'alpha.buyer@example.com',
    customerPhone: '+91 98765 00001',
    deliveryAddress: '123 Test Street, Vapi, Gujarat',
    items: [{ id: testProductId, name: testProd.name, price: testProd.price, quantity: 2 }],
    amount: testProd.price * 2,
    sellerId: 'nakoda_seller',
  });

  assert(order1.id && order1.id.startsWith('#SE'), `Order created with ID: ${order1.id}`);
  assert(order1.status === 'pending', `Order initial status is strictly 'pending' (got '${order1.status}')`);
  assert(order1.statusLabel === 'Pending', `Order statusLabel is 'Pending' (got '${order1.statusLabel}')`);
  assert(order1.sellerId === 'nakoda_seller', `Order tagged with sellerId: ${order1.sellerId}`);

  // ── TEST 2: Inventory is NOT Decremented at Checkout ──
  console.log('\n📦 [TEST 2] Deferred Inventory Deduction Guardrail');
  const prodAfterCheckout = await getProductById(testProductId);
  assert(
    prodAfterCheckout.stockCount === initialStock,
    `Inventory untouched at checkout: stock remains ${prodAfterCheckout.stockCount} === ${initialStock}`
  );

  // ── TEST 3: Seller Authorization Validation ──
  console.log('\n🔒 [TEST 3] Seller Authorization Enforcement');
  let unauthorizedBlocked = false;
  try {
    await acceptOrder(order1.id, { role: 'seller', sellerId: 'unauthorized_seller_999' });
  } catch (err) {
    unauthorizedBlocked = true;
    assert(err.message.includes('Unauthorized'), `Cross-seller order access blocked: "${err.message}"`);
  }
  assert(unauthorizedBlocked === true, `Unauthorized seller cannot accept order belonging to another seller`);

  // ── TEST 4: Authorized Seller Accepts Order -> Atomic Inventory Decrement ──
  console.log('\n⚡ [TEST 4] Seller Accept Order -> Status Transition & Atomic Stock Decrement');
  const acceptedOrder = await acceptOrder(order1.id, { role: 'admin', sellerId: 'nakoda_seller' });
  assert(acceptedOrder.status === 'accepted', `Order status updated to 'accepted'`);
  assert(acceptedOrder.statusLabel === 'Accepted', `Order statusLabel updated to 'Accepted'`);
  assert(Boolean(acceptedOrder.acceptedAt), `acceptedAt timestamp recorded: ${acceptedOrder.acceptedAt}`);

  const prodAfterAccept = await getProductById(testProductId);
  const expectedStockAfterAccept = initialStock - 2;
  assert(
    prodAfterAccept.stockCount === expectedStockAfterAccept,
    `Inventory atomically decremented: ${prodAfterAccept.stockCount} === ${expectedStockAfterAccept}`
  );

  // ── TEST 5: Duplicate Accept & Race Condition Guardrail ──
  console.log('\n🛡️ [TEST 5] Duplicate Order Acceptance Guardrail');
  let duplicateBlocked = false;
  try {
    await acceptOrder(order1.id, { role: 'admin' });
  } catch (err) {
    duplicateBlocked = true;
    assert(
      err.message.includes('is not in pending status') || err.message.includes('no longer pending'),
      `Duplicate accept blocked with clear error: "${err.message}"`
    );
  }
  assert(duplicateBlocked === true, `Duplicate accept strictly prohibited`);

  // Verify stock was not decremented a second time
  const prodAfterDup = await getProductById(testProductId);
  assert(
    prodAfterDup.stockCount === expectedStockAfterAccept,
    `Stock remains unchanged after rejected duplicate attempt: ${prodAfterDup.stockCount}`
  );

  // ── TEST 6: Order Rejection Flow ──
  console.log('\n🚫 [TEST 6] Order Rejection Flow & Inventory Consistency');
  const stockBeforeOrder2 = prodAfterDup.stockCount;
  const order2 = await createOrder({
    customerName: 'Test Buyer Beta',
    customerEmail: 'beta.buyer@example.com',
    customerPhone: '+91 98765 00002',
    deliveryAddress: '456 Sample Ave, Vapi, Gujarat',
    items: [{ id: testProductId, name: testProd.name, price: testProd.price, quantity: 3 }],
    amount: testProd.price * 3,
    sellerId: 'nakoda_seller',
  });
  assert(order2.status === 'pending', `Order 2 created with status 'pending'`);

  // Reject with reason
  const rejectionReason = 'Customer requested cancellation prior to packing';
  const rejectedOrder = await rejectOrder(order2.id, { role: 'admin' }, rejectionReason);
  assert(rejectedOrder.status === 'rejected', `Order 2 status updated to 'rejected'`);
  assert(rejectedOrder.statusLabel === 'Rejected', `Order 2 statusLabel updated to 'Rejected'`);
  assert(rejectedOrder.rejectionReason === rejectionReason, `Rejection reason stored accurately`);
  assert(Boolean(rejectedOrder.rejectedAt), `rejectedAt timestamp recorded: ${rejectedOrder.rejectedAt}`);

  // Verify inventory was never touched
  const prodAfterReject = await getProductById(testProductId);
  assert(
    prodAfterReject.stockCount === stockBeforeOrder2,
    `Inventory untouched after rejection: stock remains ${prodAfterReject.stockCount}`
  );

  // ── TEST 7: Cannot Accept a Rejected Order ──
  console.log('\n🔒 [TEST 7] Permanent Lock on Rejected Orders');
  let acceptRejectedBlocked = false;
  try {
    await acceptOrder(order2.id, { role: 'admin' });
  } catch (err) {
    acceptRejectedBlocked = true;
  }
  assert(acceptRejectedBlocked === true, `Rejected order cannot be accepted later`);

  // ── TEST 8: Cannot Transition Rejected Order to Active Fulfillment ──
  console.log('\n🔒 [TEST 8] Prevent Transitioning Rejected Order to Fulfillment');
  let fulfillRejectedBlocked = false;
  try {
    await updateOrderStatus(order2.id, 'processing');
  } catch (err) {
    fulfillRejectedBlocked = true;
    assert(err.message.includes('Cannot transition a rejected order'), `Rejected order transition blocked: "${err.message}"`);
  }
  assert(fulfillRejectedBlocked === true, `Rejected order cannot be transitioned to fulfillment status`);

  // ── TEST 9: Order Progression for Accepted Orders ──
  console.log('\n🚚 [TEST 9] Fulfillment Pipeline for Accepted Orders');
  const processingOrder = await updateOrderStatus(order1.id, 'processing', 'Packed in warehouse box #4');
  assert(processingOrder.status === 'processing', `Order advanced to 'processing'`);
  assert(processingOrder.sellerNotes === 'Packed in warehouse box #4', `Seller notes saved`);

  const shippedOrder = await updateOrderStatus(order1.id, 'shipped', 'Dispatched with BlueDart');
  assert(shippedOrder.status === 'shipped', `Order advanced to 'shipped'`);

  const deliveredOrder = await updateOrderStatus(order1.id, 'delivered');
  assert(deliveredOrder.status === 'delivered', `Order advanced to 'delivered'`);

  // ── TEST 10: Status Filtering & Search ──
  console.log('\n🔍 [TEST 10] Multi-Status Filtering & Search Capability');
  const allPending = await getOrders(null, { status: 'pending' });
  assert(Array.isArray(allPending), `getOrders with status=pending returned array`);
  assert(allPending.every((o) => o.status === 'pending'), `All returned orders have status 'pending'`);

  const allAccepted = await getOrders(null, { status: 'accepted' });
  assert(allAccepted.every((o) => o.status === 'accepted'), `All returned orders have status 'accepted'`);

  const allRejected = await getOrders(null, { status: 'rejected' });
  assert(allRejected.some((o) => o.id === order2.id), `Rejected order found in status=rejected query`);

  const searchResults = await getOrders(null, { search: 'Buyer Alpha' });
  assert(searchResults.some((o) => o.id === order1.id), `Search by customer name found order ${order1.id}`);

  // Summary
  console.log('\n================================================================');
  console.log(`🏁 SELLER ORDERS TEST SUITE COMPLETE`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log('================================================================');

  if (mongoose.connection && mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runSellerOrdersTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
