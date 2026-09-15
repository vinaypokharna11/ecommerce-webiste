'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, ShoppingBag, Plus, Minus, MessageCircle, Eye, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { STORE_CONFIG } from '@/data/mockData';
import { formatPrice } from '@/utils/formatPrice';
import { getProductSizes, isProductSizeAvailable, getProductColors, getProductColorHex } from '@/utils/productOptions';

export const ProductCardComponent = ({ 
  product, 
  quantity = 0, 
  isFavorite = false,
  selectedSize: initialSelectedSize = null,
  selectedColor: initialSelectedColor = null,
  onAddToCart, 
  onUpdateQuantity, 
  onUpdateSize,
  onToggleFavorite, 
  onQuickView,
  onWhatsAppInquiry,
  onNotify,
}) => {
  const isOutOfStock = product.stockStatus === 'out_of_stock';
  const sizes = getProductSizes(product);
  const colors = getProductColors(product);
  const [selectedSize, setSelectedSize] = useState(initialSelectedSize || null);
  const [selectedColor, setSelectedColor] = useState(
    initialSelectedColor || product.selectedColor || (colors.length === 1 ? colors[0].name : null)
  );
  const [showSizeWarning, setShowSizeWarning] = useState(false);
  const [showColorWarning, setShowColorWarning] = useState(false);

  useEffect(() => {
    if (initialSelectedSize) {
      setSelectedSize(initialSelectedSize);
    }
  }, [initialSelectedSize]);

  useEffect(() => {
    if (initialSelectedColor) {
      setSelectedColor(initialSelectedColor);
    }
  }, [initialSelectedColor]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`group relative bg-white rounded-2xl sm:rounded-3xl p-2.5 xs:p-3 sm:p-4 lg:p-5 border border-black/[0.06] shadow-[0_2px_14px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between cursor-pointer ${
        isOutOfStock ? 'opacity-85' : 'hover:-translate-y-1'
      }`}
      onClick={() => onQuickView && onQuickView(product)}
    >
      {/* Product Image Area with Apple Soft Background */}
      <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden mb-2.5 sm:mb-3.5 bg-[#F5F5F7] flex items-center justify-center">
        {/* Optional Badge */}
        {product.badge && (
          <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-10">
            <span className="inline-flex items-center justify-center px-3 py-1 sm:px-3.5 sm:py-1 rounded-full text-xs sm:text-xs font-sans font-bold tracking-wider uppercase bg-[#1D1D1F] text-white shadow-sm">
              {product.badge}
            </span>
          </div>
        )}

        {/* Favorite Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite && onToggleFavorite(product);
          }}
          className={`absolute top-2 sm:top-2.5 right-2 sm:right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs ${
            isFavorite
              ? 'bg-rose-50 text-rose-500 border border-rose-200'
              : 'bg-white/90 backdrop-blur-md text-[#86868B] hover:text-rose-500 border border-black/[0.04]'
          }`}
          aria-label={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart 
            className="w-3.5 h-3.5 sm:w-4 sm:h-4" 
            fill={isFavorite ? 'currentColor' : 'none'}
          />
        </button>

        {/* Product Image with smooth hover scale */}
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover rounded-xl sm:rounded-2xl transition-transform duration-500 group-hover:scale-106"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        )}

        {/* Quick View Pill (Desktop Hover) */}
        <div className="absolute bottom-2.5 inset-x-3 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#1D1D1F] text-xs font-semibold shadow-sm border border-black/[0.06]">
            <Eye className="w-3.5 h-3.5 text-[#0071E3]" />
            <span>Quick View</span>
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Category Tag */}
          <span className="text-[10px] sm:text-[11px] font-sans font-semibold text-[#86868B] uppercase tracking-wider block mb-0.5 sm:mb-1 truncate">
            {product.categoryName || 'Product'}
          </span>

          {/* Product Title */}
          <h3 className="font-sans text-xs sm:text-sm sm:text-base font-semibold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors line-clamp-1 mb-1 leading-snug">
            {product.name}
          </h3>

          {/* Rating - Only display when genuine reviews exist */}
          {Number(product.reviews) > 0 && Number(product.rating) > 0 && (
            <div className="flex items-center gap-1.5 mb-2 text-xs">
              <div className="flex items-center text-[#FF9500]">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
              </div>
              <span className="font-sans font-semibold text-[#1D1D1F] text-[11px] sm:text-xs">
                {Number(product.rating).toFixed(1)}
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#86868B]">
                ({product.reviews})
              </span>
            </div>
          )}



          {/* Sizes Selector (Clothing & Shoes) - Show ALL sizes, diagonal cross on unavailable */}
          {sizes.length > 0 && (
            <div className="relative mb-2.5" onClick={(e) => e.stopPropagation()}>
              {/* Floating Size Alert Popup when Add to Cart is clicked without selecting size */}
              <AnimatePresence>
                {showSizeWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.92 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 350 }}
                    className="absolute -top-9 left-1/2 -translate-x-1/2 z-30 bg-[#1D1D1F] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg border border-white/10 flex items-center gap-1.5 whitespace-nowrap pointer-events-none"
                  >
                    <span className="text-amber-400">⚠️</span>
                    <span>Please select a size first!</span>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1D1D1F] rotate-45 border-r border-b border-white/10" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between mb-1 px-0.5">
                <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                  Size
                </span>
                {selectedSize ? (
                  <span className="text-[10px] font-extrabold text-[#0071E3] bg-[#0071E3]/10 px-1.5 py-0.2 rounded">
                    Selected: {selectedSize}
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-amber-600">
                    Required
                  </span>
                )}
              </div>

              <motion.div 
                animate={showSizeWarning ? { x: [-4, 4, -4, 4, 0] } : {}}
                transition={{ duration: 0.35 }}
                className={`flex items-center gap-1.5 flex-wrap p-1 rounded-xl transition-all duration-200 ${
                  showSizeWarning 
                    ? 'bg-rose-50/80 ring-2 ring-rose-500/80' 
                    : 'bg-transparent'
                }`}
              >
                {sizes.map((sz) => {
                  const isAvailable = isProductSizeAvailable(product, sz);
                  const isSelected = selectedSize === sz;

                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isAvailable) {
                          onNotify && onNotify('info', 'Out of Stock ⚠️', `Size ${sz} is currently out of stock.`);
                          return;
                        }
                        setSelectedSize(sz);
                        setShowSizeWarning(false);
                        if (quantity > 0 && onUpdateSize) {
                          onUpdateSize(product.id, sz);
                        }
                      }}
                      title={
                        !isAvailable 
                          ? `Size ${sz} (Out of Stock)` 
                          : isSelected 
                          ? `Size ${sz} (Selected)` 
                          : `Select Size ${sz}`
                      }
                      className={`relative text-[10px] xs:text-[11px] font-sans font-bold px-2 xs:px-2.5 py-0.5 xs:py-1 rounded-lg transition-all duration-200 overflow-hidden cursor-pointer ${
                        !isAvailable
                          ? 'text-[#86868B] bg-black/[0.03] border border-dashed border-black/15 cursor-not-allowed opacity-45'
                          : isSelected
                          ? 'text-white bg-[#1D1D1F] shadow-sm border border-[#1D1D1F] scale-105'
                          : 'text-[#1D1D1F] bg-[#F5F5F7] hover:bg-[#E8E8ED] border border-black/[0.08] active:scale-95'
                      }`}
                    >
                      <span className={!isAvailable ? 'opacity-40' : ''}>{sz}</span>
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
                            strokeWidth="1.8"
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

          {/* Color Swatch Options (if available) */}
          {colors.length > 0 && (
            <div className="mt-2 pt-1 border-t border-black/[0.04]">
              <div className="flex items-center mb-1 px-0.5">
                <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                  Color
                </span>
              </div>

              <div 
                className="flex items-center gap-1.5 flex-wrap p-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                {colors.map((col) => {
                  const isSelected = (selectedColor || '').toLowerCase() === col.name.toLowerCase();
                  return (
                    <button
                      key={col.name}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedColor(col.name);
                        setShowColorWarning(false);
                      }}
                      title={`Color: ${col.name}`}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1D1D1F] text-white shadow-xs ring-1 ring-[#1D1D1F] scale-105'
                          : 'bg-[#F5F5F7] text-[#555555] hover:bg-[#E8E8ED] hover:text-[#1D1D1F] border border-black/5'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span className="uppercase text-[9px]">{col.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-black/[0.05]">
          <div className="flex items-baseline justify-between gap-1 mb-2.5">
            <div className="flex items-baseline gap-1 xs:gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-sans text-xs xs:text-sm sm:text-base lg:text-lg font-bold text-[#1D1D1F]">
                {formatPrice(product.price, STORE_CONFIG.currency)}
              </span>
              {product.oldPrice && (
                <span className="text-[9px] xs:text-[10px] sm:text-xs font-sans text-[#86868B] line-through">
                  {formatPrice(product.oldPrice, STORE_CONFIG.currency)}
                </span>
              )}
            </div>

            {product.discountPercent && (
              <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-sans font-bold text-[#34C759] bg-[#34C759]/10 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Action Row: Add to Cart / Stepper / Out of Stock */}
          <div className="relative flex items-center gap-1.5 sm:gap-2" onClick={(e) => e.stopPropagation()}>
            {isOutOfStock ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWhatsAppInquiry && onWhatsAppInquiry(product);
                }}
                className="w-full py-2 sm:py-2.5 px-2 xs:px-2.5 sm:px-3 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] text-[10px] xs:text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-black/[0.06] shadow-xs"
                title="Out of Stock - Click to inquire"
              >
                <span>Out of Stock</span>
              </button>
            ) : quantity === 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (sizes.length > 0 && !selectedSize) {
                    setShowSizeWarning(true);
                    setTimeout(() => setShowSizeWarning(false), 3500);
                    onNotify && onNotify('error', 'Select Size First ⚠️', `Please select a size for ${product.name} before adding to cart.`);
                    return;
                  }
                  if (colors.length > 0 && !selectedColor) {
                    setShowColorWarning(true);
                    setTimeout(() => setShowColorWarning(false), 3500);
                    onNotify && onNotify('error', 'Select Color First ⚠️', `Please select a color for ${product.name} before adding to cart.`);
                    return;
                  }
                  onAddToCart && onAddToCart({
                    ...product,
                    selectedColor: selectedColor || (colors.length === 1 ? colors[0].name : ''),
                    selectedSize,
                    selectedVariant: [selectedColor, selectedSize].filter(Boolean).join(' / ') || selectedSize || selectedColor || '',
                  });
                }}
                className="w-full py-2 sm:py-2.5 px-2 xs:px-2.5 sm:px-4 rounded-full bg-[#1D1D1F] hover:bg-black text-white font-medium text-[10px] xs:text-[11px] sm:text-xs font-sans tracking-wide flex items-center justify-center gap-1 sm:gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Add to Cart</span>
              </button>
            ) : (
              /* Inline Animated Quantity Stepper */
              <div className="w-full flex items-center justify-between bg-[#F5F5F7] border border-black/[0.05] rounded-full p-0.5 sm:p-1 shadow-xs">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateQuantity && onUpdateQuantity(product.id, quantity - 1);
                  }}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white text-[#1D1D1F] hover:bg-black/5 flex items-center justify-center shadow-xs transition-colors cursor-pointer shrink-0"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>

                <motion.span 
                  key={quantity}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-[11px] sm:text-xs font-sans font-bold text-[#1D1D1F] px-1 sm:px-2"
                >
                  {quantity}
                </motion.span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const maxStock = typeof product.stockCount === 'number' ? Math.max(0, product.stockCount) : 99;
                    if (quantity >= maxStock) {
                      onNotify && onNotify('info', 'Stock Limit Reached ⚠️', `Only ${maxStock} unit${maxStock === 1 ? '' : 's'} available in stock.`);
                      return;
                    }
                    if (sizes.length > 0 && !selectedSize) {
                      setShowSizeWarning(true);
                      setTimeout(() => setShowSizeWarning(false), 3500);
                      onNotify && onNotify('error', 'Select Size First ⚠️', `Please select a size for ${product.name} before updating quantity.`);
                      return;
                    }
                    if (colors.length > 0 && !selectedColor) {
                      setShowColorWarning(true);
                      setTimeout(() => setShowColorWarning(false), 3500);
                      onNotify && onNotify('error', 'Select Color First ⚠️', `Please select a color for ${product.name} before updating quantity.`);
                      return;
                    }
                    onUpdateQuantity && onUpdateQuantity(product.id, quantity + 1);
                  }}
                  disabled={typeof product.stockCount === 'number' && quantity >= product.stockCount}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#1D1D1F] text-white hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-xs transition-colors cursor-pointer shrink-0"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export const ProductCard = ProductCardComponent;
export default ProductCardComponent;
