import mongoose from 'mongoose';

const ColorSchema = new mongoose.Schema({
  name: String,
  hex: String,
});

const ProductSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    categoryName: { type: String, default: '' },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    discountPercent: { type: Number, default: 0 },
    rating: { type: Number, default: 4.8 },
    reviews: { type: Number, default: 0 },
    badge: { type: String, default: '' },
    badgeType: { type: String, default: '' },
    stockStatus: { type: String, enum: ['in_stock', 'low_stock', 'out_of_stock'], default: 'in_stock' },
    stockCount: { type: Number, default: 10 },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    colors: [ColorSchema],
    sizes: [String],
    variants: [String],
    tags: [String],
    isPopular: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
