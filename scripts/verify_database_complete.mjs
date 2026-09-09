import mongoose from 'mongoose';
import dns from 'dns';
import fs from 'fs';
import path from 'path';

// Force public DNS for reliable Node SRV resolution on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

// Read MONGODB_URI
let uri = process.env.MONGODB_URI;
if (!uri && fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf8');
  const match = content.match(/MONGODB_URI=(.+)/);
  if (match) uri = match[1].trim();
}
if (!uri && fs.existsSync('.env')) {
  const content = fs.readFileSync('.env', 'utf8');
  const match = content.match(/MONGODB_URI=(.+)/);
  if (match) uri = match[1].trim();
}

if (!uri) {
  console.error('❌ MONGODB_URI not found in environment');
  process.exit(1);
}

// Auto-inject database name if needed
if (uri.startsWith('mongodb+srv://') && uri.includes('.mongodb.net/?')) {
  uri = uri.replace('.mongodb.net/?', '.mongodb.net/nakodaimitation?');
}

process.env.MONGODB_URI = uri;

const masked = uri.replace(/\/\/(.*?):(.*?)@/, '//$1:•••••••@');

console.log('═══════════════════════════════════════════════════════════════');
console.log('🚀 COMPREHENSIVE MONGODB ATLAS VERIFICATION SUITE');
console.log(`📡 Cluster URI: ${masked}`);
console.log('═══════════════════════════════════════════════════════════════\n');

// Import models and db methods
import { connectToDatabase } from '../src/lib/mongodb.js';
import Product from '../src/models/Product.js';
import User from '../src/models/User.js';
import Order from '../src/models/Order.js';
import Wishlist from '../src/models/Wishlist.js';
import Cart from '../src/models/Cart.js';
import Category from '../src/models/Category.js';
import Offer from '../src/models/Offer.js';
import StoreConfig from '../src/models/StoreConfig.js';
import {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  registerCustomer,
  loginCustomer,
  deleteCustomerAccount,
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  getUserCart,
  syncUserCart,
  clearUserCart,
  createOrder,
} from '../src/lib/db.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

