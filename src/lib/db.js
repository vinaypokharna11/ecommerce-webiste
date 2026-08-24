import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

// Initial baseline mock data
const INITIAL_DB_STATE = {
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
      createdAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
    },
    {
      id: 'prod-16',
      name: 'ShopEase Signature Gift & Festive Hamper',
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
      createdAt: new Date().toISOString(),
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
      amount: 3499,
      status: 'delivered',
      payMethod: 'Cash on Delivery',
      deliveryAddress: 'Shop #14, Main Market Road, Bangalore — 560001',
      date: 'Aug 20, 2026',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: '#SE1002',
      customerName: 'Sarah Jenkins',
      customerEmail: 'sarah.j@example.com',
      customerPhone: '+91 98765 43211',
      items: [{ id: 'prod-2', name: 'Smart Watch Pro', price: 2499, quantity: 1 }],
      amount: 2499,
      status: 'shipped',
      payMethod: 'Online Payment (UPI)',
      deliveryAddress: 'Flat 302, Palm Heights, Indiranagar, Bangalore — 560038',
      date: 'Aug 15, 2026',
      createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
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
      message: 'Hi ShopEase team, are your Bangalore store hours the same on Sundays as well? I would like to visit in person.',
      preferredContact: 'WhatsApp',
      status: 'pending', // 'pending', 'in_progress', 'replied', 'resolved'
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
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
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    }
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
      status: 'pending', // 'pending', 'in_progress', 'quoted', 'resolved'
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
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
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    }
  ],
  storeConfig: {
    name: 'ShopEase',
    tagline: 'Your Trusted Local Neighborhood Store',
    whatsappNumber: '919876543210',
    whatsappDisplay: '+91 98765 43210',
    address: 'Shop #14, Main Market Road, Bangalore',
    hours: 'Mon - Sun: 9:30 AM – 9:30 PM',
    currency: '₹',
  },
  adminUser: {
    email: process.env.ADMIN_EMAIL || 'admin@shopease.com',
    passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10),
    name: 'Master Admin',
    role: 'superadmin',
  },
};

// Initialize DB file if not present
export function initDB() {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(INITIAL_DB_STATE, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error initializing database file', err);
  }
}

// Read entire DB
export function readDB() {
  initDB();
  try {
    const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database', err);
    return INITIAL_DB_STATE;
  }
}

// Write entire DB
export function writeDB(data) {
  initDB();
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing to database', err);
    return false;
  }
}

// ─────────── PRODUCTS CRUD ───────────
export function getProducts(filters = {}) {
  const db = readDB();
  let list = db.products || [];

  if (filters.category && filters.category !== 'all') {
    list = list.filter((p) => p.category === filters.category);
  }
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
  if (filters.stockStatus && filters.stockStatus !== 'all') {
    list = list.filter((p) => p.stockStatus === filters.stockStatus);
  }
  if (filters.isPopular) {
    list = list.filter((p) => p.isPopular);
  }
  if (filters.isFeatured) {
    list = list.filter((p) => p.isFeatured);
  }

  return list;
}

export function getProductById(id) {
  const db = readDB();
  return db.products.find((p) => p.id === id) || null;
}

export function createProduct(productData) {
  const db = readDB();
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

  db.products = [newProduct, ...(db.products || [])];
  writeDB(db);
  return newProduct;
}

export function updateProduct(id, updateData) {
  const db = readDB();
  const index = db.products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const current = db.products[index];
  const merged = { ...current, ...updateData };

  if (merged.price !== undefined && merged.oldPrice !== undefined) {
    const p = Number(merged.price);
    const op = Number(merged.oldPrice);
    if (op > p && op > 0) {
      merged.discountPercent = Math.round(((op - p) / op) * 100);
    }
  }

  if (merged.stockCount !== undefined) {
    const sc = Number(merged.stockCount);
    merged.stockCount = sc;
    if (sc <= 0) merged.stockStatus = 'out_of_stock';
    else if (sc < 5) merged.stockStatus = 'low_stock';
    else merged.stockStatus = 'in_stock';
  }

  merged.updatedAt = new Date().toISOString();
  db.products[index] = merged;
  writeDB(db);
  return merged;
}

