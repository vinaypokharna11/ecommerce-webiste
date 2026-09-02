/**
 * In-Memory Sliding Window Rate Limiter
 * Protects authentication and sensitive API endpoints from brute-force & denial-of-service attacks.
 */

const rateLimitStore = new Map();

// Periodic cleanup of expired rate limit buckets every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
      if (now > data.resetTime) {
        rateLimitStore.delete(key);
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
 * Extracts client IP from Next.js Request headers.
 */
export function getClientIp(request) {
  if (!request || !request.headers) return '127.0.0.1';
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
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
