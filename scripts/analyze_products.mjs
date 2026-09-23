import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scratch_audit_dump.json', 'utf8'));

console.log('=== PRODUCTS ANALYSIS ===');
const products = data.products || [];
console.log(`Total products: ${products.length}`);

// Group by name
const nameCounts = {};
products.forEach(p => {
  const name = p.name;
  if (!nameCounts[name]) nameCounts[name] = [];
  nameCounts[name].push({
    _id: p._id,
    id: p.id,
    sku: p.sku,
    category: p.category,
    price: p.price,
    stockCount: p.stockCount,
    isDeleted: p.isDeleted,
    createdAt: p.createdAt,
    image: p.image?.slice(0, 40)
  });
});

for (const [name, list] of Object.entries(nameCounts)) {
  console.log(`\nProduct "${name}" (Count: ${list.length}):`);
  list.forEach(item => {
    console.log(`  id=${item.id}, sku=${item.sku}, cat=${item.category}, price=${item.price}, stock=${item.stockCount}, deleted=${item.isDeleted}, date=${item.createdAt}`);
  });
}
