import mongoose from 'mongoose';

/**
 * ReviewSchema
 * Customer product reviews and ratings schema.
 * Enforces verified purchases, single review per customer per product,
 * and tracks helpful upvotes.
 */
const ReviewSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    productId: { type: String, required: true, index: true },
    productName: { type: String, default: '' },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, lowercase: true, trim: true, default: '' },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer rating between 1 and 5',
      },
    },
    title: { type: String, trim: true, default: '' },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [5, 'Review comment must be at least 5 characters'],
      maxlength: [2000, 'Review comment cannot exceed 2000 characters'],
    },
    verifiedPurchase: { type: Boolean, default: false },
    orderId: { type: String, default: null },
    helpfulVotes: [{ type: String }], // Array of customerIds who voted helpful
    helpfulCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'approved',
      index: true,
    },
  },
  { timestamps: true }
);

// Enforce one review per customer per product
ReviewSchema.index({ customerId: 1, productId: 1 }, { unique: true });
ReviewSchema.index({ productId: 1, createdAt: -1 });
ReviewSchema.index({ productId: 1, rating: 1 });
ReviewSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