export function deleteProduct(id) {
  const db = readDB();
  const initialLength = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  const deleted = db.products.length < initialLength;
  if (deleted) writeDB(db);
  return deleted;
}

// ─────────── CATEGORIES CRUD ───────────
export function getCategories() {
  const db = readDB();
  const products = db.products || [];
  // Calculate dynamic counts
  return (db.categories || []).map((cat) => ({
    ...cat,
    count: products.filter((p) => p.category === cat.id).length,
  }));
}

export function createCategory(categoryData) {
  const db = readDB();
  const id = categoryData.id || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newCat = {
    ...categoryData,
    id,
    color: categoryData.color || '#6257FF',
    accentBg: categoryData.accentBg || 'bg-[#F5F3FF]',
    iconColor: categoryData.iconColor || 'text-[#6257FF]',
    icon: categoryData.icon || 'LayoutGrid',
    itemCount: '0 Items',
  };
  db.categories = [...(db.categories || []), newCat];
  writeDB(db);
  return newCat;
}

export function updateCategory(id, updateData) {
  const db = readDB();
  const index = db.categories.findIndex((c) => c.id === id);
  if (index === -1) return null;

  db.categories[index] = { ...db.categories[index], ...updateData };
  writeDB(db);
  return db.categories[index];
}

export function deleteCategory(id) {
  const db = readDB();
  const initialLength = db.categories.length;
  db.categories = db.categories.filter((c) => c.id !== id);
  const deleted = db.categories.length < initialLength;
  if (deleted) writeDB(db);
  return deleted;
}

// ─────────── OFFERS CRUD ───────────
export function getOffers() {
  const db = readDB();
  return db.offers || [];
}

export function createOffer(offerData) {
  const db = readDB();
  const id = offerData.id || `offer-${Date.now()}`;
  const newOffer = {
    ...offerData,
    id,
    code: (offerData.code || 'DEAL10').toUpperCase().trim(),
    isActive: offerData.isActive !== false,
    popular: !!offerData.popular,
    gradient: offerData.gradient || 'from-[#6257FF] to-[#4F46E5]',
    bgLight: offerData.bgLight || 'bg-[#F5F3FF]',
    textColor: offerData.textColor || 'text-[#6257FF]',
    borderColor: offerData.borderColor || 'border-[#EAE6FD]',
    badgeColor: offerData.badgeColor || 'bg-[#EDE9FE] text-[#6257FF]',
    icon: offerData.icon || '🎁',
  };
  db.offers = [newOffer, ...(db.offers || [])];
  writeDB(db);
  return newOffer;
}

export function updateOffer(id, updateData) {
  const db = readDB();
  const index = db.offers.findIndex((o) => o.id === id);
  if (index === -1) return null;

  db.offers[index] = { ...db.offers[index], ...updateData };
  writeDB(db);
  return db.offers[index];
}

export function deleteOffer(id) {
  const db = readDB();
  const initialLength = db.offers.length;
  db.offers = db.offers.filter((o) => o.id !== id);
  const deleted = db.offers.length < initialLength;
  if (deleted) writeDB(db);
  return deleted;
}

// ─────────── ORDERS CRUD ───────────
export function getOrders() {
  const db = readDB();
  return db.orders || [];
}

