import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { ProductCard } from './ProductCard';
import { createProductWhatsAppUrl } from '../utils/whatsapp';

export const PopularProducts = ({ 
  cartItems = {},
  wishlist = {},
  onAddToCart, 
  onUpdateQuantity,
  onToggleFavorite, 
  onViewAllClick,
  onQuickView,
}) => {
  const { homePopularProducts, storeConfig } = useCatalog();

  const handleWhatsApp = (product) => {
    const url = createProductWhatsAppUrl(product, storeConfig.whatsappNumber);
    window.open(url, '_blank');
  };

  return (
    <section className="py-6 sm:py-10" aria-labelledby="popular-products-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (Matches Reference Screen 1) */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 
            id="popular-products-heading" 
            className="text-lg sm:text-xl font-extrabold text-[#171717] tracking-tight"
          >
            New Arrival
          </h2>

          <button
            onClick={onViewAllClick}
            className="text-xs sm:text-sm font-bold text-[#709E1E] hover:text-[#5A8015] transition-colors focus:outline-none flex items-center gap-1"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Cards Grid: 2-col on mobile, 4-col on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {homePopularProducts.map((product) => {
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
