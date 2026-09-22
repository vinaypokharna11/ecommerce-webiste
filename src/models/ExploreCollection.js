import mongoose from 'mongoose';

const ExploreCollectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, index: true },
    description: { type: String, default: '' },
    image: { type: String, default: '/assets/images/prod_backpack.jpg' },
    categoryId: { type: String, required: true, default: 'all' },
    target: { type: String, default: '' },
    badge: { type: String, default: '' },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ExploreCollectionSchema.index({ isDeleted: 1, isActive: 1, order: 1 });

export default mongoose.models.ExploreCollection || mongoose.model('ExploreCollection', ExploreCollectionSchema);
