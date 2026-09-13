'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  ChevronDown, 
  Sparkles, 
  ShoppingBag,
} from 'lucide-react';
import { useCatalog } from '@/context/CatalogContext';
import { ProductCard } from '@/components/product/ProductCard';
import { FilterDrawer } from '@/components/product/FilterDrawer';
import { QuickViewModal } from '@/components/common/QuickViewModal';
import { createProductWhatsAppUrl } from '@/utils/whatsapp';
import { CATALOG_CATEGORIES } from '@/data/mockData';

export const CatalogPage = ({ 
  cartItems = {}, 
  wishlist = {}, 
  initialCategory = 'all',
  onAddToCart, 
  onUpdateQuantity, 
  onUpdateSize,
  onToggleFavorite, 
  onQuickView,
  onInquire, 
  onNotify 
}) => {
  const { products, storefrontCategories, storeConfig } = useCatalog();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [sortBy, setSortBy] = useState('popular');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Advanced Filters
  const [filters, setFilters] = useState({
    category: initialCategory || 'all',
    maxPrice: 15000,
    inStockOnly: false,
    minDiscount: 0,
    minRating: 0,
  });

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
      setFilters((prev) => ({ ...prev, category: initialCategory }));
    }
  }, [initialCategory]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setFilters((prev) => ({ ...prev, category: catId }));
  };

  const handleUpdateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    if (newFilters.category !== undefined) {
      setSelectedCategory(newFilters.category);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      maxPrice: 15000,
      inStockOnly: false,
      minDiscount: 0,
      minRating: 0,
    });
    setSelectedCategory('all');
    setSearchQuery('');
  };

  // Categories list to display
  const activeCategories = (storefrontCategories && storefrontCategories.length > 0)
    ? storefrontCategories
    : CATALOG_CATEGORIES;

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = product.name?.toLowerCase().includes(q);
        const matchesCategory = product.category?.toLowerCase().includes(q) || product.categoryName?.toLowerCase().includes(q);
        const matchesDesc = product.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesDesc) return false;
      }

      if (filters.category !== 'all') {
        const pCat = product.category?.toLowerCase() || '';
        const fCat = filters.category.toLowerCase();
        if (pCat !== fCat) return false;
      }

      if (product.price > filters.maxPrice) return false;
      if (filters.inStockOnly && product.stockStatus === 'out_of_stock') return false;
      if (filters.minDiscount > 0 && (!product.discountPercent || product.discountPercent < filters.minDiscount)) return false;
      if (filters.minRating > 0 && product.rating < filters.minRating) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') return (b.discountPercent || 0) - (a.discountPercent || 0);
      if (sortBy === 'newest') return (b.createdAt || b.id || '').localeCompare(a.createdAt || a.id || '');
      return 0;
    });
  }, [products, searchQuery, filters, sortBy]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.maxPrice < 15000) count++;
    if (filters.inStockOnly) count++;
    if (filters.minDiscount > 0) count++;
    if (filters.minRating > 0) count++;
    return count;
  }, [filters]);

  const handleWhatsAppInquiry = (product) => {
    const url = createProductWhatsAppUrl(product, storeConfig?.whatsappNumber);
    window.open(url, '_blank');
    if (onNotify) onNotify('info', 'Connecting to WhatsApp', `Opening direct chat for ${product.name}`);
  };

  return (
    <div className="w-full bg-[#FBFBFD] text-[#1D1D1F]">
      <section id="catalog-grid" className="relative pt-3 sm:pt-5 pb-24 overflow-hidden min-h-screen bg-[#FBFBFD]">
        <div className="w-full max-w-[1440px] mx-auto px-3.5 sm:px-8 lg:px-12">
          
          {/* Accessible Screen Reader Heading for SEO */}
          <h1 className="sr-only">
            {selectedCategory && selectedCategory !== 'all' ? `Catalog - ${selectedCategory}` : 'Storefront Product Catalog'}
          </h1>

          {/* Elevated Apple Search Bar */}
          <div id="catalog-search-bar" className="max-w-xl mx-auto mb-4 sm:mb-6">
            <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white rounded-full border border-black/[0.08] shadow-[0_2px_14px_rgba(0,0,0,0.04)] focus-within:border-[#1D1D1F] transition-all">
              <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#86868B] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bags, jewelry, papad, trolleys..."
                  className="w-full bg-transparent text-xs sm:text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none font-sans"
                />
              </div>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center transition-colors mr-1.5 cursor-pointer shrink-0"
                >
                  <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              ) : null}
              <button
                onClick={() => setIsFilterDrawerOpen(true)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] flex items-center justify-center transition-all cursor-pointer shrink-0"
                aria-label="Filter"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Category Filter Pills */}
          <div className="mb-6 sm:mb-8 overflow-x-auto no-scrollbar pb-2 touch-pan-x">
            <div className="flex items-center gap-2.5 min-w-max px-0.5">
              {activeCategories.map((category) => {
                const isSelected = selectedCategory === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`flex items-center px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-sans transition-all duration-200 cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-[#1D1D1F] text-white font-semibold shadow-xs'
                        : 'bg-white text-[#1D1D1F] hover:bg-[#F5F5F7] border border-black/[0.08]'
                    }`}
                  >
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls Row: Filter Trigger + Sort + Count */}
          <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-black/[0.06] flex-wrap">
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-black/[0.08] hover:bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F] transition-colors shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#1D1D1F] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Product Count & Sort */}
            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
              <span className="text-xs text-[#6E6E73] font-normal hidden sm:inline">
                Showing <strong className="text-[#1D1D1F] font-semibold">{filteredProducts.length}</strong> products
              </span>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-3 sm:pl-3.5 pr-7 sm:pr-8 py-1.5 sm:py-2 rounded-full bg-white border border-black/[0.08] text-xs font-semibold text-[#1D1D1F] focus:outline-none focus:border-[#1D1D1F] cursor-pointer shadow-xs"
                >
                  <option value="popular">Sort: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="discount">Highest Discount</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">New Arrivals</option>
                </select>
                <ChevronDown className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#86868B] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {(activeFilterCount > 0 || searchQuery) && (
            <div className="flex items-center gap-2 flex-wrap mb-6">
              <span className="text-xs text-[#86868B] font-semibold">Active:</span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white border border-black/[0.08] text-[#1D1D1F]">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-rose-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.category !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#F5F5F7] border border-black/[0.08] text-[#1D1D1F]">
                  {activeCategories.find(c => c.id === filters.category)?.name}
                  <button onClick={() => handleCategorySelect('all')} className="hover:text-rose-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-[#0071E3] hover:underline ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div id="catalog-grid" className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
              {filteredProducts.map((product) => {
                const currentCartItem = cartItems[product.id];
                const currentQty = currentCartItem?.quantity || 0;
                const currentSize = currentCartItem?.selectedSize || null;
                const isFav = !!wishlist[product.id];

                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={currentQty}
                    selectedSize={currentSize}
                    isFavorite={isFav}
                    onAddToCart={onAddToCart}
                    onUpdateQuantity={onUpdateQuantity}
                    onUpdateSize={onUpdateSize}
                    onToggleFavorite={onToggleFavorite}
                    onQuickView={onQuickView || setQuickViewProduct}
                    onWhatsAppInquiry={handleWhatsAppInquiry}
                    onNotify={onNotify}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 px-6 bg-white border border-black/[0.06] rounded-3xl max-w-md mx-auto shadow-sm">
              <div className="w-14 h-14 rounded-full bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1D1D1F] mb-1 font-sans">
                {products.length === 0 ? 'Loading Catalog' : "No products found"}
              </h3>
              <p className="text-xs text-[#6E6E73] max-w-xs mx-auto mb-6">
                Try adjusting your search query or reset category filters.
              </p>
              {products.length > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="btn-apple-primary px-6 py-2.5 text-xs"
                >
                  Browse All Products
                </button>
              )}
            </div>
          )}
        </div>

        {/* Filter Drawer */}
        <FilterDrawer
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          filters={filters}
          onUpdateFilters={handleUpdateFilters}
          onResetFilters={handleResetFilters}
          totalResultsCount={filteredProducts.length}
        />

        {/* Quick View Details Modal */}
        {quickViewProduct && (
          <QuickViewModal
            product={quickViewProduct}
            isOpen={!!quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            onAddToCart={onAddToCart}
            cartQuantity={cartItems[quickViewProduct.id]?.quantity || 0}
            onUpdateQuantity={onUpdateQuantity}
            isFavorite={!!wishlist[quickViewProduct.id]}
            onToggleFavorite={onToggleFavorite}
            onNotify={onNotify}
          />
        )}
      </section>
    </div>
  );
};

export default CatalogPage;
