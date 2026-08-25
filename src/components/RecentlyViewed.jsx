'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ShoppingBag, Eye, Star, Heart, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { STORE_CONFIG } from '../data/mockData';

export const RecentlyViewed = ({
  products = [],
  recentlyViewedIds = [],
  wishlist = {},
  onAddToCart,
  onQuickView,
  onToggleFavorite,
  onExploreCatalog,
}) => {
  // If there are tracked recently viewed products, prioritize them, else show top recommendations
  const viewedList = recentlyViewedIds.length > 0
    ? recentlyViewedIds
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean)
    : products.slice(0, 4);

  if (!viewedList || viewedList.length === 0) return null;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEEEEC] text-[#171717] text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <Clock className="w-3.5 h-3.5 text-[#709E1E]" />
            <span>Recently Viewed & Recommended</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#171717] tracking-tight">
            Jump Back Into What You Liked
          </h2>
        </div>

        <button
          onClick={onExploreCatalog}
          className="self-start sm:self-auto text-xs font-bold text-[#171717] hover:text-[#709E1E] flex items-center gap-1 transition-colors"
        >
          <span>View All in Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Recently Viewed */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {viewedList.map((product) => {
          const isFav = !!wishlist[product.id];

          return (
            <motion.div
              key={product.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[24px] border border-black/5 shadow-neu-card p-3 sm:p-4 flex flex-col justify-between group"
            >
              <div>
                {/* Image Box */}
                <div className="relative w-full aspect-square rounded-[20px] bg-[#EEEEEC] overflow-hidden mb-3">
                  <Image
                    src={product.image || '/assets/images/prod_headphones.jpg'}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Favorite Toggle */}
                  <button
                    onClick={() => onToggleFavorite && onToggleFavorite(product)}
                    className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isFav
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'bg-white/85 backdrop-blur-sm text-[#777777] hover:text-rose-500 shadow-sm'
                    }`}
                    aria-label="Save to Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </button>

                  {/* Quick View Overlay on hover */}
                  <button
                    onClick={() => onQuickView && onQuickView(product)}
                    className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-[#171717]/85 backdrop-blur-sm text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 shadow-md whitespace-nowrap"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Quick View</span>
                  </button>
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider block">
                    {product.categoryName || 'Jewelry'}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-[#171717] line-clamp-1 group-hover:text-[#709E1E] transition-colors">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-1 text-[11px] text-[#A0A0A0]">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-[#171717]">{product.rating || '4.8'}</span>
                    <span>({product.reviews || '45'})</span>
                  </div>
                </div>
              </div>

              {/* Price & Add to Bag */}
              <div className="pt-3 mt-2 border-t border-black/5 flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs sm:text-sm font-extrabold text-[#171717]">
                    {STORE_CONFIG.currency}{(product.price || 0).toLocaleString()}
                  </span>
                  {product.oldPrice && (
                    <span className="text-[10px] text-[#A0A0A0] line-through block">
                      {STORE_CONFIG.currency}{product.oldPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onAddToCart && onAddToCart(product)}
                  className="w-8 h-8 rounded-full bg-[#9FD842] hover:bg-[#8EC731] text-[#171717] flex items-center justify-center font-bold shadow-sm active:scale-95 transition-all"
                  title="Add to Bag"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
