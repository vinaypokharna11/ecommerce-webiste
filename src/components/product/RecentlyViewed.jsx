'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye, Star, Heart, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { STORE_CONFIG } from '@/data/mockData';
import { formatPrice } from '@/utils/formatPrice';
import { getProductSizes } from '@/utils/productOptions';

export const RecentlyViewed = ({
  products = [],
  recentlyViewedIds = [],
  wishlist = {},
  onAddToCart,
  onQuickView,
  onToggleFavorite,
  onExploreCatalog,
}) => {
  const viewedList = recentlyViewedIds.length > 0
    ? recentlyViewedIds
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean)
    : products.slice(0, 4);

  if (!viewedList || viewedList.length === 0) return null;

  return (
    <section className="py-10 sm:py-16 px-3.5 sm:px-8 lg:px-12 w-full max-w-[1440px] mx-auto bg-[#FBFBFD] border-t border-black/[0.05]">
      {/* Apple Style Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] font-sans">
            Jump Back Into What You Liked
          </h2>
        </div>

        <button
          onClick={onExploreCatalog}
          className="self-start sm:self-auto text-xs sm:text-sm font-semibold text-[#0071E3] hover:text-[#0077ED] flex items-center gap-1.5 transition-colors group cursor-pointer"
        >
          <span>View All in Catalog</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
        {viewedList.map((product) => {
          const isFav = !!wishlist[product.id];

          return (
            <motion.div
              key={product.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="apple-card p-3 sm:p-4 rounded-2xl sm:rounded-3xl flex flex-col justify-between group cursor-pointer"
              onClick={() => onQuickView && onQuickView(product)}
            >
              <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#F5F5F7] mb-2 sm:mb-3">
                {product.image && (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-106 transition-transform duration-500"
                  />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite && onToggleFavorite(product);
                  }}
                  className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                    isFav ? 'bg-rose-50 text-rose-500' : 'bg-white/80 text-[#86868B]'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" fill={isFav ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#86868B] block mb-0.5 sm:mb-1 truncate">
                  {product.categoryName || 'Product'}
                </span>
                <h3 className="text-xs sm:text-sm font-semibold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors line-clamp-1 mb-1.5 sm:mb-2 leading-snug">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between pt-2 border-t border-black/[0.05]">
                  <span className="text-[11px] sm:text-sm font-bold text-[#1D1D1F]">
                    {formatPrice(product.price, STORE_CONFIG.currency)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const sizes = getProductSizes(product);
                      if (sizes.length > 0) {
                        onQuickView && onQuickView(product);
                        return;
                      }
                      onAddToCart && onAddToCart(product);
                    }}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer shrink-0"
                    title={getProductSizes(product).length > 0 ? "Select Size in Quick View" : "Add to Cart"}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default RecentlyViewed;
