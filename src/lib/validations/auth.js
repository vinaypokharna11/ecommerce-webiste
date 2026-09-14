import { z } from 'zod';
import { NextResponse } from 'next/server';

/**
 * ── Generic User-Facing Error Message ──
 * Per security best practices and strict user requirements:
 * NEVER reveal which field failed, whether the email exists, or which regex constraint was breached.
 */
export const GENERIC_AUTH_ERROR_MESSAGE = 'Invalid input provided. Please check your details and try again.';

/**
 * Strips HTML tags, script blocks, event handlers, and dangerous control characters.
 * @param {unknown} val
 * @returns {string}
 */
export function stripHtmlAndScripts(val) {
  if (val === null || val === undefined) return '';
  let str = String(val);

  // 1. Remove null bytes and invisible control characters (except standard space/tab/newline)
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Strip <script>...</script> and <style>...</style> including multi-line content
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  str = str.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 3. Strip all HTML tags
  str = str.replace(/<[^>]*>/g, '');

  // 4. Strip dangerous pseudo-protocols like javascript:, vbscript:, data:text/html
  str = str.replace(/(javascript|vbscript|data):/gi, '');

  // 5. Strip inline DOM event handlers (e.g. onerror=, onclick=)
  str = str.replace(/\bon\w+\s*=/gi, '');

  return str.trim();
}

/**
 * Sanitizes display names / usernames:
 * - Strips HTML and script tags
 * - Strips special characters not permitted in names/usernames
 * - Allows only standard letters, numbers, spaces, and safe punctuation: . _ ' -
 * @param {unknown} val
 * @returns {string}
 */
