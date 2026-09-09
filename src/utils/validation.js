/**
 * validation Utility
 *
 * Centralized client- and server-safe validation helpers for forms,
 * authentication, and order processing.
 */

/**
 * Validates an email address against RFC 5322 regex.
 *
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Validates an Indian phone number (10 digits, optional +91 prefix).
 *
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  // Matches 10 digits or 12 digits starting with 91
  return digits.length === 10 || (digits.length === 12 && digits.startsWith('91'));
}

/**
 * Validates password strength (minimum length).
 *
 * @param {string} password
 * @param {number} [minLength=6]
 * @returns {{ isValid: boolean, message?: string }}
 */
export function validatePassword(password, minLength = 6) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required.' };
  }
  if (password.length < minLength) {
    return { isValid: false, message: `Password must be at least ${minLength} characters long.` };
  }
  return { isValid: true };
}

/**
 * Sanitizes input string to prevent script injection in user-entered fields.
 *
 * @param {string} str
 * @returns {string}
 */
export function sanitizeString(str) {
  if (!str || typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
}
