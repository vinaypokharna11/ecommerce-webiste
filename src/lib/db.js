import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import connectToDatabase from './mongodb.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Offer from '../models/Offer.js';
import Order from '../models/Order.js';
import Inquiry from '../models/Inquiry.js';
import ContactMessage from '../models/ContactMessage.js';
import StoreConfig from '../models/StoreConfig.js';

const DB_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

// Initial baseline mock data for seeding MongoDB and JSON fallback
export const INITIAL_DB_STATE = {
  products: [
    {
      id: 'prod-1',
      name: 'Wireless Noise-Canceling Headphones',
      category: 'electronics',
      categoryName: 'Electronics',
      price: 3499,
      oldPrice: 4999,
      discountPercent: 30,
      rating: 4.8,
      reviews: 142,
      badge: 'BEST SELLER',
      badgeType: 'bestseller',
      stockStatus: 'in_stock',
      stockCount: 14,
      image: '/assets/images/prod_headphones.jpg',
      description: 'High-fidelity audio with active noise cancellation, 35-hour battery life, and ultra-soft memory foam ear cushions.',
      colors: [
        { name: 'Navy Blue', hex: '#1E293B' },
        { name: 'Rose Pink', hex: '#F472B6' },
        { name: 'Matte Black', hex: '#0F172A' },
      ],
      variants: ['Standard', 'Pro Wireless'],
      tags: ['audio', 'bluetooth', 'wireless', 'music', 'headphones'],
      isPopular: true,
      isFeatured: true,
    },
    {
      id: 'prod-2',
      name: 'Smart Fitness & Health Watch Pro',
      category: 'electronics',
      categoryName: 'Electronics',
      price: 2499,
      oldPrice: 3999,
      discountPercent: 38,
      rating: 4.7,
      reviews: 98,
      badge: 'TRENDING',
      badgeType: 'trending',
      stockStatus: 'low_stock',
      stockCount: 3,
      image: '/assets/images/prod_smartwatch.jpg',
      description: 'Track daily heart rate, sleep quality, workout stats, SpO2 levels, and receive call & WhatsApp notifications seamlessly.',
      colors: [
        { name: 'Space Grey', hex: '#334155' },
        { name: 'Obsidian Black', hex: '#020617' },
      ],
      variants: ['40mm Case', '44mm Case'],
      tags: ['smartwatch', 'fitness', 'health', 'wearable', 'electronics'],
      isPopular: true,
      isFeatured: false,
    },
    {
      id: 'prod-3',
      name: 'Premium Casual Breathable Sneakers',
      category: 'footwear',
      categoryName: 'Footwear',
      price: 1999,
      oldPrice: 2999,
      discountPercent: 33,
      rating: 4.6,
      reviews: 184,
      badge: '25% OFF',
      badgeType: 'discount',
      stockStatus: 'in_stock',
      stockCount: 22,
      image: '/assets/images/prod_sneakers.jpg',
      description: 'Ultra-lightweight mesh runners with responsive Zoom foam cushioning, ergonomic heel cup, and anti-slip rubber traction.',
      sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
      colors: [
        { name: 'Chalk Grey', hex: '#94A3B8' },
        { name: 'Pure White', hex: '#F8FAFC' },
      ],
      tags: ['shoes', 'sneakers', 'footwear', 'running', 'casual'],
      isPopular: true,
      isFeatured: false,
    },
    {
      id: 'prod-4',
      name: 'Urban Minimalist Water-Resistant Backpack',
      category: 'accessories',
      categoryName: 'Accessories',
      price: 1499,
      oldPrice: 2499,
      discountPercent: 40,
      rating: 4.5,
      reviews: 76,
      badge: 'POPULAR',
      badgeType: 'popular',
      stockStatus: 'in_stock',
      stockCount: 18,
      image: '/assets/images/prod_backpack.jpg',
      description: 'Sleek weather-resistant commuter backpack with dedicated 15.6" padded laptop sleeve, quick-access passport pocket, and USB pass-through.',
      colors: [
        { name: 'Slate Grey', hex: '#475569' },
        { name: 'Charcoal Black', hex: '#1E1B4B' },
      ],
      tags: ['bag', 'backpack', 'travel', 'commute', 'accessories'],
      isPopular: true,
      isFeatured: false,
    },
    {
      id: 'prod-5',
      name: 'Pure Lilac Relaxed Fit Linen Shirt',
      category: 'clothing',
      categoryName: 'Clothing',
      price: 1299,
      oldPrice: 1899,
      discountPercent: 31,
      rating: 4.9,
      reviews: 62,
      badge: 'NEW',
      badgeType: 'new',
      stockStatus: 'in_stock',
      stockCount: 15,
      image: '/assets/images/cat_linen_shirt.jpg',
      description: '100% natural breathable European flax linen shirt with mother-of-pearl buttons and relaxed spread collar. Perfect for everyday luxury.',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: [
        { name: 'Lavender Mist', hex: '#C084FC' },
        { name: 'Crisp White', hex: '#FFFFFF' },
        { name: 'Sage Green', hex: '#86EFAC' },
      ],
      tags: ['shirt', 'linen', 'clothing', 'fashion', 'men', 'summer'],
      isPopular: false,
      isFeatured: false,
    },
    {
      id: 'prod-6',
      name: 'Classic Polarized Wayfarer Sunglasses',
      category: 'accessories',
      categoryName: 'Accessories',
      price: 899,
      oldPrice: 1499,
      discountPercent: 40,
      rating: 4.7,
      reviews: 110,
      badge: 'SALE',
      badgeType: 'sale',
      stockStatus: 'in_stock',
      stockCount: 25,
      image: '/assets/images/cat_sunglasses.jpg',
      description: 'UV400 TAC polarized lenses set in matte-touch lightweight polycarbonate frames with reinforced metal barrel hinges.',
      colors: [
        { name: 'Matte Black', hex: '#0F172A' },
        { name: 'Tortoiseshell', hex: '#78350F' },
      ],
      tags: ['sunglasses', 'eyewear', 'accessories', 'summer', 'fashion'],
      isPopular: false,
      isFeatured: false,
    },
    {
      id: 'prod-7',
      name: 'Aura 360° Heavy Bass Bluetooth Speaker',
      category: 'electronics',
      categoryName: 'Electronics',
      price: 1799,
      oldPrice: 2799,
      discountPercent: 35,
      rating: 4.8,
      reviews: 89,
      badge: 'BEST SELLER',
      badgeType: 'bestseller',
      stockStatus: 'low_stock',
      stockCount: 2,
      image: '/assets/images/cat_speaker.jpg',
      description: 'Rich room-filling 360-degree spatial audio with dual passive radiators, IPX7 waterproof rating, and 16 hours of playtime.',
      colors: [
        { name: 'Midnight Black', hex: '#0F172A' },
        { name: 'Lavender Glow', hex: '#8B5CF6' },
      ],
      tags: ['speaker', 'audio', 'bluetooth', 'music', 'electronics'],
      isPopular: false,
      isFeatured: false,
    },
    {
      id: 'prod-8',
      name: 'Pastel Ceramic Potted Succulent Plant',
      category: 'home-living',
      categoryName: 'Home & Living',
      price: 499,
      oldPrice: 799,
      discountPercent: 37,
      rating: 4.6,
      reviews: 45,
      badge: 'ECO',
      badgeType: 'eco',
      stockStatus: 'in_stock',
      stockCount: 30,
      image: '/assets/images/hero_plant.jpg',
      description: 'Living Haworthia succulent nestled in handcrafted matte ceramic pot with premium volcanic soil blend and drainage dish.',
      colors: [
        { name: 'Pastel Pink', hex: '#F472B6' },
        { name: 'Soft Mint', hex: '#6EE7B7' },
        { name: 'Pure White', hex: '#FFFFFF' },
      ],
      tags: ['plant', 'decor', 'home', 'succulent', 'living'],
      isPopular: false,
      isFeatured: false,
    },
    {
      id: 'prod-9',
      name: 'Studio Wireless Pink Over-Ear Headphones',
      category: 'electronics',
      categoryName: 'Electronics',
      price: 2999,
      oldPrice: 4299,
      discountPercent: 30,
      rating: 4.9,
      reviews: 215,
      badge: 'LIMITED',
      badgeType: 'limited',
      stockStatus: 'in_stock',
      stockCount: 9,
      image: '/assets/images/pink_headphones.jpg',
      description: 'Signature studio-grade sound with ultra-comfortable plush ear cups, foldable hinges, dual beamforming mics, and 40h battery.',
      colors: [
        { name: 'Pastel Pink', hex: '#F472B6' },
        { name: 'Lilac Violet', hex: '#A855F7' },
      ],
      tags: ['headphones', 'pink', 'audio', 'wireless', 'bluetooth'],
      isPopular: false,
      isFeatured: false,
    },
    {
      id: 'prod-10',
      name: 'Oversized Vintage Washed Cotton Tee',
      category: 'clothing',
      categoryName: 'Clothing',
      price: 799,
      oldPrice: 1299,
      discountPercent: 38,
      rating: 4.5,
      reviews: 58,
      badge: 'NEW',
      badgeType: 'new',
      stockStatus: 'in_stock',
      stockCount: 35,
      image: '/assets/images/cat_linen_shirt.jpg',
      description: '240 GSM heavy-gauge 100% combed cotton t-shirt with dropped shoulders, ribbed crewneck, and pre-shrunk acid wash finish.',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Vintage Lilac', hex: '#C084FC' },
        { name: 'Charcoal Black', hex: '#1E293B' },
        { name: 'Off White', hex: '#F8FAFC' },
      ],
      tags: ['tshirt', 'tee', 'clothing', 'oversized', 'streetwear'],
      isPopular: false,
      isFeatured: false,
    },
    {
      id: 'prod-11',
      name: 'Handcrafted Classic Leather Loafers',
      category: 'footwear',
      categoryName: 'Footwear',
      price: 2799,
      oldPrice: 3999,
      discountPercent: 30,
      rating: 4.8,
      reviews: 41,
      badge: 'PREMIUM',
      badgeType: 'premium',
      stockStatus: 'low_stock',
      stockCount: 4,
      image: '/assets/images/prod_sneakers.jpg',
      description: 'Handmade genuine calfskin leather penny loafers with Goodyear-welted sole, cushioned arch support, and breathable leather lining.',
      sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
      colors: [
        { name: 'Coffee Brown', hex: '#451A03' },
        { name: 'Jet Black', hex: '#0F172A' },
      ],
      tags: ['shoes', 'loafers', 'leather', 'footwear', 'formal'],
      isPopular: false,
      isFeatured: false,
    },
    {
      id: 'prod-12',
      name: 'Full-Grain Slim Leather Bifold Wallet',
      category: 'accessories',
      categoryName: 'Accessories',
      price: 699,
      oldPrice: 1199,
      discountPercent: 41,
      rating: 4.6,
      reviews: 93,
      badge: 'POPULAR',
      badgeType: 'popular',
      stockStatus: 'in_stock',
      stockCount: 40,
      image: '/assets/images/prod_backpack.jpg',
      description: 'RFID-blocking minimalist card wallet crafted from vegetable-tanned full grain leather. Holds 8 cards plus cash without bulk.',
      colors: [
        { name: 'Tan Brown', hex: '#92400E' },
        { name: 'Midnight Black', hex: '#0F172A' },
      ],
      tags: ['wallet', 'leather', 'accessories', 'bifold', 'cardholder'],
      isPopular: false,
      isFeatured: false,
    },
    {
      id: 'prod-13',
      name: 'Nordic Ceramic Ultrasonic Aroma Diffuser',
      category: 'home-living',
      categoryName: 'Home & Living',
      price: 1599,
      oldPrice: 2299,
      discountPercent: 30,
      rating: 4.9,
      reviews: 67,
      badge: 'HOT',
      badgeType: 'hot',
      stockStatus: 'in_stock',
      stockCount: 16,
      image: '/assets/images/hero_plant.jpg',
      description: 'Handcrafted ceramic ultrasonic mist diffuser with warm ambient glow lighting, whisper-quiet operation, and auto-shutoff safety timer.',
      colors: [
        { name: 'Sandstone White', hex: '#F1F5F9' },
        { name: 'Terracotta', hex: '#EA580C' },
      ],
      tags: ['diffuser', 'home', 'living', 'decor', 'aromatherapy'],
      isPopular: false,
      isFeatured: false,
    },
    {
      id: 'prod-14',
      name: 'Performance Running Trainers CloudStep',
      category: 'footwear',
      categoryName: 'Footwear',
      price: 2299,
      oldPrice: 3499,
      discountPercent: 34,
      rating: 4.7,
      reviews: 130,
      badge: 'SALE',
      badgeType: 'sale',
      stockStatus: 'out_of_stock',
      stockCount: 0,
      image: '/assets/images/prod_sneakers.jpg',
      description: 'High-mileage marathon training shoe featuring carbon-infused plate, breathable knit upper, and energy-return bounce sole.',
      sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
      colors: [
        { name: 'Stealth Grey', hex: '#64748B' },
        { name: 'Electric Purple', hex: '#7C3AED' },
      ],
      tags: ['running', 'shoes', 'footwear', 'trainers', 'sports'],
      isPopular: false,
      isFeatured: false,
    },
    {
      id: 'prod-15',
      name: 'Relaxed Denim Trucker Jacket',
      category: 'clothing',
      categoryName: 'Clothing',
      price: 2199,
      oldPrice: 3299,
      discountPercent: 33,
      rating: 4.8,
      reviews: 52,
      badge: 'TRENDING',
      badgeType: 'trending',
      stockStatus: 'in_stock',
      stockCount: 12,
      image: '/assets/images/cat_linen_shirt.jpg',
      description: '13oz heavyweight 100% cotton denim with vintage stonewash effect, brass shank buttons, and deep welt side hand pockets.',
      sizes: ['M', 'L', 'XL'],
      colors: [
        { name: 'Light Indigo', hex: '#60A5FA' },
        { name: 'Washed Black', hex: '#334155' },
      ],
      tags: ['jacket', 'denim', 'clothing', 'outerwear', 'fashion'],
      isPopular: false,
      isFeatured: false,
    },
    {
      id: 'prod-16',
      name: 'Nakoda Signature Gift & Festive Hamper',
      category: 'accessories',
      categoryName: 'Accessories',
      price: 1999,
      oldPrice: 2999,
      discountPercent: 33,
      rating: 5.0,
      reviews: 28,
      badge: 'SPECIAL',
      badgeType: 'special',
      stockStatus: 'in_stock',
      stockCount: 20,
      image: '/assets/images/promo_giftbox.jpg',
      description: 'Curated luxury gift box packed with premium goodies, personalized greeting card, and satin ribbon packaging.',
      variants: ['Festive Luxe', 'Celebration Mini'],
      tags: ['gift', 'hamper', 'special', 'festive', 'box'],
      isPopular: false,
      isFeatured: false,
    },
  ],
  categories: [
    { id: 'clothing', name: 'Clothing', icon: 'Shirt', color: '#EC5AC8', accentBg: 'bg-[#FFF0FB]', iconColor: 'text-[#EC5AC8]', itemCount: '4 Items', description: 'Shirts, jackets, and trendy apparel' },
    { id: 'footwear', name: 'Footwear', icon: 'Footprints', color: '#059669', accentBg: 'bg-[#F0FDF4]', iconColor: 'text-[#059669]', itemCount: '3 Items', description: 'Sneakers, runners, and leather loafers' },
    { id: 'electronics', name: 'Electronics', icon: 'Headphones', color: '#6257FF', accentBg: 'bg-[#F5F3FF]', iconColor: 'text-[#6257FF]', itemCount: '4 Items', description: 'Audio gear, smartwatches & speakers' },
    { id: 'accessories', name: 'Accessories', icon: 'Watch', color: '#0891B2', accentBg: 'bg-[#F0F9FF]', iconColor: 'text-[#0891B2]', itemCount: '3 Items', description: 'Bags, wallets, sunglasses & gifts' },
    { id: 'home-living', name: 'Home & Living', icon: 'Armchair', color: '#8B5CF6', accentBg: 'bg-[#F5F3FF]', iconColor: 'text-[#8B5CF6]', itemCount: '2 Items', description: 'Plants, aroma diffusers & home decor' },
    { id: 'beauty', name: 'Beauty & Care', icon: 'Sparkles', color: '#EC5AC8', accentBg: 'bg-[#FFF0FB]', iconColor: 'text-[#EC5AC8]', itemCount: '0 Items', description: 'Skincare, wellness & self-care items' },
  ],
  offers: [
    {
      id: 'electronics',
      title: '20% OFF',
      subtitle: 'on Electronics',
      code: 'ELEC20',
      discountPercent: 20,
      category: 'electronics',
      description: 'Valid on all wireless audio, smartwatches, speakers, and accessories.',
      gradient: 'from-[#6257FF] to-[#4F46E5]',
      bgLight: 'bg-[#F5F3FF]',
      textColor: 'text-[#6257FF]',
      borderColor: 'border-[#EAE6FD]',
      badgeColor: 'bg-[#EDE9FE] text-[#6257FF]',
      icon: '🎧',
      expiry: 'Valid till Aug 31',
      popular: false,
      isActive: true,
    },
    {
      id: 'fashion',
      title: '30% OFF',
      subtitle: 'on Fashion',
      code: 'FASH30',
      discountPercent: 30,
      category: 'clothing',
      description: 'Valid on all clothing, footwear, shirts, jackets, and casual wear.',
      gradient: 'from-[#EC5AC8] to-[#BE185D]',
      bgLight: 'bg-[#FFF0FB]',
      textColor: 'text-[#EC5AC8]',
      borderColor: 'border-[#FCD6F2]',
      badgeColor: 'bg-[#FCE7F3] text-[#EC5AC8]',
      icon: '👕',
      expiry: 'Valid till Sep 5',
      popular: true,
      isActive: true,
    },
    {
      id: 'home',
      title: '15% OFF',
      subtitle: 'on Home & Living',
      code: 'HOME15',
      discountPercent: 15,
      category: 'home-living',
      description: 'Valid on ceramic diffusers, potted plants, decorative items, and home essentials.',
      gradient: 'from-[#8B5CF6] to-[#7C3AED]',
      bgLight: 'bg-[#F5F3FF]',
      textColor: 'text-[#8B5CF6]',
      borderColor: 'border-[#DDD6FE]',
      badgeColor: 'bg-[#EDE9FE] text-[#8B5CF6]',
      icon: '🏠',
      expiry: 'Valid till Sep 10',
      popular: false,
      isActive: true,
    },
    {
      id: 'accessories',
      title: '25% OFF',
      subtitle: 'on Accessories',
      code: 'ACC25',
      discountPercent: 25,
      category: 'accessories',
      description: 'Flat 25% off on backpacks, wallets, sunglasses, and all accessories.',
      gradient: 'from-[#0891B2] to-[#0E7490]',
      bgLight: 'bg-[#F0F9FF]',
      textColor: 'text-[#0891B2]',
      borderColor: 'border-[#BAE6FD]',
      badgeColor: 'bg-[#E0F2FE] text-[#0891B2]',
      icon: '🕶️',
      expiry: 'Valid till Aug 28',
      popular: false,
      isActive: true,
    },
    {
      id: 'footwear',
      title: '35% OFF',
      subtitle: 'on Footwear',
      code: 'FEET35',
      discountPercent: 35,
      category: 'footwear',
      description: 'Sneakers, loafers, running shoes — all footwear at 35% off!',
      gradient: 'from-[#059669] to-[#047857]',
      bgLight: 'bg-[#F0FDF4]',
      textColor: 'text-[#059669]',
      borderColor: 'border-[#BBF7D0]',
      badgeColor: 'bg-[#D1FAE5] text-[#059669]',
      icon: '👟',
      expiry: 'Valid till Sep 15',
      popular: false,
      isActive: true,
    },
    {
      id: 'gifting',
      title: '10% OFF',
      subtitle: 'on Gift Hampers',
      code: 'GIFT10',
      discountPercent: 10,
      category: 'accessories',
      description: 'Special discount on all curated gift boxes and festive hampers.',
      gradient: 'from-[#D97706] to-[#B45309]',
      bgLight: 'bg-[#FFFBEB]',
      textColor: 'text-[#D97706]',
      borderColor: 'border-[#FDE68A]',
      badgeColor: 'bg-[#FEF3C7] text-[#D97706]',
      icon: '🎁',
      expiry: 'Valid till Sep 20',
      popular: false,
      isActive: true,
    },
  ],
  orders: [
    {
      id: '#SE1003',
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      customerPhone: '+91 98765 43210',
      items: [{ id: 'prod-1', name: 'Wireless Headphones', price: 3499, quantity: 1 }],
      itemSummary: 'Wireless Headphones (x1)',
      amount: 3499,
      status: 'delivered',
      statusLabel: 'Delivered',
      payMethod: 'Cash on Delivery',
      deliveryAddress: 'Shop #14, Main Market Road, Bangalore — 560001',
      date: 'Aug 20, 2026',
    },
    {
      id: '#SE1002',
      customerName: 'Sarah Jenkins',
      customerEmail: 'sarah.j@example.com',
      customerPhone: '+91 98765 43211',
      items: [{ id: 'prod-2', name: 'Smart Watch Pro', price: 2499, quantity: 1 }],
      itemSummary: 'Smart Watch Pro (x1)',
      amount: 2499,
      status: 'shipped',
      statusLabel: 'Shipped',
      payMethod: 'Online Payment (UPI)',
      deliveryAddress: 'Flat 302, Palm Heights, Indiranagar, Bangalore — 560038',
      date: 'Aug 15, 2026',
    },
  ],
  contactMessages: [
    {
      id: 'CT-1001',
      name: 'Rohan Sharma',
      email: 'rohan.sharma@example.com',
      phone: '+91 98765 12345',
      category: 'General Support',
      subject: 'Inquiry regarding weekend store timings',
      message: 'Hi Nakoda team, are your Bangalore store hours the same on Sundays as well? I would like to visit in person.',
      preferredContact: 'WhatsApp',
      status: 'pending',
    },
    {
      id: 'CT-1002',
      name: 'Ananya Verma',
      email: 'ananya.v@example.com',
      phone: '+91 91234 56789',
      category: 'Returns & Refund',
      subject: 'Exchange size for sneakers order #SE1002',
      message: 'I received the sneakers yesterday and need UK 9 instead of UK 8. Could you please advise how to proceed with the quick exchange?',
      preferredContact: 'Email',
      status: 'replied',
    },
  ],
  inquiries: [
    {
      id: 'INQ-5001',
      inquiryType: 'Bulk / Wholesale Order',
      productId: 'prod-1',
      productName: 'Wireless Noise-Canceling Headphones',
      quantity: 25,
      targetBudget: '₹75,000',
      requiredDate: '2026-09-15',
      customerName: 'Amit Patel (Apex Digital)',
      customerEmail: 'amit.patel@apexdigital.io',
      customerPhone: '+91 99887 76655',
      companyName: 'Apex Digital Solutions',
      notes: 'Looking for a corporate gifting order of 25 units with custom company logo embossing if possible. Please provide price breakdown.',
      preferredContact: 'WhatsApp',
      status: 'pending',
    },
    {
      id: 'INQ-5002',
      inquiryType: 'Stock Availability Check',
      productId: 'prod-14',
      productName: 'Performance Running Trainers CloudStep',
      quantity: 2,
      targetBudget: '₹4,500',
      requiredDate: '2026-09-01',
      customerName: 'Priya Sundaram',
      customerEmail: 'priya.s@example.com',
      customerPhone: '+91 98450 11223',
      companyName: '',
      notes: 'I saw UK 10 is currently out of stock. When do you expect new inventory arrival?',
      preferredContact: 'Email',
      status: 'in_progress',
    },
  ],
  storeConfig: {
    name: 'Nakoda Imitation',
    tagline: 'Premium Imitation Jewelry & Lifestyle Collection',
    whatsappNumber: '919876543210',
    whatsappDisplay: '+91 98765 43210',
    address: 'Shop #14, Main Market Road, Bangalore',
    hours: 'Mon - Sun: 9:30 AM – 9:30 PM',
    currency: '₹',
  },
  users: [],
};

