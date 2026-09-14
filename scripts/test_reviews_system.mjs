import fs from 'fs';
import path from 'path';

// Pre-load .env environment variables before connecting to MongoDB Atlas
try {
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
} catch (e) {}

import {
  createProduct,
  deleteProduct,
  createOrder,
  createReviewDB,
  updateReviewDB,
  deleteReviewDB,
  getProductReviewsDB,
  voteReviewHelpfulDB,
  getAllReviewsAdminDB,
  checkCustomerVerifiedPurchaseDB,
} from '../src/lib/db.js';
import connectToDatabase from '../src/lib/mongodb.js';
import Order from '../src/models/Order.js';

let passed = 0;
let failed = 0;

function assert(condition, testName, extraInfo = '') {
  if (condition) {
    console.log(`  ✓ PASSED: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAILED: ${testName} ${extraInfo}`);
    failed++;
  }
}

async function runTests() {
  console.log('🧪 Running Customer Product Review & Rating System Test Suite...\n');

  await connectToDatabase().catch(() => {});

  const testProductId = `test-prod-rev-${Date.now()}`;
  const testCustomerIdA = `cust-test-A-${Date.now()}`;
  const testCustomerIdB = `cust-test-B-${Date.now()}`;
  const testCustomerIdC = `cust-test-C-${Date.now()}`;
  const testCustomerIdD = `cust-test-D-${Date.now()}`;

  let createdProduct = null;
  let testOrder = null;

  try {
    // ─── SETUP: Create test product and test order ───────────────────────────
    console.log('📌 Phase 1: Setup test product and customer order history...');
    createdProduct = await createProduct({
      id: testProductId,
      name: 'Luxury Velvet Nightgown',
      price: 1299,
      category: 'clothing',
      categoryName: 'Clothing',
      stockCount: 10,
    });
    assert(createdProduct && createdProduct.id === testProductId, 'Product created successfully');

    // Create a verified purchase order for Customer A using dual DB abstraction
    try {
      testOrder = await createOrder({
        id: `ord-test-${Date.now()}`,
        userId: testCustomerIdA,
        customerId: testCustomerIdA,
        customerName: 'Customer Alpha',
        customerEmail: 'alpha@example.com',
        customerPhone: '+91 98765 43210',
        address: '123 Fashion Street',
        city: 'Mumbai',
        pincode: '400001',
        items: [
          {
            id: testProductId,
            name: 'Luxury Velvet Nightgown',
            price: 1299,
            quantity: 1,
          },
        ],
        amount: 1299,
        status: 'delivered',
      });
      assert(testOrder && testOrder.id, 'Test order created for Customer A (Verified Purchase)');
    } catch (e) {
      console.warn('Order create notice:', e.message);
    }

    // ─── Phase 2: Verified Purchase Detection ────────────────────────────────
    console.log('\n📌 Phase 2: Testing Server-side Verified Purchase Check...');
    const checkA = await checkCustomerVerifiedPurchaseDB(testProductId, testCustomerIdA, 'alpha@example.com');
    assert(checkA.verified === true, 'Customer A verified purchase correctly identified as true');

    const checkB = await checkCustomerVerifiedPurchaseDB(testProductId, testCustomerIdB, 'beta@example.com');
    assert(checkB.verified === false, 'Customer B (no order) verified purchase correctly identified as false');

    // ─── Phase 3: Rating Validation ──────────────────────────────────────────
    console.log('\n📌 Phase 3: Testing Rating & Comment Validation...');
    let invalidRatingCaught = false;
    try {
      await createReviewDB({
        productId: testProductId,
        customerId: testCustomerIdB,
        customerName: 'Customer Beta',
        customerEmail: 'beta@example.com',
        rating: 6, // Invalid > 5
        comment: 'Great product and nice quality',
      });
    } catch (e) {
      invalidRatingCaught = true;
    }
    assert(invalidRatingCaught, 'Rating > 5 rejected with error');

    let shortCommentCaught = false;
    try {
      await createReviewDB({
        productId: testProductId,
        customerId: testCustomerIdB,
        customerName: 'Customer Beta',
        customerEmail: 'beta@example.com',
        rating: 5,
        comment: 'bad', // < 5 characters
      });
    } catch (e) {
      shortCommentCaught = true;
    }
    assert(shortCommentCaught, 'Comment < 5 characters rejected with error');

    // ─── Phase 4: Submit Reviews & Recalculate Rating ─────────────────────────
    console.log('\n📌 Phase 4: Testing Review Submission & Real Average Rating Recalculation...');
    
    // Customer A submits 5-star review
    const revA = await createReviewDB({
      productId: testProductId,
      customerId: testCustomerIdA,
      customerName: 'Customer Alpha',
      customerEmail: 'alpha@example.com',
      rating: 5,
      title: 'Absolutely Stunning Quality!',
      comment: 'The velvet material is luxurious, soft, and fits perfectly.',
    });
    assert(revA.success && revA.review.rating === 5, 'Customer A 5-star review submitted successfully');
    assert(revA.review.verifiedPurchase === true, 'Customer A review awarded verified purchase badge');
    assert(revA.averageRating === 5.0 && revA.totalReviews === 1, 'Product rating recalculated to 5.0 (1 review)');

    // Customer B submits 4-star review
    const revB = await createReviewDB({
      productId: testProductId,
      customerId: testCustomerIdB,
      customerName: 'Customer Beta',
      customerEmail: 'beta@example.com',
      rating: 4,
      title: 'Very comfortable',
      comment: 'Nice finish, arrived quickly, comfortable fabric.',
    });
    assert(revB.success && revB.review.rating === 4, 'Customer B 4-star review submitted successfully');
    assert(revB.review.verifiedPurchase === false, 'Customer B review correctly not marked verified');
    assert(revB.averageRating === 4.5 && revB.totalReviews === 2, 'Product rating recalculated to 4.5 (2 reviews)');

    // Customer C submits 2-star review
    const revC = await createReviewDB({
      productId: testProductId,
      customerId: testCustomerIdC,
      customerName: 'Customer Charlie',
      customerEmail: 'charlie@example.com',
      rating: 2,
      title: 'A bit tight on the shoulders',
      comment: 'Fabric is decent but sizing runs smaller than expected.',
    });
    // Average: (5 + 4 + 2) / 3 = 11 / 3 = 3.666 -> 3.7
    assert(revC.averageRating === 3.7 && revC.totalReviews === 3, 'Product rating recalculated to 3.7 (3 reviews)');

    // ─── Phase 5: Ratings Distribution Breakdown ─────────────────────────────
    console.log('\n📌 Phase 5: Testing Ratings Distribution Breakdown...');
    const prodReviews = await getProductReviewsDB(testProductId, { page: 1, limit: 10 });
    assert(prodReviews.totalReviews === 3, 'Total reviews count is 3');
    assert(prodReviews.averageRating === 3.7, 'Average rating is 3.7');
    assert(
      prodReviews.distribution[5] === 1 &&
      prodReviews.distribution[4] === 1 &&
      prodReviews.distribution[2] === 1 &&
      prodReviews.distribution[1] === 0,
      'Rating distribution counts are exact: 5★:1, 4★:1, 2★:1, 1★:0'
    );
    assert(prodReviews.percentages[5] === 33 && prodReviews.percentages[4] === 33, 'Percentages correctly calculated (33%)');

    // ─── Phase 6: Single Review Per Customer Rule ─────────────────────────────
    console.log('\n📌 Phase 6: Testing 1 Review Per Customer Enforcement...');
    let duplicateRejected = false;
    try {
      await createReviewDB({
        productId: testProductId,
        customerId: testCustomerIdA, // Customer A already reviewed
        customerName: 'Customer Alpha',
        customerEmail: 'alpha@example.com',
        rating: 5,
        comment: 'Submitting another review should fail',
      });
    } catch (e) {
      duplicateRejected = true;
    }
    assert(duplicateRejected, 'Second review submission by Customer A blocked with duplicate error');

    // ─── Phase 7: Customer Edit Review ───────────────────────────────────────
    console.log('\n📌 Phase 7: Testing Customer Edit Review & Rating Recalculation...');
    // Customer C updates their rating from 2 stars to 5 stars
    const updateRes = await updateReviewDB(revC.review.id, testCustomerIdC, {
      rating: 5,
      title: 'Exchanged for larger size - now 5 stars!',
      comment: 'Customer support sent me one size up and it fits wonderfully!',
    });
    // New ratings: 5, 4, 5. Average = (5 + 4 + 5) / 3 = 14 / 3 = 4.666 -> 4.7
    assert(updateRes.success && updateRes.review.rating === 5, 'Customer C review updated to 5 stars');
    assert(updateRes.averageRating === 4.7, 'Product rating recalculated to 4.7 after review update');

    // Customer D attempts to edit Customer C's review
    let unauthorizedEditBlocked = false;
    try {
      await updateReviewDB(revC.review.id, testCustomerIdD, {
        rating: 1,
        comment: 'Hacked review content',
      });
    } catch (e) {
      unauthorizedEditBlocked = true;
    }
    assert(unauthorizedEditBlocked, 'Unauthorized customer cannot edit another customer review');

    // ─── Phase 8: Helpful Voting ─────────────────────────────────────────────
    console.log('\n📌 Phase 8: Testing Helpful Voting System...');
    const vote1 = await voteReviewHelpfulDB(revA.review.id, testCustomerIdB);
    assert(vote1.success && vote1.helpfulCount === 1 && vote1.hasVoted === true, 'Helpful upvote incremented count to 1');

    // Toggling vote off
    const vote2 = await voteReviewHelpfulDB(revA.review.id, testCustomerIdB);
    assert(vote2.success && vote2.helpfulCount === 0 && vote2.hasVoted === false, 'Toggle helpful vote decremented count back to 0');

    // ─── Phase 9: Customer Delete Review ─────────────────────────────────────
    console.log('\n📌 Phase 9: Testing Customer Delete Review...');
    const delC = await deleteReviewDB(revC.review.id, testCustomerIdC, false);
    // Remaining reviews: 5 and 4. Average = (5 + 4) / 2 = 4.5. Count = 2
    assert(delC.success && delC.totalReviews === 2 && delC.averageRating === 4.5, 'Customer C review deleted, rating recalculated to 4.5 (2 reviews)');

    // Customer D attempts to delete Customer A's review
    let unauthorizedDeleteBlocked = false;
    try {
      await deleteReviewDB(revA.review.id, testCustomerIdD, false);
    } catch (e) {
      unauthorizedDeleteBlocked = true;
    }
    assert(unauthorizedDeleteBlocked, 'Unauthorized customer cannot delete another customer review');

    // ─── Phase 10: Admin Review Management ───────────────────────────────────
    console.log('\n📌 Phase 10: Testing Admin Review Management & Deletion...');
    const adminReviews = await getAllReviewsAdminDB({ productId: testProductId });
    assert(adminReviews.totalReviews >= 2, 'Admin view lists all reviews for product');

    // Admin deletes Customer B's review
    const adminDelB = await deleteReviewDB(revB.review.id, null, true);
    // Remaining review: only Customer A (5 stars). Average = 5.0, count = 1
    assert(adminDelB.success && adminDelB.totalReviews === 1 && adminDelB.averageRating === 5.0, 'Admin deleted review, product rating recalculated to 5.0 (1 review)');

    // Admin deletes last review (Customer A)
    const adminDelA = await deleteReviewDB(revA.review.id, null, true);
    assert(adminDelA.success && adminDelA.totalReviews === 0 && adminDelA.averageRating === 0.0, 'Last review deleted, product rating reset cleanly to 0.0 (0 reviews)');

  } catch (err) {
    console.error('Unexpected test error:', err);
    failed++;
  } finally {
    // ─── CLEANUP ─────────────────────────────────────────────────────────────
    console.log('\n🧹 Cleaning up test product and orders...');
    if (createdProduct?.id) {
      await deleteProduct(createdProduct.id).catch(() => {});
    }
    if (testOrder?.id) {
      await Order.deleteOne({ id: testOrder.id }).catch(() => {});
      try {
        const dbPath = path.resolve('src/data/db.json');
        if (fs.existsSync(dbPath)) {
          const raw = fs.readFileSync(dbPath, 'utf8');
          const data = JSON.parse(raw);
          data.orders = (data.orders || []).filter((o) => o.id !== testOrder.id);
          fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
        }
      } catch (e) {}
    }
  }

  console.log('\n========================================');
  console.log(`Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
