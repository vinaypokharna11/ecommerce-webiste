import mongoose from 'mongoose';

/**
 * CouponUsageSchema
 * Tracks coupon consumption per authenticated customer account.
 * Enforces database-level protection against double-use via compound unique index.
 */
const CouponUsageSchema = new mongoose.Schema(
  {
    couponId: { type: String, required: true, index: true },
    couponCode: { type: String, required: true, uppercase: true, trim: true, index: true },
    userId: { type: String, required: true, index: true },
    orderId: { type: String, required: true, index: true },
    discountAmount: { type: Number, default: 0, min: 0 },
    usedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Database-level compound unique constraint: 1 coupon per user ID
CouponUsageSchema.index({ couponId: 1, userId: 1 }, { unique: true });
CouponUsageSchema.index({ couponCode: 1, userId: 1 }, { unique: true });

export default mongoose.models.CouponUsage || mongoose.model('CouponUsage', CouponUsageSchema);
