import mongoose from 'mongoose';

const OfferSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    code: { type: String, required: true, uppercase: true, trim: true },
    discountPercent: { type: Number, required: true },
    category: { type: String, default: 'all' },
    description: { type: String, default: '' },
    gradient: { type: String, default: 'from-[#6257FF] to-[#4F46E5]' },
    bgLight: { type: String, default: 'bg-[#F5F3FF]' },
    textColor: { type: String, default: 'text-[#6257FF]' },
    borderColor: { type: String, default: 'border-[#EAE6FD]' },
    badgeColor: { type: String, default: 'bg-[#EDE9FE] text-[#6257FF]' },
    icon: { type: String, default: '🎁' },
    expiry: { type: String, default: 'Limited Period' },
    popular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAUSED', 'EXPIRED', 'DELETED'],
      default: 'ACTIVE',
      index: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    usageLimit: { type: Number, default: null },
    perUserLimit: { type: Number, default: 1 },
    usageCount: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
  },
  { timestamps: true }
);

OfferSchema.index({ code: 1, isDeleted: 1, status: 1 });
OfferSchema.index({ createdAt: -1 });

export default mongoose.models.Offer || mongoose.model('Offer', OfferSchema);