export function createOrder(orderData) {
  const db = readDB();
  const id = orderData.id || `#SE${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder = {
    ...orderData,
    id,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    createdAt: new Date().toISOString(),
    status: orderData.status || 'processing',
    statusLabel: orderData.status === 'delivered' ? 'Delivered' : orderData.status === 'shipped' ? 'Shipped' : 'Processing',
  };
  db.orders = [newOrder, ...(db.orders || [])];
  writeDB(db);
  return newOrder;
}

export function updateOrderStatus(id, status) {
  const db = readDB();
  const order = db.orders.find((o) => o.id === id);
  if (!order) return null;
  order.status = status;
  order.statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  writeDB(db);
  return order;
}

// ─────────── CONTACT MESSAGES CRUD ───────────
export function getContactMessages() {
  const db = readDB();
  return db.contactMessages || INITIAL_DB_STATE.contactMessages || [];
}

export function createContactMessage(data) {
  const db = readDB();
  const id = data.id || `CT-${Math.floor(1000 + Math.random() * 9000)}`;
  const newMsg = {
    ...data,
    id,
    status: data.status || 'pending',
    createdAt: new Date().toISOString(),
  };
  db.contactMessages = [newMsg, ...(db.contactMessages || [])];
  writeDB(db);
  return newMsg;
}

export function updateContactStatus(id, status, adminNotes = '') {
  const db = readDB();
  if (!db.contactMessages) db.contactMessages = [];
  const index = db.contactMessages.findIndex((m) => m.id === id);
  if (index === -1) return null;
  db.contactMessages[index] = {
    ...db.contactMessages[index],
    status,
    adminNotes: adminNotes || db.contactMessages[index].adminNotes,
    updatedAt: new Date().toISOString(),
  };
  writeDB(db);
  return db.contactMessages[index];
}

export function deleteContactMessage(id) {
  const db = readDB();
  if (!db.contactMessages) return false;
  const initialLength = db.contactMessages.length;
  db.contactMessages = db.contactMessages.filter((m) => m.id !== id);
  const deleted = db.contactMessages.length < initialLength;
  if (deleted) writeDB(db);
  return deleted;
}

// ─────────── INQUIRIES CRUD ───────────
export function getInquiries() {
  const db = readDB();
  return db.inquiries || INITIAL_DB_STATE.inquiries || [];
}

export function createInquiry(data) {
  const db = readDB();
  const id = data.id || `INQ-${Math.floor(1000 + Math.random() * 9000)}`;
  const newInquiry = {
    ...data,
    id,
    status: data.status || 'pending',
    createdAt: new Date().toISOString(),
  };
  db.inquiries = [newInquiry, ...(db.inquiries || [])];
  writeDB(db);
  return newInquiry;
}

export function updateInquiryStatus(id, status, adminNotes = '') {
  const db = readDB();
  if (!db.inquiries) db.inquiries = [];
  const index = db.inquiries.findIndex((i) => i.id === id);
  if (index === -1) return null;
  db.inquiries[index] = {
    ...db.inquiries[index],
    status,
    adminNotes: adminNotes || db.inquiries[index].adminNotes,
    updatedAt: new Date().toISOString(),
  };
  writeDB(db);
  return db.inquiries[index];
}

export function deleteInquiry(id) {
  const db = readDB();
  if (!db.inquiries) return false;
  const initialLength = db.inquiries.length;
  db.inquiries = db.inquiries.filter((i) => i.id !== id);
  const deleted = db.inquiries.length < initialLength;
  if (deleted) writeDB(db);
  return deleted;
}

// ─────────── STORE CONFIG ───────────
export function getStoreConfig() {
  const db = readDB();
  return db.storeConfig || INITIAL_DB_STATE.storeConfig;
}

export function updateStoreConfig(configData) {
  const db = readDB();
  db.storeConfig = { ...(db.storeConfig || {}), ...configData };
  writeDB(db);
  return db.storeConfig;
}

// ─────────── ADMIN AUTHENTICATION ───────────
export function verifyAdminCredentials(email, password) {
  const db = readDB();
  const admin = db.adminUser || INITIAL_DB_STATE.adminUser;

  const emailMatch = admin.email.toLowerCase() === email.toLowerCase().trim();
  if (!emailMatch) return false;

  const passwordMatch = bcrypt.compareSync(password, admin.passwordHash);
  return passwordMatch ? { email: admin.email, name: admin.name, role: admin.role } : null;
}

export function resetDatabase() {
  writeDB(INITIAL_DB_STATE);
  return INITIAL_DB_STATE;
}
