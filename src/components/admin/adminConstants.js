import heroShoppingBag from '../../assets/images/hero_shopping_bag.jpg';
import pinkHeadphones from '../../assets/images/pink_headphones.jpg';
import heroSmartwatch from '../../assets/images/hero_smartwatch.jpg';
import heroPlant from '../../assets/images/hero_plant.jpg';
import prodHeadphones from '../../assets/images/prod_headphones.jpg';
import prodSmartwatch from '../../assets/images/prod_smartwatch.jpg';
import prodSneakers from '../../assets/images/prod_sneakers.jpg';
import prodBackpack from '../../assets/images/prod_backpack.jpg';
import promoGiftbox from '../../assets/images/promo_giftbox.jpg';
import catLinenShirt from '../../assets/images/cat_linen_shirt.jpg';
import catSunglasses from '../../assets/images/cat_sunglasses.jpg';
import catSpeaker from '../../assets/images/cat_speaker.jpg';

export const ASSET_GALLERY = [
  { id: 'headphones_navy', name: 'Navy Bluetooth Headphones', src: prodHeadphones, category: 'electronics' },
  { id: 'headphones_pink', name: 'Pastel Studio Pink Headphones', src: pinkHeadphones, category: 'electronics' },
  { id: 'smartwatch_black', name: 'Smart Fitness Watch Pro', src: prodSmartwatch, category: 'electronics' },
  { id: 'smartwatch_hero', name: 'Smartwatch Floating Stand', src: heroSmartwatch, category: 'electronics' },
  { id: 'speaker_aura', name: 'Heavy Bass Bluetooth Speaker', src: catSpeaker, category: 'electronics' },
  { id: 'sneakers_white', name: 'Breathable Casual Sneakers', src: prodSneakers, category: 'footwear' },
  { id: 'linen_shirt', name: 'Relaxed Pure Linen Shirt', src: catLinenShirt, category: 'clothing' },
  { id: 'sunglasses_tac', name: 'Polarized Wayfarer Sunglasses', src: catSunglasses, category: 'accessories' },
  { id: 'backpack_urban', name: 'Water-Resistant Backpack', src: prodBackpack, category: 'accessories' },
  { id: 'giftbox_luxe', name: 'Festive Luxury Gift Hamper', src: promoGiftbox, category: 'accessories' },
  { id: 'plant_succulent', name: 'Ceramic Succulent Plant', src: heroPlant, category: 'home-living' },
  { id: 'shopping_bag', name: 'Nakoda Imitation Signature Bag', src: heroShoppingBag, category: 'general' },
];

export const BADGE_PRESETS = [
  { label: 'BEST SELLER', type: 'bestseller', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { label: 'TRENDING', type: 'trending', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { label: 'HOT', type: 'hot', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { label: 'NEW', type: 'new', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { label: 'SALE', type: 'sale', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { label: 'LIMITED', type: 'limited', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: '25% OFF', type: 'discount', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { label: '30% OFF', type: 'discount', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { label: '50% OFF', type: 'discount', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { label: 'PREMIUM', type: 'premium', color: 'bg-slate-900 text-amber-300 border-slate-700' },
  { label: 'ECO', type: 'eco', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { label: 'SPECIAL', type: 'special', color: 'bg-violet-50 text-violet-700 border-violet-200' },
];

export const ICON_OPTIONS = [
  { name: 'Headphones', label: 'Audio / Tech' },
  { name: 'Shirt', label: 'Apparel / Fashion' },
  { name: 'Footprints', label: 'Footwear / Shoes' },
  { name: 'Watch', label: 'Watches / Wearables' },
  { name: 'Armchair', label: 'Home / Living' },
  { name: 'Sparkles', label: 'Beauty / Special' },
  { name: 'Gift', label: 'Gifting / Hampers' },
  { name: 'ShoppingBag', label: 'General / Retail' },
  { name: 'LayoutGrid', label: 'All / Grid' },
  { name: 'Zap', label: 'Fast Deals' },
  { name: 'Tag', label: 'Discounts' },
  { name: 'Flame', label: 'Hot Trends' },
];

export const COLOR_PRESETS = [
  { name: 'Electric Purple', color: '#6257FF', bg: 'bg-[#F5F3FF]', text: 'text-[#6257FF]' },
  { name: 'Vibrant Magenta', color: '#EC5AC8', bg: 'bg-[#FFF0FB]', text: 'text-[#EC5AC8]' },
  { name: 'Royal Violet', color: '#8B5CF6', bg: 'bg-[#F5F3FF]', text: 'text-[#8B5CF6]' },
  { name: 'Emerald Green', color: '#059669', bg: 'bg-[#F0FDF4]', text: 'text-[#059669]' },
  { name: 'Ocean Cyan', color: '#0891B2', bg: 'bg-[#F0F9FF]', text: 'text-[#0891B2]' },
  { name: 'Amber Gold', color: '#D97706', bg: 'bg-[#FFFBEB]', text: 'text-[#D97706]' },
  { name: 'Rose Red', color: '#E11D48', bg: 'bg-[#FFF1F2]', text: 'text-[#E11D48]' },
  { name: 'Slate Dark', color: '#334155', bg: 'bg-[#F8FAFC]', text: 'text-[#334155]' },
];

export const GRADIENT_OPTIONS = [
  { label: 'Purple to Indigo', value: 'from-[#6257FF] to-[#4F46E5]', text: '#6257FF', bg: 'bg-[#F5F3FF]', border: 'border-[#EAE6FD]' },
  { label: 'Pink to Berry', value: 'from-[#EC5AC8] to-[#BE185D]', text: '#EC5AC8', bg: 'bg-[#FFF0FB]', border: 'border-[#FCD6F2]' },
  { label: 'Violet to Purple', value: 'from-[#8B5CF6] to-[#7C3AED]', text: '#8B5CF6', bg: 'bg-[#F5F3FF]', border: 'border-[#DDD6FE]' },
  { label: 'Teal to Cyan', value: 'from-[#0891B2] to-[#0E7490]', text: '#0891B2', bg: 'bg-[#F0F9FF]', border: 'border-[#BAE6FD]' },
  { label: 'Green to Emerald', value: 'from-[#059669] to-[#047857]', text: '#059669', bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]' },
  { label: 'Amber to Bronze', value: 'from-[#D97706] to-[#B45309]', text: '#D97706', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]' },
];
