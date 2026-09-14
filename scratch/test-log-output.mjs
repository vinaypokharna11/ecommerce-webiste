// scratch/test-log-output.mjs
import { validateAndSanitizeLogin, validateAndSanitizeSignup } from '../src/lib/validations/auth.js';

let logs = [];
const originalWarn = console.warn;
console.warn = (...args) => {
  logs.push(args.join(' '));
  originalWarn(...args);
};

console.log('--- Testing Server-Side Logging Output ---');

// 1. Trigger login validation failure
const loginRes = validateAndSanitizeLogin({ email: '<script>alert(1)</script>', password: '12' }, '192.168.1.100', 'POST /api/auth/login');
console.log('Login validation isValid:', loginRes.isValid);

// 2. Trigger signup validation failure
const signupRes = validateAndSanitizeSignup({ name: 'X', email: 'bad@', password: 'short' }, '10.0.0.5', 'POST /api/auth/signup');
console.log('Signup validation isValid:', signupRes.isValid);

// Verify logs
const hasAuthLog1 = logs.some(l => l.includes('[AUTH_VALIDATION_FAILURE]') && l.includes('POST /api/auth/login'));
const hasAuthLog2 = logs.some(l => l.includes('[AUTH_VALIDATION_FAILURE]') && l.includes('POST /api/auth/signup'));

console.log('Login log emitted:', hasAuthLog1);
console.log('Signup log emitted:', hasAuthLog2);

if (hasAuthLog1 && hasAuthLog2 && !loginRes.isValid && !signupRes.isValid) {
  console.log('✅ Server-side validation failure logging verified!');
  process.exit(0);
} else {
  console.error('❌ Logging verification failed');
  process.exit(1);
}
