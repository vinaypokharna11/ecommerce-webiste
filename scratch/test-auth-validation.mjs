// scratch/test-auth-validation.mjs
// Run automated tests against the running Next.js server on http://localhost:3000

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(name, url, payload, expectedStatus = 400, expectGenericError = true) {
  console.log(`\n========================================`);
  console.log(`TEST: ${name}`);
  console.log(`POST ${url}`);
  console.log(`Payload:`, JSON.stringify(payload));

  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    console.log(`Status: ${res.status} (Expected: ${expectedStatus})`);
    console.log(`Response:`, JSON.stringify(data));

    const statusMatch = res.status === expectedStatus;
    let errorMatch = true;

    if (expectGenericError) {
      const expectedError = 'Invalid input provided. Please check your details and try again.';
      errorMatch = data.error === expectedError;
      if (!errorMatch) {
        console.error(`❌ FAILED: Expected error "${expectedError}", but received: "${data.error}"`);
      }
    }

    if (statusMatch && errorMatch) {
      console.log(`✅ PASSED`);
      return true;
    } else {
      console.error(`❌ FAILED`);
      return false;
    }
  } catch (err) {
    console.error(`❌ Exception:`, err.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Server-Side Auth Validation Tests on', BASE_URL);

  let passed = 0;
  let total = 0;

  async function record(testPromise) {
    total++;
    const res = await testPromise;
    if (res) passed++;
  }

  // ── 1. LOGIN ROUTE TESTS (/api/auth/login) ──
  await record(testEndpoint(
    'Login: Empty payload',
    '/api/auth/login',
    {},
    400,
    true
  ));

  await record(testEndpoint(
    'Login: Invalid email format (missing domain)',
    '/api/auth/login',
    { email: 'notanemail', password: 'password123' },
    400,
    true
  ));

  await record(testEndpoint(
    'Login: Password too short (< 6 chars)',
    '/api/auth/login',
    { email: 'test@example.com', password: '123' },
    400,
    true
  ));

  await record(testEndpoint(
    'Login: Password too long (> 128 chars DoS test)',
    '/api/auth/login',
    { email: 'test@example.com', password: 'A'.repeat(129) },
    400,
    true
  ));

  await record(testEndpoint(
    'Login: XSS injection attempt in email',
    '/api/auth/login',
    { email: '<script>alert(1)</script>test@example.com', password: 'password123' },
    400,
    true
  ));

  // ── 2. ADMIN LOGIN ROUTE TESTS (/api/admin/login) ──
  await record(testEndpoint(
    'Admin Login: Invalid email format',
    '/api/admin/login',
    { email: 'admin@@bad', password: 'password123' },
    400,
    true
  ));

  await record(testEndpoint(
    'Admin Login: Short password (< 6 chars)',
    '/api/admin/login',
    { email: 'admin@nakodaimitation.com', password: '12' },
    400,
    true
  ));

  // ── 3. SIGNUP ROUTE TESTS (/api/auth/signup) ──
  await record(testEndpoint(
    'Signup: Empty payload',
    '/api/auth/signup',
    {},
    400,
    true
  ));

  await record(testEndpoint(
    'Signup: Name too short (< 2 chars)',
    '/api/auth/signup',
    { name: 'A', email: 'valid@example.com', password: 'securePassword1' },
    400,
    true
  ));

  await record(testEndpoint(
    'Signup: Name with script tag injection',
    '/api/auth/signup',
    { name: '<script>alert("hacked")</script>', email: 'valid@example.com', password: 'securePassword1' },
    400,
    true
  ));

  await record(testEndpoint(
    'Signup: Invalid phone number (< 10 digits)',
    '/api/auth/signup',
    { name: 'John Doe', email: 'john@example.com', password: 'securePassword1', phone: '12345' },
    400,
    true
  ));

  await record(testEndpoint(
    'Signup: Password too short',
    '/api/auth/signup',
    { name: 'John Doe', email: 'john@example.com', password: '12345' },
    400,
    true
  ));

  // ── 4. VALID CREDENTIAL TEST (Legitimate user format verification) ──
  // A valid-looking login that passes input validation (even if credentials don't match, status will be 401, NOT 400 validation error!)
  await record(testEndpoint(
    'Login: Valid format with non-existent user returns 401 Unauthorized, not 400 Validation error',
    '/api/auth/login',
    { email: 'validformat998877@example.com', password: 'ValidPassword123' },
    401,
    false // this is handled by database lookup, so it returns "Invalid email or password"
  ));

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} / ${total} tests passed.`);
  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error(`⚠️ ${total - passed} tests failed.`);
    process.exit(1);
  }
}

runAllTests();
