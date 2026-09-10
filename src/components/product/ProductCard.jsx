'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingBag, Plus, Minus, MessageCircle, Eye } from 'lucide-react';
import Image from 'next/image';
import { STORE_CONFIG } from '@/data/mockData';
import { formatPrice } from '@/utils/formatPrice';
import { getProductSizes } from '@/utils/productOptions';

export const ProductCardComponent = ({ 
  product, 
  quantity = 0, 
  isFavorite = false,
  onAddToCart, 
  onUpdateQuantity, 
  onToggleFavorite, 
  onQuickView,
  onWhatsAppInquiry,
}) => {
  const isOutOfStock = product.stockStatus === 'out_of_stock';
  const sizes = getProductSizes(product);

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`group relative bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-5 border border-black/[0.06] shadow-[0_2px_14px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between cursor-pointer ${
        isOutOfStock ? 'opacity-70' : 'hover:-translate-y-1'
      }`}
      onClick={() => onQuickView && onQuickView(product)}
    >
      {/* Product Image Area with Apple Soft Background */}
      <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden mb-2.5 sm:mb-3.5 bg-[#F5F5F7] flex items-center justify-center">
        {/* Optional Badge */}
        {product.badge && (
          <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 z-10">
            <span className="inline-block px-2.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[11px] sm:text-[10px] font-sans font-bold tracking-wide bg-[#1D1D1F] text-white shadow-xs">
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

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-15">
            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#1D1D1F] text-white text-[10px] sm:text-xs font-semibold shadow-sm">
              Out of Stock
            </span>
          </div>
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

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2 text-xs">
            <div className="flex items-center text-[#FF9500]">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
            </div>
            <span className="font-sans font-semibold text-[#1D1D1F] text-[11px] sm:text-xs">
              {product.rating || '4.8'}
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#86868B]">
              ({product.reviews || 80})
            </span>
          </div>

          {/* Sizes Preview (Clothing & Shoes Only) */}
          {sizes.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap mb-2">
              {sizes.slice(0, 4).map((sz) => (
                <span
                  key={sz}
                  className="text-[10px] font-sans font-medium px-1.5 py-0.5 rounded text-[#1D1D1F] bg-[#F5F5F7] border border-black/[0.04]"
                >
                  {sz}
                </span>
              ))}
              {sizes.length > 4 && (
                <span className="text-[9px] text-[#86868B] font-semibold">+{sizes.length - 4}</span>
              )}
            </div>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-black/[0.05]">
          <div className="flex items-baseline justify-between gap-1 mb-2.5">
            <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-sans text-sm sm:text-base lg:text-lg font-bold text-[#1D1D1F]">
                {formatPrice(product.price, STORE_CONFIG.currency)}
              </span>
              {product.oldPrice && (
                <span className="text-[10px] sm:text-xs font-sans text-[#86868B] line-through">
                  {formatPrice(product.oldPrice, STORE_CONFIG.currency)}
                </span>
              )}
            </div>

            {product.discountPercent && (
              <span className="text-[9px] sm:text-[10px] font-sans font-bold text-[#34C759] bg-[#34C759]/10 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Action Row: Add to Cart / Stepper / WhatsApp */}
          <div className="flex items-center gap-1.5 sm:gap-2" onClick={(e) => e.stopPropagation()}>
            {isOutOfStock ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWhatsAppInquiry && onWhatsAppInquiry(product);
                }}
                className="w-full py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Notify Me</span>
              </button>
            ) : quantity === 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart && onAddToCart(product);
                }}
                className="w-full py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-full bg-[#1D1D1F] hover:bg-black text-white font-medium text-[11px] sm:text-xs font-sans tracking-wide flex items-center justify-center gap-1.5 sm:gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
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
                    onUpdateQuantity && onUpdateQuantity(product.id, quantity + 1);
                  }}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#1D1D1F] text-white hover:bg-black flex items-center justify-center shadow-xs transition-colors cursor-pointer shrink-0"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </div>
            )}

            {/* Quick WhatsApp Inquiry Icon */}
            {onWhatsAppInquiry && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWhatsAppInquiry(product);
                }}
                className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full bg-[#F5F5F7] hover:bg-[#25D366]/15 text-[#86868B] hover:text-[#25D366] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Inquire on WhatsApp"
                title="Inquire on WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export const ProductCard = ProductCardComponent;
export default ProductCardComponent;
