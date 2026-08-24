import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingCart, Check, ChevronRight, Eye, MessageCircle } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { createProductWhatsAppUrl } from '../utils/whatsapp';

export const PopularProducts = ({ 
  wishlist = {},
  onAddToCart, 
  onToggleFavorite, 
  onViewAllClick,
  onQuickView,
  onInquire
}) => {
  const { homePopularProducts, storeConfig } = useCatalog();
  const [addedItems, setAddedItems] = useState({});

  const handleFavorite = (productId, e) => {
    e.stopPropagation();
    onToggleFavorite(productId);
  };

  const handleAdd = (product, e) => {
    e.stopPropagation();
    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    onAddToCart(product);

    // Reset "Added" feedback after 2 seconds
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  const handleWhatsApp = (product, e) => {
    e.stopPropagation();
    const url = createProductWhatsAppUrl(product, storeConfig.whatsappNumber);
    window.open(url, '_blank');
  };

  return (
    <section className="py-10 sm:py-16" aria-labelledby="popular-products-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div>
            <h2 
              id="popular-products-heading" 
              className="text-2xl sm:text-3xl font-extrabold text-[#15152A] tracking-tight"
            >
              Popular Products
            </h2>
          </div>

          <button
            onClick={onViewAllClick}
            className="group inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-[#6257FF] hover:text-[#4F46E5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple rounded-lg px-2 py-1"
          >
            <span>View all</span>
            <ChevronRight className="w-4 h-4 transition-transform duration-250 group-hover:translate-x-1" />
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-7">
          {homePopularProducts.map((product, index) => {
            const isFav = !!wishlist[product.id];
            const isAdded = !!addedItems[product.id];

            return (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => onQuickView && onQuickView(product)}
                className="group relative bg-white rounded-3xl p-4 border border-[#EAE6FD] shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer"
              >
                {/* Top Image Container */}
                <div className="relative aspect-square w-full rounded-2xl bg-gradient-to-br from-[#F5F3FF] via-[#FAF9FF] to-[#FFF0FB] p-5 flex items-center justify-center overflow-hidden mb-4 transition-colors duration-300">
                  
                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide bg-white/90 backdrop-blur-sm text-[#6257FF] border border-[#EAE6FD] shadow-sm">
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* Favorite Heart Button */}
                  <button
                    onClick={(e) => handleFavorite(product.id, e)}
                    className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-white flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                    aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <motion.div
                      animate={isFav ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Heart 
                        className={`w-4 h-4 transition-colors ${
                          isFav 
                            ? 'text-[#EC5AC8] fill-[#EC5AC8]' 
                            : 'text-[#626276] hover:text-[#EC5AC8]'
                        }`} 
                      />
                    </motion.div>
                  </button>

                  {/* Product Image */}
                  <div className="w-full h-full flex items-center justify-center p-2">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-108 group-hover:rotate-1 drop-shadow-[0_8px_20px_rgba(98,87,255,0.12)]"
                      loading="lazy"
                    />
                  </div>

                  {/* Quick View Pill (Desktop Hover) */}
                  <div className="absolute bottom-3 inset-x-3 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#15152A] text-xs font-semibold shadow-md border border-[#EAE6FD]">
                      <Eye className="w-3.5 h-3.5 text-[#6257FF]" />
                      <span>Quick View</span>
                    </span>
                  </div>

                </div>

                {/* Bottom Details Container */}
                <div className="px-1 pt-1">
                  {/* Category Tag */}
                  <span className="text-[11px] font-semibold text-[#8B5CF6] uppercase tracking-wider block mb-1">
                    {product.categoryName}
                  </span>

                  {/* Product Title */}
                  <h3 className="text-sm sm:text-base font-bold text-[#15152A] group-hover:text-brand-purple transition-colors mb-2 line-clamp-1">
                    {product.name}
                  </h3>

                  {/* Price & Rating Row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-base sm:text-lg font-extrabold text-[#15152A]">
                        {storeConfig.currency}{product.price.toLocaleString()}
                      </span>
                      {product.oldPrice && (
                        <span className="text-xs font-medium text-[#A0A0B2] line-through">
                          {storeConfig.currency}{product.oldPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 bg-[#FAF9FF] px-2 py-0.5 rounded-full border border-[#EAE6FD]">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-[#15152A]">
                        {product.rating}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleAdd(product, e)}
                      disabled={isAdded}
                      className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 ${
                        isAdded
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'gradient-btn-primary text-white shadow-btn'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added ✓</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => handleWhatsApp(product, e)}
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-100 flex-shrink-0"
                      title="Ask on WhatsApp"
                      aria-label="Ask about this product on WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4 fill-emerald-600/20" />
                    </button>
                  </div>

                </div>

              </motion.article>
            );
          })}
        </div>

      </div>
    </section>
  );
};
