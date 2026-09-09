/**
 * In-Memory Sliding Window Rate Limiter & Account Brute-Force Protection
 * Protects authentication and sensitive API endpoints from brute-force & denial-of-service attacks.
 */

const rateLimitStore = new Map();
const accountLockoutStore = new Map();

// Periodic cleanup of expired rate limit and lockout buckets every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
      if (now > data.resetTime) {
        rateLimitStore.delete(key);
      }
    }
    for (const [key, data] of accountLockoutStore.entries()) {
      if (now > data.resetTime) {
        accountLockoutStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Checks and updates rate limit for a given key (e.g. IP + endpoint).
 * @param {string} key Unique identifier (e.g. `login:192.168.1.1`)
 * @param {number} maxAttempts Maximum allowed requests in the window
 * @param {number} windowMs Time window in milliseconds (default: 60,000ms = 1 minute)
 * @returns {{ isAllowed: boolean, remaining: number, resetTime: number, retryAfterSec: number }}
 */
export function checkRateLimit(key, maxAttempts = 5, windowMs = 60 * 1000) {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    const newRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, newRecord);
    return {
      isAllowed: true,
      remaining: maxAttempts - 1,
      resetTime: newRecord.resetTime,
      retryAfterSec: 0,
    };
  }

  if (record.count >= maxAttempts) {
    const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
    return {
      isAllowed: false,
      remaining: 0,
      resetTime: record.resetTime,
      retryAfterSec: Math.max(1, retryAfterSec),
    };
  }

  record.count += 1;
  return {
    isAllowed: true,
    remaining: maxAttempts - record.count,
    resetTime: record.resetTime,
    retryAfterSec: 0,
  };
}

/**
 * Checks whether an account/email is currently locked out due to repeated failed logins.
 */
export function checkAccountLockout(email, maxAttempts = 5) {
  if (!email || typeof email !== 'string') return { isLocked: false, retryAfterSec: 0 };
  const key = `acc:${email.toLowerCase().trim()}`;
  const now = Date.now();
  const record = accountLockoutStore.get(key);

  if (!record || now > record.resetTime) {
    return { isLocked: false, retryAfterSec: 0 };
  }

  if (record.count >= maxAttempts) {
    const retryAfterSec = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    return { isLocked: true, retryAfterSec };
  }

  return { isLocked: false, retryAfterSec: 0 };
}

/**
 * Records a failed login attempt against an account.
 */
export function recordFailedLogin(email, lockoutWindowMs = 5 * 60 * 1000) {
  if (!email || typeof email !== 'string') return;
  const key = `acc:${email.toLowerCase().trim()}`;
  const now = Date.now();
  const record = accountLockoutStore.get(key);

  if (!record || now > record.resetTime) {
    accountLockoutStore.set(key, { count: 1, resetTime: now + lockoutWindowMs });
  } else {
    record.count += 1;
  }
}

/**
 * Clears account lockout record upon successful authentication.
 */
export function resetAccountLockout(email) {
  if (!email || typeof email !== 'string') return;
  const key = `acc:${email.toLowerCase().trim()}`;
  accountLockoutStore.delete(key);
}

const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const IPV6_REGEX = /^([0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{1,4}$/;

function sanitizeIp(ip) {
  if (!ip || typeof ip !== 'string') return '127.0.0.1';
  const clean = ip.trim();
  if (IPV4_REGEX.test(clean) || IPV6_REGEX.test(clean) || clean === '::1') {
    return clean;
  }
  return '127.0.0.1';
}

/**
 * Extracts client IP from Next.js Request headers with strict format sanitization.
 */
export function getClientIp(request) {
  if (!request || !request.headers) return '127.0.0.1';
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    return sanitizeIp(firstIp);
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return sanitizeIp(realIp.trim());
  }
  return '127.0.0.1';
}

/**
 * Standard HTTP 429 Too Many Requests response helper with Retry-After header.
 */
export function rateLimitExceededResponse(retryAfterSec = 60, message = 'Too many requests. Please try again later.') {
  return Response.json(
    {
      success: false,
      error: message,
      retryAfter: retryAfterSec,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSec),
      },
    }
  );
}