export function sanitizeDisplayName(val) {
  const clean = stripHtmlAndScripts(val);
  // Keep only unicode letters, numbers, spaces, dots, underscores, hyphens, and apostrophes
  return clean.replace(/[^\p{L}\p{N}\s._'-]/gu, '').replace(/\s+/g, ' ').trim();
}

/**
 * Sanitizes email addresses:
 * - Strips HTML/scripts and control characters
 * - Strips any internal whitespace
 * - Converts to lower case
 * @param {unknown} val
 * @returns {string}
 */
export function sanitizeEmail(val) {
  const clean = stripHtmlAndScripts(val);
  return clean.replace(/\s+/g, '').toLowerCase().trim();
}

/**
 * Sanitizes password input:
 * - Removes null bytes and dangerous control characters while preserving password characters
 * @param {unknown} val
 * @returns {string}
 */
export function sanitizePassword(val) {
  if (val === null || val === undefined) return '';
  return String(val).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Sanitizes phone numbers:
 * - Keeps digits only
 * @param {unknown} val
 * @returns {string}
 */
export function sanitizePhone(val) {
  if (val === null || val === undefined) return '';
  return String(val).replace(/\D/g, '').trim();
}

/**
 * ── ZOD SCHEMAS ──
 */

// Login Schema (email + password)
export const loginInputSchema = z.object({
  email: z
    .string()
    .trim()
    .min(5, 'Email too short')
    .max(255, 'Email too long')
    .email('Invalid email format')
    .refine((val) => !/[<>'"\s]/.test(val), 'Invalid characters in email'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password too long to prevent computational DoS'),
});

// Signup Schema (name/username/displayName, email, password, optional phone, address)
export const signupInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name too short')
    .max(70, 'Name too long')
    .regex(/^[\p{L}\p{N}\s._'-]+$/u, 'Name contains invalid characters'),
  email: z
    .string()
    .trim()
    .min(5, 'Email too short')
    .max(255, 'Email too long')
    .email('Invalid email format')
    .refine((val) => !/[<>'"\s]/.test(val), 'Invalid characters in email'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password too long to prevent computational DoS'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || (val.length >= 10 && val.length <= 15 && /^\d+$/.test(val)), {
      message: 'Phone must be between 10 and 15 digits',
    }),
  address: z
    .string()
    .trim()
    .max(200, 'Address too long')
    .optional(),
  city: z
    .string()
    .trim()
    .max(100, 'City name too long')
    .optional(),
  pincode: z
    .string()
    .trim()
    .max(10, 'Pincode too long')
    .optional(),
});

/**
 * Masks an email address for safe server-side logging without leaking PII:
 * e.g. "johndoe@example.com" -> "jo***@example.com"
 * @param {string} email
 * @returns {string}
 */
export function maskEmailForLogs(email) {
  if (!email || typeof email !== 'string') return '[missing]';
  const parts = email.split('@');
  if (parts.length !== 2) return '[invalid_format]';
  const user = parts[0];
  const domain = parts[1];
  const maskedUser = user.length <= 2 
    ? user[0] + '***' 
    : user.slice(0, 2) + '***' + user.slice(-1);
  return `${maskedUser}@${domain}`;
}

/**
 * Masks a display name or username for safe logging:
 * e.g. "Vishal Sharma" -> "Vi***"
 * @param {string} name
 * @returns {string}
 */
export function maskNameForLogs(name) {
  if (!name || typeof name !== 'string') return '[missing]';
  return name.length <= 2 ? name[0] + '***' : name.slice(0, 2) + '***';
}

/**
 * Logs authentication validation failure server-side for security monitoring & SIEM ingestion.
 * NEVER logs passwords or sensitive credential values.
 * @param {Object} params
 * @param {string} params.route - e.g. 'POST /api/auth/login'
 * @param {string} params.ip - Client IP address
 * @param {z.ZodError} params.zodError - Zod validation error
 * @param {Object} [params.meta] - Safe metadata (masked email, masked name, headers)
 */
export function logAuthValidationFailure({ route, ip, zodError, meta = {} }) {
  const issues = zodError?.issues?.map((issue) => ({
    field: issue.path.join('.') || 'root',
    code: issue.code,
    message: issue.message,
  })) || [];

  const logPayload = {
    event: 'AUTH_VALIDATION_FAILURE',
    timestamp: new Date().toISOString(),
    route: route || 'unknown_auth_route',
    ip: ip || 'unknown_ip',
    fieldsFailed: issues.map((i) => i.field),
    issues,
    meta: {
      emailMasked: meta.email ? maskEmailForLogs(meta.email) : undefined,
      nameMasked: meta.name ? maskNameForLogs(meta.name) : undefined,
      phoneDigits: meta.phone ? meta.phone.length : undefined,
      hasPassword: Boolean(meta.hasPassword),
      passwordLength: meta.passwordLength,
    },
  };

  console.warn(`[AUTH_VALIDATION_FAILURE] ${JSON.stringify(logPayload)}`);
}

/**
 * Generates a standardized, generic 400 Bad Request error response for validation failures.
 * Does NOT leak which field failed or internal validation rules.
 * @returns {NextResponse}
 */
export function genericAuthValidationErrorResponse() {
  return NextResponse.json(
    {
      success: false,
      error: GENERIC_AUTH_ERROR_MESSAGE,
    },
    { status: 400 }
  );
}

/**
 * Sanitizes and validates login input.
 * @param {Object} rawBody
 * @param {string} ip
 * @param {string} [route='POST /api/auth/login']
 * @returns {{ isValid: true, data: { email: string, password: string } } | { isValid: false, response: NextResponse }}
 */
export function validateAndSanitizeLogin(rawBody, ip, route = 'POST /api/auth/login') {
  if (!rawBody || typeof rawBody !== 'object') {
    logAuthValidationFailure({
      route,
      ip,
      zodError: { issues: [{ path: ['body'], code: 'invalid_type', message: 'Request body must be an object' }] },
      meta: {},
    });
    return { isValid: false, response: genericAuthValidationErrorResponse() };
  }

  // Detect HTML/script injection attempts in credentials
  const hasScriptInEmail = typeof rawBody.email === 'string' && /<[^>]*>|script\b|javascript:/i.test(rawBody.email);
  const hasScriptInPassword = typeof rawBody.password === 'string' && /<script\b|<style\b/i.test(rawBody.password);

  if (hasScriptInEmail || hasScriptInPassword) {
    logAuthValidationFailure({
      route,
      ip,
      zodError: {
        issues: [
          ...(hasScriptInEmail ? [{ path: ['email'], code: 'custom', message: 'Email contains forbidden HTML or script tags' }] : []),
          ...(hasScriptInPassword ? [{ path: ['password'], code: 'custom', message: 'Password contains forbidden script tags' }] : []),
        ],
      },
      meta: {
        email: rawBody.email,
        hasPassword: Boolean(rawBody.password),
        passwordLength: typeof rawBody.password === 'string' ? rawBody.password.length : 0,
      },
    });
    return { isValid: false, response: genericAuthValidationErrorResponse() };
  }

  // Sanitize fields
  const sanitized = {
    email: sanitizeEmail(rawBody.email),
    password: sanitizePassword(rawBody.password),
  };

  const parseResult = loginInputSchema.safeParse(sanitized);

  if (!parseResult.success) {
    logAuthValidationFailure({
      route,
      ip,
      zodError: parseResult.error,
      meta: {
        email: rawBody.email,
        hasPassword: Boolean(rawBody.password),
        passwordLength: typeof rawBody.password === 'string' ? rawBody.password.length : 0,
      },
    });
    return { isValid: false, response: genericAuthValidationErrorResponse() };
  }

  return { isValid: true, data: parseResult.data };
}

/**
 * Sanitizes and validates signup input.
 * Accepts `name`, `username`, or `displayName`.
 * @param {Object} rawBody
 * @param {string} ip
 * @param {string} [route='POST /api/auth/signup']
 * @returns {{ isValid: true, data: Object } | { isValid: false, response: NextResponse }}
 */
export function validateAndSanitizeSignup(rawBody, ip, route = 'POST /api/auth/signup') {
  if (!rawBody || typeof rawBody !== 'object') {
    logAuthValidationFailure({
      route,
      ip,
      zodError: { issues: [{ path: ['body'], code: 'invalid_type', message: 'Request body must be an object' }] },
      meta: {},
    });
    return { isValid: false, response: genericAuthValidationErrorResponse() };
  }

  // Accept name, username, or displayName
  const rawName = rawBody.name || rawBody.username || rawBody.displayName;

  // Detect HTML/script injection attempts
  const hasScriptInName = typeof rawName === 'string' && /<[^>]*>|script\b|javascript:/i.test(rawName);
  const hasScriptInEmail = typeof rawBody.email === 'string' && /<[^>]*>|script\b|javascript:/i.test(rawBody.email);
  const hasScriptInPassword = typeof rawBody.password === 'string' && /<script\b|<style\b/i.test(rawBody.password);

  if (hasScriptInName || hasScriptInEmail || hasScriptInPassword) {
    logAuthValidationFailure({
      route,
      ip,
      zodError: {
        issues: [
          ...(hasScriptInName ? [{ path: ['name'], code: 'custom', message: 'Name contains forbidden HTML or script tags' }] : []),
          ...(hasScriptInEmail ? [{ path: ['email'], code: 'custom', message: 'Email contains forbidden HTML or script tags' }] : []),
          ...(hasScriptInPassword ? [{ path: ['password'], code: 'custom', message: 'Password contains forbidden script tags' }] : []),
        ],
      },
      meta: {
        name: rawName,
        email: rawBody.email,
        phone: rawBody.phone,
        hasPassword: Boolean(rawBody.password),
        passwordLength: typeof rawBody.password === 'string' ? rawBody.password.length : 0,
      },
    });
    return { isValid: false, response: genericAuthValidationErrorResponse() };
  }

  const sanitized = {
    name: sanitizeDisplayName(rawName),
    email: sanitizeEmail(rawBody.email),
    password: sanitizePassword(rawBody.password),
    phone: sanitizePhone(rawBody.phone),
    address: stripHtmlAndScripts(rawBody.address),
    city: stripHtmlAndScripts(rawBody.city),
    pincode: stripHtmlAndScripts(rawBody.pincode),
  };

  const parseResult = signupInputSchema.safeParse(sanitized);

  if (!parseResult.success) {
    logAuthValidationFailure({
      route,
      ip,
      zodError: parseResult.error,
      meta: {
        name: rawName,
        email: rawBody.email,
        phone: rawBody.phone,
        hasPassword: Boolean(rawBody.password),
        passwordLength: typeof rawBody.password === 'string' ? rawBody.password.length : 0,
      },
    });
    return { isValid: false, response: genericAuthValidationErrorResponse() };
  }

  return { isValid: true, data: parseResult.data };
}
