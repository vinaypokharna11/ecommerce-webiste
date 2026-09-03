'use client';

import React, { useMemo } from 'react';
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
    <section className="py-6 sm:py-10" aria-label="Products">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        
        {/* Product Cards Grid: responsive full width */}
        {displayProducts.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white/80 backdrop-blur-sm rounded-[28px] border border-black/5 max-w-md mx-auto">
            <p className="text-sm font-bold text-[#171717]">New collection arriving soon</p>
            <p className="text-xs text-[#777777] mt-1">Our catalog is currently being updated. Inquire via WhatsApp for custom imitation jewelry!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-6 gsap-stagger-cards">
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
        )}
      </div>
    </section>
  );
};