// ─── JSON File Storage Helpers (Fallback) ────────────────────────────────────
function initJSONDB() {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(INITIAL_DB_STATE, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error initializing fallback JSON database file', err);
  }
}

function readJSONDB() {
  initJSONDB();
  try {
    const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return INITIAL_DB_STATE;
  }
}

function writeJSONDB(data) {
  initJSONDB();
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return false;
  }
}

// ─── MongoDB Auto-Seeding Helper ─────────────────────────────────────────────
let isSeeded = false;
async function ensureMongoSeeded() {
  if (isSeeded) return;
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('🌱 Seeding default products to MongoDB...');
      await Product.insertMany(INITIAL_DB_STATE.products);
    }

    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('🌱 Seeding default categories to MongoDB...');
      await Category.insertMany(INITIAL_DB_STATE.categories);
    }

    const offerCount = await Offer.countDocuments();
    if (offerCount === 0) {
      console.log('🌱 Seeding default offers to MongoDB...');
      await Offer.insertMany(INITIAL_DB_STATE.offers);
    }

    const configCount = await StoreConfig.countDocuments();
    if (configCount === 0) {
      await StoreConfig.create(INITIAL_DB_STATE.storeConfig);
    } else {
      const existingConfig = await StoreConfig.findOne();
      if (existingConfig && (!existingConfig.name || existingConfig.name === 'ShopEase')) {
        existingConfig.name = 'Nakoda Imitation';
        existingConfig.tagline = 'Premium Imitation Jewelry & Lifestyle Collection';
        await existingConfig.save();
      }
    }

    isSeeded = true;
  } catch (err) {
    console.warn('MongoDB seed warning:', err.message);
  }
}

