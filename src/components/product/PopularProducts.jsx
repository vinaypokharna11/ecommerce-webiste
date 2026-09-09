'use client';

import React, { useMemo } from 'react';
import { useCatalog } from '@/context/CatalogContext';
import { ProductCard } from './ProductCard';
import { createProductWhatsAppUrl } from '@/utils/whatsapp';
import { ArrowRight } from 'lucide-react';

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
  const { products, storeConfig } = useCatalog();

  const handleWhatsApp = (product) => {
    const url = createProductWhatsAppUrl(product, storeConfig?.whatsappNumber);
    window.open(url, '_blank');
  };

  // Filter products based on selected home category
  const displayProducts = useMemo(() => {
    const allProducts = products || [];
    if (!selectedCategory || selectedCategory === 'all') {
      return allProducts;
    }
    const filtered = allProducts.filter(
      (p) => p.category === selectedCategory || p.categoryName?.toLowerCase() === selectedCategory.toLowerCase()
    );
    return filtered.length > 0 ? filtered : allProducts;
  }, [selectedCategory, products]);

  return (
    <section 
      id="popular-products" 
      data-testid="popular-products" 
      className="py-12 sm:py-20 lg:py-24 bg-white border-t border-black/[0.05]" 
      aria-label="Products"
    >
      <div className="w-full max-w-[1440px] mx-auto px-3.5 sm:px-8 lg:px-12">
        
        {/* Apple Style Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-10">
          <div className="space-y-1.5 sm:space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1D1D1F] font-sans">
              Popular Everyday Products
            </h2>
            <p className="text-xs sm:text-sm text-[#6E6E73] font-normal max-w-lg">
              Top-rated bags, luggage, gourmet delicacies, jewelry, and lifestyle essentials.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {selectedCategory !== 'all' && (
              <button
                onClick={onResetCategory}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-[#F5F5F7] text-[#1D1D1F] border border-black/[0.06] text-xs font-semibold hover:bg-[#E8E8ED] transition-all cursor-pointer"
              >
                <span>Clear Filter</span>
              </button>
            )}
            <button
              onClick={onViewAllClick}
              className="btn-apple-primary px-4 sm:px-5 py-2 sm:py-2.5 text-xs cursor-pointer"
            >
              <span>View All Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Product Cards Grid: responsive 4 columns */}
        {displayProducts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#F5F5F7] rounded-3xl border border-black/[0.05] max-w-md mx-auto">
            <p className="text-sm font-bold text-[#1D1D1F]">New products arriving shortly</p>
            <p className="text-xs text-[#6E6E73] mt-1">Our catalog is being updated with fresh arrivals across all categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {displayProducts.slice(0, 8).map((product) => {
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
        )}

      </div>
    </section>
  );
};

export default PopularProducts;
