import fs from 'fs';
import path from 'path';
import os from 'os';
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
import Wishlist from '../models/Wishlist.js';
import Cart from '../models/Cart.js';
import Review from '../models/Review.js';
import { broadcastCatalogEvent, CATALOG_EVENTS } from './events.js';

const IS_SERVERLESS = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NETLIFY ||
  (typeof process.cwd === 'function' && process.cwd().startsWith('/var/task'))
);

const LOCAL_DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');
const LOCAL_SEED_TEMPLATE_PATH = path.join(process.cwd(), 'src', 'data', 'seedTemplate.json');

const DB_FILE_PATH = IS_SERVERLESS
  ? path.join(os.tmpdir(), 'nakoda_db.json')
  : LOCAL_DB_PATH;

const SEED_TEMPLATE_FILE_PATH = IS_SERVERLESS
  ? path.join(os.tmpdir(), 'nakoda_seedTemplate.json')
  : LOCAL_SEED_TEMPLATE_PATH;

// Hot in-memory fallback state to ensure 100% uptime and resilience against read-only filesystems
let inMemoryDB = null;

// Default Explore Collections section configuration
export const DEFAULT_EXPLORE_SECTION = {
  title: 'Explore Our Collections',
  subtitle: 'Find exactly what you’re looking for across our curated lifestyle, grocery, apparel, and travel categories.',
  enabled: true,
  collections: [
    { id: 'bags-luggage', name: 'Bags & Trolleys', categoryId: 'bags-luggage', image: '/assets/images/prod_trolley.jpg', badge: 'Popular', order: 1, isActive: true },
    { id: 'jewelry', name: 'Jewelry & Watches', categoryId: 'jewelry', image: '/assets/images/nakoda/hero.jpg', badge: 'Trending', order: 2, isActive: true },
    { id: 'food-grocery', name: 'Papad & Gourmet', categoryId: 'food-grocery', image: '/assets/images/prod_papad.jpg', badge: 'Authentic', order: 3, isActive: true },
    { id: 'undergarments', name: 'Undergarments', categoryId: 'undergarments', image: '/assets/images/prod_innerwear.jpg', badge: 'Essential', order: 4, isActive: true },
    { id: 'electronics', name: 'Electronics', categoryId: 'electronics', image: '/assets/images/prod_headphones.jpg', badge: 'Audio', order: 5, isActive: true },
    { id: 'clothing', name: 'Fashion & Outfits', categoryId: 'clothing', image: '/assets/images/prod_denim_jacket.jpg', badge: 'New', order: 6, isActive: true },
    { id: 'footwear', name: 'Footwear & Shoes', categoryId: 'footwear', image: '/assets/images/prod_sneakers.jpg', badge: 'Comfort', order: 7, isActive: true },
    { id: 'home-living', name: 'Home & Living', categoryId: 'home-living', image: '/assets/images/hero_plant.jpg', badge: 'Decor', order: 8, isActive: true },
  ],
};

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
      availableSizes: ['M', 'XL'],
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
      deliveryAddress: '6, Honey Complex, Opposite Gunjan Cinema, Koparli Road, Gunjan, G.I.D.C, Vapi, Gujarat 396195',
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
      deliveryAddress: 'Flat 302, Palm Heights, Koparli Road, Vapi — 396195',
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
      message: 'Hi Nakoda team, are your Vapi store hours the same on Sundays as well? I would like to visit in person.',
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
    address: '6, Honey Complex, Opposite Gunjan Cinema, Koparli Road, Gunjan, G.I.D.C, Vapi, Gujarat 396195',
    hours: 'Mon - Sun: 9:30 AM – 9:30 PM',
    currency: '₹',
    exploreSection: DEFAULT_EXPLORE_SECTION,
  },
  users: [],
  reviews: [],
};

// ─── JSON File Storage Helpers (Fallback & Serverless-Safe) ──────────────────
function getInitialDbClone() {
  return JSON.parse(JSON.stringify(INITIAL_DB_STATE));
}

function initJSONDB() {
  try {
    if (!inMemoryDB) {
      inMemoryDB = getInitialDbClone();
    }
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (e) {}
    }
    if (!fs.existsSync(DB_FILE_PATH)) {
      let baseline = null;
      if (fs.existsSync(LOCAL_DB_PATH)) {
        try {
          baseline = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
        } catch (e) {}
      }
      const dataToSave = baseline || inMemoryDB || getInitialDbClone();
      try {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
        inMemoryDB = dataToSave;
      } catch (e) {
        // Read-only filesystem or restricted permissions; inMemoryDB will maintain persistence
      }
    }
  } catch (err) {
    if (!inMemoryDB) inMemoryDB = getInitialDbClone();
  }
}

function readJSONDB() {
  initJSONDB();
  try {
    let parsed = null;
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      parsed = JSON.parse(data);
    } else if (fs.existsSync(LOCAL_DB_PATH)) {
      const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      parsed = JSON.parse(data);
    }

    if (!parsed) {
      parsed = inMemoryDB ? JSON.parse(JSON.stringify(inMemoryDB)) : getInitialDbClone();
    }

    const needsSeed =
      !parsed.isInitialized &&
      (!parsed.products || !Array.isArray(parsed.products) || parsed.products.length === 0);

    if (needsSeed) {
      parsed.products = INITIAL_DB_STATE.products;
      if (!parsed.categories || parsed.categories.length === 0) parsed.categories = INITIAL_DB_STATE.categories;
      if (!parsed.offers || parsed.offers.length === 0) parsed.offers = INITIAL_DB_STATE.offers;
      if (!parsed.storeConfig) parsed.storeConfig = INITIAL_DB_STATE.storeConfig;
      parsed.isInitialized = true;
      try {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
      } catch (e) {}
    }

    inMemoryDB = parsed;
    return parsed;
  } catch (err) {
    return inMemoryDB ? JSON.parse(JSON.stringify(inMemoryDB)) : getInitialDbClone();
  }
}