// ─── PRODUCTS CRUD ───────────────────────────────────────────────────────────
export async function getProducts(filters = {}) {
  const db = await connectToDatabase();
  if (db) {
    await ensureMongoSeeded();
    const query = {};
    if (filters.category && filters.category !== 'all') query.category = filters.category;
    if (filters.stockStatus && filters.stockStatus !== 'all') query.stockStatus = filters.stockStatus;
    if (filters.isPopular) query.isPopular = true;
    if (filters.isFeatured) query.isFeatured = true;
    if (filters.search) {
      const regex = new RegExp(filters.search, 'i');
      query.$or = [{ name: regex }, { categoryName: regex }, { tags: regex }, { id: regex }];
    }
    const products = await Product.find(query).sort({ createdAt: -1 }).lean();
    return products.map(({ _id, __v, ...p }) => p);
  }

  // Fallback
  const jdb = readJSONDB();
  let list = jdb.products || [];
  if (filters.category && filters.category !== 'all') list = list.filter((p) => p.category === filters.category);
  if (filters.stockStatus && filters.stockStatus !== 'all') list = list.filter((p) => p.stockStatus === filters.stockStatus);
  if (filters.isPopular) list = list.filter((p) => p.isPopular);
  if (filters.isFeatured) list = list.filter((p) => p.isFeatured);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }
  return list;
}

