import Offer from '../models/Offer.js';
import CouponUsage from '../models/CouponUsage.js';
import connectToDatabase from './mongodb.js';
import fs from 'fs';
import path from 'path';

const DB_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

function readJSONDB() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {}
  return { offers: [], couponUsages: [] };
}

/**
 * Helper to check if a coupon has expired based on endDate or text expiry
 */
export function isCouponExpired(offer) {
  if (!offer) return true;
  if (offer.status === 'EXPIRED') return true;

  if (offer.endDate) {
    const end = new Date(offer.endDate);
    if (!isNaN(end.getTime()) && end.getTime() < Date.now()) {
      return true;
    }
  }

  // Check if string expiry has an explicit ISO date or parseable full date in the past
  if (offer.expiry && typeof offer.expiry === 'string') {
    const isoMatch = offer.expiry.match(/\d{4}-\d{2}-\d{2}/);
    if (isoMatch) {
      const end = new Date(isoMatch[0]);
      if (!isNaN(end.getTime()) && end.getTime() + 86400000 < Date.now()) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Centralized coupon validator.
 * Serves as the authoritative source of truth across Cart, Checkout, and APIs.
 *
 * @param {Object} params
 * @param {string} params.couponCode - The user-entered coupon code
 * @param {string|null} [params.userId] - Authenticated user's unique ID
 * @param {Array} [params.items=[]] - Array of cart/order items [{ price, quantity, category, ... }]
 * @param {number|null} [params.cartSubtotal] - Pre-calculated items subtotal (optional)
 * @returns {Promise<Object>} Structured validation result
 */
export async function validateCoupon({ couponCode, userId = null, items = [], cartSubtotal = null }) {
  const cleanCode = String(couponCode || '').trim().toUpperCase();

  if (!cleanCode) {
    return {
      valid: false,
      code: 'COUPON_NOT_FOUND',
      message: 'Please enter a coupon code.',
    };
  }

  const db = await connectToDatabase();
  let offer = null;

  if (db) {
    // Lookup by code or id in MongoDB
    offer = await Offer.findOne({
      $or: [{ code: cleanCode }, { id: cleanCode.toLowerCase() }],
    }).lean();
  } else {
    // Fallback JSON DB
    const jdb = readJSONDB();
    offer = (jdb.offers || []).find(
      (o) => (o.code || '').trim().toUpperCase() === cleanCode || (o.id || '').toLowerCase() === cleanCode.toLowerCase()
    );
  }

  // 1. Check existence
  if (!offer) {
    return {
      valid: false,
      code: 'COUPON_NOT_FOUND',
      message: `Coupon code "${cleanCode}" is invalid.`,
    };
  }

  // 2. Check deletion (Soft delete protection)
  if (offer.isDeleted === true || offer.status === 'DELETED') {
    return {
      valid: false,
      code: 'COUPON_DELETED',
      message: 'This coupon is no longer available.',
    };
  }

  // 3. Check paused status
  if (offer.status === 'PAUSED' || offer.isActive === false) {
    return {
      valid: false,
      code: 'COUPON_PAUSED',
      message: 'This coupon is currently unavailable.',
    };
  }

  // 4. Check expiry
  if (isCouponExpired(offer)) {
    return {
      valid: false,
      code: 'COUPON_EXPIRED',
      message: 'This coupon has expired.',
    };
  }

  // 5. Check start date
  if (offer.startDate) {
    const start = new Date(offer.startDate);
    if (!isNaN(start.getTime()) && start.getTime() > Date.now()) {
      return {
        valid: false,
        code: 'COUPON_NOT_STARTED',
        message: 'This coupon is not yet active.',
      };
    }
  }

  // 6. Check overall usage limit
  if (typeof offer.usageLimit === 'number' && offer.usageLimit > 0) {
    if ((offer.usageCount || 0) >= offer.usageLimit) {
      return {
        valid: false,
        code: 'COUPON_USAGE_LIMIT_REACHED',
        message: 'This coupon usage limit has been reached.',
      };
    }
  }

  // 7. Check user-specific usage (One coupon use per user ID)
  if (userId) {
    const cleanUserId = String(userId).trim();
    let alreadyUsed = false;

    if (db) {
      const existingUsage = await CouponUsage.findOne({
        $or: [{ couponId: offer.id }, { couponCode: cleanCode }],
        userId: cleanUserId,
      }).lean();
      if (existingUsage) alreadyUsed = true;
    } else {
      const jdb = readJSONDB();
      const usages = jdb.couponUsages || [];
      alreadyUsed = usages.some(
        (u) =>
          ((u.couponId && u.couponId === offer.id) || (u.couponCode && u.couponCode.toUpperCase() === cleanCode)) &&
          String(u.userId) === cleanUserId
      );
    }

    if (alreadyUsed) {
      return {
        valid: false,
        code: 'COUPON_ALREADY_USED',
        message: 'This coupon has already been used on your account.',
      };
    }
  }

  // 8. Calculate item subtotals and check category restrictions
  const safeItems = Array.isArray(items) ? items : [];
  let totalSubtotal =
    typeof cartSubtotal === 'number' && cartSubtotal >= 0
      ? cartSubtotal
      : safeItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

  const offerCategory = (offer.category || 'all').toLowerCase().trim();
  let eligibleSubtotal = totalSubtotal;

  if (offerCategory !== 'all') {
    const eligibleItems = safeItems.filter((item) => {
      const itemCat = String(item.category || item.categoryId || '').toLowerCase().trim();
      return itemCat === offerCategory || itemCat.includes(offerCategory) || offerCategory.includes(itemCat);
    });

    if (safeItems.length > 0 && eligibleItems.length === 0) {
      return {
        valid: false,
        code: 'COUPON_CATEGORY_MISMATCH',
        message: `This coupon is only valid for "${offer.category}" products. No matching items found in your cart.`,
      };
    }

    eligibleSubtotal = eligibleItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
  }

  // 9. Check minimum order requirement
  const minAmount = Number(offer.minOrderAmount) || 0;
  if (minAmount > 0 && eligibleSubtotal < minAmount) {
    return {
      valid: false,
      code: 'MINIMUM_ORDER_NOT_MET',
      message: `Minimum order amount of ₹${minAmount} required for this coupon (current eligible: ₹${eligibleSubtotal}).`,
    };
  }

  // 10. Calculate discount amount server-side
  const discountPercent = Math.min(100, Math.max(0, Number(offer.discountPercent || offer.discount) || 0));
  const discountAmount = Math.round((eligibleSubtotal * discountPercent) / 100);
  const finalSubtotal = Math.max(0, totalSubtotal - discountAmount);

  return {
    valid: true,
    code: 'COUPON_VALID',
    coupon: {
      id: offer.id,
      code: offer.code,
      title: offer.title,
      subtitle: offer.subtitle || '',
      discountPercent,
      category: offer.category || 'all',
      description: offer.description || '',
      expiry: offer.expiry || '',
      minOrderAmount: minAmount,
    },
    discountPercent,
    discountAmount,
    eligibleSubtotal,
    subtotal: totalSubtotal,
    finalSubtotal,
    message: `Coupon "${offer.code}" applied! ${discountPercent}% discount saved ₹${discountAmount}.`,
  };
}