function writeJSONDB(data) {
  inMemoryDB = JSON.parse(JSON.stringify(data));
  initJSONDB();
  try {
    const tmpPath = `${DB_FILE_PATH}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpPath, DB_FILE_PATH);
    return true;
  } catch (err) {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (e) {
      // Disk write prevented (e.g. read-only environment); inMemoryDB keeps mutations active
      return true;
    }
  }
}

// ─── Ultra High-Speed In-Memory Cache ────────────────────────────────────────
const memoryCache = {
  products: null,
  productsTime: 0,
  categories: null,
  categoriesTime: 0,
  offers: null,
  offersTime: 0,
  config: null,
  configTime: 0,
  catalogBundle: null,
  catalogBundleTime: 0,
  TTL: 300000, // 5-minute hot cache — safe because all mutations immediately invalidate
  invalidateProducts() {
    memoryCache.products = null;
    memoryCache.productsTime = 0;
    memoryCache.catalogBundle = null;
  },
  invalidateCategories() {
    memoryCache.categories = null;
    memoryCache.categoriesTime = 0;
    memoryCache.catalogBundle = null;
  },
  invalidateOffers() {
    memoryCache.offers = null;
    memoryCache.offersTime = 0;
    memoryCache.catalogBundle = null;
  },
  invalidateConfig() {
    memoryCache.config = null;
    memoryCache.configTime = 0;
    memoryCache.catalogBundle = null;
  },
};

export async function getCatalogBundle() {
  if (memoryCache.catalogBundle && Date.now() - memoryCache.catalogBundleTime < memoryCache.TTL) {
    return memoryCache.catalogBundle;
  }

  const [products, categories, offers, storeConfig] = await Promise.all([
    getProducts(),
    getCategories(),
    getOffers(),
    getStoreConfig(),
  ]);

  const bundle = {
    products,
    categories,
    offers,
    storeConfig,
    exploreSection: storeConfig?.exploreSection || DEFAULT_EXPLORE_SECTION,
  };

  memoryCache.catalogBundle = bundle;
  memoryCache.catalogBundleTime = Date.now();
  return bundle;
}

// ─── MASTER SEED TEMPLATE MANAGEMENT (Updateable & Dynamic) ─────────────────
export function getMasterSeedTemplate() {
  try {
    if (fs.existsSync(SEED_TEMPLATE_FILE_PATH)) {
      const raw = fs.readFileSync(SEED_TEMPLATE_FILE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
    if (fs.existsSync(LOCAL_SEED_TEMPLATE_PATH)) {
      const raw = fs.readFileSync(LOCAL_SEED_TEMPLATE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    // Graceful fallback to initial state
  }
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    products: INITIAL_DB_STATE.products,
    categories: INITIAL_DB_STATE.categories,
    offers: INITIAL_DB_STATE.offers,
    storeConfig: INITIAL_DB_STATE.storeConfig,
  };
}

export function updateMasterSeedTemplate(customData) {
  try {
    const current = getMasterSeedTemplate();
    const updated = {
      ...current,
      ...customData,
      version: (current.version || 1) + 1,
      updatedAt: new Date().toISOString(),
    };
    try {
      const dir = path.dirname(SEED_TEMPLATE_FILE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(SEED_TEMPLATE_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');
    } catch (e) {
      // Disk write prevented in serverless; updated object is still returned and broadcasted
    }
    
    broadcastCatalogEvent(CATALOG_EVENTS.SEED_TEMPLATE_UPDATED, {
      version: updated.version,
      updatedAt: updated.updatedAt,
      productsCount: (updated.products || []).length,
      categoriesCount: (updated.categories || []).length,
      offersCount: (updated.offers || []).length,
    });
    return updated;
  } catch (err) {
    console.error('Failed to update master seed template:', err);
    throw err;
  }
}

export async function restoreSeedCatalog(customSeed = null) {
  const template = customSeed || getMasterSeedTemplate();
  const db = await connectToDatabase();
  if (db) {
    await Promise.all([
      Product.deleteMany({}),
      Category.deleteMany({}),
      Offer.deleteMany({}),
    ]);

    const prods = template.products || INITIAL_DB_STATE.products;
    const cats = template.categories || INITIAL_DB_STATE.categories;
    const offs = template.offers || INITIAL_DB_STATE.offers;

    if (prods.length > 0) await Product.insertMany(prods);
    if (cats.length > 0) await Category.insertMany(cats);
    if (offs.length > 0) await Offer.insertMany(offs);

    await StoreConfig.updateOne({}, { $set: { isInitialized: true } }, { upsert: true });

    isSeeded = true;
    memoryCache.invalidateProducts();
    memoryCache.invalidateCategories();
    memoryCache.invalidateOffers();
    memoryCache.invalidateConfig();

    broadcastCatalogEvent(CATALOG_EVENTS.CATALOG_SEEDED, {
      productsCount: prods.length,
      categoriesCount: cats.length,
      offersCount: offs.length,
    });

    return { success: true, count: prods.length };
  }

  // Fallback JSON DB
  const jdb = readJSONDB();
  jdb.products = template.products || INITIAL_DB_STATE.products;
  jdb.categories = template.categories || INITIAL_DB_STATE.categories;
  jdb.offers = template.offers || INITIAL_DB_STATE.offers;
  jdb.isInitialized = true;
  writeJSONDB(jdb);

  memoryCache.invalidateProducts();
  memoryCache.invalidateCategories();
  memoryCache.invalidateOffers();

  broadcastCatalogEvent(CATALOG_EVENTS.CATALOG_SEEDED, {
    productsCount: (jdb.products || []).length,
    categoriesCount: (jdb.categories || []).length,
    offersCount: (jdb.offers || []).length,
  });

  return { success: true, count: (jdb.products || []).length };
}

export async function clearCatalog() {
  const db = await connectToDatabase();
  if (db) {
    await Promise.all([
      Product.deleteMany({}),
      Category.deleteMany({}),
      Offer.deleteMany({}),
    ]);
    await StoreConfig.updateOne({}, { $set: { isInitialized: true } }, { upsert: true });
    isSeeded = true;
    memoryCache.invalidateProducts();
    memoryCache.invalidateCategories();
    memoryCache.invalidateOffers();

    broadcastCatalogEvent(CATALOG_EVENTS.CATALOG_CLEARED, { timestamp: new Date().toISOString() });
    return { success: true, count: 0 };
  }

  const jdb = readJSONDB();
  jdb.products = [];
  jdb.categories = [];
  jdb.offers = [];
  jdb.isInitialized = true;
  writeJSONDB(jdb);

  memoryCache.invalidateProducts();
  memoryCache.invalidateCategories();
  memoryCache.invalidateOffers();

  broadcastCatalogEvent(CATALOG_EVENTS.CATALOG_CLEARED, { timestamp: new Date().toISOString() });
  return { success: true, count: 0 };
}

// ─── MongoDB Auto-Seeding Helper (Parallel Singleton) ─────────────────────────
let isSeeded = false;
let seedPromise = null;

async function ensureMongoSeeded() {
  if (isSeeded) return;
  if (!seedPromise) {
    seedPromise = (async () => {
      try {
        const prodCount = await Product.countDocuments().catch(() => 0);
        const template = getMasterSeedTemplate();

        if (prodCount === 0) {
          const jdb = readJSONDB();
          const productsToSeed = (template.products && template.products.length > 0)
            ? template.products
            : (jdb.products && jdb.products.length > 0 ? jdb.products : INITIAL_DB_STATE.products);

          if (productsToSeed && productsToSeed.length > 0) {
            console.log(`🌱 Synchronizing ${productsToSeed.length} catalog products to MongoDB Atlas...`);
            await Product.insertMany(productsToSeed).catch((e) => console.warn('Product sync notice:', e.message));
          }
        }

        const catCount = await Category.countDocuments().catch(() => 0);
        if (catCount === 0) {
          await Category.insertMany(template.categories || INITIAL_DB_STATE.categories).catch(() => {});
        }

        const offerCount = await Offer.countDocuments().catch(() => 0);
        if (offerCount === 0) {
          await Offer.insertMany(template.offers || INITIAL_DB_STATE.offers).catch(() => {});
        }

        const existingConfig = await StoreConfig.findOne().lean().catch(() => null);
        if (!existingConfig) {
          await StoreConfig.create({
            ...(template.storeConfig || INITIAL_DB_STATE.storeConfig),
            isInitialized: true,
          }).catch(() => {});
        }

        isSeeded = true;
      } catch (err) {
        console.warn('MongoDB initial seed notice:', err.message);
        isSeeded = true; // Avoid re-trying in loop
      } finally {
        seedPromise = null;
      }
    })();
  }
  await seedPromise;
}

// ─── PRODUCTS CRUD ───────────────────────────────────────────────────────────
export async function getProducts(filters = {}) {
  const hasFilters = Boolean(
    (filters.category && filters.category !== 'all') ||
    (filters.stockStatus && filters.stockStatus !== 'all') ||
    filters.isPopular ||
    filters.isFeatured ||
    filters.search
  );

  // Return from high-speed memory cache for default catalog load (<1ms)
  if (!hasFilters && memoryCache.products && Date.now() - memoryCache.productsTime < memoryCache.TTL) {
    return memoryCache.products;
  }

  const db = await connectToDatabase();
  if (db) {
    await ensureMongoSeeded();
    const query = {};
    if (filters.category && filters.category !== 'all') query.category = filters.category;
    if (filters.stockStatus && filters.stockStatus !== 'all') query.stockStatus = filters.stockStatus;
    if (filters.isPopular) query.isPopular = true;
    if (filters.isFeatured) query.isFeatured = true;
    if (filters.search) {
      const cleanSearch = String(filters.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(cleanSearch, 'i');
      query.$or = [{ name: regex }, { categoryName: regex }, { tags: regex }, { id: regex }];
    }
    const products = await Product.find(query).sort({ createdAt: -1 }).lean();
    const cleanProducts = products.map(({ _id, __v, ...p }) => p);

    if (!hasFilters) {
      memoryCache.products = cleanProducts;
      memoryCache.productsTime = Date.now();
    }

    return cleanProducts;
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

  if (!hasFilters) {
    memoryCache.products = list;
    memoryCache.productsTime = Date.now();
  }

  return list;
}

export function sanitizeProductPayload(data = {}) {
  const {
    _id,
    __v,
    createdAt,
    updatedAt,
    ...rest
  } = data;

  const sanitized = { ...rest };
  if (sanitized.price !== undefined) sanitized.price = Number(sanitized.price) || 0;
  if (sanitized.oldPrice !== undefined) sanitized.oldPrice = Number(sanitized.oldPrice) || undefined;
  if (sanitized.stockCount !== undefined) {
    const count = Math.max(0, parseInt(sanitized.stockCount, 10) || 0);
    sanitized.stockCount = count;
    sanitized.stockStatus = count === 0 ? 'out_of_stock' : count < 5 ? 'low_stock' : 'in_stock';
  }
  if (sanitized.rating !== undefined) sanitized.rating = Number(sanitized.rating) || 4.8;
  if (sanitized.reviews !== undefined) sanitized.reviews = Number(sanitized.reviews) || 0;
  if (sanitized.tags !== undefined) {
    sanitized.tags = Array.isArray(sanitized.tags)
      ? sanitized.tags
      : typeof sanitized.tags === 'string'
      ? sanitized.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];
  }
  if (sanitized.sizes !== undefined) {
    sanitized.sizes = Array.isArray(sanitized.sizes)
      ? sanitized.sizes
      : typeof sanitized.sizes === 'string'
      ? sanitized.sizes.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
  }
  if (sanitized.colors && !Array.isArray(sanitized.colors)) {
    sanitized.colors = [];
  }
  return sanitized;
}

export async function getProductById(id) {
  const cleanId = String(id || '').trim();
  if (!cleanId) return null;

  const db = await connectToDatabase();
  if (db) {
    await ensureMongoSeeded();
    const prod = await Product.findOne({ id: cleanId }).lean();
    if (prod) {
      const { _id, __v, ...rest } = prod;
      return rest;
    }
  }
  const jdb = readJSONDB();
  return (jdb.products || []).find((p) => String(p.id).trim() === cleanId) || null;
}

export const getProductByIdDB = getProductById;

export async function createProduct(productData) {
  const generateUniqueId = () => `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  let cleanId = String(productData.id || '').trim();

  const db = await connectToDatabase();
  if (db) {
    if (!cleanId || (await Product.exists({ id: cleanId }))) {
      cleanId = generateUniqueId();
      while (await Product.exists({ id: cleanId })) {
        cleanId = generateUniqueId();
      }
    }
  } else {
    const jdb = readJSONDB();
    if (!cleanId || (jdb.products || []).some((p) => String(p.id).trim() === cleanId)) {
      cleanId = generateUniqueId();
    }
  }

  const sanitized = sanitizeProductPayload(productData);
  const price = Number(sanitized.price) || 0;
  const oldPrice = Number(sanitized.oldPrice) || 0;
  const discountPercent = oldPrice > price && oldPrice > 0
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : Number(sanitized.discountPercent) || 0;
  const stockCount = Number(sanitized.stockCount) || 0;
  const stockStatus = stockCount <= 0 ? 'out_of_stock' : stockCount < 5 ? 'low_stock' : 'in_stock';

  let newProduct = {
    ...sanitized,
    id: cleanId,
    price,
    oldPrice: oldPrice || undefined,
    discountPercent,
    stockCount,
    stockStatus,
    rating: Number(sanitized.rating) || 5.0,
    reviews: Number(sanitized.reviews) || 0,
    isPopular: !!sanitized.isPopular,
    isFeatured: !!sanitized.isFeatured,
    tags: Array.isArray(sanitized.tags) ? sanitized.tags : [],
    createdAt: sanitized.createdAt || new Date().toISOString(),
  };

  // 1. Persist to MongoDB if available (with auto-retry on duplicate key collision)
  if (db) {
    try {
      await Product.create(newProduct);
    } catch (err) {
      if (err.code === 11000 || (err.message && err.message.includes('E11000'))) {
        console.warn(`Product ID collision on ${newProduct.id} (E11000). Generating fresh ID and retrying...`);
        newProduct.id = generateUniqueId();
        cleanId = newProduct.id;
        await Product.create(newProduct);
      } else {
        throw err;
      }
    }
  } else if (process.env.MONGODB_URI) {
    console.warn('⚠️ MongoDB Atlas unavailable — persisting product to local fallback only.');
  }

  // 2. Always persist to local atomic JSON database
  const jdb = readJSONDB();
  jdb.products = [newProduct, ...(jdb.products || []).filter((p) => String(p.id).trim() !== cleanId)];
  writeJSONDB(jdb);

  memoryCache.invalidateProducts();
  memoryCache.invalidateCategories();
  broadcastCatalogEvent(CATALOG_EVENTS.PRODUCT_CREATED, { product: newProduct });
  return newProduct;
}

export async function updateProduct(id, updateData) {
  const cleanId = String(id || '').trim();
  if (!cleanId) return null;

  const sanitized = sanitizeProductPayload(updateData);
  delete sanitized.id; // Prevent modifying unique business key ID

  let updatedProduct = null;

  // 1. Update in MongoDB if available
  const db = await connectToDatabase();
  if (db) {
    const updated = await Product.findOneAndUpdate(
      { id: cleanId },
      { $set: sanitized },
      { returnDocument: 'after' }
    ).lean();
    if (updated) {
      const { _id, __v, ...rest } = updated;
      updatedProduct = rest;
    }
  } else if (process.env.MONGODB_URI) {
    console.warn('⚠️ MongoDB Atlas unavailable — updating product in local fallback only.');
  }

  // 2. Always update local JSON database
  const jdb = readJSONDB();
  const index = (jdb.products || []).findIndex((p) => String(p.id).trim() === cleanId);
  if (index !== -1) {
    const current = jdb.products[index];
    const merged = { ...current, ...sanitized, id: cleanId };
    if (merged.stockCount !== undefined) {
      const sc = Number(merged.stockCount);
      merged.stockCount = sc;
      merged.stockStatus = sc <= 0 ? 'out_of_stock' : sc < 5 ? 'low_stock' : 'in_stock';
    }
    jdb.products[index] = merged;
    writeJSONDB(jdb);
    if (!updatedProduct) {
      updatedProduct = merged;
    }
  } else if (!updatedProduct) {
    return null;
  }

  memoryCache.invalidateProducts();
  memoryCache.invalidateCategories();
  broadcastCatalogEvent(CATALOG_EVENTS.PRODUCT_UPDATED, { product: updatedProduct });
  return updatedProduct;
}

export async function deleteProduct(id) {
  const cleanId = String(id || '').trim();
  if (!cleanId) return false;

  let deleted = false;

  // 1. Delete from MongoDB if available
  const db = await connectToDatabase();
  if (db) {
    const res = await Product.deleteOne({ id: cleanId });
    if (res.deletedCount > 0) deleted = true;
  } else if (process.env.MONGODB_URI) {
    console.warn('⚠️ MongoDB Atlas unavailable — deleting product from local fallback only.');
  }


  // 2. Always delete from local JSON database
  const jdb = readJSONDB();
  const initLen = (jdb.products || []).length;
  jdb.products = (jdb.products || []).filter((p) => String(p.id).trim() !== cleanId);
  if (jdb.products.length < initLen) {
    deleted = true;
  }
  writeJSONDB(jdb);

  memoryCache.invalidateProducts();
  memoryCache.invalidateCategories();
  broadcastCatalogEvent(CATALOG_EVENTS.PRODUCT_DELETED, { id: cleanId });

  return deleted;
}

export async function bulkDeleteProductsDB(ids = []) {
  if (!Array.isArray(ids) || ids.length === 0) return { deletedCount: 0 };
  const cleanIds = ids.map((id) => String(id).trim()).filter(Boolean);

  const db = await connectToDatabase();
  if (db) {
    try {
      await Product.deleteMany({ id: { $in: cleanIds } });
    } catch (e) {
      console.warn('MongoDB bulk delete notice:', e.message);
    }
  }

  const jdb = readJSONDB();
  const initLen = (jdb.products || []).length;
  jdb.products = (jdb.products || []).filter((p) => !cleanIds.includes(String(p.id).trim()));
  const deletedCount = initLen - jdb.products.length;
  writeJSONDB(jdb);

  memoryCache.invalidateProducts();
  memoryCache.invalidateCategories();
  broadcastCatalogEvent(CATALOG_EVENTS.PRODUCTS_BULK_DELETED, { ids: cleanIds });
  return { deletedCount };
}

export async function bulkUpdateProductsDB(ids = [], updates = {}) {
  if (!Array.isArray(ids) || ids.length === 0) return { updatedCount: 0 };
  const cleanIds = ids.map((id) => String(id).trim()).filter(Boolean);
  const sanitized = sanitizeProductPayload(updates);
  delete sanitized.id;

  const db = await connectToDatabase();
  if (db) {
    try {
      await Product.updateMany({ id: { $in: cleanIds } }, { $set: sanitized });
    } catch (e) {
      console.warn('MongoDB bulk update notice:', e.message);
    }
  }

  const jdb = readJSONDB();
  let count = 0;
  jdb.products = (jdb.products || []).map((p) => {
    if (cleanIds.includes(String(p.id).trim())) {
      count++;
      const merged = { ...p, ...sanitized };
      if (merged.stockCount !== undefined) {
        const sc = Number(merged.stockCount);
        merged.stockCount = sc;
        merged.stockStatus = sc <= 0 ? 'out_of_stock' : sc < 5 ? 'low_stock' : 'in_stock';
      }
      return merged;
    }
    return p;
  });
  writeJSONDB(jdb);

  memoryCache.invalidateProducts();
  memoryCache.invalidateCategories();
  broadcastCatalogEvent(CATALOG_EVENTS.PRODUCTS_BULK_UPDATED, { ids: cleanIds, updates: sanitized });
  return { updatedCount: count };
}

export async function getExistingProductIdsDB() {
  const db = await connectToDatabase();
  if (db) {
    await ensureMongoSeeded();
    const docs = await Product.find({}, { id: 1 }).lean();
    return docs.map((d) => String(d.id).trim()).filter(Boolean);
  }
  const jdb = readJSONDB();
  return (jdb.products || []).map((p) => String(p.id).trim()).filter(Boolean);
}

export async function bulkImportProductsDB({
  products = [],
  duplicateMode = 'skip', // 'skip' | 'update' | 'generate_id'
  importMode = 'create', // 'create' | 'update' | 'upsert'
}) {
  if (!Array.isArray(products) || products.length === 0) {
    return { success: true, total: 0, inserted: 0, updated: 0, skipped: 0, failed: 0, errors: [] };
  }

  const generateUniqueId = () => `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const db = await connectToDatabase();
  if (db) {
    await ensureMongoSeeded();
  }

  // Pre-fetch all existing product IDs
  const existingIdsList = await getExistingProductIdsDB();
  const dbIdSet = new Set(existingIdsList);

  const jdb = readJSONDB();
  const jdbProductMap = new Map((jdb.products || []).map((p) => [String(p.id).trim(), p]));

  let insertedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const executionErrors = [];

  const seenInCurrentRun = new Set();

  for (let i = 0; i < products.length; i++) {
    const raw = products[i];
    const rowNum = raw._rowIndex !== undefined ? raw._rowIndex + 2 : i + 1;
    const prodName = raw.name || `Row ${rowNum}`;

    try {
      if (!raw.name || typeof raw.name !== 'string' || !raw.name.trim()) {
        failedCount++;
        executionErrors.push({ row: rowNum, product: prodName, error: 'Product name is required' });
        continue;
      }
      const priceNum = Number(raw.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        failedCount++;
        executionErrors.push({ row: rowNum, product: prodName, error: 'Valid price greater than 0 is required' });
        continue;
      }

      let cleanId = String(raw.id || '').trim();
      let isExisting = false;

      if (cleanId) {
        if (dbIdSet.has(cleanId) || seenInCurrentRun.has(cleanId)) {
          isExisting = true;
        }
      }

      let action = 'insert';

      if (importMode === 'update') {
        if (!cleanId || !isExisting) {
          skippedCount++;
          continue;
        }
        action = 'update';
      } else if (importMode === 'create') {
        if (isExisting) {
          if (duplicateMode === 'skip') {
            skippedCount++;
            continue;
          } else if (duplicateMode === 'update') {
            action = 'update';
          } else if (duplicateMode === 'generate_id') {
            cleanId = generateUniqueId();
            while (dbIdSet.has(cleanId) || seenInCurrentRun.has(cleanId)) {
              cleanId = generateUniqueId();
            }
            action = 'insert';
          }
        } else {
          if (!cleanId) {
            cleanId = generateUniqueId();
            while (dbIdSet.has(cleanId) || seenInCurrentRun.has(cleanId)) {
              cleanId = generateUniqueId();
            }
          }
          action = 'insert';
        }
      } else {
        // upsert
        if (isExisting) {
          action = 'update';
        } else {
          if (!cleanId) {
            cleanId = generateUniqueId();
            while (dbIdSet.has(cleanId) || seenInCurrentRun.has(cleanId)) {
              cleanId = generateUniqueId();
            }
          }
          action = 'insert';
        }
      }

      const sanitized = sanitizeProductPayload(raw);
      const price = Number(sanitized.price) || 0;
      const oldPrice = Number(sanitized.oldPrice) || 0;
      const discountPercent =
        oldPrice > price && oldPrice > 0
          ? Math.round(((oldPrice - price) / oldPrice) * 100)
          : Number(sanitized.discountPercent) || 0;
      const stockCount = Number(sanitized.stockCount) || 0;
      const stockStatus = stockCount <= 0 ? 'out_of_stock' : stockCount < 5 ? 'low_stock' : 'in_stock';

      const finalProduct = {
        ...sanitized,
        id: cleanId,
        price,
        oldPrice: oldPrice || undefined,
        discountPercent,
        stockCount,
        stockStatus,
        rating: Number(sanitized.rating) || 4.8,
        reviews: Number(sanitized.reviews) || 0,
        isPopular: !!sanitized.isPopular,
        isFeatured: !!sanitized.isFeatured,
        tags: Array.isArray(sanitized.tags) ? sanitized.tags : [],
        sizes: Array.isArray(sanitized.sizes) ? sanitized.sizes : [],
        variants: Array.isArray(sanitized.variants) ? sanitized.variants : [],
        colors: Array.isArray(sanitized.colors) ? sanitized.colors : [],
        createdAt: sanitized.createdAt || new Date().toISOString(),
      };

      delete finalProduct._rowIndex;
      delete finalProduct._isValid;
      delete finalProduct._errors;
      delete finalProduct._warnings;
      delete finalProduct._isDuplicate;
      delete finalProduct._duplicateType;

      if (action === 'insert') {
        if (db) {
          try {
            await Product.create(finalProduct);
          } catch (createErr) {
            if (createErr.code === 11000 || (createErr.message && createErr.message.includes('E11000'))) {
              finalProduct.id = generateUniqueId();
              await Product.create(finalProduct);
            } else {
              throw createErr;
            }
          }
        }
        dbIdSet.add(finalProduct.id);
        seenInCurrentRun.add(finalProduct.id);
        jdbProductMap.set(finalProduct.id, finalProduct);
        insertedCount++;
      } else if (action === 'update') {
        if (db) {
          await Product.findOneAndUpdate(
            { id: cleanId },
            { $set: finalProduct },
            { returnDocument: 'after' }
          );
        }
        const existingJdb = jdbProductMap.get(cleanId) || {};
        jdbProductMap.set(cleanId, { ...existingJdb, ...finalProduct, id: cleanId });
        updatedCount++;
      }
    } catch (err) {
      failedCount++;
      executionErrors.push({
        row: rowNum,
        product: prodName,
        error: err.message || 'Database write error',
      });
    }
  }

  // Sync to local JSON DB
  jdb.products = Array.from(jdbProductMap.values());
  writeJSONDB(jdb);

  // Invalidate caches
  memoryCache.invalidateProducts();
  memoryCache.invalidateCategories();

  // Broadcast event
  broadcastCatalogEvent(CATALOG_EVENTS.PRODUCTS_BULK_UPDATED, {
    count: insertedCount + updatedCount,
    insertedCount,
    updatedCount,
  });

  return {
    success: true,
    total: products.length,
    inserted: insertedCount,
    updated: updatedCount,
    skipped: skippedCount,
    failed: failedCount,
    errors: executionErrors,
  };
}

// ─── CATEGORIES CRUD ─────────────────────────────────────────────────────────
export async function getCategories() {
  if (memoryCache.categories && Date.now() - memoryCache.categoriesTime < memoryCache.TTL) {
    return memoryCache.categories;
  }

  const db = await connectToDatabase();
  if (db) {
    await ensureMongoSeeded();
    const [categories, products] = await Promise.all([
      Category.find().lean(),
      Product.find().select('category').lean(),
    ]);

    const result = categories.map(({ _id, __v, ...cat }) => ({
      ...cat,
      count: products.filter((p) => p.category === cat.id).length,
    }));

    memoryCache.categories = result;
    memoryCache.categoriesTime = Date.now();
    return result;
  }

  const jdb = readJSONDB();
  const products = jdb.products || [];
  const result = (jdb.categories || []).map((cat) => ({
    ...cat,
    count: products.filter((p) => p.category === cat.id).length,
  }));

  memoryCache.categories = result;
  memoryCache.categoriesTime = Date.now();
  return result;
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
    memoryCache.invalidateCategories();
    broadcastCatalogEvent(CATALOG_EVENTS.CATEGORY_CREATED, { category: rest });
    return rest;
  }

  const jdb = readJSONDB();
  jdb.categories = [...(jdb.categories || []), newCat];
  writeJSONDB(jdb);
  memoryCache.invalidateCategories();
  broadcastCatalogEvent(CATALOG_EVENTS.CATEGORY_CREATED, { category: newCat });
  return newCat;
}

export async function updateCategory(id, updateData) {
  const db = await connectToDatabase();
  if (db) {
    const updated = await Category.findOneAndUpdate({ id }, updateData, { returnDocument: 'after' }).lean();
    if (!updated) return null;
    const { _id, __v, ...rest } = updated;
    memoryCache.invalidateCategories();
    broadcastCatalogEvent(CATALOG_EVENTS.CATEGORY_UPDATED, { category: rest });
    return rest;
  }

  const jdb = readJSONDB();
  const index = (jdb.categories || []).findIndex((c) => c.id === id);
  if (index === -1) return null;
  jdb.categories[index] = { ...jdb.categories[index], ...updateData };
  writeJSONDB(jdb);
  memoryCache.invalidateCategories();
  broadcastCatalogEvent(CATALOG_EVENTS.CATEGORY_UPDATED, { category: jdb.categories[index] });
  return jdb.categories[index];
}

export async function deleteCategory(id) {
  const db = await connectToDatabase();
  if (db) {
    const res = await Category.deleteOne({ id });
    const ok = res.deletedCount > 0;
    if (ok) {
      memoryCache.invalidateCategories();
      broadcastCatalogEvent(CATALOG_EVENTS.CATEGORY_DELETED, { id });
    }
    return ok;
  }

  const jdb = readJSONDB();
  const initLen = (jdb.categories || []).length;
  jdb.categories = (jdb.categories || []).filter((c) => c.id !== id);
  const deleted = jdb.categories.length < initLen;
  if (deleted) {
    writeJSONDB(jdb);
    memoryCache.invalidateCategories();
    broadcastCatalogEvent(CATALOG_EVENTS.CATEGORY_DELETED, { id });
  }
  return deleted;
}

// ─── OFFERS CRUD ─────────────────────────────────────────────────────────────
export async function getOffers() {
  if (memoryCache.offers && Date.now() - memoryCache.offersTime < memoryCache.TTL) {
    return memoryCache.offers;
  }

  const db = await connectToDatabase();
  if (db) {
    await ensureMongoSeeded();
    const offers = await Offer.find().lean();
    const result = offers.map(({ _id, __v, ...o }) => o);
    memoryCache.offers = result;
    memoryCache.offersTime = Date.now();
    return result;
  }
  const jdb = readJSONDB();
  const result = jdb.offers || [];
  memoryCache.offers = result;
  memoryCache.offersTime = Date.now();
  return result;
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
    memoryCache.invalidateOffers();
    broadcastCatalogEvent(CATALOG_EVENTS.OFFER_CREATED, { offer: rest });
    return rest;
  }

  const jdb = readJSONDB();
  jdb.offers = [newOffer, ...(jdb.offers || [])];
  writeJSONDB(jdb);
  memoryCache.invalidateOffers();
  broadcastCatalogEvent(CATALOG_EVENTS.OFFER_CREATED, { offer: newOffer });
  return newOffer;
}

export async function updateOffer(id, updateData) {
  const db = await connectToDatabase();
  if (db) {
    const updated = await Offer.findOneAndUpdate({ id }, updateData, { returnDocument: 'after' }).lean();
    if (!updated) return null;
    const { _id, __v, ...rest } = updated;
    memoryCache.invalidateOffers();
    broadcastCatalogEvent(CATALOG_EVENTS.OFFER_UPDATED, { offer: rest });
    return rest;
  }

  const jdb = readJSONDB();
  const index = (jdb.offers || []).findIndex((o) => o.id === id);
  if (index === -1) return null;
  jdb.offers[index] = { ...jdb.offers[index], ...updateData };
  writeJSONDB(jdb);
  memoryCache.invalidateOffers();
  broadcastCatalogEvent(CATALOG_EVENTS.OFFER_UPDATED, { offer: jdb.offers[index] });
  return jdb.offers[index];
}

export async function deleteOffer(id) {
  const db = await connectToDatabase();
  if (db) {
    const res = await Offer.deleteOne({ id });
    const ok = res.deletedCount > 0;
    if (ok) {
      memoryCache.invalidateOffers();
      broadcastCatalogEvent(CATALOG_EVENTS.OFFER_DELETED, { id });
    }
    return ok;
  }

  const jdb = readJSONDB();
  const initLen = (jdb.offers || []).length;
  jdb.offers = (jdb.offers || []).filter((o) => o.id !== id);
  const deleted = jdb.offers.length < initLen;
  if (deleted) {
    writeJSONDB(jdb);
    memoryCache.invalidateOffers();
    broadcastCatalogEvent(CATALOG_EVENTS.OFFER_DELETED, { id });
  }
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
  const id = data.id && typeof data.id === 'string' && data.id.startsWith('#SE')
    ? data.id
    : `#SE${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // 1. Validate items array
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  // 2. Server-Side Price Verification & Anti-Tampering Calculation
  const db = await connectToDatabase();
  const allProducts = db ? await Product.find().lean() : (readJSONDB().products || []);

  let calculatedAmount = 0;
  const verifiedItems = [];

  for (const item of data.items) {
    const pId = item.productId || item.id;
    const dbProd = allProducts.find((p) => p.id === pId);
    if (!dbProd) {
      throw new Error(`Invalid item: product "${pId}" does not exist in catalog`);
    }

    const safeQty = Math.max(1, Math.min(100, parseInt(item.quantity, 10) || 1));
    
    // Inventory / Stock Validation: Prevent overselling & race conditions
    if (dbProd.stockCount !== undefined && dbProd.stockCount < safeQty) {
      throw new Error(`Insufficient stock for "${dbProd.name}". Available: ${dbProd.stockCount}, Requested: ${safeQty}`);
    }

    // Strict DB unit price — completely ignore client-supplied unit price
    const verifiedUnitPrice = Number(dbProd.price) || 0;
    const itemSubtotal = verifiedUnitPrice * safeQty;
    calculatedAmount += itemSubtotal;

    verifiedItems.push({
      id: pId,
      productId: pId,
      name: dbProd.name,
      price: verifiedUnitPrice,
      quantity: safeQty,
      image: dbProd.image || item.image || '',
    });
  }

  // 3. Server-side coupon / discount validation
  let appliedDiscountPercent = 0;
  let appliedCouponCode = '';

  if (data.couponCode && typeof data.couponCode === 'string') {
    const cleanCode = data.couponCode.trim().toUpperCase();
    const allOffers = db
      ? await Offer.find({ isActive: true }).lean()
      : (readJSONDB().offers || []).filter((o) => o.isActive !== false);

    const validOffer = allOffers.find(
      (o) => (o.code || '').trim().toUpperCase() === cleanCode
    );

    if (validOffer) {
      const discount = Math.min(100, Math.max(0, Number(validOffer.discountPercent || validOffer.discount) || 0));
      if (discount > 0) {
        appliedDiscountPercent = discount;
        appliedCouponCode = cleanCode;
        calculatedAmount = Math.round(calculatedAmount * (1 - discount / 100));
      }
    }
  }

  const finalAmount = Math.max(0, calculatedAmount);

  // 4. Force strict initial order status & sanitize order properties
  const addressVal = String(data.deliveryAddress || data.shippingAddress || data.address || '').trim();
  const payMethodVal = String(data.paymentMethod || data.payMethod || 'Cash on Delivery').trim();
  const newOrder = {
    id,
    date: dateStr,
    userId: data.userId || data.customerId || null,
    customerId: data.customerId || data.userId || null,
    customerName: String(data.customerName || 'Customer').trim(),
    customerEmail: String(data.customerEmail || '').trim().toLowerCase(),
    customerPhone: String(data.customerPhone || '').trim(),
    deliveryAddress: addressVal,
    shippingAddress: addressVal,
    city: String(data.city || '').trim(),
    pincode: String(data.pincode || '').trim(),
    items: verifiedItems,
    itemSummary: data.itemSummary || verifiedItems.map((i) => `${i.name} (x${i.quantity})`).join(', '),
    amount: finalAmount,
    discountPercent: appliedDiscountPercent,
    couponCode: appliedCouponCode,
    status: 'processing',
    statusLabel: 'Processing',
    paymentStatus: 'pending',
    paymentMethod: payMethodVal,
    payMethod: payMethodVal,
    createdAt: new Date().toISOString(),
  };

  let savedOrder = newOrder;

  // 5. Persist to MongoDB Atlas & Atomically Decrement Inventory
  if (db) {
    const created = await Order.create(newOrder);
    savedOrder = created.toObject();
    delete savedOrder._id;
    delete savedOrder.__v;

    // Atomically decrement stock in MongoDB
    for (const item of verifiedItems) {
      const updatedProd = await Product.findOneAndUpdate(
        { id: item.id, stockCount: { $gte: item.quantity } },
        { $inc: { stockCount: -item.quantity } },
        { returnDocument: 'after' }
      );
      if (updatedProd) {
        const sc = updatedProd.stockCount;
        const newStatus = sc <= 0 ? 'out_of_stock' : sc < 5 ? 'low_stock' : 'in_stock';
        if (updatedProd.stockStatus !== newStatus) {
          await Product.updateOne({ id: item.id }, { $set: { stockStatus: newStatus } });
        }
      }
    }

    // Clear customer's server cart if authenticated
    const targetUserId = newOrder.userId || newOrder.customerId;
    if (targetUserId) {
      await Cart.deleteOne({ userId: targetUserId }).catch(() => {});
    }
  } else if (process.env.MONGODB_URI) {
    console.warn('⚠️ MongoDB Atlas unavailable — placing order in local fallback only.');
  }

  // 6. Update local JSON backup & atomic cache
  const jdb = readJSONDB();
  jdb.orders = [newOrder, ...(jdb.orders || [])];
  // Decrement stock in local JSON DB as well
  if (jdb.products) {
    for (const item of verifiedItems) {
      const p = jdb.products.find((prod) => prod.id === item.id);
      if (p && p.stockCount !== undefined) {
        p.stockCount = Math.max(0, p.stockCount - item.quantity);
        p.stockStatus = p.stockCount <= 0 ? 'out_of_stock' : p.stockCount < 5 ? 'low_stock' : 'in_stock';
      }
    }
  }
  writeJSONDB(jdb);

  memoryCache.invalidateProducts();
  memoryCache.invalidateCategories();
  broadcastCatalogEvent(CATALOG_EVENTS.ORDER_CREATED, { order: savedOrder });
  return savedOrder;
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
    createdAt: data.createdAt || new Date().toISOString(),
  };

  const db = await connectToDatabase();
  if (db) {
    try {
      await Inquiry.create(newInquiry);
    } catch (e) {
      console.warn('MongoDB Inquiry.create notice:', e.message);
    }
  }

  const jdb = readJSONDB();
  jdb.inquiries = [newInquiry, ...(jdb.inquiries || []).filter((i) => i.id !== id)];
  writeJSONDB(jdb);

  broadcastCatalogEvent(CATALOG_EVENTS.INQUIRY_CREATED, { inquiry: newInquiry });
  return newInquiry;
}

