'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowLeft,
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
  isProductSizeAvailable,
  getProductColors,
} from '@/utils/productOptions';
import { ProductReviews } from '@/components/product/ProductReviews';
import Lenis from 'lenis';

export const QuickViewModal = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  cartQuantity = 0,
  onUpdateQuantity,
  isFavorite = false,
  onToggleFavorite,
  onNotify,
}) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [showSizeWarning, setShowSizeWarning] = useState(false);
  const [showColorWarning, setShowColorWarning] = useState(false);
  const [localQty, setLocalQty] = useState(cartQuantity || 0);
  const [isAdded, setIsAdded] = useState(false);
  const [liveReviewStats, setLiveReviewStats] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    if (product) {
      setSelectedSize(
        product.selectedSize && isProductSizeAvailable(product, product.selectedSize)
          ? product.selectedSize
          : null
      );
      const productColors = getProductColors(product);
      setSelectedColor(
        product.selectedColor || (productColors.length === 1 ? productColors[0].name : null)
      );
      // By default without adding it to cart, show 0 (or existing cart quantity capped to stock)
      const maxS = typeof product.stockCount === 'number'
        ? Math.max(0, product.stockCount)
        : (product.stockStatus === 'out_of_stock' ? 0 : 99);
      setLocalQty(Math.min(maxS, cartQuantity || 0));
      setIsAdded(false);
      setShowSizeWarning(false);
      setShowColorWarning(false);
      setLiveReviewStats(null);
      const allImgs = Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : (product.image ? [product.image] : []);
      setActiveImage(allImgs[0] || product.image || '/assets/images/prod_backpack.jpg');
    }
  }, [product, cartQuantity]);

  const isClosingViaBackRef = useRef(false);
  const modalContainerRef = useRef(null);
  const contentScrollRef = useRef(null);
  const modalContentRef = useRef(null);
  const modalLenisRef = useRef(null);

  // Initialize independent butter-smooth Lenis instance for internal modal scrolling
  useEffect(() => {
    if (!isOpen || !product) return;

    let lenisInstance = null;

    const wrapper = contentScrollRef.current;
    const container = modalContainerRef.current;
    const content = modalContentRef.current;

    if (wrapper && container) {
      lenisInstance = new Lenis({
        wrapper: wrapper,
        content: content || wrapper.firstElementChild || wrapper,
        eventsTarget: container,
        autoRaf: true,
        smoothWheel: true,
        duration: 0.85,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 1.0,
        touchMultiplier: 1.0,
        syncTouch: false,
        infinite: false,
        overscroll: false,
      });

      modalLenisRef.current = lenisInstance;
    }

    // Refresh dimensions as modal dialog springs into view
    const t1 = setTimeout(() => modalLenisRef.current?.resize(), 60);
    const t2 = setTimeout(() => modalLenisRef.current?.resize(), 200);
    const t3 = setTimeout(() => modalLenisRef.current?.resize(), 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (lenisInstance) {
        lenisInstance.destroy();
        modalLenisRef.current = null;
      }
    };
  }, [isOpen, product]);

  // Recalculate dimensions whenever reviews update or expand
  useEffect(() => {
    if (modalLenisRef.current) {
      modalLenisRef.current.resize();
    }
  }, [liveReviewStats]);

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

    // Prevent browser auto-scroll on popstate back navigation
    let prevScrollRestoration = 'auto';
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      prevScrollRestoration = window.history.scrollRestoration;
      window.history.scrollRestoration = 'manual';
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
      const restoreScroll = () => {
        if (lenis) {
          lenis.start();
          lenis.scrollTo(scrollY, { immediate: true });
        }
        window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
        if (document.documentElement) document.documentElement.scrollTop = scrollY;
        if (document.body) document.body.scrollTop = scrollY;
      };

      restoreScroll();
      requestAnimationFrame(restoreScroll);
      setTimeout(restoreScroll, 25);
      setTimeout(() => {
        restoreScroll();
        if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
          window.history.scrollRestoration = prevScrollRestoration;
        }
      }, 75);
    };
  }, [isOpen, onClose, handleModalClose]);

  if (!isOpen || !product) return null;

  const maxStock = typeof product.stockCount === 'number'
    ? Math.max(0, product.stockCount)
    : (product.stockStatus === 'out_of_stock' ? 0 : 99);
  const isOutOfStock = product.stockStatus === 'out_of_stock' || (typeof product.stockCount === 'number' && product.stockCount <= 0);
  const displayQty = isOutOfStock ? 0 : Math.min(maxStock, localQty > 0 ? localQty : 1);
  const totalPrice = (product.price || 0) * displayQty;
  const allSizes = getAllProductSizes(product);
  const availableSizes = getProductAvailableSizes(product);
  const productColors = getProductColors(product);
  const whatsappUrl = createProductWhatsAppUrl(
    product,
    selectedSize ? `Size: ${selectedSize}` : null,
    selectedColor || null,
    STORE_CONFIG?.whatsappNumber
  );

  const handleAdd = () => {
    if (isOutOfStock || maxStock <= 0) {
      if (onNotify) {
        onNotify('error', 'Out of Stock ⚠️', `${product.name} is currently out of stock.`);
      }
      return;
    }
    if (allSizes.length > 0 && !selectedSize) {
      setShowSizeWarning(true);
      setTimeout(() => setShowSizeWarning(false), 3500);
      if (onNotify) {
        onNotify('error', 'Select Size First ⚠️', `Please choose a size for ${product.name} before adding to cart.`);
      }
      return;
    }
    if (productColors.length > 0 && !selectedColor) {
      setShowColorWarning(true);
      setTimeout(() => setShowColorWarning(false), 3500);
      if (onNotify) {
        onNotify('error', 'Select Color First ⚠️', `Please choose a color for ${product.name} before adding to cart.`);
      }
      return;
    }
    const qtyToAdd = Math.min(maxStock, localQty > 0 ? localQty : 1);
    onAddToCart && onAddToCart({
      ...product,
      selectedColor: selectedColor || '',
      selectedVariant: [selectedColor, selectedSize].filter(Boolean).join(' / ') || selectedSize || selectedColor || '',
      selectedSize: selectedSize || '',
      quantity: qtyToAdd,
    });
    setLocalQty(qtyToAdd);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
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
          className="h-full w-full flex items-center justify-center p-2 xs:p-3 sm:p-6 py-4 sm:py-8"
          onClick={handleModalClose}
        >
          {/* Apple Modal Container with Internal Scroll */}
          <motion.div
            ref={modalContainerRef}
            role="dialog"
            aria-modal="true"
            aria-label={product?.name || "Product Quick View"}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="product-quickview-modal relative w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] flex flex-col bg-white border border-black/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.18)] rounded-2xl sm:rounded-[2rem] z-10 my-auto overflow-hidden"
          >
            {/* Top Navigation Bar: Back & Close Buttons (Completely outside the image) */}
            <div className="flex items-center justify-between px-3.5 xs:px-4 sm:px-6 py-2.5 sm:py-3 border-b border-black/[0.06] bg-white z-30 shrink-0">
              <button
                onClick={handleModalClose}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] flex items-center justify-center transition-colors cursor-pointer group shadow-2xs"
                aria-label="Back"
                title="Back to products"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider hidden sm:inline-block">
                {product.categoryName || 'Product Details'}
              </span>

              <button
                onClick={handleModalClose}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                aria-label="Close modal"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Modal Body Container (Mouse wheel scrollable over entire product) */}
            <div 
              ref={contentScrollRef}
              className="overflow-y-auto overscroll-contain p-3.5 xs:p-5 sm:p-7 md:p-8 flex-1 custom-scrollbar"
              style={{ willChange: 'scroll-position', scrollBehavior: 'auto' }}
            >
              <div ref={modalContentRef} className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-5 sm:gap-8 items-start">
                {/* Image Showcase */}
                <div className="space-y-3 w-full">
                  <div className="relative aspect-[3/4] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#F7F7F8] border border-black/[0.04] min-h-[320px] sm:min-h-[440px] max-h-[580px] flex items-center justify-center">
                    <Image
                      src={activeImage || product.image || '/assets/images/prod_backpack.jpg'}
                      alt={product.name}
                      fill
                      className="object-contain w-full h-full p-1.5 sm:p-2.5 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 500px"
                    />
                    {product.badge && (
                      <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 px-3.5 py-1.5 sm:px-4 sm:py-1.5 bg-[#1D1D1F] text-white text-xs sm:text-sm font-sans font-bold tracking-wider uppercase rounded-full shadow-md z-20">
                        {product.badge}
                      </div>
                    )}
                  </div>

                  {/* Multi-Image Thumbnails in QuickView */}
                  {Array.isArray(product.images) && product.images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {product.images.map((imgUrl, i) => {
                        const isSelected = (activeImage || product.image) === imgUrl;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setActiveImage(imgUrl)}
                            className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[#F5F5F7] border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#1D1D1F] ring-2 ring-[#9FD842]/60 scale-105 shadow-xs'
                                : 'border-black/10 hover:border-black/30 opacity-70 hover:opacity-100'
                            }`}
                            title={`View image ${i + 1}`}
                          >
                            <Image
                              src={imgUrl}
                              alt={`${product.name} - view ${i + 1}`}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Product Details & Actions */}
                <div className="flex flex-col justify-between space-y-4 sm:space-y-6">
                  <div className="space-y-2 sm:space-y-2.5">
                    <span className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-wider text-[#86868B]">
                      {product.categoryName || 'Product'}
                    </span>

                    <h1 className="font-sans text-lg xs:text-xl sm:text-2xl font-bold text-[#1D1D1F] leading-snug pr-8">
                      {product.name}
                    </h1>

                    {/* Rating & reviews with live database sync */}
                    {(() => {
                      const totalRev = (liveReviewStats !== null ? liveReviewStats.totalReviews : product.reviews) || 0;
                      const avgRat = liveReviewStats !== null
                        ? Number(liveReviewStats.averageRating || 0)
                        : Number(product.rating || 0);

                      if (totalRev > 0 && avgRat > 0) {
                        return (
                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex items-center text-[#FF9500]">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span className="ml-1 font-bold text-[#1D1D1F]">
                                {avgRat.toFixed(1)}
                              </span>
                            </div>
                            <span className="text-[#86868B]">·</span>
                            <span className="text-[#86868B]">
                              {totalRev} customer {totalRev === 1 ? 'review' : 'reviews'}
                            </span>
                          </div>
                        );
                      }
                      return (
                        <div className="flex items-center gap-1.5 text-xs text-[#86868B]">
                          <span>No reviews yet</span>
                        </div>
                      );
                    })()}

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

                  {/* Color Selection */}
                  {productColors.length > 0 && (
                    <div className="space-y-1.5 sm:space-y-2 pt-2 border-t border-black/[0.06]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-sans font-semibold text-[#1D1D1F]">
                          Color:
                        </span>
                        {selectedColor ? (
                          <span className="text-[11px] font-sans font-bold text-[#0071E3] bg-[#0071E3]/10 px-2 py-0.5 rounded">
                            Selected: <strong className="text-[#0071E3] uppercase">{selectedColor}</strong>
                          </span>
                        ) : (
                          <span className="text-[11px] font-sans font-medium text-amber-600">
                            Please select a color
                          </span>
                        )}
                      </div>

                      <AnimatePresence>
                        {showColorWarning && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2"
                          >
                            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                            <span>Please select a color before adding to cart!</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.div 
                        animate={showColorWarning ? { x: [-4, 4, -4, 4, 0] } : {}}
                        transition={{ duration: 0.35 }}
                        className={`flex flex-wrap gap-1.5 sm:gap-2 p-1 rounded-xl transition-all ${
                          showColorWarning ? 'bg-rose-50 ring-2 ring-rose-500/80' : ''
                        }`}
                      >
                        {productColors.map((c) => {
                          const isSelected = selectedColor === c.name;

                          return (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => {
                                setSelectedColor(c.name);
                                setShowColorWarning(false);
                              }}
                              title={`Select Color: ${c.name}`}
                              className={`flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#1D1D1F] text-white shadow-xs scale-105 ring-2 ring-[#1D1D1F] ring-offset-1'
                                  : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED] border border-black/[0.05]'
                              }`}
                            >
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs shrink-0"
                                style={{ backgroundColor: c.hex }}
                              />
                              <span className="uppercase text-[11px] font-semibold">{c.name}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    </div>
                  )}

                  {/* Quantity Counter & Wishlist (Starts at 0 by default when not in bag) */}
                  <div className="flex items-center justify-between gap-3 sm:gap-4 pt-2 border-t border-black/[0.06] flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-sans font-semibold text-[#1D1D1F]">
                        Quantity:
                      </span>
                      <div className="flex items-center bg-[#F5F5F7] border border-black/[0.05] rounded-full p-1">
                        <button
                          onClick={() => {
                            const next = Math.max(0, localQty - 1);
                            setLocalQty(next);
                            if (cartQuantity > 0 && onUpdateQuantity) {
                              onUpdateQuantity(product.id, next);
                            }
                          }}
                          disabled={localQty <= 0 || isOutOfStock}
                          className="w-7 h-7 rounded-full bg-white text-[#1D1D1F] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-xs transition-colors hover:bg-black/5 cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 sm:px-4 text-xs font-sans font-bold text-[#1D1D1F] min-w-[20px] text-center">
                          {localQty}
                        </span>
                        <button
                          onClick={() => {
                            if (localQty >= maxStock) {
                              if (onNotify) {
                                onNotify('info', 'Stock Limit Reached ⚠️', `Only ${maxStock} unit${maxStock === 1 ? '' : 's'} available in stock.`);
                              }
                              return;
                            }
                            const next = Math.min(maxStock, localQty + 1);
                            setLocalQty(next);
                            if (cartQuantity > 0 && onUpdateQuantity) {
                              onUpdateQuantity(product.id, next);
                            }
                          }}
                          disabled={localQty >= maxStock || isOutOfStock}
                          className="w-7 h-7 rounded-full bg-white text-[#1D1D1F] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-xs transition-colors hover:bg-black/5 cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Stock availability indicator */}
                      {maxStock > 0 && maxStock <= 5 && (
                        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
                          Only {maxStock} left in stock
                        </span>
                      )}
                      {isOutOfStock && (
                        <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200/60 px-2.5 py-0.5 rounded-full">
                          Out of stock
                        </span>
                      )}
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
                      <span>
                        {isAdded
                          ? 'Added to Bag ✓'
                          : `Add to Bag · ${formatPrice(totalPrice, STORE_CONFIG.currency)}`}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Real Customer Reviews & Ratings Section ── */}
              <div className="mt-8 pt-6 border-t border-black/10">
                <ProductReviews 
                  productId={product.id} 
                  productName={product.name} 
                  onStatsLoaded={setLiveReviewStats}
                />
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
