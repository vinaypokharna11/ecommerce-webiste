import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scratch_audit_dump.json', 'utf8'));
const products = data.products || [];

console.log(`Total products: ${products.length}`);

const nonBulk = products.filter(p => !p.name.startsWith('Bulk Test Item'));
console.log(`\nNon-Bulk-Test Products count: ${nonBulk.length}`);

nonBulk.forEach((p, idx) => {
  console.log(`[${idx}] name="${p.name}", id="${p.id}", sku="${p.sku}", cat="${p.category}", price=${p.price}, stock=${p.stockCount}, deleted=${p.isDeleted}, date=${p.createdAt}, img="${p.image}"`);
});

const bulk = products.filter(p => p.name.startsWith('Bulk Test Item'));
console.log(`\nBulk-Test Products count: ${bulk.length}`);
if (bulk.length > 0) {
  console.log(`Bulk test sample: name="${bulk[0].name}", deleted=${bulk[0].isDeleted}, date=${bulk[0].createdAt}`);
}
