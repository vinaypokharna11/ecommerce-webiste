import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scratch_audit_dump.json', 'utf8'));

console.log('================ AUDIT USERS ================');
const users = data.users || [];
console.log(`Total users in Mongo: ${users.length}`);
users.forEach((u, i) => {
  console.log(`[${i}] email="${u.email}", name="${u.name}", role="${u.role}", id="${u.id}", created="${u.createdAt}"`);
});

console.log('\n================ AUDIT ORDERS ================');
const orders = data.orders || [];
console.log(`Total orders in Mongo: ${orders.length}`);
orders.forEach((o, i) => {
  console.log(`[${i}] id="${o.id}", customerName="${o.customerName}", email="${o.customerEmail}", status="${o.status}", amount=${o.amount}, items=${(o.items||[]).map(x=>x.name||x.id).join('; ')}, created="${o.createdAt}"`);
});

console.log('\n================ AUDIT REVIEWS ================');
const reviews = data.reviews || [];
console.log(`Total reviews in Mongo: ${reviews.length}`);
reviews.forEach((r, i) => {
  console.log(`[${i}] id="${r.id}", prod="${r.productId}", user="${r.userId}", rating=${r.rating}, comment="${r.comment}", created="${r.createdAt}"`);
});

console.log('\n================ AUDIT CATEGORIES ================');
const categories = data.categories || [];
console.log(`Total categories in Mongo: ${categories.length}`);
categories.forEach((c, i) => {
  console.log(`[${i}] id="${c.id}", name="${c.name}", created="${c.createdAt}"`);
});

console.log('\n================ AUDIT OFFERS ================');
const offers = data.offers || [];
console.log(`Total offers in Mongo: ${offers.length}`);
offers.forEach((o, i) => {
  console.log(`[${i}] id="${o.id}", code="${o.code}", name="${o.title||o.name}", status="${o.status}", created="${o.createdAt}"`);
});

console.log('\n================ AUDIT EXPLORE COLLECTIONS ================');
const exp = data.explorecollections || [];
console.log(`Total explorecollections in Mongo: ${exp.length}`);
exp.forEach((e, i) => {
  console.log(`[${i}] id="${e.id}", name="${e.name}", isDeleted=${e.isDeleted}, isActive=${e.isActive}, created="${e.createdAt}"`);
});

console.log('\n================ AUDIT STORE CONFIGS ================');
const cfg = data.storeconfigs || [];
console.log(`Total storeconfigs in Mongo: ${cfg.length}`);
cfg.forEach((c, i) => {
  console.log(`[${i}] name="${c.name}", tagline="${c.tagline}", created="${c.createdAt}"`);
});