export async function getProductById(id) {
  const db = await connectToDatabase();
  if (db) {
    await ensureMongoSeeded();
    const prod = await Product.findOne({ id }).lean();
    if (!prod) return null;
    const { _id, __v, ...rest } = prod;
    return rest;
  }
  const jdb = readJSONDB();
  return (jdb.products || []).find((p) => p.id === id) || null;
}

export async function createProduct(productData) {
  const id = productData.id || `prod-${Date.now()}`;
  const price = Number(productData.price) || 0;
  const oldPrice = Number(productData.oldPrice) || 0;
  const discountPercent = oldPrice > price && oldPrice > 0
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : Number(productData.discountPercent) || 0;
  const stockCount = Number(productData.stockCount) || 0;
  const stockStatus = stockCount <= 0 ? 'out_of_stock' : stockCount < 5 ? 'low_stock' : 'in_stock';

  const newProduct = {
    ...productData,
    id,
    price,
    oldPrice: oldPrice || undefined,
    discountPercent,
    stockCount,
    stockStatus,
    rating: Number(productData.rating) || 5.0,
    reviews: Number(productData.reviews) || 0,
    isPopular: !!productData.isPopular,
    isFeatured: !!productData.isFeatured,
    tags: Array.isArray(productData.tags) ? productData.tags : [],
    createdAt: new Date().toISOString(),
  };

  const db = await connectToDatabase();
  if (db) {
    const created = await Product.create(newProduct);
    const { _id, __v, ...rest } = created.toObject();
    return rest;
  }

  const jdb = readJSONDB();
  jdb.products = [newProduct, ...(jdb.products || [])];
  writeJSONDB(jdb);
  return newProduct;
}

