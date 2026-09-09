const port = process.env.PORT || 3000;
const altPort = 3001;

async function checkPort(p) {
  try {
    const res = await fetch(`http://localhost:${p}/api/catalog`);
    if (res.ok) return p;
  } catch (e) {}
  return null;
}

async function run() {
  const activePort = (await checkPort(3000)) || (await checkPort(3001));
  if (!activePort) {
    console.log('Server not responding on 3000 or 3001');
    return;
  }
  console.log(`Server responsive on port ${activePort}`);

  const catRes = await fetch(`http://localhost:${activePort}/api/catalog`);
  const catData = await catRes.json();
  console.log(`GET /api/catalog: status ${catRes.status}, products: ${catData.products?.length || 0}`);

  const wishRes = await fetch(`http://localhost:${activePort}/api/wishlist`);
  console.log(`GET /api/wishlist (unauth): status ${wishRes.status}`);

  const cartRes = await fetch(`http://localhost:${activePort}/api/cart`);
  console.log(`GET /api/cart (unauth): status ${cartRes.status}`);
}

run();
