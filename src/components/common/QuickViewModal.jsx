'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Truck,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import { STORE_CONFIG } from '@/data/mockData';
import { createProductWhatsAppUrl } from '@/utils/whatsapp';
import { formatPrice } from '@/utils/formatPrice';
import { 
  getAllProductSizes, 
  getProductAvailableSizes, 
  isProductSizeAvailable 
} from '@/utils/productOptions';

export const QuickViewModal = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  isFavorite = false,
  onToggleFavorite,
  onNotify,
}) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [showSizeWarning, setShowSizeWarning] = useState(false);
  const [localQty, setLocalQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedSize(
        product.selectedSize && isProductSizeAvailable(product, product.selectedSize)
          ? product.selectedSize
          : null
      );
      setLocalQty(1);
      setIsAdded(false);
      setShowSizeWarning(false);
    }
  }, [product]);

  const isClosingViaBackRef = useRef(false);

  const handleModalClose = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.state?.modal === 'product-quickview') {
      isClosingViaBackRef.current = true;
      window.history.back();
    } else {
      onClose();
    }
  }, [onClose]);

  // Handle ESC key, browser Back button, and scroll lock with Lenis coordination
  useEffect(() => {
    if (!isOpen) return;

    // Capture exact scroll position prior to opening modal
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const lenis = typeof window !== 'undefined' ? window.__lenis : null;
    if (lenis) {
      lenis.stop();
    }

    const origBodyOverflow = document.body.style.overflow;
    const origHtmlOverflow = document.documentElement.style.overflow;

    // Lock page scrollbar without position:fixed which resets scrollY
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // Push history state so browser Back button closes modal without jumping/navigating away
    if (typeof window !== 'undefined') {
      window.history.pushState({ modal: 'product-quickview' }, '');
    }

    const handlePopState = () => {
      // Browser back button or mobile back gesture pressed
      isClosingViaBackRef.current = true;
      onClose();
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleModalClose();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.documentElement.style.overflow = origHtmlOverflow || '';
      document.body.style.overflow = origBodyOverflow || '';

      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);

      // If modal was unmounted directly without back navigation, clean up pushed history state
      if (!isClosingViaBackRef.current && typeof window !== 'undefined' && window.history.state?.modal === 'product-quickview') {
        window.history.back();
      }

      // Restore exact scroll position and synchronize with Lenis
      window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
      if (lenis) {
        lenis.scrollTo(scrollY, { immediate: true });
        lenis.start();
      }
    };
  }, [isOpen, onClose, handleModalClose]);

  if (!isOpen || !product) return null;

  const isOutOfStock = product.stockStatus === 'out_of_stock';
  const totalPrice = (product.price || 0) * localQty;
  const allSizes = getAllProductSizes(product);
  const availableSizes = getProductAvailableSizes(product);
  const whatsappUrl = createProductWhatsAppUrl(
    product,
    selectedSize ? `Size: ${selectedSize}` : null,
    null,
    STORE_CONFIG?.whatsappNumber
  );

  const handleAdd = () => {
    if (isOutOfStock) return;
    if (allSizes.length > 0 && !selectedSize) {
      setShowSizeWarning(true);
      setTimeout(() => setShowSizeWarning(false), 3500);
      if (onNotify) {
        onNotify('error', 'Select Size First ⚠️', `Please choose a size for ${product.name} before adding to cart.`);
      }
      return;
    }
    onAddToCart && onAddToCart({
      ...product,
      selectedVariant: selectedSize || '',
      selectedSize: selectedSize || '',
      quantity: localQty,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleModalClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity -z-10"
        />

        {/* Scroll Centering Wrapper */}
        <div 
          className="min-h-full flex items-center justify-center p-3 sm:p-6 py-6 sm:py-10"
          onClick={handleModalClose}
        >
          {/* Apple Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={product?.name || "Product Quick View"}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="product-quickview-modal relative w-full max-w-3xl bg-white border border-black/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.18)] rounded-2xl sm:rounded-[2rem] z-10 p-4 xs:p-5 sm:p-7 md:p-8 my-auto"
          >
          {/* Close button */}
          <button
            onClick={handleModalClose}
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
                <div className="absolute top-3.5 left-3.5 sm:top-5 sm:left-5 px-3.5 py-1.5 sm:px-4 sm:py-1.5 bg-[#1D1D1F] text-white text-xs sm:text-sm font-sans font-bold tracking-wider uppercase rounded-full shadow-md">
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

              {/* Sizing Selection (Clothing & Footwear Only) */}
              {allSizes.length > 0 && (
                <div className="space-y-1.5 sm:space-y-2 pt-2 border-t border-black/[0.06]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-sans font-semibold text-[#1D1D1F]">
                      Size:
                    </span>
                    {selectedSize ? (
                      <span className="text-[11px] font-sans font-bold text-[#0071E3] bg-[#0071E3]/10 px-2 py-0.5 rounded">
                        Selected: <strong className="text-[#0071E3]">{selectedSize}</strong>
                      </span>
                    ) : (
                      <span className="text-[11px] font-sans font-medium text-amber-600">
                        Please select a size
                      </span>
                    )}
                  </div>

                  <AnimatePresence>
                    {showSizeWarning && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                        <span>Please select a size before adding to cart!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div 
                    animate={showSizeWarning ? { x: [-4, 4, -4, 4, 0] } : {}}
                    transition={{ duration: 0.35 }}
                    className={`flex flex-wrap gap-1.5 sm:gap-2 p-1 rounded-xl transition-all ${
                      showSizeWarning ? 'bg-rose-50 ring-2 ring-rose-500/80' : ''
                    }`}
                  >
                    {allSizes.map((sz) => {
                      const isAvailable = isProductSizeAvailable(product, sz);
                      const isSelected = selectedSize === sz;

                      return (
                        <button
                          key={sz}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => {
                            if (isAvailable) {
                              setSelectedSize(sz);
                              setShowSizeWarning(false);
                            }
                          }}
                          title={isAvailable ? `Select Size ${sz}` : `Size ${sz} is out of stock`}
                          className={`relative overflow-hidden px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-sans font-medium transition-all ${
                            !isAvailable
                              ? 'bg-black/[0.03] text-[#86868B] border border-dashed border-black/15 cursor-not-allowed opacity-60'
                              : isSelected
                              ? 'bg-[#1D1D1F] text-white shadow-xs scale-105 cursor-pointer'
                              : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED] border border-black/[0.05] cursor-pointer'
                          }`}
                        >
                          <span>{sz}</span>
                          {!isAvailable && (
                            <svg
                              className="absolute inset-0 w-full h-full pointer-events-none text-black/40"
                              viewBox="0 0 100 100"
                              preserveAspectRatio="none"
                              aria-hidden="true"
                            >
                              <line
                                x1="0"
                                y1="100"
                                x2="100"
                                y2="0"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                vectorEffect="non-scaling-stroke"
                              />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
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

            </div>

            </div>
          </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default QuickViewModal;
