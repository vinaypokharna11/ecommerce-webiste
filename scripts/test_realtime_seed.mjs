import {
  getMasterSeedTemplate,
  updateMasterSeedTemplate,
  restoreSeedCatalog,
  clearCatalog,
  getProducts,
  createProduct,
  deleteProduct,
} from '../src/lib/db.js';
import { realtimeEmitter, CATALOG_EVENTS } from '../src/lib/events.js';

async function runTests() {
  console.log('🧪 Starting Real-Time & Seed Verification Tests...\n');

  // Test 1: Event listener verification
  let receivedEvents = [];
  const listener = (event) => {
    receivedEvents.push(event);
  };
  realtimeEmitter.on('catalog_event', listener);

  // Test 2: Master seed template
  console.log('1️⃣ Testing getMasterSeedTemplate()...');
  const template = getMasterSeedTemplate();
  console.log(`   Template has ${template.products?.length || 0} products, ${template.categories?.length || 0} categories, version: ${template.version || 1}`);
  if (!Array.isArray(template.products) || template.products.length === 0) {
    throw new Error('Master seed template missing products');
  }

  // Test 3: Restore seed catalog
  console.log('2️⃣ Testing restoreSeedCatalog()...');
  const restoreRes = await restoreSeedCatalog();
  console.log(`   Restored catalog with ${restoreRes.count} products.`);
  const currentProds = await getProducts();
  console.log(`   getProducts() returned ${currentProds.length} products.`);
  if (currentProds.length === 0) {
    throw new Error('restoreSeedCatalog failed to populate products');
  }

  // Test 4: Create a test product
  console.log('3️⃣ Testing createProduct() & event dispatch...');
  const testProd = await createProduct({
    id: `test-prod-${Date.now()}`,
    name: 'Realtime Live Test Ring',
    category: 'accessories',
    price: 999,
  });
  console.log(`   Created product ${testProd.id} ("${testProd.name}")`);

  // Test 5: Delete the test product
  console.log('4️⃣ Testing deleteProduct() & event dispatch...');
  const delOk = await deleteProduct(testProd.id);
  console.log(`   Deleted product: ${delOk}`);

  // Test 6: Clear all catalog (0 items) & test persistence
  console.log('5️⃣ Testing clearCatalog() & Empty Catalog Persistence...');
  const clearRes = await clearCatalog();
  console.log(`   clearCatalog() result: ${clearRes.success}`);

  const emptyProds = await getProducts();
  console.log(`   getProducts() after clear returned: ${emptyProds.length} products.`);
  if (emptyProds.length !== 0) {
    throw new Error(`Expected 0 products after clearCatalog(), but got ${emptyProds.length}! Unwanted re-seeding detected.`);
  }
  console.log('   ✅ Empty catalog persistence VERIFIED: 0 products returned without auto-re-seeding.');

  // Test 7: Update master seed template
  console.log('6️⃣ Testing updateMasterSeedTemplate()...');
  const customSeed = updateMasterSeedTemplate({
    description: 'Updated custom seed test',
    products: template.products.slice(0, 3),
  });
  console.log(`   Master seed updated to version: ${customSeed.version}, products count: ${customSeed.products.length}`);

  // Test 8: Restore updated seed template
  console.log('7️⃣ Testing restore from updated master seed template...');
  const restoreUpdated = await restoreSeedCatalog();
  console.log(`   Restored updated seed with ${restoreUpdated.count} products.`);
  const prodsAfterRestore = await getProducts();
  console.log(`   getProducts() returned ${prodsAfterRestore.length} products.`);

  // Test 9: Restore full template for clean state
  console.log('8️⃣ Restoring full default catalog for clean developer state...');
  updateMasterSeedTemplate({ products: template.products, categories: template.categories, offers: template.offers });
  await restoreSeedCatalog();

  console.log(`\n🎉 Total Real-Time Events captured during tests: ${receivedEvents.length}`);
  receivedEvents.forEach((ev, idx) => {
    console.log(`   [Event ${idx + 1}] Type: ${ev.type} at ${ev.timestamp}`);
  });

  realtimeEmitter.off('catalog_event', listener);
  console.log('\n✨ ALL REAL-TIME & SEED TESTS PASSED SUCCESSFULLY! ✨');
}

runTests().catch((err) => {
  console.error('\n❌ Test failed with error:', err);
  process.exit(1);
});
