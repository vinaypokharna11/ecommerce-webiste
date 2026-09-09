'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShoppingBag, 
  Heart, 
  Plus, 
  Minus, 
  Star,
  Check,
  MessageCircle,
  ShieldCheck,
  Truck
} from 'lucide-react';
import Image from 'next/image';
import { STORE_CONFIG } from '@/data/mockData';
import { createProductWhatsAppUrl } from '@/utils/whatsapp';
import { formatPrice } from '@/utils/formatPrice';

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
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [localQty, setLocalQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (product) {
      const defaultVar = product.variants ? product.variants[0] : product.sizes ? product.sizes[0] : null;
      setSelectedVariant(defaultVar);
      setLocalQty(1);
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
  const whatsappUrl = createProductWhatsAppUrl(product, STORE_CONFIG?.whatsappNumber);

  const availableOptions = product.variants || product.sizes || [];

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart && onAddToCart({
      ...product,
      selectedVariant,
      quantity: localQty,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity"
        />

        {/* Apple Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-black/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.18)] rounded-2xl sm:rounded-[2rem] z-10 p-4.5 xs:p-6 sm:p-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] flex items-center justify-center transition-colors z-20 cursor-pointer shadow-xs"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 items-start">
            {/* Image Showcase */}
            <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#F5F5F7] border border-black/[0.04]">
              <Image
                src={product.image || '/assets/images/prod_backpack.jpg'}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
              {product.badge && (
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2.5 py-0.5 sm:px-3 sm:py-1 bg-[#1D1D1F] text-white text-[9px] sm:text-[10px] font-sans font-bold tracking-wide rounded-full">
                  {product.badge}
                </div>
              )}
            </div>

            {/* Product Details & Actions */}
            <div className="flex flex-col justify-between space-y-4 sm:space-y-6">
              <div className="space-y-2 sm:space-y-2.5">
                <span className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-wider text-[#86868B]">
                  {product.categoryName || 'Product'}
                </span>

                <h1 className="font-sans text-lg xs:text-xl sm:text-2xl font-bold text-[#1D1D1F] leading-snug">
                  {product.name}
                </h1>

                {/* Rating & reviews */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center text-[#FF9500]">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="ml-1 font-bold text-[#1D1D1F]">{product.rating || '4.8'}</span>
                  </div>
                  <span className="text-[#86868B]">·</span>
                  <span className="text-[#86868B]">
                    {product.reviews || '80'} verified buyers
                  </span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                  <span className="font-sans text-xl sm:text-2xl font-bold text-[#1D1D1F]">
                    {formatPrice(product.price, STORE_CONFIG.currency)}
                  </span>
                  {product.oldPrice && (
                    <span className="font-sans text-xs sm:text-sm text-[#86868B] line-through">
                      {formatPrice(product.oldPrice, STORE_CONFIG.currency)}
                    </span>
                  )}
                  {product.discountPercent && (
                    <span className="text-[10px] font-bold text-[#34C759] bg-[#34C759]/10 px-2 py-0.5 rounded-full">
                      {product.discountPercent}% OFF
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="font-sans text-xs sm:text-sm text-[#6E6E73] leading-relaxed pt-1">
                  {product.description ||
                    'Premium quality, verified for durability, comfort and everyday brilliance.'}
                </p>
              </div>

              {/* Sizing / Variant Selection */}
              {availableOptions.length > 0 && (
                <div className="space-y-1.5 sm:space-y-2 pt-2 border-t border-black/[0.06]">
                  <span className="text-xs font-sans font-semibold text-[#1D1D1F]">
                    Select Option:
                  </span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {availableOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedVariant(opt)}
                        className={`px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer ${
                          selectedVariant === opt
                            ? 'bg-[#1D1D1F] text-white shadow-xs'
                            : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED] border border-black/[0.05]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Counter & Wishlist */}
              <div className="flex items-center gap-3 sm:gap-4 pt-2 border-t border-black/[0.06]">
                <span className="text-xs font-sans font-semibold text-[#1D1D1F]">
                  Quantity:
                </span>
                <div className="flex items-center bg-[#F5F5F7] border border-black/[0.05] rounded-full p-1">
                  <button
                    onClick={() => setLocalQty((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-full bg-white text-[#1D1D1F] flex items-center justify-center shadow-xs transition-colors hover:bg-black/5 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 sm:px-4 text-xs font-sans font-bold text-[#1D1D1F]">
                    {localQty}
                  </span>
                  <button
                    onClick={() => setLocalQty((q) => q + 1)}
                    className="w-7 h-7 rounded-full bg-white text-[#1D1D1F] flex items-center justify-center shadow-xs transition-colors hover:bg-black/5 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => onToggleFavorite && onToggleFavorite(product)}
                  className={`p-2 sm:p-2.5 rounded-full border transition-colors cursor-pointer ${
                    isFavorite
                      ? 'bg-rose-50 border-rose-200 text-rose-500'
                      : 'bg-[#F5F5F7] border-black/[0.06] text-[#86868B] hover:text-rose-500'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 sm:space-y-2.5 pt-2">
                <button
                  onClick={handleAdd}
                  disabled={isOutOfStock}
                  className="w-full py-2.5 sm:py-3 btn-apple-primary justify-center text-xs sm:text-sm cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  <span>{isAdded ? 'Added to Bag ✓' : `Add to Bag · ${formatPrice(totalPrice, STORE_CONFIG.currency)}`}</span>
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 sm:py-2.5 px-4 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Inquire or Order via WhatsApp</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-3 border-t border-black/[0.06] text-[11px] sm:text-xs text-[#6E6E73]">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#34C759] shrink-0" />
                  <span className="truncate">Genuine Quality</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0071E3] shrink-0" />
                  <span className="truncate">Express Shipping</span>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickViewModal;
