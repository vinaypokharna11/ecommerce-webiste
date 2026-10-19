export const STORE_CONFIG = {
  name: 'Nakoda Imitation',
  tagline: 'Premium Imitation Jewelry & Lifestyle Collection',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210',
  whatsappDisplay: process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY || '+91 98765 43210',
  whatsappLink: process.env.NEXT_PUBLIC_WHATSAPP_LINK || `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'}`,
  address: '6, Honey Complex, Opposite Gunjan Cinema, Koparli Road, Gunjan, G.I.D.C, Vapi, Gujarat 396195',
  hours: 'Mon - Sun: 9:30 AM – 9:30 PM',
  currency: '₹',
};

export const HERO_ASSETS = {
  bag: '/assets/images/hero_shopping_bag.jpg',
  headphones: '/assets/images/pink_headphones.jpg',
  smartwatch: '/assets/images/hero_smartwatch.jpg',
  plant: '/assets/images/hero_plant.jpg',
  giftbox: '/assets/images/promo_giftbox.jpg',
};

export const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: 'Home' },
  { id: 'catalog', label: 'Catalog', icon: 'LayoutGrid' },
  { id: 'offers', label: 'Offers', icon: 'Sparkles' },
  { id: 'contact', label: 'Contact Us', icon: 'PhoneCall' },
  { id: 'profile', label: 'Profile', icon: 'User' },
];

export const CATALOG_CATEGORIES = [];

export const CATEGORIES = CATALOG_CATEGORIES;

export const DEFAULT_EXPLORE_SECTION = {
  title: 'Explore Our Collections',
  subtitle: 'Find exactly what you’re looking for across our curated lifestyle, grocery, apparel, and travel categories.',
  enabled: true,
  collections: [
    { id: 'bags-luggage', name: 'Bags & Trolleys', categoryId: 'bags-luggage', image: '/assets/images/prod_trolley.jpg', badge: 'Popular', order: 1, isActive: true },
    { id: 'jewelry', name: 'Jewelry & Watches', categoryId: 'jewelry', image: '/assets/images/nakoda/hero.jpg', badge: 'Trending', order: 2, isActive: true },
    { id: 'food-grocery', name: 'Papad & Gourmet', categoryId: 'food-grocery', image: '/assets/images/prod_papad.jpg', badge: 'Authentic', order: 3, isActive: true },
    { id: 'home-living', name: 'Home & Living', categoryId: 'home-living', image: '/assets/images/hero_plant.jpg', badge: 'Decor', order: 4, isActive: true },
  ],
};

export const DEFAULT_HERO_SHOWCASE = [
  {
    id: 'trolley',
    title: 'Cabin Spinner Suitcase',
    category: 'BAGS & TROLLEYS',
    badge: 'BESTSELLER',
    badgeBg: 'bg-black',
    image: '/assets/images/prod_trolley_wide.jpg',
    imageFit: 'cover',
    linkCategory: 'bags-luggage',
    order: 0,
    isActive: true,
  },
  {
    id: 'jewelry',
    title: 'Polki & Emerald Choker',
    category: 'JEWELRY & HEIRLOOMS',
    badge: 'LUXURY',
    badgeBg: 'bg-[#FF9500]',
    image: '/assets/images/nakoda/hero.jpg',
    imageFit: 'cover',
    linkCategory: 'jewelry',
    order: 1,
    isActive: true,
  },
  {
    id: 'papad',
    title: 'Spiced Urad Dal Papad',
    category: 'PAPAD & SNACKS',
    badge: 'FRESH CRISP',
    badgeBg: 'bg-[#34C759]',
    image: '/assets/images/prod_papad.jpg',
    imageFit: 'cover',
    linkCategory: 'food-grocery',
    order: 2,
    isActive: true,
  },
  {
    id: 'innerwear',
    title: 'Cotton Trunks (Pack of 3)',
    category: 'UNDERGARMENTS',
    badge: '100% COTTON',
    badgeBg: 'bg-[#0071E3]',
    image: '/assets/images/prod_innerwear.jpg',
    imageFit: 'cover',
    linkCategory: 'undergarments',
    order: 3,
    isActive: true,
  },
];

export const FEATURE_BENEFITS = [
  { icon: 'Truck', title: 'Express Delivery', desc: 'Across India with real-time tracking updates' },
  { icon: 'ShieldCheck', title: '100% Genuine Quality', desc: 'Direct from authorized manufacturers & artisans' },
  { icon: 'Headphones', title: '24/7 WhatsApp Help', desc: 'Dedicated customer support on +91 98765 43210' },
];

export const CONTACT_TOPICS = [
  'General Support & Questions',
  'Order Status & Tracking',
  'Custom / Bulk Orders',
  'Physical Store Visit & Timings',
  'Feedback & Store Experience',
  'Partnership & Business Opportunities',
];

