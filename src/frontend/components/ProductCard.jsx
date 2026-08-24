import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, ShoppingCart, Plus, Minus, MessageCircle, Eye } from 'lucide-react';
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
  onInquire
}) => {
  const isOutOfStock = product.stockStatus === 'out_of_stock';
  const isLowStock = product.stockStatus === 'low_stock';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35 }}
      className={`group relative bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-[#EAE6FD] shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between cursor-pointer ${
        isOutOfStock ? 'opacity-75' : 'hover:-translate-y-1'
      }`}
      onClick={() => onQuickView(product)}
    >
      {/* Top Image Container */}
      <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#F8F7FD] via-[#FAF9FF] to-[#FFF0FB] p-3 sm:p-4 flex items-center justify-center overflow-hidden mb-3">
        
        {/* Badges Container */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          {product.badge && (
            <span className="inline-block px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide bg-white/90 backdrop-blur-md text-[#6257FF] border border-[#EAE6FD] shadow-sm">
              {product.badge}
            </span>
          )}
          {isLowStock && (
            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
              Only {product.stockCount} left
            </span>
          )}
        </div>

        {/* Favorite Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-md border border-white/80 flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-all duration-200"
          aria-label={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${
              isFavorite 
                ? 'text-[#EC5AC8] fill-[#EC5AC8]' 
                : 'text-[#626276] hover:text-[#EC5AC8]'
            }`} 
          />
        </button>

        {/* Product Image */}
        <div className="w-full h-full flex items-center justify-center p-1">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain rounded-lg transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-15">
            <span className="px-3 py-1 rounded-full bg-[#15152A] text-white font-bold text-xs shadow-md">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick View Pill (Desktop Hover) */}
        <div className="absolute bottom-2.5 inset-x-3 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#15152A] text-xs font-semibold shadow-md border border-[#EAE6FD]">
            <Eye className="w-3.5 h-3.5 text-[#6257FF]" />
            <span>Quick View</span>
          </span>
        </div>

      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Category Tag */}
          <span className="text-[11px] font-semibold text-[#8B5CF6] uppercase tracking-wider block mb-1">
            {product.categoryName}
          </span>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-bold text-[#15152A] group-hover:text-brand-purple transition-colors line-clamp-2 leading-snug mb-1.5">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-bold text-[#15152A]">
              {product.rating}
            </span>
            <span className="text-[11px] text-[#8E8EA0]">
              ({product.reviews})
            </span>
          </div>
        </div>

        {/* Price & Cart Stepper Container */}
        <div className="pt-2 border-t border-[#F1EFFF]/80">
          <div className="flex items-baseline justify-between gap-1 mb-3">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-extrabold text-[#15152A]">
                {STORE_CONFIG.currency}{product.price.toLocaleString()}
              </span>
              {product.oldPrice && (
                <span className="text-[11px] sm:text-xs font-medium text-[#A0A0B2] line-through">
                  {STORE_CONFIG.currency}{product.oldPrice.toLocaleString()}
                </span>
              )}
            </div>

            {product.discountPercent && (
              <span className="text-[10px] sm:text-[11px] font-bold text-[#EC5AC8] bg-[#FFF0FB] px-1.5 py-0.5 rounded-md">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Action Row: Add to Cart / Quantity Stepper + WhatsApp Icon */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {isOutOfStock ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWhatsAppInquiry(product);
                }}
                className="w-full py-2 px-3 rounded-xl bg-[#F5F3FF] text-[#6257FF] hover:bg-[#EDE9FE] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Notify on WhatsApp</span>
              </button>
            ) : quantity === 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                className="w-full py-2 sm:py-2.5 px-3 rounded-xl gradient-btn-primary text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all duration-200"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </button>
            ) : (
              /* Inline Animated Quantity Stepper */
              <div className="w-full flex items-center justify-between bg-[#F5F3FF] border border-[#EAE6FD] rounded-xl p-1 shadow-sm">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateQuantity(product.id, quantity - 1);
                  }}
                  className="w-7 h-7 rounded-lg bg-white text-[#15152A] hover:bg-purple-100 flex items-center justify-center shadow-xs transition-colors active:scale-90"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5 text-[#6257FF]" />
                </button>

                <motion.span 
                  key={quantity}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-xs font-bold text-[#15152A] px-2"
                >
                  {quantity}
                </motion.span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateQuantity(product.id, quantity + 1);
                  }}
                  className="w-7 h-7 rounded-lg bg-[#6257FF] text-white hover:bg-[#4F46E5] flex items-center justify-center shadow-xs transition-colors active:scale-90"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick WhatsApp Inquiry button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWhatsAppInquiry(product);
              }}
              className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-100 flex-shrink-0"
              title="Inquire on WhatsApp"
              aria-label="Ask about this product on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-600/20" />
            </button>
          </div>

        </div>

      </div>
    </motion.article>
  );
};
