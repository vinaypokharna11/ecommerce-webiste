/**
 * stockRules.js
 *
 * Centralized business rules and thresholds for product stock status,
 * purchasability verification, and human-readable badges across
 * frontend and backend.
 */

export const STOCK_THRESHOLDS = {
  LOW_STOCK_MIN: 1,
  LOW_STOCK_MAX: 4,
  IN_STOCK_MIN: 5,
};

/**
 * Calculates stockStatus enum value from numeric stock count.
 * @param {number|string} stockCount
 * @returns {'out_of_stock' | 'low_stock' | 'in_stock'}
 */
export function getStockStatus(stockCount) {
  const count = Math.max(0, parseInt(stockCount, 10) || 0);
  if (count <= 0) return 'out_of_stock';
  if (count < STOCK_THRESHOLDS.IN_STOCK_MIN) return 'low_stock';
  return 'in_stock';
}

/**
 * Returns formatted display label for stock status.
 * @param {string|number} statusOrCount
 * @returns {string}
 */
export function getStockStatusLabel(statusOrCount) {
  const status = typeof statusOrCount === 'number'
    ? getStockStatus(statusOrCount)
    : statusOrCount;

  switch (status) {
    case 'out_of_stock':
      return 'Out of Stock';
    case 'low_stock':
      return 'Low Stock';
    case 'in_stock':
    default:
      return 'In Stock';
  }
}

/**
 * Centralized purchasability evaluator.
 * Checks existence, soft-delete state, active status, and stock availability.
 * @param {object} product
 * @param {number} requestedQty
 * @returns {{ purchasable: boolean, reason: string, availableStock: number }}
 */
export function evaluateProductPurchasability(product, requestedQty = 1) {
  if (!product) {
    return { purchasable: false, reason: 'Product does not exist', availableStock: 0 };
  }

  if (product.isDeleted === true || product.status === 'deleted') {
    return { purchasable: false, reason: 'This product is no longer available', availableStock: 0 };
  }

  if (product.status && product.status !== 'active') {
    return { purchasable: false, reason: 'This product is currently inactive', availableStock: 0 };
  }

  const stock = typeof product.stockCount === 'number' ? Math.max(0, product.stockCount) : 0;
  const safeQty = Math.max(1, parseInt(requestedQty, 10) || 1);

  if (stock <= 0 || product.stockStatus === 'out_of_stock') {
    return { purchasable: false, reason: 'This product is currently out of stock', availableStock: 0 };
  }

  if (stock < safeQty) {
    return {
      purchasable: false,
      reason: `Only ${stock} unit${stock === 1 ? '' : 's'} available`,
      availableStock: stock,
    };
  }

  return { purchasable: true, reason: '', availableStock: stock };
}

export function isProductPurchasable(product, requestedQty = 1) {
  return evaluateProductPurchasability(product, requestedQty).purchasable;
}