export async function updateInquiryStatus(id, status, adminNotes = '') {
  const db = await connectToDatabase();
  if (db) {
    try {
      const update = { status };
      if (adminNotes) update.adminNotes = adminNotes;
      await Inquiry.findOneAndUpdate({ id }, update);
    } catch (e) {
      console.warn('MongoDB Inquiry.update notice:', e.message);
    }
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

  broadcastCatalogEvent(CATALOG_EVENTS.INQUIRY_UPDATED, { inquiry: jdb.inquiries[index] });
  return jdb.inquiries[index];
}

export async function deleteInquiry(id) {
  const db = await connectToDatabase();
  if (db) {
    try {
      await Inquiry.deleteOne({ id });
    } catch (e) {
      console.warn('MongoDB Inquiry.delete notice:', e.message);
    }
  }

  const jdb = readJSONDB();
  const initLen = (jdb.inquiries || []).length;
  jdb.inquiries = (jdb.inquiries || []).filter((i) => i.id !== id);
  const deleted = jdb.inquiries.length < initLen;
  if (deleted) writeJSONDB(jdb);

  broadcastCatalogEvent(CATALOG_EVENTS.INQUIRY_DELETED, { id });
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
    createdAt: data.createdAt || new Date().toISOString(),
  };

  const db = await connectToDatabase();
  if (db) {
    try {
      await ContactMessage.create(newMsg);
    } catch (e) {
      console.warn('MongoDB ContactMessage.create notice:', e.message);
    }
  }

  const jdb = readJSONDB();
  jdb.contactMessages = [newMsg, ...(jdb.contactMessages || []).filter((m) => m.id !== id)];
  writeJSONDB(jdb);

  broadcastCatalogEvent(CATALOG_EVENTS.CONTACT_MESSAGE_CREATED, { message: newMsg });
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
  if (memoryCache.config && Date.now() - memoryCache.configTime < memoryCache.TTL) {
    return memoryCache.config;
  }

  const envWhatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.WHATSAPP_NUMBER;
  const envWhatsappDisplay = process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY;
  const envWhatsappLink = process.env.NEXT_PUBLIC_WHATSAPP_LINK;

  const db = await connectToDatabase();
  if (db) {
    await ensureMongoSeeded();
    const config = await StoreConfig.findOne().lean();
    if (config) {
      const { _id, __v, ...rest } = config;
      if (!rest.name || rest.name === 'ShopEase') rest.name = 'Nakoda Imitation';
      if (!rest.exploreSection) {
        rest.exploreSection = DEFAULT_EXPLORE_SECTION;
      } else if (!Array.isArray(rest.exploreSection.collections)) {
        rest.exploreSection.collections = DEFAULT_EXPLORE_SECTION.collections;
      }
      if (envWhatsapp) rest.whatsappNumber = envWhatsapp;
      if (envWhatsappDisplay) rest.whatsappDisplay = envWhatsappDisplay;
      if (envWhatsappLink) rest.whatsappLink = envWhatsappLink;
      memoryCache.config = rest;
      memoryCache.configTime = Date.now();
      return rest;
    }
  }
  const jdb = readJSONDB();
  const cfg = { ...(jdb.storeConfig || INITIAL_DB_STATE.storeConfig) };
  if (!cfg.name || cfg.name === 'ShopEase') cfg.name = 'Nakoda Imitation';
  if (!cfg.exploreSection) {
    cfg.exploreSection = DEFAULT_EXPLORE_SECTION;
  } else if (!Array.isArray(cfg.exploreSection.collections)) {
    cfg.exploreSection.collections = DEFAULT_EXPLORE_SECTION.collections;
  }
  if (envWhatsapp) cfg.whatsappNumber = envWhatsapp;
  if (envWhatsappDisplay) cfg.whatsappDisplay = envWhatsappDisplay;
  if (envWhatsappLink) cfg.whatsappLink = envWhatsappLink;
  memoryCache.config = cfg;
  memoryCache.configTime = Date.now();
  return cfg;
}