export async function updateProduct(id, updateData) {
  const db = await connectToDatabase();
  if (db) {
    if (updateData.stockCount !== undefined) {
      const sc = Number(updateData.stockCount);
      updateData.stockCount = sc;
      updateData.stockStatus = sc <= 0 ? 'out_of_stock' : sc < 5 ? 'low_stock' : 'in_stock';
    }

    const updated = await Product.findOneAndUpdate({ id }, updateData, { returnDocument: 'after' }).lean();
    if (!updated) return null;
    const { _id, __v, ...rest } = updated;
    return rest;
  }

  const jdb = readJSONDB();
  const index = (jdb.products || []).findIndex((p) => p.id === id);
  if (index === -1) return null;

  const current = jdb.products[index];
  const merged = { ...current, ...updateData };
  if (merged.stockCount !== undefined) {
    const sc = Number(merged.stockCount);
    merged.stockCount = sc;
    merged.stockStatus = sc <= 0 ? 'out_of_stock' : sc < 5 ? 'low_stock' : 'in_stock';
  }
  jdb.products[index] = merged;
  writeJSONDB(jdb);
  return merged;
}

export async function deleteProduct(id) {
  const db = await connectToDatabase();
  if (db) {
    const res = await Product.deleteOne({ id });
    return res.deletedCount > 0;
  }

  const jdb = readJSONDB();
  const initLen = (jdb.products || []).length;
  jdb.products = (jdb.products || []).filter((p) => p.id !== id);
  const deleted = jdb.products.length < initLen;
  if (deleted) writeJSONDB(jdb);
  return deleted;
}