async function runSuite() {
  const startConnect = Date.now();
  console.log('1️⃣  Testing MongoDB Atlas Connection & Ping...');
  const conn = await connectToDatabase();
  const connectDuration = Date.now() - startConnect;

  assert(conn !== null, `Connected to MongoDB Atlas in ${connectDuration}ms`);
  assert(mongoose.connection.readyState === 1, 'Mongoose connection readyState is 1 (Connected)');
  assert(mongoose.connection.name === 'nakodaimitation', `Database name is "${mongoose.connection.name}"`);

  const ping = await mongoose.connection.db.admin().ping();
  assert(ping && ping.ok === 1, `Database ping returned { ok: 1 }`);

  console.log('\n2️⃣  Testing Product CRUD in MongoDB Atlas...');
  const testProdId = `test-prod-${Date.now()}`;
  const testProductData = {
    id: testProdId,
    name: 'Atlas Audit Test Necklace',
    category: 'necklaces',
    categoryName: 'Necklaces',
    price: 1899,
    oldPrice: 2499,
    stockCount: 15,
    stockStatus: 'in_stock',
    tags: ['test', 'necklace', 'audit'],
  };

  // CREATE
  const createdProd = await createProduct(testProductData);
  assert(createdProd && createdProd.id === testProdId, 'createProduct returned created product object');

  // Verify directly in MongoDB Atlas collection
  const mongoProd = await Product.findOne({ id: testProdId }).lean();
  assert(mongoProd !== null, `Document actually exists in Atlas "products" collection (name: "${mongoProd?.name}")`);
  assert(mongoProd?.price === 1899, `Product price stored correctly in Atlas (${mongoProd?.price})`);

  // READ
  const readProd = await getProductById(testProdId);
  assert(readProd && readProd.id === testProdId, 'getProductById retrieved product from Atlas');

  // UPDATE
  const updatedProd = await updateProduct(testProdId, { price: 2199, stockCount: 12 });
  assert(updatedProd && updatedProd.price === 2199, 'updateProduct returned updated object');
  const mongoUpdatedProd = await Product.findOne({ id: testProdId }).lean();
  assert(mongoUpdatedProd?.price === 2199 && mongoUpdatedProd?.stockCount === 12, 'Atlas "products" document updated correctly');

  // DELETE
  const deleted = await deleteProduct(testProdId);
  assert(deleted === true, 'deleteProduct returned true');
  const mongoDeletedProd = await Product.findOne({ id: testProdId }).lean();
  assert(mongoDeletedProd === null, 'Document successfully removed from Atlas "products" collection');

  console.log('\n3️⃣  Testing Customer User Auth & Atlas Persistence...');
  const testEmail = `audit_user_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  // REGISTER
  const newUser = await registerCustomer({
    name: 'Audit Customer',
    email: testEmail,
    password: testPassword,
    phone: '+91 99887 76655',
    address: '42 MG Road',
    city: 'Bangalore',
    pincode: '560001',
  });
  assert(newUser && newUser.email === testEmail, 'registerCustomer returned registered customer');

  // Verify in Atlas "users" collection
  const mongoUser = await User.findOne({ email: testEmail });
  assert(mongoUser !== null, `User document actually exists in Atlas "users" collection (id: ${mongoUser?._id})`);
  assert(mongoUser?.passwordHash && !mongoUser?.password, 'User password is secure bcrypt hash in Atlas; plaintext never stored');

  // LOGIN
  const loginResult = await loginCustomer({ email: testEmail, password: testPassword });
  assert(loginResult !== null && loginResult.email === testEmail, 'loginCustomer successfully authenticated against Atlas');

  // Duplicate email prevention
  let dupThrew = false;
  try {
    await registerCustomer({ name: 'Dup User', email: testEmail, password: 'any' });
  } catch (err) {
    dupThrew = true;
  }
  assert(dupThrew, 'Duplicate email registration was rejected');

  console.log('\n4️⃣  Testing Wishlist Persistence in MongoDB Atlas...');
  const testUserId = String(mongoUser._id);
  // Pick an existing product from catalog for foreign key test
  const existingProd = await Product.findOne().lean();
  const wishProdId = existingProd ? existingProd.id : 'prod-1';

  // ADD TO WISHLIST
  const wishItem = await addToWishlist(testUserId, wishProdId);
  assert(wishItem !== null, 'addToWishlist returned item');

  // Verify directly in Atlas "wishlists" collection
  const mongoWish = await Wishlist.findOne({ userId: testUserId, productId: wishProdId }).lean();
  assert(mongoWish !== null, `Document actually exists in Atlas "wishlists" collection`);

  // DUPLICATE PREVENTION
  await addToWishlist(testUserId, wishProdId);
  const wishCount = await Wishlist.countDocuments({ userId: testUserId, productId: wishProdId });
  assert(wishCount === 1, `Compound unique index prevented duplicate wishlist entry (count: ${wishCount})`);

  // GET WISHLIST
  const userWishlist = await getUserWishlist(testUserId);
  assert(Array.isArray(userWishlist) && userWishlist.length === 1, `getUserWishlist retrieved ${userWishlist.length} item from Atlas`);

  // REMOVE FROM WISHLIST
  const removedWish = await removeFromWishlist(testUserId, wishProdId);
  assert(removedWish === true, 'removeFromWishlist returned true');
  const mongoWishAfter = await Wishlist.findOne({ userId: testUserId, productId: wishProdId }).lean();
  assert(mongoWishAfter === null, 'Document removed from Atlas "wishlists" collection');

  console.log('\n5️⃣  Testing Cart Persistence in MongoDB Atlas...');
  // SYNC CART
  const cartItems = [
    { productId: wishProdId, quantity: 2, selectedColor: 'Gold', selectedSize: 'Standard' },
  ];
  const syncedCart = await syncUserCart(testUserId, cartItems);
  assert(syncedCart !== null && syncedCart.items.length === 1, 'syncUserCart returned cart with 1 item');

  // Verify directly in Atlas "carts" collection
  const mongoCart = await Cart.findOne({ userId: testUserId }).lean();
  assert(mongoCart !== null, `Document actually exists in Atlas "carts" collection`);
  assert(mongoCart?.items?.[0]?.productId === wishProdId, `Cart item productId verified in Atlas (${wishProdId})`);

  // GET CART
  const userCart = await getUserCart(testUserId);
  assert(userCart && userCart.items?.length === 1, `getUserCart retrieved cart with ${userCart.items?.length} items`);

  // CLEAR CART
  const clearedCart = await clearUserCart(testUserId);
  assert(clearedCart === true, 'clearUserCart returned true');
  const mongoCartAfter = await Cart.findOne({ userId: testUserId }).lean();
  assert(mongoCartAfter === null, 'Cart document deleted from Atlas "carts" collection');

  console.log('\n6️⃣  Testing Order Creation, Price Verification & Atomic Stock Decrement...');
  // Create a product specifically to test stock decrement
  const stockTestProdId = `stock-test-${Date.now()}`;
  await createProduct({
    id: stockTestProdId,
    name: 'Stock Test Ring',
    category: 'rings',
    categoryName: 'Rings',
    price: 999,
    stockCount: 10,
    stockStatus: 'in_stock',
  });

  // Verify initial stock in Atlas
  const initialProd = await Product.findOne({ id: stockTestProdId }).lean();
  assert(initialProd?.stockCount === 10, 'Initial product stockCount is 10 in Atlas');

  // Place order for 3 units
  const orderData = {
    customerName: 'Audit Tester',
    customerEmail: testEmail,
    customerPhone: '+91 99887 76655',
    userId: testUserId,
    deliveryAddress: '42 MG Road, Bangalore',
    items: [
      { id: stockTestProdId, quantity: 3, price: 1 }, // Client attempts price tampering ($1 instead of $999)
    ],
  };

  const createdOrder = await createOrder(orderData);
  assert(createdOrder !== null, `Order created successfully: ${createdOrder.id}`);
  assert(createdOrder.amount === 2997, `Price anti-tampering verified! Client $1 ignored, DB price ₹999*3 = ₹${createdOrder.amount}`);

  // Verify order document in Atlas "orders" collection
  const mongoOrder = await Order.findOne({ id: createdOrder.id }).lean();
  assert(mongoOrder !== null, `Order document actually exists in Atlas "orders" collection (id: ${mongoOrder?.id})`);

  // Verify atomic stock decrement in Atlas "products" collection
  const decrementedProd = await Product.findOne({ id: stockTestProdId }).lean();
  assert(decrementedProd?.stockCount === 7, `Stock atomically decremented from 10 -> ${decrementedProd?.stockCount} in Atlas!`);

  // Test stock exhaustion / rejection
  let stockOverdraftThrew = false;
  try {
    await createOrder({
      customerName: 'Overdraft Tester',
      customerEmail: testEmail,
      customerPhone: '+91 99887 76655',
      items: [{ id: stockTestProdId, quantity: 50 }], // Available is only 7
    });
  } catch (err) {
    stockOverdraftThrew = true;
  }
  assert(stockOverdraftThrew, 'Order exceeding available stock was rejected by database validation');

  // Clean up order and test product
  await Order.deleteOne({ id: createdOrder.id });
  await Product.deleteOne({ id: stockTestProdId });
  const cleanedOrder = await Order.findOne({ id: createdOrder.id });
  assert(cleanedOrder === null, 'Test order cleaned up from Atlas "orders" collection');

  // Clean up customer user account
  await deleteCustomerAccount(String(mongoUser._id));
  const userDeleted = await User.findById(mongoUser._id);
  assert(userDeleted === null, 'Test customer account cleaned up from Atlas "users" collection');

  console.log('\n7️⃣  Verifying All MongoDB Atlas Collections & Document Counts...');
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const col of collections) {
    const count = await mongoose.connection.db.collection(col.name).countDocuments();
    console.log(`   📂 ${col.name.padEnd(20)}: ${count} documents`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`🏁 VERIFICATION COMPLETE: ${passedTests} / ${totalTests} TESTS PASSED!`);
  console.log('═══════════════════════════════════════════════════════════════');

  await mongoose.disconnect();
  process.exit(passedTests === totalTests ? 0 : 1);
}

runSuite().catch((err) => {
  console.error('Fatal error during suite execution:', err);
  process.exit(1);
});