export async function updateStoreConfig(configData) {
  const db = await connectToDatabase();
  if (db) {
    let config = await StoreConfig.findOne();
    if (config) {
      if (configData.exploreSection) {
        config.exploreSection = configData.exploreSection;
        config.markModified('exploreSection');
      }
      Object.assign(config, configData);
      await config.save();
      const { _id, __v, ...rest } = config.toObject();
      memoryCache.invalidateConfig();
      broadcastCatalogEvent(CATALOG_EVENTS.CONFIG_UPDATED, { storeConfig: rest });
      try {
        const jdb = readJSONDB();
        jdb.storeConfig = { ...(jdb.storeConfig || {}), ...configData };
        writeJSONDB(jdb);
      } catch (e) {}
      return rest;
    } else {
      const created = await StoreConfig.create(configData);
      const { _id, __v, ...rest } = created.toObject();
      memoryCache.invalidateConfig();
      broadcastCatalogEvent(CATALOG_EVENTS.CONFIG_UPDATED, { storeConfig: rest });
      try {
        const jdb = readJSONDB();
        jdb.storeConfig = { ...(jdb.storeConfig || {}), ...configData };
        writeJSONDB(jdb);
      } catch (e) {}
      return rest;
    }
  }

  const jdb = readJSONDB();
  jdb.storeConfig = { ...(jdb.storeConfig || {}), ...configData };
  writeJSONDB(jdb);
  memoryCache.invalidateConfig();
  broadcastCatalogEvent(CATALOG_EVENTS.CONFIG_UPDATED, { storeConfig: jdb.storeConfig });
  return jdb.storeConfig;
}