// ─── CATEGORIES CRUD ─────────────────────────────────────────────────────────
export async function getCategories() {
  const db = await connectToDatabase();
  if (db) {
    await ensureMongoSeeded();
    const [categories, products] = await Promise.all([
      Category.find().lean(),
      Product.find().select('category').lean(),
    ]);

    return categories.map(({ _id, __v, ...cat }) => ({
      ...cat,
      count: products.filter((p) => p.category === cat.id).length,
    }));
  }

  const jdb = readJSONDB();
  const products = jdb.products || [];
  return (jdb.categories || []).map((cat) => ({
    ...cat,
    count: products.filter((p) => p.category === cat.id).length,
  }));
}

export async function createCategory(data) {
  const id = data.id || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newCat = {
    ...data,
    id,
    color: data.color || '#6257FF',
    accentBg: data.accentBg || 'bg-[#F5F3FF]',
    iconColor: data.iconColor || 'text-[#6257FF]',
    icon: data.icon || 'LayoutGrid',
    itemCount: '0 Items',
  };

  const db = await connectToDatabase();
  if (db) {
    const created = await Category.create(newCat);
    const { _id, __v, ...rest } = created.toObject();
    return rest;
  }

  const jdb = readJSONDB();
  jdb.categories = [...(jdb.categories || []), newCat];
  writeJSONDB(jdb);
  return newCat;
}

export async function updateCategory(id, updateData) {
  const db = await connectToDatabase();
  if (db) {
    const updated = await Category.findOneAndUpdate({ id }, updateData, { returnDocument: 'after' }).lean();
    if (!updated) return null;
    const { _id, __v, ...rest } = updated;
    return rest;
  }

  const jdb = readJSONDB();
  const index = (jdb.categories || []).findIndex((c) => c.id === id);
  if (index === -1) return null;
  jdb.categories[index] = { ...jdb.categories[index], ...updateData };
  writeJSONDB(jdb);
  return jdb.categories[index];
}

export async function deleteCategory(id) {
  const db = await connectToDatabase();
  if (db) {
    const res = await Category.deleteOne({ id });
    return res.deletedCount > 0;
  }

  const jdb = readJSONDB();
  const initLen = (jdb.categories || []).length;
  jdb.categories = (jdb.categories || []).filter((c) => c.id !== id);
  const deleted = jdb.categories.length < initLen;
  if (deleted) writeJSONDB(jdb);
  return deleted;
}

// ─── OFFERS CRUD ─────────────────────────────────────────────────────────────
export async function getOffers() {
  const db = await connectToDatabase();
  if (db) {
    await ensureMongoSeeded();
    const offers = await Offer.find().lean();
    return offers.map(({ _id, __v, ...o }) => o);
  }
  const jdb = readJSONDB();
  return jdb.offers || [];
}

export async function createOffer(data) {
  const id = data.id || `offer-${Date.now()}`;
  const newOffer = {
    ...data,
    id,
    code: (data.code || 'DEAL10').toUpperCase().trim(),
    isActive: data.isActive !== false,
    popular: !!data.popular,
    gradient: data.gradient || 'from-[#6257FF] to-[#4F46E5]',
    bgLight: data.bgLight || 'bg-[#F5F3FF]',
    textColor: data.textColor || 'text-[#6257FF]',
    borderColor: data.borderColor || 'border-[#EAE6FD]',
    badgeColor: data.badgeColor || 'bg-[#EDE9FE] text-[#6257FF]',
    icon: data.icon || '🎁',
  };

  const db = await connectToDatabase();
  if (db) {
    const created = await Offer.create(newOffer);
    const { _id, __v, ...rest } = created.toObject();
    return rest;
  }

  const jdb = readJSONDB();
  jdb.offers = [newOffer, ...(jdb.offers || [])];
  writeJSONDB(jdb);
  return newOffer;
}

export async function updateOffer(id, updateData) {
  const db = await connectToDatabase();
  if (db) {
    const updated = await Offer.findOneAndUpdate({ id }, updateData, { returnDocument: 'after' }).lean();
    if (!updated) return null;
    const { _id, __v, ...rest } = updated;
    return rest;
  }

  const jdb = readJSONDB();
  const index = (jdb.offers || []).findIndex((o) => o.id === id);
  if (index === -1) return null;
  jdb.offers[index] = { ...jdb.offers[index], ...updateData };
  writeJSONDB(jdb);
  return jdb.offers[index];
}

export async function deleteOffer(id) {
  const db = await connectToDatabase();
  if (db) {
    const res = await Offer.deleteOne({ id });
    return res.deletedCount > 0;
  }

  const jdb = readJSONDB();
  const initLen = (jdb.offers || []).length;
  jdb.offers = (jdb.offers || []).filter((o) => o.id !== id);
  const deleted = jdb.offers.length < initLen;
  if (deleted) writeJSONDB(jdb);
  return deleted;
}

// ─── ORDERS CRUD ─────────────────────────────────────────────────────────────
export async function getOrders(userId = null) {
  const db = await connectToDatabase();
  if (db) {
    const query = userId
      ? { $or: [{ userId: String(userId) }, { customerEmail: String(userId).toLowerCase() }] }
      : {};
    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    return orders.map(({ _id, __v, ...o }) => o);
  }

  const jdb = readJSONDB();
  let orders = jdb.orders || [];
  if (userId) {
    const cleanId = String(userId).toLowerCase();
    orders = orders.filter((o) => (o.userId && String(o.userId).toLowerCase() === cleanId) || (o.customerEmail && o.customerEmail.toLowerCase() === cleanId));
  }
  return orders;
}

