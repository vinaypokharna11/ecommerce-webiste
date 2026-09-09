/**
 * formatPrice Utility
 *
 * Centralized currency and price formatting helper for Nakoda Imitation.
 * Adheres to Indian number formatting conventions (e.g., ₹1,49,999).
 *
 * Responsibilities:
 * - Safely coerce incoming values (strings, numbers, null, undefined)
 * - Support optional currency prefix (default: ₹)
 * - Provide compact formatting when needed
 *
 * @param {number|string} amount - The numeric price to format
 * @param {string} [currency='₹'] - The currency symbol to prepend
 * @param {object} [options] - Additional formatting options
 * @param {boolean} [options.includeDecimals=false] - Whether to show paise/cents
 * @returns {string} Formatted price string (e.g., "₹3,499")
 */
export function formatPrice(amount, currency = '₹', options = {}) {
  const num = Number(amount);
  if (isNaN(num) || num === null || num === undefined) {
    return `${currency}0`;
  }

  const { includeDecimals = false } = options;

  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  });

  return `${currency}${formatted}`;
}

/**
 * Calculates discount percentage between old and current price.
 *
 * @param {number} currentPrice
 * @param {number} originalPrice
 * @returns {number} Integer discount percentage (e.g., 25)
 */
export function calculateDiscountPercent(currentPrice, originalPrice) {
  const curr = Number(currentPrice);
  const orig = Number(originalPrice);
  if (!orig || orig <= curr) return 0;
  return Math.round(((orig - curr) / orig) * 100);
}

export default formatPrice;