export async function getExploreSection() {
  const config = await getStoreConfig();
  return config?.exploreSection || DEFAULT_EXPLORE_SECTION;
}

export async function updateExploreSection(exploreData) {
  const currentConfig = await getStoreConfig();
  const updatedSection = {
    ...(currentConfig.exploreSection || DEFAULT_EXPLORE_SECTION),
    ...exploreData,
  };
  const updatedConfig = await updateStoreConfig({
    exploreSection: updatedSection,
  });
  broadcastCatalogEvent(CATALOG_EVENTS.EXPLORE_UPDATED, { exploreSection: updatedConfig.exploreSection });
  return updatedConfig.exploreSection;
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
  delete cleanData.id;

  if (cleanData.email) {
    cleanData.email = String(cleanData.email).toLowerCase().trim();
  }

  const db = await connectToDatabase();
  if (db) {
    if (cleanData.email) {
      const existing = await User.findOne({
        email: cleanData.email,
        _id: { $ne: id },
      }).lean();
      if (existing) {
        throw new Error('This email address is already in use by another account');
      }
    }

    const updated = await User.findByIdAndUpdate(id, cleanData, { returnDocument: 'after' }).lean();
    if (!updated) return null;

    if (cleanData.email) {
      try {
        await Order.updateMany(
          { $or: [{ customerId: id }, { userId: String(id) }] },
          { $set: { customerEmail: cleanData.email } }
        );
      } catch (err) {
        console.warn('Could not update customerEmail on orders:', err);
      }
    }

    const { passwordHash, __v, ...sanitized } = updated;
    return sanitized;
  }

  const jdb = readJSONDB();
  const index = (jdb.users || []).findIndex((u) => u._id === id || u.id === id || u.email === id);
  if (index === -1) return null;

  if (cleanData.email) {
    const existing = (jdb.users || []).find(
      (u) =>
        u.email &&
        u.email.toLowerCase() === cleanData.email &&
        u._id !== id &&
        u.id !== id
    );
    if (existing) {
      throw new Error('This email address is already in use by another account');
    }
  }

  const oldEmail = jdb.users[index].email;
  jdb.users[index] = { ...jdb.users[index], ...cleanData };

  if (cleanData.email && cleanData.email !== oldEmail && Array.isArray(jdb.orders)) {
    jdb.orders.forEach((o) => {
      if (o.userId === id || o.customerId === id || (oldEmail && o.customerEmail === oldEmail)) {
        o.customerEmail = cleanData.email;
      }
    });
  }

  writeJSONDB(jdb);
  const { passwordHash, ...sanitized } = jdb.users[index];
  return sanitized;
}

