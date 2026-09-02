import mongoose from 'mongoose';

const StoreConfigSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Nakoda Imitation' },
    tagline: { type: String, default: 'Premium Imitation Jewelry & Lifestyle Collection' },
    whatsappNumber: { type: String, default: '919876543210' },
    whatsappDisplay: { type: String, default: '+91 98765 43210' },
    address: { type: String, default: 'Shop #14, Main Market Road, Bangalore' },
    hours: { type: String, default: 'Mon - Sun: 9:30 AM – 9:30 PM' },
    currency: { type: String, default: '₹' },
    isInitialized: { type: Boolean, default: true },
    seedVersion: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.models.StoreConfig || mongoose.model('StoreConfig', StoreConfigSchema);