export const INQUIRY_TYPES = [
  { id: 'bulk', label: 'Bulk / Wholesale Order', description: 'Volume discounts for larger product orders (10+ units)' },
  { id: 'custom', label: 'Product Customization', description: 'Custom branding, sizing, colors, or personalized hampers' },
  { id: 'corporate', label: 'Corporate Gifting', description: 'Curated gift hampers for employees, events, and clients' },
  { id: 'stock', label: 'Stock & Restock Check', description: 'Check upcoming availability for out-of-stock items' },
  { id: 'sourcing', label: 'Custom Sourcing Request', description: 'Ask us to source a specific product not yet in catalog' },
];

export const FAQS_DATA = [
  {
    question: 'How does WhatsApp Ordering work?',
    answer: 'Every product card and your shopping cart has a direct "Order on WhatsApp" button. Clicking it pre-fills a message with item details, sizes, colors, and direct links so our team can immediately confirm stock and dispatch your package.',
    q: 'How does WhatsApp Ordering work?',
    a: 'Every product card and your shopping cart has a direct "Order on WhatsApp" button. Clicking it pre-fills a message with item details, sizes, colors, and direct links so our team can immediately confirm stock and dispatch your package.',
    category: 'Ordering & Inquiries',
  },
  {
    question: 'Can I place bulk or customized corporate orders?',
    answer: 'Yes! Use the Custom / Bulk Inquiry form below. We provide wholesale tiered discounts, custom branding, and specialized festive gift hamper packing for corporate clients and wedding events.',
    q: 'Can I place bulk or customized corporate orders?',
    a: 'Yes! Use the Custom / Bulk Inquiry form below. We provide wholesale tiered discounts, custom branding, and specialized festive gift hamper packing for corporate clients and wedding events.',
    category: 'Ordering & Inquiries',
  },
  {
    question: 'What are the delivery charges and delivery times?',
    answer: 'Standard delivery takes 3–5 business days across India. Orders above ₹999 qualify for Free Standard Delivery. Express 24–48 hour delivery is available for select metros.',
    q: 'What are the delivery charges and delivery times?',
    a: 'Standard delivery takes 3–5 business days across India. Orders above ₹999 qualify for Free Standard Delivery. Express 24–48 hour delivery is available for select metros.',
    category: 'Delivery & Shipping',
  },
  {
    question: 'Do you offer Cash on Delivery (COD)?',
    answer: 'Yes, COD is available for select pin codes across India on orders up to ₹5,000 with a nominal verification step via WhatsApp or SMS.',
    q: 'Do you offer Cash on Delivery (COD)?',
    a: 'Yes, COD is available for select pin codes across India on orders up to ₹5,000 with a nominal verification step via WhatsApp or SMS.',
    category: 'Delivery & Shipping',
  },
  {
    question: 'Are the products 100% authentic?',
    answer: 'Every item is sourced directly from certified manufacturers, local artisans, and verified brand partners with strict quality assurance checks before packing.',
    q: 'Are the products 100% authentic?',
    a: 'Every item is sourced directly from certified manufacturers, local artisans, and verified brand partners with strict quality assurance checks before packing.',
    category: 'Authenticity & Quality',
  },
];

export const STORE_LOCATION_DETAILS = {
  name: 'Nakoda Imitation Flagship Retail Store',
  address: '6, Honey Complex, Opposite Gunjan Cinema, Koparli Road, Gunjan, G.I.D.C, Vapi, Gujarat 396195',
  phone: '+91 98794 51341',
  email: 'support@nakodaimitation.com',
  hoursWeekday: 'Monday – Saturday: 9:30 AM – 9:30 PM',
  hoursSunday: 'Sunday: 10:00 AM – 9:00 PM',
  landmark: 'Opposite Gunjan Cinema, Koparli Road, Gunjan GIDC',
  parking: 'Free Customer Parking Available',
  googleMapsUrl: 'https://maps.app.goo.gl/q44LnodPwW119dep8',
};

export const FOOTER_LINKS = {
  shop: [
    { label: 'All Products', href: '/?tab=catalog' },
    { label: 'New Arrivals', href: '/?tab=catalog&filter=new' },
    { label: 'Best Sellers', href: '/?tab=catalog&filter=bestseller' },
    { label: 'Special Offers & Deals', href: '/?tab=offers' },
  ],
  support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Product & Bulk Inquiry', href: '/contact?tab=inquire' },
    { label: 'Order on WhatsApp', href: 'https://wa.me/9879451341', isExternal: true },
    { label: 'Help & FAQs', href: '/contact' },
  ],
  company: [
    { label: 'Store Location & Map', href: '/contact' },
    { label: 'My Account & Orders', href: '/?tab=profile' },
    { label: 'Shopping Cart', href: '/?tab=cart' },
    { label: 'Bulk & Corporate Orders', href: '/contact?tab=inquire' },
  ],
};