export async function deleteCustomerAccount(id) {
  if (!id) return false;

  const db = await connectToDatabase();
  if (db) {
    const deleted = await User.findByIdAndDelete(id);
    if (deleted) {
      await Order.updateMany(
        { customerId: id },
        {
          $set: {
            customerName: '[DELETED_USER]',
            customerEmail: 'deleted_user@redacted.local',
            customerPhone: '[REDACTED]',
            shippingAddress: '[REDACTED_ADDRESS]',
          },
        }
      );
      return true;
    }
  }

  const jdb = readJSONDB();
  const index = (jdb.users || []).findIndex((u) => u._id === id || u.id === id || u.email === id);
  if (index !== -1) {
    jdb.users.splice(index, 1);
    if (jdb.orders) {
      jdb.orders = jdb.orders.map((order) => {
        if (order.customerId === id) {
          return {
            ...order,
            customerName: '[DELETED_USER]',
            customerEmail: 'deleted_user@redacted.local',
            customerPhone: '[REDACTED]',
            shippingAddress: '[REDACTED_ADDRESS]',
          };
        }
        return order;
      });
    }
    writeJSONDB(jdb);
    return true;
  }

  return false;
}

// ─── WISHLIST PERSISTENCE (MongoDB Atlas + Local Fallback) ──────────────────
export async function getUserWishlist(userId) {
  const cleanUser = String(userId || '').trim();
  if (!cleanUser) return [];

  const db = await connectToDatabase();
  if (db) {
    const items = await Wishlist.find({ userId: cleanUser }).sort({ createdAt: -1 }).lean();
    return items.map(({ _id, __v, ...w }) => w);
  }

  const jdb = readJSONDB();
  return (jdb.wishlist || []).filter((w) => w.userId === cleanUser);
}

export async function addToWishlist(userId, productId) {
  const cleanUser = String(userId || '').trim();
  const cleanProd = String(productId || '').trim();
  if (!cleanUser || !cleanProd) throw new Error('User ID and Product ID are required');

  const prod = await getProductById(cleanProd);
  if (!prod) throw new Error(`Product "${cleanProd}" not found in catalog`);

  const db = await connectToDatabase();
  if (db) {
    const doc = await Wishlist.findOneAndUpdate(
      { userId: cleanUser, productId: cleanProd },
      {
        $setOnInsert: {
          userId: cleanUser,
          productId: cleanProd,
          productName: prod.name || '',
          productImage: prod.image || '',
          productPrice: prod.price || 0,
          productCategory: prod.category || '',
        },
      },
      { upsert: true, returnDocument: 'after' }
    ).lean();
    const { _id, __v, ...rest } = doc;
    return rest;
  } else if (process.env.MONGODB_URI) {
    console.warn('⚠️ MongoDB Atlas unavailable — saving wishlist item to local fallback only.');
  }

  const jdb = readJSONDB();
  if (!jdb.wishlist) jdb.wishlist = [];
  const existing = jdb.wishlist.find((w) => w.userId === cleanUser && w.productId === cleanProd);
  if (existing) return existing;

  const newDoc = {
    userId: cleanUser,
    productId: cleanProd,
    productName: prod.name || '',
    productImage: prod.image || '',
    productPrice: prod.price || 0,
    productCategory: prod.category || '',
    createdAt: new Date().toISOString(),
  };
  jdb.wishlist.push(newDoc);
  writeJSONDB(jdb);
  return newDoc;
}

export async function removeFromWishlist(userId, productId) {
  const cleanUser = String(userId || '').trim();
  const cleanProd = String(productId || '').trim();
  if (!cleanUser || !cleanProd) return false;

  const db = await connectToDatabase();
  if (db) {
    const res = await Wishlist.deleteOne({ userId: cleanUser, productId: cleanProd });
    return res.deletedCount > 0;
  } else if (process.env.MONGODB_URI) {
    console.warn('⚠️ MongoDB Atlas unavailable — removing wishlist item from local fallback only.');
  }

  const jdb = readJSONDB();
  const initLen = (jdb.wishlist || []).length;
  jdb.wishlist = (jdb.wishlist || []).filter((w) => !(w.userId === cleanUser && w.productId === cleanProd));
  writeJSONDB(jdb);
  return jdb.wishlist.length < initLen;
}

export async function clearWishlist(userId) {
  const cleanUser = String(userId || '').trim();
  if (!cleanUser) return false;

  const db = await connectToDatabase();
  if (db) {
    await Wishlist.deleteMany({ userId: cleanUser });
    return true;
  }

  const jdb = readJSONDB();
  jdb.wishlist = (jdb.wishlist || []).filter((w) => w.userId !== cleanUser);
  writeJSONDB(jdb);
  return true;
}

// ─── CART PERSISTENCE (MongoDB Atlas + Local Fallback) ───────────────────────
export async function getUserCart(userId) {
  const cleanUser = String(userId || '').trim();
  if (!cleanUser) return { userId: '', items: [] };

  const db = await connectToDatabase();
  if (db) {
    const cart = await Cart.findOne({ userId: cleanUser }).lean();
    if (cart) {
      const { _id, __v, ...rest } = cart;
      return rest;
    }
    return { userId: cleanUser, items: [] };
  }

  const jdb = readJSONDB();
  const cart = (jdb.carts || []).find((c) => c.userId === cleanUser);
  return cart || { userId: cleanUser, items: [] };
}

export async function syncUserCart(userId, items = []) {
  const cleanUser = String(userId || '').trim();
  if (!cleanUser) throw new Error('User ID is required to sync cart');

  if (!Array.isArray(items)) throw new Error('Items must be an array');

  // Validate item structure
  const sanitizedItems = items
    .filter((it) => it && (it.id || it.productId))
    .map((it) => ({
      productId: String(it.productId || it.id).trim(),
      quantity: Math.max(1, Math.min(99, parseInt(it.quantity, 10) || 1)),
      selectedColor: String(it.selectedColor || ''),
      selectedSize: String(it.selectedSize || ''),
      name: String(it.name || ''),
      price: typeof it.price === 'number' ? it.price : (parseFloat(it.price) || 0),
      image: String(it.image || ''),
      addedAt: it.addedAt ? new Date(it.addedAt) : new Date(),
    }));

  const db = await connectToDatabase();
  if (db) {
    const updated = await Cart.findOneAndUpdate(
      { userId: cleanUser },
      { $set: { items: sanitizedItems, updatedAt: new Date() } },
      { upsert: true, returnDocument: 'after' }
    ).lean();
    const { _id, __v, ...rest } = updated;
    return rest;
  } else if (process.env.MONGODB_URI) {
    console.warn('⚠️ MongoDB Atlas unavailable — syncing cart to local fallback only.');
  }

  const jdb = readJSONDB();
  if (!jdb.carts) jdb.carts = [];
  const index = jdb.carts.findIndex((c) => c.userId === cleanUser);
  const cartObj = { userId: cleanUser, items: sanitizedItems, updatedAt: new Date().toISOString() };
  if (index !== -1) {
    jdb.carts[index] = cartObj;
  } else {
    jdb.carts.push(cartObj);
  }
  writeJSONDB(jdb);
  return cartObj;
}

export async function clearUserCart(userId) {
  const cleanUser = String(userId || '').trim();
  if (!cleanUser) return false;

  const db = await connectToDatabase();
  if (db) {
    await Cart.deleteOne({ userId: cleanUser });
    return true;
  }

  const jdb = readJSONDB();
  jdb.carts = (jdb.carts || []).filter((c) => c.userId !== cleanUser);
  writeJSONDB(jdb);
  return true;
}

