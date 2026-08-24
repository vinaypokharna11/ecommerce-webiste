import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  ChevronDown, 
  Sparkles, 
  LayoutGrid, 
  Shirt, 
  Footprints, 
  Headphones, 
  Watch, 
  Armchair,
  Gift,
  ShoppingBag,
  Zap,
  Tag,
  Flame,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { ProductCard } from './ProductCard';
import { FilterDrawer } from './FilterDrawer';
import { QuickViewModal } from './QuickViewModal';
import { createProductWhatsAppUrl } from '../utils/whatsapp';

const iconMap = {
  LayoutGrid,
  Shirt,
  Footprints,
  Headphones,
  Watch,
  Armchair,
  Gift,
  ShoppingBag,
  Zap,
  Tag,
  Flame,
};

export const CatalogPage = ({ 
  cartItems = {}, 
  wishlist = {}, 
  initialCategory = 'all',
  onAddToCart, 
  onUpdateQuantity, 
  onToggleFavorite,
  onInquire,
  onNotify
}) => {
  const { products, storefrontCategories, storeConfig } = useCatalog();
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [sortBy, setSortBy] = useState('popular');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Advanced Filters
  const [filters, setFilters] = useState({
    category: initialCategory || 'all',
    maxPrice: 5000,
    inStockOnly: false,
    minDiscount: 0,
    minRating: 0,
  });

  useEffect(() => {
    if (initialCategory) {
      const cat = initialCategory === 'fashion' ? 'clothing' : initialCategory === 'more' ? 'all' : initialCategory;
      setSelectedCategory(cat);
      setFilters((prev) => ({ ...prev, category: cat }));
    }
  }, [initialCategory]);

  // Synchronize category selection
  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setFilters((prev) => ({ ...prev, category: catId }));
  };

  const handleUpdateFilters = (newFilters) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      if (newFilters.category !== undefined) {
        setSelectedCategory(newFilters.category);
      }
      return updated;
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setFilters({
      category: 'all',
      maxPrice: 5000,
      inStockOnly: false,
      minDiscount: 0,
      minRating: 0,
    });
  };

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesCat = product.categoryName?.toLowerCase().includes(q) || product.category?.toLowerCase().includes(q);
        const matchesTags = product.tags && product.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesCat && !matchesTags) return false;
      }

      // 2. Category Filter
      if (filters.category !== 'all') {
        if (filters.category === 'fashion') {
          if (product.category !== 'clothing' && product.category !== 'footwear' && product.category !== 'fashion') {
            return false;
          }
        } else if (product.category !== filters.category) {
          return false;
        }
      }

      // 3. Price Filter
      if (product.price > filters.maxPrice) {
        return false;
      }

      // 4. In Stock Filter
      if (filters.inStockOnly && product.stockStatus === 'out_of_stock') {
        return false;
      }

      // 5. Discount Filter
      if (filters.minDiscount > 0 && (!product.discountPercent || product.discountPercent < filters.minDiscount)) {
        return false;
      }

      // 6. Rating Filter
      if (filters.minRating > 0 && product.rating < filters.minRating) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') return (b.discountPercent || 0) - (a.discountPercent || 0);
      if (sortBy === 'newest') return b.id.localeCompare(a.id);
      // default: popular
      return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || b.rating - a.rating;
    });
  }, [products, searchQuery, filters, sortBy]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.maxPrice < 5000) count++;
    if (filters.inStockOnly) count++;
    if (filters.minDiscount > 0) count++;
    if (filters.minRating > 0) count++;
    return count;
  }, [filters]);

  const handleWhatsAppInquiry = (product) => {
    const url = createProductWhatsAppUrl(product, storeConfig.whatsappNumber);
    window.open(url, '_blank');
    onNotify('info', 'Connecting to WhatsApp', `Opening direct chat for ${product.name}`);
  };

  return (
    <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden min-h-screen">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-20 right-10 w-96 h-96 ambient-glow-purple rounded-full pointer-events-none -z-10 blur-3xl" />
      <div className="absolute top-96 -left-20 w-80 h-80 ambient-glow-pink rounded-full pointer-events-none -z-10 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. Catalog Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F3FF] border border-[#EAE6FD] shadow-xs mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#6257FF]" />
            <span className="text-xs font-bold text-[#6257FF]">
              {storeConfig.tagline}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#15152A] tracking-tight leading-tight mb-3"
          >
            Explore Our <span className="gradient-text-hero">Products</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-[#626276] leading-relaxed"
          >
            Find everything available in our local shop, all in one place. Instant inquiry and ordering on WhatsApp.
          </motion.p>
        </div>

        {/* 2. Large Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-[#8B5CF6] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, category, or tag (e.g. Shoes, Shirt, Watch)..."
              className="w-full pl-12 pr-12 py-3.5 sm:py-4 rounded-2xl sm:rounded-3xl bg-white/90 backdrop-blur-md border border-[#EAE6FD] shadow-[0_8px_30px_rgba(98,87,255,0.06)] focus:shadow-[0_12px_40px_rgba(98,87,255,0.15)] focus:border-[#8B5CF6] text-sm sm:text-base text-[#15152A] placeholder-[#8E8EA0] outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 w-7 h-7 rounded-full bg-[#FAF9FF] hover:bg-[#F1EFFF] text-[#626276] flex items-center justify-center transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* 3. Category Horizontal Pills Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 overflow-x-auto no-scrollbar pb-2"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-max sm:justify-center">
            {storefrontCategories.map((category) => {
              const Icon = iconMap[category.icon] || LayoutGrid;
              const isSelected = selectedCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 ${
                    isSelected
                      ? 'bg-[#6257FF] text-white shadow-[0_8px_20px_rgba(98,87,255,0.3)]'
                      : 'bg-white text-[#626276] hover:text-[#15152A] hover:bg-[#F5F3FF] border border-[#EAE6FD] shadow-xs'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#8B5CF6]'}`} />
                  <span>{category.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#F1EFFF] text-[#6257FF]'
                  }`}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* 4. Controls Row: Filter Button + Sort Dropdown */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[#EAE6FD]/80 flex-wrap">
          
          {/* Left: Filter Trigger Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#EAE6FD] shadow-xs hover:border-[#8B5CF6] text-xs sm:text-sm font-bold text-[#15152A] transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#6257FF]" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#EC5AC8] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Center/Right: Product Count & Sorting */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-[#626276] font-medium hidden sm:inline">
              Showing <strong className="text-[#15152A]">{filteredProducts.length}</strong> products
            </span>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2.5 rounded-2xl bg-white border border-[#EAE6FD] text-xs sm:text-sm font-bold text-[#15152A] shadow-xs focus:outline-none focus:border-[#6257FF] cursor-pointer"
              >
                <option value="popular">Sort: Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Highest Discount</option>
                <option value="rating">Top Rated</option>
                <option value="newest">New Arrivals</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#626276] pointer-events-none" />
            </div>
          </div>

        </div>

        {/* 5. Active Filter Chips */}
        {(activeFilterCount > 0 || searchQuery) && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 flex-wrap mb-6"
          >
            <span className="text-xs text-[#8E8EA0] font-semibold">Active:</span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5F3FF] text-[#6257FF] border border-[#EAE6FD]">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5F3FF] text-[#6257FF] border border-[#EAE6FD]">
                {storefrontCategories.find(c => c.id === filters.category)?.name}
                <button onClick={() => handleCategorySelect('all')} className="hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.maxPrice < 5000 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5F3FF] text-[#6257FF] border border-[#EAE6FD]">
                Under {storeConfig.currency}{filters.maxPrice.toLocaleString()}
                <button onClick={() => handleUpdateFilters({ maxPrice: 5000 })} className="hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5F3FF] text-[#6257FF] border border-[#EAE6FD]">
                In Stock Only
                <button onClick={() => handleUpdateFilters({ inStockOnly: false })} className="hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.minDiscount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF0FB] text-[#EC5AC8] border border-[#FCD6F2]">
                {filters.minDiscount}%+ OFF
                <button onClick={() => handleUpdateFilters({ minDiscount: 0 })} className="hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.minRating > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF9FF] text-[#15152A] border border-[#EAE6FD]">
                {filters.minRating}★ & above
                <button onClick={() => handleUpdateFilters({ minRating: 0 })} className="hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-[#EC5AC8] hover:underline ml-1"
            >
              Clear all
            </button>
          </motion.div>
        )}

        {/* 6. Product Grid (2 col mobile, 3 col tablet, 4 col desktop) */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {filteredProducts.map((product) => {
              const currentQty = cartItems[product.id]?.quantity || 0;
              const isFav = !!wishlist[product.id];

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={currentQty}
                  isFavorite={isFav}
                  onAddToCart={onAddToCart}
                  onUpdateQuantity={onUpdateQuantity}
                  onToggleFavorite={onToggleFavorite}
                  onQuickView={setQuickViewProduct}
                  onWhatsAppInquiry={handleWhatsAppInquiry}
                  onInquire={onInquire}
                />
              );
            })}
          </div>
        ) : (
          /* Empty Search / Filter State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-4 bg-white rounded-3xl border border-[#EAE6FD] shadow-card max-w-lg mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#6257FF] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#15152A] mb-2">
              We couldn't find that product
            </h3>
            <p className="text-sm text-[#626276] max-w-sm mx-auto mb-6">
              Try adjusting your search terms, changing categories, or clearing active filters.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl gradient-btn-primary text-white font-bold text-xs shadow-btn"
              >
                Browse All Products
              </button>
            </div>
          </motion.div>
        )}

        {/* 7. Mid-Catalog Promotional Offer Banner */}
        <div className="mt-14 sm:mt-18">
          <div className="relative overflow-hidden rounded-3xl gradient-promo-banner p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full mb-2">
                Special Store Offer
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold mb-1">
                Get up to 30% OFF on selected products
              </h3>
              <p className="text-xs sm:text-sm text-white/85">
                Visit our physical store or message us on WhatsApp to unlock exclusive discounts!
              </p>
            </div>

            <a
              href={`https://wa.me/${storeConfig.whatsappNumber}?text=${encodeURIComponent("Hi! I'd like to check today's special offers and deals.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-2xl bg-white text-[#6257FF] font-bold text-xs sm:text-sm shadow-md hover:scale-105 transition-all flex items-center gap-2 flex-shrink-0"
            >
              <span>Ask for Offer on WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>

      {/* Filter Drawer Component */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onUpdateFilters={handleUpdateFilters}
        onResetFilters={handleResetFilters}
        totalResultsCount={filteredProducts.length}
      />

      {/* Quick View Modal Component */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={onAddToCart}
        cartQuantity={quickViewProduct ? (cartItems[quickViewProduct.id]?.quantity || 0) : 0}
        onUpdateQuantity={onUpdateQuantity}
        onInquire={onInquire}
      />

    </section>
  );
};
