import mongoose from 'mongoose';

/**
 * CartItemSchema
 * Embedded item in customer shopping cart.
 */
const CartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1, max: 99, default: 1 },
  selectedColor: { type: String, default: '' },
  selectedSize: { type: String, default: '' },
  name: { type: String, default: '' },
  price: { type: Number, default: 0 },
  image: { type: String, default: '' },
  addedAt: { type: Date, default: Date.now },
});

/**
 * CartSchema
 * Persistent shopping cart in MongoDB Atlas for authenticated users.
 */
const CartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Cart || mongoose.model('Cart', CartSchema);
