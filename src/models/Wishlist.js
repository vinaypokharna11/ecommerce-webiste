import mongoose from 'mongoose';

/**
 * WishlistSchema
 * Stores customer favorite / wishlist products in MongoDB Atlas.
 * Guarantees duplicate prevention via compound unique index on { userId, productId }.
 */
const WishlistSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    productName: { type: String, default: '' },
    productImage: { type: String, default: '' },
    productPrice: { type: Number, default: 0 },
    productCategory: { type: String, default: '' },
  },
  { timestamps: true }
);

// Compound unique index ensures a customer cannot have duplicate entries of the same product
WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema);
