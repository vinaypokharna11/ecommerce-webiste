import mongoose from 'mongoose';

const ExploreCollectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, default: '/assets/images/prod_backpack.jpg' },
  categoryId: { type: String, required: true },
  badge: { type: String, default: '' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const ExploreSectionSchema = new mongoose.Schema({
  title: { type: String, default: 'Explore Our Collections' },
  subtitle: { type: String, default: 'Find exactly what you’re looking for across our curated lifestyle, grocery, apparel, and travel categories.' },
  enabled: { type: Boolean, default: true },
  collections: [ExploreCollectionSchema],
});

const HeroShowcaseItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  badge: { type: String, default: '' },
  badgeBg: { type: String, default: 'bg-black' },
  image: { type: String, default: '/assets/images/prod_trolley_wide.jpg' },
  imageFit: { type: String, default: 'cover' },
  linkCategory: { type: String, default: 'all' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const StoreConfigSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Nakoda Imitation' },
    tagline: { type: String, default: 'Premium Imitation Jewelry & Lifestyle Collection' },
    whatsappNumber: { type: String, default: '919876543210' },
    whatsappDisplay: { type: String, default: '+91 98765 43210' },
    address: { type: String, default: '6, Honey Complex, Opposite Gunjan Cinema, Koparli Road, Gunjan, G.I.D.C, Vapi, Gujarat 396195' },
    hours: { type: String, default: 'Mon - Sun: 9:30 AM – 9:30 PM' },
    currency: { type: String, default: '₹' },
    isInitialized: { type: Boolean, default: true },
    seedVersion: { type: Number, default: 1 },
    exploreSection: { type: ExploreSectionSchema, default: () => ({}) },
    heroShowcase: [HeroShowcaseItemSchema],
  },
  { timestamps: true }
);

export default mongoose.models.StoreConfig || mongoose.model('StoreConfig', StoreConfigSchema);