// ─── ADMIN AUTHENTICATION (Environment Variables + Database Users) ──────────────────
export async function verifyAdminCredentials(email, password) {

  if (!email || !password) return null;

  const cleanEmail = email.toLowerCase().trim();
  const cleanPass = password.trim();
  const envAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const envAdminPass = (process.env.ADMIN_PASSWORD || '').trim();
  const notificationEmail = (process.env.ADMIN_NOTIFICATION_EMAIL || '').toLowerCase().trim();

  // 1. Check configured server environment credentials
  if (envAdminEmail && envAdminPass) {
    const isMatchingEmail = cleanEmail === envAdminEmail || (notificationEmail && cleanEmail === notificationEmail);
    if (isMatchingEmail && cleanPass === envAdminPass) {
      return {
        email: envAdminEmail,
        name: 'Master Admin',
        role: 'superadmin',
      };
    }
  }

  // 2. Check MongoDB database for Admin users with bcrypt hashed passwords
  try {
    const db = await connectToDatabase();
    if (db) {
      const adminUser = await User.findOne({
        email: cleanEmail,
        role: { $in: ['admin', 'superadmin'] },
      });

      if (adminUser && adminUser.passwordHash) {
        const isMatch = bcrypt.compareSync(cleanPass, adminUser.passwordHash);
        if (isMatch) {
          const userObj = adminUser.toObject();
          delete userObj.passwordHash;
          delete userObj.__v;
          return userObj;
        }
      }
    }
  } catch (err) {
    // Database lookup error, proceed to fallback
  }

  // 3. Check local JSON DB fallback users (with bcrypt passwordHash)
  try {
    const jdb = readJSONDB();
    const jsonAdmin = (jdb.users || []).find(
      (u) => (u.email?.toLowerCase() === cleanEmail || u.username?.toLowerCase() === cleanEmail) && (u.role === 'admin' || u.role === 'superadmin')
    );
    if (jsonAdmin && jsonAdmin.passwordHash) {
      if (bcrypt.compareSync(cleanPass, jsonAdmin.passwordHash)) {
        const { passwordHash: _, ...sanitized } = jsonAdmin;
        return sanitized;
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

// ══════════════════════════════════════════════════════════════════════════════
// ─── REVIEWS & RATINGS SUBSYSTEM ──────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Recalculates and updates product rating and review count from all approved reviews.
 * Synchronizes across MongoDB Atlas and JSON DB fallback.
 * @param {string} productId
 * @returns {Promise<{ averageRating: number, totalReviews: number }>}
 */
export async function recalculateProductRatingDB(productId) {
  if (!productId) return { averageRating: 0, totalReviews: 0 };

  let totalReviews = 0;
  let averageRating = 0;

  try {
    const db = await connectToDatabase();
    if (db) {
      const stats = await Review.aggregate([
        { $match: { productId: String(productId), status: 'approved' } },
        {
          $group: {
            _id: '$productId',
            totalReviews: { $sum: 1 },
            averageRating: { $avg: '$rating' },
          },
        },
      ]);

      if (stats.length > 0) {
        totalReviews = stats[0].totalReviews || 0;
        averageRating = Math.round((stats[0].averageRating || 0) * 10) / 10;
      }

      await Product.updateOne(
        { id: String(productId) },
        { $set: { rating: averageRating, reviews: totalReviews } }
      );
    }
  } catch (err) {
    console.warn('MongoDB recalculateProductRatingDB fallback:', err.message);
  }

  // JSON DB sync
  try {
    const jdb = readJSONDB();
    if (!jdb.reviews) jdb.reviews = [];
    const prodReviews = jdb.reviews.filter(
      (r) => String(r.productId) === String(productId) && (r.status || 'approved') === 'approved'
    );
    totalReviews = prodReviews.length;
    if (totalReviews > 0) {
      const sum = prodReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
      averageRating = Math.round((sum / totalReviews) * 10) / 10;
    } else {
      averageRating = 0;
    }

    if (Array.isArray(jdb.products)) {
      const idx = jdb.products.findIndex((p) => String(p.id) === String(productId));
      if (idx !== -1) {
        jdb.products[idx].rating = averageRating;
        jdb.products[idx].reviews = totalReviews;
        writeJSONDB(jdb);
      }
    }
  } catch (e) {}

  memoryCache.invalidateProducts();
  broadcastCatalogEvent(CATALOG_EVENTS.PRODUCT_UPDATED, {
    id: productId,
    rating: averageRating,
    reviews: totalReviews,
  });

  return { averageRating, totalReviews };
}

/**
 * Checks server-side whether a customer has a verified purchase for a product.
 * Inspects all completed/valid orders matching customerId or customerEmail.
 * @param {string} productId
 * @param {string} customerId
 * @param {string} customerEmail
 * @returns {Promise<{ verified: boolean, orderId: string|null }>}
 */
export async function checkCustomerVerifiedPurchaseDB(productId, customerId, customerEmail) {
  if (!productId || (!customerId && !customerEmail)) {
    return { verified: false, orderId: null };
  }

  const cleanEmail = (customerEmail || '').trim().toLowerCase();
  const cId = customerId ? String(customerId) : null;

  try {
    const db = await connectToDatabase();
    if (db) {
      const orClauses = [];
      if (cId) {
        orClauses.push({ userId: cId }, { customerId: cId });
      }
      if (cleanEmail) {
        orClauses.push({ customerEmail: cleanEmail });
      }

      const order = await Order.findOne({
        $or: orClauses,
        'items.id': String(productId),
      }).sort({ createdAt: -1 });

      if (order) {
        return { verified: true, orderId: order.id || String(order._id) };
      }
    }
  } catch (e) {
    console.warn('MongoDB checkCustomerVerifiedPurchaseDB fallback:', e.message);
  }

  // Fallback: check JSON DB
  try {
    const jdb = readJSONDB();
    const orders = jdb.orders || [];
    const matchingOrder = orders.find((o) => {
      const matchCustomer =
        (cId && (String(o.userId) === cId || String(o.customerId) === cId)) ||
        (cleanEmail && (o.customerEmail || '').toLowerCase() === cleanEmail);
      if (!matchCustomer) return false;
      return (o.items || []).some((item) => String(item.id) === String(productId));
    });

    if (matchingOrder) {
      return { verified: true, orderId: matchingOrder.id || null };
    }
  } catch (e) {}

  return { verified: false, orderId: null };
}

/**
 * Finds a specific customer's review for a given product (if any).
 */
export async function getCustomerReviewForProductDB(productId, customerId) {
  if (!productId || !customerId) return null;

  try {
    const db = await connectToDatabase();
    if (db) {
      const doc = await Review.findOne({
        productId: String(productId),
        customerId: String(customerId),
      });
      if (doc) {
        const obj = doc.toObject();
        delete obj._id;
        delete obj.__v;
        return obj;
      }
    }
  } catch (e) {}

  try {
    const jdb = readJSONDB();
    const found = (jdb.reviews || []).find(
      (r) => String(r.productId) === String(productId) && String(r.customerId) === String(customerId)
    );
    return found || null;
  } catch (e) {}

  return null;
}

/**
 * Creates a new real customer review with single-review enforcement and rating recalculation.
 */
export async function createReviewDB({ productId, customerId, customerName, customerEmail, rating, title, comment }) {
  if (!productId) throw new Error('Product ID is required');
  if (!customerId) throw new Error('Customer authentication is required to review');
  if (!customerName || !customerName.trim()) throw new Error('Customer name is required');

  const numRating = Math.round(Number(rating));
  if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
    throw new Error('Rating must be an integer from 1 to 5 stars');
  }

  const cleanComment = (comment || '').trim();
  if (cleanComment.length < 5) {
    throw new Error('Review comment must be at least 5 characters');
  }
  if (cleanComment.length > 2000) {
    throw new Error('Review comment cannot exceed 2000 characters');
  }

  // 1. Verify product exists
  const product = await getProductByIdDB(productId);
  if (!product) {
    throw new Error(`Product not found with ID "${productId}"`);
  }

  // 2. Prevent duplicate reviews (1 review per customer per product)
  const existingReview = await getCustomerReviewForProductDB(productId, customerId);
  if (existingReview) {
    throw new Error('You have already reviewed this product. You can edit your existing review.');
  }

  // 3. Server-side verified purchase check
  const verification = await checkCustomerVerifiedPurchaseDB(productId, customerId, customerEmail);

  const reviewId = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const reviewRecord = {
    id: reviewId,
    productId: String(productId),
    productName: product.name || '',
    customerId: String(customerId),
    customerName: customerName.trim(),
    customerEmail: (customerEmail || '').toLowerCase().trim(),
    rating: numRating,
    title: (title || '').trim(),
    comment: cleanComment,
    verifiedPurchase: verification.verified,
    orderId: verification.orderId || null,
    helpfulVotes: [],
    helpfulCount: 0,
    status: 'approved',
    createdAt: now,
    updatedAt: now,
  };

  // Persist to MongoDB
  try {
    const db = await connectToDatabase();
    if (db) {
      await Review.create(reviewRecord);
    }
  } catch (err) {
    if (err.code === 11000) {
      throw new Error('You have already submitted a review for this product.');
    }
    console.warn('MongoDB createReviewDB fallback:', err.message);
  }

  // Persist to JSON DB
  try {
    const jdb = readJSONDB();
    if (!Array.isArray(jdb.reviews)) jdb.reviews = [];
    jdb.reviews.unshift(reviewRecord);
    writeJSONDB(jdb);
  } catch (e) {}

  // Recalculate product rating & review count
  const updatedStats = await recalculateProductRatingDB(productId);

  broadcastCatalogEvent(CATALOG_EVENTS.REVIEW_CREATED, {
    productId,
    review: reviewRecord,
    ...updatedStats,
  });

  return {
    success: true,
    review: reviewRecord,
    ...updatedStats,
  };
}

/**
 * Updates an existing review (owner-only).
 */
export async function updateReviewDB(reviewId, customerId, { rating, title, comment }) {
  if (!reviewId) throw new Error('Review ID is required');
  if (!customerId) throw new Error('Authentication required');

  const numRating = rating !== undefined ? Math.round(Number(rating)) : null;
  if (numRating !== null && (!Number.isInteger(numRating) || numRating < 1 || numRating > 5)) {
    throw new Error('Rating must be an integer from 1 to 5 stars');
  }

  const cleanComment = comment !== undefined ? comment.trim() : null;
  if (cleanComment !== null) {
    if (cleanComment.length < 5) throw new Error('Review comment must be at least 5 characters');
    if (cleanComment.length > 2000) throw new Error('Review comment cannot exceed 2000 characters');
  }

  let reviewToUpdate = null;
  let productId = null;

  // Check MongoDB
  try {
    const db = await connectToDatabase();
    if (db) {
      const doc = await Review.findOne({ id: String(reviewId) });
      if (doc) {
        if (String(doc.customerId) !== String(customerId)) {
          throw new Error('Unauthorized: You can only edit your own reviews');
        }
        productId = doc.productId;
        if (numRating !== null) doc.rating = numRating;
        if (title !== undefined) doc.title = title.trim();
        if (cleanComment !== null) doc.comment = cleanComment;
        doc.updatedAt = new Date();
        await doc.save();
        reviewToUpdate = doc.toObject();
      }
    }
  } catch (err) {
    if (err.message.startsWith('Unauthorized:')) throw err;
    console.warn('MongoDB updateReviewDB fallback:', err.message);
  }

  // Update JSON DB
  try {
    const jdb = readJSONDB();
    if (Array.isArray(jdb.reviews)) {
      const idx = jdb.reviews.findIndex((r) => String(r.id) === String(reviewId));
      if (idx !== -1) {
        if (String(jdb.reviews[idx].customerId) !== String(customerId)) {
          throw new Error('Unauthorized: You can only edit your own reviews');
        }
        productId = productId || jdb.reviews[idx].productId;
        if (numRating !== null) jdb.reviews[idx].rating = numRating;
        if (title !== undefined) jdb.reviews[idx].title = title.trim();
        if (cleanComment !== null) jdb.reviews[idx].comment = cleanComment;
        jdb.reviews[idx].updatedAt = new Date().toISOString();
        if (!reviewToUpdate) reviewToUpdate = jdb.reviews[idx];
        writeJSONDB(jdb);
      }
    }
  } catch (e) {
    if (e.message.startsWith('Unauthorized:')) throw e;
  }

  if (!reviewToUpdate) {
    throw new Error('Review not found');
  }

  const updatedStats = await recalculateProductRatingDB(productId);

  broadcastCatalogEvent(CATALOG_EVENTS.REVIEW_UPDATED, {
    productId,
    review: reviewToUpdate,
    ...updatedStats,
  });

  return { success: true, review: reviewToUpdate, ...updatedStats };
}

/**
 * Deletes a review (owner or admin).
 */
export async function deleteReviewDB(reviewId, customerId, isAdmin = false) {
  if (!reviewId) throw new Error('Review ID is required');

  let productId = null;
  let deleted = false;

  // Delete from MongoDB
  try {
    const db = await connectToDatabase();
    if (db) {
      const doc = await Review.findOne({ id: String(reviewId) });
      if (doc) {
        if (!isAdmin && String(doc.customerId) !== String(customerId)) {
          throw new Error('Unauthorized: You can only delete your own reviews');
        }
        productId = doc.productId;
        await Review.deleteOne({ id: String(reviewId) });
        deleted = true;
      }
    }
  } catch (err) {
    if (err.message.startsWith('Unauthorized:')) throw err;
    console.warn('MongoDB deleteReviewDB fallback:', err.message);
  }

  // Delete from JSON DB
  try {
    const jdb = readJSONDB();
    if (Array.isArray(jdb.reviews)) {
      const idx = jdb.reviews.findIndex((r) => String(r.id) === String(reviewId));
      if (idx !== -1) {
        if (!isAdmin && String(jdb.reviews[idx].customerId) !== String(customerId)) {
          throw new Error('Unauthorized: You can only delete your own reviews');
        }
        productId = productId || jdb.reviews[idx].productId;
        jdb.reviews.splice(idx, 1);
        writeJSONDB(jdb);
        deleted = true;
      }
    }
  } catch (e) {
    if (e.message.startsWith('Unauthorized:')) throw e;
  }

  if (!deleted && !productId) {
    throw new Error('Review not found');
  }

  const updatedStats = productId ? await recalculateProductRatingDB(productId) : { averageRating: 0, totalReviews: 0 };

  broadcastCatalogEvent(CATALOG_EVENTS.REVIEW_DELETED, {
    productId,
    reviewId,
    ...updatedStats,
  });

  return { success: true, deletedId: reviewId, productId, ...updatedStats };
}

/**
 * Toggles helpful vote on a review.
 */
export async function voteReviewHelpfulDB(reviewId, customerId) {
  if (!reviewId || !customerId) throw new Error('Review ID and Customer ID are required');

  const cId = String(customerId);
  let updatedReview = null;

  try {
    const db = await connectToDatabase();
    if (db) {
      const doc = await Review.findOne({ id: String(reviewId) });
      if (doc) {
        const votes = doc.helpfulVotes || [];
        const hasVoted = votes.includes(cId);
        if (hasVoted) {
          doc.helpfulVotes = votes.filter((id) => id !== cId);
        } else {
          doc.helpfulVotes.push(cId);
        }
        doc.helpfulCount = doc.helpfulVotes.length;
        await doc.save();
        updatedReview = doc.toObject();
      }
    }
  } catch (e) {
    console.warn('MongoDB voteReviewHelpfulDB fallback:', e.message);
  }

  // JSON DB sync
  try {
    const jdb = readJSONDB();
    if (Array.isArray(jdb.reviews)) {
      const r = jdb.reviews.find((x) => String(x.id) === String(reviewId));
      if (r) {
        if (!Array.isArray(r.helpfulVotes)) r.helpfulVotes = [];
        const hasVoted = r.helpfulVotes.includes(cId);
        if (hasVoted) {
          r.helpfulVotes = r.helpfulVotes.filter((id) => id !== cId);
        } else {
          r.helpfulVotes.push(cId);
        }
        r.helpfulCount = r.helpfulVotes.length;
        if (!updatedReview) updatedReview = r;
        writeJSONDB(jdb);
      }
    }
  } catch (e) {}

  if (!updatedReview) throw new Error('Review not found');

  return {
    success: true,
    helpfulCount: updatedReview.helpfulCount,
    hasVoted: (updatedReview.helpfulVotes || []).includes(cId),
  };
}

/**
 * Fetches real customer reviews for a product with ratings distribution and pagination.
 */
export async function getProductReviewsDB(
  productId,
  { page = 1, limit = 10, sortBy = 'recent', ratingFilter = null, currentCustomerId = null } = {}
) {
  if (!productId) return { reviews: [], totalReviews: 0, averageRating: 0 };

  const pId = String(productId);
  const p = Math.max(1, parseInt(page, 10) || 1);
  const lim = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));

  let allApprovedReviews = [];

  // 1. Fetch from MongoDB if available
  try {
    const db = await connectToDatabase();
    if (db) {
      const docs = await Review.find({ productId: pId, status: 'approved' }).sort({ createdAt: -1 });
      allApprovedReviews = docs.map((d) => {
        const obj = d.toObject();
        delete obj._id;
        delete obj.__v;
        return obj;
      });
    }
  } catch (e) {
    console.warn('MongoDB getProductReviewsDB fallback:', e.message);
  }

  // 2. Fallback to JSON DB
  if (allApprovedReviews.length === 0) {
    try {
      const jdb = readJSONDB();
      allApprovedReviews = (jdb.reviews || []).filter(
        (r) => String(r.productId) === pId && (r.status || 'approved') === 'approved'
      );
    } catch (e) {}
  }

  // Real aggregate calculations
  const totalApproved = allApprovedReviews.length;
  let totalRatingSum = 0;
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const r of allApprovedReviews) {
    const star = Math.round(Number(r.rating)) || 0;
    if (star >= 1 && star <= 5) {
      distribution[star] = (distribution[star] || 0) + 1;
      totalRatingSum += star;
    }
  }

  const averageRating = totalApproved > 0 ? Math.round((totalRatingSum / totalApproved) * 10) / 10 : 0;

  const percentages = {
    5: totalApproved > 0 ? Math.round((distribution[5] / totalApproved) * 100) : 0,
    4: totalApproved > 0 ? Math.round((distribution[4] / totalApproved) * 100) : 0,
    3: totalApproved > 0 ? Math.round((distribution[3] / totalApproved) * 100) : 0,
    2: totalApproved > 0 ? Math.round((distribution[2] / totalApproved) * 100) : 0,
    1: totalApproved > 0 ? Math.round((distribution[1] / totalApproved) * 100) : 0,
  };

  // Find userReview if currentCustomerId is authenticated
  let userReview = null;
  if (currentCustomerId) {
    userReview = allApprovedReviews.find((r) => String(r.customerId) === String(currentCustomerId)) || null;
  }

  // Apply optional rating filter
  let filtered = [...allApprovedReviews];
  if (ratingFilter && [1, 2, 3, 4, 5].includes(Number(ratingFilter))) {
    filtered = filtered.filter((r) => Math.round(Number(r.rating)) === Number(ratingFilter));
  }

  // Sort
  if (sortBy === 'highest') {
    filtered.sort((a, b) => b.rating - a.rating || new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy === 'lowest') {
    filtered.sort((a, b) => a.rating - b.rating || new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy === 'helpful') {
    filtered.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0) || new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    // Default 'recent'
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const filteredCount = filtered.length;
  const totalPages = Math.ceil(filteredCount / lim) || 1;
  const startIndex = (p - 1) * lim;
  const paginatedReviews = filtered.slice(startIndex, startIndex + lim);

  return {
    reviews: paginatedReviews,
    totalReviews: totalApproved,
    filteredCount,
    averageRating,
    distribution,
    percentages,
    page: p,
    limit: lim,
    totalPages,
    hasMore: p < totalPages,
    userReview,
  };
}

/**
 * Admin view: Fetch all reviews across the store with search, filters, and moderation stats.
 */
export async function getAllReviewsAdminDB({
  page = 1,
  limit = 20,
  search = '',
  productId = '',
  rating = '',
  verifiedOnly = false,
  status = '',
} = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const lim = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

  let allReviews = [];

  try {
    const db = await connectToDatabase();
    if (db) {
      const docs = await Review.find().sort({ createdAt: -1 });
      allReviews = docs.map((d) => {
        const obj = d.toObject();
        delete obj._id;
        delete obj.__v;
        return obj;
      });
    }
  } catch (e) {
    console.warn('MongoDB getAllReviewsAdminDB fallback:', e.message);
  }

  if (allReviews.length === 0) {
    try {
      const jdb = readJSONDB();
      allReviews = jdb.reviews || [];
    } catch (e) {}
  }

  // Summary Metrics
  const totalReviews = allReviews.length;
  const verifiedCount = allReviews.filter((r) => r.verifiedPurchase).length;
  const pendingCount = allReviews.filter((r) => r.status === 'pending').length;
  const approvedList = allReviews.filter((r) => (r.status || 'approved') === 'approved');
  const sumRating = approvedList.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  const averageStoreRating = approvedList.length > 0 ? Math.round((sumRating / approvedList.length) * 10) / 10 : 0;

  // Filter
  let filtered = [...allReviews];

  if (productId) {
    filtered = filtered.filter((r) => String(r.productId) === String(productId));
  }

  if (rating) {
    const rNum = Number(rating);
    filtered = filtered.filter((r) => Math.round(Number(r.rating)) === rNum);
  }

  if (verifiedOnly) {
    filtered = filtered.filter((r) => r.verifiedPurchase);
  }

  if (status) {
    filtered = filtered.filter((r) => (r.status || 'approved') === status);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter((r) => {
      return (
        (r.customerName || '').toLowerCase().includes(q) ||
        (r.customerEmail || '').toLowerCase().includes(q) ||
        (r.productName || '').toLowerCase().includes(q) ||
        (r.productId || '').toLowerCase().includes(q) ||
        (r.comment || '').toLowerCase().includes(q) ||
        (r.title || '').toLowerCase().includes(q)
      );
    });
  }

  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalFiltered = filtered.length;
  const totalPages = Math.ceil(totalFiltered / lim) || 1;
  const startIndex = (p - 1) * lim;
  const paginated = filtered.slice(startIndex, startIndex + lim);

  return {
    reviews: paginated,
    totalReviews,
    totalFiltered,
    averageStoreRating,
    verifiedCount,
    pendingCount,
    page: p,
    limit: lim,
    totalPages,
    hasMore: p < totalPages,
  };
}

/**
 * Admin: Update review moderation status.
 */
export async function moderateReviewAdminDB(reviewId, status) {
  if (!reviewId || !['approved', 'pending', 'rejected'].includes(status)) {
    throw new Error('Valid review ID and status (approved/pending/rejected) are required');
  }

  let productId = null;
  let updatedReview = null;

  try {
    const db = await connectToDatabase();
    if (db) {
      const doc = await Review.findOne({ id: String(reviewId) });
      if (doc) {
        doc.status = status;
        productId = doc.productId;
        await doc.save();
        updatedReview = doc.toObject();
      }
    }
  } catch (e) {}

  try {
    const jdb = readJSONDB();
    if (Array.isArray(jdb.reviews)) {
      const r = jdb.reviews.find((x) => String(x.id) === String(reviewId));
      if (r) {
        r.status = status;
        productId = productId || r.productId;
        if (!updatedReview) updatedReview = r;
        writeJSONDB(jdb);
      }
    }
  } catch (e) {}

  if (!updatedReview) throw new Error('Review not found');

  if (productId) {
    await recalculateProductRatingDB(productId);
  }

  return { success: true, review: updatedReview };
}

export function resetDatabase() {
  writeJSONDB(INITIAL_DB_STATE);
  return INITIAL_DB_STATE;
}
