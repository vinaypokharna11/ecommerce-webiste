import fs from 'fs';
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

import { connectToDatabase } from '../src/lib/mongodb.js';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  adjustProductStockDB,
  createOrder,
  updateOrderStatus,
} from '../src/lib/db.js';
import Product from '../src/models/Product.js';
import Order from '../src/models/Order.js';

async function run() {
  console.log('--- Starting Real-Time Product CRUD & Inventory Synchronization Test ---');

  await connectToDatabase();

  const testSku = `TEST-SKU-${Date.now()}`;
  let createdProductId = null;
  let testOrderId = null;

  try {
    // ─── TEST 1: Create Product with SKU & Computed Stock Status ─────────
    console.log('\n[TEST 1] Creating test product with SKU:', testSku);
    const prod = await createProduct({
      name: 'Sync Test Necklace',
      sku: testSku,
      category: 'necklaces',
      categoryName: 'Necklaces',
      price: 1200,
      stockCount: 10,
    });
    createdProductId = prod.id;
    console.log(`✓ Product created successfully: id=${prod.id}, sku=${prod.sku}, stock=${prod.stockCount}, status=${prod.stockStatus}`);
    if (prod.stockStatus !== 'in_stock') throw new Error(`Expected in_stock, got ${prod.stockStatus}`);

    // ─── TEST 2: Reject Duplicate SKU ──────────────────────────────────
    console.log('\n[TEST 2] Testing duplicate SKU rejection...');
    try {
      await createProduct({
        name: 'Duplicate SKU Product',
        sku: testSku,
        category: 'earrings',
        categoryName: 'Earrings',
        price: 800,
        stockCount: 5,
      });
      throw new Error('FAILED: Duplicate SKU should have been rejected');
    } catch (err) {
      if (err.code === 'SKU_ALREADY_EXISTS') {
        console.log('✓ Duplicate SKU successfully rejected with code SKU_ALREADY_EXISTS');
      } else {
        throw err;
      }
    }

    // ─── TEST 3: Atomic Stock Adjustment (+10) ──────────────────────────
    console.log('\n[TEST 3] Adjusting stock by +10...');
    const adjPlus = await adjustProductStockDB(createdProductId, 10);
    if (!adjPlus.success) throw new Error(`Adjust failed: ${adjPlus.error}`);
    console.log(`✓ Stock after +10: count=${adjPlus.product.stockCount}, status=${adjPlus.product.stockStatus}`);
    if (adjPlus.product.stockCount !== 20) throw new Error(`Expected 20, got ${adjPlus.product.stockCount}`);

    // ─── TEST 4: Atomic Stock Adjustment (-5) ──────────────────────────
    console.log('\n[TEST 4] Adjusting stock by -5...');
    const adjMinus = await adjustProductStockDB(createdProductId, -5);
    if (!adjMinus.success) throw new Error(`Adjust failed: ${adjMinus.error}`);
    console.log(`✓ Stock after -5: count=${adjMinus.product.stockCount}, status=${adjMinus.product.stockStatus}`);
    if (adjMinus.product.stockCount !== 15) throw new Error(`Expected 15, got ${adjMinus.product.stockCount}`);

    // ─── TEST 5: Prevent Negative Stock ─────────────────────────────────
    console.log('\n[TEST 5] Attempting to adjust stock beyond available (-100)...');
    const negAdj = await adjustProductStockDB(createdProductId, -100);
    if (negAdj.success) throw new Error('FAILED: Negative stock adjustment should have failed');
    console.log(`✓ Negative stock rejected cleanly: "${negAdj.error}" (code: ${negAdj.code})`);

    // Verify stock remains untouched at 15
    const checkStock = await getProductById(createdProductId);
    if (checkStock.stockCount !== 15) throw new Error(`Expected 15, got ${checkStock.stockCount}`);

    // ─── TEST 6: Concurrency Stress Test (5 parallel -1 requests) ────────
    console.log('\n[TEST 6] Concurrency Stress Test: 5 simultaneous -1 requests...');
    const results = await Promise.all([
      adjustProductStockDB(createdProductId, -1),
      adjustProductStockDB(createdProductId, -1),
      adjustProductStockDB(createdProductId, -1),
      adjustProductStockDB(createdProductId, -1),
      adjustProductStockDB(createdProductId, -1),
    ]);

    const allSuccessful = results.every((r) => r.success);
    if (!allSuccessful) throw new Error('Some concurrent adjustments failed');
    const afterConcurrent = await getProductById(createdProductId);
    console.log(`✓ Stock after 5 concurrent -1 adjustments: count=${afterConcurrent.stockCount}`);
    if (afterConcurrent.stockCount !== 10) throw new Error(`Expected 10, got ${afterConcurrent.stockCount}`);

    // ─── TEST 7: Soft Delete Product ────────────────────────────────────
    console.log('\n[TEST 7] Soft-deleting product...');
    await deleteProduct(createdProductId, { soft: true });
    
    // Default fetch should not find it
    const normalFetch = await getProductById(createdProductId);
    if (normalFetch !== null) throw new Error('Soft-deleted product was returned by normal getProductById!');
    console.log('✓ Soft-deleted product hidden from default getProductById');

    // Fetch with includeDeleted should find it
    const deletedFetch = await getProductById(createdProductId, { includeDeleted: true });
    if (!deletedFetch || !deletedFetch.isDeleted) throw new Error('Failed to retrieve soft-deleted product with includeDeleted: true');
    console.log(`✓ Soft-deleted product retrieved with includeDeleted=true, isDeleted=${deletedFetch.isDeleted}`);

    // ─── TEST 8: Order Placement Rejects Soft-Deleted Product ────────────
    console.log('\n[TEST 8] Verifying order placement rejects soft-deleted product...');
    try {
      await createOrder({
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerPhone: '9876543210',
        deliveryAddress: '123 Test St, Vapi',
        items: [{ id: createdProductId, quantity: 1 }],
      });
      throw new Error('FAILED: Order placement should have rejected soft-deleted product');
    } catch (err) {
      if (err.code === 'PRODUCT_UNAVAILABLE') {
        console.log(`✓ Order correctly rejected with code PRODUCT_UNAVAILABLE: "${err.message}"`);
      } else {
        throw err;
      }
    }

    // ─── TEST 9: Restore Soft-Deleted Product ────────────────────────────
    console.log('\n[TEST 9] Restoring soft-deleted product...');
    const restored = await restoreProduct(createdProductId);
    if (!restored || restored.isDeleted) throw new Error('Restore failed');
    console.log(`✓ Product restored: isDeleted=${restored.isDeleted}, stockStatus=${restored.stockStatus}`);

    // ─── TEST 10: Order Stock Deduction & Cancellation Rollback ─────────
    console.log('\n[TEST 10] Testing atomic stock deduction on order placement & restoration on cancellation...');
    const stockBeforeOrder = restored.stockCount; // should be 10
    testOrderId = `TEST-ORD-${Date.now()}`;
    const order = await createOrder({
      id: testOrderId,
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '9876543210',
      deliveryAddress: '123 Test St, Vapi',
      items: [{ id: createdProductId, quantity: 2 }],
    });
    console.log(`✓ Order created: id=${order.id}, inventoryDeducted=${order.inventoryDeducted}`);

    // Verify product stock decremented by 2
    const prodAfterOrder = await getProductById(createdProductId);
    console.log(`✓ Stock after order: count=${prodAfterOrder.stockCount} (was ${stockBeforeOrder})`);
    if (prodAfterOrder.stockCount !== stockBeforeOrder - 2) {
      throw new Error(`Expected ${stockBeforeOrder - 2}, got ${prodAfterOrder.stockCount}`);
    }

    // Cancel order and verify stock is restored
    console.log('Cancelling order to trigger inventory restoration...');
    await updateOrderStatus(order.id, 'cancelled');
    const prodAfterCancel = await getProductById(createdProductId);
    console.log(`✓ Stock after order cancellation: count=${prodAfterCancel.stockCount} (restored back to ${stockBeforeOrder})`);
    if (prodAfterCancel.stockCount !== stockBeforeOrder) {
      throw new Error(`Expected stock to restore to ${stockBeforeOrder}, got ${prodAfterCancel.stockCount}`);
    }

    console.log('\n=========================================');
    console.log('🎉 ALL 10 INVENTORY SYNCHRONIZATION TESTS PASSED!');
    console.log('=========================================');
  } catch (err) {
    console.error('\n❌ ERROR IN TEST RUN:', err);
    throw err;
  } finally {
    // ─── CLEANUP ────────────────────────────────────────────────────────
    console.log('\n[CLEANUP] Removing test artifacts from DB...');
    if (createdProductId) {
      await Product.deleteOne({ id: createdProductId }).catch(() => {});
      console.log('✓ Cleaned up test product');
    }
    if (testOrderId) {
      await Order.deleteOne({ id: testOrderId }).catch(() => {});
      console.log('✓ Cleaned up test order');
    }
  }
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ TEST RUN FAILED:', err);
    process.exit(1);
  });
