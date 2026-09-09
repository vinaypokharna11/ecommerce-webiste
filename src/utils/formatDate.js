/**
 * formatDate Utility
 *
 * Centralized date and timestamp formatting helpers for orders, inquiries,
 * reviews, and admin dashboard timelines.
 */

/**
 * Formats a Date object or ISO string into a human-readable display date.
 * Example: "8 Sep 2026, 04:30 PM"
 *
 * @param {string|Date|number} input
 * @param {object} [options]
 * @returns {string} Formatted date string
 */
export function formatDateTime(input, options = {}) {
  if (!input) return '—';
  const date = new Date(input);
  if (isNaN(date.getTime())) return String(input);

  const { showTime = true } = options;

  const dateStr = date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (!showTime) return dateStr;

  const timeStr = date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${dateStr}, ${timeStr}`;
}

/**
 * Formats a date into a compact standard date (e.g. "08 Sep 2026").
 *
 * @param {string|Date|number} input
 * @returns {string}
 */
export function formatDate(input) {
  return formatDateTime(input, { showTime: false });
}

/**
 * Returns a relative time string (e.g., "Just now", "5 mins ago", "Yesterday").
 *
 * @param {string|Date|number} input
 * @returns {string}
 */
export function formatRelativeTime(input) {
  if (!input) return '—';
  const date = new Date(input);
  if (isNaN(date.getTime())) return String(input);

  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

  return formatDate(date);
}

export default formatDate;
