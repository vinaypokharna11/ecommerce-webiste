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
  },
  { timestamps: true }
);

export default mongoose.models.Offer || mongoose.model('Offer', OfferSchema);
