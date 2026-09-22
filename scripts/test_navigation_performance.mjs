import http from 'http';

const PORT = process.env.TEST_PORT || process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

function fetchUrl(path, options = {}) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const url = new URL(path, BASE_URL);
    const req = http.request(url, { method: options.method || 'GET', headers: options.headers || {} }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const duration = performance.now() - start;
        resolve({
          status: res.statusCode,
          headers: res.headers,
          durationMs: Math.round(duration),
          body: data,
        });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runPerformanceAudit() {
  console.log(`⚡ Starting Navigation & Page Rendering Performance Audit on port ${PORT}...\n`);

  const tests = [
    { name: 'Storefront Homepage (/)', path: '/' },
    { name: 'Direct Catalog Tab (/?tab=catalog)', path: '/?tab=catalog' },
    { name: 'Direct Offers Tab (/?tab=offers)', path: '/?tab=offers' },
    { name: 'Direct Cart Tab (/?tab=cart)', path: '/?tab=cart' },
    { name: 'Direct Profile Tab (/?tab=profile)', path: '/?tab=profile' },
    { name: 'Catalog Sub-route (/catalog)', path: '/catalog' },
    { name: 'Cart Sub-route (/cart)', path: '/cart' },
    { name: 'Offers Sub-route (/offers)', path: '/offers' },
    { name: 'Product Detail Page (/product/prod-1)', path: '/product/prod-1' },
    { name: 'Unified Catalog API (/api/catalog)', path: '/api/catalog' },
    { name: 'Products API (/api/products)', path: '/api/products' },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const res = await fetchUrl(test.path);
      const isSuccess = res.status === 200 || res.status === 307 || res.status === 308;

      if (isSuccess) {
        console.log(`✅ [PASS] ${test.name.padEnd(45)} | Status: ${res.status} | Response Time: ${res.durationMs}ms`);
        passed++;
      } else {
        console.error(`❌ [FAIL] ${test.name.padEnd(45)} | Status: ${res.status} | Response Time: ${res.durationMs}ms`);
        failed++;
      }
    } catch (err) {
      console.error(`❌ [ERROR] ${test.name.padEnd(45)} | Error: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Navigation Performance Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPerformanceAudit();
