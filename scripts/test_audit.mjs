// Set environment variables for testing
process.env.JWT_SECRET = 'shopease_super_secret_jwt_key_2026_production_change_me';
process.env.ADMIN_EMAIL = 'admin@shopease.com';
process.env.ADMIN_PASSWORD = 'admin123';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/shopease';

import { 
  getProducts, 
  getProductById,
  createProduct, 
  updateProduct, 
  deleteProduct,
  getCategories,
  getOffers,
  getOrders,
  createOrder,
  getInquiries,
  createInquiry,
  getContactMessages,
  createContactMessage,
  getStoreConfig,
  updateStoreConfig,
  registerCustomer,
  loginCustomer,
  getCustomerById,
  updateCustomerProfile,
  deleteCustomerAccount,
  verifyAdminCredentials
} from '../src/lib/db.js';
import { 
  signToken, 
  signAdminToken, 
  ADMIN_TOKEN_EXPIRY, 
  ADMIN_COOKIE_MAX_AGE, 
  verifyToken, 
  verifyAdminAuth, 
  verifyCustomerAuth 
} from '../src/lib/auth.js';
import { checkRateLimit } from '../src/lib/rateLimit.js';
import { uploadImage, isCloudinaryConfigured } from '../src/lib/cloudinary.js';

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

