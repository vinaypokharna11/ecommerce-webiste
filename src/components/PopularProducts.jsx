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
