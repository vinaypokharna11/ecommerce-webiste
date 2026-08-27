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
  { label: 'BEST SELLER', type: 'bestseller', color: 'bg-[#F3FCDA] text-[#709E1E] border-[#9FD842]/40' },
  { label: 'TRENDING', type: 'trending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: 'HOT', type: 'hot', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { label: 'NEW', type: 'new', color: 'bg-[#F3FCDA] text-[#709E1E] border-[#9FD842]/40' },
  { label: 'SALE', type: 'sale', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { label: 'LIMITED', type: 'limited', color: 'bg-amber-50 text-amber-800 border-amber-300' },
  { label: '25% OFF', type: 'discount', color: 'bg-[#171717] text-white border-black' },
  { label: '30% OFF', type: 'discount', color: 'bg-[#171717] text-white border-black' },
  { label: '50% OFF', type: 'discount', color: 'bg-[#171717] text-white border-black' },
  { label: 'PREMIUM', type: 'premium', color: 'bg-[#171717] text-[#9FD842] border-black' },
  { label: 'HANDMADE', type: 'handmade', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  { label: 'BRIDAL', type: 'bridal', color: 'bg-rose-50 text-rose-800 border-rose-300' },
];

export const ICON_OPTIONS = [
  { name: 'Sparkles', label: 'Jewelry / Gems' },
  { name: 'Shirt', label: 'Apparel / Fashion' },
  { name: 'Footprints', label: 'Footwear / Shoes' },
  { name: 'Watch', label: 'Watches / Wearables' },
  { name: 'Headphones', label: 'Audio / Tech' },
  { name: 'Armchair', label: 'Home / Living' },
  { name: 'Gift', label: 'Gifting / Hampers' },
  { name: 'ShoppingBag', label: 'General / Retail' },
  { name: 'LayoutGrid', label: 'All / Grid' },
  { name: 'Zap', label: 'Fast Deals' },
  { name: 'Tag', label: 'Discounts' },
  { name: 'Flame', label: 'Hot Trends' },
];

export const COLOR_PRESETS = [
  { name: 'Nakoda Lime', color: '#709E1E', bg: 'bg-[#F3FCDA]', text: 'text-[#709E1E]' },
  { name: 'Jet Charcoal', color: '#171717', bg: 'bg-[#EEEEEC]', text: 'text-[#171717]' },
  { name: 'Emerald Green', color: '#059669', bg: 'bg-[#F0FDF4]', text: 'text-[#059669]' },
  { name: 'Amber Gold', color: '#D97706', bg: 'bg-[#FFFBEB]', text: 'text-[#D97706]' },
  { name: 'Rose Red', color: '#E11D48', bg: 'bg-[#FFF1F2]', text: 'text-[#E11D48]' },
  { name: 'Ocean Cyan', color: '#0891B2', bg: 'bg-[#F0F9FF]', text: 'text-[#0891B2]' },
  { name: 'Royal Violet', color: '#7C3AED', bg: 'bg-[#F5F3FF]', text: 'text-[#7C3AED]' },
  { name: 'Slate Dark', color: '#334155', bg: 'bg-[#F8FAFC]', text: 'text-[#334155]' },
];

export const GRADIENT_OPTIONS = [
  { label: 'Nakoda Lime & Olive', value: 'from-[#171717] to-[#2B3A0D]', text: '#9FD842', bg: 'bg-[#F8FDF0]', border: 'border-[#9FD842]/30' },
  { label: 'Gold & Amber', value: 'from-[#D97706] to-[#B45309]', text: '#D97706', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]' },
  { label: 'Emerald & Mint', value: 'from-[#059669] to-[#047857]', text: '#059669', bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]' },
  { label: 'Charcoal & Slate', value: 'from-[#171717] to-[#334155]', text: '#FFFFFF', bg: 'bg-[#EEEEEC]', border: 'border-black/10' },
  { label: 'Teal & Ocean', value: 'from-[#0891B2] to-[#0E7490]', text: '#0891B2', bg: 'bg-[#F0F9FF]', border: 'border-[#BAE6FD]' },
  { label: 'Rose & Crimson', value: 'from-[#E11D48] to-[#BE123C]', text: '#E11D48', bg: 'bg-[#FFF1F2]', border: 'border-rose-200' },
];
