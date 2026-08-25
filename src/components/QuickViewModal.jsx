import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ShoppingBag, 
  Heart, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Star,
  Check,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { STORE_CONFIG } from '../data/mockData';
import { createProductWhatsAppUrl } from '../utils/whatsapp';

export const QuickViewModal = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart,
  cartQuantity = 0,
  onUpdateQuantity,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedColor, setSelectedColor] = useState(null);
  const [localQty, setLocalQty] = useState(1);
  const [isFollowing, setIsFollowing] = useState(true);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  const availableSizes = product?.sizes || ['S', 'M', 'L', 'XL'];

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes ? product.sizes[0] : 'L');
      setSelectedColor(product.colors ? product.colors[0].name : null);
      setLocalQty(1);
      setActiveImgIndex(0);
      setIsAdded(false);
    }
  }, [product]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const isOutOfStock = product.stockStatus === 'out_of_stock';
  const totalPrice = (product.price || 0) * localQty;
  const whatsappUrl = createProductWhatsAppUrl(product, selectedSize, selectedColor);

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart({
      ...product,
      selectedSize,
      selectedColor,
      quantity: localQty,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        />

        {/* Details Screen Container (Direct Match for Reference Screen 2) */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.96 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-t-[32px] sm:rounded-[32px] border border-black/5 shadow-glass-modal z-10 p-5 sm:p-7 flex flex-col justify-between"
        >
          <div>
            {/* Top Bar Header (Screen 2: Back < | Details | Bag 🛍️) */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-[#EEEEEC] hover:bg-[#E2E2DE] text-[#171717] flex items-center justify-center transition-transform active:scale-95 shadow-sm"
                aria-label="Back"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              <h2 className="text-base font-extrabold text-[#171717] tracking-tight">
                Details
              </h2>

              <div className="relative">
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-[#EEEEEC] hover:bg-[#E2E2DE] text-[#171717] flex items-center justify-center transition-transform active:scale-95 shadow-sm"
                  aria-label="Shopping Bag"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>
                {cartQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#9FD842] text-[#171717] text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {cartQuantity}
                  </span>
                )}
              </div>
            </div>

            {/* Product Image Gallery in #EEEEEC container with dot pagination */}
            <div className="relative w-full aspect-square rounded-[28px] bg-[#EEEEEC] p-6 flex flex-col items-center justify-between overflow-hidden mb-4">
              <div className="w-full flex-1 relative flex items-center justify-center">
                {product.image && (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-2 rounded-[20px] transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 90vw, 400px"
                  />
                )}
              </div>

              {/* Dot Pagination */}
              <div className="flex items-center gap-1.5 pt-2 z-10">
                <span className="w-2 h-2 rounded-full bg-[#D1D5DB]" />
                <span className="w-6 h-2 rounded-full bg-[#171717]" />
                <span className="w-2 h-2 rounded-full bg-[#D1D5DB]" />
              </div>
            </div>

            {/* Category + Title + Wishlist Button Row */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-xs font-semibold text-[#777777] block">
                  {product.categoryName || 'Footwear'}
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#171717] tracking-tight mt-0.5 leading-tight">
                  {product.name}
                </h1>
              </div>

              <button
                onClick={() => onToggleFavorite && onToggleFavorite(product.id)}
                className="w-10 h-10 rounded-full bg-[#EEEEEC] hover:bg-[#E2E2DE] flex items-center justify-center transition-transform active:scale-95 shrink-0 shadow-sm"
                aria-label="Wishlist"
              >
                <Heart 
                  className={`w-5 h-5 transition-colors ${
                    isFavorite 
                      ? 'text-red-500 fill-red-500' 
                      : 'text-[#171717]'
                  }`} 
                />
              </button>
            </div>

            {/* Official Store Card (Matches Reference Screen 2) */}
            <div className="flex items-center justify-between p-3 rounded-[20px] bg-[#FAF9F7] border border-black/[0.04] mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[14px] bg-gradient-to-tr from-amber-200 to-orange-300 flex items-center justify-center text-xs font-bold text-[#171717] shadow-sm">
                  🛍️
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-extrabold text-[#171717]">
                      {STORE_CONFIG.name} Store
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#171717] fill-current text-white" />
                  </div>
                  <span className="text-[11px] font-medium text-[#777777] block">
                    Official store
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1 ${
                  isFollowing 
                    ? 'bg-[#171717] text-white hover:bg-black' 
                    : 'bg-white text-[#171717] border border-black/10 hover:bg-[#EEEEEC]'
                }`}
              >
                {isFollowing && <Check className="w-3 h-3 stroke-[3]" />}
                <span>{isFollowing ? 'Following' : 'Follow'}</span>
              </button>
            </div>

            {/* Select Size + QTY Selector Row */}
            <div className="flex items-center justify-between gap-4 mb-5">
              {/* Select size */}
              <div>
                <span className="text-xs font-semibold text-[#777777] block mb-2">
                  Select size
                </span>
                <div className="flex items-center gap-2">
                  {availableSizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] font-extrabold text-xs transition-all active:scale-95 shadow-sm ${
                          isSelected
                            ? 'bg-[#9FD842] text-[#171717] shadow-neu-btn-accent ring-2 ring-[#9FD842]/30'
                            : 'bg-[#EEEEEC] text-[#171717] hover:bg-[#E2E2DE]'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* QTY Counter */}
              <div>
                <span className="text-xs font-semibold text-[#777777] block mb-2 text-right">
                  QTY
                </span>
                <div className="flex items-center bg-[#EEEEEC] rounded-full px-2 py-1 gap-2.5 border border-black/5 shadow-inner">
                  <button
                    onClick={() => setLocalQty(Math.max(1, localQty - 1))}
                    className="w-7 h-7 rounded-full bg-white text-[#171717] flex items-center justify-center font-bold text-sm shadow-xs hover:bg-[#F5F5F3] active:scale-90 transition-transform"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-extrabold text-[#171717] min-w-[16px] text-center">
                    {localQty}
                  </span>
                  <button
                    onClick={() => setLocalQty(localQty + 1)}
                    className="w-7 h-7 rounded-full bg-[#171717] text-white flex items-center justify-center font-bold text-sm shadow-xs hover:bg-black active:scale-90 transition-transform"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <span className="text-xs font-bold text-[#171717] block mb-1">
                Description
              </span>
              <p className="text-xs text-[#777777] leading-relaxed">
                {product.description || 'Premium quality materials crafted for maximum comfort and durability. Perfect for daily lifestyle and casual wear.'}
              </p>
            </div>
          </div>

          {/* Sticky Bottom Action Bar (Screen 2: Total price $120 | 🛍️ Add to Cart) */}
          <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between gap-4 mt-2">
            <div>
              <span className="text-[11px] font-semibold text-[#777777] block leading-tight">
                Total price
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-[#171717]">
                {STORE_CONFIG.currency}{totalPrice.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* WhatsApp Inquiry */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center border border-emerald-200/60 shrink-0 transition-colors shadow-sm"
                title="Inquire on WhatsApp"
              >
                <MessageCircle className="w-5 h-5 fill-emerald-600/20" />
              </a>

              {/* Main CTA Button in Vibrant Lime Green */}
              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`px-6 sm:px-8 py-3.5 rounded-full font-extrabold text-sm sm:text-base flex items-center gap-2.5 transition-all shadow-neu-btn-accent active:scale-95 ${
                  isOutOfStock
                    ? 'bg-[#EEEEEC] text-[#A0A0A0] cursor-not-allowed'
                    : isAdded
                    ? 'bg-[#171717] text-white'
                    : 'bg-[#9FD842] hover:bg-[#8EC731] text-[#171717]'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isAdded ? 'Added ✓' : 'Add to Cart'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
