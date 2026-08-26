'use client';

import React, { useMemo } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { ProductCard } from './ProductCard';
import { createProductWhatsAppUrl } from '../utils/whatsapp';

export const PopularProducts = ({ 
  cartItems = {},
  wishlist = {},
  selectedCategory = 'all',
  onResetCategory,
  onAddToCart, 
  onUpdateQuantity,
  onToggleFavorite, 
  onViewAllClick,
  onQuickView,
}) => {
  const { homePopularProducts, products, storeConfig } = useCatalog();

  const handleWhatsApp = (product) => {
    const url = createProductWhatsAppUrl(product, storeConfig.whatsappNumber);
    window.open(url, '_blank');
  };

  // Filter products based on selected home category
  const displayProducts = useMemo(() => {
    const allProducts = (products && products.length > 0) ? products : (homePopularProducts || []);
    if (!selectedCategory || selectedCategory === 'all') {
      return allProducts.slice(0, 12);
    }
    const filtered = allProducts.filter(
      (p) => p.category === selectedCategory || p.categoryName?.toLowerCase() === selectedCategory.toLowerCase()
    );
    return filtered.length > 0 ? filtered : allProducts.slice(0, 12);
  }, [selectedCategory, homePopularProducts, products]);

  return (
    <section className="py-6 sm:py-10" aria-labelledby="popular-products-heading">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <h2 
              id="popular-products-heading" 
              className="text-lg sm:text-xl font-extrabold text-[#171717] tracking-tight"
            >
              {selectedCategory && selectedCategory !== 'all' ? 'Category Products' : 'New Arrival'}
            </h2>
            {selectedCategory && selectedCategory !== 'all' && (
              <button
                onClick={onResetCategory}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EEEEEC] hover:bg-[#E2E2DE] text-[#171717] text-xs font-semibold transition-colors"
                title="Reset filter"
              >
                <span>Clear filter</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={onViewAllClick}
            className="text-xs sm:text-sm font-bold text-[#709E1E] hover:text-[#5A8015] transition-colors focus:outline-none flex items-center gap-1 cursor-pointer"
          >
            <span>Explore full catalog</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Cards Grid: responsive full width */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-6">
          {displayProducts.map((product) => {
            const quantity = cartItems[product.id]?.quantity || 0;
            const isFav = !!wishlist[product.id];

            return (
              <ProductCard
                key={product.id}
                product={product}
                quantity={quantity}
                isFavorite={isFav}
                onAddToCart={onAddToCart}
                onUpdateQuantity={onUpdateQuantity}
                onToggleFavorite={onToggleFavorite}
                onQuickView={onQuickView}
                onWhatsAppInquiry={handleWhatsApp}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