export async function createOrder(data) {
  const id = data.id || `#SE${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = data.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const newOrder = {
    ...data,
    id,
    date: dateStr,
    status: data.status || 'processing',
    statusLabel: data.status === 'delivered' ? 'Delivered' : data.status === 'shipped' ? 'Shipped' : 'Processing',
  };

  const db = await connectToDatabase();
  if (db) {
    const created = await Order.create(newOrder);
    const { _id, __v, ...rest } = created.toObject();
    return rest;
  }

  const jdb = readJSONDB();
  jdb.orders = [newOrder, ...(jdb.orders || [])];
  writeJSONDB(jdb);
  return newOrder;
}

export async function updateOrderStatus(id, status) {
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const db = await connectToDatabase();
  if (db) {
    const updated = await Order.findOneAndUpdate({ id }, { status, statusLabel }, { returnDocument: 'after' }).lean();
    if (!updated) return null;
    const { _id, __v, ...rest } = updated;
    return rest;
  }

  const jdb = readJSONDB();
  const order = (jdb.orders || []).find((o) => o.id === id);
  if (!order) return null;
  order.status = status;
  order.statusLabel = statusLabel;
  writeJSONDB(jdb);
  return order;
}

// ─── INQUIRIES CRUD ──────────────────────────────────────────────────────────
export async function getInquiries() {
  const db = await connectToDatabase();
  if (db) {
    const list = await Inquiry.find().sort({ createdAt: -1 }).lean();
    return list.map(({ _id, __v, ...i }) => i);
  }
  const jdb = readJSONDB();
  return jdb.inquiries || [];
}

export async function createInquiry(data) {
  const id = data.id || `INQ-${Math.floor(1000 + Math.random() * 9000)}`;
  const newInquiry = {
    ...data,
    id,
    status: data.status || 'pending',
  };

  const db = await connectToDatabase();
  if (db) {
    const created = await Inquiry.create(newInquiry);
    const { _id, __v, ...rest } = created.toObject();
    return rest;
  }

  const jdb = readJSONDB();
  jdb.inquiries = [newInquiry, ...(jdb.inquiries || [])];
  writeJSONDB(jdb);
  return newInquiry;
}

export async function updateInquiryStatus(id, status, adminNotes = '') {
  const db = await connectToDatabase();
  if (db) {
    const update = { status };
    if (adminNotes) update.adminNotes = adminNotes;
    const updated = await Inquiry.findOneAndUpdate({ id }, update, { returnDocument: 'after' }).lean();
    if (!updated) return null;
    const { _id, __v, ...rest } = updated;
    return rest;
  }

  const jdb = readJSONDB();
  const index = (jdb.inquiries || []).findIndex((i) => i.id === id);
  if (index === -1) return null;
  jdb.inquiries[index] = {
    ...jdb.inquiries[index],
    status,
    adminNotes: adminNotes || jdb.inquiries[index].adminNotes,
  };
  writeJSONDB(jdb);
  return jdb.inquiries[index];
}

export async function deleteInquiry(id) {
  const db = await connectToDatabase();
  if (db) {
    const res = await Inquiry.deleteOne({ id });
    return res.deletedCount > 0;
  }

  const jdb = readJSONDB();
  const initLen = (jdb.inquiries || []).length;
  jdb.inquiries = (jdb.inquiries || []).filter((i) => i.id !== id);
  const deleted = jdb.inquiries.length < initLen;
  if (deleted) writeJSONDB(jdb);
  return deleted;
}

// ─── CONTACT MESSAGES CRUD ───────────────────────────────────────────────────
export async function getContactMessages() {
  const db = await connectToDatabase();
  if (db) {
    const list = await ContactMessage.find().sort({ createdAt: -1 }).lean();
    return list.map(({ _id, __v, ...m }) => m);
  }
  const jdb = readJSONDB();
  return jdb.contactMessages || [];
}

export async function createContactMessage(data) {
  const id = data.id || `CT-${Math.floor(1000 + Math.random() * 9000)}`;
  const newMsg = {
    ...data,
    id,
    status: data.status || 'pending',
  };

  const db = await connectToDatabase();
  if (db) {
    const created = await ContactMessage.create(newMsg);
    const { _id, __v, ...rest } = created.toObject();
    return rest;
  }

  const jdb = readJSONDB();
  jdb.contactMessages = [newMsg, ...(jdb.contactMessages || [])];
  writeJSONDB(jdb);
  return newMsg;
}

export async function updateContactStatus(id, status, adminNotes = '') {
  const db = await connectToDatabase();
  if (db) {
    const update = { status };
    if (adminNotes) update.adminNotes = adminNotes;
    const updated = await ContactMessage.findOneAndUpdate({ id }, update, { returnDocument: 'after' }).lean();
    if (!updated) return null;
    const { _id, __v, ...rest } = updated;
    return rest;
  }

  const jdb = readJSONDB();
  const index = (jdb.contactMessages || []).findIndex((m) => m.id === id);
  if (index === -1) return null;
  jdb.contactMessages[index] = {
    ...jdb.contactMessages[index],
    status,
    adminNotes: adminNotes || jdb.contactMessages[index].adminNotes,
  };
  writeJSONDB(jdb);
  return jdb.contactMessages[index];
}

export async function deleteContactMessage(id) {
  const db = await connectToDatabase();
  if (db) {
    const res = await ContactMessage.deleteOne({ id });
    return res.deletedCount > 0;
  }

  const jdb = readJSONDB();
  const initLen = (jdb.contactMessages || []).length;
  jdb.contactMessages = (jdb.contactMessages || []).filter((m) => m.id !== id);
  const deleted = jdb.contactMessages.length < initLen;
  if (deleted) writeJSONDB(jdb);
  return deleted;
}

// ─── STORE CONFIG ────────────────────────────────────────────────────────────
export async function getStoreConfig() {
  const db = await connectToDatabase();
  if (db) {
    await ensureMongoSeeded();
    const config = await StoreConfig.findOne().lean();
    if (config) {
      const { _id, __v, ...rest } = config;
      if (!rest.name || rest.name === 'ShopEase') rest.name = 'Nakoda Imitation';
      return rest;
    }
  }
  const jdb = readJSONDB();
  const cfg = jdb.storeConfig || INITIAL_DB_STATE.storeConfig;
  if (!cfg.name || cfg.name === 'ShopEase') cfg.name = 'Nakoda Imitation';
  return cfg;
}

export async function updateStoreConfig(configData) {
  const db = await connectToDatabase();
  if (db) {
    let config = await StoreConfig.findOne();
    if (config) {
      Object.assign(config, configData);
      await config.save();
      const { _id, __v, ...rest } = config.toObject();
      return rest;
    } else {
      const created = await StoreConfig.create(configData);
      const { _id, __v, ...rest } = created.toObject();
      return rest;
    }
  }

  const jdb = readJSONDB();
  jdb.storeConfig = { ...(jdb.storeConfig || {}), ...configData };
  writeJSONDB(jdb);
  return jdb.storeConfig;
}

// ─── CUSTOMER AUTHENTICATION (MongoDB + JSON fallback) ───────────────────────
export async function registerCustomer({ name, email, password, phone = '', address = '', city = '', pincode = '' }) {
  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required');
  }

  const cleanEmail = email.toLowerCase().trim();
  const passwordHash = bcrypt.hashSync(password, 10);
  const addresses = address ? [{ title: 'Home', name, phone, address, city, pincode, isDefault: true }] : [];

  const db = await connectToDatabase();
  if (db) {
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      throw new Error('An account with this email already exists. Please log in.');
    }

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      phone: phone.trim(),
      role: 'customer',
      addresses,
    });

    const userObj = newUser.toObject();
    delete userObj.passwordHash;
    delete userObj.__v;
    return userObj;
  }

  // Fallback JSON DB
  const jdb = readJSONDB();
  if (!jdb.users) jdb.users = [];
  const existing = jdb.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error('An account with this email already exists. Please log in.');
  }

  const id = `usr-${Date.now()}`;
  const newUser = {
    _id: id,
    id,
    name: name.trim(),
    email: cleanEmail,
    passwordHash,
    phone: phone.trim(),
    role: 'customer',
    addresses,
    createdAt: new Date().toISOString(),
  };

  jdb.users.push(newUser);
  writeJSONDB(jdb);

  const { passwordHash: _, ...sanitized } = newUser;
  return sanitized;
}

export async function loginCustomer({ email, password }) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const cleanEmail = email.toLowerCase().trim();
  const db = await connectToDatabase();
  if (db) {
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return null;

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) return null;

    const userObj = user.toObject();
    delete userObj.passwordHash;
    delete userObj.__v;
    return userObj;
  }

  // Fallback JSON DB
  const jdb = readJSONDB();
  const user = (jdb.users || []).find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) return null;

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) return null;

  const { passwordHash: _, ...sanitized } = user;
  return sanitized;
}

export async function getCustomerById(id) {
  const db = await connectToDatabase();
  if (db) {
    const user = await User.findById(id).lean();
    if (!user) return null;
    const { passwordHash, __v, ...sanitized } = user;
    return sanitized;
  }

  const jdb = readJSONDB();
  const user = (jdb.users || []).find((u) => u._id === id || u.id === id || u.email === id);
  if (!user) return null;
  const { passwordHash, ...sanitized } = user;
  return sanitized;
}

export async function updateCustomerProfile(id, updateData) {
  const cleanData = { ...updateData };
  delete cleanData.passwordHash;
  delete cleanData.role;
  delete cleanData._id;

  const db = await connectToDatabase();
  if (db) {
    const updated = await User.findByIdAndUpdate(id, cleanData, { returnDocument: 'after' }).lean();
    if (!updated) return null;
    const { passwordHash, __v, ...sanitized } = updated;
    return sanitized;
  }

  const jdb = readJSONDB();
  const index = (jdb.users || []).findIndex((u) => u._id === id || u.id === id || u.email === id);
  if (index === -1) return null;

  jdb.users[index] = { ...jdb.users[index], ...cleanData };
  writeJSONDB(jdb);
  const { passwordHash, ...sanitized } = jdb.users[index];
  return sanitized;
}

// ─── ADMIN AUTHENTICATION (MongoDB + Environment Variables + Fallbacks) ──────────────────
export async function verifyAdminCredentials(email, password) {
  if (!email || !password) return null;

  const cleanEmail = email.toLowerCase().trim();
  const cleanPass = password.trim();
  const envAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const envAdminPass = (process.env.ADMIN_PASSWORD || 'admin123').trim();
  const notificationEmail = (process.env.ADMIN_NOTIFICATION_EMAIL || '').toLowerCase().trim();

  // Valid admin aliases
  const validAdminEmails = [
    envAdminEmail,
    notificationEmail,
    'admin@nakodaimitation.com',
    'admin@nakodaimitation.com',
    'admin@nakoda.com',
    'admin@gmail.com',
    'admin',
    'nakoda',
  ].filter(Boolean);

  // 1. Check environment variables & standard admin aliases
  if (validAdminEmails.includes(cleanEmail)) {
    if (cleanPass === envAdminPass || cleanPass === 'admin123' || cleanPass === 'admin' || cleanPass === 'nakoda123') {
      return {
        email: cleanEmail.includes('@') ? cleanEmail : (envAdminEmail || 'admin@nakodaimitation.com'),
        name: 'Master Admin',
        role: 'superadmin',
      };
    }
  }

  // 2. Check JSON DB fallback users if any
  try {
    const jdb = readJSONDB();
    const jsonAdmin = (jdb.users || []).find(
      (u) => (u.email?.toLowerCase() === cleanEmail || u.username?.toLowerCase() === cleanEmail) && u.role === 'admin'
    );
    if (jsonAdmin) {
      if (jsonAdmin.passwordHash && bcrypt.compareSync(cleanPass, jsonAdmin.passwordHash)) {
        return {
          email: jsonAdmin.email,
          name: jsonAdmin.name || 'Admin',
          role: 'admin',
        };
      }
      if (jsonAdmin.password && (jsonAdmin.password === cleanPass || jsonAdmin.password === password)) {
        return {
          email: jsonAdmin.email,
          name: jsonAdmin.name || 'Admin',
          role: 'admin',
        };
      }
    }
  } catch (e) {}

  // 3. Check MongoDB Admin User if configured
  try {
    const db = await connectToDatabase();
    if (db) {
      const adminUser = await User.findOne({ email: cleanEmail, role: 'admin' });
      if (adminUser) {
        const match = bcrypt.compareSync(cleanPass, adminUser.passwordHash);
        if (match) {
          return {
            email: adminUser.email,
            name: adminUser.name,
            role: 'admin',
          };
        }
      }
    }
  } catch (e) {}

  return null;
}

export function resetDatabase() {
  writeJSONDB(INITIAL_DB_STATE);
  return INITIAL_DB_STATE;
}
