'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingBag, Plus, Minus, MessageCircle, Eye } from 'lucide-react';
import Image from 'next/image';
import { STORE_CONFIG } from '../data/mockData';

export const ProductCard = ({ 
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
  const isLowStock = product.stockStatus === 'low_stock';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`group relative bg-white rounded-[26px] p-3 sm:p-4 border border-black/[0.04] shadow-neu-card hover:shadow-neu-card-hover transition-all duration-300 flex flex-col justify-between cursor-pointer ${
        isOutOfStock ? 'opacity-75' : 'hover:-translate-y-1'
      }`}
      onClick={() => onQuickView(product)}
    >
      {/* Top Image Container - Full Size Edge-to-Edge with no grey container */}
      <div className="relative aspect-square w-full rounded-[22px] overflow-hidden mb-3 bg-transparent flex items-center justify-center">
        
        {/* Optional Badge */}
        {product.badge && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide bg-white/95 backdrop-blur-md text-[#171717] shadow-sm border border-black/5">
              {product.badge}
            </span>
          </div>
        )}

        {/* Favorite Wishlist Button (Glass Pill on top-right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product);
          }}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-white/80 flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-all duration-200 cursor-pointer"
          aria-label={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${
              isFavorite 
                ? 'text-red-500 fill-red-500 stroke-red-500' 
                : 'text-[#171717] hover:text-red-500'
            }`} 
          />
        </button>

        {/* Product Image with smooth hover scale */}
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover rounded-[22px] transition-transform duration-500 group-hover:scale-108"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-15">
            <span className="px-3 py-1 rounded-full bg-[#171717] text-white font-bold text-xs shadow-md">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick View Pill (Desktop Hover) */}
        <div className="absolute bottom-2.5 inset-x-3 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#171717] text-xs font-bold shadow-sm border border-black/5">
            <Eye className="w-3.5 h-3.5 text-[#709E1E]" />
            <span>Details</span>
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Category Tag */}
          <span className="text-[11px] font-semibold text-[#777777] tracking-wider block mb-0.5">
            {product.categoryName || 'Product'}
          </span>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-bold text-[#171717] line-clamp-1 mb-1 leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center text-[#9FD842]">
              <Star className="w-3.5 h-3.5 fill-[#9FD842]" />
            </div>
            <span className="text-xs font-bold text-[#171717]">
              {product.rating || '4.8'}
            </span>
            <span className="text-[11px] text-[#A0A0A0]">
              ({product.reviews || 95})
            </span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-black/[0.04]">
          <div className="flex items-baseline justify-between gap-1 mb-2.5">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-extrabold text-[#171717]">
                {STORE_CONFIG.currency}{product.price.toLocaleString()}
              </span>
              {product.oldPrice && (
                <span className="text-[11px] font-medium text-[#A0A0A0] line-through">
                  {STORE_CONFIG.currency}{product.oldPrice.toLocaleString()}
                </span>
              )}
            </div>

            {product.discountPercent && (
              <span className="text-[10px] font-bold text-[#709E1E] bg-[#F3FCDA] px-1.5 py-0.5 rounded-full">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Action Row: Add to Cart / Stepper */}
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {isOutOfStock ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWhatsAppInquiry(product);
                }}
                className="w-full py-2 px-3 rounded-full bg-[#EEEEEC] text-[#171717] hover:bg-[#E2E2DE] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Notify Me</span>
              </button>
            ) : quantity === 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                className="w-full py-2 px-3 rounded-full bg-[#9FD842] hover:bg-[#8EC731] text-[#171717] font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all duration-200"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </button>
            ) : (
              /* Inline Animated Quantity Stepper */
              <div className="w-full flex items-center justify-between bg-[#EEEEEC] rounded-full p-1 shadow-inner">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateQuantity(product.id, quantity - 1);
                  }}
                  className="w-6 h-6 rounded-full bg-white text-[#171717] hover:bg-[#F5F5F3] flex items-center justify-center shadow-xs transition-colors active:scale-90"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3 text-[#171717]" />
                </button>

                <motion.span 
                  key={quantity}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-xs font-bold text-[#171717] px-2"
                >
                  {quantity}
                </motion.span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateQuantity(product.id, quantity + 1);
                  }}
                  className="w-6 h-6 rounded-full bg-[#9FD842] text-[#171717] hover:bg-[#8EC731] flex items-center justify-center shadow-xs transition-colors active:scale-90"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3 text-[#171717]" />
                </button>
              </div>
            )}

            {/* Quick WhatsApp Inquiry Icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWhatsAppInquiry(product);
              }}
              className="p-2 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-100/60 shrink-0"
              title="Ask on WhatsApp"
              aria-label="Ask about this product on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-emerald-600/20" />
            </button>
          </div>

        </div>

      </div>
    </motion.article>
  );
};