async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 RUNNING COMPREHENSIVE BACKEND & DATABASE AUDIT TESTS');
  console.log('═══════════════════════════════════════════════════════\n');

  // 1. Database & Catalog Queries
  console.log('📦 1. Testing Products CRUD & Database Operations:');
  const products = await getProducts();
  assert(Array.isArray(products) && products.length > 0, `Fetched ${products.length} products from DB`);

  const singleProd = await getProductById('prod-1');
  assert(singleProd && singleProd.name.includes('Wireless'), `Fetched product by ID: ${singleProd?.name}`);

  const filteredProd = await getProducts({ category: 'electronics' });
  assert(filteredProd.length > 0 && filteredProd.every(p => p.category === 'electronics'), `Category filter works: ${filteredProd.length} electronics`);

  const searchProd = await getProducts({ search: 'headphones' });
  assert(searchProd.length > 0, `Search query matches: ${searchProd.length} results`);

  // Create test product
  const testProdId = `prod-test-${Date.now()}`;
  const createdProd = await createProduct({
    id: testProdId,
    name: 'Test Premium Speaker',
    category: 'electronics',
    price: 1999,
    oldPrice: 2999,
    stockCount: 8,
  });
  assert(createdProd && createdProd.id === testProdId, `Created product successfully with id: ${createdProd?.id}`);

  // Update test product
  const updatedProd = await updateProduct(testProdId, { price: 1799, stockCount: 12 });
  assert(updatedProd && updatedProd.price === 1799 && updatedProd.stockCount === 12, `Updated product price to ₹1799, stock: 12`);

  // Delete test product
  const deletedProd = await deleteProduct(testProdId);
  assert(deletedProd === true, `Deleted test product ${testProdId}`);

  // 2. Categories & Offers
  console.log('\n🏷️ 2. Testing Categories & Offers CRUD:');
  const categories = await getCategories();
  assert(Array.isArray(categories) && categories.length >= 6, `Fetched ${categories.length} categories with dynamic counts`);

  const offers = await getOffers();
  assert(Array.isArray(offers) && offers.length >= 6, `Fetched ${offers.length} offers`);

  // 3. Customer Authentication Flow
  console.log('\n👤 3. Testing Customer Authentication & Session Management:');
  const testEmail = `cust_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  // Register Customer
  const registeredUser = await registerCustomer({
    name: 'Alice Wonder',
    email: testEmail,
    password: testPassword,
    phone: '+91 98765 00112',
    address: '42 Blossom Street',
    city: 'Bangalore',
    pincode: '560001',
  });
  assert(registeredUser && registeredUser.email === testEmail, `Registered customer user: ${registeredUser?.email}`);
  assert(!registeredUser.passwordHash, `Password hash is never returned in customer user object`);

  // Duplicate email check
  let duplicateError = false;
  try {
    await registerCustomer({
      name: 'Alice Clone',
      email: testEmail,
      password: 'differentPassword',
    });
  } catch (err) {
    duplicateError = true;
  }
  assert(duplicateError, `Duplicate registration properly rejected with error`);

  // Customer Login
  const loginResult = await loginCustomer({ email: testEmail, password: testPassword });
  assert(loginResult && loginResult.email === testEmail, `Customer login successful with valid password`);

  const wrongLogin = await loginCustomer({ email: testEmail, password: 'WrongPassword' });
  assert(wrongLogin === null, `Customer login rejected with invalid password`);

  // Customer Profile Update
  const updatedCustomer = await updateCustomerProfile(registeredUser._id || registeredUser.id, {
    phone: '+91 99999 88888',
  });
  assert(updatedCustomer && updatedCustomer.phone === '+91 99999 88888', `Customer profile updated phone successfully`);

  // Customer Data & Account Deletion (GDPR / Privacy Test)
  const deleteTestUser = await registerCustomer({
    name: 'Temporary User',
    email: `temp_delete_${Date.now()}@example.com`,
    password: 'Password123!',
    phone: '+91 98000 00000',
  });
  const deleteSuccess = await deleteCustomerAccount(deleteTestUser._id || deleteTestUser.id);
  assert(deleteSuccess === true, `Customer account & personal data deleted successfully`);
  const postDeleteCheck = await getCustomerById(deleteTestUser._id || deleteTestUser.id);
  assert(postDeleteCheck === null, `Deleted customer cannot be fetched (verified non-existent)`);

  // 4. JWT Token Generation & Verification
  console.log('\n🔐 4. Testing JWT Token Security & Role Authorization:');
  const customerToken = signToken({
    id: registeredUser._id || registeredUser.id,
    email: registeredUser.email,
    name: registeredUser.name,
    role: 'customer',
  });
  const decodedCustomer = verifyToken(customerToken);
  assert(decodedCustomer && decodedCustomer.role === 'customer', `Signed & verified valid customer JWT token`);

  // Admin Token with 12h Expiration
  const adminToken = signAdminToken({
    email: 'admin@shopease.com',
    name: 'Master Admin',
    role: 'superadmin',
  });
  const decodedAdmin = verifyToken(adminToken);
  assert(decodedAdmin && decodedAdmin.role === 'superadmin', `Signed & verified valid admin JWT token`);
  
  // Verify 12 hours (43200 seconds) duration in admin token payload
  const tokenDurationSecs = decodedAdmin.exp - decodedAdmin.iat;
  assert(tokenDurationSecs === 12 * 3600, `Admin JWT expiration duration is strictly 12 hours (43,200s)`);

  // Verify expired token behavior
  const expiredToken = signToken({
    email: 'admin@shopease.com',
    name: 'Master Admin',
    role: 'superadmin',
  }, '-1s');
  assert(verifyToken(expiredToken) === null, `Expired admin token fails verification (verifyToken returns null)`);

  // Mock Request Object for auth guards
  const mockCustomerReq = {
    cookies: { get: () => ({ value: customerToken }) },
    headers: { get: () => null },
  };
  const mockAdminReq = {
    cookies: { get: () => ({ value: adminToken }) },
    headers: { get: () => null },
  };
  const mockExpiredAdminReq = {
    cookies: { get: () => ({ value: expiredToken }) },
    headers: { get: () => null },
  };
  const mockUnauthReq = {
    cookies: { get: () => null },
    headers: { get: () => null },
  };

  assert(verifyCustomerAuth(mockCustomerReq) !== null, `verifyCustomerAuth allows customer token`);
  assert(verifyAdminAuth(mockCustomerReq) === null, `verifyAdminAuth DENIES customer token (Security Enforcement)`);
  assert(verifyAdminAuth(mockAdminReq) !== null, `verifyAdminAuth allows valid 12-hour admin token`);
  assert(verifyAdminAuth(mockExpiredAdminReq) === null, `verifyAdminAuth DENIES expired admin token`);
  assert(verifyAdminAuth(mockUnauthReq) === null, `verifyAdminAuth DENIES unauthenticated request`);

  // 5. Admin Authentication
  console.log('\n🛡️ 5. Testing Admin Authentication Credentials:');
  const validAdmin = await verifyAdminCredentials('admin@shopease.com', 'admin123');
  assert(validAdmin && validAdmin.role === 'superadmin', `Admin authenticated with configured server env credentials`);

  const invalidAdminPass = await verifyAdminCredentials('admin@shopease.com', 'badpass');
  assert(invalidAdminPass === null, `Admin authentication denied for bad password`);

  const invalidAdminEmail = await verifyAdminCredentials('fake@shopease.com', 'admin123');
  assert(invalidAdminEmail === null, `Admin authentication denied for unauthorized email`);

  // 6. Orders Flow
  console.log('\n🛒 6. Testing Orders CRUD & Flow:');
  const testOrder = await createOrder({
    userId: registeredUser._id || registeredUser.id,
    customerName: registeredUser.name,
    customerEmail: registeredUser.email,
    customerPhone: registeredUser.phone,
    items: [{ id: 'prod-1', name: 'Wireless Headphones', price: 3499, quantity: 1 }],
    itemSummary: 'Wireless Headphones (x1)',
    amount: 3499,
    deliveryAddress: '42 Blossom Street, Bangalore — 560001',
    payMethod: 'Cash on Delivery',
  });
  assert(testOrder && testOrder.id.startsWith('#SE'), `Created customer order: ${testOrder?.id}`);

  const customerOrders = await getOrders(registeredUser.email);
  assert(customerOrders.length >= 1 && customerOrders.some(o => o.id === testOrder.id), `Fetched orders for customer ${registeredUser.email}`);

  // 7. Inquiries & Contact Messages
  console.log('\n📨 7. Testing Inquiries & Contact Messages:');
  const testInquiry = await createInquiry({
    inquiryType: 'Wholesale Purchase',
    productName: 'Wireless Headphones',
    quantity: 50,
    customerName: 'Rohit Tech',
    customerPhone: '+91 99887 76655',
    notes: 'Please quote 50 units',
  });
  assert(testInquiry && testInquiry.id.startsWith('INQ-'), `Created customer inquiry: ${testInquiry?.id}`);

  const testContact = await createContactMessage({
    name: 'Anita Roy',
    email: 'anita@example.com',
    subject: 'Store Timings on Holidays',
    message: 'Are you open on Republic Day?',
  });
  assert(testContact && testContact.id.startsWith('CT-'), `Created customer contact message: ${testContact?.id}`);

  // 8. Security Logic: Price Calculation Anti-Tampering & Rate Limiting
  console.log('\n🔒 8. Testing Complex Security Logic (Anti-Tampering & Rate Limiting):');
  
  // Anti-tampering price check
  const tamperedOrder = await createOrder({
    customerName: 'Tamper Tester',
    customerEmail: 'tamper@example.com',
    customerPhone: '+91 91111 22222',
    deliveryAddress: '10 Security Lane, Bangalore',
    items: [{ id: 'prod-1', name: 'Wireless Headphones', price: 1, quantity: 2 }], // Client claims ₹1 each
    amount: 2, // Client claims total ₹2 instead of ₹6,998
  });
  assert(tamperedOrder.amount === 6998, `Server-side price verification overrode tampered client price (Computed: ₹${tamperedOrder.amount})`);

  // Rate limiter check
  const testIp = `test_ip_${Date.now()}`;
  for (let i = 1; i <= 5; i++) {
    const res = checkRateLimit(`login:${testIp}`, 5, 60000);
    assert(res.isAllowed === true, `Rate limiter permitted attempt ${i}/5`);
  }
  const blockedAttempt = checkRateLimit(`login:${testIp}`, 5, 60000);
  assert(blockedAttempt.isAllowed === false && blockedAttempt.retryAfterSec > 0, `Rate limiter properly BLOCKED 6th attempt (Retry after: ${blockedAttempt.retryAfterSec}s)`);

  // 9. Store Settings
  console.log('\n⚙️ 9. Testing Store Config Settings:');
  const config = await getStoreConfig();
  assert(config && (config.name === 'ShopEase' || config.name === 'Nakoda Imitation'), `Loaded store config: ${config?.name} (${config?.whatsappDisplay})`);

  // 10. Cloudinary Image CDN & Upload Pipeline
  console.log('\n☁️ 10. Testing Cloudinary & Image Upload Pipeline:');
  const sampleDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const uploadRes = await uploadImage(sampleDataUri, { folder: 'nakoda_imitation/test' });
  assert(uploadRes && uploadRes.success && Boolean(uploadRes.url), `Image upload pipeline returned valid URL (Local or Cloudinary CDN)`);
  assert(typeof isCloudinaryConfigured === 'function', `isCloudinaryConfigured helper is properly exported and callable`);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`📊 AUDIT TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('═══════════════════════════════════════════════════════');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
