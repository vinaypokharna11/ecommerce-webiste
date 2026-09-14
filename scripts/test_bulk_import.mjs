import fs from 'fs';
import path from 'path';
import dns from 'dns';
import * as XLSX from 'xlsx';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

// Read env
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
if (uri && uri.startsWith('mongodb+srv://') && uri.includes('.mongodb.net/?')) {
  uri = uri.replace('.mongodb.net/?', '.mongodb.net/nakodaimitation?');
}
if (uri) process.env.MONGODB_URI = uri;

import {
  autoDetectColumnMapping,
  validateProductRow,
  validateBulkDataset,
  parseColorsInput,
  parseCsvInput,
  parseBooleanInput,
} from '../src/lib/productImport.js';

import {
  bulkImportProductsDB,
  getExistingProductIdsDB,
  getCategories,
  getProducts,
  deleteProduct,
} from '../src/lib/db.js';

import {
  generateProductImportTemplate,
  generateErrorReportFile,
} from '../src/utils/excelTemplate.js';

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 COMPREHENSIVE BULK PRODUCT IMPORT TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════\n');

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

  // ── TEST 1: Header Auto-Detection & Aliases ──
  console.log('--- Test 1: Header Auto-Detection & Aliases ---');
  const testHeaders = [
    'Item Name',
    'Category',
    'Selling Price',
    'MRP',
    'Available Stock',
    'Photo URL',
    'Colors',
    'Sizes',
    'Product SKU',
  ];
  const detectedMapping = autoDetectColumnMapping(testHeaders);
  assert(detectedMapping.name === 0, 'Auto-detected "Item Name" as name');
  assert(detectedMapping.category === 1, 'Auto-detected "Category" as category');
  assert(detectedMapping.price === 2, 'Auto-detected "Selling Price" as price');
  assert(detectedMapping.oldPrice === 3, 'Auto-detected "MRP" as oldPrice');
  assert(detectedMapping.stockCount === 4, 'Auto-detected "Available Stock" as stockCount');
  assert(detectedMapping.image === 5, 'Auto-detected "Photo URL" as image');
  assert(detectedMapping.colors === 6, 'Auto-detected "Colors" as colors');
  assert(detectedMapping.sizes === 7, 'Auto-detected "Sizes" as sizes');
  assert(detectedMapping.id === 8, 'Auto-detected "Product SKU" as id');

  // ── TEST 2: Data Parsers (Colors, Sizes, Booleans) ──
  console.log('\n--- Test 2: Data Parsers (Colors, Sizes, Booleans) ---');
  const parsedColors = parseColorsInput('Gold Polish:#D4AF37, Silver:#C0C0C0, Rose Gold');
  assert(parsedColors.length === 3, 'Parsed 3 colors');
  assert(parsedColors[0].name === 'Gold Polish' && parsedColors[0].hex === '#D4AF37', 'Parsed color with explicit hex');
  assert(parsedColors[2].name === 'Rose Gold' && parsedColors[2].hex === '#B76E79', 'Auto-resolved hex for "Rose Gold"');

  const parsedSizes = parseCsvInput('2.4, 2.6, 2.8, Free Size');
  assert(parsedSizes.length === 4 && parsedSizes[0] === '2.4', 'Parsed comma-separated sizes');

  assert(parseBooleanInput('TRUE') === true, 'Parsed "TRUE" as true');
  assert(parseBooleanInput('no') === false, 'Parsed "no" as false');
  assert(parseBooleanInput(1) === true, 'Parsed 1 as true');

  // ── TEST 3: Validation & Error Detection ──
  console.log('\n--- Test 3: Validation & Error Detection ---');
  const mockCategories = [
    { id: 'necklaces', name: 'Necklaces' },
    { id: 'earrings', name: 'Earrings' },
    { id: 'bangles', name: 'Bangles' },
  ];
  const dbExistingIds = new Set(['prod-existing-1', 'prod-existing-2']);

  const testRows = [
    // Row 1: Valid product
    ['Kundan Necklace', 'necklaces', 1299, 1999, 20, 'https://example.com/img1.jpg'],
    // Row 2: Missing price
    ['Pearl Studs', 'earrings', '', 500, 10, ''],
    // Row 3: Invalid category
    ['Mystery Ring', 'non_existent_category', 499, '', 5, ''],
    // Row 4: Invalid price (<= 0)
    ['Free Bracelet', 'bangles', -50, '', 10, ''],
    // Row 5: Duplicate ID in file
    ['Duplicate Item A', 'earrings', 799, '', 15, '', 'dup-id-1'],
    ['Duplicate Item B', 'earrings', 799, '', 15, '', 'dup-id-1'],
    // Row 6: Duplicate ID in DB
    ['Existing Item in DB', 'necklaces', 2499, '', 5, '', 'prod-existing-1'],
  ];

  const mapping = {
    name: 0,
    category: 1,
    price: 2,
    oldPrice: 3,
    stockCount: 4,
    image: 5,
    id: 6,
  };

  const validationResult = validateBulkDataset({
    dataRows: testRows,
    mapping,
    categories: mockCategories,
    dbExistingIds,
    duplicateMode: 'skip',
    importMode: 'create',
  });

  assert(validationResult.products[0]._isValid === true, 'Row 1 is valid');
  assert(validationResult.products[1]._isValid === false, 'Row 2 caught missing price');
  assert(validationResult.products[2]._isValid === false, 'Row 3 caught non-existent category');
  assert(validationResult.products[3]._isValid === false, 'Row 4 caught invalid price (<= 0)');
  assert(validationResult.products[5]._isDuplicate === true, 'Row 5 caught duplicate ID within file');
  assert(validationResult.products[6]._isDuplicate === true, 'Row 6 caught duplicate ID against DB');
  assert(validationResult.errorsList.length >= 3, `Error report populated with ${validationResult.errorsList.length} errors`);

  // ── TEST 4: Database Bulk Import Execution (Skip Mode) ──
  console.log('\n--- Test 4: Database Bulk Import Execution (Skip Mode) ---');
  const testBatch1 = [
    {
      id: `test-prod-${Date.now()}-1`,
      name: 'Test Kundan Set Alpha',
      category: 'necklaces',
      categoryName: 'Necklaces',
      price: 1899,
      oldPrice: 2499,
      stockCount: 15,
      stockStatus: 'in_stock',
      tags: ['test', 'import'],
    },
    {
      id: `test-prod-${Date.now()}-2`,
      name: 'Test Temple Bangles Beta',
      category: 'bangles',
      categoryName: 'Bangles',
      price: 799,
      stockCount: 20,
      stockStatus: 'in_stock',
      tags: ['test', 'import'],
    },
  ];

  const res1 = await bulkImportProductsDB({
    products: testBatch1,
    duplicateMode: 'skip',
    importMode: 'create',
  });

  assert(res1.success === true, 'Import executed successfully');
  assert(res1.inserted === 2, `Inserted 2 new products (actual: ${res1.inserted})`);
  assert(res1.failed === 0, `0 failures during clean insert (actual: ${res1.failed})`);

  // ── TEST 5: Repeated Import (Duplicate Collision Handling) ──
  console.log('\n--- Test 5: Repeated Import (Duplicate Collision Handling) ---');
  const resDuplicate = await bulkImportProductsDB({
    products: testBatch1, // Same items again
    duplicateMode: 'skip',
    importMode: 'create',
  });

  assert(resDuplicate.success === true, 'Duplicate run executed without crash');
  assert(resDuplicate.skipped === 2, `Skipped 2 duplicate items safely (actual: ${resDuplicate.skipped})`);
  assert(resDuplicate.inserted === 0, 'Did not insert duplicate items');

  // ── TEST 6: Update Mode on Existing Products ──
  console.log('\n--- Test 6: Update Mode on Existing Products ---');
  const updatedBatch = [
    {
      ...testBatch1[0],
      price: 1999, // Updated price
      name: 'Updated Kundan Set Alpha',
    },
  ];

  const resUpdate = await bulkImportProductsDB({
    products: updatedBatch,
    duplicateMode: 'update',
    importMode: 'update',
  });

  assert(resUpdate.success === true, 'Update executed successfully');
  assert(resUpdate.updated === 1, `Updated 1 existing product (actual: ${resUpdate.updated})`);

  // ── TEST 7: Generate New ID Mode on Duplicate Collision ──
  console.log('\n--- Test 7: Generate New ID Mode on Duplicate Collision ---');
  const resGenId = await bulkImportProductsDB({
    products: [testBatch1[1]], // Existing item
    duplicateMode: 'generate_id',
    importMode: 'create',
  });

  assert(resGenId.success === true, 'Generate ID run executed successfully');
  assert(resGenId.inserted === 1, `Created new product with generated ID instead of colliding (actual: ${resGenId.inserted})`);

  // ── TEST 8: 100+ Products Large Batch Performance ──
  console.log('\n--- Test 8: 100+ Products Large Batch Performance ---');
  const largeBatch = [];
  const startTs = Date.now();
  for (let i = 0; i < 105; i++) {
    largeBatch.push({
      name: `Bulk Test Item #${i + 1}`,
      category: i % 2 === 0 ? 'necklaces' : 'earrings',
      categoryName: i % 2 === 0 ? 'Necklaces' : 'Earrings',
      price: 499 + (i * 10),
      stockCount: 10,
      tags: ['perf-test', `item-${i}`],
    });
  }

  const resLarge = await bulkImportProductsDB({
    products: largeBatch,
    duplicateMode: 'skip',
    importMode: 'create',
  });

  const durationMs = Date.now() - startTs;
  assert(resLarge.success === true, 'Large batch imported successfully');
  assert(resLarge.inserted === 105, `Inserted all 105 products (actual: ${resLarge.inserted})`);
  assert(durationMs < 10000, `Completed 105 items in ${durationMs}ms (< 10 seconds)`);

  // Clean up test products
  console.log('\n--- Cleaning up test items ---');
  const allProducts = await getProducts();
  const testIdsToDelete = allProducts
    .filter((p) => (p.tags && (p.tags.includes('perf-test') || p.tags.includes('test'))) || (p.name && p.name.includes('Test ')))
    .map((p) => p.id);

  let cleaned = 0;
  for (const id of testIdsToDelete) {
    await deleteProduct(id);
    cleaned++;
  }
  console.log(`Cleaned up ${cleaned} temporary test products.`);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Unhandled test error:', err);
  process.exit(1);
});
